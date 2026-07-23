import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, VStack, HStack, Flex, Text, Badge, Icon, Heading, Button, Progress,
  useColorModeValue, Spinner, IconButton, Textarea, Input, Select,
  Alert, AlertIcon, Tabs, TabList, TabPanels, Tab, TabPanel, useToast
} from '@chakra-ui/react';
import { FaTimes, FaDownload, FaFileAlt, FaGavel, FaPlus, FaTrash } from 'react-icons/fa';
import { FiEdit, FiUploadCloud, FiCheckCircle, FiZap, FiRefreshCw, FiFile, FiEye } from 'react-icons/fi';
import { useAdvancedChat } from '../AdvancedChatContext';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5173/api').replace(/\/+$/, '');

const CounterMakerPanel = () => {
  const {
    counterMakerStatus,
    counterMakerResults,
    setIsCounterMakerPanelOpen,
    handleSendMessage,
    messages,
    selectedFile,
    isUploading,
    uploading,
    uploadProgress,
    analyzingFile,
    token
  } = useAdvancedChat();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [designId, setDesignId] = useState('writ-petition-counter');
  const [court, setCourt] = useState('IN THE HIGH COURT OF JUDICATURE AT PATNA');
  const [caseNumber, setCaseNumber] = useState('');
  const [petitioner, setPetitioner] = useState('');
  const [respondent, setRespondent] = useState('');
  const [deponent, setDeponent] = useState('');
  const [preliminaryObjections, setPreliminaryObjections] = useState([
    'The present petition is not maintainable in law or on facts.',
    'The petitioner has suppressed material facts and approached this Hon\'ble Court with unclean hands.',
    'The petition is barred by the principles of delay and laches.'
  ]);
  const [newObjection, setNewObjection] = useState('');
  const [paraReplies, setParaReplies] = useState([
    { paraNum: 1, type: 'Matter of Record', text: 'Paragraph 1 is a matter of record and needs no specific reply.' },
    { paraNum: 2, type: 'Denied', text: 'Paragraph 2 is wrong, false, and categorically denied. The petitioner\'s allegations are baseless.' }
  ]);
  const [prayerText, setPrayerText] = useState('It is therefore most respectfully prayed that this Hon\'ble Court may be pleased to dismiss the petition with exemplary costs in the interest of justice.');

  const [isGenerating, setIsGenerating] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const toast = useToast();

  const panelBg = useColorModeValue('white', 'gray.850');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const headerBg = useColorModeValue('orange.50', 'orange.900');
  const paperBg = useColorModeValue('#ffffff', '#141824');
  const paperTextColor = useColorModeValue('gray.900', 'gray.100');

  const isFileProcessing = isUploading || uploading || analyzingFile;
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');

  useEffect(() => {
    if (counterMakerResults?.content) {
      setDraftContent(counterMakerResults.content);
    } else if (lastAssistantMsg?.content && lastAssistantMsg.content.includes('COUNTER AFFIDAVIT')) {
      setDraftContent(lastAssistantMsg.content);
    }
  }, [counterMakerResults, lastAssistantMsg]);

  // Smart Auto-extraction when selectedFile is present
  useEffect(() => {
    if (selectedFile) {
      const text = selectedFile.text || selectedFile.extractedText || selectedFile.content || '';
      if (!text) return;

      // Extract Court Name
      const courtMatch = text.match(/(IN THE HIGH COURT OF [^\n,]{3,60}|IN THE COURT OF [^\n,]{3,60}|BEFORE THE [^\n,]{3,60})/i);
      if (courtMatch && (!court || court === 'IN THE HIGH COURT OF JUDICATURE AT PATNA')) {
        setCourt(courtMatch[0].trim());
      }

      // Extract Case Number
      const caseMatch = text.match(/((?:W\.?P\.?|C\.?W\.?P\.?|S\.?L\.?P\.?|Crl\.?\s*M\.?P\.?|M\.?J\.?C\.?|CIVIL SUIT|ORIGINAL SUIT|APPEAL)\s*(?:\([C|R|A]\))?\s*(?:NO\.?|NUMBER)?\s*[\d\/\\-]+\s*(?:OF|IN|TO)?\s*[\d]{2,4})/i);
      if (caseMatch && !caseNumber) {
        setCaseNumber(caseMatch[0].trim());
      }

      // Extract Petitioner
      const petitionerMatch = text.match(/([A-Z\s.]{3,40})\s+(?:\.{3,}\s*)?(?:Petitioner|Complainant|Applicant)/i);
      if (petitionerMatch && !petitioner) {
        setPetitioner(petitionerMatch[1].trim());
      }

      // Extract Respondent
      const respondentMatch = text.match(/(?:VERSUS|VS\.?|V\/S)\s+([A-Z\s.,\n]{3,60})(?:\.{3,}\s*)?(?:Respondent|Opposite Party|Defendant)/i);
      if (respondentMatch && !respondent) {
        setRespondent(respondentMatch[1].trim());
      }

      // Extract Paragraphs if text exists
      if (text.length > 50) {
        const rawParas = text.split(/\n\s*\n|\n(?=\d+[\.\)]\s+)/).filter(p => p.trim().length > 15);
        if (rawParas.length > 0) {
          const extractedList = rawParas.slice(0, 10).map((p, idx) => ({
            paraNum: idx + 1,
            type: idx === 0 ? 'Matter of Record' : 'Denied',
            text: p.trim().substring(0, 250) + (p.length > 250 ? '...' : '')
          }));
          setParaReplies(extractedList);
        }
      }
    }
  }, [selectedFile]);

  // Compute live formatted legal preview
  const liveFormattedPreview = useMemo(() => {
    if (draftContent && draftContent.trim().length > 50) {
      return draftContent;
    }

    const courtTitle = (court || 'IN THE HIGH COURT OF JUDICATURE AT PATNA').toUpperCase();
    const caseNoStr = caseNumber ? caseNumber.toUpperCase() : 'WRIT PETITION (CIVIL) NO. _____ OF 2026';
    const petStr = petitioner ? petitioner.toUpperCase() : 'PETITIONER NAME';
    const respStr = respondent ? respondent.toUpperCase() : 'RESPONDENT NAME';
    const depStr = deponent ? deponent : (respondent || 'the Respondent');

    let docHeading = 'COUNTER AFFIDAVIT ON BEHALF OF THE RESPONDENT';
    if (designId === 'mjc-show-cause-counter') {
      docHeading = 'SHOW CAUSE REPLY / COUNTER AFFIDAVIT ON BEHALF OF RESPONDENT';
    } else if (designId === 'india-formal-affidavit') {
      docHeading = 'FORMAL AFFIDAVIT ON BEHALF OF THE RESPONDENT';
    }

    const objectionsText = preliminaryObjections.length > 0
      ? preliminaryObjections.map((obj, i) => `${i + 1}. ${obj}`).join('\n')
      : '1. The present petition is not maintainable in law or on facts.';

    const parasText = paraReplies.length > 0
      ? paraReplies.map(p => `Paragraph ${p.paraNum}: ${p.type === 'Denied' ? 'That with respect to Paragraph ' + p.paraNum + ', the contents thereof are wrong, false and denied. ' : p.type === 'Matter of Record' ? 'That with respect to Paragraph ' + p.paraNum + ', the contents thereof are a matter of record. ' : 'That with respect to Paragraph ' + p.paraNum + ', '}${p.text}`).join('\n\n')
      : 'Paragraph 1: The contents of paragraph 1 are a matter of record.\n\nParagraph 2: The contents of paragraph 2 are false and categorically denied.';

    const prayer = prayerText || 'It is therefore most respectfully prayed that this Hon\'ble Court may be pleased to dismiss the petition with costs.';

    return `${courtTitle}
(EXTRAORDINARY ORIGINAL WRIT JURISDICTION)

${caseNoStr}

IN THE MATTER OF:
${petStr}
                                                       ... PETITIONER(S)
                               VERSUS
${respStr}
                                                       ... RESPONDENT(S)

${docHeading}

I, ${depStr}, do hereby solemnly affirm and state on oath as under:

1. That I am the Deponent/Respondent herein, fully conversant with the facts of the case, and duly authorized to depose this Counter Affidavit on behalf of the Respondent.

PRELIMINARY OBJECTIONS:
${objectionsText}

PARA-WISE REPLY:
${parasText}

PRAYER:
${prayer}

VERIFICATION:
I, the Deponent above-named, do hereby verify that the contents of this Counter Affidavit are true and correct to the best of my knowledge and official records, and nothing material has been concealed therefrom.

Verified at PATNA on this _____ day of ____________, 2026.


                                                       ____________________
                                                           (DEPONENT)`;
  }, [draftContent, court, caseNumber, petitioner, respondent, deponent, preliminaryObjections, paraReplies, prayerText, designId]);

  const handleAddObjection = () => {
    if (!newObjection.trim()) return;
    setPreliminaryObjections(prev => [...prev, newObjection.trim()]);
    setNewObjection('');
  };

  const handleRemoveObjection = (index) => {
    setPreliminaryObjections(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPara = () => {
    const nextNum = paraReplies.length + 1;
    setParaReplies(prev => [...prev, { paraNum: nextNum, type: 'Denied', text: `Paragraph ${nextNum} is denied.` }]);
  };

  const handleGenerateCounter = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        fileId: selectedFile?.fileId || selectedFile?._id,
        court,
        designId,
        counterMaker: {
          caseNumber,
          petitioner,
          respondent,
          deponent,
          preliminaryObjections,
          paraReplies,
          prayerText
        }
      };

      const res = await axios.post(`${API_BASE_URL}/draft/counter-affidavit`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.content || res.data?.counterAffidavit) {
        const text = res.data.content || res.data.counterAffidavit;
        setDraftContent(text);
        toast({ title: 'Counter Affidavit Generated!', status: 'success', duration: 3000 });
        setActiveTabIndex(0);
      } else {
        const chatPrompt = `Generate a formal Counter Affidavit with design "${designId}". Court: "${court}", Case No: "${caseNumber}", Petitioner: "${petitioner}", Respondent: "${respondent}". Objections: ${preliminaryObjections.join('; ')}. Prayer: "${prayerText}".`;
        handleSendMessage(chatPrompt);
        toast({ title: 'Submitted to AI Chat for generation', status: 'info', duration: 2500 });
      }
    } catch (err) {
      console.warn('Backend generation failed, sending prompt to AI Chat:', err?.message);
      const chatPrompt = `Generate a formal Counter Affidavit. Court: "${court}", Case No: "${caseNumber}", Petitioner: "${petitioner}", Respondent: "${respondent}". Objections: ${preliminaryObjections.join('; ')}.`;
      handleSendMessage(chatPrompt);
      toast({ title: 'Drafting via AI Assistant...', status: 'info', duration: 2500 });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTxt = () => {
    const text = liveFormattedPreview;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Counter_Affidavit_${caseNumber || 'Draft'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box w="100%" h="100%" flex="1" bg={panelBg} borderLeft="1px solid" borderColor={panelBorder} display="flex" flexDirection="column" overflow="hidden">
      {/* Panel Header */}
      <Flex h="52px" align="center" justify="space-between" px={4} borderBottom="1px solid" borderColor={panelBorder} bg={headerBg} flexShrink={0}>
        <HStack spacing={2}>
          <Icon as={FiEdit} color="orange.500" boxSize={5} />
          <Text fontSize="sm" fontWeight="bold">Counter Affidavit Studio</Text>
          <Badge colorScheme="orange" fontSize="2xs">Department Grade</Badge>
        </HStack>
        <IconButton icon={<FaTimes />} size="xs" variant="ghost" aria-label="Close" onClick={() => setIsCounterMakerPanelOpen(false)} />
      </Flex>

      {/* Active Processing or Uploaded File Banner */}
      {isFileProcessing ? (
        <Box bg="orange.50" _dark={{ bg: 'orange.950' }} p={3.5} borderBottom="1px solid" borderColor="orange.200">
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Spinner size="xs" color="orange.500" />
                <Text fontSize="xs" fontWeight="bold" color="orange.700" _dark={{ color: 'orange.200' }}>
                  Processing Petition Document...
                </Text>
              </HStack>
              <Badge colorScheme="orange" fontSize="2xs">{uploadProgress ? `${uploadProgress}%` : 'Scanning'}</Badge>
            </HStack>
            <Progress value={uploadProgress || 65} size="xs" colorScheme="orange" isAnimated hasStripe borderRadius="full" />
            <Text fontSize="2xs" color="gray.500">
              Extracting Court Name, Case Number, Parties & Paragraphs for Counter Affidavit...
            </Text>
          </VStack>
        </Box>
      ) : selectedFile ? (
        <Box bg="green.50" _dark={{ bg: 'green.950' }} px={4} py={2.5} borderBottom="1px solid" borderColor="green.200">
          <HStack justify="space-between">
            <HStack spacing={2} flex={1} overflow="hidden">
              <Icon as={FiFile} color="green.500" boxSize={4} />
              <VStack align="start" spacing={0} flex={1} overflow="hidden">
                <Text fontSize="xs" fontWeight="bold" color="green.800" _dark={{ color: 'green.200' }} isTruncated>
                  {selectedFile.originalName || selectedFile.fileName || 'Uploaded Petition File'}
                </Text>
                <Text fontSize="2xs" color="green.600" _dark={{ color: 'green.400' }}>
                  Parsed for Counter Affidavit Auto-Fill
                </Text>
              </VStack>
            </HStack>
            <Badge colorScheme="green" fontSize="2xs" px={2} py={0.5} borderRadius="full">Active Doc</Badge>
          </HStack>
        </Box>
      ) : (
        <Box bg="gray.50" _dark={{ bg: 'gray.900' }} px={4} py={2.5} borderBottom="1px solid" borderColor={panelBorder}>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon as={FiUploadCloud} color="orange.400" boxSize={4} />
              <Text fontSize="2xs" color="gray.500">
                Upload a petition PDF/DOCX to auto-extract details & paragraphs
              </Text>
            </HStack>
            <Button size="2xs" colorScheme="orange" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              Upload File
            </Button>
          </HStack>
        </Box>
      )}

      {/* Tabs */}
      <Tabs index={activeTabIndex} onChange={setActiveTabIndex} variant="enclosed" colorScheme="orange" flex={1} minH={0} display="flex" flexDirection="column" overflow="hidden">
        <TabList px={4} pt={2} bg={headerBg} borderColor={panelBorder}>
          <Tab fontSize="xs" fontWeight="bold">👁️ Document Preview</Tab>
          <Tab fontSize="xs" fontWeight="bold">📝 Form & Para-wise Editor</Tab>
        </TabList>

        <TabPanels flex={1} minH={0} overflowY="auto" p={4}>
          {/* TAB 1: DOCUMENT PREVIEW */}
          <TabPanel p={0} h="full" minH={0} display="flex" flexDirection="column" overflowY="auto">
            <VStack spacing={4} align="stretch" flex={1} minH={0}>
              {/* Layout / Design Selector Bar */}
              <HStack justify="space-between" bg={sectionBg} p={3} borderRadius="xl" border="1px solid" borderColor={panelBorder}>
                <HStack spacing={2}>
                  <Icon as={FiEye} color="orange.500" boxSize={4} />
                  <Text fontSize="xs" fontWeight="bold" color="orange.500">Design Template:</Text>
                </HStack>
                <Select size="xs" maxW="240px" value={designId} onChange={e => setDesignId(e.target.value)}>
                  <option value="writ-petition-counter">Writ Petition Counter Affidavit</option>
                  <option value="india-formal-affidavit">Formal Indian Court Affidavit</option>
                  <option value="mjc-show-cause-counter">MJC / Show Cause Reply</option>
                </Select>
              </HStack>

              {/* Styled Court Legal Document Paper */}
              <Box 
                bg={paperBg} 
                p={6} 
                borderRadius="xl" 
                border="2px solid" 
                borderColor="orange.200" 
                _dark={{ borderColor: 'orange.900' }}
                flex={1} 
                minH={0}
                overflowY="auto"
                boxShadow="lg"
              >
                <HStack justify="space-between" mb={4} borderBottom="1px dashed" borderColor={panelBorder} pb={2}>
                  <Badge colorScheme="orange" fontSize="2xs">High Court Legal Draft</Badge>
                  <Text fontSize="2xs" color="gray.400" fontWeight="bold">Live Real-time Render</Text>
                </HStack>
                
                <Text 
                  fontSize="xs" 
                  whiteSpace="pre-wrap" 
                  fontFamily="'Courier New', Courier, monospace" 
                  lineHeight="1.8"
                  color={paperTextColor}
                >
                  {liveFormattedPreview}
                </Text>
              </Box>

              <HStack spacing={2}>
                <Button colorScheme="orange" size="sm" leftIcon={<FaDownload />} onClick={handleDownloadTxt} flex={1}>
                  Download Draft (.txt)
                </Button>
                <Button size="sm" variant="outline" colorScheme="orange" leftIcon={<FiZap />} onClick={() => handleSendMessage("Format and polish this Counter Affidavit in High Court legal style.")}>
                  Polish with AI
                </Button>
              </HStack>
            </VStack>
          </TabPanel>

          {/* TAB 2: FORM & PARA-WISE EDITOR */}
          <TabPanel p={0} minH={0} h="full" overflowY="auto">
            <VStack spacing={4} align="stretch">
              {/* Section 1: Court & Particulars */}
              <Box p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={panelBorder}>
                <Heading size="xs" mb={3} color="orange.500" textTransform="uppercase">
                  1. Court & Party Particulars
                </Heading>
                <VStack spacing={2} align="stretch">
                  <Input size="sm" placeholder="Court Name (e.g. IN THE HIGH COURT OF JUDICATURE AT PATNA)" value={court} onChange={e => setCourt(e.target.value)} bg={paperBg} />
                  <Input size="sm" placeholder="Case Number (e.g. W.P.(C) No. 12450 of 2023)" value={caseNumber} onChange={e => setCaseNumber(e.target.value)} bg={paperBg} />
                  <Input size="sm" placeholder="Petitioner Name(s)" value={petitioner} onChange={e => setPetitioner(e.target.value)} bg={paperBg} />
                  <Input size="sm" placeholder="Respondent / Deponent Name" value={respondent} onChange={e => setRespondent(e.target.value)} bg={paperBg} />
                </VStack>
              </Box>

              {/* Section 2: Preliminary Objections */}
              <Box p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={panelBorder}>
                <Heading size="xs" mb={3} color="orange.500" textTransform="uppercase">
                  2. Preliminary Objections
                </Heading>
                <VStack spacing={2} align="stretch" mb={3}>
                  {preliminaryObjections.map((obj, i) => (
                    <HStack key={i} bg={paperBg} p={2} borderRadius="md" border="1px solid" borderColor={panelBorder}>
                      <Text fontSize="xs" flex={1}>{i + 1}. {obj}</Text>
                      <IconButton icon={<FaTrash />} size="2xs" colorScheme="red" variant="ghost" onClick={() => handleRemoveObjection(i)} aria-label="Remove" />
                    </HStack>
                  ))}
                </VStack>
                <HStack>
                  <Input size="sm" placeholder="Add custom preliminary objection..." value={newObjection} onChange={e => setNewObjection(e.target.value)} bg={paperBg} />
                  <Button size="sm" colorScheme="orange" leftIcon={<FaPlus />} onClick={handleAddObjection}>Add</Button>
                </HStack>
              </Box>

              {/* Section 3: Para-wise Replies */}
              <Box p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={panelBorder}>
                <HStack justify="space-between" mb={3}>
                  <Heading size="xs" color="orange.500" textTransform="uppercase">
                    3. Para-wise Replies
                  </Heading>
                  <Button size="xs" colorScheme="orange" variant="outline" leftIcon={<FaPlus />} onClick={handleAddPara}>
                    Add Para
                  </Button>
                </HStack>
                <VStack spacing={3} align="stretch">
                  {paraReplies.map((p, i) => (
                    <Box key={i} p={3} bg={paperBg} borderRadius="md" border="1px solid" borderColor={panelBorder}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="xs" fontWeight="bold">Paragraph {p.paraNum}</Text>
                        <Select size="2xs" w="140px" value={p.type} onChange={e => {
                          const val = e.target.value;
                          setParaReplies(prev => prev.map((pr, idx) => idx === i ? { ...pr, type: val } : pr));
                        }}>
                          <option value="Denied">Denied</option>
                          <option value="Admitted">Admitted</option>
                          <option value="Matter of Record">Matter of Record</option>
                        </Select>
                      </HStack>
                      <Textarea size="xs" rows={2} value={p.text} onChange={e => {
                        const val = e.target.value;
                        setParaReplies(prev => prev.map((pr, idx) => idx === i ? { ...pr, text: val } : pr));
                      }} />
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Section 4: Prayer & Verification */}
              <Box p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={panelBorder}>
                <Heading size="xs" mb={3} color="orange.500" textTransform="uppercase">
                  4. Prayer Clause
                </Heading>
                <Textarea size="sm" rows={2} value={prayerText} onChange={e => setPrayerText(e.target.value)} bg={paperBg} />
              </Box>

              <Button colorScheme="orange" size="md" leftIcon={isGenerating ? <Spinner size="sm" /> : <FiCheckCircle />} onClick={handleGenerateCounter} isLoading={isGenerating} loadingText="Generating Counter Affidavit...">
                Generate Counter Affidavit
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CounterMakerPanel;
