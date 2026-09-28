'use client';

import { InboxOutlined } from '@ant-design/icons';
import { App, Button, Flex, Modal, Typography, Upload } from 'antd';
import { useRef, useState } from 'react';
import type { CmsMedia } from '@/lib/cms/types';

async function upload(file: File): Promise<CmsMedia> {
  const body = new FormData();
  body.set('file', file);
  const res = await fetch('/api/cms/upload', { method: 'POST', body });
  const json = (await res.json()) as { ok: boolean; data?: CmsMedia; error?: string };
  if (!json.ok || !json.data) throw new Error(json.error || '上传失败');
  return json.data;
}

export default function MediaPicker({
  value,
  onChange,
  hint,
}: {
  value: CmsMedia | null;
  onChange: (media: CmsMedia | null) => void;
  hint?: string;
}) {
  const { message } = App.useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function take(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await upload(file));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <Flex vertical gap="small">
      <Flex justify="space-between" gap="small" wrap="wrap">
        <Typography.Text type="secondary">素材</Typography.Text>
        {hint ? <Typography.Text type="secondary">{hint}</Typography.Text> : null}
      </Flex>
      {value?.src ? (
        <button type="button" className="admin-media-preview" onClick={() => setOpen(true)}>
          {value.kind === 'video' ? (
            <video src={value.src} muted playsInline preload="metadata" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.src} alt="" />
          )}
        </button>
      ) : (
        <Upload.Dragger
          accept="image/*,video/mp4,video/webm"
          showUploadList={false}
          disabled={busy}
          beforeUpload={(file) => {
            void take(file);
            return false;
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{busy ? '上传中…' : '拖入或点击上传'}</p>
          <p className="ant-upload-hint">图片，或 MP4 / WebM 视频。预览按原图比例完整显示。</p>
        </Upload.Dragger>
      )}
      <Flex gap="small">
        <Button disabled={busy} onClick={() => inputRef.current?.click()}>
          {value ? '更换' : '上传'}
        </Button>
        {value ? (
          <Button onClick={() => onChange(null)}>清除</Button>
        ) : null}
      </Flex>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        hidden
        disabled={busy}
        onChange={(event) => {
          void take(event.target.files?.[0]);
        }}
      />
      <Modal
        open={open && Boolean(value?.src)}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width="auto"
        title={value?.kind === 'video' ? '播放' : '查看全图'}
      >
        {value?.kind === 'video' ? (
          <video src={value.src} controls autoPlay style={{ maxWidth: 'min(1400px, 92vw)', maxHeight: '70vh' }} />
        ) : value?.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.src} alt="" style={{ maxWidth: 'min(1400px, 92vw)', maxHeight: '70vh' }} />
        ) : null}
      </Modal>
    </Flex>
  );
}
