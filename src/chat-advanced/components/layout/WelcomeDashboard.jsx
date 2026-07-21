import React from 'react';
import {
  VStack, Box, Icon, Heading, Text, useColorModeValue
} from '@chakra-ui/react';
import { FiCpu } from 'react-icons/fi';

const WelcomeDashboard = () => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.45)', 'rgba(13, 17, 23, 0.25)');
  const cardBorder = useColorModeValue('rgba(212, 175, 55, 0.18)', 'rgba(212, 175, 55, 0.12)');
  const cv_white_rgba_13_17_23_0_8 = useColorModeValue('white', 'rgba(13, 17, 23, 0.8)');
  const cv_gray_600_gray_300 = useColorModeValue('gray.600', 'gray.300');

  return (
    <VStack
      spacing={8}
      py={12}
      px={8}
      align="center"
      justify="center"
      w="full"
      maxW="650px"
      mx="auto"
      my="auto"
      borderRadius="2xl"
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      backdropFilter="blur(24px)"
      boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.12)"
      position="relative"
      overflow="hidden"
    >
      {/* Glow overlay under the card */}
      <Box
        position="absolute"
        top="-50%"
        left="-50%"
        w="200%"
        h="200%"
        bg="radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, rgba(212, 175, 55, 0) 70%)"
        pointerEvents="none"
        zIndex={0}
      />

      <VStack spacing={5} align="center" zIndex={1}>
        {/* Glowing Logo */}
        <Box
          p={5}
          borderRadius="full"
          bg={cv_white_rgba_13_17_23_0_8}
          border="2.5px solid"
          borderColor="judicial.gold"
          boxShadow="0 0 28px rgba(212, 175, 55, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.06)"
          position="relative"
          transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          _hover={{
            transform: 'scale(1.1) rotate(15deg)',
            boxShadow: '0 0 40px rgba(212, 175, 55, 0.65)'
          }}
        >
          <Icon as={FiCpu} w={10} h={10} color="judicial.gold" />
        </Box>

        <VStack spacing={3} textAlign="center">
          <Heading
            size="lg"
            fontWeight="black"
            bgGradient="linear(to-r, #D4AF37, #F5D76E, #D4AF37)"
            bgClip="text"
            letterSpacing="-0.5px"
            fontSize="2xl"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            Dastavez AI Workspace
          </Heading>
          <Text
            color={cv_gray_600_gray_300}
            fontSize="xs"
            maxW="480px"
            fontWeight="medium"
            lineHeight="1.75"
            fontFamily="'Inter', sans-serif"
          >
            Your secure, intelligent legal co-pilot. Start by asking a question, uploading a document, or choosing a workspace tool.
          </Text>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default WelcomeDashboard;
