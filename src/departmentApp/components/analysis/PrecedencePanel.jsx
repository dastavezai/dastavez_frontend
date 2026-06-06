import React, { useState, useEffect, useRef } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Divider,
  Collapse, Button, useColorModeValue, Flex, Image,
  Skeleton, SkeletonCircle, Tooltip, Tag, Spinner,
  Progress, useToast, Alert, AlertIcon, Input,
} from '@chakra-ui/react';
import { MdGavel, MdExpandMore, MdExpandLess, MdAutoFixHigh, MdOutlineShield } from 'react-icons/md';
import { FaBalanceScale, FaExternalLinkAlt, FaRobot, FaSearch, FaBookOpen } from 'react-icons/fa';
import { FiSearch, FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';
import fileService from '../../services/fileService';


const wikiCache = {};

async function fetchWikiSummary(caseName) {
  if (!caseName) return null;
  if (wikiCache[caseName] !== undefined) return wikiCache[caseName];
  const trimmed = caseName.trim();
  const opts = { headers: { Accept: 'application/json' } };

  const tryFetch = async (title) => {
    const encoded = encodeURIComponent(title);
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      opts
    );
    if (!res.ok) return null;
    const d = await res.json();
    return {
      extract: d.extract || '',
      thumbnail: d.thumbnail?.source || d.originalimage?.source || null,
      wikiUrl: d.content_urls?.desktop?.page || null,
    };
  };

  try {
    let result = await tryFetch(trimmed);
    if (!result && trimmed.includes(' ')) {
      const wikiTitle = trimmed.replace(/\s+/g, '_');
      result = await tryFetch(wikiTitle);
    }
    if (!result) {
      const mediaWikiRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(trimmed.replace(/\s+/g, '_'))}&prop=extracts|pageimages&exintro=1&explaintext=1&exchars=500&format=json&origin=*`,
        opts
      );
      if (mediaWikiRes.ok) {
        const mw = await mediaWikiRes.json();
        const pages = mw?.query?.pages || {};
        const page = Object.values(pages).find((p) => p.pageid > 0 && p.extract);
        if (page) {
          result = {
            extract: page.extract || '',
            thumbnail: page.thumbnail?.source || null,
            wikiUrl: page.pageid ? `https://en.wikipedia.org/wiki/?curid=${page.pageid}` : null,
          };
        }
      }
    }
    wikiCache[caseName] = result || null;
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


const StatuteCard = ({ statute, compact, onFollowUp, onFindCaseInDoc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [sectionAnalysis, setSectionAnalysis] = useState(null);
  const [sectionLoading, setSectionLoading] = useState(false);
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const expandedBg = useColorModeValue('gray.50', 'gray.750');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const contextBg = useColorModeValue('blue.50', 'blue.900');
  const warningBg = useColorModeValue('orange.50', 'orange.900');

  const indianKanoonUrl = statute.name
    ? `https://indiankanoon.org/search/?formInput=${encodeURIComponent(statute.name + (statute.sections ? ' section ' + statute.sections : ''))}`
    : null;

  const handleCopyRef = (e) => {
    e.stopPropagation();
    const refStr = statute.sections
      ? `${statute.name}, ${statute.sections}`
      : statute.name;
    navigator.clipboard.writeText(refStr).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    });
  };

  const handleAnalyseSections = async (e) => {
    e.stopPropagation();
    setSectionLoading(true);
    try {
      const prompt = `For the Indian statute "${statute.name}"${statute.sections ? `, specifically ${statute.sections}` : ''}: provide a brief analysis of the key provisions and their practical effect. Reply ONLY with a JSON object: {"provisions": [{"section": "...", "title": "short title", "effect": "one line practical effect"}], "currentStatus": "in force / superseded / partially amended", "lastAmendment": "year or N/A"}`;
      const res = await fileService.aiChatAboutDocument({
        message: prompt,
        selectedText: '',
        chatHistory: [],
        language: 'English',
      });
      const text = res?.reply || res?.message || '';
      const jsonMatch = text.match(/\{[\s\S]*?"provisions"[\s\S]*?\}/);
      if (jsonMatch) {
        setSectionAnalysis(JSON.parse(jsonMatch[0]));
      }
    } catch (err) {
      console.warn('Section analysis failed:', err.message);
      toast({ title: 'Section analysis failed', status: 'warning', duration: 2000 });
    } finally {
      setSectionLoading(false);
    }
  };

  const handleFollowUp = (e) => {
    e.stopPropagation();
    onFollowUp?.({
      caseName: statute.name,
      citation: statute.sections ? `Sections ${statute.sections}` : '',
      relevance: statute.relevance || '',
      summary: statute.relevance || '',
      isStatute: true,
    });
  };

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderLeft="3px solid"
      borderLeftColor={isOpen ? 'teal.500' : 'teal.300'}
      borderRadius="md"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <Box
        px={3} py={compact ? 2 : 2.5}
        cursor="pointer"
        onClick={() => setIsOpen(v => !v)}
        _hover={{ bg: useColorModeValue('teal.50', 'gray.700') }}
      >
        <HStack justify="space-between" align="start" spacing={2}>
          <VStack align="start" spacing={0.5} flex={1} minW={0}>
            <HStack spacing={1.5}>
              <Icon as={FaBookOpen} color="teal.400" boxSize={3.5} flexShrink={0} />
              <Text fontWeight="semibold" fontSize={compact ? 'xs' : 'sm'} color={textColor} noOfLines={isOpen ? undefined : 2} lineHeight="1.4">
                {statute.name || 'Unknown Statute'}
              </Text>
            </HStack>
            {statute.sections && (
              <Text fontSize="2xs" color="teal.600" fontFamily="mono" letterSpacing="0.03em" ml={5}>
                Sections: {statute.sections}
              </Text>
            )}
          </VStack>
          <HStack spacing={1} flexShrink={0}>
            {statute.superseded && (
              <Badge colorScheme="orange" fontSize="2xs" variant="subtle">Superseded</Badge>
            )}
            <Badge colorScheme="teal" fontSize="2xs" variant="subtle">Statute</Badge>
            <Icon as={isOpen ? MdExpandLess : MdExpandMore} color={mutedColor} boxSize={4} />
          </HStack>
        </HStack>
      </Box>

      <Collapse in={isOpen} animateOpacity>
        <Divider borderColor={borderColor} />
        <Box px={3} py={3} bg={expandedBg}>
          <VStack spacing={2.5} align="stretch">
            {/* Superseded warning */}
            {statute.superseded && (
              <Alert status="warning" borderRadius="md" py={2} px={3} fontSize="xs">
                <AlertIcon boxSize={4} />
                <Box>
                  <Text fontWeight="bold" fontSize="xs">This statute has been superseded</Text>
                  <Text fontSize="2xs">
                    Replaced by <strong>{statute.superseded.by}</strong> w.e.f. {statute.superseded.date}.
                    Consider updating references in this document.
                  </Text>
                </Box>
              </Alert>
            )}

            {/* Relevance to document */}
            {statute.relevance && (
              <Box>
                <Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase" mb={0.5}>Relevance to document</Text>
                <Text fontSize="xs" color={textColor} lineHeight="1.6">{statute.relevance}</Text>
              </Box>
            )}

            {/* Document context snippet */}
            {statute.documentContext && (
              <Box p={2} bg={contextBg} borderRadius="md" border="1px solid" borderColor={useColorModeValue('blue.200', 'blue.700')}>
                <Text fontSize="2xs" color={mutedColor} fontWeight="bold" textTransform="uppercase" mb={0.5}>Referenced in document</Text>
                <Text fontSize="xs" color={textColor} lineHeight="1.6" fontStyle="italic">"{statute.documentContext}"</Text>
              </Box>
            )}

            {/* Section analysis (on demand) */}
            {sectionAnalysis && (
              <Box p={2} bg={useColorModeValue('green.50', 'green.900')} borderRadius="md" border="1px solid" borderColor={useColorModeValue('green.200', 'green.700')}>
                <Text fontSize="xs" fontWeight="bold" color="green.600" mb={1}>Section Analysis</Text>
                {sectionAnalysis.currentStatus && (
                  <Badge colorScheme={sectionAnalysis.currentStatus.includes('superseded') ? 'orange' : 'green'} fontSize="2xs" mb={1}>
                    {sectionAnalysis.currentStatus}
                  </Badge>
                )}
                {sectionAnalysis.provisions?.map((prov, i) => (
                  <Box key={i} mb={1}>
                    <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                      {prov.section}{prov.title ? ` — ${prov.title}` : ''}
                    </Text>
                    <Text fontSize="2xs" color={mutedColor} lineHeight="1.5">{prov.effect}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </VStack>

          {/* Action buttons */}
          <HStack spacing={2} mt={3} justify="flex-end" flexWrap="wrap">
            {onFindCaseInDoc && statute.name && (
              <Tooltip label="Find where this statute is cited in the document" fontSize="xs" placement="top">
                <Button
                  size="xs" colorScheme="teal" variant="ghost"
                  leftIcon={<Icon as={FiSearch} boxSize={3} />} fontSize="2xs"
                  onClick={(e) => { e.stopPropagation(); onFindCaseInDoc(statute.name.replace(/,?\s*\d{4}$/, '')); }}
                >
                  Find in Doc
                </Button>
              </Tooltip>
            )}
            <Tooltip label="Copy statute reference to clipboard" fontSize="xs" placement="top">
              <Button
                size="xs" colorScheme={copiedRef ? 'green' : 'gray'} variant="ghost"
                leftIcon={<Icon as={copiedRef ? FiCheck : FiCopy} boxSize={3} />} fontSize="2xs"
                onClick={handleCopyRef}
              >
                {copiedRef ? 'Copied!' : 'Copy Ref'}
              </Button>
            </Tooltip>
            {statute.sections && !sectionAnalysis && (
              <Tooltip label="AI analysis of the cited sections" fontSize="xs" placement="top">
                <Button
                  size="xs" colorScheme="green" variant="ghost"
                  leftIcon={sectionLoading ? <Spinner size="xs" /> : <Icon as={FaRobot} boxSize={3} />}
                  fontSize="2xs" isLoading={sectionLoading} loadingText="Analysing…"
                  onClick={handleAnalyseSections}
                >
                  Analyse Sections
                </Button>
              </Tooltip>
            )}
            {onFollowUp && (
              <Tooltip label="Discuss this statute further with Law AI Helper" fontSize="xs" placement="top">
                <Button size="xs" colorScheme="blue" variant="solid"
                  leftIcon={<Icon as={FaRobot} boxSize={3} />} fontSize="2xs"
                  onClick={handleFollowUp}
                >
                  Follow up in AI
                </Button>
              </Tooltip>
            )}
          </HStack>

          {/* External links */}
          <HStack spacing={2} mt={2} flexWrap="wrap">
            {indianKanoonUrl && (
              <Button as="a" href={indianKanoonUrl} target="_blank" rel="noopener noreferrer"
                size="xs" variant="outline" colorScheme="orange" fontSize="2xs"
                leftIcon={<Icon as={FiExternalLink} boxSize={3} />}
                onClick={e => e.stopPropagation()}>
                Indian Kanoon
              </Button>
            )}
            <Button as="a"
              href={`https://www.indiacode.nic.in/handle/123456789/1362/simple-search?searchterm=${encodeURIComponent(statute.name.replace(/,?\s*\d{4}$/, ''))}&start=0`}
              target="_blank" rel="noopener noreferrer"
              size="xs" variant="outline" colorScheme="blue" fontSize="2xs"
              leftIcon={<Icon as={FiExternalLink} boxSize={3} />}
              onClick={e => e.stopPropagation()}>
              India Code
            </Button>
          </HStack>
        </Box>
      </Collapse>
    </Box>
  );
};


const PrecedencePanel = ({
  precedences = [],
  statutes = [],
  aiSuggestedPrecedents = [],
  fileId = null,
  compact = false,
  docType = '',
  docSnippet = '',
  onFollowUp,
  onApplySuggestion,
  onFindCaseInDoc,
}) => {
  const mutedColor  = useColorModeValue('gray.500', 'gray.400');
  const textColor   = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const emptyBg     = useColorModeValue('purple.50', 'purple.900');
  const emptyBorder = useColorModeValue('purple.200', 'purple.700');
  const labelColor  = useColorModeValue('purple.700', 'purple.200');
  const toast       = useToast();

  const [suggestedCases, setSuggestedCases] = useState([]);
  const [isSuggesting, setIsSuggesting]     = useState(false);
  const [manualCases, setManualCases]       = useState([]);
  const [showAddForm, setShowAddForm]       = useState(false);
  const [addForm, setAddForm]               = useState({ caseName: '', citation: '', relevance: 'High', summary: '' });

  const allCases = [...precedences, ...aiSuggestedPrecedents.map(c => ({ ...c, _aiSuggested: true })), ...suggestedCases, ...manualCases];

  const discoverCases = async () => {
    setIsSuggesting(true);
    try {
      if (fileId) {
        const res = await fileService.discoverPrecedents(fileId);
        if (res?.aiSuggestedPrecedents?.length) {
          setSuggestedCases(res.aiSuggestedPrecedents.map(c => ({ ...c, _aiSuggested: true })));
          toast({ title: `${res.aiSuggestedPrecedents.length} related cases found`, status: 'success', duration: 4000, isClosable: true });
          return;
        }
      }
      // Fallback: use AI chat
      const statuteList = (statutes || [])
        .map(s => `${s.name}${s.sections ? ` (${s.sections})` : ''}`)
        .join('; ');
      const prompt = `You are a senior Indian legal advocate. This document is: "${docType || 'a legal document'}"${
        statuteList ? ` involving: ${statuteList}` : ''
      }.${
        docSnippet ? `\n\nContext excerpt: "${docSnippet.slice(0, 400)}"` : ''
      }\n\nList 3-5 landmark Indian Supreme Court / High Court cases most commonly cited in this type of document.\nReturn ONLY a JSON array (no markdown fences, no text outside the array):\n[{"caseName":"Full Case Name v. Respondent","citation":"(Year) SCC/AIR citation or empty string","relevance":"High","summary":"One line on why it is cited","principle":"Key legal principle established","court":"Supreme Court of India or specific High Court"}]`;
      const chatRes = await fileService.aiChatAboutDocument({
        message: prompt,
        selectedText: '',
        chatHistory: [],
        language: 'English',
      });
      const text = chatRes?.reply || chatRes?.message || '';
      const match = text.match(/\[[\s\S]*?\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length) {
          setSuggestedCases(parsed.map(c => ({ ...c, _aiSuggested: true })));
          toast({ title: `${parsed.length} related cases found`, status: 'success', duration: 4000, isClosable: true });
          return;
        }
      }
      toast({ title: 'No suggestions returned', status: 'info', duration: 3000 });
    } catch {
      toast({ title: 'Could not fetch suggestions', status: 'warning', duration: 3000 });
    } finally {
      setIsSuggesting(false);
    }
  };

  const submitManualCase = () => {
    if (!addForm.caseName.trim()) return;
    setManualCases(prev => [...prev, { ...addForm, _manual: true }]);
    setAddForm({ caseName: '', citation: '', relevance: 'High', summary: '' });
    setShowAddForm(false);
    toast({ title: 'Case added', status: 'success', duration: 2000 });
  };

  return (
    <VStack spacing={compact ? 2 : 5} align="stretch">

      {/* ── Case Precedences ──────────────────────────── */}
      <Box>
        {!compact && (
          <HStack
            spacing={2} mb={3} pb={2}
            borderBottomWidth="2px" borderColor="purple.200"
          >
            <Icon as={MdGavel} color="purple.400" boxSize={5} />
            <Text fontWeight="bold" fontSize="sm" color={textColor}>
              Case Precedences
              <Badge
                ml={2}
                colorScheme={allCases.length > 0 ? 'purple' : 'gray'}
                fontSize="xs"
              >
                {allCases.length}
              </Badge>
            </Text>
            <HStack ml="auto" spacing={1}>
              <Tooltip label="Ask AI to suggest landmark cases for this document type" hasArrow>
                <Button
                  size="xs" colorScheme="purple" variant="outline"
                  leftIcon={<Icon as={FaRobot} boxSize={3} />}
                  onClick={discoverCases}
                  isLoading={isSuggesting}
                  loadingText="Searching…"
                  fontSize="2xs"
                >
                  AI Discover
                </Button>
              </Tooltip>
              <Tooltip label="Manually add a case citation" hasArrow>
                <Button
                  size="xs" colorScheme="gray" variant="ghost"
                  onClick={() => setShowAddForm(f => !f)}
                  fontSize="2xs"
                >
                  {showAddForm ? '✕ Cancel' : '+ Add'}
                </Button>
              </Tooltip>
            </HStack>
          </HStack>
        )}

        {/* Manual entry form */}
        <Collapse in={showAddForm} animateOpacity>
          <Box
            p={3} mb={3}
            borderWidth="1px" borderColor={emptyBorder}
            borderRadius="md" bg={emptyBg}
          >
            <Text fontSize="xs" fontWeight="bold" mb={2} color={labelColor}>
              Add Case Citation
            </Text>
            <VStack spacing={2} align="stretch">
              <Input
                placeholder="Case name (e.g. State of Maharashtra v. Prakash)"
                value={addForm.caseName}
                onChange={e => setAddForm(f => ({ ...f, caseName: e.target.value }))}
                size="sm" fontSize="xs"
              />
              <Input
                placeholder="Citation (e.g. (2023) 5 SCC 123) — optional"
                value={addForm.citation}
                onChange={e => setAddForm(f => ({ ...f, citation: e.target.value }))}
                size="sm" fontSize="xs"
              />
              <Input
                placeholder="Why is this case relevant to the document?"
                value={addForm.summary}
                onChange={e => setAddForm(f => ({ ...f, summary: e.target.value }))}
                size="sm" fontSize="xs"
              />
              <HStack>
                <Button
                  size="xs" colorScheme="purple"
                  onClick={submitManualCase}
                  isDisabled={!addForm.caseName.trim()}
                >
                  Save Case
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </HStack>
            </VStack>
          </Box>
        </Collapse>

        {/* Case list or rich empty state */}
        {allCases.length === 0 ? (
          <Box
            p={compact ? 3 : 7}
            borderWidth="1px" borderColor={emptyBorder}
            borderRadius="xl" bg={emptyBg}
            textAlign="center"
          >
            <Icon as={MdGavel} boxSize={compact ? 6 : 9} color="purple.300" mb={2} />
            <Text fontSize="sm" fontWeight="semibold" color={labelColor} mb={1}>
              No case citations detected
            </Text>
            <Text fontSize="xs" color={mutedColor} mb={compact ? 2 : 5} maxW="xs" mx="auto">
              {compact
                ? 'No case law found. Use AI Discover or add manually.'
                : 'The document does not appear to reference specific court judgments. Use AI Discover to find relevant precedents for this document type, or add known cases manually.'}
            </Text>
            {!compact && (
              <VStack spacing={2} align="center">
                <HStack spacing={2} flexWrap="wrap" justify="center">
                  <Button
                    size="sm" colorScheme="purple"
                    leftIcon={<Icon as={FaRobot} />}
                    onClick={discoverCases}
                    isLoading={isSuggesting}
                    loadingText="Discovering…"
                  >
                    AI Discover Relevant Cases
                  </Button>
                  <Button
                    size="sm" variant="outline" colorScheme="purple"
                    leftIcon={<Icon as={MdGavel} />}
                    onClick={() => { setShowAddForm(true); }}
                  >
                    Add Case Manually
                  </Button>
                </HStack>
                <Text fontSize="2xs" color={mutedColor} mt={1}>
                  AI Discover uses your document type and cited statutes to suggest landmark Indian precedents.
                </Text>
              </VStack>
            )}
          </Box>
        ) : (
          <VStack spacing={compact ? 2 : 3} align="stretch">
            {allCases.map((p, idx) => (
              <Box key={`case-${idx}`}>
                {(p._aiSuggested || p._manual) && (
                  <Badge
                    mb={1} ml={1}
                    colorScheme={p._aiSuggested ? 'purple' : 'teal'}
                    fontSize="2xs" variant="solid"
                  >
                    {p._aiSuggested ? 'AI Suggested' : 'Manual'}
                  </Badge>
                )}
                <CaseCard
                  p={p} compact={compact}
                  onFollowUp={onFollowUp}
                  onApplySuggestion={onApplySuggestion}
                  onFindCaseInDoc={onFindCaseInDoc}
                />
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* ── Statutes Referenced ───────────────────────── */}
      {statutes && statutes.length > 0 && (
        <Box>
          {!compact && (
            <HStack
              spacing={2} mb={3} pb={2}
              borderBottomWidth="2px" borderColor="teal.200"
            >
              <Icon as={FaBookOpen} color="teal.400" boxSize={5} />
              <Text fontWeight="bold" fontSize="sm" color={textColor}>
                Statutes Referenced
                <Badge ml={2} colorScheme="teal" fontSize="xs">{statutes.length}</Badge>
              </Text>
              <Text fontSize="2xs" color={mutedColor} ml="auto">Click to expand · Look up · AI analysis</Text>
            </HStack>
          )}
          <VStack spacing={compact ? 2 : 3} align="stretch">
            {statutes.map((s, idx) => (
              <StatuteCard
                key={idx}
                statute={s}
                compact={compact}
                onFollowUp={onFollowUp}
                onFindCaseInDoc={onFindCaseInDoc}
              />
            ))}
          </VStack>
        </Box>
      )}

    </VStack>
  );
};

export { StatuteCard };
export default PrecedencePanel;
