import React, { useState, useEffect, useRef } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Divider,
  Collapse, Button, useColorModeValue, Flex, Image,
  Skeleton, SkeletonCircle, Tooltip, Tag, Spinner,
  Progress, useToast,
} from '@chakra-ui/react';
import { MdGavel, MdExpandMore, MdExpandLess, MdAutoFixHigh, MdOutlineShield } from 'react-icons/md';
import { FaBalanceScale, FaExternalLinkAlt, FaRobot, FaSearch } from 'react-icons/fa';
import { FiSearch, FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';
import fileService from '../../services/fileService';


const wikiCache = {};

async function fetchWikiSummary(caseName) {
  if (!caseName) return null;
  if (wikiCache[caseName] !== undefined) return wikiCache[caseName];
  const encoded = encodeURIComponent(caseName.trim());
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) { wikiCache[caseName] = null; return null; }
    const d = await res.json();
    const result = {
      extract: d.extract || '',
      thumbnail: d.thumbnail?.source || d.originalimage?.source || null,
      wikiUrl: d.content_urls?.desktop?.page || null,
    };
    wikiCache[caseName] = result;
    return result;
  } catch {
    wikiCache[caseName] = null;
    return null;
  }
}

const RELEVANCE_COLOR = (rel = '') => {
  const l = rel.toLowerCase();
  if (l.includes('high') || l.includes('direct') || l.includes('primary')) return 'green';
  if (l.includes('medium') || l.includes('moderate')) return 'orange';
  return 'blue';
};


const CaseCard = ({ p, compact, onFollowUp, onApplySuggestion, onFindCaseInDoc }) => {
  const [isOpen, setIsOpen]     = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [wiki, setWiki]         = useState(undefined);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [llmData, setLlmData]   = useState(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [strengthScore, setStrengthScore] = useState(null);
  const [strengthLoading, setStrengthLoading] = useState(false);
  const [counterArgs, setCounterArgs] = useState(null);
  const [counterLoading, setCounterLoading] = useState(false);
  const fetchedRef = useRef(false);
  const toast = useToast();

  
  const enriched = { ...p, ...(llmData || {}) };

  const borderColor    = useColorModeValue('gray.200', 'gray.600');
  const cardBg         = useColorModeValue('white', 'gray.800');
  const expandedBg     = useColorModeValue('gray.50', 'gray.750');
  const mutedColor     = useColorModeValue('gray.500', 'gray.400');
  const textColor      = useColorModeValue('gray.800', 'gray.100');
  const citationColor  = useColorModeValue('blue.600', 'blue.300');
  const principleBoxBg = useColorModeValue('purple.50', 'purple.900');
  const wikiBoxBg      = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    if (!isOpen || fetchedRef.current) return;
    fetchedRef.current = true;
    setWikiLoading(true);
    fetchWikiSummary(p.caseName).then(data => {
      setWiki(data);
      setWikiLoading(false);
    });
  }, [isOpen, p.caseName]);

  const handleAugmentWithLLM = async (e) => {
    e.stopPropagation();
    setLlmLoading(true);
    try {
      const result = await fileService.getCaseAugmentation(p.caseName, false);
      if (result) {
        setLlmData(result);
        if (result.wiki && !wiki) setWiki(result.wiki);
      }
    } catch (err) {
      console.warn('LLM augment failed:', err.message);
    } finally {
      setLlmLoading(false);
    }
  };

  const handleFollowUp = (e) => {
    e.stopPropagation();
    onFollowUp?.(enriched);
  };

  const handleApplyPrinciple = (e) => {
    e.stopPropagation();
    const principleText = enriched.legalPrinciple || enriched.holding || enriched.summary || '';
    if (!principleText) return;
    const caseName  = enriched.caseName  || '';
    const citation  = enriched.citation  || '';
    onApplySuggestion?.({
      title: `Cite: ${caseName}`,
      description: `Semantically apply legal principle from ${caseName} into the most relevant paragraph`,
      originalText: '',
      suggestedText: `As held in ${caseName}${citation ? ` (${citation})` : ''}: ${principleText}`,
      type: 'precedence_apply',
      idempotencyKey: `${caseName}::${citation}`,
      caseName,
      citation,
      principle: principleText,
    });
  };

  
  const handleStrengthCheck = async (e) => {
    e.stopPropagation();
    setStrengthLoading(true);
    try {
      const caseName = enriched.caseName || '';
      const court = enriched.court || '';
      const year = enriched.year || '';
      const prompt = `Rate the legal authority strength of the Indian case "${caseName}" ${court ? `(${court}${year ? ', ' + year : ''})` : ''} on a scale of 1-5 where: 1=Weak/Overruled, 2=Limited Authority, 3=Moderate/Persuasive, 4=Strong/Binding in that court, 5=Landmark/Constitution Bench. Reply ONLY with a JSON object: {"score": <number>, "reason": "<one line explanation>"}`;
      const res = await fileService.aiChatAboutDocument({
        message: prompt,
        selectedText: '',
        chatHistory: [],
        language: 'English',
      });
      const text = res?.reply || res?.message || '';
      const jsonMatch = text.match(/\{[\s\S]*?"score"[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setStrengthScore({ score: Math.min(5, Math.max(1, parsed.score || 3)), reason: parsed.reason || '' });
      } else {
        setStrengthScore({ score: 3, reason: 'Could not determine precisely' });
      }
    } catch (err) {
      console.warn('Strength check failed:', err.message);
      toast({ title: 'Strength check failed', status: 'warning', duration: 2000 });
    } finally {
      setStrengthLoading(false);
    }
  };

  
  const handleFindCounterArgs = async (e) => {
    e.stopPropagation();
    setCounterLoading(true);
    try {
      const caseName = enriched.caseName || '';
      const principle = enriched.legalPrinciple || enriched.holding || enriched.summary || '';
      const prompt = `For the Indian legal case "${caseName}" which held: "${principle.substring(0, 300)}", identify 2-3 counter-arguments or opposing precedents that could be used against it. Reply ONLY with a JSON object: {"counterArguments": [{"caseName": "...", "argument": "one line"}]}`;
      const res = await fileService.aiChatAboutDocument({
        message: prompt,
        selectedText: '',
        chatHistory: [],
        language: 'English',
      });
      const text = res?.reply || res?.message || '';
      const jsonMatch = text.match(/\{[\s\S]*?"counterArguments"[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setCounterArgs(parsed.counterArguments || []);
      } else {
        setCounterArgs([{ caseName: 'N/A', argument: 'Could not determine counter-arguments for this case.' }]);
      }
    } catch (err) {
      console.warn('Counter-args failed:', err.message);
      toast({ title: 'Counter-arguments lookup failed', status: 'warning', duration: 2000 });
    } finally {
      setCounterLoading(false);
    }
  };

  
  const indianKanoonUrl = enriched.caseName
    ? `https://indiankanoon.org/search/?formInput=${encodeURIComponent(enriched.caseName)}`
    : null;
  const sccOnlineUrl = enriched.caseName
    ? `https://www.scconline.com/Members/SearchResult.aspx#FT=${encodeURIComponent(enriched.caseName)}`
    : null;

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderLeft="3px solid"
      borderLeftColor={isOpen ? 'purple.500' : 'purple.300'}
      borderRadius="md"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <Box
        px={3} py={compact ? 2 : 2.5}
        cursor="pointer"
        onClick={() => setIsOpen(v => !v)}
        _hover={{ bg: useColorModeValue('purple.50', 'gray.700') }}
      >
        <HStack justify="space-between" align="start" spacing={2}>
          <VStack align="start" spacing={0.5} flex={1} minW={0}>
            <Text fontWeight="semibold" fontSize={compact ? 'xs' : 'sm'} color={textColor} noOfLines={isOpen ? undefined : 2} lineHeight="1.4">
              {enriched.caseName || 'Unknown Case'}
            </Text>
            <Text fontSize="2xs" color={citationColor} fontFamily="mono" letterSpacing="0.03em">
              {enriched.citation || 'Citation not available'}
            </Text>
          </VStack>
          <HStack spacing={1} flexShrink={0}>
            {enriched.relevance && (
              <Badge colorScheme={RELEVANCE_COLOR(enriched.relevance)} fontSize="2xs" variant="subtle" maxW="80px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {enriched.relevance.length > 14 ? enriched.relevance.substring(0, 14) + '…' : enriched.relevance}
              </Badge>
            )}
            <Icon as={isOpen ? MdExpandLess : MdExpandMore} color={mutedColor} boxSize={4} />
          </HStack>
        </HStack>
      </Box>

      <Collapse in={isOpen} animateOpacity>
        <Divider borderColor={borderColor} />
        <Box px={3} py={3} bg={expandedBg}>

          
          {wikiLoading && (
            <HStack spacing={3} mb={3}>
              <Skeleton boxSize="64px" borderRadius="md" />
              <VStack align="start" flex={1} spacing={1}>
                <Skeleton h="10px" w="80%" /><Skeleton h="10px" w="60%" /><Skeleton h="10px" w="70%" />
              </VStack>
            </HStack>
          )}
          {!wikiLoading && wiki && (
            <HStack align="start" spacing={3} mb={3} p={2} bg={wikiBoxBg} borderRadius="md">
              {wiki.thumbnail ? (
                <Image
                  src={wiki.thumbnail} alt={enriched.caseName}
                  boxSize={compact ? '52px' : '68px'} objectFit="cover" borderRadius="md" flexShrink={0}
                  fallback={<Box boxSize={compact ? '52px' : '68px'} bg="purple.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center"><Icon as={FaBalanceScale} color="purple.400" boxSize={5} /></Box>}
                />
              ) : (
                <Box boxSize={compact ? '52px' : '68px'} bg="purple.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                  <Icon as={FaBalanceScale} color="purple.400" boxSize={5} />
                </Box>
              )}
              <VStack align="start" spacing={1} flex={1} minW={0}>
                <Badge colorScheme="blue" fontSize="2xs" variant="subtle">Wikipedia</Badge>
                {wiki.extract && (
                  <Text fontSize="xs" color={textColor} noOfLines={5} lineHeight="1.5">{wiki.extract}</Text>
                )}
                {wiki.wikiUrl && (
                  <Button as="a" href={wiki.wikiUrl} target="_blank" rel="noopener noreferrer" size="xs" variant="link" colorScheme="blue" rightIcon={<Icon as={FaExternalLinkAlt} boxSize={2.5} />} fontSize="2xs" onClick={e => e.stopPropagation()}>
                    Read full article
                  </Button>
                )}
              </VStack>
            </HStack>
          )}
          {!wikiLoading && !wiki && !llmData && (
            <Box mb={3} p={2} borderRadius="md" bg={useColorModeValue('gray.100', 'gray.700')} textAlign="center">
              <Text fontSize="xs" color={mutedColor} mb={1}>No Wikipedia summary found.</Text>
              <Button
                size="xs"
                colorScheme="purple"
                variant="outline"
                leftIcon={llmLoading ? <Spinner size="xs" /> : <Icon as={FaRobot} boxSize={3} />}
                fontSize="2xs"
                isLoading={llmLoading}
                loadingText="Fetching…"
                onClick={handleAugmentWithLLM}
              >
                Augment with AI ✨
              </Button>
            </Box>
          )}

          <VStack spacing={2.5} align="stretch">
            {enriched.relevance && (
              <Box>
                <Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase" mb={0.5}>Relevance to document</Text>
                <Text fontSize="xs" color={textColor} lineHeight="1.6">{enriched.relevance}</Text>
              </Box>
            )}
            {(enriched.court || enriched.year) && (
              <HStack spacing={4}>
                {enriched.court && <Box><Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase">Court</Text><Text fontSize="xs" color={textColor}>{enriched.court}</Text></Box>}
                {enriched.year  && <Box><Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase">Year</Text><Text fontSize="xs" color={textColor}>{enriched.year}</Text></Box>}
                {enriched.bench && <Box><Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase">Bench</Text><Text fontSize="xs" color={textColor} noOfLines={2}>{enriched.bench}</Text></Box>}
              </HStack>
            )}
            {(enriched.keyFacts || enriched.summary) && (
              <Box>
                <Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase" mb={0.5}>Case Summary</Text>
                <Text fontSize="xs" color={textColor} lineHeight="1.7">{enriched.keyFacts || enriched.summary}</Text>
              </Box>
            )}
            {(enriched.legalPrinciple || enriched.holding) && (
              <Box bg={principleBoxBg} border="1px solid" borderColor={useColorModeValue('purple.200','purple.700')} borderRadius="md" px={2.5} py={2}>
                <Text fontSize="2xs" color="purple.500" fontWeight="bold" textTransform="uppercase" mb={0.5}>Legal Principle / Holding</Text>
                <Text fontSize="xs" color={textColor} lineHeight="1.7" fontStyle="italic">"{enriched.legalPrinciple || enriched.holding}"</Text>
              </Box>
            )}
            {enriched.significance && (
              <Box>
                <Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase" mb={0.5}>Doctrinal Significance</Text>
                <Text fontSize="xs" color={textColor} lineHeight="1.7">{enriched.significance}</Text>
              </Box>
            )}
            {enriched.applicationToCase && (
              <Box>
                <Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase" mb={0.5}>Application to This Case</Text>
                <Text fontSize="xs" color={textColor} lineHeight="1.7">{enriched.applicationToCase}</Text>
              </Box>
            )}
            {enriched.relatedCases?.length > 0 && (
              <Box>
                <Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase" mb={0.5}>Related Cases</Text>
                <VStack align="start" spacing={0.5}>
                  {enriched.relatedCases.slice(0, 3).map((rc, i) => (
                    <Text key={i} fontSize="xs" color={citationColor} fontFamily="mono">{rc}</Text>
                  ))}
                </VStack>
              </Box>
            )}
            {enriched.keywords?.length > 0 && (
              <HStack spacing={1} flexWrap="wrap">
                {enriched.keywords.slice(0, 6).map((kw, i) => (
                  <Tag key={i} size="sm" colorScheme="purple" variant="subtle" fontSize="2xs">{kw}</Tag>
                ))}
              </HStack>
            )}
          </VStack>

          <HStack spacing={2} mt={3} justify="flex-end" flexWrap="wrap">
            {onFindCaseInDoc && enriched.caseName && (
              <Tooltip label="Scroll to where this case is cited in the document" fontSize="xs" placement="top">
                <Button
                  size="xs"
                  colorScheme="teal"
                  variant="ghost"
                  leftIcon={<Icon as={FiSearch} boxSize={3} />}
                  fontSize="2xs"
                  onClick={(e) => { e.stopPropagation(); onFindCaseInDoc(enriched.caseName); }}
                >
                  Find in Doc
                </Button>
              </Tooltip>
            )}
            {enriched.citation || enriched.caseName ? (
              <Tooltip label="Copy full citation to clipboard" fontSize="xs" placement="top">
                <Button
                  size="xs"
                  colorScheme={copiedCitation ? 'green' : 'gray'}
                  variant="ghost"
                  leftIcon={<Icon as={copiedCitation ? FiCheck : FiCopy} boxSize={3} />}
                  fontSize="2xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    const citeStr = enriched.citation
                      ? `${enriched.caseName} (${enriched.citation})`
                      : enriched.caseName;
                    navigator.clipboard.writeText(citeStr).then(() => {
                      setCopiedCitation(true);
                      setTimeout(() => setCopiedCitation(false), 2000);
                    });
                  }}
                >
                  {copiedCitation ? 'Copied!' : 'Copy Citation'}
                </Button>
              </Tooltip>
            ) : null}
            {!llmData && wiki && (
              <Tooltip label="Enrich with deeper AI-sourced legal details" fontSize="xs" placement="top">
                <Button
                  size="xs"
                  colorScheme="purple"
                  variant="ghost"
                  leftIcon={llmLoading ? <Spinner size="xs" /> : <Icon as={FaRobot} boxSize={3} />}
                  fontSize="2xs"
                  isLoading={llmLoading}
                  loadingText="Augmenting…"
                  onClick={handleAugmentWithLLM}
                >
                  AI Details ✨
                </Button>
              </Tooltip>
            )}
            {onApplySuggestion && (enriched.legalPrinciple || enriched.holding || enriched.summary) && (
              <Tooltip label="Insert this case's citation & principle into document" fontSize="xs" placement="top">
                <Button size="xs" colorScheme="purple" variant="outline" leftIcon={<Icon as={MdAutoFixHigh} boxSize={3} />} fontSize="2xs" onClick={handleApplyPrinciple}>
                  Apply Principle
                </Button>
              </Tooltip>
            )}
            {onFollowUp && (
              <Tooltip label="Analyse this case further with Law AI Helper" fontSize="xs" placement="top">
                <Button size="xs" colorScheme="blue" variant="solid" leftIcon={<Icon as={FaRobot} boxSize={3} />} fontSize="2xs" onClick={handleFollowUp}>
                  Follow up in AI ↗
                </Button>
              </Tooltip>
            )}
          </HStack>

          <HStack spacing={2} mt={2} flexWrap="wrap">
            {indianKanoonUrl && (
              <Button as="a" href={indianKanoonUrl} target="_blank" rel="noopener noreferrer"
                size="xs" variant="outline" colorScheme="orange" fontSize="2xs"
                leftIcon={<Icon as={FiExternalLink} boxSize={3} />}
                onClick={e => e.stopPropagation()}>
                Indian Kanoon
              </Button>
            )}
            {sccOnlineUrl && (
              <Button as="a" href={sccOnlineUrl} target="_blank" rel="noopener noreferrer"
                size="xs" variant="outline" colorScheme="red" fontSize="2xs"
                leftIcon={<Icon as={FiExternalLink} boxSize={3} />}
                onClick={e => e.stopPropagation()}>
                SCC Online
              </Button>
            )}
          </HStack>

          <Box mt={3}>
            {!strengthScore && (
              <Button size="xs" variant="ghost" colorScheme="teal" fontSize="2xs"
                leftIcon={strengthLoading ? <Spinner size="xs" /> : <Icon as={MdOutlineShield} boxSize={3} />}
                isLoading={strengthLoading} loadingText="Evaluating…"
                onClick={handleStrengthCheck}>
                Check Legal Strength
              </Button>
            )}
            {strengthScore && (
              <Box p={2} bg={useColorModeValue('teal.50', 'teal.900')} borderRadius="md" border="1px solid" borderColor={useColorModeValue('teal.200', 'teal.700')}>
                <HStack spacing={2} mb={1}>
                  <Icon as={MdOutlineShield} color="teal.500" boxSize={3.5} />
                  <Text fontSize="xs" fontWeight="bold" color="teal.600">Legal Strength: {strengthScore.score}/5</Text>
                </HStack>
                <Progress value={strengthScore.score * 20} size="xs" borderRadius="full"
                  colorScheme={strengthScore.score >= 4 ? 'green' : strengthScore.score >= 3 ? 'yellow' : 'red'} mb={1} />
                {strengthScore.reason && <Text fontSize="2xs" color={mutedColor}>{strengthScore.reason}</Text>}
              </Box>
            )}
          </Box>

          <Box mt={2}>
            {!counterArgs && (enriched.legalPrinciple || enriched.holding || enriched.summary) && (
              <Button size="xs" variant="ghost" colorScheme="red" fontSize="2xs"
                leftIcon={counterLoading ? <Spinner size="xs" /> : <Icon as={FaBalanceScale} boxSize={3} />}
                isLoading={counterLoading} loadingText="Finding…"
                onClick={handleFindCounterArgs}>
                Find Counter-Arguments
              </Button>
            )}
            {counterArgs && counterArgs.length > 0 && (
              <Box p={2} bg={useColorModeValue('red.50', 'red.900')} borderRadius="md" border="1px solid" borderColor={useColorModeValue('red.200', 'red.700')}>
                <Text fontSize="xs" fontWeight="bold" color="red.500" mb={1}>⚖️ Counter-Arguments</Text>
                <VStack align="start" spacing={1.5}>
                  {counterArgs.map((ca, i) => (
                    <Box key={i}>
                      <Text fontSize="xs" fontWeight="semibold" color={citationColor}>{ca.caseName}</Text>
                      <Text fontSize="2xs" color={textColor} lineHeight="1.5">{ca.argument}</Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>

          {enriched.relatedCases?.length > 0 && (
            <Box mt={3} p={2} bg={useColorModeValue('purple.50', 'gray.750')} borderRadius="md" border="1px solid" borderColor={useColorModeValue('purple.200', 'purple.700')}>
              <Text fontSize="xs" fontWeight="bold" color="purple.500" mb={2}>🔗 Case Relationship Map</Text>
              <Flex align="center" justify="center" flexWrap="wrap" gap={2}>
                <Box px={3} py={1.5} bg="purple.500" color="white" borderRadius="md" fontSize="xs" fontWeight="bold" textAlign="center" maxW="180px" noOfLines={1}>
                  {enriched.caseName?.split(' ').slice(0, 4).join(' ')}
                </Box>
                {enriched.relatedCases.slice(0, 4).map((rc, i) => (
                  <React.Fragment key={i}>
                    <Text fontSize="xs" color="purple.400">→</Text>
                    <Tooltip label={`Search "${rc}" on Indian Kanoon`} fontSize="xs" placement="top">
                      <Box
                        as="a"
                        href={`https://indiankanoon.org/search/?formInput=${encodeURIComponent(rc)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        px={2} py={1}
                        bg={useColorModeValue('white', 'gray.700')}
                        border="1px solid" borderColor="purple.300" borderRadius="md"
                        fontSize="2xs" color={textColor} maxW="160px" noOfLines={1}
                        cursor="pointer"
                        _hover={{ borderColor: 'purple.500', bg: useColorModeValue('purple.50', 'gray.600') }}
                        onClick={e => e.stopPropagation()}
                      >
                        {rc}
                      </Box>
                    </Tooltip>
                  </React.Fragment>
                ))}
              </Flex>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};


const PrecedencePanel = ({ precedences = [], compact = false, onFollowUp, onApplySuggestion, onFindCaseInDoc }) => {
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  if (!precedences || precedences.length === 0) {
    return (
      <Box textAlign="center" py={compact ? 4 : 8} color={mutedColor}>
        <Icon as={FaBalanceScale} boxSize={compact ? 6 : 10} mb={2} opacity={0.3} />
        <Text fontSize="sm">No precedences found for this document.</Text>
        {!compact && (
          <Text fontSize="xs" mt={1} color={mutedColor}>Precedences are generated automatically during scanning.</Text>
        )}
      </Box>
    );
  }

  return (
    <VStack spacing={compact ? 2 : 3} align="stretch">
      {!compact && (
        <HStack spacing={2} mb={1}>
          <Icon as={MdGavel} color="purple.400" />
          <Text fontWeight="bold" fontSize="sm">
            Case Precedences <Badge ml={1} colorScheme="purple" fontSize="xs">{precedences.length}</Badge>
          </Text>
          <Text fontSize="2xs" color={mutedColor} ml="auto">Click to expand · Follow up in AI</Text>
        </HStack>
      )}
      {precedences.map((p, idx) => (
        <CaseCard
          key={idx} p={p} compact={compact}
          onFollowUp={onFollowUp}
          onApplySuggestion={onApplySuggestion}
          onFindCaseInDoc={onFindCaseInDoc}
        />
      ))}
    </VStack>
  );
};

export default PrecedencePanel;
