import React, { useState, useEffect } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Button, Switch, Image, IconButton, Tooltip, Select, useColorModeValue, FormControl, FormLabel, Center, Icon,
  Tabs, TabList, TabPanels, Tab, TabPanel, Textarea, Spinner, useToast,
  Input, RadioGroup, Radio, Table, Thead, Tbody, Tr, Th, Td, Link, Badge
} from '@chakra-ui/react';
import { FiX, FiDownload, FiMap, FiGlobe, FiExternalLink } from 'react-icons/fi';
import axios from 'axios';
import { useAdvancedChat } from '../AdvancedChatContext';

const TranslationViewerPanel = () => {
  const {
    translationViewState, setTranslationViewState,
    setActiveTab, toggleRightPanel,
  } = useAdvancedChat();

  const [showTranslated, setShowTranslated] = useState(true);
  const [isTranslatingText, setIsTranslatingText] = useState(false);
  const [isFetchingBhumi, setIsFetchingBhumi] = useState(false);
  const [bhumiResults, setBhumiResults] = useState(null);
  
  const [biharBhumiForm, setBiharBhumiForm] = useState({
    jila: '',
    anchal: '',
    halka: '',
    mauja: '',
    searchType: 'all',
    searchValue: ''
  });

  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.900');
  
  if (!translationViewState) {
    return (
      <Center h="full" bg={bg}>
        <Text color="gray.500">No translation selected.</Text>
      </Center>
    );
  }

  const { originalFileUrl, translatedImageBase64, targetLanguage } = translationViewState;

  const handleClose = () => {
    setActiveTab('dashboard');
    toggleRightPanel(false);
  };

  useEffect(() => {
    if (translationViewState?.landRecordData) {
      const data = translationViewState.landRecordData;
      setBiharBhumiForm(prev => ({
        ...prev,
        jila: data.Jilla || prev.jila,
        anchal: data.Anchal || prev.anchal,
        halka: data.Halka || prev.halka,
        mauja: data.Mauja || prev.mauja,
      }));
    }
  }, [translationViewState?.landRecordData]);

  const handleFetchBiharBhumi = async () => {
    if (!biharBhumiForm.jila || !biharBhumiForm.anchal || !biharBhumiForm.halka || !biharBhumiForm.mauja) {
      toast({ title: 'Missing Fields', description: 'Please fill out Jilla, Anchal, Halka, and Mauja.', status: 'warning', duration: 3000 });
      return;
    }
    
    setIsFetchingBhumi(true);
    setBhumiResults(null);
    try {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bihar-bhumi/search`, biharBhumiForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setBhumiResults(response.data.data);
        toast({ title: 'Records Fetched', status: 'success', duration: 3000 });
      } else {
        toast({ title: 'Search Failed', description: response.data.error, status: 'error', duration: 5000 });
      }
    } catch (error) {
      toast({ title: 'Server Error', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsFetchingBhumi(false);
    }
  };

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    if (!translationViewState.originalText) {
      toast({ title: 'Original text missing', status: 'error', duration: 3000 });
      return;
    }

    setIsTranslatingText(true);
    try {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/translation/text`, {
        text: translationViewState.originalText,
        targetLanguage: newLang
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTranslationViewState({
        ...translationViewState,
        targetLanguage: newLang,
        translatedText: response.data.translatedText,
        translatedDict: null // Clear dict so it prefers translatedText in UI
      });
      toast({ title: `Translated to ${newLang}`, status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'Translation failed', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsTranslatingText(false);
    }
  };

  return (
    <Flex direction="column" h="full" bg={bg}>
      {/* Header */}
      <Flex 
        px={4} 
        py={3} 
        borderBottomWidth={1} 
        borderColor={borderColor} 
        bg={headerBg}
        align="center"
        justify="space-between"
      >
        <HStack spacing={3}>
          <Icon as={FiGlobe} color="judicial.gold" boxSize={5} />
          <Text fontWeight="bold" fontSize="md">Document Translation</Text>
        </HStack>
        <IconButton
          icon={<FiX />}
          size="sm"
          variant="ghost"
          onClick={handleClose}
          aria-label="Close panel"
        />
      </Flex>

      <Tabs isFitted colorScheme="yellow" display="flex" flexDirection="column" flex="1" overflow="hidden">
        <TabList mb="0" borderBottomColor={borderColor}>
          <Tab fontWeight="semibold" fontSize="sm">Overview</Tab>
          <Tab fontWeight="semibold" fontSize="sm">Visual Translation</Tab>
          <Tab fontWeight="semibold" fontSize="sm">Actions</Tab>
        </TabList>

        <TabPanels flex="1" overflow="hidden">
          {/* Overview Tab */}
          <TabPanel h="full" p={4} display="flex" flexDirection="column" overflow="auto">
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontWeight="semibold" fontSize="md">Translated Text</Text>
              <Select size="sm" w="150px" value={targetLanguage} onChange={handleLanguageChange} borderRadius="md" isDisabled={isTranslatingText}>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Arabic">Arabic</option>
                <option value="Bengali">Bengali</option>
              </Select>
            </Flex>
            <Box flex="1" p={4} bg={useColorModeValue('gray.50', 'gray.900')} borderRadius="md" borderWidth={1} borderColor={borderColor} overflowY="auto">
              {isTranslatingText ? (
                <Center h="full"><Spinner color="judicial.gold" /></Center>
              ) : translationViewState.translatedDict ? (
                <Text whiteSpace="pre-wrap" fontSize="sm" lineHeight="tall">
                  {Object.values(translationViewState.translatedDict).join('\n\n')}
                </Text>
              ) : translationViewState.translatedText ? (
                <Text whiteSpace="pre-wrap" fontSize="sm" lineHeight="tall">
                  {translationViewState.translatedText}
                </Text>
              ) : (
                <Text color="gray.500" fontStyle="italic">Raw text not available.</Text>
              )}
            </Box>
          </TabPanel>

          {/* Visual Translation Tab */}
          <TabPanel h="full" p={0} display="flex" flexDirection="column">
            {/* Toolbar */}
            <Flex 
              px={4} 
              py={2} 
              borderBottomWidth={1} 
              borderColor={borderColor} 
              align="center" 
              justify="space-between"
              bg={useColorModeValue('white', 'gray.800')}
            >
              <FormControl display="flex" alignItems="center" w="auto">
                <FormLabel htmlFor="toggle-translated" mb="0" fontSize="sm" fontWeight="semibold" color="gray.600" _dark={{ color: "gray.300" }}>
                  Original
                </FormLabel>
                <Switch 
                  id="toggle-translated" 
                  colorScheme="yellow" 
                  isChecked={showTranslated}
                  onChange={(e) => setShowTranslated(e.target.checked)}
                  mx={2}
                />
                <FormLabel htmlFor="toggle-translated" mb="0" fontSize="sm" fontWeight="semibold" color="judicial.gold">
                  Translated
                </FormLabel>
              </FormControl>

              {showTranslated && translatedImageBase64 && (
                <Tooltip label="Download Translation">
                  <IconButton 
                    size="sm" 
                    icon={<FiDownload />} 
                    as="a" 
                    href={translatedImageBase64}
                    download={`translated_document.jpg`}
                    aria-label="Download Translation"
                    variant="ghost"
                  />
                </Tooltip>
              )}
            </Flex>

            {/* Image Viewer */}
            <Box flex="1" overflow="auto" p={4} bg={useColorModeValue('gray.100', 'gray.900')}>
              <Center minH="100%">
                {showTranslated && translatedImageBase64 ? (
                  <Image 
                    src={translatedImageBase64} 
                    alt="Translated Document" 
                    maxW="100%" 
                    boxShadow="lg"
                    borderRadius="md"
                  />
                ) : originalFileUrl ? (
                  <Box position="relative" display="inline-block" maxW="100%" boxShadow="lg" borderRadius="md" overflow="hidden">
                    <Image 
                      src={originalFileUrl} 
                      alt="Original Document" 
                      w="full"
                      h="auto"
                    />
                    {translationViewState.originalBlocks && translationViewState.imageDimensions && translationViewState.originalBlocks.map((block, index) => {
                      const { width, height } = translationViewState.imageDimensions;
                      const leftPercent = (block.x / width) * 100;
                      const topPercent = (block.y / height) * 100;
                      const widthPercent = (block.width / width) * 100;
                      const heightPercent = (block.height / height) * 100;
                      const translatedText = translationViewState.translatedDict ? translationViewState.translatedDict[index] : null;

                      if (!translatedText) return null;

                      return (
                        <Box
                          key={index}
                          position="absolute"
                          left={`${leftPercent}%`}
                          top={`${topPercent}%`}
                          width={`${widthPercent}%`}
                          height={`${heightPercent}%`}
                          opacity={0}
                          bg="rgba(255, 255, 255, 0.95)"
                          backdropFilter="blur(6px)"
                          color="black"
                          p={2}
                          borderRadius="md"
                          border="1px solid"
                          borderColor="judicial.gold"
                          transition="all 0.2s ease"
                          cursor="pointer"
                          _hover={{ 
                            opacity: 1, 
                            zIndex: 20,
                            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                            minW: "150px",
                            h: "auto",
                            w: "auto"
                          }}
                        >
                          <Text fontSize="xs" fontWeight="bold" whiteSpace="pre-wrap" lineHeight="1.2">
                            {translatedText}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Text color="gray.500">No image available.</Text>
                )}
              </Center>
            </Box>
          </TabPanel>

          {/* Actions Tab */}
          <TabPanel h="full" p={4} overflowY="auto">
            <VStack spacing={6} align="stretch">
              <Box p={4} borderWidth={1} borderColor={borderColor} borderRadius="md" bg={useColorModeValue('white', 'gray.800')}>
                <HStack mb={4}>
                  <Icon as={FiMap} color="blue.500" />
                  <Text fontWeight="bold">Bihar Bhumi Search</Text>
                </HStack>
                
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <FormControl size="sm">
                      <FormLabel fontSize="xs">Jilla (District)</FormLabel>
                      <Input size="sm" value={biharBhumiForm.jila} onChange={e => setBiharBhumiForm({...biharBhumiForm, jila: e.target.value})} placeholder="e.g. Patna" />
                    </FormControl>
                    <FormControl size="sm">
                      <FormLabel fontSize="xs">Anchal (Circle)</FormLabel>
                      <Input size="sm" value={biharBhumiForm.anchal} onChange={e => setBiharBhumiForm({...biharBhumiForm, anchal: e.target.value})} placeholder="e.g. Patna Sadar" />
                    </FormControl>
                  </HStack>
                  <HStack>
                    <FormControl size="sm">
                      <FormLabel fontSize="xs">Halka</FormLabel>
                      <Input size="sm" value={biharBhumiForm.halka} onChange={e => setBiharBhumiForm({...biharBhumiForm, halka: e.target.value})} placeholder="e.g. Sandalpur" />
                    </FormControl>
                    <FormControl size="sm">
                      <FormLabel fontSize="xs">Mauja</FormLabel>
                      <Input size="sm" value={biharBhumiForm.mauja} onChange={e => setBiharBhumiForm({...biharBhumiForm, mauja: e.target.value})} placeholder="e.g. Sandalpur" />
                    </FormControl>
                  </HStack>

                  <FormControl size="sm" mt={2}>
                    <FormLabel fontSize="xs">Search By</FormLabel>
                    <RadioGroup value={biharBhumiForm.searchType} onChange={val => setBiharBhumiForm({...biharBhumiForm, searchType: val, searchValue: ''})}>
                      <HStack spacing={4} flexWrap="wrap">
                        <Radio size="sm" value="all">All</Radio>
                        <Radio size="sm" value="jamabandi">Jamabandi</Radio>
                        <Radio size="sm" value="khata">Khata</Radio>
                        <Radio size="sm" value="plot">Plot</Radio>
                        <Radio size="sm" value="rayat">Rayat</Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>

                  {biharBhumiForm.searchType !== 'all' && (
                    <FormControl size="sm">
                      <FormLabel fontSize="xs">Search Value</FormLabel>
                      <Input size="sm" value={biharBhumiForm.searchValue} onChange={e => setBiharBhumiForm({...biharBhumiForm, searchValue: e.target.value})} placeholder={`Enter ${biharBhumiForm.searchType} number/name`} />
                    </FormControl>
                  )}

                  <Button 
                    w="full" 
                    colorScheme="blue" 
                    size="sm" 
                    mt={2}
                    isLoading={isFetchingBhumi}
                    loadingText="Scraping Portal..."
                    onClick={handleFetchBiharBhumi}
                  >
                    Fetch Info
                  </Button>
                </VStack>
              </Box>

              {bhumiResults && (
                <Box p={4} borderWidth={1} borderColor={borderColor} borderRadius="md" bg={useColorModeValue('white', 'gray.800')} overflowX="auto">
                  <Text fontWeight="bold" mb={3}>Search Results <Badge colorScheme="green">{bhumiResults.length} records</Badge></Text>
                  {bhumiResults.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">No records found for the given criteria.</Text>
                  ) : (
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          {bhumiResults[0].map((cell, idx) => (
                            <Th key={idx} maxW="150px" isTruncated>{cell.text}</Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {bhumiResults.slice(1).map((row, rIdx) => (
                          <Tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <Td key={cIdx} maxW="150px" isTruncated title={cell.text}>
                                {cell.actionUrl ? (
                                  <Button 
                                    as="a" 
                                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${cell.actionUrl}`} 
                                    target="_blank"
                                    size="xs" 
                                    colorScheme="yellow"
                                    rightIcon={<FiExternalLink />}
                                  >
                                    View
                                  </Button>
                                ) : (
                                  cell.text
                                )}
                              </Td>
                            ))}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </Box>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default TranslationViewerPanel;
