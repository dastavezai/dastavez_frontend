import React from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Button, useColorModeValue, Spinner, Progress, IconButton, Tooltip, Flex
} from '@chakra-ui/react';
import { FaFile, FaRobot, FaTimes } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';
import { useAdvancedChat } from '../AdvancedChatContext';

const FILE_COLORS = ['blue', 'green', 'purple', 'orange', 'teal', 'cyan', 'pink', 'red', 'yellow'];
const CATEGORY_COLORS = {
  'Procedural': 'blue',
  'Evidentiary': 'purple',
  'Factual': 'gray',
  'Ruling': 'red',
  'Filing': 'orange',
  'other': 'gray'
};

const TimelinePanel = () => {
  
  const {
    activeTab, setActiveTab,
    chronologyStatus, chronologyResults, chronologyElapsed, chronologyEta,
    chronologyAgentStage, isTimelinePanelOpen, setIsTimelinePanelOpen,
    chronologyFiles, setChronologyFiles, chronologySessionId,
    handleStartChronology,
    precedenceStatus, precedenceResults, isPrecedencePanelOpen, setIsPrecedencePanelOpen,
    counterMakerStatus, counterMakerResults, counterMakerFacts, setCounterMakerFacts,
    isCounterMakerPanelOpen, setIsCounterMakerPanelOpen,
    researchStatus, researchResults, researchElapsed, researchEta,
    researchAgentStage, isReportPanelOpen, setIsReportPanelOpen,
    language,
    toast,
    // Add any others if needed by compilation errors later
  } = useAdvancedChat();


    const panelBg = useColorModeValue('white', 'gray.850');
    const panelBorder = useColorModeValue('gray.200', 'gray.700');
    const sectionBg = useColorModeValue('gray.50', 'gray.800');
    const headingColor = useColorModeValue('gray.700', 'gray.200');
    
    // Top-level hooks for elements inside loops or conditionals
    const lineBorderColor = useColorModeValue('green.200', 'green.700');
    const eventBg = useColorModeValue('white', 'gray.900');
    const eventBorderColor = useColorModeValue('gray.100', 'gray.700');
    
    const etaRemaining = Math.max(0, chronologyEta - chronologyElapsed);
    const progressPercent = Math.min(100, (chronologyElapsed / chronologyEta) * 100);

    // Build a file->color map for badges
    const fileColorMap = {};
    if (chronologyResults?.files) {
      chronologyResults.files.forEach((f, i) => {
        fileColorMap[f.fileName] = FILE_COLORS[i % FILE_COLORS.length];
      });
    }

    return (
      <Box
        w="400px"
        minW="340px"
        bg={panelBg}
        borderLeft="1px solid"
        borderColor={panelBorder}
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        {/* Panel Header */}
        <Flex
          h="50px"
          align="center"
          justify="space-between"
          px={4}
          borderBottom="1px solid"
          borderColor={panelBorder}
          bg={useColorModeValue('green.50', 'green.900')}
        >
          <HStack spacing={2}>
            <Icon as={FiClock} color="green.500" />
            <Text fontSize="sm" fontWeight="bold" color={headingColor}>
              Timeline
            </Text>
            {chronologyResults?.events && (
              <Badge colorScheme="green" fontSize="2xs">{chronologyResults.events.length} events</Badge>
            )}
            {chronologyStatus === 'processing' && (
              <Badge colorScheme="blue" fontSize="2xs">
                <Spinner size="xs" mr={1} /> Building
              </Badge>
            )}
          </HStack>
          <IconButton
            icon={<FaTimes />}
            size="xs"
            variant="ghost"
            onClick={() => setIsTimelinePanelOpen(false)}
            aria-label="Close timeline panel"
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
          {(chronologyStatus === 'starting' || chronologyStatus === 'processing') && (
            <VStack spacing={5} align="stretch">
              <Box
                p={5}
                borderRadius="xl"
                bg={useColorModeValue('green.50', 'green.900')}
                border="1px solid"
                borderColor={useColorModeValue('green.100', 'green.700')}
                textAlign="center"
              >
                <Box position="relative" display="inline-block" mb={3}>
                  <Spinner size="xl" color="green.500" thickness="3px" speed="1.2s" />
                </Box>
                <Text fontSize="lg" fontWeight="bold" color={headingColor} mb={1}>
                  Building Timeline
                </Text>
                <Text fontSize="sm" color="gray.500" mb={3}>
                  {chronologyAgentStage || 'Initializing...'}
                </Text>
                <Progress
                  value={progressPercent}
                  size="sm"
                  colorScheme="green"
                  borderRadius="full"
                  mb={2}
                  sx={{ '& > div': { transition: 'width 1s ease-in-out' } }}
                />
                <HStack justify="space-between" fontSize="xs" color="gray.400">
                  <Text>{Math.floor(chronologyElapsed)}s elapsed</Text>
                  <Text>~{etaRemaining}s remaining</Text>
                </HStack>
              </Box>

              {chronologyFiles.length > 0 && (
                <VStack spacing={1} align="stretch">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                    Processing {chronologyFiles.length} file(s)
                  </Text>
                  {chronologyFiles.map((f, i) => (
                    <HStack key={i} p={2} bg={sectionBg} borderRadius="md" fontSize="xs">
                      <Icon as={FaFile} color={`${FILE_COLORS[i % FILE_COLORS.length]}.500`} />
                      <Text flex={1} isTruncated>{f.file?.name || 'File'}</Text>
                      <Spinner size="xs" color="green.400" />
                    </HStack>
                  ))}
                </VStack>
              )}

              <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                You can navigate away Ã¢â‚¬â€ your timeline will continue building in the background.
              </Text>
            </VStack>
          )}

          {/* FAILED STATE */}
          {chronologyStatus === 'failed' && (
            <VStack spacing={4} align="center" py={8}>
              <Text fontSize="3xl">Ã¢ÂÅ’</Text>
              <Text fontWeight="bold" color="red.500">Timeline Failed</Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Something went wrong during timeline analysis.
              </Text>
              <Button size="sm" colorScheme="green" onClick={handleStartChronology} leftIcon={<Icon as={FiClock} />}>
                Retry
              </Button>
            </VStack>
          )}

          {/* COMPLETED STATE Ã¢â‚¬â€ Timeline */}
          {(chronologyStatus === 'completed' || chronologyStatus === 'completed_with_errors') && chronologyResults && (
            <VStack spacing={4} align="stretch">
              {chronologyStatus === 'completed_with_errors' && (
                <Box p={3} bg="orange.50" _dark={{ bg: 'orange.900' }} borderRadius="md" borderLeft="3px solid" borderLeftColor="orange.400">
                  <Text fontSize="xs" color="orange.600" fontWeight="bold">
                    Ã¢Å¡Â  Some files had extraction errors. Partial timeline shown.
                  </Text>
                </Box>
              )}

              {/* Narrative Summary */}
              {chronologyResults.summary && (
                <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="green.400">
                  <Text fontSize="xs" fontWeight="bold" color="green.600" textTransform="uppercase" mb={2}>
                    Ã°Å¸â€œâ€¹ Timeline Summary
                  </Text>
                  <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                    {chronologyResults.summary}
                  </Text>
                </Box>
              )}

              {/* File Legend */}
              {chronologyResults.files && chronologyResults.files.length > 1 && (
                <Box p={3} bg={sectionBg} borderRadius="lg">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>
                    Ã°Å¸â€œâ€š Source Files
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {chronologyResults.files.map((f, i) => (
                      <Badge key={i} colorScheme={FILE_COLORS[i % FILE_COLORS.length]} fontSize="2xs" px={2}>
                        {f.fileName}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}

              {/* Events Timeline */}
              {chronologyResults.events && chronologyResults.events.length > 0 ? (
                <VStack spacing={2} align="stretch" position="relative">
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                    Ã°Å¸â€œâ€¦ Events ({chronologyResults.events.length})
                  </Text>
                  {/* Timeline line */}
                  <Box position="relative" pl={4} borderLeft="2px solid" borderLeftColor={lineBorderColor}>
                    {chronologyResults.events.map((ev, i) => (
                      <Box
                        key={i}
                        position="relative"
                        mb={3}
                        p={3}
                        bg={eventBg}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={eventBorderColor}
                        _hover={{ borderColor: `${CATEGORY_COLORS[ev.category] || 'gray'}.300`, boxShadow: 'sm' }}
                        transition="all 0.2s"
                      >
                        {/* Timeline dot */}
                        <Box
                          position="absolute"
                          left="-22px"
                          top="14px"
                          w="10px"
                          h="10px"
                          bg={`${CATEGORY_COLORS[ev.category] || 'gray'}.400`}
                          borderRadius="full"
                          border="2px solid"
                          borderColor={panelBg}
                        />
                        <HStack justify="space-between" mb={1} flexWrap="wrap">
                          <Badge colorScheme={CATEGORY_COLORS[ev.category] || 'gray'} fontSize="2xs">
                            {ev.date || 'Unknown Date'}
                          </Badge>
                          <HStack spacing={1}>
                            <Badge variant="outline" colorScheme={CATEGORY_COLORS[ev.category] || 'gray'} fontSize="2xs">
                              {(ev.category || 'other').replace('_', ' ')}
                            </Badge>
                            {chronologyResults.files?.length > 1 && (
                              <Badge colorScheme={fileColorMap[ev.sourceFile] || 'gray'} fontSize="2xs" variant="subtle">
                                {ev.sourceFile}
                              </Badge>
                            )}
                          </HStack>
                        </HStack>
                        <Text fontSize="sm" color={headingColor} fontWeight="medium">
                          {ev.event}
                        </Text>
                        {ev.significance && (
                          <Text fontSize="xs" color="gray.400" mt={1}>
                            {ev.significance}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </Box>
                </VStack>
              ) : (
                <Center py={6}>
                  <Text fontSize="sm" color="gray.400">No datable events found in the uploaded documents.</Text>
                </Center>
              )}

              {/* New Chronology */}
              <Button
                size="sm"
                variant="outline"
                colorScheme="green"
                onClick={() => {
                  setChronologyStatus('idle');
                  setChronologyResults(null);
                  setChronologySessionId(null);
                  setChronologyFiles([]);
                  setIsTimelinePanelOpen(false);
                  localStorage.removeItem('chronologySessionId');
                }}
                mt={2}
              >
                Start New Chronology
              </Button>
            </VStack>
          )}

          {/* IDLE STATE */}
          {chronologyStatus === 'idle' && (
            <VStack spacing={4} align="center" py={8}>
              <Icon as={FiClock} w={10} h={10} color="gray.300" />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Upload files and click "Build Chronology" from the sidebar to create a timeline.
              </Text>
            </VStack>
          )}
        </Box>
      </Box>
    );
  }

export default TimelinePanel;
