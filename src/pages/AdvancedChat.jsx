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
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, DeleteIcon, AttachmentIcon, ViewIcon, ViewOffIcon, AddIcon } from '@chakra-ui/icons';
import { RiSendPlaneFill } from 'react-icons/ri';
import { FiMaximize2, FiFileText, FiMic, FiMicOff, FiGlobe, FiRefreshCw, FiEdit, FiZap } from 'react-icons/fi';
import { MdDocumentScanner } from 'react-icons/md';
import axios from 'axios';
import ChatMessage from '../chat-advanced/components/ChatMessage';
import { useAuth } from '../chat-advanced/AuthBridge';
import { Link } from 'react-router-dom';
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


const ChatPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { token, logout, user } = useAuth();
  const toast = useToast();

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

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    toast({
      title: language === 'en' ? 'भाषा बदली गई: हिंदी' : 'Language changed: English',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

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
  }, [token, toast]);

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
  const handleSuggestedActionClick = async (actionType, suggestion) => {
    console.log('Suggested action clicked:', actionType, suggestion);

    // Clear pending state when user clicks any action button
    setIsPendingUserChoice(false);

    // NOTE: We do NOT disable buttons here - they should only be disabled when a new message arrives
    // This allows users to open/close modals without losing button functionality

    switch (actionType) {
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

      // **SKIP BACKEND CALL** - directly open fields modal with schema
      console.log('📋 [handleTemplateSelect] Opening fields modal directly...');

      await openFieldsModalWithSchema({
        templatePath: template.relPath,
        templateTitle: template.displayTitle,
        missingFields: null // Will fetch schema from backend
      });

      console.log('✅ [handleTemplateSelect] Fields modal opened successfully');

    } catch (error) {
      console.error('❌ [handleTemplateSelect] Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });

      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: error.response?.data?.message || error.message || (language === 'hi' ? 'टेम्पलेट लोड करने में विफल' : 'Failed to load template'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      // Still show a helpful message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'hi'
          ? `क्षमा करें, "${template.displayTitle}" लोड करते समय त्रुटि हुई। कृपया पुनः प्रयास करें।`
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

    // Normalize URL: ensure API base for relative paths
    const isAbsolute = fileUrl.startsWith('http');
    const isExternal = isAbsolute && !fileUrl.includes(BASE_URL);
    const downloadUrl = isAbsolute ? fileUrl : `${BASE_URL}${fileUrl}`;

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

  return (
    <Box minH="100vh" bg={bgMain}>
      <Flex
        as="header"
        position="fixed"
        w="full"
        px={4}
        height="60px"
        alignItems="center"
        justifyContent="space-between"
        bg={headerBg}
        borderBottom="1px"
        borderColor={borderColor}
        zIndex="sticky"
      >
        <HStack spacing={4}>
          <Link to="/">
            <Heading size="md" color={textColor} cursor="pointer" _hover={{ textDecoration: 'none', opacity: 0.8 }}>Dastavez AI</Heading>
          </Link>
          {subscriptionStatus === 'premium' ? (
            <Badge colorScheme="green" fontSize="sm">Premium</Badge>
          ) : (
            <Tooltip label="Upgrade to premium for unlimited messages">
              <Badge colorScheme="blue" fontSize="sm">
                {remainingMessages !== null ? `${remainingMessages} messages left today` : 'Free Plan'}
              </Badge>
            </Tooltip>
          )}
        </HStack>
        <HStack spacing={4}>
          <Link to="/profile">
            <Avatar
              size="sm"
              name={user?.firstName}
              src={user?.profileImage}
              cursor="pointer"
              _hover={{ boxShadow: 'outline', border: '2px solid #3182ce' }}
            />
          </Link>

          {/* Smart Scanner Button */}
          <Tooltip
            label={
              !selectedFile
                ? (language === 'hi' ? 'पहले फ़ाइल अपलोड करें' : 'Upload a file first')
                : scanStatus === 'scanning'
                  ? (language === 'hi' ? 'स्कैन हो रहा है...' : 'Scanning...')
                  : scanStatus === 'scanned'
                    ? (language === 'hi' ? 'स्कैन पूरा ✓' : 'Scan complete ✓')
                    : (language === 'hi' ? 'स्मार्ट स्कैनर' : 'Smart Scanner')
            }
            placement="bottom"
          >
            <Button
              size="sm"
              variant={scanStatus === 'scanned' ? 'solid' : 'outline'}
              colorScheme={scanStatus === 'scanned' ? 'green' : scanStatus === 'scanning' ? 'blue' : selectedFile ? 'red' : 'gray'}
              leftIcon={scanStatus === 'scanning' ? <Spinner size="xs" /> : <Icon as={MdDocumentScanner} />}
              onClick={handleSmartScan}
              isDisabled={!selectedFile || scanStatus === 'scanning'}
              isLoading={scanStatus === 'scanning'}
              loadingText={language === 'hi' ? 'स्कैन...' : 'Scanning'}
            >
              {scanStatus === 'scanned'
                ? (language === 'hi' ? 'स्कैन ✓' : 'Scanned ✓')
                : (language === 'hi' ? 'स्कैन' : 'Scan')
              }
            </Button>
          </Tooltip>

          {/* Edit Document Button */}
          <Tooltip
            label={
              !selectedFile
                ? (language === 'hi' ? 'पहले फ़ाइल अपलोड करें' : 'Upload a file first')
                : (language === 'hi' ? 'दस्तावेज़ संपादित करें' : 'Open document editor')
            }
            placement="bottom"
          >
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              leftIcon={<Icon as={FiEdit} />}
              onClick={handleOpenEditor}
              isDisabled={!selectedFile}
            >
              {language === 'hi' ? 'संपादित करें' : 'Edit'}
            </Button>
          </Tooltip>
          {/* Language Toggle Button */}
          <Tooltip label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'} placement="bottom">
            <Button
              size="sm"
              variant="outline"
              colorScheme={language === 'hi' ? 'orange' : 'blue'}
              leftIcon={<Icon as={FiGlobe} />}
              onClick={toggleLanguage}
              fontWeight="bold"
              minW="70px"
            >
              {language === 'en' ? 'EN' : 'हिं'}
            </Button>
          </Tooltip>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Toggle color mode"
          />
          <IconButton
            icon={<DeleteIcon />}
            onClick={handleClearChat}
            variant="ghost"
            aria-label="Clear chat"
          />
          <Button
            onClick={logout}
            variant="ghost"
            colorScheme="red"
          >
            Logout
          </Button>
        </HStack>
      </Flex>

      <Container maxW="container.lg" h="calc(100vh - 100px)" pt="80px">
        <VStack h="full" spacing={4}>
          <Box
            flex="1"
            w="full"
            overflowY="auto"
            borderRadius="xl"
            p={4}
            bg={bgColor}
            borderWidth={1}
            borderColor={borderColor}
            boxShadow="xl"
            position="relative"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: borderColor,
                borderRadius: '24px',
              },
            }}
          >
            {isInitialLoad ? (
              <Center h="full">
                <Spinner size="lg" color="blue.500" />
              </Center>
            ) : messages.length === 0 ? (
              <Center h="full">
                <Text color={textColor}>No messages yet. Start a conversation!</Text>
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

            {/* Post-download options are now inline with suggestedActions in the message */}
            {/* Keeping this hidden - use inline buttons instead */}

            <div ref={messagesEndRef} />
          </Box>
        </VStack>

        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg={bgColor}
          p={4}
          boxShadow="lg"
          borderTop="1px"
          borderColor={borderColor}
        >
          <VStack spacing={4} maxW="1200px" mx="auto">

            {/* Selected File Display */}
            {selectedFile && (
              <HStack
                bg={useColorModeValue('blue.50', 'blue.900')}
                p={3}
                borderRadius="md"
                w="100%"
                justify="space-between"
              >
                <HStack spacing={2}>
                  <Icon as={FaFile} color="blue.500" />
                  <Text color={textColor} fontSize="sm">{selectedFile.fileName}</Text>
                  {scanStatus === 'scanned' && (
                    <Badge colorScheme="green" fontSize="2xs">Scanned</Badge>
                  )}
                  {editSessionActive && (
                    <Badge colorScheme="purple" fontSize="2xs">Edit Active</Badge>
                  )}
                </HStack>
                <HStack spacing={1}>
                  {editSessionActive && (
                    <Button size="xs" variant="ghost" colorScheme="gray" onClick={handleExitEditMode}>
                      Exit Edit
                    </Button>
                  )}
                  <IconButton
                    icon={<FaTimes />}
                    size="sm"
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
                    size="lg"
                    variant={intentOverride ? 'solid' : 'ghost'}
                    colorScheme={intentOverride ? 'purple' : 'blue'}
                  />
                </Tooltip>
                <MenuList>
                  <MenuItem
                    onClick={() => { setIntentOverride(null); setIntentLabel(null); }}
                    fontWeight={!intentOverride ? 'bold' : 'normal'}
                  >
                    💬 Auto-detect (Default)
                  </MenuItem>
                  <MenuItem
                    onClick={() => { setIntentOverride('CONVERSATIONAL'); setIntentLabel('Chat'); }}
                    fontWeight={intentOverride === 'CONVERSATIONAL' ? 'bold' : 'normal'}
                  >
                    🗣️ Conversational Chat
                  </MenuItem>
                  <MenuItem
                    onClick={() => { setIntentOverride('LEGAL_INFORMATION'); setIntentLabel('Legal Query'); }}
                    fontWeight={intentOverride === 'LEGAL_INFORMATION' ? 'bold' : 'normal'}
                  >
                    ⚖️ Legal Information
                  </MenuItem>
                  <MenuItem
                    onClick={() => { setIntentOverride('DOCUMENT_REQUEST'); setIntentLabel('Draft'); }}
                    fontWeight={intentOverride === 'DOCUMENT_REQUEST' ? 'bold' : 'normal'}
                  >
                    📝 Draft Document
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* Show selected intent badge - clickable to clear */}
              {intentLabel && (
                <HStack spacing={1}>
                  <Tooltip label={language === 'hi' ? 'मोड रीसेट करें' : 'Click to reset to auto-detect'} placement="top">
                    <Badge
                      colorScheme="purple"
                      variant="solid"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="full"
                      cursor="pointer"
                      _hover={{ opacity: 0.8 }}
                      onClick={() => { setIntentOverride(null); setIntentLabel(null); handleHardReset(); }}
                    >
                      {intentLabel} ✕
                    </Badge>
                  </Tooltip>
                </HStack>
              )}

              {/* Hard Reset button when intent is active */}
              {(intentOverride || showPostDownloadOptions) && (
                <Tooltip label={language === 'hi' ? 'AI स्वचालित मोड पर वापस जाएं' : 'Return to AI auto-detect mode'} placement="top">
                  <IconButton
                    icon={<Icon as={FiRefreshCw} />}
                    size="sm"
                    colorScheme="gray"
                    variant="ghost"
                    aria-label="Reset to auto-detect"
                    onClick={handleHardReset}
                  />
                </Tooltip>
              )}

              <Input
                value={input + (interimTranscript ? ` ${interimTranscript}` : '')}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isPendingUserChoice
                    ? (language === 'hi' ? '👆 कृपया ऊपर दिए गए विकल्पों का उपयोग करें' : '👆 Please use the suggested actions above')
                    : isListening
                      ? "🎤 Listening... speak now"
                      : isEditMode
                        ? "Describe the edit you want to make..."
                        : (intentLabel ? `Type your ${intentLabel.toLowerCase()} request...` : "Type your message...")
                }
                size="lg"
                bg={isListening ? useColorModeValue('red.50', 'red.900') : inputBg}
                color={textColor}
                opacity={isPendingUserChoice ? 0.6 : 1}
                cursor={isPendingUserChoice ? 'not-allowed' : 'text'}
                isDisabled={isPendingUserChoice || isLoading || analyzingFile}
                _placeholder={{ color: isPendingUserChoice ? 'orange.500' : (isListening ? 'red.400' : placeholderColor) }}
                _hover={{ borderColor: isPendingUserChoice ? 'orange.300' : (isListening ? 'red.300' : 'blue.300') }}
                _focus={{ borderColor: isPendingUserChoice ? 'orange.500' : (isListening ? 'red.500' : 'blue.500'), boxShadow: 'none' }}
                onKeyPress={handleKeyPress}
                flex={1}
                borderColor={isPendingUserChoice ? 'orange.300' : (isListening ? 'red.300' : undefined)}
                borderWidth={isPendingUserChoice ? '2px' : (isListening ? '2px' : undefined)}
              />
              <Input
                type="file"
                accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileUpload}
                display="none"
                id="file-upload"
              />
              <Tooltip label="Attach file" placement="top">
                <label htmlFor="file-upload">
                  <IconButton
                    as="span"
                    icon={<FaPaperclip />}
                    aria-label="Attach file"
                    size="lg"
                    colorScheme="blue"
                    variant="ghost"
                    isLoading={uploading}
                  />
                </label>
              </Tooltip>
              {/* Voice Input Button */}
              <Tooltip
                label={
                  !speechSupported
                    ? "Voice input not supported in your browser"
                    : isListening
                      ? "Stop listening"
                      : "Voice input (click to speak)"
                }
                placement="top"
              >
                <IconButton
                  icon={isListening ? <FiMicOff /> : <FiMic />}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  size="lg"
                  colorScheme={isListening ? "red" : "blue"}
                  variant={isListening ? "solid" : "ghost"}
                  onClick={toggleListening}
                  isDisabled={!speechSupported}
                  animation={isListening ? "pulse 1.5s infinite" : undefined}
                  sx={isListening ? {
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(229, 62, 62, 0.7)' },
                      '70%': { boxShadow: '0 0 0 10px rgba(229, 62, 62, 0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(229, 62, 62, 0)' },
                    }
                  } : {}}
                />
              </Tooltip>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleSendMessage}
                isLoading={isLoading || analyzingFile}
                loadingText={analyzingFile ? "Analyzing..." : "Sending..."}
              >
                Send
              </Button>
            </HStack>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box w="100%" mt={2}>
                <Progress
                  value={uploadProgress}
                  size="sm"
                  colorScheme="blue"
                  hasStripe
                  isAnimated
                />
                <Text fontSize="sm" color="gray.500" mt={1} textAlign="center">
                  Uploading: {uploadProgress}%
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Container>

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
        <ModalContent bg={useColorModeValue('white', 'gray.800')} borderRadius="xl" mx={4}>
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
              <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" borderLeft="3px solid" borderLeftColor="blue.400">
                <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" mb={1}>
                  {language === 'hi' ? 'दस्तावेज़ प्रकार' : 'Document Type'}
                </Text>
                <Text fontSize="md" fontWeight="600">
                  {scanResults?.documentType || 'General Document'}
                </Text>
              </Box>

              {/* Structure */}
              {scanResults?.structure && (
                <Box p={3} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="md" borderLeft="3px solid" borderLeftColor="purple.400">
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
                <Box p={3} bg={useColorModeValue('green.50', 'green.900')} borderRadius="md" borderLeft="3px solid" borderLeftColor="green.400">
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
              <Box p={3} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="md" borderLeft="3px solid" borderLeftColor="orange.400">
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
                <Box p={3} bg={useColorModeValue('red.50', 'red.900')} borderRadius="md" borderLeft="3px solid" borderLeftColor="red.400">
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
    </Box>
  );
};

export default ChatPage;
