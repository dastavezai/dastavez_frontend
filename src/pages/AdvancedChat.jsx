import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import {
  Box,
  Container,
  VStack,
  Input,
  IconButton,
  Flex,
  useToast,
  useColorMode,
  useColorModeValue,
  Text,
  HStack,
  Center,
  Button,
  Avatar,
  Heading,
  Badge,
  Image,
  Tooltip,
  Spinner,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Grid,
  GridItem,
  useBreakpointValue,
  Show,
  Hide,
  Progress,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, DeleteIcon, AttachmentIcon, ViewIcon, ViewOffIcon, AddIcon } from '@chakra-ui/icons';
import { RiSendPlaneFill } from 'react-icons/ri';
import { FiMaximize2, FiFileText, FiMic, FiMicOff, FiGlobe, FiRefreshCw, FiEdit, FiZap, FiGrid, FiMessageSquare, FiCpu, FiLayers, FiClock, FiSettings } from 'react-icons/fi';
import { MdDocumentScanner } from 'react-icons/md';
import axios from 'axios';
import ChatMessage from '../chat-advanced/components/ChatMessage';
import { useAuth } from '../chat-advanced/AuthBridge';
import { profileAPI } from '../lib/api';
import { Link, useParams, useNavigate } from 'react-router-dom';
import fileService from '../chat-advanced/services/fileService';
import { FaFile, FaTimes, FaPaperclip, FaEdit, FaDownload, FaRobot } from 'react-icons/fa';
const FullPageEditor = lazy(() => import('../chat-advanced/components/FullPageEditor'));
import DocumentFieldsModal from '../chat-advanced/components/DocumentFieldsModal';
import PostDownloadOptions from '../chat-advanced/components/PostDownloadOptions';
import TemplateBrowser from '../chat-advanced/components/TemplateBrowser';
import DocumentTypeSelector from '../chat-advanced/components/DocumentTypeSelector';
import LegalGuidanceModal from '../chat-advanced/components/LegalGuidanceModal';
import ComplaintFormModal from '../chat-advanced/components/ComplaintFormModal';
import TemplateDesignSelector from '../chat-advanced/components/TemplateDesignSelector';
import draftService from '../chat-advanced/services/draftService';
import { API_BASE_URL as BASE_URL } from '../chat-advanced/constants';
import JusticeIcon from '../components/JusticeIcon';
import TimelinePanel from './Panels/TimelinePanel';
import PrecedencePanel from './Panels/PrecedencePanel';
import CounterMakerPanel from './Panels/CounterMakerPanel';
import ResearchPanel from './Panels/ResearchPanel';
import BulkReviewPanel from './Panels/BulkReviewPanel';
import researchService from '../chat-advanced/services/researchService';
import chronologyService from '../chat-advanced/services/chronologyService';
import precedenceService from '../chat-advanced/services/precedenceService';
import counterMakerService from '../chat-advanced/services/counterMakerService';
import bulkReviewService from '../chat-advanced/services/bulkReviewService';
import { AdvancedChatProvider } from './AdvancedChatContext';


const ChatPage = () => {
  const cv_red_50_red_900 = useColorModeValue('red.50', 'red.900');
  const cv_orange_50_orange_900 = useColorModeValue('orange.50', 'orange.900');
  const cv_green_50_green_900 = useColorModeValue('green.50', 'green.900');
  const cv_purple_50_purple_900 = useColorModeValue('purple.50', 'purple.900');
  const cv_blue_50_blue_900 = useColorModeValue('blue.50', 'blue.900');
  const cv_white_gray_800 = useColorModeValue('white', 'gray.800');
  const cv_gray_100_rgba_212_175_55_0_08 = useColorModeValue('gray.100', 'rgba(212, 175, 55, 0.08)');
  const cv_gray_600_gray_400 = useColorModeValue('gray.600', 'gray.400');
  const cv_rgba_212_175_55_0_05_rgba_212_175_55_0_08 = useColorModeValue('rgba(212, 175, 55, 0.05)', 'rgba(212, 175, 55, 0.08)');
  const cv_gray_350_white = useColorModeValue('gray.350', 'white');
  const cv_gray_700_white = useColorModeValue('gray.700', 'white');
  const cv_white_gray_900 = useColorModeValue('white', 'gray.900');
  const cv_gray_50_gray_950 = useColorModeValue('gray.50', 'gray.950');
  const cv_gray_600_gray_450 = useColorModeValue('gray.600', 'gray.450');
  const cv_gray_400_gray_650 = useColorModeValue('gray.400', 'gray.650');
  const cv_gray_100_gray_800 = useColorModeValue('gray.100', 'gray.800');
  const cv_white_rgba_10_13_20_0_6 = useColorModeValue('white', 'rgba(10, 13, 20, 0.6)');
  const cv_gray_300_rgba_212_175_55_0_35 = useColorModeValue('gray.300', 'rgba(212, 175, 55, 0.35)');
  const cv_gray_250_rgba_212_175_55_0_25 = useColorModeValue('gray.250', 'rgba(212, 175, 55, 0.25)');
  const cv_red_50_red_950 = useColorModeValue('red.50', 'red.950');
  const cv_0_8px_30px_rgba_0_0_0_0_02_0_12px_40px_rgba_0_0_0_0_25 = useColorModeValue('0 8px 30px rgba(0, 0, 0, 0.02)', '0 12px 40px rgba(0, 0, 0, 0.25)');
  const cv_rgba_226_232_240_0_8_rgba_212_175_55_0_15 = useColorModeValue('rgba(226, 232, 240, 0.8)', 'rgba(212, 175, 55, 0.15)');
  const cv_rgba_255_255_255_0_85_rgba_10_13_20_0_35 = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(10, 13, 20, 0.35)');
  const cv_gray_600_gray_300 = useColorModeValue('gray.600', 'gray.300');
  const cv_white_rgba_13_17_23_0_8 = useColorModeValue('white', 'rgba(13, 17, 23, 0.8)');
  const cv_rgba_212_175_55_0_18_rgba_212_175_55_0_12 = useColorModeValue('rgba(212, 175, 55, 0.18)', 'rgba(212, 175, 55, 0.12)');
  const cv_rgba_255_255_255_0_45_rgba_13_17_23_0_25 = useColorModeValue('rgba(255, 255, 255, 0.45)', 'rgba(13, 17, 23, 0.25)');
  const cv_gray_200_gray_700 = useColorModeValue('gray.200', 'gray.700');
  const cv_white_rgba_212_175_55_0_005 = useColorModeValue('white', 'rgba(212, 175, 55, 0.005)');
  const cv_gray_550_gray_400 = useColorModeValue('gray.550', 'gray.400');
  const cv_gray_800_gray_100 = useColorModeValue('gray.800', 'gray.100');
  const cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05 = useColorModeValue('rgba(212, 175, 55, 0.08)', 'rgba(212, 175, 55, 0.05)');
  const cv_rgba_212_175_55_0_04_rgba_212_175_55_0_03 = useColorModeValue('rgba(212, 175, 55, 0.04)', 'rgba(212, 175, 55, 0.03)');
  const cv_gray_200_rgba_212_175_55_0_15 = useColorModeValue('gray.200', 'rgba(212, 175, 55, 0.15)');
  const cv_rgba_212_175_55_0_05_rgba_212_175_55_0_03 = useColorModeValue('rgba(212, 175, 55, 0.05)', 'rgba(212, 175, 55, 0.03)');
  const cv_rgba_212_175_55_0_015_rgba_212_175_55_0_005 = useColorModeValue('rgba(212, 175, 55, 0.015)', 'rgba(212, 175, 55, 0.005)');
  const cv_gray_200_gray_800 = useColorModeValue('gray.200', 'gray.800');
  const cv_gray_850_gray_100 = useColorModeValue('gray.850', 'gray.100');
  const cv_gray_50_rgba_212_175_55_0_04 = useColorModeValue('gray.50', 'rgba(212, 175, 55, 0.04)');
  const cv_gray_300_rgba_212_175_55_0_15 = useColorModeValue('gray.300', 'rgba(212, 175, 55, 0.15)');
  const cv_gray_100_transparent = useColorModeValue('gray.100', 'transparent');
  const cv_white_transparent = useColorModeValue('white', 'transparent');
  const cv_white_rgba_212_175_55_0_08 = useColorModeValue('white', 'rgba(212, 175, 55, 0.08)');
  const cv_gray_50_rgba_212_175_55_0_12 = useColorModeValue('gray.50', 'rgba(212, 175, 55, 0.12)');
  const cv_gray_100_gray_850 = useColorModeValue('gray.100', 'gray.850');
  const cv_sm_0_8px_32px_0_rgba_0_0_0_0_3 = useColorModeValue('sm', '0 8px 32px 0 rgba(0, 0, 0, 0.3)');
  const cv_gray_200_rgba_212_175_55_0_2 = useColorModeValue('gray.200', 'rgba(212, 175, 55, 0.2)');
  const cv_white_rgba_13_17_23_0_7 = useColorModeValue('white', 'rgba(13, 17, 23, 0.7)');
  const cv_gray_500_gray_400 = useColorModeValue('gray.500', 'gray.400');
  const cv_gray_50_gray_900 = useColorModeValue('gray.50', 'gray.900');
  const cv_white_gray_700 = useColorModeValue('white', 'gray.700');
  const { slug } = useParams();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { token, logout, user, loading, checkUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user && !loading) {
      if (user.companySlug) {
        if (!slug || slug !== user.companySlug) {
          navigate(`/c/${user.companySlug}`, { replace: true });
        }
      }
    }
  }, [slug, user, loading, navigate]);

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

  // File Session State — tracks per-file chat isolation
  // A new "file session" is created when a NEW file is uploaded and a tool is triggered.
  // If the same file is still active, switching tools reuses the same session.
  const [fileSessionId, setFileSessionId] = useState(null);
  const lastToolSessionFileId = useRef(null); // file._id of the last session that was "started"

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

  // Uploading indicators for multi-file views
  const [isUploadingReview, setIsUploadingReview] = useState(false);
  const [isUploadingChronology, setIsUploadingChronology] = useState(false);

  // Confirmation modal for multi-file continuation
  const [isMultiFileModalOpen, setIsMultiFileModalOpen] = useState(false);
  const [multiFilePendingAction, setMultiFilePendingAction] = useState(null); // 'chronology' | 'review'

  // New Chat Session handler (+ button action)
  const handleStartNewChat = () => {
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
    localStorage.removeItem('deepResearchSessionId');
    localStorage.removeItem('chronologySessionId');
    localStorage.removeItem('bulkReviewSessionId');
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

  // Drafting Tools State
  const [activeDraftingTool, setActiveDraftingTool] = useState(null);

  // Precedence State
  const [precedenceSessionId, setPrecedenceSessionId] = useState(null);
  const [precedenceStatus, setPrecedenceStatus] = useState('idle');
  const [precedenceResults, setPrecedenceResults] = useState(null);
  const [isPrecedencePanelOpen, setIsPrecedencePanelOpen] = useState(false);
  const precedencePollRef = useRef(null);

  // Counter Maker State
  const [counterMakerSessionId, setCounterMakerSessionId] = useState(null);
  const [counterMakerStatus, setCounterMakerStatus] = useState('idle');
  const [counterMakerResults, setCounterMakerResults] = useState(null);
  const [counterMakerFacts, setCounterMakerFacts] = useState('');
  const [isCounterMakerPanelOpen, setIsCounterMakerPanelOpen] = useState(false);
  const [counterMakerFileId, setCounterMakerFileId] = useState(null);
  const counterMakerPollRef = useRef(null);

  // Company Onboarding Modal States
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
        // Redirect to new company slug
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

  // Intent override state for "+" menu
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
  const [scanStatus, setScanStatus] = useState('none'); // none | scanning | scanned | failed
  const [scanResults, setScanResults] = useState(null);
  const [formatMetadata, setFormatMetadata] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [isScanReportOpen, setIsScanReportOpen] = useState(false); // Scan report modal

  // Mobile drawer state
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Document fields modal state (form-based field collection)
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState(false);
  const [fieldsModalData, setFieldsModalData] = useState(null); // { templatePath, templateTitle, fields }

  // Template Browser state
  const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);

  // Document Type Selector modal state (for CREATE_DOCUMENT flow)
  const [isDocTypeSelectorOpen, setIsDocTypeSelectorOpen] = useState(false);

  // Legal Guidance modal state (for GUIDE_ME flow)
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);

  // Complaint Form modal state (for GENERATE_COMPLAINT flow)
  const [isComplaintFormOpen, setIsComplaintFormOpen] = useState(false);
  const [complaintContext, setComplaintContext] = useState({}); // Store context for complaint generation (default to empty object)
  const [lastGeneratedComplaint, setLastGeneratedComplaint] = useState(null); // Store last generated complaint data for editing

  // Post-download options state (shown after successful document generation)
  const [showPostDownloadOptions, setShowPostDownloadOptions] = useState(false);
  const [lastGeneratedTemplate, setLastGeneratedTemplate] = useState(null); // { path, title }

  // Template Design Selector state (shown after form collection, before generation)
  const [isDesignSelectorOpen, setIsDesignSelectorOpen] = useState(false);
  const [pendingFormGeneration, setPendingFormGeneration] = useState(null); // { type: 'form'|'complaint', data, category }
  const [selectedDesignConfig, setSelectedDesignConfig] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false); // 🔍 Guard: prevent duplicate generation

  // Form data persistence for editing
  const [lastSubmittedFields, setLastSubmittedFields] = useState(null); // Store last form submission for edit
  const [isEditingDocument, setIsEditingDocument] = useState(false); // Flag to track if we're editing vs creating

  // 🆕 Track form closure without submission for recovery
  const [formClosedWithoutSubmit, setFormClosedWithoutSubmit] = useState(false);
  const [partialFormData, setPartialFormData] = useState(null);

  // Pending user choice state (blocks input when system awaits button response)
  const [isPendingUserChoice, setIsPendingUserChoice] = useState(false);

  // Speech-to-Text state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastSpeechTimeRef = useRef(null);
  const isListeningRef = useRef(false); // Ref to track listening state for timeouts

  // Language preference state (en = English, hi = Hindi)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('chatLanguage') || 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('chatLanguage', language);
  }, [language]);

  // Chat Font Size preference state (default 14px)
  const [chatFontSize, setChatFontSize] = useState(() => {
    return Number(localStorage.getItem('chatFontSize')) || 14;
  });

  // Update localStorage when chatFontSize changes
  useEffect(() => {
    localStorage.setItem('chatFontSize', String(chatFontSize));
  }, [chatFontSize]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    toast({
      title: language === 'en' ? 'भाषा बदली गई: हिंदी' : 'Language changed: English',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  useEffect(() => {
    if (user) {
      setSubscriptionStatus(user.subscriptionStatus || 'free');
      if (user.remainingMessages !== undefined) {
        setRemainingMessages(user.remainingMessages);
      }
    }
  }, [user]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const bgColor = cv_white_gray_800;
  const borderColor = cv_gray_200_gray_700;
  const inputBg = cv_white_gray_700;
  const textColor = cv_gray_600_gray_300;
  const headerBg = cv_white_gray_800;
  const bgMain = cv_gray_50_gray_900;
  const placeholderColor = cv_gray_500_gray_400;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get language-aware welcome message
  const getWelcomeMessage = () => {
    return language === 'hi'
      ? "नमस्ते! मैं आपका AI कानूनी सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?"
      : "Hello! I'm your AI legal assistant. How can I help you today?";
  };

  useEffect(() => {
    const loadInitialMessage = async () => {
      try {
        setIsInitialLoad(true);
        const response = await axios.get(`${BASE_URL}/chat/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.length === 0) {
          // Add welcome message if no history
          setMessages([{
            role: 'assistant',
            content: getWelcomeMessage()
          }]);
        } else {
          setMessages(response.data);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        toast({
          title: language === 'hi' ? 'चैट लोड करने में त्रुटि' : 'Error loading chat',
          description: error.response?.data?.message || (language === 'hi' ? 'चैट इतिहास लोड नहीं हो सका' : 'Could not load chat history'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        // Add fallback welcome message on error
        setMessages([{
          role: 'assistant',
          content: getWelcomeMessage()
        }]);
      } finally {
        setIsInitialLoad(false);
      }
    };

    if (token) {
      loadInitialMessage();
    }
  }, [token, toast, slug]);

  // Update welcome message when language changes - but ONLY if it's the initial welcome message
  // IMPORTANT: Only runs when language changes, NOT on every message update
  useEffect(() => {
    if (messages.length !== 1) return;
    const [first] = messages;
    if (first?.role !== 'assistant') return;
    const englishWelcome = "Hello! I'm your AI legal assistant. How can I help you today?";
    const hindiWelcome = "नमस्ते! मैं आपका AI कानूनी सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?";
    const shouldUpdate = first.content === englishWelcome || first.content === hindiWelcome;
    if (!shouldUpdate) return;

    setMessages([{ role: 'assistant', content: getWelcomeMessage() }]);
  }, [language]); // Removed 'messages' to prevent unnecessary re-renders

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      console.log('Speech recognition not supported in this browser');
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Support both English and Hindi
    recognition.lang = 'en-IN'; // Indian English (also picks up Hindi-English mix)

    // Sound notification functions
    const playSound = (type) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'start') {
          // Rising tone for start
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        } else if (type === 'stop') {
          // Falling tone for stop
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(300, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.25);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.25);
        } else if (type === 'timeout') {
          // Double beep for timeout
          oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.15);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.25);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }
      } catch (e) {
        console.log('Audio notification not available');
      }
    };

    // Auto-timeout configuration (in milliseconds)
    const SILENCE_TIMEOUT = 2500; // Stop after 2.5 seconds of silence
    const MAX_LISTEN_TIME = 60000; // Maximum 60 seconds of listening

    let maxTimeoutId = null;

    const startSilenceTimer = () => {
      // Clear existing timer
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      // Set new silence timeout
      silenceTimeoutRef.current = setTimeout(() => {
        // Use ref instead of state to avoid stale closure
        if (recognitionRef.current && isListeningRef.current) {
          console.log('Stopping due to silence timeout');
          playSound('timeout');
          recognition.stop();
          toast({
            title: 'Voice input stopped',
            description: 'No speech detected for 2.5 seconds',
            status: 'info',
            duration: 2000,
            isClosable: true,
          });
        }
      }, SILENCE_TIMEOUT);
    };

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true; // Update ref
      setInterimTranscript('');
      lastSpeechTimeRef.current = Date.now();
      playSound('start');

      // Start silence timer
      startSilenceTimer();

      // Set maximum listening time
      maxTimeoutId = setTimeout(() => {
        if (recognitionRef.current) {
          console.log('Stopping due to max time limit');
          playSound('timeout');
          recognition.stop();
          toast({
            title: 'Voice input stopped',
            description: 'Maximum listening time (60s) reached',
            status: 'info',
            duration: 2000,
            isClosable: true,
          });
        }
      }, MAX_LISTEN_TIME);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';

      // Reset silence timer on any speech
      lastSpeechTimeRef.current = Date.now();
      startSilenceTimer();

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      // Append final transcript to input
      if (finalTranscript) {
        setInput(prev => (prev + finalTranscript).trim());
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimTranscript('');

      // Clear timeouts
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);

      // Handle specific errors
      if (event.error === 'not-allowed') {
        toast({
          title: 'Microphone access denied',
          description: 'Please allow microphone access in your browser settings',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (event.error === 'no-speech') {
        playSound('timeout');
        toast({
          title: 'No speech detected',
          description: 'Voice input stopped. Please try again.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else if (event.error === 'network') {
        toast({
          title: 'Network error',
          description: 'Speech service unavailable. Try Edge browser or type manually.',
          status: 'warning',
          duration: 6000,
          isClosable: true,
        });
      } else if (event.error === 'audio-capture') {
        toast({
          title: 'Microphone not found',
          description: 'Please connect a microphone and try again',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } else if (event.error !== 'aborted') {
        toast({
          title: 'Voice input error',
          description: `Error: ${event.error}. Please try again.`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    recognition.onend = () => {
      const wasListening = isListeningRef.current;
      setIsListening(false);
      isListeningRef.current = false; // Update ref
      setInterimTranscript('');

      // Clear timeouts
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);

      // Always play stop sound when mic turns off (if it was listening)
      if (wasListening) {
        playSound('stop');
      }
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);
    };
  }, [toast]);

  // Toggle speech recognition
  const toggleListening = () => {
    if (!speechSupported) {
      toast({
        title: 'Voice input not supported',
        description: 'Your browser does not support voice input. Try Edge or Chrome.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (isListening) {
      // Manual stop
      recognitionRef.current?.stop();
      toast({
        title: 'Voice input stopped',
        description: 'Click mic to start again',
        status: 'info',
        duration: 1500,
        isClosable: true,
      });
    } else {
      try {
        recognitionRef.current?.start();
        toast({
          title: '🎤 Listening...',
          description: 'Speak now. Auto-stops after 2.5s of silence.',
          status: 'info',
          duration: 2500,
          isClosable: true,
        });
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        // May already be running, try to restart
        recognitionRef.current?.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            toast({
              title: 'Could not start voice input',
              description: 'Please try again or type manually',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        }, 200);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isLoading || analyzingFile) {
      toast({
        title: 'Please wait',
        description: analyzingFile ? 'File analysis is still in progress.' : 'Message is being sent.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    if (!input.trim() && !selectedFile) return;

    // Mark all previous messages' action buttons as inactive
    setMessages((prev) => prev.map(msg => ({
      ...msg,
      actionsActive: false
    })));

    const userMessage = input.trim();
    console.log('📤 Sending message:', userMessage);
    setInput('');
    setMessages(prev => {
      const newMessages = [...prev, { role: 'user', content: userMessage }];
      console.log('📊 Messages after adding user message:', newMessages.length);
      return newMessages;
    });
    setIsLoading(true);

    // Hide post-download options when user sends a new message
    setShowPostDownloadOptions(false);

    try {
      let response;

      if (selectedFile && selectedFile._id) {
        setAnalyzingFile(true);
        try {
          // Pass intentOverride and language to file analysis for intent-aware and language-aware prompts
          response = await fileService.analyzeFile(selectedFile._id, userMessage, intentOverride, language);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: response.analysis }
          ]);
          setRemainingMessages(response.remainingMessages);
          setSubscriptionStatus(response.subscriptionStatus);
        } finally {
          setAnalyzingFile(false);
        }
      } else {
        // Include intentOverride if user selected an intent from the + menu
        // Include language preference for AI responses
        const payload = {
          message: userMessage,
          language: language // 'en' or 'hi'
        };
        if (intentOverride) {
          payload.intentOverride = intentOverride;
        }

        response = await axios.post(`${BASE_URL}/chat/message`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // NOTE: Intent override is now STICKY - stays selected until user manually changes it
        // This allows consistent behavior across multiple messages in the same intent mode

        // Attach file/document/mode/missingFields/suggestedActions when present so UI can render downloads/previews/missing fields/action suggestions
        console.log('📥 Received response:', {
          hasResponse: !!response.data.response,
          responseLength: response.data.response?.length,
          mode: response.data.mode,
          hasSuggestedActions: !!response.data.suggestedActions
        });

        const assistantMessage = {
          role: 'assistant',
          content: response.data.response || 'No response received from server'
        };
        if (response.data.mode) assistantMessage.mode = response.data.mode;
        if (response.data.file) assistantMessage.file = response.data.file;
        if (response.data.document) assistantMessage.document = response.data.document;
        if (response.data.missingFields) assistantMessage.missingFields = response.data.missingFields;
        if (response.data.templatePath) assistantMessage.templatePath = response.data.templatePath;
        if (response.data.templateTitle) assistantMessage.templateTitle = response.data.templateTitle;
        if (response.data.suggestedActions) assistantMessage.suggestedActions = response.data.suggestedActions;

        // Store complaint data for editing if present
        if (response.data.complaintData) {
          setLastGeneratedComplaint({
            data: response.data.complaintData,
            content: response.data.document?.fullContent || '',
            timestamp: Date.now()
          });
        }

        // Detect pending state: system awaiting button response
        const hasSuggestedActions = response.data.suggestedActions && response.data.suggestedActions.length > 0;
        const isPendingMode = ['template_confirmation', 'document_ready'].includes(response.data.mode);
        setIsPendingUserChoice(hasSuggestedActions && isPendingMode);

        // 🎯 FORM-BASED FIELD COLLECTION: If we have missing fields, open the modal instead of chat-based collection
        if (response.data.mode === 'waiting_for_details' && response.data.missingFields && response.data.templatePath) {
          await openFieldsModalWithSchema({
            templatePath: response.data.templatePath,
            templateTitle: response.data.templateTitle,
            missingFields: response.data.missingFields
          });
        }

        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          console.log('📊 Messages after adding assistant response:', newMessages.length);
          console.log('💬 Last message:', newMessages[newMessages.length - 1]);
          return newMessages;
        });
        setRemainingMessages(response.data.remainingMessages);
        setSubscriptionStatus(response.data.subscriptionStatus);
      }
    } catch (error) {
      console.error('Message error:', error);
      if (error.response?.status === 403 && error.response?.data?.message?.includes('No remaining messages')) {
        toast({
          title: 'Message Limit Reached',
          description: 'You have no remaining messages. Please upgrade to premium for unlimited access.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top'
        });
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to send message',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      // Keep the user's message visible even if the request fails.
    } finally {
      setIsLoading(false);
      setAnalyzingFile(false);
    }
  };

  // Opens the clear chat confirmation modal
  const handleClearChat = () => {
    setClearPassword('');
    setShowClearPassword(false);
    onClearModalOpen();
  };

  // Handles the actual chat clearing with password verification
  const handleConfirmClearChat = async () => {
    if (!clearPassword.trim()) {
      toast({
        title: 'Password required',
        description: 'Please enter your password to confirm',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    setIsClearing(true);
    try {
      await axios.delete(`${BASE_URL}/chat/clear`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { password: clearPassword }
      });
      // Reset to welcome message after clearing
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your AI legal assistant. How can I help you today?"
      }]);
      toast({
        title: 'Chat cleared',
        status: 'success',
        duration: 2000,
      });
      onClearModalClose();
      setClearPassword('');
    } catch (error) {
      toast({
        title: 'Error clearing chat',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Helper to disable all previous action buttons (called before sending message)
  const disableOldButtons = () => {
    setMessages((prev) => prev.map(msg => ({
      ...msg,
      actionsActive: false
    })));
  };

  const openFieldsModalWithSchema = async ({ templatePath, templateTitle, missingFields, initialValues = null }) => {
    console.log('📋 [openFieldsModalWithSchema] Called with:', { templatePath, templateTitle, hasMissingFields: !!missingFields });

    if (!templatePath) {
      console.error('❌ [openFieldsModalWithSchema] No templatePath provided');
      throw new Error('Template path is required');
    }

    try {
      console.log('🔄 [openFieldsModalWithSchema] Fetching schema from backend...');
      const schemaData = await draftService.getTemplateSchema(templatePath, token);
      console.log('✅ [openFieldsModalWithSchema] Schema fetched:', {
        fieldCount: schemaData.fields?.length,
        displayTitle: schemaData.displayTitle
      });

      setFieldsModalData({
        templatePath,
        templateTitle: templateTitle || schemaData.displayTitle,
        fields: schemaData.fields || [],
        initialValues: initialValues || {}  // Support pre-filled values
      });
    } catch (schemaError) {
      console.error('❌ [openFieldsModalWithSchema] Schema fetch failed:', schemaError);
      console.error('Schema error details:', {
        message: schemaError.message,
        response: schemaError.response?.data,
        status: schemaError.response?.status
      });

      // If no missingFields fallback, throw the error
      if (!missingFields || missingFields.length === 0) {
        throw new Error(`Failed to load template schema: ${schemaError.response?.data?.message || schemaError.message}`);
      }

      console.warn('⚠️ [openFieldsModalWithSchema] Using missingFields fallback');
      setFieldsModalData({
        templatePath,
        templateTitle: templateTitle || (language === 'hi' ? 'दस्तावेज़' : 'Document'),
        fields: (missingFields || []).map(f => ({
          key: f.key,
          label: f.label || f.key,
          required: true
        })),
        initialValues: initialValues || {}  // Support pre-filled values
      });
    }

    console.log('🚪 [openFieldsModalWithSchema] Opening modal...');
    setIsFieldsModalOpen(true);
    setFormClosedWithoutSubmit(false); // Reset closure tracking when opening
  };

  // 🎯 SUGGESTED ACTIONS: Handle click on suggested action chips
  const handleSuggestedActionClick = async (actionTypeRaw, suggestionInput) => {
    let actionType = actionTypeRaw;
    let suggestion = suggestionInput;

    if (typeof actionTypeRaw === 'object' && actionTypeRaw !== null) {
      actionType = actionTypeRaw.type || actionTypeRaw.action;
      suggestion = actionTypeRaw;
    }

    console.log('Suggested action clicked:', actionType, suggestion);

    // Clear pending state when user clicks any action button
    setIsPendingUserChoice(false);

    // NOTE: We do NOT disable buttons here - they should only be disabled when a new message arrives
    // This allows users to open/close modals without losing button functionality

    switch (actionType) {
      case 'PRECEDENCE_ANALYSIS':
        console.log('⚖️ PRECEDENCE_ANALYSIS action triggered');
        setActiveDraftingTool('precedence');
        setIsPrecedencePanelOpen(true);
        break;

      case 'COUNTER_AFFIDAVIT':
        console.log('🛡️ COUNTER_AFFIDAVIT action triggered');
        setActiveDraftingTool('counter_maker');
        disableOldButtons();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I can help you draft a Counter Affidavit. Please upload the original complaint or petition file here in the chat so I can analyze it.'
        }]);
        break;
      case 'RESUME_FORM': {
        // User wants to resume partially filled form
        console.log('📝 RESUME_FORM action triggered with data:', partialFormData);

        if (partialFormData) {
          await openFieldsModalWithSchema({
            templatePath: partialFormData.templatePath,
            templateTitle: partialFormData.templateTitle,
            missingFields: partialFormData.fields,
            initialValues: partialFormData.partialValues || {}
          });

          toast({
            title: language === 'hi' ? '📝 फॉर्म फिर से खोला गया' : '📝 Form Resumed',
            description: language === 'hi'
              ? 'आपका पिछला डेटा बहाल कर दिया गया है'
              : 'Your previous data has been restored',
            status: 'success',
            duration: 2000,
          });
        }
        break;
      }

      case 'DOCUMENT_REQUEST': {
        // User wants to generate a document - send message directly
        console.log('📋 DOCUMENT_REQUEST action triggered:', suggestion);

        disableOldButtons();
        setIntentOverride('DOCUMENT_REQUEST');

        // Extract document type from suggestion data or label
        const docType = suggestion?.data?.documentType ||
          suggestion?.label?.replace('Generate', '').replace('बनाएं', '').trim();

        const docMsg = language === 'hi'
          ? `मुझे ${docType} चाहिए`
          : `I need to generate a ${docType}`;

        setMessages(prev => [...prev, { role: 'user', content: docMsg }]);

        try {
          setIsLoading(true);
          const response = await axios.post(`${BASE_URL}/chat/message`,
            { message: docMsg, language, intentOverride: 'DOCUMENT_REQUEST' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );

          if (response.data) {
            const assistantMsg = {
              role: 'assistant',
              content: response.data.response
            };
            if (response.data.mode) assistantMsg.mode = response.data.mode;
            if (response.data.suggestedActions) assistantMsg.suggestedActions = response.data.suggestedActions;
            if (response.data.missingFields) assistantMsg.missingFields = response.data.missingFields;
            if (response.data.templatePath) assistantMsg.templatePath = response.data.templatePath;

            setMessages(prev => [...prev, assistantMsg]);

            // If template fields modal needed
            if (response.data.mode === 'waiting_for_details' && response.data.missingFields && response.data.templatePath) {
              await openFieldsModalWithSchema({
                templatePath: response.data.templatePath,
                templateTitle: response.data.templateTitle,
                missingFields: response.data.missingFields
              });
            }

            if (response.data.remainingMessages !== null) {
              setRemainingMessages(response.data.remainingMessages);
            }
            setSubscriptionStatus(response.data.subscriptionStatus);
          }
        } catch (error) {
          console.error('Document request failed:', error);
          toast({
            title: language === 'hi' ? 'त्रुटि' : 'Error',
            description: error.response?.data?.message || (language === 'hi' ? 'दस्तावेज़ अनुरोध विफल' : 'Document request failed'),
            status: 'error',
            duration: 3000,
          });
        } finally {
          setIsLoading(false);
          setIntentOverride(null);
        }
        break;
      }

      case 'CREATE_DOCUMENT': {
        // Open Document Type Selector modal instead of sending vague message
        console.log('📝 CREATE_DOCUMENT action triggered - opening document selector');
        setIntentOverride('DOCUMENT_REQUEST');
        // Don't show intent label for explicit Create Document action
        // setIntentLabel(language === 'hi' ? '📝 दस्तावेज़ बनाना' : '📝 Generate Document');
        setIsDocTypeSelectorOpen(true);
        break;
      }

      case 'GUIDE_ME': {
        // Open Legal Guidance modal instead of sending vague message
        console.log('🧭 GUIDE_ME action triggered - opening guidance modal');
        setIntentOverride('DOCUMENT_REQUEST');  // Guide Me is document creation, not separate mode
        // Don't show confusing "Guidance" label - it's just smart document creation
        // setIntentLabel(language === 'hi' ? '⚖️ मार्गदर्शन' : '⚖️ Guidance');
        setIsGuidanceModalOpen(true);
        break;
      }

      case 'BROWSE_TEMPLATES': {
        // User clicked "Browse Templates" - open the template browser modal
        console.log('🔍 BROWSE_TEMPLATES action triggered - opening template browser');
        setIsTemplateBrowserOpen(true);
        break;
      }

      case 'LEGAL_INFORMATION':
        // User wants legal information
        setIntentOverride('LEGAL_INFORMATION');
        setIntentLabel(language === 'hi' ? '⚖️ कानूनी जानकारी' : '⚖️ Legal Information');

        toast({
          title: language === 'hi' ? '⚖️ जानकारी मोड' : '⚖️ Information Mode',
          description: language === 'hi'
            ? 'मैं आपको कानूनी जानकारी दूंगा'
            : "I'll provide legal information",
          status: 'info',
          duration: 3000,
        });
        break;

      case 'CASE_SEARCH': {
        // User wants to search cases - send contextual message and get results
        console.log('🔍 CASE_SEARCH action triggered - searching cases with context');

        disableOldButtons();

        // Extract context from previous messages
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];

        // Build contextual search query
        const searchContext = lastAssistantMessage?.content?.substring(0, 200) || '';
        const searchMsg = language === 'hi'
          ? `इस मामले से संबंधित केस खोजें: ${lastUserMessage?.content || searchContext}`
          : `Search related cases for: ${lastUserMessage?.content || searchContext}`;

        setMessages(prev => [...prev, { role: 'user', content: searchMsg }]);

        try {
          setIsLoading(true);

          const response = await axios.post(`${BASE_URL}/chat/message`, {
            message: searchMsg,
            language,
            intentOverride: 'LEGAL_INFORMATION'  // Use legal info mode for case search
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.data) {
            const assistantMsg = {
              role: 'assistant',
              content: response.data.response
            };
            if (response.data.mode) assistantMsg.mode = response.data.mode;
            if (response.data.suggestedActions) assistantMsg.suggestedActions = response.data.suggestedActions;

            setMessages(prev => [...prev, assistantMsg]);

            if (response.data.remainingMessages !== null) {
              setRemainingMessages(response.data.remainingMessages);
            }
            setSubscriptionStatus(response.data.subscriptionStatus);
          }
        } catch (error) {
          console.error('Case search failed:', error);
          toast({
            title: language === 'hi' ? 'त्रुटि' : 'Error',
            description: error.response?.data?.message || (language === 'hi' ? 'केस खोज विफल' : 'Case search failed'),
            status: 'error',
            duration: 3000,
          });
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'browse_templates': {
        // Lowercase variant - also opens template browser
        console.log('🔍 browse_templates (lowercase) action triggered - opening template browser');
        setIsTemplateBrowserOpen(true);
        break;
      }

      // Document type quick selections
      case 'DOC_RENT_AGREEMENT':
      case 'DOC_LEGAL_NOTICE':
      case 'DOC_AFFIDAVIT': {
        const docTypeMap = {
          'DOC_RENT_AGREEMENT': { en: 'rent agreement', hi: 'किराया समझौता' },
          'DOC_LEGAL_NOTICE': { en: 'legal notice', hi: 'कानूनी नोटिस' },
          'DOC_AFFIDAVIT': { en: 'affidavit', hi: 'शपथ पत्र' }
        };
        const docType = docTypeMap[actionType];
        const docMsg = language === 'hi' ? `मुझे ${docType.hi} बनाना है` : `I want to create a ${docType.en}`;

        disableOldButtons(); // Disable old buttons before adding new message
        setMessages(prev => [...prev, { role: 'user', content: docMsg }]);
        setIntentOverride('DOCUMENT_REQUEST');

        try {
          setIsLoading(true);
          const response = await axios.post(`${BASE_URL}/chat/message`,
            { message: docMsg, language, intentOverride: 'DOCUMENT_REQUEST' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          if (response.data) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.data.response,
              suggestedActions: response.data.suggestedActions || []
            }]);
          }
        } catch (error) {
          console.error('Document type selection failed:', error);
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'FREEFORM_YES': {
        // User confirmed custom AI document generation
        disableOldButtons(); // Disable old buttons before adding new message
        const confirmMsg = language === 'hi' ? 'हाँ, कस्टम दस्तावेज़ बनाएं' : 'Yes, create custom document';
        setMessages(prev => [...prev, { role: 'user', content: confirmMsg }]);

        try {
          setIsLoading(true);
          const response = await axios.post(`${BASE_URL}/chat/message`,
            { message: '1', language, intentOverride: 'DOCUMENT_REQUEST' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          if (response.data) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.data.response,
              suggestedActions: response.data.suggestedActions || []
            }]);
          }
        } catch (error) {
          console.error('Freeform confirmation failed:', error);
        } finally {
          setIsLoading(false);
        }
        break;
      }

      // AI Document choice: Filled Document vs Raw Template
      case 'AI_DOC_FILLED': {
        // User wants filled document - AI will ask for missing fields
        console.log('📝 AI_DOC_FILLED action triggered');
        disableOldButtons(); // Disable old buttons before adding new message
        const filledMsg = language === 'hi' ? 'भरा हुआ दस्तावेज़ चाहिए' : 'I want a filled document';
        setMessages(prev => [...prev, { role: 'user', content: filledMsg }]);

        try {
          setIsLoading(true);
          const response = await axios.post(`${BASE_URL}/chat/message`,
            { message: '1', language, intentOverride: 'DOCUMENT_REQUEST' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          if (response.data) {
            // Check if response has fields to collect - open modal if available
            if (response.data.missingFields && response.data.missingFields.length > 0) {
              await openFieldsModalWithSchema({
                templatePath: response.data.templatePath,
                templateTitle: response.data.templateTitle || (language === 'hi' ? 'कानूनी दस्तावेज़' : 'Legal Document'),
                missingFields: response.data.missingFields
              });
            }
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.data.response,
              suggestedActions: response.data.suggestedActions || []
            }]);
          }
        } catch (error) {
          console.error('AI doc filled choice failed:', error);
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'AI_DOC_RAW': {
        // User wants raw template with placeholders
        console.log('📋 AI_DOC_RAW action triggered');
        disableOldButtons(); // Disable old buttons before adding new message
        const rawMsg = language === 'hi' ? 'कच्चा टेम्पलेट चाहिए' : 'I want a raw template';
        setMessages(prev => [...prev, { role: 'user', content: rawMsg }]);

        try {
          setIsLoading(true);
          const response = await axios.post(`${BASE_URL}/chat/message`,
            { message: '2', language, intentOverride: 'DOCUMENT_REQUEST' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          if (response.data) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.data.response,
              suggestedActions: response.data.suggestedActions || [],
              document: response.data.document,
              file: response.data.file
            }]);
          }
        } catch (error) {
          console.error('AI doc raw choice failed:', error);
        } finally {
          setIsLoading(false);
        }
        break;
      }

      // Template confirmation choices
      case 'USE_TEMPLATE': {
        disableOldButtons(); // Disable old buttons before adding new message
        const templateMsg = language === 'hi' ? 'हाँ, इस टेम्पलेट का उपयोग करें' : 'Yes, use this template';
        setMessages(prev => [...prev, { role: 'user', content: templateMsg }]);

        try {
          setIsLoading(true);
          const response = await axios.post(`${BASE_URL}/chat/message`,
            { message: '1', language, intentOverride: 'DOCUMENT_REQUEST' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          if (response.data) {
            // Check if response has fields to collect - open modal if available
            if (response.data.missingFields && response.data.missingFields.length > 0 && response.data.templatePath) {
              await openFieldsModalWithSchema({
                templatePath: response.data.templatePath,
                templateTitle: response.data.templateTitle || (language === 'hi' ? 'दस्तावेज़' : 'Document'),
                missingFields: response.data.missingFields
              });
            }
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.data.response,
              suggestedActions: response.data.suggestedActions || []
            }]);
          }
        } catch (error) {
          console.error('Use template choice failed:', error);
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'USE_AI_GENERATE': {
        disableOldButtons(); // Disable old buttons before adding new message
        const aiMsg = language === 'hi' ? 'AI से दस्तावेज़ बनाएं' : 'Generate with AI';
        setMessages(prev => [...prev, { role: 'user', content: aiMsg }]);

        try {
          setIsLoading(true);
          const response = await axios.post(`${BASE_URL}/chat/message`,
            { message: '2', language, intentOverride: 'DOCUMENT_REQUEST' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          if (response.data) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.data.response,
              suggestedActions: response.data.suggestedActions || []
            }]);
          }
        } catch (error) {
          console.error('AI generate choice failed:', error);
        } finally {
          setIsLoading(false);
        }
        break;
      }

      // Post-download action: Create a new/different document
      case 'NEW_DOCUMENT': {
        console.log('📝 NEW_DOCUMENT action triggered - showing document creation choice');

        // Clear the current document session and reset state
        try {
          await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.warn('Failed to clear server document session:', error);
        }

        // Reset all document-related state
        setShowPostDownloadOptions(false);
        setLastGeneratedTemplate(null);
        setIntentOverride(null);
        setIntentLabel(null);

        // Show choice between Create Document and Browse Templates (like welcome screen)
        disableOldButtons();
        const choiceMessage = {
          role: 'assistant',
          content: language === 'hi'
            ? 'बढ़िया! आप कैसे शुरू करना चाहेंगे?'
            : 'Great! How would you like to start?',
          suggestedActions: language === 'hi'
            ? [
              { type: 'doc_choice', label: '📝 दस्तावेज़ बनाएं', icon: '📝', action: 'CREATE_DOCUMENT', description: 'दस्तावेज़ प्रकार चुनें' },
              { type: 'doc_choice', label: '📚 टेम्पलेट ब्राउज़ करें', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'सभी टेम्पलेट देखें' }
            ]
            : [
              { type: 'doc_choice', label: '📝 Create Document', icon: '📝', action: 'CREATE_DOCUMENT', description: 'Choose document type' },
              { type: 'doc_choice', label: '📚 Browse Templates', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'View all templates' }
            ]
        };
        setMessages(prev => [...prev, choiceMessage]);
        break;
      }

      // Post-download action: Exit document mode
      case 'EXIT_DOCUMENT_MODE': {
        console.log('❌ EXIT_DOCUMENT_MODE action triggered');

        // Call server to clear document session
        try {
          await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          console.log('✅ Server document session cleared');
        } catch (error) {
          console.warn('Failed to clear server document session:', error);
        }

        // Reset all document-related state
        setShowPostDownloadOptions(false);
        setLastGeneratedTemplate(null);
        setLastSubmittedFields(null);
        setIsEditingDocument(false);
        setIsPendingUserChoice(false);
        setIntentOverride(null);
        setIntentLabel(null);
        setFieldsModalData(null);
        setIsFieldsModalOpen(false);

        const exitMsg = language === 'hi'
          ? 'दस्तावेज़ मोड से बाहर निकल गए। आप कुछ और पूछ सकते हैं।'
          : 'Exited document mode. You can ask me anything else.';

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: exitMsg
        }]);

        toast({
          title: language === 'hi' ? '✅ बाहर निकले' : '✅ Exited',
          description: language === 'hi' ? 'दस्तावेज़ मोड से बाहर' : 'Exited document mode',
          status: 'success',
          duration: 2000,
        });
        break;
      }

      // Post-download action: Rate experience
      case 'RATE_LIKE':
      case 'RATE_DISLIKE': {
        const isLike = action === 'RATE_LIKE';
        console.log(`${isLike ? '👍' : '👎'} Rating:`, isLike ? 'LIKE' : 'DISLIKE');

        try {
          await axios.post(`${BASE_URL}/chat/rate-draft`,
            { rating: isLike ? 'like' : 'dislike', templatePath: lastGeneratedTemplate?.path },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );

          toast({
            title: language === 'hi' ? '✅ धन्यवाद!' : '✅ Thank you!',
            description: language === 'hi'
              ? 'आपकी प्रतिक्रिया दर्ज की गई'
              : 'Your feedback has been recorded',
            status: 'success',
            duration: 2000,
          });
        } catch (error) {
          console.error('Rating failed:', error);
        }
        break;
      }

      // Post-download action: Edit last generated document
      case 'EDIT_DOCUMENT': {
        console.log('✏️ EDIT_DOCUMENT action triggered');

        // Check if it's a complaint or template document
        if (lastGeneratedComplaint) {
          // Reopen complaint modal with pre-filled data
          console.log('✏️ Editing complaint with data:', lastGeneratedComplaint.data);
          setIsComplaintFormOpen(true);
          // The ComplaintFormModal will receive initialData prop

          toast({
            title: language === 'hi' ? '✏️ शिकायत संपादित करें' : '✏️ Edit Complaint',
            description: language === 'hi'
              ? 'विवरण अपडेट करें और पुनः जेनरेट करें'
              : 'Update details and regenerate',
            status: 'info',
            duration: 2000,
          });
        } else if (lastGeneratedTemplate && lastSubmittedFields) {
          // Reopen template modal with pre-filled data
          console.log('✏️ Editing template document');
          setIsEditingDocument(true);
          await openFieldsModalWithSchema({
            templatePath: lastGeneratedTemplate.path,
            templateTitle: lastGeneratedTemplate.title,
            missingFields: [],
            initialValues: lastSubmittedFields
          });

          toast({
            title: language === 'hi' ? '✏️ संपादित करें' : '✏️ Edit Document',
            description: language === 'hi'
              ? 'फ़ील्ड मान अपडेट करें और पुनः जेनरेट करें'
              : 'Update field values and regenerate',
            status: 'info',
            duration: 2000,
          });
        } else {
          // No document data available
          toast({
            title: language === 'hi' ? '⚠️ डेटा नहीं मिला' : '⚠️ Data Not Found',
            description: language === 'hi'
              ? 'पिछले दस्तावेज़ का डेटा उपलब्ध नहीं है'
              : 'Previous document data is not available',
            status: 'warning',
            duration: 3000,
          });
        }
        break;
      }

      case 'general_help':
        // User wants general help - auto-detect mode
        setIntentOverride(null);
        setIntentLabel(null);

        toast({
          title: language === 'hi' ? '🤖 ऑटो-डिटेक्ट मोड' : '🤖 Auto-Detect Mode',
          description: language === 'hi'
            ? 'मैं आपके प्रश्न का स्वचालित रूप से पता लगाऊंगा'
            : "I'll automatically detect your intent",
          status: 'info',
          duration: 3000,
        });
        break;

      case 'GENERATE_COMPLAINT': {
        // User clicked "Generate Complaint" - open structured form modal
        console.log('📝 GENERATE_COMPLAINT action triggered - opening complaint form');

        // Extract context from previous messages for smart pre-filling
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];

        // 🤖 SMART PRE-FILLING: Analyze conversation to auto-select complaint type and pre-fill description
        const userContent = lastUserMessage?.content?.toLowerCase() || '';
        const aiContent = lastAssistantMessage?.content?.toLowerCase() || '';
        const combinedContext = userContent + ' ' + aiContent;

        // Detect complaint type from conversation keywords
        let suggestedComplaintType = null;
        let suggestedDescription = lastUserMessage?.content || '';

        // Property/Rental disputes
        if (/rental|rent|tenant|landlord|lease|evict|property dispute|vacating/i.test(combinedContext)) {
          suggestedComplaintType = 'civil';
        }
        // Consumer complaints
        else if (/consumer|defect|product|service|refund|warranty|fraud|seller/i.test(combinedContext)) {
          suggestedComplaintType = 'consumer';
        }
        // Criminal complaints
        else if (/theft|assault|fraud|cheating|criminal|fir|police|violence/i.test(combinedContext)) {
          suggestedComplaintType = 'criminal';
        }
        // Family/matrimonial
        else if (/divorce|maintenance|custody|domestic|dowry|marriage/i.test(combinedContext)) {
          suggestedComplaintType = 'family';
        }
        // Workplace/labor
        else if (/salary|employer|workplace|termination|harassment|labor|employment/i.test(combinedContext)) {
          suggestedComplaintType = 'labor';
        }

        console.log('🤖 Smart pre-fill detected:', { suggestedComplaintType, descriptionLength: suggestedDescription.length });

        const contextData = {
          originalMessage: lastUserMessage?.content || '',
          aiResponseExcerpt: lastAssistantMessage?.content?.substring(0, 500) || '',
          suggestedComplaintType,  // Auto-select this type
          suggestedDescription,    // Pre-fill description
          metadata: {
            conversationLength: messages.length,
            timestamp: new Date().toISOString()
          }
        };

        setComplaintContext(contextData);
        setIsComplaintFormOpen(true);
        break;
      }

      case 'LEARN_MORE_LAW': {
        // User clicked "Learn More About This Law" - generate in-depth analysis
        console.log('⚖️ LEARN_MORE_LAW action triggered - generating detailed analysis');

        disableOldButtons();

        // Extract law references from previous conversation
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];

        // Add user message indicating they want more details
        const learnMoreMsg = language === 'hi'
          ? 'इस कानून के बारे में विस्तार से बताएं'
          : 'Provide detailed analysis of this law';

        setMessages(prev => [...prev, { role: 'user', content: learnMoreMsg }]);

        try {
          setIsLoading(true);

          const response = await axios.post(`${BASE_URL}/chat/legal-analysis`, {
            lawReference: suggestion?.metadata?.lawReference || null,
            previousMessage: lastUserMessage?.content || '',
            previousResponse: lastAssistantMessage?.content || ''
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.data?.success) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.data.response,
              mode: 'legal_analysis',
              analysisSubject: response.data.analysisSubject
            }]);

            // Update message counts
            if (response.data.remainingMessages !== null) {
              setRemainingMessages(response.data.remainingMessages);
            }
            setSubscriptionStatus(response.data.subscriptionStatus);
          }
        } catch (error) {
          console.error('Legal analysis generation failed:', error);
          const errorMsg = language === 'hi'
            ? 'विश्लेषण बनाने में त्रुटि। कृपया पुनः प्रयास करें।'
            : 'Error generating analysis. Please try again.';

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: errorMsg
          }]);

          toast({
            title: language === 'hi' ? 'त्रुटि' : 'Error',
            description: error.response?.data?.message || (language === 'hi' ? 'विश्लेषण बनाने में विफल' : 'Failed to generate analysis'),
            status: 'error',
            duration: 4000,
          });
        } finally {
          setIsLoading(false);
        }
        break;
      }

      // Backward compatibility - old action type names
      case 'SHOW_CATEGORIES': {
        // Old action type for Browse Templates - redirect to BROWSE_TEMPLATES
        console.log('📚 SHOW_CATEGORIES (legacy) - opening template browser');
        setIsTemplateBrowserOpen(true);
        break;
      }

      default:
        console.warn('Unknown action type:', actionType);
    }
  };

  // 🎯 FORM-BASED FIELD COLLECTION: Handle form submission from DocumentFieldsModal
  // Now intercepts to show design selector before generating
  const handleFieldsFormSubmit = async (fieldValues) => {
    // 🔍 GUARD: Prevent double submission
    if (isGenerating) {
      console.warn('⚠️  Generation already in progress, blocking form submission');
      toast({
        title: language === 'hi' ? 'कृपया प्रतीक्षा करें' : 'Please wait',
        description: language === 'hi' ? 'दस्तावेज़ पहले से बन रहा है' : 'Document is already being generated',
        status: 'info',
        duration: 2000,
      });
      return;
    }

    if (pendingFormGeneration) {
      console.warn('⚠️  Pending generation already exists, blocking duplicate form submission');
      return;
    }

    if (!fieldsModalData?.templatePath) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'टेम्पलेट जानकारी नहीं मिली' : 'Template information not found',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    console.log('📝 Form submitted:', { templatePath: fieldsModalData.templatePath, fieldCount: Object.keys(fieldValues).length });

    // Store field values for editing capability
    setLastSubmittedFields(fieldValues);

    // Clear form closure tracking since form was successfully submitted
    setFormClosedWithoutSubmit(false);
    setPartialFormData(null);

    // Derive category from template path (e.g. "Rent Drafts/template.docx" → "Rent Drafts")
    const templateCategory = fieldsModalData.templatePath.split('/')[0] || '';

    // Close fields modal and show design selector
    setIsFieldsModalOpen(false);
    setPendingFormGeneration({
      type: 'form',
      data: {
        templatePath: fieldsModalData.templatePath,
        templateTitle: fieldsModalData.templateTitle,
        fieldValues,
      },
      category: templateCategory,
    });
    setIsDesignSelectorOpen(true);
  };

  // 🆕 Handle form closure without submission
  const handleFieldsFormClose = (partialValues, isCancelled = false) => {
    console.log('🚪 [handleFieldsFormClose] Called', { isCancelled, hasPartialData: !!partialValues, isEditMode: isEditingDocument });

    if (isCancelled) {
      // User explicitly cancelled - return to main menu
      console.log('🔴 [handleFieldsFormClose] User cancelled draft flow - resetting server + client state');

      // Clear server-side pending sessions (Redis keys)
      (async () => {
        try {
          await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          console.log('✅ Server document session cleared on cancel');
        } catch (error) {
          console.warn('⚠️ Failed to clear server session on cancel:', error);
        }
      })();

      // Clear draft state
      setFieldsModalData(null);
      setPartialFormData(null);
      setFormClosedWithoutSubmit(false);
      setIsEditingDocument(false);
      setLastGeneratedTemplate(null);
      setLastSubmittedFields(null);
      setIntentOverride(null);
      setIntentLabel(null);
      setIsPendingUserChoice(false);

      // Show main menu message
      const mainMenuMessage = {
        role: 'assistant',
        content: language === 'hi'
          ? 'आपने ड्राफ्ट प्रक्रिया रद्द कर दी है। मैं आपकी कैसे मदद कर सकता हूं?'
          : 'You cancelled the draft process. How can I help you?',
        suggestedActions: language === 'hi' ? [
          { type: 'action', label: '📄 📄 दस्तावेज़ बनाएं', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'कानूनी दस्तावेज़ बनाएं' },
          { type: 'action', label: '🧭 🧭 मार्गदर्शन करें', icon: '🧭', action: 'general_help', description: 'मुझे मार्गदर्शन दें' },
          { type: 'action', label: '📚 📚 टेम्पलेट ब्राउज़ करें', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'उपलब्ध टेम्पलेट देखें' },
        ] : [
          { type: 'action', label: '📄 📄 Create Document', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'Generate a legal document' },
          { type: 'action', label: '🧭 🧭 Guide Me', icon: '🧭', action: 'general_help', description: 'Get guidance' },
          { type: 'action', label: '📚 📚 Browse Templates', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'View available templates' },
        ],
        mode: 'draft_cancelled'
      };

      setMessages(prev => [...prev, mainMenuMessage]);
      setIsFieldsModalOpen(false);
      return;
    }

    // User closed with X button (not cancelled)
    // Check if there's partial data AND we're NOT in edit mode
    const hasAnyData = partialValues && Object.values(partialValues).some(v => v && String(v).trim() !== '');

    if (hasAnyData && !isEditingDocument && fieldsModalData) {
      console.log('💾 [handleFieldsFormClose] Saving partial data for recovery (initial fill)');

      // Save partial form data
      setPartialFormData({
        templatePath: fieldsModalData.templatePath,
        templateTitle: fieldsModalData.templateTitle,
        fields: fieldsModalData.fields,
        partialValues: partialValues
      });
      setFormClosedWithoutSubmit(true);

      // Update the LAST assistant message (template selection message) to add Resume Form button
      setMessages(prev => {
        const lastIndex = prev.length - 1;
        const lastMsg = prev[lastIndex];

        // Only update if it's an assistant message and doesn't already have RESUME_FORM action
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.suggestedActions) {
          const hasResumeAction = lastMsg.suggestedActions.some(a => a.action === 'RESUME_FORM');

          if (!hasResumeAction) {
            const resumeAction = language === 'hi' ? {
              type: 'action',
              label: 'फॉर्म फिर से खोलें',
              icon: '📝',
              action: 'RESUME_FORM',
              description: 'अधूरा फॉर्म फिर से खोलें'
            } : {
              type: 'action',
              label: 'Resume Form',
              icon: '📝',
              action: 'RESUME_FORM',
              description: 'Reopen the partially filled form'
            };

            const updatedMsg = {
              ...lastMsg,
              suggestedActions: [...lastMsg.suggestedActions, resumeAction]
            };

            return [...prev.slice(0, lastIndex), updatedMsg];
          }
        }

        return prev;
      });
    } else {
      console.log('🚪 [handleFieldsFormClose] No partial data or edit mode - just closing');
    }

    // Always close the modal
    setIsFieldsModalOpen(false);
  };

  // Called after user picks a design (or skips) in TemplateDesignSelector
  const handleDesignSelected = async (design) => {
    console.log('🔍 [TRACE] handleDesignSelected called with design:', design?.name || 'no design');

    // 🔍 GUARD: Prevent duplicate generation
    if (isGenerating) {
      console.warn('⚠️  [BLOCK] Generation already in progress, blocking handleDesignSelected');
      return;
    }

    setIsGenerating(true);
    console.log('✅ [SET] isGenerating = true (in handleDesignSelected)');

    setIsDesignSelectorOpen(false);
    const designConfig = design?.config || null;
    setSelectedDesignConfig(designConfig);

    const pending = pendingFormGeneration;
    console.log('📋 [STATE] pendingFormGeneration before clear:', pending?.type, pending?.data?.templateTitle);

    setPendingFormGeneration(null); // Clear BEFORE execution to prevent re-triggers

    try {
      if (!pending) {
        console.warn('⚠️  [ERROR] No pending generation data found in handleDesignSelected');
        return;
      }

      console.log('🎨 [EXEC] Design selected - calling executor:', {
        designName: design?.name,
        type: pending.type,
        hasDesignConfig: !!designConfig,
        fontFamily: designConfig?.fontFamily
      });

      if (pending.type === 'form') {
        console.log('📝 [CALL] Calling executeFormGeneration with designConfig');
        await executeFormGeneration(pending.data, designConfig);
      } else if (pending.type === 'complaint') {
        console.log('⚖️  [CALL] Calling executeComplaintGeneration with designConfig');
        await executeComplaintGeneration(pending.data, designConfig);
      }
    } catch (error) {
      console.error('❌ [ERROR] Error during generation:', error);
    } finally {
      setIsGenerating(false); // 🔓 Unlock generation
      console.log('🔓 [SET] isGenerating = false (in handleDesignSelected finally)');
    }
  };

  // Handle design selector close/skip (generate without custom design)
  // 🔴 IMPORTANT: This should ONLY be called when user explicitly clicks "Skip"
  const handleDesignSelectorSkip = () => {
    console.log('🔍 [TRACE] handleDesignSelectorSkip called - user wants to skip design selection');

    // 🔍 GUARD: Prevent duplicate generation
    if (isGenerating) {
      console.warn('⚠️  [BLOCK] Generation already in progress, blocking handleDesignSelectorSkip');
      return;
    }

    // 🔴 CRITICAL: Check if there's actually pending data before generating!
    if (!pendingFormGeneration) {
      console.log('ℹ️  [SKIP] No pending generation data, just closing design selector');
      setIsDesignSelectorOpen(false);
      return;
    }

    setIsGenerating(true);
    console.log('✅ [SET] isGenerating = true (in handleDesignSelectorSkip)');

    setIsDesignSelectorOpen(false);
    const pending = pendingFormGeneration;
    console.log('📋 [STATE] pendingFormGeneration before clear:', pending?.type, pending?.data?.templateTitle);

    setPendingFormGeneration(null); // Clear BEFORE execution

    try {
      console.log('⏭️  [EXEC] Skipping design selection - generating with defaults (NO designConfig)');

      // Generate without custom design
      if (pending.type === 'form') {
        console.log('📝 [CALL] Calling executeFormGeneration WITHOUT designConfig (from skip action)');
        executeFormGeneration(pending.data, null);
      } else if (pending.type === 'complaint') {
        console.log('⚖️  [CALL] Calling executeComplaintGeneration WITHOUT designConfig (from skip action)');
        executeComplaintGeneration(pending.data, null);
      }
    } catch (error) {
      console.error('❌ [ERROR] Error during generation:', error);
    } finally {
      setIsGenerating(false); // 🔓 Unlock generation
      console.log('🔓 [SET] isGenerating = false (in handleDesignSelectorSkip finally)');
    }
  };

  // Handle design selector just closing (X button, Escape) - NO generation
  const handleDesignSelectorClose = () => {
    console.log('🔍 [TRACE] handleDesignSelectorClose called (modal X or Escape - NOT generating)');
    setIsDesignSelectorOpen(false);
    // 🔴 IMPORTANT: Do NOT generate here! Only close the modal.
    // If user clicks Skip button, that explicitly calls handleDesignSelectorSkip
  };

  // Actual form-based document generation (called after design selection)
  const executeFormGeneration = async (formData, designConfig) => {
    const { templatePath, templateTitle, fieldValues } = formData;

    console.log('🚀 executeFormGeneration start:', {
      template: templateTitle,
      fieldsCount: Object.keys(fieldValues || {}).length,
      designConfigProvided: !!designConfig,
      designConfigFontFamily: designConfig?.fontFamily || 'NOT PROVIDED'
    });

    try {
      // Generate document from form fields
      const result = await draftService.generateFromForm(
        templatePath,
        fieldValues,
        language,
        token,
        designConfig
      );

      setLastGeneratedTemplate({
        path: templatePath,
        title: templateTitle
      });
      setFieldsModalData(null);

      const postDownloadActions = language === 'hi' ? [
        { type: 'action', label: 'संपादित करें', icon: '✏️', action: 'EDIT_DOCUMENT', description: 'दस्तावेज़ संपादित करें' },
        { type: 'action', label: 'बाहर निकलें', icon: '✖️', action: 'EXIT_DOCUMENT_MODE', description: 'दस्तावेज़ मोड से बाहर निकलें' },
        { type: 'rating', label: 'आपका अनुभव कैसा रहा?', icon: '⭐', action: 'RATE_EXPERIENCE', description: 'अपना अनुभव रेट करें' }
      ] : [
        { type: 'action', label: 'Edit Document', icon: '✏️', action: 'EDIT_DOCUMENT', description: 'Edit the generated document' },
        { type: 'action', label: 'Exit', icon: '✖️', action: 'EXIT_DOCUMENT_MODE', description: 'Exit document mode' },
        { type: 'rating', label: 'Rate your experience', icon: '⭐', action: 'RATE_EXPERIENCE', description: 'How was the draft process?' }
      ];

      const assistantMessage = {
        role: 'assistant',
        content: result.message,
        file: result.file ? {
          fileUrl: result.file.url,
          fileName: result.file.name,
          fileType: result.file.type,
          fileSize: result.file.size || 0,
          isEdited: isEditingDocument
        } : null,
        document: result.document,
        mode: 'document_ready',
        suggestedActions: postDownloadActions
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsEditingDocument(false);

      toast({
        title: language === 'hi' ? 'दस्तावेज़ तैयार!' : 'Document Ready!',
        description: language === 'hi' ? 'आपका दस्तावेज़ सफलतापूर्वक बनाया गया है' : 'Your document has been generated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Form generation error:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: error.response?.data?.message || (language === 'hi' ? 'दस्तावेज़ बनाने में विफल' : 'Failed to generate document'),
        status: 'error',
        duration: 4000,
      });
    }
  };

  // Handle closing the fields modal
  // Old handleFieldsModalClose removed - replaced by handleFieldsFormClose

  // 🎯 COMPLAINT FORM SUBMISSION HANDLER
  // Intercepts to show design selector before generating
  const handleComplaintFormSubmit = async (complaintData) => {
    console.log('📝 Submitting complaint form:', complaintData);

    setIsComplaintFormOpen(false);

    // Show design selector with complaint category
    setPendingFormGeneration({
      type: 'complaint',
      data: complaintData,
      category: 'Criminal Pleadings Drafts',
    });
    setIsDesignSelectorOpen(true);
  };

  // Actual complaint generation (called after design selection)
  const executeComplaintGeneration = async (complaintData, designConfig) => {
    try {
      setIsLoading(true);

      disableOldButtons();

      // Add user message showing what they're requesting
      const userMsg = language === 'hi'
        ? `${complaintData.complaintType} के लिए शिकायत बनाएं: ${complaintData.againstWhom}`
        : `Generate ${complaintData.complaintType} complaint against ${complaintData.againstWhom}`;

      setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

      // Call backend to generate complaint (with design config)
      const response = await axios.post(`${BASE_URL}/chat/generate-complaint`, {
        complaintData,
        actionContext: complaintContext,
        designConfig
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.success) {
        const postDownloadActions = response.data.suggestedActions || (language === 'hi' ? [
          { type: 'action', label: 'शिकायत संपादित करें', icon: '✏️', action: 'EDIT_DOCUMENT', description: 'मौजूदा शिकायत को संपादित करें' },
          { type: 'action', label: 'बाहर निकलें', icon: '✖️', action: 'EXIT_DOCUMENT_MODE', description: 'दस्तावेज़ मोड से बाहर निकलें' },
          { type: 'rating', label: 'आपका अनुभव कैसा रहा?', icon: '⭐', action: 'RATE_EXPERIENCE', description: 'अपना अनुभव रेट करें' }
        ] : [
          { type: 'action', label: 'Edit Document', icon: '✏️', action: 'EDIT_DOCUMENT', description: 'Edit the generated complaint' },
          { type: 'action', label: 'Exit', icon: '✖️', action: 'EXIT_DOCUMENT_MODE', description: 'Exit document mode' },
          { type: 'rating', label: 'Rate your experience', icon: '⭐', action: 'RATE_EXPERIENCE', description: 'How was the complaint process?' }
        ]);

        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          file: response.data.file ? {
            fileUrl: response.data.file.fileUrl,
            fileName: response.data.file.fileName,
            fileType: response.data.file.fileType,
            fileSize: response.data.file.fileSize || 0
          } : null,
          document: response.data.document,
          mode: 'document_ready',
          suggestedActions: postDownloadActions
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (response.data.complaintData) {
          setLastGeneratedComplaint({
            data: response.data.complaintData,
            content: response.data.document?.fullContent || '',
            timestamp: Date.now()
          });
        }

        if (response.data.remainingMessages !== null) {
          setRemainingMessages(response.data.remainingMessages);
        }
        setSubscriptionStatus(response.data.subscriptionStatus);

        toast({
          title: language === 'hi' ? '✅ शिकायत तैयार!' : '✅ Complaint Ready!',
          description: language === 'hi' ? 'आपकी शिकायत सफलतापूर्वक बनाई गई है' : 'Your complaint has been generated successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Complaint generation failed:', error);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'hi'
          ? 'शिकायत बनाने में त्रुटि। कृपया पुनः प्रयास करें।'
          : 'Error generating complaint. Please try again.'
      }]);

      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: error.response?.data?.message || (language === 'hi' ? 'शिकायत बनाने में विफल' : 'Failed to generate complaint'),
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
      setComplaintContext(null);
    }
  };

  // Handle closing the complaint form modal
  const handleComplaintFormClose = (isCancelled = false) => {
    console.log('🚪 [handleComplaintFormClose] Called', { isCancelled });

    setIsComplaintFormOpen(false);
    setComplaintContext(null);

    if (isCancelled) {
      // User explicitly cancelled - return to main menu
      console.log('🔴 [handleComplaintFormClose] User cancelled complaint process - showing main menu');

      // Clear complaint state
      setLastGeneratedComplaint(null);

      // Show main menu message
      const mainMenuMessage = {
        role: 'assistant',
        content: language === 'hi'
          ? 'आपने शिकायत प्रक्रिया रद्द कर दी है। मैं आपकी कैसे मदद कर सकता हूं?'
          : 'You cancelled the complaint process. How can I help you?',
        suggestedActions: language === 'hi' ? [
          { type: 'action', label: '📄 📄 दस्तावेज़ बनाएं', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'कानूनी दस्तावेज़ बनाएं' },
          { type: 'action', label: '🧭 🧭 मार्गदर्शन करें', icon: '🧭', action: 'general_help', description: 'मुझे मार्गदर्शन दें' },
          { type: 'action', label: '📚 📚 टेम्पलेट ब्राउज़ करें', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'उपलब्ध टेम्पलेट देखें' },
        ] : [
          { type: 'action', label: '📄 📄 Create Document', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'Generate a legal document' },
          { type: 'action', label: '🧭 🧭 Guide Me', icon: '🧭', action: 'general_help', description: 'Get guidance' },
          { type: 'action', label: '📚 📚 Browse Templates', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'View available templates' },
        ],
        mode: 'complaint_cancelled'
      };

      setMessages(prev => [...prev, mainMenuMessage]);
    }
    // If not cancelled, just close silently (don't add any message)
  };

  // Handle template selection from TemplateBrowser
  const handleTemplateSelect = async (template) => {
    console.log('📋 [handleTemplateSelect] Template selected:', template.relPath);
    setIsTemplateBrowserOpen(false);

    // Disable old buttons before adding new message
    disableOldButtons();

    // Add user message about template selection
    const userMsg = language === 'hi'
      ? `मैंने "${template.displayTitle}" टेम्पलेट चुना`
      : `I selected the "${template.displayTitle}" template`;

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIntentOverride('DOCUMENT_REQUEST');

    try {
      setIsLoading(true);

      console.log('📋 [handleTemplateSelect] Fetching schema and opening fields modal...');

      try {
        // Primary path: fetch schema from backend
        await openFieldsModalWithSchema({
          templatePath: template.relPath,
          templateTitle: template.displayTitle,
          missingFields: null
        });
        console.log('✅ [handleTemplateSelect] Fields modal opened via schema');
      } catch (schemaError) {
        console.warn('⚠️ [handleTemplateSelect] Schema API failed, using template.fields fallback:', schemaError.message);

        // Fallback: use the fields already bundled in the template object from the browser
        const fallbackFields = (template.fields || []).map(f => ({
          key: f.key || f,
          label: f.label || f.key || f,
          type: f.type || 'text',
          required: f.required !== false,
          example: f.example || '',
          description: f.description || ''
        }));

        if (fallbackFields.length > 0) {
          // Open modal with the fields we already have
          setFieldsModalData({
            templatePath: template.relPath,
            templateTitle: template.displayTitle,
            fields: fallbackFields,
            initialValues: {}
          });
          setIsFieldsModalOpen(true);
          setFormClosedWithoutSubmit(false);
          console.log('✅ [handleTemplateSelect] Fields modal opened via fallback fields');
        } else {
          // No fields available at all — show a helpful assistant message
          toast({
            title: language === 'hi' ? 'स्कीमा लोड नहीं हुई' : 'Schema Unavailable',
            description: language === 'hi'
              ? 'टेम्पलेट फ़ील्ड लोड नहीं हो सके। कृपया पुनः प्रयास करें।'
              : 'Template fields could not be loaded. Please try again.',
            status: 'warning',
            duration: 4000,
            isClosable: true,
          });
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: language === 'hi'
              ? `"${template.displayTitle}" के लिए फ़ील्ड उपलब्ध नहीं हैं। कृपया बताएं कि आपको क्या जानकारी देनी है।`
              : `Fields for "${template.displayTitle}" could not be loaded. Please describe what information you'd like to provide.`
          }]);
        }
      }

    } catch (error) {
      console.error('❌ [handleTemplateSelect] Unexpected error:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: error.response?.data?.message || error.message || (language === 'hi' ? 'टेम्पलेट लोड करने में विफल' : 'Failed to load template'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 POST-DOWNLOAD OPTIONS HANDLERS

  // Generate the same document type again
  const handleGenerateSameAgain = async () => {
    setShowPostDownloadOptions(false);

    if (!lastGeneratedTemplate?.path) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'टेम्पलेट जानकारी उपलब्ध नहीं' : 'Template information not available',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Fetch schema and open modal again
    try {
      const schemaData = await draftService.getTemplateSchema(lastGeneratedTemplate.path, token);
      setFieldsModalData({
        templatePath: lastGeneratedTemplate.path,
        templateTitle: lastGeneratedTemplate.title || schemaData.displayTitle,
        fields: schemaData.fields
      });
      setIsFieldsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch template schema:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'टेम्पलेट लोड करने में विफल' : 'Failed to load template',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Switch to generating a different document
  const handleGenerateDifferent = () => {
    setShowPostDownloadOptions(false);
    setLastGeneratedTemplate(null);
    // Keep intentOverride as DOCUMENT_REQUEST but add prompt
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: language === 'hi'
        ? '📝 कोई बात नहीं! कृपया बताएं कि आप कौन सा दस्तावेज़ बनाना चाहते हैं।'
        : '📝 Sure! Please tell me what document you would like to generate.'
    }]);
  };

  // Exit document mode and return to auto-detect
  const handleExitDocumentMode = () => {
    setShowPostDownloadOptions(false);
    setLastGeneratedTemplate(null);
    setIntentOverride(null);
    setIntentLabel(null);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: language === 'hi'
        ? '🤖 ठीक है! अब मैं स्वचालित मोड में हूँ। आप मुझसे कुछ भी पूछ सकते हैं - कानूनी सवाल, दस्तावेज़, केस खोज, या कुछ और!'
        : '🤖 Got it! I\'m now in auto-detect mode. You can ask me anything - legal questions, documents, case search, or anything else!'
    }]);

    toast({
      title: language === 'hi' ? 'मोड बदला गया' : 'Mode Changed',
      description: language === 'hi' ? 'AI अब स्वचालित रूप से आपके इरादे का पता लगाएगा' : 'AI will now auto-detect your intent',
      status: 'info',
      duration: 2000,
    });
  };

  // Hard reset - clears everything and returns to auto-detect (can be called from UI button)
  const handleHardReset = async () => {
    // Clear backend document session and pending states
    try {
      await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      console.log('✅ Backend session cleared');
    } catch (error) {
      console.warn('Failed to clear backend session:', error);
    }

    // Clear frontend state
    setShowPostDownloadOptions(false);
    setLastGeneratedTemplate(null);
    setIntentOverride(null);
    setIntentLabel(null);
    setFieldsModalData(null);
    setIsFieldsModalOpen(false);

    toast({
      title: language === 'hi' ? '🔄 रीसेट किया गया' : '🔄 Reset Complete',
      description: language === 'hi' ? 'सभी सत्र साफ़ हो गए। AI स्वचालित मोड में है।' : 'All sessions cleared. AI is back in auto-detect mode.',
      status: 'success',
      duration: 2000,
    });
  };

  // Handle document type selection from DocumentTypeSelector modal
  const handleDocumentTypeSelected = async (documentType, category) => {
    console.log('📄 Document type selected:', documentType, category);

    // Close the modal immediately after selection
    setIsDocTypeSelectorOpen(false);

    // Mark all previous messages' action buttons as inactive (new response coming)
    disableOldButtons();

    const userMsg = language === 'hi'
      ? `मुझे ${documentType} बनाना है`
      : `I want to create a ${documentType}`;

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}/chat/message`,
        { message: userMsg, language, intentOverride: 'DOCUMENT_REQUEST', sourceAction: 'CREATE_DOCUMENT', documentType: documentType },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.data) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.response,
          suggestedActions: response.data.suggestedActions || []
        }]);

        // Open fields modal if needed
        if (response.data.missingFields && response.data.missingFields.length > 0 && response.data.templatePath) {
          await openFieldsModalWithSchema({
            templatePath: response.data.templatePath,
            templateTitle: response.data.templateTitle || documentType,
            missingFields: response.data.missingFields
          });
        }
      }
    } catch (error) {
      console.error('Document creation failed:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: error.response?.data?.message || (language === 'hi' ? 'कुछ गलत हुआ' : 'Something went wrong'),
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle legal guidance completion from LegalGuidanceModal
  const handleGuidanceComplete = async (situation, category, details) => {
    console.log('🧭 Guidance complete:', situation, category, details);

    // Mark all previous messages' action buttons as inactive (new response coming)
    disableOldButtons();

    setMessages(prev => [...prev, { role: 'user', content: situation }]);

    try {
      setIsLoading(true);
      // Send as DOCUMENT_REQUEST so backend searches for matching templates
      const response = await axios.post(`${BASE_URL}/chat/message`,
        {
          message: situation,
          language,
          intentOverride: 'DOCUMENT_REQUEST',
          sourceAction: 'GUIDE_ME',  // Track that this came from Guide Me flow
          guidanceContext: {
            mainCategory: category,
            subCategory: details.subCategory,
            urgency: details.urgency,
            parties: details.parties,
            situation: details.situation
          }
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.data) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.response,
          suggestedActions: response.data.suggestedActions || []
        }]);
      }
    } catch (error) {
      console.error('Guidance request failed:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: error.response?.data?.message || (language === 'hi' ? 'कुछ गलत हुआ' : 'Something went wrong'),
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── FILE SESSION MANAGEMENT ───────────────────────────────────────────────
  //
  // startNewFileSession(file, toolName)
  //   Called when a tool (Deep Research, Chronology, Parallel Review) is triggered.
  //   - If the file is NEW compared to the last session → reset messages and add a session header.
  //   - If it's the SAME file as the last session → do nothing (continue in same conversation).
  //
  const startNewFileSession = (file, toolName) => {
    if (!file?._id) return;

    const isSameFile = lastToolSessionFileId.current === file._id;

    if (isSameFile) {
      // Same file as last tool session → just add a divider so the user can see the tool changed
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `🔄 **${toolName}** started using the same file. Continuing in this session.`,
          isSessionDivider: true,
        }
      ]);
      return;
    }

    // New file (or first tool ever) → reset chat and start fresh session
    lastToolSessionFileId.current = file._id;

    const fileName = file.fileName || file.originalName || file.name || 'Uploaded file';
    const headerMessage = {
      role: 'assistant',
      content: `📁 **New Session Started**\n\n**File:** ${fileName}\n**Tool:** ${toolName}\n\n---\nAll messages in this session are scoped to the above file.`,
      isSessionHeader: true,
    };

    // Clear previous messages and start with the session header
    setMessages([headerMessage]);
  };
  // ─────────────────────────────────────────────────────────────────────────────

  // Deep Research functions
  const stopResearchPolling = () => {
    if (researchPollRef.current) {
      clearInterval(researchPollRef.current);
      researchPollRef.current = null;
    }
    if (researchTimerRef.current) {
      clearInterval(researchTimerRef.current);
      researchTimerRef.current = null;
    }
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
                content: `I have completed the deep research on your document! You can view the full report in the right panel.\n\nHere are some follow-up questions you can ask me:\n1. ${followUpQuestions[0]}\n2. ${followUpQuestions[1]}\n3. ${followUpQuestions[2]}`
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

    // Always start Deep Research in a new chat session (Gemini style)
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

  useEffect(() => {
    const savedSessionId = localStorage.getItem('deepResearchSessionId');
    if (savedSessionId && researchStatus === 'idle') {
      researchService.getResearchResults(savedSessionId).then(result => {
        setResearchResults(result);
        setResearchSessionId(savedSessionId);
        if (['completed', 'completed_with_errors'].includes(result.status)) {
          setResearchStatus(result.status);
        } else if (result.status === 'processing' || result.status === 'pending') {
          setResearchStatus('processing');
          setIsReportPanelOpen(true);
          pollResearchStatus(savedSessionId);
        } else {
          localStorage.removeItem('deepResearchSessionId');
        }
      }).catch(() => {
        localStorage.removeItem('deepResearchSessionId');
      });
    }
    return () => stopResearchPolling();
  }, []);

  // Chronology Functions
  const stopChronologyPolling = () => {
    if (chronologyPollRef.current) {
      clearInterval(chronologyPollRef.current);
      chronologyPollRef.current = null;
    }
    if (chronologyTimerRef.current) {
      clearInterval(chronologyTimerRef.current);
      chronologyTimerRef.current = null;
    }
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
              { role: 'assistant', content: introLine, isChronologySummary: true }
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

    // 🆕 File session management — use first file in list as the session key
    // For chronology with multiple files, we use the first file as the "anchor"
    const firstFile = chronologyFiles[0]?.file;
    if (firstFile) {
      startNewFileSession(firstFile, 'Time Chronology');
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

  useEffect(() => {
    const savedSessionId = localStorage.getItem('chronologySessionId');
    if (savedSessionId && chronologyStatus === 'idle') {
      chronologyService.getChronologyResults(savedSessionId).then(result => {
        setChronologyResults(result);
        setChronologySessionId(savedSessionId);
        if (['completed', 'completed_with_errors'].includes(result.status)) {
          setChronologyStatus(result.status);
        } else if (result.status === 'processing' || result.status === 'pending') {
          setChronologyStatus('processing');
          setIsTimelinePanelOpen(true);
          pollChronologyStatus(savedSessionId);
        } else {
          localStorage.removeItem('chronologySessionId');
        }
      }).catch(() => {
        localStorage.removeItem('chronologySessionId');
      });
    }
    return () => stopChronologyPolling();
  }, []);

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

    // 🆕 File session management — use the first review file as the session anchor
    // For bulk review, any new set of files means a new session
    const firstReviewFile = reviewFiles[0]?.file;
    if (firstReviewFile) {
      startNewFileSession(firstReviewFile, 'Parallel Review');
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

  useEffect(() => {
    if (bulkReviewSessionId && reviewStatus === 'processing') {
      pollBulkReviewResults(bulkReviewSessionId);
      if (!bulkReviewTimerRef.current) {
        bulkReviewTimerRef.current = setInterval(() => {
          setBulkReviewElapsed(prev => prev + 1);
        }, 1000);
      }
    }
    return () => {
      if (bulkReviewPollRef.current) clearInterval(bulkReviewPollRef.current);
      if (bulkReviewTimerRef.current) clearInterval(bulkReviewTimerRef.current);
    };
  }, [bulkReviewSessionId, reviewStatus]);

  // Drafting Precedence & Counter Maker functions
  const stopPrecedencePolling = () => {
    if (precedencePollRef.current) {
      clearInterval(precedencePollRef.current);
      precedencePollRef.current = null;
    }
  };

  const pollPrecedenceStatus = async (sessionId) => {
    try {
      const data = await precedenceService.getResults(sessionId);
      setPrecedenceStatus(data.status);
      if (data.status === 'completed') {
        stopPrecedencePolling();
        setPrecedenceResults(data.report);
        toast({
          title: 'Precedence Analysis Complete',
          description: 'The analysis report is ready on the right panel.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else if (data.status === 'failed') {
        stopPrecedencePolling();
        toast({
          title: 'Analysis Failed',
          description: data.error || 'Failed to analyze precedents.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error polling precedence:', error);
    }
  };

  const startPrecedenceAnalysis = async (fileId) => {
    try {
      setPrecedenceStatus('starting');
      setIsPrecedencePanelOpen(true);
      const data = await precedenceService.startAnalysis(fileId);
      setPrecedenceSessionId(data.sessionId);
      setPrecedenceStatus(data.status);
      stopPrecedencePolling();
      precedencePollRef.current = setInterval(() => pollPrecedenceStatus(data.sessionId), 3000);
    } catch (error) {
      console.error('Error starting precedence analysis:', error);
      setPrecedenceStatus('failed');
    }
  };

  const stopCounterMakerPolling = () => {
    if (counterMakerPollRef.current) {
      clearInterval(counterMakerPollRef.current);
      counterMakerPollRef.current = null;
    }
  };

  const pollCounterMakerStatus = async (sessionId) => {
    try {
      const data = await counterMakerService.getResults(sessionId);
      setCounterMakerStatus(data.status);
      if (data.status === 'completed') {
        stopCounterMakerPolling();
        setCounterMakerResults(data.draft);
        toast({
          title: 'Counter Affidavit Ready',
          description: 'The draft is ready for review on the right panel.',
          status: 'success',
          duration: 5000,
          isClosable: true,
         });
      } else if (data.status === 'failed') {
        stopCounterMakerPolling();
        toast({
          title: 'Drafting Failed',
          description: data.error || 'Failed to draft counter affidavit.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error polling counter maker:', error);
    }
  };

  const startCounterMaker = async (fileId, userFacts) => {
    try {
      setCounterMakerStatus('starting');
      setIsCounterMakerPanelOpen(true);
      const data = await counterMakerService.startAnalysis(fileId, userFacts || counterMakerFacts);
      setCounterMakerSessionId(data.sessionId);
      setCounterMakerStatus(data.status);
      stopCounterMakerPolling();
      counterMakerPollRef.current = setInterval(() => pollCounterMakerStatus(data.sessionId), 3000);
    } catch (error) {
      console.error('Error starting Counter Maker:', error);
      setCounterMakerStatus('failed');
    }
  };

  const extractCounterFacts = async (fileId) => {
    try {
      setIsLoading(true);
      setCounterMakerFileId(fileId);
      setCounterMakerStatus('processing');
      const data = await counterMakerService.extractFacts(fileId);
      setCounterMakerStatus('completed');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I have analyzed the document and extracted the following key allegations:\n\n${data.facts}\n\nPlease provide your counter-points or defenses for these allegations so I can draft the Counter Affidavit.`
      }]);
      setIntentOverride('COUNTER_MAKER_COLLECT_FACTS');
    } catch (error) {
      console.error('Error extracting counter facts:', error);
      setCounterMakerStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopPrecedencePolling();
      stopCounterMakerPolling();
    };
  }, []);

  // Multi-file upload uploaders
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

    // Check file type - comprehensive support
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    const allowedExtensions = ['.pdf', '.txt', '.md', '.csv', '.json', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      toast({
        title: 'Invalid file type',
        description: 'Supported: PDF, Word, Excel, Text, Markdown, CSV, JSON, Images',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      const response = await fileService.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      setSelectedFile(response.file);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);

      // Generate a new file session ID for this upload.
      // The actual session reset happens when a tool is triggered (not on upload itself).
      const newFileSessionId = crypto.randomUUID();
      setFileSessionId(newFileSessionId);

      // Auto-trigger drafting tools or deep research if active
      if (activeDraftingTool === 'precedence') {
        startPrecedenceAnalysis(response.file._id);
      } else if (activeDraftingTool === 'counter_maker') {
        extractCounterFacts(response.file._id);
      } else if (activeTab === 'research') {
        handleStartDeepResearch(response.file);
      }

      // Update remaining messages count and subscription status
      if (response.remainingMessages !== null) {
        setRemainingMessages(response.remainingMessages);
      }
      setSubscriptionStatus(response.subscriptionStatus);

      // After upload — reset scanner state, show upload success
      setScanStatus('none');
      setScanResults(null);
      setFormatMetadata(null);
      setSmartSuggestions([]);
      setHtmlContent('');

      toast({
        title: language === 'hi' ? 'फ़ाइल अपलोड हो गई' : 'File uploaded',
        description: language === 'hi'
          ? 'फ़ाइल अपलोड हो गई। स्कैन या एडिट करने के लिए हेडर बटन उपयोग करें।'
          : 'Use the Smart Scanner or Edit Document buttons in the header.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('File upload error:', err);

      // Detailed error message
      let errorMessage = 'Failed to upload file';

      if (err.response?.status === 403) {
        if (err.response?.data?.message?.includes('No remaining messages')) {
          errorMessage = 'You have no remaining messages. Please upgrade to premium for unlimited access.';
        } else if (err.response?.data?.message?.includes('CSRF')) {
          errorMessage = 'Security token expired. Please refresh the page and try again.';
        } else {
          errorMessage = err.response?.data?.message || 'Access denied. Please login again.';
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast({
        title: 'Upload Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleFileAnalysis = async (fileId) => {
    try {
      setAnalyzingFile(true);
      // B) Pass intent to analysis for context-aware prompts
      const response = await fileService.analyzeFile(fileId, null, intentOverride);

      // Build user message based on intent
      let userMessage = `Analyze this file: ${response.fileName}`;
      if (intentOverride === 'legal') {
        userMessage = `📜 Legal Analysis: ${response.fileName}`;
      } else if (intentOverride === 'draft') {
        userMessage = `📝 Extract draft info from: ${response.fileName}`;
      }

      // Add messages to chat
      setMessages(prev => [
        ...prev,
        {
          type: 'user',
          content: userMessage,
          timestamp: new Date()
        },
        {
          type: 'ai',
          content: response.analysis,
          timestamp: new Date()
        }
      ]);

      // Update remaining messages count
      if (response.remainingMessages !== null) {
        setRemainingMessages(response.remainingMessages);
      }

      // Update subscription status
      setSubscriptionStatus(response.subscriptionStatus);

    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message?.includes('No remaining messages')) {
        toast({
          title: 'Message Limit Reached',
          description: 'You have no remaining messages. Please upgrade to premium for unlimited access.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top'
        });
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to analyze file',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top'
        });
      }
    } finally {
      setAnalyzingFile(false);
    }
  };

  // ========== DOCUMENT EDIT MODE HANDLERS ==========

  // Start edit mode for the uploaded document
  const handleStartEditMode = async () => {
    if (!selectedFile || !selectedFile._id) {
      toast({
        title: 'No file uploaded',
        description: 'Please upload a document first to edit it.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Start edit session on backend
      const response = await fileService.startEditSession(selectedFile._id);

      setIsEditMode(true);
      setEditSessionActive(true);
      setEditChangesCount(0);
      setIntentOverride('EDIT_DOCUMENT');
      setIntentLabel('Edit Document');

      // Store the session data for document viewer
      if (response.session) {
        setEditSession(response.session);
      }

      // Store document analysis if available
      if (response.documentAnalysis) {
        setDocumentAnalysis(response.documentAnalysis);
      }

      // Build analysis info string
      let analysisInfo = '';
      if (response.documentAnalysis) {
        const da = response.documentAnalysis;
        analysisInfo = `\n\n📊 **Document Analysis:**\n`;
        analysisInfo += `→ Type: ${da.type?.replace(/_/g, ' ').toUpperCase() || 'General'}\n`;
        analysisInfo += `→ Sections: ${da.sectionCount || 0} | Clauses: ${da.clauseCount || 0}\n`;

        if (da.risks && da.risks.length > 0) {
          analysisInfo += `\n⚠️ **Risks Detected:**\n`;
          da.risks.slice(0, 3).forEach(r => {
            analysisInfo += `→ ${r.message}\n`;
          });
        }

        if (da.suggestions && da.suggestions.length > 0) {
          analysisInfo += `\n💡 **Suggestions:**\n`;
          da.suggestions.slice(0, 3).forEach(s => {
            analysisInfo += `→ ${s.message}\n`;
          });
        }
      }

      // Add system message explaining edit mode
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `✏️ **Edit Mode Active**\n\nYou can now edit "${selectedFile.fileName || selectedFile.originalName}". Simply describe the changes you want:\n\n→ "Replace all instances of 'John' with 'Jane'"\n→ "Add a new paragraph about..."\n→ "Remove the section about..."\n→ "Change the date to..."${analysisInfo}\n\n📥 When done, click **Download DOCX** or **Download PDF** to export.`
        }
      ]);

      toast({
        title: 'Edit Mode Started',
        description: `Document analyzed: ${response.documentAnalysis?.sectionCount || 0} sections, ${response.documentAnalysis?.clauseCount || 0} clauses`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to start edit session:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start edit session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Smart Scanner - scan uploaded file for formatting + AI analysis
  const handleSmartScan = async () => {
    if (!selectedFile || !selectedFile._id) {
      toast({
        title: language === 'hi' ? 'कोई फ़ाइल नहीं' : 'No file uploaded',
        description: language === 'hi' ? 'पहले एक दस्तावेज़ अपलोड करें' : 'Upload a document first to scan it.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setScanStatus('scanning');
    toast({
      title: language === 'hi' ? 'स्कैन हो रहा है...' : 'Scanning document...',
      description: language === 'hi' ? 'AI डॉक्यूमेंट का विश्लेषण कर रहा है' : 'AI is analyzing formatting, structure, and legal content.',
      status: 'info',
      duration: 5000,
    });

    try {
      const result = await fileService.smartScan(selectedFile._id);
      setScanStatus('scanned');
      setScanResults(result.scanResults || null);
      setFormatMetadata(result.formatMetadata || null);
      setSmartSuggestions(result.smartSuggestions || result.suggestions || []);
      setHtmlContent(result.htmlContent || '');

      // If we have an edit session, update it with scan data
      if (result.session) {
        setEditSession(result.session);
        setEditSessionActive(true);
      }

      // Open scan report popup instead of adding message to chat
      setIsScanReportOpen(true);

    } catch (error) {
      setScanStatus('failed');
      console.error('Smart scan failed:', error);
      toast({
        title: language === 'hi' ? 'स्कैन विफल' : 'Scan Failed',
        description: error.message || 'Something went wrong during scan.',
        status: 'error',
        duration: 4000,
      });
    }
  };

  // Open the full editor (with scan data if available)
  const handleOpenEditor = async () => {
    if (!selectedFile || !selectedFile._id) {
      toast({
        title: language === 'hi' ? 'कोई फ़ाइल नहीं' : 'No file uploaded',
        description: language === 'hi' ? 'पहले एक दस्तावेज़ अपलोड करें' : 'Upload a document first.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Require scan before edit
    if (scanStatus !== 'scanned') {
      toast({
        title: language === 'hi' ? 'पहले स्कैन करें' : 'Scan Required',
        description: language === 'hi'
          ? 'दस्तावेज़ संपादित करने से पहले स्मार्ट स्कैन चलाएं।'
          : 'Please run Smart Scan on the document before editing. Click the Scan button first.',
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Start edit session if not already active
    if (!editSessionActive) {
      try {
        const editResponse = await fileService.startEditSession(selectedFile._id);
        setEditSessionActive(true);
        setIsEditMode(true);
        if (editResponse.session) setEditSession(editResponse.session);
        if (editResponse.documentAnalysis) setDocumentAnalysis(editResponse.documentAnalysis);
      } catch (err) {
        console.error('Failed to start edit session:', err);
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Failed to start edit session',
          status: 'error',
          duration: 3000,
        });
        return;
      }
    }

    setIsFullEditorOpen(true);
  };

  // Apply an edit command to the document
  const handleApplyEdit = async (editInstruction) => {
    if (!editSessionActive) {
      toast({
        title: 'No edit session',
        description: 'Please start edit mode first.',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    try {
      const response = await fileService.applyEdit(editInstruction);
      setEditChangesCount(response.session.changes?.length || 0);

      // Refresh session data to update document viewer
      try {
        const analysisRes = await fileService.getDocumentAnalysis();
        if (analysisRes.success) {
          setDocumentAnalysis(analysisRes);
          // Update session with new text (from textPreview)
          setEditSession(prev => prev ? {
            ...prev,
            currentText: response.textPreview?.replace('...', '') || prev.currentText,
            changes: response.session.changes || prev.changes
          } : null);
        }
      } catch (e) {
        console.log('Could not refresh analysis:', e);
      }

      // Add response to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `✅ Edit applied: ${response.changeSummary}\n\n→ Total changes: ${response.session.changes?.length || 0}\n\nContinue editing or click Download when done.`
        }
      ]);

      return response;
    } catch (error) {
      console.error('Failed to apply edit:', error);
      toast({
        title: 'Edit Failed',
        description: error.response?.data?.message || 'Failed to apply edit',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  };

  // Refresh edit session data (used by full editor)
  const refreshEditSession = async () => {
    try {
      const analysisRes = await fileService.getDocumentAnalysis();
      if (analysisRes.success) {
        setDocumentAnalysis(analysisRes);
      }
      const statusRes = await fileService.getEditStatus();
      if (statusRes.hasSession) {
        setEditChangesCount(statusRes.changesCount || 0);
      }
    } catch (e) {
      console.log('Could not refresh session:', e);
    }
  };

  // Download the edited document as DOCX or PDF
  const handleDownloadEdited = async (format = 'docx') => {
    if (!editSessionActive) {
      toast({
        title: 'No edit session',
        description: 'No document is being edited.',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    // Show loading toast
    toast({
      title: `Generating ${format.toUpperCase()}...`,
      description: format === 'pdf' ? 'PDF generation may take a moment...' : 'Please wait...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    try {
      console.log(`Starting ${format} download...`);
      const blob = await fileService.downloadEdited(format);

      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      console.log(`Received blob: ${blob.size} bytes, type: ${blob.type}`);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      const baseName = selectedFile?.fileName?.replace(/\.[^/.]+$/, '') || selectedFile?.originalName?.replace(/\.[^/.]+$/, '') || 'edited_document';
      a.download = `${baseName}_edited.${format}`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 100);

      toast({
        title: 'Download Complete',
        description: `Your ${format.toUpperCase()} file has been downloaded.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Download error:', error);

      // Check if it's a network error (often caused by download managers like IDM intercepting)
      const isNetworkError = error.message === 'Network Error' ||
        error.code === 'ERR_NETWORK' ||
        error.message?.includes('network');

      if (isNetworkError) {
        // Download manager likely intercepted - show info instead of error
        toast({
          title: 'Download Started',
          description: `Your ${format.toUpperCase()} download was intercepted by your download manager.`,
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Download Failed',
          description: error.message || 'Failed to download document. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Exit edit mode and clear session
  const handleExitEditMode = async () => {
    try {
      await fileService.clearEditSession();
    } catch (error) {
      console.error('Failed to clear edit session:', error);
    }

    setIsEditMode(false);
    setEditSessionActive(false);
    setEditChangesCount(0);
    setDocumentAnalysis(null);
    setIntentOverride(null);
    setIntentLabel(null);
    setScanStatus('none');
    setScanResults(null);
    setFormatMetadata(null);
    setSmartSuggestions([]);
    setHtmlContent('');

    toast({
      title: 'Edit Mode Ended',
      description: 'You have exited document editing mode.',
      status: 'info',
      duration: 2000,
    });
  };

  // 📥 Handle secure file download (DOCX/PDF)
  const handleDownloadFile = async (fileUrl, fileName) => {
    if (!fileUrl) return;

    // Normalize URL: ensure API base for relative paths without double /api
    const isAbsolute = fileUrl.startsWith('http');
    const apiOrigin = BASE_URL.startsWith('http') ? new URL(BASE_URL).origin : '';
    const isExternal = isAbsolute && !fileUrl.includes(apiOrigin || BASE_URL);
    let downloadUrl = fileUrl;

    if (!isAbsolute) {
      if (fileUrl.startsWith('/api/')) {
        downloadUrl = apiOrigin ? `${apiOrigin}${fileUrl}` : fileUrl;
      } else {
        downloadUrl = `${BASE_URL}${fileUrl}`;
      }
    }

    // If it's an external link (not our API), just open it
    if (isExternal) {
      window.open(fileUrl, '_blank');
      return;
    }

    try {
      toast({
        title: language === 'hi' ? 'डाउनलोड शुरू...' : 'Download Started...',
        status: 'info',
        duration: 2000,
      });

      console.log('📥 Downloading file:', { fileUrl: downloadUrl, fileName });

      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const contentType = response.headers?.['content-type'] || '';

      if (contentType.includes('application/json') || contentType.includes('text/html')) {
        const text = await response.data.text();
        throw new Error(text || 'Download failed (unexpected response)');
      }

      if (!response.data || response.data.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      console.log('✅ File downloaded, size:', response.data.size);

      // Create blob link and trigger download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document.docx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: language === 'hi' ? 'डाउनलोड पूर्ण' : 'Download Complete',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: language === 'hi' ? 'डाउनलोड विफल' : 'Download Failed',
        description: error.message || 'Could not download file',
        status: 'error',
        duration: 4000,
      });
    }
  };

  const [sessionsList, setSessionsList] = useState([]);
  const [sessionsListLoading, setSessionsListLoading] = useState(false);

  const fetchSessions = async () => {
    setSessionsListLoading(true);
    try {
      const list = await chatAPI.getSessions();
      setSessionsList(list || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setSessionsListLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [activeTab, user, slug]);

  const renderSubSidebarContent = () => {
    const cardBg = cv_white_rgba_13_17_23_0_7;
    const cardBorderColor = cv_gray_200_rgba_212_175_55_0_2;
    const cardShadow = cv_sm_0_8px_32px_0_rgba_0_0_0_0_3;

    switch (activeTab) {
      case 'dashboard':
        return (
          <VStack spacing={5} align="stretch" w="full">
            {/* Balance Summary Card */}
            <Box 
              p={5} 
              borderRadius="2xl" 
              bg={cardBg} 
              border="1px solid" 
              borderColor={cardBorderColor}
              boxShadow={cardShadow}
              backdropFilter="blur(8px)"
              transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
              _hover={{ 
                transform: 'translateY(-2px)', 
                boxShadow: '0 12px 24px rgba(212, 175, 55, 0.15)', 
                borderColor: 'judicial.gold' 
              }}
            >
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" tracking="wider">
                  Balance Summary
                </Text>
                <Icon as={FiZap} color="judicial.gold" w={4} h={4} filter="drop-shadow(0 0 4px rgba(212, 175, 55, 0.4))" />
              </HStack>
              <Text fontSize="3xl" fontWeight="black" color="judicial.gold" letterSpacing="-0.5px">
                {remainingMessages !== null ? `${remainingMessages} Left` : 'Unlimited'}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1} fontWeight="medium">
                Remaining messages today
              </Text>
              {remainingMessages !== null && (
                <Box mt={4}>
                  <Progress 
                    value={(remainingMessages / 100) * 100} 
                    size="xs" 
                    borderRadius="full" 
                    colorScheme="yellow" 
                    bg={cv_gray_100_gray_850} 
                  />
                </Box>
              )}
            </Box>

            {/* Workspace Details Card */}
            <Box 
              p={5} 
              borderRadius="2xl" 
              bg={cardBg} 
              border="1px solid" 
              borderColor={cardBorderColor}
              boxShadow={cardShadow}
              backdropFilter="blur(8px)"
              transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
              _hover={{ 
                transform: 'translateY(-2px)', 
                boxShadow: '0 12px 24px rgba(212, 175, 55, 0.15)', 
                borderColor: 'judicial.gold' 
              }}
            >
              <HStack justify="space-between" mb={4}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" tracking="wider">
                  Workspace Details
                </Text>
                <Icon as={FiGlobe} color="judicial.gold" w={4} h={4} />
              </HStack>
              
              <VStack align="stretch" spacing={3.5}>
                <HStack align="center" spacing={3}>
                  <Center w={7} h={7} borderRadius="md" bg={cv_gray_50_rgba_212_175_55_0_12} border="1px solid" borderColor="rgba(212, 175, 55, 0.15)">
                    <Icon as={FiLayers} color="judicial.gold" w={3.5} h={3.5} />
                  </Center>
                  <Box flex={1}>
                    <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="bold" tracking="wide">Company</Text>
                    <Text fontSize="sm" fontWeight="bold" color={textColor}>{user?.companyName || 'N/A'}</Text>
                  </Box>
                </HStack>

                <HStack align="center" spacing={3}>
                  <Center w={7} h={7} borderRadius="md" bg={cv_gray_50_rgba_212_175_55_0_12} border="1px solid" borderColor="rgba(212, 175, 55, 0.15)">
                    <Icon as={FiGrid} color="judicial.gold" w={3.5} h={3.5} />
                  </Center>
                  <Box flex={1}>
                    <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="bold" tracking="wide">Sector</Text>
                    <Text fontSize="sm" fontWeight="bold" color={textColor} textTransform="capitalize">{user?.sector || 'N/A'}</Text>
                  </Box>
                </HStack>

                <HStack align="center" spacing={3}>
                  <Center w={7} h={7} borderRadius="md" bg={cv_gray_50_rgba_212_175_55_0_12} border="1px solid" borderColor="rgba(212, 175, 55, 0.15)">
                    <Icon as={FiGlobe} color="judicial.gold" w={3.5} h={3.5} />
                  </Center>
                  <Box flex={1}>
                    <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="bold" tracking="wide">Slug</Text>
                    <Badge 
                      colorScheme="yellow" 
                      variant="subtle" 
                      fontSize="2xs" 
                      borderRadius="md" 
                      px={2} 
                      py={0.5} 
                      bg="rgba(212, 175, 55, 0.15)"
                      color="judicial.gold"
                      border="1px solid"
                      borderColor="rgba(212, 175, 55, 0.25)"
                      maxW="full"
                      textTransform="uppercase"
                      fontWeight="bold"
                    >
                      {user?.companySlug || 'N/A'}
                    </Badge>
                  </Box>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        );

      case 'history':
        return (
          <VStack spacing={4} align="stretch" w="full">
            {/* New Chat Session Button */}
            <Button
              size="md"
              bg="judicial.gold"
              color="judicial.dark"
              _hover={{
                bg: 'judicial.lightGold',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              }}
              _active={{ transform: 'translateY(0)' }}
              leftIcon={<AddIcon />}
              onClick={handleStartNewChat}
              w="full"
              borderRadius="xl"
              fontWeight="bold"
              fontSize="xs"
              letterSpacing="wide"
              transition="all 0.2s ease"
            >
              NEW CHAT SESSION
            </Button>

            {/* Session List */}
            {sessionsListLoading ? (
              <Center py={8}>
                <Spinner size="md" color="judicial.gold" />
              </Center>
            ) : sessionsList.length === 0 ? (
              <VStack spacing={4} py={10} px={2} align="center" justify="center">
                <Center 
                  w={12} 
                  h={12} 
                  borderRadius="full" 
                  bg={cv_gray_100_rgba_212_175_55_0_08} 
                  border="1px dashed" 
                  borderColor="rgba(212, 175, 55, 0.3)"
                >
                  <Icon as={FiMessageSquare} w={5} h={5} color="judicial.gold" />
                </Center>
                <VStack spacing={1} textAlign="center">
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>
                    No Conversations
                  </Text>
                  <Text fontSize="xs" color="gray.500" maxW="200px" lineHeight="1.4">
                    Create a new session above to start asking legal questions.
                  </Text>
                </VStack>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {sessionsList.map(session => {
                  const isActive = slug === session.slug;
                  return (
                    <Box
                      key={session.slug}
                      p={3.5}
                      borderRadius="xl"
                      bg={isActive ? cv_white_rgba_212_175_55_0_08 : cv_white_transparent}
                      border="1px solid"
                      borderColor={isActive ? 'judicial.gold' : cv_gray_100_transparent}
                      cursor="pointer"
                      onClick={() => navigate(`/c/${session.slug}`)}
                      transition="all 0.25s cubic-bezier(.08,.52,.52,1)"
                      boxShadow={isActive ? '0 4px 15px rgba(212, 175, 55, 0.1)' : 'none'}
                      position="relative"
                      _hover={{
                        transform: 'translateY(-1px)',
                        bg: cv_gray_50_rgba_212_175_55_0_04,
                        borderColor: isActive ? 'judicial.gold' : cv_gray_300_rgba_212_175_55_0_15,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <Box 
                          position="absolute" 
                          left={0} 
                          top="20%" 
                          bottom="20%" 
                          w="3px" 
                          bg="judicial.gold" 
                          borderRadius="full" 
                        />
                      )}
                      
                      <HStack justify="space-between" mb={2}>
                        <Badge 
                          fontSize="2xs" 
                          px={2} 
                          py={0.5} 
                          borderRadius="md"
                          colorScheme={
                            session.feature === 'document_ready' ? 'purple' :
                            session.feature === 'legal_analysis' ? 'green' : 'yellow'
                          }
                          variant="subtle"
                          textTransform="uppercase"
                          fontWeight="bold"
                        >
                          {session.feature.replace('_', ' ')}
                        </Badge>
                        <Text fontSize="2xs" color="gray.400" fontWeight="medium">
                          {new Date(session.updatedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </HStack>
                      
                      <Text 
                        fontSize="xs" 
                        noOfLines={2} 
                        color={isActive ? textColor : cv_gray_600_gray_400}
                        fontWeight={isActive ? "semibold" : "normal"}
                        lineHeight="1.4"
                      >
                        {session.preview || "No message preview"}
                      </Text>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </VStack>
        );

      case 'research':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="xs" color="gray.550" _dark={{ color: 'gray.400' }} px={1} lineHeight="1.5">
              Upload a legal case file or contract to perform automated compliance analysis and deep legal context searches.
            </Text>
            <Box
              role="group"
              position="relative"
              border="2px dashed"
              borderColor={cv_gray_250_rgba_212_175_55_0_25}
              borderRadius="xl"
              p={6}
              textAlign="center"
              cursor="pointer"
              bg={cv_rgba_212_175_55_0_015_rgba_212_175_55_0_005}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              onClick={() => document.getElementById('file-upload')?.click()}
              _hover={{ 
                borderColor: 'judicial.gold',
                bg: cv_rgba_212_175_55_0_05_rgba_212_175_55_0_03,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)'
              }}
            >
              <Center 
                mx="auto"
                w={12} 
                h={12} 
                borderRadius="full" 
                bg={cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05}
                border="1px solid"
                borderColor="rgba(212, 175, 55, 0.2)"
                mb={3}
                transition="transform 0.4s ease"
                _groupHover={{ transform: 'rotate(15deg) scale(1.05)' }}
              >
                <Icon as={FaPaperclip} w={5} h={5} color="judicial.gold" />
              </Center>
              <Text fontSize="xs" fontWeight="bold" color={cv_gray_800_gray_100} mb={1}>
                Click to Upload File
              </Text>
              <Text fontSize="10px" color={cv_gray_550_gray_400}>
                PDF, Word, TXT, images
              </Text>
            </Box>

            {/* Uploading Status Indicator */}
            {uploading && (
              <Box 
                p={3.5} 
                bg={cv_gray_50_rgba_212_175_55_0_04} 
                border="1px solid"
                borderColor="judicial.gold"
                borderRadius="xl"
              >
                <HStack justify="space-between" mb={2}>
                  <HStack spacing={2}>
                    <Spinner size="xs" color="judicial.gold" />
                    <Text fontSize="xs" fontWeight="bold" color={cv_gray_850_gray_100}>
                      Uploading file...
                    </Text>
                  </HStack>
                  <Text fontSize="2xs" color="gray.500">{uploadProgress}%</Text>
                </HStack>
                <Progress 
                  value={uploadProgress} 
                  size="2xs" 
                  colorScheme="yellow" 
                  bg={cv_gray_200_gray_800}
                  borderRadius="full" 
                />
              </Box>
            )}

            {/* Uploaded File & Start Deep Research Button */}
            {!uploading && selectedFile && (
              <VStack spacing={3} align="stretch">
                <Box 
                  p={3.5} 
                  bg={cv_gray_50_rgba_212_175_55_0_04} 
                  border="1px solid"
                  borderColor={cv_gray_200_rgba_212_175_55_0_15}
                  borderRadius="xl"
                  position="relative"
                >
                  <HStack justify="space-between">
                    <HStack spacing={2} maxW="85%">
                      <Icon as={FiFileText} color="judicial.gold" w={4} h={4} />
                      <VStack align="start" spacing={0} overflow="hidden">
                        <Text fontSize="xs" fontWeight="semibold" isTruncated color={cv_gray_850_gray_100}>
                          {selectedFile.fileName || selectedFile.name}
                        </Text>
                        <Text fontSize="10px" color="gray.400">Ready for Deep Research</Text>
                      </VStack>
                    </HStack>
                    <IconButton
                      icon={<FaTimes />}
                      size="2xs"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: 'red.500' }}
                      onClick={() => setSelectedFile(null)}
                      aria-label="Remove file"
                    />
                  </HStack>
                </Box>

                <Button
                  size="sm"
                  w="full"
                  bg="judicial.gold"
                  color="judicial.dark"
                  fontWeight="bold"
                  borderRadius="xl"
                  leftIcon={<Icon as={FiCpu} />}
                  onClick={() => handleStartDeepResearch()}
                  isLoading={researchStatus === 'starting' || researchStatus === 'processing'}
                  loadingText="Analyzing..."
                  _hover={{
                    bg: 'judicial.lightGold',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  Start Deep Research
                </Button>
              </VStack>
            )}
          </VStack>
        );

      case 'review':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="xs" color="gray.550" _dark={{ color: 'gray.400' }} px={1} lineHeight="1.5">
              Parallel Review: Upload multiple legal briefs, contracts, or court transcripts to compare clause compliance and verify cross-document alignments.
            </Text>
            <Box
              role="group"
              position="relative"
              border="2px dashed"
              borderColor={cv_gray_250_rgba_212_175_55_0_25}
              borderRadius="xl"
              p={6}
              textAlign="center"
              cursor="pointer"
              bg={cv_rgba_212_175_55_0_015_rgba_212_175_55_0_005}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              onClick={() => document.getElementById('review-file-upload')?.click()}
              _hover={{ 
                borderColor: 'judicial.gold',
                bg: cv_rgba_212_175_55_0_05_rgba_212_175_55_0_03,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)'
              }}
            >
              <Center 
                mx="auto"
                w={12} 
                h={12} 
                borderRadius="full" 
                bg={cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05}
                border="1px solid"
                borderColor="rgba(212, 175, 55, 0.2)"
                mb={3}
                transition="transform 0.4s ease"
                _groupHover={{ transform: 'rotate(15deg) scale(1.05)' }}
              >
                <Icon as={FiLayers} w={5} h={5} color="judicial.gold" />
              </Center>
              <Text fontSize="xs" fontWeight="bold" color={cv_gray_800_gray_100} mb={1}>
                Upload Multiple Files
              </Text>
              <Text fontSize="10px" color={cv_gray_550_gray_400}>
                Upload up to 10 files in parallel
              </Text>
            </Box>

            {/* Uploading Status Indicator */}
            {isUploadingReview && (
              <Box 
                p={3.5} 
                bg={cv_gray_50_rgba_212_175_55_0_04} 
                border="1px solid"
                borderColor="judicial.gold"
                borderRadius="xl"
              >
                <HStack spacing={2}>
                  <Spinner size="xs" color="judicial.gold" />
                  <Text fontSize="xs" fontWeight="bold" color={cv_gray_850_gray_100}>
                    Uploading file(s)...
                  </Text>
                </HStack>
                <Progress size="2xs" isIndeterminate colorScheme="yellow" mt={2} borderRadius="full" />
              </Box>
            )}

            {/* List of Uploaded Review Files */}
            {reviewFiles.length > 0 && (
              <VStack spacing={3} align="stretch">
                <Text fontSize="11px" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Uploaded Files ({reviewFiles.length})
                </Text>
                <VStack spacing={2} align="stretch" maxH="220px" overflowY="auto">
                  {reviewFiles.map((rf, idx) => (
                    <Box
                      key={idx}
                      p={2.5}
                      bg={cv_gray_50_rgba_212_175_55_0_04}
                      border="1px solid"
                      borderColor={cv_gray_200_rgba_212_175_55_0_15}
                      borderRadius="lg"
                    >
                      <HStack justify="space-between">
                        <HStack spacing={2} maxW="85%">
                          <Icon as={FiFileText} color="judicial.gold" w={3.5} h={3.5} />
                          <Text fontSize="xs" isTruncated color={cv_gray_850_gray_100}>
                            {rf.file?.fileName || rf.file?.name || `File ${idx + 1}`}
                          </Text>
                        </HStack>
                        <IconButton
                          icon={<FaTimes />}
                          size="2xs"
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: 'red.500' }}
                          onClick={() => {
                            setReviewFiles(prev => prev.filter((_, i) => i !== idx));
                          }}
                          aria-label="Remove file"
                        />
                      </HStack>
                    </Box>
                  ))}
                </VStack>

                <Button
                  size="sm"
                  w="full"
                  bg="judicial.gold"
                  color="judicial.dark"
                  fontWeight="bold"
                  borderRadius="xl"
                  leftIcon={<Icon as={FiLayers} />}
                  onClick={triggerParallelReviewAction}
                  isLoading={reviewStatus === 'starting' || reviewStatus === 'processing'}
                  loadingText="Reviewing..."
                  _hover={{
                    bg: 'judicial.lightGold',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  Start Parallel Review
                </Button>
              </VStack>
            )}
          </VStack>
        );

      case 'chronology':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="xs" color="gray.550" _dark={{ color: 'gray.400' }} px={1} lineHeight="1.5">
              Analyze a list of events, legal summons, or case history text/files to compile a structured chronological order timeline of events automatically.
            </Text>
            <Box
              role="group"
              position="relative"
              border="2px dashed"
              borderColor={cv_gray_250_rgba_212_175_55_0_25}
              borderRadius="xl"
              p={6}
              textAlign="center"
              cursor="pointer"
              bg={cv_rgba_212_175_55_0_015_rgba_212_175_55_0_005}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              onClick={() => document.getElementById('chronology-file-upload')?.click()}
              _hover={{ 
                borderColor: 'judicial.gold',
                bg: cv_rgba_212_175_55_0_05_rgba_212_175_55_0_03,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)'
              }}
            >
              <Center 
                mx="auto"
                w={12} 
                h={12} 
                borderRadius="full" 
                bg={cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05}
                border="1px solid"
                borderColor="rgba(212, 175, 55, 0.2)"
                mb={3}
                transition="transform 0.4s ease"
                _groupHover={{ transform: 'rotate(15deg) scale(1.05)' }}
              >
                <Icon as={FiClock} w={5} h={5} color="judicial.gold" />
              </Center>
              <Text fontSize="xs" fontWeight="bold" color={cv_gray_800_gray_100} mb={1}>
                Upload Chronology File
              </Text>
              <Text fontSize="10px" color={cv_gray_550_gray_400}>
                Analyze timeline sources
              </Text>
            </Box>

            {/* Uploading Status Indicator */}
            {isUploadingChronology && (
              <Box 
                p={3.5} 
                bg={cv_gray_50_rgba_212_175_55_0_04} 
                border="1px solid"
                borderColor="judicial.gold"
                borderRadius="xl"
              >
                <HStack spacing={2}>
                  <Spinner size="xs" color="judicial.gold" />
                  <Text fontSize="xs" fontWeight="bold" color={cv_gray_850_gray_100}>
                    Uploading file(s)...
                  </Text>
                </HStack>
                <Progress size="2xs" isIndeterminate colorScheme="yellow" mt={2} borderRadius="full" />
              </Box>
            )}

            {/* List of Uploaded Chronology Files */}
            {chronologyFiles.length > 0 && (
              <VStack spacing={3} align="stretch">
                <Text fontSize="11px" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Uploaded Files ({chronologyFiles.length})
                </Text>
                <VStack spacing={2} align="stretch" maxH="220px" overflowY="auto">
                  {chronologyFiles.map((cf, idx) => (
                    <Box
                      key={idx}
                      p={2.5}
                      bg={cv_gray_50_rgba_212_175_55_0_04}
                      border="1px solid"
                      borderColor={cv_gray_200_rgba_212_175_55_0_15}
                      borderRadius="lg"
                    >
                      <HStack justify="space-between">
                        <HStack spacing={2} maxW="85%">
                          <Icon as={FiFileText} color="judicial.gold" w={3.5} h={3.5} />
                          <Text fontSize="xs" isTruncated color={cv_gray_850_gray_100}>
                            {cf.file?.fileName || cf.file?.name || `File ${idx + 1}`}
                          </Text>
                        </HStack>
                        <IconButton
                          icon={<FaTimes />}
                          size="2xs"
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: 'red.500' }}
                          onClick={() => {
                            setChronologyFiles(prev => prev.filter((_, i) => i !== idx));
                          }}
                          aria-label="Remove file"
                        />
                      </HStack>
                    </Box>
                  ))}
                </VStack>

                <Button
                  size="sm"
                  w="full"
                  bg="judicial.gold"
                  color="judicial.dark"
                  fontWeight="bold"
                  borderRadius="xl"
                  leftIcon={<Icon as={FiClock} />}
                  onClick={triggerChronologyAction}
                  isLoading={chronologyStatus === 'starting' || chronologyStatus === 'processing'}
                  loadingText="Building Timeline..."
                  _hover={{
                    bg: 'judicial.lightGold',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  Build Chronology
                </Button>
              </VStack>
            )}
          </VStack>
        );

      case 'drafting':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="xs" color="gray.550" _dark={{ color: 'gray.400' }} px={1} lineHeight="1.5">
              Select or design templates to draft custom affidavits, compliance notices, complaints, and general agreements.
            </Text>
            <VStack spacing={3} align="stretch" w="full">
              {[
                {
                  id: 'browse',
                  title: 'Browse Templates',
                  subtext: 'Select pre-drafted legal categories',
                  icon: FiFileText,
                  onClick: () => handleSuggestedActionClick({ type: 'CREATE_DOCUMENT', text: 'Draft a dynamic template document' })
                },
                {
                  id: 'precedence',
                  title: 'Precedence Analysis',
                  subtext: 'Analyze relevant court precedents',
                  icon: FiZap,
                  onClick: () => handleSuggestedActionClick({ type: 'PRECEDENCE_ANALYSIS', text: 'Analyze court precedents' })
                },
                {
                  id: 'counter',
                  title: 'Counter Maker',
                  subtext: 'Create counter affidavit responses',
                  icon: FiEdit,
                  onClick: () => handleSuggestedActionClick({ type: 'COUNTER_AFFIDAVIT', text: 'Create a counter affidavit response' })
                },
                {
                  id: 'translate',
                  title: 'Document Translator',
                  subtext: 'Translate templates and drafts',
                  icon: FiGlobe,
                  onClick: () => handleSuggestedActionClick({ type: 'TRANSLATE_DOCUMENT', text: 'Translate a document file' })
                }
              ].map(action => (
                <HStack
                  key={action.id}
                  p={3.5}
                  spacing={3.5}
                  bg={cv_white_rgba_212_175_55_0_005}
                  border="1px solid"
                  borderColor={cv_gray_200_rgba_212_175_55_0_15}
                  borderRadius="xl"
                  cursor="pointer"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  onClick={action.onClick}
                  role="group"
                  _hover={{
                    bg: cv_rgba_212_175_55_0_04_rgba_212_175_55_0_03,
                    borderColor: 'judicial.gold',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)'
                  }}
                >
                  <Center
                    w={14}
                    h={14}
                    borderRadius="xl"
                    bg={cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05}
                    border="1px solid"
                    borderColor="rgba(212, 175, 55, 0.2)"
                    transition="transform 0.4s ease"
                    _groupHover={{ transform: 'scale(1.08)' }}
                    flexShrink={0}
                  >
                    <Icon as={action.icon} w={8} h={8} color="judicial.gold" />
                  </Center>
                  <VStack align="start" spacing={0} flex="1">
                    <Text fontSize="xs" fontWeight="bold" color={cv_gray_800_gray_100}>
                      {action.title}
                    </Text>
                    <Text fontSize="10px" color={cv_gray_550_gray_400}>
                      {action.subtext}
                    </Text>
                  </VStack>
                  <Icon 
                    as={FiMaximize2} 
                    w={3} 
                    h={3} 
                    color="gray.400" 
                    transition="all 0.3s ease" 
                    _groupHover={{ color: 'judicial.gold', transform: 'scale(1.1)' }} 
                  />
                </HStack>
              ))}
            </VStack>
          </VStack>
        );

      case 'profile':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="xs" color="gray.550" _dark={{ color: 'gray.400' }} px={1} lineHeight="1.5">
              Set your legal organization metadata. Your company slug is generated from these settings to configure custom document routes.
            </Text>
            <form onSubmit={handleOnboardSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl id="company-name" isRequired>
                  <FormLabel fontSize="11px" fontWeight="bold" color={cv_gray_600_gray_400} mb={1.5} textTransform="uppercase" letterSpacing="0.05em">
                    Company Name
                  </FormLabel>
                  <Input
                    size="sm"
                    borderRadius="xl"
                    borderColor={cv_gray_250_rgba_212_175_55_0_25}
                    bg={cv_white_rgba_212_175_55_0_005}
                    _focus={{
                      borderColor: 'judicial.gold',
                      boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.3)'
                    }}
                    value={onboardCompanyName}
                    onChange={(e) => setOnboardCompanyName(e.target.value)}
                    placeholder="e.g. Richardson & Associates"
                  />
                </FormControl>
                
                <FormControl id="company-sector" isRequired>
                  <FormLabel fontSize="11px" fontWeight="bold" color={cv_gray_600_gray_400} mb={1.5} textTransform="uppercase" letterSpacing="0.05em">
                    Sector
                  </FormLabel>
                  <Select
                    size="sm"
                    borderRadius="xl"
                    borderColor={cv_gray_250_rgba_212_175_55_0_25}
                    bg={cv_white_rgba_212_175_55_0_005}
                    _focus={{
                      borderColor: 'judicial.gold',
                      boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.3)'
                    }}
                    value={onboardSector}
                    onChange={(e) => setOnboardSector(e.target.value)}
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

                <Button
                  size="sm"
                  w="full"
                  bgGradient="linear(to-br, judicial.gold, judicial.accent)"
                  color="judicial.dark"
                  fontWeight="bold"
                  borderRadius="xl"
                  type="submit"
                  isLoading={isOnboardingSubmitLoading}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    bgGradient: 'linear(to-br, judicial.lightGold, judicial.gold)',
                    transform: 'translateY(-1.5px)',
                    boxShadow: '0 6px 18px rgba(212, 175, 55, 0.2)'
                  }}
                  _active={{
                    transform: 'translateY(0.5px)'
                  }}
                >
                  Update Company Settings
                </Button>
              </VStack>
            </form>
          </VStack>
        );

      case 'settings':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">App Preferences</Text>
            <FormControl>
              <FormLabel fontSize="xs">System Language</FormLabel>
              <Select size="sm" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English (EN)</option>
                <option value="hi">हिंदी (HI)</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Theme Mode</FormLabel>
              <Select size="sm" value={colorMode} onChange={(e) => { toggleColorMode(); }}>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" display="flex" justifyContent="space-between" alignItems="center">
                <span>Chat Font Size</span>
                <Badge colorScheme="purple" fontSize="10px" px={1.5} py={0.5} borderRadius="md">{chatFontSize}px</Badge>
              </FormLabel>
              <HStack spacing={4}>
                <Text fontSize="2xs" color="gray.400">Small</Text>
                <Slider
                  min={12}
                  max={20}
                  step={1}
                  value={chatFontSize}
                  onChange={(val) => setChatFontSize(val)}
                  focusThumbOnChange={false}
                  flex={1}
                >
                  <SliderTrack bg={cv_gray_200_gray_700} h="4px" borderRadius="full">
                    <SliderFilledTrack bg="judicial.gold" />
                  </SliderTrack>
                  <SliderThumb boxSize={4} bg="white" borderColor="judicial.gold" borderWidth={2} shadow="md" _focus={{ boxShadow: 'none' }} />
                </Slider>
                <Text fontSize="2xs" color="gray.400">Large</Text>
              </HStack>
            </FormControl>
          </VStack>
        );
      default:
        return null;
    }
  };

  const renderWelcomeDashboard = () => {
    const cardBg = cv_rgba_255_255_255_0_45_rgba_13_17_23_0_25;
    const cardBorder = cv_rgba_212_175_55_0_18_rgba_212_175_55_0_12;
    return (
      <VStack
        spacing={8}
        py={12}
        px={8}
        align="center"
        justify="center"
        w="full"
        maxW="650px"
        mx="auto"
        my="auto"
        borderRadius="2xl"
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        backdropFilter="blur(24px)"
        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.12)"
        position="relative"
        overflow="hidden"
      >
        {/* Glow overlay under the card */}
        <Box
          position="absolute"
          top="-50%"
          left="-50%"
          w="200%"
          h="200%"
          bg="radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0) 70%)"
          pointerEvents="none"
          zIndex={0}
        />

        <VStack spacing={5} align="center" zIndex={1}>
          {/* Glowing Logo */}
          <Box
            p={5}
            borderRadius="full"
            bg={cv_white_rgba_13_17_23_0_8}
            border="2.5px solid"
            borderColor="judicial.gold"
            boxShadow="0 0 28px rgba(212, 175, 55, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.06)"
            position="relative"
            transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            _hover={{
              transform: 'scale(1.1) rotate(15deg)',
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.65)'
            }}
          >
            <Icon as={FiCpu} w={10} h={10} color="judicial.gold" />
          </Box>

          <VStack spacing={3} textAlign="center">
            <Heading
              size="lg"
              fontWeight="black"
              bgGradient="linear(to-r, #D4AF37, #F5D76E, #D4AF37)"
              bgClip="text"
              letterSpacing="-0.5px"
              fontSize="2xl"
              fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              Dastavez AI Workspace
            </Heading>
            <Text
              color={cv_gray_600_gray_300}
              fontSize="xs"
              maxW="480px"
              fontWeight="medium"
              lineHeight="1.75"
              fontFamily="'Inter', sans-serif"
            >
              Your secure, intelligent legal co-pilot. Start by asking a question, uploading a document, or choosing a workspace tool.
            </Text>
          </VStack>
        </VStack>
      </VStack>
    );
  };

  const renderWorkingWindowBody = () => {
    return (
      <Flex w="full" h="full" direction="column" overflow="hidden" px={4} pt={4} pb={2}>
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
              {messages.filter(m => m.role === 'user').length === 0 && renderWelcomeDashboard()}
              
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg}
                  role={msg.role}
                  onSuggestedActionClick={handleSuggestedActionClick}
                  onDownload={handleDownloadFile}
                  language={language}
                  fontSize={chatFontSize}
                />
              ))}
            </Flex>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* User Input Prompt controls */}
        <Box pt={1.5} w="full">
          <VStack spacing={1} w="full">
            {/* Selected File Display inline inside Chat */}
            {selectedFile && (
              <HStack
                bg={cv_blue_50_blue_900}
                p={2}
                px={3}
                borderRadius="md"
                w="100%"
                justify="space-between"
                borderWidth={1}
                borderColor="blue.100"
              >
                <HStack spacing={2}>
                  <Icon as={FaFile} color="blue.500" />
                  <Text color={textColor} fontSize="xs" fontWeight="semibold" isTruncated maxW="200px">
                    {selectedFile.fileName}
                  </Text>
                  {scanStatus === 'scanned' && (
                    <Badge colorScheme="green" fontSize="2xs">Scanned</Badge>
                  )}
                  {editSessionActive && (
                    <Badge colorScheme="purple" fontSize="2xs">Edit Active</Badge>
                  )}
                </HStack>
                <HStack spacing={1}>
                  {editSessionActive && (
                    <Button size="2xs" variant="ghost" colorScheme="gray" onClick={handleExitEditMode}>
                      Exit Edit
                    </Button>
                  )}
                  <IconButton
                    icon={<FaTimes />}
                    size="xs"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => {
                      handleExitEditMode();
                      setSelectedFile(null);
                    }}
                    aria-label="Remove file"
                  />
                </HStack>
              </HStack>
            )}

            <HStack w="100%" spacing={2}>
              {/* Intent Menu "+" Button */}
              <Menu>
                <Tooltip label="Select intent type" placement="top">
                  <MenuButton
                    as={IconButton}
                    icon={<AddIcon />}
                    aria-label="Select intent"
                    size="md"
                    h="40px"
                    w="40px"
                    borderRadius="lg"
                    variant={intentOverride ? 'solid' : 'ghost'}
                    colorScheme={intentOverride ? 'purple' : 'blue'}
                  />
                </Tooltip>
                <MenuList>
                  <MenuItem onClick={() => { setIntentOverride(null); setIntentLabel(null); }}>
                    💬 Auto-detect (Default)
                  </MenuItem>
                  <MenuItem onClick={() => { setIntentOverride('CONVERSATIONAL'); setIntentLabel('Chat'); }}>
                    🗣️ Conversational Chat
                  </MenuItem>
                  <MenuItem onClick={() => { setIntentOverride('LEGAL_INFORMATION'); setIntentLabel('Legal Query'); }}>
                    ⚖️ Legal Information
                  </MenuItem>
                  <MenuItem onClick={() => { setIntentOverride('DOCUMENT_REQUEST'); setIntentLabel('Draft'); }}>
                    📝 Draft Document
                  </MenuItem>
                </MenuList>
              </Menu>

              {intentLabel && (
                <Badge colorScheme="purple" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                  {intentLabel} ✕
                </Badge>
              )}

              <Input
                value={input + (interimTranscript ? ` ${interimTranscript}` : '')}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isPendingUserChoice
                    ? 'Please use the suggested actions above'
                    : isListening
                      ? "Listening... speak now"
                      : isEditMode
                        ? "Describe the edit you want to make..."
                        : "Type your message..."
                }
                size="md"
                h="40px"
                borderRadius="lg"
                bg={isListening ? cv_red_50_red_950 : inputBg}
                color={textColor}
                borderColor={cv_gray_250_rgba_212_175_55_0_25}
                _hover={{
                  borderColor: cv_gray_300_rgba_212_175_55_0_35
                }}
                _focus={{
                  borderColor: 'judicial.gold',
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
                  bg: cv_white_rgba_10_13_20_0_6
                }}
                fontFamily="'Inter', sans-serif"
                fontSize="sm"
                isDisabled={isPendingUserChoice || isLoading || analyzingFile}
                onKeyPress={handleKeyPress}
                flex={1}
                transition="all 0.2s ease"
              />
              
              <Tooltip label="Voice input" placement="top">
                <IconButton
                  icon={isListening ? <FiMicOff /> : <FiMic />}
                  onClick={toggleListening}
                  size="md"
                  h="40px"
                  w="40px"
                  borderRadius="lg"
                  bg={isListening ? 'red.500' : 'judicial.gold'}
                  color={isListening ? 'white' : 'judicial.dark'}
                  transition="all 0.2s ease"
                  _hover={isListening ? {
                    bg: 'red.600',
                    transform: 'translateY(-1px)'
                  } : {
                    bg: 'judicial.lightGold',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 14px rgba(212, 175, 55, 0.45)'
                  }}
                  _active={{
                    transform: 'translateY(0px)'
                  }}
                  _disabled={{
                    bg: cv_gray_100_gray_800,
                    color: cv_gray_400_gray_650,
                    cursor: 'not-allowed',
                    boxShadow: 'none',
                    transform: 'none'
                  }}
                  isDisabled={!speechSupported}
                  aria-label="Voice input"
                />
              </Tooltip>

              <IconButton
                icon={<Icon as={RiSendPlaneFill} />}
                onClick={() => handleSendMessage()}
                size="md"
                h="40px"
                w="40px"
                borderRadius="lg"
                bg="judicial.gold"
                color="judicial.dark"
                transition="all 0.2s ease"
                _hover={{
                  bg: 'judicial.lightGold',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.45)'
                }}
                _active={{
                  transform: 'translateY(0px)'
                }}
                _disabled={{
                  bg: cv_gray_100_gray_800,
                  color: cv_gray_400_gray_650,
                  cursor: 'not-allowed',
                  boxShadow: 'none',
                  transform: 'none'
                }}
                isDisabled={!input.trim() || isLoading}
                aria-label="Send message"
              />
            </HStack>
          </VStack>
        </Box>
      </Flex>
    );
  };

  const contextValue = {
    activeTab, setActiveTab,
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    isInitialLoad, setIsInitialLoad,
    remainingMessages, setRemainingMessages,
    subscriptionStatus, setSubscriptionStatus,
    language, setLanguage,
    isUploading, setIsUploading,
    uploadProgress, setUploadProgress,
    selectedFile, setSelectedFile,
    analyzingFile, setAnalyzingFile,
    sessionsList, setSessionsList,
    sessionsListLoading, setSessionsListLoading,
    intentOverride, setIntentOverride,
    intentLabel, setIntentLabel,
    user, token, logout, toast,
    
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
    
    precedenceSessionId, setPrecedenceSessionId,
    precedenceStatus, setPrecedenceStatus,
    precedenceResults, setPrecedenceResults,
    isPrecedencePanelOpen, setIsPrecedencePanelOpen,
    startPrecedenceAnalysis,
    
    counterMakerSessionId, setCounterMakerSessionId,
    counterMakerStatus, setCounterMakerStatus,
    counterMakerResults, setCounterMakerResults,
    counterMakerFacts, setCounterMakerFacts,
    isCounterMakerPanelOpen, setIsCounterMakerPanelOpen,
    counterMakerFileId, setCounterMakerFileId,
    startCounterMaker,
    extractCounterFacts,
    
    handleSuggestedActionClick,
    startNewSession: () => navigate(`/c/${Math.random().toString(36).substring(2, 15)}`),
    
    scanStatus, setScanStatus,
    scanResults, setScanResults,
    smartSuggestions, setSmartSuggestions,
    formatMetadata, setFormatMetadata,
  };

  const isRightPanelOpen = 
    (activeTab === 'chronology' && isTimelinePanelOpen) ||
    (activeTab === 'drafting' && isPrecedencePanelOpen) ||
    (activeTab === 'drafting' && isCounterMakerPanelOpen) ||
    (activeTab === 'research' && isReportPanelOpen) ||
    (activeTab === 'review' && isBulkReviewPanelOpen) ||
    isEditMode;

  return (
    <AdvancedChatProvider value={contextValue}>
      <Flex h="100vh" w="100vw" overflow="hidden" bg={bgMain}>
      {/* 1. Left-most Icon Sidebar */}
      <Flex
        w="70px"
        h="full"
        bg={cv_white_gray_900}
        borderRight="1px solid"
        borderColor={borderColor}
        direction="column"
        justify="space-between"
        zIndex={10}
        boxShadow="sm"
      >
        <Box w="full">
          {/* Header alignment box */}
          <Box 
            h="60px" 
            borderBottom="1px solid" 
            borderColor={borderColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box 
              cursor="pointer" 
              transition="transform 0.3s ease" 
              _hover={{ transform: 'scale(1.08)' }}
            >
              <JusticeIcon size="42px" />
            </Box>
          </Box>
          
          <VStack spacing={2.5} w="full" pt={5} align="center">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
              { id: 'history', label: 'History', icon: FiMessageSquare },
              { id: 'research', label: 'Deep Research', icon: FiCpu },
              { id: 'review', label: 'Parallel Review', icon: FiLayers },
              { id: 'chronology', label: 'Time Chronology', icon: FiClock },
              { id: 'drafting', label: 'Drafting', icon: FiFileText },
              { id: 'profile', label: 'Company Profile', icon: FiGlobe },
              { id: 'settings', label: 'Settings', icon: FiSettings }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <Tooltip key={tab.id} label={tab.label} placement="right">
                  <VStack
                    spacing={1}
                    align="center"
                    justify="center"
                    w="90%"
                    py={2}
                    px={1}
                    borderRadius="xl"
                    cursor="pointer"
                    bg={isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent'}
                    border="1px solid"
                    borderColor={isActive ? 'rgba(212, 175, 55, 0.25)' : 'transparent'}
                    color={isActive ? 'judicial.gold' : cv_gray_600_gray_450}
                    transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
                    onClick={() => {
                      setActiveTab(prev => prev === tab.id ? 'closed' : tab.id);
                    }}
                    _hover={{
                      bg: isActive ? 'rgba(212, 175, 55, 0.18)' : cv_gray_100_rgba_212_175_55_0_08,
                      color: 'judicial.gold',
                      transform: 'translateY(-1px)',
                      borderColor: 'rgba(212, 175, 55, 0.3)',
                      boxShadow: '0 0 10px rgba(212, 175, 55, 0.18)'
                    }}
                  >
                    <Icon as={tab.icon} w={5} h={5} mb={0.5} />
                    <Text fontSize="7.5px" fontWeight="bold" textAlign="center" lineHeight="1.2">
                      {tab.label}
                    </Text>
                  </VStack>
                </Tooltip>
              );
            })}
          </VStack>
        </Box>

        <VStack spacing={4} align="center" pb={4}>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
            aria-label="Toggle color mode"
          />
          <IconButton
            icon={<Icon as={FiRefreshCw} />}
            onClick={logout}
            variant="ghost"
            colorScheme="red"
            size="sm"
            aria-label="Logout"
          />
        </VStack>
      </Flex>

      {/* 2. Sub-sidebar */}
      {activeTab !== 'closed' && (
        <Box
          w="280px"
          bg={cv_gray_50_gray_950}
          borderRight="1px solid"
          borderColor={borderColor}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <Box 
            h="60px" 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between"
            px={4} 
            borderBottom="1px solid" 
            borderColor={borderColor}
          >
            <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500">
              {activeTab.replace('-', ' ')}
            </Heading>
            <Tooltip label="Start New Chat" placement="bottom">
              <IconButton
                icon={<AddIcon />}
                size="xs"
                variant="ghost"
                color="judicial.gold"
                _hover={{ bg: cv_gray_100_rgba_212_175_55_0_08 }}
                onClick={handleStartNewChat}
                aria-label="Start New Chat"
              />
            </Tooltip>
          </Box>
          
          <Box flex="1" overflowY="auto" p={4}>
            {renderSubSidebarContent()}
          </Box>
        </Box>
      )}

      {/* 3. Main Working Window */}
      <Flex flex="1" direction="column" overflow="hidden" position="relative" bg={bgMain}>
        <Flex
          h="60px"
          align="center"
          justify="space-between"
          px={6}
          borderBottom="1px solid"
          borderColor={borderColor}
          bg={cv_white_gray_900}
        >
          <HStack spacing={4}>
            <Heading size="md" color={textColor}>
              {activeTab === 'dashboard' ? 'Workspace Dashboard' :
               activeTab === 'history' ? 'Conversation Explorer' :
               activeTab === 'research' ? 'Deep Research Assistant' :
               activeTab === 'review' ? 'Parallel Document Review' :
               activeTab === 'chronology' ? 'Timeline Chronology Parser' :
               activeTab === 'drafting' ? 'Legal Drafting Workspace' :
               activeTab === 'profile' ? 'Company Metadata Setup' :
               'System Preferences'}
            </Heading>
            {subscriptionStatus === 'departmental' ? (
              <Badge colorScheme="purple" fontSize="sm">Departmental</Badge>
            ) : (subscriptionStatus === 'pro' || subscriptionStatus === 'premium') ? (
              <Badge colorScheme="green" fontSize="sm">Pro</Badge>
            ) : (subscriptionStatus === 'standard' || subscriptionStatus === 'basic') ? (
              <Badge colorScheme="blue" fontSize="sm">Standard</Badge>
            ) : (
              <Tooltip label="Upgrade to Standard/Pro for more features">
                <Badge colorScheme="yellow" fontSize="sm">
                  {remainingMessages !== null ? `${remainingMessages} messages left today` : 'Free Plan'}
                </Badge>
              </Tooltip>
            )}
          </HStack>

          <HStack spacing={2}>
            {selectedFile && (
              <>
                <Button
                  size="sm"
                  colorScheme="green"
                  variant={scanStatus === 'scanned' ? 'solid' : 'outline'}
                  leftIcon={scanStatus === 'scanning' ? <Spinner size="xs" /> : <Icon as={MdDocumentScanner} />}
                  onClick={handleSmartScan}
                  isDisabled={scanStatus === 'scanning'}
                >
                  {scanStatus === 'scanned' ? 'Scanned ✓' : 'Smart Scan'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  leftIcon={<Icon as={FiEdit} />}
                  onClick={handleOpenEditor}
                >
                  Edit
                </Button>
              </>
            )}
            <Link to="/profile">
              <Avatar
                size="sm"
                name={user?.firstName}
                src={user?.profileImage}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ 
                  transform: 'scale(1.05)', 
                  boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)', 
                  border: '2px solid #d4af37' 
                }}
              />
            </Link>
            <Button
              size="sm"
              variant="outline"
              bg="transparent"
              color={cv_gray_700_white}
              borderColor={cv_gray_350_white}
              onClick={toggleLanguage}
              fontWeight="bold"
              transition="all 0.2s ease"
              _hover={{
                color: 'judicial.gold',
                borderColor: 'judicial.gold',
                bg: cv_rgba_212_175_55_0_05_rgba_212_175_55_0_08,
                transform: 'scale(1.02)'
              }}
              _active={{
                bg: 'transparent'
              }}
            >
              {language === 'en' ? 'EN' : 'हिं'}
            </Button>
            <Tooltip label="New Chat Session" placement="bottom">
              <IconButton
                icon={<AddIcon />}
                onClick={handleStartNewChat}
                variant="ghost"
                size="sm"
                aria-label="New chat session"
                color={cv_gray_600_gray_400}
                transition="all 0.2s ease"
                _hover={{
                  color: 'judicial.gold',
                  bg: cv_gray_100_rgba_212_175_55_0_08,
                  transform: 'scale(1.05)'
                }}
                _active={{
                  bg: 'transparent'
                }}
              />
            </Tooltip>
            <IconButton
              icon={<DeleteIcon />}
              onClick={handleClearChat}
              variant="ghost"
              size="sm"
              aria-label="Clear chat"
              color={cv_gray_600_gray_400}
              transition="all 0.2s ease"
              _hover={{
                color: 'judicial.gold',
                bg: cv_gray_100_rgba_212_175_55_0_08,
                transform: 'scale(1.05)'
              }}
              _active={{
                bg: 'transparent'
              }}
            />
          </HStack>
        </Flex>

        {/* Hidden input for uploader */}
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
          {renderWorkingWindowBody()}
        </Flex>
      </Flex>
 
      {/* 4. Right Split Panel (Dynamic based on active feature) */}
      {isRightPanelOpen && (
        <Box w="45%" minW="400px" maxW="600px" borderLeft="1px solid" borderColor={borderColor} bg={cv_white_to_gray_900} overflowY="auto" display="flex" flexDirection="column" zIndex={5}>
          {activeTab === 'chronology' && isTimelinePanelOpen && <TimelinePanel />}
          {activeTab === 'drafting' && isPrecedencePanelOpen && <PrecedencePanel />}
          {activeTab === 'drafting' && isCounterMakerPanelOpen && <CounterMakerPanel />}
          {activeTab === 'research' && isReportPanelOpen && <ResearchPanel />}
          {activeTab === 'review' && isBulkReviewPanelOpen && <BulkReviewPanel />}
        </Box>
      )}
    </Flex>

      {/* Clear Chat Password Confirmation Modal */}
      <Modal isOpen={isClearModalOpen} onClose={onClearModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Clear Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              This will permanently delete all your chat history. Please enter your password to confirm.
            </Text>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showClearPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={clearPassword}
                  onChange={(e) => setClearPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleConfirmClearChat();
                  }}
                />
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={showClearPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowClearPassword(!showClearPassword)}
                    aria-label={showClearPassword ? 'Hide password' : 'Show password'}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClearModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmClearChat}
              isLoading={isClearing}
              loadingText="Clearing..."
            >
              Clear All Chats
            </Button>
          </ModalFooter>
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
          onSessionUpdate={refreshEditSession}
          selectedFile={selectedFile}
          scanStatus={scanStatus}
          formatMetadata={formatMetadata}
          scanResults={scanResults}
          smartSuggestions={smartSuggestions}
          htmlContent={htmlContent}
          language={language}
        />
      </Suspense>

      {/* Document Fields Modal - Form-based field collection */}
      <DocumentFieldsModal
        isOpen={isFieldsModalOpen}
        onClose={handleFieldsFormClose}
        onSubmit={handleFieldsFormSubmit}
        templateTitle={fieldsModalData?.templateTitle || 'Document'}
        fields={fieldsModalData?.fields || []}
        initialValues={fieldsModalData?.initialValues || {}}
        language={language}
        isEditMode={isEditingDocument}
      />

      {/* Template Browser Modal */}
      <TemplateBrowser
        isOpen={isTemplateBrowserOpen}
        onClose={() => setIsTemplateBrowserOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        language={language}
        token={token}
      />

      {/* Document Type Selector Modal */}
      <DocumentTypeSelector
        isOpen={isDocTypeSelectorOpen}
        onClose={() => setIsDocTypeSelectorOpen(false)}
        onSelectDocumentType={handleDocumentTypeSelected}
        language={language}
      />

      {/* Legal Guidance Modal */}
      <LegalGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        onComplete={handleGuidanceComplete}
        language={language}
      />

      {/* Complaint Form Modal */}
      <ComplaintFormModal
        isOpen={isComplaintFormOpen}
        onClose={handleComplaintFormClose}
        onSubmit={handleComplaintFormSubmit}
        language={language}
        initialContext={lastGeneratedComplaint?.data || complaintContext}
      />

      {/* Template Design Selector Modal */}
      <TemplateDesignSelector
        isOpen={isDesignSelectorOpen}
        onClose={handleDesignSelectorClose}
        onSkip={handleDesignSelectorSkip}
        onSelect={handleDesignSelected}
        category={pendingFormGeneration?.category || ''}
        language={language}
        isLoading={isGenerating}
      />

      {/* Scan Report Modal */}
      <Modal isOpen={isScanReportOpen} onClose={() => setIsScanReportOpen(false)} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg={cv_white_gray_800} borderRadius="xl" mx={4}>
          <ModalHeader pb={2}>
            <HStack spacing={3}>
              <Icon as={MdDocumentScanner} color="green.400" boxSize={6} />
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  {language === 'hi' ? 'स्कैन रिपोर्ट' : 'Scan Report'}
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                  {selectedFile?.fileName || 'Document'}
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <VStack spacing={3} align="stretch">
              {/* Document Type */}
              <Box p={3} bg={cv_blue_50_blue_900} borderRadius="md" borderLeft="3px solid" borderLeftColor="blue.400">
                <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" mb={1}>
                  {language === 'hi' ? 'दस्तावेज़ प्रकार' : 'Document Type'}
                </Text>
                <Text fontSize="md" fontWeight="600">
                  {scanResults?.documentType || 'General Document'}
                </Text>
              </Box>

              {/* Structure */}
              {scanResults?.structure && (
                <Box p={3} bg={cv_purple_50_purple_900} borderRadius="md" borderLeft="3px solid" borderLeftColor="purple.400">
                  <Text fontSize="xs" fontWeight="bold" color="purple.600" textTransform="uppercase" mb={1}>
                    {language === 'hi' ? 'संरचना' : 'Structure'}
                  </Text>
                  <HStack spacing={4} flexWrap="wrap">
                    <Badge colorScheme="purple" variant="subtle" px={2} py={1}>
                      {scanResults.structure.sectionCount || 0} Sections
                    </Badge>
                    <Badge colorScheme="blue" variant="subtle" px={2} py={1}>
                      {scanResults.structure.clauseCount || 0} Clauses
                    </Badge>
                  </HStack>
                  {scanResults.structure.title && (
                    <Text fontSize="sm" mt={1} color="gray.600">Title: {scanResults.structure.title}</Text>
                  )}
                </Box>
              )}

              {/* Formatting */}
              {formatMetadata && (
                <Box p={3} bg={cv_green_50_green_900} borderRadius="md" borderLeft="3px solid" borderLeftColor="green.400">
                  <Text fontSize="xs" fontWeight="bold" color="green.600" textTransform="uppercase" mb={1}>
                    {language === 'hi' ? 'फ़ॉर्मेटिंग' : 'Formatting Detected'}
                  </Text>
                  <HStack spacing={4} fontSize="sm" flexWrap="wrap">
                    <Text>Font: <strong>{String(formatMetadata.defaultFont || 'N/A')}</strong></Text>
                    <Text>Size: <strong>{String(formatMetadata.defaultFontSize || 'N/A')}pt</strong></Text>
                    <Text>Page: <strong>{typeof formatMetadata.pageSize === 'object' ? (formatMetadata.pageSize?.name || 'A4') : String(formatMetadata.pageSize || 'A4')}</strong></Text>
                  </HStack>
                </Box>
              )}

              {/* Suggestions Summary */}
              <Box p={3} bg={cv_orange_50_orange_900} borderRadius="md" borderLeft="3px solid" borderLeftColor="orange.400">
                <Text fontSize="xs" fontWeight="bold" color="orange.600" textTransform="uppercase" mb={1}>
                  {language === 'hi' ? 'AI सुझाव' : 'AI Suggestions'}
                </Text>
                <Text fontSize="md" fontWeight="600">
                  {smartSuggestions.length} {language === 'hi' ? 'सुझाव मिले' : `suggestion${smartSuggestions.length !== 1 ? 's' : ''} found`}
                </Text>
                {smartSuggestions.length > 0 && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {language === 'hi' ? 'एडिटर में सुझाव देखें और लागू करें' : 'Review and apply suggestions in the editor'}
                  </Text>
                )}
              </Box>

              {/* Risk Analysis */}
              {scanResults?.riskAnalysis?.risks?.length > 0 && (
                <Box p={3} bg={cv_red_50_red_900} borderRadius="md" borderLeft="3px solid" borderLeftColor="red.400">
                  <Text fontSize="xs" fontWeight="bold" color="red.600" textTransform="uppercase" mb={1}>
                    {language === 'hi' ? 'जोखिम' : 'Risks Found'}
                  </Text>
                  <VStack spacing={1} align="stretch">
                    {scanResults.riskAnalysis.risks.slice(0, 3).map((risk, i) => (
                      <Text key={i} fontSize="xs" color="gray.600">
                        • {risk.title || risk.description || risk.type}
                      </Text>
                    ))}
                    {scanResults.riskAnalysis.risks.length > 3 && (
                      <Text fontSize="xs" color="gray.400">+{scanResults.riskAnalysis.risks.length - 3} more...</Text>
                    )}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter pt={2} gap={2}>
            <Button variant="ghost" size="sm" onClick={() => setIsScanReportOpen(false)}>
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              leftIcon={<Icon as={FiEdit} />}
              onClick={() => {
                setIsScanReportOpen(false);
                handleOpenEditor();
              }}
            >
              {language === 'hi' ? 'एडिटर में खोलें' : 'Open in Editor'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Onboarding Spatial Card Modal */}
      <Modal isOpen={user && !user.companySlug} closeOnOverlayClick={false} closeOnEsc={false} isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent bg={headerBg} borderColor={borderColor} borderWidth={1} p={6} m={4}>
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
                  colorScheme="blue"
                  bg="judicial.gold"
                  color="judicial.dark"
                  _hover={{ bg: 'judicial.lightGold' }}
                  w="full"
                  isLoading={isOnboardingSubmitLoading}
                  mt={2}
                >
                  Create Permanent Dashboard
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Multi-File Feature Continuation Confirmation Modal */}
      <Modal isOpen={isMultiFileModalOpen} onClose={() => setIsMultiFileModalOpen(false)} isCentered size="md">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="2xl" p={2} bg={cv_white_gray_900} border="1px solid" borderColor="judicial.gold">
          <ModalHeader color={textColor} pt={4} fontSize="md" fontWeight="bold">
            Start New Chat or Continue?
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="start">
              <Text fontSize="sm" color={cv_gray_600_gray_400} lineHeight="1.5">
                You are starting <strong>{multiFilePendingAction === 'chronology' ? 'Timeline Chronology' : 'Parallel Document Review'}</strong>.
                Would you like to start a brand new chat session for this analysis or continue in your current conversation?
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="outline"
              size="sm"
              borderRadius="xl"
              onClick={() => handleConfirmMultiFileChoice(false)}
            >
              Continue in Current Chat
            </Button>
            <Button
              bg="judicial.gold"
              color="judicial.dark"
              size="sm"
              borderRadius="xl"
              fontWeight="bold"
              _hover={{ bg: 'judicial.lightGold' }}
              onClick={() => handleConfirmMultiFileChoice(true)}
            >
              Start New Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdvancedChatProvider>
  );
};

export default ChatPage;
