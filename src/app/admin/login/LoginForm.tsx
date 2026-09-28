'use client';

import { LockOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Input, Typography } from 'antd';

export default function LoginForm({
  error,
  next,
  action,
}: {
  error: boolean;
  next: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="admin-login-page">
      <Card style={{ width: 368 }}>
        <Flex vertical gap="middle">
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              3DThinkPro
            </Typography.Title>
            <Typography.Text type="secondary">运营后台</Typography.Text>
          </div>
          <form action={action}>
            <input type="hidden" name="next" value={next} />
            <Flex vertical gap="middle">
              <Input.Password name="password" size="large" placeholder="请输入密码" autoFocus prefix={<LockOutlined />} />
              <Button type="primary" htmlType="submit" size="large" block>
                登录
              </Button>
              {error ? <Alert type="error" message="密码不正确" showIcon /> : null}
            </Flex>
          </form>
        </Flex>
      </Card>
    </div>
  );
}
