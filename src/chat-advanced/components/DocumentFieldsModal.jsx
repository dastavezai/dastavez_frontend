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
} from '@chakra-ui/react';
import { FaFileAlt, FaCheck, FaExclamationCircle } from 'react-icons/fa';

/**
 * DocumentFieldsModal - Form-based UI for collecting document fields
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onSubmit: function(fieldValues) - called when user submits all fields
 * - templateTitle: string - display title of the template
 * - fields: array of { key, label, type, required, example, description }
 * - initialValues: object - pre-filled values (optional)
 * - language: 'en' | 'hi' - UI language preference
 * - isEditMode: boolean - whether we're editing existing doc (changes UI text)
 */
const DocumentFieldsModal = ({
  isOpen,
  onClose,
  onSubmit,
  templateTitle,
  fields = [],
  initialValues = {},
  language = 'en',
  isEditMode = false,
}) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const cancelRef = React.useRef();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const inputBg = useColorModeValue('white', 'gray.700');
  const progressBg = useColorModeValue('gray.100', 'gray.700');

  // Translations
  const t = {
    en: {
      fillDetails: isEditMode ? 'Edit Document Details' : 'Fill Document Details',
      required: 'Required',
      optional: 'Optional',
      submit: isEditMode ? 'Update & Regenerate' : 'Generate Document',
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

  // Initialize values from initialValues or empty
  useEffect(() => {
    const init = {};
    fields.forEach((field) => {
      init[field.key] = initialValues[field.key] || '';
    });
    setValues(init);
    setErrors({});
    setTouched({});
    setIsSubmitting(false); // Reset loading state when modal opens/reopens
  }, [fields, initialValues, isOpen]);

  // Calculate progress
  const requiredFields = fields.filter((f) => f.required !== false);
  const filledRequired = requiredFields.filter(
    (f) => values[f.key] && String(values[f.key]).trim().length > 0
  );
  const progress = requiredFields.length > 0
    ? Math.round((filledRequired.length / requiredFields.length) * 100)
    : 100;

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleBlur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    // Validate on blur
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
    // Mark all as touched
    const allTouched = {};
    fields.forEach((f) => (allTouched[f.key] = true));
    setTouched(allTouched);

    return isValid;
  };

  const handleSubmit = async () => {
    console.log('🔵 [DocumentFieldsModal] handleSubmit called', { progress, isSubmitting });
    
    if (!validateAll()) {
      console.log('⚠️ [DocumentFieldsModal] Validation failed');
      return;
    }

    console.log('✅ [DocumentFieldsModal] Validation passed, submitting...');
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      console.log('✅ [DocumentFieldsModal] onSubmit completed successfully');
    } catch (error) {
      console.error('❌ [DocumentFieldsModal] Error submitting form:', error);
    } finally {
      // Always reset loading state after submission completes (success or error)
      setIsSubmitting(false);
      console.log('🔓 [DocumentFieldsModal] isSubmitting reset to false');
    }
  };
  
  // 🆕 Handle Cancel button click - show confirmation dialog
  const handleCancelClick = () => {
    console.log('🔵 [DocumentFieldsModal] Cancel button clicked');
    onConfirmOpen();
  };
  
  // 🆕 Confirm cancellation - close modal and return to main menu
  const handleConfirmCancel = () => {
    console.log('🔵 [DocumentFieldsModal] Cancel confirmed - returning to main menu');
    onConfirmClose();
    // Pass null to indicate cancellation (not partial save)
    onClose(null, true); // true = cancelled
  };
  
  // 🆕 Handle X close button - smart behavior based on mode
  const handleXClose = () => {
    console.log('🔵 [DocumentFieldsModal] X button clicked', { isEditMode });
    
    if (isEditMode) {
      // During edit, show confirmation (don't lose changes)
      onConfirmOpen();
    } else {
      // During initial fill, save partial data and close silently
      console.log('💾 [DocumentFieldsModal] Saving partial data and closing (initial fill)');
      onClose(values, false); // false = not cancelled, just pausing
    }
  };

  const renderField = (field) => {
    const { key, label, type, required, example, description } = field;
    const isRequired = required !== false;
    const hasError = touched[key] && errors[key];
    const value = values[key] || '';

    // Determine input type based on schema type
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
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {fields.map((field) => renderField(field))}
          </SimpleGrid>
        </ModalBody>

        <Divider />

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleCancelClick} isDisabled={isSubmitting}>
              {text.cancel}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText={language === 'hi' ? 'बना रहा है...' : 'Generating...'}
              isDisabled={progress < 100}
            >
              {text.submit}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
      
      {/* Cancel Confirmation Dialog */}
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
    </Modal>
  );
};

export default DocumentFieldsModal;
