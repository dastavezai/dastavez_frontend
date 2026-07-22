import React from 'react';
import {
  Box, VStack, HStack, Flex, Text, Badge, Icon, Button,
  useColorModeValue, Spinner, Progress, IconButton
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { FiCpu } from 'react-icons/fi';
import { useAdvancedChat } from '../AdvancedChatContext';

// Strip common markdown syntax so raw AI output renders cleanly
const stripMarkdown = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/#{1,6}\s*/g, '')        // headings
    .replace(/\*\*/g, '')             // bold
    .replace(/\*/g, '')               // stray asterisks
    .replace(/__/g, '')               // bold underscores
    .replace(/_/g, '')                // italic underscores
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, '').trim()) // code
    .replace(/^[-+]\s+/gm, '• ')      // bullet points (removed * from class to avoid stripping already stripped bullets)
    .replace(/^\d+\.\s+/gm, (m) => m) // numbered lists
    .trim();
};

const ResearchPanel = () => {

  const {
    researchStatus, setResearchStatus,
    researchResults, setResearchResults,
    researchElapsed,
    researchEta,
    researchAgentStage,
    isReportPanelOpen, setIsReportPanelOpen,
    setResearchSessionId,
    handleStartDeepResearch,
  } = useAdvancedChat();

  const panelBg = useColorModeValue('white', 'gray.850');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const activeStageBg = useColorModeValue('blue.50', 'blue.900');
  const rowBg = useColorModeValue('white', 'gray.900');

  const etaRemaining = Math.max(0, (researchEta || 90) - (researchElapsed || 0));
  const progressPercent = Math.min(100, ((researchElapsed || 0) / (researchEta || 90)) * 100);

  const handleReset = () => {
    setResearchStatus('idle');
    setResearchResults(null);
    setResearchSessionId(null);
    setIsReportPanelOpen(false);
    localStorage.removeItem('deepResearchSessionId');
  };

  return (
    <Box
      w="100%"
      h="100%"
      flex="1"
      bg={panelBg}
      borderLeft="1px solid"
      borderColor={panelBorder}
      display="flex"
      flexDirection="column"
      overflow="hidden"
      position="relative"
    >
      {/* Panel Header */}
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
          <Icon as={FiCpu} color="blue.500" />
          <Text fontSize="sm" fontWeight="bold" color={headingColor}>
            Research Report
          </Text>
          {(researchStatus === 'completed' || researchStatus === 'completed_with_errors') && (
            <Badge colorScheme="green" fontSize="2xs">Complete</Badge>
          )}
          {(researchStatus === 'starting' || researchStatus === 'processing') && (
            <Badge colorScheme="blue" fontSize="2xs">
              <Spinner size="xs" mr={1} /> Analyzing
            </Badge>
          )}
        </HStack>
        <IconButton
          icon={<FaTimes />}
          size="xs"
          variant="ghost"
          onClick={() => setIsReportPanelOpen(false)}
          aria-label="Close research panel"
        />
      </Flex>

      {/* Panel Body */}
      <Box
        flex="1"
        overflowY="auto"
        p={4}
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { background: panelBorder, borderRadius: '24px' },
        }}
      >
        {/* PROCESSING STATE */}
        {(researchStatus === 'starting' || researchStatus === 'processing') && (
          <VStack spacing={5} align="stretch">
            {/* ETA Card */}
            <Box
              p={5}
              borderRadius="xl"
              bg={useColorModeValue('blue.50', 'blue.900')}
              border="1px solid"
              borderColor={useColorModeValue('blue.100', 'blue.700')}
              textAlign="center"
            >
              <Box position="relative" display="inline-block" mb={3}>
                <Spinner size="xl" color="blue.500" thickness="3px" speed="1.2s" />
              </Box>
              <Text fontSize="lg" fontWeight="bold" color={headingColor} mb={1}>
                Deep Research in Progress
              </Text>
              <Text fontSize="sm" color="gray.500" mb={3}>
                {researchAgentStage || 'Initializing...'}
              </Text>

              {/* Progress bar */}
              <Progress
                value={progressPercent}
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                mb={2}
                sx={{ '& > div': { transition: 'width 1s ease-in-out' } }}
              />
              <HStack justify="space-between" fontSize="xs" color="gray.400">
                <Text>{Math.floor(researchElapsed || 0)}s elapsed</Text>
                <Text>~{etaRemaining}s remaining</Text>
              </HStack>
            </Box>

            {/* Agent stages */}
            <VStack spacing={2} align="stretch">
              {[
                { label: 'Agent 1: Document Reader', threshold: 0, next: 45 },
                { label: 'Agent 2: Action Analyzer', threshold: 45, next: 65 },
                { label: 'Agent 3: Summarizer', threshold: 65, next: 9999 },
              ].map((agent, i) => {
                const elapsed = researchElapsed || 0;
                const isActive = elapsed >= agent.threshold && elapsed < agent.next;
                const isDone = elapsed >= agent.next;
                return (
                  <HStack
                    key={i}
                    p={3}
                    borderRadius="lg"
                    bg={isActive ? activeStageBg : sectionBg}
                    border={isActive ? '1px solid' : 'none'}
                    borderColor={isActive ? 'blue.300' : 'transparent'}
                    opacity={elapsed < agent.threshold ? 0.4 : 1}
                    transition="all 0.3s ease"
                  >
                    <Text fontSize="sm" fontWeight={isActive ? 'bold' : 'normal'} flex={1} color={headingColor}>
                      {agent.label}
                    </Text>
                    {isDone && <Badge colorScheme="green" fontSize="2xs">Done</Badge>}
                    {isActive && <Spinner size="xs" color="blue.500" />}
                  </HStack>
                );
              })}
            </VStack>

            <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
              You can navigate away — your research will continue in the background.
            </Text>
          </VStack>
        )}

        {/* FAILED STATE */}
        {researchStatus === 'failed' && (
          <VStack spacing={4} align="center" py={8}>
            <Text fontSize="3xl">❌</Text>
            <Text fontWeight="bold" color="red.500">Research Failed</Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Something went wrong during analysis. Please try again.
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleStartDeepResearch}
              leftIcon={<Icon as={FiCpu} />}
            >
              Retry Research
            </Button>
          </VStack>
        )}

        {/* COMPLETED STATE */}
        {(researchStatus === 'completed' || researchStatus === 'completed_with_errors') && researchResults && (
          <VStack spacing={4} align="stretch">
            {researchStatus === 'completed_with_errors' && (
              <Box p={3} bg="orange.50" _dark={{ bg: 'orange.900' }} borderRadius="md" borderLeft="3px solid" borderLeftColor="orange.400">
                <Text fontSize="xs" color="orange.600" fontWeight="bold">
                  ⚠ Some analysis stages encountered errors. Partial results are shown.
                </Text>
              </Box>
            )}

            {/* Document Context & Key Points (Agent 1) */}
            {researchResults.agent1Data && !researchResults.agent1Data.error && (
              <>
                <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="blue.400">
                  <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" mb={2}>
                    📄 Document Context
                  </Text>
                  <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                    {stripMarkdown(researchResults.agent1Data.context)}
                  </Text>
                </Box>

                <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="purple.400">
                  <Text fontSize="xs" fontWeight="bold" color="purple.600" textTransform="uppercase" mb={2}>
                    🔑 Key Points
                  </Text>
                  <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                    {stripMarkdown(researchResults.agent1Data.keyPoints)}
                  </Text>
                </Box>

                {researchResults.agent1Data.synthesis && (
                  <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="teal.400">
                    <Text fontSize="xs" fontWeight="bold" color="teal.600" textTransform="uppercase" mb={2}>
                      🧠 Synthesis
                    </Text>
                    <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                      {stripMarkdown(researchResults.agent1Data.synthesis)}
                    </Text>
                  </Box>
                )}

                {/* Key Dates Table */}
                {Array.isArray(researchResults.agent1Data.dates) && researchResults.agent1Data.dates.length > 0 && (
                  <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="green.400">
                    <Text fontSize="xs" fontWeight="bold" color="green.600" textTransform="uppercase" mb={2}>
                      📅 Key Dates & Events
                    </Text>
                    <VStack spacing={1} align="stretch">
                      {researchResults.agent1Data.dates.slice(0, 10).map((d, i) => (
                        <HStack key={i} fontSize="xs" p={2} bg={rowBg} borderRadius="md" spacing={3}>
                          <Badge colorScheme="green" fontSize="2xs" minW="70px" textAlign="center">
                            {d.date || 'N/A'}
                          </Badge>
                          <Text flex={1} color={headingColor}>{d.event || d.description || 'Unknown event'}</Text>
                        </HStack>
                      ))}
                      {researchResults.agent1Data.dates.length > 10 && (
                        <Text fontSize="2xs" color="gray.400">+{researchResults.agent1Data.dates.length - 10} more dates...</Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </>
            )}

            {/* Actionable Steps (Agent 2) */}
            {researchResults.agent2Data && !researchResults.agent2Data.error && (
              <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="orange.400">
                <Text fontSize="xs" fontWeight="bold" color="orange.600" textTransform="uppercase" mb={2}>
                  ⚡ Actionable Steps
                </Text>
                <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                  {stripMarkdown(researchResults.agent2Data.actionableSteps)}
                </Text>
              </Box>
            )}

            {/* Summary (Agent 3) */}
            {researchResults.agent3Summary && !researchResults.agent3Summary.error && (
              <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="cyan.400">
                <Text fontSize="xs" fontWeight="bold" color="cyan.600" textTransform="uppercase" mb={2}>
                  📝 Document Summary
                </Text>
                <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                  {typeof researchResults.agent3Summary === 'string'
                    ? stripMarkdown(researchResults.agent3Summary)
                    : stripMarkdown(researchResults.agent3Summary.summary) || JSON.stringify(researchResults.agent3Summary, null, 2)
                  }
                </Text>
              </Box>
            )}

            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={handleReset}
              mt={2}
            >
              Start New Research
            </Button>
          </VStack>
        )}

        {/* IDLE STATE */}
        {researchStatus === 'idle' && (
          <VStack spacing={4} align="center" py={8}>
            <Icon as={FiCpu} w={10} h={10} color="gray.300" />
            <Text fontSize="sm" color="gray.400" textAlign="center">
              Upload a file and click <strong>"Start Deep Research"</strong> from the sidebar to begin analysis.
            </Text>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default ResearchPanel;
