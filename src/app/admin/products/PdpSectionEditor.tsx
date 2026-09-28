'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button, Space } from 'antd';
import { combineSectionsToEditorHtml, splitEditorHtmlToSections } from '@/lib/cms/pdpDescription';
import { ParagraphIndent } from './pdpParagraphIndent';

type SectionFields = {
  detailsText: string;
  installationText: string;
};

type Props = {
  detailsText: string;
  installationText: string;
  onChange: (next: SectionFields) => void;
};

function ToolButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  title: string;
}) {
  return (
    <Button
      size="small"
      type={active ? 'primary' : 'default'}
      title={title}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function isSectionHeading(editor: Editor) {
  if (!editor.isActive('heading')) return false;
  const label = editor.state.selection.$from.parent.textContent.trim().toLowerCase();
  return label === 'details' || label === 'installation';
}

export default function PdpSectionEditor({ detailsText, installationText, onChange }: Props) {
  const emittedRef = useRef<SectionFields>({ detailsText, installationText });

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        link: false,
        trailingNode: false,
      }),
      Underline,
      ParagraphIndent,
    ],
    content: combineSectionsToEditorHtml(detailsText, installationText),
    editorProps: {
      attributes: {
        class: 'pdp-rte-prose',
      },
    },
    onUpdate: ({ editor: next }) => {
      const fields = splitEditorHtmlToSections(next.getHTML());
      emittedRef.current = fields;
      onChange(fields);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (
      detailsText === emittedRef.current.detailsText &&
      installationText === emittedRef.current.installationText
    ) {
      return;
    }
    emittedRef.current = { detailsText, installationText };
    editor.commands.setContent(combineSectionsToEditorHtml(detailsText, installationText), {
      emitUpdate: false,
    });
  }, [detailsText, installationText, editor]);

  if (!editor) {
    return <div className="pdp-rte pdp-rte-loading">Loading editor…</div>;
  }

  const indented =
    Boolean(editor.getAttributes('listItem').indent) || Boolean(editor.getAttributes('paragraph').indent);

  function runBlockCommand(command: () => void) {
    if (!editor || isSectionHeading(editor)) return;
    command();
  }

  return (
    <div className="pdp-rte">
      <Space wrap size={6} className="pdp-rte-toolbar">
        <ToolButton
          title="Paragraph"
          active={editor.isActive('paragraph') && !editor.isActive('bulletList') && !editor.isActive('orderedList')}
          onClick={() => runBlockCommand(() => editor.chain().focus().setParagraph().run())}
        >
          段落
        </ToolButton>
        <ToolButton
          title="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => runBlockCommand(() => editor.chain().focus().toggleBulletList().run())}
        >
          <UnorderedListOutlined /> 无序
        </ToolButton>
        <ToolButton
          title="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => runBlockCommand(() => editor.chain().focus().toggleOrderedList().run())}
        >
          <OrderedListOutlined /> 有序
        </ToolButton>
        <ToolButton
          title="First-line indent"
          active={indented}
          onClick={() => runBlockCommand(() => editor.chain().focus().toggleParagraphIndent().run())}
        >
          首行缩进
        </ToolButton>
        <ToolButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldOutlined />
        </ToolButton>
        <ToolButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicOutlined />
        </ToolButton>
        <ToolButton
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineOutlined />
        </ToolButton>
      </Space>
      <EditorContent editor={editor} className="pdp-rte-editor" />
    </div>
  );
}
