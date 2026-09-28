import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Extension } from '@tiptap/react';
import { isIndentedAttrs, looksLikeStepText } from '@/lib/cms/pdpDescription';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphIndent: {
      toggleParagraphIndent: () => ReturnType;
    };
  }
}

function elementIsIndented(element: HTMLElement) {
  if (element.closest('blockquote')) return true;
  if (isIndentedAttrs(`${element.getAttribute('class') ?? ''} ${element.getAttribute('style') ?? ''}`)) {
    return true;
  }
  return looksLikeStepText(element.textContent ?? '');
}

function stripLeadingNumber(text: string) {
  return text.replace(/^\s*\d+\.\s+/, '');
}

function stripLeadingBullet(text: string) {
  return text.replace(/^\s*(?:[·•●▪◦]\s+|\*\s+|-\s+)/, '');
}

/** First-line indent on paragraph — lists with indent become `1. ` / `· ` paragraphs. */
export const ParagraphIndent = Extension.create({
  name: 'paragraphIndent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          indent: {
            default: false,
            parseHTML: (element) => elementIsIndented(element),
            renderHTML: (attributes) => {
              if (!attributes.indent) return {};
              return { class: 'pdp-indent' };
            },
          },
        },
      },
      {
        types: ['listItem'],
        attributes: {
          indent: {
            default: false,
            parseHTML: (element) => elementIsIndented(element),
            renderHTML: (attributes) => {
              if (!attributes.indent) return {};
              return { class: 'pdp-indent' };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      toggleParagraphIndent:
        () =>
        ({ editor, commands, state, tr, dispatch }) => {
          if (editor.isActive('orderedList') || editor.isActive('bulletList')) {
            const ordered = editor.isActive('orderedList');
            const { $from } = state.selection;
            for (let depth = $from.depth; depth > 0; depth -= 1) {
              const node = $from.node(depth);
              if (node.type.name !== 'orderedList' && node.type.name !== 'bulletList') continue;
              const pos = $from.before(depth);
              const paragraphs: ProseMirrorNode[] = [];
              let step = 0;
              node.forEach((item) => {
                const raw = item.textContent.trim();
                const body = ordered
                  ? `${step + 1}. ${stripLeadingNumber(raw)}`
                  : `· ${stripLeadingBullet(raw)}`;
                step += 1;
                paragraphs.push(
                  state.schema.nodes.paragraph.create(
                    { indent: true },
                    body ? [state.schema.text(body)] : [],
                  ),
                );
              });
              if (!paragraphs.length) return false;
              if (dispatch) tr.replaceWith(pos, pos + node.nodeSize, paragraphs);
              return true;
            }
            return false;
          }

          return commands.updateAttributes('paragraph', {
            indent: !editor.getAttributes('paragraph').indent,
          });
        },
    };
  },
});
