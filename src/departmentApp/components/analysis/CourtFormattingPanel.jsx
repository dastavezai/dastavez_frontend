import React, { useState, useCallback } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Button, useColorModeValue,
  Spinner, SimpleGrid, Tag, Tooltip, Radio, RadioGroup, Stack,
  Divider, useToast, Switch,
} from '@chakra-ui/react';
import {
  MdFormatSize, MdFormatAlignLeft, MdMargin, MdCheckCircle,
  MdAutoFixHigh, MdDescription,
} from 'react-icons/md';
import { FaGavel, FaUniversity } from 'react-icons/fa';

const COURT_PRESETS = {
  supreme_court: {
    name: 'Supreme Court of India',
    shortName: 'SC',
    color: 'red',
    icon: FaGavel,
    rules: {
      fontFamily: 'Times New Roman',
      fontSize: '14pt',
      lineHeight: '2.0',
      marginTop: '1.5in',
      marginBottom: '1in',
      marginLeft: '1.5in',
      marginRight: '1in',
      alignment: 'justified',
      pageSize: 'A4',
      headerFormat: 'IN THE SUPREME COURT OF INDIA',
      numberingStyle: 'Para 1.',
      footerText: 'Advocate for the Petitioner / Respondent',
    },
    description: 'Double-spaced, 14pt Times New Roman, 1.5" left margin',
  },
  high_court: {
    name: 'High Court',
    shortName: 'HC',
    color: 'blue',
    icon: FaUniversity,
    rules: {
      fontFamily: 'Times New Roman',
      fontSize: '14pt',
      lineHeight: '1.5',
      marginTop: '1in',
      marginBottom: '1in',
      marginLeft: '1.5in',
      marginRight: '1in',
      alignment: 'justified',
      pageSize: 'A4',
      headerFormat: 'IN THE HIGH COURT OF ___',
      numberingStyle: 'Para 1.',
      footerText: 'Advocate for the Petitioner / Respondent',
    },
    description: '1.5 line spacing, 14pt Times New Roman, formal header',
  },
  district_court: {
    name: 'District / Sessions Court',
    shortName: 'DC',
    color: 'green',
    icon: FaGavel,
    rules: {
      fontFamily: 'Times New Roman',
      fontSize: '14pt',
      lineHeight: '1.5',
      marginTop: '1in',
      marginBottom: '1in',
      marginLeft: '1in',
      marginRight: '1in',
      alignment: 'justified',
      pageSize: 'Legal',
      headerFormat: 'IN THE COURT OF ___',
      numberingStyle: '1.',
      footerText: '',
    },
    description: '1.5 spacing, 14pt, standard margins, Legal size option',
  },
  nclt: {
    name: 'NCLT / NCLAT',
    shortName: 'NCLT',
    color: 'purple',
    icon: FaUniversity,
    rules: {
      fontFamily: 'Arial',
      fontSize: '12pt',
      lineHeight: '1.5',
      marginTop: '1in',
      marginBottom: '1in',
      marginLeft: '1.25in',
      marginRight: '1in',
      alignment: 'justified',
      pageSize: 'A4',
      headerFormat: 'BEFORE THE NATIONAL COMPANY LAW TRIBUNAL',
      numberingStyle: '1.',
      footerText: '',
    },
    description: '12pt Arial, 1.5 spacing, A4, clean format',
  },
  consumer_forum: {
    name: 'Consumer Forum / NCDRC',
    shortName: 'CF',
    color: 'orange',
    icon: FaGavel,
    rules: {
      fontFamily: 'Times New Roman',
      fontSize: '13pt',
      lineHeight: '1.5',
      marginTop: '1in',
      marginBottom: '1in',
      marginLeft: '1in',
      marginRight: '1in',
      alignment: 'justified',
      pageSize: 'A4',
      headerFormat: 'BEFORE THE NATIONAL / STATE / DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION',
      numberingStyle: '1.',
      footerText: '',
    },
    description: '13pt Times New Roman, A4, standard margins',
  },
  arbitration: {
    name: 'Arbitration Proceedings',
    shortName: 'ARB',
    color: 'cyan',
    icon: FaUniversity,
    rules: {
      fontFamily: 'Georgia',
      fontSize: '12pt',
      lineHeight: '1.5',
      marginTop: '1in',
      marginBottom: '1in',
      marginLeft: '1.25in',
      marginRight: '1in',
      alignment: 'justified',
      pageSize: 'A4',
      headerFormat: 'BEFORE THE SOLE ARBITRATOR / ARBITRAL TRIBUNAL',
      numberingStyle: 'Para 1.',
      footerText: '',
    },
    description: '12pt Georgia, clean professional look',
  },
};

const CourtFormattingPanel = ({ compact = false, editor, onApplySuggestion }) => {
  const [selectedCourt, setSelectedCourt] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [addHeader, setAddHeader] = useState(true);
  const [addNumbering, setAddNumbering] = useState(true);
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');

  const applyFormatting = useCallback(async () => {
    if (!selectedCourt || !editor) return;
    setApplying(true);
    try {
      const preset = COURT_PRESETS[selectedCourt];
      const rules = preset.rules;

      
      editor.chain().focus().selectAll().run();

      
      if (editor.commands.setFontFamily) {
        editor.commands.setFontFamily(rules.fontFamily);
      }

      
      const sizeNum = parseFloat(rules.fontSize);
      const sizePx = Math.round(sizeNum * 1.333);
      if (editor.commands.setFontSize) {
        editor.commands.setFontSize(`${sizePx}px`);
      }

      
      if (editor.commands.setTextAlign) {
        editor.commands.setTextAlign('justify');
      }

      
      const editorEl = editor.view?.dom;
      if (editorEl) {
        editorEl.style.lineHeight = rules.lineHeight;
        editorEl.style.fontFamily = rules.fontFamily;
      }

      
      if (addHeader && rules.headerFormat) {
        const headerHtml = `<p style="text-align:center;font-weight:bold;font-size:${Math.round(sizeNum * 1.333 + 2)}px;text-transform:uppercase;margin-bottom:20px;">${rules.headerFormat}</p>`;
        
        editor.commands.focus('start');
        editor.commands.insertContent(headerHtml);
      }

      setApplied(true);
      toast({
        title: `${preset.shortName} formatting applied`,
        description: `${rules.fontFamily}, ${rules.fontSize}, ${rules.lineHeight} spacing`,
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      console.error('Formatting error:', err);
      toast({ title: 'Failed to apply formatting', status: 'error', duration: 3000 });
    } finally {
      setApplying(false);
    }
  }, [selectedCourt, editor, addHeader, addNumbering, toast]);

  return (
    <VStack spacing={3} align="stretch" h="100%">
      <Box px={compact ? 2 : 3} pt={compact ? 2 : 3}>
        <Text fontWeight="semibold" fontSize={compact ? 'sm' : 'md'}>
          Court-Ready Formatting
        </Text>
        <Text fontSize="2xs" color={mutedColor}>
          Apply court-specific formatting rules
        </Text>
      </Box>

      <Box flex={1} overflowY="auto" px={compact ? 2 : 3} pb={2}>
        <VStack spacing={2} align="stretch">
          {Object.entries(COURT_PRESETS).map(([key, preset]) => {
            const isSelected = selectedCourt === key;
            return (
              <Box
                key={key}
                bg={isSelected ? selectedBg : cardBg}
                border="2px solid"
                borderColor={isSelected ? `${preset.color}.400` : borderColor}
                borderRadius="md"
                p={compact ? 2 : 3}
                cursor="pointer"
                onClick={() => { setSelectedCourt(key); setApplied(false); }}
                _hover={{ borderColor: `${preset.color}.300` }}
                transition="all 0.15s"
              >
                <HStack spacing={2} align="start">
                  <Icon as={preset.icon} color={`${preset.color}.400`} boxSize={4} mt={0.5} />
                  <Box flex={1}>
                    <Text fontSize="xs" fontWeight="bold" color={textColor}>
                      {preset.name}
                    </Text>
                    <Text fontSize="2xs" color={mutedColor}>{preset.description}</Text>
                    {isSelected && (
                      <VStack spacing={1} mt={2} align="stretch">
                        <HStack spacing={3} flexWrap="wrap">
                          <Tag size="sm" fontSize="2xs" colorScheme="blue">{preset.rules.fontFamily}</Tag>
                          <Tag size="sm" fontSize="2xs" colorScheme="green">{preset.rules.fontSize}</Tag>
                          <Tag size="sm" fontSize="2xs" colorScheme="purple">{preset.rules.lineHeight}x spacing</Tag>
                          <Tag size="sm" fontSize="2xs" colorScheme="orange">{preset.rules.pageSize}</Tag>
                        </HStack>
                        <Text fontSize="2xs" color={mutedColor}>
                          Margins: T:{preset.rules.marginTop} B:{preset.rules.marginBottom} L:{preset.rules.marginLeft} R:{preset.rules.marginRight}
                        </Text>
                      </VStack>
                    )}
                  </Box>
                  {isSelected && <Icon as={MdCheckCircle} color={`${preset.color}.400`} boxSize={4} />}
                </HStack>
              </Box>
            );
          })}

          {selectedCourt && (
            <>
              <Divider />
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="xs" color={textColor}>Insert Court Header</Text>
                  <Switch
                    size="sm"
                    isChecked={addHeader}
                    onChange={(e) => setAddHeader(e.target.checked)}
                    colorScheme="blue"
                  />
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="xs" color={textColor}>Auto-number Paragraphs</Text>
                  <Switch
                    size="sm"
                    isChecked={addNumbering}
                    onChange={(e) => setAddNumbering(e.target.checked)}
                    colorScheme="blue"
                  />
                </HStack>
              </VStack>

              <Button
                size="sm"
                colorScheme={COURT_PRESETS[selectedCourt]?.color || 'blue'}
                onClick={applyFormatting}
                isLoading={applying}
                loadingText="Applying..."
                fontSize="xs"
                leftIcon={applied ? <Icon as={MdCheckCircle} /> : <Icon as={MdAutoFixHigh} />}
              >
                {applied ? 'Applied ✓' : `Apply ${COURT_PRESETS[selectedCourt]?.shortName} Format`}
              </Button>
            </>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default CourtFormattingPanel;
