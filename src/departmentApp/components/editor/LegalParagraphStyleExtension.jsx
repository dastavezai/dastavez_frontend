import { Extension } from '@tiptap/core';

const parseStyleNumber = (value) => {
  if (!value) return null;
  const n = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const toPt = (value) => {
  const n = parseStyleNumber(value);
  if (!Number.isFinite(n)) return null;
  return `${n}pt`;
};

const LegalParagraphStyle = Extension.create({
  name: 'legalParagraphStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          textIndent: {
            default: null,
            parseHTML: (element) => toPt(element.style.textIndent),
            renderHTML: (attrs) => (attrs.textIndent ? { style: `text-indent:${attrs.textIndent}` } : {}),
          },
          marginLeft: {
            default: null,
            parseHTML: (element) => toPt(element.style.marginLeft),
            renderHTML: (attrs) => (attrs.marginLeft ? { style: `margin-left:${attrs.marginLeft}` } : {}),
          },
          marginRight: {
            default: null,
            parseHTML: (element) => toPt(element.style.marginRight),
            renderHTML: (attrs) => (attrs.marginRight ? { style: `margin-right:${attrs.marginRight}` } : {}),
          },
          lineHeight: {
            default: null,
            parseHTML: (element) => {
              const raw = String(element.style.lineHeight || '').trim();
              return raw || null;
            },
            renderHTML: (attrs) => (attrs.lineHeight ? { style: `line-height:${attrs.lineHeight}` } : {}),
          },
        },
      },
    ];
  },
});

export default LegalParagraphStyle;

