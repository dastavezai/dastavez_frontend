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
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
} from '@chakra-ui/react';
import { FiCheck, FiLayout, FiDownload, FiInfo } from 'react-icons/fi';
import axios from 'axios';

const DesignSuggestionModal = ({
  isOpen,
  onClose,
  onDownload,
  documentTitle = '',
  documentContent = '',
  requestedFormat = 'docx',
  language = 'en',
}) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [matchedCategory, setMatchedCategory] = useState(null);
  const [noDesigns, setNoDesigns] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.700');
  const selectedBorder = useColorModeValue('blue.500', 'blue.300');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const previewBg = useColorModeValue('gray.50', 'gray.800');
  const modalBg = useColorModeValue('white', 'gray.800');

  const t = {
    en: {
      title: 'Template Design Suggestion',
      subtitle: 'We found designs that may match your document',
      noDesigns: 'No matching template designs found. You can proceed with the default formatting.',
      matchedCategory: 'Matched category',
      applyAndDownload: 'Apply Design & Download',
      skipAndDownload: 'Download Without Design',
      cancel: 'Cancel',
      designNote: 'Template designs apply formatting like fonts, margins, alignment, and borders to your document.',
      docxOnly: 'Note: Template designs apply to both DOCX and PDF formats.',
      pdfNote: 'Downloading as PDF: design formatting will be applied during conversion.',
      docxNote: 'Downloading as DOCX: design formatting is applied directly to the file.',
      loading: 'Analyzing your document...',
    },
    hi: {
      title: 'टेम्पलेट डिज़ाइन सुझाव',
      subtitle: 'हमें आपके दस्तावेज़ से मेल खाने वाले डिज़ाइन मिले',
      noDesigns: 'कोई मेल खाने वाला डिज़ाइन नहीं मिला। आप डिफ़ॉल्ट फॉर्मेटिंग के साथ आगे बढ़ सकते हैं।',
      matchedCategory: 'मिलान श्रेणी',
      applyAndDownload: 'डिज़ाइन लागू करें और डाउनलोड करें',
      skipAndDownload: 'बिना डिज़ाइन के डाउनलोड करें',
      cancel: 'रद्द करें',
      designNote: 'टेम्पलेट डिज़ाइन आपके दस्तावेज़ पर फ़ॉन्ट, मार्जिन, संरेखण और बॉर्डर जैसी फ़ॉर्मेटिंग लागू करते हैं।',
      docxOnly: 'नोट: टेम्पलेट डिज़ाइन DOCX और PDF दोनों प्रारूपों पर लागू होते हैं।',
      pdfNote: 'PDF के रूप में डाउनलोड: रूपांतरण के दौरान डिज़ाइन फ़ॉर्मेटिंग लागू होगी।',
      docxNote: 'DOCX के रूप में डाउनलोड: डिज़ाइन फ़ॉर्मेटिंग सीधे फ़ाइल पर लागू होती है।',
      loading: 'आपके दस्तावेज़ का विश्लेषण हो रहा है...',
    },
  };
  const text = t[language] || t.en;

  useEffect(() => {
    if (isOpen && (documentTitle || documentContent)) {
      fetchMatchingDesigns();
    }
  }, [isOpen, documentTitle]);

  const fetchMatchingDesigns = async () => {
    setLoading(true);
    setNoDesigns(false);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/templates/designs/match',
        { title: documentTitle, content: documentContent },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const fetchedDesigns = response.data?.designs || [];
      setDesigns(fetchedDesigns);
      setMatchedCategory(response.data?.matchedCategory || null);

      if (fetchedDesigns.length === 0) {
        setNoDesigns(true);
      } else {
        
        const defaultDesign = fetchedDesigns.find(d => d.isDefault);
        setSelected(defaultDesign?._id || fetchedDesigns[0]?._id || null);
      }
    } catch (error) {
      console.error('Failed to fetch matching designs:', error);
      setNoDesigns(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAndDownload = () => {
    const design = designs.find(d => d._id === selected);
    onDownload(requestedFormat, design?.config || null);
  };

  const handleSkipAndDownload = () => {
    onDownload(requestedFormat, null);
  };

  
  const DesignPreview = ({ config }) => {
    const c = config || {};
    const alignMap = { left: 'left', center: 'center', right: 'right', justified: 'justify' };
    
    
    const images = c.images || [];
    const normalizePos = (pos) => {
      const map = { center: 'top-center', left: 'top-left', right: 'top-right', top: 'top-center', bottom: 'bottom-center' };
      return map[pos] || pos || 'top-center';
    };
    const topImages = images.filter(img => !img.isWatermark && normalizePos(img.position).startsWith('top'));
    const bottomImages = images.filter(img => !img.isWatermark && normalizePos(img.position).startsWith('bottom'));
    const watermarks = images.filter(img => img.isWatermark);

    return (
      <Box
        bg="white"
        color="gray.800"
        borderRadius="sm"
        border="1px solid"
        borderColor="gray.300"
        w="100%"
        h="180px"
        overflow="hidden"
        fontSize="5px"
        fontFamily={c.fontFamily || 'Times New Roman'}
        position="relative"
        lineHeight={c.lineSpacing || 1.15}
      >
        {c.borderStyle && c.borderStyle !== 'none' && (
          <Box
            position="absolute"
            top="2px" left="2px" right="2px" bottom="2px"
            border={
              c.borderStyle === 'double' ? '2px double' :
              c.borderStyle === 'thick' ? '1.5px solid' :
              '0.5px solid'
            }
            borderColor={c.borderColor || 'gray.500'}
            borderRadius="1px"
            pointerEvents="none"
            zIndex={2}
          />
        )}

        
        {watermarks.length > 0 && watermarks[0].data && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            opacity={watermarks[0].opacity || 0.15}
            pointerEvents="none"
            zIndex={1}
          >
            <img
              src={watermarks[0].data}
              alt="watermark"
              style={{
                maxWidth: `${Math.min(watermarks[0].width || 120, 120)}px`,
                maxHeight: `${Math.min(watermarks[0].height || 120, 100)}px`,
                objectFit: 'contain',
              }}
            />
          </Box>
        )}

        <Box position="relative" zIndex={2} p={2} h="100%" display="flex" flexDirection="column">
          {topImages.length > 0 && (
            <HStack spacing={1} justify="center" mb={1} flexShrink={0}>
              {topImages.map((img, i) => (
                img.data && (
                  <img
                    key={i}
                    src={img.data}
                    alt={img.label || 'stamp'}
                    style={{
                      width: `${Math.min((img.width || 40) / 4, 30)}px`,
                      height: `${Math.min((img.height || 40) / 4, 25)}px`,
                      objectFit: 'contain',
                      opacity: img.opacity || 1,
                    }}
                  />
                )
              ))}
            </HStack>
          )}

          <Box flex="1" overflow="hidden" px={c.borderStyle !== 'none' ? 1 : 0}>
            <Text
              textAlign={c.titleAlignment || 'center'}
              fontWeight={c.titleBold !== false ? 'bold' : 'normal'}
              textDecoration={c.titleUnderline ? 'underline' : 'none'}
              fontStyle={c.titleItalic ? 'italic' : 'normal'}
              fontSize={`${Math.max(5.5, (c.headingSize || 16) / 2.8)}px`}
              mb={1}
              color={c.colorScheme?.accent || 'gray.800'}
            >
              DOCUMENT TITLE
            </Text>
            <Box
              fontSize={`${Math.max(3.5, (c.fontSize || 12) / 2.8)}px`}
              textAlign={alignMap[c.bodyAlignment] || 'justify'}
              color={c.colorScheme?.primary || 'gray.800'}
            >
              <Text mb={0.5}>
                This deed is made on this day between the parties hereinafter referred to as First Party and Second Party.
              </Text>
              <Text mb={0.5} fontWeight="semibold">WHEREAS:</Text>
              <Text>
                Both parties have agreed to the terms set forth herein for mutual benefit and consideration.
              </Text>
            </Box>
          </Box>

          {bottomImages.length > 0 && (
            <HStack spacing={1} justify="center" mt={1} flexShrink={0}>
              {bottomImages.map((img, i) => (
                img.data && (
                  <img
                    key={i}
                    src={img.data}
                    alt={img.label || 'stamp'}
                    style={{
                      width: `${Math.min((img.width || 40) / 4, 30)}px`,
                      height: `${Math.min((img.height || 40) / 4, 25)}px`,
                      objectFit: 'contain',
                      opacity: img.opacity || 1,
                    }}
                  />
                )
              ))}
            </HStack>
          )}
        </Box>

        {images.length > 0 && (
          <Badge
            position="absolute"
            top={1}
            right={1}
            colorScheme="purple"
            fontSize="3px"
            px={1}
            borderRadius="sm"
            zIndex={3}
          >
            {images.length} img
          </Badge>
        )}
      </Box>
    );
  };

  const isDocxFormat = requestedFormat === 'docx';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(2px)" />
      <ModalContent bg={modalBg} mx={4}>
        <ModalHeader pb={1}>
          <HStack spacing={2}>
            <Icon as={FiLayout} color="blue.500" />
            <Text>{text.title}</Text>
          </HStack>
          <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
            {text.subtitle}
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {loading ? (
            <Center py={10} flexDirection="column" gap={3}>
              <Spinner size="lg" color="blue.500" />
              <Text color="gray.500" fontSize="sm">{text.loading}</Text>
            </Center>
          ) : noDesigns ? (
            <VStack spacing={4} py={6}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">{text.noDesigns}</AlertDescription>
              </Alert>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              {matchedCategory && (
                <HStack>
                  <Badge colorScheme="green" fontSize="xs" px={2} py={0.5} borderRadius="md">
                    {text.matchedCategory}: {matchedCategory}
                  </Badge>
                </HStack>
              )}

              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                {designs.map(design => (
                  <Box
                    key={design._id}
                    bg={cardBg}
                    borderRadius="lg"
                    borderWidth="2px"
                    borderColor={selected === design._id ? selectedBorder : 'transparent'}
                    p={2.5}
                    cursor="pointer"
                    onClick={() => setSelected(design._id)}
                    _hover={{ bg: hoverBg, borderColor: selectedBorder }}
                    transition="all 0.2s"
                    position="relative"
                  >
                    {selected === design._id && (
                      <Box
                        position="absolute" top={1.5} right={1.5}
                        bg="blue.500" color="white" borderRadius="full" p={0.5}
                        zIndex={1}
                      >
                        <Icon as={FiCheck} boxSize={3} />
                      </Box>
                    )}
                    <Box bg={previewBg} borderRadius="md" mb={2} p={1}>
                      <DesignPreview config={design.config} />
                    </Box>
                    <VStack align="start" spacing={0.5}>
                      <HStack>
                        <Text fontWeight="medium" fontSize="sm">{design.name}</Text>
                        {design.isDefault && <Badge colorScheme="yellow" fontSize="2xs">Default</Badge>}
                      </HStack>
                      {design.description && (
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>{design.description}</Text>
                      )}
                      <HStack spacing={1} fontSize="xs" color="gray.400" flexWrap="wrap">
                        <Text>{design.config?.fontFamily || 'Times New Roman'}</Text>
                        <Text>·</Text>
                        <Text>{design.config?.fontSize || 12}pt</Text>
                        {design.config?.images?.length > 0 && (
                          <>
                            <Text>·</Text>
                            <Badge colorScheme="purple" fontSize="2xs" variant="subtle">
                              {design.config.images.length} image{design.config.images.length > 1 ? 's' : ''}
                            </Badge>
                          </>
                        )}
                        {design.config?.borderStyle && design.config.borderStyle !== 'none' && (
                          <>
                            <Text>·</Text>
                            <Badge colorScheme="blue" fontSize="2xs" variant="subtle">Border</Badge>
                          </>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>

              <Divider />

              <HStack spacing={2} p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                <Icon as={FiInfo} color="blue.500" flexShrink={0} />
                <Text fontSize="xs" color={useColorModeValue('blue.700', 'blue.200')}>
                  {text.designNote}
                </Text>
              </HStack>

              {!isDocxFormat && (
                <Alert status="info" borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  <AlertDescription>{text.pdfNote}</AlertDescription>
                </Alert>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter gap={2} flexWrap="wrap">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {text.cancel}
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FiDownload />}
            onClick={handleSkipAndDownload}
          >
            {text.skipAndDownload}
          </Button>
          {!noDesigns && designs.length > 0 && (
            <Button
              colorScheme="blue"
              size="sm"
              leftIcon={<FiLayout />}
              onClick={handleApplyAndDownload}
              isDisabled={!selected}
            >
              {text.applyAndDownload}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DesignSuggestionModal;
