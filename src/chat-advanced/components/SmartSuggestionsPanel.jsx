/**
 * SmartSuggestionsPanel - Harvey-style AI suggestions sidebar
 * Shows Apply/Dismiss for each suggestion with severity indicators
 */
import React, { useState, useMemo } from 'react';
import {
  Box, VStack, HStack, Text, Badge, IconButton, Tooltip,
  Collapse, useColorModeValue, Divider, Progress, Flex, Icon
} from '@chakra-ui/react';
import { FaCheck, FaTimes, FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdWarning, MdInfo, MdError, MdLightbulb } from 'react-icons/md';

const SEVERITY_CONFIG = {
  critical: { color: 'red', icon: MdError, label: 'Critical' },
  warning: { color: 'orange', icon: MdWarning, label: 'Warning' },
  info: { color: 'blue', icon: MdInfo, label: 'Info' },
};

const TYPE_LABELS = {
  legal_compliance: 'Legal Compliance',
  clause_improvement: 'Clause Improvement',
  formatting: 'Formatting',
  risk_warning: 'Risk Warning',
  missing_clause: 'Missing Clause',
  language: 'Language',
};

const SmartSuggestionsPanel = ({ suggestions = [], onApply, onDismiss, onViewInDocument }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'applied', 'dismissed'

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const stats = useMemo(() => {
    const pending = suggestions.filter(s => s.status === 'pending').length;
    const applied = suggestions.filter(s => s.status === 'applied').length;
    const dismissed = suggestions.filter(s => s.status === 'dismissed').length;
    return { total: suggestions.length, pending, applied, dismissed };
  }, [suggestions]);

  const filteredSuggestions = useMemo(() => {
    if (filter === 'all') return suggestions;
    return suggestions.filter(s => s.status === filter);
  }, [suggestions, filter]);

  const progressPercent = stats.total > 0 
    ? Math.round(((stats.applied + stats.dismissed) / stats.total) * 100) 
    : 0;

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Header */}
      <Box px={3} py={3} borderBottom="1px solid" borderColor={borderColor}>
        <HStack justify="space-between" mb={2}>
          <HStack spacing={2}>
            <Icon as={MdLightbulb} color="yellow.400" boxSize={5} />
            <Text fontWeight="bold" fontSize="sm">Smart Suggestions</Text>
          </HStack>
          <Badge colorScheme="blue" fontSize="xs">{stats.pending} pending</Badge>
        </HStack>
        
        <Progress 
          value={progressPercent} 
          size="xs" 
          colorScheme="green" 
          borderRadius="full"
          mb={2}
        />
        
        <HStack spacing={1} fontSize="xs" color={mutedColor}>
          {['all', 'pending', 'applied', 'dismissed'].map(f => (
            <Badge
              key={f}
              cursor="pointer"
              variant={filter === f ? 'solid' : 'outline'}
              colorScheme={filter === f ? 'blue' : 'gray'}
              fontSize="2xs"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${stats.total})` : 
               f === 'pending' ? `Pending (${stats.pending})` :
               f === 'applied' ? `Applied (${stats.applied})` :
               `Dismissed (${stats.dismissed})`}
            </Badge>
          ))}
        </HStack>
      </Box>

      {/* Suggestions List */}
      <Box flex="1" overflowY="auto" px={2} py={2}>
        <VStack spacing={2} align="stretch">
          {filteredSuggestions.length === 0 && (
            <Box textAlign="center" py={6} color={mutedColor}>
              <Icon as={MdLightbulb} boxSize={8} mb={2} opacity={0.3} />
              <Text fontSize="sm">
                {filter === 'all' ? 'No suggestions found for this document.' : `No ${filter} suggestions.`}
              </Text>
            </Box>
          )}

          {filteredSuggestions.map(suggestion => {
            const severity = SEVERITY_CONFIG[suggestion.severity] || SEVERITY_CONFIG.info;
            const isExpanded = expandedId === suggestion.suggestionId;
            const isDone = suggestion.status !== 'pending';

            return (
              <Box
                key={suggestion.suggestionId}
                bg={cardBg}
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
                borderLeft="3px solid"
                borderLeftColor={`${severity.color}.400`}
                opacity={isDone ? 0.6 : 1}
                transition="all 0.2s"
                _hover={{ shadow: 'sm' }}
              >
                {/* Suggestion Header */}
                <Box 
                  px={3} py={2} 
                  cursor="pointer"
                  onClick={() => setExpandedId(isExpanded ? null : suggestion.suggestionId)}
                >
                  <HStack justify="space-between" align="start">
                    <HStack spacing={2} flex={1} align="start">
                      <Icon as={severity.icon} color={`${severity.color}.400`} mt={0.5} />
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="600" color={textColor} noOfLines={isExpanded ? undefined : 1}>
                          {suggestion.title}
                        </Text>
                        <Badge fontSize="2xs" colorScheme="gray" mt={0.5}>
                          {TYPE_LABELS[suggestion.type] || suggestion.type}
                        </Badge>
                      </Box>
                    </HStack>
                    <Icon as={isExpanded ? FaChevronUp : FaChevronDown} color={mutedColor} boxSize={3} />
                  </HStack>
                </Box>

                {/* Expanded Content */}
                <Collapse in={isExpanded}>
                  <Box px={3} pb={3}>
                    <Divider mb={2} />
                    {suggestion.description && (
                      <Text fontSize="xs" color={mutedColor} mb={2}>
                        {suggestion.description}
                      </Text>
                    )}

                    {suggestion.originalText && (
                      <Box mb={2}>
                        <Text fontSize="2xs" color="red.400" fontWeight="bold">Original:</Text>
                        <Box bg="red.50" p={2} borderRadius="sm" fontSize="xs" maxH="60px" overflowY="auto">
                          <Text color="red.700">{suggestion.originalText}</Text>
                        </Box>
                      </Box>
                    )}

                    {suggestion.suggestedText && (
                      <Box mb={2}>
                        <Text fontSize="2xs" color="green.400" fontWeight="bold">Suggested:</Text>
                        <Box bg="green.50" p={2} borderRadius="sm" fontSize="xs" maxH="60px" overflowY="auto">
                          <Text color="green.700">{suggestion.suggestedText}</Text>
                        </Box>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    {!isDone && (
                      <HStack spacing={2} mt={2}>
                        <Tooltip label="Apply suggestion" fontSize="xs">
                          <IconButton
                            icon={<FaCheck />}
                            size="xs"
                            colorScheme="green"
                            variant="solid"
                            aria-label="Apply"
                            onClick={(e) => {
                              e.stopPropagation();
                              onApply?.(suggestion);
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="Dismiss suggestion" fontSize="xs">
                          <IconButton
                            icon={<FaTimes />}
                            size="xs"
                            colorScheme="red"
                            variant="outline"
                            aria-label="Dismiss"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismiss?.(suggestion);
                            }}
                          />
                        </Tooltip>
                        {onViewInDocument && suggestion.originalText && (
                          <Tooltip label="View in document" fontSize="xs">
                            <IconButton
                              icon={<FaEye />}
                              size="xs"
                              colorScheme="blue"
                              variant="outline"
                              aria-label="View in document"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewInDocument?.(suggestion);
                              }}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    )}

                    {isDone && (
                      <Badge colorScheme={suggestion.status === 'applied' ? 'green' : 'gray'} fontSize="2xs">
                        {suggestion.status === 'applied' ? 'Applied' : 'Dismissed'}
                      </Badge>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
};

export default SmartSuggestionsPanel;
