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
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, DeleteIcon, AttachmentIcon, ViewIcon, ViewOffIcon, AddIcon } from '@chakra-ui/icons';
import { RiSendPlaneFill } from 'react-icons/ri';
import { FiMaximize2, FiFileText, FiMic, FiMicOff, FiGlobe, FiRefreshCw, FiEdit, FiZap, FiGrid, FiMessageSquare, FiCpu, FiLayers, FiClock, FiSettings } from 'react-icons/fi';
import { MdDocumentScanner } from 'react-icons/md';
import axios from 'axios';
import ChatMessage from '../../../chat-advanced/components/ChatMessage';
import { useAuth } from '../../../chat-advanced/AuthBridge';
import { profileAPI, chatAPI } from '../../../lib/api';
import { Link, useParams, useNavigate } from 'react-router-dom';
import fileService from '../../../chat-advanced/services/fileService';
import researchService from '../../../chat-advanced/services/researchService';
import chronologyService from '../../../chat-advanced/services/chronologyService';
import precedenceService from '../../../chat-advanced/services/precedenceService';
import counterMakerService from '../../../chat-advanced/services/counterMakerService';
import bulkReviewService from '../../../chat-advanced/services/bulkReviewService';
import { FaFile, FaTimes, FaPaperclip, FaEdit, FaDownload, FaRobot } from 'react-icons/fa';
const FullPageEditor = lazy(() => import('../../../chat-advanced/components/FullPageEditor'));
import DocumentFieldsModal from '../../../chat-advanced/components/DocumentFieldsModal';
import PostDownloadOptions from '../../../chat-advanced/components/PostDownloadOptions';
import TemplateBrowser from '../../../chat-advanced/components/TemplateBrowser';
import DocumentTypeSelector from '../../../chat-advanced/components/DocumentTypeSelector';
import LegalGuidanceModal from '../../../chat-advanced/components/LegalGuidanceModal';
import ComplaintFormModal from '../../../chat-advanced/components/ComplaintFormModal';
import TemplateDesignSelector from '../../../chat-advanced/components/TemplateDesignSelector';
import draftService from '../../../chat-advanced/services/draftService';
import { API_BASE_URL as BASE_URL } from '../../../chat-advanced/constants';
import { useAdvancedChat } from '../AdvancedChatContext';

const ChatPage = () => {
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

  const ctx = useAdvancedChat();
  const activeTab = ctx.activeTab;


  const {
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    isInitialLoad, setIsInitialLoad,
    remainingMessages, setRemainingMessages,
    subscriptionStatus, setSubscriptionStatus,
    isUploading, setIsUploading,
    uploadProgress, setUploadProgress,
    selectedFile, setSelectedFile,
    analyzingFile, setAnalyzingFile
  } = ctx;
  const uploading = isUploading; // alias

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
  const { intentOverride, setIntentOverride, intentLabel, setIntentLabel } = ctx;

  // Edit document state
  const {
    isEditMode, setIsEditMode,
    editSessionActive, setEditSessionActive,
    editChangesCount, setEditChangesCount,
    documentAnalysis, setDocumentAnalysis,
    isFullEditorOpen, setIsFullEditorOpen
  } = ctx;
  const [editSession, setEditSession] = useState(null); // Keep editSession local if not in context

  // Smart Scanner state
  const {
    scanStatus, setScanStatus,
    scanResults, setScanResults,
    formatMetadata, setFormatMetadata,
    htmlContent, setHtmlContent
  } = ctx;
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [isScanReportOpen, setIsScanReportOpen] = useState(false); // Scan report modal

  // Deep Research state
  const {
    researchSessionId, setResearchSessionId,
    researchStatus, setResearchStatus,
    researchResults, setResearchResults,
    researchStartTime, setResearchStartTime,
    researchEta, setResearchEta,
    researchElapsed, setResearchElapsed,
    isReportPanelOpen, setIsReportPanelOpen,
    researchAgentStage, setResearchAgentStage,
  } = ctx;
  const researchPollRef = useRef(null);
  const researchTimerRef = useRef(null);

  // Chronology state
  const {
    chronologySessionId, setChronologySessionId,
    chronologyStatus, setChronologyStatus,
    chronologyResults, setChronologyResults,
    chronologyElapsed, setChronologyElapsed,
    chronologyEta, setChronologyEta,
    chronologyAgentStage, setChronologyAgentStage,
    isTimelinePanelOpen, setIsTimelinePanelOpen,
    chronologyFiles, setChronologyFiles,
  } = ctx;
  const chronologyPollRef = useRef(null);
  const chronologyTimerRef = useRef(null);

  // Parallel Review state
  const {
    reviewFiles, setReviewFiles,
    reviewStatus, setReviewStatus,
    bulkReviewSessionId, setBulkReviewSessionId,
    bulkReviewResults, setBulkReviewResults,
    bulkReviewElapsed, setBulkReviewElapsed,
    bulkReviewEta, setBulkReviewEta,
    isBulkReviewPanelOpen, setIsBulkReviewPanelOpen,
  } = ctx;
  const bulkReviewPollRef = useRef(null);
  const bulkReviewTimerRef = useRef(null);

  // Drafting Tools State
  const { activeDraftingTool, setActiveDraftingTool } = ctx;

  // Precedence State
  const {
    precedenceSessionId, setPrecedenceSessionId,
    precedenceStatus, setPrecedenceStatus,
    precedenceResults, setPrecedenceResults,
    isPrecedencePanelOpen, setIsPrecedencePanelOpen,
  } = ctx;
  const precedencePollRef = useRef(null);

  // Counter Maker State
  const {
    counterMakerSessionId, setCounterMakerSessionId,
    counterMakerStatus, setCounterMakerStatus,
    counterMakerResults, setCounterMakerResults,
    counterMakerFacts, setCounterMakerFacts,
    isCounterMakerPanelOpen, setIsCounterMakerPanelOpen,
  } = ctx;
  const counterMakerPollRef = useRef(null);

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
  const [lastGeneratedComplaint, setLastGeneratedComplaint] = useState(null);

  // Counter Maker State
  const [counterMakerFileId, setCounterMakerFileId] = useState(null); // Store last generated complaint data for editing

  // Post-download options state (shown after successful document generation)
  const [showPostDownloadOptions, setShowPostDownloadOptions] = useState(false);
  const [lastGeneratedTemplate, setLastGeneratedTemplate] = useState(null); // { path, title }

  // Template Design Selector state (shown after form collection, before generation)
  const [isDesignSelectorOpen, setIsDesignSelectorOpen] = useState(false);
  const [pendingFormGeneration, setPendingFormGeneration] = useState(null); // { type: 'form'|'complaint', data, category }
  const [selectedDesignConfig, setSelectedDesignConfig] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false); // Ã°Å¸â€Â Guard: prevent duplicate generation

  // Form data persistence for editing
  const [lastSubmittedFields, setLastSubmittedFields] = useState(null); // Store last form submission for edit
  const [isEditingDocument, setIsEditingDocument] = useState(false); // Flag to track if we're editing vs creating

  // Ã°Å¸â€ â€¢ Track form closure without submission for recovery
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

  // --- Session Hydration ---
  useEffect(() => {
    if (activeTab === 'research' && researchResults?.chatHistory) {
      setMessages(researchResults.chatHistory);
    } else if (activeTab === 'chronology' && chronologyResults?.chatHistory) {
      setMessages(chronologyResults.chatHistory);
    } else if (activeTab === 'review' && bulkReviewResults?.chatHistory) {
      setMessages(bulkReviewResults.chatHistory);
    } else if (activeTab === 'drafting') {
      if (activeDraftingTool === 'precedence' && precedenceResults?.chatHistory) {
        setMessages(precedenceResults.chatHistory);
      } else if (activeDraftingTool === 'counter_maker' && counterMakerResults?.chatHistory) {
        setMessages(counterMakerResults.chatHistory);
      }
    }
  }, [
    activeTab, 
    activeDraftingTool,
    researchResults, 
    chronologyResults, 
    bulkReviewResults, 
    precedenceResults, 
    counterMakerResults, 
    setMessages
  ]);

  // Language preference state (en = English, hi = Hindi)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('chatLanguage') || 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('chatLanguage', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    toast({
      title: language === 'en' ? 'Ã Â¤Â­Ã Â¤Â¾Ã Â¤Â·Ã Â¤Â¾ Ã Â¤Â¬Ã Â¤Â¦Ã Â¤Â²Ã Â¥â‚¬ Ã Â¤â€”Ã Â¤Ë†: Ã Â¤Â¹Ã Â¤Â¿Ã Â¤â€šÃ Â¤Â¦Ã Â¥â‚¬' : 'Language changed: English',
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headerBg = useColorModeValue('white', 'gray.800');
  const bgMain = useColorModeValue('gray.50', 'gray.900');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get language-aware welcome message
  const getWelcomeMessage = () => {
    return language === 'hi'
      ? "Ã Â¤Â¨Ã Â¤Â®Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¥â€¡! Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€š Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¤Â¾ AI Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤Â¹Ã Â¤Â¾Ã Â¤Â¯Ã Â¤â€¢ Ã Â¤Â¹Ã Â¥â€šÃ Â¤ÂÃ Â¥Â¤ Ã Â¤â€ Ã Â¤Å“ Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€š Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â‚¬ Ã Â¤â€¢Ã Â¥Ë†Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â®Ã Â¤Â¦Ã Â¤Â¦ Ã Â¤â€¢Ã Â¤Â° Ã Â¤Â¸Ã Â¤â€¢Ã Â¤Â¤Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥â€šÃ Â¤Â?"
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
          title: language === 'hi' ? 'Ã Â¤Å¡Ã Â¥Ë†Ã Â¤Å¸ Ã Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error loading chat',
          description: error.response?.data?.message || (language === 'hi' ? 'Ã Â¤Å¡Ã Â¥Ë†Ã Â¤Å¸ Ã Â¤â€¡Ã Â¤Â¤Ã Â¤Â¿Ã Â¤Â¹Ã Â¤Â¾Ã Â¤Â¸ Ã Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¨Ã Â¤Â¹Ã Â¥â‚¬Ã Â¤â€š Ã Â¤Â¹Ã Â¥â€¹ Ã Â¤Â¸Ã Â¤â€¢Ã Â¤Â¾' : 'Could not load chat history'),
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
    const hindiWelcome = "Ã Â¤Â¨Ã Â¤Â®Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¥â€¡! Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€š Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¤Â¾ AI Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤Â¹Ã Â¤Â¾Ã Â¤Â¯Ã Â¤â€¢ Ã Â¤Â¹Ã Â¥â€šÃ Â¤ÂÃ Â¥Â¤ Ã Â¤â€ Ã Â¤Å“ Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€š Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â‚¬ Ã Â¤â€¢Ã Â¥Ë†Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â®Ã Â¤Â¦Ã Â¤Â¦ Ã Â¤â€¢Ã Â¤Â° Ã Â¤Â¸Ã Â¤â€¢Ã Â¤Â¤Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥â€šÃ Â¤Â?";
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
    e?.preventDefault();
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

    // Mark all previous messages' action buttons as inactive
    setMessages((prev) => prev.map(msg => ({
      ...msg,
      actionsActive: false
    })));

    const userMessage = input.trim();
    console.log('Sending message:', userMessage);
    setInput('');
    setMessages(prev => {
      const newMessages = [...prev, { role: 'user', content: userMessage }];
      return newMessages;
    });
    setIsLoading(true);

    // Hide post-download options when user sends a new message
    setShowPostDownloadOptions(false);

    try {
      let response;

      // Agent 4 Q&A: Route to research chat if research is complete
      if (activeTab === 'research' && researchSessionId && ['completed', 'completed_with_errors'].includes(researchStatus)) {
        try {
          const agent4Response = await researchService.chatWithAgent4(researchSessionId, userMessage);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: agent4Response.reply || 'No response from research assistant.' }
          ]);
        } catch (err) {
          console.error('Agent 4 chat error:', err);
          const errorMsg = err?.response?.data?.code === 'GUEST_LIMIT_EXCEEDED'
            ? err.response.data.message
            : 'Failed to get response from research assistant.';
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `⚠️ ${errorMsg}` }
          ]);
        }
        setIsLoading(false);
        return;
      }

      // Precedence Analysis Q&A
      if (activeDraftingTool === 'precedence' && precedenceSessionId && precedenceStatus === 'completed') {
        try {
          const precedenceResponse = await precedenceService.chatWithAgent(precedenceSessionId, userMessage);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: precedenceResponse.reply || 'No response from precedence assistant.' }
          ]);
        } catch (err) {
          console.error('Precedence chat error:', err);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: '⚠️ Failed to get response from precedence assistant.' }
          ]);
        }
        setIsLoading(false);
        return;
      }

      // Counter Maker Fact Collection
      if (intentOverride === 'COUNTER_MAKER_COLLECT_FACTS') {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Thank you. I am now drafting the Counter Affidavit based on your defenses...' }
        ]);
        setIntentOverride(null); // Clear override
        startCounterMaker(counterMakerFileId, userMessage);
        setIsLoading(false);
        return;
      }

      // Parallel Review Q&A: Route to bulk review chat
      if (activeTab === 'review' && bulkReviewSessionId && ['completed', 'completed_with_errors'].includes(reviewStatus)) {
        try {
          const bulkResponse = await bulkReviewService.chat(bulkReviewSessionId, userMessage);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: bulkResponse.reply || 'No response from parallel review assistant.' }
          ]);
        } catch (err) {
          console.error('Bulk review chat error:', err);
          const errorMsg = err?.response?.data?.code === 'GUEST_LIMIT_EXCEEDED'
            ? err.response.data.message
            : 'Failed to get response from parallel review assistant.';
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `⚠️ ${errorMsg}` }
          ]);
        }
        setIsLoading(false);
        return;
      }



      // Counter Maker Q&A
      if (activeDraftingTool === 'counter_maker' && counterMakerSessionId && counterMakerStatus === 'completed') {
        try {
          const counterResponse = await counterMakerService.chatWithAgent(counterMakerSessionId, userMessage);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: counterResponse.reply || 'No response from counter maker assistant.' }
          ]);
        } catch (err) {
          console.error('Counter Maker chat error:', err);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: 'âš ï¸ Failed to get response from counter maker assistant.' }
          ]);
        }
        setIsLoading(false);
        return;
      }

      // Chronology Q&A: Route to chronology chat if chronology is complete
      if (activeTab === 'chronology' && chronologySessionId && ['completed', 'completed_with_errors'].includes(chronologyStatus)) {
        try {
          const chronoResponse = await chronologyService.chatWithAgent(chronologySessionId, userMessage);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: chronoResponse.reply || 'No response from chronology assistant.' }
          ]);
        } catch (err) {
          console.error('Chronology chat error:', err);
          const errorMsg = err?.response?.data?.code === 'GUEST_LIMIT_EXCEEDED'
            ? err.response.data.message
            : 'Failed to get response from chronology assistant.';
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `⚠️Ã¯Â¸Â ${errorMsg}` }
          ]);
        }
        setIsLoading(false);
        return;
      }

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
          console.log('Ã°Å¸â€œÅ  Messages after adding assistant response:', newMessages.length);
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
      console.error('Ã¢ÂÅ’ [openFieldsModalWithSchema] No templatePath provided');
      throw new Error('Template path is required');
    }

    try {
      console.log('Ã°Å¸â€â€ž [openFieldsModalWithSchema] Fetching schema from backend...');
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
      console.error('Ã¢ÂÅ’ [openFieldsModalWithSchema] Schema fetch failed:', schemaError);
      console.error('Schema error details:', {
        message: schemaError.message,
        response: schemaError.response?.data,
        status: schemaError.response?.status
      });

      // If no missingFields fallback, throw the error
      if (!missingFields || missingFields.length === 0) {
        throw new Error(`Failed to load template schema: ${schemaError.response?.data?.message || schemaError.message}`);
      }

      console.warn('⚠️Ã¯Â¸Â [openFieldsModalWithSchema] Using missingFields fallback');
      setFieldsModalData({
        templatePath,
        templateTitle: templateTitle || (language === 'hi' ? 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼' : 'Document'),
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
    
    // Handle the case where actionTypeRaw is an object (e.g. from sidebar buttons)
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
        console.log('Ã¢Å¡â€“Ã¯Â¸Â PRECEDENCE_ANALYSIS action triggered');
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
        console.log('Ã°Å¸â€œÂ RESUME_FORM action triggered with data:', partialFormData);

        if (partialFormData) {
          await openFieldsModalWithSchema({
            templatePath: partialFormData.templatePath,
            templateTitle: partialFormData.templateTitle,
            missingFields: partialFormData.fields,
            initialValues: partialFormData.partialValues || {}
          });

          toast({
            title: language === 'hi' ? 'Ã°Å¸â€œÂ Ã Â¤Â«Ã Â¥â€°Ã Â¤Â°Ã Â¥ÂÃ Â¤Â® Ã Â¤Â«Ã Â¤Â¿Ã Â¤Â° Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤â€“Ã Â¥â€¹Ã Â¤Â²Ã Â¤Â¾ Ã Â¤â€”Ã Â¤Â¯Ã Â¤Â¾' : 'Ã°Å¸â€œÂ Form Resumed',
            description: language === 'hi'
              ? 'Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¤Â¾ Ã Â¤ÂªÃ Â¤Â¿Ã Â¤â€ºÃ Â¤Â²Ã Â¤Â¾ Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¾ Ã Â¤Â¬Ã Â¤Â¹Ã Â¤Â¾Ã Â¤Â² Ã Â¤â€¢Ã Â¤Â° Ã Â¤Â¦Ã Â¤Â¿Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤â€”Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†'
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
          suggestion?.label?.replace('Generate', '').replace('Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š', '').trim();

        const docMsg = language === 'hi'
          ? `Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂÃ Â¥â€¡ ${docType} Ã Â¤Å¡Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â¿Ã Â¤Â`
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
            title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
            description: error.response?.data?.message || (language === 'hi' ? 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤â€¦Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â°Ã Â¥â€¹Ã Â¤Â§ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â«Ã Â¤Â²' : 'Document request failed'),
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
        console.log('Ã°Å¸â€œÂ CREATE_DOCUMENT action triggered - opening document selector');
        setIntentOverride('DOCUMENT_REQUEST');
        // Don't show intent label for explicit Create Document action
        // setIntentLabel(language === 'hi' ? 'Ã°Å¸â€œÂ Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¨Ã Â¤Â¾' : 'Ã°Å¸â€œÂ Generate Document');
        setIsDocTypeSelectorOpen(true);
        break;
      }

      case 'GUIDE_ME': {
        // Open Legal Guidance modal instead of sending vague message
        console.log('🧭 GUIDE_ME action triggered - opening guidance modal');
        setIntentOverride('DOCUMENT_REQUEST');  // Guide Me is document creation, not separate mode
        // Don't show confusing "Guidance" label - it's just smart document creation
        // setIntentLabel(language === 'hi' ? 'Ã¢Å¡â€“Ã¯Â¸Â Ã Â¤Â®Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤â€”Ã Â¤Â¦Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¶Ã Â¤Â¨' : 'Ã¢Å¡â€“Ã¯Â¸Â Guidance');
        setIsGuidanceModalOpen(true);
        break;
      }

      case 'BROWSE_TEMPLATES': {
        // User clicked "Browse Templates" - open the template browser modal
        console.log('Ã°Å¸â€Â BROWSE_TEMPLATES action triggered - opening template browser');
        setIsTemplateBrowserOpen(true);
        break;
      }

      case 'LEGAL_INFORMATION':
        // User wants legal information
        setIntentOverride('LEGAL_INFORMATION');
        setIntentLabel(language === 'hi' ? 'Ã¢Å¡â€“Ã¯Â¸Â Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨Ã Â¥â‚¬ Ã Â¤Å“Ã Â¤Â¾Ã Â¤Â¨Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬' : 'Ã¢Å¡â€“Ã¯Â¸Â Legal Information');

        toast({
          title: language === 'hi' ? 'Ã¢Å¡â€“Ã¯Â¸Â Ã Â¤Å“Ã Â¤Â¾Ã Â¤Â¨Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬ Ã Â¤Â®Ã Â¥â€¹Ã Â¤Â¡' : 'Ã¢Å¡â€“Ã¯Â¸Â Information Mode',
          description: language === 'hi'
            ? 'Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€š Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â€¹ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨Ã Â¥â‚¬ Ã Â¤Å“Ã Â¤Â¾Ã Â¤Â¨Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬ Ã Â¤Â¦Ã Â¥â€šÃ Â¤â€šÃ Â¤â€”Ã Â¤Â¾'
            : "I'll provide legal information",
          status: 'info',
          duration: 3000,
        });
        break;

      case 'CASE_SEARCH': {
        // User wants to search cases - send contextual message and get results
        console.log('Ã°Å¸â€Â CASE_SEARCH action triggered - searching cases with context');

        disableOldButtons();

        // Extract context from previous messages
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];

        // Build contextual search query
        const searchContext = lastAssistantMessage?.content?.substring(0, 200) || '';
        const searchMsg = language === 'hi'
          ? `Ã Â¤â€¡Ã Â¤Â¸ Ã Â¤Â®Ã Â¤Â¾Ã Â¤Â®Ã Â¤Â²Ã Â¥â€¡ Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â¸Ã Â¤â€šÃ Â¤Â¬Ã Â¤â€šÃ Â¤Â§Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤â€¢Ã Â¥â€¡Ã Â¤Â¸ Ã Â¤â€“Ã Â¥â€¹Ã Â¤Å“Ã Â¥â€¡Ã Â¤â€š: ${lastUserMessage?.content || searchContext}`
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
            title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
            description: error.response?.data?.message || (language === 'hi' ? 'Ã Â¤â€¢Ã Â¥â€¡Ã Â¤Â¸ Ã Â¤â€“Ã Â¥â€¹Ã Â¤Å“ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â«Ã Â¤Â²' : 'Case search failed'),
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
        console.log('Ã°Å¸â€Â browse_templates (lowercase) action triggered - opening template browser');
        setIsTemplateBrowserOpen(true);
        break;
      }

      // Document type quick selections
      case 'DOC_RENT_AGREEMENT':
      case 'DOC_LEGAL_NOTICE':
      case 'DOC_AFFIDAVIT': {
        const docTypeMap = {
          'DOC_RENT_AGREEMENT': { en: 'rent agreement', hi: 'Ã Â¤â€¢Ã Â¤Â¿Ã Â¤Â°Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤Â¸Ã Â¤Â®Ã Â¤ÂÃ Â¥Å’Ã Â¤Â¤Ã Â¤Â¾' },
          'DOC_LEGAL_NOTICE': { en: 'legal notice', hi: 'Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨Ã Â¥â‚¬ Ã Â¤Â¨Ã Â¥â€¹Ã Â¤Å¸Ã Â¤Â¿Ã Â¤Â¸' },
          'DOC_AFFIDAVIT': { en: 'affidavit', hi: 'Ã Â¤Â¶Ã Â¤ÂªÃ Â¤Â¥ Ã Â¤ÂªÃ Â¤Â¤Ã Â¥ÂÃ Â¤Â°' }
        };
        const docType = docTypeMap[actionType];
        const docMsg = language === 'hi' ? `Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂÃ Â¥â€¡ ${docType.hi} Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†` : `I want to create a ${docType.en}`;

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
        const confirmMsg = language === 'hi' ? 'Ã Â¤Â¹Ã Â¤Â¾Ã Â¤Â, Ã Â¤â€¢Ã Â¤Â¸Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â® Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š' : 'Yes, create custom document';
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
        console.log('Ã°Å¸â€œÂ AI_DOC_FILLED action triggered');
        disableOldButtons(); // Disable old buttons before adding new message
        const filledMsg = language === 'hi' ? 'Ã Â¤Â­Ã Â¤Â°Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥ÂÃ Â¤â€  Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Å¡Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â¿Ã Â¤Â' : 'I want a filled document';
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
                templateTitle: response.data.templateTitle || (language === 'hi' ? 'Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨Ã Â¥â‚¬ Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼' : 'Legal Document'),
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
        const rawMsg = language === 'hi' ? 'Ã Â¤â€¢Ã Â¤Å¡Ã Â¥ÂÃ Â¤Å¡Ã Â¤Â¾ Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Å¡Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â¿Ã Â¤Â' : 'I want a raw template';
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
        const templateMsg = language === 'hi' ? 'Ã Â¤Â¹Ã Â¤Â¾Ã Â¤Â, Ã Â¤â€¡Ã Â¤Â¸ Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤â€°Ã Â¤ÂªÃ Â¤Â¯Ã Â¥â€¹Ã Â¤â€” Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š' : 'Yes, use this template';
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
                templateTitle: response.data.templateTitle || (language === 'hi' ? 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼' : 'Document'),
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
        const aiMsg = language === 'hi' ? 'AI Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š' : 'Generate with AI';
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
        console.log('Ã°Å¸â€œÂ NEW_DOCUMENT action triggered - showing document creation choice');

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
            ? 'Ã Â¤Â¬Ã Â¤Â¢Ã Â¤Â¼Ã Â¤Â¿Ã Â¤Â¯Ã Â¤Â¾! Ã Â¤â€ Ã Â¤Âª Ã Â¤â€¢Ã Â¥Ë†Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â¶Ã Â¥ÂÃ Â¤Â°Ã Â¥â€š Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤Å¡Ã Â¤Â¾Ã Â¤Â¹Ã Â¥â€¡Ã Â¤â€šÃ Â¤â€”Ã Â¥â€¡?'
            : 'Great! How would you like to start?',
          suggestedActions: language === 'hi'
            ? [
              { type: 'doc_choice', label: 'Ã°Å¸â€œÂ Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š', icon: 'Ã°Å¸â€œÂ', action: 'CREATE_DOCUMENT', description: 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â° Ã Â¤Å¡Ã Â¥ÂÃ Â¤Â¨Ã Â¥â€¡Ã Â¤â€š' },
              { type: 'doc_choice', label: '📚 Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤â€°Ã Â¤Å“Ã Â¤Â¼ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'Ã Â¤Â¸Ã Â¤Â­Ã Â¥â‚¬ Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Â¦Ã Â¥â€¡Ã Â¤â€“Ã Â¥â€¡Ã Â¤â€š' }
            ]
            : [
              { type: 'doc_choice', label: 'Ã°Å¸â€œÂ Create Document', icon: 'Ã°Å¸â€œÂ', action: 'CREATE_DOCUMENT', description: 'Choose document type' },
              { type: 'doc_choice', label: '📚 Browse Templates', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'View all templates' }
            ]
        };
        setMessages(prev => [...prev, choiceMessage]);
        break;
      }

      // Post-download action: Exit document mode
      case 'EXIT_DOCUMENT_MODE': {
        console.log('Ã¢ÂÅ’ EXIT_DOCUMENT_MODE action triggered');

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
          ? 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â®Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â° Ã Â¤Â¨Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â² Ã Â¤â€”Ã Â¤ÂÃ Â¥Â¤ Ã Â¤â€ Ã Â¤Âª Ã Â¤â€¢Ã Â¥ÂÃ Â¤â€º Ã Â¤â€Ã Â¤Â° Ã Â¤ÂªÃ Â¥â€šÃ Â¤â€º Ã Â¤Â¸Ã Â¤â€¢Ã Â¤Â¤Ã Â¥â€¡ Ã Â¤Â¹Ã Â¥Ë†Ã Â¤â€šÃ Â¥Â¤'
          : 'Exited document mode. You can ask me anything else.';

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: exitMsg
        }]);

        toast({
          title: language === 'hi' ? '✅ Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â° Ã Â¤Â¨Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â²Ã Â¥â€¡' : '✅ Exited',
          description: language === 'hi' ? 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â®Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â°' : 'Exited document mode',
          status: 'success',
          duration: 2000,
        });
        break;
      }

      // Post-download action: Rate experience
      case 'RATE_LIKE':
      case 'RATE_DISLIKE': {
        const isLike = action === 'RATE_LIKE';
        console.log(`${isLike ? 'Ã°Å¸â€˜Â' : 'Ã°Å¸â€˜Å½'} Rating:`, isLike ? 'LIKE' : 'DISLIKE');

        try {
          await axios.post(`${BASE_URL}/chat/rate-draft`,
            { rating: isLike ? 'like' : 'dislike', templatePath: lastGeneratedTemplate?.path },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );

          toast({
            title: language === 'hi' ? '✅ Ã Â¤Â§Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â¯Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Â¦!' : '✅ Thank you!',
            description: language === 'hi'
              ? 'Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â‚¬ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤Â¤Ã Â¤Â¿Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¿Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤Â¦Ã Â¤Â°Ã Â¥ÂÃ Â¤Å“ Ã Â¤â€¢Ã Â¥â‚¬ Ã Â¤â€”Ã Â¤Ë†'
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
        console.log('Ã¢Å“ÂÃ¯Â¸Â EDIT_DOCUMENT action triggered');

        // Check if it's a complaint or template document
        if (lastGeneratedComplaint) {
          // Reopen complaint modal with pre-filled data
          console.log('Ã¢Å“ÂÃ¯Â¸Â Editing complaint with data:', lastGeneratedComplaint.data);
          setIsComplaintFormOpen(true);
          // The ComplaintFormModal will receive initialData prop

          toast({
            title: language === 'hi' ? 'Ã¢Å“ÂÃ¯Â¸Â Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤ Ã Â¤Â¸Ã Â¤â€šÃ Â¤ÂªÃ Â¤Â¾Ã Â¤Â¦Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š' : 'Ã¢Å“ÂÃ¯Â¸Â Edit Complaint',
            description: language === 'hi'
              ? 'Ã Â¤ÂµÃ Â¤Â¿Ã Â¤ÂµÃ Â¤Â°Ã Â¤Â£ Ã Â¤â€¦Ã Â¤ÂªÃ Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š Ã Â¤â€Ã Â¤Â° Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â¨Ã Â¤Æ’ Ã Â¤Å“Ã Â¥â€¡Ã Â¤Â¨Ã Â¤Â°Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š'
              : 'Update details and regenerate',
            status: 'info',
            duration: 2000,
          });
        } else if (lastGeneratedTemplate && lastSubmittedFields) {
          // Reopen template modal with pre-filled data
          console.log('Ã¢Å“ÂÃ¯Â¸Â Editing template document');
          setIsEditingDocument(true);
          await openFieldsModalWithSchema({
            templatePath: lastGeneratedTemplate.path,
            templateTitle: lastGeneratedTemplate.title,
            missingFields: [],
            initialValues: lastSubmittedFields
          });

          toast({
            title: language === 'hi' ? 'Ã¢Å“ÂÃ¯Â¸Â Ã Â¤Â¸Ã Â¤â€šÃ Â¤ÂªÃ Â¤Â¾Ã Â¤Â¦Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š' : 'Ã¢Å“ÂÃ¯Â¸Â Edit Document',
            description: language === 'hi'
              ? 'Ã Â¤Â«Ã Â¤Â¼Ã Â¥â‚¬Ã Â¤Â²Ã Â¥ÂÃ Â¤Â¡ Ã Â¤Â®Ã Â¤Â¾Ã Â¤Â¨ Ã Â¤â€¦Ã Â¤ÂªÃ Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š Ã Â¤â€Ã Â¤Â° Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â¨Ã Â¤Æ’ Ã Â¤Å“Ã Â¥â€¡Ã Â¤Â¨Ã Â¤Â°Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š'
              : 'Update field values and regenerate',
            status: 'info',
            duration: 2000,
          });
        } else {
          // No document data available
          toast({
            title: language === 'hi' ? '⚠️Ã¯Â¸Â Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¾ Ã Â¤Â¨Ã Â¤Â¹Ã Â¥â‚¬Ã Â¤â€š Ã Â¤Â®Ã Â¤Â¿Ã Â¤Â²Ã Â¤Â¾' : '⚠️Ã¯Â¸Â Data Not Found',
            description: language === 'hi'
              ? 'Ã Â¤ÂªÃ Â¤Â¿Ã Â¤â€ºÃ Â¤Â²Ã Â¥â€¡ Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¾ Ã Â¤â€°Ã Â¤ÂªÃ Â¤Â²Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â§ Ã Â¤Â¨Ã Â¤Â¹Ã Â¥â‚¬Ã Â¤â€š Ã Â¤Â¹Ã Â¥Ë†'
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
          title: language === 'hi' ? '🤖 Ã Â¤â€˜Ã Â¤Å¸Ã Â¥â€¹-Ã Â¤Â¡Ã Â¤Â¿Ã Â¤Å¸Ã Â¥â€¡Ã Â¤â€¢Ã Â¥ÂÃ Â¤Å¸ Ã Â¤Â®Ã Â¥â€¹Ã Â¤Â¡' : '🤖 Auto-Detect Mode',
          description: language === 'hi'
            ? 'Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€š Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â€¡ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤Â¶Ã Â¥ÂÃ Â¤Â¨ Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤Â°Ã Â¥â€šÃ Â¤Âª Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤ÂªÃ Â¤Â¤Ã Â¤Â¾ Ã Â¤Â²Ã Â¤â€”Ã Â¤Â¾Ã Â¤Å Ã Â¤â€šÃ Â¤â€”Ã Â¤Â¾'
            : "I'll automatically detect your intent",
          status: 'info',
          duration: 3000,
        });
        break;

      case 'GENERATE_COMPLAINT': {
        // User clicked "Generate Complaint" - open structured form modal
        console.log('Ã°Å¸â€œÂ GENERATE_COMPLAINT action triggered - opening complaint form');

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
        console.log('Ã¢Å¡â€“Ã¯Â¸Â LEARN_MORE_LAW action triggered - generating detailed analysis');

        disableOldButtons();

        // Extract law references from previous conversation
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];

        // Add user message indicating they want more details
        const learnMoreMsg = language === 'hi'
          ? 'Ã Â¤â€¡Ã Â¤Â¸ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨ Ã Â¤â€¢Ã Â¥â€¡ Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â°Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤Â° Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â¬Ã Â¤Â¤Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š'
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
            ? 'Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â¶Ã Â¥ÂÃ Â¤Â²Ã Â¥â€¡Ã Â¤Â·Ã Â¤Â£ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿Ã Â¥Â¤ Ã Â¤â€¢Ã Â¥Æ’Ã Â¤ÂªÃ Â¤Â¯Ã Â¤Â¾ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â¨Ã Â¤Æ’ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤Â¯Ã Â¤Â¾Ã Â¤Â¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€šÃ Â¥Â¤'
            : 'Error generating analysis. Please try again.';

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: errorMsg
          }]);

          toast({
            title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
            description: error.response?.data?.message || (language === 'hi' ? 'Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â¶Ã Â¥ÂÃ Â¤Â²Ã Â¥â€¡Ã Â¤Â·Ã Â¤Â£ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â«Ã Â¤Â²' : 'Failed to generate analysis'),
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
    // Ã°Å¸â€Â GUARD: Prevent double submission
    if (isGenerating) {
      console.warn('⚠️Ã¯Â¸Â  Generation already in progress, blocking form submission');
      toast({
        title: language === 'hi' ? 'Ã Â¤â€¢Ã Â¥Æ’Ã Â¤ÂªÃ Â¤Â¯Ã Â¤Â¾ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤Â¤Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š' : 'Please wait',
        description: language === 'hi' ? 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤ÂªÃ Â¤Â¹Ã Â¤Â²Ã Â¥â€¡ Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â¬Ã Â¤Â¨ Ã Â¤Â°Ã Â¤Â¹Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†' : 'Document is already being generated',
        status: 'info',
        duration: 2000,
      });
      return;
    }

    if (pendingFormGeneration) {
      console.warn('⚠️Ã¯Â¸Â  Pending generation already exists, blocking duplicate form submission');
      return;
    }

    if (!fieldsModalData?.templatePath) {
      toast({
        title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
        description: language === 'hi' ? 'Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Å“Ã Â¤Â¾Ã Â¤Â¨Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬ Ã Â¤Â¨Ã Â¤Â¹Ã Â¥â‚¬Ã Â¤â€š Ã Â¤Â®Ã Â¤Â¿Ã Â¤Â²Ã Â¥â‚¬' : 'Template information not found',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    console.log('Ã°Å¸â€œÂ Form submitted:', { templatePath: fieldsModalData.templatePath, fieldCount: Object.keys(fieldValues).length });

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

  // Ã°Å¸â€ â€¢ Handle form closure without submission
  const handleFieldsFormClose = (partialValues, isCancelled = false) => {
    console.log('🚪 [handleFieldsFormClose] Called', { isCancelled, hasPartialData: !!partialValues, isEditMode: isEditingDocument });

    if (isCancelled) {
      // User explicitly cancelled - return to main menu
      console.log('Ã°Å¸â€Â´ [handleFieldsFormClose] User cancelled draft flow - resetting server + client state');

      // Clear server-side pending sessions (Redis keys)
      (async () => {
        try {
          await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          console.log('✅ Server document session cleared on cancel');
        } catch (error) {
          console.warn('⚠️Ã¯Â¸Â Failed to clear server session on cancel:', error);
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
          ? 'Ã Â¤â€ Ã Â¤ÂªÃ Â¤Â¨Ã Â¥â€¡ Ã Â¤Â¡Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤Â«Ã Â¥ÂÃ Â¤Å¸ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¿Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤Â°Ã Â¤Â¦Ã Â¥ÂÃ Â¤Â¦ Ã Â¤â€¢Ã Â¤Â° Ã Â¤Â¦Ã Â¥â‚¬ Ã Â¤Â¹Ã Â¥Ë†Ã Â¥Â¤ Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€š Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â‚¬ Ã Â¤â€¢Ã Â¥Ë†Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â®Ã Â¤Â¦Ã Â¤Â¦ Ã Â¤â€¢Ã Â¤Â° Ã Â¤Â¸Ã Â¤â€¢Ã Â¤Â¤Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥â€šÃ Â¤â€š?'
          : 'You cancelled the draft process. How can I help you?',
        suggestedActions: language === 'hi' ? [
          { type: 'action', label: '📄 📄 Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨Ã Â¥â‚¬ Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š' },
          { type: 'action', label: '🧭 🧭 Ã Â¤Â®Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤â€”Ã Â¤Â¦Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¶Ã Â¤Â¨ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š', icon: '🧭', action: 'general_help', description: 'Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂÃ Â¥â€¡ Ã Â¤Â®Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤â€”Ã Â¤Â¦Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¶Ã Â¤Â¨ Ã Â¤Â¦Ã Â¥â€¡Ã Â¤â€š' },
          { type: 'action', label: '📚 📚 Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤â€°Ã Â¤Å“Ã Â¤Â¼ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'Ã Â¤â€°Ã Â¤ÂªÃ Â¤Â²Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â§ Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Â¦Ã Â¥â€¡Ã Â¤â€“Ã Â¥â€¡Ã Â¤â€š' },
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
      console.log('Ã°Å¸â€™Â¾ [handleFieldsFormClose] Saving partial data for recovery (initial fill)');

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
              label: 'Ã Â¤Â«Ã Â¥â€°Ã Â¤Â°Ã Â¥ÂÃ Â¤Â® Ã Â¤Â«Ã Â¤Â¿Ã Â¤Â° Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤â€“Ã Â¥â€¹Ã Â¤Â²Ã Â¥â€¡Ã Â¤â€š',
              icon: 'Ã°Å¸â€œÂ',
              action: 'RESUME_FORM',
              description: 'Ã Â¤â€¦Ã Â¤Â§Ã Â¥â€šÃ Â¤Â°Ã Â¤Â¾ Ã Â¤Â«Ã Â¥â€°Ã Â¤Â°Ã Â¥ÂÃ Â¤Â® Ã Â¤Â«Ã Â¤Â¿Ã Â¤Â° Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤â€“Ã Â¥â€¹Ã Â¤Â²Ã Â¥â€¡Ã Â¤â€š'
            } : {
              type: 'action',
              label: 'Resume Form',
              icon: 'Ã°Å¸â€œÂ',
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
    console.log('Ã°Å¸â€Â [TRACE] handleDesignSelected called with design:', design?.name || 'no design');

    // Ã°Å¸â€Â GUARD: Prevent duplicate generation
    if (isGenerating) {
      console.warn('⚠️Ã¯Â¸Â  [BLOCK] Generation already in progress, blocking handleDesignSelected');
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
        console.warn('⚠️Ã¯Â¸Â  [ERROR] No pending generation data found in handleDesignSelected');
        return;
      }

      console.log('🎨 [EXEC] Design selected - calling executor:', {
        designName: design?.name,
        type: pending.type,
        hasDesignConfig: !!designConfig,
        fontFamily: designConfig?.fontFamily
      });

      if (pending.type === 'form') {
        console.log('Ã°Å¸â€œÂ [CALL] Calling executeFormGeneration with designConfig');
        await executeFormGeneration(pending.data, designConfig);
      } else if (pending.type === 'complaint') {
        console.log('Ã¢Å¡â€“Ã¯Â¸Â  [CALL] Calling executeComplaintGeneration with designConfig');
        await executeComplaintGeneration(pending.data, designConfig);
      }
    } catch (error) {
      console.error('Ã¢ÂÅ’ [ERROR] Error during generation:', error);
    } finally {
      setIsGenerating(false); // Ã°Å¸â€â€œ Unlock generation
      console.log('Ã°Å¸â€â€œ [SET] isGenerating = false (in handleDesignSelected finally)');
    }
  };

  // Handle design selector close/skip (generate without custom design)
  // Ã°Å¸â€Â´ IMPORTANT: This should ONLY be called when user explicitly clicks "Skip"
  const handleDesignSelectorSkip = () => {
    console.log('Ã°Å¸â€Â [TRACE] handleDesignSelectorSkip called - user wants to skip design selection');

    // Ã°Å¸â€Â GUARD: Prevent duplicate generation
    if (isGenerating) {
      console.warn('⚠️Ã¯Â¸Â  [BLOCK] Generation already in progress, blocking handleDesignSelectorSkip');
      return;
    }

    // Ã°Å¸â€Â´ CRITICAL: Check if there's actually pending data before generating!
    if (!pendingFormGeneration) {
      console.log('Ã¢â€žÂ¹Ã¯Â¸Â  [SKIP] No pending generation data, just closing design selector');
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
      console.log('Ã¢ÂÂ­Ã¯Â¸Â  [EXEC] Skipping design selection - generating with defaults (NO designConfig)');

      // Generate without custom design
      if (pending.type === 'form') {
        console.log('Ã°Å¸â€œÂ [CALL] Calling executeFormGeneration WITHOUT designConfig (from skip action)');
        executeFormGeneration(pending.data, null);
      } else if (pending.type === 'complaint') {
        console.log('Ã¢Å¡â€“Ã¯Â¸Â  [CALL] Calling executeComplaintGeneration WITHOUT designConfig (from skip action)');
        executeComplaintGeneration(pending.data, null);
      }
    } catch (error) {
      console.error('Ã¢ÂÅ’ [ERROR] Error during generation:', error);
    } finally {
      setIsGenerating(false); // Ã°Å¸â€â€œ Unlock generation
      console.log('Ã°Å¸â€â€œ [SET] isGenerating = false (in handleDesignSelectorSkip finally)');
    }
  };

  // Handle design selector just closing (X button, Escape) - NO generation
  const handleDesignSelectorClose = () => {
    console.log('Ã°Å¸â€Â [TRACE] handleDesignSelectorClose called (modal X or Escape - NOT generating)');
    setIsDesignSelectorOpen(false);
    // Ã°Å¸â€Â´ IMPORTANT: Do NOT generate here! Only close the modal.
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
        { type: 'action', label: 'Ã Â¤Â¸Ã Â¤â€šÃ Â¤ÂªÃ Â¤Â¾Ã Â¤Â¦Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š', icon: 'Ã¢Å“ÂÃ¯Â¸Â', action: 'EDIT_DOCUMENT', description: 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¸Ã Â¤â€šÃ Â¤ÂªÃ Â¤Â¾Ã Â¤Â¦Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š' },
        { type: 'action', label: 'Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â° Ã Â¤Â¨Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â²Ã Â¥â€¡Ã Â¤â€š', icon: 'Ã¢Å“â€“Ã¯Â¸Â', action: 'EXIT_DOCUMENT_MODE', description: 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â®Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â° Ã Â¤Â¨Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â²Ã Â¥â€¡Ã Â¤â€š' },
        { type: 'rating', label: 'Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¤Â¾ Ã Â¤â€¦Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â­Ã Â¤Âµ Ã Â¤â€¢Ã Â¥Ë†Ã Â¤Â¸Ã Â¤Â¾ Ã Â¤Â°Ã Â¤Â¹Ã Â¤Â¾?', icon: 'Ã¢Â­Â', action: 'RATE_EXPERIENCE', description: 'Ã Â¤â€¦Ã Â¤ÂªÃ Â¤Â¨Ã Â¤Â¾ Ã Â¤â€¦Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â­Ã Â¤Âµ Ã Â¤Â°Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š' }
      ] : [
        { type: 'action', label: 'Edit Document', icon: 'Ã¢Å“ÂÃ¯Â¸Â', action: 'EDIT_DOCUMENT', description: 'Edit the generated document' },
        { type: 'action', label: 'Exit', icon: 'Ã¢Å“â€“Ã¯Â¸Â', action: 'EXIT_DOCUMENT_MODE', description: 'Exit document mode' },
        { type: 'rating', label: 'Rate your experience', icon: 'Ã¢Â­Â', action: 'RATE_EXPERIENCE', description: 'How was the draft process?' }
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
        title: language === 'hi' ? 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¤Ã Â¥Ë†Ã Â¤Â¯Ã Â¤Â¾Ã Â¤Â°!' : 'Document Ready!',
        description: language === 'hi' ? 'Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¤Â¾ Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¸Ã Â¤Â«Ã Â¤Â²Ã Â¤Â¤Ã Â¤Â¾Ã Â¤ÂªÃ Â¥â€šÃ Â¤Â°Ã Â¥ÂÃ Â¤ÂµÃ Â¤â€¢ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤â€”Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†' : 'Your document has been generated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Form generation error:', error);
      toast({
        title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
        description: error.response?.data?.message || (language === 'hi' ? 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â«Ã Â¤Â²' : 'Failed to generate document'),
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
    console.log('Ã°Å¸â€œÂ Submitting complaint form:', complaintData);

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
        ? `${complaintData.complaintType} Ã Â¤â€¢Ã Â¥â€¡ Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š: ${complaintData.againstWhom}`
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
          { type: 'action', label: 'Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤ Ã Â¤Â¸Ã Â¤â€šÃ Â¤ÂªÃ Â¤Â¾Ã Â¤Â¦Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š', icon: 'Ã¢Å“ÂÃ¯Â¸Â', action: 'EDIT_DOCUMENT', description: 'Ã Â¤Â®Ã Â¥Å’Ã Â¤Å“Ã Â¥â€šÃ Â¤Â¦Ã Â¤Â¾ Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤ Ã Â¤â€¢Ã Â¥â€¹ Ã Â¤Â¸Ã Â¤â€šÃ Â¤ÂªÃ Â¤Â¾Ã Â¤Â¦Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š' },
          { type: 'action', label: 'Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â° Ã Â¤Â¨Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â²Ã Â¥â€¡Ã Â¤â€š', icon: 'Ã¢Å“â€“Ã¯Â¸Â', action: 'EXIT_DOCUMENT_MODE', description: 'Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â®Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â° Ã Â¤Â¨Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â²Ã Â¥â€¡Ã Â¤â€š' },
          { type: 'rating', label: 'Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¤Â¾ Ã Â¤â€¦Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â­Ã Â¤Âµ Ã Â¤â€¢Ã Â¥Ë†Ã Â¤Â¸Ã Â¤Â¾ Ã Â¤Â°Ã Â¤Â¹Ã Â¤Â¾?', icon: 'Ã¢Â­Â', action: 'RATE_EXPERIENCE', description: 'Ã Â¤â€¦Ã Â¤ÂªÃ Â¤Â¨Ã Â¤Â¾ Ã Â¤â€¦Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â­Ã Â¤Âµ Ã Â¤Â°Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š' }
        ] : [
          { type: 'action', label: 'Edit Document', icon: 'Ã¢Å“ÂÃ¯Â¸Â', action: 'EDIT_DOCUMENT', description: 'Edit the generated complaint' },
          { type: 'action', label: 'Exit', icon: 'Ã¢Å“â€“Ã¯Â¸Â', action: 'EXIT_DOCUMENT_MODE', description: 'Exit document mode' },
          { type: 'rating', label: 'Rate your experience', icon: 'Ã¢Â­Â', action: 'RATE_EXPERIENCE', description: 'How was the complaint process?' }
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
          title: language === 'hi' ? '✅ Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤ Ã Â¤Â¤Ã Â¥Ë†Ã Â¤Â¯Ã Â¤Â¾Ã Â¤Â°!' : '✅ Complaint Ready!',
          description: language === 'hi' ? 'Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â‚¬ Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤ Ã Â¤Â¸Ã Â¤Â«Ã Â¤Â²Ã Â¤Â¤Ã Â¤Â¾Ã Â¤ÂªÃ Â¥â€šÃ Â¤Â°Ã Â¥ÂÃ Â¤ÂµÃ Â¤â€¢ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Ë† Ã Â¤â€”Ã Â¤Ë† Ã Â¤Â¹Ã Â¥Ë†' : 'Your complaint has been generated successfully',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Complaint generation failed:', error);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'hi'
          ? 'Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿Ã Â¥Â¤ Ã Â¤â€¢Ã Â¥Æ’Ã Â¤ÂªÃ Â¤Â¯Ã Â¤Â¾ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â¨Ã Â¤Æ’ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤Â¯Ã Â¤Â¾Ã Â¤Â¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€šÃ Â¥Â¤'
          : 'Error generating complaint. Please try again.'
      }]);

      toast({
        title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
        description: error.response?.data?.message || (language === 'hi' ? 'Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â«Ã Â¤Â²' : 'Failed to generate complaint'),
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
      console.log('Ã°Å¸â€Â´ [handleComplaintFormClose] User cancelled complaint process - showing main menu');

      // Clear complaint state
      setLastGeneratedComplaint(null);

      // Show main menu message
      const mainMenuMessage = {
        role: 'assistant',
        content: language === 'hi'
          ? 'Ã Â¤â€ Ã Â¤ÂªÃ Â¤Â¨Ã Â¥â€¡ Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¿Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤Â°Ã Â¤Â¦Ã Â¥ÂÃ Â¤Â¦ Ã Â¤â€¢Ã Â¤Â° Ã Â¤Â¦Ã Â¥â‚¬ Ã Â¤Â¹Ã Â¥Ë†Ã Â¥Â¤ Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€š Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â‚¬ Ã Â¤â€¢Ã Â¥Ë†Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤Â®Ã Â¤Â¦Ã Â¤Â¦ Ã Â¤â€¢Ã Â¤Â° Ã Â¤Â¸Ã Â¤â€¢Ã Â¤Â¤Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥â€šÃ Â¤â€š?'
          : 'You cancelled the complaint process. How can I help you?',
        suggestedActions: language === 'hi' ? [
          { type: 'action', label: '📄 📄 Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨Ã Â¥â‚¬ Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š' },
          { type: 'action', label: '🧭 🧭 Ã Â¤Â®Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤â€”Ã Â¤Â¦Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¶Ã Â¤Â¨ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š', icon: '🧭', action: 'general_help', description: 'Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂÃ Â¥â€¡ Ã Â¤Â®Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤â€”Ã Â¤Â¦Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¶Ã Â¤Â¨ Ã Â¤Â¦Ã Â¥â€¡Ã Â¤â€š' },
          { type: 'action', label: '📚 📚 Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤â€°Ã Â¤Å“Ã Â¤Â¼ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'Ã Â¤â€°Ã Â¤ÂªÃ Â¤Â²Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â§ Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Â¦Ã Â¥â€¡Ã Â¤â€“Ã Â¥â€¡Ã Â¤â€š' },
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
      ? `Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€šÃ Â¤Â¨Ã Â¥â€¡ "${template.displayTitle}" Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥Â Ã Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Å¡Ã Â¥Â Ã Â¤Â¨Ã Â¤Â¾`
      : `I selected the "${template.displayTitle}" template`;

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIntentOverride('DOCUMENT_REQUEST');

    try {
      setIsLoading(true);

      // **SKIP BACKEND CALL** - directly open fields modal with schema
      console.log('📋 [handleTemplateSelect] Opening fields modal directly...');

      await openFieldsModalWithSchema({
        templatePath: template.relPath,
        templateTitle: template.displayTitle,
        missingFields: null // Will fetch schema from backend
      });

      console.log('✅ [handleTemplateSelect] Fields modal opened successfully');

    } catch (error) {
      console.error('Ã¢ÂÅ’ [handleTemplateSelect] Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });

      toast({
        title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
        description: error.response?.data?.message || error.message || (language === 'hi' ? 'Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â«Ã Â¤Â²' : 'Failed to load template'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      // Still show a helpful message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'hi'
          ? `Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â®Ã Â¤Â¾ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€š, "${template.displayTitle}" Ã Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¤Ã Â¥â€¡ Ã Â¤Â¸Ã Â¤Â®Ã Â¤Â¯ Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿ Ã Â¤Â¹Ã Â¥ÂÃ Â¤Ë†Ã Â¥Â¤ Ã Â¤â€¢Ã Â¥Æ’Ã Â¤ÂªÃ Â¤Â¯Ã Â¤Â¾ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â¨Ã Â¤Æ’ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤Â¯Ã Â¤Â¾Ã Â¤Â¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€šÃ Â¥Â¤`
          : `Sorry, there was an error loading "${template.displayTitle}". Please try again.`
      }]);
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
        title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
        description: language === 'hi' ? 'Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Å“Ã Â¤Â¾Ã Â¤Â¨Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬ Ã Â¤â€°Ã Â¤ÂªÃ Â¤Â²Ã Â¤Â¬Ã Â¥ÂÃ Â¤Â§ Ã Â¤Â¨Ã Â¤Â¹Ã Â¥â‚¬Ã Â¤â€š' : 'Template information not available',
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
        title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
        description: language === 'hi' ? 'Ã Â¤Å¸Ã Â¥â€¡Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂªÃ Â¤Â²Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â«Ã Â¤Â²' : 'Failed to load template',
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
        ? 'Ã°Å¸â€œÂ Ã Â¤â€¢Ã Â¥â€¹Ã Â¤Ë† Ã Â¤Â¬Ã Â¤Â¾Ã Â¤Â¤ Ã Â¤Â¨Ã Â¤Â¹Ã Â¥â‚¬Ã Â¤â€š! Ã Â¤â€¢Ã Â¥Æ’Ã Â¤ÂªÃ Â¤Â¯Ã Â¤Â¾ Ã Â¤Â¬Ã Â¤Â¤Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€š Ã Â¤â€¢Ã Â¤Â¿ Ã Â¤â€ Ã Â¤Âª Ã Â¤â€¢Ã Â¥Å’Ã Â¤Â¨ Ã Â¤Â¸Ã Â¤Â¾ Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼ Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤Å¡Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â¤Ã Â¥â€¡ Ã Â¤Â¹Ã Â¥Ë†Ã Â¤â€šÃ Â¥Â¤'
        : 'Ã°Å¸â€œÂ Sure! Please tell me what document you would like to generate.'
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
        ? '🤖 Ã Â¤Â Ã Â¥â‚¬Ã Â¤â€¢ Ã Â¤Â¹Ã Â¥Ë†! Ã Â¤â€¦Ã Â¤Â¬ Ã Â¤Â®Ã Â¥Ë†Ã Â¤â€š Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤Â®Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤Â¹Ã Â¥â€šÃ Â¤ÂÃ Â¥Â¤ Ã Â¤â€ Ã Â¤Âª Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂÃ Â¤Â¸Ã Â¥â€¡ Ã Â¤â€¢Ã Â¥ÂÃ Â¤â€º Ã Â¤Â­Ã Â¥â‚¬ Ã Â¤ÂªÃ Â¥â€šÃ Â¤â€º Ã Â¤Â¸Ã Â¤â€¢Ã Â¤Â¤Ã Â¥â€¡ Ã Â¤Â¹Ã Â¥Ë†Ã Â¤â€š - Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¨Ã Â¥â€šÃ Â¤Â¨Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Â², Ã Â¤Â¦Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¤Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Å“Ã Â¤Â¼, Ã Â¤â€¢Ã Â¥â€¡Ã Â¤Â¸ Ã Â¤â€“Ã Â¥â€¹Ã Â¤Å“, Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤â€¢Ã Â¥ÂÃ Â¤â€º Ã Â¤â€Ã Â¤Â°!'
        : '🤖 Got it! I\'m now in auto-detect mode. You can ask me anything - legal questions, documents, case search, or anything else!'
    }]);

    toast({
      title: language === 'hi' ? 'Ã Â¤Â®Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¬Ã Â¤Â¦Ã Â¤Â²Ã Â¤Â¾ Ã Â¤â€”Ã Â¤Â¯Ã Â¤Â¾' : 'Mode Changed',
      description: language === 'hi' ? 'AI Ã Â¤â€¦Ã Â¤Â¬ Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤Â°Ã Â¥â€šÃ Â¤Âª Ã Â¤Â¸Ã Â¥â€¡ Ã Â¤â€ Ã Â¤ÂªÃ Â¤â€¢Ã Â¥â€¡ Ã Â¤â€¡Ã Â¤Â°Ã Â¤Â¾Ã Â¤Â¦Ã Â¥â€¡ Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤ÂªÃ Â¤Â¤Ã Â¤Â¾ Ã Â¤Â²Ã Â¤â€”Ã Â¤Â¾Ã Â¤ÂÃ Â¤â€”Ã Â¤Â¾' : 'AI will now auto-detect your intent',
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
      title: language === 'hi' ? 'Ã°Å¸â€â€ž Ã Â¤Â°Ã Â¥â‚¬Ã Â¤Â¸Ã Â¥â€¡Ã Â¤Å¸ Ã Â¤â€¢Ã Â¤Â¿Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤â€”Ã Â¤Â¯Ã Â¤Â¾' : 'Ã°Å¸â€â€ž Reset Complete',
      description: language === 'hi' ? 'Ã Â¤Â¸Ã Â¤Â­Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â° Ã Â¤Â¸Ã Â¤Â¾Ã Â¤Â«Ã Â¤Â¼ Ã Â¤Â¹Ã Â¥â€¹ Ã Â¤â€”Ã Â¤ÂÃ Â¥Â¤ AI Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â¤ Ã Â¤Â®Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â®Ã Â¥â€¡Ã Â¤â€š Ã Â¤Â¹Ã Â¥Ë†Ã Â¥Â¤' : 'All sessions cleared. AI is back in auto-detect mode.',
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
      ? `Ã Â¤Â®Ã Â¥ÂÃ Â¤ÂÃ Â¥â€¡ ${documentType} Ã Â¤Â¬Ã Â¤Â¨Ã Â¤Â¾Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤Â¹Ã Â¥Ë†`
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
        title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
        description: error.response?.data?.message || (language === 'hi' ? 'Ã Â¤â€¢Ã Â¥ÂÃ Â¤â€º Ã Â¤â€”Ã Â¤Â²Ã Â¤Â¤ Ã Â¤Â¹Ã Â¥ÂÃ Â¤â€ ' : 'Something went wrong'),
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
        title: language === 'hi' ? 'Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿' : 'Error',
        description: error.response?.data?.message || (language === 'hi' ? 'Ã Â¤â€¢Ã Â¥ÂÃ Â¤â€º Ã Â¤â€”Ã Â¤Â²Ã Â¤Â¤ Ã Â¤Â¹Ã Â¥ÂÃ Â¤â€ ' : 'Something went wrong'),
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

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
    
    const validFiles = [];
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
        toast({
          title: 'Invalid file type',
          description: `File ${file.name} is not supported.`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `File ${file.name} exceeds 10MB limit.`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        continue;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      let lastResponse = null;

      for (const file of validFiles) {
        const response = await fileService.uploadFile(file, (progress) => {
          setUploadProgress(progress);
        });
        lastResponse = response;

        // Auto-trigger drafting tools if active (only if a single file is uploaded)
        if (validFiles.length === 1) {
          if (activeDraftingTool === 'precedence') {
            startPrecedenceAnalysis(response.file._id);
          } else if (activeDraftingTool === 'counter_maker') {
            extractCounterFacts(response.file._id);
          } else if (activeTab === 'research') {
            handleStartDeepResearch(response.file);
          }
        }
      }

      if (lastResponse) {
        setSelectedFile(lastResponse.file);
        // Update remaining messages count and subscription status
        if (lastResponse.remainingMessages !== null) {
          setRemainingMessages(lastResponse.remainingMessages);
        }
        setSubscriptionStatus(lastResponse.subscriptionStatus);
      }

      // After upload Ã¢â‚¬â€ reset scanner state, show upload success
      setScanStatus('none');
      setScanResults(null);
      setFormatMetadata(null);
      setSmartSuggestions([]);
      setHtmlContent('');

      toast({
        title: language === 'hi' ? 'Ã Â¤Â«Ã Â¤Â¼Ã Â¤Â¾Ã Â¤â€¡Ã Â¤Â² Ã Â¤â€¦Ã Â¤ÂªÃ Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¹Ã Â¥â€¹ Ã Â¤â€”Ã Â¤Ë†' : 'File uploaded',
        description: language === 'hi'
          ? 'Ã Â¤Â«Ã Â¤Â¼Ã Â¤Â¾Ã Â¤â€¡Ã Â¤Â² Ã Â¤â€¦Ã Â¤ÂªÃ Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¹Ã Â¥â€¹ Ã Â¤â€”Ã Â¤Ë†Ã Â¥Â¤ Ã Â¤Â¸Ã Â¥ÂÃ Â¤â€¢Ã Â¥Ë†Ã Â¤Â¨ Ã Â¤Â¯Ã Â¤Â¾ Ã Â¤ÂÃ Â¤Â¡Ã Â¤Â¿Ã Â¤Å¸ Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â¨Ã Â¥â€¡ Ã Â¤â€¢Ã Â¥â€¡ Ã Â¤Â²Ã Â¤Â¿Ã Â¤Â Ã Â¤Â¹Ã Â¥â€¡Ã Â¤Â¡Ã Â¤Â° Ã Â¤Â¬Ã Â¤Å¸Ã Â¤Â¨ Ã Â¤â€°Ã Â¤ÂªÃ Â¤Â¯Ã Â¥â€¹Ã Â¤â€” Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€šÃ Â¥Â¤'
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

  // ============================================
  // PRECEDENCE ANALYSIS FUNCTIONS
  // ============================================

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
      console.error('Error polling precedence status:', error);
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
      toast({
        title: 'Error',
        description: 'Could not start precedence analysis.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Cleanup precedence polling on unmount
  useEffect(() => {
    return () => {
      stopPrecedencePolling();
    };
  }, []);


  // ============================================
  // COUNTER MAKER FUNCTIONS
  // ============================================

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
      console.error('Error polling Counter Maker status:', error);
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
      toast({
        title: 'Error',
        description: 'Could not start drafting.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const extractCounterFacts = async (fileId) => {
    try {
      setIsLoading(true);
      setCounterMakerFileId(fileId); // Track it for the next message
      setCounterMakerStatus('processing');

      const data = await counterMakerService.extractFacts(fileId);
      
      setCounterMakerStatus('completed'); // Not actually completed draft, just fact extraction
      // Send message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I have analyzed the document and extracted the following key allegations:\n\n${data.facts}\n\nPlease provide your counter-points or defenses for these allegations so I can draft the Counter Affidavit.`
      }]);
      setIntentOverride('COUNTER_MAKER_COLLECT_FACTS');
    } catch (error) {
      console.error('Error extracting counter facts:', error);
      setCounterMakerStatus('failed');
      toast({
        title: 'Analysis Failed',
        description: 'Could not extract facts from the complaint.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup counter maker polling on unmount
  useEffect(() => {
    return () => {
      stopCounterMakerPolling();
    };
  }, []);


  // ============================================
  // DEEP RESEARCH FUNCTIONS
  // ============================================

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
    // Clear any existing poll
    stopResearchPolling();

    // Simulate agent stage progression
    const stages = [
      { label: 'Extracting document context...', at: 0 },
      { label: 'Identifying key points & dates...', at: 15 },
      { label: 'Analyzing actionable steps...', at: 45 },
      { label: 'Generating comprehensive summary...', at: 65 },
      { label: 'Finalizing report...', at: 80 },
    ];

    // Start ETA countdown timer
    researchTimerRef.current = setInterval(() => {
      setResearchElapsed(prev => {
        const next = prev + 1;
        // Update stage label based on elapsed time
        const currentStage = [...stages].reverse().find(s => next >= s.at);
        if (currentStage) setResearchAgentStage(currentStage.label);
        return next;
      });
    }, 1000);

    // Poll backend every 5 seconds
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
              title: 'Ã°Å¸â€Â¬ Deep Research Complete',
              description: 'Your research report is ready. Check the right panel.',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } catch (err) {
        console.error('Research poll error:', err);
        // Don't stop polling on transient errors
      }
    }, 5000);
  };

  const handleStartDeepResearch = async (autoFile = null) => {
    const targetFile = autoFile && autoFile._id ? autoFile : selectedFile;
    if (!targetFile?._id) {
      toast({
        title: 'No file selected',
        description: 'Please upload a file first from the sidebar.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setResearchStatus('starting');
      setResearchResults(null);
      setResearchElapsed(0);
      setResearchAgentStage('Preparing document...');
      setIsReportPanelOpen(true);

      // Step 1: Create an edit session from the uploaded file
      toast({
        title: 'Ã°Å¸â€Â¬ Starting Deep Research',
        description: 'Preparing your document for analysis...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      const editResult = await fileService.startEditSession(targetFile._id);
      const editSessionId = editResult.sessionId || editResult._id || editResult.editSession?._id;

      if (!editSessionId) {
        throw new Error('Failed to create edit session Ã¢â‚¬â€ no session ID returned.');
      }

      // Step 2: Start deep research
      const researchResult = await researchService.startResearch([editSessionId]);
      const newSessionId = researchResult.sessionId;

      setResearchSessionId(newSessionId);
      localStorage.setItem('deepResearchSessionId', newSessionId);
      setResearchStatus('processing');
      setResearchStartTime(Date.now());

      // Step 3: Start polling for results
      pollResearchStatus(newSessionId);

    } catch (err) {
      console.error('Deep research start error:', err);
      setResearchStatus('failed');
      setResearchAgentStage('Failed to start research');
      toast({
        title: 'Research Failed',
        description: err?.response?.data?.error || err.message || 'Failed to start deep research',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Restore research session on mount (if one was in progress)
  useEffect(() => {
    const savedSessionId = localStorage.getItem('deepResearchSessionId');
    if (savedSessionId && researchStatus === 'idle') {
      // Check if session is still processing or has results
      researchService.getResearchResults(savedSessionId).then(result => {
        setResearchResults(result);
        setResearchSessionId(savedSessionId);
        if (['completed', 'completed_with_errors'].includes(result.status)) {
          setResearchStatus(result.status);
          // Don't auto-open panel on mount, let user open via sidebar
        } else if (result.status === 'processing' || result.status === 'pending') {
          setResearchStatus('processing');
          setIsReportPanelOpen(true);
          pollResearchStatus(savedSessionId);
        } else {
          // failed or unknown Ã¢â‚¬â€ clear
          localStorage.removeItem('deepResearchSessionId');
        }
      }).catch(() => {
        localStorage.removeItem('deepResearchSessionId');
      });
    }
    // Cleanup polling on unmount
    return () => stopResearchPolling();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // CHRONOLOGY FUNCTIONS
  // ============================================

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
            // Build a rich summary message in the chat window
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
              }
            ]);
          }

          if (result.status !== 'failed') {
            toast({
              title: '📅 Chronology Complete',
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

  // Track whether the current chronology run is a merge (adding files to an existing completed session)
  const isMergingChronologyRef = useRef(false);

  // ── Parallel Review ──────────────────────────────────────────
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
              setIsBulkReviewPanelOpen(true); // Auto-open on success
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
    setBulkReviewEta(40 + reviewFiles.length * 30); // Dynamic ETA based on files
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

  // Resume polling on mount
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkReviewSessionId, reviewStatus]);


  // Multi-file upload handler for chronology
  // ── Parallel Review Upload Handler ──────────────────────────
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

    const uploaded = [];
    for (const file of validFiles) {
      try {
        const response = await fileService.uploadFile(file);
        const editResult = await fileService.startEditSession(response.file._id);
        const editSessionId = editResult.sessionId || editResult._id || editResult.editSession?._id;
        uploaded.push({ file: response.file, editSessionId });
      } catch (err) {
        console.error(`Failed to upload "${file.name}":`, err);
        toast({
          title: `Upload failed: ${file.name}`,
          description: err?.message || 'Unknown error',
          status: 'error',
          duration: 3000,
        });
      }
    }

    if (uploaded.length > 0) {
      setReviewFiles(prev => [...prev, ...uploaded]);
      toast({
        title: `${uploaded.length} file(s) ready for Parallel Review`,
        status: 'success',
        duration: 2500,
      });
    }
    e.target.value = '';
  };

  // ── Chronology Upload Handler ────────────────────────────────
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

    toast({
      title: `Uploading ${validFiles.length} file(s)...`,
      status: 'info',
      duration: 2000,
    });

    const uploaded = [];
    for (const file of validFiles) {
      try {
        const response = await fileService.uploadFile(file);
        const editResult = await fileService.startEditSession(response.file._id);
        const editSessionId = editResult.sessionId || editResult._id || editResult.editSession?._id;
        uploaded.push({
          file: response.file,
          editSessionId,
        });
      } catch (err) {
        console.error(`Failed to upload "${file.name}":`, err);
        toast({
          title: `Upload failed: ${file.name}`,
          description: err?.message || 'Unknown error',
          status: 'error',
          duration: 3000,
        });
      }
    }

    if (uploaded.length > 0) {
      const newFiles = [...chronologyFiles, ...uploaded];
      setChronologyFiles(newFiles);

      // If a chronology is already completed, auto-trigger a merge with the new files
      if (['completed', 'completed_with_errors'].includes(chronologyStatus)) {
        toast({
          title: `Merging ${uploaded.length} new file(s) into timeline...`,
          status: 'info',
          duration: 3000,
        });
        isMergingChronologyRef.current = true;
        // Short delay to let state update
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
            toast({ title: 'Merge failed', description: err?.message, status: 'error', duration: 4000 });
          }
        }, 300);
      } else {
        toast({
          title: `✅ ${uploaded.length} file(s) ready`,
          description: 'Click "Build Chronology" to analyze.',
          status: 'success',
          duration: 3000,
        });
      }
    }

    e.target.value = '';
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

      // Add a user-visible chat message to indicate the build started
      const fileLabel = chronologyFiles.length === 1
        ? chronologyFiles[0].file?.name || 'file'
        : `${chronologyFiles.length} files`;
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          content: `Build a chronology timeline from: ${fileLabel}`,
        }
      ]);

      const editSessionIds = chronologyFiles.map(f => f.editSessionId);
      const result = await chronologyService.startChronology(editSessionIds);
      const newSessionId = result.sessionId;

      setChronologySessionId(newSessionId);
      localStorage.setItem('chronologySessionId', newSessionId);
      setChronologyStatus('processing');

      pollChronologyStatus(newSessionId);
    } catch (err) {
      console.error('Chronology start error:', err);
      setChronologyStatus('failed');
      toast({
        title: 'Chronology Failed',
        description: err?.response?.data?.error || err.message || 'Failed to start chronology',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Reset chronology — refresh sessions list then start fresh
  const handleResetChronology = async () => {
    try {
      // Refresh sessions list so history is up-to-date
      await fetchSessions();
    } catch (err) {
      console.error('Failed to refresh sessions:', err);
    }

    // Clear all chronology state
    stopChronologyPolling();
    setChronologyStatus('idle');
    setChronologyResults(null);
    setChronologySessionId(null);
    setChronologyFiles([]);
    setChronologyElapsed(0);
    setChronologyAgentStage('');
    setIsTimelinePanelOpen(false);
    localStorage.removeItem('chronologySessionId');

    // Remove chronology summary messages from the chat window; keep everything else
    setMessages([]);
    ctx.startNewSession();

    toast({
      title: 'New Chronology Started',
      description: 'Upload files to start a fresh timeline.',
      status: 'success',
      duration: 3000,
    });
  };

  // Restore chronology session on mount
  useEffect(() => {
    const savedId = localStorage.getItem('chronologySessionId');
    if (savedId && chronologyStatus === 'idle') {
      chronologyService.getChronologyResults(savedId).then(result => {
        setChronologyResults(result);
        setChronologySessionId(savedId);
        if (['completed', 'completed_with_errors'].includes(result.status)) {
          setChronologyStatus(result.status);
        } else if (result.status === 'processing' || result.status === 'pending') {
          setChronologyStatus('processing');
          setIsTimelinePanelOpen(true);
          pollChronologyStatus(savedId);
        } else {
          localStorage.removeItem('chronologySessionId');
        }
      }).catch(() => {
        localStorage.removeItem('chronologySessionId');
      });
    }
    return () => stopChronologyPolling();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileAnalysis = async (fileId) => {
    try {
      setAnalyzingFile(true);
      // B) Pass intent to analysis for context-aware prompts
      const response = await fileService.analyzeFile(fileId, null, intentOverride);

      // Build user message based on intent
      let userMsg = `Analyze file ${fileId}`;
      if (intentLabel) {
        userMsg = `${intentLabel} - ${userMsg}`;
      }
      const newMsgs = [
        ...messages,
        { role: 'user', content: userMsg },
        { role: 'assistant', content: response.analysis }
      ];
      setMessages(newMsgs);
      saveChat(currentChatId, newMsgs, newMsgs[0]?.content.substring(0, 30) || 'New Chat');
    } catch (error) {
      console.error('File analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze the document. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAnalyzingFile(false);
    }
  };

  // ========== DOCUMENT EDIT MODE HANDLERS ==========
  // Start edit mode for the uploaded document
  const handleStartEditMode = async () => {
    if (!selectedFile) return;

    try {
      setEditSessionActive(true);
      setIsEditMode(true);
      setEditChangesCount(0);
      setIntentOverride('edit');
      setIntentLabel('Document Editing');

      toast({
        title: 'Edit Mode Active',
        description: 'You can now instruct the AI to edit this document.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // B) Trigger initial deep analysis if not done yet
      if (!documentAnalysis) {
        setAnalyzingFile(true);
        const analysis = await fileService.analyzeFile(selectedFile._id, null, 'edit');
        setDocumentAnalysis(analysis.analysis);
      }
    } catch (error) {
      console.error('Failed to start edit mode:', error);
      toast({
        title: 'Edit Mode Failed',
        description: 'Could not initialize edit session.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setEditSessionActive(false);
      setIsEditMode(false);
    } finally {
      setAnalyzingFile(false);
    }
  };

  // Trigger smart document scanning for sensitive data / anomalies
  const handleSmartScan = async () => {
    if (!selectedFile) return;

    try {
      setScanStatus('scanning');
      const results = await fileService.smartScan(selectedFile._id);
      setScanResults(results.scanResults);
      setScanStatus('complete');
      toast({
        title: 'Scan Complete',
        description: `Found ${results.scanResults.totalFindings || 0} items to review.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Smart scan failed:', error);
      setScanStatus('error');
      toast({
        title: 'Scan Failed',
        description: 'Failed to complete document scan.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Open the rich text editor side-panel
  const handleOpenEditor = async () => {
    if (!selectedFile) return;

    try {
      setAnalyzingFile(true);
      const content = await fileService.getDocumentHtml();
      setHtmlContent(content.html);
      setIsEditorOpen(true);
    } catch (error) {
      console.error('Failed to load document content:', error);
      toast({
        title: 'Editor Failed',
        description: 'Could not load document content for editing.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAnalyzingFile(false);
    }
  };

  // Apply an edit instruction directly
  const handleApplyEdit = async (editInstruction) => {
    if (!selectedFile || !editInstruction) return;

    try {
      setAnalyzingFile(true);
      const result = await fileService.applyEdit(editInstruction);

      setEditChangesCount(prev => prev + 1);
      setHtmlContent(result.html);

      toast({
        title: 'Edit Applied',
        description: 'Document has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to apply edit:', error);
      toast({
        title: 'Edit Failed',
        description: error.response?.data?.error || 'Could not apply the requested edit.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setAnalyzingFile(false);
    }
  };

  // Download the edited document in the requested format
  const handleDownloadEdited = async (format = 'docx') => {
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
  const refreshEditSession = async () => {};

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
      isClosable: true,
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
        title: language === 'hi' ? 'Ã Â¤Â¡Ã Â¤Â¾Ã Â¤â€°Ã Â¤Â¨Ã Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤Â¶Ã Â¥ÂÃ Â¤Â°Ã Â¥â€š...' : 'Download Started...',
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
        title: language === 'hi' ? 'Ã Â¤Â¡Ã Â¤Â¾Ã Â¤â€°Ã Â¤Â¨Ã Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤ÂªÃ Â¥â€šÃ Â¤Â°Ã Â¥ÂÃ Â¤Â£' : 'Download Complete',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: language === 'hi' ? 'Ã Â¤Â¡Ã Â¤Â¾Ã Â¤â€°Ã Â¤Â¨Ã Â¤Â²Ã Â¥â€¹Ã Â¤Â¡ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â«Ã Â¤Â²' : 'Download Failed',
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

  // Sync Handlers to Context
  useEffect(() => {
    ctx.setHandleStartDeepResearch?.(() => handleStartDeepResearch);
    ctx.setHandleStartChronology?.(() => handleStartChronology);
    ctx.setHandleStartBulkReview?.(() => handleStartBulkReview);
    ctx.setHandleResetChronology?.(() => handleResetChronology);
    ctx.setHandleChronologyFilesUpload?.(() => handleChronologyFilesUpload);
    ctx.setHandleOnboardSubmit?.(() => handleOnboardSubmit);
  }, [
    handleStartDeepResearch, handleStartChronology, handleStartBulkReview, handleResetChronology,
    handleChronologyFilesUpload, handleOnboardSubmit,
    ctx.setHandleStartDeepResearch, ctx.setHandleStartChronology, ctx.setHandleStartBulkReview, ctx.setHandleResetChronology,
    ctx.setHandleChronologyFilesUpload, ctx.setHandleOnboardSubmit, ctx.setHandleActionClick
  ]);

  // Sync handleSuggestedActionClick separately (defined after the main sync block)
  useEffect(() => {
    ctx.setHandleActionClick?.(() => handleSuggestedActionClick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSuggestedActionClick]);



  const renderSubSidebarContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <VStack spacing={4} align="stretch">
            <Box p={4} borderRadius="lg" bg={useColorModeValue('white', 'gray.900')} border="1px solid" borderColor={borderColor}>
              <Text fontSize="sm" fontWeight="bold">Balance Summary</Text>
              <Text fontSize="2xl" fontWeight="black" mt={2} color="judicial.gold">
                {remainingMessages !== null ? `${remainingMessages} Left` : 'Unlimited'}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>Remaining messages today</Text>
            </Box>
            <Box p={4} borderRadius="lg" bg={useColorModeValue('white', 'gray.900')} border="1px solid" borderColor={borderColor}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Workspace Details</Text>
              <VStack align="stretch" mt={3} spacing={2} fontSize="sm">
                <HStack justify="space-between">
                  <Text color="gray.500">Company:</Text>
                  <Text fontWeight="semibold">{user?.companyName || 'N/A'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.500">Sector:</Text>
                  <Text fontWeight="semibold" textTransform="capitalize">{user?.sector || 'N/A'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.500">Slug:</Text>
                  <Badge colorScheme="blue">{user?.companySlug || 'N/A'}</Badge>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        );

      case 'history':
        return (
          <VStack spacing={2} align="stretch">
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<AddIcon />}
              onClick={() => {
                const newSlug = Math.random().toString(36).substring(2, 15);
                navigate(`/c/${newSlug}`);
              }}
              w="full"
              mb={2}
            >
              New Chat Session
            </Button>
            {sessionsListLoading ? (
              <Center py={6}><Spinner size="sm" /></Center>
            ) : sessionsList.length === 0 ? (
              <Text fontSize="xs" color="gray.500" textAlign="center">No conversation history yet.</Text>
            ) : (
              sessionsList.map(session => {
                const isActive = slug === session.slug;
                return (
                  <Box
                    key={session.slug}
                    p={3}
                    borderRadius="md"
                    bg={isActive ? useColorModeValue('blue.50', 'gray.900') : 'transparent'}
                    border={isActive ? '1px solid' : 'none'}
                    borderColor={isActive ? 'blue.200' : 'transparent'}
                    cursor="pointer"
                    onClick={() => navigate(`/c/${session.slug}`)}
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.850') }}
                  >
                    <HStack justify="space-between" mb={1}>
                      <Badge size="xs" colorScheme={
                        session.feature === 'document_ready' ? 'purple' :
                        session.feature === 'legal_analysis' ? 'green' : 'blue'
                      }>
                        {session.feature.replace('_', ' ')}
                      </Badge>
                      <Text fontSize="2xs" color="gray.400">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="semibold" noOfLines={1} color={isActive ? useColorModeValue('blue.600', 'blue.300') : textColor}>
                      {session.title || 'Conversation'}
                    </Text>
                    <Text fontSize="xs" noOfLines={1} mt={0.5} color="gray.500">
                      {session.preview}
                    </Text>
                  </Box>
                );
              })
            )}
          </VStack>
        );

      case 'research':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Upload a legal case file or contract to perform automated compliance analysis and deep legal context searches.
            </Text>
            <Box
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'blue.500' }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Icon as={FaPaperclip} w={6} h={6} color="blue.500" mb={2} />
              <Text fontSize="xs" fontWeight="bold">Click to Upload File</Text>
              <Text fontSize="2xs" color="gray.400" mt={1}>PDF, Word, TXT, images</Text>
            </Box>
            {(selectedFile || uploading) && (
              <Box p={3} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="md">
                {selectedFile ? (
                  <Text fontSize="xs" fontWeight="semibold" isTruncated>{selectedFile.fileName}</Text>
                ) : (
                  <Text fontSize="xs" fontWeight="semibold" isTruncated>Uploading File...</Text>
                )}
                {(uploadProgress > 0 || uploading) && (
                  <Progress value={uploadProgress || 100} isIndeterminate={uploadProgress === 0} size="xs" colorScheme="blue" mt={2} borderRadius="full" />
                )}
              </Box>
            )}

            {/* Start Deep Research Button */}
            {selectedFile && researchStatus === 'idle' && !uploading && (
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Icon as={FiCpu} />}
                onClick={handleStartDeepResearch}
                w="full"
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                Ã°Å¸â€Â¬ Start Deep Research
              </Button>
            )}

            {/* Processing Status */}
            {(researchStatus === 'starting' || researchStatus === 'processing') && (
              <Box p={3} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="md" border="1px solid" borderColor="blue.200">
                <HStack spacing={2} mb={2}>
                  <Spinner size="xs" color="blue.500" />
                  <Text fontSize="xs" fontWeight="bold" color="blue.600">
                    Research in Progress
                  </Text>
                </HStack>
                <Text fontSize="2xs" color="gray.500" mb={2}>{researchAgentStage}</Text>
                <Progress
                  value={Math.min(100, (researchElapsed / researchEta) * 100)}
                  size="xs"
                  colorScheme="blue"
                  borderRadius="full"
                />
                <Text fontSize="2xs" color="gray.400" mt={1}>
                  ~{Math.max(0, researchEta - researchElapsed)}s remaining
                </Text>
                {!isReportPanelOpen && (
                  <Button
                    size="xs"
                    variant="link"
                    colorScheme="blue"
                    onClick={() => setIsReportPanelOpen(true)}
                    mt={2}
                  >
                    View Progress →
                  </Button>
                )}
              </Box>
            )}

            {/* Completed Ã¢â‚¬â€ View Report */}
            {(researchStatus === 'completed' || researchStatus === 'completed_with_errors') && (
              <VStack spacing={2} align="stretch">
                <Box p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" border="1px solid" borderColor="green.200">
                  <HStack spacing={2}>
                    <Text fontSize="sm">✅</Text>
                    <Text fontSize="xs" fontWeight="bold" color="green.600">
                      Research Complete
                    </Text>
                  </HStack>
                </Box>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant={isReportPanelOpen ? 'solid' : 'outline'}
                  onClick={() => setIsReportPanelOpen(!isReportPanelOpen)}
                  w="full"
                >
                  {isReportPanelOpen ? 'Hide Report' : 'View Report →'}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => {
                    setResearchStatus('idle');
                    setResearchResults(null);
                    setResearchSessionId(null);
                    setIsReportPanelOpen(false);
                    localStorage.removeItem('deepResearchSessionId');
                  ctx.startNewSession();
                }}
                >
                  Start New Research
                </Button>
              </VStack>
            )}

            {/* Failed Ã¢â‚¬â€ Retry */}
            {researchStatus === 'failed' && (
              <Box p={3} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md">
                <Text fontSize="xs" color="red.600" fontWeight="bold" mb={2}>
                  Ã¢ÂÅ’ Research Failed
                </Text>
                <Button
                  size="xs"
                  colorScheme="blue"
                  onClick={handleStartDeepResearch}
                  w="full"
                >
                  Retry
                </Button>
              </Box>
            )}
          </VStack>
        );

      case 'review':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Upload multiple legal briefs, contracts, or court transcripts to compare clause compliance and verify cross-document alignments.
            </Text>

            {/* Upload drop zone */}
            <Box
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'purple.500' }}
              onClick={() => document.getElementById('review-file-upload')?.click()}
            >
              <Icon as={FiLayers} w={6} h={6} color="purple.500" mb={2} />
              <Text fontSize="xs" fontWeight="bold">Click to Upload Files</Text>
              <Text fontSize="2xs" color="gray.400" mt={1}>PDF, Word, TXT, images (max 10)</Text>
            </Box>

            {/* Uploaded files list */}
            {reviewFiles.length > 0 && (
              <VStack spacing={1} align="stretch">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  {reviewFiles.length} file(s) queued
                </Text>
                {reviewFiles.map((f, i) => (
                  <HStack key={i} p={2} bg="purple.50" _dark={{ bg: 'purple.900' }} borderRadius="md" fontSize="xs">
                    <Icon as={FaFile} color={`${FILE_COLORS[i % FILE_COLORS.length]}.500`} boxSize={3} />
                    <Text flex={1} isTruncated fontWeight="medium">{f.file?.fileName || f.file?.name || 'File'}</Text>
                    {reviewStatus !== 'processing' && (
                      <IconButton
                        icon={<FaTimes />}
                        size="2xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setReviewFiles(prev => prev.filter((_, idx) => idx !== i))}
                        aria-label="Remove file"
                      />
                    )}
                  </HStack>
                ))}
                {reviewStatus !== 'processing' && reviewFiles.length > 0 && (
                  <HStack justify="space-between" mt={2}>
                    <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setReviewFiles([])}>
                      Clear All
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="purple"
                      onClick={() => document.getElementById('review-file-upload')?.click()}
                    >
                      + Add more
                    </Button>
                  </HStack>
                )}
              </VStack>
            )}

            {/* Start Review button — needs at least 2 files */}
            {reviewFiles.length >= 2 && reviewStatus === 'idle' && (
              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<Icon as={FiLayers} />}
                w="full"
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                transition="all 0.2s"
                onClick={handleStartBulkReview}
              >
                🔍 Start Parallel Review ({reviewFiles.length} files)
              </Button>
            )}

            {reviewFiles.length === 1 && reviewStatus === 'idle' && (
              <Text fontSize="xs" color="orange.500" textAlign="center">
                Upload at least 2 files to start a parallel review.
              </Text>
            )}

            {/* Processing Status */}
            {(reviewStatus === 'starting' || reviewStatus === 'processing') && (
              <Box p={3} bg="purple.50" _dark={{ bg: 'purple.900' }} borderRadius="md" border="1px solid" borderColor="purple.200">
                <HStack spacing={2} mb={2}>
                  <Spinner size="xs" color="purple.500" />
                  <Text fontSize="xs" fontWeight="bold" color="purple.600">
                    Analyzing in Parallel
                  </Text>
                </HStack>
                <Progress
                  value={Math.min(100, (bulkReviewElapsed / bulkReviewEta) * 100)}
                  size="xs"
                  colorScheme="purple"
                  borderRadius="full"
                />
                <Text fontSize="2xs" color="gray.400" mt={1}>
                  ~{Math.max(0, bulkReviewEta - bulkReviewElapsed)}s remaining
                </Text>
                {!isBulkReviewPanelOpen && (
                  <Button size="xs" variant="link" colorScheme="purple" onClick={() => setIsBulkReviewPanelOpen(true)} mt={2}>
                    View Progress →
                  </Button>
                )}
              </Box>
            )}

            {/* Completed Status */}
            {(reviewStatus === 'completed' || reviewStatus === 'completed_with_errors') && (
              <VStack spacing={2} align="stretch">
                <Box p={3} bg="purple.50" _dark={{ bg: 'purple.900' }} borderRadius="md" border="1px solid" borderColor="purple.200">
                  <HStack spacing={2}>
                    <Text fontSize="sm">✅</Text>
                    <Text fontSize="xs" fontWeight="bold" color="purple.600">
                      Analysis Complete ({bulkReviewResults?.documents?.length || 0} docs)
                    </Text>
                  </HStack>
                </Box>
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant={isBulkReviewPanelOpen ? 'solid' : 'outline'}
                  onClick={() => setIsBulkReviewPanelOpen(!isBulkReviewPanelOpen)}
                  w="full"
                >
                  {isBulkReviewPanelOpen ? 'Hide Report' : 'View Report →'}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => {
                    setReviewFiles([]);
                    setReviewStatus('idle');
                    setBulkReviewSessionId(null);
                    setIsBulkReviewPanelOpen(false);
                    localStorage.removeItem('bulkReviewSessionId');
                    ctx.startNewSession();
                  }}
                >
                  Start New Review
                </Button>
              </VStack>
            )}

            {/* Failed */}
            {reviewStatus === 'failed' && (
              <Box p={3} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md">
                <Text fontSize="xs" color="red.600" fontWeight="bold" mb={2}>❌ Analysis Failed</Text>
                <Button size="xs" colorScheme="purple" onClick={handleStartBulkReview} w="full">
                  Retry
                </Button>
              </Box>
            )}
          </VStack>
        );

      case 'chronology':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Upload one or more files to extract and build a structured chronological timeline of events automatically.
            </Text>

            {/* Multi-file upload area */}
            <Box
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'green.500' }}
              onClick={() => document.getElementById('chronology-file-upload')?.click()}
            >
              <Icon as={FiClock} w={6} h={6} color="green.500" mb={2} />
              <Text fontSize="xs" fontWeight="bold">Upload Files</Text>
              <Text fontSize="2xs" color="gray.400" mt={1}>Select one or multiple files</Text>
              <Text fontSize="2xs" color="gray.400">PDF, Word, TXT, images (max 10)</Text>
            </Box>

            {/* Uploaded files list */}
            {chronologyFiles.length > 0 && (
              <VStack spacing={1} align="stretch">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  {chronologyFiles.length} file(s) queued
                </Text>
                {chronologyFiles.map((f, i) => (
                  <HStack key={i} p={2} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" fontSize="xs">
                    <Icon as={FaFile} color={`${FILE_COLORS[i % FILE_COLORS.length]}.500`} boxSize={3} />
                    <Text flex={1} isTruncated fontWeight="medium">{f.file?.fileName || 'File'}</Text>
                    {chronologyStatus !== 'processing' && chronologyStatus !== 'starting' && (
                      <IconButton
                        icon={<FaTimes />}
                        size="2xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setChronologyFiles(prev => prev.filter((_, idx) => idx !== i))}
                        aria-label="Remove file"
                      />
                    )}
                  </HStack>
                ))}
                {chronologyStatus !== 'processing' && chronologyStatus !== 'starting' && chronologyFiles.length > 0 && (
                  <HStack justify="space-between" mt={2}>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setChronologyFiles([])}
                    >
                      Clear All
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="green"
                      onClick={() => document.getElementById('chronology-file-upload')?.click()}
                    >
                      + Add more files
                    </Button>
                  </HStack>
                )}
              </VStack>
            )}

            {/* Build Chronology Button */}
            {chronologyFiles.length > 0 && chronologyStatus === 'idle' && (
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<Icon as={FiClock} />}
                onClick={handleStartChronology}
                w="full"
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                📅 Build Chronology ({chronologyFiles.length} file{chronologyFiles.length > 1 ? 's' : ''})
              </Button>
            )}

            {/* Processing Status */}
            {(chronologyStatus === 'starting' || chronologyStatus === 'processing') && (
              <Box p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" border="1px solid" borderColor="green.200">
                <HStack spacing={2} mb={2}>
                  <Spinner size="xs" color="green.500" />
                  <Text fontSize="xs" fontWeight="bold" color="green.600">
                    Building Timeline
                  </Text>
                </HStack>
                <Text fontSize="2xs" color="gray.500" mb={2}>{chronologyAgentStage}</Text>
                <Progress
                  value={Math.min(100, (chronologyElapsed / chronologyEta) * 100)}
                  size="xs"
                  colorScheme="green"
                  borderRadius="full"
                />
                <Text fontSize="2xs" color="gray.400" mt={1}>
                  ~{Math.max(0, chronologyEta - chronologyElapsed)}s remaining
                </Text>
                {!isTimelinePanelOpen && (
                  <Button size="xs" variant="link" colorScheme="green" onClick={() => setIsTimelinePanelOpen(true)} mt={2}>
                    View Progress →
                  </Button>
                )}
              </Box>
            )}

            {/* Completed */}
            {(chronologyStatus === 'completed' || chronologyStatus === 'completed_with_errors') && (
              <VStack spacing={2} align="stretch">
                <Box p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" border="1px solid" borderColor="green.200">
                  <HStack spacing={2}>
                    <Text fontSize="sm">✅</Text>
                    <Text fontSize="xs" fontWeight="bold" color="green.600">
                      Timeline Ready Ã¢â‚¬â€ {chronologyResults?.events?.length || 0} events
                    </Text>
                  </HStack>
                </Box>
                <Button
                  size="sm"
                  colorScheme="green"
                  variant={isTimelinePanelOpen ? 'solid' : 'outline'}
                  onClick={() => setIsTimelinePanelOpen(!isTimelinePanelOpen)}
                  w="full"
                >
                  {isTimelinePanelOpen ? 'Hide Timeline' : 'View Timeline →'}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={handleResetChronology}
                >
                  Start New Chronology
                </Button>
              </VStack>
            )}

            {/* Failed */}
            {chronologyStatus === 'failed' && (
              <Box p={3} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md">
                <Text fontSize="xs" color="red.600" fontWeight="bold" mb={2}>Ã¢ÂÅ’ Timeline Failed</Text>
                <Button size="xs" colorScheme="green" onClick={handleStartChronology} w="full">
                  Retry
                </Button>
              </Box>
            )}
          </VStack>
        );

      case 'drafting':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Select or design templates to draft custom affidavits, compliance notices, complaints, and general agreements.
            </Text>
            <Button
              size="sm"
              colorScheme="purple"
              leftIcon={<Icon as={FiFileText} />}
              onClick={() => handleSuggestedActionClick({ type: 'CREATE_DOCUMENT', text: 'Draft a dynamic template document' })}
              w="full"
            >
              Browse Template Categories
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="teal"
              leftIcon={<Icon as={FiZap} />}
              onClick={() => handleSuggestedActionClick({ type: 'PRECEDENCE_ANALYSIS', text: 'Analyze court precedents' })}
              w="full"
            >
              Precedence Analysis
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="orange"
              leftIcon={<Icon as={FiEdit} />}
              onClick={() => handleSuggestedActionClick({ type: 'COUNTER_AFFIDAVIT', text: 'Create a counter affidavit response' })}
              w="full"
            >
              Counter Maker
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              leftIcon={<Icon as={FiGlobe} />}
              onClick={() => handleSuggestedActionClick({ type: 'TRANSLATE_DOCUMENT', text: 'Translate a document file' })}
              w="full"
            >
              Document Translator
            </Button>
          </VStack>
        );

      case 'profile':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Configure Permanent Slug</Text>
            <form onSubmit={handleOnboardSubmit}>
              <VStack spacing={3}>
                <FormControl size="sm">
                  <FormLabel fontSize="xs">Company Name</FormLabel>
                  <Input
                    size="sm"
                    value={onboardCompanyName}
                    onChange={(e) => setOnboardCompanyName(e.target.value)}
                  />
                </FormControl>
                <FormControl size="sm">
                  <FormLabel fontSize="xs">Sector</FormLabel>
                  <Select
                    size="sm"
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
                  colorScheme="blue"
                  type="submit"
                  isLoading={isOnboardingSubmitLoading}
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
                <option value="hi">Ã Â¤Â¹Ã Â¤Â¿Ã Â¤â€šÃ Â¤Â¦Ã Â¥â‚¬ (HI)</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Theme Mode</FormLabel>
              <Select size="sm" value={colorMode} onChange={(e) => { toggleColorMode(); }}>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </Select>
            </FormControl>
          </VStack>
        );
      default:
        return null;
    }
  };

  // ============================================
  // CHRONOLOGY TIMELINE PANEL (right side split)
  // ============================================
  const CATEGORY_COLORS = {
    court_date: 'red', deadline: 'orange', execution: 'blue', breach: 'pink',
    filing: 'purple', notice: 'yellow', hearing: 'cyan', order: 'teal', other: 'gray'
  };
  const FILE_COLORS = ['blue', 'green', 'purple', 'orange', 'cyan', 'pink', 'teal', 'red', 'yellow', 'gray'];

  const renderTimelinePanel = () => {
    const panelBg = useColorModeValue('white', 'gray.850');
    const panelBorder = useColorModeValue('gray.200', 'gray.700');
    const sectionBg = useColorModeValue('gray.50', 'gray.800');
    const headingColor = useColorModeValue('gray.700', 'gray.200');
    const etaRemaining = Math.max(0, chronologyEta - chronologyElapsed);
    const progressPercent = Math.min(100, (chronologyElapsed / chronologyEta) * 100);

    // Build a file->color map for badges
    const fileColorMap = {};
    if (chronologyResults?.files) {
      chronologyResults.files.forEach((f, i) => {
        fileColorMap[f.fileName] = FILE_COLORS[i % FILE_COLORS.length];
      });
    }

    return (
      <Box
        w="400px"
        minW="340px"
        bg={panelBg}
        borderLeft="1px solid"
        borderColor={panelBorder}
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        {/* Panel Header */}
        <Flex
          h="50px"
          align="center"
          justify="space-between"
          px={4}
          borderBottom="1px solid"
          borderColor={panelBorder}
          bg={useColorModeValue('green.50', 'green.900')}
        >
          <HStack spacing={2}>
            <Icon as={FiClock} color="green.500" />
            <Text fontSize="sm" fontWeight="bold" color={headingColor}>
              Timeline
            </Text>
            {chronologyResults?.events && (
              <Badge colorScheme="green" fontSize="2xs">{chronologyResults.events.length} events</Badge>
            )}
            {chronologyStatus === 'processing' && (
              <Badge colorScheme="blue" fontSize="2xs">
                <Spinner size="xs" mr={1} /> Building
              </Badge>
            )}
          </HStack>
          <IconButton
            icon={<FaTimes />}
            size="xs"
            variant="ghost"
            onClick={() => setIsTimelinePanelOpen(false)}
            aria-label="Close timeline panel"
          />
        </Flex>

        {/* Panel Body */}
        <Box
          flex="1"
          overflowY="auto"
          p={4}
          css={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { background: panelBorder, borderRadius: '24px' },
          }}
        >
          {/* PROCESSING STATE */}
          {(chronologyStatus === 'starting' || chronologyStatus === 'processing') && (
            <VStack spacing={5} align="stretch">
              <Box
                p={5}
                borderRadius="xl"
                bg={useColorModeValue('green.50', 'green.900')}
                border="1px solid"
                borderColor={useColorModeValue('green.100', 'green.700')}
                textAlign="center"
              >
                <Box position="relative" display="inline-block" mb={3}>
                  <Spinner size="xl" color="green.500" thickness="3px" speed="1.2s" />
                </Box>
                <Text fontSize="lg" fontWeight="bold" color={headingColor} mb={1}>
                  Building Timeline
                </Text>
                <Text fontSize="sm" color="gray.500" mb={3}>
                  {chronologyAgentStage || 'Initializing...'}
                </Text>
                <Progress
                  value={progressPercent}
                  size="sm"
                  colorScheme="green"
                  borderRadius="full"
                  mb={2}
                  sx={{ '& > div': { transition: 'width 1s ease-in-out' } }}
                />
                <HStack justify="space-between" fontSize="xs" color="gray.400">
                  <Text>{Math.floor(chronologyElapsed)}s elapsed</Text>
                  <Text>~{etaRemaining}s remaining</Text>
                </HStack>
              </Box>

              {chronologyFiles.length > 0 && (
                <VStack spacing={1} align="stretch">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                    Processing {chronologyFiles.length} file(s)
                  </Text>
                  {chronologyFiles.map((f, i) => (
                    <HStack key={i} p={2} bg={sectionBg} borderRadius="md" fontSize="xs">
                      <Icon as={FaFile} color={`${FILE_COLORS[i % FILE_COLORS.length]}.500`} />
                      <Text flex={1} isTruncated>{f.file?.fileName || 'File'}</Text>
                      <Spinner size="xs" color="green.400" />
                    </HStack>
                  ))}
                </VStack>
              )}

              <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                You can navigate away Ã¢â‚¬â€ your timeline will continue building in the background.
              </Text>
            </VStack>
          )}

          {/* FAILED STATE */}
          {chronologyStatus === 'failed' && (
            <VStack spacing={4} align="center" py={8}>
              <Text fontSize="3xl">Ã¢ÂÅ’</Text>
              <Text fontWeight="bold" color="red.500">Timeline Failed</Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Something went wrong during timeline analysis.
              </Text>
              <Button size="sm" colorScheme="green" onClick={handleStartChronology} leftIcon={<Icon as={FiClock} />}>
                Retry
              </Button>
            </VStack>
          )}

          {/* COMPLETED STATE Ã¢â‚¬â€ Timeline */}
          {(chronologyStatus === 'completed' || chronologyStatus === 'completed_with_errors') && chronologyResults && (
            <VStack spacing={4} align="stretch">
              {chronologyStatus === 'completed_with_errors' && (
                <Box p={3} bg="orange.50" _dark={{ bg: 'orange.900' }} borderRadius="md" borderLeft="3px solid" borderLeftColor="orange.400">
                  <Text fontSize="xs" color="orange.600" fontWeight="bold">
                    ⚠️ Some files had extraction errors. Partial timeline shown.
                  </Text>
                </Box>
              )}

              {/* File Legend */}
              {chronologyResults.files && chronologyResults.files.length > 1 && (
                <Box p={3} bg={sectionBg} borderRadius="lg">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>
                    📂 Source Files
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {chronologyResults.files.map((f, i) => (
                      <Badge key={i} colorScheme={FILE_COLORS[i % FILE_COLORS.length]} fontSize="2xs" px={2}>
                        {f.fileName}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}

              {/* Events Timeline */}
              {chronologyResults.events && chronologyResults.events.length > 0 ? (
                <VStack spacing={2} align="stretch" position="relative">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                    📅 Events ({chronologyResults.events.length})
                  </Text>
                  {/* Timeline line */}
                  <Box position="relative" pl={4} borderLeft="2px solid" borderLeftColor={useColorModeValue('green.200', 'green.700')}>
                    {chronologyResults.events.map((ev, i) => (
                      <Box
                        key={i}
                        position="relative"
                        mb={3}
                        p={3}
                        bg={useColorModeValue('white', 'gray.900')}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={useColorModeValue('gray.100', 'gray.700')}
                        _hover={{ borderColor: `${CATEGORY_COLORS[ev.category] || 'gray'}.300`, boxShadow: 'sm' }}
                        transition="all 0.2s"
                      >
                        {/* Timeline dot */}
                        <Box
                          position="absolute"
                          left="-22px"
                          top="14px"
                          w="10px"
                          h="10px"
                          bg={`${CATEGORY_COLORS[ev.category] || 'gray'}.400`}
                          borderRadius="full"
                          border="2px solid"
                          borderColor={panelBg}
                        />
                        <HStack justify="space-between" mb={1} flexWrap="wrap">
                          <Badge colorScheme={CATEGORY_COLORS[ev.category] || 'gray'} fontSize="2xs">
                            {ev.date || 'Unknown Date'}
                          </Badge>
                          <HStack spacing={1}>
                            <Badge variant="outline" colorScheme={CATEGORY_COLORS[ev.category] || 'gray'} fontSize="2xs">
                              {(ev.category || 'other').replace('_', ' ')}
                            </Badge>
                            {chronologyResults.files?.length > 1 && (
                              <Badge colorScheme={fileColorMap[ev.sourceFile] || 'gray'} fontSize="2xs" variant="subtle">
                                {ev.sourceFile}
                              </Badge>
                            )}
                          </HStack>
                        </HStack>
                        <Text fontSize="sm" color={headingColor} fontWeight="medium">
                          {ev.event}
                        </Text>
                        {ev.significance && (
                          <Text fontSize="xs" color="gray.400" mt={1}>
                            {ev.significance}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </Box>
                </VStack>
              ) : (
                <Center py={6}>
                  <Text fontSize="sm" color="gray.400">No datable events found in the uploaded documents.</Text>
                </Center>
              )}

              {/* New Chronology */}
              <Button
                size="sm"
                variant="outline"
                colorScheme="green"
                onClick={handleResetChronology}
                mt={2}
              >
                Start New Chronology
              </Button>
            </VStack>
          )}

          {/* IDLE STATE */}
          {chronologyStatus === 'idle' && (
            <VStack spacing={4} align="center" py={8}>
              <Icon as={FiClock} w={10} h={10} color="gray.300" />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Upload files and click "Build Chronology" from the sidebar to create a timeline.
              </Text>
            </VStack>
          )}
        </Box>
      </Box>
    );
  };

  // ============================================
  // RESEARCH REPORT PANEL (right side split)
  // ============================================
  // PRECEDENCE ANALYSIS PANEL
  // ============================================
  const renderPrecedencePanel = () => {
    const panelBg = useColorModeValue('white', 'gray.850');
    const panelBorder = useColorModeValue('gray.200', 'gray.700');
    const sectionBg = useColorModeValue('gray.50', 'gray.800');
    const headingColor = useColorModeValue('gray.700', 'gray.200');

    return (
      <Box
        w="380px"
        minW="340px"
        bg={panelBg}
        borderLeft="1px solid"
        borderColor={panelBorder}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        position="relative"
      >
        <Flex
          h="50px"
          align="center"
          justify="space-between"
          px={4}
          borderBottom="1px solid"
          borderColor={panelBorder}
          bg={useColorModeValue('teal.50', 'teal.900')}
        >
          <HStack spacing={2}>
            <Icon as={FiZap} color="teal.500" />
            <Text fontSize="sm" fontWeight="bold" color={headingColor}>
              Precedence Analysis
            </Text>
            {precedenceStatus === 'completed' && (
              <Badge colorScheme="green" fontSize="2xs">Complete</Badge>
            )}
            {precedenceStatus === 'processing' && (
              <Badge colorScheme="blue" fontSize="2xs">
                <Spinner size="xs" mr={1} /> Analyzing
              </Badge>
            )}
          </HStack>
          <IconButton
            icon={<FaTimes />}
            size="xs"
            variant="ghost"
            onClick={() => {
              setIsPrecedencePanelOpen(false);
              setActiveDraftingTool(null);
            }}
          />
        </Flex>

        <Box flex="1" overflowY="auto" p={4}>
          {precedenceStatus === 'idle' && (
            <VStack spacing={4} align="center" justify="center" h="full" color="gray.500">
              <Icon as={FiUploadCloud} boxSize={8} />
              <Text fontSize="sm" textAlign="center">
                Upload a document in the chat to start precedence analysis.
              </Text>
            </VStack>
          )}

          {precedenceStatus === 'processing' && (
            <VStack spacing={4} mt={10}>
              <Spinner size="xl" color="teal.500" thickness="4px" />
              <Text fontSize="sm" fontWeight="medium">Extracting Legal Precedents...</Text>
            </VStack>
          )}

          {precedenceStatus === 'completed' && precedenceResults && (
            <VStack spacing={6} align="stretch">
              <Box bg={sectionBg} p={3} borderRadius="md" borderWidth="1px" borderColor={panelBorder}>
                <Heading size="xs" mb={2} color="teal.500">Overall Summary</Heading>
                <Text fontSize="sm">{precedenceResults.overallSummary}</Text>
              </Box>

              <Box>
                <Heading size="xs" mb={2} color="teal.500">Legal Issues Identified</Heading>
                <VStack align="stretch" spacing={2}>
                  {precedenceResults.legalIssues?.map((issue, idx) => (
                    <Flex key={idx} bg={sectionBg} p={2} borderRadius="md" borderWidth="1px" borderColor={panelBorder}>
                      <Icon as={FiCheckCircle} color="teal.400" mt={1} mr={2} />
                      <Text fontSize="sm">{issue}</Text>
                    </Flex>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Heading size="xs" mb={3} color="teal.500">Relevant Case Laws / Precedents</Heading>
                <VStack align="stretch" spacing={3}>
                  {precedenceResults.precedents?.map((prec, idx) => (
                    <Box key={idx} bg={sectionBg} p={3} borderRadius="md" borderWidth="1px" borderColor={panelBorder}>
                      <Text fontSize="sm" fontWeight="bold" color={headingColor}>{prec.caseName}</Text>
                      <Text fontSize="xs" color="gray.500" mb={2}>{prec.citation} Ã¢â‚¬Â¢ {prec.court} ({prec.year})</Text>
                      <Text fontSize="sm" mb={2}>{prec.summary}</Text>
                      <Badge colorScheme="teal" fontSize="2xs">Relevance: {prec.relevance}</Badge>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          )}

          {precedenceStatus === 'failed' && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Analysis Failed</AlertTitle>
                <AlertDescription fontSize="xs">Please try again.</AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>
      </Box>
    );
  };

  // ============================================
  // COUNTER MAKER PANEL
  // ============================================
  const renderCounterMakerPanel = () => {
    const panelBg = useColorModeValue('white', 'gray.850');
    const panelBorder = useColorModeValue('gray.200', 'gray.700');
    const sectionBg = useColorModeValue('gray.50', 'gray.800');
    const headingColor = useColorModeValue('gray.700', 'gray.200');

    return (
      <Box
        w="420px"
        minW="380px"
        bg={panelBg}
        borderLeft="1px solid"
        borderColor={panelBorder}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        position="relative"
      >
        <Flex
          h="50px"
          align="center"
          justify="space-between"
          px={4}
          borderBottom="1px solid"
          borderColor={panelBorder}
          bg={useColorModeValue('orange.50', 'orange.900')}
        >
          <HStack spacing={2}>
            <Icon as={FiEdit} color="orange.500" />
            <Text fontSize="sm" fontWeight="bold" color={headingColor}>
              Counter Affidavit Editor
            </Text>
            {counterMakerStatus === 'completed' && (
              <Badge colorScheme="green" fontSize="2xs">Draft Ready</Badge>
            )}
            {counterMakerStatus === 'processing' && (
              <Badge colorScheme="blue" fontSize="2xs">
                <Spinner size="xs" mr={1} /> Drafting
              </Badge>
            )}
          </HStack>
          <IconButton
            icon={<FaTimes />}
            size="xs"
            variant="ghost"
            onClick={() => {
              setIsCounterMakerPanelOpen(false);
              setActiveDraftingTool(null);
            }}
          />
        </Flex>

        <Box flex="1" overflowY="auto" p={4} display="flex" flexDirection="column">
          {counterMakerStatus === 'idle' && (
            <VStack spacing={4} align="center" justify="center" h="full" color="gray.500">
              <Icon as={FiUploadCloud} boxSize={8} />
              <Text fontSize="sm" textAlign="center">
                Upload the original complaint/petition to begin.
              </Text>
            </VStack>
          )}

          {counterMakerStatus === 'processing' && (
            <VStack spacing={4} mt={10}>
              <Spinner size="xl" color="orange.500" thickness="4px" />
              <Text fontSize="sm" fontWeight="medium">Drafting Counter Affidavit...</Text>
            </VStack>
          )}

          {counterMakerStatus === 'completed' && counterMakerResults && (
            <VStack spacing={4} align="stretch" flex="1">
              <Box bg={sectionBg} p={3} borderRadius="md" borderWidth="1px" borderColor={panelBorder}>
                <Heading size="xs" mb={2} color="orange.500">Strategy Analysis</Heading>
                <Text fontSize="sm">{counterMakerResults.analysis}</Text>
              </Box>

              <Box flex="1" display="flex" flexDirection="column">
                <Heading size="xs" mb={2} color="orange.500">{counterMakerResults.title}</Heading>
                <Textarea
                  value={counterMakerResults.content}
                  readOnly
                  flex="1"
                  minH="300px"
                  fontFamily="mono"
                  fontSize="sm"
                  bg={useColorModeValue('white', 'gray.900')}
                />
              </Box>

              <Button colorScheme="orange" leftIcon={<FaDownload />} size="sm">
                Download Draft
              </Button>
            </VStack>
          )}

          {counterMakerStatus === 'failed' && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Drafting Failed</AlertTitle>
                <AlertDescription fontSize="xs">Please try again.</AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>
      </Box>
    );
  };


  // ============================================
  const renderResearchReportPanel = () => {
    const panelBg = useColorModeValue('white', 'gray.850');
    const panelBorder = useColorModeValue('gray.200', 'gray.700');
    const sectionBg = useColorModeValue('gray.50', 'gray.800');
    const headingColor = useColorModeValue('gray.700', 'gray.200');

    const etaRemaining = Math.max(0, researchEta - researchElapsed);
    const progressPercent = Math.min(100, (researchElapsed / researchEta) * 100);

    return (
      <Box
        w="380px"
        minW="340px"
        bg={panelBg}
        borderLeft="1px solid"
        borderColor={panelBorder}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        position="relative"
      >
        {/* Panel Header */}
        <Flex
          h="50px"
          align="center"
          justify="space-between"
          px={4}
          borderBottom="1px solid"
          borderColor={panelBorder}
          bg={useColorModeValue('blue.50', 'blue.900')}
        >
          <HStack spacing={2}>
            <Icon as={FiCpu} color="blue.500" />
            <Text fontSize="sm" fontWeight="bold" color={headingColor}>
              Research Report
            </Text>
            {(researchStatus === 'completed' || researchStatus === 'completed_with_errors') && (
              <Badge colorScheme="green" fontSize="2xs">Complete</Badge>
            )}
            {researchStatus === 'processing' && (
              <Badge colorScheme="blue" fontSize="2xs">
                <Spinner size="xs" mr={1} /> Analyzing
              </Badge>
            )}
          </HStack>
          <IconButton
            icon={<FaTimes />}
            size="xs"
            variant="ghost"
            onClick={() => setIsReportPanelOpen(false)}
            aria-label="Close report panel"
          />
        </Flex>

        {/* Panel Body */}
        <Box
          flex="1"
          overflowY="auto"
          p={4}
          css={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { background: panelBorder, borderRadius: '24px' },
          }}
        >
          {/* PROCESSING STATE Ã¢â‚¬â€ ETA Progress */}
          {(researchStatus === 'starting' || researchStatus === 'processing') && (
            <VStack spacing={5} align="stretch">
              {/* ETA Card */}
              <Box
                p={5}
                borderRadius="xl"
                bg={useColorModeValue('blue.50', 'blue.900')}
                border="1px solid"
                borderColor={useColorModeValue('blue.100', 'blue.700')}
                textAlign="center"
              >
                <Box position="relative" display="inline-block" mb={3}>
                  <Spinner
                    size="xl"
                    color="blue.500"
                    thickness="3px"
                    speed="1.2s"
                  />
                </Box>
                <Text fontSize="lg" fontWeight="bold" color={headingColor} mb={1}>
                  Deep Research in Progress
                </Text>
                <Text fontSize="sm" color="gray.500" mb={3}>
                  {researchAgentStage || 'Initializing...'}
                </Text>

                {/* Progress bar */}
                <Progress
                  value={progressPercent}
                  size="sm"
                  colorScheme="blue"
                  borderRadius="full"
                  mb={2}
                  sx={{
                    '& > div': {
                      transition: 'width 1s ease-in-out',
                    },
                  }}
                />
                <HStack justify="space-between" fontSize="xs" color="gray.400">
                  <Text>{Math.floor(researchElapsed)}s elapsed</Text>
                  <Text>~{etaRemaining}s remaining</Text>
                </HStack>
              </Box>

              {/* Agent stages */}
              <VStack spacing={2} align="stretch">
                {[
                  { label: 'Agent 1: Document Reader', threshold: 0, icon: '📄' },
                  { label: 'Agent 2: Action Analyzer', threshold: 45, icon: '⚡' },
                  { label: 'Agent 3: Summarizer', threshold: 65, icon: '📋' },
                ].map((agent, i) => {
                  const isActive = researchElapsed >= agent.threshold && researchElapsed < (i < 2 ? [45, 65][i] : 999);
                  const isDone = researchElapsed >= (i < 2 ? [45, 65][i] : 999);
                  return (
                    <HStack
                      key={i}
                      p={3}
                      borderRadius="lg"
                      bg={isActive ? useColorModeValue('blue.50', 'blue.900') : sectionBg}
                      border={isActive ? '1px solid' : 'none'}
                      borderColor={isActive ? 'blue.300' : 'transparent'}
                      opacity={researchElapsed < agent.threshold ? 0.4 : 1}
                      transition="all 0.3s ease"
                    >
                      <Text fontSize="lg">{agent.icon}</Text>
                      <Text fontSize="sm" fontWeight={isActive ? 'bold' : 'normal'} flex={1}>
                        {agent.label}
                      </Text>
                      {isDone && <Badge colorScheme="green" fontSize="2xs">Ã¢Å“â€œ</Badge>}
                      {isActive && <Spinner size="xs" color="blue.500" />}
                    </HStack>
                  );
                })}
              </VStack>

              <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                You can navigate away Ã¢â‚¬â€ your research will continue in the background.
              </Text>
            </VStack>
          )}

          {/* FAILED STATE */}
          {researchStatus === 'failed' && (
            <VStack spacing={4} align="center" py={8}>
              <Text fontSize="3xl">Ã¢ÂÅ’</Text>
              <Text fontWeight="bold" color="red.500">Research Failed</Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Something went wrong during analysis. Please try again.
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleStartDeepResearch}
                leftIcon={<Icon as={FiCpu} />}
              >
                Retry Research
              </Button>
            </VStack>
          )}

          {/* COMPLETED STATE Ã¢â‚¬â€ Full Report */}
          {(researchStatus === 'completed' || researchStatus === 'completed_with_errors') && researchResults && (
            <VStack spacing={4} align="stretch">
              {researchStatus === 'completed_with_errors' && (
                <Box p={3} bg="orange.50" _dark={{ bg: 'orange.900' }} borderRadius="md" borderLeft="3px solid" borderLeftColor="orange.400">
                  <Text fontSize="xs" color="orange.600" fontWeight="bold">
                    ⚠️ Some analysis stages encountered errors. Partial results are shown.
                  </Text>
                </Box>
              )}

              {/* Context & Synthesis */}
              {researchResults.agent1Data && !researchResults.agent1Data.error && (
                <>
                  <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="blue.400">
                    <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" mb={2}>
                      📄 Document Context
                    </Text>
                    <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                      {typeof researchResults.agent1Data.context === 'string' ? researchResults.agent1Data.context.replace(/\*\*/g, '') : researchResults.agent1Data.context}
                    </Text>
                  </Box>

                  <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="purple.400">
                    <Text fontSize="xs" fontWeight="bold" color="purple.600" textTransform="uppercase" mb={2}>
                      Ã°Å¸â€â€˜ Key Points
                    </Text>
                    <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                      {typeof researchResults.agent1Data.keyPoints === 'string' ? researchResults.agent1Data.keyPoints.replace(/\*\*/g, '') : researchResults.agent1Data.keyPoints}
                    </Text>
                  </Box>

                  {researchResults.agent1Data.synthesis && (
                    <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="teal.400">
                      <Text fontSize="xs" fontWeight="bold" color="teal.600" textTransform="uppercase" mb={2}>
                        🧠 Synthesis
                      </Text>
                      <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                        {typeof researchResults.agent1Data.synthesis === 'string' ? researchResults.agent1Data.synthesis.replace(/\*\*/g, '') : researchResults.agent1Data.synthesis}
                      </Text>
                    </Box>
                  )}

                  {/* Chronology / Dates Table */}
                  {Array.isArray(researchResults.agent1Data.dates) && researchResults.agent1Data.dates.length > 0 && (
                    <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="green.400">
                      <Text fontSize="xs" fontWeight="bold" color="green.600" textTransform="uppercase" mb={2}>
                        📅 Key Dates & Events
                      </Text>
                      <VStack spacing={1} align="stretch">
                        {researchResults.agent1Data.dates.slice(0, 10).map((d, i) => (
                          <HStack key={i} fontSize="xs" p={2} bg={useColorModeValue('white', 'gray.900')} borderRadius="md" spacing={3}>
                            <Badge colorScheme="green" fontSize="2xs" minW="70px" textAlign="center">
                              {d.date || 'N/A'}
                            </Badge>
                            <Text flex={1} color={headingColor}>{d.event || d.description || 'Unknown event'}</Text>
                          </HStack>
                        ))}
                        {researchResults.agent1Data.dates.length > 10 && (
                          <Text fontSize="2xs" color="gray.400">+{researchResults.agent1Data.dates.length - 10} more dates...</Text>
                        )}
                      </VStack>
                    </Box>
                  )}
                </>
              )}

              {/* Actionable Steps (Agent 2) */}
              {researchResults.agent2Data && !researchResults.agent2Data.error && (
                <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="orange.400">
                  <Text fontSize="xs" fontWeight="bold" color="orange.600" textTransform="uppercase" mb={2}>
                    ⚡ Actionable Steps
                  </Text>
                  <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                    {typeof researchResults.agent2Data.actionableSteps === 'string' ? researchResults.agent2Data.actionableSteps.replace(/\*\*/g, '') : researchResults.agent2Data.actionableSteps}
                  </Text>
                </Box>
              )}

              {/* Summary (Agent 3) */}
              {researchResults.agent3Summary && !researchResults.agent3Summary.error && (
                <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="cyan.400">
                  <Text fontSize="xs" fontWeight="bold" color="cyan.600" textTransform="uppercase" mb={2}>
                    📋 Document Summary
                  </Text>
                  <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                    {typeof researchResults.agent3Summary === 'string'
                      ? researchResults.agent3Summary.replace(/\*\*/g, '')
                      : (researchResults.agent3Summary.summary || JSON.stringify(researchResults.agent3Summary, null, 2)).replace(/\*\*/g, '')
                    }
                  </Text>
                </Box>
              )}

              {/* New Research button */}
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => {
                  setResearchStatus('idle');
                  setResearchResults(null);
                  setResearchSessionId(null);
                  setIsReportPanelOpen(false);
                  localStorage.removeItem('deepResearchSessionId');
                }}
                mt={2}
              >
                Start New Research
              </Button>
            </VStack>
          )}

          {/* IDLE STATE Ã¢â‚¬â€ nothing to show */}
          {researchStatus === 'idle' && (
            <VStack spacing={4} align="center" py={8}>
              <Icon as={FiCpu} w={10} h={10} color="gray.300" />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Upload a file and click "Start Deep Research" from the sidebar to begin analysis.
              </Text>
            </VStack>
          )}
        </Box>
      </Box>
    );
  };

  return (
      <Flex w="full" h="full" direction="column" overflow="hidden" p={4}>
        <input type="file" id="file-upload" style={{ display: 'none' }} onChange={handleFileUpload} />
        <input type="file" id="review-file-upload" style={{ display: 'none' }} multiple accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.jpg,.jpeg,.png,.gif,.webp" onChange={handleReviewFilesUpload} />
        <input type="file" id="chronology-file-upload" style={{ display: 'none' }} multiple onChange={handleChronologyFilesUpload} />
        {/* Messages scroll area */}
        <Box
          flex="1"
          w="full"
          overflowY="auto"
          borderRadius="xl"
          p={4}
          bg={bgColor}
          borderWidth={1}
          borderColor={borderColor}
          boxShadow="sm"
          position="relative"
          css={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { background: borderColor, borderRadius: '24px' }
          }}
        >
          {isInitialLoad ? (
            <Center h="full">
              <Spinner size="lg" color="blue.500" />
            </Center>
          ) : messages.length === 0 ? (
            <Center h="full">
              <VStack spacing={2}>
                <Text color={textColor} fontWeight="bold">Welcome to Dastavez AI</Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Select a tab from the left sidebar to upload files, load drafting templates, or ask legal questions.
                </Text>
              </VStack>
            </Center>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                role={msg.role}
                onSuggestedActionClick={handleSuggestedActionClick}
                onDownload={handleDownloadFile}
                language={language}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* User Input Prompt controls */}
        <Box pt={4} w="full">
          <VStack spacing={2} w="full">
            {/* Selected File Display inline inside Chat */}
            {selectedFile && (
              <HStack
                bg={useColorModeValue('blue.50', 'blue.900')}
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
                            {/* File Upload Button */}
              <Tooltip label="Upload file" placement="top">
                <IconButton
                  icon={<AttachmentIcon />}
                  aria-label="Upload file"
                  size="md"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => fileInputRef.current?.click()}
                />
              </Tooltip>

              {intentLabel && (
                <Badge colorScheme="purple" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                  {intentLabel} ✖
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
                        : (activeTab === 'research' && researchSessionId && ['completed', 'completed_with_errors'].includes(researchStatus))
                          ? "Ask questions about the research report..."
                          : (activeTab === 'chronology' && chronologySessionId && ['completed', 'completed_with_errors'].includes(chronologyStatus))
                            ? "Ask questions about the timeline..."
                            : (activeTab === 'review' && bulkReviewSessionId && ['completed', 'completed_with_errors'].includes(reviewStatus))
                              ? "Ask questions about the documents..."
                              : "Type your message..."
                }
                size="md"
                bg={isListening ? useColorModeValue('red.50', 'red.900') : inputBg}
                color={textColor}
                isDisabled={isPendingUserChoice || isLoading || analyzingFile}
                onKeyPress={handleKeyPress}
                flex={1}
              />
              
              <Tooltip label="Voice input" placement="top">
                <IconButton
                  icon={isListening ? <FiMicOff /> : <FiMic />}
                  onClick={toggleListening}
                  size="md"
                  colorScheme={isListening ? 'red' : 'blue'}
                  isDisabled={!speechSupported}
                  aria-label="Voice input"
                />
              </Tooltip>

              <IconButton
                icon={<Icon as={RiSendPlaneFill} />}
                onClick={() => handleSendMessage()}
                size="md"
                colorScheme="blue"
                isDisabled={!input.trim() || isLoading}
                aria-label="Send message"
              />
            </HStack>
          </VStack>
        </Box>
      </Flex>
    );
  
};

export default ChatPage;
