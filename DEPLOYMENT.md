# 3DThinkPro MVP 部署指南

## 快速启动（本地开发）

### 环境要求
- Node.js 22.x 或更高
- npm 或 yarn

### 步骤 1：安装依赖
```bash
npm install
```

### 步骤 2：配置环境变量
创建 `.env.local` 文件，填入以下信息：

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token_here
```

### 步骤 3：启动开发服务器
```bash
npm run dev
```

打开 http://localhost:3000 查看。

---

## 部署到 Vercel（推荐）

### 前提条件
- GitHub 账号（已连接此仓库）
- Vercel 账号（免费）

### 部署步骤

1. **连接 GitHub 仓库**
   - 访问 https://vercel.com/import
   - 选择 `3dthinkpro-proposal` 仓库
   - 选择分支 `mvp`

2. **配置环境变量**
   在 Vercel 项目设置中添加：
   ```
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN = your-store.myshopify.com
   SHOPIFY_ADMIN_ACCESS_TOKEN = your_admin_token_here
   ```

3. **部署**
   - Vercel 会自动检测 Next.js 项目
   - 点击 "Deploy"
   - 等待构建完成（约 2-3 分钟）

4. **获取公网 URL**
   部署完成后，Vercel 会分配一个 URL，例如：
   ```
   https://3dthinkpro-proposal-mvp.vercel.app
   ```

---

## 核心功能

### 页面结构
- **首页** (`/`) — Hero + 产品系列 + 品牌优势
- **商品页** (`/shop`) — 实时产品列表（来自 Shopify）+ 颜色选择 + 结账
- **品牌故事** (`/brand`) — 发展历程 + 工艺流程
- **技术展示** (`/technology`) — TPU 晶格结构 + 工艺对比
- **联系页** (`/contact`) — B2C/B2B 邮箱分离

### Shopify 集成
- 通过 Admin REST API 实时获取产品数据
- 支持颜色变体选择
- Draft Orders API 生成结账链接
- 完整购买流程验证

---

## 架构说明

### 前端（Next.js 14）
- App Router 架构
- Server Components + Client Components 混合
- Tailwind CSS 样式系统
- 工业极简黑白红配色

### 后端（Next.js API Routes）
- `/api/checkout` — Draft Order 创建端点
- Shopify Admin API 认证
- 服务端密钥保护（`SHOPIFY_ADMIN_ACCESS_TOKEN`）

### 设计参考
- **Motographe** — 工业美学、全大写排版
- **Tesla** — 场景化展示、极简布局
- **Dyson** — 产品驱动、详细技术说明

---

## 常见问题

### Q: 本地运行时显示 "API Error"
**A:** 检查 `.env.local` 中的 token 是否正确，确保环境变量已重载。

### Q: 结账页面显示 "This store isn't taking orders right now"
**A:** Shopify 免费试用期不支持对外结账。需要升级到 Basic 计划（¥150/月 前 3 个月）。

### Q: 产品没有显示
**A:** 确认 Shopify 后台有活跃产品，且状态为 "Active"。

---

## 项目状态

✅ **MVP 验证完成**
- 前端框架完整
- Shopify 集成就绪
- 5 个页面全部可用
- 工业极简风格定稿

⏳ **后续计划**
- 物流配置测试
- 支付流程完整验证
- 客户版调研报告
- 7 月设计优化迭代

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 |
| 样式 | Tailwind CSS |
| 语言 | TypeScript |
| 后端 | Next.js API Routes |
| 电商后端 | Shopify Admin API |
| 部署 | Vercel（推荐）/ Node.js 服务器 |

---

## 联系方式

问题或建议？联系项目团队：
- B2C: sales@3dthinkpro.com
- B2B: business@3dthinkpro.com
