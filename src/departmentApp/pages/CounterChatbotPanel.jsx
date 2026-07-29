import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Input, IconButton, Avatar, Spinner,
  useColorModeValue, keyframes, Tooltip, Icon
} from '@chakra-ui/react';
import { FiSend, FiZap, FiCheckCircle } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import { chatEditCounterAffidavit } from '../services/fileService';

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 10px rgba(138, 43, 226, 0.4); }
  50% { box-shadow: 0 0 20px rgba(138, 43, 226, 0.8); }
  100% { box-shadow: 0 0 10px rgba(138, 43, 226, 0.4); }
`;

const CounterChatbotPanel = ({ result, onPatch }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI drafting assistant. What would you like to change in the document?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  // Premium Dark "Turbo" Theme Colors
  const bg = useColorModeValue('gray.900', 'gray.900');
  const border = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');
  const userBubbleBg = 'linear-gradient(135deg, #6B46C1, #805AD5)';
  const aiBubbleBg = 'whiteAlpha.100';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatEditCounterAffidavit(result, userMsg);
      if (response && response.updatedData) {
        onPatch(response.updatedData);
        setMessages(prev => [...prev, { role: 'assistant', content: "I have updated the document as requested!" }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't process that request properly. Please try again." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error while trying to update the document." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="full"
      w="full"
      bg={bg}
      color="white"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      boxShadow="inset 0 0 40px rgba(0,0,0,0.5)"
    >
      {/* Turbo Mode Grid Overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.05"
        pointerEvents="none"
        backgroundImage="linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)"
        backgroundSize="20px 20px"
      />
      
      {/* Header */}
      <Flex p={4} borderBottom="1px solid" borderColor={border} align="center" justify="space-between" bg="blackAlpha.300" backdropFilter="blur(10px)">
        <HStack>
          <Icon as={FiZap} color="yellow.400" />
          <Text fontWeight="bold" fontSize="sm" letterSpacing="widest" textTransform="uppercase">Turbo Editor</Text>
        </HStack>
        <Tooltip label="Changes made here update the active document instantly.">
          <IconButton icon={<MdAutoAwesome />} variant="ghost" size="sm" colorScheme="purple" borderRadius="full" aria-label="Info" />
        </Tooltip>
      </Flex>

      {/* Chat Area */}
      <VStack flex={1} overflowY="auto" p={4} spacing={4} align="stretch"
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(128,90,213,0.3)', borderRadius: '2px' },
        }}
      >
        {messages.map((m, i) => (
          <Flex key={i} justify={m.role === 'user' ? 'flex-end' : 'flex-start'} w="full">
            <HStack align="end" maxW="85%" spacing={2} flexDir={m.role === 'user' ? 'row-reverse' : 'row'}>
              <Avatar size="sm" bg={m.role === 'user' ? 'purple.500' : 'gray.700'} icon={m.role === 'assistant' ? <MdAutoAwesome /> : undefined} />
              <Box
                p={3}
                bg={m.role === 'user' ? userBubbleBg : aiBubbleBg}
                color="white"
                borderRadius="2xl"
                borderBottomRightRadius={m.role === 'user' ? 'sm' : '2xl'}
                borderBottomLeftRadius={m.role === 'assistant' ? 'sm' : '2xl'}
                border="1px solid"
                borderColor={border}
                backdropFilter="blur(10px)"
                boxShadow="lg"
                fontSize="sm"
              >
                {m.content}
              </Box>
            </HStack>
          </Flex>
        ))}
        {isTyping && (
          <Flex justify="flex-start" w="full">
            <HStack align="end" maxW="85%" spacing={2}>
              <Avatar size="sm" bg="gray.700" icon={<MdAutoAwesome />} />
              <Box
                p={3}
                bg={aiBubbleBg}
                borderRadius="2xl"
                borderBottomLeftRadius="sm"
                border="1px solid"
                borderColor={border}
                backdropFilter="blur(10px)"
                animation={`${pulseGlow} 1.5s infinite`}
              >
                <Spinner size="xs" color="purple.400" />
              </Box>
            </HStack>
          </Flex>
        )}
        <div ref={endRef} />
      </VStack>

      {/* Input Area */}
      <Box p={4} borderTop="1px solid" borderColor={border} bg="blackAlpha.300" backdropFilter="blur(10px)">
        <HStack>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Instruct the AI to make changes..."
            variant="filled"
            bg="whiteAlpha.100"
            _hover={{ bg: 'whiteAlpha.200' }}
            _focus={{ bg: 'whiteAlpha.200', borderColor: 'purple.400' }}
            color="white"
            borderRadius="full"
            border="1px solid"
            borderColor="transparent"
            isDisabled={isTyping}
          />
          <IconButton
            icon={<FiSend />}
            onClick={handleSend}
            colorScheme="purple"
            borderRadius="full"
            isLoading={isTyping}
            aria-label="Send"
          />
        </HStack>
      </Box>
    </Box>
  );
};

export default CounterChatbotPanel;
