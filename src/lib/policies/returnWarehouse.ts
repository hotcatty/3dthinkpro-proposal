const RETURN_WAREHOUSE_HTML = `
<h2>Return Warehouse</h2>
<p>Send approved returns to this warehouse:</p>
<p>41 Kazbek Str., Entrance A<br>Manastirski Livadi, Triaditsa District<br>1618 Sofia<br>Bulgaria</p>
<p>Email support@3dthinkpro.com before you ship a return. Do not send returns to the registered office in Hong Kong.</p>
`.trim();

function plainText(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function isRefundPolicy(handle: string, title: string) {
  return /refund|return|退款|退货|退貨/.test(`${handle} ${title}`.toLowerCase());
}

/** Shipping only when the live body already separates a ship-from place from a return-to place. */
function shippingNamesBothEnds(handle: string, title: string, body: string) {
  if (!/shipping|发货|發貨/.test(`${handle} ${title}`.toLowerCase())) return false;
  const text = plainText(body);
  const shipFrom = /ship(?:ped|ping)? from|ships from|fulfilled from|dispatch(?:ed)? from/.test(text);
  const returnTo = /return (?:to|address|warehouse)|send (?:approved )?returns? to/.test(text);
  return shipFrom && returnTo;
}

export function withReturnWarehouse(handle: string, title: string, body: string) {
  if (/kazbek/i.test(body)) return body;
  if (!isRefundPolicy(handle, title) && !shippingNamesBothEnds(handle, title, body)) return body;
  return `${body}\n${RETURN_WAREHOUSE_HTML}`;
}
