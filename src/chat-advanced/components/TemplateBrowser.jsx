import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  useColorModeValue,
  Spinner,
  Icon,
  Tooltip,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaFolder, FaFile, FaFileAlt, FaEye, FaCheck } from 'react-icons/fa';
import axios from 'axios';

/**
 * TemplateBrowser - A file-manager style modal for browsing and selecting templates
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onSelectTemplate: function(template) - called when user selects a template
 * - language: 'en' | 'hi'
 * - token: auth token
 */
const TemplateBrowser = ({ isOpen, onClose, onSelectTemplate, language = 'en', token }) => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const toast = useToast();
  const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBg = useColorModeValue('blue.100', 'blue.800');
  const categoryBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  // Fetch templates on mount
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/templates/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.templates) {
        setTemplates(response.data.templates);
        
        // Organize by category
        const cats = {};
        response.data.templates.forEach(template => {
          const category = template.category || 'Other';
          if (!cats[category]) {
            cats[category] = [];
          }
          cats[category].push(template);
        });
        setCategories(cats);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'टेम्पलेट लोड करने में विफल' : 'Failed to load templates',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (template) => {
    setSelectedTemplate(template);
    setPreviewLoading(true);
    
    try {
      const response = await axios.get(`${BASE_URL}/templates/preview/${encodeURIComponent(template.relPath)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        const fallback = response.data.preview || response.data.content || '';
        setPreviewContent({
          en: response.data.previewEn || fallback,
          hi: response.data.previewHi || fallback
        });
      }
    } catch (error) {
      console.error('Failed to preview template:', error);
      setPreviewContent({
        en: 'Preview not available',
        hi: 'पूर्वावलोकन उपलब्ध नहीं है'
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedTemplate && onSelectTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  // Filter templates based on search
  const filteredCategories = {};
  Object.keys(categories).forEach(category => {
    const filtered = categories[category].filter(template => {
      const searchLower = searchQuery.toLowerCase();
      return (
        template.displayTitle?.toLowerCase().includes(searchLower) ||
        template.category?.toLowerCase().includes(searchLower) ||
        template.keywords?.some(k => k.toLowerCase().includes(searchLower))
      );
    });
    if (filtered.length > 0) {
      filteredCategories[category] = filtered;
    }
  });

  const categoryNames = Object.keys(filteredCategories);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg={bgColor} maxH="90vh">
        <ModalHeader borderBottomWidth={1} borderColor={borderColor}>
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={FaFolder} color="blue.500" boxSize={6} />
              <Text fontSize="xl" fontWeight="bold">
                {language === 'hi' ? 'टेम्पलेट ब्राउज़र' : 'Template Browser'}
              </Text>
              <Badge colorScheme="blue" fontSize="sm">
                {templates.length} {language === 'hi' ? 'टेम्पलेट' : 'templates'}
              </Badge>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0}>
          <HStack align="stretch" spacing={0} h="60vh">
            {/* Left Panel - Categories & Templates */}
            <Box w="50%" borderRightWidth={1} borderColor={borderColor} overflowY="auto">
              {/* Search */}
              <Box p={4} borderBottomWidth={1} borderColor={borderColor}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder={language === 'hi' ? 'टेम्पलेट खोजें...' : 'Search templates...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={useColorModeValue('white', 'gray.700')}
                  />
                </InputGroup>
              </Box>
              
              {/* Template List */}
              {loading ? (
                <Box p={8} textAlign="center">
                  <Spinner size="lg" color="blue.500" />
                  <Text mt={4} color={mutedColor}>
                    {language === 'hi' ? 'टेम्पलेट लोड हो रहे हैं...' : 'Loading templates...'}
                  </Text>
                </Box>
              ) : categoryNames.length === 0 ? (
                <Box p={8} textAlign="center">
                  <Text color={mutedColor}>
                    {language === 'hi' ? 'कोई टेम्पलेट नहीं मिला' : 'No templates found'}
                  </Text>
                </Box>
              ) : (
                <Accordion allowMultiple defaultIndex={[0]}>
                  {categoryNames.map((category, catIdx) => (
                    <AccordionItem key={catIdx} border="none">
                      <AccordionButton 
                        bg={categoryBg} 
                        _hover={{ bg: hoverBg }}
                        py={3}
                      >
                        <HStack flex={1} textAlign="left" spacing={3}>
                          <Icon as={FaFolder} color="yellow.500" />
                          <Text fontWeight="semibold">{category}</Text>
                          <Badge colorScheme="gray" fontSize="xs">
                            {filteredCategories[category].length}
                          </Badge>
                        </HStack>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={0} px={0}>
                        <VStack spacing={0} align="stretch">
                          {filteredCategories[category].map((template, idx) => (
                            <HStack
                              key={idx}
                              px={6}
                              py={3}
                              cursor="pointer"
                              bg={selectedTemplate?.relPath === template.relPath ? selectedBg : 'transparent'}
                              _hover={{ bg: hoverBg }}
                              onClick={() => handlePreview(template)}
                              borderBottomWidth={1}
                              borderColor={borderColor}
                            >
                              <Icon as={FaFileAlt} color="blue.400" />
                              <VStack align="start" spacing={0} flex={1}>
                                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                  {template.displayTitle}
                                </Text>
                                {template.keywords && template.keywords.length > 0 && (
                                  <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                                    {template.keywords.slice(0, 3).join(', ')}
                                  </Text>
                                )}
                              </VStack>
                              {selectedTemplate?.relPath === template.relPath && (
                                <Icon as={FaCheck} color="green.500" />
                              )}
                            </HStack>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </Box>
            
            {/* Right Panel - Preview */}
            <Box w="50%" overflowY="auto" bg={useColorModeValue('gray.50', 'gray.900')}>
              {selectedTemplate ? (
                <VStack align="stretch" h="full">
                  {/* Preview Header */}
                  <Box p={4} borderBottomWidth={1} borderColor={borderColor} bg={bgColor}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {selectedTemplate.displayTitle}
                        </Text>
                        <Badge colorScheme="purple">{selectedTemplate.category}</Badge>
                      </VStack>
                      <Tooltip label={language === 'hi' ? 'पूर्वावलोकन' : 'Preview'}>
                        <Icon as={FaEye} color="blue.500" boxSize={5} />
                      </Tooltip>
                    </HStack>
                  </Box>
                  
                  {/* Preview Content */}
                  <Box p={4} flex={1} overflowY="auto">
                    {previewLoading ? (
                      <Box textAlign="center" py={8}>
                        <Spinner size="md" color="blue.500" />
                        <Text mt={2} color={mutedColor} fontSize="sm">
                          {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
                        </Text>
                      </Box>
                    ) : (
                      <Box
                        p={4}
                        bg={bgColor}
                        borderRadius="md"
                        borderWidth={1}
                        borderColor={borderColor}
                        fontSize="sm"
                        whiteSpace="pre-wrap"
                        fontFamily="mono"
                        maxH="400px"
                        overflowY="auto"
                      >
                        {previewContent ? (
                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <Badge colorScheme="blue" fontSize="xs" mb={2}>EN</Badge>
                              <Text color={textColor} fontSize="sm">
                                {previewContent.en || 'Preview not available'}
                              </Text>
                            </Box>
                            <Box>
                              <Badge colorScheme="green" fontSize="xs" mb={2}>HI</Badge>
                              <Text color={textColor} fontSize="sm">
                                {previewContent.hi || 'पूर्वावलोकन उपलब्ध नहीं है'}
                              </Text>
                            </Box>
                          </VStack>
                        ) : (
                          <Text color={textColor}>
                            {language === 'hi' ? 'पूर्वावलोकन के लिए टेम्पलेट चुनें' : 'Select a template to preview'}
                          </Text>
                        )}
                      </Box>
                    )}
                  </Box>
                  
                  {/* Template Fields Info */}
                  {selectedTemplate.fields && selectedTemplate.fields.length > 0 && (
                    <Box p={4} borderTopWidth={1} borderColor={borderColor} bg={bgColor}>
                      <Text fontSize="sm" fontWeight="semibold" mb={2}>
                        {language === 'hi' ? 'आवश्यक फ़ील्ड:' : 'Required Fields:'}
                      </Text>
                      <HStack flexWrap="wrap" spacing={2}>
                        {selectedTemplate.fields.slice(0, 6).map((field, idx) => (
                          <Badge key={idx} colorScheme="blue" variant="subtle" fontSize="xs">
                            {field.label || field.key}
                          </Badge>
                        ))}
                        {selectedTemplate.fields.length > 6 && (
                          <Badge colorScheme="gray" fontSize="xs">
                            +{selectedTemplate.fields.length - 6} more
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  )}
                </VStack>
              ) : (
                <Box p={8} textAlign="center" color={mutedColor}>
                  <Icon as={FaFileAlt} boxSize={12} mb={4} opacity={0.3} />
                  <Text>
                    {language === 'hi' 
                      ? 'पूर्वावलोकन देखने के लिए बाईं ओर से टेम्पलेट चुनें' 
                      : 'Select a template from the left to preview'}
                  </Text>
                </Box>
              )}
            </Box>
          </HStack>
        </ModalBody>
        
        <ModalFooter borderTopWidth={1} borderColor={borderColor}>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSelect}
              isDisabled={!selectedTemplate}
              leftIcon={<FaCheck />}
            >
              {language === 'hi' ? 'इस टेम्पलेट का उपयोग करें' : 'Use This Template'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TemplateBrowser;
