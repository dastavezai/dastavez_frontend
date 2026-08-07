import React, { useState, useEffect, useRef } from 'react';
import {
  VStack, Text, Box, Center, Icon, Spinner, Button, useColorModeValue, Select, useToast, Progress, Switch, FormControl, FormLabel, Image, HStack
} from '@chakra-ui/react';
import { FiGlobe, FiUploadCloud } from 'react-icons/fi';
import axios from 'axios';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const TranslationSubSidebar = () => {
  const { 
    selectedFile,
    translationViewState, setTranslationViewState, 
    translationSessionId, setTranslationSessionId,
    setActiveTab, toggleRightPanel, handleSendMessage 
  } = useAdvancedChat();

  const [targetLanguage, setTargetLanguage] = useState('Hindi');
  const [isInPlace, setIsInPlace] = useState(false);
  const [translationStatus, setTranslationStatus] = useState('idle');
  const toast = useToast();
  const pollRef = useRef(null);

  const cv_gray_250_rgba_212_175_55_0_25 = useColorModeValue('gray.250', 'rgba(212, 175, 55, 0.25)');
  const cv_rgba_212_175_55_0_015_rgba_212_175_55_0_005 = useColorModeValue('rgba(212, 175, 55, 0.015)', 'rgba(212, 175, 55, 0.005)');
  const cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05 = useColorModeValue('rgba(212, 175, 55, 0.08)', 'rgba(212, 175, 55, 0.05)');
  const cv_gray_800_gray_100 = useColorModeValue('gray.800', 'gray.100');
  const cv_gray_550_gray_400 = useColorModeValue('gray.550', 'gray.400');
  const cv_gray_50_rgba_212_175_55_0_04 = useColorModeValue('gray.50', 'rgba(212, 175, 55, 0.04)');

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const pollSession = (sessionId) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('jwt') || localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/translation/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = res.data;
        if (['completed', 'failed'].includes(data.status)) {
          stopPolling();
          setTranslationStatus(data.status);
          
          if (data.status === 'completed') {
            setTranslationViewState({
              originalFileUrl: selectedFile?.fileUrl || null,
              translatedImageBase64: data.translatedImageBase64 || null,
              translatedDict: data.translatedDict || null,
              translatedText: data.translatedText || null,
              originalText: data.originalText || null,
              originalBlocks: data.originalBlocks || null,
              imageDimensions: data.imageDimensions || null,
              targetLanguage: data.targetLanguage,
              landRecordData: data.landRecordData || null
            });

            if (data.isInPlace && data.translatedImageBase64) {
              setActiveTab('translation-viewer');
            }

            if (handleSendMessage && (data.translatedDict || data.translatedText)) {
              const translatedContent = data.translatedDict 
                ? Object.values(data.translatedDict).join('\n')
                : data.translatedText;
                
              let extraContext = '';
              if (data.landRecordData) {
                 extraContext = `\n\nLand Record Extracted Data:\n${JSON.stringify(data.landRecordData, null, 2)}\nMake sure to explicitly mention the Jilla, Anchal, Halka, Mauja, and Jamabandi/Khata identifiers if they were found.`;
              }

              setTimeout(() => {
                handleSendMessage(`Generate a structured overview for this document. Please extract and format clearly:
- Document Type
- Parties Involved
- Property / Subject Matter Description
- Stamp Value (if any)
- Important Dates and Witnesses
- Brief Summary in English${extraContext}

Here is the translated text of the document:

${translatedContent}

Provide only the requested details in a clean, professional format. Do not include any conversational filler.`, { hidden: true, intentOverride: 'CONVERSATIONAL' });
              }, 1000);
            }

            toast({
              title: "Translation successful",
              description: `API Usage: ${data.usageCount}/${data.maxUsage}`,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Translation failed",
              description: data.errorDetails || "Unknown error",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } catch (err) {
        console.error('Translation poll error:', err);
      }
    }, 3000);
  };

  useEffect(() => {
    if (translationSessionId && translationStatus !== 'completed' && translationStatus !== 'failed') {
      setTranslationStatus('processing');
      pollSession(translationSessionId);
    }
    return stopPolling;
  }, [translationSessionId]);

  const handleTranslate = async () => {
    if (!selectedFile?._id) {
      toast({
        title: "No file selected",
        description: "Please upload a file using the chat input first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setTranslationStatus('processing');
    setTranslationViewState(null);

    try {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/translation/start`, 
        { fileId: selectedFile._id, targetLanguage, isInPlace }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...(csrfToken && { 'x-csrf-token': csrfToken })
          }
        }
      );

      setTranslationSessionId(response.data.sessionId);
      localStorage.setItem('translationSessionId', response.data.sessionId);
      pollSession(response.data.sessionId);

    } catch (error) {
      toast({
        title: "Failed to start translation",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setTranslationStatus('failed');
    }
  };

  return (
    <VStack spacing={4} align="stretch" pb={6}>
      <Text fontSize="xs" color="gray.550" _dark={{ color: 'gray.400' }} px={1} lineHeight="1.5">
        Document Translation: Upload an image or PDF. We extract text using Google Cloud Vision and translate it.
      </Text>

      <Box
        role="group"
        position="relative"
        border="2px dashed"
        borderColor={cv_gray_250_rgba_212_175_55_0_25}
        borderRadius="xl"
        p={6}
        textAlign="center"
        cursor="pointer"
        bg={cv_rgba_212_175_55_0_015_rgba_212_175_55_0_005}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        onClick={() => document.getElementById('file-upload')?.click()}
        _hover={{ 
          borderColor: 'judicial.gold',
          bg: 'rgba(212, 175, 55, 0.04)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)'
        }}
      >
        <Center 
          mx="auto"
          w={12} 
          h={12} 
          borderRadius="full" 
          bg={cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05}
          border="1px solid"
          borderColor="rgba(212, 175, 55, 0.2)"
          mb={3}
          transition="transform 0.4s ease"
          _groupHover={{ transform: 'scale(1.05)' }}
        >
          <Icon as={FiUploadCloud} w={5} h={5} color="judicial.gold" />
        </Center>
        <Text fontSize="xs" fontWeight="bold" color={cv_gray_800_gray_100} mb={1}>
          {selectedFile ? selectedFile.originalName || selectedFile.fileName || "File Selected" : "Upload Document"}
        </Text>
        <Text fontSize="10px" color={cv_gray_550_gray_400}>
          Supports PDF and Images
        </Text>
      </Box>

      {/* Options */}
      <VStack spacing={3} align="stretch" bg={cv_gray_50_rgba_212_175_55_0_04} p={3} borderRadius="xl" border="1px solid" borderColor={cv_gray_250_rgba_212_175_55_0_25}>
        <Box>
          <Text fontSize="10px" fontWeight="bold" color={cv_gray_550_gray_400} mb={1} textTransform="uppercase">
            Target Language
          </Text>
          <Select 
            size="sm" 
            value={targetLanguage} 
            onChange={(e) => setTargetLanguage(e.target.value)}
            borderRadius="md"
            borderColor={cv_gray_250_rgba_212_175_55_0_25}
            _hover={{ borderColor: 'judicial.gold' }}
            _focus={{ borderColor: 'judicial.gold', boxShadow: 'none' }}
          >
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Mandarin">Mandarin</option>
            <option value="Arabic">Arabic</option>
            <option value="Bengali">Bengali</option>
          </Select>
        </Box>
        
        <FormControl display="flex" alignItems="center" justifyContent="space-between">
          <FormLabel htmlFor="in-place-translation" mb="0" fontSize="xs" color={cv_gray_800_gray_100} fontWeight="bold">
            In-Place Visual Translation
          </FormLabel>
          <Switch 
            id="in-place-translation" 
            colorScheme="yellow" 
            isChecked={isInPlace}
            onChange={(e) => {
              if (e.target.checked && selectedFile && selectedFile.fileType === 'application/pdf') {
                toast({
                  title: "Not Supported",
                  description: "In-Place translation is currently supported for Images only.",
                  status: "warning",
                  duration: 3000,
                  isClosable: true,
                });
                return;
              }
              setIsInPlace(e.target.checked);
            }}
          />
        </FormControl>
        {isInPlace && (
          <Text fontSize="10px" color="judicial.gold">
            Creates a visual overlay with translated text preserving the original background.
          </Text>
        )}
      </VStack>

      <Button
        size="sm"
        w="full"
        bg="judicial.gold"
        color="judicial.dark"
        fontWeight="bold"
        borderRadius="xl"
        leftIcon={<Icon as={FiGlobe} />}
        onClick={handleTranslate}
        isLoading={translationStatus === 'processing'}
        loadingText="Translating..."
        isDisabled={!selectedFile}
        _hover={{
          bg: 'judicial.lightGold',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
        }}
      >
        Translate Document
      </Button>

      {translationStatus === 'processing' && (
        <Box mt={2}>
          <HStack spacing={2} justify="center">
            <Spinner size="xs" color="judicial.gold" />
            <Text fontSize="xs" textAlign="center" color="gray.500">Processing with Google Vision & LLM...</Text>
          </HStack>
          <Progress size="xs" isIndeterminate colorScheme="yellow" mt={2} borderRadius="full" />
        </Box>
      )}

      {translationViewState && (
        <Box 
          mt={4} 
          p={translationViewState.translatedImageBase64 ? 0 : 3} 
          bg={cv_gray_50_rgba_212_175_55_0_04} 
          borderRadius="xl"
          border="1px solid"
          borderColor="judicial.gold"
          overflow="hidden"
        >
          {translationViewState.translatedImageBase64 ? (
            <VStack spacing={2} align="stretch" p={2}>
              <Text fontSize="11px" fontWeight="bold" color="judicial.gold" px={1}>
                In-Place Translation ({translationViewState.targetLanguage}):
              </Text>
              <Text fontSize="xs" color="gray.500" px={1}>
                Preview opened in the right panel.
              </Text>
            </VStack>
          ) : (
            <VStack spacing={2} align="stretch">
              <Text fontSize="11px" fontWeight="bold" color="judicial.gold">
                Text Translation ({translationViewState.targetLanguage}):
              </Text>
              <Box maxH="150px" overflowY="auto">
                <Text fontSize="xs" color={cv_gray_800_gray_100} whiteSpace="pre-wrap">
                  {translationViewState.translatedText || Object.values(translationViewState.translatedDict || {}).join('\n')}
                </Text>
              </Box>
            </VStack>
          )}
        </Box>
      )}
    </VStack>
  );
};

export default TranslationSubSidebar;
