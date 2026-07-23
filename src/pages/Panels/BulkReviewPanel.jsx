import React from 'react';
import {
  Box, VStack, Heading, Text, Badge, HStack, Spinner, Icon,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  useColorModeValue, Center
} from '@chakra-ui/react';

import { useAdvancedChat } from '../AdvancedChatContext';

const BulkReviewPanel = () => {
  const { reviewStatus, bulkReviewResults, reviewFiles } = useAdvancedChat();
  
  const bg = useColorModeValue('white', 'gray.850');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const expandedBg = useColorModeValue('purple.100', 'purple.800');
  const dateItemBg = useColorModeValue('white', 'gray.900');
  const headerBg = useColorModeValue('purple.50', 'purple.900');

  const stripMarkdown = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\*\*/g, '').replace(/### /g, '').replace(/## /g, '');
  };

  if (!bulkReviewResults && (reviewStatus === 'processing' || reviewStatus === 'starting')) {
    return (
      <Center h="full" w="full" bg={bg} p={6}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Heading size="md" color="purple.600">Analyzing Documents...</Heading>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Agent 1 is reading and summarizing {reviewFiles.length} files in parallel. This may take 30-90 seconds depending on file sizes.
          </Text>
        </VStack>
      </Center>
    );
  }

  if (reviewStatus === 'failed') {
    return (
      <Center h="full" w="full" bg={bg} p={6}>
        <VStack spacing={4}>
          <Text fontSize="4xl">❌</Text>
          <Heading size="md" color="red.500">Analysis Failed</Heading>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Something went wrong while processing the documents.
          </Text>
        </VStack>
      </Center>
    );
  }

  const docs = bulkReviewResults?.documents || [];

  return (
    <Box h="full" minH={0} w="full" bg={bg} borderLeft="1px solid" borderColor={borderColor} overflowY="auto">
      {/* Header */}
      <Box p={5} borderBottom="1px solid" borderColor={borderColor} bg={headerBg}>
        <HStack spacing={3} mb={1}>
          <Icon as={FiLayers} color="purple.500" boxSize={5} />
          <Heading size="sm" color="purple.600">Parallel Review Results</Heading>
        </HStack>
        <Text fontSize="xs" color="gray.500">
          {docs.length} documents analyzed. Ask Agent 4 in the chat to compare clauses, find contradictions, or cross-reference dates across all documents.
        </Text>
      </Box>

      {/* Accordion List of Documents */}
      <Box p={4}>
        <Accordion allowMultiple defaultIndex={[0]}>
          {docs.map((doc, idx) => (
            <AccordionItem key={idx} border="1px solid" borderColor={borderColor} borderRadius="md" mb={3} overflow="hidden">
              <h2>
                <AccordionButton bg={sectionBg} _expanded={{ bg: expandedBg }}>
                  <Box flex="1" textAlign="left" fontWeight="bold" fontSize="sm" isTruncated>
                    <Icon as={FiFileText} mr={2} color="purple.500" />
                    {doc.fileName || `Document ${idx + 1}`}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} bg={bg}>
                <VStack spacing={4} align="stretch">
                  
                  {/* Context */}
                  <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="blue.400">
                    <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" mb={2}>
                      📄 Document Context
                    </Text>
                    <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                      {stripMarkdown(doc.context)}
                    </Text>
                  </Box>

                  {/* Key Points */}
                  <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="purple.400">
                    <Text fontSize="xs" fontWeight="bold" color="purple.600" textTransform="uppercase" mb={2}>
                      🔑 Key Points
                    </Text>
                    <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                      {stripMarkdown(doc.keyPoints)}
                    </Text>
                  </Box>

                  {/* Synthesis */}
                  {doc.synthesis && (
                    <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="teal.400">
                      <Text fontSize="xs" fontWeight="bold" color="teal.600" textTransform="uppercase" mb={2}>
                        🧠 Synthesis
                      </Text>
                      <Text fontSize="sm" color={headingColor} whiteSpace="pre-wrap">
                        {stripMarkdown(doc.synthesis)}
                      </Text>
                    </Box>
                  )}

                  {/* Dates */}
                  {Array.isArray(doc.dates) && doc.dates.length > 0 && (
                    <Box p={3} bg={sectionBg} borderRadius="lg" borderLeft="3px solid" borderLeftColor="green.400">
                      <Text fontSize="xs" fontWeight="bold" color="green.600" textTransform="uppercase" mb={2}>
                        📅 Key Dates
                      </Text>
                      <VStack spacing={1} align="stretch">
                        {doc.dates.slice(0, 10).map((d, i) => (
                          <HStack key={i} fontSize="xs" p={2} bg={dateItemBg} borderRadius="md" spacing={3}>
                            <Badge colorScheme="green" fontSize="2xs" minW="70px" textAlign="center">
                              {d.date || 'N/A'}
                            </Badge>
                            <Text flex={1} color={headingColor}>{d.event || 'Unknown event'}</Text>
                          </HStack>
                        ))}
                        {doc.dates.length > 10 && (
                          <Text fontSize="2xs" color="gray.400">+{doc.dates.length - 10} more dates...</Text>
                        )}
                      </VStack>
                    </Box>
                  )}

                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>
    </Box>
  );
};

export default BulkReviewPanel;
