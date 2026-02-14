/**
 * AIHelperPanel - Interactive AI chat about the document (Harvey-style)
 * Context-aware: sends document text + selected text to AI
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Input, IconButton, Tooltip, Icon,
  useColorModeValue, Divider, Spinner, Wrap, WrapItem, Button,
  Avatar
} from '@chakra-ui/react';
import { FaPaperPlane, FaRobot, FaUser, FaMagic } from 'react-icons/fa';
import { MdAutoFixHigh, MdSearch, MdWarning, MdFormatQuote, MdShortText } from 'react-icons/md';
import fileService from '../services/fileService';

const QUICK_ACTIONS = [
  { label: 'Explain this clause', icon: MdFormatQuote, prompt: 'Explain the selected text/clause in simple terms.' },
  { label: 'Find risks', icon: MdWarning, prompt: 'What are the legal risks or issues in this document?' },
  { label: 'Suggest improvements', icon: MdAutoFixHigh, prompt: 'Suggest improvements for the document text.' },
  { label: 'Make formal', icon: MdShortText, prompt: 'Rewrite the selected text in more formal legal language.' },
  { label: 'Simplify', icon: MdSearch, prompt: 'Rewrite the selected text in simpler, easier to understand language.' },
];

const AIHelperPanel = ({ selectedText, documentType, language = 'en' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const userBubbleBg = useColorModeValue('blue.50', 'blue.900');
  const aiBubbleBg = useColorModeValue('gray.50', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fileService.aiChatAboutDocument(
        text,
        selectedText || '',
        chatHistory,
        language
      );

      const aiMsg = {
        role: 'assistant',
        content: response.response || 'I could not generate a response.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
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
    const contextPrompt = selectedText 
      ? `${prompt}\n\nSelected text: "${selectedText}"` 
      : prompt;
    sendMessage(contextPrompt);
  };

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Header */}
      <Box px={3} py={3} borderBottom="1px solid" borderColor={borderColor}>
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

      {/* Quick Actions - sticky section */}
      <Box px={2} py={2} borderBottom="1px solid" borderColor={borderColor} flexShrink={0} position="sticky" top={0} zIndex={1} bg={bgColor}>
        <Wrap spacing={1}>
          {QUICK_ACTIONS.map((action, idx) => (
            <WrapItem key={idx}>
              <Button
                size="xs"
                variant="outline"
                leftIcon={<Icon as={action.icon} boxSize={3} />}
                fontSize="2xs"
                onClick={() => handleQuickAction(action.prompt)}
                isDisabled={isLoading}
                borderRadius="full"
              >
                {action.label}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
        {selectedText && (
          <Box mt={1.5} p={1.5} bg="blue.50" borderRadius="sm" borderLeft="2px solid" borderLeftColor="blue.400">
            <Text fontSize="2xs" color="blue.600" fontWeight="bold">Selected text:</Text>
            <Text fontSize="2xs" color="blue.700" noOfLines={2}>{selectedText}</Text>
          </Box>
        )}
      </Box>

      {/* Messages */}
      <Box flex="1" overflowY="auto" px={2} py={2}>
        {messages.length === 0 && (
          <Box textAlign="center" py={8} color={mutedColor}>
            <Icon as={FaMagic} boxSize={8} mb={3} opacity={0.3} />
            <Text fontSize="sm" fontWeight="500">Ask me anything about your document</Text>
            <Text fontSize="xs" mt={1}>I can explain clauses, find risks, suggest edits, and more.</Text>
          </Box>
        )}

        <VStack spacing={3} align="stretch">
          {messages.map((msg, idx) => (
            <HStack
              key={idx}
              align="start"
              spacing={2}
              flexDir={msg.role === 'user' ? 'row-reverse' : 'row'}
            >
              <Avatar
                size="xs"
                icon={msg.role === 'user' ? <FaUser /> : <FaRobot />}
                bg={msg.role === 'user' ? 'blue.400' : 'purple.400'}
                color="white"
                mt={0.5}
              />
              <Box
                bg={msg.role === 'user' ? userBubbleBg : aiBubbleBg}
                px={3}
                py={2}
                borderRadius="lg"
                maxW="85%"
                border={msg.isError ? '1px solid' : 'none'}
                borderColor={msg.isError ? 'red.300' : 'transparent'}
              >
                <Text fontSize="xs" whiteSpace="pre-wrap" color={textColor}>
                  {msg.content}
                </Text>
              </Box>
            </HStack>
          ))}
          
          {isLoading && (
            <HStack align="start" spacing={2}>
              <Avatar size="xs" icon={<FaRobot />} bg="purple.400" color="white" mt={0.5} />
              <Box bg={aiBubbleBg} px={3} py={2} borderRadius="lg">
                <HStack spacing={2}>
                  <Spinner size="xs" color="purple.400" />
                  <Text fontSize="xs" color={mutedColor}>Thinking...</Text>
                </HStack>
              </Box>
            </HStack>
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Input */}
      <Box px={2} py={2} borderTop="1px solid" borderColor={borderColor}>
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
};

export default AIHelperPanel;
