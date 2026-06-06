import React, { useState, useMemo } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, useColorModeValue, Divider, Button, Flex,
} from '@chakra-ui/react';
import { MdTimeline, MdReorder, MdWarning, MdAutoFixHigh, MdCalendarToday } from 'react-icons/md';
import { FaArrowRight, FaCircle } from 'react-icons/fa';


const VisualTimeline = ({ dates = [], compact }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.750');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const lineColor = useColorModeValue('cyan.300', 'cyan.600');

  
  const events = useMemo(() => {
    if (!dates || dates.length === 0) return [];
    return dates.slice(0, 12).map((d, i) => {
      const parts = String(d).split(':');
      const dateStr = (parts[0] || '').trim();
      const label = (parts.slice(1).join(':') || '').trim() || dateStr;
      
      let color = 'cyan';
      const lower = label.toLowerCase();
      if (lower.includes('filing') || lower.includes('filed'))   color = 'blue';
      if (lower.includes('hearing'))                              color = 'purple';
      if (lower.includes('order') || lower.includes('judgment'))  color = 'green';
      if (lower.includes('notice'))                               color = 'orange';
      if (lower.includes('appeal'))                               color = 'red';
      return { dateStr, label, color, id: i };
    });
  }, [dates]);

  if (events.length === 0) return null;

  return (
    <Box mb={4} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="md" p={3}>
      <HStack spacing={2} mb={3}>
        <Icon as={MdCalendarToday} color="cyan.400" boxSize={3.5} />
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedColor}>
          Document Timeline
        </Text>
        <Badge colorScheme="cyan" fontSize="2xs">{events.length} dates</Badge>
      </HStack>

      <Box overflowX="auto" pb={2} position="relative">
        <Flex
          direction="row" align="flex-start" minW="fit-content"
          position="relative" px={4} py={2}
        >
          <Box
            position="absolute"
            top={compact ? '10px' : '12px'}
            left="30px" right="30px"
            h="2px" bg={lineColor}
            borderRadius="full"
          />

          {events.map((event, i) => (
            <VStack
              key={event.id}
              spacing={1}
              minW={compact ? '90px' : '110px'}
              maxW="130px"
              align="center"
              position="relative"
              px={1}
            >
              
              <Box
                w={compact ? '10px' : '12px'}
                h={compact ? '10px' : '12px'}
                borderRadius="full"
                bg={`${event.color}.400`}
                border="2px solid"
                borderColor={`${event.color}.600`}
                zIndex={1}
                boxShadow={`0 0 0 3px var(--chakra-colors-${event.color}-100, rgba(0,0,0,0.05))`}
              />
              
              <Text
                fontSize="2xs"
                fontWeight="bold"
                color={`${event.color}.500`}
                textAlign="center"
                lineHeight="1.2"
              >
                {event.dateStr}
              </Text>
              <Text
                fontSize="2xs"
                color={mutedColor}
                textAlign="center"
                noOfLines={2}
                lineHeight="1.3"
              >
                {event.label}
              </Text>
            </VStack>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};


const ChronologyPanel = ({
  chronologicalIssues = [],
  extractedDates = [],
  compact = false,
  onApplySuggestion,
}) => {
  const [appliedItems, setAppliedItems] = useState(new Set());
  const [loadingItems, setLoadingItems] = useState(new Set());
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.750');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  
  if (chronologicalIssues.length === 0 && extractedDates.length === 0) {
    return (
      <Box textAlign="center" py={compact ? 4 : 8} color={mutedColor}>
        <Icon as={MdTimeline} boxSize={compact ? 6 : 10} mb={2} opacity={0.3} />
        <Text fontSize="sm" color="green.400" fontWeight="semibold">
          Chronology looks correct!
        </Text>
        <Text fontSize="xs" mt={1} color={mutedColor}>
          No ordering issues detected in this document.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VisualTimeline dates={extractedDates} compact={compact} />

      
      {chronologicalIssues.length > 0 && !compact && (
        <HStack spacing={2} mb={3}>
          <Icon as={MdTimeline} color="cyan.400" />
          <Text fontWeight="bold" fontSize="sm">
            Chronological Issues
            <Badge ml={2} colorScheme="cyan" fontSize="xs">{chronologicalIssues.length}</Badge>
          </Text>
        </HStack>
      )}

      {chronologicalIssues.length === 0 && extractedDates.length > 0 && (
        <Box textAlign="center" py={3}>
          <Text fontSize="xs" color="green.400" fontWeight="semibold">
            No chronological ordering issues found.
          </Text>
        </Box>
      )}

      <VStack spacing={3} align="stretch">
        {chronologicalIssues.map((issue, idx) => (
          <Box
            key={idx}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderLeft="3px solid"
            borderLeftColor="cyan.400"
            borderRadius="md"
            p={3}
          >
            <HStack spacing={2} mb={2}>
              <Icon as={MdWarning} color="orange.400" boxSize={4} />
              <Text fontSize="xs" fontWeight="bold" color={textColor}>
                {issue.item || `Issue #${idx + 1}`}
              </Text>
            </HStack>

            {(issue.expectedOrder || issue.foundOrder) && (
              <Box
                bg={useColorModeValue('cyan.50', 'cyan.900')}
                borderRadius="sm"
                p={2}
                mb={2}
              >
                <HStack spacing={2} align="center" wrap="wrap">
                  <Box>
                    <Text fontSize="2xs" color={mutedColor} fontWeight="semibold" textTransform="uppercase">
                      Found
                    </Text>
                    <Badge colorScheme="red" fontSize="xs" variant="subtle">
                      {issue.foundOrder || '?'}
                    </Badge>
                  </Box>
                  <Icon as={FaArrowRight} color={mutedColor} boxSize={3} />
                  <Box>
                    <Text fontSize="2xs" color={mutedColor} fontWeight="semibold" textTransform="uppercase">
                      Expected
                    </Text>
                    <Badge colorScheme="green" fontSize="xs" variant="subtle">
                      {issue.expectedOrder || '?'}
                    </Badge>
                  </Box>
                </HStack>
              </Box>
            )}

            {issue.description && (
              <Text fontSize="xs" color={mutedColor} lineHeight="1.6">
                {issue.description}
              </Text>
            )}
            {onApplySuggestion && (issue.expectedOrder || issue.description) && (
              <Button
                size="xs" colorScheme={appliedItems.has(`ch_${idx}`) ? 'green' : 'cyan'} variant="solid"
                leftIcon={<Icon as={MdAutoFixHigh} boxSize={3} />}
                fontSize="2xs" mt={2}
                isLoading={loadingItems.has(`ch_${idx}`)}
                isDisabled={appliedItems.has(`ch_${idx}`)}
                loadingText="Applying…"
                onClick={async () => {
                  const itemId = `ch_${idx}`;
                  if (appliedItems.has(itemId)) return;
                  setLoadingItems(prev => new Set([...prev, itemId]));
                  await onApplySuggestion({
                    title: issue.item || `Chronology Fix #${idx + 1}`,
                    description: issue.description || '',
                    originalText: '',
                    suggestedText: `Reorder: "${issue.item || 'event'}" from position ${issue.foundOrder || '?'} to correct chronological position ${issue.expectedOrder || '?'}. ${issue.description || ''}`,
                    type: 'chronology_fix',
                  });
                  setLoadingItems(prev => { const s = new Set(prev); s.delete(itemId); return s; });
                  setAppliedItems(prev => new Set([...prev, itemId]));
                }}
              >
                {appliedItems.has(`ch_${idx}`) ? '✓ Applied' : 'Apply Fix'}
              </Button>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ChronologyPanel;
