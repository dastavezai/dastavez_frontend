import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalBody,
  Box, VStack, HStack, Text, Button, Icon, Progress,
  Badge, Spinner, IconButton, Divider, useColorModeValue,
  Flex, Heading, Alert, AlertIcon, AlertDescription,
  CircularProgress, CircularProgressLabel, Tooltip,
  useToast, Input, FormControl, FormLabel,
} from '@chakra-ui/react';
import {
  FaCloudUploadAlt, FaFileAlt, FaCheckCircle, FaExclamationTriangle,
  FaArrowRight, FaTimes, FaFileWord, FaFilePdf, FaFileImage,
  FaPen, FaSearch, FaBrain, FaShieldAlt, FaBalanceScale,
  FaUpload, FaRobot, FaEdit, FaTrash, FaPlus,
} from 'react-icons/fa';
import { MdOutlineDocumentScanner } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import fileService from '../services/fileService';
import AnalysisDashboard from './analysis/AnalysisDashboard';
import TemplateBrowser from './TemplateBrowser';
import DocumentFieldsModal from './DocumentFieldsModal';
import { useAuth } from '../context/AuthContext';
import DemoLauncher from './DemoMode/DemoLauncher';

const detectPlaceholderFields = (htmlOrText = '') => {
  const fields = [];
  const seen = new Set();

  // Step 1: detect underline-formatted blanks from HTML (<u> with only whitespace inside — Word's blank fields)
  const markedHtml = htmlOrText.replace(/<u>([^<]*)<\/u>/gi, (full, inner) => {
    const stripped = inner.replace(/&nbsp;/g, ' ').replace(/\s/g, '');
    return stripped.length === 0 ? ' ___BLANK___ ' : full;
  });
  const text = markedHtml.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

  // Pattern: label before ___BLANK___ marker
  const underlinePattern = /([A-Za-z][A-Za-z0-9\s,./\-'()]{1,40}?)\s*___BLANK___/g;
  let match;
  while ((match = underlinePattern.exec(text)) !== null) {
    const raw = match[1].trim();
    const label = raw.split(/\s+/).filter(Boolean).slice(-4).join(' ');
    if (!label || label.length < 2) continue;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!seen.has(key) && key.length > 1) {
      seen.add(key);
      fields.push({ key, label, type: 'text', required: true, example: '' });
    }
  }
  // Standalone underline blanks
  const blankCount = (text.match(/___BLANK___/g) || []).length;
  for (let i = fields.length; i < blankCount; i++) {
    const key = `blank_${i + 1}`;
    if (!seen.has(key)) {
      seen.add(key);
      fields.push({ key, label: `Field ${i + 1}`, type: 'text', required: false, example: '' });
    }
  }

  // Step 2: underscore patterns — "Name ____"
  const pattern = /([A-Za-z][A-Za-z0-9\s,./\-'()]{1,40}?)\s*_{3,}/g;
  while ((match = pattern.exec(text)) !== null) {
    const raw = match[1].trim();
    const label = raw.split(/\s+/).filter(Boolean).slice(-4).join(' ');
    if (!label || label.length < 2) continue;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!seen.has(key) && key.length > 1) {
      seen.add(key);
      fields.push({ key, label, type: 'text', required: true, example: '' });
    }
  }
  // Pattern 2: label before dotted blanks — "Name ......"
  const dotted = /([A-Za-z][A-Za-z0-9\s,./\-'()]{1,40}?)\s*\.{4,}/g;
  while ((match = dotted.exec(text)) !== null) {
    const raw = match[1].trim();
    const label = raw.split(/\s+/).filter(Boolean).slice(-4).join(' ');
    if (!label || label.length < 2) continue;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!seen.has(key) && key.length > 1) {
      seen.add(key);
      fields.push({ key, label, type: 'text', required: true, example: '' });
    }
  }
  // Pattern 3: standalone underscores
  const standalone = /(?<![A-Za-z0-9])_{4,}(?![A-Za-z0-9_])/g;
  while ((match = standalone.exec(text)) !== null) {
    const key = `blank_${fields.length + 1}`;
    if (!seen.has(key)) {
      seen.add(key);
      fields.push({ key, label: `Field ${fields.length + 1}`, type: 'text', required: false, example: '' });
    }
  }
  // Pattern 4: standalone dotted lines
  const standaloneDots = /(?<![A-Za-z0-9])\.{6,}(?![A-Za-z0-9])/g;
  while ((match = standaloneDots.exec(text)) !== null) {
    const key = `blank_${fields.length + 1}`;
    if (!seen.has(key)) {
      seen.add(key);
      fields.push({ key, label: `Field ${fields.length + 1}`, type: 'text', required: false, example: '' });
    }
  }
  return fields;
};

const MotionBox = motion(Box);


const SCAN_STAGES = [
  { id: 'extract',    label: 'Extracting Document Text',    icon: FaFileAlt,      color: 'blue.400'   },
  { id: 'ocr',        label: 'Running OCR (if needed)',      icon: MdOutlineDocumentScanner, color: 'cyan.400' },
  { id: 'structure',  label: 'Analysing Document Structure', icon: FaSearch,       color: 'purple.400' },
  { id: 'clauses',    label: 'Detecting Clauses & Risks',    icon: FaShieldAlt,    color: 'orange.400' },
  { id: 'precedence', label: 'Searching Case Precedences',   icon: FaBalanceScale, color: 'teal.400'   },
  { id: 'ai',         label: 'Running Full AI Analysis',     icon: FaBrain,        color: 'pink.400'   },
];


const fileIcon = (file) => {
  if (!file) return FaFileAlt;
  const name = file.name?.toLowerCase() || '';
  if (name.endsWith('.pdf')) return FaFilePdf;
  if (name.endsWith('.docx') || name.endsWith('.doc')) return FaFileWord;
  if (name.endsWith('.rtf') || name.endsWith('.txt')) return FaFileAlt;
  if (/\.(jpg|jpeg|png|gif|bmp|tiff)$/.test(name)) return FaFileImage;
  return FaFileAlt;
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const UploadWizard = ({ isOpen, onClose, onOpenEditor }) => {
  const { token } = useAuth();

  const [step, setStep] = useState('pick');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile]   = useState(null);
  const [uploadPct, setUploadPct]         = useState(0);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [scanStage, setScanStage]         = useState(0);
  const [scanError, setScanError]         = useState(null);
  const [scanData, setScanData]           = useState(null);
  const [sessionId, setSessionId]         = useState(null);
  const [htmlContent, setHtmlContent]     = useState('');
  const [fileName, setFileName]           = useState('');
  
  const [showFillModal, setShowFillModal]       = useState(false);
  const [fillModalFields, setFillModalFields]   = useState([]);
  const [fillModalPrefill, setFillModalPrefill] = useState({});
  const [fillModalTitle, setFillModalTitle]     = useState('');
  const [fillSource, setFillSource]             = useState(''); // 'template' | 'ai' | 'uploaded_json'
  const [showFieldChoice, setShowFieldChoice]   = useState(false);
  const [aiDetectedFields, setAiDetectedFields] = useState([]);
  const [editingAiFields, setEditingAiFields]   = useState(false);
  const [matchedTemplateName, setMatchedTemplateName] = useState('');
  const [sofExpanded, setSofExpanded] = useState(false);
  const [editedSof, setEditedSof] = useState('');
  const inputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const pollRef  = useRef(null);
  const toast = useToast();

  
  useEffect(() => {
    if (isOpen) {
      setStep('pick');
      setSelectedFile(null);
      setUploadPct(0);
      setUploadedFileId(null);
      setScanStage(0);
      setScanError(null);
      setScanData(null);
      setSessionId(null);
      setHtmlContent('');
      setFileName('');
      setShowFillModal(false);
      setFillModalFields([]);
      setFillModalPrefill({});
      setFillModalTitle('');
      setFillSource('');
      setShowFieldChoice(false);
      setAiDetectedFields([]);
      setEditingAiFields(false);
      setMatchedTemplateName('');
      setSofExpanded(false);
      setEditedSof('');
    }
    return () => clearStageTimer();
  }, [isOpen]);

  
  useEffect(() => () => clearStageTimer(), []);

  const clearStageTimer = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  
  const handleFileSelected = useCallback((file) => {
    if (!file) return;
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'application/rtf',
      'text/rtf',
      'text/richtext',
      'application/x-rtf',
      'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff',
    ];
    
    const name = file.name?.toLowerCase() || '';
    const byExt = /\.(pdf|docx?|txt|rtf|jpe?g|png|gif|bmp|tiff?)$/.test(name);
    if (!allowed.includes(file.type) && !byExt) {
      setScanError('Unsupported file type. Please upload a PDF, Word (.docx), Text (.txt), RTF (.rtf), or image file.');
      return;
    }
    setScanError(null);
    setSelectedFile(file);
    setFileName(file.name);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelected(file);
  }, [handleFileSelected]);

  
  const startUploadAndScan = useCallback(async () => {
    if (!selectedFile) return;
    setScanError(null);
    setStep('scanning');
    setScanStage(0);

    
    let stageIdx = 0;
    const stageTimer = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, SCAN_STAGES.length - 1);
      setScanStage(stageIdx);
    }, 15000);
    pollRef.current = stageTimer;

    try {
      
      const uploadResult = await fileService.uploadFile(selectedFile, setUploadPct);
      const fid = uploadResult?.file?._id || uploadResult?._id;
      if (!fid) throw new Error('Upload did not return a file ID');
      setUploadedFileId(fid);

      
      setScanStage(2);
      const scanResult = await fileService.smartScan(fid);

      clearStageTimer();
      setScanStage(SCAN_STAGES.length - 1);

      
      await pollScanStatus(fid, scanResult);

    } catch (err) {
      clearStageTimer();
      setScanError(err?.message || err?.error || 'Upload or scan failed. Please try again.');
      setStep('pick');
    }
  }, [selectedFile]);

  const pollScanStatus = async (fid, initialResult) => {
    
    
    if (
      initialResult?.scanStatus === 'scanned' ||
      initialResult?.scanStatus === 'completed' ||
      initialResult?.sessionId
    ) {
      handleScanComplete(fid, initialResult);
      return;
    }
    
    return new Promise((resolve, reject) => {
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const status = await fileService.getScanStatus(fid);
          
          if (
            status?.scanStatus === 'scanned' ||
            status?.scanStatus === 'completed'
          ) {
            clearStageTimer();
            handleScanComplete(fid, status);
            resolve();
          } else if (status?.scanStatus === 'failed') {
            clearStageTimer();
            setScanError('AI scan failed on the server. Please try again.');
            setStep('pick');
            reject(new Error('scan failed'));
          } else if (attempts > 90) {
            
            clearStageTimer();
            setScanError('Scan timed out. Please try again with a smaller file.');
            setStep('pick');
            reject(new Error('timeout'));
          }
        } catch (e) {
          
        }
      }, 2000);
    });
  };

  const handleScanComplete = (fid, data) => {
    const session = data?.editSession || data;
    setSessionId(session?._id || session?.sessionId || null);
    const html = session?.htmlContent || session?.html || data?.htmlContent || '';
    setHtmlContent(html);
    
    const merged = {
      detectedDocType:       session?.detectedDocType       || data?.detectedDocType       || '',
      extractedParties:      session?.extractedParties      || data?.extractedParties      || null,
      precedenceAnalysis:    session?.precedenceAnalysis    || data?.precedenceAnalysis    || [],
      statutesReferenced:    session?.statutesReferenced    || data?.statutesReferenced    || [],
      complianceIssues:      session?.complianceIssues      || data?.complianceIssues      || [],
      missingClauses:        session?.missingClauses        || data?.missingClauses        || [],
      clauseFlaws:           session?.clauseFlaws           || data?.clauseFlaws           || [],
      chronologicalIssues:   session?.chronologicalIssues   || data?.chronologicalIssues   || [],
      outdatedReferences:    session?.outdatedReferences    || data?.outdatedReferences    || [],
      internalContradictions:session?.internalContradictions|| data?.internalContradictions|| [],
      governmentCompliance:  session?.governmentCompliance  || data?.governmentCompliance  || null,
      
      smartSuggestions:      session?.smartSuggestions     || data?.smartSuggestions     ||
                             session?.suggestions           || data?.suggestions           || [],
      scanResults:           session?.scanResults           || data?.scanResults           || null,
      formatMetadata:        session?.formatMetadata        || data?.formatMetadata        || null,
      riskAnalysis:          session?.riskAnalysis          || data?.riskAnalysis          || null,
      structure:             session?.structure             || data?.structure             || null,
      // Template match data from server
      matchedTemplateFields: session?.matchedTemplateFields || data?.matchedTemplateFields || null,
      matchedTemplateId:     session?.matchedTemplateId     || data?.matchedTemplateId     || '',
      matchedTemplateConfidence: session?.matchedTemplateConfidence || data?.matchedTemplateConfidence || '',
      detectedBlankFields: session?.detectedBlankFields || data?.detectedBlankFields || null,
      extractedDocumentFields: session?.extractedDocumentFields || data?.extractedDocumentFields || null,
      isCompleteDocument: session?.isCompleteDocument || data?.isCompleteDocument || false,
      aiSuggestedPrecedents: session?.aiSuggestedPrecedents || data?.aiSuggestedPrecedents || [],
    };
    setScanData(merged);
    setEditedSof(merged?.scanResults?.summary ?? '');

    // Determine field source: JSON template match vs AI-detected vs none
    const templateFields = merged.matchedTemplateFields;
    const hasTemplateMatch = Array.isArray(templateFields) && templateFields.length > 0 &&
      merged.matchedTemplateConfidence && merged.matchedTemplateConfidence !== 'none';

    const serverDetected = Array.isArray(merged.detectedBlankFields) ? merged.detectedBlankFields : [];
    const detected = serverDetected.length > 0 ? serverDetected : detectPlaceholderFields(html);
    const parties = merged.extractedParties || {};
    const prefill = {};
    if (parties.petitioner) prefill['petitioner'] = parties.petitioner;
    if (parties.respondent) prefill['respondent'] = parties.respondent;
    if (parties.court)      prefill['court']       = parties.court;
    if (parties.caseNumber) prefill['case_number'] = parties.caseNumber;

    if (hasTemplateMatch) {
      // Use precise JSON template fields
      const fields = templateFields.map(f => ({
        key: f.key,
        label: f.label,
        type: f.type || 'text',
        required: f.required !== false,
        example: f.placeholder || f.example || '',
      }));
      fields.forEach(f => { if (parties[f.key]) prefill[f.key] = parties[f.key]; });
      setFillModalFields(fields);
      setFillModalPrefill(prefill);
      setFillModalTitle(merged.detectedDocType || data?.fileName || 'Document');
      setFillSource('template');
      setMatchedTemplateName(merged.matchedTemplateId);
    } else if (merged.isCompleteDocument && Array.isArray(merged.extractedDocumentFields) && merged.extractedDocumentFields.length > 0) {
      // Complete document — use smart-extracted fields for reviewing/editing existing values.
      // This takes priority over detected blanks because the server confirmed the document is complete.
      const smartFields = merged.extractedDocumentFields.map(f => ({
        key: f.key,
        label: f.label,
        type: f.type || 'text',
        required: false,
        example: '',
        category: f.category || 'other',
        originalValue: f.value || '',
      }));
      const smartPrefill = {};
      merged.extractedDocumentFields.forEach(f => {
        if (f.value) smartPrefill[f.key] = f.value;
      });
      setFillModalFields(smartFields);
      setFillModalPrefill(smartPrefill);
      setFillModalTitle(merged.detectedDocType || data?.fileName || 'Document');
      setFillSource('smart_extracted');
      setShowFieldChoice(false);
    } else if (detected.length > 0) {
      // Placeholders found but no template match — save AI-detected for choice UI
      detected.forEach(f => { if (parties[f.key]) prefill[f.key] = parties[f.key]; });
      setAiDetectedFields(detected);
      setFillModalPrefill(prefill);
      setFillModalTitle(merged.detectedDocType || data?.fileName || 'Document');
      setFillSource('');
      setShowFieldChoice(true);
    } else {
      // No placeholders at all
      setFillModalFields([]);
      setFillModalPrefill({});
      setFillModalTitle('');
      setFillSource('');
    }

    setStep('results');
  };

  
  const proceedToEditor = useCallback((overrideHtml, overrideScanData) => {
    const data = overrideScanData || scanData;
    const scanDataWithSof = data ? {
      ...data,
      scanResults: {
        ...(data.scanResults || {}),
        summary: editedSof ?? data.scanResults?.summary ?? '',
      },
    } : data;
    onOpenEditor?.({
      fileId: uploadedFileId,
      sessionId,
      scanData: scanDataWithSof,
      htmlContent: overrideHtml || htmlContent,
      fileName,
      isBlank: false,
    });
    onClose();
  }, [onOpenEditor, uploadedFileId, sessionId, scanData, editedSof, htmlContent, fileName, onClose]);

  const handleOpenEditor = () => {
    if (showFieldChoice) {
      // User hasn't chosen a field source yet — show the choice step
      setStep('fieldChoice');
    } else if (fillModalFields.length > 0) {
      setShowFillModal(true);
    } else {
      proceedToEditor();
    }
  };

  // Handle user choosing to use AI-detected fields
  const handleUseAiFields = () => {
    setEditingAiFields(true);
  };

  // Handle user confirming AI-detected (possibly edited) fields
  const handleConfirmAiFields = () => {
    setFillModalFields(aiDetectedFields);
    setFillSource('ai');
    setEditingAiFields(false);
    setShowFieldChoice(false);
    setStep('results');
    // Open fill modal immediately
    setTimeout(() => setShowFillModal(true), 100);
  };

  // Handle user uploading their own JSON template
  const handleJsonUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const fields = Array.isArray(json.fields) ? json.fields : [];
      if (fields.length === 0) {
        toast({ title: 'Invalid JSON', description: 'No fields found in the uploaded JSON file.', status: 'error', duration: 4000 });
        return;
      }
      const mapped = fields.map(f => ({
        key: f.key,
        label: f.label,
        type: f.type || 'text',
        required: f.required !== false,
        example: f.placeholder || f.example || '',
      }));
      setFillModalFields(mapped);
      setFillSource('uploaded_json');
      setShowFieldChoice(false);
      setStep('results');
      setTimeout(() => setShowFillModal(true), 100);
      toast({ title: 'Template loaded', description: `${mapped.length} fields loaded from JSON.`, status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: 'Invalid file', description: 'Could not parse JSON. Please check the file format.', status: 'error', duration: 4000 });
    }
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  // Add/remove/edit AI-detected fields
  const handleAiFieldChange = (idx, key, value) => {
    setAiDetectedFields(prev => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  };
  const handleAiFieldRemove = (idx) => {
    setAiDetectedFields(prev => prev.filter((_, i) => i !== idx));
  };
  const handleAiFieldAdd = () => {
    setAiDetectedFields(prev => [...prev, { key: `field_${prev.length + 1}`, label: '', type: 'text', required: true, example: '' }]);
  };

  
  const handleFillModalSubmit = async (values) => {
    // Persist field values to server for later use
    try {
      await fileService.saveFilledFieldValues(uploadedFileId, values);
    } catch (_) { /* non-critical */ }

    let updatedHtml = htmlContent;
    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Label-based replacement: match "Label _____" → "Label value"
    const applyLabelReplacement = (h, fieldList, vals) => {
      fieldList.forEach(field => {
        const v = vals[field.key];
        if (!v) return;
        const labelRe = new RegExp(escapeRe(field.label) + '\\s*_{3,}', 'gi');
        if (labelRe.test(h)) {
          h = h.replace(new RegExp(escapeRe(field.label) + '\\s*_{3,}', 'gi'), field.label + ' ' + v);
        } else {
          // Fallback: replace next unmatched blank sequentially
          h = h.replace(/_{3,}/, v);
        }
      });
      return h;
    };

    if (fillSource === 'smart_extracted') {
      // Global find-replace for complete documents: replace original value → new value everywhere
      fillModalFields.forEach(field => {
        const newVal = values[field.key];
        const origVal = field.originalValue;
        if (!origVal || !newVal || newVal === origVal) return;
        // Replace all occurrences of original value with new value in HTML
        // Use a text-aware approach: replace in text nodes while preserving HTML tags
        const escaped = escapeRe(origVal);
        const regex = new RegExp(escaped, 'g');
        updatedHtml = updatedHtml.replace(regex, newVal);
      });
    } else if (fillSource === 'template' || fillSource === 'ai' || fillSource === 'uploaded_json') {
      // Client-side replacement — try label-based pattern matching first
      const labelReplaced = applyLabelReplacement(htmlContent, fillModalFields, values);
      const blanksRemain = (labelReplaced.match(/_{3,}/g) || []).length;
      const hadBlanks = (htmlContent.match(/_{3,}/g) || []).length;

      if (labelReplaced !== htmlContent) {
        // Label replacement worked — use it
        updatedHtml = labelReplaced;
      } else if (fillSource === 'ai') {
        // AI-detected fields on a completed document (no blanks to replace):
        // Fall back to global find-replace using originalValue if fields have them,
        // otherwise just proceed to editor — user's values were persisted to server
        fillModalFields.forEach(field => {
          const newVal = values[field.key];
          const origVal = field.originalValue;
          if (!origVal || !newVal || newVal === origVal) return;
          const escaped = escapeRe(origVal);
          const regex = new RegExp(escaped, 'g');
          updatedHtml = updatedHtml.replace(regex, newVal);
        });
      } else {
        updatedHtml = labelReplaced;
      }
    } else {
      // Legacy path: try server-side fill (for curly-brace {Variable} style documents)
      try {
        const result = await fileService.fillTemplateVariables(values);
        if (result?.htmlContent) updatedHtml = result.htmlContent;
        else if (result?.content) updatedHtml = result.content;
      } catch (err) {
        updatedHtml = applyLabelReplacement(htmlContent, fillModalFields, values);
      }
    }

    // Check for remaining unfilled blanks
    const remaining = (updatedHtml.match(/_{3,}/g) || []).length;
    if (remaining > 0) {
      toast({
        title: `${remaining} blank field${remaining > 1 ? 's' : ''} remain`,
        description: 'Some "_____" placeholders could not be matched. You can fill them manually in the editor.',
        status: 'info',
        duration: 5000,
      });
    }

    // Patch scanData.extractedParties so the Overview sidebar reflects filled values
    const patchedScanData = (() => {
      if (!scanData || !values) return scanData;
      const ep = scanData.extractedParties ? { ...scanData.extractedParties } : {};

      // Map common field key patterns to extractedParties fields
      const pick = (...patterns) => {
        for (const pat of patterns) {
          // Exact key match first
          if (values[pat]) return values[pat];
          // Partial key match: field key normalised to lowercase letters only contains the pattern
          const norm = pat.replace(/[^a-z]/g, '');
          const found = Object.keys(values).find(k => {
            const kn = k.toLowerCase().replace(/[^a-z]/g, '');
            return kn === norm || kn.includes(norm);
          });
          if (found && values[found]) return values[found];
        }
        return undefined;
      };

      const petitionerName    = pick('petitioner_name', 'petitionername', 'petitioner');
      const petitionerFather  = pick('petitioner_father_name', 'father_name', 'fathername');
      const petitionerAddress = pick('petitioner_address', 'address');
      const postOffice        = pick('post_office', 'postoffice', 'post');
      const policeStation     = pick('police_station', 'ps', 'p_s');
      const district          = pick('district');

      if (petitionerName) {
        // Build a composite petitioner string from filled fields
        const parts = [petitionerName];
        if (petitionerFather) parts.push(`S/o ${petitionerFather}`);
        if (petitionerAddress) parts.push(`R/o ${petitionerAddress}`);
        if (postOffice) parts.push(`post-${postOffice}`);
        if (policeStation) parts.push(`P.S. - ${policeStation}`);
        if (district) parts.push(`District - ${district}`);
        ep.petitioner = parts.join(', ');
      }

      const caseNo   = pick('civil_review_case_number', 'case_number', 'caseno', 'case_no', 'writ_case_no');
      const caseYear = pick('civil_review_year', 'case_year', 'year');
      if (caseNo) {
        ep.caseNumber = caseYear ? `${caseNo} of ${caseYear}` : caseNo;
      }

      const petAdv = pick('petitioner_advocate', 'pet_advocate', 'petadvocate', 'petitioner_adv');
      if (petAdv) ep.petitionerAdvocates = [petAdv];

      const resAdv = pick('respondent_advocate', 'res_advocate', 'resadvocate', 'respondent_adv');
      if (resAdv) ep.respondentAdvocates = [resAdv];

      return {
        ...scanData,
        extractedParties: ep,
        scanResults: {
          ...(scanData.scanResults || {}),
          summary: editedSof ?? scanData.scanResults?.summary ?? '',
        },
      };
    })();

    setShowFillModal(false);
    proceedToEditor(updatedHtml, patchedScanData);
  };

  
  const handleFillModalClose = (partialValues, isCancelled) => {
    setShowFillModal(false);
    if (isCancelled) {
      
      console.info('[FillDetails] User cancelled — proceeding to editor without filling fields');
      toast({ title: 'Placeholder fields left empty', description: 'You can fill them manually in the editor.', status: 'info', duration: 3000 });
    }
    proceedToEditor();
  };

  
  const [templateLoading, setTemplateLoading] = useState(false);

  const handleTemplateSelected = async (template) => {
    setTemplateLoading(true);
    let htmlContent = '';
    let fileName = template?.displayTitle || template?.name || 'New Document';

    try {
      if (template?.relPath) {
        const data = await fileService.loadTemplateHtml(template.relPath);
        htmlContent = data?.htmlContent || '';
        if (data?.fileName) fileName = data.fileName;
      }
    } catch (e) {
      console.warn('Template HTML load failed, using description fallback:', e.message);
      
      const desc = template?.descriptionEn || template?.description || '';
      htmlContent = desc
        ? desc.split('\n').map(l => `<p>${l || '<br/>'}</p>`).join('')
        : '<p></p>';
    } finally {
      setTemplateLoading(false);
    }

    onOpenEditor?.({
      fileId: null,
      sessionId: null,
      scanData: null,
      htmlContent,
      fileName,
      isBlank: true,
      templateData: template,
    });
    onClose();
  };

  
  const bg          = useColorModeValue('white', 'gray.900');
  const cardBg      = useColorModeValue('gray.50', 'gray.800');
  const borderCol   = useColorModeValue('gray.200', 'gray.700');
  const textMuted   = useColorModeValue('gray.500', 'gray.400');
  const dropBg      = useColorModeValue(
    dragOver ? 'blue.50' : 'gray.50',
    dragOver ? 'blue.900' : 'gray.800'
  );
  const dropBorder  = dragOver ? 'blue.400' : borderCol;
  const dropHoverBg = useColorModeValue('blue.50', 'blue.900');
  const circleTrack = useColorModeValue('gray.200', 'gray.700');
  const stageCircleBg = useColorModeValue('gray.200', 'gray.700');
  const stageHoverBg  = useColorModeValue('gray.50', 'gray.750');

  
  const renderStep = () => {
    
    if (step === 'pick') return (
      <AnimatePresence mode="wait">
        <MotionBox
          key="pick"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          w="100%"
        >
          <VStack spacing={6} w="100%" py={4}>
            <VStack spacing={1}>
              <Heading size="lg" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                Start with a Document
              </Heading>
              <HStack spacing={1}>
                <Text color={textMuted} fontSize="sm">
                  Upload an existing legal document or start from a blank template.
                </Text>
                <DemoLauncher size="xs" context="upload" />
              </HStack>
            </VStack>

            <Box
              data-tour="upload-dropzone"
              w="100%"
              minH="180px"
              border="2px dashed"
              borderColor={dropBorder}
              borderRadius="xl"
              bg={dropBg}
              cursor="pointer"
              transition="all 0.2s"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap={3}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              _hover={{ borderColor: 'blue.400', bg: dropHoverBg }}
            >
              <Icon
                as={FaCloudUploadAlt}
                boxSize={10}
                color={dragOver ? 'blue.400' : textMuted}
                transition="color 0.2s"
              />
              <VStack spacing={0}>
                <Text fontWeight="semibold" color={dragOver ? 'blue.500' : undefined}>
                  {dragOver ? 'Drop to upload' : 'Drag & Drop your document here'}
                </Text>
                <Text fontSize="xs" color={textMuted}>PDF, Word (.docx), or image — up to 20 MB</Text>
              </VStack>
              <Button size="sm" colorScheme="blue" variant="outline" pointerEvents="none">
                Browse File
              </Button>
            </Box>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelected(e.target.files?.[0])}
            />

            
            {selectedFile && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                w="100%"
              >
                <Box
                  bg={cardBg}
                  border="1px solid"
                  borderColor="green.400"
                  borderRadius="lg"
                  p={3}
                >
                  <HStack>
                    <Icon as={fileIcon(selectedFile)} color="green.400" boxSize={5} />
                    <VStack align="start" spacing={0} flex={1} minW={0}>
                      <Text fontWeight="semibold" noOfLines={1} fontSize="sm">{selectedFile.name}</Text>
                      <Text fontSize="xs" color={textMuted}>{formatBytes(selectedFile.size)}</Text>
                    </VStack>
                    <Icon as={FaCheckCircle} color="green.400" boxSize={4} />
                    <IconButton
                      size="xs"
                      variant="ghost"
                      icon={<FaTimes />}
                      aria-label="Remove file"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setScanError(null); }}
                    />
                  </HStack>
                </Box>
              </MotionBox>
            )}

            {scanError && (
              <Alert status="error" borderRadius="md" fontSize="sm">
                <AlertIcon />
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}

            <HStack w="100%" spacing={3}>
              <Button
                flex={1}
                colorScheme="blue"
                leftIcon={<Icon as={MdOutlineDocumentScanner} />}
                isDisabled={!selectedFile}
                onClick={startUploadAndScan}
                size="md"
              >
                Upload &amp; Scan with AI
              </Button>
              <Divider orientation="vertical" h="40px" />
              <Button
                flex={1}
                variant="outline"
                leftIcon={<Icon as={FaPen} />}
                onClick={() => setStep('template')}
                size="md"
              >
                Start Blank Document
              </Button>
            </HStack>
          </VStack>
        </MotionBox>
      </AnimatePresence>
    );

    
    if (step === 'scanning') return (
      <AnimatePresence mode="wait">
        <MotionBox
          key="scanning"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          w="100%"
        >
          <VStack spacing={6} py={6} w="100%">
            <VStack spacing={1}>
              <Heading size="md">Analysing Your Document</Heading>
              <Text fontSize="sm" color={textMuted}>
                The AI is performing a full deep scan. This may take up to 2 minutes.
              </Text>
            </VStack>

            <CircularProgress
              value={Math.round(((scanStage + 1) / SCAN_STAGES.length) * 100)}
              size="120px"
              color="blue.400"
              trackColor={circleTrack}
              thickness={8}
            >
              <CircularProgressLabel fontSize="xs" fontWeight="bold">
                {Math.round(((scanStage + 1) / SCAN_STAGES.length) * 100)}%
              </CircularProgressLabel>
            </CircularProgress>

            <VStack w="100%" spacing={2} align="stretch">
              {SCAN_STAGES.map((stage, idx) => {
                const isDone = idx < scanStage;
                const isActive = idx === scanStage;
                return (
                  <HStack
                    key={stage.id}
                    bg={isActive ? cardBg : 'transparent'}
                    p={2}
                    borderRadius="md"
                    border={isActive ? '1px solid' : '1px solid transparent'}
                    borderColor={isActive ? 'blue.300' : 'transparent'}
                    opacity={isDone ? 0.6 : 1}
                    transition="all 0.3s"
                  >
                    <Flex
                      w="28px" h="28px"
                      borderRadius="full"
                      bg={isDone ? 'green.500' : isActive ? 'blue.500' : stageCircleBg}
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      {isDone
                        ? <Icon as={FaCheckCircle} color="white" boxSize={3} />
                        : isActive
                          ? <Spinner size="xs" color="white" />
                          : <Icon as={stage.icon} color={textMuted} boxSize={3} />
                      }
                    </Flex>
                    <Text
                      fontSize="sm"
                      fontWeight={isActive ? 'semibold' : 'normal'}
                      color={isActive ? undefined : textMuted}
                    >
                      {stage.label}
                    </Text>
                    {isActive && (
                      <Badge colorScheme="blue" ml="auto" fontSize="2xs">In Progress</Badge>
                    )}
                    {isDone && (
                      <Badge colorScheme="green" ml="auto" fontSize="2xs">Done</Badge>
                    )}
                  </HStack>
                );
              })}
            </VStack>

            {uploadPct > 0 && uploadPct < 100 && (
              <Box w="100%">
                <Text fontSize="xs" color={textMuted} mb={1}>Uploading… {uploadPct}%</Text>
                <Progress value={uploadPct} colorScheme="blue" size="xs" borderRadius="full" />
              </Box>
            )}

            <Text fontSize="xs" color={textMuted} textAlign="center" maxW="400px">
              Powered by Dastavezai LLM.  Checking compliance, clauses, precedences, and timeline.
            </Text>
          </VStack>
        </MotionBox>
      </AnimatePresence>
    );

    
    if (step === 'results') return (
      <AnimatePresence mode="wait">
        <MotionBox
          key="results"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          w="100%"
        >
          <VStack spacing={4} w="100%">
            <HStack w="100%" justify="space-between" align="center">
              <HStack>
                <Icon as={FaCheckCircle} color="green.400" boxSize={5} />
                <Heading size="md">Scan Complete</Heading>
              </HStack>
              <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                {scanData?.detectedDocType || 'Legal Document'}
              </Badge>
            </HStack>

            <Text fontSize="sm" color={textMuted}>
              Review the AI analysis below, then open your document in the editor.
            </Text>

            {/* Template match banner */}
            {fillSource === 'template' && fillModalFields.length > 0 && (
              <Alert status="success" borderRadius="lg" fontSize="sm" py={2}>
                <AlertIcon boxSize={4} />
                <Box flex={1}>
                  <Text fontWeight="600">Template matched: {fillModalFields.length} fields ready to fill</Text>
                  <Text fontSize="xs" color={textMuted}>
                    Fields from a curated template will be used for accurate fill-in.
                    <Button variant="link" size="xs" ml={1} colorScheme="blue"
                      onClick={() => { setFillSource(''); setShowFieldChoice(true); setStep('fieldChoice'); }}>
                      Use different source
                    </Button>
                  </Text>
                </Box>
              </Alert>
            )}
            {showFieldChoice && fillSource === '' && (
              <Alert status="info" borderRadius="lg" fontSize="sm" py={2}>
                <AlertIcon boxSize={4} />
                <Text>
                  {aiDetectedFields.length} blank fields detected — you'll choose how to fill them next.
                </Text>
              </Alert>
            )}
            {fillSource === 'smart_extracted' && fillModalFields.length > 0 && (
              <Alert status="info" borderRadius="lg" fontSize="sm" py={2}>
                <AlertIcon boxSize={4} />
                <Box flex={1}>
                  <Text fontWeight="600">Complete document — {fillModalFields.length} fields extracted for review</Text>
                  <Text fontSize="xs" color={textMuted}>
                    You can review and edit any pre-filled values before opening the editor.
                  </Text>
                </Box>
              </Alert>
            )}

            <Box w="100%" maxH="480px" overflowY="auto">
              <AnalysisDashboard
                scanData={scanData}
                compact={false}
                sofExpanded={sofExpanded}
                onSofExpandToggle={() => setSofExpanded((p) => !p)}
                sofValue={editedSof}
                onSofChange={setEditedSof}
              />
            </Box>

            <Divider />

            <HStack w="100%" justify="flex-end" spacing={3}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStep('pick'); setSelectedFile(null); }}
              >
                Scan Another File
              </Button>
              <Button
                variant="outline"
                size="sm"
                colorScheme="blue"
                onClick={() => setSofExpanded((p) => !p)}
              >
                {sofExpanded ? 'Hide SOF' : 'See SOF'}
              </Button>
              <Button
                data-tour="open-editor-btn"
                colorScheme="blue"
                size="md"
                rightIcon={<Icon as={FaArrowRight} />}
                onClick={handleOpenEditor}
              >
                Open in Editor
              </Button>
            </HStack>
          </VStack>
        </MotionBox>
      </AnimatePresence>
    );

    
    
    if (step === 'fieldChoice') return (
      <AnimatePresence mode="wait">
        <MotionBox
          key="fieldChoice"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          w="100%"
        >
          {!editingAiFields ? (
            <VStack spacing={5} py={4} w="100%">
              <VStack spacing={1}>
                <Heading size="md">Missing Fields Detected</Heading>
                <Text fontSize="sm" color={textMuted} textAlign="center">
                  Your document has blank fields ("_____") that need to be filled.
                  No matching template was found automatically.
                </Text>
              </VStack>

              <Alert status="warning" borderRadius="lg" fontSize="sm">
                <AlertIcon />
                <AlertDescription>
                  Choose how you'd like to provide the field definitions for this document.
                </AlertDescription>
              </Alert>

              {/* Option 1: Upload JSON */}
              <Box
                w="100%" p={5} border="1px solid" borderColor={borderCol} borderRadius="xl"
                bg={cardBg} cursor="pointer"
                _hover={{ borderColor: 'blue.400', bg: dropHoverBg }}
                onClick={() => jsonInputRef.current?.click()}
                transition="all 0.2s"
              >
                <HStack spacing={4}>
                  <Flex w="44px" h="44px" borderRadius="xl" bg="blue.50" align="center" justify="center" flexShrink={0}>
                    <Icon as={FaUpload} color="blue.500" boxSize={5} />
                  </Flex>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="700" fontSize="sm">Upload Template JSON</Text>
                    <Text fontSize="xs" color={textMuted}>
                      Upload a .json file with precise field definitions for accurate fill-in.
                    </Text>
                  </VStack>
                  <Badge colorScheme="green" ml="auto" fontSize="2xs">Recommended</Badge>
                </HStack>
              </Box>

              {/* Option 2: AI Smart Detection */}
              <Box
                w="100%" p={5} border="1px solid" borderColor={borderCol} borderRadius="xl"
                bg={cardBg} cursor="pointer"
                _hover={{ borderColor: 'purple.400', bg: dropHoverBg }}
                onClick={handleUseAiFields}
                transition="all 0.2s"
              >
                <HStack spacing={4}>
                  <Flex w="44px" h="44px" borderRadius="xl" bg="purple.50" align="center" justify="center" flexShrink={0}>
                    <Icon as={FaRobot} color="purple.500" boxSize={5} />
                  </Flex>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="700" fontSize="sm">Use AI Smart Detection</Text>
                    <Text fontSize="xs" color={textMuted}>
                      AI detected {aiDetectedFields.length} field{aiDetectedFields.length !== 1 ? 's' : ''} — you can review and edit them before filling.
                    </Text>
                  </VStack>
                  <Badge colorScheme="yellow" ml="auto" fontSize="2xs">Review Needed</Badge>
                </HStack>
              </Box>

              {/* Option 3: Skip */}
              <Button variant="ghost" size="sm" onClick={() => { setShowFieldChoice(false); setStep('results'); proceedToEditor(); }}>
                Skip — fill blanks manually in the editor
              </Button>

              <Button variant="link" size="sm" colorScheme="gray" onClick={() => setStep('results')}>
                ← Back to Results
              </Button>

              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleJsonUpload}
              />
            </VStack>
          ) : (
            /* AI Fields Editor */
            <VStack spacing={4} py={4} w="100%">
              <VStack spacing={1}>
                <Heading size="md">Review AI-Detected Fields</Heading>
                <Alert status="warning" borderRadius="lg" fontSize="xs" py={2}>
                  <AlertIcon boxSize={3} />
                  <AlertDescription>
                    These fields were detected by AI and may not be fully accurate. Please review, rename, add, or remove fields as needed.
                  </AlertDescription>
                </Alert>
              </VStack>

              <Box w="100%" maxH="350px" overflowY="auto" pr={1}>
                <VStack spacing={2} w="100%">
                  {aiDetectedFields.map((field, idx) => (
                    <HStack key={idx} w="100%" spacing={2}>
                      <FormControl flex={1} size="sm">
                        <Input
                          size="sm"
                          value={field.label}
                          placeholder="Field Label"
                          onChange={(e) => {
                            const label = e.target.value;
                            const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                            handleAiFieldChange(idx, 'label', label);
                            handleAiFieldChange(idx, 'key', key);
                          }}
                          borderRadius="lg"
                        />
                      </FormControl>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        icon={<FaTrash />}
                        aria-label="Remove field"
                        onClick={() => handleAiFieldRemove(idx)}
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>

              <Button size="sm" variant="outline" leftIcon={<Icon as={FaPlus} />} onClick={handleAiFieldAdd}>
                Add Field
              </Button>

              <HStack w="100%" justify="flex-end" spacing={3}>
                <Button variant="ghost" size="sm" onClick={() => setEditingAiFields(false)}>
                  ← Back to Options
                </Button>
                <Button
                  colorScheme="blue"
                  size="md"
                  rightIcon={<Icon as={FaArrowRight} />}
                  onClick={handleConfirmAiFields}
                  isDisabled={aiDetectedFields.filter(f => f.label.trim()).length === 0}
                >
                  Confirm {aiDetectedFields.filter(f => f.label.trim()).length} Fields & Fill
                </Button>
              </HStack>
            </VStack>
          )}
        </MotionBox>
      </AnimatePresence>
    );

    if (step === 'template') return null;

    return null;
  };

  return (
    <>
      <Modal
        isOpen={isOpen && step !== 'template'}
        onClose={onClose}
        size={step === 'results' ? '4xl' : step === 'fieldChoice' ? '2xl' : 'xl'}
        scrollBehavior="inside"
        isCentered
        closeOnOverlayClick={step === 'pick'}
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={bg} borderRadius="2xl" overflow="hidden">
          <Box
            bgGradient="linear(to-r, blue.600, purple.600)"
            px={5}
            py={3}
          >
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={FaFileAlt} color="white" />
                <Text color="white" fontWeight="bold" fontSize="sm">
                  {step === 'pick'       ? 'New Document'         :
                   step === 'scanning'   ? 'AI Scan in Progress…' :
                   step === 'results'    ? 'Analysis Results'     :
                   step === 'fieldChoice'? 'Choose Field Source'  : 'New Document'}
                </Text>
              </HStack>
              <HStack spacing={1}>
                {['pick', 'scanning', 'results', ...(showFieldChoice ? ['fieldChoice'] : [])].map((s, i) => (
                  <Box
                    key={s}
                    w="8px" h="8px"
                    borderRadius="full"
                    bg={step === s ? 'white' : 'whiteAlpha.400'}
                    transition="background 0.3s"
                  />
                ))}
              </HStack>
              {step === 'pick' && (
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<FaTimes />}
                  aria-label="Close"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={onClose}
                />
              )}
            </HStack>
          </Box>

          <ModalBody px={6} py={4}>
            {renderStep()}
          </ModalBody>
        </ModalContent>
      </Modal>

      <TemplateBrowser
        isOpen={isOpen && step === 'template' && !templateLoading}
        onClose={() => setStep('pick')}
        onSelectTemplate={handleTemplateSelected}
        token={token}
      />

      
      <Modal isOpen={templateLoading} onClose={() => {}} isCentered size="xs">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="xl" p={6} textAlign="center">
          <ModalBody>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.400" thickness="3px" />
              <Text fontWeight="semibold">Loading template…</Text>
              <Text fontSize="sm" color="gray.500">Converting document to editor format</Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <DocumentFieldsModal
        isOpen={showFillModal}
        onClose={handleFillModalClose}
        onSubmit={handleFillModalSubmit}
        templateTitle={fillModalTitle || fileName || 'Document'}
        fields={fillModalFields}
        initialValues={fillModalPrefill}
        language="en"
        isEditMode={false}
        allowPartial={true}
        fieldSource={fillSource}
        summaryBox={editedSof || scanData?.scanResults?.summary || null}
      />
    </>
  );
};

export default UploadWizard;
