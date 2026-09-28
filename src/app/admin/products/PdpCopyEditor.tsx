'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Flex, Typography } from 'antd';
import { downloadPdpHtml, exportPdpDescriptionHtml, pdpHtmlFilename } from '@/lib/cms/pdpDescription';
import type { ProductRow } from '@/lib/cms/types';
import PdpSectionEditor from './PdpSectionEditor';

export default function PdpCopyEditor({
  row,
  onChange,
}: {
  row: ProductRow;
  onChange: (partial: Pick<ProductRow, 'detailsText' | 'installationText'>) => void;
}) {
  const [copied, setCopied] = useState('');
  const [showHtml, setShowHtml] = useState(true);
  const html = useMemo(
    () => exportPdpDescriptionHtml(row.detailsText, row.installationText),
    [row.detailsText, row.installationText],
  );
  const filename = pdpHtmlFilename(row.sku, row.handle, row.id);

  async function copyHtml() {
    if (!html) {
      setCopied('先填写再复制');
      return;
    }
    try {
      await navigator.clipboard.writeText(html);
      setCopied('已复制，可直接贴到 Shopify 商品描述');
    } catch {
      const pre = document.getElementById(`pdp-copy-${row.id}`)?.querySelector('pre');
      if (pre) {
        const range = document.createRange();
        range.selectNodeContents(pre);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        const ok = document.execCommand('copy');
        setCopied(ok ? '已复制，可直接贴到 Shopify 商品描述' : '已选中下方 HTML，请按 Cmd/Ctrl+C');
        return;
      }
      setCopied('复制失败，请选中下方 HTML 手动复制');
    }
  }

  function download() {
    if (!html) {
      setCopied('先填写再下载');
      return;
    }
    downloadPdpHtml(html, filename);
    setCopied(`已下载 ${filename}`);
  }

  return (
    <Card size="small" id={`pdp-copy-${row.id}`} title="描述填写">
      <Typography.Paragraph type="secondary">
        一个框写两段：Details 和 Installation 用标题分开。有序再点「首行缩进」会写成{' '}
        <code>1. Remove…</code> 这种段落（数字在字里），不要再靠 class / style / blockquote。复制下面整段贴进
        Shopify 商品描述。独立站按 <code>1. </code> / <code>· </code> 还原 24px 缩进。
      </Typography.Paragraph>

      <PdpSectionEditor
        detailsText={row.detailsText}
        installationText={row.installationText}
        onChange={onChange}
      />

      <Flex gap="small" wrap="wrap" align="center" style={{ marginTop: 16 }}>
        <Button onClick={() => setShowHtml((open) => !open)}>{showHtml ? '收起 HTML' : '查看 HTML'}</Button>
        <Button type="primary" onClick={() => void copyHtml()} disabled={!html}>
          一键复制 HTML
        </Button>
        <Button onClick={download} disabled={!html}>
          下载 {filename}
        </Button>
        {copied ? <Typography.Text type="success">{copied}</Typography.Text> : null}
      </Flex>

      {showHtml ? (
        <Flex vertical gap="small" style={{ marginTop: 12 }}>
          <Typography.Text type="secondary">导出 HTML 预览（与前台解析一致，可贴 Shopify）</Typography.Text>
          <pre className="admin-html-preview">{html || '（还没有内容）'}</pre>
        </Flex>
      ) : null}
    </Card>
  );
}
