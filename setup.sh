#!/bin/bash

# 3DThinkPro MVP 快速启动脚本

echo "================================"
echo "3DThinkPro MVP 启动脚本"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo "请从 https://nodejs.org 安装 Node.js 22 或更高版本"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo "✅ 依赖安装完成"
    echo ""
fi

# 检查环境变量
if [ ! -f ".env.local" ]; then
    echo "⚠️  需要配置 Shopify 环境变量"
    echo ""
    echo "创建 .env.local 文件，并填入以下内容："
    echo ""
    echo "  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=aem02u-zy.myshopify.com"
    echo "  SHOPIFY_ADMIN_ACCESS_TOKEN=<你的 Admin Access Token>"
    echo ""
    echo "按 Enter 继续..."
    read
else
    echo "✅ .env.local 已配置"
    echo ""
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo "访问 http://localhost:3000"
echo ""
npm run dev
