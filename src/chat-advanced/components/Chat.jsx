import { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  useToast,
  IconButton,
  Flex,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { AttachmentIcon, DeleteIcon, HamburgerIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../AuthBridge';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get('/api/chat/history');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch chat history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { message: input });
      const payload = response.data || {};
      const content = payload.missingFields
        ? { text: payload.response, missingFields: payload.missingFields }
        : payload.response || '';
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await axios.delete('/api/chat/clear');
      setMessages([]);
      toast({
        title: 'Success',
        description: 'Chat history cleared',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear chat history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  if (!user) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="xl">Please log in to use the chat</Text>
      </Box>
    );
  }

  return (
    <Box h="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Box p={4} borderBottom="1px" borderColor="gray.200" bg="white" shadow="sm">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">Chat with Gemini AI</Text>
          <IconButton
            icon={<DeleteIcon />}
            colorScheme="red"
            variant="ghost"
            onClick={clearChat}
            aria-label="Clear chat"
          />
        </HStack>
      </Box>

      <Box flex={1} overflowY="auto" p={4}>
        {historyLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" h="100%">
            <Spinner size="xl" />
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {messages.map((message, index) => (
              <HStack
                key={index}
                alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
                maxW="80%"
              >
                {message.role === 'assistant' && (
                  <Avatar
                    name="AI Assistant"
                    src="https://bit.ly/broken-link"
                    size="sm"
                  />
                )}
                <Box
                  bg={message.role === 'user' ? 'blue.500' : 'white'}
                  color={message.role === 'user' ? 'white' : 'black'}
                  p={3}
                  borderRadius="lg"
                  maxW="100%"
                  shadow="sm"
                >
                  {typeof message.content === 'string' && (
                    <Box>
                      <ReactMarkdown
                        components={{
                          strong: ({ children }) => (
                            <Text as="span" fontWeight="bold" color={message.role === 'user' ? 'white' : 'blue.600'}>
                              {children}
                            </Text>
                          ),
                          p: ({ children }) => (
                            <Text mb={1} lineHeight="1.5">
                              {children}
                            </Text>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </Box>
                  )}

                  {message.content && typeof message.content === 'object' && message.content.missingFields && (
                    <>
                      <Text>{message.content.text}</Text>
                      <Box mt={2}>
                        {message.content.missingFields.map((f, i) => (
                          <Text key={f.key || i} fontSize="sm" color="gray.600">
                            {`${i + 1}. ${f.label || f.key}`}
                          </Text>
                        ))}
                      </Box>
                    </>
                  )}

                  {message.content && typeof message.content === 'object' && !message.content.missingFields && (
                    <Text>{message.content.text || JSON.stringify(message.content)}</Text>
                  )}
                </Box>
                {message.role === 'user' && (
                  <Avatar
                    name={user.displayName}
                    src={user.photoURL}
                    size="sm"
                  />
                )}
              </HStack>
            ))}
            {loading && (
              <HStack alignSelf="flex-start">
                <Avatar
                  name="AI Assistant"
                  src="https://bit.ly/broken-link"
                  size="sm"
                />
                <Box bg="white" p={3} borderRadius="lg" shadow="sm">
                  <HStack>
                    <Spinner size="sm" />
                    <Text>Thinking...</Text>
                  </HStack>
                </Box>
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      <Box p={4} borderTop="1px" borderColor="gray.200" bg="white" shadow="sm">
        <form onSubmit={handleSubmit}>
          <HStack>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              size="lg"
              bg="white"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept="image/*"
            />
            <IconButton
              icon={<AttachmentIcon />}
              onClick={() => fileInputRef.current.click()}
              mr={2}
              aria-label="Attach file"
            />
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="Sending..."
              size="lg"
            >
              Send
            </Button>
          </HStack>
        </form>
        {selectedFile && (
          <Text fontSize="sm" mt={2} color="gray.500">
            Selected: {selectedFile.name}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default Chat; 