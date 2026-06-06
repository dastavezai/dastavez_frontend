import React, { useState, useCallback, useRef } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Input, InputGroup,
  InputLeftElement, InputRightElement, Button, useColorModeValue,
  Spinner, Collapse, Tooltip, Tag, IconButton, Divider, Select,
} from '@chakra-ui/react';
import { MdGavel, MdSearch, MdExpandMore, MdExpandLess, MdBookmark, MdContentCopy } from 'react-icons/md';
import { FaBalanceScale, FaExternalLinkAlt, FaQuoteRight } from 'react-icons/fa';
import fileService from '../../services/fileService';

const CaseLawSearchPanel = ({ compact = false, onApplySuggestion, onFollowUp }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [savedCases, setSavedCases] = useState([]);
  const [jurisdiction, setJurisdiction] = useState('all');
  const debounceRef = useRef(null);

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const res = await fileService.searchCases(q, 10);
      setResults(res?.results || []);
      if (!res?.results?.length) setError('No cases found. Try different keywords.');
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Case search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCiteInDocument = (caseItem) => {
    const citation = caseItem.citation || '';
    const caseName = caseItem.caseName || caseItem.title || '';
    const summary = caseItem.summary || caseItem.relevance || '';
    const citeText = `As held in ${caseName}${citation ? ` (${citation})` : ''}, ${summary}`;
    onApplySuggestion?.({
      title: `Cite: ${caseName}`,
      description: `Insert citation of ${caseName} into the document`,
      originalText: '',
      suggestedText: citeText,
      type: 'insert_clause',
    });
  };

  const handleSaveCase = (caseItem) => {
    const key = caseItem.caseName || caseItem.title;
    if (savedCases.find(c => (c.caseName || c.title) === key)) return;
    setSavedCases(prev => [...prev, caseItem]);
  };

  const handleFollowUp = (caseItem) => {
    onFollowUp?.({
      caseName: caseItem.caseName || caseItem.title,
      citation: caseItem.citation || '',
      summary: caseItem.summary || caseItem.relevance || '',
    });
  };

  const filteredResults = jurisdiction === 'all'
    ? results
    : results.filter(r => {
        const text = JSON.stringify(r).toLowerCase();
        if (jurisdiction === 'sc') return text.includes('supreme court');
        if (jurisdiction === 'hc') return text.includes('high court');
        if (jurisdiction === 'tribunal') return text.includes('tribunal') || text.includes('nclt') || text.includes('ncdrc');
        return true;
      });

  return (
    <VStack spacing={3} align="stretch" h="100%">
      <Box px={compact ? 2 : 3} pt={compact ? 2 : 3}>
        <InputGroup size="sm">
          <InputLeftElement>
            <Icon as={MdSearch} color={mutedColor} />
          </InputLeftElement>
          <Input
            placeholder="Search Indian case law..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            fontSize="xs"
            borderRadius="md"
          />
          <InputRightElement width="60px">
            <Button
              size="xs"
              colorScheme="blue"
              onClick={handleSearch}
              isLoading={loading}
              fontSize="2xs"
              h="24px"
            >
              Search
            </Button>
          </InputRightElement>
        </InputGroup>

        <HStack mt={2} spacing={2}>
          <Select
            size="xs"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            fontSize="2xs"
            maxW="140px"
          >
            <option value="all">All Courts</option>
            <option value="sc">Supreme Court</option>
            <option value="hc">High Courts</option>
            <option value="tribunal">Tribunals</option>
          </Select>
          <Text fontSize="2xs" color={mutedColor}>
            {filteredResults.length > 0 && `${filteredResults.length} result${filteredResults.length > 1 ? 's' : ''}`}
          </Text>
        </HStack>
      </Box>

      <Box flex={1} overflowY="auto" px={compact ? 2 : 3} pb={2}>
        {error && (
          <Text fontSize="xs" color="red.400" textAlign="center" py={4}>{error}</Text>
        )}

        {!loading && filteredResults.length === 0 && !error && (
          <VStack py={8} spacing={2}>
            <Icon as={FaBalanceScale} boxSize={8} color={mutedColor} />
            <Text fontSize="xs" color={mutedColor} textAlign="center">
              Search for Indian case law by topic, section, or case name
            </Text>
            <Text fontSize="2xs" color={mutedColor}>
              e.g. "Section 138 NI Act", "bail conditions CrPC", "specific performance"
            </Text>
          </VStack>
        )}

        <VStack spacing={2} align="stretch">
          {filteredResults.map((c, idx) => {
            const caseName = c.caseName || c.title || 'Untitled Case';
            const citation = c.citation || '';
            const summary = c.summary || c.relevance || '';
            const isExpanded = expandedIdx === idx;
            const isSaved = savedCases.some(s => (s.caseName || s.title) === caseName);
            const kanoonUrl = `https://indiankanoon.org/search/?formInput=${encodeURIComponent(caseName)}`;

            return (
              <Box
                key={idx}
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderLeft="3px solid"
                borderLeftColor="purple.400"
                borderRadius="md"
                overflow="hidden"
              >
                <Box
                  p={2}
                  cursor="pointer"
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                >
                  <HStack justify="space-between" align="start">
                    <Box flex={1}>
                      <Text fontSize="xs" fontWeight="bold" color={textColor} noOfLines={2}>
                        <Icon as={MdGavel} boxSize={3} mr={1} color="purple.400" />
                        {caseName}
                      </Text>
                      {citation && (
                        <Text fontSize="2xs" color="blue.500" mt={0.5}>{citation}</Text>
                      )}
                    </Box>
                    <Icon as={isExpanded ? MdExpandLess : MdExpandMore} color={mutedColor} />
                  </HStack>
                  <Text fontSize="2xs" color={mutedColor} mt={1} noOfLines={isExpanded ? undefined : 2}>
                    {summary}
                  </Text>
                </Box>

                <Collapse in={isExpanded}>
                  <Box px={2} pb={2} borderTop="1px solid" borderColor={borderColor}>
                    <HStack spacing={1} mt={2} flexWrap="wrap">
                      <Tooltip label="Insert citation into document" fontSize="xs" hasArrow>
                        <Button
                          size="xs"
                          colorScheme="green"
                          variant="solid"
                          fontSize="2xs"
                          leftIcon={<Icon as={FaQuoteRight} boxSize={2.5} />}
                          onClick={(e) => { e.stopPropagation(); handleCiteInDocument(c); }}
                        >
                          Cite
                        </Button>
                      </Tooltip>
                      <Tooltip label="Discuss with AI" fontSize="xs" hasArrow>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          fontSize="2xs"
                          onClick={(e) => { e.stopPropagation(); handleFollowUp(c); }}
                        >
                          Ask AI
                        </Button>
                      </Tooltip>
                      <Tooltip label="Save for reference" fontSize="xs" hasArrow>
                        <IconButton
                          size="xs"
                          variant={isSaved ? 'solid' : 'outline'}
                          colorScheme="yellow"
                          icon={<Icon as={MdBookmark} boxSize={3} />}
                          onClick={(e) => { e.stopPropagation(); handleSaveCase(c); }}
                          aria-label="Save case"
                        />
                      </Tooltip>
                      <Tooltip label="View on Indian Kanoon" fontSize="xs" hasArrow>
                        <IconButton
                          size="xs"
                          variant="outline"
                          colorScheme="purple"
                          icon={<Icon as={FaExternalLinkAlt} boxSize={2.5} />}
                          as="a"
                          href={kanoonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Indian Kanoon"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Tooltip>
                    </HStack>
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </VStack>
      </Box>

      {savedCases.length > 0 && (
        <Box px={compact ? 2 : 3} py={2} borderTop="1px solid" borderColor={borderColor}>
          <Text fontSize="2xs" fontWeight="bold" color={mutedColor} mb={1}>
            Saved ({savedCases.length})
          </Text>
          <VStack spacing={1} align="stretch" maxH="80px" overflowY="auto">
            {savedCases.map((s, i) => (
              <HStack key={i} spacing={1}>
                <Icon as={MdBookmark} color="yellow.400" boxSize={3} />
                <Text fontSize="2xs" color={textColor} noOfLines={1} flex={1}>
                  {s.caseName || s.title}
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  fontSize="2xs"
                  colorScheme="green"
                  onClick={() => handleCiteInDocument(s)}
                >
                  Cite
                </Button>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default CaseLawSearchPanel;
