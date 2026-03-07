import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon,
  Collapse, Divider, useColorModeValue, Tag, Tabs, TabList, Tab, TabPanels, TabPanel, Button
} from '@chakra-ui/react';
import { MdSecurity, MdExpandMore, MdExpandLess, MdAddCircleOutline, MdAutoFixHigh } from 'react-icons/md';
import { FaShieldAlt, FaPlusCircle } from 'react-icons/fa';

const SEV_COLOR = { critical: 'red', warning: 'orange', info: 'blue' };

const CompliancePanel = ({ complianceIssues = [], missingClauses = [], compact = false, onApplySuggestion }) => {
  const [expanded, setExpanded] = useState(null);
  const [appliedItems, setAppliedItems] = useState(new Set());
  const [loadingItems, setLoadingItems] = useState(new Set());

  const markApplied = (id) => {
    setLoadingItems(prev => { const s = new Set(prev); s.delete(id); return s; });
    setAppliedItems(prev => new Set([...prev, id]));
  };
  const markLoading = (id) => setLoadingItems(prev => new Set([...prev, id]));

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.750');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const totalIssues = complianceIssues.length + missingClauses.length;

  const EmptyState = ({ icon, label }) => (
    <Box textAlign="center" py={4} color={mutedColor}>
      <Icon as={icon} boxSize={8} mb={2} opacity={0.3} />
      <Text fontSize="sm">{label}</Text>
    </Box>
  );

  const IssueCard = ({ item, id, borderCol, badgeScheme, extraContent, onApply, isApplied, isApplyLoading }) => {
    const isOpen = expanded === id;
    return (
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderLeft="3px solid"
        borderLeftColor={`${borderCol}.400`}
        borderRadius="md"
        overflow="hidden"
        _hover={{ boxShadow: 'sm' }}
      >
        <Box px={3} py={2} cursor="pointer" onClick={() => setExpanded(isOpen ? null : id)}>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={0.5} flex={1}>
              <HStack spacing={2}>
                <Badge colorScheme={badgeScheme} fontSize="2xs" variant="subtle">
                  {item.rule || item.clauseType || 'Issue'}
                </Badge>
                {item.severity && (
                  <Badge colorScheme={SEV_COLOR[item.severity] || 'blue'} fontSize="2xs">
                    {item.severity}
                  </Badge>
                )}
                {item.importance && (
                  <Badge colorScheme={SEV_COLOR[item.importance] || 'blue'} fontSize="2xs">
                    {item.importance}
                  </Badge>
                )}
              </HStack>
              <Text fontSize="xs" color={textColor} noOfLines={isOpen ? undefined : 2}>
                {item.description || `Missing clause: ${item.clauseType}`}
              </Text>
            </VStack>
            <Icon as={isOpen ? MdExpandLess : MdExpandMore} color={mutedColor} boxSize={4} flexShrink={0} />
          </HStack>
        </Box>
        <Collapse in={isOpen} animateOpacity>
          <Divider borderColor={borderColor} />
          <Box px={3} py={2}>
            {extraContent}
            {onApply && (
              <Button
                size="xs"
                colorScheme={isApplied ? 'green' : 'teal'}
                variant="solid"
                leftIcon={<Icon as={MdAutoFixHigh} boxSize={3} />}
                fontSize="2xs"
                mt={2}
                isLoading={isApplyLoading}
                isDisabled={isApplied}
                loadingText="Applying…"
                onClick={(e) => { e.stopPropagation(); if (!isApplied) onApply(); }}
              >
                {isApplied ? '✓ Applied' : 'Apply Fix'}
              </Button>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box>
      {!compact && (
        <HStack spacing={2} mb={3}>
          <Icon as={FaShieldAlt} color="teal.400" />
          <Text fontWeight="bold" fontSize="sm">
            Compliance & Missing Clauses
            <Badge ml={2} colorScheme="teal" fontSize="xs">{totalIssues}</Badge>
          </Text>
        </HStack>
      )}

      <Tabs size="sm" variant="soft-rounded" colorScheme="teal">
        <TabList mb={2}>
          <Tab fontSize="xs">
            Issues
            {complianceIssues.length > 0 && (
              <Badge ml={1} colorScheme="red" fontSize="2xs">{complianceIssues.length}</Badge>
            )}
          </Tab>
          <Tab fontSize="xs">
            Missing
            {missingClauses.length > 0 && (
              <Badge ml={1} colorScheme="orange" fontSize="2xs">{missingClauses.length}</Badge>
            )}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} py={1}>
            {complianceIssues.length === 0 ? (
              <EmptyState icon={FaShieldAlt} label="No compliance issues detected." />
            ) : (
              <VStack spacing={2} align="stretch">
                {complianceIssues.map((issue, idx) => (
                  <IssueCard
                    key={idx}
                    id={`c_${idx}`}
                    item={issue}
                    borderCol={SEV_COLOR[issue.severity] || 'blue'}
                    badgeScheme="teal"
                    isApplied={appliedItems.has(`c_${idx}`)}
                    isApplyLoading={loadingItems.has(`c_${idx}`)}
                    onApply={issue.fix && onApplySuggestion ? async () => {
                      const id = `c_${idx}`;
                      markLoading(id);
                      await onApplySuggestion({
                        title: issue.rule || 'Compliance Fix',
                        description: issue.description || '',
                        originalText: '',
                        suggestedText: issue.fix,
                        type: 'compliance_fix',
                      });
                      markApplied(id);
                    } : undefined}
                    extraContent={
                      issue.fix ? (
                        <>
                          <Text fontSize="xs" fontWeight="semibold" color={mutedColor} textTransform="uppercase" mb={1}>
                            Suggested Fix
                          </Text>
                          <Text fontSize="xs" color={textColor} lineHeight="1.6">
                            {issue.fix}
                          </Text>
                        </>
                      ) : null
                    }
                  />
                ))}
              </VStack>
            )}
          </TabPanel>

          <TabPanel px={0} py={1}>
            {missingClauses.length === 0 ? (
              <EmptyState icon={FaPlusCircle} label="No missing clauses detected." />
            ) : (
              <VStack spacing={2} align="stretch">
                {missingClauses.map((clause, idx) => (
                  <IssueCard
                    key={idx}
                    id={`m_${idx}`}
                    item={clause}
                    borderCol={SEV_COLOR[clause.importance] || 'orange'}
                    badgeScheme="orange"
                    isApplied={appliedItems.has(`m_${idx}`)}
                    isApplyLoading={loadingItems.has(`m_${idx}`)}
                    onApply={clause.suggestedText && onApplySuggestion ? async () => {
                      const id = `m_${idx}`;
                      markLoading(id);
                      await onApplySuggestion({
                        title: clause.clauseType || 'Missing Clause',
                        description: `Missing clause: ${clause.clauseType}`,
                        originalText: '',
                        suggestedText: clause.suggestedText,
                        type: 'missing_clause',
                      });
                      markApplied(id);
                    } : undefined}
                    extraContent={
                      clause.suggestedText ? (
                        <>
                          <Text fontSize="xs" fontWeight="semibold" color={mutedColor} textTransform="uppercase" mb={1}>
                            Suggested Clause Text
                          </Text>
                          <Box
                            bg={useColorModeValue('green.50', 'green.900')}
                            border="1px solid"
                            borderColor={useColorModeValue('green.200', 'green.700')}
                            borderRadius="sm"
                            p={2}
                          >
                            <Text fontSize="xs" color={useColorModeValue('green.800', 'green.200')} fontStyle="italic" lineHeight="1.6">
                              {clause.suggestedText}
                            </Text>
                          </Box>
                        </>
                      ) : null
                    }
                  />
                ))}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CompliancePanel;
