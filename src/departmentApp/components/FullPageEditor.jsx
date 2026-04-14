import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Input,
  Textarea,
  InputGroup,
  InputLeftElement,
  Badge,
  Tooltip,
  useColorModeValue,
  useToast,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
  Spinner,
  Flex,
  Icon,
  Select,
} from '@chakra-ui/react';
import {
  FiSave,
  FiDownload,
  FiSearch,
  FiX,
  FiCopy,
  FiCheck,
  FiChevronDown,
  FiFileText,
  FiFile,
  FiSidebar,
  FiSun,
  FiMoon,
  FiColumns,
} from 'react-icons/fi';
import {
  MdDescription,
  MdLightbulb,
  MdSmartToy,
  MdHistory,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import fileService from '../services/fileService';
import DesignSuggestionModal from './DesignSuggestionModal';
import SmartSuggestionsPanel from './SmartSuggestionsPanel';
import DocumentAnalysisPanel from './DocumentAnalysisPanel';
import AIHelperPanel from './AIHelperPanel';
import AnalysisDashboard from './analysis/AnalysisDashboard';
import PageBreakExtension, { useAutoPageBreak } from './editor/PageBreakExtension.jsx';
import FontSize from './editor/FontSizeExtension.jsx';
import LegalParagraphStyle from './editor/LegalParagraphStyleExtension.jsx';
import DocumentConverter from './editor/DocumentConverter.jsx';
import { buildDocFlow } from './editor/DocFlowEngine.js';
import { extractPageObjects } from './editor/ObjectLayer.js';
import OnlyOfficeEditor from './OnlyOfficeEditor';
import { useAppTheme } from '../context/ThemeContext';
import DemoLauncher from './DemoMode/DemoLauncher';
import './FullPageEditor.css';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const resolvePdfUrl = (rawUrl) => {
  const u = String(rawUrl || '').trim();
  if (!u) return '';
  const normalizeUploadsPath = (pathname = '') => {
    const p = String(pathname || '');
    // Backend serves local files on /uploads/:filename (not /uploads/files/:filename)
    return p.replace(/^\/uploads\/files\//i, '/uploads/');
  };
  if (/^https?:\/\//i.test(u)) {
    try {
      const parsed = new URL(u);
      const normalizedPath = normalizeUploadsPath(parsed.pathname);
      const isUploadsPath = /^\/uploads\//i.test(normalizedPath);
      const isFrontendDev = /:(5173|4173|3000)$/.test(window.location.origin);
      if (isUploadsPath && isFrontendDev) {
        const envBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const apiBase = String(envBase).replace(/\/+$/, '');
        return `${apiBase}${normalizedPath}${parsed.search || ''}`;
      }
      if (normalizedPath !== parsed.pathname) {
        return `${parsed.origin}${normalizedPath}${parsed.search || ''}`;
      }
    } catch (_) {
      // Keep original URL on parse issues.
    }
    return u;
  }
  const envBase = import.meta.env.VITE_API_URL || '';
  const isDevFrontend = /:\d+/.test(window.location.origin) && /:(5173|4173|3000)/.test(window.location.origin);
  const fallbackApiBase = isDevFrontend ? 'http://localhost:5000' : window.location.origin;
  const base = String(envBase || fallbackApiBase).replace(/\/+$/, '');
  const normalized = normalizeUploadsPath(`/${u.replace(/^\/+/, '')}`);
  return `${base}${normalized}`;
};

// ── Fidelity overlay helpers ────────────────────────────────────────────────
const FONT_FAMILY_MAP = [
  { test: /times\s*new\s*roman|timesnewroman|times/gi, css: "'Times New Roman', 'Noto Serif', Times, serif" },
  { test: /arial|helvetica/gi, css: "Arial, 'Noto Sans', Helvetica, sans-serif" },
  { test: /courier|monospace/gi, css: "'Courier New', Courier, monospace" },
  { test: /georgia/gi, css: "Georgia, 'Times New Roman', Times, serif" },
];

const EXTRACTED_FONT_FAMILIES = new Set();
const registerExtractedFontFamilies = (families = []) => {
  for (const f of families) {
    const name = String(f || '').trim();
    if (name) EXTRACTED_FONT_FAMILIES.add(name);
  }
};

const normalizeFontFamily = (raw = '') => {
  const name = String(raw || '').trim();
  if (!name) return "'Times New Roman', Times, serif";
  if (EXTRACTED_FONT_FAMILIES.has(name)) {
    return `'${name}', 'Times New Roman', 'Noto Serif', Times, serif`;
  }
  for (const m of FONT_FAMILY_MAP) {
    if (m.test.test(name)) return m.css;
  }
  return name.includes(',') ? name : `${name}, 'Times New Roman', 'Noto Serif', Times, serif`;
};

const getMeasureContext = (() => {
  let canvas;
  return () => {
    if (typeof document === 'undefined') return null;
    if (!canvas) canvas = document.createElement('canvas');
    return canvas.getContext('2d');
  };
})();

const ensureWebFontSheet = (() => {
  let loaded = false;
  return () => {
    if (loaded || typeof document === 'undefined') return;
    loaded = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Serif:wght@400;700&display=swap';
    document.head.appendChild(link);
  };
})();

const loadFontFamily = (family) => {
  if (typeof document === 'undefined' || !document.fonts) return;
  const fam = String(family || '').split(',')[0].trim();
  if (!fam) return;
  document.fonts.load(`400 12px ${fam}`).catch(() => {});
  document.fonts.load(`700 12px ${fam}`).catch(() => {});
};

const measureWrappedLines = (text, opts = {}) => {
  const {
    fontSizePx = 12,
    fontFamily = "'Times New Roman', Times, serif",
    fontWeight = 400,
    fontStyle = 'normal',
    maxWidthPx = 300,
    lineHeightPx = Math.round(fontSizePx * 1.35),
  } = opts;

  const ctx = getMeasureContext();
  const safeText = String(text || '');
  const paragraphs = safeText.split('\n');
  const lines = [];

  if (!ctx || maxWidthPx <= 10) {
    const fallbackLines = paragraphs.map((p) => p || ' ');
    return { lines: fallbackLines, height: fallbackLines.length * lineHeightPx, lineHeightPx };
  }

  ctx.font = `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`;

  const measure = (s) => ctx.measureText(s).width;

  for (const para of paragraphs) {
    const words = String(para || '').split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push(' ');
      continue;
    }
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (measure(candidate) <= maxWidthPx) {
        current = candidate;
        continue;
      }
      if (current) lines.push(current);
      // If a single word is too long, break by characters.
      if (measure(word) > maxWidthPx) {
        let chunk = '';
        for (const ch of word) {
          const next = chunk + ch;
          if (measure(next) > maxWidthPx && chunk) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk = next;
          }
        }
        if (chunk) lines.push(chunk);
        current = '';
      } else {
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  const height = Math.max(lineHeightPx, lines.length * lineHeightPx);
  return { lines, height, lineHeightPx };
};

const bboxOverlapRatio = (a, b) => {
  const left = Math.max(a[0], b[0]);
  const top = Math.max(a[1], b[1]);
  const right = Math.min(a[2], b[2]);
  const bottom = Math.min(a[3], b[3]);
  const w = Math.max(0, right - left);
  const h = Math.max(0, bottom - top);
  const area = w * h;
  const areaA = Math.max(1, (a[2] - a[0]) * (a[3] - a[1]));
  return area / areaA;
};

const inferAlignFromLine = (x1, x2, pageWidth) => {
  if (!pageWidth) return 'left';
  const leftRatio = x1 / pageWidth;
  const rightRatio = x2 / pageWidth;
  const mid = (leftRatio + rightRatio) / 2;
  if (mid > 0.42 && mid < 0.58 && rightRatio < 0.85) return 'center';
  if (leftRatio > 0.62) return 'right';
  return 'left';
};

const scaleBBox = (bbox, scale = 1) => {
  if (!Array.isArray(bbox) || bbox.length < 4) return bbox;
  if (!Number.isFinite(scale) || scale === 1) return bbox;
  return [bbox[0] * scale, bbox[1] * scale, bbox[2] * scale, bbox[3] * scale];
};

const buildPdfTextLineBlocks = (items, pageNumber, pageWidth, tableCells = []) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const valid = items.filter((it) => String(it?.text || '').trim().length > 0);
  if (valid.length === 0) return [];

  // Group items into lines by baseline proximity.
  const sorted = valid.slice().sort((a, b) => (a.baseline - b.baseline) || (a.x - b.x));
  const lines = [];
  const lineThreshold = (it) => Math.max(2, Number(it.height || 0) * 0.8);

  for (const item of sorted) {
    const threshold = lineThreshold(item);
    let line = lines.find((l) => Math.abs(l.baseline - item.baseline) <= threshold);
    if (!line) {
      line = { items: [], baseline: item.baseline };
      lines.push(line);
    }
    line.items.push(item);
    line.baseline = (line.baseline * (line.items.length - 1) + item.baseline) / line.items.length;
  }

  const tableBboxes = tableCells.map((c) => c.bbox).filter(Boolean).map((b) => {
    // expand bbox slightly to ensure lines inside tables are filtered
    const pad = 2;
    return [b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad];
  });

  const blocks = [];
  lines.forEach((line, idx) => {
    const parts = line.items.slice().sort((a, b) => a.x - b.x);
    const xs = parts.map((p) => p.x);
    const ys = parts.map((p) => p.y);
    const rights = parts.map((p) => p.right);
    const bottoms = parts.map((p) => p.bottom);
    const lineX1 = Math.min(...xs);
    const lineY1 = Math.min(...ys);
    const lineX2 = Math.max(...rights);
    const lineY2 = Math.max(...bottoms);

    // Skip if line falls inside a table cell.
    for (const tb of tableBboxes) {
      if (bboxOverlapRatio([lineX1, lineY1, lineX2, lineY2], tb) > 0.25) return;
    }

    // Split line into segments when the gap is large (keeps right‑aligned pieces separate)
    const segments = [];
    let seg = [];
    let lastRight = null;
    for (const p of parts) {
      const gap = lastRight !== null ? (p.x - lastRight) : 0;
      const fontSizeGuess = Math.max(8, Number(p.height || 10) * 0.9);
      const bigGap = Math.max(6, fontSizeGuess * 1.6);
      if (lastRight !== null && gap > bigGap && seg.length > 0) {
        segments.push(seg);
        seg = [];
      }
      seg.push(p);
      lastRight = p.right;
    }
    if (seg.length > 0) segments.push(seg);

    segments.forEach((segItems, sIdx) => {
      const sXs = segItems.map((p) => p.x);
      const sYs = segItems.map((p) => p.y);
      const sRights = segItems.map((p) => p.right);
      const sBottoms = segItems.map((p) => p.bottom);
      const x1 = Math.min(...sXs);
      const y1 = Math.min(...sYs);
      const x2 = Math.max(...sRights);
      const y2 = Math.max(...sBottoms);

      let text = '';
      let segLastRight = null;
      const fontFamilies = new Map();
      const fontWeights = new Map();
      const fontStyles = new Map();
      let avgHeight = 0;

      for (const p of segItems) {
        const gap = segLastRight !== null ? (p.x - segLastRight) : 0;
        const fontSizeGuess = Math.max(8, Number(p.height || 10) * 0.9);
        const spaceThreshold = Math.max(2, fontSizeGuess * 0.35);
        if (segLastRight !== null && gap > spaceThreshold && !/^[\.,:;)\]]/.test(p.text || '')) {
          text += ' ';
        }
        text += String(p.text || '');
        segLastRight = p.right;
        avgHeight += Number(p.height || 0);
        const ff = String(p.fontFamily || p.fontName || '').trim();
        if (ff) fontFamilies.set(ff, (fontFamilies.get(ff) || 0) + 1);
        const fw = String(p.fontWeight || '').trim();
        if (fw) fontWeights.set(fw, (fontWeights.get(fw) || 0) + 1);
        const fs = String(p.fontStyle || '').trim();
        if (fs) fontStyles.set(fs, (fontStyles.get(fs) || 0) + 1);
      }

      const best = (m) => [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      const fontFamily = best(fontFamilies);
      const fontWeightRaw = best(fontWeights);
      const fontStyleRaw = best(fontStyles);
      const fontWeight = /bold/i.test(fontFamily) || /bold/i.test(fontWeightRaw) ? 700 : 400;
      const fontStyle = /italic|oblique/i.test(fontFamily) || /italic|oblique/i.test(fontStyleRaw) ? 'italic' : 'normal';
      const fontSize = Math.max(9, Math.min(18, Math.round((avgHeight / segItems.length) || 11)));
      const lineHeight = Math.max(Math.round(fontSize * 1.1), Math.round((y2 - y1) || fontSize));

      blocks.push({
        id: `pdfline_${pageNumber}_${idx}_${sIdx}_${Math.round(x1)}_${Math.round(y1)}`,
        type: 'line',
        role: 'body',
        text,
        bbox: [x1, y1, x2, y2],
        source: 'pdfText',
        style: {
          align: inferAlignFromLine(x1, x2, pageWidth),
          fontSize,
          bold: fontWeight >= 600,
          fontFamily: normalizeFontFamily(fontFamily),
          fontFamilyRaw: fontFamily,
          fontWeight,
          lineHeight,
          fontStyle,
        },
      });
    });
  });

  return blocks;
};

const isSeparatorText = (text = '') => /^[-=_]{5,}$/.test(String(text || '').trim());

const documentGraphToLayoutModel = (documentGraph) => {
  if (!documentGraph || !Array.isArray(documentGraph.pages)) return null;
  return {
    provider: documentGraph.provider || 'graph',
    pages: documentGraph.pages.map((page) => ({
      pageNumber: Number(page?.pageNumber || 0),
      width: Number(page?.width || 0),
      height: Number(page?.height || 0),
      blocks: (Array.isArray(page?.blocks) ? page.blocks : []).map((b) => ({
        id: b?.id,
        type: b?.type || 'line',
        role: b?.role || 'body',
        text: String(b?.text || ''),
        bbox: Array.isArray(b?.bbox) ? b.bbox : [0, 0, 0, 0],
        style: b?.style || {},
        border: b?.border || null,
        table: b?.table || null,
        confidence: b?.confidence ?? null,
        runs: Array.isArray(b?.runs) ? b.runs : [],
      })),
    })),
  };
};

const escHtml = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pxToPt = (px) => {
  const n = Number(px);
  if (!Number.isFinite(n)) return null;
  // 1pt = 1.333px => px * 0.75 = pt
  return n * 0.75;
};
const clampPt = (pt, min = 8, max = 24) => Math.max(min, Math.min(max, pt));
const runStyleToCss = (style = {}) => {
  const css = [];
  if (style?.fontFamily) css.push(`font-family:${String(style.fontFamily).replace(/"/g, '')}`);
  if (style?.fontSize) {
    const pt = pxToPt(style.fontSize);
    css.push(`font-size:${clampPt(Number.isFinite(pt) ? pt : Number(style.fontSize))}pt`);
  }
  if (style?.lineHeight) {
    const lh = Number(style.lineHeight);
    const fsPx = Number(style.fontSize || 12);
    if (Number.isFinite(lh) && lh > 0) {
      const ratio = fsPx > 0 ? (lh / Math.max(8, fsPx)) : lh;
      css.push(`line-height:${Math.max(1, Math.min(2.5, ratio))}`);
    }
  }
  if (style?.color) css.push(`color:${String(style.color)}`);
  return css.join(';');
};
const renderStyledRun = (run = {}, fallbackStyle = {}) => {
  const text = escHtml(String(run?.text || ''));
  if (!text) return '';
  const style = run?.style || {};
  const fontWeight = Number(style?.fontWeight || fallbackStyle?.fontWeight || 400);
  const isBold = fontWeight >= 600 || !!style?.bold || !!fallbackStyle?.bold;
  const fontStyle = String(style?.fontStyle || fallbackStyle?.fontStyle || '').toLowerCase();
  const isItalic = fontStyle.includes('italic') || !!style?.italic || !!fallbackStyle?.italic;
  const isUnderline = !!style?.underline || !!fallbackStyle?.underline;
  const css = runStyleToCss({ ...fallbackStyle, ...style });
  let out = css ? `<span style="${css}">${text}</span>` : text;
  if (isUnderline) out = `<u>${out}</u>`;
  if (isItalic) out = `<em>${out}</em>`;
  if (isBold) out = `<strong>${out}</strong>`;
  return out;
};
const parseListMarker = (text = '') => {
  const t = String(text || '').trim();
  const ordered = t.match(/^(\(?\d+[\).\:]|[a-zA-Z][\).\:])\s+(.*)$/);
  if (ordered) return { kind: 'ol', content: ordered[2] || '' };
  const bullet = t.match(/^([•\-–*])\s+(.*)$/);
  if (bullet) return { kind: 'ul', content: bullet[2] || '' };
  return null;
};
const listMarkerToken = (text = '') => {
  const t = String(text || '').trim();
  const m = t.match(/^(\(?\d+[\).\:]|[a-zA-Z][\).\:]|[•\-–*])$/);
  return m ? m[1] : '';
};
const isLikelyListMarkerOnly = (text = '') => !!listMarkerToken(text);
const detectBoldFromStyle = (style = {}) => {
  const fw = Number(style?.fontWeight || style?.weight || 0);
  const fwRaw = String(style?.fontWeight || style?.weight || '').toLowerCase();
  return (
    fw >= 600 ||
    fwRaw.includes('bold') ||
    !!style?.bold ||
    !!style?.isBold ||
    !!style?.strong
  );
};
const detectItalicFromStyle = (style = {}) => {
  const fs = String(style?.fontStyle || '').toLowerCase();
  return fs.includes('italic') || !!style?.italic || !!style?.isItalic;
};
const detectUnderlineFromStyle = (style = {}) => {
  const td = String(style?.textDecoration || '').toLowerCase();
  return td.includes('underline') || !!style?.underline || !!style?.isUnderline;
};
const normalizeSplitListRows = (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) return rows;
  const out = [];
  for (let i = 0; i < rows.length; i += 1) {
    const cur = rows[i];
    const next = rows[i + 1];
    if (
      next &&
      isLikelyListMarkerOnly(cur?.text) &&
      !isSeparatorText(next?.text) &&
      !isLikelyListMarkerOnly(next?.text)
    ) {
      const sameLineish = Math.abs(Number(next?.y || 0) - Number(cur?.y || 0)) <= 10;
      const nextToRight = Number(next?.x || 0) >= Number(cur?.x || 0);
      if (sameLineish && nextToRight) {
        const marker = listMarkerToken(cur.text);
        out.push({
          ...next,
          text: `${marker} ${String(next?.text || '').trim()}`.trim(),
          x: Math.min(Number(cur?.x || 0), Number(next?.x || 0)),
          runs: [],
        });
        i += 1;
        continue;
      }
    }
    out.push(cur);
  }
  return out;
};
const closeListTag = (state) => {
  if (!state.currentListTag) return '';
  const tag = state.currentListTag;
  state.currentListTag = null;
  // Keep olCounter so we can resume with start= if the list reopens later
  return `</${tag}>`;
};
const resolveHeadingTag = ({ role = '', fontWeight = 400, fontSize = 12, text = '', align = 'left' }) => {
  const t = String(text || '').trim();
  const r = String(role || '').toLowerCase();
  const isUpper = t.length > 0 && t === t.toUpperCase() && /[A-Z]/.test(t);
  const isShort = t.length > 0 && t.length <= 120;
  const isHeadingLikeRole = r.includes('title') || r.includes('heading') || r.includes('header');
  const isHeadingLikeStyle = fontWeight >= 700 && fontSize >= 13 && isShort;
  const centeredStrong = align === 'center' && fontWeight >= 700 && isShort;
  if (!(isHeadingLikeRole || isHeadingLikeStyle || centeredStrong)) return null;
  if (fontSize >= 17 || (isUpper && fontSize >= 14)) return 'h1';
  if (fontSize >= 15) return 'h2';
  return 'h3';
};
const isAzureLayoutModel = (layoutModel) => {
  const provider = String(layoutModel?.provider || '').toLowerCase();
  return provider.includes('azure');
};

// ─── Robust editable HTML reconstruction ─────────────────────────────────────
// Single shared pipeline used by both documentGraph and layoutModel sources.

const inferAlign = (x, right, width) => {
  if (width <= 0) return 'left';
  const mid = (x + right) / 2 / width;
  if (mid > 0.4 && mid < 0.6 && (right - x) < width * 0.7) return 'center';
  if (x / width > 0.58) return 'right';
  return 'left';
};

const computePageFontStats = (rows) => {
  const sizes = rows
    .filter((r) => r.type !== 'tableCell' && !isSeparatorText(r.text))
    .map((r) => Math.max(9, Math.round(Number(r.style?.fontSize || 12))));
  if (!sizes.length) return { median: 12, p90: 14, max: 14 };
  const sorted = [...sizes].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  const max = sorted[sorted.length - 1];
  return { median, p90, max };
};

const resolveHeadingTagRobust = ({ role = '', fontWeight = 400, fontSize = 12, text = '', align = 'left', fontStats = {} }) => {
  const t = String(text || '').trim();
  const r = String(role || '').toLowerCase();
  const isShort = t.length > 0 && t.length <= 200;
  const isUpperCase = t.length >= 3 && t === t.toUpperCase() && /[A-Z]/.test(t);
  const { median = 12, max = 14 } = fontStats;
  const isLargerThanBody = fontSize > median + 1;
  const isMuchLarger = fontSize > median + 2.5;
  const isRoleHeading = /title|heading|sectionhead/.test(r);
  const isCentered = align === 'center';
  const isBold = fontWeight >= 700;

  if (!isShort) return null;
  if (!isRoleHeading && !isLargerThanBody && !(isCentered && isBold) && !isUpperCase) return null;

  if (fontSize >= max - 0.5 || (isUpperCase && isMuchLarger) || (isCentered && isBold && isUpperCase)) return 'h1';
  if (isMuchLarger || isRoleHeading) return 'h2';
  if (isLargerThanBody || (isCentered && isBold)) return 'h3';
  return null;
};

const mergeSameLineFragments = (rows, yTolerance = 3) => {
  if (!rows.length) return rows;
  const out = [];
  let group = [rows[0]];
  for (let i = 1; i < rows.length; i += 1) {
    const prev = group[group.length - 1];
    const cur = rows[i];
    const yDiff = Math.abs(Number(cur.y || 0) - Number(prev.y || 0));
    const sameType = cur.type === prev.type && cur.type !== 'tableCell';
    const isTextLike = !/tableCell/.test(cur.type);
    if (isTextLike && sameType && yDiff <= yTolerance) {
      group.push(cur);
    } else {
      out.push(mergeFragmentGroup(group));
      group = [cur];
    }
  }
  out.push(mergeFragmentGroup(group));
  return out;
};

const mergeFragmentGroup = (group) => {
  if (group.length === 1) return group[0];
  group.sort((a, b) => (a.x || 0) - (b.x || 0));
  const base = group[0];
  const mergedText = group.map((g) => String(g.text || '').trim()).join(' ').trim();
  const mergedRuns = group.flatMap((g) =>
    Array.isArray(g.runs) && g.runs.length > 0
      ? g.runs
      : [{ text: g.text, style: g.style || {} }]
  );
  return {
    ...base,
    text: mergedText,
    right: Math.max(...group.map((g) => Number(g.right || g.x || 0))),
    runs: mergedRuns,
  };
};

const normalizeForMatch = (s = '') => String(s || '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .replace(/[^\p{L}\p{N}\s]/gu, '')
  .trim();

const scoreTextMatch = (haystack = '', needle = '') => {
  const h = normalizeForMatch(haystack);
  const n = normalizeForMatch(needle);
  if (!h || !n) return 0;
  if (h.includes(n)) return Math.min(1, 0.6 + n.length / Math.max(60, h.length));
  const nTokens = n.split(' ').filter((t) => t.length >= 3);
  if (nTokens.length === 0) return 0;
  let hits = 0;
  for (const t of nTokens) if (h.includes(t)) hits += 1;
  return hits / nTokens.length;
};

const buildTableHtml = (chunk) => {
        const grid = new Map();
        let maxRow = 0;
        let maxCol = 0;
  const fontSizes = [];
  const colWidths = new Map();
        for (const cell of chunk) {
    const r = Number(cell?.table?.rowIndex ?? cell?.table?.row ?? 0);
    const c = Number(cell?.table?.columnIndex ?? cell?.table?.col ?? 0);
          if (!Number.isFinite(r) || !Number.isFinite(c)) continue;
          maxRow = Math.max(maxRow, r);
          maxCol = Math.max(maxCol, c);
          if (!grid.has(r)) grid.set(r, new Map());
    if (!grid.get(r).has(c)) grid.get(r).set(c, cell);
    const fs = Number(cell?.style?.fontSize || 0);
    if (Number.isFinite(fs) && fs > 0) fontSizes.push(fs);
    const w = Number(cell?.right || 0) - Number(cell?.x || 0);
    if (Number.isFinite(w) && w > 0) {
      colWidths.set(c, Math.max(colWidths.get(c) || 0, w));
    }
  }
  const sortedSizes = fontSizes.slice().sort((a, b) => a - b);
  const medianPx = sortedSizes.length ? sortedSizes[Math.floor(sortedSizes.length / 2)] : 14;
  // Azure layout frequently reports fontSize in PDF points (~11-12) when page
  // widths are in PDF points (≈612). If median is already "pt-like", do not
  // shrink it by converting px→pt again.
  const tableFontPt = clampPt(medianPx <= 24 ? medianPx : (pxToPt(medianPx) || 10), 8, 16);

  const totalWidth = Array.from(colWidths.values()).reduce((a, b) => a + b, 0);
  const colGroup = totalWidth > 0
    ? `<colgroup>${Array.from({ length: maxCol + 1 }).map((_, idx) => {
      const w = colWidths.get(idx) || (totalWidth / (maxCol + 1));
      const pct = Math.max(4, Math.min(96, (w / totalWidth) * 100));
      return `<col style="width:${pct.toFixed(1)}%;">`;
    }).join('')}</colgroup>`
    : '';

  const tParts = [`<table style="border-collapse:collapse;width:100%;margin:6px 0;font-size:${tableFontPt}pt;table-layout:fixed;">`];
  if (colGroup) tParts.push(colGroup);
        for (let r = 0; r <= maxRow; r += 1) {
    tParts.push('<tr>');
          for (let c = 0; c <= maxCol; c += 1) {
            const cell = grid.get(r)?.get(c) || null;
            if (!cell) {
        tParts.push('<td style="border:1px solid #333;padding:4px 8px;vertical-align:top;"> </td>');
              continue;
            }
      const runs = Array.isArray(cell.runs) && cell.runs.length > 0
        ? cell.runs
        : [{ text: cell.text, style: cell.style || {} }];
      const inline = runs.map((run) => renderStyledRun(run, cell.style || {})).join('');
            const rowSpan = Math.max(1, Number(cell?.table?.rowSpan || 1));
      const colSpan = Math.max(1, Number(cell?.table?.columnSpan || cell?.table?.colSpan || 1));
            const spanAttrs = `${rowSpan > 1 ? ` rowspan="${rowSpan}"` : ''}${colSpan > 1 ? ` colspan="${colSpan}"` : ''}`;
      tParts.push(`<td${spanAttrs} style="border:1px solid #333;padding:4px 8px;vertical-align:top;">${inline || '&nbsp;'}</td>`);
    }
    tParts.push('</tr>');
  }
  tParts.push('</table>');
  return tParts.join('');
};

// ── Line → Paragraph grouping (fallback for non-Azure sources) ───────────────
// Groups consecutive OCR lines that belong to the same logical paragraph.
// Key signals: small Y-gap, same indent zone, same font size, same bold state.
const groupLinesIntoParagraphs = (lines, width) => {
  if (!lines.length) return lines;
  const INDENT_ZONE = width * 0.04; // 4% of page width = same indent
  const out = [];

  const finalizeGroup = (grp) => {
    if (grp.length === 1) return grp[0];
    grp.sort((a, b) => (a.y - b.y) || (a.x - b.x));
    const base = grp[0];
    const mergedText = grp.map((l) => String(l.text || '').trim()).filter(Boolean).join(' ');
    const mergedRuns = grp.flatMap((l) =>
      Array.isArray(l.runs) && l.runs.length > 0
        ? l.runs
        : [{ text: l.text, style: l.style || {} }]
    );
    return {
      ...base,
      text: mergedText,
      right: Math.max(...grp.map((l) => Number(l.right || 0))),
      y: grp[0].y,
      runs: mergedRuns,
    };
  };

  let group = [lines[0]];

  for (let i = 1; i < lines.length; i += 1) {
    const prev = group[group.length - 1];
    const cur = lines[i];

    // Never merge table cells or already-paragraph blocks
    if (cur.type === 'tableCell' || cur.type === 'paragraph' || prev.type === 'tableCell' || prev.type === 'paragraph') {
      out.push(finalizeGroup(group));
      group = [cur];
        continue;
      }

    // Never merge list items
    if (parseListMarker(cur.text) || parseListMarker(prev.text)) {
      out.push(finalizeGroup(group));
      group = [cur];
      continue;
    }

    const prevFontSize = Math.max(9, Math.round(Number(prev.style?.fontSize || 12)));
    const curFontSize  = Math.max(9, Math.round(Number(cur.style?.fontSize  || 12)));
    const estimatedLineH = prevFontSize * 1.35;
    const yGap = Number(cur.y || 0) - Number(prev.y || 0);

    // Position-based continuation: small gap, same indent zone, same font size & bold
    const smallGap     = yGap > 0 && yGap <= estimatedLineH * 1.6;
    const sameIndent   = Math.abs(Number(cur.x || 0) - Number(group[0].x || 0)) <= INDENT_ZONE;
    const sameFontSize = Math.abs(prevFontSize - curFontSize) <= 1;
    const prevBold     = detectBoldFromStyle(prev.style || {});
    const curBold      = detectBoldFromStyle(cur.style  || {});
    const sameBold     = prevBold === curBold;
    const sameRole     = String(cur.role || 'body') === String(prev.role || 'body');

    if (smallGap && sameIndent && sameFontSize && sameBold && sameRole) {
      group.push(cur);
      } else {
      out.push(finalizeGroup(group));
      group = [cur];
    }
  }

  out.push(finalizeGroup(group));
  return out;
};

const blocksToEditableHtml = (rawBlocks, pageWidth) => {
  const width = Number(pageWidth || 600);
  const widthLooksLikePdfPoints = width > 0 && width < 700;
  // 1) Normalize and sort
  const normalized = rawBlocks
      .map((b, idx) => {
        const bbox = Array.isArray(b?.bbox) ? b.bbox : [0, 0, 0, 0];
      const x = Number(bbox[0] || 0);
      const y = Number(bbox[1] || 0);
      const right = Number(bbox[2] || 0);
      const bottom = Number(bbox[3] || 0);
      const rawStyle = b?.style || {};
      // Merge top-level font props into style for blocks (Azure paragraph path)
      const style = {
        ...rawStyle,
        fontSize:   rawStyle.fontSize   || b?.fontSize   || null,
        fontFamily: rawStyle.fontFamily || b?.fontFamily || null,
        fontStyle:  rawStyle.fontStyle  || b?.fontStyle  || null,
        fontWeight: rawStyle.fontWeight || b?.fontWeight || b?.bold ? (b?.bold ? 700 : rawStyle.fontWeight) : null,
        align:      rawStyle.align      || null,
        lineHeight: rawStyle.lineHeight || b?.lineHeight || null,
        bold:       rawStyle.bold       || b?.bold       || null,
      };
        return {
          idx,
          type: String(b?.type || 'line'),
          role: String(b?.role || 'body'),
          text: String(b?.text || '').trim(),
        x,
        y,
        right,
        bottom,
        bbox: [x, y, right, bottom],
        style,
          runs: Array.isArray(b?.runs) ? b.runs : [],
        table: b?.table || null,
        tableKey: b?.type === 'tableCell'
          ? String(b?.table?.tableId || b?.table?.id || b?.table?.tableIndex || 'table')
          : null,
        };
      })
      .filter((b) => b.text && b.role !== 'pageHeader' && b.role !== 'pageFooter')
      .sort((a, b) => (a.y - b.y) || (a.x - b.x) || (a.idx - b.idx));

  // 1.5) Remove duplicates (Azure sometimes provides both paragraph + line blocks)
  const hasParagraphBlocks = normalized.some((b) => b.type === 'paragraph');

  // Group table cells into table bounding boxes so we can drop duplicate text blocks inside tables.
  const tableBoxes = (() => {
    const map = new Map(); // tableKey -> bbox
    for (const b of normalized) {
      if (b.type !== 'tableCell') continue;
      const key = b.tableKey || 'table';
      const prev = map.get(key);
      const bb = b.bbox || [b.x, b.y, b.right, b.bottom];
      if (!prev) {
        map.set(key, bb.slice());
      } else {
        prev[0] = Math.min(prev[0], bb[0]);
        prev[1] = Math.min(prev[1], bb[1]);
        prev[2] = Math.max(prev[2], bb[2]);
        prev[3] = Math.max(prev[3], bb[3]);
      }
    }
    return Array.from(map.values());
  })();

  const isInsideAnyTable = (b) => {
    if (!tableBoxes.length) return false;
    const bb = b.bbox || [b.x, b.y, b.right, b.bottom];
    const safe = [
      bb[0],
      bb[1],
      bb[2],
      Math.max(bb[3] || 0, bb[1] + Math.max(10, Number(b?.style?.fontSize || 12))),
    ];
    return tableBoxes.some((tb) => bboxOverlapRatio(safe, tb) > 0.25);
  };

  const filtered = normalized
    .filter((b) => {
      if (b.type === 'tableCell') return true;
      // If paragraph blocks exist, prefer them and drop raw line blocks to avoid duplication.
      if (hasParagraphBlocks && b.type !== 'paragraph') return false;
      // Drop any text blocks that are inside table bounds (table content is rendered via cells).
      if (isInsideAnyTable(b)) return false;
      return true;
    })
    .filter((b) => b.text && b.text.trim().length > 0);

  const deduped = [];
  const seen = new Set();
  for (const b of filtered) {
    const bb = b.bbox || [b.x, b.y, b.right, b.bottom];
    const key = `${b.type}|${b.role}|${Math.round(bb[0])}|${Math.round(bb[1])}|${Math.round(bb[2])}|${Math.round(bb[3])}|${b.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(b);
  }
  deduped.sort((a, b) => (a.y - b.y) || (a.x - b.x) || (a.idx - b.idx));

  // 2) Decide processing path:
  //    - If blocks already come as 'paragraph' type (Azure DI path), they are
  //      pre-grouped — just fix same-line fragments within table cells.
  //    - If blocks are raw 'line' type (documentGraph / prebuilt-read lines),
  //      group them into logical paragraphs first.
  let grouped;
  if (hasParagraphBlocks) {
    // Azure paragraph path: blocks already logically grouped — no additional merging needed
    grouped = deduped;
  } else {
    // Line path: merge same-line OCR fragments, then group into paragraphs
    const sameLine = mergeSameLineFragments(deduped);
    grouped = groupLinesIntoParagraphs(sameLine, width);
  }

  // 3) Merge split list markers
  const rows = normalizeSplitListRows(grouped);

  // 4) Compute page-level font stats for relative heading detection
  const fontStats = computePageFontStats(rows);

  // 4.5) Estimate the left margin (so we don't double-indent: the editor canvas
  // already applies page padding for margins).
  const marginX = (() => {
    const xs = rows
      .filter((r) => r.type !== 'tableCell' && !isSeparatorText(r.text))
      .filter((r) => {
        const role = String(r.role || '').toLowerCase();
        if (role === 'title' || role.includes('heading')) return false;
        const listMarker = parseListMarker(r.text) || (/list/i.test(String(r.type || '')) ? { kind: 'ul' } : null);
        if (listMarker) return false;
        const x = Number(r.x || 0);
        return Number.isFinite(x) && x > 0 && x < width;
      })
      .map((r) => Number(r.x || 0))
      .sort((a, b) => a - b);
    if (!xs.length) return 0;
    return xs[Math.floor(xs.length * 0.1)];
  })();

  const parts = [];
  // olCounter tracks the running ordered-list item number so that if a list is
  // interrupted by a continuation line and reopened, we resume with the correct
  // start= value instead of resetting to 1.
  const listState = { currentListTag: null, indentLevel: 0, olCounter: 1 };
  let prevY = null;
  let i = 0;

  while (i < rows.length) {
    const row = rows[i];

    // ── Separator ──
      if (isSeparatorText(row.text)) {
        parts.push(closeListTag(listState));
      parts.push('<hr style="border:none;border-top:2px solid #222;margin:10px 0;" />');
      prevY = Number(row.y || 0);
      i += 1;
        continue;
      }

    // ── Table ──
    if (row.type === 'tableCell') {
      parts.push(closeListTag(listState));
      const tKey = row.tableKey || 'table';
      const chunk = [];
      let j = i;
      while (j < rows.length && rows[j].type === 'tableCell' && (rows[j].tableKey || 'table') === tKey) {
        chunk.push(rows[j]);
        j += 1;
      }
      parts.push(buildTableHtml(chunk));
      prevY = Number(rows[j - 1]?.y || row.y || 0);
      i = j;
      continue;
    }

    // ── Detect list ──
    const isListType = /list/i.test(row.type);
    const listMarker = parseListMarker(row.text) || (isListType ? { kind: 'ul', content: row.text } : null);
    const textForRender = listMarker ? listMarker.content : row.text;

    // ── Inline runs ──
    const bodyRuns = listMarker
      ? [{ text: textForRender, style: row.style }]
      : (row.runs.length > 0 ? row.runs : [{ text: textForRender, style: row.style }]);

    const isBold = detectBoldFromStyle(row.style) || bodyRuns.some((r) => detectBoldFromStyle(r?.style || {}));
    const isItalic = detectItalicFromStyle(row.style) || bodyRuns.some((r) => detectItalicFromStyle(r?.style || {}));
    const isUnderline = detectUnderlineFromStyle(row.style) || bodyRuns.some((r) => detectUnderlineFromStyle(r?.style || {}));

    const inlineHtml = bodyRuns.map((run) => {
      const s = run?.style || {};
      const runBold = isBold || detectBoldFromStyle(s);
      const runItalic = isItalic || detectItalicFromStyle(s);
      const runUnderline = isUnderline || detectUnderlineFromStyle(s);
      const css = runStyleToCss({ ...row.style, ...s, bold: runBold, italic: runItalic, underline: runUnderline });
      let out = css ? `<span style="${css}">${escHtml(String(run?.text || ''))}</span>` : escHtml(String(run?.text || ''));
      if (runUnderline) out = `<u>${out}</u>`;
      if (runItalic) out = `<em>${out}</em>`;
      if (runBold) out = `<strong>${out}</strong>`;
      return out;
    }).join('');

    // ── Layout properties ──
    const rawAlign = row.style?.align || inferAlign(row.x, row.right, width);
    // fontSize: prefer style.fontSize, fall back to page median
    const rawFontSize = Number(row.style?.fontSize || fontStats.median || 12);
    const fontSizePtRaw = widthLooksLikePdfPoints ? rawFontSize : (pxToPt(rawFontSize) || rawFontSize);
    const fontSize = clampPt(fontSizePtRaw, 8, 36);
    const fontWeight = isBold ? 700 : 400;
    const fontFamily = row.style?.fontFamily
      ? `font-family:'${String(row.style.fontFamily).replace(/['"]/g, '')}';`
      : '';
    const rawLH = Number(row.style?.lineHeight || 0);
    const lineHeight = rawLH > 1 && rawLH < 4
      ? rawLH
      : (rawLH >= 8 ? Math.max(1.1, Math.min(2.0, rawLH / Math.max(8, rawFontSize))) : 1.4);

    // ── Indent: map X to em (relative to estimated margin) ──
    const indentUnits = Math.max(0, Number(row.x || 0) - marginX);
    const indentEm = Math.max(0, Math.min(8, Math.round((indentUnits / Math.max(8, rawFontSize)) * 10) / 10));

    // ── Vertical spacing from Y-gap ──
    const yGap = prevY == null ? 0 : Math.max(0, Number(row.y || 0) - Number(prevY || 0));
    const paraBreak = yGap > rawFontSize * 1.8;
    const sectionBreak = yGap > rawFontSize * 4;
    prevY = Number(row.y || 0);

    // ── Heading detection ──
    const role = String(row.role || '').toLowerCase();
    // Azure DI already classified title/heading roles — trust them directly
    let headingTag;
    if (role === 'title') {
      headingTag = 'h1';
    } else if (role === 'heading' || role === 'sectionheading') {
      headingTag = 'h2';
    } else {
      headingTag = resolveHeadingTagRobust({ role, fontWeight, fontSize, text: row.text, align: rawAlign, fontStats });
    }

    // ── Alignment: body paragraphs → justify if not centered/right ──
    const effectiveAlign = headingTag
      ? rawAlign
      : (rawAlign === 'left' && textForRender.length > 60 && !listMarker ? 'justify' : rawAlign);

    // ── List rendering ──
      if (listMarker) {
      // Extract numeric index from the marker text (e.g. "3." → 3)
      const markerNum = listMarker.kind === 'ol'
        ? (Number(String(listMarker.text || '').replace(/\D/g, '') || 0) || listState.olCounter)
        : null;

      // Close and reopen only when switching list type or if the list was closed
      // by an intervening non-list block (closeListTag set currentListTag=null).
      if (!listState.currentListTag || listState.currentListTag !== listMarker.kind) {
          parts.push(closeListTag(listState));
          listState.currentListTag = listMarker.kind;
        const listStyle = listMarker.kind === 'ol'
          ? 'list-style-type:decimal;'
          : 'list-style-type:disc;';
        // If OL: use start= to continue the counter from where we left off
        const startAttr = listMarker.kind === 'ol' && markerNum > 1 ? ` start="${markerNum}"` : '';
        parts.push(
          `<${listMarker.kind}${startAttr} style="${listStyle}padding-left:${Math.max(1.5, indentEm + 1.5)}em;margin:${paraBreak ? 8 : 2}px 0 4px 0;">`
        );
      }

      if (markerNum !== null) listState.olCounter = markerNum + 1;

        parts.push(
        `<li style="font-size:${fontSize}pt;font-weight:${fontWeight};` +
        `font-style:${isItalic ? 'italic' : 'normal'};` +
        `text-decoration:${isUnderline ? 'underline' : 'none'};` +
        `line-height:${lineHeight};${fontFamily}margin-bottom:2px;">${inlineHtml}</li>`
        );
      } else {
      // ── Close any open list ──
        parts.push(closeListTag(listState));
      const tag = headingTag || 'p';
      // sectionBreak → large gap; paraBreak (new paragraph) → moderate gap for headings,
      // small gap for body text; same-paragraph continuation → zero margin so lines
      // rendered as individual OCR blocks don't show as double-spaced.
      const topMargin = sectionBreak
        ? 16
        : (paraBreak
            ? (headingTag ? 10 : 4)
            : (headingTag ? 6 : 0));
      const bottomMargin = headingTag ? 4 : 1;

      let styleAttr =
        `text-align:${effectiveAlign};` +
        `margin:${topMargin}px 0 ${bottomMargin}px 0;` +
        `font-size:${fontSize}pt;` +
        `font-weight:${fontWeight};` +
        `font-style:${isItalic ? 'italic' : 'normal'};` +
        `text-decoration:${isUnderline ? 'underline' : 'none'};` +
        `line-height:${lineHeight};` +
        fontFamily;

      // Indent only for non-headings and non-centered
      if (!headingTag && effectiveAlign === 'left' && indentEm > 0.5) {
        styleAttr += `padding-left:${indentEm}em;`;
      }

      parts.push(`<${tag} style="${styleAttr}">${inlineHtml}</${tag}>`);
    }
    i += 1;
  }

  parts.push(closeListTag(listState));
  return parts.join('\n');
};

const documentGraphToEditableHtml = (documentGraph) => {
  if (!documentGraph || !Array.isArray(documentGraph.pages) || documentGraph.pages.length === 0) return '';
  const allParts = [];
  for (let pIdx = 0; pIdx < documentGraph.pages.length; pIdx += 1) {
    const page = documentGraph.pages[pIdx];
    const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
    const pageWidth = Number(page?.width || 600);
    const pageHtml = blocksToEditableHtml(blocks, pageWidth);
    if (pageHtml.trim()) {
      allParts.push(pageHtml);
      if (pIdx < documentGraph.pages.length - 1) {
        allParts.push('<div data-type="page-break"></div>');
      }
    }
  }
  return allParts.join('\n');
};

const layoutModelToEditableHtml = (layoutModel) => {
  if (!layoutModel || !Array.isArray(layoutModel.pages) || layoutModel.pages.length === 0) return '';
  const allParts = [];
  for (let pIdx = 0; pIdx < layoutModel.pages.length; pIdx += 1) {
    const page = layoutModel.pages[pIdx];
    const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
    const pageWidth = Number(page?.width || 600);
    const pageHtml = blocksToEditableHtml(blocks, pageWidth);
    if (pageHtml.trim()) {
      allParts.push(pageHtml);
      if (pIdx < layoutModel.pages.length - 1) {
        allParts.push('<div data-type="page-break"></div>');
      }
    }
  }
  return allParts.join('\n');
};

// Cache PDF document loading so multi-page previews don't refetch the same file
// on every page component mount.
const pdfDocByUrlPromiseCache = new Map();
const pdfDocByFileIdPromiseCache = new Map();

const getCachedPdfDocument = async ({ pdfUrl, fileId }) => {
  if (pdfUrl) {
    if (!pdfDocByUrlPromiseCache.has(pdfUrl)) {
      const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
      pdfDocByUrlPromiseCache.set(pdfUrl, loadingTask.promise);
    }
    try {
      return await pdfDocByUrlPromiseCache.get(pdfUrl);
    } catch (e) {
      pdfDocByUrlPromiseCache.delete(pdfUrl);
      throw e;
    }
  }
  if (fileId) {
    if (!pdfDocByFileIdPromiseCache.has(fileId)) {
      pdfDocByFileIdPromiseCache.set(fileId, (async () => {
        const blob = await fileService.downloadFile(fileId, 'pdf');
        const arr = await blob.arrayBuffer();
        const dataTask = pdfjsLib.getDocument({ data: new Uint8Array(arr) });
        return dataTask.promise;
      })());
    }
    try {
      return await pdfDocByFileIdPromiseCache.get(fileId);
    } catch (e) {
      pdfDocByFileIdPromiseCache.delete(fileId);
      throw e;
    }
  }
  throw new Error('No pdfUrl/fileId provided');
};

const PdfPageCanvas = ({ pdfUrl, pageNumber, targetWidthPx, fileId }) => {
  const canvasRef = useRef(null);
  const [renderErr, setRenderErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        console.log('[PDF-CANVAS]', 'render-start', {
          pdfUrl,
          pageNumber,
          targetWidthPx,
        });
        setRenderErr('');
        if (!pdfUrl) {
          console.log('[PDF-CANVAS]', 'render-skip-no-url', {
            pageNumber,
            targetWidthPx,
          });
          return;
        }
        let pdf = null;
        try {
          pdf = await getCachedPdfDocument({ pdfUrl, fileId: null });
        } catch (urlErr) {
          const canFallbackToApi = !!fileId;
          const isLikely404 = /404|not found|MissingPDF|ResponseException/i.test(String(urlErr?.message || ''));
          console.warn('[PDF-CANVAS]', 'url-load-failed', {
            fileId,
            pageNumber,
            pdfUrl,
            message: urlErr?.message || String(urlErr),
            canFallbackToApi,
            isLikely404,
          });
          if (!canFallbackToApi) throw urlErr;
          pdf = await getCachedPdfDocument({ pdfUrl: null, fileId });
          console.log('[PDF-CANVAS]', 'api-download-fallback-success', {
            fileId,
            pageNumber,
            bytes: 'cached',
          });
        }
        const page = await pdf.getPage(pageNumber);
        const viewport1 = page.getViewport({ scale: 1 });
        const scale = targetWidthPx && viewport1?.width
          ? (Number(targetWidthPx) / Number(viewport1.width))
          : 1;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const context = canvas.getContext('2d', { alpha: false });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        const renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
        if (!cancelled) {
          console.log('[PDF-CANVAS]', 'render-success', {
            pdfUrl,
            pageNumber,
            width: Math.floor(viewport.width),
            height: Math.floor(viewport.height),
            scale,
          });
        }
      } catch (e) {
        console.error('[PDF-CANVAS]', 'render-error', {
          name: e?.name || null,
          message: e?.message || String(e),
          stackTop: e?.stack ? String(e.stack).split('\n').slice(0, 2).join(' | ') : null,
          pdfUrl,
          pageNumber,
        });
        if (!cancelled) setRenderErr(e?.message || 'PDF render failed');
      }
    };
    run();
    return () => { cancelled = true; };
  }, [pdfUrl, pageNumber, targetWidthPx, fileId]);

  return (
    <Box position="absolute" inset={0}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {renderErr ? (
        <Box position="absolute" inset={0} bg="orange.50" border="1px solid" borderColor="orange.200" p={2}>
          <Text fontSize="xs" color="orange.700" fontWeight="600">PDF preview fallback mode</Text>
          <Text fontSize="xs" color="orange.700">
            PDF.js could not parse this file in browser. You can still edit blocks; export stamping will use backend source PDF.
          </Text>
          <Text fontSize="xs" color="orange.700">Error: {renderErr}</Text>
        </Box>
      ) : null}
    </Box>
  );
};


const FullPageEditor = ({
  isOpen,
  onClose,
  session,
  onSessionUpdate,
  selectedFile,
  scanStatus,
  formatMetadata,
  scanResults,
  smartSuggestions: initialSuggestions,
  htmlContent: initialHtml,
  language = 'en',
  ocrConfidence = null,

  scanData = null,
}) => {

  const aiHelperRef = useRef(null);

  const [leftTabIndex, setLeftTabIndex] = useState(0);


  const handleFollowUp = useCallback((caseData) => {
    const ctx = `Case: ${caseData.caseName || ''} — ${caseData.citation || ''}\n` +
      (caseData.relevance ? `Relevance: ${caseData.relevance}\n` : '') +
      (caseData.summary ? `Summary: ${caseData.summary}` : '');
    aiHelperRef.current?.addContext?.(ctx);
    setLeftTabIndex(1);
  }, []);


  const [suggestions, setSuggestions] = useState(initialSuggestions || []);
  const [editInstruction, setEditInstruction] = useState('');
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changeHistory, setChangeHistory] = useState([]);
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState(null);
  const [isDesignSuggestionOpen, setIsDesignSuggestionOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [dualViewMode, setDualViewMode] = useState(false);

  const enterDualView = useCallback(() => {
    setDualViewMode(true);
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
  }, []);

  const exitDualView = useCallback(() => {
    setDualViewMode(false);
  }, []);

  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
  const leftDragRef = useRef(null);
  const rightDragRef = useRef(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const [selectedText, setSelectedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOnlyOfficeSyncing, setIsOnlyOfficeSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [editorViewMode, setEditorViewMode] = useState('editable');
  const [onlyOfficeRefreshKey, setOnlyOfficeRefreshKey] = useState(0);
  const [docxStatus, setDocxStatus] = useState(scanData?.docxStatus || session?.docxStatus || 'none');
  const [docxError, setDocxError] = useState('');
  const [docxHtmlState, setDocxHtmlState] = useState(scanData?.docxHtml || session?.docxHtml || '');
  const [docxFileUrlState, setDocxFileUrlState] = useState(scanData?.docxFileUrl || session?.docxFileUrl || '');
  const [devRawDocxPreview, setDevRawDocxPreview] = useState(true);
  const docxFileUrl = docxFileUrlState || scanData?.docxFileUrl || session?.docxFileUrl || '';
  const isDevBuild = !!import.meta?.env?.DEV;
  const EDITABLE_ONLY_MODE = true;
  const showEditablePdfPreview = false;
  const [fidelityEdits, setFidelityEdits] = useState({});
  const [fidelityOffsets, setFidelityOffsets] = useState({});
  const [pdfTextLayersByPage, setPdfTextLayersByPage] = useState({});
  const [fidelityFontsMeta, setFidelityFontsMeta] = useState([]);
  const [fidelityObjectsByPage, setFidelityObjectsByPage] = useState({});
  const [fidelityObjectEdits, setFidelityObjectEdits] = useState({});
  const [selectedFidelityObject, setSelectedFidelityObject] = useState(null);
  const [fidelityObjectsVisible, setFidelityObjectsVisible] = useState(true);
  const [fidelitySnapEnabled, setFidelitySnapEnabled] = useState(true);
  const [fidelityGridSnapEnabled, setFidelityGridSnapEnabled] = useState(false);
  const [fidelityGridSize, setFidelityGridSize] = useState(5);
  const [fidelityDebug, setFidelityDebug] = useState(false);
  const [fidelityZoom, setFidelityZoom] = useState(1);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [fidelitySnapGuides, setFidelitySnapGuides] = useState({ x: null, y: null, page: null });
  const [isFidelityApplying, setIsFidelityApplying] = useState(false);
  const [appliedFidelityPdfUrl, setAppliedFidelityPdfUrl] = useState(null);
  // "Select All" mode: all text blocks show their outlines simultaneously (like ilovepdf)
  const [fidelitySelectAll, setFidelitySelectAll] = useState(false);
  const [selectedFidelityBlock, setSelectedFidelityBlock] = useState(null);
  const [selectedFidelityBlockIds, setSelectedFidelityBlockIds] = useState([]);
  const fidelityAutosaveTimerRef = useRef(null);
  const fidelityUndoStackRef = useRef([]);
  const fidelityRedoStackRef = useRef([]);
  const [, setFidelityHistoryTick] = useState(0);
  const fidelityDragRef = useRef(null);
  const pdfTextLayersByPageRef = useRef({});
  const loadedFontIdsRef = useRef(new Set());
  const fidelityObjectDragRef = useRef(null);

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const autosaveTimerRef = useRef(null);
  const overviewDebounceRef = useRef(null);
  const appliedSuggestionsRef = useRef(new Set());
  const lastScanKeyRef = useRef(null); // tracks last scan identity to avoid re-sync on parent re-renders

  // Local mutable copies of scan arrays — updated when fixes are applied or doc is manually edited
  const [localScanArrays, setLocalScanArrays] = useState(() => ({
    complianceIssues: scanData?.complianceIssues || [],
    clauseFlaws: scanData?.clauseFlaws || [],
    missingClauses: scanData?.missingClauses || [],
    chronologicalIssues: scanData?.chronologicalIssues || [],
    outdatedReferences: scanData?.outdatedReferences || [],
    internalContradictions: scanData?.internalContradictions || [],
    precedenceAnalysis: scanData?.precedenceAnalysis || [],
  }));


  const bgColor = useColorModeValue('white', 'gray.900');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { chakraTheme: appTheme } = useAppTheme();
  const editorCanvasBg = appTheme?.config?.initialColorMode === 'dark' ? '#1a1a1a' : '#ffffff';
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const pageShadow = 'none';

  const HIGHLIGHT_ADD = '#d1fae5';
  const HIGHLIGHT_REM = '#fee2e2';
  const FIDELITY_LOCKED = false;


  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDraggingLeft.current) {
        const delta = e.clientX - dragStartX.current;
        const newW = Math.min(520, Math.max(200, dragStartWidth.current + delta));
        setLeftSidebarWidth(newW);
      }
      if (isDraggingRight.current) {
        const delta = dragStartX.current - e.clientX;
        const newW = Math.min(520, Math.max(200, dragStartWidth.current + delta));
        setRightSidebarWidth(newW);
      }
    };
    const onMouseUp = () => {
      isDraggingLeft.current = false;
      isDraggingRight.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const textToHtml = useCallback((text = '') => {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const blocks = escaped.split(/\n{2,}/).filter((block) => block.trim().length > 0);
    if (blocks.length === 0) return '<p></p>';
    return blocks
      .map((block) => `<p>${block.split('\n').join('<br>')}</p>`)
      .join('');
  }, []);

  const sanitizeDocxHtmlForEditor = useCallback((html = '') => {
    const raw = String(html || '');
    if (!raw.trim()) return raw;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'text/html');
      const all = Array.from(doc.body.querySelectorAll('*'));
      all.forEach((el) => {
        const style = String(el.getAttribute('style') || '');
        if (!style) return;
        const cleaned = style
          // Prevent text-box anchored fragments from stacking at page top.
          .replace(/position\s*:\s*(absolute|fixed)\s*;?/gi, '')
          .replace(/z-index\s*:\s*[^;]+;?/gi, '')
          .replace(/left\s*:\s*[^;]+;?/gi, '')
          .replace(/top\s*:\s*[^;]+;?/gi, '')
          .replace(/right\s*:\s*[^;]+;?/gi, '')
          .replace(/bottom\s*:\s*[^;]+;?/gi, '')
          .replace(/transform\s*:\s*[^;]+;?/gi, '')
          // Negative margins are a common overlap trigger in imported html.
          .replace(/margin-top\s*:\s*-\s*[^;]+;?/gi, '')
          .replace(/margin\s*:\s*-\s*[^;]+;?/gi, '');
        const normalized = cleaned.replace(/\s{2,}/g, ' ').trim();
        if (normalized) el.setAttribute('style', normalized);
        else el.removeAttribute('style');
      });
      return doc.body.innerHTML || raw;
    } catch (_) {
      return raw;
    }
  }, []);

  const getInitialContent = useCallback(() => {
    const isPdfFile = String(selectedFile?.fileType || session?.fileType || '').toLowerCase().includes('pdf')
      || String(selectedFile?.fileName || session?.fileName || '').toLowerCase().endsWith('.pdf');
    // PDF editable path is always DOCX-first (no fallback reconstruction).
    const rawDocxMode = isPdfFile ? true : (isDevBuild ? devRawDocxPreview : true);
    const effectiveDocxHtml = docxHtmlState || scanData?.docxHtml || session?.docxHtml || '';
    const effectiveDocxFileUrl = docxFileUrlState || scanData?.docxFileUrl || session?.docxFileUrl || '';

    // ── Priority 0: DOCX→HTML (best editable fidelity) ───────────────────────
    const dHtml = effectiveDocxHtml;
    const hasReadyDocxPayload = String(dHtml || '').trim().length > 100 && String(effectiveDocxFileUrl || '').trim().length > 0;
    if (rawDocxMode && hasReadyDocxPayload) {
      const safeDocxHtml = sanitizeDocxHtmlForEditor(dHtml);
      console.log('[DOCX-TEST][Editable-Source] using docxHtml', {
        isPdfFile,
        length: dHtml.length,
        rawDocxMode,
        hasReadyDocxPayload,
        docxStatus,
      });
      return safeDocxHtml;
    }

    // In PDF mode, never fallback to reconstruction/htmlContent when DOCX isn't truly ready.
    // This avoids the "looks good then degrades after 1-2s" overwrite behavior.
    if (isPdfFile && rawDocxMode) {
      console.warn('[DOCX-TEST][Editable-Source] blocking non-DOCX fallback for PDF while DOCX payload is not ready', {
        docxStatus,
        hasDocxHtml: String(dHtml || '').trim().length > 100,
        hasDocxFileUrl: String(effectiveDocxFileUrl || '').trim().length > 0,
      });
      return '<p>Preparing high-fidelity DOCX view... Please wait or click "Convert now".</p>';
    }

    // ── Priority 1: Layout-model reconstruction (fallback only) ───────────────
    // For the editable window we prioritize a clean reconstruction from the
    // layout model (with page breaks + table de-duplication) so it visually
    // mimics the PDF instead of looking like plain text.
    const graph = session?.documentGraph || scanData?.documentGraph || null;
    const layoutFromGraph = documentGraphToLayoutModel(graph);
    const sessionLayout = session?.layoutModel || null;
    const scanLayout = scanData?.layoutModel || null;
    const layoutCandidates = [sessionLayout, scanLayout, layoutFromGraph].filter(Boolean);
    const azureLayout = layoutCandidates.find((l) => isAzureLayoutModel(l)) || null;
    const layout = azureLayout || layoutCandidates[0] || null;
    const layoutHtml = layoutModelToEditableHtml(layout);
    if (layoutHtml && layoutHtml.trim()) {
      console.log('[DOCX-TEST][Editable-Source] using layoutHtml fallback', { isPdfFile, length: layoutHtml.length });
      return layoutHtml;
    }

    // ── Priority 3: Document graph reconstruction ────────────────────────────
    const graphHtml = documentGraphToEditableHtml(graph);
    if (graphHtml && graphHtml.trim()) {
      console.log('[DOCX-TEST][Editable-Source] using documentGraph fallback', { isPdfFile, length: graphHtml.length });
      return graphHtml;
    }

    // ── Priority 4: Raw htmlContent from session ──────────────────────────────
    const htmlCandidate = (initialHtml && initialHtml.trim()) ? initialHtml : (session?.htmlContent || '');
    if (htmlCandidate && htmlCandidate.trim()) {
      console.log('[DOCX-TEST][Editable-Source] using htmlContent fallback', { isPdfFile, length: htmlCandidate.length });
      return htmlCandidate;
    }

    // ── Priority 5: Plain text fallback ──────────────────────────────────────
    const text = session?.currentText || session?.originalText || '';
    if (!text) return '<p></p>';
    console.log('[DOCX-TEST][Editable-Source] using plainText fallback', { isPdfFile, textLength: text.length });
    return textToHtml(text);
  }, [initialHtml, selectedFile?.fileType, selectedFile?.fileName, session, scanData?.layoutModel, scanData?.documentGraph, scanData?.docxHtml, session?.docxHtml, scanData?.docxFileUrl, session?.docxFileUrl, textToHtml, devRawDocxPreview, isDevBuild, docxStatus, docxHtmlState, docxFileUrlState, sanitizeDocxHtmlForEditor]);

  useEffect(() => {
    if (!isDevBuild) return;
    console.clear();
    console.log('[DOCX-TEST] Editor mount: console cleared for fresh test run');
  }, [isDevBuild, selectedFile?._id, session?.fileId]);

  useEffect(() => {
    pdfTextLayersByPageRef.current = pdfTextLayersByPage;
  }, [pdfTextLayersByPage]);

  useEffect(() => {
    if (FIDELITY_LOCKED && editorViewMode === 'fidelity') {
      setEditorViewMode('editable');
    }
  }, [editorViewMode, FIDELITY_LOCKED]);

  useEffect(() => {
    if (!EDITABLE_ONLY_MODE) return;
    if (editorViewMode !== 'editable') setEditorViewMode('editable');
  }, [editorViewMode, EDITABLE_ONLY_MODE]);

  useEffect(() => {
    setDocxStatus(scanData?.docxStatus || session?.docxStatus || 'none');
    setDocxError(scanData?.docxError || session?.docxError || '');
    setDocxHtmlState(scanData?.docxHtml || session?.docxHtml || '');
    setDocxFileUrlState(scanData?.docxFileUrl || session?.docxFileUrl || '');
  }, [scanData?.docxStatus, session?.docxStatus, scanData?.docxError, session?.docxError, scanData?.docxHtml, session?.docxHtml, scanData?.docxFileUrl, session?.docxFileUrl]);

  useEffect(() => {
    if (!selectedFile?._id && !session?.fileId) return;
    console.log('[DOCX-TEST][Pipeline-State]', {
      fileId: selectedFile?._id || session?.fileId,
      docxStatus,
      hasDocxHtml: !!(docxHtmlState || scanData?.docxHtml || session?.docxHtml),
      docxFileUrl: docxFileUrlState || scanData?.docxFileUrl || session?.docxFileUrl || '',
      docxHtmlLength: String(docxHtmlState || scanData?.docxHtml || session?.docxHtml || '').length,
    });
  }, [docxStatus, selectedFile?._id, session?.fileId, scanData?.docxHtml, session?.docxHtml, scanData?.docxFileUrl, session?.docxFileUrl, docxHtmlState, docxFileUrlState]);

  useEffect(() => {
    if (editorViewMode !== 'editable') return;
    const fileId = selectedFile?._id || session?.fileId || null;
    if (!fileId) return;
    let cancelled = false;
    const run = async () => {
      try {
        const st = await fileService.getDocxStatus(fileId);
        if (cancelled) return;
        if (st?.docxError) {
          console.warn('[DOCX-TEST][Status] fallback', { fileId, error: st.docxError });
        }
        if (st?.docxStatus) setDocxStatus(st.docxStatus);
        if (st?.docxError != null) setDocxError(st.docxError || '');
        if (st?.docxHtml != null) setDocxHtmlState(st.docxHtml || '');
        if (st?.docxFileUrl != null) setDocxFileUrlState(st.docxFileUrl || '');
        // If DOCX is ready and editor is still using a non-docx source, allow rebuild
      } catch (_) {}
    };
    run();
    return () => { cancelled = true; };
  }, [editorViewMode, selectedFile?._id, session?.fileId]);

  useEffect(() => {
    const isPdfFile = String(selectedFile?.fileType || session?.fileType || '').toLowerCase().includes('pdf')
      || String(selectedFile?.fileName || session?.fileName || '').toLowerCase().endsWith('.pdf');
    if (!isPdfFile || editorViewMode !== 'editable') return;
    const fileId = selectedFile?._id || session?.fileId || null;
    if (!fileId) return;
    const hasReadyPayload = String(docxHtmlState || '').trim().length > 100 && String(docxFileUrlState || '').trim().length > 0;
    if (docxStatus === 'pending' || hasReadyPayload) return;
    let cancelled = false;
    (async () => {
      try {
        console.log('[DOCX-TEST][Auto-Convert] start', { fileId, docxStatus });
        setDocxStatus('pending');
        await fileService.convertPdfToDocx(fileId);
        const st = await fileService.getDocxStatus(fileId);
        if (cancelled) return;
        if (st?.docxStatus) setDocxStatus(st.docxStatus);
        if (st?.docxError != null) setDocxError(st.docxError || '');
        if (st?.docxHtml != null) setDocxHtmlState(st.docxHtml || '');
        if (st?.docxFileUrl != null) setDocxFileUrlState(st.docxFileUrl || '');
        console.log('[DOCX-TEST][Auto-Convert] finished', {
          fileId,
          status: st?.docxStatus || 'none',
          hasDocxHtml: !!String(st?.docxHtml || '').trim(),
          hasDocxFileUrl: !!String(st?.docxFileUrl || '').trim(),
        });
      } catch (e) {
        if (cancelled) return;
        setDocxStatus('failed');
        setDocxError(e?.message || 'Auto DOCX conversion failed');
        console.warn('[DOCX-TEST][Auto-Convert] failed', { fileId, error: e?.message || String(e) });
      }
    })();
    return () => { cancelled = true; };
  }, [selectedFile?.fileType, selectedFile?.fileName, session?.fileType, session?.fileName, editorViewMode, selectedFile?._id, session?.fileId, docxStatus, docxHtmlState, docxFileUrlState]);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: { depth: 100 },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      LegalParagraphStyle,
      FontFamily,
      FontSize,
      TextStyle.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: 'Start typing your document...',
      }),
      PageBreakExtension,
      Superscript,
      Subscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: getInitialContent(),
    onUpdate: ({ editor: ed }) => {
      // Ignore programmatic/hydration updates; only autosave user-driven edits.
      if (!ed?.isFocused) return;
      setHasUnsavedChanges(true);
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        handleAutosave(ed);
      }, 3000);
      // Verify remaining issues against actual document text after 10s of inactivity
      if (overviewDebounceRef.current) clearTimeout(overviewDebounceRef.current);
      overviewDebounceRef.current = setTimeout(() => {
        verifyIssuesInText(ed.getText());
      }, 10000);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection;
      if (from !== to) {
        setSelectedText(ed.state.doc.textBetween(from, to, ' '));
      } else {
        setSelectedText('');
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });


  useEffect(() => {
    if (!editor || !session) return;
    const isPdfFile = String(selectedFile?.fileType || session?.fileType || '').toLowerCase().includes('pdf')
      || String(selectedFile?.fileName || session?.fileName || '').toLowerCase().endsWith('.pdf');
    // For PDF->DOCX flow, avoid post-mount auto-rewrites that can degrade layout.
    // User can still manually refresh via "Rebuild" or the dev Raw DOCX toggle.
    if (isPdfFile) return;
    // Never clobber user edits.
    if (hasUnsavedChanges) return;
    if (editor.isFocused) return;
      const content = getInitialContent();
    if (!content) return;
    const normalize = (h) => String(h || '').replace(/\s+/g, ' ').trim();
    if (normalize(editor.getHTML()) !== normalize(content)) {
      console.log('[DOCX-TEST][Editor-Apply] applying getInitialContent via sync effect', {
        contentLength: String(content || '').length,
      });
        editor.commands.setContent(content);
      }
  }, [editor, session, getInitialContent, hasUnsavedChanges, selectedFile?.fileType, selectedFile?.fileName]);

  useEffect(() => {
    if (!isDevBuild) return;
    if (editorViewMode !== 'editable') return;
    if (!editor) return;
    if (hasUnsavedChanges) return;
    const content = getInitialContent();
    if (content) editor.commands.setContent(content);
  }, [devRawDocxPreview, isDevBuild, editorViewMode, editor, hasUnsavedChanges, getInitialContent]);


  // Re-sync localScanArrays ONLY when a genuinely new scan completes.
  // Use a stable key so parent re-renders with same data don't overwrite manual removals.
  useEffect(() => {
    if (!scanData) return;
    const scanKey = [
      scanData.sessionId || '',
      (scanData.complianceIssues || []).length,
      (scanData.clauseFlaws || []).length,
      (scanData.missingClauses || []).length,
      (scanData.precedenceAnalysis || []).length,
      (scanData.internalContradictions || []).length,
    ].join('|');
    if (lastScanKeyRef.current === scanKey) return; // same scan — preserve applied/manual changes
    lastScanKeyRef.current = scanKey;
    setLocalScanArrays({
      complianceIssues: scanData.complianceIssues || [],
      clauseFlaws: scanData.clauseFlaws || [],
      missingClauses: scanData.missingClauses || [],
      chronologicalIssues: scanData.chronologicalIssues || [],
      outdatedReferences: scanData.outdatedReferences || [],
      internalContradictions: scanData.internalContradictions || [],
      precedenceAnalysis: scanData.precedenceAnalysis || [],
    });
  }, [scanData]);

  useEffect(() => {
    if (initialSuggestions) setSuggestions(initialSuggestions);
  }, [initialSuggestions]);

  // Fast text-based verification — checks if known issues still exist in document text
  // Called after manual edits settle (10s debounce), no LLM needed
  const verifyIssuesInText = useCallback((docText) => {
    if (!docText || docText.trim().length < 30) return;
    const lower = docText.toLowerCase();
    setLocalScanArrays(prev => ({
      ...prev,
      // Clause flaws: if originalText excerpt is no longer in document, the flaw is resolved
      clauseFlaws: prev.clauseFlaws.filter(f => {
        if (!f.originalText || f.originalText.trim().length < 10) return true;
        return lower.includes(f.originalText.toLowerCase().trim().substring(0, 60));
      }),
      // Outdated references: if the old act name is no longer mentioned, reference is resolved
      outdatedReferences: prev.outdatedReferences.filter(o => {
        if (!o.reference) return true;
        const keyword = o.reference.replace(/\(.*?\)/g, '').trim().toLowerCase().substring(0, 30);
        return keyword.length > 4 && lower.includes(keyword);
      }),
      // Missing clauses: if at least one keyword from clauseType now appears, it's been added
      missingClauses: prev.missingClauses.filter(m => {
        if (!m.clauseType) return true;
        const words = m.clauseType.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        return words.length === 0 || !words.some(w => lower.includes(w));
      }),
    }));
  }, []);


  // formatMetadata styling is applied via pageStyle in the sx prop below — no useEffect needed


  const handleRevertChange = useCallback((changeIdx) => {
    if (!editor) return;
    const change = changeHistory[changeIdx];
    if (!change || !change.originalText || !change.suggestedText || change.reverted) return;

    const content = editor.getHTML();

    const highlightedPattern = `<mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${change.suggestedText}</mark>`;
    let reverted = false;

    if (content.includes(highlightedPattern)) {
      editor.commands.setContent(content.replace(highlightedPattern, change.originalText));
      reverted = true;
    } else if (content.includes(change.suggestedText)) {
      editor.commands.setContent(content.replace(change.suggestedText, change.originalText));
      reverted = true;
    }

    if (reverted) {
      setChangeHistory(prev => prev.map((c, i) => i === changeIdx ? { ...c, reverted: true } : c));
      toast({ title: 'Change reverted', status: 'info', duration: 1500 });
    } else {
      toast({ title: 'Could not revert', description: 'The text may have been modified since.', status: 'warning', duration: 3000 });
    }
  }, [editor, changeHistory, toast]);


  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);


  useEffect(() => {
    if (session?.changes) setChangeHistory(session.changes);
  }, [session]);


  const pageLineYs = useAutoPageBreak(editor, false, 1122);


  const handleAutosave = async (ed) => {
    if (!ed) return;
    try {
      setIsSaving(true);
      const html = ed.getHTML();
      const plainText = ed.getText();
      if (editorViewMode === 'fidelity') {
        await fileService.saveHtmlContent('', '', selectedFile?._id, {
          mode: 'fidelity',
          fidelityEdits,
          fidelityOffsets,
          fidelityObjectEdits,
        });
      } else {
        await fileService.saveHtmlContent(html, plainText, selectedFile?._id, { mode: 'editable' });
      }
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (err) {
      console.warn('Autosave failed:', err.message);
    } finally {
      setIsSaving(false);
    }
  };


  const handleSave = async () => {
    if (!editor) return;
    await handleAutosave(editor);
    toast({ title: 'Document saved', status: 'success', duration: 1500 });
  };

  const fidelityLayout = useMemo(() => {
    // ALWAYS prefer the Azure layoutModel — its bounding boxes are in the same
    // coordinate space as the pdf.js canvas (both derived from the PDF units).
    // documentGraph uses a different pixel scale and causes severe misalignment.
    const sessionLayout = session?.layoutModel || null;
    const scanLayout    = scanData?.layoutModel  || null;
    if (sessionLayout?.pages?.length) return sessionLayout;
    if (scanLayout?.pages?.length)    return scanLayout;
    // Only fall back to documentGraph conversion if no layoutModel exists at all
    const graph = session?.documentGraph || scanData?.documentGraph || null;
    return documentGraphToLayoutModel(graph) || null;
  }, [session?.layoutModel, scanData?.layoutModel, session?.documentGraph, scanData?.documentGraph]);
  const fidelityPagesToRender = useMemo(() => {
    const pages = Array.isArray(fidelityLayout?.pages) ? fidelityLayout.pages : [];
    const pageMap = new Map(pages.map((p) => [Number(p?.pageNumber || 0), p]));
    const diagTotal = Number(
      scanData?.scanResults?.layoutDiagnostics?.pages
      || scanResults?.layoutDiagnostics?.pages
      || session?.scanResults?.layoutDiagnostics?.pages
      || 0
    );
    const layoutTotal = pages.length > 0 ? Math.max(...pages.map((p) => Number(p?.pageNumber || 0))) : 0;
    const totalPages = Math.max(diagTotal, layoutTotal, Number(pdfPageCount || 0));
    if (totalPages <= 0) return pages;
    const baseWidth = Number(pages[0]?.width || 794);
    const baseHeight = Number(pages[0]?.height || 1123);
    const out = [];
    for (let p = 1; p <= totalPages; p += 1) {
      if (pageMap.has(p)) {
        out.push(pageMap.get(p));
      } else {
        out.push({
          pageNumber: p,
          width: baseWidth,
          height: baseHeight,
          blocks: [],
          _placeholder: true,
        });
      }
    }
    return out;
  }, [fidelityLayout, scanData?.scanResults?.layoutDiagnostics?.pages, scanResults?.layoutDiagnostics?.pages, session?.scanResults?.layoutDiagnostics?.pages, pdfPageCount]);

  const hasFidelityLayout = fidelityPagesToRender.length > 0;

  const editablePagesToRender = useMemo(() => {
    const totalPages = Math.max(1, Number(pdfPageCount || 0));
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [pdfPageCount]);


  const pdfCanvasUrl = useMemo(() => (
    resolvePdfUrl(selectedFile?.fileUrl || selectedFile?.url || session?.fileUrl || '')
  ), [selectedFile?.fileUrl, selectedFile?.url, session?.fileUrl]);

  useEffect(() => {
    if (editorViewMode !== 'fidelity') return;
    const fileId = selectedFile?._id || session?.fileId || null;
    if (!fileId) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fileService.getFidelityFonts(fileId);
        if (cancelled) return;
        const fonts = Array.isArray(res?.fonts) ? res.fonts : [];
        setFidelityFontsMeta(fonts);
        registerExtractedFontFamilies(fonts.map((f) => f.family));
        for (const font of fonts) {
          if (loadedFontIdsRef.current.has(font.id)) continue;
          try {
            const blob = await fileService.downloadFidelityFont(fileId, font.id);
            if (!blob) continue;
            const url = URL.createObjectURL(blob);
            if (typeof FontFace !== 'undefined') {
              const ff = new FontFace(font.family, `url(${url})`, {
                weight: String(font.weight || 400),
                style: font.style || 'normal',
              });
              await ff.load();
              document.fonts.add(ff);
            } else {
              const style = document.createElement('style');
              style.textContent = `@font-face{font-family:'${font.family}';src:url('${url}');font-weight:${font.weight || 400};font-style:${font.style || 'normal'};}`;
              document.head.appendChild(style);
            }
            loadedFontIdsRef.current.add(font.id);
          } catch (e) {
            console.warn('[Fidelity-Fonts] load failed:', font?.family, e?.message || e);
          }
        }
      } catch (err) {
        console.warn('[Fidelity-Fonts] fetch failed:', err?.message || err);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [editorViewMode, selectedFile?._id, session?.fileId]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!pdfCanvasUrl) return;
      const fileId = selectedFile?._id || session?.fileId || null;
      try {
        let pdf = null;
        try {
          const task = pdfjsLib.getDocument({ url: pdfCanvasUrl });
          pdf = await task.promise;
        } catch (urlErr) {
          if (!fileId) throw urlErr;
          const blob = await fileService.downloadFile(fileId, 'pdf');
          const arr = await blob.arrayBuffer();
          const task = pdfjsLib.getDocument({ data: new Uint8Array(arr) });
          pdf = await task.promise;
        }
        if (!cancelled) setPdfPageCount(Number(pdf?.numPages || 0));
      } catch (err) {
        if (!cancelled) setPdfPageCount(0);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [pdfCanvasUrl, selectedFile?._id, session?.fileId]);

  const pdfTextLayerUrl = appliedFidelityPdfUrl || pdfCanvasUrl;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!pdfTextLayerUrl || !Array.isArray(fidelityPagesToRender) || fidelityPagesToRender.length === 0) return;
      const fileId = selectedFile?._id || session?.fileId || null;
      const tasks = fidelityPagesToRender.map(async (page) => {
        const pageNumber = Number(page?.pageNumber || 1);
        const targetWidthPx = Number(page?.width || 800);
        const existing = pdfTextLayersByPageRef.current?.[pageNumber];
        if (existing && existing.sourceUrl === pdfTextLayerUrl && existing.targetWidthPx === targetWidthPx) return;
        try {
          let pdf = null;
          try {
            const loadingTask = pdfjsLib.getDocument({ url: pdfTextLayerUrl });
            pdf = await loadingTask.promise;
          } catch (urlErr) {
            const canFallbackToApi = !!fileId;
            const isLikely404 = /404|not found|MissingPDF|ResponseException/i.test(String(urlErr?.message || ''));
            if (!canFallbackToApi) throw urlErr;
            if (isLikely404) {
              const blob = await fileService.downloadFile(fileId, 'pdf');
              const arr = await blob.arrayBuffer();
              const dataTask = pdfjsLib.getDocument({ data: new Uint8Array(arr) });
              pdf = await dataTask.promise;
            } else {
              throw urlErr;
            }
          }
          const pageObj = await pdf.getPage(pageNumber);
          const viewport1 = pageObj.getViewport({ scale: 1 });
          const scale = targetWidthPx && viewport1?.width
            ? (Number(targetWidthPx) / Number(viewport1.width))
            : 1;
          const viewport = pageObj.getViewport({ scale });
          const textContent = await pageObj.getTextContent();
          const items = Array.isArray(textContent?.items) ? textContent.items : [];
          const styles = textContent?.styles || {};

          const mapped = items.map((item) => {
            const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
            const x = tx[4];
            const baseline = tx[5];
            const w = Number(item.width || 0) * scale;
            const h = Math.abs(Number(item.height || 0) * scale) || Math.abs(tx[3]) || 0;
            const top = baseline - h;
            const font = styles?.[item.fontName] || {};
            return {
              text: item.str,
              x,
              y: Math.max(0, top),
              right: x + w,
              bottom: Math.max(0, top + h),
              width: w,
              height: h,
              baseline,
              fontName: item.fontName || null,
              fontFamily: font?.fontFamily || null,
              fontWeight: font?.fontWeight || null,
              fontStyle: font?.fontStyle || null,
            };
          });

          if (!cancelled) {
            setPdfTextLayersByPage((prev) => ({
              ...prev,
              [pageNumber]: {
                items: mapped,
                width: viewport.width,
                height: viewport.height,
                scale,
                sourceUrl: pdfTextLayerUrl,
                targetWidthPx,
              },
            }));
          }
        } catch (err) {
          if (!cancelled) {
            console.warn('[PDF-TEXT-LAYER] extract failed:', {
              pageNumber,
              message: err?.message || String(err),
            });
          }
        }
      });
      await Promise.all(tasks);
    };
    run();
    return () => { cancelled = true; };
  }, [pdfTextLayerUrl, fidelityPagesToRender, selectedFile?._id, session?.fileId]);

  useEffect(() => {
    if (editorViewMode !== 'fidelity') return;
    let cancelled = false;
    const run = async () => {
      if (!pdfTextLayerUrl) return;
      const fileId = selectedFile?._id || session?.fileId || null;
      try {
        let pdf = null;
        try {
          const loadingTask = pdfjsLib.getDocument({ url: pdfTextLayerUrl });
          pdf = await loadingTask.promise;
        } catch (urlErr) {
          if (!fileId) throw urlErr;
          const blob = await fileService.downloadFile(fileId, 'pdf');
          const arr = await blob.arrayBuffer();
          const dataTask = pdfjsLib.getDocument({ data: new Uint8Array(arr) });
          pdf = await dataTask.promise;
        }
        const totalPages = Number(pdf?.numPages || pdfPageCount || Object.keys(pdfTextLayersByPage || {}).length || 0);
        if (!totalPages) return;
        const results = {};
        for (let p = 1; p <= totalPages; p += 1) {
          const page = await pdf.getPage(p);
          const viewport1 = page.getViewport({ scale: 1 });
          const targetWidth = Number(pdfTextLayersByPage?.[p]?.width || viewport1.width);
          const scale = targetWidth && viewport1?.width ? (targetWidth / viewport1.width) : 1;
          const viewport = page.getViewport({ scale });
          const extracted = await extractPageObjects(page, viewport, p);
          results[p] = extracted.objects || [];
        }
        if (!cancelled) setFidelityObjectsByPage(results);
      } catch (err) {
        if (!cancelled) {
          console.warn('[PDF-OBJECT-LAYER] extract failed:', err?.message || err);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [editorViewMode, pdfTextLayerUrl, pdfPageCount, pdfTextLayersByPage, selectedFile?._id, session?.fileId]);

  try {
    const layoutPages = Array.isArray(fidelityLayout?.pages)
      ? fidelityLayout.pages.length
      : 0;
    console.log('[EDITOR-FIDELITY-QA]', 'fidelity-layout-compute', {
      editorViewMode,
      hasFidelityLayout,
      layoutPages,
      layoutModelSource: session?.documentGraph
        ? 'session.documentGraph'
        : scanData?.documentGraph
          ? 'scanData.documentGraph'
          : session?.layoutModel
            ? 'session.layoutModel'
            : scanData?.layoutModel
              ? 'scanData.layoutModel'
              : 'none',
      pdfCanvasUrl,
      selectedFileMeta: selectedFile
        ? {
            id: selectedFile._id || null,
            fileName: selectedFile.fileName || selectedFile.originalName || null,
            hasFileUrl: !!selectedFile.fileUrl,
            hasUrl: !!selectedFile.url,
          }
        : null,
      sessionId: session?._id || session?.sessionId || null,
    });
  } catch (logErr) {
    console.warn('[EDITOR-FIDELITY-QA] fidelity-log-error', logErr);
  }

  useEffect(() => {
    try {
      const layoutPages = Array.isArray(fidelityLayout?.pages)
        ? fidelityLayout.pages.length
        : 0;
      console.log('[EDITOR-FIDELITY-QA]', 'editor-mount-or-props-change', {
        editorViewMode,
        hasFidelityLayout,
        layoutPages,
        pdfCanvasUrl,
        sessionSummary: session
          ? {
              id: session._id || session.sessionId || null,
              hasLayoutModel: !!session.layoutModel,
              hasFidelityEdits: !!session.fidelityEdits,
            }
          : null,
        selectedFileSummary: selectedFile
          ? {
              id: selectedFile._id || null,
              fileName: selectedFile.fileName || selectedFile.originalName || null,
              hasFileUrl: !!selectedFile.fileUrl,
              hasUrl: !!selectedFile.url,
            }
          : null,
        hasScanData: !!scanData,
        scanDetectedDocType: scanData?.detectedDocType || null,
        scanResultsDocType: scanData?.scanResults?.documentType || null,
      });
    } catch (logErr) {
      console.warn('[EDITOR-FIDELITY-QA] mount-log-error', logErr);
    }
  }, [editorViewMode, fidelityLayout, hasFidelityLayout, pdfCanvasUrl, session, selectedFile, scanData]);

  const getFidelityBlockKey = useCallback((pageNumber, blockIdx, block = null) => {
    if (block?.id) return String(block.id);
    return `${pageNumber}:${blockIdx}`;
  }, []);

  const getFidelityText = useCallback((pageNumber, blockIdx, fallbackText, block = null) => {
    const key = getFidelityBlockKey(pageNumber, blockIdx, block);
    if (!Object.prototype.hasOwnProperty.call(fidelityEdits, key)) return fallbackText;
    const entry = fidelityEdits[key];
    if (entry && typeof entry === 'object' && Object.prototype.hasOwnProperty.call(entry, 'text')) {
      return String(entry.text || '');
    }
    if (typeof entry === 'string') return entry;
    return fallbackText;
  }, [fidelityEdits, getFidelityBlockKey]);

  const buildFidelityEditPayload = useCallback((block, text) => {
    if (!block) return { text: String(text || '') };
    const pageNumber = Number(block?.renderPageNumber || block?.pageNumber || block?.page || 1);
    const scale = pdfTextLayersByPage?.[pageNumber]?.scale || 1;
    return {
      text: String(text || ''),
      pageNumber,
      bbox: block?.renderBBox || block?.bbox || null,
      style: block?.style || null,
      type: block?.type || null,
      table: block?.table || null,
      border: block?.border || null,
      scale,
    };
  }, [pdfTextLayersByPage]);

  const isImageLikeBlock = useCallback((block = {}) => {
    const t = String(block?.type || '').toLowerCase();
    const r = String(block?.role || '').toLowerCase();
    return /image|figure|photo|graphic|signature|stamp/.test(t) || /image|figure|graphic|signature|stamp/.test(r);
  }, []);

  // ── Fidelity overlay model (layout + pdf.js text layer) ───────────────────
  const fidelityOverlayPages = useMemo(() => {
    return fidelityPagesToRender.map((page) => {
      const pageNumber = Number(page?.pageNumber || 1);
      const textLayer = pdfTextLayersByPage?.[pageNumber] || null;
      const textItems = Array.isArray(textLayer?.items) ? textLayer.items : [];
      const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
      const layoutWidth = Number(page?.width || 794);
      const textLayerWidth = Number(textLayer?.width || 0);
      const pageWidth = textLayerWidth || layoutWidth;
      const scaleRatio = textLayerWidth && layoutWidth ? (textLayerWidth / layoutWidth) : 1;

      const tableCells = blocks.filter((b) => b?.type === 'tableCell');
      const textLineBlocks = textItems.length >= 5
        ? buildPdfTextLineBlocks(textItems, pageNumber, pageWidth, tableCells)
        : null;

      const overlaySource = Array.isArray(textLineBlocks) && textLineBlocks.length > 0
        ? [...textLineBlocks, ...tableCells]
        : blocks;

      const overlayBlocks = overlaySource.map((block, bIdx) => {
        const rawBBox = Array.isArray(block?.bbox) ? block.bbox : [0, 0, 0, 0];
        const bbox = block?.source === 'pdfText' ? rawBBox : scaleBBox(rawBBox, scaleRatio);
        const [bx1, by1, bx2, by2] = bbox;
        const blockKey = block?.id ? String(block.id) : getFidelityBlockKey(pageNumber, bIdx, block);
        const text = getFidelityText(pageNumber, bIdx, String(block?.text || ''), block);
        const width = Math.max(30, bx2 - bx1);
        const height = Math.max(18, by2 - by1);

        // Try to infer font from pdf.js text layer overlapping this block
        let matchedFontFamily = block?.style?.fontFamily || null;
        let matchedFontWeight = block?.style?.fontWeight || null;
        let matchedFontStyle = block?.style?.fontStyle || null;

        if (textItems.length > 0) {
          const candidates = textItems.filter((item) => (
            bboxOverlapRatio([bx1, by1, bx2, by2], [item.x, item.y, item.right, item.bottom]) > 0.2
          ));
          if (candidates.length > 0) {
            const counts = new Map();
            for (const c of candidates) {
              const key = `${c.fontFamily || ''}|${c.fontWeight || ''}|${c.fontStyle || ''}`;
              counts.set(key, (counts.get(key) || 0) + (c.text?.length || 1));
            }
            const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
            const [f, w, s] = best.split('|');
            matchedFontFamily = f || matchedFontFamily;
            matchedFontWeight = w || matchedFontWeight;
            matchedFontStyle = s || matchedFontStyle;
          }
        }

        const fontSizePx = Math.max(9, Number(block?.style?.fontSize || 11));
        const lineHeightPx = Number(block?.style?.lineHeight || Math.round(fontSizePx * 1.35));
        const fontFamilyRaw = String(matchedFontFamily || 'Times New Roman')
          .split(',')[0]
          .replace(/['"]/g, '')
          .trim();
        const fontFamily = normalizeFontFamily(fontFamilyRaw);
        const fontWeight = Number(matchedFontWeight || (block?.style?.bold ? 700 : 400) || 400);
        const fontStyle = matchedFontStyle || (block?.style?.italic ? 'italic' : 'normal');

        const measured = measureWrappedLines(text, {
          fontSizePx,
          fontFamily,
          fontWeight,
          fontStyle,
          maxWidthPx: width,
          lineHeightPx,
        });

        const computedHeight = Math.max(height, measured.height);

        return {
          ...block,
          blockKey,
          pageNumber,
          text,
          bbox,
          baseX: bx1,
          baseY: by1,
          width,
          height,
          computedHeight,
          textLines: measured.lines,
          lineHeightPx: measured.lineHeightPx,
          style: {
            ...(block?.style || {}),
            fontFamily,
            fontFamilyRaw,
            fontWeight,
            fontStyle,
            fontSize: fontSizePx,
            lineHeight: lineHeightPx,
            align: block?.style?.align || inferAlignFromLine(bx1, bx2, pageWidth),
          },
        };
      });

      return {
        ...page,
        overlayBlocks,
        textLayer,
      };
    });
  }, [fidelityPagesToRender, pdfTextLayersByPage, getFidelityBlockKey, getFidelityText]);

  const shouldUseFidelityDocFlow = useMemo(() => {
    // Reflow is useful when we have real layout blocks.
    // When layout is missing and we rely on pdf.js text lines, reflow can
    // compress multiple pages and cause top-page overlap artifacts.
    const pages = Array.isArray(fidelityLayout?.pages) ? fidelityLayout.pages : [];
    return pages.some((p) => Array.isArray(p?.blocks) && p.blocks.length > 0);
  }, [fidelityLayout?.pages]);

  const { flowMap, tableFlow, pageHeights: flowPageHeights } = useMemo(() => {
    if (!shouldUseFidelityDocFlow) {
      return {
        flowMap: new Map(),
        tableFlow: new Map(),
        pageHeights: (fidelityOverlayPages || []).map((p) => Number(p?.height || 1123)),
      };
    }
    return buildDocFlow(fidelityOverlayPages);
  }, [fidelityOverlayPages, shouldUseFidelityDocFlow]);

  const fidelityFlowPages = useMemo(() => {
    const byPage = new Map();
    const basePages = fidelityOverlayPages || [];
    for (const p of basePages) {
      byPage.set(Number(p.pageNumber || 1), {
        ...p,
        overlayBlocks: [],
      });
    }
    // Add extra pages if flow spilled over
    const maxPage = Math.max(
      ...Array.from({ length: flowPageHeights.length }, (_, i) => i + 1),
      ...Array.from(byPage.keys()),
      1,
    );
    for (let i = 1; i <= maxPage; i += 1) {
      if (!byPage.has(i)) {
        const height = Number(flowPageHeights[i - 1] || basePages[0]?.height || 1123);
        const width = Number(basePages[0]?.width || 794);
        byPage.set(i, { pageNumber: i, width, height, overlayBlocks: [] });
      }
    }

    for (const page of basePages) {
      for (const block of page.overlayBlocks || []) {
        const blockKey = block.blockKey;
        const offset = fidelityOffsets?.[blockKey] || { x: 0, y: 0 };
        let renderPage = block.pageNumber;
        let renderY = Number(block.baseY || 0);

        if (shouldUseFidelityDocFlow && block.type === 'tableCell' && block.table?.tableId) {
          const tId = `${block.pageNumber}:${block.table.tableId}`;
          const flow = tableFlow.get(tId);
          if (flow?.pageNumber) renderPage = flow.pageNumber;
          if (flow?.yShift) renderY = renderY + flow.yShift;
        } else if (shouldUseFidelityDocFlow) {
          const flow = flowMap.get(blockKey);
          if (flow?.pageNumber) renderPage = flow.pageNumber;
          if (Number.isFinite(flow?.y)) renderY = flow.y;
        }

        const renderX = Number(block.baseX || 0) + Number(offset.x || 0);
        const renderYFinal = Number(renderY) + Number(offset.y || 0);
        const renderH = Number(block.computedHeight || block.height || 18);
        const renderBBox = [renderX, renderYFinal, renderX + Number(block.width || 0), renderYFinal + renderH];

        const targetPage = byPage.get(renderPage) || byPage.get(block.pageNumber);
        if (!targetPage) continue;
        targetPage.overlayBlocks.push({
          ...block,
          renderPageNumber: renderPage,
          renderX,
          renderY: renderYFinal,
          renderBBox,
        });
      }
    }
    return Array.from(byPage.values()).sort((a, b) => Number(a.pageNumber || 0) - Number(b.pageNumber || 0));
  }, [fidelityOverlayPages, fidelityOffsets, flowMap, tableFlow, flowPageHeights, shouldUseFidelityDocFlow]);

  // ── Table grouping for fidelity overlay ───────────────────────────────────
  const fidelityTableGroups = useMemo(() => {
    const byPage = new Map();
    for (const page of fidelityFlowPages) {
      const tableMap = new Map();
      for (const block of page.overlayBlocks || []) {
        const tableId = block?.table?.tableId;
        if (!tableId || block?.type !== 'tableCell') continue;
        if (!tableMap.has(tableId)) tableMap.set(tableId, []);
        tableMap.get(tableId).push(block);
      }
      const tables = [];
      for (const [tableId, cells] of tableMap.entries()) {
        const xs = cells.map((c) => c.renderX ?? c.baseX ?? 0);
        const ys = cells.map((c) => c.renderY ?? c.baseY ?? 0);
        const rights = cells.map((c) => (c.renderX ?? c.baseX ?? 0) + (c.width || 0));
        const bottoms = cells.map((c) => (c.renderY ?? c.baseY ?? 0) + (c.height || 0));
        tables.push({
          tableId,
          cells,
          bbox: [
            Math.min(...xs),
            Math.min(...ys),
            Math.max(...rights),
            Math.max(...bottoms),
          ],
        });
      }
      byPage.set(page.pageNumber, tables);
    }
    return byPage;
  }, [fidelityFlowPages]);

  const fidelityOverlayIndex = useMemo(() => {
    const map = new Map();
    for (const page of fidelityFlowPages) {
      for (const block of page?.overlayBlocks || []) {
        if (block?.blockKey) map.set(block.blockKey, block);
      }
    }
    return map;
  }, [fidelityFlowPages]);

  useEffect(() => {
    ensureWebFontSheet();
    const families = new Set();
    for (const page of fidelityFlowPages) {
      for (const block of page?.overlayBlocks || []) {
        const fam = String(block?.style?.fontFamily || '').trim();
        if (fam) families.add(fam);
      }
    }
    families.forEach((fam) => loadFontFamily(fam));
  }, [fidelityFlowPages]);

  const selectedFidelityBlockIdSet = useMemo(
    () => new Set(selectedFidelityBlockIds),
    [selectedFidelityBlockIds],
  );

  useEffect(() => {
    if (selectedFidelityBlockIds.length === 0) {
      if (selectedFidelityBlock) setSelectedFidelityBlock(null);
      return;
    }
    const primaryId = selectedFidelityBlock?.id;
    if (!primaryId || !selectedFidelityBlockIds.includes(primaryId)) {
      const block = fidelityOverlayIndex.get(selectedFidelityBlockIds[0]);
      if (block) {
        setSelectedFidelityBlock({
          id: block.blockKey,
          page: block.pageNumber,
          bbox: block.bbox || [block.baseX, block.baseY, block.baseX + block.width, block.baseY + block.height],
          role: block?.role || 'body',
          confidence: block?.confidence ?? null,
          type: block?.type || 'line',
        });
      }
    }
  }, [selectedFidelityBlockIds, fidelityOverlayIndex, selectedFidelityBlock]);

  const pushFidelityUndoSnapshot = useCallback((snapshot) => {
    const safe = snapshot && typeof snapshot === 'object' ? snapshot : {};
    const undo = fidelityUndoStackRef.current;
    undo.push(safe);
    if (undo.length > 100) undo.shift();
    fidelityRedoStackRef.current = [];
    setFidelityHistoryTick((n) => n + 1);
  }, []);

  const handleFidelityUndo = useCallback(() => {
    const undo = fidelityUndoStackRef.current;
    if (undo.length === 0) return;
    const current = fidelityEdits && typeof fidelityEdits === 'object' ? fidelityEdits : {};
    const prev = undo.pop() || {};
    fidelityRedoStackRef.current.push(current);
    setFidelityEdits(prev);
    setHasUnsavedChanges(true);
    setFidelityHistoryTick((n) => n + 1);
  }, [fidelityEdits]);

  const handleFidelityRedo = useCallback(() => {
    const redo = fidelityRedoStackRef.current;
    if (redo.length === 0) return;
    const current = fidelityEdits && typeof fidelityEdits === 'object' ? fidelityEdits : {};
    const next = redo.pop() || {};
    fidelityUndoStackRef.current.push(current);
    setFidelityEdits(next);
    setHasUnsavedChanges(true);
    setFidelityHistoryTick((n) => n + 1);
  }, [fidelityEdits]);

  const getSelectedOverlayBlocks = useCallback(() => {
    const ids = selectedFidelityBlockIds.length > 0 ? selectedFidelityBlockIds : (selectedFidelityBlock?.id ? [selectedFidelityBlock.id] : []);
    return ids.map((id) => fidelityOverlayIndex.get(id)).filter(Boolean);
  }, [selectedFidelityBlockIds, selectedFidelityBlock, fidelityOverlayIndex]);

  const applyAlignment = useCallback((mode) => {
    const blocks = getSelectedOverlayBlocks();
    if (blocks.length < 2) return;
    pushFidelityUndoSnapshot(fidelityEdits);

    const primary = fidelityOverlayIndex.get(selectedFidelityBlock?.id) || blocks[0];
    const primaryBox = {
      x: Number(primary.renderX ?? primary.baseX ?? 0),
      y: Number(primary.renderY ?? primary.baseY ?? 0),
      w: Number(primary.width || 0),
      h: Number(primary.computedHeight || primary.height || 0),
    };

    let target = 0;
    if (mode === 'left') target = primaryBox.x;
    if (mode === 'center') target = primaryBox.x + primaryBox.w / 2;
    if (mode === 'right') target = primaryBox.x + primaryBox.w;
    if (mode === 'top') target = primaryBox.y;
    if (mode === 'middle') target = primaryBox.y + primaryBox.h / 2;
    if (mode === 'bottom') target = primaryBox.y + primaryBox.h;

    setFidelityOffsets((prev) => {
      const next = { ...prev };
      for (const b of blocks) {
        const curX = Number(b.renderX ?? b.baseX ?? 0);
        const curY = Number(b.renderY ?? b.baseY ?? 0);
        const w = Number(b.width || 0);
        const h = Number(b.computedHeight || b.height || 0);
        let dx = 0;
        let dy = 0;
        if (mode === 'left') dx = target - curX;
        if (mode === 'center') dx = (target - w / 2) - curX;
        if (mode === 'right') dx = (target - w) - curX;
        if (mode === 'top') dy = target - curY;
        if (mode === 'middle') dy = (target - h / 2) - curY;
        if (mode === 'bottom') dy = (target - h) - curY;
        const base = prev?.[b.blockKey] || { x: 0, y: 0 };
        next[b.blockKey] = { x: Math.round(Number(base.x || 0) + dx), y: Math.round(Number(base.y || 0) + dy) };
      }
      return next;
    });
    setHasUnsavedChanges(true);
  }, [getSelectedOverlayBlocks, selectedFidelityBlock, fidelityOverlayIndex, fidelityEdits, pushFidelityUndoSnapshot]);

  const distributeBlocks = useCallback((axis = 'x') => {
    const blocks = getSelectedOverlayBlocks();
    if (blocks.length < 3) return;
    pushFidelityUndoSnapshot(fidelityEdits);
    const boxes = blocks.map((b) => ({
      id: b.blockKey,
      x: Number(b.renderX ?? b.baseX ?? 0),
      y: Number(b.renderY ?? b.baseY ?? 0),
      w: Number(b.width || 0),
      h: Number(b.computedHeight || b.height || 0),
    }));
    const sorted = boxes.slice().sort((a, b) => (axis === 'x' ? a.x - b.x : a.y - b.y));
    const min = axis === 'x' ? sorted[0].x : sorted[0].y;
    const max = axis === 'x' ? sorted[sorted.length - 1].x : sorted[sorted.length - 1].y;
    const gap = (max - min) / (sorted.length - 1);

    setFidelityOffsets((prev) => {
      const next = { ...prev };
      sorted.forEach((b, idx) => {
        const desired = min + gap * idx;
        const cur = axis === 'x' ? b.x : b.y;
        const delta = desired - cur;
        const base = prev?.[b.id] || { x: 0, y: 0 };
        next[b.id] = axis === 'x'
          ? { x: Math.round(Number(base.x || 0) + delta), y: Number(base.y || 0) }
          : { x: Number(base.x || 0), y: Math.round(Number(base.y || 0) + delta) };
      });
      return next;
    });
    setHasUnsavedChanges(true);
  }, [getSelectedOverlayBlocks, fidelityEdits, pushFidelityUndoSnapshot]);

  const applySuggestionToFidelity = useCallback((suggestion) => {
    const suggested = String(suggestion?.suggestedText || '').trim();
    if (!suggested) return false;

    const normalized = suggested.replace(/\r\n/g, '\n');
    let targetId = selectedFidelityBlock?.id || null;
    let targetKey = targetId || null;

    // If no manual selection, auto-find best target block by matching the
    // suggestion's originalText / clauseRef against overlay block text.
    if (!targetKey) {
      const original = String(suggestion?.originalText || '').trim();
      const clauseRef = String(suggestion?.clauseRef || '').trim();
      const hints = [original, clauseRef].filter(Boolean);
      if (hints.length > 0) {
        let best = { key: null, score: 0 };
        for (const page of fidelityFlowPages || []) {
          for (const b of page?.overlayBlocks || []) {
            if (!b?.blockKey) continue;
            const text = String(b?.text || '').trim();
            if (!text) continue;
            // Skip image/table cells for suggestion placement
            if (b?.type === 'tableCell' || isImageLikeBlock(b) || isSeparatorText(text)) continue;
            const s1 = scoreTextMatch(text, hints[0] || '');
            const s2 = hints[1] ? scoreTextMatch(text, hints[1]) : 0;
            const score = Math.max(s1, s2);
            if (score > best.score) best = { key: b.blockKey, score };
          }
        }
        if (best.key && best.score >= 0.25) {
          targetKey = best.key;
        }
      }
    }

    if (!targetKey) {
      const firstPage = Array.isArray(fidelityFlowPages)
        ? fidelityFlowPages.find((p) => Array.isArray(p?.overlayBlocks) && p.overlayBlocks.length > 0)
        : null;
      if (firstPage) {
        targetKey = firstPage.overlayBlocks[0]?.blockKey || null;
      }
    }
    if (!targetKey) return false;

    const existingEntry = fidelityEdits?.[targetKey];
    const existing = (existingEntry && typeof existingEntry === 'object')
      ? String(existingEntry.text || '')
      : (typeof existingEntry === 'string' ? existingEntry : '');
    const next = existing.trim()
      ? `${existing.replace(/\s+$/, '')}\n${normalized}`
      : normalized;

    pushFidelityUndoSnapshot(fidelityEdits);
    const targetBlock = fidelityOverlayIndex.get(targetKey);
    setFidelityEdits((prev) => ({ ...prev, [targetKey]: buildFidelityEditPayload(targetBlock, next) }));
    setSelectedFidelityBlock((prev) => prev?.id === targetKey ? prev : (prev || { id: targetKey }));
    setHasUnsavedChanges(true);
    return true;
  }, [selectedFidelityBlock, fidelityFlowPages, fidelityOverlayIndex, fidelityEdits, pushFidelityUndoSnapshot, buildFidelityEditPayload, isImageLikeBlock]);

  useEffect(() => {
    if (session?.fidelityEdits && typeof session.fidelityEdits === 'object') {
      setFidelityEdits(session.fidelityEdits);
      fidelityUndoStackRef.current = [];
      fidelityRedoStackRef.current = [];
      setFidelityHistoryTick((n) => n + 1);
    }
  }, [session?.fidelityEdits]);

  useEffect(() => {
    if (session?.fidelityOffsets && typeof session.fidelityOffsets === 'object') {
      setFidelityOffsets(session.fidelityOffsets);
    } else if (!session?.fidelityOffsets) {
      setFidelityOffsets({});
    }
  }, [session?.fidelityOffsets]);

  useEffect(() => {
    if (session?.fidelityObjectEdits && typeof session.fidelityObjectEdits === 'object') {
      setFidelityObjectEdits(session.fidelityObjectEdits);
    } else if (!session?.fidelityObjectEdits) {
      setFidelityObjectEdits({});
    }
  }, [session?.fidelityObjectEdits]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (editorViewMode !== 'fidelity') return;
      const tag = String(e?.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const keyRaw = String(e.key || '');
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(keyRaw)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = keyRaw === 'ArrowLeft' ? -step : (keyRaw === 'ArrowRight' ? step : 0);
        const dy = keyRaw === 'ArrowUp' ? -step : (keyRaw === 'ArrowDown' ? step : 0);
        if (selectedFidelityObject?.id) {
          setFidelityObjectEdits((prev) => {
            const next = { ...prev };
            const existing = prev?.[selectedFidelityObject.id] || { dx: 0, dy: 0, scaleX: 1, scaleY: 1, object: selectedFidelityObject };
            next[selectedFidelityObject.id] = {
              ...existing,
              dx: Math.round(Number(existing.dx || 0) + dx),
              dy: Math.round(Number(existing.dy || 0) + dy),
              object: existing.object || selectedFidelityObject,
            };
            return next;
          });
        }
        const targetIds = selectedFidelityBlockIds.length > 0
          ? selectedFidelityBlockIds
          : (selectedFidelityBlock?.id ? [selectedFidelityBlock.id] : []);
        if (targetIds.length > 0) {
          setFidelityOffsets((prev) => {
            const next = { ...prev };
            for (const id of targetIds) {
              const base = prev?.[id] || { x: 0, y: 0 };
              next[id] = { x: Math.round(Number(base.x || 0) + dx), y: Math.round(Number(base.y || 0) + dy) };
            }
            return next;
          });
        }
        setHasUnsavedChanges(true);
        return;
      }
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      const key = String(e.key || '').toLowerCase();
      if (key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleFidelityRedo();
        return;
      }
      if (key === 'y') {
        e.preventDefault();
        handleFidelityRedo();
        return;
      }
      if (key === 'z') {
        e.preventDefault();
        handleFidelityUndo();
        return;
      }
      // Ctrl/Cmd+A → toggle Select All boxes
      if (key === 'a') {
        e.preventDefault();
        setFidelitySelectAll((v) => {
          const next = !v;
          if (next) {
            setSelectedFidelityBlockIds([]);
            setSelectedFidelityBlock(null);
          }
          return next;
        });
      }
      // Escape → deselect / exit select-all
    };
    const onKeyUp = (e) => {
      if (editorViewMode !== 'fidelity') return;
      if (e.key === 'Escape') {
        setSelectedFidelityBlock(null);
        setSelectedFidelityBlockIds([]);
        setFidelitySelectAll(false);
        setSelectedFidelityObject(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [editorViewMode, handleFidelityRedo, handleFidelityUndo, selectedFidelityObject, selectedFidelityBlockIds, selectedFidelityBlock]);

  useEffect(() => {
    const onMove = (e) => {
      if (fidelityObjectDragRef.current) {
        const { id, mode, startX, startY, baseDx, baseDy, baseW, baseH } = fidelityObjectDragRef.current;
        const scale = fidelityZoom || 1;
        const dx = (e.clientX - startX) / scale;
        const dy = (e.clientY - startY) / scale;
        setFidelityObjectEdits((prev) => {
          const next = { ...prev };
          const existing = prev?.[id] || { dx: 0, dy: 0, scaleX: 1, scaleY: 1 };
          if (mode === 'resize') {
            const newW = Math.max(10, baseW + dx);
            const newH = Math.max(10, baseH + dy);
            next[id] = {
              ...existing,
              scaleX: baseW > 0 ? newW / baseW : 1,
              scaleY: baseH > 0 ? newH / baseH : 1,
            };
          } else {
            let nextDx = baseDx + dx;
            let nextDy = baseDy + dy;
            if (fidelityGridSnapEnabled) {
              const grid = Math.max(2, Number(fidelityGridSize || 5));
              nextDx = Math.round(nextDx / grid) * grid;
              nextDy = Math.round(nextDy / grid) * grid;
            }
            next[id] = {
              ...existing,
              dx: Math.round(nextDx),
              dy: Math.round(nextDy),
            };
          }
          return next;
        });
        setHasUnsavedChanges(true);
        return;
      }
      if (!fidelityDragRef.current) return;
      const {
        keys = [],
        startX,
        startY,
        baseOffsets,
        snapX,
        snapY,
        primaryAbsX,
        primaryAbsY,
      } = fidelityDragRef.current;
      const scale = fidelityZoom || 1;
      let dx = (e.clientX - startX) / scale;
      let dy = (e.clientY - startY) / scale;
      const SNAP_DIST = 4;

      let guideX = null;
      let guideY = null;
      if (fidelitySnapEnabled && Array.isArray(snapX) && Number.isFinite(primaryAbsX)) {
        const targetX = primaryAbsX + dx;
        const nearX = snapX.find((s) => Math.abs(s - targetX) <= SNAP_DIST);
        if (Number.isFinite(nearX)) dx += (nearX - targetX);
        if (Number.isFinite(nearX)) guideX = nearX;
      }
      if (fidelitySnapEnabled && Array.isArray(snapY) && Number.isFinite(primaryAbsY)) {
        const targetY = primaryAbsY + dy;
        const nearY = snapY.find((s) => Math.abs(s - targetY) <= SNAP_DIST);
        if (Number.isFinite(nearY)) dy += (nearY - targetY);
        if (Number.isFinite(nearY)) guideY = nearY;
      }

      setFidelitySnapGuides({
        x: guideX,
        y: guideY,
        page: fidelityDragRef.current?.page || null,
      });

      setFidelityOffsets((prev) => {
        const next = { ...prev };
        for (const k of keys) {
          const base = baseOffsets?.[k] || { x: 0, y: 0 };
          let nx = Number(base.x || 0) + dx;
          let ny = Number(base.y || 0) + dy;
          if (fidelityGridSnapEnabled) {
            const grid = Math.max(2, Number(fidelityGridSize || 5));
            nx = Math.round(nx / grid) * grid;
            ny = Math.round(ny / grid) * grid;
          }
          next[k] = {
            x: Math.round(nx),
            y: Math.round(ny),
          };
        }
        return next;
      });
      setHasUnsavedChanges(true);
    };
    const onUp = () => {
      if (fidelityObjectDragRef.current) {
        fidelityObjectDragRef.current = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        return;
      }
      if (!fidelityDragRef.current) return;
      fidelityDragRef.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      setFidelitySnapGuides({ x: null, y: null, page: null });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    if (editorViewMode !== 'fidelity') return undefined;
    if (fidelityAutosaveTimerRef.current) clearTimeout(fidelityAutosaveTimerRef.current);
    fidelityAutosaveTimerRef.current = setTimeout(async () => {
      try {
        await fileService.saveHtmlContent('', '', selectedFile?._id, {
          mode: 'fidelity',
          fidelityEdits,
          fidelityOffsets,
          fidelityObjectEdits,
        });
        setLastSaved(new Date());
      } catch (err) {
        console.warn('Fidelity autosave failed:', err.message);
      }
    }, 1800);
    return () => {
      if (fidelityAutosaveTimerRef.current) clearTimeout(fidelityAutosaveTimerRef.current);
    };
  }, [editorViewMode, fidelityEdits, fidelityOffsets, fidelityObjectEdits, selectedFile?._id]);


  const handleAIEdit = async () => {
    if (!editInstruction.trim() || !editor) return;
    setIsApplyingEdit(true);
    try {
      const result = await fileService.applyEdit(editInstruction);
      if (result.success) {

        const statusRes = await fileService.getEditStatus();
        if (statusRes.hasSession) {
          const analysisRes = await fileService.getDocumentAnalysis();

          if (result.textPreview) {
            const newHtml = textToHtml(result.textPreview);
            editor.commands.setContent(newHtml);
          }
          setChangeHistory(prev => [...prev, {
            instruction: editInstruction,
            summary: result.changeSummary,
            timestamp: new Date().toISOString()
          }]);
          setEditInstruction('');
          if (onSessionUpdate) onSessionUpdate();
        }
        toast({ title: 'Edit Applied', description: result.changeSummary, status: 'success', duration: 3000 });
      }
    } catch (error) {
      toast({ title: 'Edit Failed', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsApplyingEdit(false);
    }
  };


  const handleCopy = async () => {
    if (!editor) return;
    try {
      await navigator.clipboard.writeText(editor.getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied to clipboard', status: 'success', duration: 1500 });
    } catch (err) {
      toast({ title: 'Copy failed', status: 'error', duration: 1500 });
    }
  };


  const handleDownload = (format) => {
    setPendingDownloadFormat(format);
    setIsDesignSuggestionOpen(true);
  };

  const executeDownloadWithDesign = async (format, designConfig) => {
    setIsDesignSuggestionOpen(false);
    // OnlyOffice is the active editor surface; skip Tiptap autosave here.

    toast({ title: `Generating ${format.toUpperCase()}...`, status: 'info', duration: 2000 });
    try {
      const isPdfSource = String(selectedFile?.fileType || session?.fileType || '').toLowerCase().includes('pdf')
        || String(selectedFile?.fileName || session?.fileName || '').toLowerCase().endsWith('.pdf');
      const fileId = selectedFile?._id || session?.fileId || null;

      // Strict converter-equivalent path for PDF -> DOCX downloads.
      if (format === 'docx' && isPdfSource && fileId) {
        const blob = await fileService.downloadDocx(fileId);
        if (blob && blob.size > 0) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const baseName = selectedFile?.fileName?.replace(/\.[^/.]+$/, '') || 'converted_document';
          a.download = `${baseName}_converted_raw.docx`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast({ title: 'Downloaded raw converted DOCX', status: 'success', duration: 2200 });
        }
        return;
      }

      const finalDesignConfig = designConfig || (formatMetadata ? {
        fontFamily: formatMetadata.defaultFont,
        bodyFontSize: formatMetadata.defaultFontSize,
        lineSpacing: formatMetadata.lineSpacing,
        margins: formatMetadata.margins,
        pageSize: formatMetadata.pageSize?.name || 'A4',
        pageOrientation: formatMetadata.pageSize?.orientation || 'portrait',
        bodyAlignment: formatMetadata.bodyAlignment || 'left',
        borderStyle: formatMetadata.hasBorders ? formatMetadata.borderStyle : undefined,
        borderColor: formatMetadata.colors?.textColor?.replace('#', '') || '000000',
        headerText: formatMetadata.headerText || undefined,
        footerText: formatMetadata.footerText || undefined,
        headingSize: formatMetadata.headingStyles?.Heading1?.fontSize || undefined,
        paragraphSpacing: formatMetadata.paragraphSpacing || undefined,
      } : undefined);

      const blob = await fileService.downloadEdited(format, finalDesignConfig, selectedFile?._id, editorViewMode);
      if (blob && blob.size > 0) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = selectedFile?.fileName?.replace(/\.[^/.]+$/, '') || 'edited_document';
        a.download = `${baseName}_edited.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast({ title: 'Download Complete', status: 'success', duration: 2000 });
      }
    } catch (error) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        toast({ title: 'Download Started', description: 'Handled by download manager.', status: 'info', duration: 3000 });
      } else {
        toast({ title: 'Download Failed', description: error.message, status: 'error', duration: 3000 });
      }
    }
  };

  const handleExportAuditLog = async (format = 'pdf') => {
    const sid = session?._id;
    if (!sid) {
      toast({ title: 'No active session', status: 'warning', duration: 2000 });
      return;
    }
    toast({ title: 'Generating Audit Log...', status: 'info', duration: 2000 });
    try {
      // Always fetch HTML — PDF is rendered client-side via browser print (no puppeteer dependency)
      const data = await fileService.exportAuditLog(sid, 'html');
      const htmlContent = typeof data === 'string' ? data : await data.text();

      if (format === 'pdf') {
        // Open in new tab and trigger browser native print-to-PDF — works on all platforms
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => { printWindow.print(); }, 700);
          toast({ title: 'Print dialog opened', description: "Choose 'Save as PDF' in your browser's print dialog.", status: 'success', duration: 4000 });
        } else {
          toast({ title: 'Popup blocked', description: 'Allow popups for this site and try again.', status: 'warning', duration: 4000 });
        }
      } else {
        // HTML — direct download
        const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit_log.html';
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Audit Log Downloaded', status: 'success', duration: 2000 });
      }
    } catch (err) {
      toast({ title: 'Audit export failed', description: err?.message || 'Unknown error', status: 'error', duration: 3000 });
    }
  };

  const findRangeInEditor = useCallback((searchText) => {
    if (!editor || !searchText) return null;
    const segments = [];
    let fullText = '';

    editor.state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text) return;
      const start = fullText.length;
      fullText += node.text;
      segments.push({ start, end: fullText.length, pos, text: node.text });
    });



    const normalizeWithMap = (str) => {
      let normalized = '';
      const map = [];
      let prevSpace = false;
      for (let i = 0; i < str.length; i += 1) {
        const code = str.charCodeAt(i);
        let ch = str[i];

        if (code === 0x2018 || code === 0x2019 || code === 0x0060 || code === 0x00B4) ch = "'";
        else if (code === 0x201C || code === 0x201D) ch = '"';

        else if (code === 0x200B || code === 0xFEFF || code === 0x00AD) continue;

        else if (code === 0x00A0 || code === 0x2009 || code === 0x202F) ch = ' ';

        const isSpace = /\s/.test(ch);
        if (isSpace) {
          if (!prevSpace) {
            normalized += ' ';
            map.push(i);
            prevSpace = true;
          }
        } else {
          normalized += ch.toLowerCase();
          map.push(i);
          prevSpace = false;
        }
      }
      return { normalized: normalized.trim(), map };
    };


    let startIndex = fullText.indexOf(searchText);
    let endIndex = startIndex >= 0 ? startIndex + searchText.length : -1;


    if (startIndex < 0) {
      const qNorm = (s) => s
        .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u00A0\u2009\u202F]/g, ' ')
        .replace(/[\u200B\uFEFF\u00AD]/g, '');
      const qFull = qNorm(fullText);
      const qSearch = qNorm(searchText);
      const qIdx = qFull.indexOf(qSearch);
      if (qIdx >= 0) {
        startIndex = qIdx;
        endIndex = qIdx + qSearch.length;
      }
    }


    if (startIndex < 0) {
      const source = normalizeWithMap(fullText);
      const target = normalizeWithMap(searchText);
      const normIdx = source.normalized.indexOf(target.normalized);
      if (normIdx >= 0) {
        startIndex = source.map[normIdx] ?? -1;
        const tailIdx = normIdx + target.normalized.length - 1;
        endIndex = tailIdx < source.map.length ? source.map[tailIdx] + 1 : -1;
      }
    }


    if (startIndex < 0 && searchText.length > 60) {
      const leadWords = searchText.trim().split(/\s+/).slice(0, 12).join(' ');
      const source = normalizeWithMap(fullText);
      const target = normalizeWithMap(leadWords);
      const normIdx = source.normalized.indexOf(target.normalized);
      if (normIdx >= 0) {
        startIndex = source.map[normIdx] ?? -1;

        const approxEnd = startIndex + searchText.length;
        endIndex = Math.min(approxEnd, fullText.length);
      }
    }

    if (startIndex < 0 || endIndex <= startIndex) return null;

    const indexToPos = (idx) => {
      const seg = segments.find((s) => idx >= s.start && idx <= s.end);
      if (!seg) return null;
      return seg.pos + Math.max(0, Math.min(idx - seg.start, seg.text.length));
    };

    const from = indexToPos(startIndex);
    const to = indexToPos(endIndex);
    if (typeof from !== 'number' || typeof to !== 'number' || to <= from) return null;
    return { from, to };
  }, [editor]);


  const handleApplySuggestion = async (suggestion) => {
    try {
      if (editorViewMode === 'fidelity') {
        const fidelityApplied = applySuggestionToFidelity(suggestion);
        if (fidelityApplied) {
          setChangeHistory(prev => [...prev, {
            type: 'suggestion',
            instruction: suggestion.title || 'Suggestion Applied',
            summary: `Inserted in fidelity view: "${(suggestion.suggestedText || '').substring(0, 80)}..."`,
            originalText: suggestion.originalText || '',
            suggestedText: suggestion.suggestedText || '',
            timestamp: new Date().toISOString(),
            applied: true,
            reverted: false,
            mode: 'fidelity',
          }]);
          toast({
            title: 'Suggestion inserted in fidelity view',
            description: selectedFidelityBlock?.id
              ? 'Applied to selected block.'
              : 'No block selected, so applied to the first text block.',
            status: 'success',
            duration: 2500,
          });
          return;
        }
        toast({
          title: 'No fidelity block available',
          description: 'Could not find a target block to insert the suggestion.',
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      let applied = false;
      let syncSucceeded = true;
      let toastDesc = 'Marked as reviewed';
      const applyTraceId = `apply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      console.info('[APPLY][FRONTEND] start', {
        traceId: applyTraceId,
        type: suggestion?.type || 'unknown',
        suggestionId: suggestion?.suggestionId || null,
        editorViewMode,
        hasEditor: !!editor,
      });


      const idKey = suggestion.idempotencyKey ||
        `${suggestion.type || 'generic'}::${(suggestion.title || '').substring(0, 60)}::${(suggestion.suggestedText || '').substring(0, 60)}`;
      if (appliedSuggestionsRef.current.has(idKey)) {
        toast({
          title: 'Already applied',
          description: `"${suggestion.title || 'This suggestion'}" has already been applied to this document.`,
          status: 'info',
          duration: 3000,
        });
        return;
      }


      const hasOriginal = !!(suggestion.originalText && suggestion.originalText.trim());
      const hasSuggested = !!(suggestion.suggestedText && suggestion.suggestedText.trim());

      if (!editor) {
        console.warn('[APPLY][FRONTEND] editor-missing, using-fidelity-fallback', {
          traceId: applyTraceId,
          type: suggestion?.type || 'unknown',
        });
        const fallbackApplied = applySuggestionToFidelity(suggestion);
        if (fallbackApplied) {
          setHasUnsavedChanges(true);
          toast({
            title: 'Suggestion inserted',
            description: 'Applied using fidelity fallback. Use Rebuild/refresh view if needed.',
            status: 'success',
            duration: 3000,
          });
          return;
        }
        toast({
          title: 'Editor not ready',
          description: 'Could not insert suggestion. Please retry once the editor is fully loaded.',
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      // If local editor snapshot is stale/partial compared to server DOCX, rehydrate before applying.
      const fileIdForHydration = selectedFile?._id || session?.fileId;
      if (editorViewMode === 'editable' && fileIdForHydration) {
        try {
          const st = await fileService.getDocxStatus(fileIdForHydration);
          const serverTextLen = String(st?.docxHtml || '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .length;
          const localTextLen = String(editor.getText() || '').trim().length;
          const serverHtml = String(st?.docxHtml || '').trim();

          if (serverHtml && serverTextLen > 800 && localTextLen < Math.max(180, Math.floor(serverTextLen * 0.35))) {
            console.warn('[APPLY][FRONTEND] rehydrating-editor-from-server-docx', {
              traceId: applyTraceId,
              fileId: fileIdForHydration,
              localTextLen,
              serverTextLen,
            });
            editor.commands.setContent(serverHtml);
            setDocxHtmlState(serverHtml);
            if (st?.docxFileUrl) setDocxFileUrlState(st.docxFileUrl);
          }
        } catch (rehydrateErr) {
          console.warn('[APPLY][FRONTEND] rehydrate-check-failed', {
            traceId: applyTraceId,
            message: rehydrateErr?.message || String(rehydrateErr),
          });
        }
      }



      const AI_DRIVEN_TYPES = new Set([
        'contradiction_fix', 'outdated_ref', 'compliance_fix',
        'missing_clause', 'chronology_fix', 'precedence_apply', 'insert_clause',

        'legal_compliance', 'risk_warning', 'language', 'formatting',
      ]);
      const isAIDriven = AI_DRIVEN_TYPES.has(suggestion.type);


      const normalizeForSearch = (text) => text
        .replace(/[\u2018\u2019\u201A]/g, "'")
        .replace(/[\u201C\u201D\u201E]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[\u2026]/g, '...')
        .replace(/\s+/g, ' ')
        .trim();



      const fuzzyFindRange = (text) => {
        if (!text) return null;

        let range = findRangeInEditor(text);
        if (range) return range;

        const normalized = normalizeForSearch(text);
        if (normalized !== text) {
          range = findRangeInEditor(normalized);
          if (range) return range;
        }

        if (text.length > 120) {
          range = findRangeInEditor(text.substring(0, 120));
          if (range) return { from: range.from, to: range.from + text.length > range.to ? range.to : range.from + text.length };
        }

        if (text.length > 60) {
          range = findRangeInEditor(text.substring(0, 60));
          if (range) return { from: range.from, to: Math.min(range.from + text.length, editor.state.doc.content.size) };
        }

        const words = normalized.split(' ');
        if (words.length >= 4) {
          const chunk = words.slice(0, 4).join(' ');
          range = findRangeInEditor(chunk);
          if (range) return { from: range.from, to: Math.min(range.from + text.length, editor.state.doc.content.size) };
        }
        return null;
      };

      const findAnchorRange = (hints = []) => {
        const normalizedHints = (Array.isArray(hints) ? hints : [hints])
          .map(h => String(h || '').replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim())
          .filter(h => h.length >= 8)
          .sort((a, b) => b.length - a.length);
        for (const hint of normalizedHints) {
          const direct = findRangeInEditor(hint);
          if (direct) return direct;
          const words = hint.split(' ').filter(Boolean);
          if (words.length >= 3) {
            const lead = words.slice(0, 5).join(' ');
            const approx = findRangeInEditor(lead);
            if (approx) return approx;
          }
        }
        return null;
      };

      const getKeywordTokens = (hints = []) => {
        const stop = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'under', 'over', 'your', 'rule', 'issue', 'legal', 'document', 'clause']);
        return (Array.isArray(hints) ? hints : [hints])
          .map(h => String(h || '').toLowerCase())
          .join(' ')
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w && w.length >= 4 && !stop.has(w));
      };

      const findBestKeywordAnchor = (hints = [], anchorType = '') => {
        const tokens = getKeywordTokens(hints);
        if (tokens.length < 2) return null;

        const candidates = [];
        const docSize = editor.state.doc.content.size || 1;
        editor.state.doc.descendants((node, pos) => {
          const isTextBlock = node?.type?.name === 'paragraph' || node?.type?.name === 'heading';
          if (!isTextBlock) return true;
          const text = String(node.textContent || '').replace(/\s+/g, ' ').trim();
          if (!text) return true;

          const low = text.toLowerCase();
          let score = 0;
          for (const t of tokens) {
            if (low.includes(t)) score += 1;
          }

          if (anchorType === 'precedence_apply') {
            if (/precedent|precedence|authorit|citation|case law|judgment/.test(low)) score += 3;
            const isVeryTop = (pos / docSize) < 0.12;
            const hasStrongHeading = /precedent|precedence|authorit|citation|case law|judgment|grounds|legal basis/.test(low);
            if (isVeryTop && !hasStrongHeading) score -= 2;
          }
          if (anchorType === 'compliance_fix') {
            if (/compliance|mandatory|required|shall|obligation|penalty/.test(low)) score += 2;
            if ((pos / docSize) < 0.1 && !/compliance|obligation|mandatory|required/.test(low)) score -= 1;
          }

          if (score > 0) {
            candidates.push({ score, from: pos + 1, to: pos + node.nodeSize - 1 });
          }
          return true;
        });

        if (!candidates.length) return null;
        candidates.sort((a, b) => b.score - a.score);
        return { from: candidates[0].from, to: candidates[0].to };
      };

      const findAiAnchorRange = async (hints = [], anchorType = '') => {
        try {
          const blocks = [];
          editor.state.doc.descendants((node, pos) => {
            const isTextBlock = node?.type?.name === 'paragraph' || node?.type?.name === 'heading';
            if (!isTextBlock) return true;
            const text = String(node.textContent || '').replace(/\s+/g, ' ').trim();
            if (!text) return true;
            blocks.push({ index: blocks.length, from: pos + 1, to: pos + node.nodeSize - 1, text: text.slice(0, 260) });
            return true;
          });

          if (!blocks.length) return null;

          const shortlist = blocks.slice(0, 180).map(b => ({ index: b.index, text: b.text }));
          const prompt = `You are a legal insertion planner. Choose the best paragraph index after which the new text should be inserted.

INSERTION TYPE: ${anchorType || 'general'}
HINTS: ${(Array.isArray(hints) ? hints : [hints]).map(h => String(h || '').trim()).filter(Boolean).join(' | ')}

PARAGRAPHS (JSON):
${JSON.stringify(shortlist)}

PLACEMENT RULES:
- Do not choose opening/title/intro paragraphs unless they explicitly contain legal precedent/compliance heading keywords.
- For precedence_apply, prefer sections such as precedents, authorities, case law, legal basis, grounds, or argument blocks.
- Return the index of the most contextually relevant paragraph, not the first paragraph.

Respond ONLY JSON:
{"paragraphIndex":<number>}`;

          const aiRes = await Promise.race([
            fileService.aiChatAboutDocument(prompt, editor.getText().substring(0, 500), [], language || 'en'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('anchor-timeout')), 20000)),
          ]);
          const raw = String(aiRes?.response || '').trim();
          const match = raw.match(/\{[\s\S]*?\}/);
          if (!match) return null;
          const parsed = JSON.parse(match[0]);
          const idx = Number(parsed?.paragraphIndex);
          if (!Number.isInteger(idx) || idx < 0) return null;
          let target = blocks.find(b => b.index === idx);

          // Guard against low-quality AI placements at the document start.
          if (target && (anchorType === 'precedence_apply' || anchorType === 'compliance_fix')) {
            const isNearTop = target.index <= 1;
            const targetLow = String(target.text || '').toLowerCase();
            const hasExpectedHeading = anchorType === 'precedence_apply'
              ? /precedent|precedence|authorit|citation|case law|judgment|grounds|legal basis/.test(targetLow)
              : /compliance|obligation|mandatory|required|penalty/.test(targetLow);

            if (isNearTop && !hasExpectedHeading) {
              const keywordAnchor = findBestKeywordAnchor(hints, anchorType);
              if (keywordAnchor) return keywordAnchor;

              const laterIndex = Math.floor(blocks.length * 0.62);
              target = blocks[Math.min(Math.max(laterIndex, 0), blocks.length - 1)];
            }
          }
          return target ? { from: target.from, to: target.to } : null;
        } catch (_) {
          return null;
        }
      };


      const insertAtLocationOrAppend = (originalParagraph, revisedParagraph, descFound, descAppend, anchorHints = [], anchorType = '', allowAppend = true) => {
        const focusAt = (pos) => {
          const p = Math.max(1, Math.min(Number(pos || 1), editor.state.doc.content.size));
          requestAnimationFrame(() => {
            try {
              editor.chain().focus().setTextSelection({ from: p, to: p }).scrollIntoView().run();
            } catch (_) {}
          });
        };

        const insertHighlightedParagraph = (text, insertPos = null) => {
          if (!text) return false;
          const escaped = String(text)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
          const pos = typeof insertPos === 'number' ? insertPos : editor.state.doc.content.size;
          editor.chain().focus().insertContentAt(pos, insertHtml).run();
          focusAt(pos);
          return true;
        };

        if (originalParagraph && revisedParagraph) {
          const range = fuzzyFindRange(originalParagraph);
          if (range) {
            editor.chain().focus()
              .insertContentAt({ from: range.from, to: range.to }, revisedParagraph)
              .setTextSelection({ from: range.from, to: range.from + revisedParagraph.length })
              .scrollIntoView()
              .toggleHighlight({ color: HIGHLIGHT_ADD })
              .run();
            return { applied: true, desc: descFound, mode: 'replace' };
          }
        }

        if (revisedParagraph) {
          const anchor = findAnchorRange(anchorHints) || findBestKeywordAnchor(anchorHints, anchorType);
          if (anchor) {
            const done = insertHighlightedParagraph(revisedParagraph, anchor.to + 1);
            return { applied: !!done, desc: descFound, mode: 'anchor' };
          }
          if (!allowAppend) {
            return { applied: false, desc: 'Could not find a safe insertion point automatically. Please review and insert manually.', mode: 'no-safe-anchor' };
          }
          const done = insertHighlightedParagraph(revisedParagraph);
          return { applied: !!done, desc: descAppend || 'AI fix appended — review position and adjust if needed', mode: 'append' };
        }
        return { applied: false, desc: 'No text to apply', mode: 'none' };
      };

      if (editor) {

        const preApplyHtml = editor.getHTML();
        const preApplyLen = editor.getText().length;


        const checkAndRestore = () => {
          const postLen = editor.getText().length;
          if (preApplyLen > 20 && postLen < preApplyLen * 0.5) {
            console.warn('Safety net: document shrank >50% after apply, restoring.');
            editor.commands.setContent(preApplyHtml);
            toast({ title: 'Content restored', description: 'The edit would have removed too much content. Document restored.', status: 'warning', duration: 4000 });
            return true;
          }
          return false;
        };


        if (hasOriginal && hasSuggested && !isAIDriven) {
          const range = findRangeInEditor(suggestion.originalText);
          if (range) {
            // LLM-enhanced replacement: ask AI to improve the suggested text contextually
            let finalText = suggestion.suggestedText;
            try {
              const surroundingText = editor.getText().substring(
                Math.max(0, range.from - 300), Math.min(editor.getText().length, range.to + 300)
              );
              const enhancePrompt = `You are an expert Indian legal editor. Improve this clause replacement so it is legally precise, contextually appropriate, and well-integrated with the surrounding text.

ORIGINAL CLAUSE: ${String(suggestion.originalText || '').substring(0, 500)}
SUGGESTED REPLACEMENT: ${String(suggestion.suggestedText || '').substring(0, 500)}
SURROUNDING CONTEXT: ${surroundingText.substring(0, 600)}
SUGGESTION TITLE: ${suggestion.title || ''}

Return ONLY the improved replacement text — no explanation, no JSON, no markdown. Keep it concise and legally sound.`;
              const enhanceRes = await Promise.race([
                fileService.aiChatAboutDocument(enhancePrompt, surroundingText.substring(0, 300), [], language || 'en'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 30000))
              ]);
              const enhanced = (enhanceRes?.response || '').trim();
              if (enhanced && enhanced.length > 10 && enhanced.length < suggestion.suggestedText.length * 5) {
                finalText = enhanced;
              }
            } catch (llmErr) {
              console.warn('LLM enhancement failed, using static suggestion:', llmErr.message);
            }
            editor.chain().focus()
              .insertContentAt({ from: range.from, to: range.to }, finalText)
              .setTextSelection({ from: range.from, to: range.from + finalText.length })
              .scrollIntoView()
              .toggleHighlight({ color: HIGHLIGHT_ADD })
              .run();
            applied = true;
            toastDesc = 'AI-enhanced fix highlighted in green';
          } else {

            try {
              const plainText = editor.getText();
              const aiPrompt = `You are a legal document editor. Apply this fix to the correct location in the document.

ORIGINAL TEXT (may be approximate): ${String(suggestion.originalText || '').substring(0, 500)}
SUGGESTED FIX: ${String(suggestion.suggestedText || '').substring(0, 500)}
TITLE: ${suggestion.title || ''}

FULL DOCUMENT TEXT (up to 6000 chars):
${plainText.substring(0, 6000)}

Find the exact paragraph in the document that corresponds to the original text and apply the fix.

Respond ONLY in JSON (no preamble, no markdown fences):
{"originalParagraph":"<exact verbatim text from the document>","revisedParagraph":"<the corrected version>"}`;

              const aiRes = await fileService.aiChatAboutDocument(aiPrompt, plainText.substring(0, 500), [], language || 'en');
              const responseText = (aiRes?.response || '').trim();
              let originalParagraph = '', revisedParagraph = suggestion.suggestedText;
              try {
                const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  originalParagraph = parsed.originalParagraph || '';
                  revisedParagraph = parsed.revisedParagraph || suggestion.suggestedText;
                }
              } catch (_) { revisedParagraph = responseText || suggestion.suggestedText; }

              const result = insertAtLocationOrAppend(originalParagraph, revisedParagraph,
                'AI located and applied the fix (highlighted green)',
                'AI fix applied — original text not found exactly, appended for review');
              applied = result.applied;
              toastDesc = result.desc;
            } catch (aiErr) {
              console.warn('AI fallback failed:', aiErr.message);
              toast({ title: 'Text not found in document', description: 'The original text may have been modified. Suggestion marked as applied.', status: 'warning', duration: 4000 });
            }
          }
          setChangeHistory(prev => [...prev, {
            type: 'suggestion',
            instruction: suggestion.instruction || suggestion.title || 'Smart Suggestion',
              summary: `Replaced: "${String(suggestion.originalText || '').substring(0, 50)}..." → "${String(suggestion.suggestedText || '').substring(0, 50)}..."`,
            originalText: suggestion.originalText,
            suggestedText: suggestion.suggestedText,
            timestamp: new Date().toISOString(),
            applied: true,
            reverted: false,
          }]);


        } else if (isAIDriven) {
          try {
            const plainText = editor.getText();
            let llmPrompt;

            if (suggestion.type === 'contradiction_fix') {
              llmPrompt = `You are a legal document editor. Two clauses in the document contradict each other:

TOPIC A (label): "${suggestion.clause1 || 'Clause 1'}"
TOPIC B (label): "${suggestion.clause2 || 'Clause 2'}"
WHAT THE CONTRADICTION IS: ${suggestion.contradiction || suggestion.description || ''}
SUGGESTED RESOLUTION: ${suggestion.suggestedText}

NOTE: The labels above are AI-generated topic summaries, not verbatim text. Search the document for paragraphs that DISCUSS these topics.

FULL DOCUMENT TEXT (up to 6000 chars):
${plainText.substring(0, 6000)}

TASK:
1. Find the specific paragraph or sentence that embodies the contradiction between topics A and B.
2. Return a corrected version of that paragraph that resolves the contradiction per the suggested resolution.

Respond ONLY in this JSON format (no preamble, no markdown fences):
{"originalParagraph":"<exact sentence or paragraph verbatim from the document above>","revisedParagraph":"<the same text rewritten to resolve the contradiction>"}

CRITICAL: "originalParagraph" must be a verbatim copy of a real sentence/paragraph from the document — do NOT paraphrase or invent text.`;

            } else if (suggestion.type === 'outdated_ref') {
              llmPrompt = `You are a legal document editor. An outdated legal reference must be updated:

OUTDATED REFERENCE: ${suggestion.originalText || suggestion.title}
CURRENT LAW / REPLACEMENT: ${suggestion.suggestedText}
DESCRIPTION: ${suggestion.description || ''}

FULL DOCUMENT TEXT (up to 6000 chars):
${plainText.substring(0, 6000)}

Find all occurrences of the outdated reference and replace with the current law.
Respond ONLY in this JSON format (no preamble, no markdown fences):
{"originalParagraph":"<exact verbatim sentence/paragraph from the document containing the outdated ref>","revisedParagraph":"<same text but with the updated reference substituted in>"}`;

            } else if (suggestion.type === 'compliance_fix') {
              llmPrompt = `You are a legal document editor. A compliance issue was detected:

RULE: ${suggestion.title}
ISSUE: ${suggestion.description || suggestion.suggestedText}

FULL DOCUMENT TEXT (up to 6000 chars):
${plainText.substring(0, 6000)}

Your task: Find and fix the specific section of the document that violates this compliance rule.

Respond ONLY in this JSON format (no preamble, no markdown fences):
{"originalParagraph":"<exact verbatim text from the document that violates the rule>","revisedParagraph":"<corrected text that complies with the rule>"}

CRITICAL: originalParagraph must be verbatim from the document above.`;

            } else if (suggestion.type === 'missing_clause' || suggestion.type === 'insert_clause') {
              llmPrompt = `You are a legal document editor. A clause must be added to this document:

CLAUSE TYPE: ${suggestion.title}
REQUIREMENT: ${suggestion.description || suggestion.suggestedText}

FULL DOCUMENT TEXT (up to 5000 chars):
${plainText.substring(0, 5000)}

Your task:
1. Draft the exact legal clause to insert, using language consistent with the document.
2. Identify the paragraph in the document AFTER WHICH this clause should be placed.

Respond ONLY in this JSON format (no preamble, no markdown fences):
{"insertAfterParagraph":"<exact verbatim paragraph from the document after which the clause should be placed>","clauseText":"<the full clause text to insert>"}

CRITICAL: insertAfterParagraph must be verbatim from the document. If unsure of placement, set it to "".`;

            } else if (suggestion.type === 'chronology_fix') {
              llmPrompt = `You are a legal document editor. A chronology/order issue was detected:

FOUND ORDER: ${suggestion.foundOrder || suggestion.originalText || ''}
EXPECTED ORDER: ${suggestion.expectedOrder || suggestion.suggestedText || ''}
DESCRIPTION: ${suggestion.description || ''}

FULL DOCUMENT TEXT (up to 6000 chars):
${plainText.substring(0, 6000)}

Your task: Find the section(s) of the document that are out of order and generate the corrected version(s) with proper sequence.

Respond ONLY in this JSON format (no preamble, no markdown fences):
{"originalParagraph":"<exact verbatim text from the document that is out of order>","revisedParagraph":"<corrected text with proper chronological sequence>"}

CRITICAL: originalParagraph must be verbatim from the document above. Set to "" only if truly not found.`;

            } else if (suggestion.type === 'precedence_apply') {
              llmPrompt = `You are a legal document editor. A case citation must be woven into the document.
              
CASE NAME: ${suggestion.caseName || ''}
CITATION: ${suggestion.citation || ''}
LEGAL PRINCIPLE: ${suggestion.principle || suggestion.suggestedText}

DOCUMENT CONTEXT (first 6000 chars):
${plainText.substring(0, 6000)}

Your task:
1. Identify if there is a specific "Precedences", "Authorities", or similar section where this case should go. If so, return that section's last paragraph as "insertAfterParagraph" and the formatted citation as "clauseText".
2. Alternatively, identify the single paragraph from the document that is MOST topically relevant to this legal principle. Return that paragraph unchanged as "originalParagraph" and as "revisedParagraph", return the same paragraph with the citation naturally integrated at the end, formatted as: "(See: ${suggestion.caseName || 'case'}${suggestion.citation ? `, ${suggestion.citation}` : ''} — ${(suggestion.principle || '').substring(0, 120)})".

Respond ONLY in JSON (no preamble, no markdown):
{"insertAfterParagraph":"<exact paragraph to insert after>", "clauseText":"<new case citation paragraph>"}
OR
{"originalParagraph":"<exact paragraph text from document>", "revisedParagraph":"<paragraph + citation appended>"}
`;

            } else {

              llmPrompt = `You are a legal document editor. Apply this fix to the correct location in the document.

ISSUE TYPE: ${suggestion.type}
TITLE: ${suggestion.title || ''}
DESCRIPTION: ${suggestion.description || ''}
SUGGESTED FIX: ${String(suggestion.suggestedText || '').substring(0, 500)}

FULL DOCUMENT TEXT (up to 6000 chars):
${plainText.substring(0, 6000)}

Find the exact paragraph in the document that this issue applies to and return a corrected version.

Respond ONLY in JSON (no preamble, no markdown fences):
{"originalParagraph":"<exact verbatim text from the document>","revisedParagraph":"<the corrected version>"}

CRITICAL: originalParagraph must be verbatim from the document. If this is a new clause/text to add, use: {"insertAfterParagraph":"<paragraph to insert after>","clauseText":"<text to insert>"}`;
            }

            const aiRes = await fileService.aiChatAboutDocument(
              llmPrompt, plainText.substring(0, 500), [], language || 'en'
            );
            const responseText = (aiRes?.response || '').trim();

            let originalParagraph = '';
            let revisedParagraph = suggestion.suggestedText;

            if (suggestion.type === 'missing_clause' || suggestion.type === 'insert_clause') {

              try {
                const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  const insertAfter = parsed.insertAfterParagraph || '';
                  const clauseText = parsed.clauseText || responseText || suggestion.suggestedText;

                  if (insertAfter) {
                    const range = fuzzyFindRange(insertAfter);
                    if (range) {

                      const escaped = clauseText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                      const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
                      editor.chain().focus().insertContentAt(range.to + 1, insertHtml).run();
                      applied = true;
                      toastDesc = 'Clause inserted at appropriate location (highlighted green)';
                    }
                  }
                  if (!applied) {

                    const escaped = clauseText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
                    editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
                    editor.commands.setTextSelection({ from: Math.max(1, editor.state.doc.content.size - 5), to: Math.max(1, editor.state.doc.content.size - 5) });
                    editor.commands.scrollIntoView();
                    applied = true;
                    toastDesc = 'Clause appended — AI could not determine exact position';
                  }
                  revisedParagraph = clauseText;
                }
              } catch (_) {

                revisedParagraph = responseText || suggestion.suggestedText;
                const escaped = revisedParagraph.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
                editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
                editor.commands.setTextSelection({ from: Math.max(1, editor.state.doc.content.size - 5), to: Math.max(1, editor.state.doc.content.size - 5) });
                editor.commands.scrollIntoView();
                applied = true;
                toastDesc = 'Clause appended (highlighted green)';
              }
            } else {

              let parsed = null;
              try {
                const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                  parsed = JSON.parse(jsonMatch[0]);

                  if (parsed.insertAfterParagraph !== undefined && parsed.clauseText) {
                    const insertAfter = parsed.insertAfterParagraph || '';
                    const clauseText = parsed.clauseText;
                    const escaped = clauseText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
                    if (insertAfter) {
                      const range = fuzzyFindRange(insertAfter);
                      if (range) {
                        editor.chain().focus().insertContentAt(range.to + 1, insertHtml).run();
                        editor.commands.setTextSelection({ from: Math.max(1, range.to), to: Math.max(1, range.to) });
                        editor.commands.scrollIntoView();
                        applied = true;
                        toastDesc = 'AI fix inserted at appropriate location (highlighted green)';
                        revisedParagraph = clauseText;
                      }
                    }
                    if (!applied) {
                      editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
                      editor.commands.setTextSelection({ from: Math.max(1, editor.state.doc.content.size - 5), to: Math.max(1, editor.state.doc.content.size - 5) });
                      editor.commands.scrollIntoView();
                      applied = true;
                      toastDesc = 'AI fix appended (highlighted green)';
                      revisedParagraph = clauseText;
                    }
                  } else {
                    originalParagraph = parsed.originalParagraph || '';
                    revisedParagraph = parsed.revisedParagraph || suggestion.suggestedText;
                  }
                }

                // For precedence_apply if the AI chose insertAfterParagraph instead
                if (suggestion.type === 'precedence_apply' && !originalParagraph && parsed && parsed.insertAfterParagraph !== undefined) {
                  const insertAfter = parsed.insertAfterParagraph || '';
                  const clauseText = String(parsed.clauseText || revisedParagraph || suggestion.suggestedText || '').trim();
                  const escaped = clauseText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                  const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
                  if (insertAfter) {
                    const range = fuzzyFindRange(insertAfter);
                    if (range) {
                      editor.chain().focus().insertContentAt(range.to + 1, insertHtml).run();
                      editor.commands.setTextSelection({ from: Math.max(1, range.to), to: Math.max(1, range.to) });
                      editor.commands.scrollIntoView();
                      applied = true;
                      toastDesc = 'Case citation inserted under specific section (highlighted green)';
                      revisedParagraph = clauseText;
                    }
                  }
                  if (!applied && clauseText) {
                    editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
                    editor.commands.setTextSelection({ from: Math.max(1, editor.state.doc.content.size - 5), to: Math.max(1, editor.state.doc.content.size - 5) });
                    editor.commands.scrollIntoView();
                    applied = true;
                    toastDesc = 'Case citation appended (highlighted green)';
                    revisedParagraph = clauseText;
                  }
                }
              } catch (_) {
                revisedParagraph = responseText || suggestion.suggestedText;
              }

              if (!applied) {
                const strictPlacementTypes = new Set(['precedence_apply', 'compliance_fix', 'missing_clause', 'insert_clause']);
                if (strictPlacementTypes.has(suggestion.type) && revisedParagraph) {
                  const aiAnchor = await findAiAnchorRange([suggestion.title, suggestion.description, suggestion.caseName, suggestion.principle], suggestion.type);
                  if (aiAnchor) {
                    const escaped = String(revisedParagraph).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
                    editor.chain().focus().insertContentAt(aiAnchor.to + 1, insertHtml).run();
                    editor.commands.setTextSelection({ from: Math.max(1, aiAnchor.to), to: Math.max(1, aiAnchor.to) });
                    editor.commands.scrollIntoView();
                    applied = true;
                    toastDesc = 'AI placed insertion at the most relevant section (highlighted green)';
                    console.info('[APPLY][FRONTEND] ai-anchor-placement', {
                      traceId: applyTraceId,
                      type: suggestion?.type,
                      aiAnchorFrom: aiAnchor.from,
                      aiAnchorTo: aiAnchor.to,
                    });
                  }
                }

                if (applied) {
                  // no-op; handled above
                } else {
                const result = insertAtLocationOrAppend(originalParagraph, revisedParagraph,
                  suggestion.type === 'contradiction_fix' ? 'Contradiction resolved with AI (highlighted green)' :
                    suggestion.type === 'outdated_ref' ? 'Reference updated with AI (highlighted green)' :
                      suggestion.type === 'compliance_fix' ? 'Compliance issue fixed with AI (highlighted green)' :
                        suggestion.type === 'precedence_apply' ? `Citation from ${suggestion.caseName || 'case'} woven into document` :
                          suggestion.type === 'chronology_fix' ? 'Chronology corrected with AI (highlighted green)' :
                            'AI fix applied (highlighted green)',
                  'AI fix appended — original text not found exactly, review position',
                  [suggestion.title, suggestion.description, suggestion.caseName, suggestion.principle],
                  suggestion.type,
                  !strictPlacementTypes.has(suggestion.type));
                applied = result.applied;
                toastDesc = result.desc;
                console.info('[APPLY][FRONTEND] insertion-result', {
                  traceId: applyTraceId,
                  type: suggestion?.type,
                  mode: result.mode,
                  applied: result.applied,
                });
                }
              }
            }

            setChangeHistory(prev => [...prev, {
              type: 'suggestion',
              instruction: suggestion.title || 'AI Resolution',
              summary: `AI fixed: "${String(revisedParagraph || suggestion.suggestedText || '').substring(0, 80)}…"`,
              originalText: originalParagraph,
              suggestedText: revisedParagraph || suggestion.suggestedText,
              timestamp: new Date().toISOString(),
              applied: true,
              reverted: false,
              model: 'llm',
            }]);
          } catch (aiError) {
            console.warn('LLM resolution failed, applying static text:', aiError.message);
            const fallbackText = String(suggestion.suggestedText || suggestion.description || suggestion.title || 'Review this suggested edit manually')
              .trim();
            const escaped = fallbackText
              .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
            editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
            editor.commands.setTextSelection({ from: Math.max(1, editor.state.doc.content.size - 5), to: Math.max(1, editor.state.doc.content.size - 5) });
            editor.commands.scrollIntoView();
            applied = true;
            toastDesc = 'Suggestion applied (fallback — LLM unavailable)';
          }


        } else if (hasSuggested) {
          try {
            const plainText = editor.getText();
            const aiPrompt = `You are a legal document editor. Insert this clause/text into the most appropriate location in the document.

TEXT TO INSERT: ${String(suggestion.suggestedText || '').substring(0, 1000)}
CONTEXT: ${suggestion.title || ''} — ${suggestion.description || ''}

FULL DOCUMENT (up to 6000 chars):
${plainText.substring(0, 6000)}

Find the best paragraph AFTER which to insert the new text, and return the insert.
Respond ONLY in JSON: {"insertAfterParagraph":"<exact verbatim paragraph from doc>","clauseText":"<the text to insert, refined for context>"}`;

            const aiRes = await fileService.aiChatAboutDocument(aiPrompt, plainText.substring(0, 500), [], language || 'en');
            const responseText = (aiRes?.response || '').trim();
            let clauseInserted = false;
            try {
              const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                const afterPara = parsed.insertAfterParagraph || '';
                const clauseText = parsed.clauseText || suggestion.suggestedText;
                if (afterPara) {
                  const range = fuzzyFindRange(afterPara);
                  if (range) {
                    const escaped = clauseText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
                    editor.chain().focus().insertContentAt(range.to + 1, insertHtml).run();
                    editor.commands.setTextSelection({ from: Math.max(1, range.to), to: Math.max(1, range.to) });
                    editor.commands.scrollIntoView();
                    clauseInserted = true;
                  }
                }
              }
            } catch (_) { }

            if (!clauseInserted) {
              const escaped = suggestion.suggestedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
              editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
              editor.commands.setTextSelection({ from: Math.max(1, editor.state.doc.content.size - 5), to: Math.max(1, editor.state.doc.content.size - 5) });
              editor.commands.scrollIntoView();
            }
            applied = true;
            toastDesc = clauseInserted ? 'AI placed clause at appropriate location (highlighted)' : 'Clause appended to end of document (highlighted)';
          } catch (aiErr) {
            console.warn('AI placement failed:', aiErr.message);
            const escaped = suggestion.suggestedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
            editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
            editor.commands.setTextSelection({ from: Math.max(1, editor.state.doc.content.size - 5), to: Math.max(1, editor.state.doc.content.size - 5) });
            editor.commands.scrollIntoView();
            applied = true;
            toastDesc = 'Clause appended (AI unavailable)';
          }
          setChangeHistory(prev => [...prev, {
            type: 'suggestion',
            instruction: suggestion.title || 'Missing Clause Added',
            summary: `Appended: "${String(suggestion.suggestedText || '').substring(0, 80)}..."`,
            originalText: '',
            suggestedText: suggestion.suggestedText,
            timestamp: new Date().toISOString(),
            applied: true,
            reverted: false,
          }]);


        } else {
          const genPrompt = suggestion.description
            ? `Based on this suggestion: "${suggestion.description}" — write the exact clause or text that should be added to this legal document. Return ONLY the clause text, no explanation.`
            : `Write a standard ${suggestion.title || 'legal clause'} for this document. Return ONLY the clause text.`;
          try {
            const plainText = editor?.getText() || '';
            const aiRes = await fileService.aiChatAboutDocument(genPrompt, plainText.substring(0, 500), [], language || 'en');
            const generatedText = (aiRes?.response || '').trim();
            if (generatedText) {
              const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${generatedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                }</mark></p>`;
              editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
              editor.commands.setTextSelection({ from: Math.max(1, editor.state.doc.content.size - 5), to: Math.max(1, editor.state.doc.content.size - 5) });
              editor.commands.scrollIntoView();
              applied = true;
              toastDesc = 'AI-generated clause appended (highlighted in green)';
              setChangeHistory(prev => [...prev, {
                type: 'suggestion',
                instruction: suggestion.title || 'AI Generated Clause',
                summary: `AI generated: "${generatedText.substring(0, 80)}..."`,
                originalText: '',
                suggestedText: generatedText,
                timestamp: new Date().toISOString(),
                applied: true,
                reverted: false,
              }]);
            } else {
              toastDesc = `Could not generate text. Review manually: ${suggestion.description || suggestion.title}`;
            }
          } catch (aiErr) {
            console.warn('AI generate clause failed:', aiErr.message);
            toastDesc = `No automatic text change: ${suggestion.description || 'review this suggestion manually'}`;
          }
        }


        if (applied && checkAndRestore()) {
          applied = false;
          toastDesc = 'Edit rolled back — content protection triggered';
        }
      }


      if (applied) {
        appliedSuggestionsRef.current.add(idKey);
      }
      if (applied) {
      // Remove the resolved issue from overview stats only when a real edit was applied.
      setLocalScanArrays(prev => {
        const type = suggestion.type || '';
        const desc = (suggestion.description || '').toLowerCase().trim();
        const title = (suggestion.title || '').toLowerCase();
        if (type === 'legal_compliance' || type === 'compliance_fix') {
          return {
            ...prev, complianceIssues: prev.complianceIssues.filter(c =>
              (c.description || '').toLowerCase().trim() !== desc &&
              !title.startsWith('compliance: ' + (c.rule || '').toLowerCase().trim().substring(0, 20))
            )
          };
        }
        if (type === 'clause_improvement') {
          return {
            ...prev, clauseFlaws: prev.clauseFlaws.filter(f =>
              (f.issue || '').toLowerCase().trim() !== desc
            )
          };
        }
        if (type === 'missing_clause' || type === 'insert_clause') {
          return {
            ...prev, missingClauses: prev.missingClauses.filter(m =>
              !title.includes((m.clauseType || '').toLowerCase().trim().substring(0, 20))
            )
          };
        }
        if (type === 'contradiction_fix') {
          return {
            ...prev, internalContradictions: prev.internalContradictions.filter(c =>
              (c.description || '').toLowerCase().trim() !== desc &&
              !(c.contradiction || '').toLowerCase().includes(desc.substring(0, 40))
            )
          };
        }
        if (type === 'outdated_ref') {
          return {
            ...prev, outdatedReferences: prev.outdatedReferences.filter(o =>
              (o.description || o.reference || '').toLowerCase().trim() !== desc
            )
          };
        }
        if (type === 'chronology_fix') {
          return {
            ...prev, chronologicalIssues: prev.chronologicalIssues.filter(ci =>
              (ci.description || '').toLowerCase().trim() !== desc
            )
          };
        }
        if (type === 'precedence_apply') {
          return {
            ...prev, precedenceAnalysis: prev.precedenceAnalysis.filter(p =>
              (p.caseName || '').toLowerCase() !== (suggestion.caseName || '').toLowerCase()
            )
          };
        }
        return prev;
      });
      }

      if (applied && editorViewMode === 'editable' && editor) {
        const fileIdForSync = selectedFile?._id || session?.fileId;
        if (fileIdForSync) {
          setIsOnlyOfficeSyncing(true);
          try {
            const rawSyncHtml = String(editor.getHTML() || '');
            const alignMatches = [...rawSyncHtml.matchAll(/text-align\s*:\s*(left|center|right|justify)/gi)]
              .map((m) => String(m[1] || '').toLowerCase())
              .filter(Boolean);
            const alignmentCounts = alignMatches.reduce((acc, a) => {
              acc[a] = (acc[a] || 0) + 1;
              return acc;
            }, {});
            const metadataAlign = String(session?.formatMetadata?.bodyAlignment || '').toLowerCase();
            const dominantAlign = Object.keys(alignmentCounts).sort((a, b) => alignmentCounts[b] - alignmentCounts[a])[0]
              || (metadataAlign === 'justified' ? 'justify' : metadataAlign)
              || 'left';

            const htmlAligned = rawSyncHtml.replace(/<p(?![^>]*text-align)([^>]*)>/gi, `<p style="text-align:${dominantAlign};"$1>`);
            const htmlForSync = String(htmlAligned || '')
              .replace(/<mark\b[^>]*>/gi, '')
              .replace(/<\/mark>/gi, '');

            console.info('[SYNC][FRONTEND] start', {
              traceId: applyTraceId,
              fileId: fileIdForSync,
              type: suggestion?.type,
            });

            await fileService.syncOnlyOfficeDocx(fileIdForSync, htmlForSync, editor.getText(), {
              traceId: applyTraceId,
              suggestionType: suggestion?.type || '',
              suggestionId: suggestion?.suggestionId || '',
              forceSuggestionSync: true,
              htmlLength: String(htmlForSync || '').length,
              textLength: String(editor.getText() || '').length,
            });
            setOnlyOfficeRefreshKey(prev => prev + 1);
            toastDesc = `${toastDesc}. Synced to OnlyOffice`;
            console.info('[SYNC][FRONTEND] success', {
              traceId: applyTraceId,
              fileId: fileIdForSync,
            });
          } catch (syncErr) {
            syncSucceeded = false;
            console.warn('[SYNC][FRONTEND] failed', {
              traceId: applyTraceId,
              fileId: fileIdForSync,
              message: syncErr?.message || String(syncErr),
              status: syncErr?.response?.status || null,
              data: syncErr?.response?.data || null,
            });
            const syncMsg = syncErr?.response?.data?.error || syncErr?.message || 'Not yet synced to OnlyOffice';
            toastDesc = `${toastDesc}. ${syncMsg}`;
          } finally {
            setIsOnlyOfficeSyncing(false);
          }
        }
      }

      if (applied && !syncSucceeded) {
        applied = false;
        console.warn('[APPLY][FRONTEND] not-marked-applied-because-sync-failed', {
          traceId: applyTraceId,
          type: suggestion?.type,
        });
      }


      const sid = suggestion.suggestionId;
      if (!applied) {
        toast({
          title: 'Could not auto-insert safely',
          description: toastDesc || 'No reliable target section found. Suggestion remains pending.',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
      if (!sid) {

        const tempId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        setSuggestions(prev => prev.map(s =>
          s === suggestion ? { ...s, suggestionId: tempId, status: 'applied', _local: true } : s
        ));
        toast({ title: applied ? 'Applied locally' : 'Marked reviewed', description: toastDesc, status: 'info', duration: 2000 });
      } else {
        try {
          await fileService.updateSuggestionStatus(sid, 'applied', selectedFile?._id);
          setSuggestions(prev => prev.map(s =>
            s.suggestionId === sid ? { ...s, status: 'applied' } : s
          ));
          toast({ title: 'Suggestion applied', description: toastDesc, status: 'success', duration: 2000 });
        } catch (err) {

          setSuggestions(prev => prev.map(s =>
            s.suggestionId === sid ? { ...s, status: 'applied' } : s
          ));
          toast({ title: 'Applied locally', description: 'Server sync failed but change was applied.', status: 'warning', duration: 2000 });
        }
      }
    } catch (outerErr) {

      console.warn('[APPLY][FRONTEND] exception', {
        message: outerErr?.message || String(outerErr),
        stack: outerErr?.stack || null,
      });
      toast({ title: 'Apply failed', description: 'No change was committed. Please retry.', status: 'error', duration: 3000 });
    }
  };


  const handleDismissSuggestion = async (suggestion) => {
    const sid = suggestion.suggestionId;
    const match = (s) => sid ? s.suggestionId === sid : s === suggestion;

    setSuggestions(prev => prev.map(s => match(s) ? { ...s, status: 'dismissed' } : s));
    if (sid && !suggestion._local) {
      try {
        await fileService.updateSuggestionStatus(sid, 'dismissed', selectedFile?._id);
      } catch (err) {
        console.warn('Dismiss sync failed:', err.message);
      }
    }
  };


  const handleUndoSuggestion = useCallback(async (suggestion) => {
    const sid = suggestion.suggestionId;
    const match = (s) => sid ? s.suggestionId === sid : s === suggestion;
    setSuggestions(prev => prev.map(s => match(s) ? { ...s, status: 'pending' } : s));
    if (sid && !suggestion._local) {
      try {
        await fileService.updateSuggestionStatus(sid, 'pending', selectedFile?._id);
      } catch (err) {
        console.warn('Undo sync failed:', err.message);
      }
    }
    toast({ title: 'Suggestion restored', description: 'Suggestion is pending again.', status: 'info', duration: 2000 });
  }, [selectedFile?._id, toast]);

  const fileName = session?.fileName || selectedFile?.fileName || 'Untitled';
  const plainText = editor?.getText() || '';
  const wordCount = plainText.split(/\s+/).filter(w => w).length;
  const charCount = plainText.length;


  const pageStyle = formatMetadata ? {
    fontFamily: `'${formatMetadata.defaultFont}', serif`,
    fontSize: `${formatMetadata.defaultFontSize || 12}pt`,
    lineHeight: formatMetadata.lineSpacing || 1.15,
    paddingTop: `${(formatMetadata.margins?.topInches || 1) * 72}px`,
    paddingRight: `${(formatMetadata.margins?.rightInches || 1) * 72}px`,
    paddingBottom: `${(formatMetadata.margins?.bottomInches || 1) * 72}px`,
    paddingLeft: `${(formatMetadata.margins?.leftInches || 1) * 72}px`,
    textAlign: formatMetadata.bodyAlignment || 'left',
    // Page width from page size (1 inch = 96px CSS) — A4=8.27in, Letter=8.5in, Legal=8.5in
    pageWidth: formatMetadata.pageSize?.name === 'Letter' || formatMetadata.pageSize?.name === 'Legal'
      ? '816px' : formatMetadata.pageSize?.name === 'A5' ? '559px' : '793px',
    paragraphSpacingBefore: formatMetadata.paragraphSpacing?.before
      ? `${formatMetadata.paragraphSpacing.before / 20}pt` : undefined,
    paragraphSpacingAfter: formatMetadata.paragraphSpacing?.after
      ? `${formatMetadata.paragraphSpacing.after / 20}pt` : undefined,
  } : { fontSize: '12pt' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="slideInBottom" closeOnEsc={false}>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg={bgColor} m={0} borderRadius={0} maxH="100vh" h="100vh">
        <ModalHeader bg={headerBg} borderBottom="1px solid" borderColor={borderColor} py={2} px={4}>
          <HStack justify="space-between" w="100%">
            <HStack spacing={3}>
              <FiFileText size={18} />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="600" noOfLines={1} maxW="250px">{fileName}</Text>
                <HStack spacing={1.5}>
                  {scanStatus === 'scanned' && (
                    <Badge colorScheme="green" fontSize="2xs">Scanned</Badge>
                  )}
                  {hasUnsavedChanges && <Badge colorScheme="orange" fontSize="2xs">Unsaved</Badge>}
                  {isSaving && <Badge colorScheme="blue" fontSize="2xs">Saving...</Badge>}
                  {isOnlyOfficeSyncing && <Badge colorScheme="purple" fontSize="2xs">Syncing to OnlyOffice...</Badge>}
                  {lastSaved && !hasUnsavedChanges && !isSaving && (
                    <Badge colorScheme="gray" fontSize="2xs">Saved</Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>

            <HStack spacing={1.5}>
              <Tooltip label={leftSidebarOpen ? 'Hide AI panels' : 'Show AI panels'} fontSize="xs">
                <IconButton
                  data-tour="sidebar-toggle-analysis"
                  icon={leftSidebarOpen ? <MdChevronLeft /> : <MdChevronRight />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  aria-label="Toggle left sidebar"
                />
              </Tooltip>
              <Tooltip label={rightSidebarOpen ? 'Hide suggestions' : 'Show suggestions'} fontSize="xs">
                <IconButton
                  icon={<MdLightbulb />}
                  size="sm"
                  variant={rightSidebarOpen ? 'solid' : 'ghost'}
                  colorScheme={rightSidebarOpen ? 'yellow' : 'gray'}
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  aria-label="Toggle suggestions"
                />
              </Tooltip>
              <Tooltip label={dualViewMode ? 'Exit Role Swap' : 'Role Swap — transform to opposing doc'} fontSize="xs">
                <IconButton
                  icon={<FiColumns />}
                  size="sm"
                  variant={dualViewMode ? 'solid' : 'ghost'}
                  colorScheme={dualViewMode ? 'purple' : 'gray'}
                  onClick={dualViewMode ? exitDualView : enterDualView}
                  aria-label="Toggle dual view"
                />
              </Tooltip>

              <Divider orientation="vertical" h="20px" />
              <HStack spacing={1}>
                <Button
                  size="xs"
                  variant="solid"
                  colorScheme="blue"
                  isDisabled
                >
                  Editable
                </Button>
                <Tooltip
                  label={hasUnsavedChanges ? 'Save first to rebuild' : 'Reconstruct editable from extracted layout'}
                  fontSize="xs"
                >
                  <span>
                    <Button
                      size="xs"
                      variant="outline"
                      isDisabled={!editor || hasUnsavedChanges}
                      onClick={() => {
                        try {
                          const content = getInitialContent();
                          if (content) editor.commands.setContent(content);
                          toast({ title: 'Editable rebuilt', status: 'success', duration: 1500 });
                        } catch (e) {
                          toast({ title: 'Rebuild failed', description: e?.message || String(e), status: 'error', duration: 2500 });
                        }
                      }}
                    >
                      Rebuild
                    </Button>
                  </span>
                </Tooltip>
                {isDevBuild && (
                  <Tooltip
                    label={(() => {
                      const isPdfFile = String(selectedFile?.fileType || session?.fileType || '').toLowerCase().includes('pdf')
                        || String(selectedFile?.fileName || session?.fileName || '').toLowerCase().endsWith('.pdf');
                      if (isPdfFile) return 'PDF editable is locked to raw DOCX mode';
                      return hasUnsavedChanges ? 'Save first, then switch preview mode' : 'Toggle raw Adobe DOCX HTML vs smart editor source';
                    })()}
                    fontSize="xs"
                  >
                    <span>
                      <Button
                        size="xs"
                        variant={devRawDocxPreview ? 'solid' : 'outline'}
                        colorScheme={devRawDocxPreview ? 'purple' : 'gray'}
                        isDisabled={hasUnsavedChanges || String(selectedFile?.fileType || session?.fileType || '').toLowerCase().includes('pdf') || String(selectedFile?.fileName || session?.fileName || '').toLowerCase().endsWith('.pdf')}
                        onClick={() => setDevRawDocxPreview((v) => !v)}
                      >
                        {devRawDocxPreview ? 'Raw DOCX Preview: ON' : 'Raw DOCX Preview: OFF'}
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </HStack>

              <Tooltip label="Search" fontSize="xs">
                <IconButton
                  icon={<FiSearch />}
                  size="sm"
                  variant={searchVisible ? 'solid' : 'ghost'}
                  onClick={() => setSearchVisible(!searchVisible)}
                  aria-label="Search"
                />
              </Tooltip>
              <Tooltip label="Copy all" fontSize="xs">
                <IconButton
                  icon={copied ? <FiCheck /> : <FiCopy />}
                  size="sm"
                  variant="ghost"
                  colorScheme={copied ? 'green' : 'gray'}
                  onClick={handleCopy}
                  aria-label="Copy"
                />
              </Tooltip>
              <Tooltip label="Save (Ctrl+S)" fontSize="xs">
                <IconButton
                  icon={<FiSave />}
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  aria-label="Save"
                />
              </Tooltip>

              <Tooltip label={colorMode === 'light' ? 'Dark Mode' : 'Light Mode'} fontSize="xs">
                <IconButton
                  icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                  size="sm"
                  variant="ghost"
                  onClick={toggleColorMode}
                  aria-label="Toggle theme"
                />
              </Tooltip>

              <DemoLauncher context="editor" />

              <Menu>
                <MenuButton data-tour="download-menu" as={Button} size="sm" colorScheme="green" rightIcon={<FiChevronDown />} leftIcon={<FiDownload />}>
                  Download
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiFile />} onClick={() => handleDownload('docx')}>
                    Download as DOCX
                  </MenuItem>
                  <MenuItem icon={<FiFileText />} onClick={() => handleDownload('pdf')}>
                    Download as PDF
                  </MenuItem>
                  <MenuItem icon={<FiFileText />} onClick={() => handleExportAuditLog('pdf')}>
                    Export Audit Log (Print / PDF)
                  </MenuItem>
                  <MenuItem icon={<FiFile />} onClick={() => handleExportAuditLog('html')}>
                    Export Audit Log (HTML)
                  </MenuItem>
                </MenuList>
              </Menu>

              <IconButton icon={<FiX />} size="sm" variant="ghost" onClick={onClose} aria-label="Close" />
            </HStack>
          </HStack>
        </ModalHeader>

        {searchVisible && (
          <Box px={4} py={1.5} bg={headerBg} borderBottom="1px solid" borderColor={borderColor}>
            <HStack>
              <InputGroup size="sm" maxW="300px">
                <InputLeftElement><FiSearch /></InputLeftElement>
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Button size="sm" onClick={() => { }}>Find</Button>
            </HStack>
          </Box>
        )}

        <ModalBody p={0} display="flex" flexDirection="row" overflow="hidden" data-editor-flex-row>
          {leftSidebarOpen && (
            <Box
              w={`${leftSidebarWidth}px`}
              minW="200px"
              maxW="520px"
              bg={sidebarBg}
              borderRight="none"
              display="flex"
              flexDirection="column"
              h="100%"
              overflow="hidden"
              flexShrink={0}
              position="relative"
            >
              <Tabs
                index={leftTabIndex}
                onChange={setLeftTabIndex}
                flex="1" minH="0" display="flex" flexDirection="column" variant="enclosed-colored" size="sm"
              >
                <TabList px={1} pt={1}>
                  <Tab fontSize="xs"><Icon as={MdDescription} mr={1} /> Analysis</Tab>
                  <Tab fontSize="xs"><Icon as={MdSmartToy} mr={1} /> AI Helper</Tab>
                  <Tab fontSize="xs"><Icon as={MdHistory} mr={1} /> History</Tab>
                </TabList>
                <TabPanels flex="1" minH="0" overflow="hidden">
                  <TabPanel p={0} h="100%" overflowY="auto">
                    <DocumentAnalysisPanel
                      scanResults={scanResults}
                      formatMetadata={formatMetadata}
                      ocrConfidence={ocrConfidence}
                    />
                  </TabPanel>
                  <TabPanel p={0} h="100%" display="flex" minH="0" overflow="hidden">
                    <AIHelperPanel
                      ref={aiHelperRef}
                      selectedText={selectedText}
                      documentType={scanResults?.documentType}
                      language={language}
                      editor={editor}
                    />
                  </TabPanel>
                  <TabPanel p={2} h="100%" overflowY="auto">
                    <VStack align="stretch" spacing={2}>
                      {changeHistory.length === 0 ? (
                        <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                          No edits yet
                        </Text>
                      ) : (
                        changeHistory.slice().reverse().map((change, revIdx) => {
                          const idx = changeHistory.length - 1 - revIdx;
                          const isSuggestion = change.type === 'suggestion';
                          return (
                            <Box
                              key={idx}
                              p={2}
                              bg={useColorModeValue(change.reverted ? 'orange.50' : 'gray.50', change.reverted ? 'orange.900' : 'gray.700')}
                              borderRadius="md"
                              borderLeft="3px solid"
                              borderLeftColor={change.reverted ? 'orange.400' : 'green.400'}
                              opacity={change.reverted ? 0.7 : 1}
                            >
                              <HStack justify="space-between" mb={0.5}>
                                <Badge
                                  fontSize="2xs"
                                  colorScheme={isSuggestion ? 'blue' : 'purple'}
                                  variant="subtle"
                                >
                                  {isSuggestion ? 'Suggestion' : 'AI Edit'}
                                </Badge>
                                <Text fontSize="2xs" color="gray.400">
                                  {change.timestamp ? new Date(change.timestamp).toLocaleTimeString() : ''}
                                </Text>
                              </HStack>
                              <Text fontSize="xs" fontWeight="500" noOfLines={2} mb={1}>
                                {change.instruction || change.summary}
                              </Text>
                              {isSuggestion && change.originalText && (
                                <VStack spacing={1} align="stretch" mt={1}>
                                  <Box px={1.5} py={0.5} bg={useColorModeValue('red.50', 'red.900')} borderRadius="sm" borderLeft="2px solid" borderLeftColor="red.300">
                                    <Text fontSize="2xs" color="red.500" fontWeight="bold">Before:</Text>
                                    <Text fontSize="2xs" noOfLines={2}>{change.originalText}</Text>
                                  </Box>
                                  <Box px={1.5} py={0.5} bg={useColorModeValue('green.50', 'green.900')} borderRadius="sm" borderLeft="2px solid" borderLeftColor="green.300">
                                    <Text fontSize="2xs" color="green.500" fontWeight="bold">After:</Text>
                                    <Text fontSize="2xs" noOfLines={2}>{change.suggestedText}</Text>
                                  </Box>
                                  {!change.reverted && (
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="orange"
                                      fontSize="2xs"
                                      h="20px"
                                      onClick={() => handleRevertChange(idx)}
                                    >
                                      ↩ Revert
                                    </Button>
                                  )}
                                  {change.reverted && (
                                    <Badge fontSize="2xs" colorScheme="orange" variant="outline" alignSelf="flex-start">
                                      Reverted
                                    </Badge>
                                  )}
                                </VStack>
                              )}
                            </Box>
                          );
                        })
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          )}

          {leftSidebarOpen && (
            <Box
              ref={leftDragRef}
              w="5px"
              flexShrink={0}
              h="100%"
              bg="transparent"
              borderRight="1px solid"
              borderColor={borderColor}
              cursor="col-resize"
              _hover={{ bg: 'blue.400', opacity: 0.5 }}
              transition="background 0.15s"
              onMouseDown={(e) => {
                isDraggingLeft.current = true;
                dragStartX.current = e.clientX;
                dragStartWidth.current = leftSidebarWidth;
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
                e.preventDefault();
              }}
            />
          )}


          <Box
            flex={dualViewMode ? undefined : '1'}
            style={dualViewMode ? { flex: 'var(--editor-flex, 1 1 50%)' } : undefined}
            display="flex"
            flexDirection="column"
            h="100%"
            bg={editorCanvasBg}
            overflow="hidden"
            px={0}
          >
            {editorViewMode === 'editable' && (docxStatus === 'pending' || docxStatus === 'failed') && (
              <Box px={4} py={2} bg={docxStatus === 'failed' ? 'red.50' : 'blue.50'} borderBottom="1px solid" borderColor="gray.200">
                <HStack justify="space-between" flexWrap="wrap" gap={2}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" fontWeight="700" color={docxStatus === 'failed' ? 'red.700' : 'blue.700'}>
                      {docxStatus === 'failed' ? 'DOCX conversion failed' : 'Converting PDF to DOCX for better editable alignment...'}
                    </Text>
                    {docxStatus === 'failed' && (
                      <Text fontSize="xs" color="red.700" noOfLines={2}>
                        {docxError || 'Unknown error'}
                      </Text>
                    )}
                  </VStack>
                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      colorScheme={docxStatus === 'failed' ? 'red' : 'blue'}
                      variant="outline"
                      onClick={async () => {
                        try {
                          const fileId = selectedFile?._id || session?.fileId;
                          if (!fileId) return;
                          console.log('[DOCX-Pipeline][UI] convert-click', { fileId });
                          setDocxStatus('pending');
                          setDocxError('');
                          await fileService.convertPdfToDocx(fileId);
                          const st = await fileService.getDocxStatus(fileId);
                          console.log('[DOCX-Pipeline][UI] convert-result', { fileId, status: st?.docxStatus, error: st?.docxError || '' });
                          if (st?.docxStatus) setDocxStatus(st.docxStatus);
                          if (st?.docxError != null) setDocxError(st.docxError || '');
                          toast({ title: 'DOCX conversion complete', status: 'success', duration: 2000 });
                        } catch (e) {
                          console.warn('[DOCX-Pipeline][UI] convert-failed', { error: e?.response?.data?.error || e?.message || String(e) });
                          setDocxStatus('failed');
                          setDocxError(e?.response?.data?.error || e?.message || String(e));
                          toast({ title: 'DOCX conversion failed', status: 'error', duration: 2500 });
                        }
                      }}
                    >
                      {docxStatus === 'failed' ? 'Retry DOCX' : 'Convert now'}
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            )}
            {/* Removed DOCX-ready banner per UX request. */}
            {dualViewMode && (
              <Box
                px={4} py={1.5} bg="purple.600" display="flex" alignItems="center"
                justifyContent="center" flexShrink={0}
              >
                <Text fontSize="xs" fontWeight="bold" color="white" letterSpacing="0.15em" textTransform="uppercase">
                  Petitioner / Original
                </Text>
              </Box>
            )}
            <Box
              data-page-container
              mx={editorViewMode === 'editable' ? 0 : 'auto'}
              my={0}
              mb={0}
              w="100%"
              maxW={editorViewMode === 'editable' ? '100%' : (pageStyle.pageWidth || '793px')}
              minH={editorViewMode === 'editable' ? '100%' : 'calc(100vh - 200px)'}
              pb={editorViewMode === 'editable' ? 0 : '120px'}
              bg={editorViewMode === 'editable' ? 'transparent' : '#ffffff'}
              boxShadow="none"
              borderRadius="0"
              position="relative"
              overflow={editorViewMode === 'editable' ? 'hidden' : 'visible'}
              style={{
                '--page-canvas-bg': editorCanvasBg,
                '--pad-left': pageStyle.paddingLeft || '72px',
                '--pad-right': pageStyle.paddingRight || '72px',
                '--pad-top': pageStyle.paddingTop || '72px',
                '--pad-bottom': pageStyle.paddingBottom || '72px',
              }}
              sx={{
                '.tiptap-editor': {
                  outline: 'none',
                  minHeight: '1000px',
                  overflow: 'visible',
                  padding: pageStyle.paddingTop ? undefined : '72px 72px 72px 72px',
                  fontFamily: pageStyle.fontFamily || "'Times New Roman', serif",
                  fontSize: pageStyle.fontSize || '12pt',
                  lineHeight: pageStyle.lineHeight || 1.5,

                  color: '#1a1a1a',
                  ...(pageStyle.paddingTop ? {
                    paddingTop: pageStyle.paddingTop,
                    paddingRight: pageStyle.paddingRight,
                    paddingBottom: pageStyle.paddingBottom,
                    paddingLeft: pageStyle.paddingLeft,
                  } : {}),
                  '& p': {
                    marginBottom: pageStyle.paragraphSpacingAfter || '0.5em',
                    marginTop: pageStyle.paragraphSpacingBefore || undefined,
                  },
                  '& h1': { fontSize: '2em', fontWeight: 'bold', marginBottom: '0.5em', marginTop: '0.8em' },
                  '& h2': { fontSize: '1.5em', fontWeight: 'bold', marginBottom: '0.4em', marginTop: '0.7em' },
                  '& h3': { fontSize: '1.17em', fontWeight: 'bold', marginBottom: '0.3em', marginTop: '0.6em' },
                  '& h4': { fontSize: '1em', fontWeight: 'bold', marginBottom: '0.3em', marginTop: '0.5em' },
                  '& ul, & ol': { paddingLeft: '1.5em', marginBottom: '0.5em' },
                  '& blockquote': {
                    borderLeft: '3px solid',
                    borderColor: 'gray.300',
                    paddingLeft: '1em',
                    marginLeft: '0.5em',
                    fontStyle: 'italic',
                    color: 'gray.600',
                  },
                  '& hr': { margin: '1em 0', borderColor: 'gray.300' },
                  '& mark': { borderRadius: '2px', padding: '0 2px' },
                  '& table': {
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                    width: '100%',
                    margin: '1em 0',
                    overflow: 'hidden',
                  },
                  '& td, & th': {
                    minWidth: '1em',
                    border: '1px solid #aaa',
                    padding: '4px 8px',
                    verticalAlign: 'top',
                    boxSizing: 'border-box',
                    position: 'relative',
                    '& > *': { marginBottom: 0 },
                  },
                  '& th': {
                    fontWeight: 'bold',
                    textAlign: 'left',
                    backgroundColor: 'rgba(0,0,0,0.06)',
                  },
                  '& .selectedCell:after': {
                    zIndex: 2,
                    position: 'absolute',
                    content: '""',
                    left: 0, right: 0, top: 0, bottom: 0,
                    background: 'rgba(66,153,225,0.2)',
                    pointerEvents: 'none',
                  },
                  '& .column-resize-handle': {
                    position: 'absolute',
                    right: '-2px',
                    top: 0, bottom: 0,
                    width: '4px',
                    zIndex: 20,
                    backgroundColor: '#3182ce',
                    pointerEvents: 'none',
                  },
                  '& .tableWrapper': { overflowX: 'auto' },
                  '& .resize-cursor': { cursor: 'col-resize' },
                },
                '.ProseMirror-focused': {
                  outline: 'none',
                },
                '.ProseMirror': {
                  overflow: 'visible',
                },
                '.ProseMirror p.is-editor-empty:first-of-type::before': {
                  content: 'attr(data-placeholder)',
                  float: 'left',
                  color: useColorModeValue('gray.400', 'gray.500'),
                  pointerEvents: 'none',
                  height: 0,
                },
              }}
            >
              {false ? (
                <VStack align="stretch" spacing={6} p={4}>
                  {/* ── Fidelity: Select-All toolbar ───────────────────────── */}
                  <HStack
                    bg={fidelitySelectAll ? 'purple.50' : 'gray.50'}
                    border="1px solid"
                    borderColor={fidelitySelectAll ? 'purple.300' : 'gray.200'}
                    borderRadius="md"
                    px={4} py={2}
                    justify="space-between"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme={fidelitySelectAll ? 'purple' : 'gray'}
                        variant={fidelitySelectAll ? 'solid' : 'outline'}
                        onClick={() => {
                          setFidelitySelectAll((v) => !v);
                          setSelectedFidelityBlock(null);
                          setSelectedFidelityBlockIds([]);
                        }}
                        leftIcon={
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.5" y="0.5" width="5" height="5" rx="0.5" stroke="currentColor"/>
                            <rect x="8.5" y="0.5" width="5" height="5" rx="0.5" stroke="currentColor"/>
                            <rect x="0.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor"/>
                            <rect x="8.5" y="8.5" width="5" height="5" rx="0.5" stroke="currentColor"/>
                          </svg>
                        }
                      >
                        {fidelitySelectAll ? 'Deselect All' : 'Select All Boxes'}
                      </Button>
                      {fidelitySelectAll && (
                        <Text fontSize="xs" color="purple.600">
                          All text boxes highlighted — click any to focus &amp; drag
                        </Text>
                      )}
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {fidelityFlowPages.reduce((n, p) => n + (Array.isArray(p?.overlayBlocks)
                        ? p.overlayBlocks.filter((b) => !isImageLikeBlock(b) && !isSeparatorText(b?.text || '')).length
                        : 0), 0)} editable blocks
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {fidelityFontsMeta.length} fonts loaded
                    </Text>
                  </HStack>
                  <HStack
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    px={4} py={2}
                    justify="space-between"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <HStack spacing={2} flexWrap="wrap">
                      <Text fontSize="xs" color="gray.600" fontWeight="600">Selection tools:</Text>
                      <Button size="xs" onClick={() => applyAlignment('left')} isDisabled={selectedFidelityBlockIds.length < 2}>Align Left</Button>
                      <Button size="xs" onClick={() => applyAlignment('center')} isDisabled={selectedFidelityBlockIds.length < 2}>Align Center</Button>
                      <Button size="xs" onClick={() => applyAlignment('right')} isDisabled={selectedFidelityBlockIds.length < 2}>Align Right</Button>
                      <Button size="xs" onClick={() => applyAlignment('top')} isDisabled={selectedFidelityBlockIds.length < 2}>Align Top</Button>
                      <Button size="xs" onClick={() => applyAlignment('middle')} isDisabled={selectedFidelityBlockIds.length < 2}>Align Middle</Button>
                      <Button size="xs" onClick={() => applyAlignment('bottom')} isDisabled={selectedFidelityBlockIds.length < 2}>Align Bottom</Button>
                      <Button size="xs" onClick={() => distributeBlocks('x')} isDisabled={selectedFidelityBlockIds.length < 3}>Distribute H</Button>
                      <Button size="xs" onClick={() => distributeBlocks('y')} isDisabled={selectedFidelityBlockIds.length < 3}>Distribute V</Button>
                    </HStack>
                    <HStack spacing={2}>
                      <Select
                        size="xs"
                        w="90px"
                        value={String(fidelityZoom)}
                        onChange={(e) => setFidelityZoom(Number(e.target.value || 1))}
                      >
                        <option value="0.5">50%</option>
                        <option value="0.75">75%</option>
                        <option value="1">100%</option>
                        <option value="1.25">125%</option>
                        <option value="1.5">150%</option>
                        <option value="2">200%</option>
                      </Select>
                      <Button size="xs" variant={fidelitySnapEnabled ? 'solid' : 'outline'} colorScheme="blue" onClick={() => setFidelitySnapEnabled((v) => !v)}>
                        Snap {fidelitySnapEnabled ? 'On' : 'Off'}
                      </Button>
                      <Button size="xs" variant={fidelityGridSnapEnabled ? 'solid' : 'outline'} colorScheme="teal" onClick={() => setFidelityGridSnapEnabled((v) => !v)}>
                        Grid {fidelityGridSnapEnabled ? `${fidelityGridSize}px` : 'Off'}
                      </Button>
                      <Button size="xs" variant={fidelityObjectsVisible ? 'solid' : 'outline'} colorScheme="orange" onClick={() => setFidelityObjectsVisible((v) => !v)}>
                        Objects {fidelityObjectsVisible ? 'On' : 'Off'}
                      </Button>
                      <Button size="xs" variant={fidelityDebug ? 'solid' : 'outline'} colorScheme="orange" onClick={() => setFidelityDebug((v) => !v)}>
                        Debug Layer
                      </Button>
                    </HStack>
                  </HStack>

                  {/* ── Fidelity: Apply edits directly to PDF ──────────────── */}
                  {Object.keys(fidelityEdits || {}).length > 0 && (
                    <HStack
                      bg="purple.50"
                      border="1px solid"
                      borderColor="purple.200"
                      borderRadius="md"
                      px={4} py={2}
                      justify="space-between"
                    >
                      <Text fontSize="sm" color="purple.700" fontWeight="500">
                        {Object.keys(fidelityEdits).length} block(s) edited — apply changes directly into the PDF
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="purple"
                        leftIcon={<FiSave />}
                        isLoading={isFidelityApplying}
                        loadingText="Applying…"
                        onClick={async () => {
                          setIsFidelityApplying(true);
                          try {
                            const newPdfUrl = await fileService.applyFidelityEditsToPdf(
                              selectedFile?._id,
                              fidelityEdits,
                              fidelityOffsets,
                              fidelityObjectEdits,
                            );
                            setAppliedFidelityPdfUrl(newPdfUrl);
                            toast({
                              title: 'PDF updated',
                              description: 'Edits baked into the PDF. Use "Download as PDF" to save.',
                              status: 'success',
                              duration: 4000,
                            });
                          } catch (err) {
                            toast({ title: 'Apply failed', description: err.message, status: 'error', duration: 4000 });
                          } finally {
                            setIsFidelityApplying(false);
                          }
                        }}
                      >
                        Apply to PDF
                      </Button>
                    </HStack>
                  )}
                  {fidelityFlowPages.map((page) => {
                    const pageNumber = Number(page?.pageNumber || 1);
                    const blocks = Array.isArray(page?.overlayBlocks) ? page.overlayBlocks : [];
                    const tables = fidelityTableGroups.get(pageNumber) || [];
                    const textLayer = page?.textLayer || null;
                    const pageWidth = Number(textLayer?.width || page?.width || 794);
                    const pageHeight = Number(textLayer?.height || page?.height || 1123);
                    return (
                    <Box
                      key={`fpage-${pageNumber}`}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                      bg="white"
                      p={3}
                      onClick={() => setSelectedFidelityObject(null)}
                    >
                        <Text fontSize="xs" color="gray.500" mb={2}>Page {pageNumber}</Text>
                        <Box w={`${pageWidth * fidelityZoom}px`} h={`${pageHeight * fidelityZoom}px`} overflow="hidden">
                          <Box
                            position="relative"
                            w={`${pageWidth}px`}
                            maxW="none"
                            h={`${pageHeight}px`}
                            overflow="hidden"
                            bg="gray.50"
                            transform={`scale(${fidelityZoom})`}
                            transformOrigin="top left"
                          >
                            {(!pdfPageCount || pageNumber <= pdfPageCount) ? (
                          <PdfPageCanvas
                                pdfUrl={appliedFidelityPdfUrl || pdfCanvasUrl}
                            pageNumber={pageNumber}
                            targetWidthPx={pageWidth}
                            fileId={selectedFile?._id || session?.fileId}
                          />
                            ) : (
                              <Box position="absolute" inset="0" bg="white" />
                            )}
                          {fidelitySnapGuides?.page === pageNumber && Number.isFinite(fidelitySnapGuides.x) && (
                            <Box position="absolute" left={`${fidelitySnapGuides.x}px`} top="0" h={`${pageHeight}px`} w="1px" bg="blue.400" opacity={0.6} zIndex={1} />
                          )}
                          {fidelitySnapGuides?.page === pageNumber && Number.isFinite(fidelitySnapGuides.y) && (
                            <Box position="absolute" top={`${fidelitySnapGuides.y}px`} left="0" w={`${pageWidth}px`} h="1px" bg="blue.400" opacity={0.6} zIndex={1} />
                          )}
                          {blocks.map((block) => {
                            const originalText = String(block?.text || '');
                            const isSep = isSeparatorText(originalText);
                            const isImageLike = isImageLikeBlock(block);
                            if (isImageLike || isSep) return null;
                            const width = Math.max(30, Number(block?.width || 0));
                            const height = Math.max(18, Number(block?.computedHeight || block?.height || 0));
                            const fontSizePxMask = Math.max(9, Number(block?.style?.fontSize || 11));
                            const maskBuffer = Math.max(6, Math.round(fontSizePxMask * 0.6));
                            const maskKey = block?.blockKey;
                            const left = Math.max(0, Number(block?.renderX ?? block?.baseX ?? 0) - 1);
                            const top = Math.max(0, Number(block?.renderY ?? block?.baseY ?? 0) - 1);
                            return (
                              <Box
                                key={`mask-${maskKey}`}
                                position="absolute"
                                left={`${left}px`}
                                top={`${top}px`}
                                w={`${width + 4}px`}
                                minH={`${height + maskBuffer}px`}
                                bg="white"
                                opacity={1}
                                pointerEvents="none"
                                zIndex={1}
                              />
                            );
                          })}
                          {fidelityObjectsVisible && (fidelityObjectsByPage?.[pageNumber] || []).map((obj) => {
                            const bbox = Array.isArray(obj?.bbox) ? obj.bbox : [0, 0, 0, 0];
                            const [ox1, oy1, ox2, oy2] = bbox;
                            const baseW = Math.max(4, ox2 - ox1);
                            const baseH = Math.max(4, oy2 - oy1);
                            const edit = fidelityObjectEdits?.[obj.id] || {};
                            const dx = Number(edit.dx || 0);
                            const dy = Number(edit.dy || 0);
                            const scaleX = Number(edit.scaleX || 1);
                            const scaleY = Number(edit.scaleY || 1);
                            const x = ox1 + dx;
                            const y = oy1 + dy;
                            const w = Math.max(4, baseW * scaleX);
                            const h = Math.max(4, baseH * scaleY);
                            const isSelected = selectedFidelityObject?.id === obj.id;
                            return (
                              <Box
                                key={`obj-${obj.id}`}
                                position="absolute"
                                left={`${x}px`}
                                top={`${y}px`}
                                w={`${w}px`}
                                h={`${h}px`}
                                border="1px solid"
                                borderColor={isSelected ? 'orange.500' : 'orange.200'}
                                bg={isSelected ? 'orange.50' : 'transparent'}
                                zIndex={1}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedFidelityObject(obj);
                                  setSelectedFidelityBlock(null);
                                  setSelectedFidelityBlockIds([]);
                                  setFidelitySelectAll(false);
                                  const existing = fidelityObjectEdits?.[obj.id] || { dx: 0, dy: 0, scaleX: 1, scaleY: 1, object: obj };
                                  setFidelityObjectEdits((prev) => ({
                                    ...prev,
                                    [obj.id]: { ...existing, object: obj },
                                  }));
                                  fidelityObjectDragRef.current = {
                                    id: obj.id,
                                    mode: 'move',
                                    startX: e.clientX,
                                    startY: e.clientY,
                                    baseDx: Number(existing.dx || 0),
                                    baseDy: Number(existing.dy || 0),
                                    baseW,
                                    baseH,
                                  };
                                  document.body.style.userSelect = 'none';
                                  document.body.style.cursor = 'grabbing';
                                }}
                              >
                                {isSelected && (
                                  <Box
                                    position="absolute"
                                    right="-4px"
                                    bottom="-4px"
                                    w="8px"
                                    h="8px"
                                    bg="orange.400"
                                    borderRadius="2px"
                                    cursor="nwse-resize"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const existing = fidelityObjectEdits?.[obj.id] || { dx: 0, dy: 0, scaleX: 1, scaleY: 1, object: obj };
                                      setSelectedFidelityObject(obj);
                                      setSelectedFidelityBlock(null);
                                      setSelectedFidelityBlockIds([]);
                                      setFidelitySelectAll(false);
                                      setFidelityObjectEdits((prev) => ({
                                        ...prev,
                                        [obj.id]: { ...existing, object: obj },
                                      }));
                                      fidelityObjectDragRef.current = {
                                        id: obj.id,
                                        mode: 'resize',
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        baseDx: Number(existing.dx || 0),
                                        baseDy: Number(existing.dy || 0),
                                        baseW,
                                        baseH,
                                      };
                                      document.body.style.userSelect = 'none';
                                      document.body.style.cursor = 'nwse-resize';
                                    }}
                                  />
                                )}
                              </Box>
                            );
                          })}
                          {tables.flatMap((table) => (
                            (table.cells || []).map((cell) => {
                              const blockKey = cell?.blockKey;
                              const text = String(cell?.text || '');
                              const isSelected = selectedFidelityBlockIdSet.has(blockKey);
                              const isPrimary = selectedFidelityBlock?.id === blockKey;
                              const width = Math.max(20, Number(cell?.width || 0));
                              const height = Math.max(16, Number(cell?.height || 0));
                              const x1 = Number(cell?.renderX ?? cell?.baseX ?? 0);
                              const y1 = Number(cell?.renderY ?? cell?.baseY ?? 0);
                              const fontSizePx = Math.max(9, Number(cell?.style?.fontSize || 10));
                              const lineHeightPx = Math.max(Math.round(fontSizePx * 1.2), Number(cell?.style?.lineHeight || 0));
                              const border = cell?.border;
                              const borderStyle = border
                                ? '1px solid #333'
                                : '1px solid transparent';
                              return (
                                <Box
                                  key={`cell-${blockKey}`}
                                  position="absolute"
                                  left={`${x1}px`}
                                  top={`${y1}px`}
                                  w={`${width}px`}
                                  h={`${height}px`}
                                  px={1}
                                  py={0.5}
                                  border={borderStyle}
                                  bg={isPrimary ? 'purple.50' : isSelected ? 'blue.50' : 'whiteAlpha.950'}
                                  fontSize={`${fontSizePx}px`}
                                  fontFamily={cell?.style?.fontFamily || undefined}
                                  lineHeight={`${lineHeightPx}px`}
                                  fontWeight={Number(cell?.style?.fontWeight || 400)}
                                  textAlign={cell?.style?.align || 'left'}
                                  zIndex={2}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFidelitySelectAll(false);
                                    setSelectedFidelityObject(null);
                                    if (e.shiftKey) {
                                      setSelectedFidelityBlockIds((prev) => {
                                        const exists = prev.includes(blockKey);
                                        const next = exists ? prev.filter((id) => id !== blockKey) : [...prev, blockKey];
                                        return next.length > 0 ? next : [];
                                      });
                                    } else {
                                      setSelectedFidelityBlockIds([blockKey]);
                                    }
                                    setSelectedFidelityBlock({
                                      id: blockKey,
                                      page: pageNumber,
                                      bbox: cell?.bbox || [x1, y1, x1 + width, y1 + height],
                                      role: cell?.role || 'body',
                                      confidence: cell?.confidence ?? null,
                                      type: cell?.type || 'tableCell',
                                    });
                                  }}
                                >
                                  <Textarea
                                    variant="unstyled"
                                    resize="none"
                                    value={text}
                                    minH={`${height}px`}
                                    onChange={(e) => {
                                      const next = e.target.value;
                                      pushFidelityUndoSnapshot(fidelityEdits);
                                      setFidelityEdits((prev) => ({
                                        ...prev,
                                        [blockKey]: buildFidelityEditPayload(cell, next),
                                      }));
                                      setHasUnsavedChanges(true);
                                    }}
                                    sx={{
                                      width: '100%',
                                      fontFamily: 'inherit',
                                      fontSize: 'inherit',
                                      fontWeight: 'inherit',
                                      lineHeight: 'inherit',
                                      color: 'inherit',
                                      textAlign: 'inherit',
                                      whiteSpace: 'pre-wrap',
                                      p: 0,
                                      m: 0,
                                      border: 'none',
                                      bg: 'transparent',
                                      outline: 'none',
                                      overflow: 'hidden',
                                      _focusVisible: { boxShadow: 'none' },
                                    }}
                                  />
                                </Box>
                              );
                            })
                          ))}
                          {fidelityDebug && textLayer?.items?.length ? (
                            <Box position="absolute" inset={0} pointerEvents="none" zIndex={1}>
                              {textLayer.items.map((item, idx) => (
                                <Box
                                  key={`dbg-${pageNumber}-${idx}`}
                                  position="absolute"
                                  left={`${Math.max(0, item.x)}px`}
                                  top={`${Math.max(0, item.y)}px`}
                                  w={`${Math.max(1, item.right - item.x)}px`}
                                  h={`${Math.max(1, item.bottom - item.y)}px`}
                                  border="1px solid rgba(255,0,0,0.25)"
                                  bg="rgba(255,0,0,0.04)"
                                />
                              ))}
                            </Box>
                          ) : null}
                          {blocks.map((block) => {
                            const blockKey = block?.blockKey;
                            const originalText = String(block?.text || '');
                            const hasManualEdit = Object.prototype.hasOwnProperty.call(fidelityEdits, blockKey);
                            const text = String(block?.text || '');
                            const isSep = isSeparatorText(originalText);
                            const isImageLike = isImageLikeBlock(block);
                            const isTableCell = block?.type === 'tableCell';
                            if (isImageLike || isSep || isTableCell) return null;

                            const width = Math.max(30, Number(block?.width || 0));
                            const height = Math.max(18, Number(block?.computedHeight || block?.height || 0));
                            const x1 = Number(block?.renderX ?? block?.baseX ?? 0);
                            const y1 = Number(block?.renderY ?? block?.baseY ?? 0);
                            const fontSizePx = Math.max(9, Number(block?.style?.fontSize || 11));
                            const runs = Array.isArray(block?.runs) ? block.runs : [];
                            const hasBoldRun = runs.some((run) => {
                              const s = run?.style || {};
                              return Number(s?.fontWeight || 0) >= 600 || !!s?.bold;
                            });
                            const resolvedFontWeight = (Number(block?.style?.fontWeight || 0) >= 600 || block?.style?.bold || hasBoldRun) ? 700 : 400;
                            const styleLineHeight = Number(block?.style?.lineHeight || 0);
                            const resolvedLineHeightPx = Math.max(Math.round(fontSizePx * 1.25), Number.isFinite(styleLineHeight) ? styleLineHeight : 0);
                            const isLineLikeBlock = /line|word/i.test(String(block?.type || ''));

                            const isSelected = selectedFidelityBlockIdSet.has(blockKey);
                            const isPrimary = selectedFidelityBlock?.id === blockKey;

                            return (
                              <Box
                                key={blockKey}
                                position="absolute"
                                left={`${x1}px`}
                                top={`${y1}px`}
                                w={`${width}px`}
                                minH={`${Math.max(height, resolvedLineHeightPx + 2)}px`}
                                h="auto"
                                px={1}
                                py={0.5}
                                border="1px dashed"
                                borderColor={
                                  isPrimary
                                    ? 'purple.600'
                                    : isSelected || fidelitySelectAll
                                      ? 'blue.400'
                                      : 'transparent'
                                }
                                boxShadow={
                                  isPrimary
                                    ? '0 0 0 1px var(--chakra-colors-purple-500)'
                                    : isSelected || fidelitySelectAll
                                      ? '0 0 0 1px var(--chakra-colors-blue-300)'
                                      : 'none'
                                }
                                bg={
                                  isImageLike
                                    ? 'transparent'
                                    : isPrimary
                                      ? 'purple.50'
                                      : (isSelected || fidelitySelectAll)
                                        ? 'blue.50'
                                        : 'whiteAlpha.950'
                                }
                                fontSize={`${fontSizePx}px`}
                                fontFamily={block?.style?.fontFamily || undefined}
                                lineHeight={`${resolvedLineHeightPx}px`}
                                fontWeight={resolvedFontWeight}
                                textAlign={block?.style?.align || 'left'}
                                whiteSpace="pre-wrap"
                                cursor="text"
                                _hover={
                                  fidelitySelectAll
                                    ? { borderColor: 'purple.400', bg: isImageLike ? 'transparent' : 'purple.50' }
                                    : undefined
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFidelitySelectAll(false);
                                  setSelectedFidelityObject(null);
                                  if (e.shiftKey) {
                                    setSelectedFidelityBlockIds((prev) => {
                                      const exists = prev.includes(blockKey);
                                      const next = exists ? prev.filter((id) => id !== blockKey) : [...prev, blockKey];
                                      return next.length > 0 ? next : [];
                                    });
                                  } else {
                                    setSelectedFidelityBlockIds([blockKey]);
                                  }
                                  setSelectedFidelityBlock({
                                  id: blockKey,
                                  page: pageNumber,
                                    bbox: block?.bbox || [x1, y1, x1 + width, y1 + height],
                                  role: block?.role || 'body',
                                  confidence: block?.confidence ?? null,
                                  type: block?.type || 'line',
                                  });
                                }}
                                zIndex={2}
                              >
                                {isSep ? (
                                  <Box
                                    position="absolute"
                                    left="0"
                                    right="0"
                                    top="50%"
                                    transform="translateY(-50%)"
                                    borderTop="1px solid"
                                    borderColor="black"
                                    opacity={0.9}
                                  />
                                ) : (
                                  <>
                                    {isPrimary && (
                                      <Box
                                        position="absolute"
                                        right="2px"
                                        top="1px"
                                        zIndex={3}
                                        fontSize="9px"
                                        lineHeight="1"
                                        px={1}
                                        py={0.5}
                                        bg="blackAlpha.600"
                                        color="white"
                                        borderRadius="3px"
                                        cursor="grab"
                                        title="Drag to align this text block"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const selectedKeys = selectedFidelityBlockIds.length > 0
                                            ? selectedFidelityBlockIds
                                            : [blockKey];
                                          const baseOffsets = {};
                                          for (const k of selectedKeys) {
                                            const base = fidelityOffsets?.[k] || { x: 0, y: 0 };
                                            baseOffsets[k] = { x: Number(base.x || 0), y: Number(base.y || 0) };
                                          }
                                          const pageOverlay = fidelityFlowPages.find((p) => Number(p?.pageNumber || 1) === pageNumber);
                                          const snapX = [];
                                          const snapY = [];
                                          if (pageOverlay) {
                                            const pageBlocks = Array.isArray(pageOverlay?.overlayBlocks) ? pageOverlay.overlayBlocks : [];
                                            for (const b of pageBlocks) {
                                              if (!b?.blockKey || selectedKeys.includes(b.blockKey)) continue;
                                              const bx = Number(b.renderX ?? b.baseX ?? 0);
                                              const by = Number(b.renderY ?? b.baseY ?? 0);
                                              const bw = Number(b.width || 0);
                                              const bh = Number(b.computedHeight || b.height || 0);
                                              snapX.push(bx, bx + bw, bx + bw / 2);
                                              snapY.push(by, by + bh, by + bh / 2);
                                            }
                                            const pw = Number(pageOverlay?.width || 0);
                                            const ph = Number(pageOverlay?.height || 0);
                                            if (pw) snapX.push(0, pw / 2, pw);
                                            if (ph) snapY.push(0, ph / 2, ph);
                                          }
                                          fidelityDragRef.current = {
                                            keys: selectedKeys,
                                            startX: e.clientX,
                                            startY: e.clientY,
                                            baseOffsets,
                                            primaryKey: blockKey,
                                            page: pageNumber,
                                            snapX,
                                            snapY,
                                            primaryAbsX: Number(block?.renderX ?? block?.baseX ?? 0),
                                            primaryAbsY: Number(block?.renderY ?? block?.baseY ?? 0),
                                          };
                                          document.body.style.userSelect = 'none';
                                          document.body.style.cursor = 'grabbing';
                                        }}
                                      >
                                        Drag
                                      </Box>
                                    )}
                                  <Textarea
                                    variant="unstyled"
                                    resize="none"
                                      wrap={isLineLikeBlock ? 'off' : 'soft'}
                                    value={text}
                                    placeholder={hasManualEdit ? '' : ''}
                                      minH={`${Math.max(height, resolvedLineHeightPx + 2)}px`}
                                      ref={(el) => {
                                        if (!el) return;
                                        el.style.height = 'auto';
                                        el.style.height = `${el.scrollHeight}px`;
                                      }}
                                      onInput={(e) => {
                                        const el = e.currentTarget;
                                        el.style.height = 'auto';
                                        el.style.height = `${el.scrollHeight}px`;
                                      }}
                                    onFocus={() => {
                                      if (!hasManualEdit) {
                                          setFidelityEdits((prev) => ({
                                            ...prev,
                                            [blockKey]: buildFidelityEditPayload(block, originalText),
                                          }));
                                      }
                                    }}
                                    onChange={(e) => {
                                      const next = e.target.value;
                                        pushFidelityUndoSnapshot(fidelityEdits);
                                        setFidelityEdits((prev) => ({
                                          ...prev,
                                          [blockKey]: buildFidelityEditPayload(block, next),
                                        }));
                                      setHasUnsavedChanges(true);
                                    }}
                                      sx={{
                                        width: '100%',
                                        fontFamily: 'inherit',
                                        fontSize: 'inherit',
                                        fontWeight: 'inherit',
                                        lineHeight: 'inherit',
                                        color: 'inherit',
                                        textAlign: 'inherit',
                                        whiteSpace: isLineLikeBlock ? 'pre' : 'pre-wrap',
                                        p: 0,
                                        m: 0,
                                        border: 'none',
                                        bg: 'transparent',
                                        overflow: 'hidden',
                                        _focusVisible: { boxShadow: 'none' },
                                      }}
                                    />
                                  </>
                                )}
                              </Box>
                            );
                          })}
                          {page?._placeholder ? (
                            <Text position="absolute" left="8px" bottom="8px" fontSize="10px" color="gray.500" bg="whiteAlpha.800" px={1.5} py={0.5} borderRadius="sm">
                              Page rendered from source PDF; block extraction missing for this page
                            </Text>
                          ) : null}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                <>
                  {editorViewMode === 'editable' && pdfPageCount > 0 && showEditablePdfPreview && (
                    <Box mb={3} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white" p={2}>
                      <Text fontSize="xs" color="gray.600" fontWeight="600" mb={2}>PDF preview (all pages)</Text>
                      <VStack align="stretch" spacing={3}>
                        {editablePagesToRender.map((pNum) => (
                          <Box key={`eprev-${pNum}`} border="1px solid" borderColor="gray.200" borderRadius="md" bg="white" p={2}>
                            <Text fontSize="xs" color="gray.500" mb={1}>Page {pNum}</Text>
                            <Box position="relative" w="100%" maxW="none" bg="gray.50">
                              <PdfPageCanvas
                                pdfUrl={pdfCanvasUrl}
                                pageNumber={pNum}
                                targetWidthPx={Number(pageStyle.pageWidth?.replace('px', '') || 793)}
                                fileId={selectedFile?._id || session?.fileId}
                              />
                            </Box>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  <OnlyOfficeEditor fileId={selectedFile?._id || session?.fileId} refreshKey={onlyOfficeRefreshKey} />
                </>
              )}
            </Box>
          </Box>

          {dualViewMode && (
            <>
              <Box
                w="6px" flexShrink={0} bg="blue.400" opacity={0.7} h="100%"
                cursor="col-resize"
                _hover={{ opacity: 1, bg: 'blue.300' }}
                transition="all 0.15s"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const container = e.target.closest('[data-editor-flex-row]') || e.target.parentElement;
                  const containerRect = container.getBoundingClientRect();
                  const onMove = (ev) => {
                    const pct = ((ev.clientX - containerRect.left) / containerRect.width) * 100;
                    const clamped = Math.max(30, Math.min(75, pct));
                    container.style.setProperty('--editor-flex', `0 0 ${clamped}%`);
                    container.style.setProperty('--swap-flex', `0 0 ${100 - clamped}%`);
                  };
                  const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                  document.addEventListener('mousemove', onMove);
                  document.addEventListener('mouseup', onUp);
                }}
              />
              <Box style={{ flex: 'var(--swap-flex, 1 1 50%)' }} h="100%" overflow="hidden" display="flex">
                <DocumentConverter
                  sourceHtml={editor?.getHTML() || ''}
                  documentType={scanResults?.documentType}
                  language={language}
                  fileService={fileService}
                  pageStyle={pageStyle}
                  editor={editor}
                  onExit={exitDualView}
                  onContentReplaced={undefined}
                />
              </Box>
            </>
          )}

          {rightSidebarOpen && (
            <Box
              ref={rightDragRef}
              w="5px"
              flexShrink={0}
              h="100%"
              bg="transparent"
              borderLeft="1px solid"
              borderColor={borderColor}
              cursor="col-resize"
              _hover={{ bg: 'blue.400', opacity: 0.5 }}
              transition="background 0.15s"
              onMouseDown={(e) => {
                isDraggingRight.current = true;
                dragStartX.current = e.clientX;
                dragStartWidth.current = rightSidebarWidth;
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
                e.preventDefault();
              }}
            />
          )}


          {rightSidebarOpen && (
            <Box
              w={`${rightSidebarWidth}px`}
              minW="200px"
              maxW="520px"
              bg={sidebarBg}
              borderLeft="none"
              display="flex"
              flexDirection="column"
              h="100%"
              overflow="hidden"
              flexShrink={0}
            >
              <AnalysisDashboard
                scanData={{
                  ...(scanData || {}),
                  ...localScanArrays,
                  smartSuggestions: suggestions,
                  scanResults,
                  formatMetadata,
                }}
                onApplySuggestion={handleApplySuggestion}
                onDismissSuggestion={handleDismissSuggestion}
                onUndoSuggestion={handleUndoSuggestion}
                onFollowUp={handleFollowUp}
                onFindCaseInDoc={(caseName) => {
                  if (!caseName || !editor) return;

                  const flashHighlight = (range) => {
                    editor.commands.setTextSelection(range);
                    editor.commands.scrollIntoView();

                    editor.chain().focus().setHighlight({ color: '#FFEB3B' }).run();
                    setTimeout(() => {
                      try { editor.chain().focus().setTextSelection(range).unsetHighlight().run(); } catch (e) { }
                    }, 2000);
                  };


                  const range = findRangeInEditor(caseName);
                  if (range) {
                    flashHighlight(range);
                    toast({ title: `Found: ${caseName}`, status: 'info', duration: 2000 });
                  } else {

                    const shortName = caseName.split(' ').slice(0, 3).join(' ');
                    const shortRange = findRangeInEditor(shortName);
                    if (shortRange) {
                      flashHighlight(shortRange);
                      toast({ title: `Found match for: ${caseName}`, status: 'info', duration: 2000 });
                    } else {
                      toast({
                        title: 'Case not cited in document yet',
                        description: `Use "Apply Principle" to insert ${caseName} into the document first.`,
                        status: 'warning',
                        duration: 4000,
                      });
                    }
                  }
                }}
                onViewInDocument={(suggestion) => {
                  if (suggestion.originalText && editor) {
                    const range = findRangeInEditor(suggestion.originalText);
                    if (range) {
                      editor.commands.setTextSelection(range);
                      editor.commands.scrollIntoView();
                    }
                  }
                }}
                compact
                editor={editor}
                currentFileId={selectedFile?._id}
                documentContext={editor?.getText()?.substring(0, 1500) || ''}
              />
            </Box>
          )}
        </ModalBody>

        <ModalFooter bg={headerBg} borderTop="1px solid" borderColor={borderColor} py={1.5} px={4}>
          <HStack justify="space-between" w="100%" fontSize="xs" color="gray.500">
            <HStack spacing={4}>
              <Text>{wordCount} words</Text>
              <Text>{charCount} characters</Text>
              {formatMetadata?.pageSize?.name && (
                <Text>{formatMetadata.pageSize.name}</Text>
              )}
              {formatMetadata?.defaultFont && (
                <Text>{formatMetadata.defaultFont} {formatMetadata.defaultFontSize}pt</Text>
              )}
              {editorViewMode === 'fidelity' && selectedFidelityBlock && (
                <Text color="purple.600">
                  Block Inspector: {selectedFidelityBlock.id} | p{selectedFidelityBlock.page} | role {selectedFidelityBlock.role}
                </Text>
              )}
            </HStack>
            <HStack spacing={4}>
              <Text>{changeHistory.length} edit{changeHistory.length !== 1 ? 's' : ''}</Text>
              {suggestions.filter(s => s.status === 'pending').length > 0 && (
                <Text color="orange.400">
                  {suggestions.filter(s => s.status === 'pending').length} suggestions pending
                </Text>
              )}
              {lastSaved && (
                <Text>Last saved: {new Date(lastSaved).toLocaleTimeString()}</Text>
              )}
            </HStack>
          </HStack>
        </ModalFooter>

        <DesignSuggestionModal
          isOpen={isDesignSuggestionOpen}
          onClose={() => setIsDesignSuggestionOpen(false)}
          onDownload={executeDownloadWithDesign}
          documentTitle={fileName}
          documentContent={editor?.getText()?.substring(0, 500) || ''}
          requestedFormat={pendingDownloadFormat || 'docx'}
        />
      </ModalContent>
    </Modal>
  );
};

export default FullPageEditor;
