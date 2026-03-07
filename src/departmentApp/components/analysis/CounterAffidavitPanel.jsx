import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, Button, Badge, Textarea, Input, Select,
  Spinner, useColorModeValue, Divider, Icon, useToast, Accordion,
  AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
} from '@chakra-ui/react';
import { MdGavel, MdUploadFile, MdDownload, MdAutoAwesome } from 'react-icons/md';
import fileService from '../../services/fileService';

const CounterAffidavitPanel = ({ compact, currentFileId }) => {
  const [petitionText, setPetitionText] = useState('');
  const [court, setCourt] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);
  const [useFile, setUseFile] = useState(false);

  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  const handleGenerate = async () => {
    if (!useFile && petitionText.trim().length < 30) {
      toast({ title: 'Enter at least 30 characters of petition text', status: 'warning', duration: 3000 });
      return;
    }
    if (useFile && !currentFileId) {
      toast({ title: 'No file loaded. Upload a petition first.', status: 'warning', duration: 3000 });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fileService.generateCounterAffidavit({
        fileId: useFile ? currentFileId : undefined,
        petitionText: useFile ? undefined : petitionText,
        court,
        language,
      });
      setResult(res);
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
          petitionerName: result.petitionerName,
          respondentName: result.respondentName,
          caseNumber: result.caseNumber,
          court: result.court,
          preliminaryObjections: result.preliminaryObjections,
          counterDraft: result.counterDraft,
          prayer: result.prayer,
        },
        format,
        court: result.court || court,
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
    <Box h="100%" overflowY="auto" px={compact ? 2 : 4} py={compact ? 2 : 4}>
      <VStack align="stretch" spacing={3}>
        <HStack spacing={2}>
          <Icon as={MdGavel} color="purple.500" boxSize={5} />
          <Text fontSize="sm" fontWeight="bold">Counter Affidavit Generator</Text>
        </HStack>

        <Text fontSize="xs" color={mutedColor}>
          Upload or paste a petition to extract grounds and generate a structured counter affidavit with preliminary objections, para-wise reply, and prayer.
        </Text>

        <Divider />

        <HStack spacing={2}>
          <Button
            size="xs"
            variant={useFile ? 'solid' : 'outline'}
            colorScheme="purple"
            leftIcon={<MdUploadFile />}
            onClick={() => setUseFile(true)}
            isDisabled={!currentFileId}
          >
            Use Current File
          </Button>
          <Button
            size="xs"
            variant={!useFile ? 'solid' : 'outline'}
            colorScheme="purple"
            onClick={() => setUseFile(false)}
          >
            Paste Text
          </Button>
        </HStack>

        {!useFile && (
          <Textarea
            size="sm"
            placeholder="Paste petition text here..."
            value={petitionText}
            onChange={(e) => setPetitionText(e.target.value)}
            minH="120px"
            fontSize="xs"
          />
        )}

        <HStack spacing={2}>
          <Input
            size="xs"
            placeholder="Court name (optional)"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            flex={1}
          />
          <Select size="xs" value={language} onChange={(e) => setLanguage(e.target.value)} w="100px">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </Select>
        </HStack>

        <Button
          size="sm"
          colorScheme="purple"
          leftIcon={<MdAutoAwesome />}
          onClick={handleGenerate}
          isLoading={loading}
          loadingText="Analyzing..."
        >
          Generate Counter Affidavit
        </Button>

        {result && (
          <VStack align="stretch" spacing={3} mt={2}>
            <Divider />

            <HStack justify="space-between">
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

            <Box p={2} bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="md">
              <HStack spacing={4} flexWrap="wrap">
                {result.petitionerName && <Text fontSize="xs"><strong>Petitioner:</strong> {result.petitionerName}</Text>}
                {result.respondentName && <Text fontSize="xs"><strong>Respondent:</strong> {result.respondentName}</Text>}
                {result.caseNumber && <Text fontSize="xs"><strong>Case:</strong> {result.caseNumber}</Text>}
                {result.court && <Text fontSize="xs"><strong>Court:</strong> {result.court}</Text>}
              </HStack>
            </Box>

            <Accordion allowMultiple defaultIndex={[0, 1, 2, 3]}>
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
  );
};

export default CounterAffidavitPanel;
