import os
import re

file_path = r"C:\Users\ris15\Desktop\dastavezai-web\frontend\src\pages\AdvancedChat.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject panel and service imports at the top
import_block = """import TimelinePanel from './Panels/TimelinePanel';
import PrecedencePanel from './Panels/PrecedencePanel';
import CounterMakerPanel from './Panels/CounterMakerPanel';
import ResearchPanel from './Panels/ResearchPanel';
import BulkReviewPanel from './Panels/BulkReviewPanel';
import researchService from '../chat-advanced/services/researchService';
import chronologyService from '../chat-advanced/services/chronologyService';
import precedenceService from '../chat-advanced/services/precedenceService';
import counterMakerService from '../chat-advanced/services/counterMakerService';
import bulkReviewService from '../chat-advanced/services/bulkReviewService';
import { AdvancedChatProvider } from './AdvancedChatContext';"""

content = content.replace(
    "import JusticeIcon from '../components/JusticeIcon';",
    "import JusticeIcon from '../components/JusticeIcon';\n" + import_block
)

# 2. Inject states, refs, effects inside ChatPage
state_ref_block = """  // Deep Research State
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
  const counterMakerPollRef = useRef(null);"""

content = content.replace(
    "const [analyzingFile, setAnalyzingFile] = useState(false);",
    "const [analyzingFile, setAnalyzingFile] = useState(false);\n" + state_ref_block
)

# 3. Inject handlers right before const handleFileUpload = async (e) => {
handlers_block = """  // Deep Research functions
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
                content: `I have completed the deep research on your document! You can view the full report in the right panel.\\n\\nHere are some follow-up questions you can ask me:\\n1. ${followUpQuestions[0]}\\n2. ${followUpQuestions[1]}\\n3. ${followUpQuestions[2]}`
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
              ? `\\n\\n---\\n${result.summary}\\n\\n---\\n*Full interactive timeline with ${eventCount} events is ready in the Timeline panel →*`
              : `\\n\\n*${eventCount} events extracted. Open the Timeline panel to explore.*`;
            const introLine = ismerge
              ? `✅ Chronology updated! I've merged the new file(s) with your existing timeline.\\n\\nNow covering: ${fileNames}\\n\\n**Combined Summary:**${summaryText}`
              : `📅 Chronology complete! I've built a timeline from ${fileNames}.\\n\\n**Timeline Summary:**${summaryText}`;

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
        content: `I have analyzed the document and extracted the following key allegations:\\n\\n${data.facts}\\n\\nPlease provide your counter-points or defenses for these allegations so I can draft the Counter Affidavit.`
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
    e.target.value = '';
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
    e.target.value = '';
  };"""

# Insert right before const handleFileUpload = async (e) => {
content = content.replace(
    "  const handleFileUpload = async (e) => {",
    handlers_block + "\n\n  const handleFileUpload = async (e) => {"
)

# 4. Update handleFileUpload inside AdvancedChat.jsx to auto-trigger drafting/research agents
old_upload_post_success = """      setSelectedFile(response.file);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);"""

new_upload_post_success = """      setSelectedFile(response.file);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);

      // Auto-trigger drafting tools or deep research if active
      if (activeDraftingTool === 'precedence') {
        startPrecedenceAnalysis(response.file._id);
      } else if (activeDraftingTool === 'counter_maker') {
        extractCounterFacts(response.file._id);
      } else if (activeTab === 'research') {
        handleStartDeepResearch(response.file);
      }"""

content = content.replace(old_upload_post_success, new_upload_post_success)

# 5. Fix the sub-sidebar rendering click triggers in AdvancedChat.jsx cases for review and chronology
# In chronology case: change document.getElementById('file-upload')?.click() to chronology-file-upload
content = content.replace(
    "onClick={() => document.getElementById('file-upload')?.click()}",
    "onClick={() => {\n                if (activeTab === 'review') {\n                  document.getElementById('review-file-upload')?.click();\n                } else if (activeTab === 'chronology') {\n                  document.getElementById('chronology-file-upload')?.click();\n                } else {\n                  document.getElementById('file-upload')?.click();\n                }\n              }}",
    2 # replace first two occurrences which correspond to research/review/chronology upload panels! Wait, let's use exact strings instead to avoid mistakes.
)

# Let's target the exact sidebar panels:
# In chronology sub-sidebar:
old_chrono_click = """              onClick={() => document.getElementById('file-upload')?.click()}
              _hover={{ 
                borderColor: 'judicial.gold',"""
new_chrono_click = """              onClick={() => document.getElementById('chronology-file-upload')?.click()}
              _hover={{ 
                borderColor: 'judicial.gold',"""
content = content.replace(old_chrono_click, new_chrono_click)

# In review sub-sidebar:
old_review_click = """              onClick={() => document.getElementById('file-upload')?.click()}
              _hover={{ 
                borderColor: 'judicial.gold',"""
new_review_click = """              onClick={() => document.getElementById('review-file-upload')?.click()}
              _hover={{ 
                borderColor: 'judicial.gold',"""
content = content.replace(old_review_click, new_review_click)

# 6. Inject the hidden file-upload inputs in JSX
# Right before the existing file input
old_file_input = """        {/* Hidden input for uploader */}
        <Input
          type="file"
          accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFileUpload}
          display="none"
          id="file-upload"
        />"""

new_file_input = """        {/* Hidden input for uploader */}
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
        />"""

content = content.replace(old_file_input, new_file_input)

# 7. Update handleSuggestedActionClick in AdvancedChat.jsx to unpack objects & handle PRECEDENCE_ANALYSIS and COUNTER_AFFIDAVIT
old_action_click_header = """  const handleSuggestedActionClick = async (actionType, suggestion) => {
    console.log('Suggested action clicked:', actionType, suggestion);"""

new_action_click_header = """  const handleSuggestedActionClick = async (actionTypeRaw, suggestionInput) => {
    let actionType = actionTypeRaw;
    let suggestion = suggestionInput;

    if (typeof actionTypeRaw === 'object' && actionTypeRaw !== null) {
      actionType = actionTypeRaw.type || actionTypeRaw.action;
      suggestion = actionTypeRaw;
    }

    console.log('Suggested action clicked:', actionType, suggestion);"""

content = content.replace(old_action_click_header, new_action_click_header)

# Insert the case blocks inside handleSuggestedActionClick's switch
# Right after: switch (actionType) {
old_switch_start = "    switch (actionType) {"
new_switch_start = """    switch (actionType) {
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
        break;"""

content = content.replace(old_switch_start, new_switch_start)

# 8. Add the right split panel rendering area and AdvancedChatProvider wrap
# Define isRightPanelOpen
is_right_panel_open_def = """  const isRightPanelOpen = 
    (activeTab === 'chronology' && isTimelinePanelOpen) ||
    (activeTab === 'drafting' && isPrecedencePanelOpen) ||
    (activeTab === 'drafting' && isCounterMakerPanelOpen) ||
    (activeTab === 'research' && isReportPanelOpen) ||
    (activeTab === 'review' && isBulkReviewPanelOpen) ||
    isEditMode;"""

content = content.replace(
    "  return (",
    is_right_panel_open_def + "\n\n  return ("
)

# Wrap return with AdvancedChatProvider
context_value_def = """  const contextValue = {
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
  };"""

content = content.replace(
    is_right_panel_open_def + "\n\n  return (",
    context_value_def + "\n\n" + is_right_panel_open_def + "\n\n  return (\n    <AdvancedChatProvider value={contextValue}>"
)

# Close provider at the end
content = content.replace(
    "    </>\n  );\n};\n\nexport default ChatPage;",
    "    </AdvancedChatProvider>\n  );\n};\n\nexport default ChatPage;"
)

# 9. Render the split panel to the right of the working window (adjacent to Main Working Window Flex)
split_panel_render = """      {/* 4. Right Split Panel (Dynamic based on active feature) */}
      {isRightPanelOpen && (
        <Box w="45%" minW="400px" maxW="600px" borderLeft="1px solid" borderColor={borderColor} bg={cv_white_to_gray_900} overflowY="auto" display="flex" flexDirection="column" zIndex={5}>
          {activeTab === 'chronology' && isTimelinePanelOpen && <TimelinePanel />}
          {activeTab === 'drafting' && isPrecedencePanelOpen && <PrecedencePanel />}
          {activeTab === 'drafting' && isCounterMakerPanelOpen && <CounterMakerPanel />}
          {activeTab === 'research' && isReportPanelOpen && <ResearchPanel />}
          {activeTab === 'review' && isBulkReviewPanelOpen && <BulkReviewPanel />}
        </Box>
      )}"""

# Search for the renderWorkingWindowBody section
old_body_end = """        <Flex flex="1" overflow="hidden" position="relative">
          {renderWorkingWindowBody()}
        </Flex>
      </Flex>
    </Flex>"""

new_body_end = """        <Flex flex="1" overflow="hidden" position="relative">
          {renderWorkingWindowBody()}
        </Flex>
      </Flex>
""" + split_panel_render + """
    </Flex>"""

content = content.replace(old_body_end, new_body_end)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Parsed and updated AdvancedChat.jsx successfully with functional agents, providers, and panels!")
