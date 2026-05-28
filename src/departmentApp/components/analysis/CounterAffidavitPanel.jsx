import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const counterStudioHref = (fileId) => {
  const id = encodeURIComponent(fileId);
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/department')) {
    return `/department/counter_editor?fileId=${id}`;
  }
  return `/counter_editor?fileId=${id}`;
};

const CounterAffidavitPanel = ({
  compact,
  currentFileId,
  extractedParties = null,
}) => {
  const navigate = useNavigate();
  const [petitionText, setPetitionText] = useState('');
  const [court, setCourt] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);
  const [designId, setDesignId] = useState('');
  const [designOptions, setDesignOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fileService.getCounterAffidavitDesigns();
        if (cancelled) return;
        const list = data?.designs || [];
        setDesignOptions(list);
        if (!designId && data?.defaultDesignId) {
          setDesignId(data.defaultDesignId);
        }
      } catch (_) {
        if (!cancelled) setDesignOptions([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
    if (currentFileId) {
      return;
    }
    if (petitionText.trim().length < 30) {
      toast({ title: 'Enter at least 30 characters of petition text', status: 'warning', duration: 3000 });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fileService.generateCounterAffidavit({
        fileId: undefined,
        petitionText,
        court,
        language,
        designId: designId || undefined,
        createEditableDocument: false,
      });
      setResult(res);
      if (res?.designId) setDesignId(res.designId);
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
          documentTitle: mergedResult.documentTitle,
          deponentDetails: mergedResult.deponentDetails,
          statementOfFacts: mergedResult.statementOfFacts,
          statementOfAdditionalFacts: mergedResult.statementOfAdditionalFacts,
          preliminaryObjections: mergedResult.preliminaryObjections,
          counterDraft: mergedResult.counterDraft,
          prayer: mergedResult.prayer,
          verification: mergedResult.verification,
        },
        format,
        court: mergedResult.court || court,
        language,
        designId: result?.designId || designId || undefined,
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
            ? 'Open Counter Studio for a full-page TipTap workspace: generate, edit, and export HTML or PDF without leaving the analysis flow.'
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
                  p={4}
                >
                  <VStack align="stretch" spacing={3}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                        Counter Studio
                      </Text>
                      <Text fontSize="xs" color={mutedColor}>
                        Uses this file and Smart Scan context (parties, doc type, extracted text). Choose template and language on the next page.
                      </Text>
                    </VStack>
                    <Button
                      size="md"
                      colorScheme="purple"
                      leftIcon={<MdAutoAwesome />}
                      onClick={() => navigate(counterStudioHref(currentFileId))}
                    >
                      Open Counter Studio
                    </Button>
                  </VStack>
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
                  {designOptions.length > 0 && (
                    <Box>
                      <Text fontSize="2xs" fontWeight="bold" color={headingColor} mb={1}>
                        Court layout template
                      </Text>
                      <Select
                        size="xs"
                        value={designId}
                        onChange={(e) => setDesignId(e.target.value)}
                        bg={cardBg}
                      >
                        {designOptions.map((d) => (
                          <option key={d.id} value={d.id}>{d.label || d.id}</option>
                        ))}
                      </Select>
                    </Box>
                  )}
                </>
              )}

              {!currentFileId && (
                <Button
                  size="sm"
                  colorScheme="purple"
                  leftIcon={<MdAutoAwesome />}
                  onClick={handleGenerate}
                  isLoading={loading}
                  loadingText="Analyzing..."
                  isDisabled={petitionText.trim().length < 30}
                >
                  Generate Counter Affidavit
                </Button>
              )}
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

              {result.previewHtml && (
                <Box
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  overflow="hidden"
                  bg="white"
                >
                  <Text fontSize="xs" fontWeight="bold" px={3} py={2} bg={panelBg} color={headingColor}>
                    Formatted preview ({result.designId || designId || 'template'})
                  </Text>
                  <Box
                    as="iframe"
                    title="Counter affidavit preview"
                    srcDoc={result.previewHtml}
                    w="100%"
                    h="420px"
                    border="0"
                    bg="white"
                  />
                </Box>
              )}

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

              {result.deponentDetails && (
                <AccordionItem>
                  <AccordionButton py={1}>
                    <Text flex="1" fontSize="xs" fontWeight="bold" textAlign="left">Deponent</Text>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={2}>
                    <Text fontSize="xs" whiteSpace="pre-wrap">{result.deponentDetails}</Text>
                  </AccordionPanel>
                </AccordionItem>
              )}

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
                        <HStack spacing={2}>
                          <Text fontWeight="bold">Petition Para {item.petitionParaNo ?? item.paraNo}:</Text>
                          {item.stance && <Badge fontSize="2xs" colorScheme="gray">{item.stance}</Badge>}
                        </HStack>
                        <Text mt={1}>{item.counterArgument}</Text>
                        {item.supportingLaw && (
                          <Text color="purple.600" mt={1} fontStyle="italic">{item.supportingLaw}</Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {result.statementOfAdditionalFacts?.length > 0 && (
                <AccordionItem>
                  <AccordionButton py={1}>
                    <HStack flex="1" spacing={2}>
                      <Text fontSize="xs" fontWeight="bold">Additional Facts</Text>
                      <Badge colorScheme="teal" fontSize="2xs">{result.statementOfAdditionalFacts.length}</Badge>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={2}>
                    <VStack align="stretch" spacing={1}>
                      {result.statementOfAdditionalFacts.map((fact, i) => (
                        <Text key={i} fontSize="xs">{i + 1}. {fact}</Text>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )}

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
