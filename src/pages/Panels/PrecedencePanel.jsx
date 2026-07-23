import React, { useState, useEffect, useRef } from 'react';
import {
  Box, VStack, HStack, Flex, Text, Badge, Icon, Heading, Button,
  useColorModeValue, Spinner, IconButton, Collapse, Divider, Image,
  Skeleton, Tooltip, Input, Alert, AlertIcon, Tabs, TabList, TabPanels, Tab, TabPanel, useToast
} from '@chakra-ui/react';
import { FaTimes, FaBalanceScale, FaExternalLinkAlt, FaRobot, FaBookOpen } from 'react-icons/fa';
import { FiZap, FiUploadCloud, FiExternalLink, FiPlus, FiCheckCircle } from 'react-icons/fi';
import { MdGavel, MdExpandMore, MdExpandLess, MdOutlineShield } from 'react-icons/md';
import { useAdvancedChat } from '../AdvancedChatContext';

// Wikipedia Summary Cache & Fetcher
const wikiCache = {};
async function fetchWikiSummary(caseName) {
  if (!caseName) return null;
  if (wikiCache[caseName] !== undefined) return wikiCache[caseName];
  const trimmed = caseName.trim();
  const opts = { headers: { Accept: 'application/json' } };

  const tryFetch = async (title) => {
    const encoded = encodeURIComponent(title);
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, opts);
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
      result = await tryFetch(trimmed.replace(/\s+/g, '_'));
    }
    wikiCache[caseName] = result || null;
    return result;
  } catch {
    wikiCache[caseName] = null;
    return null;
  }
}

const CaseCard = ({ p, onApplyPrinciple }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [wiki, setWiki] = useState(undefined);
  const [wikiLoading, setWikiLoading] = useState(false);
  const fetchedRef = useRef(false);

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const expandedBg = useColorModeValue('gray.50', 'gray.750');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const citationColor = useColorModeValue('teal.600', 'teal.300');
  const wikiBoxBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    if (!isOpen || fetchedRef.current) return;
    fetchedRef.current = true;
    setWikiLoading(true);
    fetchWikiSummary(p.caseName).then(data => {
      setWiki(data);
      setWikiLoading(false);
    });
  }, [isOpen, p.caseName]);

  const indianKanoonUrl = p.caseName ? `https://indiankanoon.org/search/?formInput=${encodeURIComponent(p.caseName)}` : null;
  const sccOnlineUrl = p.caseName ? `https://www.scconline.com/Members/SearchResult.aspx#FT=${encodeURIComponent(p.caseName)}` : null;

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderLeft="4px solid"
      borderLeftColor={isOpen ? 'teal.500' : 'teal.400'}
      borderRadius="xl"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
      mb={3}
    >
      <Box px={4} py={3} cursor="pointer" onClick={() => setIsOpen(v => !v)}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="bold" fontSize="sm" color={textColor} lineHeight="1.4">
              {p.caseName || 'Unknown Case'}
            </Text>
            <Text fontSize="xs" color={citationColor} fontFamily="mono">
              {p.citation || 'Citation N/A'} · {p.court || 'Court N/A'} ({p.year || 'N/A'})
            </Text>
          </VStack>
          <HStack spacing={2}>
            {p.relevance && (
              <Badge colorScheme="teal" fontSize="2xs" variant="subtle">
                Relevance: {p.relevance}
              </Badge>
            )}
            <Icon as={isOpen ? MdExpandLess : MdExpandMore} boxSize={5} color="gray.400" />
          </HStack>
        </HStack>
      </Box>

      <Collapse in={isOpen} animateOpacity>
        <Divider borderColor={borderColor} />
        <Box px={4} py={3} bg={expandedBg}>
          <VStack align="stretch" spacing={3}>
            {p.summary && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>Overview</Text>
                <Text fontSize="sm" color={textColor}>{p.summary}</Text>
              </Box>
            )}

            {p.principle && (
              <Box p={3} bg={wikiBoxBg} borderRadius="md" borderLeft="3px solid" borderLeftColor="teal.400">
                <Text fontSize="xs" fontWeight="bold" color="teal.500" mb={1}>📜 Key Legal Principle / Holding</Text>
                <Text fontSize="xs" color={textColor} fontStyle="italic">"{p.principle}"</Text>
              </Box>
            )}

            {wikiLoading && <Skeleton h="40px" borderRadius="md" />}
            {!wikiLoading && wiki && (
              <HStack p={3} bg={wikiBoxBg} borderRadius="md" align="start" spacing={3}>
                {wiki.thumbnail ? (
                  <Image src={wiki.thumbnail} boxSize="50px" objectFit="cover" borderRadius="md" />
                ) : (
                  <Box boxSize="50px" bg="teal.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FaBalanceScale} color="teal.500" boxSize={5} />
                  </Box>
                )}
                <VStack align="start" spacing={1} flex={1}>
                  <Badge colorScheme="blue" fontSize="2xs">Wikipedia Insight</Badge>
                  <Text fontSize="xs" color={textColor} noOfLines={3}>{wiki.extract}</Text>
                  {wiki.wikiUrl && (
                    <Button as="a" href={wiki.wikiUrl} target="_blank" size="xs" variant="link" colorScheme="blue">
                      Read Wikipedia page →
                    </Button>
                  )}
                </VStack>
              </HStack>
            )}

            <HStack spacing={2} pt={1} flexWrap="wrap">
              {indianKanoonUrl && (
                <Button as="a" href={indianKanoonUrl} target="_blank" size="xs" variant="outline" colorScheme="orange" leftIcon={<FiExternalLink />}>
                  Indian Kanoon
                </Button>
              )}
              {sccOnlineUrl && (
                <Button as="a" href={sccOnlineUrl} target="_blank" size="xs" variant="outline" colorScheme="blue" leftIcon={<FiExternalLink />}>
                  SCC Online
                </Button>
              )}
              {p.principle && onApplyPrinciple && (
                <Button size="xs" colorScheme="teal" leftIcon={<FiPlus />} onClick={() => onApplyPrinciple(p)}>
                  Apply Principle to Draft
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

const PrecedencePanel = () => {
  const { precedenceStatus, precedenceResults, setIsPrecedencePanelOpen, handleSendMessage } = useAdvancedChat();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [manualCases, setManualCases] = useState([]);
  const [newCase, setNewCase] = useState({ caseName: '', citation: '', relevance: 'High', summary: '' });
  const toast = useToast();

  const panelBg = useColorModeValue('white', 'gray.850');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('teal.50', 'teal.900');

  const allPrecedents = [...(precedenceResults?.precedents || []), ...manualCases];

  const handleAddManualCase = () => {
    if (!newCase.caseName.trim()) return;
    setManualCases(prev => [...prev, { ...newCase }]);
    setNewCase({ caseName: '', citation: '', relevance: 'High', summary: '' });
    toast({ title: 'Case added to analysis', status: 'success', duration: 2000 });
  };

  const handleApplyPrinciple = (p) => {
    handleSendMessage(`Apply legal principle from precedent "${p.caseName}" (${p.citation || ''}): ${p.principle || p.summary}`);
    toast({ title: 'Applying principle to chat draft...', status: 'info', duration: 2500 });
  };

  return (
    <Box w="100%" h="100%" flex="1" bg={panelBg} borderLeft="1px solid" borderColor={panelBorder} display="flex" flexDirection="column" overflow="hidden">
      {/* Panel Header */}
      <Flex h="52px" align="center" justify="space-between" px={4} borderBottom="1px solid" borderColor={panelBorder} bg={headerBg} flexShrink={0}>
        <HStack spacing={2}>
          <Icon as={FiZap} color="teal.500" boxSize={5} />
          <Text fontSize="sm" fontWeight="bold">Precedence Analysis</Text>
          {precedenceStatus === 'completed' && <Badge colorScheme="green" fontSize="2xs">Ready</Badge>}
        </HStack>
        <IconButton icon={<FaTimes />} size="xs" variant="ghost" aria-label="Close" onClick={() => setIsPrecedencePanelOpen(false)} />
      </Flex>

      {/* Tabs Bar */}
      <Tabs index={activeTabIndex} onChange={setActiveTabIndex} variant="enclosed" colorScheme="teal" flex={1} minH={0} display="flex" flexDirection="column" overflow="hidden">
        <TabList px={4} pt={2} bg={headerBg} borderColor={panelBorder}>
          <Tab fontSize="xs" fontWeight="bold">👁️ View Analysis</Tab>
          <Tab fontSize="xs" fontWeight="bold">⚡ Actions & Discover</Tab>
        </TabList>

        <TabPanels flex={1} minH={0} overflowY="auto" p={4}>
          {/* TAB 1: VIEW ANALYSIS */}
          <TabPanel p={0} minH={0} h="full" overflowY="auto">
            {precedenceStatus === 'idle' && (
              <VStack spacing={4} align="center" justify="center" py={16} color="gray.500">
                <Icon as={FiUploadCloud} boxSize={10} />
                <Text fontSize="sm" textAlign="center">
                  Upload a document or ask AI to run <strong>Precedence Analysis</strong> to view case laws.
                </Text>
              </VStack>
            )}

            {precedenceStatus === 'completed' && (
              <VStack spacing={4} align="stretch">
                {precedenceResults?.overallSummary && (
                  <Box bg={useColorModeValue('teal.50', 'gray.800')} p={4} borderRadius="xl" borderLeft="4px solid" borderLeftColor="teal.400">
                    <Text fontSize="xs" fontWeight="bold" color="teal.500" textTransform="uppercase" mb={1}>Analysis Summary</Text>
                    <Text fontSize="sm" whiteSpace="pre-wrap">{precedenceResults.overallSummary}</Text>
                  </Box>
                )}

                {allPrecedents.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="teal.500" uppercase mb={2}>Cited Case Laws & Precedents ({allPrecedents.length})</Text>
                    {allPrecedents.map((p, i) => (
                      <CaseCard key={i} p={p} onApplyPrinciple={handleApplyPrinciple} />
                    ))}
                  </Box>
                )}
              </VStack>
            )}
          </TabPanel>

          {/* TAB 2: ACTIONS & DISCOVER */}
          <TabPanel p={0}>
            <VStack spacing={4} align="stretch">
              <Box p={4} borderRadius="xl" border="1px solid" borderColor={panelBorder} bg={useColorModeValue('gray.50', 'gray.800')}>
                <Text fontSize="sm" fontWeight="bold" mb={1}>🤖 Discover Landmark Cases</Text>
                <Text fontSize="xs" color="gray.500" mb={3}>Ask AI to search and analyze binding precedents for this document.</Text>
                <Button size="sm" colorScheme="teal" leftIcon={<FaRobot />} onClick={() => handleSendMessage("Discover binding landmark court precedents and case laws for this document.")}>
                  Discover Precedents via AI
                </Button>
              </Box>

              <Box p={4} borderRadius="xl" border="1px solid" borderColor={panelBorder} bg={useColorModeValue('gray.50', 'gray.800')}>
                <Text fontSize="sm" fontWeight="bold" mb={2}>➕ Manually Add Case Citation</Text>
                <VStack spacing={2} align="stretch">
                  <Input placeholder="Case Name (e.g. State of UP v. Rajesh Kumar)" value={newCase.caseName} onChange={e => setNewCase(prev => ({ ...prev, caseName: e.target.value }))} size="sm" />
                  <Input placeholder="Citation (e.g. (2023) 4 SCC 121)" value={newCase.citation} onChange={e => setNewCase(prev => ({ ...prev, citation: e.target.value }))} size="sm" />
                  <Input placeholder="Relevance / Legal Principle summary" value={newCase.summary} onChange={e => setNewCase(prev => ({ ...prev, summary: e.target.value }))} size="sm" />
                  <Button size="sm" colorScheme="purple" onClick={handleAddManualCase} isDisabled={!newCase.caseName.trim()}>
                    Add Citation
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PrecedencePanel;
