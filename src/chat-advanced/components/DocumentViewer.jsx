import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Tooltip,
  useColorModeValue,
  Divider,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  FiMaximize2,
  FiSearch,
  FiFileText,
  FiEdit,
  FiSave,
  FiDownload,
  FiRotateCcw,
  FiCopy,
  FiX,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiClock,
  FiEye,
  FiCode,
} from 'react-icons/fi';
import fileService from '../services/fileService';
import DesignSuggestionModal from './DesignSuggestionModal';

/**
 * Enhanced DocumentViewer - Pane view editor with comprehensive editing tools
 * Features: Undo/Redo, Autosave, Diff View, Track Changes, Template Variables
 */
const DocumentViewer = ({ 
  session, 
  onExpandClick,
  analysis,
  onSessionUpdate 
}) => {
  // Core state
  const [searchTerm, setSearchTerm] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchMatches, setSearchMatches] = useState(0);
  
  // Undo/Redo state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  
  // Track changes state
  const [showTrackChanges, setShowTrackChanges] = useState(false);
  const [diffData, setDiffData] = useState(null);
  
  // Autosave state
  const [lastAutosave, setLastAutosave] = useState(null);
  const autosaveTimerRef = useRef(null);
  
  // Template variables
  const [templateVariables, setTemplateVariables] = useState([]);
  
  const textareaRef = useRef(null);
  const toast = useToast();
  
  // Design suggestion state
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState(null);
  const [isDesignSuggestionOpen, setIsDesignSuggestionOpen] = useState(false);
  
  // Modals
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const { isOpen: isDiffOpen, onOpen: onDiffOpen, onClose: onDiffClose } = useDisclosure();
  const { isOpen: isVariablesOpen, onOpen: onVariablesOpen, onClose: onVariablesClose } = useDisclosure();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const highlightBg = useColorModeValue('yellow.200', 'yellow.700');
  const toolbarBg = useColorModeValue('gray.50', 'gray.900');
  const additionBg = useColorModeValue('green.100', 'green.900');
  const deletionBg = useColorModeValue('red.100', 'red.900');
  
  // Initialize from session
  useEffect(() => {
    if (session) {
      const text = session.currentText || session.originalText || '';
      setEditedText(text);
      setHasChanges(false);
      setTemplateVariables(session.detectedVariables || []);
      fetchUndoRedoState();
    }
  }, [session]);

  // Autosave effect (every 30 seconds)
  useEffect(() => {
    if (isEditing && hasChanges) {
      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await fileService.autosave(editedText);
          setLastAutosave(new Date());
        } catch (error) {
          console.error('Autosave failed:', error);
        }
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [isEditing, hasChanges, editedText]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditing) return;
      
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, canUndo, canRedo, hasChanges]);

  // Count search matches
  useEffect(() => {
    if (searchTerm.trim() && editedText) {
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = editedText.match(regex);
      setSearchMatches(matches ? matches.length : 0);
    } else {
      setSearchMatches(0);
    }
  }, [searchTerm, editedText]);
  
  // Fetch undo/redo state
  const fetchUndoRedoState = async () => {
    try {
      const state = await fileService.getUndoRedoState();
      setCanUndo(state.canUndo);
      setCanRedo(state.canRedo);
    } catch (error) {
      console.error('Failed to fetch undo/redo state:', error);
    }
  };
  
  if (!session) {
    return (
      <Box p={6} textAlign="center" h="100%" bg={bgColor} borderRadius="lg" border="1px solid" borderColor={borderColor}>
        <Text color="gray.500">No document loaded</Text>
      </Box>
    );
  }

  const documentText = session.currentText || session.originalText || '';
  const fileName = session.fileName || 'Untitled';
  const changesCount = session.changes?.length || 0;
  const editHistory = session.changes || [];
  
  // Highlight search terms
  const highlightText = (text) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <Box as="span" key={i} bg={highlightBg} px={1} borderRadius="sm" fontWeight="bold">
          {part}
        </Box>
      ) : part
    );
  };

  // Render diff with track changes highlighting
  const renderDiffText = () => {
    if (!diffData || !showTrackChanges) return editedText;
    
    // Simple diff rendering - highlight additions in green, show deletions in red strikethrough
    const { additions, deletions, fromText, toText } = diffData;
    
    return (
      <Box>
        {editedText.split('\n').map((line, i) => (
          <Text key={i} mb={1}>
            {line || '\u00A0'}
          </Text>
        ))}
      </Box>
    );
  };

  // Handle text changes
  const handleTextChange = (e) => {
    setEditedText(e.target.value);
    setHasChanges(e.target.value !== documentText);
  };

  // Find & Replace
  const handleReplaceSingle = () => {
    if (!findText.trim()) {
      toast({ title: 'Enter text to find', status: 'warning', duration: 2000 });
      return;
    }
    
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (!regex.test(editedText)) {
      toast({ title: 'No match found', status: 'info', duration: 2000 });
      return;
    }
    
    const newText = editedText.replace(regex, replaceText);
    setEditedText(newText);
    setHasChanges(true);
    toast({ title: 'Replaced 1 occurrence', status: 'success', duration: 2000 });
  };

  const handleReplaceAll = () => {
    if (!findText.trim()) {
      toast({ title: 'Enter text to find', status: 'warning', duration: 2000 });
      return;
    }
    
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = editedText.match(regex);
    
    if (!matches) {
      toast({ title: 'No matches found', status: 'info', duration: 2000 });
      return;
    }
    
    const newText = editedText.replace(regex, replaceText);
    setEditedText(newText);
    setHasChanges(true);
    toast({ title: `Replaced ${matches.length} occurrence(s)`, status: 'success', duration: 2000 });
  };

  // Undo
  const handleUndo = async () => {
    if (!canUndo || isUndoing) return;
    
    setIsUndoing(true);
    try {
      // First commit any pending changes
      if (hasChanges) {
        await fileService.applyManualEdit(editedText, 'Manual edits before undo');
      }
      
      const result = await fileService.undo();
      if (result.success) {
        setEditedText(result.session.currentText);
        setCanUndo(result.canUndo);
        setCanRedo(result.canRedo);
        setHasChanges(false);
        toast({ title: 'Undo successful', status: 'success', duration: 1500 });
        if (onSessionUpdate) onSessionUpdate();
      }
    } catch (error) {
      toast({ title: 'Undo failed', description: error.message, status: 'error', duration: 2000 });
    } finally {
      setIsUndoing(false);
    }
  };

  // Redo
  const handleRedo = async () => {
    if (!canRedo || isUndoing) return;
    
    setIsUndoing(true);
    try {
      const result = await fileService.redo();
      if (result.success) {
        setEditedText(result.session.currentText);
        setCanUndo(result.canUndo);
        setCanRedo(result.canRedo);
        setHasChanges(false);
        toast({ title: 'Redo successful', status: 'success', duration: 1500 });
        if (onSessionUpdate) onSessionUpdate();
      }
    } catch (error) {
      toast({ title: 'Redo failed', description: error.message, status: 'error', duration: 2000 });
    } finally {
      setIsUndoing(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!hasChanges) {
      toast({ title: 'No changes to save', status: 'info', duration: 2000 });
      return;
    }

    setIsSaving(true);
    try {
      const result = await fileService.applyManualEdit(editedText, 'Manual edit from pane editor');
      
      if (result.success) {
        setHasChanges(false);
        await fetchUndoRedoState();
        toast({ title: 'Changes saved', status: 'success', duration: 2000 });
        if (onSessionUpdate) onSessionUpdate();
      }
    } catch (error) {
      toast({ title: 'Save failed', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  // Revert to previous version
  const handleRevert = async (changeIndex) => {
    try {
      const previousText = changeIndex === 0 
        ? session.originalText 
        : editHistory[changeIndex - 1]?.newText || session.originalText;
      
      const result = await fileService.applyManualEdit(previousText, `Reverted to version ${changeIndex}`);
      
      if (result.success) {
        setEditedText(previousText);
        setHasChanges(false);
        onHistoryClose();
        await fetchUndoRedoState();
        toast({ title: `Reverted to version ${changeIndex}`, status: 'success', duration: 2000 });
        if (onSessionUpdate) onSessionUpdate();
      }
    } catch (error) {
      toast({ title: 'Revert failed', description: error.message, status: 'error', duration: 3000 });
    }
  };

  // Revert to original
  const handleRevertToOriginal = async () => {
    try {
      const result = await fileService.applyManualEdit(session.originalText, 'Reverted to original');
      
      if (result.success) {
        setEditedText(session.originalText);
        setHasChanges(false);
        await fetchUndoRedoState();
        toast({ title: 'Reverted to original', status: 'success', duration: 2000 });
        if (onSessionUpdate) onSessionUpdate();
      }
    } catch (error) {
      toast({ title: 'Revert failed', description: error.message, status: 'error', duration: 3000 });
    }
  };

  // Download — intercept to show design suggestion modal
  const handleDownload = async (format) => {
    try {
      if (hasChanges) {
        await handleSave();
      }
      // Open design suggestion modal before downloading
      setPendingDownloadFormat(format);
      setIsDesignSuggestionOpen(true);
    } catch (error) {
      toast({ title: 'Save failed before download', description: error.message, status: 'error', duration: 3000 });
    }
  };

  // Execute download (called from DesignSuggestionModal)
  const executeDownload = async (format, designConfig) => {
    setIsDesignSuggestionOpen(false);
    try {
      if (designConfig && format === 'docx') {
        // Download with design config applied
        await fileService.downloadEditedDocument(format, designConfig);
      } else {
        await fileService.downloadEditedDocument(format);
      }
      toast({ title: `${format.toUpperCase()} download started`, status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Download failed', description: error.message, status: 'error', duration: 3000 });
    }
  };

  // Copy all text
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      toast({ title: 'Copied to clipboard', status: 'success', duration: 2000 });
    } catch (err) {
      toast({ title: 'Copy failed', status: 'error', duration: 2000 });
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setEditedText(documentText);
    setHasChanges(false);
    setIsEditing(false);
  };

  // Load diff for track changes
  const loadDiff = async () => {
    try {
      const diff = await fileService.getDiff(0, -1);
      setDiffData(diff);
      setShowTrackChanges(true);
    } catch (error) {
      console.error('Failed to load diff:', error);
    }
  };

  // Fill template variable
  const handleFillVariable = async (name, value) => {
    try {
      const result = await fileService.fillTemplateVariables({ [name]: value });
      if (result.success) {
        setEditedText(result.session.currentText);
        setTemplateVariables(result.session.detectedVariables || []);
        toast({ title: `Filled ${name}`, status: 'success', duration: 2000 });
        if (onSessionUpdate) onSessionUpdate();
      }
    } catch (error) {
      toast({ title: 'Fill failed', description: error.message, status: 'error', duration: 3000 });
    }
  };

  return (
    <Box
      h="100%"
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Header */}
      <Box px={3} py={2} borderBottom="1px solid" borderColor={borderColor} bg={toolbarBg}>
        <HStack justify="space-between">
          <HStack spacing={2} overflow="hidden">
            <FiFileText size={14} />
            <Text fontWeight="600" fontSize="xs" noOfLines={1} maxW="120px">
              {fileName}
            </Text>
            {hasChanges && <Badge colorScheme="orange" fontSize="10px">Unsaved</Badge>}
            {lastAutosave && (
              <Tooltip label={`Last autosave: ${lastAutosave.toLocaleTimeString()}`}>
                <Badge colorScheme="green" fontSize="10px">Autosaved</Badge>
              </Tooltip>
            )}
          </HStack>
          <Tooltip label="Open full editor">
            <IconButton icon={<FiMaximize2 />} size="xs" variant="ghost" onClick={onExpandClick} />
          </Tooltip>
        </HStack>
      </Box>

      {/* Toolbar */}
      <Box px={2} py={2} borderBottom="1px solid" borderColor={borderColor} bg={toolbarBg}>
        <HStack spacing={1} flexWrap="wrap">
          {/* Edit Toggle */}
          <Tooltip label={isEditing ? 'View mode' : 'Edit mode'}>
            <IconButton
              icon={<FiEdit />}
              size="sm"
              variant={isEditing ? 'solid' : 'ghost'}
              colorScheme={isEditing ? 'blue' : 'gray'}
              onClick={() => setIsEditing(!isEditing)}
            />
          </Tooltip>

          <Divider orientation="vertical" h="24px" />

          {/* Undo/Redo */}
          <Tooltip label="Undo (Ctrl+Z)">
            <IconButton
              icon={<FiCornerUpLeft />}
              size="sm"
              variant="ghost"
              isDisabled={!canUndo}
              onClick={handleUndo}
              isLoading={isUndoing}
            />
          </Tooltip>
          <Tooltip label="Redo (Ctrl+Y)">
            <IconButton
              icon={<FiCornerUpRight />}
              size="sm"
              variant="ghost"
              isDisabled={!canRedo}
              onClick={handleRedo}
            />
          </Tooltip>

          <Divider orientation="vertical" h="24px" />

          {/* Save */}
          <Tooltip label="Save (Ctrl+S)">
            <IconButton
              icon={<FiSave />}
              size="sm"
              variant="ghost"
              colorScheme={hasChanges ? 'green' : 'gray'}
              onClick={handleSave}
              isLoading={isSaving}
              isDisabled={!hasChanges}
            />
          </Tooltip>

          {/* Download Menu */}
          <Menu>
            <MenuButton as={IconButton} icon={<FiDownload />} size="sm" variant="ghost" />
            <MenuList minW="140px">
              <MenuItem fontSize="sm" onClick={() => handleDownload('docx')}>DOCX</MenuItem>
              <MenuItem fontSize="sm" onClick={() => handleDownload('pdf')}>PDF</MenuItem>
              <MenuItem fontSize="sm" onClick={() => handleDownload('rtf')}>RTF</MenuItem>
              <MenuItem fontSize="sm" onClick={() => handleDownload('html')}>HTML</MenuItem>
              <MenuItem fontSize="sm" onClick={() => handleDownload('md')}>Markdown</MenuItem>
            </MenuList>
          </Menu>

          <Divider orientation="vertical" h="24px" />

          {/* History */}
          <Tooltip label="Edit history">
            <IconButton icon={<FiClock />} size="sm" variant="ghost" onClick={onHistoryOpen} />
          </Tooltip>

          {/* Track Changes Toggle */}
          <Tooltip label="Track changes view">
            <IconButton
              icon={<FiEye />}
              size="sm"
              variant={showTrackChanges ? 'solid' : 'ghost'}
              colorScheme={showTrackChanges ? 'purple' : 'gray'}
              onClick={() => {
                if (!showTrackChanges) loadDiff();
                else setShowTrackChanges(false);
              }}
            />
          </Tooltip>

          {/* Template Variables */}
          {templateVariables.length > 0 && (
            <Tooltip label={`${templateVariables.length} template variables`}>
              <IconButton
                icon={<FiCode />}
                size="sm"
                variant="ghost"
                colorScheme="teal"
                onClick={onVariablesOpen}
              />
            </Tooltip>
          )}

          {/* Copy */}
          <Tooltip label="Copy all">
            <IconButton icon={<FiCopy />} size="sm" variant="ghost" onClick={handleCopy} />
          </Tooltip>

          {/* Discard */}
          {hasChanges && (
            <Tooltip label="Discard changes">
              <IconButton icon={<FiX />} size="sm" variant="ghost" colorScheme="red" onClick={handleDiscard} />
            </Tooltip>
          )}
        </HStack>
      </Box>

      {/* Search Bar */}
      <Box px={3} py={2} borderBottom="1px solid" borderColor={borderColor}>
        <InputGroup size="sm">
          <InputLeftElement><FiSearch color="gray" /></InputLeftElement>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fontSize="sm"
          />
        </InputGroup>
        {searchMatches > 0 && (
          <Text fontSize="xs" color="gray.500" mt={1}>{searchMatches} matches</Text>
        )}
      </Box>

      {/* Find & Replace (edit mode only) */}
      {isEditing && (
        <Box px={3} py={2} borderBottom="1px solid" borderColor={borderColor} bg={toolbarBg}>
          <VStack spacing={2} align="stretch">
            <HStack>
              <Input size="sm" placeholder="Find" value={findText} onChange={(e) => setFindText(e.target.value)} />
              <Input size="sm" placeholder="Replace" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} />
            </HStack>
            <HStack>
              <Button size="xs" onClick={handleReplaceSingle}>Replace</Button>
              <Button size="xs" onClick={handleReplaceAll}>Replace All</Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Content Area */}
      <Box flex="1" overflow="auto" p={3}>
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={editedText}
            onChange={handleTextChange}
            h="100%"
            minH="300px"
            fontFamily="mono"
            fontSize="sm"
            resize="none"
            border="none"
            _focus={{ boxShadow: 'none' }}
          />
        ) : (
          <Box fontSize="sm" whiteSpace="pre-wrap" fontFamily="mono" color={textColor}>
            {searchTerm.trim() ? highlightText(editedText) : editedText}
          </Box>
        )}
      </Box>

      {/* Status Bar */}
      <Box px={3} py={1} borderTop="1px solid" borderColor={borderColor} bg={toolbarBg}>
        <HStack justify="space-between" fontSize="xs" color="gray.500">
          <Text>{editedText.length} chars</Text>
          <Text>{editedText.split(/\s+/).filter(w => w).length} words</Text>
          <Text>{changesCount} edits</Text>
        </HStack>
      </Box>

      {/* History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit History</ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="400px" overflowY="auto">
            <VStack align="stretch" spacing={2}>
              <Button size="sm" colorScheme="orange" variant="outline" onClick={handleRevertToOriginal}>
                Revert to Original
              </Button>
              {editHistory.length === 0 ? (
                <Text color="gray.500" textAlign="center">No edits yet</Text>
              ) : (
                editHistory.map((change, i) => (
                  <HStack key={i} p={2} bg={toolbarBg} borderRadius="md" justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="medium">{change.summary || change.instruction}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(change.timestamp).toLocaleString()}
                      </Text>
                    </VStack>
                    <Button size="xs" onClick={() => handleRevert(i)}>Revert</Button>
                  </HStack>
                ))
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" onClick={onHistoryClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Design Suggestion Modal */}
      <DesignSuggestionModal
        isOpen={isDesignSuggestionOpen}
        onClose={() => setIsDesignSuggestionOpen(false)}
        onDownload={executeDownload}
        documentTitle={fileName}
        documentContent={editedText?.substring(0, 500) || ''}
        requestedFormat={pendingDownloadFormat || 'docx'}
      />

      {/* Template Variables Modal */}
      <Modal isOpen={isVariablesOpen} onClose={onVariablesClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Template Variables</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              {templateVariables.map((v, i) => (
                <HStack key={i}>
                  <Badge colorScheme={v.filled ? 'green' : 'gray'}>{v.pattern}</Badge>
                  <Input
                    size="sm"
                    placeholder={`Enter ${v.name}`}
                    defaultValue={v.value}
                    onBlur={(e) => {
                      if (e.target.value && e.target.value !== v.value) {
                        handleFillVariable(v.name, e.target.value);
                      }
                    }}
                  />
                </HStack>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" onClick={onVariablesClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DocumentViewer;
