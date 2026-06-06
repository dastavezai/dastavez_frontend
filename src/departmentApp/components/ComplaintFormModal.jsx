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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Radio,
  RadioGroup,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Box,
  Divider,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  Collapse,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle, FiFileText } from 'react-icons/fi';

const ComplaintFormModal = ({ isOpen, onClose, onSubmit, initialContext = {}, language = 'en' }) => {
  const toast = useToast();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const cancelRef = React.useRef();
  
  
  const [complaintType, setComplaintType] = useState(initialContext?.complaintType || '');
  const [againstWhom, setAgainstWhom] = useState(initialContext?.againstWhom || '');
  const [incidentDate, setIncidentDate] = useState(initialContext?.incidentDate || '');
  const [location, setLocation] = useState(initialContext?.location || '');
  const [description, setDescription] = useState(initialContext?.description || '');
  const [evidence, setEvidence] = useState(initialContext?.evidence || []);
  const [desiredOutcome, setDesiredOutcome] = useState(initialContext?.desiredOutcome || '');
  const [urgency, setUrgency] = useState(initialContext?.urgency || 'medium');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  
  
  const complaintTypes = language === 'hi' ? {
    'consumer': 'उपभोक्ता शिकायत',
    'police': 'पुलिस शिकायत (FIR)',
    'workplace': 'कार्यस्थल उत्पीड़न',
    'defamation': 'मानहानि',
    'property': 'संपत्ति विवाद',
    'service': 'सेवा में कमी',
    'banking': 'बैंकिंग शिकायत',
    'insurance': 'बीमा शिकायत',
    'online_fraud': 'ऑनलाइन धोखाधड़ी',
    'other': 'अन्य'
  } : {
    'consumer': 'Consumer Complaint',
    'police': 'Police Complaint (FIR)',
    'workplace': 'Workplace Harassment',
    'defamation': 'Defamation',
    'property': 'Property Dispute',
    'service': 'Service Deficiency',
    'banking': 'Banking Complaint',
    'insurance': 'Insurance Claim',
    'online_fraud': 'Online Fraud',
    'other': 'Other'
  };
  
  const evidenceOptions = language === 'hi' ? [
    'दस्तावेज़',
    'फोटो/वीडियो',
    'गवाह',
    'ईमेल/संदेश',
    'रसीदें',
    'अन्य'
  ] : [
    'Documents',
    'Photos/Videos',
    'Witnesses',
    'Emails/Messages',
    'Receipts',
    'Other'
  ];
  
  
  const descriptionMax = 2000;
  const outcomeMax = 500;
  
  
  const isFormValid = () => {
    return complaintType && 
           againstWhom.trim() && 
           incidentDate && 
           description.trim().length >= 50 &&
           desiredOutcome.trim();
  };
  
  
  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: language === 'hi' ? 'अधूरा फॉर्म' : 'Incomplete Form',
        description: language === 'hi' 
          ? 'कृपया सभी आवश्यक फ़ील्ड भरें'
          : 'Please fill all required fields',
        status: 'warning',
        duration: 3000
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = {
        complaintType,
        againstWhom,
        incidentDate,
        location,
        description,
        evidence,
        desiredOutcome,
        urgency
      };
      
      await onSubmit(formData);
      
      toast({
        title: language === 'hi' ? 'शिकायत बनाई जा रही है' : 'Generating Complaint',
        description: language === 'hi' 
          ? 'कृपया प्रतीक्षा करें...'
          : 'Please wait...',
        status: 'info',
        duration: 2000
      });
      
      onClose();
    } catch (error) {
      console.error('Complaint submission error:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'शिकायत बनाने में विफल'
          : 'Failed to generate complaint',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  useEffect(() => {
    if (!isOpen) {
      setShowPreview(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  
  const handleCancelClick = () => {
    console.log('🔵 [ComplaintFormModal] Cancel button clicked');
    onConfirmOpen();
  };
  
  
  const handleConfirmCancel = () => {
    console.log('🔵 [ComplaintFormModal] Cancel confirmed - returning to main menu');
    onConfirmClose();
    onClose(true);
  };
  
  
  const handleXClose = () => {
    console.log('🔵 [ComplaintFormModal] X button clicked');
    onConfirmOpen();
  };
  
  
  useEffect(() => {
    if (isOpen && initialContext) {
      console.log('🤖 Smart pre-filling complaint form:', initialContext);
      
      
      if (initialContext.suggestedComplaintType) {
        const typeMapping = {
          'civil': 'property',
          'consumer': 'consumer',
          'criminal': 'police',
          'family': 'other',
          'labor': 'workplace'
        };
        
        const mappedType = typeMapping[initialContext.suggestedComplaintType];
        if (mappedType) {
          setComplaintType(mappedType);
          console.log(`✅ Auto-selected complaint type: ${mappedType}`);
        }
      }
      
      
      if (initialContext.suggestedDescription && !description) {
        setDescription(initialContext.suggestedDescription);
        console.log(`✅ Pre-filled description (${initialContext.suggestedDescription.length} chars)`);
      }
      
      
      if (initialContext.complaintType) setComplaintType(initialContext.complaintType);
      if (initialContext.againstWhom) setAgainstWhom(initialContext.againstWhom);
      if (initialContext.incidentDate) setIncidentDate(initialContext.incidentDate);
      if (initialContext.location) setLocation(initialContext.location);
      if (initialContext.evidence) setEvidence(initialContext.evidence);
      if (initialContext.desiredOutcome) setDesiredOutcome(initialContext.desiredOutcome);
      if (initialContext.urgency) setUrgency(initialContext.urgency);
    }
  }, [isOpen, initialContext]);
  
  
  const PreviewSummary = () => (
    <Box bg={highlightBg} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
      <HStack mb={2}>
        <Icon as={FiCheckCircle} color="green.500" />
        <Text fontWeight="bold">
          {language === 'hi' ? 'शिकायत सारांश' : 'Complaint Summary'}
        </Text>
      </HStack>
      <VStack align="start" spacing={2} fontSize="sm">
        <Text><strong>{language === 'hi' ? 'प्रकार' : 'Type'}:</strong> {complaintTypes[complaintType]}</Text>
        <Text><strong>{language === 'hi' ? 'विरुद्ध' : 'Against'}:</strong> {againstWhom}</Text>
        <Text><strong>{language === 'hi' ? 'तिथि' : 'Date'}:</strong> {incidentDate}</Text>
        {location && <Text><strong>{language === 'hi' ? 'स्थान' : 'Location'}:</strong> {location}</Text>}
        <Text><strong>{language === 'hi' ? 'विवरण' : 'Description'}:</strong> {description.substring(0, 100)}...</Text>
        {evidence.length > 0 && (
          <Text><strong>{language === 'hi' ? 'साक्ष्य' : 'Evidence'}:</strong> {evidence.join(', ')}</Text>
        )}
        <Text><strong>{language === 'hi' ? 'वांछित परिणाम' : 'Desired Outcome'}:</strong> {desiredOutcome}</Text>
        <Badge colorScheme={urgency === 'immediate' ? 'red' : urgency === 'high' ? 'orange' : 'blue'}>
          {language === 'hi' ? 'प्राथमिकता' : 'Priority'}: {urgency.toUpperCase()}
        </Badge>
      </VStack>
    </Box>
  );
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>
          <HStack>
            <Icon as={FiFileText} />
            <Text>
              {language === 'hi' ? 'शिकायत फॉर्म' : 'Complaint Form'}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton onClick={handleXClose} />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                {language === 'hi' 
                  ? 'सभी * चिह्नित फ़ील्ड आवश्यक हैं। आपकी जानकारी सुरक्षित है।'
                  : 'All fields marked with * are required. Your information is secure.'}
              </Text>
            </Alert>
            
            <FormControl isRequired>
              <FormLabel>{language === 'hi' ? 'शिकायत का प्रकार' : 'Complaint Type'} *</FormLabel>
              <Select 
                placeholder={language === 'hi' ? 'चुनें...' : 'Select...'}
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value)}
              >
                {Object.entries(complaintTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </FormControl>
            
            <Collapse in={!!complaintType} animateOpacity>
              <VStack spacing={4} align="stretch">
                <Divider />
                
                <FormControl isRequired>
                  <FormLabel>{language === 'hi' ? 'विरुद्ध किसके' : 'Against Whom'} *</FormLabel>
                  <Input 
                    placeholder={language === 'hi' 
                      ? 'व्यक्ति/कंपनी का नाम'
                      : 'Name of person/company'}
                    value={againstWhom}
                    onChange={(e) => setAgainstWhom(e.target.value)}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>{language === 'hi' ? 'घटना की तिथि' : 'Date of Incident'} *</FormLabel>
                  <Input 
                    type="date"
                    value={incidentDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setIncidentDate(e.target.value)}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>{language === 'hi' ? 'स्थान' : 'Location'}</FormLabel>
                  <Input 
                    placeholder={language === 'hi' 
                      ? 'घटना का स्थान'
                      : 'Location of incident'}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>
                    {language === 'hi' ? 'विस्तृत विवरण' : 'Detailed Description'} *
                    <Badge ml={2} colorScheme={description.length >= 50 ? 'green' : 'red'}>
                      {description.length}/{descriptionMax}
                    </Badge>
                  </FormLabel>
                  <Textarea 
                    placeholder={language === 'hi' 
                      ? 'क्या हुआ? कब हुआ? कैसे हुआ? विस्तार से बताएं... (कम से कम 50 अक्षर)'
                      : 'What happened? When? How? Describe in detail... (min 50 characters)'}
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= descriptionMax) {
                        setDescription(e.target.value);
                      }
                    }}
                    rows={6}
                    resize="vertical"
                  />
                  <Text fontSize="xs" color={description.length < 50 ? 'red.500' : 'gray.500'} mt={1}>
                    {description.length < 50 
                      ? (language === 'hi' ? `कम से कम ${50 - description.length} अधिक अक्षर` : `At least ${50 - description.length} more characters needed`)
                      : (language === 'hi' ? '✓ पर्याप्त विवरण' : '✓ Sufficient detail')}
                  </Text>
                </FormControl>
                
                <FormControl>
                  <FormLabel>{language === 'hi' ? 'उपलब्ध साक्ष्य' : 'Available Evidence'}</FormLabel>
                  <CheckboxGroup value={evidence} onChange={setEvidence}>
                    <Stack spacing={2} direction="column">
                      {evidenceOptions.map((option) => (
                        <Checkbox key={option} value={option}>{option}</Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>
                    {language === 'hi' ? 'वांछित परिणाम' : 'Desired Outcome'} *
                    <Badge ml={2}>{desiredOutcome.length}/{outcomeMax}</Badge>
                  </FormLabel>
                  <Textarea 
                    placeholder={language === 'hi' 
                      ? 'आप क्या चाहते हैं? (उदा: मुआवजा, माफी, कार्यवाही)'
                      : 'What do you want? (e.g., compensation, apology, action)'}
                    value={desiredOutcome}
                    onChange={(e) => {
                      if (e.target.value.length <= outcomeMax) {
                        setDesiredOutcome(e.target.value);
                      }
                    }}
                    rows={3}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>{language === 'hi' ? 'प्राथमिकता' : 'Priority'}</FormLabel>
                  <RadioGroup value={urgency} onChange={setUrgency}>
                    <Stack spacing={2}>
                      <Radio value="immediate" colorScheme="red">
                        {language === 'hi' ? '🔴 तत्काल (24 घंटे)' : '🔴 Immediate (24 hours)'}
                      </Radio>
                      <Radio value="high" colorScheme="orange">
                        {language === 'hi' ? '🟠 उच्च (1 सप्ताह)' : '🟠 High (1 week)'}
                      </Radio>
                      <Radio value="medium" colorScheme="blue">
                        {language === 'hi' ? '🔵 मध्यम (2 सप्ताह)' : '🔵 Medium (2 weeks)'}
                      </Radio>
                      <Radio value="low" colorScheme="gray">
                        {language === 'hi' ? '⚪ कम (1 माह)' : '⚪ Low (1 month)'}
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                
                {isFormValid() && (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview 
                        ? (language === 'hi' ? 'पूर्वावलोकन छिपाएं' : 'Hide Preview')
                        : (language === 'hi' ? 'पूर्वावलोकन दिखाएं' : 'Show Preview')}
                    </Button>
                    
                    <Collapse in={showPreview} animateOpacity>
                      <PreviewSummary />
                    </Collapse>
                  </>
                )}
              </VStack>
            </Collapse>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleCancelClick}>
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isDisabled={!isFormValid()}
              isLoading={isSubmitting}
              loadingText={language === 'hi' ? 'बना रहे हैं...' : 'Generating...'}
            >
              {language === 'hi' ? 'शिकायत बनाएं' : 'Generate Complaint'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
      
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onConfirmClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {language === 'hi' ? 'रद्द करें और बंद करें?' : 'Cancel and Close?'}
            </AlertDialogHeader>

            <AlertDialogBody>
              {language === 'hi' 
                ? 'क्या आप शिकायत प्रक्रिया रद्द करना और मुख्य मेनू पर वापस जाना चाहते हैं? सभी भरी गई जानकारी खो जाएगी।'
                : 'Do you want to cancel the complaint process and return to the main menu? All filled information will be lost.'}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onConfirmClose}>
                {language === 'hi' ? 'नहीं, भरना जारी रखें' : 'No, Continue Filling'}
              </Button>
              <Button colorScheme="red" onClick={handleConfirmCancel} ml={3}>
                {language === 'hi' ? 'हाँ, प्रक्रिया रद्द करें' : 'Yes, Cancel Process'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Modal>
  );
};

export default ComplaintFormModal;
