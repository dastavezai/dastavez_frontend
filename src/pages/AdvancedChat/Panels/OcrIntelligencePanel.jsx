import React, { useCallback, useRef, useState } from 'react';
import { Box, VStack, HStack, Text, Button, Icon, Progress, Spinner, useColorModeValue, Center, Heading, Textarea, Divider } from '@chakra-ui/react';
import { FiUploadCloud, FiCheckCircle, FiXCircle, FiCopy } from 'react-icons/fi';
import { useAdvancedChat } from '../AdvancedChatContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ocrAPI } from '../../../lib/api';

const OcrIntelligencePanel = () => {
  const {
    ocrFiles, setOcrFiles,
    ocrStatus, setOcrStatus,
    ocrResult, setOcrResult,
    setOcrSessionId
  } = useAdvancedChat();

  const fileInputRef = useRef(null);
  const [mockText, setMockText] = useState('');

  const bgBox = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.800');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
    }
  };

  const handleFilesSelected = async (files) => {
    const file = files[0];
    if (!file) return;

    setOcrFiles([file]);
    setOcrStatus('uploading');
    setOcrResult(null);

    try {
      const result = await ocrAPI.digitizeDocument(file);
      if (result && result.text) {
        setOcrResult(result.text);
        setOcrStatus('completed');
        if (result.sessionId) setOcrSessionId(result.sessionId);
      } else {
        throw new Error('Invalid response from OCR API');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrStatus('error');
    }
  };

  const handleCopy = () => {
    if (ocrResult) {
      navigator.clipboard.writeText(ocrResult);
    }
  };

  const handleMockSubmit = () => {
    if (mockText.trim()) {
      setOcrFiles([{ name: 'mock_document.txt' }]);
      setOcrResult(mockText);
      setOcrStatus('completed');
    }
  };

  const resetOcr = () => {
    setOcrFiles([]);
    setOcrStatus('idle');
    setOcrResult(null);
    setOcrSessionId(null);
  };

  return (
    <Box h="full" w="full" bg={bgBox} display="flex" flexDirection="column" overflow="hidden">
      <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
        <Heading size="md" mb={2}>OCR Intelligence</Heading>
        <Text fontSize="sm" color="gray.500">
          Powered by Sarvam AI. Extract text, layout, and tables from PDFs or images natively in Indian languages & English.
        </Text>
      </Box>

      <Box flex="1" overflowY="auto" p={6} display="flex" flexDirection="column">
        {ocrStatus === 'idle' && (
          <Center h="full" flex="1" w="full" flexDirection="column">
            <VStack
              spacing={4}
              p={10}
              w="full"
              maxW="lg"
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="xl"
              bg={hoverBg}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
              _hover={{ borderColor: 'blue.400' }}
              transition="all 0.2s"
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <Icon as={FiUploadCloud} boxSize={12} color="blue.500" />
              <Heading size="sm">Drag & Drop your document here</Heading>
              <Text fontSize="xs" color="gray.500">Supports PDF, PNG, JPG (Max 200MB, 10 Pages)</Text>
              <Button colorScheme="blue" size="sm" mt={2}>
                Browse Files
              </Button>
            </VStack>
            
            <VStack w="full" maxW="lg" mt={8} spacing={3} p={6} border="1px solid" borderColor={borderColor} borderRadius="xl">
              <Heading size="xs" color="gray.500" w="full" textAlign="left">Development Mode: Inject Mock OCR Text</Heading>
              <Textarea 
                placeholder="Paste mock OCR markdown here to skip API call and save credits..." 
                value={mockText}
                onChange={(e) => setMockText(e.target.value)}
                size="sm"
                rows={5}
              />
              <Button w="full" size="sm" colorScheme="gray" onClick={handleMockSubmit} isDisabled={!mockText.trim()}>
                Load Mock Text
              </Button>
            </VStack>
          </Center>
        )}

        {(ocrStatus === 'uploading' || ocrStatus === 'processing') && (
          <Center h="full" flex="1">
            <VStack spacing={6}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <VStack spacing={1}>
                <Heading size="md">Analyzing Document...</Heading>
                <Text color="gray.500">Extracting text, formatting, and tables via Sarvam AI.</Text>
              </VStack>
              <Progress w="xs" size="sm" isIndeterminate colorScheme="blue" borderRadius="full" />
            </VStack>
          </Center>
        )}

        {ocrStatus === 'completed' && ocrResult && (
          <Box flex="1" display="flex" flexDirection="column">
            <HStack justify="space-between" mb={4}>
              <HStack>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontWeight="bold" color="green.600">Digitization Complete</Text>
                <Text fontSize="sm" color="gray.500" ml={2}>({ocrFiles[0]?.name})</Text>
              </HStack>
              <HStack>
                <Button size="sm" leftIcon={<FiCopy />} onClick={handleCopy} variant="outline">
                  Copy Text
                </Button>
                <Button size="sm" onClick={resetOcr} colorScheme="blue">
                  Scan Another Document
                </Button>
              </HStack>
            </HStack>
            <Box flex="1" p={6} border="1px solid" borderColor={borderColor} borderRadius="md" overflowY="auto" bg={useColorModeValue('gray.50', 'gray.800')}>
              <Box className="markdown-body" fontSize="sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {ocrResult}
                </ReactMarkdown>
              </Box>
            </Box>
          </Box>
        )}

        {ocrStatus === 'error' && (
          <Center h="full" flex="1">
            <VStack spacing={4}>
              <Icon as={FiXCircle} boxSize={12} color="red.500" />
              <Heading size="md">Digitization Failed</Heading>
              <Text color="gray.500">An error occurred while processing the document via Sarvam AI.</Text>
              <Button onClick={resetOcr} colorScheme="blue" mt={4}>
                Try Again
              </Button>
            </VStack>
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default OcrIntelligencePanel;
