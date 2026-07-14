import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../chat-advanced/AuthBridge';
import { API_BASE_URL as BASE_URL } from '../../chat-advanced/constants';

const AdvancedChatContext = createContext();

export const useAdvancedChat = () => {
  return useContext(AdvancedChatContext);
};

export const AdvancedChatProvider = ({ children }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token, logout, user, loading, checkUser } = useAuth();
  const toast = useToast();

  // Core State
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeChatTab') || 'dashboard');

  useEffect(() => {
    localStorage.setItem('activeChatTab', activeTab);
  }, [activeTab]);
  const [tabMessages, setTabMessages] = useState({
    dashboard: [],
    research: [],
    chronology: [],
    review: [],
    drafting: []
  });

  const messages = tabMessages[activeTab] || [];
  
  const setMessages = useCallback((updater) => {
    setTabMessages(prev => {
      const currentTabMessages = prev[activeTab] || [];
      const newMessages = typeof updater === 'function' ? updater(currentTabMessages) : updater;
      return {
        ...prev,
        [activeTab]: newMessages
      };
    });
  }, [activeTab]);

  const [onboardCompanyName, setOnboardCompanyName] = useState(user?.companyName || '');
  const [onboardSector, setOnboardSector] = useState(user?.sector || 'legal');
  const [isOnboardingSubmitLoading, setIsOnboardingSubmitLoading] = useState(false);

  // OCR Intelligence State
  const [ocrFiles, setOcrFiles] = useState([]);
  const [ocrStatus, setOcrStatus] = useState('idle');
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrSessionId, setOcrSessionId] = useState(null);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [remainingMessages, setRemainingMessages] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [language, setLanguage] = useState(() => localStorage.getItem('chatLanguage') || 'en');

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzingFile, setAnalyzingFile] = useState(false);

  // Sessions State
  const [sessionsList, setSessionsList] = useState([]);
  const [sessionsListLoading, setSessionsListLoading] = useState(false);

  // Cross-Component Handlers
  const [handleStartDeepResearch, setHandleStartDeepResearch] = useState(null);
  const [handleStartChronology, setHandleStartChronology] = useState(null);
  const [handleStartBulkReview, setHandleStartBulkReview] = useState(null);
  const [handleResetChronology, setHandleResetChronology] = useState(null);
  const [handleChronologyFilesUpload, setHandleChronologyFilesUpload] = useState(null);
  const [handleOnboardSubmit, setHandleOnboardSubmit] = useState(null);
  const [handleSuggestedActionClick, setHandleActionClick] = useState(null);

  // Intent State
  const [intentOverride, setIntentOverride] = useState(null);
  const [intentLabel, setIntentLabel] = useState(null);

  // Edit Document State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSessionActive, setEditSessionActive] = useState(false);
  const [editChangesCount, setEditChangesCount] = useState(0);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [isFullEditorOpen, setIsFullEditorOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  // Chronology State
  const [chronologySessionId, setChronologySessionId] = useState(() => localStorage.getItem('chronologySessionId') || null);
  const [chronologyStatus, setChronologyStatus] = useState('idle');
  const [chronologyResults, setChronologyResults] = useState(null);
  const [chronologyElapsed, setChronologyElapsed] = useState(0);
  const [chronologyEta, setChronologyEta] = useState(60);
  const [chronologyAgentStage, setChronologyAgentStage] = useState('');
  const [isTimelinePanelOpen, setIsTimelinePanelOpen] = useState(false);
  const [chronologyFiles, setChronologyFiles] = useState([]);

  // Parallel Review State
  const [reviewFiles, setReviewFiles] = useState([]);
  const [reviewStatus, setReviewStatus] = useState('idle');
  const [bulkReviewSessionId, setBulkReviewSessionId] = useState(() => localStorage.getItem('bulkReviewSessionId') || null);
  const [bulkReviewResults, setBulkReviewResults] = useState(null);
  const [bulkReviewElapsed, setBulkReviewElapsed] = useState(0);
  const [bulkReviewEta, setBulkReviewEta] = useState(60);
  const [isBulkReviewPanelOpen, setIsBulkReviewPanelOpen] = useState(false);

  // Deep Research State
  const [researchSessionId, setResearchSessionId] = useState(() => localStorage.getItem('deepResearchSessionId') || null);
  const [researchStatus, setResearchStatus] = useState('idle');
  const [researchResults, setResearchResults] = useState(null);
  const [researchStartTime, setResearchStartTime] = useState(null);
  const [researchEta, setResearchEta] = useState(90);
  const [researchElapsed, setResearchElapsed] = useState(0);
  const [isReportPanelOpen, setIsReportPanelOpen] = useState(false);
  const [researchAgentStage, setResearchAgentStage] = useState('');

  // Drafting Tools State
  const [activeDraftingTool, setActiveDraftingTool] = useState(null);

  // Precedence State
  const [precedenceSessionId, setPrecedenceSessionId] = useState(null);
  const [precedenceStatus, setPrecedenceStatus] = useState('idle');
  const [precedenceResults, setPrecedenceResults] = useState(null);
  const [isPrecedencePanelOpen, setIsPrecedencePanelOpen] = useState(false);

  // Counter Maker State
  const [counterMakerSessionId, setCounterMakerSessionId] = useState(null);
  const [counterMakerStatus, setCounterMakerStatus] = useState('idle');
  const [counterMakerResults, setCounterMakerResults] = useState(null);
  const [counterMakerFacts, setCounterMakerFacts] = useState('');
  const [isCounterMakerPanelOpen, setIsCounterMakerPanelOpen] = useState(false);

  // Smart Scanner State
  const [scanStatus, setScanStatus] = useState('none');
  const [scanResults, setScanResults] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [formatMetadata, setFormatMetadata] = useState(null);

  // Template & Forms State
  const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);
  const [isDocTypeSelectorOpen, setIsDocTypeSelectorOpen] = useState(false);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [isComplaintFormOpen, setIsComplaintFormOpen] = useState(false);

  // Effect: Sync headers and user
  useEffect(() => {
    if (user && !loading && user.companySlug) {
      if (!slug) {
        navigate(`/c/${user.companySlug}`, { replace: true });
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

  const fetchSessions = useCallback(async () => {
    setSessionsListLoading(true);
    try {
      const { chatAPI } = await import('../../lib/api');
      const list = await chatAPI.getSessions();
      setSessionsList(list || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setSessionsListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  useEffect(() => {
    localStorage.setItem('chatLanguage', language);
  }, [language]);

  const value = {
    slug, navigate, token, logout, user, loading, checkUser, toast,
    handleStartDeepResearch, setHandleStartDeepResearch,
    handleStartChronology, setHandleStartChronology,
    handleStartBulkReview, setHandleStartBulkReview,
    handleResetChronology, setHandleResetChronology,
    handleChronologyFilesUpload, setHandleChronologyFilesUpload,
    isOnboardingSubmitLoading, setIsOnboardingSubmitLoading,
    handleOnboardSubmit, setHandleOnboardSubmit,
    handleSuggestedActionClick, setHandleActionClick,
    
    // OCR Intelligence
    ocrFiles, setOcrFiles,
    ocrStatus, setOcrStatus,
    ocrResult, setOcrResult,
    ocrSessionId, setOcrSessionId,
    
    // UI Navigation
    activeTab, setActiveTab,
    
    // Core Chat
    messages, setMessages,
    input, setInput,
    isLoading, setIsLoading,
    isInitialLoad, setIsInitialLoad,
    remainingMessages, setRemainingMessages,
    subscriptionStatus, setSubscriptionStatus,
    language, setLanguage,
    
    // Files
    isUploading, setIsUploading,
    uploadProgress, setUploadProgress,
    selectedFile, setSelectedFile,
    analyzingFile, setAnalyzingFile,

    // Sessions
    sessionsList, setSessionsList,
    sessionsListLoading, setSessionsListLoading,
    
    // Intents
    intentOverride, setIntentOverride,
    intentLabel, setIntentLabel,
    
    // Session Management
    startNewSession: () => navigate(`/c/${Math.random().toString(36).substring(2, 15)}`),

    // Editor
    isEditMode, setIsEditMode,
    editSessionActive, setEditSessionActive,
    editChangesCount, setEditChangesCount,
    documentAnalysis, setDocumentAnalysis,
    isFullEditorOpen, setIsFullEditorOpen,
    htmlContent, setHtmlContent,
    
    // Chronology
    chronologySessionId, setChronologySessionId,
    chronologyStatus, setChronologyStatus,
    chronologyResults, setChronologyResults,
    chronologyElapsed, setChronologyElapsed,
    chronologyEta, setChronologyEta,
    chronologyAgentStage, setChronologyAgentStage,
    isTimelinePanelOpen, setIsTimelinePanelOpen,
    chronologyFiles, setChronologyFiles,

    // Parallel Review
    reviewFiles, setReviewFiles,
    reviewStatus, setReviewStatus,
    bulkReviewSessionId, setBulkReviewSessionId,
    bulkReviewResults, setBulkReviewResults,
    bulkReviewElapsed, setBulkReviewElapsed,
    bulkReviewEta, setBulkReviewEta,
    isBulkReviewPanelOpen, setIsBulkReviewPanelOpen,

    // Research
    researchSessionId, setResearchSessionId,
    researchStatus, setResearchStatus,
    researchResults, setResearchResults,
    researchStartTime, setResearchStartTime,
    researchEta, setResearchEta,
    researchElapsed, setResearchElapsed,
    isReportPanelOpen, setIsReportPanelOpen,
    researchAgentStage, setResearchAgentStage,

    // Drafting
    activeDraftingTool, setActiveDraftingTool,
    
    // Precedence
    precedenceSessionId, setPrecedenceSessionId,
    precedenceStatus, setPrecedenceStatus,
    precedenceResults, setPrecedenceResults,
    isPrecedencePanelOpen, setIsPrecedencePanelOpen,

    // Counter Maker
    counterMakerSessionId, setCounterMakerSessionId,
    counterMakerStatus, setCounterMakerStatus,
    counterMakerResults, setCounterMakerResults,
    counterMakerFacts, setCounterMakerFacts,
    isCounterMakerPanelOpen, setIsCounterMakerPanelOpen,

    // Smart Scanner
    scanStatus, setScanStatus,
    scanResults, setScanResults,
    smartSuggestions, setSmartSuggestions,
    formatMetadata, setFormatMetadata,

    // Forms & Modals
    isTemplateBrowserOpen, setIsTemplateBrowserOpen,
    isDocTypeSelectorOpen, setIsDocTypeSelectorOpen,
    isGuidanceModalOpen, setIsGuidanceModalOpen,
    isComplaintFormOpen, setIsComplaintFormOpen,
  };

  return (
    <AdvancedChatContext.Provider value={value}>
      {children}
    </AdvancedChatContext.Provider>
  );
};
