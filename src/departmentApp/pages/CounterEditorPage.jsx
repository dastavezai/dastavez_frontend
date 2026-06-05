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
  Tooltip,
  useToast,
  Badge,
  Alert,
  AlertIcon,
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
  Progress,
  Tag,
  TagLabel,
  useColorMode,
} from '@chakra-ui/react';
import { FaArrowLeft, FaFileAlt, FaBalanceScale } from 'react-icons/fa';
import {
  MdAutoAwesome,
  MdGavel,
  MdRefresh,
  MdCheckCircle,
  MdUndo,
  MdRedo,
  MdPictureAsPdf,
  MdCode,
  MdLightMode,
  MdDarkMode,
  MdPerson,
  MdDescription,
  MdTune,
} from 'react-icons/md';
import fileService from '../services/fileService';
import { formatDepartmentApiError } from '../services/apiBase';
import CounterFillBlanksPanel from '../components/CounterFillBlanksPanel';
import { countBlanksInResult, isPlaceholderValue } from '../utils/counterStudioBlanks';
import { normalizeIndexState } from '../utils/counterStudioIndex';

/* ─── helpers ─────────────────────────────────────────── */
const cleanPartyScan = (val) => {
  if (!val) return '';
  const cleaned = String(val).replace(/_{3,}/g, '').replace(/\s{2,}/g, ' ').replace(/^[\s,./;:-]+|[\s,./;:-]+$/g, '').trim();
  return cleaned.length > 2 ? cleaned : '';
};


const suggestDesignIdFromScan = (scan) => {
  const t = String(scan?.scanResults?.documentType || scan?.detectedDocType || '').toLowerCase();
  if (/writ|habeas|mandamus|certiorari|quo warranto/.test(t)) return 'writ-petition-counter';
  if (/bail|anticipatory|regular bail|criminal misc|cr\.?\s*m\.?\s*p/.test(t)) return 'india-formal-affidavit';
  if (/\bmjc\b|miscellaneous\s*jurisdiction|show\s*cause/i.test(t)) return 'mjc-show-cause-counter';
  const caseNo = String(scan?.scanResults?.caseNumber || scan?.extractedParties?.caseNumber || '').toLowerCase();
  if (/\bmjc\b/.test(caseNo)) return 'mjc-show-cause-counter';
  return '';
};

/* ─── main component ──────────────────────────────────── */
const CounterEditorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
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
  const [formattedPreviewHtml, setFormattedPreviewHtml] = useState('');
  const [viewMode, setViewMode] = useState('paged');
  const [previewRefreshing, setPreviewRefreshing] = useState(false);
  const [defenceText, setDefenceText] = useState('');
  const [petitionSummary, setPetitionSummary] = useState('');
  const [counterMaker, setCounterMaker] = useState('');
  const [wizardStep, setWizardStep] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const skipPreviewRefreshRef = useRef(false);
  const [activeEditTarget, setActiveEditTarget] = useState(null);

  const [historyData, setHistoryData] = useState({ stack: [], index: -1 });
  const skipHistoryRef = useRef(false);

  useEffect(() => {
    if (!result) return;
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }
    setHistoryData(prev => {
      const currentStack = prev.stack.slice(0, prev.index + 1);
      const lastItem = currentStack[currentStack.length - 1];
      if (lastItem === result || JSON.stringify(lastItem) === JSON.stringify(result)) return prev;
      
      currentStack.push(result);
      if (currentStack.length > 30) currentStack.shift();
      return { stack: currentStack, index: currentStack.length - 1 };
    });
  }, [result]);

  const handleUndo = useCallback(() => {
    setHistoryData(prev => {
      if (prev.index > 0) {
        const prevIndex = prev.index - 1;
        const prevState = prev.stack[prevIndex];
        skipHistoryRef.current = true;
        setResult(prevState);
        return { ...prev, index: prevIndex };
      }
      return prev;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryData(prev => {
      if (prev.index < prev.stack.length - 1) {
        const nextIndex = prev.index + 1;
        const nextState = prev.stack[nextIndex];
        skipHistoryRef.current = true;
        setResult(nextState);
        return { ...prev, index: nextIndex };
      }
      return prev;
    });
  }, []);

  const handleCloseModal = () => {
    onClose();
    setWizardStep(1);
  };

  /* ── color tokens ─────────────────────────────── */
  const bg = useColorModeValue('gray.50', '#0f1117');
  const cardBg = useColorModeValue('white', '#1a1d2e');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const headerBg = useColorModeValue('white', '#1a1d2e');
  const previewBg = useColorModeValue('#e8eaf0', '#0d0f1a');
  const toolbarBg = useColorModeValue('gray.50', '#161928');
  const accentPurple = 'purple.500';

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
      if ('annexureIndex' in fields) return { ...next, ...normalizeIndexState(next, { forceRebuildIndex: true }) };
      if ('indexEntries' in fields || 'captionSubject' in fields) return { ...next, ...normalizeIndexState(next) };
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

  /* ── load designs ──────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fileService.getCounterAffidavitDesigns();
        if (cancelled) return;
        const list = data?.designs || [];
        setDesignOptions(list);
        if (!designId && data?.defaultDesignId) setDesignId(data.defaultDesignId);
      } catch (err) {
        if (!cancelled) {
          setDesignOptions([]);
          setLoadError((prev) => prev || formatDepartmentApiError(err, 'Could not load counter templates'));
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── load scan data ────────────────────────────── */
  useEffect(() => {
    if (!fileId) { setScanLoading(false); return; }
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
    const summary = scanData?.scanResults?.summary || scanData?.summary || '';
    if (summary && !petitionSummary) setPetitionSummary(summary);
  }, [scanData]);

  /* ── iframe load handler ───────────────────────── */
  const handleIframeLoad = useCallback((e) => {
    const iframe = e.target;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    const isPaged = viewMode === 'paged';

    let style = doc.getElementById('iframe-view-mode-style');
    if (!style) {
      style = doc.createElement('style');
      style.id = 'iframe-view-mode-style';
      doc.head.appendChild(style);
    }

    if (isPaged) {
      style.textContent = `
        html { background-color: #e8eaf0 !important; margin: 0 !important; padding: 0 !important; }
        body { background-color: #e8eaf0 !important; margin: 0 !important; padding: 24px 0 !important; width: 100% !important; max-width: none !important; min-height: 0 !important; box-shadow: none !important; }
        .a4-document-container { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 0 10px; }
        .a4-page { background-color: white !important; width: 793px !important; height: 1122px !important; box-sizing: border-box !important; padding: 72px 72px 144px 72px !important; box-shadow: 0 4px 24px rgba(0,0,0,0.12) !important; position: relative; overflow: hidden; border-radius: 2px; }
        .a4-page-content { width: 100%; height: 100%; box-sizing: border-box; }
        [data-edit-field], [data-edit-section] { cursor: pointer !important; transition: background-color 0.15s ease, outline 0.15s ease; border-radius: 2px; }
        [data-edit-field]:hover, [data-edit-section]:hover { background-color: rgba(128, 90, 213, 0.08) !important; outline: 1.5px dashed #805AD5 !important; }
      `;
    } else {
      style.textContent = `
        html { background-color: #e8eaf0 !important; margin: 0 !important; padding: 0 !important; }
        body { max-width: 793px !important; margin: 24px auto !important; padding: 72px 72px 144px 72px !important; box-sizing: border-box !important; background: white !important; box-shadow: 0 4px 24px rgba(0,0,0,0.12) !important; min-height: 1122px !important; border-radius: 2px; }
        [data-edit-field], [data-edit-section] { cursor: pointer !important; transition: background-color 0.15s ease; border-radius: 2px; }
        [data-edit-field]:hover, [data-edit-section]:hover { background-color: rgba(128, 90, 213, 0.08) !important; outline: 1.5px dashed #805AD5 !important; }
      `;
    }

    function createPageElement(documentObj, parentContainer) {
      const page = documentObj.createElement('div');
      page.className = 'a4-page';
      const content = documentObj.createElement('div');
      content.className = 'a4-page-content';
      page.appendChild(content);
      parentContainer.appendChild(page);
      return { page, content };
    }

    if (isPaged) {
      const bodyDoc = doc.querySelector('.body-document');
      if (bodyDoc) { while (bodyDoc.firstChild) doc.body.insertBefore(bodyDoc.firstChild, bodyDoc); bodyDoc.remove(); }
      const annSec = doc.querySelector('.annexure-section');
      if (annSec) { while (annSec.firstChild) doc.body.insertBefore(annSec.firstChild, annSec); annSec.remove(); }
      const children = Array.from(doc.body.childNodes);
      const keepNodes = [];
      const contentNodes = [];
      children.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && ['STYLE', 'SCRIPT', 'LINK'].includes(node.tagName)) {
          if (node.id !== 'iframe-view-mode-style') keepNodes.push(node);
        } else { contentNodes.push(node); }
      });
      doc.body.innerHTML = '';
      keepNodes.forEach(node => doc.body.appendChild(node));
      doc.body.appendChild(style);
      const container = doc.createElement('div');
      container.className = 'a4-document-container';
      doc.body.appendChild(container);
      const maxContentHeight = 978;
      let currentPage = createPageElement(doc, container);
      contentNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) { currentPage.content.appendChild(node); return; }
        currentPage.content.appendChild(node);
        if (node.nodeType === Node.ELEMENT_NODE) {
          const inlineStyle = node.getAttribute('style') || '';
          const hasPageBreak = node.classList.contains('page-break-before') || node.classList.contains('photostat-page') || node.classList.contains('photostat-annexure-heading') || inlineStyle.includes('page-break-before:always') || inlineStyle.includes('page-break-before: always');
          if (hasPageBreak && currentPage.content.childNodes.length > 1) { currentPage = createPageElement(doc, container); currentPage.content.appendChild(node); return; }
          if (currentPage.content.scrollHeight > maxContentHeight && currentPage.content.childNodes.length > 1) { currentPage = createPageElement(doc, container); currentPage.content.appendChild(node); }
        }
      });
    }

    const clickHandler = (event) => {
      const target = event.target.closest('[data-edit-field], [data-edit-section]');
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const field = target.getAttribute('data-edit-field');
      const section = target.getAttribute('data-edit-section');
      const index = target.getAttribute('data-edit-index');
      setActiveEditTarget({ field, section, index: index !== null && index !== '' ? parseInt(index, 10) : null, timestamp: Date.now() });
    };
    doc.addEventListener('click', clickHandler, true);
  }, [viewMode]);

  /* ── export helpers ────────────────────────────── */
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
      introductoryParagraphs: mergedResult.introductoryParagraphs,
      statementOfFacts: mergedResult.statementOfFacts,
      statementOfAdditionalFacts: mergedResult.statementOfAdditionalFacts,
      defenceSection: mergedResult.defenceSection,
      preliminaryObjections: mergedResult.preliminaryObjections,
      counterDraft: mergedResult.counterDraft,
      closingParagraphs: mergedResult.closingParagraphs,
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
  }, []);

  const refreshTemplatePreview = useCallback(async () => {
    const counterData = buildExportCounterData();
    if (!counterData) return;
    setPreviewRefreshing(true);
    try {
      const res = await fileService.previewCounterAffidavit({ counterData, language, court: mergedResult?.court || '', designId: designId || undefined, simpleLayout: false, fileId });
      if (res?.previewHtml) { setFormattedPreviewHtml(res.previewHtml); if (res.designId) setDesignId(res.designId); }
    } catch (err) {
      toast({ title: 'Could not refresh preview', description: formatDepartmentApiError(err, 'Preview failed'), status: 'warning', duration: 4000 });
    } finally { setPreviewRefreshing(false); }
  }, [buildExportCounterData, language, mergedResult?.court, designId, toast]);

  useEffect(() => {
    if (!mergedResult || loading) return;
    if (skipPreviewRefreshRef.current) { skipPreviewRefreshRef.current = false; return; }
    const timer = setTimeout(() => refreshTemplatePreview(), 450);
    return () => clearTimeout(timer);
  }, [designId, mergedResult, loading, refreshTemplatePreview]);

  const injectedPreviewHtml = useMemo(() => {
    if (!formattedPreviewHtml) return '';
    const css = `<style>@media screen { html { background-color: #e8eaf0 !important; } body { max-width: 793px !important; margin: 24px auto !important; padding: 72px 72px 144px 72px !important; box-sizing: border-box !important; background: white !important; box-shadow: 0 4px 24px rgba(0,0,0,0.12) !important; min-height: 1122px !important; } }</style>`;
    if (formattedPreviewHtml.includes('</head>')) return formattedPreviewHtml.replace('</head>', css + '</head>');
    return css + formattedPreviewHtml;
  }, [formattedPreviewHtml]);

  const selectedDesignLabel = useMemo(() => {
    const match = designOptions.find((d) => d.id === designId);
    return match?.label || designId || 'Auto-select template';
  }, [designOptions, designId]);

  /* ── actions ────────────────────────────────────── */
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
      const res = await fileService.generateCounterAffidavit({ fileId, language, designId: designId || undefined, createEditableDocument: false, simplePreview: false, defenceText, petitionSummary, counterMaker, regenerate: true });
      skipPreviewRefreshRef.current = true;
      applyGeneratedView(res);
      toast({ title: '✓ Counter draft ready', description: 'Fill any remaining blanks in the editor panel.', status: 'success', duration: 4000 });
      onClose();
    } catch (err) {
      const msg = formatDepartmentApiError(err, 'Counter generation failed. Check LLM settings on the server.');
      setGenerateError(msg);
      toast({ title: 'Generation failed', description: msg, status: 'error', duration: 8000 });
    } finally { setLoading(false); }
  };

  const handleExport = async (format) => {
    if (!mergedResult) {
      toast({ title: 'Nothing to export', description: 'Generate a counter first.', status: 'warning', duration: 3000 });
      return;
    }
    setExporting(true);
    try {
      const data = await fileService.exportCounterAffidavit({ counterData: buildExportCounterData(), format, court: mergedResult?.court || '', language, designId: result?.designId || designId || undefined, simpleLayout: false, fileId });
      const mimeType = format === 'pdf' ? 'application/pdf' : (format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/html');
      const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `counter_affidavit.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Download started', status: 'success', duration: 2000 });
    } catch (err) {
      toast({ title: 'Export failed', description: err?.response?.data?.message || err?.message, status: 'error', duration: 4000 });
    } finally { setExporting(false); }
  };

  /* ── no file state ──────────────────────────────── */
  if (!fileId) {
    return (
      <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6} maxW="sm" textAlign="center" p={8}>
          <Box p={5} borderRadius="full" bg="purple.50" _dark={{ bg: 'purple.900' }}>
            <Icon as={MdGavel} boxSize={10} color="purple.500" />
          </Box>
          <VStack spacing={2}>
            <Text fontWeight="bold" fontSize="xl">Counter Studio</Text>
            <Text color={muted} fontSize="sm">
              Open Counter Studio from the editor after uploading and scanning your petition document.
            </Text>
          </VStack>
          <Button leftIcon={<FaArrowLeft />} colorScheme="purple" variant="outline" onClick={() => navigate(-1)}>
            Go back to editor
          </Button>
        </VStack>
      </Box>
    );
  }

  const hasResult = !!mergedResult;
  const completionPct = hasResult && blankCount === 0 ? 100 : hasResult ? Math.max(10, Math.round(100 - (blankCount / 20) * 100)) : 0;

  return (
    <Box minH="100vh" bg={bg} fontFamily="'Inter', system-ui, sans-serif">

      {/* ═══ HEADER ═══════════════════════════════════════════ */}
      <Box
        borderBottomWidth="1px"
        borderColor={borderColor}
        bg={headerBg}
        px={4}
        py={0}
        position="sticky"
        top={0}
        zIndex={20}
        boxShadow="0 1px 3px rgba(0,0,0,0.06)"
      >
        <HStack h="56px" justify="space-between">
          {/* Left: Back + Title */}
          <HStack spacing={3} minW={0}>
            <Tooltip label="Back to editor" placement="bottom">
              <Button size="sm" leftIcon={<FaArrowLeft />} variant="ghost" onClick={() => navigate(-1)} color={muted} _hover={{ color: 'purple.500', bg: 'purple.50' }}>
                Back
              </Button>
            </Tooltip>
            <Divider orientation="vertical" h={6} />
            <HStack spacing={2.5} minW={0}>
              <Box p={1.5} borderRadius="md" bg="purple.500">
                <Icon as={MdGavel} color="white" boxSize={4} />
              </Box>
              <VStack align="start" spacing={0} minW={0}>
                <Text fontWeight="700" fontSize="sm" letterSpacing="-0.01em">Counter Studio</Text>
                <Text fontSize="2xs" color={muted} noOfLines={1} maxW="260px">
                  {scanData?.fileName
                    ? scanData.fileName
                    : fileId
                      ? `File: ${fileId.slice(0, 12)}…`
                      : 'No document'}
                  {scanData?.scanStatus && scanData.scanStatus !== 'none' ? ` · Scan: ${scanData.scanStatus}` : ''}
                </Text>
              </VStack>
            </HStack>
          </HStack>

          {/* Center: completion bar (only when result exists) */}
          {hasResult && (
            <HStack spacing={2} flex={1} maxW="260px" mx={4}>
              <Progress
                value={completionPct}
                size="xs"
                colorScheme={completionPct === 100 ? 'green' : 'purple'}
                borderRadius="full"
                flex={1}
                bg={useColorModeValue('gray.100', 'whiteAlpha.100')}
              />
              <Text fontSize="2xs" color={muted} whiteSpace="nowrap">
                {blankCount > 0 ? `${blankCount} blank${blankCount > 1 ? 's' : ''}` : '✓ Complete'}
              </Text>
            </HStack>
          )}

          {/* Right: controls */}
          <HStack spacing={2} flexShrink={0}>
            {/* Dark mode toggle */}
            <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'}>
              <Button size="sm" variant="ghost" onClick={toggleColorMode} color={muted} px={2}>
                <Icon as={colorMode === 'light' ? MdDarkMode : MdLightMode} boxSize={4} />
              </Button>
            </Tooltip>

            {/* View mode */}
            <Select
              size="sm"
              w="110px"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              bg={cardBg}
              borderColor={borderColor}
              fontSize="xs"
              borderRadius="md"
            >
              <option value="continuous">Scroll</option>
              <option value="paged">A4 Pages</option>
            </Select>

            {/* Language */}
            <Select
              size="sm"
              w="90px"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              bg={cardBg}
              borderColor={borderColor}
              fontSize="xs"
              borderRadius="md"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </Select>

            {/* Template */}
            {designOptions.length > 0 && (
              <Select
                size="sm"
                maxW="180px"
                value={designId}
                onChange={(e) => setDesignId(e.target.value)}
                bg={cardBg}
                borderColor={borderColor}
                fontSize="xs"
                borderRadius="md"
                title="Court template"
              >
                {designOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.label || d.id}</option>
                ))}
              </Select>
            )}

            <Divider orientation="vertical" h={5} />

            {/* Generate */}
            <Button
              size="sm"
              colorScheme="purple"
              leftIcon={loading ? undefined : <MdAutoAwesome />}
              onClick={onOpen}
              isLoading={loading}
              loadingText="Generating…"
              isDisabled={scanLoading}
              fontWeight="600"
              px={4}
              _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
              transition="all 0.15s"
            >
              Generate
            </Button>

            {/* Export */}
            {hasResult && (
              <>
                <Tooltip label="Export as HTML">
                  <Button size="sm" variant="outline" leftIcon={<MdCode />} onClick={() => handleExport('html')} isLoading={exporting} borderColor={borderColor} fontSize="xs">
                    HTML
                  </Button>
                </Tooltip>
                <Tooltip label="Export as PDF">
                  <Button size="sm" colorScheme="red" variant="outline" leftIcon={<MdPictureAsPdf />} onClick={() => handleExport('pdf')} isLoading={exporting} fontSize="xs">
                    PDF
                  </Button>
                </Tooltip>
              </>
            )}
          </HStack>
        </HStack>
      </Box>

      {/* ═══ ALERTS ════════════════════════════════════════════ */}
      {(loadError || generateError) && (
        <Box px={5} pt={3}>
          {loadError && (
            <Alert status="warning" borderRadius="lg" mb={2} fontSize="sm">
              <AlertIcon />
              <Box><Text fontWeight="semibold">Connection issue</Text><Text>{loadError}</Text></Box>
            </Alert>
          )}
          {generateError && (
            <Alert status="error" borderRadius="lg" mb={2} fontSize="sm">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold">Could not generate counter</Text>
                <Text>{generateError}</Text>
                {!generateError.includes('API server') && !generateError.includes('signed in') && (
                  <Text fontSize="xs" mt={1} opacity={0.7}>Set OPENROUTER_API_KEY in backend/server/.env and restart.</Text>
                )}
              </Box>
            </Alert>
          )}
        </Box>
      )}

      {/* ═══ SCAN INFO BANNER ══════════════════════════════════ */}
      {!scanLoading && scanData?.scanStatus && scanData.scanStatus !== 'none' && !result && extractedParties && (
        <Box mx={5} mt={3} px={4} py={3} borderRadius="lg" bg={useColorModeValue('purple.50', 'purple.900')} borderWidth="1px" borderColor={useColorModeValue('purple.200', 'purple.700')}>
          <HStack spacing={2} mb={1}>
            <Icon as={MdCheckCircle} color="purple.500" boxSize={4} />
            <Text fontSize="sm" fontWeight="semibold" color={useColorModeValue('purple.700', 'purple.200')}>
              Smart Scan data ready — click Generate to create the counter
            </Text>
          </HStack>
          {(extractedParties.petitioner || extractedParties.respondent) && (
            <HStack spacing={2} flexWrap="wrap" mt={1}>
              {extractedParties.petitioner && (
                <Tag size="sm" colorScheme="blue" variant="subtle">
                  <TagLabel fontSize="2xs">Petitioner: {extractedParties.petitioner.slice(0, 40)}</TagLabel>
                </Tag>
              )}
              {extractedParties.respondent && (
                <Tag size="sm" colorScheme="red" variant="subtle">
                  <TagLabel fontSize="2xs">Respondent: {extractedParties.respondent.slice(0, 40)}</TagLabel>
                </Tag>
              )}
              {extractedParties.court && (
                <Tag size="sm" colorScheme="purple" variant="subtle">
                  <TagLabel fontSize="2xs">{extractedParties.court.slice(0, 40)}</TagLabel>
                </Tag>
              )}
            </HStack>
          )}
        </Box>
      )}

      {/* ═══ MAIN CONTENT ══════════════════════════════════════ */}
      {scanLoading ? (
        <VStack py={20} spacing={3}>
          <Spinner size="lg" color="purple.500" thickness="3px" />
          <Text color={muted} fontSize="sm">Loading document context…</Text>
        </VStack>
      ) : (
        <Box px={5} pt={4} pb={8}>
          <Grid templateColumns={{ base: '1fr', lg: '6fr 4fr' }} gap={5} alignItems="start">

            {/* ── LEFT: Preview ─────────────────────────────── */}
            <GridItem minW={0}>
              <Box
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="0 1px 4px rgba(0,0,0,0.06)"
              >
                {/* preview toolbar */}
                <HStack
                  px={4}
                  py={2.5}
                  borderBottomWidth="1px"
                  borderColor={borderColor}
                  bg={toolbarBg}
                  justify="space-between"
                >
                  <HStack spacing={2}>
                    <Icon as={FaFileAlt} color="purple.400" boxSize={3.5} />
                    <Text fontSize="xs" fontWeight="600" color={useColorModeValue('gray.700', 'gray.200')}>
                      Formatted Preview
                    </Text>
                    <Badge colorScheme="purple" fontSize="2xs" variant="subtle" px={2} borderRadius="full">
                      {selectedDesignLabel}
                    </Badge>
                  </HStack>
                  <HStack spacing={2}>
                    {(previewRefreshing || loading) && (
                      <HStack spacing={1.5}>
                        <Spinner size="xs" color="purple.400" />
                        <Text fontSize="2xs" color={muted}>{loading ? 'Generating…' : 'Updating…'}</Text>
                      </HStack>
                    )}
                    {hasResult && !previewRefreshing && !loading && (
                      <HStack spacing={1}>
                        <Tooltip label="Undo">
                          <Button size="xs" variant="ghost" onClick={handleUndo} color={muted} px={1.5} isDisabled={historyData.index <= 0}>
                            <Icon as={MdUndo} boxSize={3.5} />
                          </Button>
                        </Tooltip>
                        <Tooltip label="Redo">
                          <Button size="xs" variant="ghost" onClick={handleRedo} color={muted} px={1.5} isDisabled={historyData.index >= historyData.stack.length - 1}>
                            <Icon as={MdRedo} boxSize={3.5} />
                          </Button>
                        </Tooltip>
                        <Tooltip label="Refresh preview">
                          <Button size="xs" variant="ghost" onClick={refreshTemplatePreview} color={muted} px={1.5}>
                            <Icon as={MdRefresh} boxSize={3.5} />
                          </Button>
                        </Tooltip>
                      </HStack>
                    )}
                    <Badge fontSize="2xs" colorScheme="gray" variant="outline">
                      {viewMode === 'paged' ? 'A4 Pages' : 'Scroll'}
                    </Badge>
                  </HStack>
                </HStack>

                {/* preview content */}
                <Box
                  minH={{ base: '480px', lg: 'calc(100vh - 180px)' }}
                  maxH={{ lg: 'calc(100vh - 180px)' }}
                  bg={previewBg}
                  position="relative"
                  overflow="hidden"
                >
                  {loading && (
                    <VStack
                      position="absolute" inset={0} zIndex={2}
                      bg={useColorModeValue('whiteAlpha.700', 'blackAlpha.700')}
                      justify="center" spacing={3}
                      backdropFilter="blur(4px)"
                    >
                      <Spinner color="purple.500" size="lg" thickness="3px" />
                      <Text fontSize="sm" fontWeight="medium" color="purple.600">Generating counter affidavit…</Text>
                    </VStack>
                  )}

                  {formattedPreviewHtml ? (
                    <Box
                      as="iframe"
                      title="Counter affidavit preview"
                      srcDoc={injectedPreviewHtml}
                      w="100%"
                      h={{ base: '480px', lg: 'calc(100vh - 180px)' }}
                      minH="480px"
                      border="none"
                      display="block"
                      onLoad={handleIframeLoad}
                    />
                  ) : (
                    <VStack
                      minH={{ base: '480px', lg: 'calc(100vh - 180px)' }}
                      justify="center"
                      spacing={5}
                      px={8}
                    >
                      {/* decorative rings */}
                      <Box position="relative">
                        <Box
                          position="absolute" inset="-12px"
                          borderRadius="full" border="2px dashed"
                          borderColor={useColorModeValue('purple.200', 'purple.700')}
                          opacity={0.5}
                        />
                        <Box p={5} borderRadius="full" bg={useColorModeValue('purple.50', 'purple.900')}>
                          <Icon as={MdGavel} boxSize={10} color="purple.400" />
                        </Box>
                      </Box>
                      <VStack spacing={2} textAlign="center" maxW="sm">
                        <Text fontWeight="700" fontSize="lg" letterSpacing="-0.01em">
                          Ready to draft your counter
                        </Text>
                        <Text fontSize="sm" color={muted} lineHeight="1.6">
                          Click <strong>Generate</strong> to create a court-ready counter affidavit using the scanned petition data and your defence notes.
                        </Text>
                      </VStack>
                      <HStack spacing={2} flexWrap="wrap" justify="center">
                        {['Auto-fills parties', 'Court-format layout', 'Editable template'].map((f) => (
                          <Tag key={f} size="sm" colorScheme="purple" variant="subtle" borderRadius="full">
                            <TagLabel fontSize="2xs">✓ {f}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                      <Button
                        colorScheme="purple"
                        leftIcon={<MdAutoAwesome />}
                        onClick={() => {
                          setWizardStep(1);
                          onOpen();
                        }}
                        isLoading={loading}
                        isDisabled={scanLoading}
                        size="md"
                        fontWeight="600"
                        px={6}
                        borderRadius="lg"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                      >
                        Generate Counter Affidavit
                      </Button>
                    </VStack>
                  )}
                </Box>
              </Box>
            </GridItem>

            {/* ── RIGHT: Editor Panel ────────────────────────── */}
            <GridItem minW={0}>
              {mergedResult ? (
                <Box
                  position={{ lg: 'sticky' }}
                  top={{ lg: '72px' }}
                  maxH={{ lg: 'calc(100vh - 88px)' }}
                  overflowY="auto"
                  borderRadius="xl"
                  boxShadow="0 1px 4px rgba(0,0,0,0.06)"
                  css={{
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(128,90,213,0.3)', borderRadius: '2px' },
                  }}
                >
                  <CounterFillBlanksPanel
                    result={mergedResult}
                    blankCount={blankCount}
                    onPatch={patchResult}
                    onPatchCounterDraft={patchCounterDraft}
                    onAnnexureChange={refreshTemplatePreview}
                    activeEditTarget={activeEditTarget}
                    scanData={scanData}
                    fileId={fileId}
                  />
                </Box>
              ) : (
                /* empty state for right panel */
                <Box
                  p={6}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="xl"
                  bg={cardBg}
                  textAlign="center"
                  boxShadow="0 1px 4px rgba(0,0,0,0.06)"
                >
                  <VStack spacing={4}>
                    <Box p={4} borderRadius="full" bg={useColorModeValue('gray.100', 'whiteAlpha.100')}>
                      <Icon as={MdTune} boxSize={7} color={muted} />
                    </Box>
                    <VStack spacing={1}>
                      <Text fontWeight="600" fontSize="sm">Editor panel</Text>
                      <Text fontSize="xs" color={muted} lineHeight="1.6">
                        Generate a counter to unlock the template editor, precedence search, and case law tools.
                      </Text>
                    </VStack>
                    <Button
                      colorScheme="purple"
                      variant="outline"
                      leftIcon={<MdAutoAwesome />}
                      onClick={() => {
                        setWizardStep(1);
                        onOpen();
                      }}
                      isLoading={loading}
                      isDisabled={scanLoading}
                      size="sm"
                      w="full"
                      borderRadius="lg"
                    >
                      Generate Counter with AI
                    </Button>
                  </VStack>
                </Box>
              )}
            </GridItem>
          </Grid>
        </Box>
      )}

      {/* ═══ GENERATE MODAL ═══════════════════════════════════ */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent bg={cardBg} borderRadius="2xl" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
          {/* modal header accent */}
          <Box h="4px" bgGradient="linear(to-r, purple.400, blue.400)" />
          <ModalHeader pb={2}>
            <HStack spacing={3}>
              <Box p={2} borderRadius="lg" bg="purple.500">
                <Icon as={MdAutoAwesome} color="white" boxSize={4} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="md" fontWeight="700">Generate Counter Affidavit</Text>
                <Text fontSize="xs" color={muted} fontWeight="400">Step {wizardStep} of 3</Text>
              </VStack>
            </HStack>
            <Progress mt={4} value={(wizardStep / 3) * 100} size="xs" colorScheme="purple" borderRadius="full" />
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody pb={6}>
            <VStack spacing={5} align="stretch">
              {generateError && (
                <Alert status="error" borderRadius="lg" fontSize="sm">
                  <AlertIcon />
                  <Text>{generateError}</Text>
                </Alert>
              )}

              {/* Step 1: Extracted party info & Counter maker */}
              {wizardStep === 1 && (
                <Box>
                  {extractedParties && (extractedParties.petitioner || extractedParties.respondent) && (
                    <Box p={3} borderRadius="lg" bg={useColorModeValue('purple.50', 'purple.900')} borderWidth="1px" borderColor={useColorModeValue('purple.200', 'purple.700')} mb={4}>
                      <Text fontSize="xs" fontWeight="700" color={useColorModeValue('purple.700', 'purple.200')} mb={2} textTransform="uppercase" letterSpacing="0.05em">
                        Detected from scan
                      </Text>
                      <VStack align="stretch" spacing={1}>
                        {extractedParties.petitioner && (
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" fontSize="2xs" minW="70px" textAlign="center">Petitioner</Badge>
                            <Text fontSize="xs" color={muted} noOfLines={1}>{extractedParties.petitioner}</Text>
                          </HStack>
                        )}
                        {extractedParties.respondent && (
                          <HStack spacing={2}>
                            <Badge colorScheme="red" fontSize="2xs" minW="70px" textAlign="center">Respondent</Badge>
                            <Text fontSize="xs" color={muted} noOfLines={1}>{extractedParties.respondent}</Text>
                          </HStack>
                        )}
                        {extractedParties.court && (
                          <HStack spacing={2}>
                            <Badge colorScheme="purple" fontSize="2xs" minW="70px" textAlign="center">Court</Badge>
                            <Text fontSize="xs" color={muted} noOfLines={1}>{extractedParties.court}</Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  )}

                  <Box>
                    <HStack mb={1.5}>
                      <Icon as={MdPerson} color="purple.400" boxSize={3.5} />
                      <Text fontSize="sm" fontWeight="600">Who is making the counter?</Text>
                    </HStack>
                    <Input
                      placeholder="e.g., Respondent No. 2, District Magistrate, Patna"
                      value={counterMaker}
                      onChange={(e) => setCounterMaker(e.target.value)}
                      size="md"
                      borderRadius="lg"
                      borderColor={borderColor}
                      _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                    />
                  </Box>
                </Box>
              )}

              {/* Step 2: Petition summary */}
              {wizardStep === 2 && (
                <Box>
                  <HStack mb={1.5} justify="space-between">
                    <HStack>
                      <Icon as={MdDescription} color="blue.400" boxSize={3.5} />
                      <Text fontSize="sm" fontWeight="600">Petition facts / prayer</Text>
                    </HStack>
                    {petitionSummary && (
                      <Badge colorScheme="green" fontSize="2xs" variant="subtle">Auto-filled from scan</Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color={muted} mb={1.5}>
                    What the petitioner is claiming. Review and edit if needed.
                  </Text>
                  <Textarea
                    placeholder="e.g., To reckon the seniority of the petitioners…"
                    value={petitionSummary}
                    onChange={(e) => setPetitionSummary(e.target.value)}
                    minH="200px"
                    borderRadius="lg"
                    borderColor={borderColor}
                    fontSize="sm"
                    resize="vertical"
                    _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                  />
                </Box>
              )}

              {/* Step 3: Defence notes */}
              {wizardStep === 3 && (
                <Box>
                  <HStack mb={1.5}>
                    <Icon as={FaBalanceScale} color="teal.400" boxSize={3.5} />
                    <Text fontSize="sm" fontWeight="600">Defence / counter arguments</Text>
                  </HStack>
                  <Text fontSize="xs" color={muted} mb={1.5}>
                    Provide facts, reasoning, or arguments. AI will structure these into numbered paragraphs.
                  </Text>
                  <Textarea
                    placeholder="e.g., The claims are false because the payment was completed on 12 Jan…"
                    value={defenceText}
                    onChange={(e) => setDefenceText(e.target.value)}
                    minH="200px"
                    borderRadius="lg"
                    borderColor={borderColor}
                    fontSize="sm"
                    resize="vertical"
                    _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor={borderColor} pt={3} gap={2} justifyContent="space-between">
            <Box>
              <Button variant="ghost" onClick={handleCloseModal} isDisabled={loading} color={muted} size="sm">
                Cancel
              </Button>
            </Box>
            <HStack>
              {wizardStep > 1 && (
                <Button variant="outline" onClick={() => setWizardStep(prev => prev - 1)} isDisabled={loading} size="sm">
                  Back
                </Button>
              )}
              {wizardStep < 3 ? (
                <Button colorScheme="purple" onClick={() => setWizardStep(prev => prev + 1)} size="sm" px={6}>
                  Next
                </Button>
              ) : (
                <Button
                  colorScheme="purple"
                  onClick={handleGenerate}
                  isLoading={loading}
                  loadingText="Generating..."
                  leftIcon={!loading ? <MdAutoAwesome /> : undefined}
                  size="sm"
                  px={6}
                  borderRadius="lg"
                  fontWeight="600"
                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                  transition="all 0.15s"
                >
                  Generate Counter
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CounterEditorPage;
