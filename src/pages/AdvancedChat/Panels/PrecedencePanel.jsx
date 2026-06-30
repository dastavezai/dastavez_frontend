import React from 'react';
import {
  Box, VStack, HStack, Flex, Text, Badge, Icon, Heading, Button,
  useColorModeValue, Spinner, IconButton,
  Alert, AlertIcon, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { FiZap, FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import { useAdvancedChat } from '../AdvancedChatContext';

const PrecedencePanel = () => {

  const {
    precedenceStatus,
    precedenceResults,
    setIsPrecedencePanelOpen,
    activeDraftingTool, setActiveDraftingTool,
  } = useAdvancedChat();

  const panelBg = useColorModeValue('white', 'gray.850');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const headerBg = useColorModeValue('teal.50', 'teal.900');

  return (
    <Box
      w="380px"
      minW="340px"
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
          <Icon as={FiZap} color="teal.500" />
          <Text fontSize="sm" fontWeight="bold" color={headingColor}>
            Precedence Analysis
          </Text>
          {precedenceStatus === 'completed' && (
            <Badge colorScheme="green" fontSize="2xs">Complete</Badge>
          )}
          {(precedenceStatus === 'processing' || precedenceStatus === 'starting') && (
            <Badge colorScheme="blue" fontSize="2xs">
              <Spinner size="xs" mr={1} /> Analyzing
            </Badge>
          )}
        </HStack>
        <IconButton
          icon={<FaTimes />}
          size="xs"
          variant="ghost"
          aria-label="Close precedence panel"
          onClick={() => {
            setIsPrecedencePanelOpen(false);
            setActiveDraftingTool(null);
          }}
        />
      </Flex>

      {/* Body */}
      <Box
        flex="1"
        overflowY="auto"
        p={4}
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { background: panelBorder, borderRadius: '24px' },
        }}
      >
        {/* IDLE — waiting for file upload */}
        {precedenceStatus === 'idle' && (
          <VStack spacing={4} align="center" justify="center" h="full" color="gray.500" py={16}>
            <Icon as={FiUploadCloud} boxSize={10} />
            <Text fontSize="sm" textAlign="center">
              Upload a document in the chat, then select <strong>Precedence Analysis</strong> to begin.
            </Text>
          </VStack>
        )}

        {/* PROCESSING */}
        {(precedenceStatus === 'starting' || precedenceStatus === 'processing') && (
          <VStack spacing={6} mt={10} align="center">
            <Spinner size="xl" color="teal.500" thickness="4px" speed="0.8s" />
            <Text fontSize="sm" fontWeight="medium" color={headingColor}>
              Extracting Legal Precedents...
            </Text>
            <Text fontSize="xs" color="gray.400" textAlign="center">
              AI is analyzing relevant case laws and precedents. This may take a minute.
            </Text>
          </VStack>
        )}

        {/* COMPLETED */}
        {precedenceStatus === 'completed' && precedenceResults && (
          <VStack spacing={6} align="stretch">
            {/* Overall Summary */}
            <Box bg={sectionBg} p={4} borderRadius="lg" borderLeft="3px solid" borderLeftColor="teal.400">
              <Heading size="xs" mb={2} color="teal.500" textTransform="uppercase">
                Overall Summary
              </Heading>
              <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                {precedenceResults.overallSummary}
              </Text>
            </Box>

            {/* Legal Issues */}
            {precedenceResults.legalIssues?.length > 0 && (
              <Box>
                <Heading size="xs" mb={3} color="teal.500" textTransform="uppercase">
                  Legal Issues Identified
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {precedenceResults.legalIssues.map((issue, idx) => (
                    <Flex key={idx} align="flex-start" bg={sectionBg} p={3} borderRadius="md" borderWidth="1px" borderColor={panelBorder}>
                      <Icon as={FiCheckCircle} color="teal.400" mt="2px" mr={2} flexShrink={0} />
                      <Text fontSize="sm" color={headingColor}>{issue}</Text>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Precedents */}
            {precedenceResults.precedents?.length > 0 && (
              <Box>
                <Heading size="xs" mb={3} color="teal.500" textTransform="uppercase">
                  Relevant Case Laws / Precedents
                </Heading>
                <VStack align="stretch" spacing={3}>
                  {precedenceResults.precedents.map((prec, idx) => (
                    <Box key={idx} bg={sectionBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={panelBorder}>
                      <Text fontSize="sm" fontWeight="bold" color={headingColor} mb={1}>{prec.caseName}</Text>
                      <Text fontSize="xs" color="gray.500" mb={2}>
                        {prec.citation} · {prec.court} ({prec.year})
                      </Text>
                      <Text fontSize="sm" mb={2} color={headingColor}>{prec.summary}</Text>
                      <Badge colorScheme="teal" fontSize="2xs">Relevance: {prec.relevance}</Badge>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            <Button
              size="sm"
              variant="outline"
              colorScheme="teal"
              onClick={() => {
                setIsPrecedencePanelOpen(false);
                setActiveDraftingTool(null);
              }}
            >
              Close Panel
            </Button>
          </VStack>
        )}

        {/* FAILED */}
        {precedenceStatus === 'failed' && (
          <Alert status="error" borderRadius="md" mt={4}>
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Analysis Failed</AlertTitle>
              <AlertDescription fontSize="xs">
                Could not extract precedents. Please re-upload the file and try again.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default PrecedencePanel;
