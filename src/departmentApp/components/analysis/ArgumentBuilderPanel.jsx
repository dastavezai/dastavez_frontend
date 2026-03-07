import React, { useState, useCallback } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Button, useColorModeValue,
  Spinner, Textarea, Select, Collapse, Tooltip, Tag, Divider,
  Radio, RadioGroup, Stack, useToast,
} from '@chakra-ui/react';
import { MdAutoFixHigh, MdExpandMore, MdExpandLess, MdContentCopy, MdGavel } from 'react-icons/md';
import { FaBalanceScale, FaQuoteRight, FaUserTie, FaShieldAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import fileService from '../../services/fileService';

const ArgumentBuilderPanel = ({ compact = false, onApplySuggestion, documentContext = '' }) => {
  const [topic, setTopic] = useState('');
  const [position, setPosition] = useState('petitioner');
  const [argType, setArgType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [arguments_, setArguments] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const headingColor = useColorModeValue('blue.700', 'blue.300');

  const buildArguments = useCallback(async () => {
    if (!topic.trim()) {
      toast({ title: 'Enter a legal issue or topic', status: 'warning', duration: 2000 });
      return;
    }
    setLoading(true);
    try {
      const posLabel = position === 'petitioner' ? 'Petitioner / Plaintiff / Appellant' : 'Respondent / Defendant';
      const typeInstructions = {
        comprehensive: 'Build a COMPREHENSIVE legal argument with all supporting points.',
        rebuttal: 'Build a REBUTTAL argument anticipating and countering the opponent\'s likely arguments.',
        constitutional: 'Focus on CONSTITUTIONAL law arguments — fundamental rights, directive principles, Article 14/19/21 analysis.',
        statutory: 'Focus on STATUTORY interpretation arguments — literal rule, mischief rule, harmonious construction.',
      };
      const prompt = `You are a senior Indian advocate preparing legal arguments. Build structured arguments for the **${posLabel}** on the following issue:

**Issue:** ${topic.trim()}

${documentContext ? `**Document Context (first 1500 chars):** ${documentContext.substring(0, 1500)}` : ''}

**Argument Style:** ${typeInstructions[argType]}

Return your response in this EXACT JSON format (no markdown outside JSON):
{
  "mainArgument": "One paragraph stating the core legal position",
  "supportingPoints": [
    {
      "heading": "Point heading",
      "argument": "Detailed argument text (2-3 sentences)",
      "legalBasis": "Relevant Act/Section/Article",
      "caseSupport": "Case name with citation if available"
    }
  ],
  "relevantStatutes": ["Section X of Y Act", "Article Z of Constitution"],
  "suggestedCases": [
    {"caseName": "...", "citation": "...", "relevance": "one line"}
  ],
  "counterPoints": [
    {"point": "Likely opponent argument", "rebuttal": "How to counter it"}
  ],
  "prayerSuggestion": "Suggested prayer/relief clause"
}

Provide 4-6 supporting points, 3-5 suggested cases, and 2-3 counter-points. All must be relevant to Indian law.`;

      const res = await fileService.aiChatAboutDocument(prompt, '', [], 'en');
      const raw = (res?.reply || res?.response || res?.message || '').trim();
      const jsonMatch = raw.match(/\{[\s\S]*"mainArgument"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setArguments(parsed);
      } else {
        setArguments({ mainArgument: raw, supportingPoints: [], relevantStatutes: [], suggestedCases: [], counterPoints: [], prayerSuggestion: '' });
      }
    } catch (err) {
      console.error('Argument builder error:', err);
      toast({ title: 'Failed to generate arguments', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [topic, position, argType, documentContext, toast]);

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInsertArgument = (text, title = 'Legal Argument') => {
    onApplySuggestion?.({
      title,
      description: `Insert argument into document`,
      originalText: '',
      suggestedText: text,
      type: 'insert_clause',
    });
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied', status: 'success', duration: 1000 });
    });
  };

  return (
    <VStack spacing={3} align="stretch" h="100%">
      <Box px={compact ? 2 : 3} pt={compact ? 2 : 3}>
        <VStack spacing={2} align="stretch">
          <Textarea
            placeholder="Enter legal issue, e.g. 'Wrongful termination of employment under Industrial Disputes Act'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            size="sm"
            fontSize="xs"
            rows={3}
            resize="none"
          />
          <HStack spacing={2}>
            <RadioGroup value={position} onChange={setPosition} size="sm">
              <Stack direction="row" spacing={3}>
                <Radio value="petitioner" size="sm">
                  <HStack spacing={1}>
                    <Icon as={FaUserTie} boxSize={3} color="blue.400" />
                    <Text fontSize="2xs">Petitioner</Text>
                  </HStack>
                </Radio>
                <Radio value="respondent" size="sm">
                  <HStack spacing={1}>
                    <Icon as={FaShieldAlt} boxSize={3} color="red.400" />
                    <Text fontSize="2xs">Respondent</Text>
                  </HStack>
                </Radio>
              </Stack>
            </RadioGroup>
          </HStack>
          <HStack spacing={2}>
            <Select
              size="xs"
              value={argType}
              onChange={(e) => setArgType(e.target.value)}
              fontSize="2xs"
              flex={1}
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="rebuttal">Rebuttal / Counter</option>
              <option value="constitutional">Constitutional</option>
              <option value="statutory">Statutory Interpretation</option>
            </Select>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={buildArguments}
              isLoading={loading}
              loadingText="Building..."
              fontSize="xs"
              leftIcon={<Icon as={FaBalanceScale} boxSize={3} />}
            >
              Build
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box flex={1} overflowY="auto" px={compact ? 2 : 3} pb={2}>
        {!arguments_ && !loading && (
          <VStack py={8} spacing={2}>
            <Icon as={MdAutoFixHigh} boxSize={8} color={mutedColor} />
            <Text fontSize="xs" color={mutedColor} textAlign="center">
              AI will build structured legal arguments with case law support
            </Text>
          </VStack>
        )}

        {loading && (
          <VStack py={8} spacing={2}>
            <Spinner size="lg" color="blue.400" />
            <Text fontSize="xs" color={mutedColor}>Building legal arguments...</Text>
          </VStack>
        )}

        {arguments_ && (
          <VStack spacing={3} align="stretch">
            <Box
              bg={cardBg} border="1px solid" borderColor={borderColor}
              borderLeft="3px solid" borderLeftColor="blue.400"
              borderRadius="md" p={3}
            >
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" fontWeight="bold" color={headingColor}>Core Position</Text>
                <HStack spacing={1}>
                  <Tooltip label="Insert into document" fontSize="xs" hasArrow>
                    <IconButtonWrapper
                      icon={FaQuoteRight}
                      onClick={() => handleInsertArgument(arguments_.mainArgument, 'Core Argument')}
                    />
                  </Tooltip>
                  <Tooltip label="Copy" fontSize="xs" hasArrow>
                    <IconButtonWrapper
                      icon={MdContentCopy}
                      onClick={() => handleCopyToClipboard(arguments_.mainArgument)}
                    />
                  </Tooltip>
                </HStack>
              </HStack>
              <Text fontSize="xs" color={textColor}>{arguments_.mainArgument}</Text>
            </Box>

            {arguments_.supportingPoints?.length > 0 && (
              <Box>
                <HStack
                  cursor="pointer"
                  onClick={() => toggleSection('points')}
                  py={1}
                >
                  <Text fontSize="xs" fontWeight="bold" color={headingColor}>
                    Supporting Points ({arguments_.supportingPoints.length})
                  </Text>
                  <Icon as={expandedSections.points ? MdExpandLess : MdExpandMore} color={mutedColor} />
                </HStack>
                <Collapse in={expandedSections.points !== false} startingHeight={0}>
                  <VStack spacing={2} align="stretch">
                    {arguments_.supportingPoints.map((pt, i) => (
                      <Box
                        key={i} bg={cardBg} border="1px solid" borderColor={borderColor}
                        borderRadius="md" p={2}
                      >
                        <HStack justify="space-between" align="start">
                          <Box flex={1}>
                            <Text fontSize="xs" fontWeight="bold" color={textColor}>
                              {i + 1}. {pt.heading}
                            </Text>
                            <Text fontSize="2xs" color={textColor} mt={1}>{pt.argument}</Text>
                            {pt.legalBasis && (
                              <Tag size="sm" colorScheme="teal" mt={1} fontSize="2xs">{pt.legalBasis}</Tag>
                            )}
                            {pt.caseSupport && (
                              <Text fontSize="2xs" color="purple.400" mt={1}>
                                <Icon as={MdGavel} boxSize={2.5} mr={0.5} />{pt.caseSupport}
                              </Text>
                            )}
                          </Box>
                          <Tooltip label="Insert this point" fontSize="xs" hasArrow>
                            <IconButtonWrapper
                              icon={FaQuoteRight}
                              onClick={() => handleInsertArgument(
                                `${pt.heading}: ${pt.argument}${pt.legalBasis ? ` (${pt.legalBasis})` : ''}${pt.caseSupport ? ` — See ${pt.caseSupport}` : ''}`,
                                `Argument: ${pt.heading}`
                              )}
                            />
                          </Tooltip>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Collapse>
              </Box>
            )}

            {arguments_.suggestedCases?.length > 0 && (
              <Box>
                <HStack
                  cursor="pointer"
                  onClick={() => toggleSection('cases')}
                  py={1}
                >
                  <Text fontSize="xs" fontWeight="bold" color="purple.400">
                    Supporting Case Law ({arguments_.suggestedCases.length})
                  </Text>
                  <Icon as={expandedSections.cases ? MdExpandLess : MdExpandMore} color={mutedColor} />
                </HStack>
                <Collapse in={expandedSections.cases !== false} startingHeight={0}>
                  <VStack spacing={1} align="stretch">
                    {arguments_.suggestedCases.map((c, i) => (
                      <HStack
                        key={i} bg={cardBg} border="1px solid" borderColor={borderColor}
                        borderRadius="md" p={2} spacing={2}
                      >
                        <Icon as={MdGavel} color="purple.400" boxSize={3} flexShrink={0} />
                        <Box flex={1}>
                          <Text fontSize="2xs" fontWeight="bold" color={textColor}>{c.caseName}</Text>
                          {c.citation && <Text fontSize="2xs" color="blue.500">{c.citation}</Text>}
                          <Text fontSize="2xs" color={mutedColor}>{c.relevance}</Text>
                        </Box>
                        <Tooltip label="Cite in document" fontSize="xs" hasArrow>
                          <IconButtonWrapper
                            icon={FaQuoteRight}
                            onClick={() => handleInsertArgument(
                              `As held in ${c.caseName}${c.citation ? ` (${c.citation})` : ''}, ${c.relevance}`,
                              `Cite: ${c.caseName}`
                            )}
                          />
                        </Tooltip>
                      </HStack>
                    ))}
                  </VStack>
                </Collapse>
              </Box>
            )}

            {arguments_.counterPoints?.length > 0 && (
              <Box>
                <HStack
                  cursor="pointer"
                  onClick={() => toggleSection('counter')}
                  py={1}
                >
                  <Text fontSize="xs" fontWeight="bold" color="red.400">
                    Anticipated Counter-Arguments ({arguments_.counterPoints.length})
                  </Text>
                  <Icon as={expandedSections.counter ? MdExpandLess : MdExpandMore} color={mutedColor} />
                </HStack>
                <Collapse in={expandedSections.counter !== false} startingHeight={0}>
                  <VStack spacing={2} align="stretch">
                    {arguments_.counterPoints.map((cp, i) => (
                      <Box
                        key={i} bg={cardBg} border="1px solid" borderColor={borderColor}
                        borderRadius="md" p={2}
                      >
                        <Text fontSize="2xs" fontWeight="bold" color="red.400">⚡ {cp.point}</Text>
                        <Text fontSize="2xs" color="green.500" mt={1}>✓ Rebuttal: {cp.rebuttal}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Collapse>
              </Box>
            )}

            {arguments_.relevantStatutes?.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color={headingColor} mb={1}>Relevant Statutes</Text>
                <HStack spacing={1} flexWrap="wrap">
                  {arguments_.relevantStatutes.map((s, i) => (
                    <Tag key={i} size="sm" colorScheme="teal" fontSize="2xs">{s}</Tag>
                  ))}
                </HStack>
              </Box>
            )}

            {arguments_.prayerSuggestion && (
              <Box
                bg={cardBg} border="1px solid" borderColor={borderColor}
                borderLeft="3px solid" borderLeftColor="green.400"
                borderRadius="md" p={2}
              >
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs" fontWeight="bold" color="green.500">Suggested Prayer</Text>
                  <Tooltip label="Insert prayer into document" fontSize="xs" hasArrow>
                    <IconButtonWrapper
                      icon={FaQuoteRight}
                      onClick={() => handleInsertArgument(arguments_.prayerSuggestion, 'Prayer Clause')}
                    />
                  </Tooltip>
                </HStack>
                <Text fontSize="2xs" color={textColor}>{arguments_.prayerSuggestion}</Text>
              </Box>
            )}

            <Button
              size="sm"
              colorScheme="green"
              variant="outline"
              fontSize="xs"
              onClick={() => {
                const fullText = [
                  arguments_.mainArgument,
                  '',
                  ...(arguments_.supportingPoints || []).map((pt, i) =>
                    `${i + 1}. ${pt.heading}: ${pt.argument}${pt.legalBasis ? ` (${pt.legalBasis})` : ''}${pt.caseSupport ? ` — ${pt.caseSupport}` : ''}`
                  ),
                  '',
                  arguments_.prayerSuggestion ? `PRAYER: ${arguments_.prayerSuggestion}` : '',
                ].filter(Boolean).join('\n\n');
                handleInsertArgument(fullText, 'Complete Legal Argument');
              }}
            >
              Insert All Arguments into Document
            </Button>
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

const IconButtonWrapper = ({ icon, onClick }) => (
  <Button size="xs" variant="ghost" p={0} minW="auto" h="auto" onClick={onClick}>
    <Icon as={icon} boxSize={3} />
  </Button>
);

export default ArgumentBuilderPanel;
