import React, { useState, useEffect } from 'react';
import { Box, HStack, VStack, Text, Icon, useColorModeValue, keyframes } from '@chakra-ui/react';
import { FiCpu } from 'react-icons/fi';

// Pulse animation for avatar
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 16px rgba(212, 175, 55, 0.35); }
  50% { transform: scale(1.08); box-shadow: 0 0 28px rgba(212, 175, 55, 0.65); }
  100% { transform: scale(1); box-shadow: 0 0 16px rgba(212, 175, 55, 0.35); }
`;

// Shimmer gradient animation for Gemini-style thinking text
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const ThinkingIndicator = ({ userMessage = "", hasActiveFile = false }) => {
  const bgColor = useColorModeValue('white', 'rgba(13, 17, 23, 0.45)');
  const borderColor = useColorModeValue('gray.200', 'rgba(212, 175, 55, 0.18)');

  const [step, setStep] = useState(0);

  // Check if it's a simple query
  const words = userMessage.trim().split(/\s+/);
  const isSimple = words.length <= 5 && !hasActiveFile;

  useEffect(() => {
    if (isSimple) return;

    const timer1 = setTimeout(() => setStep(1), 2000);
    const timer2 = setTimeout(() => setStep(2), 4000);
    const timer3 = setTimeout(() => setStep(3), 6500);
    const timer4 = setTimeout(() => setStep(4), 9000);
    const timer5 = setTimeout(() => setStep(5), 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [isSimple]);

  const getThinkingText = () => {
    if (isSimple) return 'Generating response...';
    
    switch (step) {
      case 0: return 'Understanding legal query...';
      case 1: return 'Retrieving document context & background...';
      case 2: return 'Searching case precedents & local regulations...';
      case 3: return 'Connecting the dots & synthesizing reasoning...';
      case 4: return 'Formulating professional advice...';
      case 5:
      default: return 'Generating final text...';
    }
  };

  const gradientText = useColorModeValue(
    'linear-gradient(90deg, #1A202C 0%, #D4AF37 50%, #1A202C 100%)',
    'linear-gradient(90deg, #CBD5E0 0%, #D4AF37 50%, #CBD5E0 100%)'
  );

  return (
    <HStack alignSelf="flex-start" spacing={2.5} maxW="72%" align="start" mt={2}>
      {/* Animated CPU Avatar */}
      <Box
        p={2.5}
        borderRadius="full"
        bg="rgba(212, 175, 55, 0.22)"
        border="1.5px solid"
        borderColor="judicial.gold"
        color="judicial.gold"
        animation={`${pulse} 2s infinite ease-in-out`}
        mt={1}
      >
        <Icon as={FiCpu} w={5} h={5} />
      </Box>

      {/* Bubble Container */}
      <Box
        bg={bgColor}
        p={4}
        borderRadius="xl"
        borderWidth="1px"
        borderLeft="2.5px solid"
        borderLeftColor="judicial.gold"
        borderColor={borderColor}
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
        backdropFilter="blur(16px)"
        minW="220px"
      >
        <VStack align="start" spacing={2}>
          {/* Shimmering Gemini Text */}
          <Text
            fontSize="sm"
            fontWeight="bold"
            letterSpacing="0.02em"
            bgImage={gradientText}
            bgSize="200% auto"
            bgClip="text"
            fill="transparent"
            animation={`${shimmer} 3s infinite linear`}
            transition="all 0.3s ease"
          >
            {getThinkingText()}
          </Text>

          {/* Micro dots loader indicator */}
          <HStack spacing={1.5} pl={1} pt={1}>
            {[0, 1, 2].map((i) => {
              const pulseDot = keyframes`
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
              `;
              return (
                <Box
                  key={i}
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg="judicial.gold"
                  animation={`${pulseDot} 1.2s infinite ease-in-out`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              );
            })}
          </HStack>
        </VStack>
      </Box>
    </HStack>
  );
};

export default ThinkingIndicator;
