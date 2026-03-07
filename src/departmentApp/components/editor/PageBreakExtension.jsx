import React, { useEffect, useRef, useState } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';


const PageBreakView = ({ node, getPos, editor }) => {
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    let count = 0;
    try {
      editor.state.doc.descendants((n, pos) => {
        if (pos >= getPos()) return false;
        if (n.type.name === 'pageBreak') count++;
      });
      setPageNumber(count + 2);
    } catch (e) {
      
    }
  }, [editor.state]);

  return (
    <NodeViewWrapper contentEditable={false} style={{ userSelect: 'none' }}>
      <div
        data-page-break-visual
        style={{
          marginLeft:  'calc(0px - var(--pad-left, 72px))',
          marginRight: 'calc(0px - var(--pad-right, 72px))',
          pageBreakAfter: 'always',
          cursor: 'default',
        }}
      >
        <div style={{
          height: 'var(--pad-bottom, 72px)',
          background: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.10), 0 0 1px rgba(0,0,0,0.14)',
          position: 'relative',
          zIndex: 1,
        }} />

        
        <div
          style={{
            height: '16px',
            background: 'var(--page-canvas-bg, #c4c4c4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '8px',
              lineHeight: 1,
              color: 'rgba(120,120,120,0.65)',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: '600',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            Page {pageNumber}
          </span>
        </div>

        <div style={{
          height: 'var(--pad-top, 72px)',
          background: '#ffffff',
          boxShadow: '0 -2px 4px rgba(0,0,0,0.10), 0 0 1px rgba(0,0,0,0.14)',
          position: 'relative',
          zIndex: 1,
        }} />
      </div>
    </NodeViewWrapper>
  );
};

const PageBreakExtension = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  parseHTML() {
    return [
      { tag: 'div[data-type="page-break"]' },
      { tag: 'div.page-break' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'page-break',
        class: 'page-break',
        style: 'page-break-after: always;',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageBreakView);
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ commands, state }) => {
          const { $from } = state.selection;
          
          
          if ($from.depth > 1) {
            const topLevelEnd = $from.after(1);
            return commands.insertContentAt(topLevelEnd, { type: this.name });
          }
          return commands.insertContent({ type: this.name });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.insertPageBreak(),
    };
  },
});

export default PageBreakExtension;

export const useAutoPageBreak = (editor, enabled = true, pageHeightPx = 1122) => {
  const [pageLineYs, setPageLineYs] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!editor || !enabled) {
      setPageLineYs([]);
      return;
    }

    const compute = () => {
      const editorEl = document.querySelector('.tiptap-editor');
      if (!editorEl) return;
      const totalH = editorEl.scrollHeight;
      const lines = [];
      for (let y = pageHeightPx; y < totalH + pageHeightPx; y += pageHeightPx) {
        if (y < totalH + 80) lines.push(y);
      }
      setPageLineYs(lines);
    };

    const handleUpdate = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(compute, 350);
    };

    editor.on('update', handleUpdate);
    compute();
    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(timerRef.current);
    };
  }, [editor, enabled, pageHeightPx]);

  return pageLineYs;
};
