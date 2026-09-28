'use client';

import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

/**
 * Ant Design 5 只包运营后台。默认 Design Token（拂晓蓝），不另造品牌色。
 * 规范：https://ant.design/docs/spec/introduce-cn
 * Next App Router：https://ant.design/docs/react/use-with-next-cn
 */
function AdminTokenScope({ children }: { children: React.ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div
      className="admin-root"
      style={
        {
          '--admin-bg-layout': token.colorBgLayout,
          '--admin-bg-container': token.colorBgContainer,
          '--admin-border': token.colorBorderSecondary,
          '--admin-text': token.colorText,
          '--admin-text-light': token.colorTextLightSolid,
          '--admin-text-quaternary': token.colorTextQuaternary,
          '--admin-fill': token.colorFillTertiary,
          '--admin-radius': `${token.borderRadius}px`,
          '--admin-radius-sm': `${token.borderRadiusSM}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={zhCN}
        theme={{ algorithm: theme.defaultAlgorithm }}
        button={{ autoInsertSpace: false }}
      >
        <App>
          <AdminTokenScope>{children}</AdminTokenScope>
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
