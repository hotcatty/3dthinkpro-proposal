import { cookies } from 'next/headers';
import { storefrontFetch } from './client';
import {
  CART_CREATE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
  CART_QUERY,
} from './queries';
import type { Cart, CartLine } from './types';

const CART_COOKIE = 'cartId';
const CART_MAX_AGE = 60 * 60 * 24 * 10;

type UserError = { field?: string[] | null; message: string };

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: Cart['cost'];
  lines: { nodes: CartLine[] };
};

function flattenCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: raw.lines.nodes,
  };
}

function assertNoUserErrors(errors: UserError[] | undefined) {
  if (errors?.length) {
    throw new Error(errors.map((e) => e.message).join('; '));
  }
}

async function readCartId() {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function writeCartId(id: string) {
  const store = await cookies();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: CART_MAX_AGE,
  });
}

export async function getCart(): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  const data = await storefrontFetch<{ cart: RawCart | null }>(
    CART_QUERY,
    { id },
    { revalidate: false },
  );
  return data.cart ? flattenCart(data.cart) : null;
}

async function createCart(merchandiseId: string, quantity: number): Promise<Cart> {
  const data = await storefrontFetch<{
    cartCreate: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    CART_CREATE,
    { lines: [{ merchandiseId, quantity }] },
    { revalidate: false },
  );
  assertNoUserErrors(data.cartCreate.userErrors);
  if (!data.cartCreate.cart) throw new Error('Could not create cart');
  const cart = flattenCart(data.cartCreate.cart);
  await writeCartId(cart.id);
  return cart;
}

export async function addToCart(merchandiseId: string, quantity = 1): Promise<Cart> {
  const existing = await getCart();
  if (!existing) {
    return createCart(merchandiseId, quantity);
  }
  const data = await storefrontFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    CART_LINES_ADD,
    { cartId: existing.id, lines: [{ merchandiseId, quantity }] },
    { revalidate: false },
  );
  assertNoUserErrors(data.cartLinesAdd.userErrors);
  if (!data.cartLinesAdd.cart) throw new Error('Could not add to cart');
  return flattenCart(data.cartLinesAdd.cart);
}

export async function updateCartLine(lineId: string, quantity: number): Promise<Cart> {
  const existing = await getCart();
  if (!existing) throw new Error('Cart not found');
  if (quantity <= 0) {
    return removeCartLines([lineId]);
  }
  const data = await storefrontFetch<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    CART_LINES_UPDATE,
    { cartId: existing.id, lines: [{ id: lineId, quantity }] },
    { revalidate: false },
  );
  assertNoUserErrors(data.cartLinesUpdate.userErrors);
  if (!data.cartLinesUpdate.cart) throw new Error('Could not update cart');
  return flattenCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(lineIds: string[]): Promise<Cart> {
  const existing = await getCart();
  if (!existing) throw new Error('Cart not found');
  const data = await storefrontFetch<{
    cartLinesRemove: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    CART_LINES_REMOVE,
    { cartId: existing.id, lineIds },
    { revalidate: false },
  );
  assertNoUserErrors(data.cartLinesRemove.userErrors);
  if (!data.cartLinesRemove.cart) throw new Error('Could not update cart');
  return flattenCart(data.cartLinesRemove.cart);
}

export async function createDirectCheckout(
  merchandiseId: string,
  quantity = 1,
): Promise<string> {
  const data = await storefrontFetch<{
    cartCreate: { cart: RawCart | null; userErrors: UserError[] };
  }>(
    CART_CREATE,
    { lines: [{ merchandiseId, quantity }] },
    { revalidate: false },
  );
  assertNoUserErrors(data.cartCreate.userErrors);
  if (!data.cartCreate.cart?.checkoutUrl) {
    throw new Error('Could not start checkout');
  }
  return data.cartCreate.cart.checkoutUrl;
}
