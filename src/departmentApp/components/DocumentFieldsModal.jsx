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
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  SimpleGrid,
  Box,
  Text,
  Progress,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Divider,
  Icon,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FaFileAlt, FaCheck, FaExclamationCircle, FaMagic, FaDatabase, FaRobot, FaUpload, FaEdit } from 'react-icons/fa';
import fileService from '../services/fileService';

const DocumentFieldsModal = ({
  isOpen,
  onClose,
  onSubmit,
  templateTitle,
  fields = [],
  initialValues = {},
  language = 'en',
  isEditMode = false,
  allowPartial = false,
  fieldSource = '',
}) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const { isOpen: isPartialOpen, onOpen: onPartialOpen, onClose: onPartialClose } = useDisclosure();
  const cancelRef = React.useRef();
  const partialRef = React.useRef();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const inputBg = useColorModeValue('white', 'gray.700');
  const progressBg = useColorModeValue('gray.100', 'gray.700');

  const accordionBg = useColorModeValue('gray.50', 'gray.700');
  const accordionHoverBg = useColorModeValue('gray.100', 'gray.600');

  
  const t = {
    en: {
      fillDetails: isEditMode ? 'Edit Document Details' : fieldSource === 'smart_extracted' ? 'Review & Edit Document Fields' : 'Fill Document Details',
      required: 'Required',
      optional: 'Optional',
      submit: isEditMode ? 'Update & Regenerate' : fieldSource === 'smart_extracted' ? 'Apply Changes' : 'Generate Document',
      cancel: 'Cancel',
      progress: 'Progress',
      fieldsCompleted: 'fields completed',
      fieldRequired: 'This field is required',
      example: 'Example',
      allFieldsRequired: 'Please fill all required fields',
      cancelConfirmTitle: 'Cancel Draft Flow?',
      cancelConfirmBody: 'Do you want to cancel the entire draft flow for this document and return to the main menu? All filled data will be lost.',
      cancelConfirmYes: 'Yes, Cancel Draft',
      cancelConfirmNo: 'No, Continue Filling',
    },
    hi: {
      fillDetails: isEditMode ? 'दस्तावेज़ विवरण संपादित करें' : 'दस्तावेज़ विवरण भरें',
      required: 'आवश्यक',
      optional: 'वैकल्पिक',
      submit: isEditMode ? 'अपडेट और पुनः जेनरेट करें' : 'दस्तावेज़ बनाएं',
      cancel: 'रद्द करें',
      progress: 'प्रगति',
      fieldsCompleted: 'फ़ील्ड पूर्ण',
      fieldRequired: 'यह फ़ील्ड आवश्यक है',
      example: 'उदाहरण',
      allFieldsRequired: 'कृपया सभी आवश्यक फ़ील्ड भरें',
      cancelConfirmTitle: 'ड्राफ्ट प्रक्रिया रद्द करें?',
      cancelConfirmBody: 'क्या आप इस दस्तावेज़ के लिए संपूर्ण ड्राफ्ट प्रक्रिया रद्द करना और मुख्य मेनू पर वापस जाना चाहते हैं? सभी भरा हुआ डेटा खो जाएगा।',
      cancelConfirmYes: 'हाँ, ड्राफ्ट रद्द करें',
      cancelConfirmNo: 'नहीं, भरना जारी रखें',
    },
  };

  const text = t[language] || t.en;

  
  useEffect(() => {
    const init = {};
    fields.forEach((field) => {
      init[field.key] = initialValues[field.key] || '';
    });
    setValues(init);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [fields, initialValues, isOpen]);

  
  const requiredFields = fields.filter((f) => f.required !== false);
  const filledRequired = requiredFields.filter(
    (f) => values[f.key] && String(values[f.key]).trim().length > 0
  );
  const progress = requiredFields.length > 0
    ? Math.round((filledRequired.length / requiredFields.length) * 100)
    : 100;

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleBlur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    
    const field = fields.find((f) => f.key === key);
    if (field?.required !== false && (!values[key] || !String(values[key]).trim())) {
      setErrors((prev) => ({ ...prev, [key]: text.fieldRequired }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      if (field.required !== false) {
        const val = values[field.key];
        if (!val || !String(val).trim()) {
          newErrors[field.key] = text.fieldRequired;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    
    const allTouched = {};
    fields.forEach((f) => (allTouched[f.key] = true));
    setTouched(allTouched);

    return isValid;
  };

  
  const handleAutoFill = async () => {
    setIsAutoFilling(true);
    try {
      const result = await fileService.autoFillFields(templateTitle, fields);
      if (result?.values && typeof result.values === 'object') {
        setValues(prev => ({ ...prev, ...result.values }));
        
        setErrors(prev => {
          const cleared = { ...prev };
          Object.keys(result.values).forEach(k => { cleared[k] = null; });
          return cleared;
        });
        toast({
          title: result.fallback ? 'Auto-fill (sample data)' : 'Auto-filled with AI',
          description: result.fallback
            ? 'LLM unavailable — used sample values. Please review and update.'
            : 'Fields filled with AI-generated test values. Please review before submitting.',
          status: result.fallback ? 'warning' : 'success',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Auto-fill failed',
        description: err.message || 'Could not generate values. Please fill manually.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = async () => {
    console.log('🔵 [DocumentFieldsModal] handleSubmit called', { progress, isSubmitting, allowPartial });
    
    if (!allowPartial && !validateAll()) {
      console.log('⚠️ [DocumentFieldsModal] Validation failed (strict mode)');
      return;
    }

    
    
    if (allowPartial && progress < 100) {
      validateAll();
      console.log('⚠️ [DocumentFieldsModal] Partial completion — prompting confirmation');
      onPartialOpen();
      return;
    }

    console.log('✅ [DocumentFieldsModal] Validation passed, submitting...');
    await doSubmit();
  };

  const doSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      console.log('✅ [DocumentFieldsModal] onSubmit completed successfully');
    } catch (error) {
      console.error('❌ [DocumentFieldsModal] Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
      console.log('🔓 [DocumentFieldsModal] isSubmitting reset to false');
    }
  };

  const handleConfirmPartial = async () => {
    console.log('✅ [DocumentFieldsModal] User confirmed partial submit');
    onPartialClose();
    await doSubmit();
  };
  
  
  const handleCancelClick = () => {
    console.log('🔵 [DocumentFieldsModal] Cancel button clicked');
    onConfirmOpen();
  };
  
  
  const handleConfirmCancel = () => {
    console.log('🔵 [DocumentFieldsModal] Cancel confirmed - returning to main menu');
    onConfirmClose();
    
    onClose(null, true);
  };
  
  
  const handleXClose = () => {
    console.log('🔵 [DocumentFieldsModal] X button clicked', { isEditMode });
    
    if (isEditMode) {
      
      onConfirmOpen();
    } else {
      
      console.log('💾 [DocumentFieldsModal] Saving partial data and closing (initial fill)');
      onClose(values, false);
    }
  };

  const renderField = (field) => {
    const { key, label, type, required, example, description } = field;
    const isRequired = required !== false;
    const hasError = touched[key] && errors[key];
    const value = values[key] || '';

    
    let inputElement;

    if (type === 'date') {
      inputElement = (
        <Input
          type="date"
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          onBlur={() => handleBlur(key)}
          bg={inputBg}
          borderColor={hasError ? 'red.500' : borderColor}
        />
      );
    } else if (type === 'textarea' || type === 'string_list' || (label && label.toLowerCase().includes('address'))) {
      inputElement = (
        <Textarea
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          onBlur={() => handleBlur(key)}
          placeholder={example ? `${text.example}: ${example}` : ''}
          bg={inputBg}
          borderColor={hasError ? 'red.500' : borderColor}
          rows={3}
        />
      );
    } else if (type === 'select' && field.options) {
      inputElement = (
        <Select
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          onBlur={() => handleBlur(key)}
          bg={inputBg}
          borderColor={hasError ? 'red.500' : borderColor}
        >
          <option value="">-- Select --</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      );
    } else {
      inputElement = (
        <Input
          type="text"
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          onBlur={() => handleBlur(key)}
          placeholder={example ? `${text.example}: ${example}` : ''}
          bg={inputBg}
          borderColor={hasError ? 'red.500' : borderColor}
        />
      );
    }

    return (
      <FormControl key={key} isInvalid={hasError} isRequired={isRequired}>
        <FormLabel color={labelColor} fontSize="sm" mb={1}>
          <HStack spacing={2}>
            <Text>{label || key}</Text>
            <Badge
              colorScheme={isRequired ? 'red' : 'gray'}
              fontSize="xs"
              variant="subtle"
            >
              {isRequired ? text.required : text.optional}
            </Badge>
          </HStack>
        </FormLabel>
        {description && (
          <Text fontSize="xs" color="gray.500" mb={1}>
            {description}
          </Text>
        )}
        {inputElement}
        {hasError && <FormErrorMessage>{errors[key]}</FormErrorMessage>}
      </FormControl>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      scrollBehavior="inside"
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg={bgColor} maxW="800px">
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaFileAlt} color="blue.500" />
            <VStack align="start" spacing={0}>
              <Text fontSize="lg">{text.fillDetails}</Text>
              <Text fontSize="sm" fontWeight="normal" color="gray.500">
                {templateTitle}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton onClick={handleXClose} />

        <Box px={6} pb={2}>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.500">
              {text.progress}: {filledRequired.length}/{requiredFields.length} {text.fieldsCompleted}
            </Text>
            <HStack>
              {progress === 100 ? (
                <Icon as={FaCheck} color="green.500" />
              ) : (
                <Icon as={FaExclamationCircle} color="orange.400" />
              )}
              <Text fontSize="sm" fontWeight="bold" color={progress === 100 ? 'green.500' : 'orange.400'}>
                {progress}%
              </Text>
            </HStack>
          </HStack>
          <Progress
            value={progress}
            size="sm"
            colorScheme={progress === 100 ? 'green' : 'blue'}
            borderRadius="full"
            bg={progressBg}
          />
        </Box>

        <Divider />

        <ModalBody py={4}>
          {fieldSource && (
            <Alert
              status={fieldSource === 'template' ? 'success' : fieldSource === 'smart_extracted' ? 'info' : fieldSource === 'ai' ? 'warning' : 'info'}
              borderRadius="lg"
              mb={4}
              fontSize="sm"
              py={2}
            >
              <AlertIcon boxSize={4} />
              <HStack spacing={2}>
                <Icon as={fieldSource === 'template' ? FaDatabase : fieldSource === 'smart_extracted' ? FaEdit : fieldSource === 'ai' ? FaRobot : FaUpload} />
                <Text>
                  {fieldSource === 'template'
                    ? 'Fields from curated template — high accuracy'
                    : fieldSource === 'smart_extracted'
                    ? 'Detected fields from your document — edit any value to replace it throughout'
                    : fieldSource === 'ai'
                    ? 'AI-detected fields — please review carefully'
                    : 'Fields from uploaded JSON'}
                </Text>
              </HStack>
            </Alert>
          )}
          {fieldSource === 'smart_extracted' ? (() => {
            const CATEGORY_LABELS = {
              parties: 'Parties & Advocates',
              court_details: 'Court & Case Details',
              personal_details: 'Personal Details',
              financial_property: 'Financial & Property',
              dates: 'Dates & Timeline',
              sections_acts: 'Sections & Acts',
              other: 'Other Fields',
            };
            const grouped = {};
            fields.forEach(f => {
              const cat = f.category || 'other';
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push(f);
            });
            const categories = Object.keys(grouped);
            return (
              <Accordion allowMultiple defaultIndex={categories.map((_, i) => i)}>
                {categories.map(cat => (
                  <AccordionItem key={cat} border="none" mb={2}>
                    <AccordionButton
                      bg={accordionBg}
                      borderRadius="md"
                      _hover={{ bg: accordionHoverBg }}
                    >
                      <Box flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">
                        {CATEGORY_LABELS[cat] || cat}
                        <Badge ml={2} colorScheme="blue" fontSize="2xs">{grouped[cat].length}</Badge>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={3} pt={2}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {grouped[cat].map(field => renderField(field))}
                      </SimpleGrid>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            );
          })() : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {fields.map((field) => renderField(field))}
            </SimpleGrid>
          )}
        </ModalBody>

        <Divider />

        <ModalFooter>
          <HStack spacing={3} w="100%" justify="space-between">
            <Tooltip label="Auto-fill all fields with AI-generated test values" placement="top">
              <Button
                leftIcon={<Icon as={FaMagic} />}
                variant="outline"
                colorScheme="purple"
                size="sm"
                onClick={handleAutoFill}
                isLoading={isAutoFilling}
                loadingText="Filling..."
                isDisabled={isSubmitting || fields.length === 0}
              >
                Auto-fill
              </Button>
            </Tooltip>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleCancelClick} isDisabled={isSubmitting || isAutoFilling}>
                {text.cancel}
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText={language === 'hi' ? 'बना रहा है...' : 'Generating...'}
                isDisabled={allowPartial ? false : progress < 100}
              >
                {text.submit}
                {allowPartial && progress < 100 && (
                  <Badge ml={2} colorScheme="orange" fontSize="2xs">Partial</Badge>
                )}
              </Button>
            </HStack>
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
              {text.cancelConfirmTitle}
            </AlertDialogHeader>

            <AlertDialogBody>
              {text.cancelConfirmBody}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onConfirmClose}>
                {text.cancelConfirmNo}
              </Button>
              <Button colorScheme="red" onClick={handleConfirmCancel} ml={3}>
                {text.cancelConfirmYes}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isPartialOpen}
        leastDestructiveRef={partialRef}
        onClose={onPartialClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Some Required Fields Are Empty
            </AlertDialogHeader>
            <AlertDialogBody>
              {requiredFields.length - filledRequired.length} required field(s) are still empty.
              You can proceed to the editor and fill them manually, or go back to complete them now.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={partialRef} onClick={onPartialClose}>
                Go Back &amp; Fill
              </Button>
              <Button colorScheme="orange" onClick={handleConfirmPartial} ml={3}>
                Proceed to Editor Anyway
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Modal>
  );
};

export default DocumentFieldsModal;
