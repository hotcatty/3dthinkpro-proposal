'use client';

import { PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductRow, ProductsContent } from '@/lib/cms/types';
import { emptyRow, makeId } from '@/lib/cms/productRow';
import { downloadJson } from '@/lib/cms/productCsv';
import { humanizeAdminErrorMessage } from '@/lib/shopify/adminErrors';
import PdpCopyEditor from './PdpCopyEditor';
import {
  YEAR_ALL,
  YEAR_PRESENT,
  expandYearRange,
  formatYearRange,
  parseYearRange,
  yearSelectOptions,
} from '@/lib/cms/yearRange';

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Form.Item label={label} extra={hint} style={{ marginBottom: 0 }}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </Form.Item>
  );
}

/** Compact range editor → stores "2024-present"; push expands to discrete years. */
function YearRangeCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const years = useMemo(() => yearSelectOptions(30), []);
  const parts = parseYearRange(value);
  const expanded = expandYearRange(value);
  const preview =
    parts.to === YEAR_ALL
      ? '不限年份'
      : expanded.length
        ? `将推送 ${expanded.length} 个年份：${expanded.join(', ')}`
        : '';

  function commit(from: string, to: string) {
    onChange(formatYearRange(from, to));
  }

  return (
    <Flex vertical gap={4}>
      <Flex gap={4} align="center">
        <Select
          aria-label="起始年份"
          size="small"
          style={{ flex: 1, minWidth: 72 }}
          value={parts.to === YEAR_ALL ? undefined : parts.from || undefined}
          disabled={parts.to === YEAR_ALL}
          placeholder="起"
          allowClear
          options={years.map((y) => ({ value: y, label: y }))}
          onChange={(from) => {
            const nextFrom = from ?? '';
            const to = parts.to === YEAR_ALL ? YEAR_PRESENT : parts.to || YEAR_PRESENT;
            commit(nextFrom, nextFrom && !parts.to ? YEAR_PRESENT : to);
          }}
        />
        <Typography.Text type="secondary">→</Typography.Text>
        <Select
          aria-label="结束年份"
          size="small"
          style={{ flex: 1, minWidth: 88 }}
          value={parts.to || undefined}
          placeholder="止"
          options={[
            { value: YEAR_PRESENT, label: '今年 (present)' },
            ...years.map((y) => ({ value: y, label: y })),
            { value: YEAR_ALL, label: '不限 (All years)' },
          ]}
          onChange={(to) => {
            if (!to) return;
            if (to === YEAR_ALL) {
              commit('', YEAR_ALL);
              return;
            }
            commit(parts.from || to, to);
          }}
        />
      </Flex>
      {preview ? <Typography.Text type="secondary" style={{ fontSize: 11 }}>{preview}</Typography.Text> : null}
    </Flex>
  );
}

function ImagesEditor({ row, onChange }: { row: ProductRow; onChange: (next: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onFiles(files: File[]) {
    if (files.length === 0) return;
    setBusy(true);
    setError('');
    const next = [...row.images];
    try {
      for (const file of files) {
        const body = new FormData();
        body.set('file', file);
        const res = await fetch('/api/cms/upload', { method: 'POST', body });
        const json = (await res.json()) as { ok: boolean; data?: { src?: string }; error?: string };
        if (!json.ok || !json.data?.src) throw new Error(json.error || '上传失败');
        next.push(json.data.src);
      }
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= row.images.length) return;
    const next = [...row.images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <Flex vertical gap="small">
      <div className="admin-thumbs">
        {row.images.map((src, index) => (
          <div key={`${src}-${index}`} className="admin-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
            <Tag className="admin-thumb-pos">{index + 1}</Tag>
            <Flex gap={4} style={{ marginTop: 4 }}>
              <Button size="small" onClick={() => move(index, -1)} disabled={index === 0} aria-label="前移">
                ↑
              </Button>
              <Button
                size="small"
                onClick={() => move(index, 1)}
                disabled={index === row.images.length - 1}
                aria-label="后移"
              >
                ↓
              </Button>
              <Button
                size="small"
                danger
                onClick={() => onChange(row.images.filter((_, i) => i !== index))}
                aria-label="删除"
              >
                ×
              </Button>
            </Flex>
          </div>
        ))}
        {row.images.length === 0 ? <Typography.Text type="secondary">还没有图片</Typography.Text> : null}
      </div>
      <Upload
        accept="image/*"
        multiple
        showUploadList={false}
        disabled={busy}
        beforeUpload={(file, fileList) => {
          if (file === fileList[fileList.length - 1]) {
            void onFiles(fileList);
          }
          return false;
        }}
      >
        <Button icon={<PlusOutlined />} loading={busy}>
          {busy ? '上传中…' : '选择图片（可多选）'}
        </Button>
      </Upload>
      {error ? <Typography.Text type="danger">{error}</Typography.Text> : null}
    </Flex>
  );
}

type EnvInfo = {
  mode: 'client_credentials' | 'explicit';
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasLegacyToken: boolean;
  maskedClientId: string;
  maskedClientSecret: string;
  maskedLegacyToken: string;
  domain: string;
};

function TokenPanel({ onReady }: { onReady?: (ready: boolean) => void }) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<{
    state: 'idle' | 'loading' | 'saved' | 'fail';
    text: string;
  }>({ state: 'idle', text: '读取中…' });
  const [info, setInfo] = useState<EnvInfo | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  function markReady(next: EnvInfo | null) {
    onReady?.(Boolean(next?.domain && (next.hasLegacyToken || (next.hasClientId && next.hasClientSecret))));
  }

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/cms/settings/env');
        const json = (await res.json()) as { ok: boolean; data?: EnvInfo; error?: string };
        if (json.ok && json.data) {
          const d = json.data;
          setInfo(d);
          setDomain(d.domain);
          markReady(d);
          setStatus({
            state: 'idle',
            text: describeEnv(d),
          });
        } else {
          setStatus({ state: 'idle', text: json.error || '读取失败' });
        }
      } catch (err) {
        setStatus({ state: 'idle', text: err instanceof Error ? err.message : '读取失败' });
      }
    })();
  }, []);

  async function save() {
    setStatus((prev) => ({ state: 'loading', text: '保存中…' }));
    try {
      const res = await fetch('/api/cms/settings/env', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret, domain }),
      });
      const json = (await res.json()) as { ok: boolean; data?: { note: string }; error?: string };
      if (json.ok) {
        const refetch = await fetch('/api/cms/settings/env');
        const refetchJson = (await refetch.json()) as { ok: boolean; data?: EnvInfo };
        if (refetchJson.ok && refetchJson.data) {
          setInfo(refetchJson.data);
          markReady(refetchJson.data);
          setStatus({ state: 'saved', text: describeEnv(refetchJson.data) });
        } else {
          setStatus({ state: 'saved', text: json.data?.note || '已保存' });
        }
        setClientId('');
        setClientSecret('');
      } else {
        setStatus({ state: 'fail', text: json.error || '保存失败' });
      }
    } catch (err) {
      setStatus({ state: 'fail', text: err instanceof Error ? err.message : '保存失败' });
    }
  }

  async function clearAll() {
    if (!confirm('确认清空 Client ID / Client Secret 吗？保存后下次启动 dev server 就拿不到 token 了。')) return;
    setStatus((prev) => ({ state: 'loading', text: '清空中…' }));
    try {
      const res = await fetch('/api/cms/settings/env', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear: true }),
      });
      const json = (await res.json()) as { ok: boolean; data?: { note: string }; error?: string };
      if (json.ok) {
        const refetch = await fetch('/api/cms/settings/env');
        const refetchJson = (await refetch.json()) as { ok: boolean; data?: EnvInfo };
        if (refetchJson.ok && refetchJson.data) {
          setInfo(refetchJson.data);
          markReady(refetchJson.data);
          setStatus({ state: 'saved', text: describeEnv(refetchJson.data) });
        } else {
          setStatus({ state: 'saved', text: '已清空' });
        }
      } else {
        setStatus({ state: 'fail', text: json.error || '清空失败' });
      }
    } catch (err) {
      setStatus({ state: 'fail', text: err instanceof Error ? err.message : '清空失败' });
    }
  }

  async function test() {
    setTesting(true);
    setTestResult('连接中…');
    try {
      const res = await fetch('/api/cms/shopify/test');
      const json = (await res.json()) as {
        ok: boolean;
        data?: {
          name: string;
          myshopifyDomain: string;
          scopes?: string[];
          missingScopes?: string[];
        };
        error?: string;
      };
      if (json.ok && json.data) {
        const scopes = json.data.scopes?.length ? `权限 ${json.data.scopes.join(', ')}` : '已连上';
        const missing = json.data.missingScopes?.length
          ? `；缺 ${json.data.missingScopes.join(', ')}，推送会失败`
          : '';
        setTestResult(`已连接 · ${json.data.name} · ${json.data.myshopifyDomain} · ${scopes}${missing}`);
      } else {
        setTestResult(humanizeAdminErrorMessage(json.error || '连接失败'));
      }
    } catch (err) {
      setTestResult(humanizeAdminErrorMessage(err instanceof Error ? err.message : '连接失败'));
    } finally {
      setTesting(false);
    }
  }

  const canSave = Boolean(clientId.trim()) || Boolean(clientSecret.trim()) || Boolean(domain.trim());
  const alertType =
    status.state === 'saved' || testResult.startsWith('已连接')
      ? 'success'
      : status.state === 'fail' || (testResult && !testResult.startsWith('已连接') && testResult !== '连接中…')
        ? 'error'
        : 'info';

  return (
    <Flex vertical gap="small">
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <Input
            autoComplete="off"
            spellCheck={false}
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            placeholder="Client ID（Dev Dashboard 凭据页 · 32 位 hex）"
          />
        </Col>
        <Col xs={24} lg={12}>
          <Input.Password
            autoComplete="off"
            spellCheck={false}
            value={clientSecret}
            onChange={(event) => setClientSecret(event.target.value)}
            placeholder="Client Secret（以 shpss_ 开头）"
          />
        </Col>
        <Col xs={24} lg={12}>
          <Input
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="店铺域名（如 hiqd7j-pw.myshopify.com，不含 https://）"
          />
        </Col>
        <Col xs={24} lg={12}>
          <Space wrap>
            <Button type="primary" disabled={status.state === 'loading' || !canSave} loading={status.state === 'loading'} onClick={save}>
              保存到 .env.local
            </Button>
            <Button disabled={testing} loading={testing} onClick={test}>
              测试 Shopify 连接
            </Button>
            {info && (info.hasClientId || info.hasClientSecret) ? (
              <Button onClick={clearAll} disabled={status.state === 'loading'}>
                清空凭据
              </Button>
            ) : null}
          </Space>
        </Col>
      </Row>
      <Alert
        type={alertType}
        showIcon
        message={[status.text, testResult ? `测试：${testResult}` : ''].filter(Boolean).join(' · ')}
      />
    </Flex>
  );
}

function describeEnv(d: EnvInfo): string {
  if (d.hasLegacyToken) {
    return `Legacy 模式 · 显式 token ${d.maskedLegacyToken}（优先使用，不自动续期）`;
  }
  const parts: string[] = [];
  parts.push('Client Credentials 模式');
  parts.push(d.hasClientId ? `ID ${d.maskedClientId}` : 'ID 未配置');
  parts.push(d.hasClientSecret ? 'Secret 已存' : 'Secret 未配置');
  if (!d.domain) parts.push('⚠ 缺店铺域名');
  return parts.join(' · ');
}

export default function ProductTable({ initial }: { initial: ProductsContent }) {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adminReady, setAdminReady] = useState(false);
  const [pushing, setPushing] = useState<string | null>(null);
  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(initial), [data, initial]);

  useEffect(() => {
    setData(initial);
  }, [initial]);

  function patch(id: string, partial: Partial<ProductRow>) {
    setData((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    }));
  }

  function addRow() {
    const row = emptyRow(makeId());
    setData((prev) => ({ ...prev, rows: [...prev.rows, row] }));
    setOpenId(row.id);
  }

  function removeRow(id: string) {
    setData((prev) => ({ ...prev, rows: prev.rows.filter((row) => row.id !== id) }));
    if (openId === id) setOpenId(null);
  }

  async function save() {
    setSaving(true);
    setStatus('保存中…');
    try {
      const res = await fetch('/api/cms/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) {
        const text = json.error || '保存失败';
        setStatus(text);
        message.error(text);
        return;
      }
      setStatus('已保存到 content/products.json');
      message.success('已保存到 content/products.json');
      router.refresh();
    } catch (err) {
      const text = err instanceof Error ? err.message : '保存失败';
      setStatus(text);
      message.error(text);
    } finally {
      setSaving(false);
    }
  }

  async function pushRows(ids?: string[]) {
    if (dirty) {
      message.error('先保存到本地，再推到 Shopify。');
      return;
    }
    if (!adminReady) {
      message.error('先在上方填 Admin 凭据并测试连接。');
      return;
    }
    const target = ids?.length ? ids.join(',') : 'all';
    setPushing(target);
    setStatus('正在推到 Shopify…');
    try {
      const res = await fetch('/api/cms/shopify/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids?.length ? { ids } : {}),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: {
          results: Array<{ handle: string; action: string; imageCount: number; warning?: string }>;
          errors: Array<{ handle: string; message: string }>;
        };
      };
      if (!json.ok) {
        const text = humanizeAdminErrorMessage(json.error || '推送失败');
        setStatus(text);
        message.error(text);
        return;
      }
      const okCount = json.data?.results.length ?? 0;
      const warn = json.data?.results
        .map((item) => item.warning)
        .filter(Boolean)
        .join('；');
      const text = warn
        ? `已推送 ${okCount} 条。${warn}`
        : `已推送 ${okCount} 条到 Shopify。顾客站约 1 分钟后刷新可见。`;
      setStatus(text);
      message.success(text);
    } catch (err) {
      const text = humanizeAdminErrorMessage(err instanceof Error ? err.message : '推送失败');
      setStatus(text);
      message.error(text);
    } finally {
      setPushing(null);
    }
  }

  const filled = data.rows.filter((row) => row.handle || row.title).length;

  return (
    <Flex vertical gap="middle">
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          商品
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          本地改完先点「保存」，再「推到 Shopify」。顾客站只读店铺里的商品，不推送就看不到改动。
          图先传到本 SKU，推送时才会上到店铺画廊。推送前先填好下方凭据并测试连接。
        </Typography.Paragraph>
      </div>

      <Card title="Shopify Admin 凭据">
        <Typography.Paragraph type="secondary">
          到 https://dev.shopify.com/dashboard 建应用，勾选 read/write products、files、publications 后
          Release。把 Client ID、Client Secret、店铺域名填进来，点「保存到 .env.local」，再「测试 Shopify
          连接」。测通才能推送。这些值只留在服务器 .env.local。若测试仍读到旧值，重启{' '}
          <Typography.Text code>npm run admin</Typography.Text>。
        </Typography.Paragraph>
        <TokenPanel onReady={setAdminReady} />
      </Card>

      <Card
        title={
          <Flex align="center" gap="small">
            <span>商品 · {filled} 条</span>
            {dirty ? <Tag color="error">未保存</Tag> : <Tag color="success">已保存</Tag>}
          </Flex>
        }
        extra={
          <Space wrap>
            <Button onClick={addRow}>+ 新增</Button>
            <Button onClick={() => downloadJson(data)}>导出 JSON（备份）</Button>
            <Button
              type="primary"
              ghost
              disabled={dirty || !adminReady}
              loading={pushing === 'all'}
              onClick={() => {
                modal.confirm({
                  title: '把已保存的商品推到 Shopify？',
                  content:
                    '会按 Handle 创建或覆盖店铺里的商品字段。本地有图就替换店铺画廊；本地没图则不改店铺已有图。新商品若状态是 active，会尝试发布到销售渠道。',
                  okText: '推到 Shopify',
                  cancelText: '取消',
                  onOk() {
                    return pushRows();
                  },
                });
              }}
            >
              {pushing === 'all' ? '推送中…' : '推到 Shopify'}
            </Button>
            <Button type={dirty ? 'primary' : 'default'} onClick={() => void save()} loading={saving}>
              {saving ? '保存中…' : dirty ? '保存' : '已保存'}
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          size="middle"
          pagination={false}
          scroll={{ x: 1200 }}
          dataSource={data.rows}
          expandable={{
            expandedRowKeys: openId ? [openId] : [],
            onExpand: (expanded, record) => setOpenId(expanded ? record.id : null),
            expandedRowRender: (row) => (
              <Flex vertical gap="middle">
                <PdpCopyEditor row={row} onChange={(partial) => patch(row.id, partial)} />
                <Row gutter={[12, 16]}>
                  <Col xs={12} lg={6}>
                    <Field label="划线价" value={row.compareAtPrice} onChange={(v) => patch(row.id, { compareAtPrice: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="Vendor" value={row.vendor} onChange={(v) => patch(row.id, { vendor: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="Type" value={row.type} onChange={(v) => patch(row.id, { type: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="Tags" value={row.tags} onChange={(v) => patch(row.id, { tags: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="条码" value={row.barcode} onChange={(v) => patch(row.id, { barcode: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="成本" value={row.cost} onChange={(v) => patch(row.id, { cost: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="重量（克）" value={row.grams} onChange={(v) => patch(row.id, { grams: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="库存数量" value={row.inventoryQty} onChange={(v) => patch(row.id, { inventoryQty: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="Option1 名" value={row.option1Name} onChange={(v) => patch(row.id, { option1Name: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="Option2 名" value={row.option2Name} onChange={(v) => patch(row.id, { option2Name: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="Option3 名" value={row.option3Name} onChange={(v) => patch(row.id, { option3Name: v })} />
                  </Col>
                  <Col xs={12} lg={6}>
                    <Field label="图片 Alt" value={row.imageAlt} onChange={(v) => patch(row.id, { imageAlt: v })} />
                  </Col>
                  <Col xs={24} lg={12}>
                    <Field label="SEO 标题" value={row.seoTitle} onChange={(v) => patch(row.id, { seoTitle: v })} hint="≤70 字符" />
                  </Col>
                  <Col xs={24} lg={12}>
                    <Field
                      label="SEO 描述"
                      value={row.seoDescription}
                      onChange={(v) => patch(row.id, { seoDescription: v })}
                      hint="≤320 字符"
                    />
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="商品图（1:1，保存到本 SKU，推送时上架）"
                      extra="上传后先落到本 SKU（public/cms + products.json）。点「推到 Shopify」才会上架到店铺画廊；只保存、不推送，顾客站看不到。"
                      style={{ marginBottom: 0 }}
                    >
                      <ImagesEditor row={row} onChange={(next) => patch(row.id, { images: next })} />
                    </Form.Item>
                  </Col>
                </Row>
              </Flex>
            ),
          }}
          columns={[
            {
              title: '',
              width: 64,
              render: (_, row) => (
                <Badge count={row.images.length > 1 ? row.images.length : 0} size="small">
                  <span className="admin-cover">
                    {row.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.images[0]} alt="" />
                    ) : (
                      '—'
                    )}
                  </span>
                </Badge>
              ),
            },
            {
              title: 'Handle',
              render: (_, row) => (
                <Input size="small" value={row.handle} onChange={(e) => patch(row.id, { handle: e.target.value })} />
              ),
            },
            {
              title: 'Title',
              render: (_, row) => (
                <Input size="small" value={row.title} onChange={(e) => patch(row.id, { title: e.target.value })} />
              ),
            },
            {
              title: '品牌',
              width: 120,
              render: (_, row) => (
                <Input size="small" value={row.option1Value} onChange={(e) => patch(row.id, { option1Value: e.target.value })} />
              ),
            },
            {
              title: '车型',
              width: 120,
              render: (_, row) => (
                <Input size="small" value={row.option2Value} onChange={(e) => patch(row.id, { option2Value: e.target.value })} />
              ),
            },
            {
              title: '年份',
              width: 200,
              render: (_, row) => (
                <YearRangeCell value={row.option3Value} onChange={(v) => patch(row.id, { option3Value: v })} />
              ),
            },
            {
              title: 'SKU',
              width: 140,
              render: (_, row) => (
                <Input size="small" value={row.sku} onChange={(e) => patch(row.id, { sku: e.target.value })} />
              ),
            },
            {
              title: '价格',
              width: 100,
              render: (_, row) => (
                <Input size="small" value={row.price} onChange={(e) => patch(row.id, { price: e.target.value })} />
              ),
            },
            {
              title: '状态',
              width: 110,
              render: (_, row) => (
                <Select
                  size="small"
                  style={{ width: '100%' }}
                  value={row.status}
                  options={[
                    { value: 'draft', label: 'draft' },
                    { value: 'active', label: 'active' },
                  ]}
                  onChange={(value) =>
                    patch(row.id, {
                      status: value === 'active' ? 'active' : 'draft',
                      published: value === 'active',
                    })
                  }
                />
              ),
            },
            {
              title: '',
              width: 280,
              fixed: 'right',
              render: (_, row) => (
                <Space size="small" wrap>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setOpenId(row.id);
                      requestAnimationFrame(() => {
                        document.getElementById(`pdp-copy-${row.id}`)?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest',
                        });
                      });
                    }}
                  >
                    描述填写
                    {row.detailsText.trim() || row.installationText.trim() ? (
                      <Tag color="success" style={{ marginLeft: 4 }}>
                        已填
                      </Tag>
                    ) : null}
                  </Button>
                  <Button type="link" size="small" onClick={() => setOpenId(openId === row.id ? null : row.id)}>
                    {openId === row.id ? '收起' : '详细'}
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    disabled={dirty || !adminReady || Boolean(pushing)}
                    loading={pushing === row.id}
                    onClick={() => void pushRows([row.id])}
                  >
                    推这一条
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    danger
                    onClick={() => {
                      modal.confirm({
                        title: '删除这行商品？',
                        okText: '删除',
                        okButtonProps: { danger: true },
                        cancelText: '取消',
                        onOk() {
                          removeRow(row.id);
                        },
                      });
                    }}
                  >
                    删除
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {status ? <Typography.Text type="secondary">{status}</Typography.Text> : null}
    </Flex>
  );
}
