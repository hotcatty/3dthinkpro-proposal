'use server';

import {
  addToCart,
  createDirectCheckout,
  getCart,
  removeCartLines,
  updateCartLine,
} from '@/lib/shopify/cart';
import type { ActionResult, Cart } from '@/lib/shopify/types';

function fail(error: unknown): ActionResult<never> {
  return { ok: false, error: error instanceof Error ? error.message : 'Unexpected error' };
}

export async function addToCartAction(
  merchandiseId: string,
  quantity = 1,
): Promise<ActionResult<Cart>> {
  try {
    const data = await addToCart(merchandiseId, quantity);
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number,
): Promise<ActionResult<Cart>> {
  try {
    const data = await updateCartLine(lineId, quantity);
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function removeCartLineAction(lineId: string): Promise<ActionResult<Cart>> {
  try {
    const data = await removeCartLines([lineId]);
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function getCartAction(): Promise<ActionResult<Cart | null>> {
  try {
    const data = await getCart();
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function buyNowAction(
  merchandiseId: string,
  quantity = 1,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  try {
    const checkoutUrl = await createDirectCheckout(merchandiseId, quantity);
    return { ok: true, data: { checkoutUrl } };
  } catch (error) {
    return fail(error);
  }
}
