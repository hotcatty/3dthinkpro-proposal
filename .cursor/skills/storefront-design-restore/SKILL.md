---
name: storefront-design-restore
description: >-
  Restores 3DThinkPro customer storefront UI from Figma Auto Layout as the
  layout contract (file y9ipvLiu6Ve7HkExTae0Ay). Use when implementing, fixing,
  or adapting pages in src/app/(site), src/components, or src/sections; when the
  user mentions Figma, Auto Layout, 独立站, 设计稿, 还原, 自适应, Product Description,
  Quantity, or design-to-code.
---

# Storefront Design Restore

独立站顾客 UI 按 Figma Auto Layout 还原。硬约束见 `.cursor/rules/design-system.mdc`。

既然做成 Auto Layout，一定考虑到了前端代码逻辑，必须按她的走。
这不是视觉稿，是很规范的 UI 设计稿。
自适应：首先做好**当前这个设计版本**，再在这个版本的基础上做自适应。不要先自成一套流式/响应式再「参考」稿。
视觉唯一来源仍是 Figma `y9ipvLiu6Ve7HkExTae0Ay`。颜色/圆角/字号只用 `src/styles/tokens.css` 与 typography class。

## Scope

- **Do**: `src/app/(site)`、`src/components`、`src/sections`
- **Don't**: `src/app/admin/` — 运营后台走 Ant Design，不要用这套 Figma 去画 B 端
- Don't change `src/lib/shopify/` to fit UI

## Workflow

Copy and track:

```
Task Progress:
- [ ] 1. Load Figma skills and pull Auto Layout + variants
- [ ] 2. Treat FILL / fixed height / sibling Y as layout contract
- [ ] 3. 1:1 restore current desktop design version
- [ ] 4. Verify expand/collapse does not move fixed slots
- [ ] 5. Add adaptive only on top of that version
- [ ] 6. On conflict, change code to match the design
```

### 1. Before implementation

Load `figma-use` and `figma-design-to-code`. For the node the user gave, pull Auto Layout and variants:

- direction
- gap
- padding
- FILL / HUG / 固定高
- layoutGrow
- constraints
- variants (open/closed, selected, etc.)

Do not start CSS/JSX from an existing page flow and then "reference" the frame.

### 2. Layout contract

FILL / 固定高 / 兄弟节点 Y 是布局合同，不是装饰。

Example: 商品页 Product Description 是固定槽，Quantity 不随手风琴移动。Accordion expand/collapse must not change the Y of siblings below a fixed slot.

### 3. Desktop 1:1 first

先按桌面设计版本 1:1 还原（量高度、Y、间距）。Verify 展开/收起后固定槽位不变.

### 4. Adaptive second

再加自适应。自适应不得破坏 Auto Layout 槽位。Don't invent a fluid/responsive layout first.

### 5. Conflict

和稿冲突时改代码迁就稿，不改她的前端逻辑迁就旧实现。

## Tokens

No new hex / radius / type scale. Use `src/styles/tokens.css` and existing typography classes only.

## English casing

顾客站英文大小写写死在 `.cursor/rules/design-system.mdc`「英文大小写」。拉 Figma 文案时对照该表，不要另起一套，也不要趁还原改遍旧文案。SKU 展示可以 uppercase；Shopify / 运营商品名不要用 CSS 硬转。

## Done check

- Measured heights, Y, and gaps match the current desktop frame
- Fixed slots stay put after expand/collapse
- Adaptive breakpoints do not collapse FILL / 固定高 / sibling Y
- Admin / Ant Design screens were not restyled from this Figma
