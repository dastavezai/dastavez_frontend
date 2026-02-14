/**
 * DocumentAnalysisPanel - Static analysis of document structure, risks, clauses
 * Shows document type, section breakdown, risk levels, key entities
 */
import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Divider,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  useColorModeValue, Stat, StatLabel, StatNumber, StatGroup,
  List, ListItem, ListIcon, Tag, Wrap, WrapItem
} from '@chakra-ui/react';
import {
  MdDescription, MdSecurity, MdWarning, MdCheckCircle,
  MdGavel, MdCategory, MdArticle, MdPeople
} from 'react-icons/md';
import { FaExclamationTriangle, FaInfoCircle, FaShieldAlt, FaFileAlt } from 'react-icons/fa';

const RISK_COLORS = {
  high: 'red',
  critical: 'red',
  medium: 'orange',
  warning: 'orange',
  low: 'green',
  info: 'blue',
};

const DocumentAnalysisPanel = ({ scanResults, formatMetadata }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  if (!scanResults) {
    return (
      <Box p={4} textAlign="center" color={mutedColor}>
        <Icon as={MdDescription} boxSize={10} mb={3} opacity={0.3} />
        <Text fontSize="sm">No analysis available yet.</Text>
        <Text fontSize="xs" mt={1}>Run Smart Scan to analyze your document.</Text>
      </Box>
    );
  }

  const { documentType, structure, riskAnalysis } = scanResults;
  const risks = riskAnalysis?.risks || [];
  const suggestions = riskAnalysis?.suggestions || [];
  const criticalRisks = risks.filter(r => r.severity === 'critical' || r.severity === 'high').length;
  const warningRisks = risks.filter(r => r.severity === 'warning' || r.severity === 'medium').length;

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Header */}
      <Box px={3} py={3} borderBottom="1px solid" borderColor={borderColor}>
        <HStack spacing={2} mb={1}>
          <Icon as={MdDescription} color="blue.400" boxSize={5} />
          <Text fontWeight="bold" fontSize="sm">Document Analysis</Text>
        </HStack>
      </Box>

      {/* Content */}
      <Box flex="1" overflowY="auto" px={2} py={2}>
        <VStack spacing={3} align="stretch">
          {/* Document Type */}
          <Box bg={cardBg} p={3} borderRadius="md" border="1px solid" borderColor={borderColor}>
            <HStack spacing={2} mb={1}>
              <Icon as={MdGavel} color="purple.400" />
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedColor}>Document Type</Text>
            </HStack>
            <Text fontSize="md" fontWeight="bold" color={textColor}>
              {typeof documentType === 'string' ? documentType : documentType?.type || 'Unknown'}
            </Text>
            {documentType?.confidence && (
              <Badge fontSize="2xs" colorScheme="green" mt={1}>
                {Math.round(documentType.confidence * 100)}% confidence
              </Badge>
            )}
          </Box>

          {/* Structure Overview */}
          {structure && (
            <Box bg={cardBg} p={3} borderRadius="md" border="1px solid" borderColor={borderColor}>
              <HStack spacing={2} mb={2}>
                <Icon as={MdArticle} color="blue.400" />
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedColor}>Structure</Text>
              </HStack>
              <HStack spacing={4}>
                <VStack spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="blue.400">{structure.sectionCount || 0}</Text>
                  <Text fontSize="2xs" color={mutedColor}>Sections</Text>
                </VStack>
                <VStack spacing={0}>
                  <Text fontSize="xl" fontWeight="bold" color="purple.400">{structure.clauseCount || 0}</Text>
                  <Text fontSize="2xs" color={mutedColor}>Clauses</Text>
                </VStack>
              </HStack>
              {structure.clauseTypes?.length > 0 && (
                <Wrap mt={2} spacing={1}>
                  {structure.clauseTypes.map((type, idx) => (
                    <WrapItem key={idx}>
                      <Tag size="sm" fontSize="2xs" colorScheme="purple" variant="subtle">{type}</Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
            </Box>
          )}

          {/* Risk Summary */}
          <Box bg={cardBg} p={3} borderRadius="md" border="1px solid" borderColor={borderColor}>
            <HStack spacing={2} mb={2}>
              <Icon as={MdSecurity} color="orange.400" />
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedColor}>Risk Assessment</Text>
            </HStack>
            {risks.length === 0 ? (
              <HStack spacing={2} color="green.400">
                <Icon as={MdCheckCircle} />
                <Text fontSize="sm">No significant risks detected</Text>
              </HStack>
            ) : (
              <>
                <HStack spacing={3} mb={2}>
                  {criticalRisks > 0 && (
                    <Badge colorScheme="red" fontSize="xs">
                      {criticalRisks} Critical
                    </Badge>
                  )}
                  {warningRisks > 0 && (
                    <Badge colorScheme="orange" fontSize="xs">
                      {warningRisks} Warning
                    </Badge>
                  )}
                  <Badge colorScheme="blue" fontSize="xs">
                    {risks.length} Total
                  </Badge>
                </HStack>

                <Accordion allowMultiple>
                  {risks.slice(0, 10).map((risk, idx) => (
                    <AccordionItem key={idx} border="none" mb={1}>
                      <AccordionButton px={2} py={1.5} borderRadius="sm" _hover={{ bg: 'blackAlpha.100' }}>
                        <HStack flex={1} spacing={2}>
                          <Icon 
                            as={FaExclamationTriangle} 
                            color={`${RISK_COLORS[risk.severity] || 'gray'}.400`}
                            boxSize={3}
                          />
                          <Text fontSize="xs" fontWeight="500" textAlign="left" noOfLines={1}>
                            {risk.title || risk.type || `Risk ${idx + 1}`}
                          </Text>
                        </HStack>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel px={2} pb={2}>
                        <Text fontSize="xs" color={mutedColor}>
                          {risk.description || risk.text || 'No details available'}
                        </Text>
                        {risk.suggestion && (
                          <Box mt={1} p={2} bg="green.50" borderRadius="sm">
                            <Text fontSize="2xs" color="green.700" fontWeight="bold">Suggestion:</Text>
                            <Text fontSize="xs" color="green.700">{risk.suggestion}</Text>
                          </Box>
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
            )}
          </Box>

          {/* Format Metadata */}
          {formatMetadata && formatMetadata.extracted && (
            <Box bg={cardBg} p={3} borderRadius="md" border="1px solid" borderColor={borderColor}>
              <HStack spacing={2} mb={2}>
                <Icon as={FaFileAlt} color="teal.400" />
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedColor}>Original Formatting</Text>
              </HStack>
              <VStack align="stretch" spacing={1} fontSize="xs" color={textColor}>
                <HStack justify="space-between">
                  <Text color={mutedColor}>Font:</Text>
                  <Text fontWeight="500">{formatMetadata.defaultFont}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color={mutedColor}>Size:</Text>
                  <Text fontWeight="500">{formatMetadata.defaultFontSize}pt</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color={mutedColor}>Page:</Text>
                  <Text fontWeight="500">{formatMetadata.pageSize?.name || 'Letter'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color={mutedColor}>Spacing:</Text>
                  <Text fontWeight="500">{formatMetadata.lineSpacing}x</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color={mutedColor}>Alignment:</Text>
                  <Text fontWeight="500" textTransform="capitalize">{formatMetadata.bodyAlignment}</Text>
                </HStack>
                {formatMetadata.detectedFonts?.length > 1 && (
                  <Box mt={1}>
                    <Text color={mutedColor} mb={0.5}>All fonts detected:</Text>
                    <Wrap spacing={1}>
                      {formatMetadata.detectedFonts.map((f, i) => (
                        <WrapItem key={i}>
                          <Tag size="sm" fontSize="2xs">{f}</Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default DocumentAnalysisPanel;
