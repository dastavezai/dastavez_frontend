import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  SimpleGrid,
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Icon,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiCheck, FiLayout } from 'react-icons/fi';
import axios from 'axios';

/**
 * TemplateDesignSelector - User-facing component for selecting document design templates
 * 
 * Shows a grid of available designs with a live preview mockup.
 * Opens as a modal during document generation (before or after field collection).
 * Also used during document edit flow.
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void - called when modal closes (X button, Escape) - should NOT generate
 * - onSkip: () => void - called when "Skip" button clicked - SHOULD generate without design
 * - onSelect: (design) => void - called when user picks a design - SHOULD generate with design
 * - category: string - document category to filter designs (e.g., "Rent Drafts")
 * - currentDesignId: string - currently selected design ID
 * - language: 'en' | 'hi'
 * - isLoading: boolean - disables buttons during generation
 */
const TemplateDesignSelector = ({ isOpen, onClose, onSkip, onSelect, category, currentDesignId, language = 'en', isLoading = false }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(currentDesignId || null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const selectedBorder = useColorModeValue('blue.500', 'blue.300');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const previewBg = useColorModeValue('gray.50', 'gray.800');

  useEffect(() => {
    if (isOpen) {
      fetchDesigns();
    }
  }, [isOpen, category]);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const params = category ? `?category=${encodeURIComponent(category)}` : '';
      const response = await axios.get(`/api/templates/designs${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedDesigns = response.data?.designs || [];
      setDesigns(fetchedDesigns);
      // Auto-select default design if nothing selected
      if (!selected) {
        const defaultDesign = fetchedDesigns.find(d => d.isDefault);
        if (defaultDesign) setSelected(defaultDesign._id);
        else if (fetchedDesigns.length > 0) setSelected(fetchedDesigns[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch template designs:', error);
      // Set a fallback "Standard" design
      setDesigns([{
        _id: 'default',
        name: 'Standard',
        description: 'Default document formatting',
        isDefault: true,
        config: {
          fontFamily: 'Times New Roman',
          fontSize: 12,
          headingSize: 16,
          titleAlignment: 'center',
          bodyAlignment: 'justified',
          titleBold: true,
          borderStyle: 'none',
        }
      }]);
      setSelected('default');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    console.log('🎯 [CLICK] "Apply Design" button clicked, isLoading:', isLoading);
    
    if (isLoading) {
      console.warn('⚠️  [BLOCK] Already generating, ignoring duplicate Click on Apply Design');
      return;
    }
    
    const design = designs.find(d => d._id === selected);
    if (design) {
      console.log('✅ [CONFIRM] Design confirmed:', { name: design.name, id: design._id, configFontFamily: design.config?.fontFamily });
      onSelect(design);
    } else {
      console.warn('⚠️  [ERROR] Selected design not found');
    }
    onClose();
  };

  const handleSkip = () => {
    console.log('⏭️  [CLICK] "Skip" button clicked - will generate WITHOUT design');
    if (onSkip) {
      console.log('   [CALL] Calling onSkip callback');
      onSkip();
    }
  };

  const handleCloseModal = () => {
    console.log('❌ [CLICK] Modal X button clicked - just closing, NO generation');
    onClose();
  };

  // Enhanced preview mockup with legal document text
  const DesignPreview = ({ config }) => {
    const c = config || {};
    const alignMap = { 
      left: 'left', 
      center: 'center', 
      right: 'right', 
      justified: 'justify' 
    };
    
    const lineSpacingMap = {
      'single': 1.0,
      '1.15': 1.15,
      '1.5': 1.5,
      'double': 2.0
    };
    
    const lineHeight = lineSpacingMap[c.lineSpacing] || 1.15;
    
    return (
      <Box
        bg="white"
        color="gray.800"
        p={3}
        borderRadius="sm"
        border="1px solid"
        borderColor="gray.300"
        w="100%"
        h="140px"
        overflow="hidden"
        fontSize="5.5px"
        fontFamily={c.fontFamily || 'Times New Roman'}
        position="relative"
        lineHeight={lineHeight}
      >
        {/* Border decoration */}
        {c.borderStyle && c.borderStyle !== 'none' && (
          <Box
            position="absolute"
            top="3px" left="3px" right="3px" bottom="3px"
            border={
              c.borderStyle === 'double' ? '2px double' : 
              c.borderStyle === 'thick' ? '1.5px solid' : 
              '0.5px solid'
            }
            borderColor="gray.500"
            borderRadius="1px"
            pointerEvents="none"
          />
        )}
        
        {/* Title */}
        <Text
          textAlign={c.titleAlignment || 'center'}
          fontWeight={c.titleBold ? 'bold' : 'normal'}
          textDecoration={c.titleUnderline ? 'underline' : 'none'}
          fontSize={`${Math.max(6, (c.headingSize || 16) / 2.5)}px`}
          mb={1.5}
          mt={c.borderStyle !== 'none' ? 2 : 0}
          letterSpacing="0.3px"
        >
          DEED OF AGREEMENT
        </Text>
        
        {/* Body content with sample legal text */}
        <Box 
          fontSize={`${Math.max(4, (c.fontSize || 12) / 2.5)}px`}
          textAlign={alignMap[c.bodyAlignment] || 'justify'}
          px={c.borderStyle !== 'none' ? 1 : 0}
        >
          <Text mb={0.5}>
            THIS DEED OF AGREEMENT made on this day between Party A (hereinafter referred to as "First Party") and Party B (hereinafter referred to as "Second Party").
          </Text>
          <Text mb={0.5} fontWeight="semibold" fontSize={`${Math.max(4.5, (c.fontSize || 12) / 2.3)}px`}>
            WHEREAS:
          </Text>
          <Text mb={0.5} pl={1}>
            A. The First Party is desirous of entering into an agreement with the Second Party for the purpose of mutual benefit and consideration.
          </Text>
          <Text mb={0.5} pl={1}>
            B. Both parties have agreed to the terms and conditions as set forth in this document.
          </Text>
          <Text fontWeight="semibold" fontSize={`${Math.max(4.5, (c.fontSize || 12) / 2.3)}px`}>
            NOW THIS DEED WITNESSETH...
          </Text>
        </Box>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={useColorModeValue('white', 'gray.800')}>
        <ModalHeader>
          <HStack>
            <Icon as={FiLayout} />
            <Text>{language === 'hi' ? 'दस्तावेज़ डिज़ाइन चुनें' : 'Choose Document Design'}</Text>
          </HStack>
          <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
            {language === 'hi' 
              ? 'अपने दस्तावेज़ के लिए एक डिज़ाइन टेम्पलेट चुनें'
              : 'Select a design template for your document'}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {loading ? (
            <Center py={10}><Spinner size="lg" /></Center>
          ) : designs.length === 0 ? (
            <Center py={10}>
              <Text color="gray.500">
                {language === 'hi' ? 'कोई डिज़ाइन उपलब्ध नहीं' : 'No designs available'}
              </Text>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              {designs.map(design => (
                <Box
                  key={design._id}
                  bg={cardBg}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor={selected === design._id ? selectedBorder : 'transparent'}
                  p={3}
                  cursor="pointer"
                  onClick={() => setSelected(design._id)}
                  _hover={{ bg: hoverBg, borderColor: selectedBorder }}
                  transition="all 0.2s"
                  position="relative"
                >
                  {/* Selected checkmark */}
                  {selected === design._id && (
                    <Box
                      position="absolute"
                      top={2}
                      right={2}
                      bg="blue.500"
                      color="white"
                      borderRadius="full"
                      p={1}
                      zIndex={1}
                    >
                      <Icon as={FiCheck} boxSize={3} />
                    </Box>
                  )}
                  
                  {/* Preview */}
                  <Box bg={previewBg} borderRadius="md" mb={2} p={1}>
                    <DesignPreview config={design.config} />
                  </Box>
                  
                  {/* Info */}
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Text fontWeight="medium" fontSize="sm">{design.name}</Text>
                      {design.isDefault && <Badge colorScheme="yellow" fontSize="2xs">Default</Badge>}
                    </HStack>
                    {design.description && (
                      <Text fontSize="xs" color="gray.500" noOfLines={2}>{design.description}</Text>
                    )}
                    <HStack spacing={1} fontSize="xs" color="gray.400">
                      <Text>{design.config?.fontFamily || 'Times New Roman'}</Text>
                      <Text>·</Text>
                      <Text>{design.config?.fontSize || 12}pt</Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleSkip} isDisabled={isLoading}>
            {language === 'hi' ? 'छोड़ें' : 'Skip'}
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleConfirm}
            isDisabled={!selected || isLoading}
            isLoading={isLoading}
          >
            {language === 'hi' ? 'डिज़ाइन लागू करें' : 'Apply Design'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TemplateDesignSelector;
