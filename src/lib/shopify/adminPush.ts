import { readFile } from 'fs/promises';
import path from 'path';
import { isPublicHttpUrl, localCmsFilename } from '@/lib/cms/imageUrls';
import type { ProductRow } from '@/lib/cms/types';
import { adminGraphql } from './admin';
import { buildProductSetInput, type ProductSetFile } from './productSetInput';

const PRODUCT_BY_HANDLE = `
  query ProductByHandle($identifier: ProductIdentifierInput!) {
    product: productByIdentifier(identifier: $identifier) {
      id
      handle
      status
    }
  }
`;

const STAGED_UPLOADS = `
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters { name value }
      }
      userErrors { field message }
    }
  }
`;

const PRODUCT_SET = `
  mutation ProductSet($input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(input: $input, synchronous: $synchronous) {
      product { id handle status }
      userErrors { field message }
    }
  }
`;

const LOCATIONS = `
  query Locations {
    locations(first: 1) { nodes { id } }
  }
`;

const PUBLICATIONS = `
  query Publications {
    publications(first: 25) {
      nodes { id }
    }
  }
`;

const PUBLISH = `
  mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

export type PushRowResult = {
  id: string;
  handle: string;
  sku: string;
  action: 'created' | 'updated';
  productId: string;
  imageCount: number;
  warning?: string;
};

export type PushFailure = {
  id: string;
  handle: string;
  sku: string;
  message: string;
};

type UserError = { field?: string[] | null; message: string };

function joinErrors(errors?: { message: string }[], userErrors?: UserError[]): string {
  return [...(errors ?? []), ...(userErrors ?? [])]
    .map((item) => item.message)
    .filter(Boolean)
    .join('；');
}

function mimeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
}

async function findProductId(handle: string): Promise<string | undefined> {
  const json = await adminGraphql<{ product: { id: string } | null }>(PRODUCT_BY_HANDLE, {
    identifier: { handle },
  });
  const error = joinErrors(json.errors);
  if (error && !/no product|not found|couldn't find|could not find/i.test(error)) {
    throw new Error(error);
  }
  return json.data?.product?.id;
}

async function stagedUpload(filename: string, bytes: Buffer, mimeType: string): Promise<string> {
  const json = await adminGraphql<{
    stagedUploadsCreate: {
      stagedTargets: Array<{
        url: string;
        resourceUrl: string;
        parameters: Array<{ name: string; value: string }>;
      }> | null;
      userErrors: UserError[];
    };
  }>(STAGED_UPLOADS, {
    input: [
      {
        filename,
        mimeType,
        httpMethod: 'POST',
        resource: 'PRODUCT_IMAGE',
        fileSize: String(bytes.byteLength),
      },
    ],
  });
  const error = joinErrors(json.errors, json.data?.stagedUploadsCreate.userErrors);
  if (error) throw new Error(error);
  const target = json.data?.stagedUploadsCreate.stagedTargets?.[0];
  if (!target?.url || !target.resourceUrl) {
    throw new Error('staged upload 没有返回上传地址');
  }

  const body = new FormData();
  for (const param of target.parameters) body.append(param.name, param.value);
  body.append('file', new Blob([new Uint8Array(bytes)], { type: mimeType }), filename);
  const uploaded = await fetch(target.url, { method: 'POST', body });
  if (!uploaded.ok) {
    const detail = await uploaded.text();
    throw new Error(`上传图片到 Shopify 暂存失败 ${uploaded.status}：${detail.slice(0, 200)}`);
  }
  return target.resourceUrl;
}

async function resolveFiles(row: ProductRow): Promise<ProductSetFile[]> {
  const files: ProductSetFile[] = [];
  for (const src of row.images.filter(Boolean)) {
    const alt = row.imageAlt.trim() || row.title.trim();
    if (isPublicHttpUrl(src)) {
      files.push({
        originalSource: src,
        alt,
        filename: path.basename(new URL(src).pathname) || 'image.jpg',
      });
      continue;
    }
    const name = localCmsFilename(src);
    if (!name) {
      throw new Error(
        `图片「${src}」既不是公网 URL，也不是本地 /cms/ 文件。请重新上传，或换成 Shopify 能访问的 HTTPS 地址。`,
      );
    }
    const abs = path.join(process.cwd(), 'public/cms', name);
    let bytes: Buffer;
    try {
      bytes = await readFile(abs);
    } catch {
      throw new Error(`本地找不到 ${src}，请重新上传这张图。`);
    }
    const resourceUrl = await stagedUpload(name, bytes, mimeFor(name));
    files.push({ originalSource: resourceUrl, alt, filename: name });
  }
  return files;
}

async function publishIfNeeded(productId: string, status: string): Promise<string | undefined> {
  if (status !== 'active') return undefined;
  const pubs = await adminGraphql<{ publications: { nodes: Array<{ id: string }> } }>(PUBLICATIONS);
  const pubError = joinErrors(pubs.errors);
  if (pubError) return `商品已写入，但读销售渠道失败：${pubError}`;
  const ids = pubs.data?.publications.nodes.map((node) => node.id) ?? [];
  if (ids.length === 0) {
    return '商品已写入，但店铺没有销售渠道。请在 Shopify 后台把商品发布到 Headless / 自定义 app。';
  }
  const published = await adminGraphql<{
    publishablePublish: { userErrors: UserError[] };
  }>(PUBLISH, {
    id: productId,
    input: ids.map((publicationId) => ({ publicationId })),
  });
  const error = joinErrors(published.errors, published.data?.publishablePublish.userErrors);
  if (error) return `商品已写入，发布到销售渠道失败：${error}`;
  return undefined;
}

async function firstLocationId(): Promise<string | undefined> {
  const location = await adminGraphql<{ locations: { nodes: Array<{ id: string }> } }>(LOCATIONS);
  return location.data?.locations.nodes[0]?.id;
}

export async function pushProductRow(row: ProductRow, locationId?: string): Promise<PushRowResult> {
  const handle = row.handle.trim();
  if (!handle) throw new Error('先填 Handle');
  if (!row.title.trim()) throw new Error('先填 Title');

  const existingId = await findProductId(handle);
  const files = await resolveFiles(row);
  const input = buildProductSetInput(row, existingId, files, locationId);
  const json = await adminGraphql<{
    productSet: {
      product: { id: string; handle: string; status: string } | null;
      userErrors: UserError[];
    };
  }>(PRODUCT_SET, { input, synchronous: true });
  const error = joinErrors(json.errors, json.data?.productSet.userErrors);
  if (error) throw new Error(error);
  const product = json.data?.productSet.product;
  if (!product?.id) throw new Error('Shopify 没有返回商品 ID');

  let warning: string | undefined;
  if (!existingId) {
    warning = await publishIfNeeded(product.id, row.status);
  } else if (files.length === 0) {
    warning = '本地没有图，未改店铺已有图片。';
  }

  return {
    id: row.id,
    handle: product.handle || handle,
    sku: row.sku,
    action: existingId ? 'updated' : 'created',
    productId: product.id,
    imageCount: files.length,
    warning,
  };
}

export async function pushProductRows(rows: ProductRow[]): Promise<{
  results: PushRowResult[];
  errors: PushFailure[];
}> {
  const results: PushRowResult[] = [];
  const errors: PushFailure[] = [];
  const locationId = await firstLocationId();
  for (const row of rows) {
    try {
      results.push(await pushProductRow(row, locationId));
    } catch (error) {
      errors.push({
        id: row.id,
        handle: row.handle,
        sku: row.sku,
        message: error instanceof Error ? error.message : '推送失败',
      });
    }
  }
  return { results, errors };
}
