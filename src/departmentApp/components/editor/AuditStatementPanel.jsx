import React, { useMemo, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Badge,
  Button,
  Collapse,
  useColorModeValue,
  Divider,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  buildAuditEntries,
  filterAuditEntries,
  groupAuditEntriesByDate,
  CHANGE_TYPE_OPTIONS,
} from '../../utils/auditLogUtils';

const typeColor = {
  ai_edit: 'purple',
  manual_edit: 'blue',
  suggestion: 'cyan',
  undo: 'yellow',
  redo: 'green',
  autosave: 'gray',
};

function EntryRow({ entry, expanded, onToggle, onRevert, borderColor, cardBg }) {
  const beforeBg = useColorModeValue('red.50', 'red.900');
  const afterBg = useColorModeValue('green.50', 'green.900');
  const title = entry.instruction || entry.summary || 'Edit';
  const typeScheme = typeColor[entry.changeType] || 'gray';

  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      bg={cardBg}
      opacity={entry.reverted ? 0.75 : 1}
    >
      <HStack
        px={2}
        py={1.5}
        justify="space-between"
        cursor="pointer"
        onClick={onToggle}
        spacing={2}
        align="flex-start"
      >
        <HStack spacing={2} flex={1} align="flex-start">
          <Text fontSize="xs" fontWeight="600" minW="52px" color="gray.500">
            {entry.timeLabel}
          </Text>
          <Badge colorScheme={typeScheme} fontSize="2xs" textTransform="capitalize">
            {String(entry.changeType).replace(/_/g, ' ')}
          </Badge>
          <Text fontSize="xs" fontWeight="500" noOfLines={expanded ? undefined : 2} flex={1}>
            {title}
          </Text>
        </HStack>
        <Text fontSize="2xs" color="gray.400">
          {expanded ? '▲' : '▼'}
        </Text>
      </HStack>
      <Collapse in={expanded} animateOpacity>
        <VStack align="stretch" px={2} pb={2} spacing={2}>
          {entry.summary && entry.instruction && (
            <Text fontSize="2xs" color="gray.500">
              {entry.summary}
            </Text>
          )}
          {entry.previousText ? (
            <Box
              px={1.5}
              py={1}
              bg={beforeBg}
              borderRadius="sm"
              borderLeft="2px solid"
              borderLeftColor="red.300"
            >
              <Text fontSize="2xs" color="red.500" fontWeight="bold">
                Before
              </Text>
              <Text fontSize="2xs" whiteSpace="pre-wrap">
                {entry.previousText}
              </Text>
            </Box>
          ) : null}
          {entry.newText ? (
            <Box
              px={1.5}
              py={1}
              bg={afterBg}
              borderRadius="sm"
              borderLeft="2px solid"
              borderLeftColor="green.300"
            >
              <Text fontSize="2xs" color="green.600" fontWeight="bold">
                After
              </Text>
              <Text fontSize="2xs" whiteSpace="pre-wrap">
                {entry.newText}
              </Text>
            </Box>
          ) : null}
          {entry.changeType === 'suggestion' && !entry.reverted && onRevert && (
            <Button size="xs" variant="ghost" colorScheme="orange" onClick={() => onRevert(entry.index)}>
              ↩ Revert
            </Button>
          )}
          {entry.reverted && (
            <Badge fontSize="2xs" colorScheme="orange" variant="outline" alignSelf="flex-start">
              Reverted
            </Badge>
          )}
        </VStack>
      </Collapse>
    </Box>
  );
}

export default function AuditStatementPanel({ changes = [], onRevertChange, onExport }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const [expandedKey, setExpandedKey] = useState(null);

  const dayHeaderBg = useColorModeValue('blue.800', 'blue.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const filterBg = useColorModeValue('gray.50', 'gray.700');

  const allEntries = useMemo(() => buildAuditEntries(changes), [changes]);
  const filtered = useMemo(
    () => filterAuditEntries(allEntries, { from, to, type, q }),
    [allEntries, from, to, type, q]
  );
  const groups = useMemo(() => groupAuditEntriesByDate(filtered), [filtered]);

  const toggleExpand = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <VStack align="stretch" spacing={2} h="100%">
      <Box p={2} bg={filterBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <Text fontSize="xs" fontWeight="600" mb={2}>
          Filters
        </Text>
        <HStack spacing={2} flexWrap="wrap" align="flex-end">
          <FormControl minW="120px" flex="1">
            <FormLabel fontSize="2xs" mb={0}>
              From
            </FormLabel>
            <Input type="date" size="xs" value={from} onChange={(e) => setFrom(e.target.value)} />
          </FormControl>
          <FormControl minW="120px" flex="1">
            <FormLabel fontSize="2xs" mb={0}>
              To
            </FormLabel>
            <Input type="date" size="xs" value={to} onChange={(e) => setTo(e.target.value)} />
          </FormControl>
          <FormControl minW="110px" flex="1">
            <FormLabel fontSize="2xs" mb={0}>
              Type
            </FormLabel>
            <Select size="xs" value={type} onChange={(e) => setType(e.target.value)}>
              {CHANGE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FormControl>
        </HStack>
        <Input
          mt={2}
          size="xs"
          placeholder="Search instruction, summary, text…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <HStack mt={2} justify="space-between">
          <Text fontSize="2xs" color="gray.500">
            {filtered.length} of {allEntries.length} entries
          </Text>
          <HStack spacing={1}>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                setFrom('');
                setTo('');
                setType('all');
                setQ('');
              }}
            >
              Clear
            </Button>
            {onExport && (
              <Button size="xs" colorScheme="blue" variant="outline" onClick={() => onExport({ from, to, type, q })}>
                Export
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>

      <Box flex="1" overflowY="auto" px={0.5}>
        {groups.length === 0 ? (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
            No entries match your filters
          </Text>
        ) : (
          groups.map(([dateKey, dayEntries]) => (
            <Box key={dateKey} mb={3}>
              <Box
                bg={dayHeaderBg}
                color="white"
                px={2}
                py={1.5}
                borderRadius="md"
                mb={1.5}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text fontSize="xs" fontWeight="700">
                  {dayEntries[0]?.dateLabel || dateKey}
                </Text>
                <Text fontSize="2xs" opacity={0.9}>
                  {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                </Text>
              </Box>
              <VStack align="stretch" spacing={1.5}>
                {dayEntries.map((entry) => {
                  const rowKey = `${dateKey}-${entry.index}`;
                  return (
                    <EntryRow
                      key={rowKey}
                      entry={entry}
                      expanded={expandedKey === rowKey}
                      onToggle={() => toggleExpand(rowKey)}
                      onRevert={onRevertChange}
                      borderColor={borderColor}
                      cardBg={cardBg}
                    />
                  );
                })}
              </VStack>
              <Divider mt={2} />
            </Box>
          ))
        )}
      </Box>
    </VStack>
  );
}
