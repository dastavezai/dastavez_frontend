import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Button,
  Text,
  Icon,
  useColorModeValue,
  Divider,
  Tooltip,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FaRedo, FaExchangeAlt, FaRobot, FaCheckCircle } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

/**
 * PostDownloadOptions - Shows options after successful document generation
 * 
 * Props:
 * - onGenerateSame: function - Generate the same document type again
 * - onGenerateDifferent: function - Switch to different document type
 * - onExitDocumentMode: function - Exit document generation, return to auto-detect
 * - templateTitle: string - The title of the just-generated document
 * - language: 'en' | 'hi' - UI language preference
 * - show: boolean - Whether to show the component
 */
const PostDownloadOptions = ({
  onGenerateSame,
  onGenerateDifferent,
  onExitDocumentMode,
  templateTitle,
  language = 'en',
  show = true,
}) => {
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const successColor = useColorModeValue('green.500', 'green.300');

  if (!show) return null;

  // Translations
  const t = {
    en: {
      success: 'Document generated successfully!',
      whatNext: 'What would you like to do next?',
      generateSame: 'Generate Same Again',
      generateSameDesc: 'Create another document of the same type',
      generateDifferent: 'Different Document',
      generateDifferentDesc: 'Switch to a different document type',
      exitMode: 'Exit & Auto-Detect',
      exitModeDesc: 'Return to normal chat with AI intent detection',
    },
    hi: {
      success: 'दस्तावेज़ सफलतापूर्वक बनाया गया!',
      whatNext: 'अब आप क्या करना चाहेंगे?',
      generateSame: 'वही फिर से बनाएं',
      generateSameDesc: 'उसी प्रकार का एक और दस्तावेज़ बनाएं',
      generateDifferent: 'अलग दस्तावेज़',
      generateDifferentDesc: 'किसी अन्य प्रकार के दस्तावेज़ पर जाएं',
      exitMode: 'बाहर निकलें',
      exitModeDesc: 'AI स्वचालित पहचान के साथ सामान्य चैट पर वापस जाएं',
    },
  };

  const text = t[language] || t.en;

  return (
    <Box
      bg={bgColor}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      my={3}
      maxW="100%"
    >
      <VStack spacing={3} align="stretch">
        {/* Success header */}
        <HStack spacing={2}>
          <Icon as={FaCheckCircle} color={successColor} boxSize={5} />
          <Text fontWeight="bold" color={successColor}>
            {text.success}
          </Text>
        </HStack>

        {templateTitle && (
          <Text fontSize="sm" color={textColor} fontStyle="italic">
            📄 {templateTitle}
          </Text>
        )}

        <Divider />

        {/* What next question */}
        <Text fontSize="sm" color={textColor} fontWeight="medium">
          {text.whatNext}
        </Text>

        {/* Action buttons */}
        <Wrap spacing={2}>
          <WrapItem>
            <Tooltip label={text.generateSameDesc} placement="top">
              <Button
                size="sm"
                colorScheme="blue"
                variant="solid"
                leftIcon={<Icon as={FaRedo} />}
                onClick={onGenerateSame}
              >
                {text.generateSame}
              </Button>
            </Tooltip>
          </WrapItem>

          <WrapItem>
            <Tooltip label={text.generateDifferentDesc} placement="top">
              <Button
                size="sm"
                colorScheme="purple"
                variant="outline"
                leftIcon={<Icon as={FaExchangeAlt} />}
                onClick={onGenerateDifferent}
              >
                {text.generateDifferent}
              </Button>
            </Tooltip>
          </WrapItem>

          <WrapItem>
            <Tooltip label={text.exitModeDesc} placement="top">
              <Button
                size="sm"
                colorScheme="gray"
                variant="outline"
                leftIcon={<Icon as={FaRobot} />}
                onClick={onExitDocumentMode}
              >
                {text.exitMode}
              </Button>
            </Tooltip>
          </WrapItem>
        </Wrap>
      </VStack>
    </Box>
  );
};

export default PostDownloadOptions;
