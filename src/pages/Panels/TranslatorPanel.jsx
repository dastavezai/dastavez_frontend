import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Flex, Text, Badge, Icon, Heading, Button, Progress,
  useColorModeValue, Spinner, IconButton, Textarea, Select,
  Tabs, TabList, TabPanels, Tab, TabPanel, useToast
} from '@chakra-ui/react';
import { FaTimes, FaDownload, FaGlobe, FaArrowRight, FaExchangeAlt } from 'react-icons/fa';
import { FiGlobe, FiUploadCloud, FiCheckCircle, FiZap, FiFile, FiCopy } from 'react-icons/fi';
import { useAdvancedChat } from '../AdvancedChatContext';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5173/api').replace(/\/+$/, '');

const INDIAN_LANGUAGES_LIST = [
  { key: "1", name: "Hindi", code: "hi" },
  { key: "2", name: "Bengali", code: "bn" },
  { key: "3", name: "Telugu", code: "te" },
  { key: "4", name: "Marathi", code: "mr" },
  { key: "5", name: "Tamil", code: "ta" },
  { key: "6", name: "Urdu", code: "ur" },
  { key: "7", name: "Gujarati", code: "gu" },
  { key: "8", name: "Kannada", code: "kn" },
  { key: "9", name: "Odia", code: "or" },
  { key: "10", name: "Punjabi", code: "pa" },
  { key: "11", name: "Malayalam", code: "ml" },
  { key: "12", name: "Assamese", code: "as" },
  { key: "13", name: "Maithili", code: "mai" },
  { key: "14", name: "Sanskrit", code: "sa" },
  { key: "15", name: "Nepali", code: "ne" },
  { key: "16", name: "Sindhi", code: "sd" },
  { key: "17", name: "Konkani", code: "gom" },
  { key: "18", name: "Dogri", code: "doi" },
  { key: "19", name: "Manipuri", code: "mni-Mtei" },
  { key: "20", name: "Mizo", code: "lus" },
  { key: "21", name: "Bodo", code: "brx" },
  { key: "22", name: "Kashmiri", code: "ks" },
  { key: "23", name: "Kaithi (transliterated)", code: "kaithi" },
  { key: "24", name: "Devanagari script", code: "devanagari" }
];

const SCRIPT_TO_HINDI_LIST = [
  { name: "Kaithi (transliterated)", code: "kaithi" },
  { name: "Devanagari script", code: "devanagari" },
  { name: "Farsi / Persian", code: "fa" }
];

const TranslatorPanel = () => {
  const {
    setIsTranslatorPanelOpen,
    handleSendMessage,
    selectedFile,
    token
  } = useAdvancedChat();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [direction, setDirection] = useState('to_indian');
  const [targetLangCode, setTargetLangCode] = useState('hi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const toast = useToast();
  const panelBg = useColorModeValue('white', 'gray.850');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');
  const headerBg = useColorModeValue('purple.50', 'purple.900');
  const paperBg = useColorModeValue('#ffffff', '#141824');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  useEffect(() => {
    if (selectedFile) {
      const text = selectedFile.text || selectedFile.extractedText || selectedFile.content || '';
      if (text) {
        setSourceText(text);
      }
    }
  }, [selectedFile]);

  const handleTranslate = async () => {
    if (!sourceText.trim() && !selectedFile) {
      toast({ title: 'Please enter text or upload a document', status: 'warning', duration: 2500 });
      return;
    }

    setIsTranslating(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/chat/translate`, {
        text: sourceText,
        langCode: targetLangCode,
        direction,
        fileId: selectedFile?.fileId || selectedFile?._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.translatedText) {
        setTranslatedText(res.data.translatedText);
        toast({ title: 'Translation Complete!', status: 'success', duration: 2500 });
        setActiveTabIndex(0);
      } else {
        toast({ title: 'Translation returned empty result', status: 'error', duration: 2500 });
      }
    } catch (err) {
      console.error('Translation error:', err);
      toast({ title: 'Translation failed', description: err?.message, status: 'error', duration: 3000 });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Translated_Document_${targetLangCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    toast({ title: 'Copied translated text to clipboard!', status: 'info', duration: 2000 });
  };

  return (
    <Box w="100%" h="100%" flex="1" minH={0} bg={panelBg} borderLeft="1px solid" borderColor={panelBorder} display="flex" flexDirection="column" overflow="hidden">
      {/* Header */}
      <Flex h="52px" align="center" justify="space-between" px={4} borderBottom="1px solid" borderColor={panelBorder} bg={headerBg} flexShrink={0}>
        <HStack spacing={2}>
          <Icon as={FiGlobe} color="purple.500" boxSize={5} />
          <Text fontSize="sm" fontWeight="bold">Indian Language & Script Translator</Text>
          <Badge colorScheme="purple" fontSize="2xs">AI / NLP Powered</Badge>
        </HStack>
        <IconButton icon={<FaTimes />} size="xs" variant="ghost" aria-label="Close" onClick={() => setIsTranslatorPanelOpen(false)} />
      </Flex>

      {/* Tabs */}
      <Tabs index={activeTabIndex} onChange={setActiveTabIndex} variant="enclosed" colorScheme="purple" flex={1} minH={0} display="flex" flexDirection="column" overflow="hidden">
        <TabList px={4} pt={2} bg={headerBg} borderColor={panelBorder}>
          <Tab fontSize="xs" fontWeight="bold">👁️ Translated Preview</Tab>
          <Tab fontSize="xs" fontWeight="bold">🌐 Translation Controls</Tab>
        </TabList>

        <TabPanels flex={1} minH={0} overflowY="auto" p={4}>
          {/* TAB 1: PREVIEW */}
          <TabPanel p={0} h="full" minH={0} display="flex" flexDirection="column" overflowY="auto">
            <VStack spacing={4} align="stretch" flex={1} minH={0}>
              <HStack justify="space-between" bg={sectionBg} p={3} borderRadius="xl" border="1px solid" borderColor={panelBorder}>
                <HStack spacing={2}>
                  <Badge colorScheme="purple" fontSize="2xs">Direction: {direction}</Badge>
                  <Badge colorScheme="blue" fontSize="2xs">Target: {targetLangCode}</Badge>
                </HStack>
                <HStack spacing={2}>
                  <Button size="2xs" leftIcon={<FiCopy />} onClick={handleCopyToClipboard} variant="outline" colorScheme="purple">
                    Copy Text
                  </Button>
                  <Button size="2xs" leftIcon={<FaDownload />} onClick={handleDownloadTxt} colorScheme="purple">
                    Download (.txt)
                  </Button>
                </HStack>
              </HStack>

              {/* Styled Paper Preview */}
              <Box bg={paperBg} p={6} borderRadius="xl" border="2px solid" borderColor="purple.200" _dark={{ borderColor: 'purple.900' }} flex={1} minH={0} overflowY="auto" boxShadow="lg">
                <HStack justify="space-between" mb={3} borderBottom="1px dashed" borderColor={panelBorder} pb={2}>
                  <Text fontSize="xs" fontWeight="bold" color="purple.500">Live Translated Output</Text>
                  <Text fontSize="2xs" color="gray.400">Bidirectional NLP</Text>
                </HStack>

                <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="1.8" color={textColor}>
                  {translatedText || "Select direction & click 'Translate Document' in Tab 2 to preview translated text here."}
                </Text>
              </Box>

              <HStack spacing={2}>
                <Button colorScheme="purple" size="sm" leftIcon={<FiZap />} onClick={() => handleSendMessage(`Use this translation in my draft:\n${translatedText}`)} isDisabled={!translatedText} flex={1}>
                  Apply Translation to Active Draft
                </Button>
              </HStack>
            </VStack>
          </TabPanel>

          {/* TAB 2: CONTROLS */}
          <TabPanel p={0} minH={0} h="full" overflowY="auto">
            <VStack spacing={4} align="stretch">
              {/* Direction Selector */}
              <Box p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={panelBorder}>
                <Heading size="xs" mb={3} color="purple.500" textTransform="uppercase">
                  1. Translation Direction
                </Heading>
                <Select size="sm" value={direction} onChange={e => setDirection(e.target.value)} bg={paperBg}>
                  <option value="to_indian">English ➔ Indian Language / Script</option>
                  <option value="to_english">Indian Language / Script ➔ English</option>
                  <option value="to_hindi">Kaithi / Devanagari / Farsi ➔ Hindi Script Conversion</option>
                </Select>
              </Box>

              {/* Language / Script Selector */}
              <Box p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={panelBorder}>
                <Heading size="xs" mb={3} color="purple.500" textTransform="uppercase">
                  2. Select Language / Script
                </Heading>
                {direction === 'to_hindi' ? (
                  <Select size="sm" value={targetLangCode} onChange={e => setTargetLangCode(e.target.value)} bg={paperBg}>
                    {SCRIPT_TO_HINDI_LIST.map(s => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </Select>
                ) : (
                  <Select size="sm" value={targetLangCode} onChange={e => setTargetLangCode(e.target.value)} bg={paperBg}>
                    {INDIAN_LANGUAGES_LIST.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.key}. {lang.name} ({lang.code})</option>
                    ))}
                  </Select>
                )}
                {targetLangCode === 'kaithi' && (
                  <Text fontSize="2xs" color="purple.400" mt={2}>
                    💡 Kaithi transliteration converts character-by-character using the Kaithi Unicode block (U+11080 - U+110CF).
                  </Text>
                )}
              </Box>

              {/* Source Text Area */}
              <Box p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={panelBorder}>
                <HStack justify="space-between" mb={2}>
                  <Heading size="xs" color="purple.500" textTransform="uppercase">
                    3. Input Document Text
                  </Heading>
                  {selectedFile && (
                    <Badge colorScheme="green" fontSize="2xs">
                      Doc Attached: {selectedFile.originalName || selectedFile.fileName}
                    </Badge>
                  )}
                </HStack>
                <Textarea rows={6} placeholder="Paste document text or upload file to translate..." value={sourceText} onChange={e => setSourceText(e.target.value)} bg={paperBg} size="sm" />
              </Box>

              <Button colorScheme="purple" size="md" leftIcon={isTranslating ? <Spinner size="sm" /> : <FiGlobe />} onClick={handleTranslate} isLoading={isTranslating} loadingText="Translating Document...">
                Translate Document
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default TranslatorPanel;
