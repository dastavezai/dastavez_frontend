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
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
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
import EditorToolbar from './EditorToolbar';
import SmartSuggestionsPanel from './SmartSuggestionsPanel';
import DocumentAnalysisPanel from './DocumentAnalysisPanel';
import AIHelperPanel from './AIHelperPanel';
import AnalysisDashboard from './analysis/AnalysisDashboard';
import PageBreakExtension, { useAutoPageBreak } from './editor/PageBreakExtension.jsx';
import FontSize from './editor/FontSizeExtension.jsx';
import LegalParagraphStyle from './editor/LegalParagraphStyleExtension.jsx';
import DocumentConverter from './editor/DocumentConverter.jsx';
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
const runStyleToCss = (style = {}) => {
  const css = [];
  if (style?.fontFamily) css.push(`font-family:${String(style.fontFamily).replace(/"/g, '')}`);
  if (style?.fontSize) css.push(`font-size:${Math.max(8, Math.min(24, Number(style.fontSize)))}pt`);
  if (style?.lineHeight) {
    const lh = Number(style.lineHeight);
    if (Number.isFinite(lh) && lh > 0) css.push(`line-height:${Math.max(1, Math.min(2.5, lh / Math.max(10, Number(style.fontSize || 12))))}`);
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
  const css = runStyleToCss(style);
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
const closeListTag = (state) => {
  if (!state.currentListTag) return '';
  const tag = state.currentListTag;
  state.currentListTag = null;
  return `</${tag}>`;
};

const documentGraphToEditableHtml = (documentGraph) => {
  if (!documentGraph || !Array.isArray(documentGraph.pages) || documentGraph.pages.length === 0) return '';
  const parts = [];
  const listState = { currentListTag: null };
  for (const page of documentGraph.pages) {
    const width = Number(page?.width || 600);
    const blocks = (Array.isArray(page?.blocks) ? page.blocks : [])
      .map((b, idx) => {
        const bbox = Array.isArray(b?.bbox) ? b.bbox : [0, 0, 0, 0];
        return {
          idx,
          id: b?.id || `${Number(page?.pageNumber || 0)}:${idx}`,
          type: String(b?.type || 'line'),
          role: String(b?.role || 'body'),
          text: String(b?.text || '').trim(),
          x: Number(bbox[0] || 0),
          y: Number(bbox[1] || 0),
          right: Number(bbox[2] || 0),
          style: b?.style || {},
          runs: Array.isArray(b?.runs) ? b.runs : [],
          table: b?.table || null,
        };
      })
      .filter((b) => b.text && b.role !== 'pageHeader' && b.role !== 'pageFooter')
      .sort((a, b) => (a.y - b.y) || (a.x - b.x) || (a.idx - b.idx));

    let i = 0;
    while (i < blocks.length) {
      const row = blocks[i];
      if (isSeparatorText(row.text)) {
        parts.push(closeListTag(listState));
        parts.push('<hr style="border:none;border-top:1px solid #000;margin:4px 0;" />');
        i += 1;
        continue;
      }

      // Canonical table projection: build contiguous table cells into <table>
      if (row.type === 'tableCell') {
        parts.push(closeListTag(listState));
        const chunk = [];
        let j = i;
        while (j < blocks.length && blocks[j].type === 'tableCell') {
          chunk.push(blocks[j]);
          j += 1;
        }
        const grid = new Map();
        let maxRow = 0;
        let maxCol = 0;
        for (const cell of chunk) {
          const r = Number(cell?.table?.rowIndex ?? 0);
          const c = Number(cell?.table?.columnIndex ?? 0);
          if (!Number.isFinite(r) || !Number.isFinite(c)) continue;
          maxRow = Math.max(maxRow, r);
          maxCol = Math.max(maxCol, c);
          if (!grid.has(r)) grid.set(r, new Map());
          grid.get(r).set(c, cell);
        }
        const tableParts = ['<table style="border-collapse:collapse;width:100%;margin:4px 0;">'];
        for (let r = 0; r <= maxRow; r += 1) {
          tableParts.push('<tr>');
          for (let c = 0; c <= maxCol; c += 1) {
            const cell = grid.get(r)?.get(c) || null;
            if (!cell) {
              tableParts.push('<td style="border:1px solid #111;padding:2px 4px;"><p></p></td>');
              continue;
            }
            const runs = cell.runs.length > 0 ? cell.runs : [{ text: cell.text, style: cell.style }];
            const inline = runs.map((run) => renderStyledRun(run, cell.style)).join('');
            const rowSpan = Math.max(1, Number(cell?.table?.rowSpan || 1));
            const colSpan = Math.max(1, Number(cell?.table?.columnSpan || 1));
            const spanAttrs = `${rowSpan > 1 ? ` rowspan="${rowSpan}"` : ''}${colSpan > 1 ? ` colspan="${colSpan}"` : ''}`;
            tableParts.push(`<td${spanAttrs} style="border:1px solid #111;padding:2px 4px;vertical-align:top;">${inline || '<p></p>'}</td>`);
          }
          tableParts.push('</tr>');
        }
        tableParts.push('</table>');
        parts.push(tableParts.join(''));
        i = j;
        continue;
      }

      const isListType = /list/i.test(row.type);
      const marker = parseListMarker(row.text);
      const listMarker = marker || (isListType ? { kind: 'ul', content: row.text } : null);
      const textForList = listMarker ? listMarker.content : row.text;
      const bodyRuns = row.runs.length > 0 ? row.runs : [{ text: textForList, style: row.style }];
      const inlineHtml = bodyRuns.map((run) => renderStyledRun(run, row.style)).join('');
      const align = row.style?.align || (row.x / width > 0.62 ? 'right' : 'left');
      const indentPt = Math.max(0, Math.min(72, Math.round((row.x / width) * 72)));
      const fontSize = Math.max(9, Math.min(18, Math.round(Number(row.style?.fontSize || 12))));
      const fontWeight = Number(row.style?.fontWeight || (row.style?.bold ? 700 : 400));
      const lineHeight = Math.max(1.0, Math.min(2.0, Number(row.style?.lineHeight || 14) / Math.max(10, fontSize)));
      const fontFamily = row.style?.fontFamily ? `font-family:${String(row.style.fontFamily).replace(/"/g, '')};` : '';
      if (listMarker) {
        if (listState.currentListTag !== listMarker.kind) {
          parts.push(closeListTag(listState));
          listState.currentListTag = listMarker.kind;
          parts.push(`<${listMarker.kind}>`);
        }
        parts.push(
          `<li style="text-align:${align};margin:0 0 2px 0;text-indent:${Math.max(0, indentPt - 10)}pt;font-size:${fontSize}pt;` +
          `font-weight:${fontWeight >= 600 ? 700 : 400};line-height:${lineHeight};${fontFamily}">${inlineHtml}</li>`
        );
      } else {
        parts.push(closeListTag(listState));
        parts.push(
          `<p style="text-align:${align};margin:0 0 2px 0;text-indent:${indentPt}pt;font-size:${fontSize}pt;` +
          `font-weight:${fontWeight >= 600 ? 700 : 400};line-height:${lineHeight};${fontFamily}">${inlineHtml}</p>`
        );
      }
      i += 1;
    }
    parts.push(closeListTag(listState));
    parts.push('<p><br></p>');
  }
  parts.push(closeListTag(listState));
  return parts.join('\n');
};

const layoutModelToEditableHtml = (layoutModel) => {
  if (!layoutModel || !Array.isArray(layoutModel.pages) || layoutModel.pages.length === 0) return '';
  const parts = [];
  const listState = { currentListTag: null };
  for (const page of layoutModel.pages) {
    const width = Number(page?.width || 600);
    const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
    const ordered = blocks
      .map((b, idx) => {
        const bbox = Array.isArray(b?.bbox) ? b.bbox : [0, 0, 0, 0];
        return {
          idx,
          type: String(b?.type || 'line'),
          role: String(b?.role || 'body'),
          text: String(b?.text || '').trim(),
          x: Number(bbox[0] || 0),
          y: Number(bbox[1] || 0),
          right: Number(bbox[2] || 0),
          style: b?.style || {},
          runs: Array.isArray(b?.runs) ? b.runs : [],
        };
      })
      .filter((b) => b.text && b.role !== 'pageHeader' && b.role !== 'pageFooter')
      .sort((a, b) => (a.y - b.y) || (a.x - b.x) || (a.idx - b.idx));
    for (const row of ordered) {
      if (isSeparatorText(row.text)) {
        parts.push(closeListTag(listState));
        parts.push('<hr style="border:none;border-top:1px solid #000;margin:4px 0;" />');
        continue;
      }
      const listMarker = parseListMarker(row.text);
      const textForList = listMarker ? listMarker.content : row.text;
      const bodyRuns = row.runs.length > 0
        ? row.runs
        : [{ text: textForList, style: row.style }];
      const inlineHtml = bodyRuns.map((run) => renderStyledRun(run, row.style)).join('');
      const align = row.style?.align || (row.x / width > 0.62 ? 'right' : 'left');
      const indentPt = Math.max(0, Math.min(72, Math.round((row.x / width) * 72)));
      const fontSize = Math.max(9, Math.min(18, Math.round(Number(row.style?.fontSize || 12))));
      const fontWeight = Number(row.style?.fontWeight || (row.style?.bold ? 700 : 400));
      const lineHeight = Math.max(1.0, Math.min(2.0, Number(row.style?.lineHeight || 14) / Math.max(10, fontSize)));
      const fontFamily = row.style?.fontFamily ? `font-family:${String(row.style.fontFamily).replace(/"/g, '')};` : '';
      if (listMarker) {
        if (listState.currentListTag !== listMarker.kind) {
          parts.push(closeListTag(listState));
          listState.currentListTag = listMarker.kind;
          parts.push(`<${listMarker.kind}>`);
        }
        parts.push(
          `<li style="text-align:${align};margin:0 0 2px 0;text-indent:${Math.max(0, indentPt - 10)}pt;font-size:${fontSize}pt;` +
          `font-weight:${fontWeight >= 600 ? 700 : 400};line-height:${lineHeight};${fontFamily}">${inlineHtml}</li>`
        );
      } else {
        parts.push(closeListTag(listState));
        parts.push(
          `<p style="text-align:${align};margin:0 0 2px 0;text-indent:${indentPt}pt;font-size:${fontSize}pt;` +
          `font-weight:${fontWeight >= 600 ? 700 : 400};line-height:${lineHeight};${fontFamily}">${inlineHtml}</p>`
        );
      }
    }
    parts.push(closeListTag(listState));
    parts.push('<p><br></p>');
  }
  parts.push(closeListTag(listState));
  return parts.join('\n');
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
          const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
          pdf = await loadingTask.promise;
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
          const blob = await fileService.downloadFile(fileId, 'pdf');
          const arr = await blob.arrayBuffer();
          const dataTask = pdfjsLib.getDocument({ data: new Uint8Array(arr) });
          pdf = await dataTask.promise;
          console.log('[PDF-CANVAS]', 'api-download-fallback-success', {
            fileId,
            pageNumber,
            bytes: arr.byteLength,
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
  const [lastSaved, setLastSaved] = useState(null);
  const [editorViewMode, setEditorViewMode] = useState('editable');
  const [fidelityEdits, setFidelityEdits] = useState({});
  const [selectedFidelityBlock, setSelectedFidelityBlock] = useState(null);
  const fidelityAutosaveTimerRef = useRef(null);

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


  const getInitialContent = useCallback(() => {
    const graph = session?.documentGraph || scanData?.documentGraph || null;
    const graphHtml = documentGraphToEditableHtml(graph);
    const layoutFromGraph = documentGraphToLayoutModel(graph);
    const layout = layoutFromGraph || session?.layoutModel || scanData?.layoutModel || null;
    const layoutHtml = layoutModelToEditableHtml(layout);
    const htmlCandidate = (initialHtml && initialHtml.trim()) ? initialHtml : (session?.htmlContent || '');
    const htmlLooksFlat = htmlCandidate && !/text-indent:|font-weight:|font-size:|text-align:|line-height:/i.test(htmlCandidate);
    if (graphHtml && graphHtml.trim()) return graphHtml;
    if (layoutHtml && (!htmlCandidate || htmlLooksFlat)) return layoutHtml;
    if (htmlCandidate && htmlCandidate.trim()) return htmlCandidate;
    const text = session?.currentText || session?.originalText || '';
    if (!text) return '<p></p>';
    return textToHtml(text);
  }, [initialHtml, session, scanData?.layoutModel, scanData?.documentGraph, textToHtml]);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: { depth: 100 },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline,
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
    if (editor && session && !editor.isFocused) {
      const content = getInitialContent();
      if (content && editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [session]);


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
    const graph = session?.documentGraph || scanData?.documentGraph || null;
    const layoutFromGraph = documentGraphToLayoutModel(graph);
    return layoutFromGraph || session?.layoutModel || scanData?.layoutModel || null;
  }, [session?.documentGraph, scanData?.documentGraph, session?.layoutModel, scanData?.layoutModel]);
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
    const totalPages = Math.max(diagTotal, layoutTotal);
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
  }, [fidelityLayout, scanData?.scanResults?.layoutDiagnostics?.pages, scanResults?.layoutDiagnostics?.pages, session?.scanResults?.layoutDiagnostics?.pages]);

  const hasFidelityLayout = fidelityPagesToRender.length > 0;
  const pdfCanvasUrl = useMemo(() => (
    resolvePdfUrl(selectedFile?.fileUrl || selectedFile?.url || session?.fileUrl || '')
  ), [selectedFile?.fileUrl, selectedFile?.url, session?.fileUrl]);

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
    return Object.prototype.hasOwnProperty.call(fidelityEdits, key) ? fidelityEdits[key] : fallbackText;
  }, [fidelityEdits, getFidelityBlockKey]);

  useEffect(() => {
    if (session?.fidelityEdits && typeof session.fidelityEdits === 'object') {
      setFidelityEdits(session.fidelityEdits);
    }
  }, [session?.fidelityEdits]);

  useEffect(() => {
    if (editorViewMode !== 'fidelity') return undefined;
    if (fidelityAutosaveTimerRef.current) clearTimeout(fidelityAutosaveTimerRef.current);
    fidelityAutosaveTimerRef.current = setTimeout(async () => {
      try {
        await fileService.saveHtmlContent('', '', selectedFile?._id, {
          mode: 'fidelity',
          fidelityEdits,
        });
        setLastSaved(new Date());
      } catch (err) {
        console.warn('Fidelity autosave failed:', err.message);
      }
    }, 1800);
    return () => {
      if (fidelityAutosaveTimerRef.current) clearTimeout(fidelityAutosaveTimerRef.current);
    };
  }, [editorViewMode, fidelityEdits, selectedFile?._id]);


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
    if (editor) await handleAutosave(editor);

    toast({ title: `Generating ${format.toUpperCase()}...`, status: 'info', duration: 2000 });
    try {
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
      let applied = false;
      let toastDesc = 'Marked as reviewed';


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


      const insertAtLocationOrAppend = (originalParagraph, revisedParagraph, descFound, descAppend) => {
        if (originalParagraph && revisedParagraph) {
          const range = fuzzyFindRange(originalParagraph);
          if (range) {
            editor.chain().focus()
              .insertContentAt({ from: range.from, to: range.to }, revisedParagraph)
              .setTextSelection({ from: range.from, to: range.from + revisedParagraph.length })
              .toggleHighlight({ color: HIGHLIGHT_ADD })
              .run();
            return { applied: true, desc: descFound };
          }
        }

        if (revisedParagraph) {
          const escaped = revisedParagraph
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
          editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
          return { applied: true, desc: descAppend || 'AI fix appended — review position and adjust if needed' };
        }
        return { applied: false, desc: 'No text to apply' };
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

ORIGINAL CLAUSE: ${suggestion.originalText.substring(0, 500)}
SUGGESTED REPLACEMENT: ${suggestion.suggestedText.substring(0, 500)}
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
              .toggleHighlight({ color: HIGHLIGHT_ADD })
              .run();
            applied = true;
            toastDesc = 'AI-enhanced fix highlighted in green';
          } else {

            try {
              const plainText = editor.getText();
              const aiPrompt = `You are a legal document editor. Apply this fix to the correct location in the document.

ORIGINAL TEXT (may be approximate): ${suggestion.originalText.substring(0, 500)}
SUGGESTED FIX: ${suggestion.suggestedText.substring(0, 500)}
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
            summary: `Replaced: "${suggestion.originalText.substring(0, 50)}..." → "${suggestion.suggestedText.substring(0, 50)}..."`,
            originalText: suggestion.originalText,
            suggestedText: suggestion.suggestedText,
            timestamp: new Date().toISOString(),
            applied: true,
            reverted: false,
          }]);


        } else if (hasSuggested && isAIDriven) {
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
SUGGESTED FIX: ${suggestion.suggestedText.substring(0, 500)}

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
                applied = true;
                toastDesc = 'Clause appended (highlighted green)';
              }
            } else {

              try {
                const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);

                  if (parsed.insertAfterParagraph !== undefined && parsed.clauseText) {
                    const insertAfter = parsed.insertAfterParagraph || '';
                    const clauseText = parsed.clauseText;
                    const escaped = clauseText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
                    if (insertAfter) {
                      const range = fuzzyFindRange(insertAfter);
                      if (range) {
                        editor.chain().focus().insertContentAt(range.to + 1, insertHtml).run();
                        applied = true;
                        toastDesc = 'AI fix inserted at appropriate location (highlighted green)';
                        revisedParagraph = clauseText;
                      }
                    }
                    if (!applied) {
                      editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
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
                  const clauseText = parsed.clauseText;
                  const escaped = clauseText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                  const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
                  if (insertAfter) {
                    const range = fuzzyFindRange(insertAfter);
                    if (range) {
                      editor.chain().focus().insertContentAt(range.to + 1, insertHtml).run();
                      applied = true;
                      toastDesc = 'Case citation inserted under specific section (highlighted green)';
                      revisedParagraph = clauseText;
                    }
                  }
                }
              } catch (_) {
                revisedParagraph = responseText || suggestion.suggestedText;
              }

              if (!applied) {
                const result = insertAtLocationOrAppend(originalParagraph, revisedParagraph,
                  suggestion.type === 'contradiction_fix' ? 'Contradiction resolved with AI (highlighted green)' :
                    suggestion.type === 'outdated_ref' ? 'Reference updated with AI (highlighted green)' :
                      suggestion.type === 'compliance_fix' ? 'Compliance issue fixed with AI (highlighted green)' :
                        suggestion.type === 'precedence_apply' ? `Citation from ${suggestion.caseName || 'case'} woven into document` :
                          suggestion.type === 'chronology_fix' ? 'Chronology corrected with AI (highlighted green)' :
                            'AI fix applied (highlighted green)',
                  'AI fix appended — original text not found exactly, review position');
                applied = result.applied;
                toastDesc = result.desc;
              }
            }

            setChangeHistory(prev => [...prev, {
              type: 'suggestion',
              instruction: suggestion.title || 'AI Resolution',
              summary: `AI fixed: "${(revisedParagraph || suggestion.suggestedText).substring(0, 80)}…"`,
              originalText: originalParagraph,
              suggestedText: revisedParagraph || suggestion.suggestedText,
              timestamp: new Date().toISOString(),
              applied: true,
              reverted: false,
              model: 'llm',
            }]);
          } catch (aiError) {
            console.warn('LLM resolution failed, applying static text:', aiError.message);
            const escaped = suggestion.suggestedText
              .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
            editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
            applied = true;
            toastDesc = 'Suggestion applied (fallback — LLM unavailable)';
          }


        } else if (hasSuggested) {
          try {
            const plainText = editor.getText();
            const aiPrompt = `You are a legal document editor. Insert this clause/text into the most appropriate location in the document.

TEXT TO INSERT: ${suggestion.suggestedText.substring(0, 1000)}
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
                    clauseInserted = true;
                  }
                }
              }
            } catch (_) { }

            if (!clauseInserted) {
              const escaped = suggestion.suggestedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
              editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
            }
            applied = true;
            toastDesc = clauseInserted ? 'AI placed clause at appropriate location (highlighted)' : 'Clause appended to end of document (highlighted)';
          } catch (aiErr) {
            console.warn('AI placement failed:', aiErr.message);
            const escaped = suggestion.suggestedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const insertHtml = `<p><mark data-color="${HIGHLIGHT_ADD}" style="background-color:${HIGHLIGHT_ADD};color:#065f46;">${escaped}</mark></p>`;
            editor.chain().focus().insertContentAt(editor.state.doc.content.size, insertHtml).run();
            applied = true;
            toastDesc = 'Clause appended (AI unavailable)';
          }
          setChangeHistory(prev => [...prev, {
            type: 'suggestion',
            instruction: suggestion.title || 'Missing Clause Added',
            summary: `Appended: "${suggestion.suggestedText.substring(0, 80)}..."`,
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
      // Remove the resolved issue from overview stats — runs unconditionally on every Apply click
      // so even suggestions with empty suggestedText (marked reviewed) reduce the count
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


      const sid = suggestion.suggestionId;
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

      console.warn('handleApplySuggestion error:', outerErr.message);
      const sid = suggestion?.suggestionId;
      setSuggestions(prev => prev.map(s =>
        sid ? (s.suggestionId === sid ? { ...s, status: 'applied' } : s)
          : (s === suggestion ? { ...s, status: 'applied' } : s)
      ));
      toast({ title: 'Applied locally', description: 'An unexpected error occurred but change was applied.', status: 'warning', duration: 3000 });
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
    <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="slideInBottom">
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
                  variant={editorViewMode === 'fidelity' ? 'solid' : 'outline'}
                  colorScheme={editorViewMode === 'fidelity' ? 'purple' : 'gray'}
                  onClick={() => setEditorViewMode('fidelity')}
                  isDisabled={!hasFidelityLayout}
                >
                  Fidelity
                </Button>
                <Button
                  size="xs"
                  variant={editorViewMode === 'editable' ? 'solid' : 'outline'}
                  colorScheme={editorViewMode === 'editable' ? 'blue' : 'gray'}
                  onClick={() => setEditorViewMode('editable')}
                >
                  Editable
                </Button>
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

        <EditorToolbar data-tour="editor-toolbar" editor={editor} />


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
            overflow="auto"
            px={0}
          >
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
              mx="auto"
              my={0}
              mb={0}
              w="100%"
              maxW={pageStyle.pageWidth || '793px'}
              minH="calc(100vh - 200px)"
              pb="120px"
              bg="#ffffff"
              boxShadow="none"
              borderRadius="0"
              position="relative"
              overflow="visible"
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
              {editorViewMode === 'fidelity' && hasFidelityLayout ? (
                <VStack align="stretch" spacing={6} p={4}>
                  {fidelityPagesToRender.map((page) => {
                    const pageNumber = Number(page?.pageNumber || 1);
                    const pageWidth = Number(page?.width || 794);
                    const pageHeight = Number(page?.height || 1123);
                    const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
                    return (
                      <Box key={`fpage-${pageNumber}`} border="1px solid" borderColor={borderColor} borderRadius="md" bg="white" p={3}>
                        <Text fontSize="xs" color="gray.500" mb={2}>Page {pageNumber}</Text>
                        <Box position="relative" w={`${pageWidth}px`} maxW="none" h={`${pageHeight}px`} overflow="hidden" bg="gray.50">
                          <PdfPageCanvas
                            pdfUrl={pdfCanvasUrl}
                            pageNumber={pageNumber}
                            targetWidthPx={pageWidth}
                            fileId={selectedFile?._id || session?.fileId}
                          />
                          {blocks.map((block, bIdx) => {
                            const bbox = Array.isArray(block?.bbox) ? block.bbox : [0, 0, 0, 0];
                            const [x1, y1, x2, y2] = bbox;
                            const blockKey = getFidelityBlockKey(pageNumber, bIdx, block);
                            const originalText = String(block?.text || '');
                            const hasManualEdit = Object.prototype.hasOwnProperty.call(fidelityEdits, blockKey);
                            const text = hasManualEdit ? getFidelityText(pageNumber, bIdx, originalText, block) : '';
                            const width = Math.max(30, x2 - x1);
                            const height = Math.max(18, y2 - y1);
                            const isSep = isSeparatorText(originalText);
                            return (
                              <Box
                                key={blockKey}
                                position="absolute"
                                left={`${x1}px`}
                                top={`${y1}px`}
                                w={`${width}px`}
                                minH={`${height}px`}
                                px={1}
                                py={0.5}
                                border="1px dashed"
                                borderColor={selectedFidelityBlock?.id === blockKey ? 'purple.500' : 'transparent'}
                                bg={selectedFidelityBlock?.id === blockKey ? 'purple.50' : 'transparent'}
                                fontSize={`${Math.max(9, Number(block?.style?.fontSize || 11))}px`}
                                fontFamily={block?.style?.fontFamily || undefined}
                                lineHeight={block?.style?.lineHeight ? `${Math.max(10, Number(block.style.lineHeight))}px` : undefined}
                                fontWeight={Number(block?.style?.fontWeight || 0) >= 600 || block?.style?.bold ? 700 : 400}
                                textAlign={block?.style?.align || 'left'}
                                whiteSpace="pre-wrap"
                                onClick={() => setSelectedFidelityBlock({
                                  id: blockKey,
                                  page: pageNumber,
                                  bbox,
                                  role: block?.role || 'body',
                                  confidence: block?.confidence ?? null,
                                  type: block?.type || 'line',
                                })}
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
                                  <Textarea
                                    variant="unstyled"
                                    resize="none"
                                    overflow="hidden"
                                    value={text}
                                    placeholder={hasManualEdit ? '' : ''}
                                    minH={`${height}px`}
                                    onFocus={() => {
                                      if (!hasManualEdit) {
                                        setFidelityEdits((prev) => ({ ...prev, [blockKey]: originalText }));
                                      }
                                    }}
                                    onChange={(e) => {
                                      const next = e.target.value;
                                      setFidelityEdits((prev) => ({ ...prev, [blockKey]: next }));
                                      setHasUnsavedChanges(true);
                                    }}
                                  />
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
                    );
                  })}
                </VStack>
              ) : (
                <EditorContent editor={editor} />
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
