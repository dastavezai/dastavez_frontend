import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import {
  Box, Flex, VStack, Center, Spinner, Text, Input, Button, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, useToast, useColorMode, useColorModeValue,
  FormControl, FormLabel, InputGroup, InputRightElement, Show, Heading, Select, Icon, HStack, Tooltip
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FiGlobe, FiEdit, FiFileText, FiZap } from 'react-icons/fi';
import { MdDocumentScanner } from 'react-icons/md';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ChatMessage from './components/ChatMessage';
import ThinkingIndicator from './components/ThinkingIndicator';
import DocumentViewer from './components/DocumentViewer';
import { useAuth } from './AuthBridge';
import { profileAPI } from '../lib/api';
import fileService from './services/fileService';
import draftService from './services/draftService';
import researchService from './services/researchService';
import chronologyService from './services/chronologyService';
import precedenceService from './services/precedenceService';
import counterMakerService from './services/counterMakerService';
import bulkReviewService from './services/bulkReviewService';
import { API_BASE_URL as BASE_URL } from './constants';

import TimelinePanel from '../pages/Panels/TimelinePanel';
import PrecedencePanel from '../pages/Panels/PrecedencePanel';
import CounterMakerPanel from '../pages/Panels/CounterMakerPanel';
import ResearchPanel from '../pages/Panels/ResearchPanel';
import BulkReviewPanel from '../pages/Panels/BulkReviewPanel';

import DocumentFieldsModal from './components/DocumentFieldsModal';
import PostDownloadOptions from './components/PostDownloadOptions';
import TemplateBrowser from './components/TemplateBrowser';
import DocumentTypeSelector from './components/DocumentTypeSelector';
import LegalGuidanceModal from './components/LegalGuidanceModal';
import ComplaintFormModal from './components/ComplaintFormModal';
import TemplateDesignSelector from './components/TemplateDesignSelector';

import IconSidebar from './components/layout/IconSidebar';
import SubSidebarContainer from './components/layout/SubSidebarContainer';
import HeaderBar from './components/layout/HeaderBar';
import WelcomeDashboard from './components/layout/WelcomeDashboard';
import ChatInputBar from './components/layout/ChatInputBar';
import MultiFileModal from './components/layout/MultiFileModal';
import { AdvancedChatProvider } from './context/AdvancedChatContext';

const FullPageEditor = lazy(() => import('./components/FullPageEditor'));

const AdvancedChatApp = () => {
  const cv_red_50_red_900 = useColorModeValue('red.50', 'red.900');
  const cv_orange_50_orange_900 = useColorModeValue('orange.50', 'orange.900');
  const cv_green_50_green_900 = useColorModeValue('green.50', 'green.900');
  const cv_purple_50_purple_900 = useColorModeValue('purple.50', 'purple.900');
  const cv_blue_50_blue_900 = useColorModeValue('blue.50', 'blue.900');
  const cv_white_gray_800 = useColorModeValue('white', 'gray.800');
  const cv_gray_100_rgba_212_175_55_0_08 = useColorModeValue('gray.100', 'rgba(212, 175, 55, 0.08)');
  const cv_gray_600_gray_400 = useColorModeValue('gray.600', 'gray.400');
  const cv_gray_350_white = useColorModeValue('gray.350', 'white');
  const cv_gray_700_white = useColorModeValue('gray.700', 'white');
  const cv_white_gray_900 = useColorModeValue('white', 'gray.900');
  const cv_gray_50_gray_950 = useColorModeValue('gray.50', 'gray.950');
  const cv_gray_400_gray_650 = useColorModeValue('gray.400', 'gray.650');
  const cv_gray_100_gray_800 = useColorModeValue('gray.100', 'gray.800');
  const cv_gray_250_rgba_212_175_55_0_25 = useColorModeValue('gray.250', 'rgba(212, 175, 55, 0.25)');
  const cv_0_8px_30px_rgba_0_0_0_0_02_0_12px_40px_rgba_0_0_0_0_25 = useColorModeValue('0 8px 30px rgba(0, 0, 0, 0.02)', '0 12px 40px rgba(0, 0, 0, 0.25)');
  const cv_rgba_226_232_240_0_8_rgba_212_175_55_0_15 = useColorModeValue('rgba(226, 232, 240, 0.8)', 'rgba(212, 175, 55, 0.15)');
  const cv_rgba_255_255_255_0_85_rgba_10_13_20_0_35 = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(10, 13, 20, 0.35)');
  const cv_gray_200_gray_700 = useColorModeValue('gray.200', 'gray.700');

  const bgMain = useColorModeValue('gray.50', 'judicial.dark');
  const borderColor = cv_gray_200_gray_700;
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.800');

  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { token, logout, user, loading, checkUser } = useAuth();
  const toast = useToast();

  const params = useParams();
  const routeCompanySlug = params.companySlug;
  const routeSlug = params.slug;

  const currentCompanySlug = user?.companySlug || routeCompanySlug || 'default';
  const slug = routeSlug || (routeCompanySlug && (routeCompanySlug.startsWith('c-') || routeCompanySlug.startsWith('session-')) ? routeCompanySlug : null);

  useEffect(() => {
    if (user && !loading) {
      if (!slug) {
        const initialShortSlug = `c-${Math.random().toString(36).substring(2, 7)}`;
        const comp = user.companySlug || routeCompanySlug || 'default';
        navigate(`/${comp}/${initialShortSlug}`, { replace: true });
      }
    }
  }, [slug, user, loading, routeCompanySlug, navigate]);

  useEffect(() => {
    if (slug) {
      axios.defaults.headers.common['x-chat-slug'] = slug;
    } else {
      delete axios.defaults.headers.common['x-chat-slug'];
    }
    return () => {
      delete axios.defaults.headers.common['x-chat-slug'];
    };
  }, [slug]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [remainingMessages, setRemainingMessages] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState(false);

  // Deep Research State
  const [researchSessionId, setResearchSessionId] = useState(() => localStorage.getItem('deepResearchSessionId') || null);
  const [researchStatus, setResearchStatus] = useState('idle');
  const [researchResults, setResearchResults] = useState(null);
  const [researchStartTime, setResearchStartTime] = useState(null);
  const [researchEta, setResearchEta] = useState(90);
  const [researchElapsed, setResearchElapsed] = useState(0);
  const [isReportPanelOpen, setIsReportPanelOpen] = useState(false);
  const [researchAgentStage, setResearchAgentStage] = useState('');
  const researchPollRef = useRef(null);
  const researchTimerRef = useRef(null);

  // File Session State
  const [fileSessionId, setFileSessionId] = useState(null);
  const lastToolSessionFileId = useRef(null);

  // Chronology State
  const [chronologySessionId, setChronologySessionId] = useState(() => localStorage.getItem('chronologySessionId') || null);
  const [chronologyStatus, setChronologyStatus] = useState('idle');
  const [chronologyResults, setChronologyResults] = useState(null);
  const [chronologyElapsed, setChronologyElapsed] = useState(0);
  const [chronologyEta, setChronologyEta] = useState(60);
  const [chronologyAgentStage, setChronologyAgentStage] = useState('');
  const [isTimelinePanelOpen, setIsTimelinePanelOpen] = useState(false);
  const [chronologyFiles, setChronologyFiles] = useState([]);
  const chronologyPollRef = useRef(null);
  const chronologyTimerRef = useRef(null);
  const isMergingChronologyRef = useRef(false);

  // Parallel Review State
  const [reviewFiles, setReviewFiles] = useState([]);
  const [reviewStatus, setReviewStatus] = useState('idle');
  const [bulkReviewSessionId, setBulkReviewSessionId] = useState(() => localStorage.getItem('bulkReviewSessionId') || null);
  const [bulkReviewResults, setBulkReviewResults] = useState(null);
  const [bulkReviewElapsed, setBulkReviewElapsed] = useState(0);
  const [bulkReviewEta, setBulkReviewEta] = useState(60);
  const [isBulkReviewPanelOpen, setIsBulkReviewPanelOpen] = useState(false);
  const bulkReviewPollRef = useRef(null);
  const bulkReviewTimerRef = useRef(null);

  // Uploading indicators
  const [isUploadingReview, setIsUploadingReview] = useState(false);
  const [isUploadingChronology, setIsUploadingChronology] = useState(false);

  // Confirmation modal
  const [isMultiFileModalOpen, setIsMultiFileModalOpen] = useState(false);
  const [multiFilePendingAction, setMultiFilePendingAction] = useState(null);

  // Drafting Tools State
  const [activeDraftingTool, setActiveDraftingTool] = useState(null);
  const [precedenceSessionId, setPrecedenceSessionId] = useState(null);
  const [precedenceStatus, setPrecedenceStatus] = useState('idle');
  const [precedenceResults, setPrecedenceResults] = useState(null);
  const [isPrecedencePanelOpen, setIsPrecedencePanelOpen] = useState(false);
  const precedencePollRef = useRef(null);

  const [counterMakerSessionId, setCounterMakerSessionId] = useState(null);
  const [counterMakerStatus, setCounterMakerStatus] = useState('idle');
  const [counterMakerResults, setCounterMakerResults] = useState(null);
  const [counterMakerFacts, setCounterMakerFacts] = useState('');
  const [isCounterMakerPanelOpen, setIsCounterMakerPanelOpen] = useState(false);
  const [counterMakerFileId, setCounterMakerFileId] = useState(null);
  const counterMakerPollRef = useRef(null);

  // Onboarding Modal
  const [onboardCompanyName, setOnboardCompanyName] = useState('');
  const [onboardSector, setOnboardSector] = useState('');
  const [isOnboardingSubmitLoading, setIsOnboardingSubmitLoading] = useState(false);
  const [onboardError, setOnboardError] = useState('');

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardCompanyName.trim() || !onboardSector.trim()) {
      setOnboardError('Please fill in all fields.');
      return;
    }
    setIsOnboardingSubmitLoading(true);
    setOnboardError('');
    try {
      const response = await profileAPI.setupCompany(onboardCompanyName, onboardSector);
      if (response && response.user) {
        await checkUser();
        navigate(`/c/${response.user.companySlug}`, { replace: true });
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
      setOnboardError(err.message || 'Onboarding failed. Please try again.');
    } finally {
      setIsOnboardingSubmitLoading(false);
    }
  };

  // Clear chat modal state
  const [clearPassword, setClearPassword] = useState('');
  const [showClearPassword, setShowClearPassword] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { isOpen: isClearModalOpen, onOpen: onClearModalOpen, onClose: onClearModalClose } = useDisclosure();

  const [intentOverride, setIntentOverride] = useState(null);
  const [intentLabel, setIntentLabel] = useState(null);

  // Edit document state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSessionActive, setEditSessionActive] = useState(false);
  const [editChangesCount, setEditChangesCount] = useState(0);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [editSession, setEditSession] = useState(null);
  const [isFullEditorOpen, setIsFullEditorOpen] = useState(false);

  // Smart Scanner state
  const [scanStatus, setScanStatus] = useState('none');
  const [scanResults, setScanResults] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [formatMetadata, setFormatMetadata] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');

  // Other modals
  const [documentFieldsOpen, setDocumentFieldsOpen] = useState(false);
  const [documentFields, setDocumentFields] = useState([]);
  const [templateTitle, setTemplateTitle] = useState('');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [lastGeneratedFile, setLastGeneratedFile] = useState(null);
  const [templateBrowserOpen, setTemplateBrowserOpen] = useState(false);
  const [templateContextModalOpen, setTemplateContextModalOpen] = useState(false);
  const [precedenceContextModalOpen, setPrecedenceContextModalOpen] = useState(false);
  const [counterMakerContextModalOpen, setCounterMakerContextModalOpen] = useState(false);
  const [documentTypeModalOpen, setDocumentTypeModalOpen] = useState(false);
  const [guidanceModalOpen, setGuidanceModalOpen] = useState(false);
  const [complaintFormModalOpen, setComplaintFormModalOpen] = useState(false);

  // Right panel resizable width state (50% default = half chat, half panel)
  const [panelWidthPercent, setPanelWidthPercent] = useState(50);
  const [isResizingPanel, setIsResizingPanel] = useState(false);

  const startResizingPanel = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizingPanel(true);

    const onMouseMove = (mouseMoveEvent) => {
      const windowWidth = window.innerWidth;
      const newWidth = ((windowWidth - mouseMoveEvent.clientX) / windowWidth) * 100;
      const clampedWidth = Math.min(Math.max(newWidth, 25), 75);
      setPanelWidthPercent(clampedWidth);
    };

    const onMouseUp = () => {
      setIsResizingPanel(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Language state
  const [language, setLanguage] = useState(() => localStorage.getItem('dastavez_language') || 'en');
  useEffect(() => {
    localStorage.setItem('dastavez_language', language);
  }, [language]);
  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  // Chat Font Size state
  const [chatFontSize, setChatFontSize] = useState(() => {
    const saved = localStorage.getItem('dastavez_chat_font_size');
    return saved ? parseInt(saved, 10) : 14;
  });
  useEffect(() => {
    localStorage.setItem('dastavez_chat_font_size', chatFontSize.toString());
  }, [chatFontSize]);

  // Voice speech state
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Session history list state
  const [sessionsList, setSessionsList] = useState([]);
  const [sessionsListLoading, setSessionsListLoading] = useState(false);

  // Suggested actions & choice buttons state
  const [isPendingUserChoice, setIsPendingUserChoice] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, analyzingFile]);

  // Fetch Session History
  const fetchSessions = async () => {
    try {
      setSessionsListLoading(true);
      const res = await axios.get(`${BASE_URL}/chat/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data?.sessions || (Array.isArray(res.data) ? res.data : []);
      setSessionsList(list);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setSessionsListLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSessions();
    }
  }, [token]);

  // Load chat session history when slug changes
  useEffect(() => {
    if (!token || !slug) return;
    const loadSessionMessages = async () => {
      try {
        setIsInitialLoad(true);
        const res = await axios.get(`${BASE_URL}/chat/session/${slug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          // Restore messages
          const msgs = res.data.messages || [];
          setMessages(msgs.map(m => ({
            role: m.role,
            content: m.content,
            suggestedActions: m.suggestedActions || [],
            isDocumentReady: m.isDocumentReady || false,
            fileId: m.fileId || null,
            fileUrl: m.fileUrl || null,
            fileName: m.fileName || null,
            scannedResult: m.scannedResult || null,
            rightPanelToggle: m.rightPanelToggle || null,
            timestamp: m.createdAt || null
          })));

          // Get user files to restore file object mappings
          const allFiles = await fileService.getUserFiles();

          // Restore Selected File
          if (res.data.activeFileId) {
            const foundFile = allFiles.find(f => f._id === res.data.activeFileId);
            if (foundFile) setSelectedFile(foundFile);
          } else {
            setSelectedFile(null);
          }

          // Restore Deep Research State
          if (res.data.researchSessionId) {
            setResearchSessionId(res.data.researchSessionId);
            localStorage.setItem('deepResearchSessionId', res.data.researchSessionId);
            setResearchStatus('processing');
            pollResearchStatus(res.data.researchSessionId);
          } else {
            setResearchSessionId(null);
            setResearchResults(null);
            setResearchStatus('idle');
            localStorage.removeItem('deepResearchSessionId');
          }

          // Restore Chronology State
          if (res.data.chronologySessionId) {
            setChronologySessionId(res.data.chronologySessionId);
            localStorage.setItem('chronologySessionId', res.data.chronologySessionId);
            setChronologyStatus('processing');
            pollChronologyStatus(res.data.chronologySessionId);
          } else {
            setChronologySessionId(null);
            setChronologyResults(null);
            setChronologyStatus('idle');
            localStorage.removeItem('chronologySessionId');
          }

          // Restore Parallel Review State
          if (res.data.bulkReviewSessionId) {
            setBulkReviewSessionId(res.data.bulkReviewSessionId);
            localStorage.setItem('bulkReviewSessionId', res.data.bulkReviewSessionId);
            setReviewStatus('processing');
            pollBulkReviewResults(res.data.bulkReviewSessionId);
          } else {
            setBulkReviewSessionId(null);
            setBulkReviewResults(null);
            setReviewStatus('idle');
            localStorage.removeItem('bulkReviewSessionId');
          }

          // Restore Uploaded Parallel Review Files list
          if (Array.isArray(res.data.reviewFileIds) && res.data.reviewFileIds.length > 0) {
            const matched = allFiles.filter(f => res.data.reviewFileIds.includes(f._id));
            setReviewFiles(matched.map(f => ({ file: f, editSessionId: f._id })));
          } else {
            setReviewFiles([]);
          }

          // Restore Uploaded Chronology Files list
          if (Array.isArray(res.data.chronologyFileIds) && res.data.chronologyFileIds.length > 0) {
            const matched = allFiles.filter(f => res.data.chronologyFileIds.includes(f._id));
            setChronologyFiles(matched.map(f => ({ file: f, editSessionId: f._id })));
          } else {
            setChronologyFiles([]);
          }
        } else {
          setMessages([]);
          setSelectedFile(null);
          setReviewFiles([]);
          setChronologyFiles([]);
        }
      } catch (err) {
        console.error('Failed to load session messages:', err);
        setMessages([]);
      } finally {
        setIsInitialLoad(false);
      }
    };
    loadSessionMessages();
  }, [slug, token]);

  // Auto-save active chat state to database
  useEffect(() => {
    if (!token || !slug || slug === 'default') return;
    const timer = setTimeout(() => {
      const payload = {
        activeFileId: selectedFile?._id || null,
        researchSessionId: researchSessionId || null,
        chronologySessionId: chronologySessionId || null,
        bulkReviewSessionId: bulkReviewSessionId || null,
        reviewFileIds: (reviewFiles || []).map(f => f.file?._id || f._id || f),
        chronologyFileIds: (chronologyFiles || []).map(f => f.file?._id || f._id || f)
      };
      axios.patch(`${BASE_URL}/chat/session/${slug}/state`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.warn('Auto-save active chat state failed:', err);
      });
    }, 1000); // Debounce to prevent duplicate updates
    return () => clearTimeout(timer);
  }, [slug, token, selectedFile, researchSessionId, chronologySessionId, bulkReviewSessionId, reviewFiles, chronologyFiles]);

  // New Chat Session handler
  const handleStartNewChat = () => {
    const newShortSlug = `c-${Math.random().toString(36).substring(2, 7)}`;
    const targetComp = user?.companySlug || currentCompanySlug || 'default';

    // Notify backend to abandon any active document session and clear pending states
    if (token) {
      axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
        headers: { Authorization: `Bearer ${token}`, 'x-chat-slug': slug || 'default' }
      }).catch(err => {
        console.warn('Exit document mode request failed:', err?.message);
      });
    }

    setMessages([]);
    setSelectedFile(null);
    setReviewFiles([]);
    setChronologyFiles([]);
    setFileSessionId(crypto.randomUUID());
    lastToolSessionFileId.current = null;
    setResearchStatus('idle');
    setResearchResults(null);
    setResearchSessionId(null);
    setIsReportPanelOpen(false);
    setChronologyStatus('idle');
    setChronologyResults(null);
    setChronologySessionId(null);
    setIsTimelinePanelOpen(false);
    setReviewStatus('idle');
    setBulkReviewResults(null);
    setBulkReviewSessionId(null);
    setIsBulkReviewPanelOpen(false);
    setIsPrecedencePanelOpen(false);
    setIsCounterMakerPanelOpen(false);
    localStorage.removeItem('deepResearchSessionId');
    localStorage.removeItem('chronologySessionId');
    localStorage.removeItem('bulkReviewSessionId');

    // Navigate to /<companySlug>/c-9btx3 URL format!
    navigate(`/${targetComp}/${newShortSlug}`);

    toast({
      title: language === 'hi' ? 'नया चैट सत्र शुरू हुआ' : 'New Chat Session Started',
      status: 'info',
      duration: 2500,
      isClosable: true,
    });
  };

  const triggerChronologyAction = () => {
    if (chronologyFiles.length === 0) {
      toast({ title: 'No files uploaded', description: 'Please upload at least one file first.', status: 'warning', duration: 3000 });
      return;
    }
    const hasUserMessages = messages.some(m => !m.isSessionHeader && !m.isSessionDivider);
    if (hasUserMessages) {
      setMultiFilePendingAction('chronology');
      setIsMultiFileModalOpen(true);
    } else {
      handleStartChronology();
    }
  };

  const triggerParallelReviewAction = () => {
    if (reviewFiles.length < 2) {
      toast({ title: 'Upload at least 2 files', description: 'Please upload at least 2 files to compare.', status: 'warning', duration: 3000 });
      return;
    }
    const hasUserMessages = messages.some(m => !m.isSessionHeader && !m.isSessionDivider);
    if (hasUserMessages) {
      setMultiFilePendingAction('review');
      setIsMultiFileModalOpen(true);
    } else {
      handleStartBulkReview();
    }
  };

  const handleConfirmMultiFileChoice = (startNewChat) => {
    setIsMultiFileModalOpen(false);
    if (startNewChat) {
      handleStartNewChat();
    }
    if (multiFilePendingAction === 'chronology') {
      handleStartChronology();
    } else if (multiFilePendingAction === 'review') {
      handleStartBulkReview();
    }
    setMultiFilePendingAction(null);
  };

  // Deep Research functions
  const stopResearchPolling = () => {
    if (researchPollRef.current) clearInterval(researchPollRef.current);
    if (researchTimerRef.current) clearInterval(researchTimerRef.current);
  };

  const pollResearchStatus = (sessionId) => {
    stopResearchPolling();
    const stages = [
      { label: 'Extracting document context...', at: 0 },
      { label: 'Identifying key points & dates...', at: 15 },
      { label: 'Analyzing actionable steps...', at: 45 },
      { label: 'Generating comprehensive summary...', at: 65 },
      { label: 'Finalizing report...', at: 80 },
    ];
    researchTimerRef.current = setInterval(() => {
      setResearchElapsed(prev => {
        const next = prev + 1;
        const currentStage = [...stages].reverse().find(s => next >= s.at);
        if (currentStage) setResearchAgentStage(currentStage.label);
        return next;
      });
    }, 1000);

    researchPollRef.current = setInterval(async () => {
      try {
        const result = await researchService.getResearchResults(sessionId);
        if (['completed', 'completed_with_errors', 'failed'].includes(result.status)) {
          stopResearchPolling();
          setResearchResults(result);
          setResearchStatus(result.status);
          setIsReportPanelOpen(true);
          setResearchAgentStage(result.status === 'failed' ? 'Research failed' : 'Report ready!');

          if (result.status === 'completed' || result.status === 'completed_with_errors') {
            const followUpQuestions = [
              "Can you explain the key points in simpler terms?",
              "What are the most critical dates or deadlines mentioned in this document?",
              "What are the immediate actionable steps I should take based on this?"
            ];
            setMessages(prev => [
              ...prev,
              {
                role: 'assistant',
                content: `I have completed the deep research on your document! You can view the full report in the right panel.\n\nHere are some follow-up questions you can ask me:\n1. ${followUpQuestions[0]}\n2. ${followUpQuestions[1]}\n3. ${followUpQuestions[2]}`,
                rightPanelToggle: {
                  label: 'Open Deep Research Report',
                  tab: 'research',
                  panelKey: 'isReportPanelOpen'
                }
              }
            ]);
          }

          if (result.status !== 'failed') {
            toast({
              title: 'Deep Research Complete',
              description: 'Your research report is ready. Check the right panel.',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } catch (err) {
        console.error('Research poll error:', err);
      }
    }, 5000);
  };

  const handleStartDeepResearch = async (autoFile = null) => {
    const targetFile = autoFile && autoFile._id ? autoFile : selectedFile;
    if (!targetFile?._id) {
      toast({
        title: 'No file selected',
        description: 'Please upload a file first.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    handleStartNewChat();
    setSelectedFile(targetFile);

    const fileName = targetFile.fileName || targetFile.originalName || targetFile.name || 'Uploaded file';
    setMessages([
      {
        role: 'assistant',
        content: `🔬 **Deep Research Started**\n\n**File:** ${fileName}\n\nAnalyzing document context, key points, dates, and action items...`,
        isSessionHeader: true,
      }
    ]);

    try {
      setResearchStatus('starting');
      setResearchResults(null);
      setResearchElapsed(0);
      setResearchAgentStage('Preparing document...');
      setIsReportPanelOpen(true);

      const editResult = await fileService.startEditSession(targetFile._id);
      const editSessionId = editResult.sessionId || editResult._id || editResult.editSession?._id;
      if (!editSessionId) throw new Error('Failed to create edit session.');

      const researchResult = await researchService.startResearch([editSessionId]);
      const newSessionId = researchResult.sessionId;

      setResearchSessionId(newSessionId);
      localStorage.setItem('deepResearchSessionId', newSessionId);
      setResearchStatus('processing');
      setResearchStartTime(Date.now());
      pollResearchStatus(newSessionId);
    } catch (err) {
      console.error('Deep research error:', err);
      setResearchStatus('failed');
      setResearchAgentStage('Failed to start research');
      toast({
        title: 'Research Failed',
        description: err?.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Chronology Functions
  const stopChronologyPolling = () => {
    if (chronologyPollRef.current) clearInterval(chronologyPollRef.current);
    if (chronologyTimerRef.current) clearInterval(chronologyTimerRef.current);
  };

  const pollChronologyStatus = (sessionId) => {
    stopChronologyPolling();
    const stages = [
      { label: 'Extracting events from files...', at: 0 },
      { label: 'Building unified timeline...', at: 25 },
      { label: 'Sorting & deduplicating events...', at: 40 },
      { label: 'Generating timeline summary...', at: 50 },
    ];
    chronologyTimerRef.current = setInterval(() => {
      setChronologyElapsed(prev => {
        const next = prev + 1;
        const currentStage = [...stages].reverse().find(s => next >= s.at);
        if (currentStage) setChronologyAgentStage(currentStage.label);
        return next;
      });
    }, 1000);

    chronologyPollRef.current = setInterval(async () => {
      try {
        const result = await chronologyService.getChronologyResults(sessionId);
        if (['completed', 'completed_with_errors', 'failed'].includes(result.status)) {
          stopChronologyPolling();
          setChronologyResults(result);
          setChronologyStatus(result.status);
          setIsTimelinePanelOpen(true);
          setChronologyAgentStage(result.status === 'failed' ? 'Analysis failed' : 'Timeline ready!');

          if (result.status === 'completed' || result.status === 'completed_with_errors') {
            const fileNames = result.files?.map(f => `**${f.fileName}**`).join(', ') || 'uploaded files';
            const eventCount = result.events?.length || 0;
            const ismerge = isMergingChronologyRef.current;
            const summaryText = result.summary
              ? `\n\n---\n${result.summary}\n\n---\n*Full interactive timeline with ${eventCount} events is ready in the Timeline panel →*`
              : `\n\n*${eventCount} events extracted. Open the Timeline panel to explore.*`;
            const introLine = ismerge
              ? `✅ Chronology updated! I've merged the new file(s) with your existing timeline.\n\nNow covering: ${fileNames}\n\n**Combined Summary:**${summaryText}`
              : `📅 Chronology complete! I've built a timeline from ${fileNames}.\n\n**Timeline Summary:**${summaryText}`;

            isMergingChronologyRef.current = false;
            setMessages(prev => [
              ...prev,
              { 
                role: 'assistant', 
                content: introLine, 
                isChronologySummary: true,
                rightPanelToggle: {
                  label: 'Open Timeline Chronology Parser',
                  tab: 'chronology',
                  panelKey: 'isTimelinePanelOpen'
                }
              }
            ]);
          }

          if (result.status !== 'failed') {
            toast({
              title: 'Chronology Complete',
              description: `Timeline built with ${result.events?.length || 0} events.`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } catch (err) {
        console.error('Chronology poll error:', err);
      }
    }, 5000);
  };

  const handleStartChronology = async () => {
    if (chronologyFiles.length === 0) {
      toast({ title: 'No files', description: 'Upload at least one file.', status: 'warning', duration: 3000 });
      return;
    }

    try {
      isMergingChronologyRef.current = false;
      setChronologyStatus('starting');
      setChronologyResults(null);
      setChronologyElapsed(0);
      setChronologyAgentStage('Preparing files...');
      setIsTimelinePanelOpen(true);
      setChronologyEta(40 + chronologyFiles.length * 20);

      const fileLabel = chronologyFiles.length === 1
        ? chronologyFiles[0].file?.name || 'file'
        : `${chronologyFiles.length} files`;
      setMessages(prev => [...prev, { role: 'user', content: `Build a chronology timeline from: ${fileLabel}` }]);

      const editSessionIds = chronologyFiles.map(f => f.editSessionId);
      const result = await chronologyService.startChronology(editSessionIds);
      const newSessionId = result.sessionId;

      setChronologySessionId(newSessionId);
      localStorage.setItem('chronologySessionId', newSessionId);
      setChronologyStatus('processing');
      pollChronologyStatus(newSessionId);
    } catch (err) {
      console.error('Chronology error:', err);
      setChronologyStatus('failed');
      toast({
        title: 'Chronology Failed',
        description: err?.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleResetChronology = async () => {
    try {
      await fetchSessions();
    } catch (err) {
      console.error('Failed to refresh sessions:', err);
    }
    setChronologyStatus('idle');
    setChronologyResults(null);
    setChronologySessionId(null);
    setChronologyFiles([]);
    setIsTimelinePanelOpen(false);
    localStorage.removeItem('chronologySessionId');
  };

  // Parallel Review Functions
  const pollBulkReviewResults = async (sessionId) => {
    if (bulkReviewPollRef.current) clearInterval(bulkReviewPollRef.current);
    bulkReviewPollRef.current = setInterval(async () => {
      try {
        const results = await bulkReviewService.getResults(sessionId);
        if (results) {
          setBulkReviewResults(results);
          if (results.status === 'completed' || results.status === 'completed_with_errors' || results.status === 'failed') {
            clearInterval(bulkReviewPollRef.current);
            clearInterval(bulkReviewTimerRef.current);
            setReviewStatus(results.status);
            if (results.status !== 'failed') {
              setIsBulkReviewPanelOpen(true);
              setMessages(prev => [
                ...prev,
                {
                  role: 'assistant',
                  content: `I have completed the Parallel Document Review of your ${reviewFiles.length} files. You can see compared clauses, summaries, and conflicts in the right panel.`,
                  rightPanelToggle: {
                    label: 'Open Parallel Review Results',
                    tab: 'review',
                    panelKey: 'isBulkReviewPanelOpen'
                  }
                }
              ]);
            }
          }
        }
      } catch (err) {
        console.error('Error polling bulk review:', err);
      }
    }, 3000);
  };

  const handleStartBulkReview = async () => {
    if (reviewFiles.length < 2) {
      toast({ title: 'Upload at least 2 files to compare', status: 'warning', duration: 3000 });
      return;
    }

    setReviewStatus('starting');
    setBulkReviewElapsed(0);
    setBulkReviewEta(40 + reviewFiles.length * 30);
    setBulkReviewResults(null);
    setIsBulkReviewPanelOpen(true);

    if (bulkReviewTimerRef.current) clearInterval(bulkReviewTimerRef.current);
    bulkReviewTimerRef.current = setInterval(() => {
      setBulkReviewElapsed(prev => prev + 1);
    }, 1000);

    try {
      const editSessionIds = reviewFiles.map(f => f.editSessionId);
      const res = await bulkReviewService.startBulkReview(editSessionIds);
      const newSessionId = res.sessionId;
      setBulkReviewSessionId(newSessionId);
      localStorage.setItem('bulkReviewSessionId', newSessionId);
      setReviewStatus('processing');
      pollBulkReviewResults(newSessionId);
    } catch (err) {
      console.error('Start bulk review error:', err);
      clearInterval(bulkReviewTimerRef.current);
      setReviewStatus('failed');
      toast({ title: 'Failed to start analysis', status: 'error', duration: 3000 });
    }
  };

  // Multi-file upload handlers
  const handleReviewFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const allowedTypes = [
      'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    ];
    const allowedExtensions = ['.pdf', '.txt', '.md', '.csv', '.json', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return allowedTypes.includes(file.type) || allowedExtensions.includes(ext);
    });

    if (validFiles.length === 0) {
      toast({ title: 'No valid files', description: 'Supported: PDF, Word, Text, Images', status: 'error', duration: 3000 });
      e.target.value = '';
      return;
    }
    if (reviewFiles.length + validFiles.length > 10) {
      toast({ title: 'Too many files', description: 'Maximum 10 files allowed for Parallel Review.', status: 'warning', duration: 3000 });
      e.target.value = '';
      return;
    }
    toast({ title: `Uploading ${validFiles.length} file(s)...`, status: 'info', duration: 2000 });

    try {
      setIsUploadingReview(true);
      const uploaded = [];
      for (const file of validFiles) {
        try {
          const response = await fileService.uploadFile(file);
          const editResult = await fileService.startEditSession(response.file._id);
          const editSessionId = editResult.sessionId || editResult._id || editResult.editSession?._id;
          uploaded.push({ file: response.file, editSessionId });
        } catch (err) {
          console.error(`Failed to upload "${file.name}":`, err);
        }
      }
      if (uploaded.length > 0) {
        setReviewFiles(prev => [...prev, ...uploaded]);
        toast({ title: `${uploaded.length} file(s) ready for Parallel Review`, status: 'success', duration: 2500 });
      }
    } finally {
      setIsUploadingReview(false);
      e.target.value = '';
    }
  };

  const handleChronologyFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const allowedTypes = [
      'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    ];
    const allowedExtensions = ['.pdf', '.txt', '.md', '.csv', '.json', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return allowedTypes.includes(file.type) || allowedExtensions.includes(ext);
    });

    if (validFiles.length === 0) {
      toast({ title: 'No valid files', description: 'Supported: PDF, Word, Text, Images', status: 'error', duration: 3000 });
      e.target.value = '';
      return;
    }
    if (chronologyFiles.length + validFiles.length > 10) {
      toast({ title: 'Too many files', description: 'Maximum 10 files total allowed.', status: 'warning', duration: 3000 });
      e.target.value = '';
      return;
    }
    toast({ title: `Uploading ${validFiles.length} file(s)...`, status: 'info', duration: 2000 });

    try {
      setIsUploadingChronology(true);
      const uploaded = [];
      for (const file of validFiles) {
        try {
          const response = await fileService.uploadFile(file);
          const editResult = await fileService.startEditSession(response.file._id);
          const editSessionId = editResult.sessionId || editResult._id || editResult.editSession?._id;
          uploaded.push({ file: response.file, editSessionId });
        } catch (err) {
          console.error(`Failed to upload "${file.name}":`, err);
        }
      }
      if (uploaded.length > 0) {
        const newFiles = [...chronologyFiles, ...uploaded];
        setChronologyFiles(newFiles);
        if (['completed', 'completed_with_errors'].includes(chronologyStatus)) {
          toast({ title: `Merging ${uploaded.length} new file(s) into timeline...`, status: 'info', duration: 3000 });
          isMergingChronologyRef.current = true;
          setTimeout(async () => {
            try {
              setChronologyStatus('starting');
              setChronologyAgentStage('Merging new files into timeline...');
              setChronologyElapsed(0);
              setChronologyEta(40 + newFiles.length * 20);
              const editSessionIds = newFiles.map(f => f.editSessionId);
              const result = await chronologyService.startChronology(editSessionIds);
              const newSessionId = result.sessionId;
              setChronologySessionId(newSessionId);
              localStorage.setItem('chronologySessionId', newSessionId);
              setChronologyStatus('processing');
              pollChronologyStatus(newSessionId);
            } catch (err) {
              console.error('Chronology merge error:', err);
              setChronologyStatus('idle');
              isMergingChronologyRef.current = false;
            }
          }, 300);
        }
      }
    } finally {
      setIsUploadingChronology(false);
      e.target.value = '';
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      const response = await fileService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      setSelectedFile(response.file);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);

      setFileSessionId(crypto.randomUUID());

      if (activeTab === 'research') {
        handleStartDeepResearch(response.file);
      }

      if (response.remainingMessages !== null) {
        setRemainingMessages(response.remainingMessages);
      }
      setSubscriptionStatus(response.subscriptionStatus);

      setScanStatus('none');
      setScanResults(null);
      setFormatMetadata(null);
      setSmartSuggestions([]);
      setHtmlContent('');

      toast({
        title: language === 'hi' ? 'फ़ाइल अपलोड हो गई' : 'File uploaded',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('File upload error:', err);
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload file',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  // Chat message sending logic
  const handleSendMessage = async (textToSend = null, customPayload = null) => {
    const text = textToSend || input;
    if (!text.trim() && !selectedFile) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const payload = {
        message: text,
        language: language || 'en',
        ...customPayload
      };
      if (selectedFile?._id) payload.fileId = selectedFile._id;
      if (intentOverride) payload.intentOverride = intentOverride;

      const response = await axios.post(`${BASE_URL}/chat/message`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.data) {
        const assistantMsg = {
          role: 'assistant',
          content: response.data.response,
          suggestedActions: response.data.suggestedActions || [],
          rightPanelToggle: response.data.rightPanelToggle || null,
          file: response.data.file || null
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        fetchSessions();

        if (response.data.file) {
          setSelectedFile(response.data.file);
          
          try {
            const fileId = response.data.file.fileId || response.data.file._id || response.data.file.id;
            if (fileId) {
              const editResult = await fileService.startEditSession(fileId);
              setEditSession(editResult.editSession || editResult);
              setDocumentAnalysis(editResult.analysis || null);
              setIsEditMode(true);
              setEditSessionActive(true);
            }
          } catch (e) {
            console.warn('Failed to start edit session for generated document:', e);
          }
        }
      }
    } catch (error) {
      console.error('Message error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      const response = await fileService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      setSelectedFile(response.file);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);

      toast({
        title: language === 'hi' ? 'फ़ाइल अपलोड हो गई' : 'File uploaded & quick scanned',
        status: 'info',
        duration: 2500,
        isClosable: true,
      });

      await handleSendMessage(
        `Uploaded file: ${response.file.originalName || response.file.fileName}`,
        { fileId: response.file._id || response.file.id, intentOverride: 'QUICK_SCAN_FILE' }
      );
    } catch (err) {
      console.error('Chat file upload error:', err);
      toast({
        title: language === 'hi' ? 'अपलोड विफल' : 'Upload failed',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleBrowseTemplatesClick = () => {
    setTemplateContextModalOpen(true);
  };

  const handlePrecedenceAnalysisClick = () => {
    setPrecedenceContextModalOpen(true);
  };

  const handleCounterMakerClick = () => {
    setCounterMakerContextModalOpen(true);
  };

  const toggleListening = () => {
    setIsListening(prev => !prev);
  };

  const handleSuggestedActionClick = (action) => {
    if (action.action === 'START_PRECEDENCE' || action.type === 'PRECEDENCE_ANALYSIS') {
      handlePrecedenceAnalysisClick();
      return;
    }
    if (action.action === 'COUNTER_AFFIDAVIT' || action.action === 'START_COUNTER') {
      handleCounterMakerClick();
      return;
    }
    if (action.action === 'START_DEEP_RESEARCH') {
      setActiveTab('research');
      setIsReportPanelOpen(true);
      if (selectedFile) handleStartDeepResearch(selectedFile);
      return;
    }
    if (action.action === 'START_CHRONOLOGY') {
      setActiveTab('chronology');
      setIsTimelinePanelOpen(true);
      if (selectedFile) handleStartChronology(selectedFile);
      return;
    }
    if (action.action === 'ASK_FILE_QUESTIONS') {
      const fileName = selectedFile?.originalName || selectedFile?.fileName || 'uploaded document';
      setInput(`What are the key legal points and obligations in ${fileName}?`);
      return;
    }
    if (action.type === 'toggle_right_panel') {
      if (action.panelKey === 'isPrecedencePanelOpen') {
        handlePrecedenceAnalysisClick();
        return;
      }
      if (action.panelKey === 'isCounterMakerPanelOpen') {
        handleCounterMakerClick();
        return;
      }
      setActiveTab(action.tab);
      setIsTimelinePanelOpen(action.panelKey === 'isTimelinePanelOpen');
      setIsPrecedencePanelOpen(action.panelKey === 'isPrecedencePanelOpen');
      setIsCounterMakerPanelOpen(action.panelKey === 'isCounterMakerPanelOpen');
      setIsReportPanelOpen(action.panelKey === 'isReportPanelOpen');
      setIsBulkReviewPanelOpen(action.panelKey === 'isBulkReviewPanelOpen');
      return;
    }
    handleSendMessage(action.text || action.label);
  };

  const handleClearChat = () => {
    setMessages([]);
    setSelectedFile(null);
    toast({ title: 'Chat cleared', status: 'info', duration: 2000 });
  };

  const handleSmartScan = () => {
    if (!selectedFile) return;
    setScanStatus('scanned');
    toast({ title: 'Smart Scan Complete', status: 'success', duration: 2500 });
  };

  const handleOpenEditor = () => {
    setIsFullEditorOpen(true);
  };

  const handleExitEditMode = () => {
    setIsEditMode(false);
    setEditSessionActive(false);
  };

  const isRightPanelOpen = 
    (activeTab === 'chronology' && isTimelinePanelOpen) ||
    (activeTab === 'drafting' && isPrecedencePanelOpen) ||
    (activeTab === 'drafting' && isCounterMakerPanelOpen) ||
    (activeTab === 'research' && isReportPanelOpen) ||
    (activeTab === 'review' && isBulkReviewPanelOpen) ||
    isEditMode;

  const toggleRightPanel = (forceState = null) => {
    const nextState = forceState !== null ? forceState : !isRightPanelOpen;
    if (!nextState) {
      setIsPrecedencePanelOpen(false);
      setIsCounterMakerPanelOpen(false);
      setIsTimelinePanelOpen(false);
      setIsReportPanelOpen(false);
      setIsBulkReviewPanelOpen(false);
      setIsEditMode(false);
    } else {
      if (activeTab === 'drafting') {
        setIsPrecedencePanelOpen(true);
        setIsCounterMakerPanelOpen(true);
      } else if (activeTab === 'chronology') {
        setIsTimelinePanelOpen(true);
      } else if (activeTab === 'research') {
        setIsReportPanelOpen(true);
      } else if (activeTab === 'review') {
        setIsBulkReviewPanelOpen(true);
      } else {
        setActiveTab('drafting');
        setIsPrecedencePanelOpen(true);
      }
    }
  };

  const contextValue = {
    activeTab, setActiveTab,
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    isInitialLoad, setIsInitialLoad,
    remainingMessages, setRemainingMessages,
    subscriptionStatus, setSubscriptionStatus,
    language, setLanguage, toggleLanguage,
    isUploading, setIsUploading,
    uploadProgress, setUploadProgress,
    selectedFile, setSelectedFile,
    uploading, setUploading,
    analyzingFile, setAnalyzingFile,
    sessionsList, setSessionsList,
    sessionsListLoading, setSessionsListLoading,
    intentOverride, setIntentOverride,
    intentLabel, setIntentLabel,
    user, token, logout, toast, navigate, slug,
    borderColor, textColor, inputBg, colorMode, toggleColorMode,
    
    isUploadingReview, setIsUploadingReview,
    isUploadingChronology, setIsUploadingChronology,
    isMultiFileModalOpen, setIsMultiFileModalOpen,
    multiFilePendingAction, setMultiFilePendingAction,
    handleStartNewChat,
    triggerChronologyAction,
    triggerParallelReviewAction,
    handleConfirmMultiFileChoice,
    
    researchStatus, setResearchStatus,
    researchResults, setResearchResults,
    researchSessionId, setResearchSessionId,
    researchElapsed, setResearchElapsed,
    researchEta, setResearchEta,
    researchAgentStage, setResearchAgentStage,
    isReportPanelOpen, setIsReportPanelOpen,
    handleStartDeepResearch,
    
    chronologyStatus, setChronologyStatus,
    chronologyResults, setChronologyResults,
    chronologySessionId, setChronologySessionId,
    chronologyElapsed, setChronologyElapsed,
    chronologyEta, setChronologyEta,
    chronologyAgentStage, setChronologyAgentStage,
    isTimelinePanelOpen, setIsTimelinePanelOpen,
    chronologyFiles, setChronologyFiles,
    handleStartChronology,
    handleResetChronology,
    handleChronologyFilesUpload,
    
    reviewFiles, setReviewFiles,
    reviewStatus, setReviewStatus,
    bulkReviewSessionId, setBulkReviewSessionId,
    bulkReviewResults, setBulkReviewResults,
    bulkReviewElapsed, setBulkReviewElapsed,
    bulkReviewEta, setBulkReviewEta,
    isBulkReviewPanelOpen, setIsBulkReviewPanelOpen,
    handleStartBulkReview,
    handleReviewFilesUpload,
    
    precedenceSessionId, setPrecedenceSessionId,
    precedenceStatus, setPrecedenceStatus,
    precedenceResults, setPrecedenceResults,
    isPrecedencePanelOpen, setIsPrecedencePanelOpen,
    
    counterMakerSessionId, setCounterMakerSessionId,
    counterMakerStatus, setCounterMakerStatus,
    counterMakerResults, setCounterMakerResults,
    counterMakerFacts, setCounterMakerFacts,
    isCounterMakerPanelOpen, setIsCounterMakerPanelOpen,
    counterMakerFileId, setCounterMakerFileId,

    isEditMode, setIsEditMode,
    editSession, setEditSession,
    documentAnalysis, setDocumentAnalysis,
    handleChatFileUpload,
    handleBrowseTemplatesClick,
    handlePrecedenceAnalysisClick,
    handleCounterMakerClick,
    handleSuggestedActionClick,
    handleClearChat,
    handleSmartScan,
    handleOpenEditor,
    handleExitEditMode,
    toggleListening,
    speechSupported,
    handleSendMessage,
    handleKeyPress,
    chatFontSize, setChatFontSize,
    scanStatus, scanResults, smartSuggestions, formatMetadata,
    onboardCompanyName, setOnboardCompanyName,
    onboardSector, setOnboardSector,
    handleOnboardSubmit, isOnboardingSubmitLoading,
    isRightPanelOpen, toggleRightPanel
  };

  return (
    <AdvancedChatProvider value={contextValue}>
      <Flex h="100vh" w="100vw" overflow="hidden" bg={bgMain}>
        {/* 1. Left-most Icon Sidebar */}
        <IconSidebar />

        {/* 2. Sub-sidebar */}
        <SubSidebarContainer />

        {/* 3. Main Working Window */}
        <Flex flex="1" direction="column" overflow="hidden" position="relative" bg={bgMain}>
          <HeaderBar />

          {/* Hidden inputs for uploaders */}
          <Input
            type="file"
            accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileUpload}
            display="none"
            id="file-upload"
          />
          <Input
            type="file"
            multiple
            onChange={handleReviewFilesUpload}
            display="none"
            id="review-file-upload"
          />
          <Input
            type="file"
            multiple
            onChange={handleChronologyFilesUpload}
            display="none"
            id="chronology-file-upload"
          />

          <Flex flex="1" overflow="hidden" position="relative">
            <Flex flex="1" h="full" direction="column" overflow="hidden" px={4} pt={4} pb={2}>
              {/* Messages scroll area */}
              <Box
                flex="1"
                w="full"
                overflowY="auto"
                borderRadius="2xl"
                p={6}
                bg={cv_rgba_255_255_255_0_85_rgba_10_13_20_0_35}
                borderWidth="1px"
                borderColor={cv_rgba_226_232_240_0_8_rgba_212_175_55_0_15}
                backdropFilter="blur(32px)"
                boxShadow={cv_0_8px_30px_rgba_0_0_0_0_02_0_12px_40px_rgba_0_0_0_0_25}
                position="relative"
                css={{
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none'
                }}
              >
                {isInitialLoad ? (
                  <Center h="full">
                    <Spinner size="lg" color="blue.500" />
                  </Center>
                ) : (
                  <Flex direction="column" gap={4} w="full" align="stretch">
                    {messages.filter(m => m.role === 'user').length === 0 && <WelcomeDashboard />}
                    
                    {messages.map((msg, index) => (
                      <ChatMessage
                        key={index}
                        message={msg}
                        role={msg.role}
                        onSuggestedActionClick={handleSuggestedActionClick}
                        language={language}
                        fontSize={chatFontSize}
                      />
                    ))}
                    {isLoading && (
                      <ThinkingIndicator 
                        userMessage={[...messages].reverse().find(m => m.role === 'user')?.content || ''}
                        hasActiveFile={Boolean(selectedFile)}
                      />
                    )}
                  </Flex>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Chat Input Prompt controls */}
              <ChatInputBar />
            </Flex>

            {/* 4. Resizable Right Split Panel */}
            {isRightPanelOpen && (
              <Flex
                w={`${panelWidthPercent}%`}
                minW="320px"
                maxW="80%"
                h="100%"
                minH={0}
                position="relative"
                borderLeft="1px solid"
                borderColor={borderColor}
                bg={cv_white_gray_900}
                overflow="hidden"
                direction="column"
                zIndex={5}
                userSelect={isResizingPanel ? 'none' : 'auto'}
              >
                {/* Drag Resize Border Handle */}
                <Box
                  position="absolute"
                  left="0"
                  top="0"
                  bottom="0"
                  w="5px"
                  cursor="col-resize"
                  zIndex={20}
                  bg={isResizingPanel ? "teal.400" : "transparent"}
                  _hover={{ bg: "teal.400" }}
                  onMouseDown={startResizingPanel}
                  transition="background 0.2s"
                />

                {activeTab === 'chronology' && isTimelinePanelOpen && <TimelinePanel />}
                {activeTab === 'drafting' && isPrecedencePanelOpen && <PrecedencePanel />}
                {activeTab === 'drafting' && isCounterMakerPanelOpen && <CounterMakerPanel />}
                {activeTab === 'research' && isReportPanelOpen && <ResearchPanel />}
                {activeTab === 'review' && isBulkReviewPanelOpen && <BulkReviewPanel />}
                {isEditMode && (
                  <DocumentViewer 
                    session={editSession} 
                    analysis={documentAnalysis}
                    onExpandClick={handleOpenEditor}
                  />
                )}
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>

      {/* Multi-File Confirmation Modal */}
      <MultiFileModal />

      {/* Onboarding Spatial Card Modal */}
      <Modal isOpen={Boolean(user && !user.companySlug)} closeOnOverlayClick={false} closeOnEsc={false} isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent bg={cv_white_gray_900} borderColor={borderColor} borderWidth={1} p={6} m={4} borderRadius="2xl">
          <ModalHeader>
            <VStack spacing={2} align="center">
              <Icon as={FiGlobe} w={12} h={12} color="judicial.gold" />
              <Heading size="md" textAlign="center" color={textColor}>Setup Your Workspace</Heading>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Configure your permanent dashboard page URL.
              </Text>
            </VStack>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleOnboardSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Company Name</FormLabel>
                  <Input
                    placeholder="e.g. Acme Corp"
                    value={onboardCompanyName}
                    onChange={(e) => setOnboardCompanyName(e.target.value)}
                    borderColor={borderColor}
                    _focus={{ borderColor: 'judicial.gold' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Sector / Industry</FormLabel>
                  <Select
                    placeholder="Select Sector"
                    value={onboardSector}
                    onChange={(e) => setOnboardSector(e.target.value)}
                    borderColor={borderColor}
                    _focus={{ borderColor: 'judicial.gold' }}
                    color={textColor}
                  >
                    <option value="legal">Legal & Compliance</option>
                    <option value="finance">Finance & Banking</option>
                    <option value="tech">Technology & IT</option>
                    <option value="healthcare">Healthcare & Pharma</option>
                    <option value="realestate">Real Estate & Construction</option>
                    <option value="retail">Retail & E-commerce</option>
                    <option value="other">Other / General</option>
                  </Select>
                </FormControl>
                {onboardError && (
                  <Text color="red.500" fontSize="sm" alignSelf="start">
                    {onboardError}
                  </Text>
                )}
                <Button
                  type="submit"
                  bg="judicial.gold"
                  color="judicial.dark"
                  _hover={{ bg: 'judicial.lightGold' }}
                  w="full"
                  isLoading={isOnboardingSubmitLoading}
                  mt={2}
                  borderRadius="xl"
                  fontWeight="bold"
                >
                  Create Permanent Dashboard
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Full Page Editor Modal */}
      <Suspense fallback={
        <Modal isOpen={isFullEditorOpen} onClose={() => setIsFullEditorOpen(false)} size="full">
          <ModalOverlay />
          <ModalContent>
            <ModalBody display="flex" alignItems="center" justifyContent="center" h="100vh">
              <Spinner size="xl" />
            </ModalBody>
          </ModalContent>
        </Modal>
      }>
        <FullPageEditor
          isOpen={isFullEditorOpen}
          onClose={() => setIsFullEditorOpen(false)}
          session={editSession}
          onSessionUpdate={() => {}}
          selectedFile={selectedFile}
          scanStatus={scanStatus}
          formatMetadata={formatMetadata}
          scanResults={scanResults}
          smartSuggestions={smartSuggestions}
          htmlContent={htmlContent}
          language={language}
        />
      </Suspense>

      {/* Template Browser Modal */}
      <TemplateBrowser
        isOpen={templateBrowserOpen}
        onClose={() => setTemplateBrowserOpen(false)}
        onSelectTemplate={(tpl) => {
          setTemplateBrowserOpen(false);
          handleSendMessage(
            `Selected template: ${tpl.displayTitle || tpl.name || tpl.title || 'template'}`,
            { templatePath: tpl.relPath }
          );
        }}
        language={language}
        token={token}
      />
      {/* Choose Drafting Context Selection Modal */}
      <Modal isOpen={templateContextModalOpen} onClose={() => setTemplateContextModalOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent bg={cv_white_gray_900} borderColor={borderColor} borderWidth={1} borderRadius="2xl" p={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FiFileText} color="judicial.gold" boxSize={6} />
              <Text fontSize="lg" fontWeight="bold">Choose Drafting Context</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Do you want to start a new chat session for this draft, or use the context of your existing chat?
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="outline"
              borderColor="judicial.gold"
              color={textColor}
              _hover={{ bg: cv_gray_100_rgba_212_175_55_0_08 }}
              onClick={() => {
                setTemplateContextModalOpen(false);
                setTemplateBrowserOpen(true);
              }}
              borderRadius="xl"
              fontSize="sm"
            >
              Use Existing Chat
            </Button>
            <Button
              bg="judicial.gold"
              color="judicial.dark"
              _hover={{ bg: 'judicial.lightGold' }}
              onClick={() => {
                setTemplateContextModalOpen(false);
                handleStartNewChat();
                setTimeout(() => {
                  setTemplateBrowserOpen(true);
                }, 100);
              }}
              borderRadius="xl"
              fontSize="sm"
            >
              Start New Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Choose Precedence Analysis Context Selection Modal */}
      <Modal isOpen={precedenceContextModalOpen} onClose={() => setPrecedenceContextModalOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent bg={cv_white_gray_900} borderColor={borderColor} borderWidth={1} borderRadius="2xl" p={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FiZap} color="teal.400" boxSize={6} />
              <Text fontSize="lg" fontWeight="bold">Precedence Analysis Options</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Do you want to run Precedence Analysis on your current chat context & file, or start a new chat session to upload a new document?
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="outline"
              borderColor="teal.400"
              color={textColor}
              _hover={{ bg: cv_gray_100_rgba_212_175_55_0_08 }}
              onClick={() => {
                setPrecedenceContextModalOpen(false);
                setActiveTab('drafting');
                setIsPrecedencePanelOpen(true);
                if (selectedFile && precedenceStatus === 'idle') {
                  handleSendMessage("Run Precedence Analysis on this document");
                }
              }}
              borderRadius="xl"
              fontSize="sm"
            >
              Use Current Chat & File
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                setPrecedenceContextModalOpen(false);
                handleStartNewChat();
                setActiveTab('drafting');
                setIsPrecedencePanelOpen(true);
                setTimeout(() => {
                  document.getElementById('file-upload')?.click();
                }, 200);
              }}
              borderRadius="xl"
              fontSize="sm"
            >
              Upload New File / New Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Choose Counter Maker Context Selection Modal */}
      <Modal isOpen={counterMakerContextModalOpen} onClose={() => setCounterMakerContextModalOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent bg={cv_white_gray_900} borderColor={borderColor} borderWidth={1} borderRadius="2xl" p={4}>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FiEdit} color="orange.500" boxSize={6} />
              <Text fontSize="lg" fontWeight="bold">Counter Affidavit Options</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Do you want to generate a Counter Affidavit for your current chat context & file, or start a new chat session to upload a new petition file?
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="outline"
              borderColor="orange.400"
              color={textColor}
              _hover={{ bg: cv_gray_100_rgba_212_175_55_0_08 }}
              onClick={() => {
                setCounterMakerContextModalOpen(false);
                setActiveTab('drafting');
                setIsCounterMakerPanelOpen(true);
              }}
              borderRadius="xl"
              fontSize="sm"
            >
              Use Current Chat & File
            </Button>
            <Button
              colorScheme="orange"
              onClick={() => {
                setCounterMakerContextModalOpen(false);
                handleStartNewChat();
                setActiveTab('drafting');
                setIsCounterMakerPanelOpen(true);
                setTimeout(() => {
                  document.getElementById('file-upload')?.click();
                }, 200);
              }}
              borderRadius="xl"
              fontSize="sm"
            >
              Upload New File / New Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Document Type Selector Modal */}
      <DocumentTypeSelector
        isOpen={documentTypeModalOpen}
        onClose={() => setDocumentTypeModalOpen(false)}
        onSelectDocumentType={(dt) => {
          setDocumentTypeModalOpen(false);
          handleSendMessage(`Document type: ${dt}`);
        }}
        language={language}
      />

      {/* Legal Guidance Modal */}
      <LegalGuidanceModal
        isOpen={guidanceModalOpen}
        onClose={() => setGuidanceModalOpen(false)}
        onComplete={() => setGuidanceModalOpen(false)}
        language={language}
      />

      {/* Complaint Form Modal */}
      <ComplaintFormModal
        isOpen={complaintFormModalOpen}
        onClose={() => setComplaintFormModalOpen(false)}
        onSubmit={(data) => {
          setComplaintFormModalOpen(false);
          handleSendMessage(`Submitted complaint form: ${JSON.stringify(data)}`);
        }}
        language={language}
      />
    </AdvancedChatProvider>
  );
};

export default AdvancedChatApp;
