export function looksLikeHtml(text: string): boolean {
  const trimmed = text.trim();
  return (
    /^<!DOCTYPE/i.test(trimmed) ||
    /^<html[\s>]/i.test(trimmed) ||
    /<\/?(html|head|body|title|meta|style)\b/i.test(trimmed)
  );
}

/** Map Shopify HTTP bodies (often HTML) to one-line Chinese. Never return markup. */
export function humanizeAdminHttpError(status: number, body: string): string {
  const text = (body || '').slice(0, 4000);
  const lower = text.toLowerCase();

  if (lower.includes('app_not_installed')) {
    return '应用还没装到这家店，请到 Dev Dashboard 点 Install';
  }
  if (status === 401) {
    return '凭据无效或已过期，请核对 Client ID / Secret 和店铺域名';
  }
  if (status === 403) {
    return '没有权限访问这家店，请确认应用已安装且勾选了商品和文件权限';
  }
  if (looksLikeHtml(text)) {
    return `Shopify 返回了错误页（HTTP ${status}），请确认应用已安装、域名正确`;
  }

  try {
    const json = JSON.parse(text) as {
      error?: unknown;
      error_description?: unknown;
    };
    if (typeof json.error_description === 'string' && json.error_description.trim()) {
      return json.error_description.trim();
    }
    if (typeof json.error === 'string' && json.error.trim()) {
      return json.error.trim();
    }
  } catch {
    // not JSON
  }

  const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 160);
  return snippet
    ? `Shopify 请求失败（HTTP ${status}）：${snippet}`
    : `Shopify 请求失败（HTTP ${status}）`;
}

/** Frontend safety net: strip leftover HTML from API error strings. */
export function humanizeAdminErrorMessage(raw: string): string {
  const text = raw.trim();
  if (!text) return '连接失败';
  if (/app_not_installed/i.test(text)) {
    return '应用还没装到这家店，请到 Dev Dashboard 点 Install';
  }
  if (looksLikeHtml(text) || /<!DOCTYPE|<html|<head|<title>/i.test(text)) {
    const status = text.match(/\b([45]\d{2})\b/)?.[1];
    return status
      ? `Shopify 返回了错误页（HTTP ${status}），请确认应用已安装、域名正确`
      : 'Shopify 返回了错误页，请确认应用已安装、域名正确';
  }
  return text;
}
