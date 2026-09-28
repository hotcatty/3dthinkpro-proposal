'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Card, Col, Flex, Form, Input, Row, Switch, Tag, Typography } from 'antd';
import type { CampaignContent, HomeContent, SocialCardContent } from '@/lib/cms/types';
import { MAX_CAMPAIGNS } from '@/lib/cms/types';
import MediaPicker from './MediaPicker';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function HomeEditor({ initial }: { initial: HomeContent }) {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [home, setHome] = useState(initial);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(() => JSON.stringify(home) !== JSON.stringify(initial), [home, initial]);

  useEffect(() => {
    setHome(initial);
  }, [initial]);

  function patchHero(partial: Partial<HomeContent['hero']>) {
    setHome((prev) => ({ ...prev, hero: { ...prev.hero, ...partial } }));
  }

  function patchCampaign(id: string, partial: Partial<CampaignContent>) {
    setHome((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((item) => (item.id === id ? { ...item, ...partial } : item)),
    }));
  }

  function patchCard(id: string, partial: Partial<SocialCardContent>) {
    setHome((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        cards: prev.social.cards.map((item) => (item.id === id ? { ...item, ...partial } : item)),
      },
    }));
  }

  async function save() {
    setSaving(true);
    setStatus('保存中…');
    const res = await fetch('/api/cms/home', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(home),
    });
    const json = (await res.json()) as { ok: boolean; error?: string };
    setSaving(false);
    if (!json.ok) {
      const text = json.error || '保存失败';
      setStatus(text);
      message.error(text);
      return;
    }
    setStatus('已保存。打开首页即可看到。');
    message.success('已保存。打开首页即可看到。');
    router.refresh();
  }

  return (
    <Flex vertical gap="middle">
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          首页内容
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Shopify 只管商品。首屏、活动条、社媒图从这里配。活动 0–4 条；社媒一张都没有时，整段不出现。
        </Typography.Paragraph>
      </div>

      <Card title="Iconic Products 橱窗">
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          首页这条轨道不在这里勾选，读 Shopify 集合{' '}
          <Typography.Text code>iconic-products</Typography.Text>
          。去 Shopify 后台 <Typography.Text strong>Products → Collections</Typography.Text>{' '}
          建手动集合（handle 必须是{' '}
          <Typography.Text code>iconic-products</Typography.Text>
          ），加入商品后拖排序，并发布到 Headless 销售渠道。集合为空或还没建时，轨道保持空白，不会自动塞进全部商品。
        </Typography.Paragraph>
      </Card>

      <Card
        title="首屏 Hero"
        extra={
          <Flex align="center" gap="small">
            <Typography.Text>显示首屏</Typography.Text>
            <Switch checked={home.hero.enabled} onChange={(enabled) => patchHero({ enabled })} />
          </Flex>
        }
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <MediaPicker
              value={home.hero.media}
              onChange={(media) => patchHero({ media })}
              hint="建议宽图或竖版视频，字和按钮由页面叠上去"
            />
          </Col>
          <Col xs={24} lg={12}>
            <Form layout="vertical">
              <Form.Item label="按钮文案">
                <Input value={home.hero.ctaLabel} onChange={(e) => patchHero({ ctaLabel: e.target.value })} />
              </Form.Item>
              <Form.Item label="按钮链接" style={{ marginBottom: 0 }}>
                <Input value={home.hero.ctaHref} onChange={(e) => patchHero({ ctaHref: e.target.value })} />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>

      <Card
        title="活动运营"
        extra={
          <Tag>
            {home.campaigns.length}/{MAX_CAMPAIGNS}
          </Tag>
        }
      >
        <Typography.Paragraph type="secondary">
          一条都没有时，首页不出现这个区域。底图请传干净照片，标题和按钮走下面的字段。
        </Typography.Paragraph>
        <Flex vertical gap="middle">
          {home.campaigns.map((item, index) => (
            <Card
              key={item.id}
              type="inner"
              title={`活动 ${index + 1}`}
              extra={
                <Button
                  type="link"
                  danger
                  onClick={() => {
                    modal.confirm({
                      title: `删除活动 ${index + 1}？`,
                      okText: '删除',
                      okButtonProps: { danger: true },
                      cancelText: '取消',
                      onOk() {
                        setHome((prev) => ({ ...prev, campaigns: prev.campaigns.filter((c) => c.id !== item.id) }));
                      },
                    });
                  }}
                >
                  删除
                </Button>
              }
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <MediaPicker
                    value={item.media}
                    onChange={(media) => patchCampaign(item.id, { media })}
                    hint="建议 16:9，例如 1440×810"
                  />
                </Col>
                <Col xs={24} lg={12}>
                  <Form layout="vertical">
                    <Form.Item label="标题">
                      <Input value={item.title} onChange={(e) => patchCampaign(item.id, { title: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="正文">
                      <Input.TextArea
                        rows={4}
                        value={item.description}
                        onChange={(e) => patchCampaign(item.id, { description: e.target.value })}
                      />
                    </Form.Item>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="按钮文案" style={{ marginBottom: 0 }}>
                          <Input
                            value={item.ctaLabel}
                            onChange={(e) => patchCampaign(item.id, { ctaLabel: e.target.value })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="按钮链接" style={{ marginBottom: 0 }}>
                          <Input
                            value={item.ctaHref}
                            onChange={(e) => patchCampaign(item.id, { ctaHref: e.target.value })}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Col>
              </Row>
            </Card>
          ))}
          {home.campaigns.length < MAX_CAMPAIGNS && (
            <Button
              block
              onClick={() => {
                const next: CampaignContent = {
                  id: uid(),
                  title: '',
                  description: '',
                  ctaLabel: 'Discover More',
                  ctaHref: '/shop',
                  media: null,
                };
                setHome((prev) => ({ ...prev, campaigns: [...prev.campaigns, next] }));
              }}
            >
              增加一条活动
            </Button>
          )}
        </Flex>
      </Card>

      <Card title="社媒 / Built for your bike" extra={<Tag>{home.social.cards.length}</Tag>}>
        <Typography.Paragraph type="secondary">
          一张都没有时，整段从首页拿掉。图是净照片，品牌和车型叠在卡片上。
        </Typography.Paragraph>
        <Form layout="vertical">
          <Form.Item label="区块标题">
            <Input
              value={home.social.title}
              onChange={(e) => setHome((prev) => ({ ...prev, social: { ...prev.social, title: e.target.value } }))}
            />
          </Form.Item>
        </Form>
        <Row gutter={[16, 16]}>
          {home.social.cards.map((card, index) => (
            <Col xs={24} lg={12} key={card.id}>
              <Card
                type="inner"
                title={`卡片 ${index + 1}`}
                extra={
                  <Button
                    type="link"
                    danger
                    onClick={() => {
                      modal.confirm({
                        title: `删除卡片 ${index + 1}？`,
                        okText: '删除',
                        okButtonProps: { danger: true },
                        cancelText: '取消',
                        onOk() {
                          setHome((prev) => ({
                            ...prev,
                            social: { ...prev.social, cards: prev.social.cards.filter((c) => c.id !== card.id) },
                          }));
                        },
                      });
                    }}
                  >
                    删除
                  </Button>
                }
              >
                <MediaPicker
                  value={card.media}
                  onChange={(media) => patchCard(card.id, { media })}
                  hint="建议竖图 440×600"
                />
                <Form layout="vertical" style={{ marginTop: 16 }}>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item label="品牌">
                        <Input value={card.brand} onChange={(e) => patchCard(card.id, { brand: e.target.value })} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="车型">
                        <Input value={card.model} onChange={(e) => patchCard(card.id, { model: e.target.value })} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="点击跳转" style={{ marginBottom: 0 }}>
                    <Input value={card.href} onChange={(e) => patchCard(card.id, { href: e.target.value })} />
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          ))}
        </Row>
        <Button
          block
          style={{ marginTop: 16 }}
          onClick={() => {
            const next: SocialCardContent = { id: uid(), brand: '', model: '', href: '/shop', media: null };
            setHome((prev) => ({
              ...prev,
              social: { ...prev.social, cards: [...prev.social.cards, next] },
            }));
          }}
        >
          增加一张社媒图
        </Button>
      </Card>

      <div className="admin-dock">
        <Typography.Text type={dirty ? undefined : 'secondary'}>
          {status || (dirty ? '有未保存的修改' : '已与当前首页同步')}
        </Typography.Text>
        <Button type="primary" disabled={saving || !dirty} loading={saving} onClick={() => void save()}>
          保存到首页
        </Button>
      </div>
    </Flex>
  );
}
