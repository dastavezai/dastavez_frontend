import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Tooltip,
  useColorModeValue,
  useToast,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Flex,
  Icon,
} from '@chakra-ui/react';
import {
  FiSave,
  FiDownload,
  FiSearch,
  FiX,
  FiCopy,
  FiCheck,
  FiChevronDown,
  FiFileText,
  FiFile,
  FiSidebar,
} from 'react-icons/fi';
import {
  MdDescription,
  MdLightbulb,
  MdSmartToy,
  MdHistory,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import fileService from '../services/fileService';
import DesignSuggestionModal from './DesignSuggestionModal';
import EditorToolbar from './EditorToolbar';
import SmartSuggestionsPanel from './SmartSuggestionsPanel';
import DocumentAnalysisPanel from './DocumentAnalysisPanel';
import AIHelperPanel from './AIHelperPanel';

/**
 * FullPageEditor - Full-screen rich-text document editor with TipTap
 * 3-panel layout: Left AI sidebar | Center TipTap editor | Right suggestions
 */
const FullPageEditor = ({
  isOpen,
  onClose,
  session,
  onSessionUpdate,
  selectedFile,
  scanStatus,
  formatMetadata,
  scanResults,
  smartSuggestions: initialSuggestions,
  htmlContent: initialHtml,
  language = 'en',
}) => {
  // State
  const [suggestions, setSuggestions] = useState(initialSuggestions || []);
  const [editInstruction, setEditInstruction] = useState('');
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changeHistory, setChangeHistory] = useState([]);
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState(null);
  const [isDesignSuggestionOpen, setIsDesignSuggestionOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [selectedText, setSelectedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const toast = useToast();
  const autosaveTimerRef = useRef(null);

  // Colors
  const bgColor = useColorModeValue('white', 'gray.900');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const editorBg = useColorModeValue('#ffffff', '#1a1a2e');
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const pageShadow = useColorModeValue('0 2px 20px rgba(0,0,0,0.08)', '0 2px 20px rgba(0,0,0,0.3)');

  // Compute initial content
  const getInitialContent = useCallback(() => {
    if (initialHtml && initialHtml.trim()) return initialHtml;
    if (session?.htmlContent && session.htmlContent.trim()) return session.htmlContent;
    const text = session?.currentText || session?.originalText || '';
    if (!text) return '<p></p>';
    return text.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
  }, [initialHtml, session]);

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: { depth: 100 },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily,
      TextStyle.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: 'Start typing your document...',
      }),
    ],
    content: getInitialContent(),
    onUpdate: ({ editor: ed }) => {
      setHasUnsavedChanges(true);
      // Debounced autosave
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        handleAutosave(ed);
      }, 3000);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection;
      if (from !== to) {
        setSelectedText(ed.state.doc.textBetween(from, to, ' '));
      } else {
        setSelectedText('');
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  // Update editor content when session changes
  useEffect(() => {
    if (editor && session && !editor.isFocused) {
      const content = getInitialContent();
      if (content && editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [session]);

  // Update suggestions from props
  useEffect(() => {
    if (initialSuggestions) setSuggestions(initialSuggestions);
  }, [initialSuggestions]);

  // Apply format metadata styling to editor
  useEffect(() => {
    if (formatMetadata && editor) {
      const editorEl = document.querySelector('.tiptap-editor');
      if (editorEl) {
        editorEl.style.fontFamily = `'${formatMetadata.defaultFont}', serif`;
        editorEl.style.fontSize = `${formatMetadata.defaultFontSize || 12}pt`;
        if (formatMetadata.lineSpacing) {
          editorEl.style.lineHeight = String(formatMetadata.lineSpacing);
        }
      }
    }
  }, [formatMetadata, editor]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // Initialize history
  useEffect(() => {
    if (session?.changes) setChangeHistory(session.changes);
  }, [session]);

  // Autosave
  const handleAutosave = async (ed) => {
    if (!ed) return;
    try {
      setIsSaving(true);
      const html = ed.getHTML();
      const plainText = ed.getText();
      await fileService.saveHtmlContent(html, plainText);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (err) {
      console.warn('Autosave failed:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Manual save
  const handleSave = async () => {
    if (!editor) return;
    await handleAutosave(editor);
    toast({ title: 'Document saved', status: 'success', duration: 1500 });
  };

  // AI Edit
  const handleAIEdit = async () => {
    if (!editInstruction.trim() || !editor) return;
    setIsApplyingEdit(true);
    try {
      const result = await fileService.applyEdit(editInstruction);
      if (result.success) {
        // Refresh session
        const statusRes = await fileService.getEditStatus();
        if (statusRes.hasSession) {
          const analysisRes = await fileService.getDocumentAnalysis();
          // Update editor with new content
          if (result.textPreview) {
            const newHtml = result.textPreview.split('\n').map(l => `<p>${l || '<br>'}</p>`).join('');
            editor.commands.setContent(newHtml);
          }
          setChangeHistory(prev => [...prev, {
            instruction: editInstruction,
            summary: result.changeSummary,
            timestamp: new Date().toISOString()
          }]);
          setEditInstruction('');
          if (onSessionUpdate) onSessionUpdate();
        }
        toast({ title: 'Edit Applied', description: result.changeSummary, status: 'success', duration: 3000 });
      }
    } catch (error) {
      toast({ title: 'Edit Failed', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsApplyingEdit(false);
    }
  };

  // Copy
  const handleCopy = async () => {
    if (!editor) return;
    try {
      await navigator.clipboard.writeText(editor.getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied to clipboard', status: 'success', duration: 1500 });
    } catch (err) {
      toast({ title: 'Copy failed', status: 'error', duration: 1500 });
    }
  };

  // Download
  const handleDownload = (format) => {
    setPendingDownloadFormat(format);
    setIsDesignSuggestionOpen(true);
  };

  const executeDownloadWithDesign = async (format, designConfig) => {
    setIsDesignSuggestionOpen(false);
    // Auto-save before download
    if (editor) await handleAutosave(editor);
    
    toast({ title: `Generating ${format.toUpperCase()}...`, status: 'info', duration: 2000 });
    try {
      // If user wants original formatting and we have formatMetadata, use it as designConfig
      const finalDesignConfig = designConfig || (formatMetadata ? {
        fontFamily: formatMetadata.defaultFont,
        bodyFontSize: formatMetadata.defaultFontSize,
        lineSpacing: formatMetadata.lineSpacing,
        bodyAlignment: formatMetadata.bodyAlignment,
        margins: formatMetadata.margins,
      } : undefined);

      const blob = await fileService.downloadEdited(format, finalDesignConfig);
      if (blob && blob.size > 0) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = selectedFile?.fileName?.replace(/\.[^/.]+$/, '') || 'edited_document';
        a.download = `${baseName}_edited.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast({ title: 'Download Complete', status: 'success', duration: 2000 });
      }
    } catch (error) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        toast({ title: 'Download Started', description: 'Handled by download manager.', status: 'info', duration: 3000 });
      } else {
        toast({ title: 'Download Failed', description: error.message, status: 'error', duration: 3000 });
      }
    }
  };

  // Apply suggestion
  const handleApplySuggestion = async (suggestion) => {
    try {
      // If suggestion has original+suggested text, replace in editor
      if (suggestion.originalText && suggestion.suggestedText && editor) {
        const content = editor.getHTML();
        if (content.includes(suggestion.originalText)) {
          const newContent = content.replace(suggestion.originalText, suggestion.suggestedText);
          editor.commands.setContent(newContent);
        }
      }
      // Update status
      await fileService.updateSuggestionStatus(suggestion.suggestionId, 'applied');
      setSuggestions(prev => prev.map(s => 
        s.suggestionId === suggestion.suggestionId ? { ...s, status: 'applied' } : s
      ));
      toast({ title: 'Suggestion applied', status: 'success', duration: 1500 });
    } catch (err) {
      toast({ title: 'Failed to apply', description: err.message, status: 'error', duration: 2000 });
    }
  };

  // Dismiss suggestion
  const handleDismissSuggestion = async (suggestion) => {
    try {
      await fileService.updateSuggestionStatus(suggestion.suggestionId, 'dismissed');
      setSuggestions(prev => prev.map(s => 
        s.suggestionId === suggestion.suggestionId ? { ...s, status: 'dismissed' } : s
      ));
    } catch (err) {
      console.warn('Dismiss failed:', err.message);
    }
  };

  const fileName = session?.fileName || selectedFile?.fileName || 'Untitled';
  const plainText = editor?.getText() || '';
  const wordCount = plainText.split(/\s+/).filter(w => w).length;
  const charCount = plainText.length;

  // Compute page style from format metadata
  const pageStyle = formatMetadata ? {
    fontFamily: `'${formatMetadata.defaultFont}', serif`,
    fontSize: `${formatMetadata.defaultFontSize || 12}pt`,
    lineHeight: formatMetadata.lineSpacing || 1.15,
    paddingTop: `${(formatMetadata.margins?.topInches || 1) * 72}px`,
    paddingRight: `${(formatMetadata.margins?.rightInches || 1) * 72}px`,
    paddingBottom: `${(formatMetadata.margins?.bottomInches || 1) * 72}px`,
    paddingLeft: `${(formatMetadata.margins?.leftInches || 1) * 72}px`,
  } : {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="slideInBottom">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg={bgColor} m={0} borderRadius={0} maxH="100vh" h="100vh">
        {/* ===== TOP TOOLBAR ===== */}
        <ModalHeader bg={headerBg} borderBottom="1px solid" borderColor={borderColor} py={2} px={4}>
          <HStack justify="space-between" w="100%">
            {/* Left: File info */}
            <HStack spacing={3}>
              <FiFileText size={18} />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="600" noOfLines={1} maxW="250px">{fileName}</Text>
                <HStack spacing={1.5}>
                  {scanStatus === 'scanned' && (
                    <Badge colorScheme="green" fontSize="2xs">Scanned</Badge>
                  )}
                  {hasUnsavedChanges && <Badge colorScheme="orange" fontSize="2xs">Unsaved</Badge>}
                  {isSaving && <Badge colorScheme="blue" fontSize="2xs">Saving...</Badge>}
                  {lastSaved && !hasUnsavedChanges && !isSaving && (
                    <Badge colorScheme="gray" fontSize="2xs">Saved</Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>

            {/* Right: Actions */}
            <HStack spacing={1.5}>
              {/* Toggle sidebars */}
              <Tooltip label={leftSidebarOpen ? 'Hide AI panels' : 'Show AI panels'} fontSize="xs">
                <IconButton
                  icon={leftSidebarOpen ? <MdChevronLeft /> : <MdChevronRight />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                  aria-label="Toggle left sidebar"
                />
              </Tooltip>
              <Tooltip label={rightSidebarOpen ? 'Hide suggestions' : 'Show suggestions'} fontSize="xs">
                <IconButton
                  icon={<MdLightbulb />}
                  size="sm"
                  variant={rightSidebarOpen ? 'solid' : 'ghost'}
                  colorScheme={rightSidebarOpen ? 'yellow' : 'gray'}
                  onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                  aria-label="Toggle suggestions"
                />
              </Tooltip>

              <Divider orientation="vertical" h="20px" />

              <Tooltip label="Search" fontSize="xs">
                <IconButton
                  icon={<FiSearch />}
                  size="sm"
                  variant={searchVisible ? 'solid' : 'ghost'}
                  onClick={() => setSearchVisible(!searchVisible)}
                  aria-label="Search"
                />
              </Tooltip>
              <Tooltip label="Copy all" fontSize="xs">
                <IconButton
                  icon={copied ? <FiCheck /> : <FiCopy />}
                  size="sm"
                  variant="ghost"
                  colorScheme={copied ? 'green' : 'gray'}
                  onClick={handleCopy}
                  aria-label="Copy"
                />
              </Tooltip>
              <Tooltip label="Save (Ctrl+S)" fontSize="xs">
                <IconButton
                  icon={<FiSave />}
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  aria-label="Save"
                />
              </Tooltip>

              {/* Download */}
              <Menu>
                <MenuButton as={Button} size="sm" colorScheme="green" rightIcon={<FiChevronDown />} leftIcon={<FiDownload />}>
                  Download
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiFile />} onClick={() => handleDownload('docx')}>
                    Download as DOCX
                  </MenuItem>
                  <MenuItem icon={<FiFileText />} onClick={() => handleDownload('pdf')}>
                    Download as PDF
                  </MenuItem>
                </MenuList>
              </Menu>

              <IconButton icon={<FiX />} size="sm" variant="ghost" onClick={onClose} aria-label="Close" />
            </HStack>
          </HStack>
        </ModalHeader>

        {/* Search bar */}
        {searchVisible && (
          <Box px={4} py={1.5} bg={headerBg} borderBottom="1px solid" borderColor={borderColor}>
            <HStack>
              <InputGroup size="sm" maxW="300px">
                <InputLeftElement><FiSearch /></InputLeftElement>
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Button size="sm" onClick={() => {/* TODO: find in TipTap */}}>Find</Button>
            </HStack>
          </Box>
        )}

        {/* ===== FORMATTING TOOLBAR ===== */}
        <EditorToolbar editor={editor} />

        {/* ===== MAIN 3-PANEL LAYOUT ===== */}
        <ModalBody p={0} display="flex" flexDirection="row" overflow="hidden">
          {/* LEFT SIDEBAR: Analysis + AI Helper */}
          {leftSidebarOpen && (
            <Box
              w="300px"
              minW="300px"
              bg={sidebarBg}
              borderRight="1px solid"
              borderColor={borderColor}
              display="flex"
              flexDirection="column"
              h="100%"
              overflow="hidden"
            >
              <Tabs flex="1" display="flex" flexDirection="column" variant="enclosed-colored" size="sm">
                <TabList px={1} pt={1}>
                  <Tab fontSize="xs"><Icon as={MdDescription} mr={1} /> Analysis</Tab>
                  <Tab fontSize="xs"><Icon as={MdSmartToy} mr={1} /> AI Helper</Tab>
                  <Tab fontSize="xs"><Icon as={MdHistory} mr={1} /> History</Tab>
                </TabList>
                <TabPanels flex="1" overflow="hidden">
                  {/* Analysis Tab */}
                  <TabPanel p={0} h="100%" overflowY="auto">
                    <DocumentAnalysisPanel 
                      scanResults={scanResults} 
                      formatMetadata={formatMetadata} 
                    />
                  </TabPanel>
                  {/* AI Helper Tab */}
                  <TabPanel p={0} h="100%">
                    <AIHelperPanel 
                      selectedText={selectedText}
                      documentType={scanResults?.documentType}
                      language={language}
                    />
                  </TabPanel>
                  {/* History Tab */}
                  <TabPanel p={2} h="100%" overflowY="auto">
                    <VStack align="stretch" spacing={2}>
                      {changeHistory.length === 0 ? (
                        <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                          No edits yet
                        </Text>
                      ) : (
                        changeHistory.map((change, idx) => (
                          <Box
                            key={idx}
                            p={2}
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            borderRadius="md"
                            borderLeft="3px solid"
                            borderLeftColor="green.400"
                          >
                            <Text fontSize="2xs" color="gray.500">Edit #{idx + 1}</Text>
                            <Text fontSize="xs" fontWeight="500" noOfLines={2}>
                              {change.instruction || change.summary}
                            </Text>
                          </Box>
                        ))
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          )}

          {/* CENTER: TipTap Editor with page-like styling */}
          <Box
            flex="1"
            display="flex"
            flexDirection="column"
            h="100%"
            bg={useColorModeValue('gray.100', 'gray.900')}
            overflow="auto"
          >
            {/* Page container */}
            <Box
              mx="auto"
              my={6}
              w="100%"
              maxW="816px" /* ~8.5 inches at 96dpi */
              minH="1056px" /* ~11 inches */
              bg={editorBg}
              boxShadow={pageShadow}
              borderRadius="2px"
              position="relative"
              sx={{
                '.tiptap-editor': {
                  outline: 'none',
                  minHeight: '900px',
                  padding: pageStyle.paddingTop ? undefined : '72px 72px 72px 72px',
                  fontFamily: pageStyle.fontFamily || "'Times New Roman', serif",
                  fontSize: pageStyle.fontSize || '12pt',
                  lineHeight: pageStyle.lineHeight || 1.15,
                  color: useColorModeValue('#1a1a1a', '#e0e0e0'),
                  ...(pageStyle.paddingTop ? {
                    paddingTop: pageStyle.paddingTop,
                    paddingRight: pageStyle.paddingRight,
                    paddingBottom: pageStyle.paddingBottom,
                    paddingLeft: pageStyle.paddingLeft,
                  } : {}),
                  '& p': { marginBottom: '0.5em' },
                  '& h1': { fontSize: '2em', fontWeight: 'bold', marginBottom: '0.5em', marginTop: '0.8em' },
                  '& h2': { fontSize: '1.5em', fontWeight: 'bold', marginBottom: '0.4em', marginTop: '0.7em' },
                  '& h3': { fontSize: '1.17em', fontWeight: 'bold', marginBottom: '0.3em', marginTop: '0.6em' },
                  '& h4': { fontSize: '1em', fontWeight: 'bold', marginBottom: '0.3em', marginTop: '0.5em' },
                  '& ul, & ol': { paddingLeft: '1.5em', marginBottom: '0.5em' },
                  '& blockquote': {
                    borderLeft: '3px solid',
                    borderColor: 'gray.300',
                    paddingLeft: '1em',
                    marginLeft: '0.5em',
                    fontStyle: 'italic',
                    color: 'gray.600',
                  },
                  '& hr': { margin: '1em 0', borderColor: 'gray.300' },
                  '& mark': { borderRadius: '2px', padding: '0 2px' },
                },
                '.ProseMirror-focused': {
                  outline: 'none',
                },
                '.ProseMirror p.is-editor-empty:first-of-type::before': {
                  content: 'attr(data-placeholder)',
                  float: 'left',
                  color: useColorModeValue('gray.400', 'gray.500'),
                  pointerEvents: 'none',
                  height: 0,
                },
              }}
            >
              <EditorContent editor={editor} />
            </Box>
          </Box>

          {/* RIGHT SIDEBAR: Smart Suggestions */}
          {rightSidebarOpen && (
            <Box
              w="300px"
              minW="300px"
              bg={sidebarBg}
              borderLeft="1px solid"
              borderColor={borderColor}
              display="flex"
              flexDirection="column"
              h="100%"
              overflow="hidden"
            >
              <SmartSuggestionsPanel
                suggestions={suggestions}
                onApply={handleApplySuggestion}
                onDismiss={handleDismissSuggestion}
                onViewInDocument={(suggestion) => {
                  // Scroll editor to show the original text
                  if (suggestion.originalText && editor) {
                    // Use TipTap search — highlight the text
                    const content = editor.getText();
                    const idx = content.indexOf(suggestion.originalText);
                    if (idx !== -1) {
                      editor.commands.setTextSelection({ from: idx, to: idx + suggestion.originalText.length });
                    }
                  }
                }}
              />
            </Box>
          )}
        </ModalBody>

        {/* Status Footer */}
        <ModalFooter bg={headerBg} borderTop="1px solid" borderColor={borderColor} py={1.5} px={4}>
          <HStack justify="space-between" w="100%" fontSize="xs" color="gray.500">
            <HStack spacing={4}>
              <Text>{wordCount} words</Text>
              <Text>{charCount} characters</Text>
              {formatMetadata?.pageSize?.name && (
                <Text>{formatMetadata.pageSize.name}</Text>
              )}
              {formatMetadata?.defaultFont && (
                <Text>{formatMetadata.defaultFont} {formatMetadata.defaultFontSize}pt</Text>
              )}
            </HStack>
            <HStack spacing={4}>
              <Text>{changeHistory.length} edit{changeHistory.length !== 1 ? 's' : ''}</Text>
              {suggestions.filter(s => s.status === 'pending').length > 0 && (
                <Text color="orange.400">
                  {suggestions.filter(s => s.status === 'pending').length} suggestions pending
                </Text>
              )}
              {lastSaved && (
                <Text>Last saved: {new Date(lastSaved).toLocaleTimeString()}</Text>
              )}
            </HStack>
          </HStack>
        </ModalFooter>

        {/* Design Suggestion Modal for Download */}
        <DesignSuggestionModal
          isOpen={isDesignSuggestionOpen}
          onClose={() => setIsDesignSuggestionOpen(false)}
          onDownload={executeDownloadWithDesign}
          documentTitle={fileName}
          documentContent={editor?.getText()?.substring(0, 500) || ''}
          requestedFormat={pendingDownloadFormat || 'docx'}
        />
      </ModalContent>
    </Modal>
  );
};

export default FullPageEditor;
