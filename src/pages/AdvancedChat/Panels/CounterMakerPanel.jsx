import React from 'react';
import {
  Box, VStack, HStack, Flex, Text, Badge, Icon, Heading, Button,
  useColorModeValue, Spinner, IconButton, Textarea,
  Alert, AlertIcon, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { FiEdit, FiUploadCloud } from 'react-icons/fi';
import { useAdvancedChat } from '../AdvancedChatContext';

const CounterMakerPanel = () => {

  const {
    counterMakerStatus,
    counterMakerResults,
    counterMakerFacts, setCounterMakerFacts,
    setIsCounterMakerPanelOpen,
    activeDraftingTool, setActiveDraftingTool,
  } = useAdvancedChat();

  const panelBg = useColorModeValue('white', 'gray.850');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const headerBg = useColorModeValue('orange.50', 'orange.900');
  const textareaBg = useColorModeValue('white', 'gray.900');

  const handleDownload = () => {
    if (!counterMakerResults?.content) return;
    const blob = new Blob([counterMakerResults.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${counterMakerResults.title || 'counter-affidavit'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      w="420px"
      minW="380px"
      bg={panelBg}
      borderLeft="1px solid"
      borderColor={panelBorder}
      display="flex"
      flexDirection="column"
      overflow="hidden"
      position="relative"
    >
      {/* Header */}
      <Flex
        h="50px"
        align="center"
        justify="space-between"
        px={4}
        borderBottom="1px solid"
        borderColor={panelBorder}
        bg={headerBg}
        flexShrink={0}
      >
        <HStack spacing={2}>
          <Icon as={FiEdit} color="orange.500" />
          <Text fontSize="sm" fontWeight="bold" color={headingColor}>
            Counter Affidavit Editor
          </Text>
          {counterMakerStatus === 'completed' && (
            <Badge colorScheme="green" fontSize="2xs">Draft Ready</Badge>
          )}
          {(counterMakerStatus === 'starting' || counterMakerStatus === 'processing') && (
            <Badge colorScheme="orange" fontSize="2xs">
              <Spinner size="xs" mr={1} /> Drafting
            </Badge>
          )}
        </HStack>
        <IconButton
          icon={<FaTimes />}
          size="xs"
          variant="ghost"
          aria-label="Close counter maker panel"
          onClick={() => {
            setIsCounterMakerPanelOpen(false);
            setActiveDraftingTool(null);
          }}
        />
      </Flex>

      {/* Body */}
      <Box
        flex="1"
        overflowY="auto"
        p={4}
        display="flex"
        flexDirection="column"
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { background: panelBorder, borderRadius: '24px' },
        }}
      >
        {/* IDLE */}
        {counterMakerStatus === 'idle' && (
          <VStack spacing={4} align="center" justify="center" flex="1" color="gray.500" py={16}>
            <Icon as={FiUploadCloud} boxSize={10} />
            <Text fontSize="sm" textAlign="center">
              Upload the original complaint / petition in the chat, then click <strong>Counter Maker</strong> to begin drafting.
            </Text>
          </VStack>
        )}

        {/* PROCESSING */}
        {(counterMakerStatus === 'starting' || counterMakerStatus === 'processing') && (
          <VStack spacing={6} mt={10} align="center">
            <Spinner size="xl" color="orange.500" thickness="4px" speed="0.8s" />
            <Text fontSize="sm" fontWeight="medium" color={headingColor}>
              Drafting Counter Affidavit...
            </Text>
            <Text fontSize="xs" color="gray.400" textAlign="center">
              AI is analyzing the document and generating a structured counter response.
            </Text>
          </VStack>
        )}

        {/* COMPLETED */}
        {counterMakerStatus === 'completed' && counterMakerResults && (
          <VStack spacing={4} align="stretch" flex="1">
            {/* Strategy Analysis */}
            {counterMakerResults.analysis && (
              <Box bg={sectionBg} p={4} borderRadius="lg" borderLeft="3px solid" borderLeftColor="orange.400">
                <Heading size="xs" mb={2} color="orange.500" textTransform="uppercase">
                  Strategy Analysis
                </Heading>
                <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                  {counterMakerResults.analysis}
                </Text>
              </Box>
            )}

            {/* Draft Content */}
            <Box flex="1" display="flex" flexDirection="column">
              <Heading size="xs" mb={2} color="orange.500" textTransform="uppercase">
                {counterMakerResults.title || 'Counter Affidavit Draft'}
              </Heading>
              <Textarea
                value={counterMakerResults.content || ''}
                readOnly
                flex="1"
                minH="300px"
                fontFamily="mono"
                fontSize="sm"
                bg={textareaBg}
                borderColor={panelBorder}
                resize="vertical"
                _focus={{ borderColor: 'orange.400' }}
              />
            </Box>

            <HStack spacing={2}>
              <Button
                colorScheme="orange"
                leftIcon={<FaDownload />}
                size="sm"
                flex="1"
                onClick={handleDownload}
              >
                Download Draft
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="orange"
                onClick={() => {
                  setIsCounterMakerPanelOpen(false);
                  setActiveDraftingTool(null);
                }}
              >
                Close
              </Button>
            </HStack>
          </VStack>
        )}

        {/* FAILED */}
        {counterMakerStatus === 'failed' && (
          <Alert status="error" borderRadius="md" mt={4}>
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Drafting Failed</AlertTitle>
              <AlertDescription fontSize="xs">
                Could not generate the counter affidavit. Please re-upload the file and try again.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default CounterMakerPanel;
