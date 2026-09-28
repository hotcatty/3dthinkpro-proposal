# 3DThinkPro 前端部署指南

> 本文只覆盖环境变量、购买链路和上线步骤。页面结构、文案和视觉以 Figma 设计稿为准，不要拿这里的示意区块当终稿。
>
> 本文已按当前 Headless 方案重写。旧版写的 `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`、`SHOPIFY_ADMIN_ACCESS_TOKEN`、`/api/checkout`、Draft Order **全部作废，不要再用。**

---

## 架构（当前）

```
Next.js（Vercel）── Storefront API 2026-07 ── Shopify 后台
     │                      │
  首页 / 列表 / 详情          商品查询
  购物车                     Cart API
  点结算 ──────────────────► cart.checkoutUrl（Shopify 托管结账页）
```

本站只负责：展示商品、购物车、跳转结算。  
结算页由 Shopify 托管，**不还原设计稿**（除非 Shopify Plus 做有限定制）。Admin API token **不要**配进这个项目。

服务端用 public token 时，必须把买家 IP 转给 Shopify（`Shopify-Storefront-Buyer-IP`），否则上线后会按服务器一个 IP 限流。代码已从 `x-forwarded-for` 读取。

店铺实测（2026-09-13）：1 个测试商品、变体只有 Default Title、币种 JPY（`¥299`）。设计稿是 `$` 的话，要改后台币种，不要在前端写死美元。

所有路由目前是 dynamic，因为根布局 Header 要读购物车 cookie。这是有意的，不是漏了 SSG。

---

## 环境变量

复制 `.env.example` 为 `.env.local`：

```env
SHOPIFY_STORE_DOMAIN=hiqd7j-pw.myshopify.com
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=你的 Storefront 公开令牌
```

| 变量 | 说明 |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | 店铺域名，**不要**加 `https://`。`hiqd7j-pw.myshopify.com` 与 `aem02u-zy.myshopify.com` 指向同一店。 |
| `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | Storefront API 公开令牌，只能读已发布商品、操作购物车。 |

**不要配置：**

- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`（已废弃）
- `SHOPIFY_ADMIN_ACCESS_TOKEN`（高权限，不能出现在顾客侧链路）

### 如何拿 Storefront token

1. 打开 [Shopify 后台](https://admin.shopify.com/store/hiqd7j-pw)
2. **Settings → Apps and sales channels → Develop apps**
3. 创建或打开一个 app → **Configuration → Storefront API**
4. 勾选并安装：
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
5. **API credentials** 里复制 Storefront API access token

### 商品为什么查出来是空的

Storefront API **只返回发布到对应销售渠道的商品**。在后台把商品状态设为 Active，并勾选该 Headless / 自定义 app 的销售渠道。只 Active 但没发布到渠道，接口会返回空列表。

---

## 本地开发

独立站和运营后台是**同一个 Next 应用**（`/` 与 `/admin`），但本地拆成两套启动方式，端口和缓存目录分开，可以同时开、不会抢锁。`npm` scripts 已自带 `env -u NODE_OPTIONS`（本机若设了 `NODE_OPTIONS=--use-system-ca`，Next worker 会报 `ERR_WORKER_INVALID_EXEC_ARGV`）。**不要**再跑 `scripts/keep-dev.sh`，它不会启动服务。

```bash
cd /Users/hotcat/WorkBuddy/2026-09-03-16-05-46/3dthinkpro-proposal
npm install
cp .env.example .env.local   # 填入上面两个变量

# 独立站 — 固定 3100，缓存 .next-site
npm run dev
# → http://localhost:3100

# 运营后台 — 固定 3200，缓存 .next-admin（另开一个终端）
npm run admin
# → http://localhost:3200/admin/login
```

本地 `next build` / `next start` 若遇到同样的 worker 报错，命令前加 `env -u NODE_OPTIONS`。生产构建仍用默认 `.next`，不要把 `NEXT_DIST_DIR` 配到 Vercel。

### 没有 token 时用官方 mock

```bash
SHOPIFY_STORE_DOMAIN=mock.shop \
  SHOPIFY_STOREFRONT_PUBLIC_TOKEN=dummy \
  npm run dev
```

`mock.shop` 走真实 Storefront schema，可验证查询、购物车、`checkoutUrl`。币种是 CAD，变体是 Size/Color，和真实座垫店铺不同。

---

## 部署到 Vercel

1. 导入 GitHub 仓库 `hotcatty/3dthinkpro-proposal`，分支 `mvp`
2. 在 Vercel → Settings → Environment Variables 添加（Production / Preview 都加）：

```
SHOPIFY_STORE_DOMAIN=hiqd7j-pw.myshopify.com
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=（同上，Storefront 公开令牌）
```

3. Deploy。框架选 Next.js，构建命令 `npm run build`，输出 `.next`

CLI 部署：

```bash
cd /Users/hotcat/WorkBuddy/2026-09-03-16-05-46/3dthinkpro-proposal
env -u NODE_OPTIONS ~/.local/bin/vercel --prod
```

部署后务必在 Vercel 控制台检查这两个环境变量，不要把 Admin token 配上去。

---

## 自定义域名（www.3dthinkpro.com）

顺序必须是：**先部署到 Vercel，再指域名**。域名只是 DNS 指针，背后没有线上站点时指过去会打不开。

1. 先 `vercel --prod`（或 Git 推到 `mvp` 自动部署），确认 `*.vercel.app` 能打开独立站。
2. Vercel → Project → Settings → Domains 添加 `www.3dthinkpro.com`（以及需要的话 `3dthinkpro.com`）。
3. 域名已挂在项目 `3dthinkpro-proposal` 上。新网还指着旧主机（`ns11.xincache.com` / `3dthinkprocom.gotoip11.com`），需要改解析，不要改成 Vercel 的 nameserver 也行：

   | 主机记录 | 类型 | 记录值 |
   |---|---|---|
   | `@` | A | `216.198.79.1` |
   | `@` | A | `64.29.17.1` |
   | `www` | CNAME | `e116be360af5662b.vercel-dns-017.com` |

   改完后跑 `vercel domains verify 3dthinkpro.com`。等证书签发。
4. `www.3dthinkpro.com` 只绑 Vercel，**不要**设成 Shopify 在线商店的主域名，否则顾客会进 Dawn 主题店。
5. 结账继续走 Shopify 托管页（`*.myshopify.com/checkouts/...`）。以后要品牌化，再单独加 `checkout.3dthinkpro.com` 指到 Online Store。

当前生产地址：https://3dthinkpro-proposal.vercel.app （2026-09-23 已用本机独立站覆盖旧测试部署）

---

## 结账回跳独立站（现在就做）

结账成功页的 **Visit our store**、顾客账户的 **Buy again**、邮件里的店铺链接，都会指向 Shopify 在线商店，普通套餐改不了按钮本身。

做法：给在线商店发布官方跳转主题，人点到 `*.myshopify.com` 立刻弹到独立站。结账页不走主题，付款不受影响。

上传包已打好，主机名预填为当前生产站（**不要**加 `https://`，**现在不要**填 `www.3dthinkpro.com`，DNS 还没指向 Vercel）：

`/Users/hotcat/WorkBuddy/2026-09-03-16-05-46/3dthinkpro-proposal/shopify/hydrogen-redirect-theme.zip`

`storefront_hostname` = `3dthinkpro-proposal.vercel.app`

源码在 `shopify/hydrogen-redirect-theme/`，基于 [Shopify/hydrogen-redirect-theme](https://github.com/Shopify/hydrogen-redirect-theme)（Next 无头站也能用）。`www.3dthinkpro.com` 解析生效后再把 Hostname 改成它。

### 后台点法（中文后台）

1. 打开 [Shopify 后台](https://admin.shopify.com/store/hiqd7j-pw)。
2. 左侧 **销售渠道** → **在线商店** → **主题**。找不到「销售渠道」时，直接点左侧 **在线商店**，再点 **主题**。
3. **添加主题** → **上传 zip 文件**，选上面的 `hydrogen-redirect-theme.zip`。
4. 上传完成后，在主题库里找到 **Hydrogen Redirect Theme**，先点 **自定义**（不要急着发布）。
5. 左下角齿轮 / **Theme settings** → **Storefront**（这一栏官方主题是英文）。
6. 核对 **Hostname** 是 `3dthinkpro-proposal.vercel.app`（没有 `https://`，没有末尾 `/`，也不是 `www.3dthinkpro.com`）。不对就改完，点右上角 **保存**。
7. 退出编辑器，在 **Hydrogen Redirect Theme** 上点 **发布**，确认替换当前在线商店主题（Dawn 会被换掉，结账页不受影响）。
8. 测：打开 `https://hiqd7j-pw.myshopify.com`，应跳到 `https://3dthinkpro-proposal.vercel.app/`。再走一遍加购结算：结账仍是 Shopify（`/checkouts/...`），付款不受影响。结账成功页 Visit our store 同理。Buy again 若落到 `/products/handle` 能接住；若落到 Shopify 购物车，独立站购物车不会自动带货。
9. 路径对不上时，同一页 **Custom redirects**，一行一条：`Shopify路径 > 独立站路径`。
10. Shop 应用按钮（Download / Track with Shop）不要改。View your order 留在 Shopify 订单页。

`www.3dthinkpro.com` 解析生效后，回到主题设置把 Hostname 改成它即可，不用重传 zip。

### 想让我替你发布时（不要发密码）

任选一种，**不要**在对话里贴 Shopify 密码或 Admin token：

- 后台 **设置 → 用户和权限**，加我为员工 / 协作者（Collaborator），我登进后台上传发布。
- 或你在本机终端跑 `npx @shopify/cli auth login`，浏览器里点授权后告诉我，我再 `theme push`。

---

## 购买链路（已实现）

| 步骤 | 路由 | 数据 |
|---|---|---|
| 看货 | `/` 首页、`/shop` 列表 | `getProducts()` |
| 确认 | `/products/[handle]` | `getProduct(handle)` |
| 加购 | 详情页 Add to cart | `addToCartAction` → cookie `cartId`（10 天） |
| 立即购买 | 详情页 Buy it now | `buyNowAction` → 跳转 `checkoutUrl` |
| 购物车 | `/cart` | 改数量 / 删除 / Checkout |
| 结算 | Shopify 托管页 | `cart.checkoutUrl` |

`/api/checkout` 和 Draft Order `invoice_url` 已删除。草稿订单会让折扣码、弃单恢复、分析全部失效。

---

## 常见问题

**商品不显示**  
商品未发布到 Storefront 销售渠道，或 token scope 不全，或域名填错。

**结账报 This store isn't taking orders right now**  
免费试用店会锁结算。升级 Basic，或用 Shopify Partners 开发店。

**划线价出现 $0**  
无折扣时 `compareAtPriceRange` 可能返回 `0.0`。组件必须用 `hasDiscount()`，不要只判空。

**本地 build 失败 `ERR_WORKER_INVALID_EXEC_ARGV`**  
命令前加 `env -u NODE_OPTIONS`。

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | Next.js 16 · React 19 · TypeScript · Tailwind v4 |
| 电商 | Shopify Storefront API 2026-07 + Cart API |
| 部署 | Vercel |

---

## 联系

- B2C: sales@3dthinkpro.com
- B2B: business@3dthinkpro.com
