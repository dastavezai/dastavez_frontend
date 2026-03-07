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
import ChatMessage from '../components/ChatMessage';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import fileService from '../services/fileService';
import { FaFile, FaTimes, FaPaperclip, FaEdit, FaDownload, FaRobot } from 'react-icons/fa';
const FullPageEditor = lazy(() => import('../components/FullPageEditor'));
import DocumentFieldsModal from '../components/DocumentFieldsModal';
import PostDownloadOptions from '../components/PostDownloadOptions';
import TemplateBrowser from '../components/TemplateBrowser';
import DocumentTypeSelector from '../components/DocumentTypeSelector';
import LegalGuidanceModal from '../components/LegalGuidanceModal';
import ComplaintFormModal from '../components/ComplaintFormModal';
import TemplateDesignSelector from '../components/TemplateDesignSelector';
import draftService from '../services/draftService';

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
  
  
  const [clearPassword, setClearPassword] = useState('');
  const [showClearPassword, setShowClearPassword] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { isOpen: isClearModalOpen, onOpen: onClearModalOpen, onClose: onClearModalClose } = useDisclosure();
  
  
  const [intentOverride, setIntentOverride] = useState(null);
  const [intentLabel, setIntentLabel] = useState(null);
  
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSessionActive, setEditSessionActive] = useState(false);
  const [editChangesCount, setEditChangesCount] = useState(0);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [editSession, setEditSession] = useState(null);
  const [isFullEditorOpen, setIsFullEditorOpen] = useState(false);
  
  
  const [scanStatus, setScanStatus] = useState('none');
  const [scanResults, setScanResults] = useState(null);
  const [formatMetadata, setFormatMetadata] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [isScanReportOpen, setIsScanReportOpen] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const [ocrTextLength, setOcrTextLength] = useState(0);
  const [scanData, setScanData] = useState(null);
  
  
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState(false);
  const [fieldsModalData, setFieldsModalData] = useState(null);
  
  
  const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);
  
  
  const [isDocTypeSelectorOpen, setIsDocTypeSelectorOpen] = useState(false);
  
  
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  
  
  const [isComplaintFormOpen, setIsComplaintFormOpen] = useState(false);
  const [complaintContext, setComplaintContext] = useState({});
  const [lastGeneratedComplaint, setLastGeneratedComplaint] = useState(null);
  
  
  const [showPostDownloadOptions, setShowPostDownloadOptions] = useState(false);
  const [lastGeneratedTemplate, setLastGeneratedTemplate] = useState(null);
  
  
  const [isDesignSelectorOpen, setIsDesignSelectorOpen] = useState(false);
  const [pendingFormGeneration, setPendingFormGeneration] = useState(null);
  const [selectedDesignConfig, setSelectedDesignConfig] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  
  const [lastSubmittedFields, setLastSubmittedFields] = useState(null);
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  
  
  const [formClosedWithoutSubmit, setFormClosedWithoutSubmit] = useState(false);
  const [partialFormData, setPartialFormData] = useState(null);
  
  
  const [activeDraftInfo, setActiveDraftInfo] = useState(null);
  
  
  const [isPendingUserChoice, setIsPendingUserChoice] = useState(false);
  
  
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastSpeechTimeRef = useRef(null);
  const isListeningRef = useRef(false);
  
  
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('chatLanguage') || 'en';
  });
  
  
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

  const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  
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

  
  
  useEffect(() => {
    if (messages.length !== 1) return;
    const [first] = messages;
    if (first?.role !== 'assistant') return;
    const englishWelcome = "Hello! I'm your AI legal assistant. How can I help you today?";
    const hindiWelcome = "नमस्ते! मैं आपका AI कानूनी सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?";
    const shouldUpdate = first.content === englishWelcome || first.content === hindiWelcome;
    if (!shouldUpdate) return;

    setMessages([{ role: 'assistant', content: getWelcomeMessage() }]);
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  
  useEffect(() => {
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      console.log('Speech recognition not supported in this browser');
      return;
    }
    
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    
    recognition.lang = 'en-IN';
    
    
    const playSound = (type) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'start') {
          
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.15);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        } else if (type === 'stop') {
          
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(300, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.25);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.25);
        } else if (type === 'timeout') {
          
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
    
    
    const SILENCE_TIMEOUT = 2500;
    const MAX_LISTEN_TIME = 60000;
    
    let maxTimeoutId = null;
    
    const startSilenceTimer = () => {
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      
      silenceTimeoutRef.current = setTimeout(() => {
        
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
      isListeningRef.current = true;
      setInterimTranscript('');
      lastSpeechTimeRef.current = Date.now();
      playSound('start');
      
      
      startSilenceTimer();
      
      
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
      
      
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);
      
      
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
      isListeningRef.current = false;
      setInterimTranscript('');
      
      
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);
      
      
      if (wasListening) {
        playSound('stop');
      }
    };
    
    recognitionRef.current = recognition;
    
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);
    };
  }, [toast]);
  
  
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
    
    
    setShowPostDownloadOptions(false);

    try {
      let response;

      if (selectedFile && selectedFile._id) {
        setAnalyzingFile(true);
        try {
          
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
        
        
        const payload = { 
          message: userMessage,
          language: language
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
        
        
        if (response.data.complaintData) {
          setLastGeneratedComplaint({
            data: response.data.complaintData,
            content: response.data.document?.fullContent || '',
            timestamp: Date.now()
          });
        }

        
        const hasSuggestedActions = response.data.suggestedActions && response.data.suggestedActions.length > 0;
        const isPendingMode = ['template_confirmation', 'document_ready'].includes(response.data.mode);
        setIsPendingUserChoice(hasSuggestedActions && isPendingMode);

        
        
        if ((response.data.mode === 'waiting_for_details' || response.data.mode === 'draft_form_open') && response.data.missingFields && response.data.templatePath) {
          await openFieldsModalWithSchema({
            templatePath: response.data.templatePath,
            templateTitle: response.data.templateTitle,
            missingFields: response.data.missingFields,
            initialValues: response.data.preFilledValues || {}
          });
          
          setActiveDraftInfo({
            templatePath: response.data.templatePath,
            templateTitle: response.data.templateTitle || (language === 'hi' ? 'दस्तावेज़' : 'Document'),
            missingFields: response.data.missingFields,
            preFilledValues: response.data.preFilledValues || {}
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
      
    } finally {
      setIsLoading(false);
      setAnalyzingFile(false);
    }
  };

  
  const handleClearChat = () => {
    setClearPassword('');
    setShowClearPassword(false);
    onClearModalOpen();
  };

  
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
        initialValues: initialValues || {}
      });
    } catch (schemaError) {
      console.error('❌ [openFieldsModalWithSchema] Schema fetch failed:', schemaError);
      console.error('Schema error details:', {
        message: schemaError.message,
        response: schemaError.response?.data,
        status: schemaError.response?.status
      });
      
      
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
        initialValues: initialValues || {}
      });
    }

    console.log('🚪 [openFieldsModalWithSchema] Opening modal...');
    setIsFieldsModalOpen(true);
    setFormClosedWithoutSubmit(false);
  };

  
  const handleSuggestedActionClick = async (actionType, suggestion) => {
    console.log('Suggested action clicked:', actionType, suggestion);

    
    setIsPendingUserChoice(false);

    
    

    switch (actionType) {
      case 'RESUME_FORM': {
        
        console.log('📝 RESUME_FORM action triggered with data:', partialFormData, activeDraftInfo);
        
        
        const resumeSource = partialFormData || activeDraftInfo;
        if (resumeSource) {
          await openFieldsModalWithSchema({
            templatePath: resumeSource.templatePath,
            templateTitle: resumeSource.templateTitle,
            missingFields: resumeSource.fields || resumeSource.missingFields || [],
            initialValues: resumeSource.partialValues || resumeSource.preFilledValues || {}
          });
          toast({
            title: language === 'hi' ? '📝 फॉर्म फिर से खोला गया' : '📝 Form Resumed',
            description: language === 'hi' 
              ? 'आपका पिछला डेटा बहाल कर दिया गया है' 
              : 'Your previous data has been restored',
            status: 'success',
            duration: 2000,
          });
        } else {
          toast({
            title: language === 'hi' ? 'कोई सक्रिय फॉर्म नहीं' : 'No active form',
            description: language === 'hi' ? 'पहले एक ड्राफ्ट शुरू करें' : 'Please start a draft first',
            status: 'warning',
            duration: 2000,
          });
        }
        break;
      }

      case 'CLOSE_DRAFT_FLOW': {
        
        console.log('❌ CLOSE_DRAFT_FLOW action triggered');
        
        
        try {
          await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.warn('Failed to clear server session on CLOSE_DRAFT_FLOW:', error);
        }
        
        
        setIsFieldsModalOpen(false);
        
        
        setFieldsModalData(null);
        setPartialFormData(null);
        setActiveDraftInfo(null);
        setFormClosedWithoutSubmit(false);
        setIsEditingDocument(false);
        setLastGeneratedTemplate(null);
        setLastSubmittedFields(null);
        setIntentOverride(null);
        setIntentLabel(null);
        setIsPendingUserChoice(false);
        setShowPostDownloadOptions(false);
        
        
        const closeDraftMsg = {
          role: 'assistant',
          content: language === 'hi'
            ? '✅ ड्राफ्ट प्रक्रिया बंद कर दी गई। मैं आपकी कैसे मदद कर सकता हूँ?'
            : '✅ Draft flow closed. How can I help you?',
          suggestedActions: language === 'hi' ? [
            { type: 'action', label: '📄 दस्तावेज़ बनाएं', icon: '📄', action: 'CREATE_DOCUMENT', description: 'नया कानूनी दस्तावेज़ बनाएं' },
            { type: 'action', label: '📚 टेम्पलेट ब्राउज़ करें', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'सभी टेम्पलेट देखें' },
          ] : [
            { type: 'action', label: '📄 Create Document', icon: '📄', action: 'CREATE_DOCUMENT', description: 'Start a new legal document' },
            { type: 'action', label: '📚 Browse Templates', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'View all templates' },
          ],
          mode: 'draft_closed'
        };
        setMessages(prev => [...prev, closeDraftMsg]);
        
        toast({
          title: language === 'hi' ? '✅ ड्राफ्ट बंद' : '✅ Draft Closed',
          status: 'success',
          duration: 2000,
        });
        break;
      }

      case 'REGENERATE_DRAFT': {
        
        console.log('🔄 REGENERATE_DRAFT action triggered');
        
        
        try {
          await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.warn('Failed to clear server session on REGENERATE_DRAFT:', error);
        }
        
        
        setIsFieldsModalOpen(false);
        
        
        setFieldsModalData(null);
        setPartialFormData(null);
        setActiveDraftInfo(null);
        setFormClosedWithoutSubmit(false);
        setIsEditingDocument(false);
        setIntentOverride(null);
        setIntentLabel(null);
        setIsPendingUserChoice(false);
        
        
        const regenMsg = {
          role: 'assistant',
          content: language === 'hi'
            ? '🔄 ठीक है! चलिए नए सिरे से शुरू करते हैं। आप किस तरह का दस्तावेज़ चाहते हैं?'
            : '🔄 Sure! Let\'s start fresh. What kind of document do you need?',
          suggestedActions: language === 'hi' ? [
            { type: 'action', label: '📝 दस्तावेज़ बनाएं', icon: '📝', action: 'CREATE_DOCUMENT', description: 'दस्तावेज़ प्रकार चुनें' },
            { type: 'action', label: '📚 टेम्पलेट ब्राउज़ करें', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'सभी टेम्पलेट देखें' },
            { type: 'action', label: '🧭 मार्गदर्शन करें', icon: '🧭', action: 'GUIDE_ME', description: 'मुझे सही दस्तावेज़ खोजने में मदद करें' },
          ] : [
            { type: 'action', label: '📝 Create Document', icon: '📝', action: 'CREATE_DOCUMENT', description: 'Choose document type' },
            { type: 'action', label: '📚 Browse Templates', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'View all templates' },
            { type: 'action', label: '🧭 Guide Me', icon: '🧭', action: 'GUIDE_ME', description: 'Help me find the right document' },
          ],
          mode: 'draft_regenerate'
        };
        setMessages(prev => [...prev, regenMsg]);
        
        toast({
          title: language === 'hi' ? '🔄 नया ड्राफ्ट शुरू करें' : '🔄 Starting Fresh',
          description: language === 'hi' ? 'पुराना ड्राफ्ट रद्द कर दिया गया' : 'Previous draft discarded',
          status: 'info',
          duration: 2000,
        });
        break;
      }

      case 'ASK_ABOUT_DRAFT': {
        
        console.log('💬 ASK_ABOUT_DRAFT action triggered', activeDraftInfo);
        
        const draftInfo = activeDraftInfo || partialFormData || fieldsModalData;
        const draftTitle = draftInfo?.templateTitle || (language === 'hi' ? 'यह दस्तावेज़' : 'this document');
        
        
        if (isFieldsModalOpen) {
          
          setActiveDraftInfo(prev => ({
            ...prev,
            templatePath: fieldsModalData?.templatePath || prev?.templatePath,
            templateTitle: fieldsModalData?.templateTitle || prev?.templateTitle,
            missingFields: fieldsModalData?.fields || prev?.missingFields,
          }));
          setIsFieldsModalOpen(false);
        }
        
        
        const askMsg = language === 'hi'
          ? `**${draftTitle}** के बारे में बताएं और फ़ॉर्म भरने में मदद करें`
          : `Tell me about **${draftTitle}** and help me fill the form`;
        
        setMessages(prev => [...prev, { role: 'user', content: askMsg }]);
        
        try {
          setIsLoading(true);
          const askResponse = await axios.post(`${BASE_URL}/chat/message`,
            { 
              message: language === 'hi'
                ? `${draftTitle} दस्तावेज़ के बारे में विस्तार से बताएं: इसका उद्देश्य क्या है, इसकी मुख्य धाराएं क्या हैं, और फ़ॉर्म भरते समय क्या ध्यान रखना चाहिए?`
                : `Explain the "${draftTitle}" document in detail: its purpose, key clauses, legal requirements, and tips for filling out the form correctly.`,
              language,
              intentOverride: 'LEGAL_INFORMATION'
            },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          
          if (askResponse.data) {
            const aiHelpMsg = {
              role: 'assistant',
              content: askResponse.data.response,
              suggestedActions: [
                ...((askResponse.data.suggestedActions) || []),
                
                language === 'hi'
                  ? { type: 'draft_action', label: '📝 फ़ॉर्म भरना जारी रखें', icon: '📝', action: 'RESUME_FORM', description: 'फ़ॉर्म वापस खोलें' }
                  : { type: 'draft_action', label: '📝 Resume Form filling', icon: '📝', action: 'RESUME_FORM', description: 'Reopen the form to continue' }
              ]
            };
            setMessages(prev => [...prev, aiHelpMsg]);
          }
        } catch (error) {
          console.error('ASK_ABOUT_DRAFT AI call failed:', error);
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: language === 'hi'
              ? `**${draftTitle}** एक महत्वपूर्ण कानूनी दस्तावेज़ है। फ़ॉर्म भरते समय सटीक जानकारी प्रदान करें।`
              : `**${draftTitle}** is an important legal document. Please provide accurate information when filling the form.`,
            suggestedActions: [
              language === 'hi'
                ? { type: 'draft_action', label: '📝 फ़ॉर्म भरना जारी रखें', icon: '📝', action: 'RESUME_FORM', description: 'फ़ॉर्म वापस खोलें' }
                : { type: 'draft_action', label: '📝 Resume Form filling', icon: '📝', action: 'RESUME_FORM', description: 'Reopen the form to continue' }
            ]
          }]);
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'DOCUMENT_REQUEST': {
        
        console.log('📋 DOCUMENT_REQUEST action triggered:', suggestion);
        
        disableOldButtons();
        setIntentOverride('DOCUMENT_REQUEST');
        
        
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
        
        console.log('📝 CREATE_DOCUMENT action triggered - opening document selector');
        setIntentOverride('DOCUMENT_REQUEST');
        
        
        setIsDocTypeSelectorOpen(true);
        break;
      }

      case 'GUIDE_ME': {
        
        console.log('🧭 GUIDE_ME action triggered - opening guidance modal');
        setIntentOverride('DOCUMENT_REQUEST');
        
        
        setIsGuidanceModalOpen(true);
        break;
      }

      case 'BROWSE_TEMPLATES': {
        
        console.log('🔍 BROWSE_TEMPLATES action triggered - opening template browser');
        setIsTemplateBrowserOpen(true);
        break;
      }

      case 'LEGAL_INFORMATION':
        
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
        
        console.log('🔍 CASE_SEARCH action triggered - searching cases with context');
        
        disableOldButtons();
        
        
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];
        
        
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
            intentOverride: 'LEGAL_INFORMATION'
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
        
        console.log('🔍 browse_templates (lowercase) action triggered - opening template browser');
        setIsTemplateBrowserOpen(true);
        break;
      }

      
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
        
        disableOldButtons();
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
        
        disableOldButtons();
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

      
      case 'AI_DOC_FILLED': {
        
        console.log('📝 AI_DOC_FILLED action triggered');
        disableOldButtons();
        const filledMsg = language === 'hi' ? 'भरा हुआ दस्तावेज़ चाहिए' : 'I want a filled document';
        setMessages(prev => [...prev, { role: 'user', content: filledMsg }]);
        
        try {
          setIsLoading(true);
          const response = await axios.post(`${BASE_URL}/chat/message`, 
            { message: '1', language, intentOverride: 'DOCUMENT_REQUEST' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          if (response.data) {
            
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
        
        console.log('📋 AI_DOC_RAW action triggered');
        disableOldButtons();
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

      
      case 'USE_TEMPLATE': {
        disableOldButtons();
        const templateMsg = language === 'hi' ? 'हाँ, इस टेम्पलेट का उपयोग करें' : 'Yes, use this template';
        setMessages(prev => [...prev, { role: 'user', content: templateMsg }]);
        
        try {
          setIsLoading(true);
          const response = await axios.post(`${BASE_URL}/chat/message`, 
            { message: '1', language, intentOverride: 'DOCUMENT_REQUEST' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          if (response.data) {
            
            const shouldOpenForm = (response.data.mode === 'waiting_for_details' || response.data.mode === 'draft_form_open')
              && response.data.missingFields?.length > 0 && response.data.templatePath;
            if (shouldOpenForm) {
              await openFieldsModalWithSchema({
                templatePath: response.data.templatePath,
                templateTitle: response.data.templateTitle || (language === 'hi' ? 'दस्तावेज़' : 'Document'),
                missingFields: response.data.missingFields,
                initialValues: response.data.preFilledValues || {}
              });
              
              setActiveDraftInfo({
                templatePath: response.data.templatePath,
                templateTitle: response.data.templateTitle || (language === 'hi' ? 'दस्तावेज़' : 'Document'),
                missingFields: response.data.missingFields,
                preFilledValues: response.data.preFilledValues || {}
              });
            }
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: response.data.response,
              mode: response.data.mode,
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
        disableOldButtons();
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

      
      case 'NEW_DOCUMENT': {
        console.log('📝 NEW_DOCUMENT action triggered - showing document creation choice');
        
        
        try {
          await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.warn('Failed to clear server document session:', error);
        }
        
        
        setShowPostDownloadOptions(false);
        setLastGeneratedTemplate(null);
        setIntentOverride(null);
        setIntentLabel(null);
        
        
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

      
      case 'EXIT_DOCUMENT_MODE': {
        console.log('❌ EXIT_DOCUMENT_MODE action triggered');
        
        
        try {
          await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          console.log('✅ Server document session cleared');
        } catch (error) {
          console.warn('Failed to clear server document session:', error);
        }
        
        
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

      
      case 'EDIT_DOCUMENT': {
        console.log('✏️ EDIT_DOCUMENT action triggered');
        
        
        if (lastGeneratedComplaint) {
          
          console.log('✏️ Editing complaint with data:', lastGeneratedComplaint.data);
          setIsComplaintFormOpen(true);
          
          
          toast({
            title: language === 'hi' ? '✏️ शिकायत संपादित करें' : '✏️ Edit Complaint',
            description: language === 'hi' 
              ? 'विवरण अपडेट करें और पुनः जेनरेट करें' 
              : 'Update details and regenerate',
            status: 'info',
            duration: 2000,
          });
        } else if (lastGeneratedTemplate && lastSubmittedFields) {
          
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
        
        console.log('📝 GENERATE_COMPLAINT action triggered - opening complaint form');
        
        
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];
        
        
        const userContent = lastUserMessage?.content?.toLowerCase() || '';
        const aiContent = lastAssistantMessage?.content?.toLowerCase() || '';
        const combinedContext = userContent + ' ' + aiContent;
        
        
        let suggestedComplaintType = null;
        let suggestedDescription = lastUserMessage?.content || '';
        
        
        if (/rental|rent|tenant|landlord|lease|evict|property dispute|vacating/i.test(combinedContext)) {
          suggestedComplaintType = 'civil';
        }
        
        else if (/consumer|defect|product|service|refund|warranty|fraud|seller/i.test(combinedContext)) {
          suggestedComplaintType = 'consumer';
        }
        
        else if (/theft|assault|fraud|cheating|criminal|fir|police|violence/i.test(combinedContext)) {
          suggestedComplaintType = 'criminal';
        }
        
        else if (/divorce|maintenance|custody|domestic|dowry|marriage/i.test(combinedContext)) {
          suggestedComplaintType = 'family';
        }
        
        else if (/salary|employer|workplace|termination|harassment|labor|employment/i.test(combinedContext)) {
          suggestedComplaintType = 'labor';
        }
        
        console.log('🤖 Smart pre-fill detected:', { suggestedComplaintType, descriptionLength: suggestedDescription.length });
        
        const contextData = {
          originalMessage: lastUserMessage?.content || '',
          aiResponseExcerpt: lastAssistantMessage?.content?.substring(0, 500) || '',
          suggestedComplaintType,
          suggestedDescription,
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
        
        console.log('⚖️ LEARN_MORE_LAW action triggered - generating detailed analysis');
        
        disableOldButtons();
        
        
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];
        const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
        
        
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

      
      case 'SHOW_CATEGORIES': {
        
        console.log('📚 SHOW_CATEGORIES (legacy) - opening template browser');
        setIsTemplateBrowserOpen(true);
        break;
      }

      default:
        console.warn('Unknown action type:', actionType);
    }
  };

  
  
  const handleFieldsFormSubmit = async (fieldValues) => {
    
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

    
    setLastSubmittedFields(fieldValues);
    
    
    setFormClosedWithoutSubmit(false);
    setPartialFormData(null);
    setActiveDraftInfo(null);

    
    const templateCategory = fieldsModalData.templatePath.split('/')[0] || '';

    
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
  
  
  const handleFieldsFormClose = (partialValues, isCancelled = false) => {
    console.log('🚪 [handleFieldsFormClose] Called', { isCancelled, hasPartialData: !!partialValues, isEditMode: isEditingDocument });
    
    if (isCancelled) {
      
      console.log('🔴 [handleFieldsFormClose] User cancelled draft flow - resetting server + client state');
      
      
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
      
      
      setFieldsModalData(null);
      setPartialFormData(null);
      setActiveDraftInfo(null);
      setFormClosedWithoutSubmit(false);
      setIsEditingDocument(false);
      setLastGeneratedTemplate(null);
      setLastSubmittedFields(null);
      setIntentOverride(null);
      setIntentLabel(null);
      setIsPendingUserChoice(false);
      
      
      const mainMenuMessage = {
        role: 'assistant',
        content: language === 'hi' 
          ? 'आपने ड्राफ्ट प्रक्रिया रद्द कर दी है। मैं आपकी कैसे मदद कर सकता हूं?'
          : 'You cancelled the draft process. How can I help you?',
        suggestedActions: language === 'hi' ? [
          { type: 'action', label: 'दस्तावेज़ बनाएं', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'कानूनी दस्तावेज़ बनाएं' },
          { type: 'action', label: 'मार्गदर्शन करें', icon: '🧭', action: 'general_help', description: 'मुझे मार्गदर्शन दें' },
          { type: 'action', label: 'टेम्पलेट ब्राउज़ करें', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'उपलब्ध टेम्पलेट देखें' },
        ] : [
          { type: 'action', label: 'Create Document', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'Generate a legal document' },
          { type: 'action', label: 'Guide Me', icon: '🧭', action: 'general_help', description: 'Get guidance' },
          { type: 'action', label: 'Browse Templates', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'View available templates' },
        ],
        mode: 'draft_cancelled'
      };
      
      setMessages(prev => [...prev, mainMenuMessage]);
      setIsFieldsModalOpen(false);
      return;
    }
    
    
    
    const hasAnyData = partialValues && Object.values(partialValues).some(v => v && String(v).trim() !== '');
    
    if (hasAnyData && !isEditingDocument && fieldsModalData) {
      console.log('💾 [handleFieldsFormClose] Saving partial data for recovery (initial fill)');
      
      
      setPartialFormData({
        templatePath: fieldsModalData.templatePath,
        templateTitle: fieldsModalData.templateTitle,
        fields: fieldsModalData.fields,
        partialValues: partialValues
      });
      setFormClosedWithoutSubmit(true);
      
      
      setMessages(prev => {
        const lastIndex = prev.length - 1;
        const lastMsg = prev[lastIndex];
        
        
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
    
    
    setIsFieldsModalOpen(false);
  };

  
  const handleDesignSelected = async (design) => {
    console.log('🔍 [TRACE] handleDesignSelected called with design:', design?.name || 'no design');
    
    
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
    
    setPendingFormGeneration(null);

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
      setIsGenerating(false);
      console.log('🔓 [SET] isGenerating = false (in handleDesignSelected finally)');
    }
  };

  
  
  const handleDesignSelectorSkip = () => {
    console.log('🔍 [TRACE] handleDesignSelectorSkip called - user wants to skip design selection');
    
    
    if (isGenerating) {
      console.warn('⚠️  [BLOCK] Generation already in progress, blocking handleDesignSelectorSkip');
      return;
    }
    
    
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
    
    setPendingFormGeneration(null);

    try {
      console.log('⏭️  [EXEC] Skipping design selection - generating with defaults (NO designConfig)');

      
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
      setIsGenerating(false);
      console.log('🔓 [SET] isGenerating = false (in handleDesignSelectorSkip finally)');
    }
  };

  
  const handleDesignSelectorClose = () => {
    console.log('🔍 [TRACE] handleDesignSelectorClose called (modal X or Escape - NOT generating)');
    setIsDesignSelectorOpen(false);
    
    
  };

  
  const executeFormGeneration = async (formData, designConfig) => {
    const { templatePath, templateTitle, fieldValues } = formData;

    console.log('🚀 executeFormGeneration start:', {
      template: templateTitle,
      fieldsCount: Object.keys(fieldValues || {}).length,
      designConfigProvided: !!designConfig,
      designConfigFontFamily: designConfig?.fontFamily || 'NOT PROVIDED'
    });

    try {
      
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
        pdfFile: result.pdfFile ? {
          fileUrl: result.pdfFile.url,
          fileName: result.pdfFile.name,
          fileType: result.pdfFile.type,
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

  
  

  
  
  const handleComplaintFormSubmit = async (complaintData) => {
    console.log('📝 Submitting complaint form:', complaintData);
    
    setIsComplaintFormOpen(false);
    
    
    setPendingFormGeneration({
      type: 'complaint',
      data: complaintData,
      category: 'Criminal Pleadings Drafts',
    });
    setIsDesignSelectorOpen(true);
  };

  
  const executeComplaintGeneration = async (complaintData, designConfig) => {
    try {
      setIsLoading(true);
      
      disableOldButtons();
      
      
      const userMsg = language === 'hi' 
        ? `${complaintData.complaintType} के लिए शिकायत बनाएं: ${complaintData.againstWhom}` 
        : `Generate ${complaintData.complaintType} complaint against ${complaintData.againstWhom}`;
      
      setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
      
      
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

  
  const handleComplaintFormClose = (isCancelled = false) => {
    console.log('🚪 [handleComplaintFormClose] Called', { isCancelled });
    
    setIsComplaintFormOpen(false);
    setComplaintContext(null);
    
    if (isCancelled) {
      
      console.log('🔴 [handleComplaintFormClose] User cancelled complaint process - showing main menu');
      
      
      setLastGeneratedComplaint(null);
      
      
      const mainMenuMessage = {
        role: 'assistant',
        content: language === 'hi' 
          ? 'आपने शिकायत प्रक्रिया रद्द कर दी है। मैं आपकी कैसे मदद कर सकता हूं?'
          : 'You cancelled the complaint process. How can I help you?',
        suggestedActions: language === 'hi' ? [
          { type: 'action', label: 'दस्तावेज़ बनाएं', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'कानूनी दस्तावेज़ बनाएं' },
          { type: 'action', label: 'मार्गदर्शन करें', icon: '🧭', action: 'general_help', description: 'मुझे मार्गदर्शन दें' },
          { type: 'action', label: 'टेम्पलेट ब्राउज़ करें', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'उपलब्ध टेम्पलेट देखें' },
        ] : [
          { type: 'action', label: 'Create Document', icon: '📄', action: 'DOCUMENT_REQUEST', description: 'Generate a legal document' },
          { type: 'action', label: 'Guide Me', icon: '🧭', action: 'general_help', description: 'Get guidance' },
          { type: 'action', label: 'Browse Templates', icon: '📚', action: 'BROWSE_TEMPLATES', description: 'View available templates' },
        ],
        mode: 'complaint_cancelled'
      };
      
      setMessages(prev => [...prev, mainMenuMessage]);
    }
    
  };

  
  const handleTemplateSelect = async (template) => {
    console.log('📋 [handleTemplateSelect] Template selected:', template.relPath);
    setIsTemplateBrowserOpen(false);
    
    
    disableOldButtons();
    
    
    const userMsg = language === 'hi' 
      ? `मैंने "${template.displayTitle}" टेम्पलेट चुना`
      : `I selected the "${template.displayTitle}" template`;
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIntentOverride('DOCUMENT_REQUEST');
    
    try {
      setIsLoading(true);
      
      
      console.log('📋 [handleTemplateSelect] Opening fields modal directly...');
      
      await openFieldsModalWithSchema({
        templatePath: template.relPath,
        templateTitle: template.displayTitle,
        missingFields: null
      });
      
      
      setActiveDraftInfo({
        templatePath: template.relPath,
        templateTitle: template.displayTitle,
        missingFields: null,
        preFilledValues: {}
      });
      
      
      const draftFormInlineActions = language === 'hi' ? [
        { type: 'draft_action', label: 'फ़ॉर्म भरना जारी रखें', icon: '📝', action: 'RESUME_FORM', description: 'फ़ॉर्म को फिर से खोलें' },
        { type: 'draft_action', label: 'ड्राफ्ट बंद करें', icon: '❌', action: 'CLOSE_DRAFT_FLOW', description: 'ड्राफ्ट प्रक्रिया बंद करें और रीसेट करें' },
        { type: 'draft_action', label: 'नया ड्राफ्ट', icon: '🔄', action: 'REGENERATE_DRAFT', description: 'इसे छोड़ें और नया ड्राफ्ट शुरू करें' },
        { type: 'draft_action', label: 'इस ड्राफ्ट के बारे में पूछें', icon: '💬', action: 'ASK_ABOUT_DRAFT', description: 'AI से इस दस्तावेज़ की जानकारी लें' },
      ] : [
        { type: 'draft_action', label: 'Resume Form filling', icon: '📝', action: 'RESUME_FORM', description: 'Reopen the form to continue filling' },
        { type: 'draft_action', label: 'Close draft flow', icon: '❌', action: 'CLOSE_DRAFT_FLOW', description: 'Exit the draft process and reset to main menu' },
        { type: 'draft_action', label: 'Regenerate new draft', icon: '🔄', action: 'REGENERATE_DRAFT', description: 'Discard this and start a fresh draft request' },
        { type: 'draft_action', label: 'Ask about this draft', icon: '💬', action: 'ASK_ABOUT_DRAFT', description: 'Get real-time AI assistance about this document' },
      ];
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'hi'
          ? `📋 आपने **${template.displayTitle}** टेम्पलेट चुना है। कृपया फ़ॉर्म में आवश्यक विवरण भरें।`
          : `📋 You've selected the **${template.displayTitle}** template. Please fill in the required details in the form.`,
        mode: 'draft_form_open',
        suggestedActions: draftFormInlineActions
      }]);
      
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

  
  const handleGenerateDifferent = () => {
    setShowPostDownloadOptions(false);
    setLastGeneratedTemplate(null);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: language === 'hi'
        ? '📝 कोई बात नहीं! कृपया बताएं कि आप कौन सा दस्तावेज़ बनाना चाहते हैं।'
        : '📝 Sure! Please tell me what document you would like to generate.'
    }]);
  };

  
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

  
  const handleHardReset = async () => {
    
    try {
      await axios.post(`${BASE_URL}/chat/exit-document-mode`, {}, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      console.log('✅ Backend session cleared');
    } catch (error) {
      console.warn('Failed to clear backend session:', error);
    }
    
    
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

  
  const handleDocumentTypeSelected = async (documentType, category) => {
    console.log('📄 Document type selected:', documentType, category);
    
    
    setIsDocTypeSelectorOpen(false);
    
    
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

  
  const handleGuidanceComplete = async (situation, category, details) => {
    console.log('🧭 Guidance complete:', situation, category, details);
    
    
    disableOldButtons();

    setMessages(prev => [...prev, { role: 'user', content: situation }]);
    
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${BASE_URL}/chat/message`, 
        { 
          message: situation, 
          language, 
          intentOverride: 'DOCUMENT_REQUEST',
          sourceAction: 'GUIDE_ME',
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
      
      
      if (response.remainingMessages !== null) {
        setRemainingMessages(response.remainingMessages);
      }
      setSubscriptionStatus(response.subscriptionStatus);
      
      
      setScanStatus('none');
      setScanResults(null);
      setFormatMetadata(null);
      setSmartSuggestions([]);
      setHtmlContent('');
      setOcrConfidence(null);
      setOcrTextLength(0);
      
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
      
      const response = await fileService.analyzeFile(fileId, null, intentOverride);
      
      
      let userMessage = `Analyze this file: ${response.fileName}`;
      if (intentOverride === 'legal') {
        userMessage = `📜 Legal Analysis: ${response.fileName}`;
      } else if (intentOverride === 'draft') {
        userMessage = `📝 Extract draft info from: ${response.fileName}`;
      }
      
      
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

      
      if (response.remainingMessages !== null) {
        setRemainingMessages(response.remainingMessages);
      }

      
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
      
      const response = await fileService.startEditSession(selectedFile._id);
      
      setIsEditMode(true);
      setEditSessionActive(true);
      setEditChangesCount(0);
      setIntentOverride('EDIT_DOCUMENT');
      setIntentLabel('Edit Document');
      
      
      if (response.session) {
        setEditSession(response.session);
      }
      
      
      if (response.documentAnalysis) {
        setDocumentAnalysis(response.documentAnalysis);
      }

      
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
      
      
      setScanData({
        detectedDocType: result.detectedDocType || '',
        extractedParties: result.extractedParties || null,
        precedenceAnalysis: result.precedenceAnalysis || [],
        complianceIssues: result.complianceIssues || [],
        missingClauses: result.missingClauses || [],
        clauseFlaws: result.clauseFlaws || [],
        chronologicalIssues: result.chronologicalIssues || [],
        outdatedReferences: result.outdatedReferences || [],
        internalContradictions: result.internalContradictions || [],
        governmentCompliance: result.governmentCompliance || null,
        smartSuggestions: result.smartSuggestions || [],
        scanResults: result.scanResults || null,
      });

      
      if (result.ocrConfidence !== undefined && result.ocrConfidence !== null) {
        setOcrConfidence(result.ocrConfidence);
        setOcrTextLength(result.textLength || (result.ocrText ? result.ocrText.length : 0));
      } else {
        setOcrConfidence(null);
        setOcrTextLength(0);
      }
      
      
      setEditSessionActive(true);

      
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
      
      
      try {
        const analysisRes = await fileService.getDocumentAnalysis();
        if (analysisRes.success) {
          setDocumentAnalysis(analysisRes);
          
          setEditSession(prev => prev ? {
            ...prev,
            currentText: response.textPreview?.replace('...', '') || prev.currentText,
            changes: response.session.changes || prev.changes
          } : null);
        }
      } catch (e) {
        console.log('Could not refresh analysis:', e);
      }

      
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
      
      
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      console.log(`Received blob: ${blob.size} bytes, type: ${blob.type}`);
      
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      const baseName = selectedFile?.fileName?.replace(/\.[^/.]+$/, '') || selectedFile?.originalName?.replace(/\.[^/.]+$/, '') || 'edited_document';
      a.download = `${baseName}_edited.${format}`;
      document.body.appendChild(a);
      a.click();
      
      
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
      
      
      const isNetworkError = error.message === 'Network Error' || 
                            error.code === 'ERR_NETWORK' ||
                            error.message?.includes('network');
      
      if (isNetworkError) {
        
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
    setOcrConfidence(null);
    setOcrTextLength(0);

    toast({
      title: 'Edit Mode Ended',
      description: 'You have exited document editing mode.',
      status: 'info',
      duration: 2000,
    });
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
          <Heading size="md" color={textColor}>Law AI Chat</Heading>
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
                    language={language}
                  />
                ))
              )}
              
              
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
                          : activeDraftInfo && !isFieldsModalOpen
                            ? (language === 'hi' ? `💬 "${activeDraftInfo.templateTitle}" के बारे में पूछें या ऊपर दिए गए विकल्पों का उपयोग करें` : `💬 Ask about "${activeDraftInfo.templateTitle}" or use the options above`)
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
          ocrConfidence={ocrConfidence}
          scanData={scanData}
        />
      </Suspense>

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

      
      <TemplateBrowser
        isOpen={isTemplateBrowserOpen}
        onClose={() => setIsTemplateBrowserOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        language={language}
        token={token}
      />

      
      <DocumentTypeSelector
        isOpen={isDocTypeSelectorOpen}
        onClose={() => setIsDocTypeSelectorOpen(false)}
        onSelectDocumentType={handleDocumentTypeSelected}
        language={language}
      />

      
      <LegalGuidanceModal
        isOpen={isGuidanceModalOpen}
        onClose={() => setIsGuidanceModalOpen(false)}
        onComplete={handleGuidanceComplete}
        language={language}
      />

      
      <ComplaintFormModal
        isOpen={isComplaintFormOpen}
        onClose={handleComplaintFormClose}
        onSubmit={handleComplaintFormSubmit}
        language={language}
        initialContext={lastGeneratedComplaint?.data || complaintContext}
      />

      
      <TemplateDesignSelector
        isOpen={isDesignSelectorOpen}
        onClose={handleDesignSelectorClose}
        onSkip={handleDesignSelectorSkip}
        onSelect={handleDesignSelected}
        category={pendingFormGeneration?.category || ''}
        language={language}
        isLoading={isGenerating}
      />

      
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
              <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" borderLeft="3px solid" borderLeftColor="blue.400">
                <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" mb={1}>
                  {language === 'hi' ? 'दस्तावेज़ प्रकार' : 'Document Type'}
                </Text>
                <Text fontSize="md" fontWeight="600">
                  {scanResults?.documentType || 'General Document'}
                </Text>
              </Box>

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

              {ocrConfidence !== null && ocrConfidence !== undefined && (
                <Box p={3} bg={useColorModeValue(
                  ocrConfidence >= 80 ? 'green.50' : ocrConfidence >= 50 ? 'yellow.50' : 'red.50',
                  ocrConfidence >= 80 ? 'green.900' : ocrConfidence >= 50 ? 'yellow.900' : 'red.900'
                )} borderRadius="md" borderLeft="3px solid" borderLeftColor={
                  ocrConfidence >= 80 ? 'green.400' : ocrConfidence >= 50 ? 'yellow.400' : 'red.400'
                }>
                  <Text fontSize="xs" fontWeight="bold" color={
                    ocrConfidence >= 80 ? 'green.600' : ocrConfidence >= 50 ? 'yellow.600' : 'red.600'
                  } textTransform="uppercase" mb={1}>
                    {language === 'hi' ? 'OCR गुणवत्ता स्कोर' : 'OCR Quality Score'}
                  </Text>
                  <HStack spacing={3} align="center">
                    <Text fontSize="2xl" fontWeight="bold" color={
                      ocrConfidence >= 80 ? 'green.500' : ocrConfidence >= 50 ? 'orange.500' : 'red.500'
                    }>
                      {Math.round(ocrConfidence)}%
                    </Text>
                    <Box flex="1">
                      <Box h="8px" bg={useColorModeValue('gray.200', 'gray.600')} borderRadius="full" overflow="hidden">
                        <Box
                          h="100%"
                          w={`${Math.min(ocrConfidence, 100)}%`}
                          bg={ocrConfidence >= 80 ? 'green.400' : ocrConfidence >= 50 ? 'orange.400' : 'red.400'}
                          borderRadius="full"
                          transition="width 0.5s ease"
                        />
                      </Box>
                    </Box>
                    <Badge colorScheme={ocrConfidence >= 80 ? 'green' : ocrConfidence >= 50 ? 'orange' : 'red'} variant="solid" fontSize="xs">
                      {ocrConfidence >= 80 
                        ? (language === 'hi' ? 'उत्कृष्ट' : 'Excellent') 
                        : ocrConfidence >= 60 
                          ? (language === 'hi' ? 'अच्छा' : 'Good') 
                          : ocrConfidence >= 40 
                            ? (language === 'hi' ? 'ठीक' : 'Fair') 
                            : (language === 'hi' ? 'कमज़ोर' : 'Poor')}
                    </Badge>
                  </HStack>
                  {ocrTextLength > 0 && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {language === 'hi' 
                        ? `${ocrTextLength.toLocaleString()} अक्षर निकाले गए`
                        : `${ocrTextLength.toLocaleString()} characters extracted`}
                    </Text>
                  )}
                  {ocrConfidence < 60 && (
                    <Text fontSize="xs" color="red.500" mt={1} fontStyle="italic">
                      {language === 'hi' 
                        ? '⚠️ कम स्कोर: बेहतर परिणामों के लिए एक स्पष्ट, उच्च-रिज़ॉल्यूशन छवि अपलोड करें।' 
                        : '⚠️ Low score: For better results, upload a clearer, high-resolution image.'}
                    </Text>
                  )}
                  {ocrConfidence >= 60 && ocrConfidence < 80 && (
                    <Text fontSize="xs" color="orange.500" mt={1} fontStyle="italic">
                      {language === 'hi' 
                        ? '💡 AI सहायता उपलब्ध है, लेकिन कुछ पाठ गलत हो सकता है। कृपया संपादक में सत्यापित करें।' 
                        : '💡 AI assistance available, but some text may be inaccurate. Please verify in the editor.'}
                    </Text>
                  )}
                  {ocrConfidence >= 80 && (
                    <Text fontSize="xs" color="green.500" mt={1} fontStyle="italic">
                      {language === 'hi' 
                        ? '✅ उच्च गुणवत्ता! Law AI आश्वस्त है कि निकाला गया पाठ सटीक है।' 
                        : '✅ High quality! Law AI is confident the extracted text is accurate.'}
                    </Text>
                  )}
                </Box>
              )}

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
