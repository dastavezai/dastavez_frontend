import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Box, VStack, HStack, Text, Badge, Icon, Button, useColorModeValue,
  Spinner, Collapse, Tooltip, Tag, Progress, Divider, useToast,
} from '@chakra-ui/react';
import {
  MdCheckCircle, MdWarning, MdCancel, MdExpandMore, MdExpandLess,
  MdAutoFixHigh, MdDescription, MdSecurity, MdPictureAsPdf,
} from 'react-icons/md';
import { FaShieldAlt, FaQuoteRight, FaClipboardCheck, FaGavel } from 'react-icons/fa';
import fileService from '../../services/fileService';

const STATUS_CONFIG = {
  present: { icon: MdCheckCircle, color: 'green', label: 'Found' },
  missing: { icon: MdCancel, color: 'red', label: 'Missing' },
  weak: { icon: MdWarning, color: 'orange', label: 'Weak' },
  adequate: { icon: MdCheckCircle, color: 'green', label: 'Adequate' },
};

const ContractReviewPanel = ({ compact = false, onApplySuggestion, deepAnalysis, deepLoading, onRunDeepAnalysis, onExportPdf }) => {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const headingColor = useColorModeValue('blue.700', 'blue.300');

  const runContractReview = useCallback(async () => {
    setLoading(true);
    try {
      const prompt = `You are a senior Indian contract lawyer. Perform a thorough CONTRACT REVIEW of this document. Check every standard contract clause and assess its status.

Return your response as a JSON object with this EXACT structure:
{
  "contractType": "Type of contract (e.g., Employment Agreement, Lease Deed, Service Agreement)",
  "overallRisk": "low|medium|high|critical",
  "score": <number 0-100>,
  "clauses": [
    {
      "name": "Clause name (e.g., Jurisdiction, Indemnity, Force Majeure)",
      "status": "present|missing|weak",
      "risk": "low|medium|high|critical",
      "finding": "Brief description of what was found or what's missing",
      "recommendation": "What should be added or changed",
      "suggestedText": "Exact clause text to add/replace (if missing or weak)"
    }
  ],
  "redFlags": [
    {
      "title": "Red flag title",
      "description": "Why this is a concern",
      "severity": "high|critical"
    }
  ],
  "negotiationPoints": [
    "Point that should be negotiated before signing"
  ]
}

Check at minimum these standard clauses: Parties & Recitals, Term & Termination, Payment/Consideration, Indemnification, Limitation of Liability, Confidentiality, Non-Compete/Non-Solicitation, Force Majeure, Governing Law & Jurisdiction, Dispute Resolution (Arbitration), Intellectual Property, Representations & Warranties, Assignment, Amendment, Severability, Entire Agreement, Notices. Provide 3-5 red flags and 3-5 negotiation points. Return ONLY JSON.`;

      const res = await fileService.aiChatAboutDocument(prompt, '', [], 'en');
      const raw = (res?.reply || res?.response || res?.message || '').trim();
      const jsonMatch = raw.match(/\{[\s\S]*"clauses"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setReview(parsed);
      } else {
        toast({ title: 'Could not parse review results', status: 'warning', duration: 3000 });
      }
    } catch (err) {
      console.error('Contract review error:', err);
      toast({ title: 'Contract review failed', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleInsertClause = (clause) => {
    if (!clause.suggestedText) return;
    onApplySuggestion?.({
      title: `Add: ${clause.name}`,
      description: clause.recommendation || `Insert ${clause.name} clause`,
      originalText: '',
      suggestedText: clause.suggestedText,
      type: 'insert_clause',
    });
  };

  const riskColor = (risk) => {
    if (risk === 'critical') return 'red';
    if (risk === 'high') return 'orange';
    if (risk === 'medium') return 'yellow';
    return 'green';
  };

  const presentCount = review?.clauses?.filter(c => c.status === 'present').length || 0;
  const missingCount = review?.clauses?.filter(c => c.status === 'missing').length || 0;
  const weakCount = review?.clauses?.filter(c => c.status === 'weak').length || 0;
  const totalClauses = review?.clauses?.length || 0;

  return (
    <VStack spacing={3} align="stretch" h="100%">
      <Box px={compact ? 2 : 3} pt={compact ? 2 : 3}>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Text fontWeight="semibold" fontSize={compact ? 'sm' : 'md'}>
              Contract Review
            </Text>
            <Text fontSize="2xs" color={mutedColor}>
              AI-powered clause-by-clause analysis
            </Text>
          </VStack>
          <Button
            size={compact ? 'xs' : 'sm'}
            colorScheme="teal"
            leftIcon={loading ? <Spinner size="xs" /> : <Icon as={FaClipboardCheck} />}
            onClick={runContractReview}
            isLoading={loading}
            loadingText="Reviewing…"
            fontSize="xs"
          >
            {review ? 'Re-review' : 'Run Review'}
          </Button>
        </HStack>
      </Box>

      <Box flex={1} overflowY="auto" px={compact ? 2 : 3} pb={2}>
        {!review && !loading && (
          <VStack py={8} spacing={2}>
            <Icon as={FaShieldAlt} boxSize={8} color={mutedColor} />
            <Text fontSize="xs" color={mutedColor} textAlign="center">
              Run a contract review to check all standard clauses, identify risks, and get negotiation recommendations
            </Text>
          </VStack>
        )}

        {review && (
          <VStack spacing={3} align="stretch">
            <Box
              bg={cardBg} border="1px solid" borderColor={borderColor}
              borderRadius="md" p={3}
            >
              <HStack justify="space-between" mb={2}>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" fontWeight="bold" color={mutedColor}>
                    {review.contractType || 'Contract'}
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize="2xl" fontWeight="bold" color={`${riskColor(review.overallRisk)}.400`}>
                      {review.score || 0}
                    </Text>
                    <Text fontSize="2xs" color={mutedColor}>/ 100</Text>
                  </HStack>
                </VStack>
                <Badge
                  colorScheme={riskColor(review.overallRisk)}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {(review.overallRisk || 'unknown').toUpperCase()} RISK
                </Badge>
              </HStack>
              <Progress
                value={review.score || 0}
                colorScheme={riskColor(review.overallRisk)}
                size="sm"
                borderRadius="full"
                mb={2}
              />
              <HStack spacing={3} justify="center">
                <HStack spacing={1}>
                  <Icon as={MdCheckCircle} color="green.400" boxSize={3} />
                  <Text fontSize="2xs" color={mutedColor}>{presentCount} Found</Text>
                </HStack>
                <HStack spacing={1}>
                  <Icon as={MdWarning} color="orange.400" boxSize={3} />
                  <Text fontSize="2xs" color={mutedColor}>{weakCount} Weak</Text>
                </HStack>
                <HStack spacing={1}>
                  <Icon as={MdCancel} color="red.400" boxSize={3} />
                  <Text fontSize="2xs" color={mutedColor}>{missingCount} Missing</Text>
                </HStack>
              </HStack>
            </Box>

            {review.redFlags?.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="red.400" mb={1}>
                  🚩 Red Flags ({review.redFlags.length})
                </Text>
                <VStack spacing={1} align="stretch">
                  {review.redFlags.map((rf, i) => (
                    <Box
                      key={i} bg={cardBg} border="1px solid" borderColor="red.200"
                      borderLeft="3px solid" borderLeftColor="red.400"
                      borderRadius="md" p={2}
                    >
                      <Text fontSize="2xs" fontWeight="bold" color="red.400">{rf.title}</Text>
                      <Text fontSize="2xs" color={textColor}>{rf.description}</Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            <Box>
              <Text fontSize="xs" fontWeight="bold" color={headingColor} mb={1}>
                Clause Checklist ({totalClauses})
              </Text>
              <VStack spacing={1} align="stretch">
                {review.clauses?.map((clause, idx) => {
                  const cfg = STATUS_CONFIG[clause.status] || STATUS_CONFIG.present;
                  const isExpanded = expandedIdx === idx;
                  return (
                    <Box
                      key={idx} bg={cardBg} border="1px solid" borderColor={borderColor}
                      borderRadius="md" overflow="hidden"
                    >
                      <HStack
                        p={2} cursor="pointer"
                        onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                      >
                        <Icon as={cfg.icon} color={`${cfg.color}.400`} boxSize={3.5} />
                        <Text fontSize="xs" fontWeight="medium" flex={1} color={textColor}>
                          {clause.name}
                        </Text>
                        <Badge colorScheme={riskColor(clause.risk)} fontSize="2xs">
                          {clause.risk}
                        </Badge>
                        <Icon as={isExpanded ? MdExpandLess : MdExpandMore} color={mutedColor} boxSize={3} />
                      </HStack>
                      <Collapse in={isExpanded}>
                        <Box px={2} pb={2} borderTop="1px solid" borderColor={borderColor}>
                          <Text fontSize="2xs" color={textColor} mt={1}>{clause.finding}</Text>
                          {clause.recommendation && (
                            <Text fontSize="2xs" color="blue.400" mt={1}>
                              💡 {clause.recommendation}
                            </Text>
                          )}
                          {clause.suggestedText && (clause.status === 'missing' || clause.status === 'weak') && (
                            <Button
                              size="xs"
                              colorScheme="green"
                              variant="outline"
                              fontSize="2xs"
                              mt={2}
                              leftIcon={<Icon as={FaQuoteRight} boxSize={2.5} />}
                              onClick={(e) => { e.stopPropagation(); handleInsertClause(clause); }}
                            >
                              {clause.status === 'missing' ? 'Add Clause' : 'Strengthen'}
                            </Button>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            {review.negotiationPoints?.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="purple.400" mb={1}>
                  Negotiation Points
                </Text>
                <VStack spacing={1} align="stretch">
                  {review.negotiationPoints.map((np, i) => (
                    <HStack key={i} spacing={2} p={1}>
                      <Badge colorScheme="purple" fontSize="2xs" minW="18px" textAlign="center">
                        {i + 1}
                      </Badge>
                      <Text fontSize="2xs" color={textColor}>{np}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        )}
      </Box>

      {onRunDeepAnalysis && (
        <Box
          px={compact ? 2 : 3}
          pb={compact ? 2 : 3}
          borderTop="1px solid"
          borderColor={borderColor}
          pt={2}
        >
          <HStack justify="space-between" align="center" mb={2}>
            <Text fontSize="xs" fontWeight="bold" color="blue.400">AI Legal Analysis</Text>
            <HStack spacing={1}>
              {deepAnalysis && onExportPdf && (
                <Tooltip label="Export as PDF" fontSize="xs" hasArrow>
                  <Button
                    size="xs" variant="outline" colorScheme="blue"
                    leftIcon={<Icon as={MdPictureAsPdf} boxSize={3} />}
                    onClick={onExportPdf}
                    fontSize="2xs"
                  >
                    PDF
                  </Button>
                </Tooltip>
              )}
              <Button
                size="xs" colorScheme="blue"
                leftIcon={deepLoading ? <Spinner size="xs" /> : <Icon as={FaGavel} boxSize={3} />}
                onClick={onRunDeepAnalysis}
                isLoading={deepLoading}
                loadingText="Analysing…"
                isDisabled={deepLoading}
                fontSize="2xs"
              >
                {deepAnalysis ? 'Re-analyse' : 'Deep Analysis'}
              </Button>
            </HStack>
          </HStack>
          {deepAnalysis && (
            <Box
              bg={cardBg} border="1px solid" borderColor={borderColor}
              borderRadius="md" p={3} fontSize="xs" lineHeight={1.7}
              overflowY="auto" maxH="300px"
            >
              <ReactMarkdown>{deepAnalysis}</ReactMarkdown>
            </Box>
          )}
          {!deepAnalysis && !deepLoading && (
            <Text fontSize="2xs" color={mutedColor} textAlign="center" py={2}>
              Run Deep Analysis for comprehensive AI legal review
            </Text>
          )}
        </Box>
      )}
    </VStack>
  );
};

export default ContractReviewPanel;
