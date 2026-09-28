'use client';

import { AppstoreOutlined, CommentOutlined, ExportOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Flex, Layout, Menu, theme, Typography } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const { Header, Sider, Content } = Layout;

const NAV = [
  { key: '/admin/products', label: '商品', icon: <AppstoreOutlined />, match: (path: string) => path.startsWith('/admin/products') },
  { key: '/admin/reviews', label: '评论', icon: <CommentOutlined />, match: (path: string) => path.startsWith('/admin/reviews') },
  { key: '/admin', label: '首页内容', icon: <HomeOutlined />, match: (path: string) => path === '/admin' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);

  const current = useMemo(() => NAV.find((item) => item.match(pathname)), [pathname]);

  if (pathname.startsWith('/admin/login')) {
    return children;
  }

  async function logout() {
    await fetch('/api/cms/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        width={220}
        breakpoint="lg"
        collapsedWidth={0}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="admin-sider-brand">3DThinkPro</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[current?.key ?? '/admin']}
          items={NAV.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            height: 56,
            lineHeight: '56px',
            paddingInline: token.paddingLG,
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Flex align="center" justify="space-between">
            <Typography.Text strong>{current?.label ?? '后台'}</Typography.Text>
            <Flex gap={token.marginSM}>
              <Button href="/" target="_blank" rel="noreferrer" icon={<ExportOutlined />}>
                查看前台
              </Button>
              <Button icon={<LogoutOutlined />} onClick={() => void logout()}>
                退出
              </Button>
            </Flex>
          </Flex>
        </Header>
        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
