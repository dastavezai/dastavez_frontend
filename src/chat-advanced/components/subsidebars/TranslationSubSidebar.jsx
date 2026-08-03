import React, { useState, useRef } from 'react';
import {
  VStack, Text, Box, Center, Icon, Spinner, Button, useColorModeValue, Select, useToast, Progress
} from '@chakra-ui/react';
import { FiGlobe, FiUploadCloud } from 'react-icons/fi';
import axios from 'axios';

const TranslationSubSidebar = () => {
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('Hindi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const cv_gray_250_rgba_212_175_55_0_25 = useColorModeValue('gray.250', 'rgba(212, 175, 55, 0.25)');
  const cv_rgba_212_175_55_0_015_rgba_212_175_55_0_005 = useColorModeValue('rgba(212, 175, 55, 0.015)', 'rgba(212, 175, 55, 0.005)');
  const cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05 = useColorModeValue('rgba(212, 175, 55, 0.08)', 'rgba(212, 175, 55, 0.05)');
  const cv_gray_800_gray_100 = useColorModeValue('gray.800', 'gray.100');
  const cv_gray_550_gray_400 = useColorModeValue('gray.550', 'gray.400');
  const cv_gray_50_rgba_212_175_55_0_04 = useColorModeValue('gray.50', 'rgba(212, 175, 55, 0.04)');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null); // Clear previous result
    }
  };

  const handleTranslate = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF or Image first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsTranslating(true);
    setResult(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('targetLanguage', targetLanguage);

    try {
      // Get the API URL depending on environment
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/translation/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          ...(csrfToken && { 'x-csrf-token': csrfToken })
        }
      });

      setResult(response.data);
      toast({
        title: "Translation successful",
        description: `API Usage: ${response.data.usageCount}/${response.data.maxUsage}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Translation failed",
        description: error.response?.data?.error || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
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
        onClick={() => fileInputRef.current?.click()}
        _hover={{ 
          borderColor: 'judicial.gold',
          bg: 'rgba(212, 175, 55, 0.04)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)'
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*,application/pdf"
          onChange={handleFileChange}
        />
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
          {file ? file.name : "Upload Document"}
        </Text>
        <Text fontSize="10px" color={cv_gray_550_gray_400}>
          Supports PDF and Images
        </Text>
      </Box>

      {/* Language Selection */}
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

      <Button
        size="sm"
        w="full"
        bg="judicial.gold"
        color="judicial.dark"
        fontWeight="bold"
        borderRadius="xl"
        leftIcon={<Icon as={FiGlobe} />}
        onClick={handleTranslate}
        isLoading={isTranslating}
        loadingText="Translating..."
        isDisabled={!file}
        _hover={{
          bg: 'judicial.lightGold',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
        }}
      >
        Translate Document
      </Button>

      {isTranslating && (
        <Box mt={2}>
          <Text fontSize="xs" textAlign="center" color="gray.500">Processing with Google Vision & LLM...</Text>
          <Progress size="xs" isIndeterminate colorScheme="yellow" mt={2} borderRadius="full" />
        </Box>
      )}

      {result && (
        <Box 
          mt={4} 
          p={3} 
          bg={cv_gray_50_rgba_212_175_55_0_04} 
          borderRadius="xl"
          border="1px solid"
          borderColor="judicial.gold"
        >
          <Text fontSize="11px" fontWeight="bold" color="judicial.gold" mb={2}>
            Translated Text ({targetLanguage}):
          </Text>
          <Box 
            maxH="250px" 
            overflowY="auto" 
            fontSize="xs" 
            color={cv_gray_800_gray_100}
            whiteSpace="pre-wrap"
            className="custom-scrollbar"
          >
            {result.translatedText}
          </Box>
        </Box>
      )}
    </VStack>
  );
};

export default TranslationSubSidebar;
