'use client';

import { App, Button, Card, Col, Empty, Flex, Form, Input, InputNumber, Row, Space, Statistic, Switch, Table, Tag, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductReview, ReviewsContent } from '@/lib/cms/types';
import { emptyReview } from '@/lib/cms/reviewRow';

function makeId() {
  return `rv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function excerpt(text: string, max = 72) {
  const value = text.trim();
  if (value.length <= max) return value || '—';
  return `${value.slice(0, max)}…`;
}

export default function ReviewsTable({
  initial,
  liveReviews,
  liveStats,
}: {
  initial: ReviewsContent;
  liveReviews: ProductReview[];
  liveStats: { count: number; rating: number };
}) {
  const router = useRouter();
  const { message } = App.useApp();
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(initial), [data, initial]);

  useEffect(() => {
    setData(initial);
  }, [initial]);

  function patch(id: string, partial: Partial<ProductReview>) {
    setData((prev) => ({
      reviews: prev.reviews.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    }));
  }

  function addRow(seed?: Partial<ProductReview>) {
    const row = { ...emptyReview(makeId()), ...seed, id: makeId(), featured: true, status: 'published' as const };
    setData((prev) => ({ reviews: [row, ...prev.reviews] }));
    setOpenId(row.id);
  }

  function featureFromLive(review: ProductReview) {
    addRow({
      productHandle: review.productHandle,
      name: review.name,
      date: review.date,
      rating: review.rating,
      text: review.text,
      ownerBadge: review.ownerBadge,
      images: review.images,
    });
    setStatus('已加入精选，记得保存。');
  }

  async function save() {
    setSaving(true);
    setStatus('保存中…');
    try {
      const res = await fetch('/api/cms/reviews', {
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
      setStatus('精选评论已保存');
      message.success('精选评论已保存');
      router.refresh();
    } catch (err) {
      const text = err instanceof Error ? err.message : '保存失败';
      setStatus(text);
      message.error(text);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Flex vertical gap="middle">
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          评论
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          前台分成两块：精选金句由这里填写；商品页 Ratings &amp; Reviews 和社区 Top Comments 只展示 Judge.me
          里已发布的真实买家评价。
        </Typography.Paragraph>
      </div>

      <Card
        title={
          <Flex align="center" gap="small">
            <span>精选金句 · {data.reviews.length}</span>
            {dirty ? <Tag color="error">未保存</Tag> : <Tag color="success">已保存</Tag>}
          </Flex>
        }
        extra={
          <Space>
            <Button onClick={() => addRow()}>新建金句</Button>
            <Button type="primary" disabled={saving || !dirty} loading={saving} onClick={() => void save()}>
              保存
            </Button>
          </Space>
        }
      >
        <Typography.Paragraph type="secondary">
          勾选「前台展示」且已保存后，会出现在商品页大引用和社区页金句。商品 Handle 留空表示全站通用；填写后只出现在对应商品页。
        </Typography.Paragraph>

        {data.reviews.length === 0 ? (
          <Empty description="还没有精选金句。可以从下方真实评价一键带入，或自己写一条。" />
        ) : (
          <Table
            rowKey="id"
            size="middle"
            pagination={false}
            dataSource={data.reviews}
            expandable={{
              expandedRowKeys: openId ? [openId] : [],
              onExpand: (expanded, record) => setOpenId(expanded ? record.id : null),
              expandedRowRender: (row) => (
                <Form layout="vertical">
                  <Form.Item label="金句正文">
                    <Input.TextArea rows={4} value={row.text} onChange={(e) => patch(row.id, { text: e.target.value })} />
                  </Form.Item>
                  <Row gutter={12}>
                    <Col xs={24} lg={12}>
                      <Form.Item label="日期（选填）" style={{ marginBottom: 0 }}>
                        <Input value={row.date} onChange={(e) => patch(row.id, { date: e.target.value })} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item label="车主标签（选填）" style={{ marginBottom: 0 }}>
                        <Input
                          value={row.ownerBadge}
                          placeholder="Honda CB650R owner"
                          onChange={(e) => patch(row.id, { ownerBadge: e.target.value })}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ),
            }}
            columns={[
              {
                title: '前台展示',
                width: 120,
                render: (_, row) => {
                  const showing = row.status === 'published' && row.featured;
                  return (
                    <Flex align="center" gap="small">
                      <Switch
                        checked={showing}
                        onChange={(checked) =>
                          patch(row.id, {
                            featured: checked,
                            status: checked ? 'published' : 'pending',
                          })
                        }
                      />
                      <Typography.Text type="secondary">展示</Typography.Text>
                    </Flex>
                  );
                },
              },
              {
                title: '商品 Handle',
                render: (_, row) => (
                  <Input
                    size="small"
                    value={row.productHandle}
                    placeholder="全站"
                    onChange={(e) => patch(row.id, { productHandle: e.target.value })}
                  />
                ),
              },
              {
                title: '姓名',
                width: 140,
                render: (_, row) => (
                  <Input size="small" value={row.name} onChange={(e) => patch(row.id, { name: e.target.value })} />
                ),
              },
              {
                title: '星级',
                width: 88,
                render: (_, row) => (
                  <InputNumber
                    size="small"
                    min={1}
                    max={5}
                    value={row.rating}
                    onChange={(value) => patch(row.id, { rating: Number(value) || 5 })}
                  />
                ),
              },
              {
                title: '金句',
                ellipsis: true,
                render: (_, row) => <Typography.Text title={row.text}>{excerpt(row.text)}</Typography.Text>,
              },
              {
                title: '',
                width: 140,
                render: (_, row) => (
                  <Space>
                    <Button type="link" size="small" onClick={() => setOpenId(openId === row.id ? null : row.id)}>
                      {openId === row.id ? '收起' : '编辑'}
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      danger
                      onClick={() => setData((prev) => ({ reviews: prev.reviews.filter((item) => item.id !== row.id) }))}
                    >
                      删除
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Card
        title="真实买家评价 · Judge.me"
        extra={
          <Space size="large">
            <Statistic title="已发布" value={liveStats.count} />
            {liveStats.count > 0 ? <Statistic title="均分" value={liveStats.rating} precision={1} /> : null}
          </Space>
        }
      >
        <Typography.Paragraph type="secondary">
          这里只读。买家提交、核验、隐藏都在 Judge.me / Shopify 后台完成；独立站每分钟同步一次已发布内容。点「设为精选」会复制到上方金句，改完再保存。
        </Typography.Paragraph>

        {liveReviews.length === 0 ? (
          <Empty description="当前没有已发布的买家评价。等 Judge.me 里有审核通过的评论后，商品页列表和这里会一起出现。" />
        ) : (
          <Table
            rowKey="id"
            size="middle"
            pagination={false}
            dataSource={liveReviews}
            columns={[
              {
                title: '商品',
                dataIndex: 'productHandle',
                ellipsis: true,
                render: (value: string) => value || '—',
              },
              {
                title: '买家',
                render: (_, review) => (
                  <span>
                    {review.name}
                    {review.ownerBadge === 'Verified buyer' ? (
                      <Tag color="success" style={{ marginLeft: 6 }}>
                        已购
                      </Tag>
                    ) : null}
                  </span>
                ),
              },
              { title: '星级', width: 72, dataIndex: 'rating' },
              {
                title: '日期',
                width: 120,
                render: (_, review) => review.date || '—',
              },
              {
                title: '内容',
                ellipsis: true,
                render: (_, review) => <Typography.Text title={review.text}>{excerpt(review.text, 88)}</Typography.Text>,
              },
              {
                title: '',
                width: 120,
                render: (_, review) => {
                  const featured = data.reviews.some((row) => row.text === review.text && row.name === review.name);
                  return (
                    <Button type="link" size="small" disabled={featured} onClick={() => featureFromLive(review)}>
                      {featured ? '已在精选' : '设为精选'}
                    </Button>
                  );
                },
              },
            ]}
          />
        )}
      </Card>
      {status ? <Typography.Text type="secondary">{status}</Typography.Text> : null}
    </Flex>
  );
}
