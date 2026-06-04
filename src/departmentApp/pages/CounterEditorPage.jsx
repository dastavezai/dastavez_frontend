import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Select,
  Spinner,
  useColorModeValue,
  Icon,
  IconButton,
  Tooltip,
  useToast,
  Badge,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Grid,
  GridItem,
  Textarea,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import { MdAutoAwesome, MdDownload, MdGavel, MdInsertPageBreak } from 'react-icons/md';
import PageBreakExtension, { useAutoPageBreak } from '../components/editor/PageBreakExtension.jsx';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import fileService from '../services/fileService';
import { formatDepartmentApiError } from '../services/apiBase';
import CounterFillBlanksPanel from '../components/CounterFillBlanksPanel';
import { countBlanksInResult, isPlaceholderValue } from '../utils/counterStudioBlanks';
import { normalizeIndexState } from '../utils/counterStudioIndex';

const cleanPartyScan = (val) => {
  if (!val) return '';
  const cleaned = String(val).replace(/_{3,}/g, '').replace(/\s{2,}/g, ' ').replace(/^[\s,./;:-]+|[\s,./;:-]+$/g, '').trim();
  return cleaned.length > 2 ? cleaned : '';
};

const escapeHtmlText = (s) => String(s || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const extractBodyInnerHtml = (fullHtml) => {
  if (!fullHtml || typeof fullHtml !== 'string') return '';
  try {
    const doc = new DOMParser().parseFromString(fullHtml, 'text/html');
    const inner = doc.body?.innerHTML?.trim();
    return inner && inner.length > 0 ? inner : '';
  } catch {
    return '';
  }
};

const buildEditableCaptionHtml = (result) => {
  const court = String(result.court || '').trim();
  const caseNumber = String(result.caseNumber || '').trim();
  const petitioner = String(result.petitionerName || '').trim() || '_______________';
  const respondent = String(result.respondentName || '').trim() || '_______________';
  const captionTitle = String(result.documentTitle || 'COUNTER AFFIDAVIT').trim();
  const matterLine = String(result.sourceDocumentType || 'In the matter of').trim();

  return `
    <div style="font-family:'Times New Roman',Times,serif; font-size:14pt; line-height:1.45; color:#000;">
      <div style="text-align:center; font-weight:700; text-transform:uppercase; margin-bottom:4px;">${escapeHtmlText(court || 'IN THE HIGH COURT OF JUDICATURE AT ____________')}</div>
      <div style="text-align:center; font-size:12pt; font-style:italic; margin-bottom:8px;">(Writ Jurisdiction)</div>
      <div style="text-align:center; margin-bottom:10px; font-weight:700;">${escapeHtmlText(caseNumber || 'MJC NO. ______ OF ______')}</div>
      <div style="text-align:center; font-weight:700; margin:6px 0 8px 0;">${escapeHtmlText(matterLine)}</div>
      <table style="width:100%; border-collapse:collapse; margin:0 0 8px 0;">
        <tbody>
          <tr>
            <td style="width:74%; padding:4px 0; vertical-align:bottom;">${escapeHtmlText(petitioner)}</td>
            <td style="width:26%; padding:4px 0; text-align:right; vertical-align:bottom; white-space:nowrap;">.... Petitioner</td>
          </tr>
          <tr>
            <td style="padding:10px 0 8px 0; text-align:center; font-weight:700;">VERSUS</td>
            <td style="padding:10px 0 8px 0;"></td>
          </tr>
          <tr>
            <td style="width:74%; padding:4px 0; vertical-align:bottom;">${escapeHtmlText(respondent)}</td>
            <td style="width:26%; padding:4px 0; text-align:right; vertical-align:bottom; white-space:nowrap;">.... Respondent</td>
          </tr>
        </tbody>
      </table>
      <div style="text-align:center; font-weight:700; font-size:15pt; margin:10px 0 14px 0;">${escapeHtmlText(captionTitle)}</div>
    </div>
  `;
};

/** Editable court-layout fallback that keeps the caption alignment stable. */
const buildFallbackEditorHtml = (result) => {
  if (!result) return '<p></p>';
  const parts = [];

  parts.push(buildEditableCaptionHtml(result));

  const deponent = String(result.deponentDetails || '').trim();
  if (deponent) {
    parts.push('<h3 style="margin-top:14px; margin-bottom:6px; text-decoration:underline; text-transform:uppercase;">Details of the deponent</h3>');
    deponent.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean)
      .forEach((p) => parts.push(`<p>${escapeHtmlText(p)}</p>`));
  }

  const defence = Array.isArray(result.defenceSection) ? result.defenceSection : [];
  const defenceFilled = defence.map((p) => String(p || '').trim()).filter(Boolean);
  if (defenceFilled.length) {
    parts.push('<h3 style="margin-top:14px; margin-bottom:6px; text-decoration:underline; text-transform:uppercase;">Defence</h3>');
    defenceFilled.forEach((p, i) => parts.push(`<p>${i + 1}. ${escapeHtmlText(p)}</p>`));
  }

  const objections = result.preliminaryObjections || [];
  if (objections.length) {
    parts.push('<h3 style="margin-top:14px; margin-bottom:6px; text-decoration:underline; text-transform:uppercase;">Preliminary objections</h3>');
    objections.forEach((obj, i) => {
      parts.push(`<p>${i + 1}. ${escapeHtmlText(obj)}</p>`);
    });
  }

  const counter = result.counterDraft || [];
  if (counter.length) {
    parts.push('<h3 style="margin-top:14px; margin-bottom:6px; text-decoration:underline; text-transform:uppercase;">Para-wise reply</h3>');
    parts.push('<table style="width:100%; border-collapse:collapse; margin-bottom:10px;"><thead><tr><th style="border:1px solid #444; padding:6px; text-align:center; width:10%;">Para</th><th style="border:1px solid #444; padding:6px; text-align:center; width:15%;">Stance</th><th style="border:1px solid #444; padding:6px; text-align:left;">Reply</th></tr></thead><tbody>');
    counter.forEach((item) => {
      const pNo = item.petitionParaNo ?? item.paraNo ?? '';
      const stance = item.stance ? ` [${item.stance}]` : '';
      parts.push(
        `<tr><td style="border:1px solid #444; padding:6px; text-align:center; vertical-align:top;">${escapeHtmlText(pNo)}</td><td style="border:1px solid #444; padding:6px; text-align:center; vertical-align:top;">${escapeHtmlText(item.stance || '')}</td><td style="border:1px solid #444; padding:6px; text-align:justify; vertical-align:top;"><strong>Reply to petition para ${escapeHtmlText(pNo)}${escapeHtmlText(stance)}</strong><br/>${escapeHtmlText(item.counterArgument || '')}${item.supportingLaw ? `<br/><em>${escapeHtmlText(item.supportingLaw)}</em>` : ''}</td></tr>`
      );
    });
    parts.push('</tbody></table>');
  }

  const addFacts = result.statementOfAdditionalFacts || [];
  if (addFacts.length) {
    parts.push('<h3 style="margin-top:14px; margin-bottom:6px; text-decoration:underline; text-transform:uppercase;">Additional facts</h3>');
    addFacts.forEach((f, i) => parts.push(`<p>${i + 1}. ${escapeHtmlText(f)}</p>`));
  }

  if (result.prayer) {
    parts.push('<h3 style="margin-top:14px; margin-bottom:6px; text-decoration:underline; text-transform:uppercase;">Prayer</h3>');
    parts.push(`<p>${escapeHtmlText(result.prayer)}</p>`);
  }
  if (result.verification) {
    parts.push('<h3 style="margin-top:14px; margin-bottom:6px; text-decoration:underline; text-transform:uppercase;">Verification</h3>');
    String(result.verification).split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean)
      .forEach((p) => parts.push(`<p>${escapeHtmlText(p)}</p>`));
  }

  const draftText = String(result.draftText || '').trim();
  if (!parts.length && draftText) {
    draftText.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean)
      .forEach((p) => parts.push(`<p>${escapeHtmlText(p)}</p>`));
  }

  return parts.length ? parts.join('') : '<p><em>Generation succeeded but no text was returned. Check server logs and try again.</em></p>';
};

const resolveEditorHtmlFromResult = (result) => {
  if (!result) return '<p></p>';
  return buildFallbackEditorHtml(result);
};

const suggestDesignIdFromScan = (scan) => {
  const t = String(
    scan?.scanResults?.documentType ||
    scan?.detectedDocType ||
    ''
  ).toLowerCase();
  if (/writ|habeas|mandamus|certiorari|quo warranto/.test(t)) return 'writ-petition-counter';
  if (/bail|anticipatory|regular bail|criminal misc|cr\.?\s*m\.?\s*p/.test(t)) return 'india-formal-affidavit';
  if (/\bmjc\b|miscellaneous\s*jurisdiction|show\s*cause/i.test(t)) return 'mjc-show-cause-counter';
  const caseNo = String(scan?.scanResults?.caseNumber || scan?.extractedParties?.caseNumber || '').toLowerCase();
  if (/\bmjc\b/.test(caseNo)) return 'mjc-show-cause-counter';
  return '';
};

const CounterEditorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileId = String(searchParams.get('fileId') || '').trim();

  const [scanData, setScanData] = useState(null);
  const [scanLoading, setScanLoading] = useState(!!fileId);
  const [language, setLanguage] = useState('en');
  const [designId, setDesignId] = useState('');
  const [designOptions, setDesignOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);
  const [generateError, setGenerateError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [pendingEditorHtml, setPendingEditorHtml] = useState('');
  const [formattedPreviewHtml, setFormattedPreviewHtml] = useState('');
  const [layoutMode, setLayoutMode] = useState('court');
  const [viewMode, setViewMode] = useState('paged');
  const [previewRefreshing, setPreviewRefreshing] = useState(false);
  const [defenceText, setDefenceText] = useState('');
  const [counterMaker, setCounterMaker] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const skipPreviewRefreshRef = useRef(false);

  const bg = useColorModeValue('gray.50', 'gray.900');
  const previewPlaceholderBg = useColorModeValue('gray.100', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const toolbarStripBg = useColorModeValue('gray.50', 'gray.850');
  const refPanelBg = useColorModeValue('blue.50', 'blue.900');
  const refPanelPurpleBg = useColorModeValue('purple.50', 'purple.900');

  const extractedParties = scanData?.extractedParties || null;

  const pickPartyField = (fromResult, fromScan) => {
    const r = String(fromResult ?? '').trim();
    if (r && !isPlaceholderValue(r)) return r;
    const scanned = cleanPartyScan(fromScan);
    if (scanned) return scanned;
    return r || fromResult || '';
  };

  const mergedResult = useMemo(() => {
    if (!result) return null;
    const ep = extractedParties || {};
    return {
      ...result,
      petitionerName: pickPartyField(result.petitionerName, ep.petitioner),
      respondentName: pickPartyField(result.respondentName, ep.respondent),
      caseNumber: pickPartyField(result.caseNumber, ep.caseNumber),
      court: pickPartyField(result.court, ep.court),
    };
  }, [result, extractedParties]);

  const blankCount = useMemo(() => countBlanksInResult(mergedResult), [mergedResult]);

  const patchResult = useCallback((fields) => {
    setResult((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...fields };
      if ('annexureIndex' in fields) {
        return { ...next, ...normalizeIndexState(next, { forceRebuildIndex: true }) };
      }
      if ('indexEntries' in fields || 'captionSubject' in fields) {
        return { ...next, ...normalizeIndexState(next) };
      }
      return next;
    });
  }, []);

  const patchCounterDraft = useCallback((index, field, value) => {
    setResult((prev) => {
      if (!prev) return prev;
      const counterDraft = [...(prev.counterDraft || [])];
      counterDraft[index] = { ...counterDraft[index], [field]: value };
      return { ...prev, counterDraft };
    });
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: { depth: 100 } }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder: 'Generated counter will appear here. Edit freely, then export HTML or PDF.',
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      PageBreakExtension,
    ],
    content: '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap-editor counter-studio-editor',
      },
    },
  });

  const pageLineYs = useAutoPageBreak(editor, layoutMode === 'simple', 1122);
  const editorCanvasBg = useColorModeValue('#d8d8d8', 'gray.700');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fileService.getCounterAffidavitDesigns();
        if (cancelled) return;
        const list = data?.designs || [];
        setDesignOptions(list);
        if (!designId && data?.defaultDesignId) {
          setDesignId(data.defaultDesignId);
        }
      } catch (err) {
        if (!cancelled) {
          setDesignOptions([]);
          setLoadError((prev) => prev || formatDepartmentApiError(err, 'Could not load counter templates'));
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!fileId) {
      setScanLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setScanLoading(true);
      try {
        const status = await fileService.getScanStatus(fileId);
        if (!cancelled) setScanData(status || null);
      } catch (e) {
        if (!cancelled) {
          setScanData(null);
          const msg = formatDepartmentApiError(e, 'Could not load scan status for this file.');
          setLoadError(msg);
          toast({ title: 'Could not load file scan', description: msg, status: 'warning', duration: 6000 });
        }
      } finally {
        if (!cancelled) setScanLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [fileId, toast]);

  useEffect(() => {
    if (!scanData) return;
    const suggested = suggestDesignIdFromScan(scanData);
    if (suggested) setDesignId(suggested);
  }, [scanData]);

  useEffect(() => {
    if (!editor || !pendingEditorHtml) return;
    try {
      editor.commands.setContent(pendingEditorHtml, false);
    } catch (err) {
      console.warn('[CounterStudio] setContent failed:', err);
    }
  }, [editor, pendingEditorHtml]);

  const buildExportCounterData = useCallback(() => {
    if (!mergedResult) return null;
    return {
      petitionerName: mergedResult.petitionerName,
      respondentName: mergedResult.respondentName,
      caseNumber: mergedResult.caseNumber,
      court: mergedResult.court,
      sourceDocumentType: mergedResult.sourceDocumentType,
      documentTitle: mergedResult.documentTitle,
      deponentDetails: mergedResult.deponentDetails,
      statementOfFacts: mergedResult.statementOfFacts,
      statementOfAdditionalFacts: mergedResult.statementOfAdditionalFacts,
      defenceSection: mergedResult.defenceSection,
      preliminaryObjections: mergedResult.preliminaryObjections,
      counterDraft: mergedResult.counterDraft,
      prayer: mergedResult.prayer,
      verification: mergedResult.verification,
      oppositePartyNo: mergedResult.oppositePartyNo,
      showCauseOnBehalfOfOpNo: mergedResult.showCauseOnBehalfOfOpNo,
      annexureIndex: mergedResult.annexureIndex,
      procedureKind: mergedResult.procedureKind,
      jurisdictionLine: mergedResult.jurisdictionLine,
      captionSubject: mergedResult.captionSubject,
      indexEntries: mergedResult.indexEntries,
    };
  }, [mergedResult]);

  const applyGeneratedView = useCallback((res) => {
    if (!res) return;
    setResult({ ...res, ...normalizeIndexState(res) });
    if (res.designId) setDesignId(res.designId);
    const preview = String(res.previewHtml || '').trim();
    if (preview.length > 0) setFormattedPreviewHtml(preview);
    const html = resolveEditorHtmlFromResult(res);
    setPendingEditorHtml(html);
    if (editor) {
      try {
        editor.commands.setContent(html, false);
      } catch (err) {
        console.warn('[CounterStudio] setContent failed:', err);
      }
    }
  }, [editor]);

  const refreshTemplatePreview = useCallback(async () => {
    const counterData = buildExportCounterData();
    if (!counterData) return;
    setPreviewRefreshing(true);
    try {
      const res = await fileService.previewCounterAffidavit({
        counterData,
        language,
        court: mergedResult?.court || '',
        designId: designId || undefined,
        simpleLayout: layoutMode === 'simple',
        fileId,
      });
      if (res?.previewHtml) {
        setFormattedPreviewHtml(res.previewHtml);
        if (res.designId) setDesignId(res.designId);
      }
    } catch (err) {
      toast({
        title: 'Could not refresh template preview',
        description: formatDepartmentApiError(err, 'Preview failed'),
        status: 'warning',
        duration: 4000,
      });
    } finally {
      setPreviewRefreshing(false);
    }
  }, [buildExportCounterData, language, mergedResult?.court, designId, layoutMode, toast]);

  useEffect(() => {
    if (!mergedResult || loading) return;
    if (skipPreviewRefreshRef.current) {
      skipPreviewRefreshRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      refreshTemplatePreview();
    }, 450);
    return () => clearTimeout(timer);
  }, [designId, layoutMode, mergedResult, loading, refreshTemplatePreview]);

  useEffect(() => {
    if (!mergedResult || layoutMode !== 'simple') return;
    setPendingEditorHtml(resolveEditorHtmlFromResult(mergedResult));
  }, [mergedResult, layoutMode]);

  const injectedPreviewHtml = useMemo(() => {
    if (!formattedPreviewHtml) return '';
    const isPaged = viewMode === 'paged';
    const css = `
      <style>
        @media screen {
          html { background-color: #f3f4f6 !important; }
          body {
            max-width: 793px !important;
            margin: 24px auto !important;
            padding: 72px !important;
            box-sizing: border-box !important;
            ${isPaged ? `
            background: repeating-linear-gradient(
              to bottom,
              white,
              white 1122px,
              #f3f4f6 1122px,
              #f3f4f6 1146px
            ) !important;
            ` : `background: white !important;`}
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            min-height: 1122px !important;
          }
        }
      </style>
    `;
    if (formattedPreviewHtml.includes('</head>')) {
      return formattedPreviewHtml.replace('</head>', css + '</head>');
    }
    return css + formattedPreviewHtml;
  }, [formattedPreviewHtml, viewMode]);

  const selectedDesignLabel = useMemo(() => {
    const match = designOptions.find((d) => d.id === designId);
    return match?.label || designId || 'Court template';
  }, [designOptions, designId]);

  const handleGenerate = async () => {
    if (!fileId) {
      toast({ title: 'Missing file', description: 'Open Counter Studio from an uploaded document.', status: 'warning', duration: 3000 });
      return;
    }
    setLoading(true);
    setResult(null);
    setFormattedPreviewHtml('');
    setGenerateError('');
    try {
      const res = await fileService.generateCounterAffidavit({
        fileId,
        language,
        designId: designId || undefined,
        createEditableDocument: false,
        simplePreview: layoutMode === 'simple',
        defenceText,
        counterMaker,
        regenerate: true,
      });
      skipPreviewRefreshRef.current = true;
      applyGeneratedView(res);
      const html = resolveEditorHtmlFromResult(res);
      const wordCount = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
      toast({
        title: 'Counter draft ready',
        description: wordCount > 0
          ? `Caption and body prefilled from Smart Scan where possible. Remaining gaps are in Fill in the template.`
          : 'Structured data loaded — use Fill in the template below.',
        status: 'success',
        duration: 5000,
      });
      onClose();
    } catch (err) {
      const msg = formatDepartmentApiError(err, 'Counter generation failed. Check LLM settings on the server.');
      setGenerateError(msg);
      toast({
        title: 'Generation failed',
        description: msg,
        status: 'error',
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    const editedHtml = editor?.getHTML?.() || '';
    const hasAi = !!mergedResult;
    const useTipTapHtml = layoutMode === 'simple'
      && editedHtml.replace(/<[^>]+>/g, '').trim().length > 40;
    if (!hasAi && !useTipTapHtml) {
      toast({ title: 'Nothing to export', description: 'Generate a counter first, then fill the template fields.', status: 'warning', duration: 3000 });
      return;
    }

    setExporting(true);
    try {
      const data = await fileService.exportCounterAffidavit({
        counterData: hasAi ? buildExportCounterData() : { sourceDocumentType: 'Counter Affidavit' },
        format,
        court: mergedResult?.court || '',
        language,
        designId: result?.designId || designId || undefined,
        editedHtml: useTipTapHtml ? editedHtml : undefined,
        simpleLayout: layoutMode === 'simple',
        fileId,
      });

      const blob = data instanceof Blob ? data : new Blob([data], { type: format === 'pdf' ? 'application/pdf' : 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `counter_affidavit.${format === 'pdf' ? 'pdf' : 'html'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Download started',
        description: layoutMode === 'court' ? 'Exported from court template with your filled fields.' : undefined,
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({ title: 'Export failed', description: err?.response?.data?.message || err?.message, status: 'error', duration: 4000 });
    } finally {
      setExporting(false);
    }
  };

  if (!fileId) {
    return (
      <Box minH="100vh" bg={bg} p={8}>
        <VStack spacing={4} maxW="lg" mx="auto" mt={16}>
          <Text fontWeight="bold" fontSize="lg">Counter Studio</Text>
          <Text color={muted} textAlign="center">
            No document selected. Open this page from the editor after analysis using &quot;Open Counter Studio&quot;, or add{' '}
            <Text as="span" fontFamily="mono">?fileId=…</Text> to the URL.
          </Text>
          <Button leftIcon={<FaArrowLeft />} variant="outline" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Box
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={headerBg}
        px={{ base: 4, md: 8 }}
        py={3}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <HStack justify="space-between" flexWrap="wrap" gap={2}>
          <HStack spacing={3}>
            <Button size="sm" leftIcon={<FaArrowLeft />} variant="ghost" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Divider orientation="vertical" h={6} />
            <HStack spacing={2}>
              <Icon as={MdGavel} color="purple.500" boxSize={5} />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="md">Counter Studio</Text>
                <Text fontSize="xs" color={muted} noOfLines={1}>
                  {scanData?.fileName || 'Document'}{scanData?.scanStatus && scanData.scanStatus !== 'none' ? ` · Scan: ${scanData.scanStatus}` : ''}
                </Text>
              </VStack>
            </HStack>
          </HStack>
          <HStack spacing={2} flexWrap="wrap">
            <Select size="sm" w="120px" value={language} onChange={(e) => setLanguage(e.target.value)} bg={cardBg}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </Select>
            <Select
              size="sm"
              w="150px"
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
              bg={cardBg}
              title="Layout styling (after generate, reapplies template without new AI)"
            >
              <option value="court">Court template</option>
              <option value="simple">Word-style</option>
            </Select>
            <Select
              size="sm"
              w="130px"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              bg={cardBg}
              title="Editor Page Layout"
            >
              <option value="continuous">Continuous</option>
              <option value="paged">A4 Pages</option>
            </Select>
            {designOptions.length > 0 && (
              <Select
                size="sm"
                maxW="220px"
                value={designId}
                onChange={(e) => setDesignId(e.target.value)}
                bg={cardBg}
                title="Counter design template"
              >
                {designOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.label || d.id}</option>
                ))}
              </Select>
            )}
            <Button
              size="sm"
              colorScheme="purple"
              leftIcon={<MdAutoAwesome />}
              onClick={onOpen}
              isLoading={loading}
              loadingText="Generating…"
              isDisabled={scanLoading}
            >
              Generate counter
            </Button>
            <Button size="sm" leftIcon={<MdDownload />} variant="outline" onClick={() => handleExport('html')} isLoading={exporting}>
              HTML
            </Button>
            <Button size="sm" leftIcon={<MdDownload />} colorScheme="red" variant="outline" onClick={() => handleExport('pdf')} isLoading={exporting}>
              PDF
            </Button>
          </HStack>
        </HStack>
      </Box>

      <Box maxW="1680px" mx="auto" px={{ base: 4, md: 8 }} py={6}>
        {scanLoading ? (
          <HStack py={12} justify="center"><Spinner /><Text color={muted}>Loading document context…</Text></HStack>
        ) : (
          <VStack align="stretch" spacing={6}>
            {loadError && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="semibold" fontSize="sm">API connection issue</Text>
                  <Text fontSize="sm" mt={1}>{loadError}</Text>
                </Box>
              </Alert>
            )}
            {generateError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="semibold" fontSize="sm">Could not generate counter</Text>
                  <Text fontSize="sm" mt={1}>{generateError}</Text>
                  {!generateError.includes('API server') && !generateError.includes('signed in') && (
                    <Text fontSize="xs" color={muted} mt={2}>
                      If this is an AI key problem: set OPENROUTER_API_KEY (or LLM_PROVIDER=groq) in backend/server/.env and restart the API server.
                    </Text>
                  )}
                </Box>
              </Alert>
            )}
            {scanData?.scanStatus === 'none' && (
              <Box bg="orange.50" borderWidth="1px" borderColor="orange.200" borderRadius="md" p={3} fontSize="sm">
                No active edit session found for this file. Open the document in the editor and run Smart Scan for best party and context extraction.
              </Box>
            )}
            {scanData?.scanStatus && scanData.scanStatus !== 'none' && !result && extractedParties && (
              <Alert status="info" borderRadius="md" fontSize="sm">
                <AlertIcon />
                <Box>
                  <Text>Smart Scan data is available. Generate counter to apply parties and caption to the template.</Text>
                  {(extractedParties.petitioner || extractedParties.respondent) && (
                    <Text fontSize="xs" mt={1} color={muted}>
                      Scan: {extractedParties.petitioner ? `Petitioner — ${extractedParties.petitioner}` : ''}
                      {extractedParties.petitioner && extractedParties.respondent ? ' · ' : ''}
                      {extractedParties.respondent ? `Respondent — ${extractedParties.respondent}` : ''}
                    </Text>
                  )}
                </Box>
              </Alert>
            )}

            <Grid
              templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) minmax(340px, 400px)' }}
              gap={4}
              alignItems="start"
            >
              <GridItem minW={0}>
                <Box
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  overflow="hidden"
                  position="relative"
                >
                  <HStack px={4} py={2} borderBottomWidth="1px" borderColor={borderColor} bg={toolbarStripBg} flexWrap="wrap">
                    <Text fontSize="sm" fontWeight="semibold">Formatted counter</Text>
                    <Badge fontSize="2xs" colorScheme="purple">{selectedDesignLabel}</Badge>
                    <Badge fontSize="2xs" colorScheme="gray">{layoutMode === 'court' ? 'Court layout' : 'Word-style'}</Badge>
                    {(previewRefreshing || loading) && <Spinner size="xs" />}
                  </HStack>
                  <Box minH={{ base: '480px', lg: 'calc(100vh - 200px)' }} maxH={{ lg: 'calc(100vh - 200px)' }} bg="white" position="relative">
                    {loading && (
                      <HStack position="absolute" inset={0} zIndex={2} bg="blackAlpha.50" justify="center">
                        <Spinner color="purple.500" />
                        <Text fontSize="sm">Generating counter…</Text>
                      </HStack>
                    )}
                    {formattedPreviewHtml ? (
                      <Box
                        as="iframe"
                        title="Counter affidavit preview"
                        srcDoc={injectedPreviewHtml}
                        w="100%"
                        h={{ base: '480px', lg: 'calc(100vh - 200px)' }}
                        minH="480px"
                        border="none"
                        display="block"
                      />
                    ) : (
                      <VStack
                        minH="480px"
                        justify="center"
                        spacing={3}
                        px={8}
                        bg={previewPlaceholderBg}
                        textAlign="center"
                      >
                        <Icon as={MdGavel} boxSize={10} color="purple.400" />
                        <Text fontWeight="semibold" maxW="md">
                          Click Generate counter to draft in the template that matches your petition
                        </Text>
                        <Text fontSize="sm" color={muted} maxW="lg">
                          Template: {selectedDesignLabel}. Fill fields on the right after generation.
                        </Text>
                      </VStack>
                    )}
                  </Box>
                </Box>
              </GridItem>

              <GridItem minW={0}>
                {mergedResult ? (
                  <Box
                    position={{ lg: 'sticky' }}
                    top={{ lg: 20 }}
                    maxH={{ lg: 'calc(100vh - 100px)' }}
                    overflowY="auto"
                    bg={cardBg}
                    borderRadius="lg"
                  >
                    <CounterFillBlanksPanel
                      result={mergedResult}
                      blankCount={blankCount}
                      onPatch={patchResult}
                      onPatchCounterDraft={patchCounterDraft}
                      onAnnexureChange={refreshTemplatePreview}
                    />
                  </Box>
                ) : (
                  <Box
                    p={6}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    bg={cardBg}
                    minH="200px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Button
                      size="lg"
                      colorScheme="purple"
                      leftIcon={<MdAutoAwesome />}
                      onClick={onOpen}
                      isLoading={loading}
                      isDisabled={scanLoading}
                      w="full"
                      maxW="300px"
                    >
                      Generate counter with AI
                    </Button>
                  </Box>
                )}
              </GridItem>
            </Grid>

            {layoutMode === 'simple' && (
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
              >
                <HStack px={4} py={2} borderBottomWidth="1px" borderColor={borderColor} bg={toolbarStripBg} flexWrap="wrap" gap={2}>
                  <Text fontSize="sm" fontWeight="semibold">Word-style editor</Text>
                  <Badge fontSize="2xs" colorScheme="gray">Optional · export uses this text in Word-style layout</Badge>
                  {editor && (
                    <Tooltip label="Insert page break (Ctrl+Enter)" hasArrow>
                      <IconButton
                        aria-label="Insert page break"
                        size="sm"
                        variant="outline"
                        icon={<Icon as={MdInsertPageBreak} />}
                        onClick={() => editor.chain().focus().insertPageBreak().run()}
                      />
                    </Tooltip>
                  )}
                </HStack>
                <Box
                  data-page-container
                  minH="320px"
                  bg={editorCanvasBg}
                  py={4}
                  px={{ base: 2, md: 4 }}
                  position="relative"
                  overflow="auto"
                  style={{
                    '--page-canvas-bg': editorCanvasBg,
                    '--pad-left': '72px',
                    '--pad-right': '72px',
                    '--pad-top': '72px',
                    '--pad-bottom': '72px',
                  }}
                >
                  {layoutMode === 'simple' && viewMode === 'paged' && [0, ...pageLineYs].map((y, index, arr) => {
                    const nextY = arr[index + 1] || Math.max(y + 1122, editor?.view?.dom?.scrollHeight || 1122);
                    const height = nextY - y;
                    return (
                      <Box
                        key={`page-bg-${y}`}
                        position="absolute"
                        left="50%"
                        transform="translateX(-50%)"
                        top={`${y + 16}px`}
                        w="793px"
                        h={`${Math.max(0, height - 24)}px`}
                        bg="white"
                        boxShadow="0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)"
                        zIndex={0}
                        pointerEvents="none"
                      />
                    );
                  })}
                  <Box
                    maxW="793px"
                    mx="auto"
                    bg={viewMode === 'paged' ? 'transparent' : 'white'}
                    boxShadow={viewMode === 'paged' ? 'none' : 'md'}
                    position="relative"
                    zIndex={1}
                    sx={{
                      '.tiptap-editor': {
                        outline: 'none',
                        minHeight: viewMode === 'paged' ? '1122px' : 'auto',
                        padding: viewMode === 'paged' ? '72px' : '32px 72px',
                        fontFamily: "'Times New Roman', Times, serif",
                        fontSize: '12pt',
                        lineHeight: 1.5,
                        color: 'gray.800',
                        backgroundColor: 'transparent',
                        _dark: { color: 'gray.100' },
                      },
                      '.tiptap-editor p': { marginBottom: '0.6em' },
                      '.tiptap-editor h1, .tiptap-editor h2, .tiptap-editor h3': {
                        marginTop: '0.75em',
                        marginBottom: '0.4em',
                        fontWeight: 'bold',
                      },
                      '.tiptap-editor table': { width: '100%', marginBottom: '0.75em' },
                      '.tiptap-editor td, .tiptap-editor th': {
                        border: '1px solid',
                        borderColor: 'gray.300',
                        padding: '4px 8px',
                        verticalAlign: 'top',
                      },
                      '.tiptap-editor .page-break, .tiptap-editor div[data-type="page-break"]': {
                        pageBreakAfter: 'always',
                        breakAfter: 'page',
                      },
                      '@media print': {
                        '.tiptap-editor .page-break, .tiptap-editor div[data-type="page-break"]': {
                          pageBreakAfter: 'always',
                          breakAfter: 'page',
                        },
                      },
                    }}
                  >
                    {editor ? <EditorContent editor={editor} /> : <Spinner m={8} />}
                  </Box>
                </Box>
              </Box>
            )}

            {result && (
              <Accordion allowMultiple defaultIndex={[0]}>
                <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="md" mb={2}>
                  <AccordionButton>
                    <HStack flex="1">
                      <Text fontWeight="semibold" fontSize="sm">Petition grounds</Text>
                      <Badge>{result.grounds?.length || 0}</Badge>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={2} maxH="280px" overflowY="auto">
                    <VStack align="stretch" spacing={2}>
                      {result.grounds?.map((g, i) => (
                        <Box key={i} p={2} bg={refPanelBg} borderRadius="md" fontSize="xs">
                          <Text fontWeight="bold">Para {g.paraNo}: {g.claim}</Text>
                          {g.provision && <Text color={muted}>Provision: {g.provision}</Text>}
                        </Box>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="md">
                  <AccordionButton>
                    <HStack flex="1">
                      <Text fontWeight="semibold" fontSize="sm">Para-wise counter (reference)</Text>
                      <Badge colorScheme="purple">{result.counterDraft?.length || 0}</Badge>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={2} maxH="320px" overflowY="auto">
                    <VStack align="stretch" spacing={2}>
                      {result.counterDraft?.map((item, i) => (
                        <Box key={i} p={2} bg={refPanelPurpleBg} borderRadius="md" fontSize="xs">
                          <Text fontWeight="bold">Petition para {item.petitionParaNo ?? item.paraNo}</Text>
                          <Text mt={1}>{item.counterArgument}</Text>
                          {item.supportingLaw && <Text mt={1} fontStyle="italic">{item.supportingLaw}</Text>}
                        </Box>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
          </VStack>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>Setup Counter Affidavit</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Who is making the counter?
                </Text>
                <Input
                  placeholder="e.g., Respondent No. 2, District Magistrate, Patna"
                  value={counterMaker}
                  onChange={(e) => setCounterMaker(e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Defence / Counter Arguments
                </Text>
                <Text fontSize="xs" color={muted} mb={2}>
                  Provide the reasoning, facts, or arguments for your defence. The AI will structure these into paragraphs.
                </Text>
                <Textarea
                  placeholder="e.g., The claims are false because the payment was already completed on 12th Jan..."
                  value={defenceText}
                  onChange={(e) => setDefenceText(e.target.value)}
                  minH="180px"
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleGenerate}
              isLoading={loading}
              loadingText="Generating..."
            >
              Generate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CounterEditorPage;
