import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Collapse, Divider,
  useColorModeValue, Tabs, TabList, Tab, TabPanels, TabPanel, Button
} from '@chakra-ui/react';
import { MdCompareArrows, MdExpandMore, MdExpandLess, MdAutorenew, MdAutoFixHigh } from 'react-icons/md';
import { FaExclamationCircle, FaExchangeAlt } from 'react-icons/fa';

const ContradictionPanel = ({ outdatedReferences = [], internalContradictions = [], compact = false, onApplySuggestion }) => {
  const [expanded, setExpanded] = useState(null);
  
  const [appliedItems, setAppliedItems] = useState(new Set());
  const [loadingItems, setLoadingItems] = useState(new Set());

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.750');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const total = outdatedReferences.length + internalContradictions.length;

  const EmptyState = ({ icon, label }) => (
    <Box textAlign="center" py={4} color={mutedColor}>
      <Icon as={icon} boxSize={7} mb={2} opacity={0.3} />
      <Text fontSize="sm" color="green.400" fontWeight="semibold">{label}</Text>
    </Box>
  );

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  return (
    <Box>
      {!compact && (
        <HStack spacing={2} mb={3}>
          <Icon as={MdCompareArrows} color="pink.400" />
          <Text fontWeight="bold" fontSize="sm">
            Conflicts & Outdated Refs
            <Badge ml={2} colorScheme="pink" fontSize="xs">{total}</Badge>
          </Text>
        </HStack>
      )}

      <Tabs size="sm" variant="soft-rounded" colorScheme="pink">
        <TabList mb={2}>
          <Tab fontSize="xs">
            Outdated
            {outdatedReferences.length > 0 && (
              <Badge ml={1} colorScheme="orange" fontSize="2xs">{outdatedReferences.length}</Badge>
            )}
          </Tab>
          <Tab fontSize="xs">
            Contradictions
            {internalContradictions.length > 0 && (
              <Badge ml={1} colorScheme="red" fontSize="2xs">{internalContradictions.length}</Badge>
            )}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} py={1}>
            {outdatedReferences.length === 0 ? (
              <EmptyState icon={MdAutorenew} label="All legal references appear current." />
            ) : (
              <VStack spacing={2} align="stretch">
                {outdatedReferences.map((ref, idx) => {
                  const id = `out_${idx}`;
                  const isOpen = expanded === id;
                  return (
                    <Box
                      key={idx}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={borderColor}
                      borderLeft="3px solid"
                      borderLeftColor="orange.400"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Box px={3} py={2} cursor="pointer" onClick={() => toggle(id)}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0.5} flex={1}>
                            <Badge colorScheme="orange" fontSize="2xs" variant="outline">
                              {ref.reference || 'Unknown Reference'}
                            </Badge>
                            {ref.currentLaw && (
                              <HStack spacing={1}>
                                <Icon as={FaExchangeAlt} color="green.400" boxSize={3} />
                                <Text fontSize="xs" color="green.400" fontWeight="semibold">
                                  → {ref.currentLaw}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                          <Icon as={isOpen ? MdExpandLess : MdExpandMore} color={mutedColor} boxSize={4} />
                        </HStack>
                      </Box>
                      <Collapse in={isOpen} animateOpacity>
                        <Divider borderColor={borderColor} />
                        <Box px={3} py={2}>
                          <Text fontSize="xs" color={textColor} lineHeight="1.6">
                            {ref.description || 'No additional information.'}
                          </Text>
                          {ref.currentLaw && onApplySuggestion && (
                            <Button
                              size="xs" colorScheme={appliedItems.has(`out_${idx}`) ? 'green' : 'orange'} variant="solid"
                              leftIcon={<Icon as={MdAutoFixHigh} boxSize={3} />}
                              fontSize="2xs" mt={2}
                              isLoading={loadingItems.has(`out_${idx}`)}
                              isDisabled={appliedItems.has(`out_${idx}`)}
                              loadingText="Applying…"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const itemId = `out_${idx}`;
                                if (appliedItems.has(itemId)) return;
                                setLoadingItems(prev => new Set([...prev, itemId]));
                                await onApplySuggestion({
                                  title: `Update: ${ref.reference}`,
                                  description: ref.description || '',
                                  originalText: ref.reference || '',
                                  suggestedText: ref.currentLaw || '',
                                  type: 'outdated_ref',
                                  outdatedRef: ref.reference,
                                  currentLaw: ref.currentLaw,
                                });
                                setLoadingItems(prev => { const s = new Set(prev); s.delete(itemId); return s; });
                                setAppliedItems(prev => new Set([...prev, itemId]));
                              }}
                            >
                              {appliedItems.has(`out_${idx}`) ? '✓ Applied' : 'Update Reference'}
                            </Button>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </TabPanel>

          <TabPanel px={0} py={1}>
            {internalContradictions.length === 0 ? (
              <EmptyState icon={FaExclamationCircle} label="No internal contradictions found." />
            ) : (
              <VStack spacing={2} align="stretch">
                {internalContradictions.map((c, idx) => {
                  const id = `con_${idx}`;
                  const isOpen = expanded === id;
                  return (
                    <Box
                      key={idx}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={borderColor}
                      borderLeft="3px solid"
                      borderLeftColor="red.400"
                      borderRadius="md"
                      overflow="hidden"
                    >
                      <Box px={3} py={2} cursor="pointer" onClick={() => toggle(id)}>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={0.5} flex={1}>
                            <HStack spacing={1} wrap="wrap">
                              <Badge colorScheme="red" fontSize="2xs" variant="subtle">
                                {c.clause1 || 'Clause ?'}
                              </Badge>
                              <Icon as={MdCompareArrows} color="red.400" boxSize={3} />
                              <Badge colorScheme="red" fontSize="2xs" variant="subtle">
                                {c.clause2 || 'Clause ?'}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color={textColor} noOfLines={isOpen ? undefined : 2}>
                              {c.contradiction || 'Conflicting provisions detected.'}
                            </Text>
                          </VStack>
                          <Icon as={isOpen ? MdExpandLess : MdExpandMore} color={mutedColor} boxSize={4} flexShrink={0} />
                        </HStack>
                      </Box>
                      <Collapse in={isOpen} animateOpacity>
                        <Divider borderColor={borderColor} />
                        <Box px={3} py={2}>
                          {c.resolution && (
                            <>
                              <Text fontSize="xs" fontWeight="semibold" color={mutedColor} textTransform="uppercase" mb={1}>
                                Suggested Resolution
                              </Text>
                              <Text fontSize="xs" color={textColor} lineHeight="1.6">
                                {c.resolution}
                              </Text>
                            </>
                          )}
                          {c.resolution && onApplySuggestion && (
                            <Button
                              size="xs" colorScheme={appliedItems.has(`con_${idx}`) ? 'green' : 'red'} variant="solid"
                              leftIcon={<Icon as={MdAutoFixHigh} boxSize={3} />}
                              fontSize="2xs" mt={2}
                              isLoading={loadingItems.has(`con_${idx}`)}
                              isDisabled={appliedItems.has(`con_${idx}`)}
                              loadingText="AI Resolving…"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const itemId = `con_${idx}`;
                                if (appliedItems.has(itemId)) return;
                                setLoadingItems(prev => new Set([...prev, itemId]));
                                await onApplySuggestion({
                                  title: `Resolve conflict: ${c.clause1} ↔ ${c.clause2}`,
                                  description: c.contradiction || '',
                                  originalText: '',
                                  suggestedText: c.resolution,
                                  type: 'contradiction_fix',
                                  clause1: c.clause1 || '',
                                  clause2: c.clause2 || '',
                                  contradiction: c.contradiction || '',
                                });
                                setLoadingItems(prev => { const s = new Set(prev); s.delete(itemId); return s; });
                                setAppliedItems(prev => new Set([...prev, itemId]));
                              }}
                            >
                              {appliedItems.has(`con_${idx}`) ? '✓ Resolved' : 'Apply Resolution'}
                            </Button>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ContradictionPanel;
