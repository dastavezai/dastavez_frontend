import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  Box, VStack, HStack, Text, Input, IconButton, Tooltip, Icon,
  useColorModeValue, Spinner, Wrap, WrapItem, Button,
  Avatar, Badge, useToast
} from '@chakra-ui/react';
import { FaPaperPlane, FaRobot, FaUser, FaMagic, FaCheckCircle } from 'react-icons/fa';
import { MdAutoFixHigh, MdSearch, MdWarning, MdFormatQuote, MdShortText, MdEdit } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import fileService from '../services/fileService';

const QUICK_ACTIONS = [
  { label: 'Explain this clause', icon: MdFormatQuote, prompt: 'Explain the selected text/clause in simple terms.' },
  { label: 'Find risks', icon: MdWarning, prompt: 'What are the legal risks or issues in this document?' },
  { label: 'Suggest improvements', icon: MdAutoFixHigh, prompt: 'Suggest improvements for the document text. For each suggestion, format as:\n**Original:** "exact original text"\n**Suggested:** "improved text"\n**Reason:** brief explanation' },
  { label: 'Make formal', icon: MdShortText, prompt: 'Rewrite the selected text in more formal legal language. Format as:\n**Original:** "exact original text"\n**Suggested:** "formal version"\n**Reason:** brief explanation' },
  { label: 'Simplify', icon: MdSearch, prompt: 'Rewrite the selected text in simpler, easier to understand language. Format as:\n**Original:** "exact original text"\n**Suggested:** "simplified version"\n**Reason:** brief explanation' },
];

function parseInlineSuggestions(content) {
  const suggestions = [];
  const regex = /\*\*Original:\*\*\s*["\u201C\u201D]?([^"\u201C\u201D\n]+(?:\n(?!\*\*Suggested)[^"\u201C\u201D\n]+)*)["\u201C\u201D]?\s*\n?\s*\*\*Suggested:\*\*\s*["\u201C\u201D]?([^"\u201C\u201D\n]+(?:\n(?!\*\*Reason)[^"\u201C\u201D\n]+)*)["\u201C\u201D]?/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    suggestions.push({
      id: `inline_${suggestions.length}_${Date.now()}`,
      originalText: match[1].trim(),
      suggestedText: match[2].trim(),
    });
  }
  return suggestions;
}

const InlineSuggestionCard = ({ suggestion, onApply, isApplied }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('blue.200', 'blue.600');

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      p={2}
      my={1.5}
      opacity={isApplied ? 0.6 : 1}
      transition="all 0.2s"
    >
      <VStack spacing={1.5} align="stretch">
        <Box bg={useColorModeValue('red.50', 'red.900')} px={2} py={1} borderRadius="sm" borderLeft="2px solid" borderLeftColor="red.400">
          <Text fontSize="2xs" fontWeight="bold" color="red.500" mb={0.5}>Original:</Text>
          <Text fontSize="xs" color={useColorModeValue('red.700', 'red.200')}>{suggestion.originalText}</Text>
        </Box>
        <Box bg={useColorModeValue('green.50', 'green.900')} px={2} py={1} borderRadius="sm" borderLeft="2px solid" borderLeftColor="green.400">
          <Text fontSize="2xs" fontWeight="bold" color="green.500" mb={0.5}>Suggested:</Text>
          <Text fontSize="xs" color={useColorModeValue('green.700', 'green.200')}>{suggestion.suggestedText}</Text>
        </Box>
        <HStack spacing={1} justify="flex-end">
          {isApplied ? (
            <Badge colorScheme="green" fontSize="2xs" variant="subtle">
              <HStack spacing={1}><Icon as={FaCheckCircle} boxSize={2.5} /><Text>Applied</Text></HStack>
            </Badge>
          ) : (
            <Button
              size="xs"
              colorScheme="green"
              variant="solid"
              leftIcon={<Icon as={MdEdit} boxSize={3} />}
              fontSize="2xs"
              h="22px"
              onClick={() => onApply(suggestion)}
              _hover={{ transform: 'scale(1.02)' }}
            >
              Apply Edit
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

const AIHelperPanel = forwardRef(({ selectedText, documentType, language = 'en', editor }, ref) => {
  
  useImperativeHandle(ref, () => ({
    addContext: (contextText) => {
      setInputValue(prev => {
        const ctx = `Regarding: "${contextText}"`;
        return prev ? `${prev}\n\n${ctx}` : ctx;
      });
      setTimeout(() => inputRef.current?.focus(), 150);
    },
  }), []);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const userBubbleBg = useColorModeValue('blue.50', 'blue.900');
  const aiBubbleBg = useColorModeValue('gray.50', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  const codeBg = useColorModeValue('gray.100', 'gray.600');
  const scrollTrackColor = useColorModeValue('#f0f0f0', '#2d3748');
  const scrollThumbColor = useColorModeValue('#b0b0b0', '#4a5568');
  const scrollThumbHover = useColorModeValue('#888', '#718096');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findRangeInEditor = useCallback((searchText) => {
    if (!editor || !searchText) return null;
    const segments = [];
    let fullText = '';

    editor.state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text) return;
      const start = fullText.length;
      fullText += node.text;
      segments.push({ start, end: fullText.length, pos, text: node.text });
    });

    const normalizeWithMap = (str) => {
      let normalized = '';
      const map = [];
      let prevSpace = false;
      for (let i = 0; i < str.length; i += 1) {
        const ch = str[i];
        const isSpace = /\s/.test(ch);
        if (isSpace) {
          if (!prevSpace) {
            normalized += ' ';
            map.push(i);
            prevSpace = true;
          }
        } else {
          normalized += ch.toLowerCase();
          map.push(i);
          prevSpace = false;
        }
      }
      return { normalized: normalized.trim(), map };
    };

    let startIndex = fullText.indexOf(searchText);
    let endIndex = startIndex >= 0 ? startIndex + searchText.length : -1;

    if (startIndex < 0) {
      const source = normalizeWithMap(fullText);
      const target = normalizeWithMap(searchText);
      const normIdx = source.normalized.indexOf(target.normalized);
      if (normIdx >= 0) {
        const sourceMap = source.map;
        startIndex = sourceMap[normIdx] ?? -1;
        endIndex = sourceMap[normIdx + target.normalized.length - 1] + 1;
      }
    }

    if (startIndex < 0 || endIndex <= startIndex) return null;

    const indexToPos = (idx) => {
      const seg = segments.find((s) => idx >= s.start && idx <= s.end);
      if (!seg) return null;
      return seg.pos + Math.max(0, Math.min(idx - seg.start, seg.text.length));
    };

    const from = indexToPos(startIndex);
    const to = indexToPos(endIndex);
    if (typeof from !== 'number' || typeof to !== 'number' || to <= from) return null;
    return { from, to };
  }, [editor]);

  const handleApplyInlineSuggestion = useCallback((suggestion) => {
    if (!editor) {
      toast({ title: 'Editor not ready', status: 'warning', duration: 2000 });
      return;
    }

    const range = findRangeInEditor(suggestion.originalText);
    if (!range) {
      toast({
        title: 'Text not found in editor',
        description: 'The exact original text could not be located. Try selecting the text manually and editing it.',
        status: 'warning',
        duration: 4000,
      });
      return;
    }

    editor.chain().focus()
      .insertContentAt({ from: range.from, to: range.to }, suggestion.suggestedText)
      .setTextSelection({ from: range.from, to: range.from + suggestion.suggestedText.length })
      .toggleHighlight({ color: '#a7f3d0' })
      .run();

    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    toast({ title: 'Edit applied', description: 'Change highlighted in green', status: 'success', duration: 2000 });
  }, [editor, findRangeInEditor, toast]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistory = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const response = await fileService.aiChatAboutDocument(text, selectedText || '', chatHistory, language);
      const aiContent = response.response || 'I could not generate a response.';
      const inlineSuggestions = parseInlineSuggestions(aiContent);
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent, timestamp: Date.now(), inlineSuggestions }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: Date.now(), isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleQuickAction = (prompt) => {
    const contextPrompt = selectedText ? `${prompt}\n\nSelected text: "${selectedText}"` : prompt;
    sendMessage(contextPrompt);
  };

  return (
    <Box h="100%" minH="0" display="flex" flexDirection="column" overflow="hidden">
      <Box px={3} py={2} borderBottom="1px solid" borderColor={borderColor} flexShrink={0}>
        <HStack spacing={2}>
          <Icon as={FaRobot} color="purple.400" boxSize={5} />
          <Text fontWeight="bold" fontSize="sm">LAW AI Helper</Text>
        </HStack>
        {documentType && (
          <Text fontSize="2xs" color={mutedColor} mt={0.5}>
            Analyzing: {typeof documentType === 'string' ? documentType : documentType?.type || 'Document'}
          </Text>
        )}
      </Box>

      <Box px={2} py={2} borderBottom="1px solid" borderColor={borderColor} flexShrink={0} bg={bgColor}>
        <Wrap spacing={1}>
          {QUICK_ACTIONS.map((action, idx) => (
            <WrapItem key={idx}>
              <Tooltip label={action.prompt.split('\n')[0]} fontSize="xs" placement="bottom">
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<Icon as={action.icon} boxSize={3} />}
                  fontSize="2xs"
                  onClick={() => handleQuickAction(action.prompt)}
                  isDisabled={isLoading}
                  borderRadius="full"
                  _hover={{ bg: useColorModeValue('purple.50', 'purple.900'), borderColor: 'purple.300' }}
                >
                  {action.label}
                </Button>
              </Tooltip>
            </WrapItem>
          ))}
        </Wrap>
        {selectedText && (
          <Box mt={1.5} p={1.5} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="sm" borderLeft="2px solid" borderLeftColor="blue.400">
            <Text fontSize="2xs" color="blue.600" fontWeight="bold">Selected text:</Text>
            <Text fontSize="2xs" color={useColorModeValue('blue.700', 'blue.200')} noOfLines={2}>{selectedText}</Text>
          </Box>
        )}
      </Box>

      <Box
        ref={messagesContainerRef}
        flex="1"
        minH="0"
        overflowY="auto"
        overflowX="hidden"
        px={2}
        py={2}
        sx={{
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: scrollTrackColor, borderRadius: '10px' },
          '&::-webkit-scrollbar-thumb': {
            background: scrollThumbColor,
            borderRadius: '10px',
            border: '2px solid transparent',
            backgroundClip: 'content-box',
            minHeight: '50px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: scrollThumbHover,
            borderRadius: '10px',
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: `${scrollThumbColor} ${scrollTrackColor}`,
        }}
      >
        {messages.length === 0 && (
          <Box textAlign="center" py={8} color={mutedColor}>
            <Icon as={FaMagic} boxSize={8} mb={3} opacity={0.3} />
            <Text fontSize="sm" fontWeight="500">Ask me anything about your document</Text>
            <Text fontSize="xs" mt={1}>I can explain clauses, find risks, suggest edits, and more.</Text>
            <Text fontSize="2xs" mt={2} color="purple.400">
              Tip: Select text in the editor, then use the buttons above for context-aware help
            </Text>
          </Box>
        )}

        <VStack spacing={3} align="stretch">
          {messages.map((msg, idx) => (
            <HStack key={idx} align="start" spacing={2} flexDir={msg.role === 'user' ? 'row-reverse' : 'row'}>
              <Avatar
                size="xs"
                icon={msg.role === 'user' ? <FaUser /> : <FaRobot />}
                bg={msg.role === 'user' ? 'blue.400' : 'purple.400'}
                color="white"
                mt={0.5}
              />
              <Box
                bg={msg.role === 'user' ? userBubbleBg : aiBubbleBg}
                px={3} py={2} borderRadius="lg" maxW="90%"
                border={msg.isError ? '1px solid' : 'none'}
                borderColor={msg.isError ? 'red.300' : 'transparent'}
              >
                {msg.role === 'assistant' && !msg.isError ? (
                  <Box fontSize="xs" color={textColor}>
                    <Box sx={{
                      '& p': { marginBottom: '0.5em' },
                      '& p:last-child': { marginBottom: 0 },
                      '& ul, & ol': { marginLeft: '1.2em', marginBottom: '0.5em' },
                      '& li': { marginBottom: '0.25em' },
                      '& strong': { fontWeight: 'bold' },
                      '& em': { fontStyle: 'italic' },
                      '& code': { bg: codeBg, px: '0.2em', py: '0.1em', borderRadius: 'sm', fontSize: '0.9em' },
                      '& blockquote': { borderLeft: '2px solid', borderLeftColor: 'gray.300', pl: 2, ml: 0, my: 1, fontStyle: 'italic', opacity: 0.9 },
                      '& h1, & h2, & h3': { fontWeight: 'bold', mt: 1, mb: 0.5 },
                    }}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </Box>

                    {msg.inlineSuggestions && msg.inlineSuggestions.length > 0 && (
                      <Box mt={2} pt={2} borderTop="1px dashed" borderTopColor={borderColor}>
                        <HStack mb={1.5} spacing={1}>
                          <Icon as={MdEdit} boxSize={3} color="green.400" />
                          <Text fontSize="2xs" fontWeight="bold" color="green.500">
                            {msg.inlineSuggestions.length} Quick Edit{msg.inlineSuggestions.length > 1 ? 's' : ''} Available
                          </Text>
                        </HStack>
                        {msg.inlineSuggestions.map((sug) => (
                          <InlineSuggestionCard
                            key={sug.id}
                            suggestion={sug}
                            onApply={handleApplyInlineSuggestion}
                            isApplied={appliedSuggestions.has(sug.id)}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Text fontSize="xs" whiteSpace="pre-wrap" color={textColor}>{msg.content}</Text>
                )}
              </Box>
            </HStack>
          ))}

          {isLoading && (
            <HStack align="start" spacing={2}>
              <Avatar size="xs" icon={<FaRobot />} bg="purple.400" color="white" mt={0.5} />
              <Box bg={aiBubbleBg} px={3} py={2} borderRadius="lg">
                <HStack spacing={2}><Spinner size="xs" color="purple.400" /><Text fontSize="xs" color={mutedColor}>Thinking...</Text></HStack>
              </Box>
            </HStack>
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      <Box px={2} py={2} borderTop="1px solid" borderColor={borderColor} flexShrink={0} bg={bgColor}>
        <HStack spacing={2}>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your document..."
            size="sm"
            bg={inputBg}
            borderRadius="full"
            fontSize="xs"
            isDisabled={isLoading}
          />
          <IconButton
            icon={<FaPaperPlane />}
            size="sm"
            colorScheme="purple"
            borderRadius="full"
            aria-label="Send"
            onClick={() => sendMessage(inputValue)}
            isLoading={isLoading}
            isDisabled={!inputValue.trim()}
          />
        </HStack>
      </Box>
    </Box>
  );
});

AIHelperPanel.displayName = 'AIHelperPanel';

export default AIHelperPanel;
