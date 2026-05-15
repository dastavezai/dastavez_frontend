import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, VStack, HStack, Text, Button, Badge, Textarea, Input, Select,
  Spinner, useColorModeValue, Divider, Icon, useToast, Accordion,
  AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
} from '@chakra-ui/react';
import { MdGavel, MdDownload, MdAutoAwesome } from 'react-icons/md';
import fileService from '../../services/fileService';

const cleanPartyScan = (val) => {
  if (!val) return '';
  const cleaned = String(val).replace(/_{3,}/g, '').replace(/\s{2,}/g, ' ').replace(/^[\s,./;:-]+|[\s,./;:-]+$/g, '').trim();
  return cleaned.length > 2 ? cleaned : '';
};

const CounterAffidavitPanel = ({
  compact,
  currentFileId,
  extractedParties = null,
  onOpenGeneratedCounter = null,
}) => {
  const [petitionText, setPetitionText] = useState('');
  const [court, setCourt] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);
  const [useFile, setUseFile] = useState(!!currentFileId);

  useEffect(() => {
    if (currentFileId) {
      setUseFile(true);
    }
  }, [currentFileId]);

  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const panelBg = useColorModeValue('gray.50', 'gray.850');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const subtleCardBg = useColorModeValue('gray.50', 'gray.900');
  const dropBorder = useColorModeValue('gray.300', 'gray.600');

  /** Prefer API result; fill gaps from Smart Scan “Parties Identified” so export caption matches the dashboard. */
  const mergedResult = useMemo(() => {
    if (!result) return null;
    const ep = extractedParties || {};
    return {
      ...result,
      petitionerName: cleanPartyScan(result.petitionerName) || cleanPartyScan(ep.petitioner) || result.petitionerName,
      respondentName: cleanPartyScan(result.respondentName) || cleanPartyScan(ep.respondent) || result.respondentName,
      caseNumber: cleanPartyScan(result.caseNumber) || cleanPartyScan(ep.caseNumber) || result.caseNumber,
      court: cleanPartyScan(result.court) || cleanPartyScan(ep.court) || result.court,
    };
  }, [result, extractedParties]);

  const handleGenerate = async () => {
    const fileMode = !!currentFileId;
    if (!useFile && petitionText.trim().length < 30) {
      toast({ title: 'Enter at least 30 characters of petition text', status: 'warning', duration: 3000 });
      return;
    }
    if ((useFile || fileMode) && !currentFileId) {
      toast({ title: 'No file loaded. Upload a petition first.', status: 'warning', duration: 3000 });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fileService.generateCounterAffidavit({
        fileId: fileMode || useFile ? currentFileId : undefined,
        petitionText: fileMode || useFile ? undefined : petitionText,
        court: fileMode ? undefined : court,
        language,
        createEditableDocument: !!((fileMode || useFile) && currentFileId && onOpenGeneratedCounter),
      });
      setResult(res);
      if (res?.editorFileId && typeof onOpenGeneratedCounter === 'function') {
        onOpenGeneratedCounter(res);
      }
      toast({ title: 'Counter affidavit generated', status: 'success', duration: 3000 });
    } catch (err) {
      toast({ title: err?.response?.data?.message || 'Generation failed', status: 'error', duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!result) return;
    setExporting(true);
    try {
      const data = await fileService.exportCounterAffidavit({
        counterData: {
          petitionerName: mergedResult.petitionerName,
          respondentName: mergedResult.respondentName,
          caseNumber: mergedResult.caseNumber,
          court: mergedResult.court,
          sourceDocumentType: mergedResult.sourceDocumentType,
          statementOfFacts: mergedResult.statementOfFacts,
          preliminaryObjections: mergedResult.preliminaryObjections,
          counterDraft: mergedResult.counterDraft,
          prayer: mergedResult.prayer,
          verification: mergedResult.verification,
        },
        format,
        court: mergedResult.court || court,
        language,
      });

      const blob = data instanceof Blob ? data : new Blob([data], { type: format === 'pdf' ? 'application/pdf' : 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `counter_affidavit.${format === 'pdf' ? 'pdf' : 'html'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({ title: 'Export failed', status: 'error', duration: 3000 });
    } finally {
      setExporting(false);
    }
  };

  return (
    <VStack spacing={3} align="stretch" h="100%">
      <Box px={compact ? 2 : 3} pt={compact ? 2 : 3}>
        <HStack spacing={2}>
          <Icon as={MdGavel} color="purple.500" boxSize={4} />
          <Text fontWeight="semibold" fontSize={compact ? 'sm' : 'md'}>
            Counter Draft
          </Text>
        </HStack>
        <Text fontSize="2xs" color={mutedColor} mt={0.5}>
          {currentFileId
            ? 'One‑click counter draft from this document + Smart Scan. It opens in OnlyOffice and you can switch between Main / Counter from the top bar.'
            : 'Paste a petition to extract grounds and generate a counter affidavit draft.'}
        </Text>
      </Box>

      <Box flex={1} overflowY="auto" px={compact ? 2 : 3} pb={2}>
        <VStack align="stretch" spacing={3}>
          <Box
            bg={panelBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="lg"
            p={3}
          >
            <VStack align="stretch" spacing={3}>
              {currentFileId ? (
                <Box
                  bg={subtleCardBg}
                  border="1px solid"
                  borderColor={dropBorder}
                  borderRadius="md"
                  p={3}
                >
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={0} minW={0}>
                      <Text fontSize="xs" fontWeight="bold" color={headingColor}>
                        Using current document
                      </Text>
                      <Text fontSize="2xs" color={mutedColor}>
                        Smart Scan fields, parties, statutes and summary will be used automatically.
                      </Text>
                    </VStack>
                    <Select
                      size="xs"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      w="140px"
                      bg={cardBg}
                    >
                      <option value="en">English Draft</option>
                      <option value="hi">Hindi Draft</option>
                    </Select>
                  </HStack>
                </Box>
              ) : (
                <>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color={headingColor} mb={1}>
                      Petition text
                    </Text>
                    <Box
                      border="1px dashed"
                      borderColor={dropBorder}
                      borderRadius="lg"
                      bg={subtleCardBg}
                      p={3}
                    >
                      <Textarea
                        size="sm"
                        placeholder="Paste petition text here..."
                        value={petitionText}
                        onChange={(e) => setPetitionText(e.target.value)}
                        minH="140px"
                        fontSize="xs"
                        bg={cardBg}
                      />
                    </Box>
                  </Box>

                  <HStack spacing={2}>
                    <Input
                      size="xs"
                      placeholder="Court name (optional)"
                      value={court}
                      onChange={(e) => setCourt(e.target.value)}
                      flex={1}
                      bg={cardBg}
                    />
                    <Select
                      size="xs"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      w="120px"
                      bg={cardBg}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </Select>
                  </HStack>
                </>
              )}

              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<MdAutoAwesome />}
                onClick={handleGenerate}
                isLoading={loading}
                loadingText="Analyzing..."
                isDisabled={!currentFileId && petitionText.trim().length < 30}
              >
                {currentFileId && onOpenGeneratedCounter ? 'Generate Counter' : 'Generate Counter Affidavit'}
              </Button>
              {!currentFileId && (
                <Text fontSize="2xs" color={mutedColor} mt={-1}>
                  Tip: For best results, paste the full petition text (at least a few paragraphs).
                </Text>
              )}
            </VStack>
          </Box>

          {result && (
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="bold" color="purple.600">Generated Result</Text>
                <HStack spacing={1}>
                  <Button size="xs" leftIcon={<MdDownload />} onClick={() => handleExport('html')} isLoading={exporting}>
                    HTML
                  </Button>
                  <Button size="xs" leftIcon={<MdDownload />} colorScheme="red" onClick={() => handleExport('pdf')} isLoading={exporting}>
                    PDF
                  </Button>
                </HStack>
              </HStack>

              <Box p={3} bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
                <HStack spacing={4} flexWrap="wrap">
                  {mergedResult?.petitionerName && <Text fontSize="xs"><strong>Petitioner:</strong> {mergedResult.petitionerName}</Text>}
                  {mergedResult?.respondentName && <Text fontSize="xs"><strong>Respondent:</strong> {mergedResult.respondentName}</Text>}
                  {mergedResult?.caseNumber && <Text fontSize="xs"><strong>Case:</strong> {mergedResult.caseNumber}</Text>}
                  {mergedResult?.court && <Text fontSize="xs"><strong>Court:</strong> {mergedResult.court}</Text>}
                  {mergedResult?.sourceDocumentType && (
                    <Text fontSize="xs"><strong>Doc type:</strong> {mergedResult.sourceDocumentType}</Text>
                  )}
                </HStack>
              </Box>

              <Accordion allowMultiple defaultIndex={[0, 1, 2, 3, 4]}>
              <AccordionItem>
                <AccordionButton py={1}>
                  <HStack flex="1" spacing={2}>
                    <Text fontSize="xs" fontWeight="bold">Petition Grounds</Text>
                    <Badge colorScheme="blue" fontSize="2xs">{result.grounds?.length || 0}</Badge>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={2}>
                  <VStack align="stretch" spacing={1}>
                    {result.grounds?.map((g, i) => (
                      <Box key={i} p={2} bg="blue.50" borderRadius="sm" fontSize="xs">
                        <Text fontWeight="bold">Para {g.paraNo}: {g.claim}</Text>
                        {g.provision && <Text color={mutedColor}>Provision: {g.provision}</Text>}
                        {g.relief && <Text color="blue.600">Relief: {g.relief}</Text>}
                      </Box>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton py={1}>
                  <HStack flex="1" spacing={2}>
                    <Text fontSize="xs" fontWeight="bold">Statement of Facts</Text>
                    <Badge colorScheme="cyan" fontSize="2xs">{result.statementOfFacts?.length || 0}</Badge>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={2}>
                  <VStack align="stretch" spacing={1}>
                    {result.statementOfFacts?.length ? (
                      result.statementOfFacts.map((f, i) => (
                        <Box key={i} p={2} bg="cyan.50" borderRadius="sm" fontSize="xs">
                          <Text>{i + 1}. {f}</Text>
                        </Box>
                      ))
                    ) : (
                      <Text fontSize="xs" color={mutedColor}>No separate facts block returned.</Text>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton py={1}>
                  <HStack flex="1" spacing={2}>
                    <Text fontSize="xs" fontWeight="bold">Preliminary Objections</Text>
                    <Badge colorScheme="orange" fontSize="2xs">{result.preliminaryObjections?.length || 0}</Badge>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={2}>
                  <VStack align="stretch" spacing={1}>
                    {result.preliminaryObjections?.map((obj, i) => (
                      <Box key={i} p={2} bg="orange.50" borderRadius="sm" fontSize="xs">
                        <Text>{i + 1}. {obj}</Text>
                      </Box>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton py={1}>
                  <HStack flex="1" spacing={2}>
                    <Text fontSize="xs" fontWeight="bold">Para-wise Counter</Text>
                    <Badge colorScheme="purple" fontSize="2xs">{result.counterDraft?.length || 0}</Badge>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={2}>
                  <VStack align="stretch" spacing={2}>
                    {result.counterDraft?.map((item, i) => (
                      <Box key={i} p={2} bg="purple.50" borderRadius="sm" fontSize="xs">
                        <Text fontWeight="bold">Para {item.paraNo}:</Text>
                        <Text mt={1}>{item.counterArgument}</Text>
                        {item.supportingLaw && (
                          <Text color="purple.600" mt={1} fontStyle="italic">{item.supportingLaw}</Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton py={1}>
                  <Text flex="1" fontSize="xs" fontWeight="bold" textAlign="left">Prayer</Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={2}>
                  <Text fontSize="xs" bg="green.50" p={2} borderRadius="sm">{result.prayer}</Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            </VStack>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default CounterAffidavitPanel;
