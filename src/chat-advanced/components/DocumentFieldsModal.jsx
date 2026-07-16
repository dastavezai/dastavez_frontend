import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
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
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Icon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Flex,
  Circle,
} from "@chakra-ui/react";
import { FaCheck, FaExclamationCircle } from "react-icons/fa";
import { FiZap, FiFileText, FiAlertCircle } from "react-icons/fi";

const DocumentFieldsModal = ({
  isOpen,
  onClose,
  onSubmit,
  templateTitle,
  fields = [],
  initialValues = {},
  language = "en",
  isEditMode = false,
  summaryBox = null,
}) => {
  const [values, setValues]             = useState({});
  const [errors, setErrors]             = useState({});
  const [touched, setTouched]           = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const cancelRef = React.useRef();

  // --- All hooks at top level (no inline hook calls in JSX) ---
  const overlayBg          = useColorModeValue("blackAlpha.700",              "blackAlpha.800");
  const modalBg            = useColorModeValue("white",                       "rgba(13,15,28,0.98)");
  const cardBg             = useColorModeValue("gray.50",                     "rgba(255,255,255,0.03)");
  const cardBorder         = useColorModeValue("gray.200",                    "rgba(100,120,255,0.14)");
  const inputBg            = useColorModeValue("white",                       "rgba(255,255,255,0.06)");
  const inputBorder        = useColorModeValue("gray.300",                    "rgba(100,120,255,0.3)");
  const inputFocus         = useColorModeValue("blue.500",                    "#7c7fff");
  const labelColor         = useColorModeValue("gray.700",                    "gray.300");
  const mutedText          = useColorModeValue("gray.500",                    "gray.500");
  const footerBg           = useColorModeValue("gray.50",                     "rgba(0,0,0,0.25)");
  const borderColor        = useColorModeValue("gray.200",                    "rgba(100,120,255,0.15)");
  const focusShadow        = useColorModeValue("0 0 0 3px rgba(100,130,255,0.15)", "0 0 0 3px rgba(120,120,255,0.18)");
  const summaryBg          = useColorModeValue("blue.50",                     "rgba(50,60,130,0.25)");
  const cancelHoverBg      = useColorModeValue("red.50",                      "rgba(220,50,50,0.12)");

  // Translations
  const isEn = language !== "hi";
  const tx = {
    fillDetails:       isEditMode ? (isEn ? "Edit Document Details"           : "Edit Document Details")         : (isEn ? "Fill Document Details"     : "Fill Document Details"),
    subtitle:          isEditMode ? (isEn ? "Update fields and regenerate"    : "Update fields and regenerate")  : (isEn ? "Complete required fields to generate your document" : "Complete required fields to generate your document"),
    required:          isEn ? "Required"          : "Required",
    optional:          isEn ? "Optional"          : "Optional",
    submit:            isEditMode ? (isEn ? "Update & Regenerate" : "Update & Regenerate") : (isEn ? "Generate Document" : "Generate Document"),
    cancel:            isEn ? "Cancel"            : "Cancel",
    fieldRequired:     isEn ? "This field is required" : "This field is required",
    example:           isEn ? "e.g."              : "e.g.",
    cancelConfirmTitle: isEn ? "Cancel Draft Flow?" : "Cancel Draft Flow?",
    cancelConfirmBody:  isEn ? "This will cancel the entire draft process and return to the main menu. All filled data will be lost." : "This will cancel the entire draft process. All filled data will be lost.",
    cancelConfirmYes:   isEn ? "Yes, Cancel"      : "Yes, Cancel",
    cancelConfirmNo:    isEn ? "No, Continue"     : "No, Continue",
  };

  // Init
  useEffect(() => {
    const init = {};
    fields.forEach((f) => { init[f.key] = initialValues[f.key] || ""; });
    setValues(init);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [fields, initialValues, isOpen]);

  // Progress
  const requiredFields = fields.filter((f) => f.required !== false);
  const filledRequired = requiredFields.filter((f) => values[f.key] && String(values[f.key]).trim().length > 0);
  const progress       = requiredFields.length > 0
    ? Math.round((filledRequired.length / requiredFields.length) * 100)
    : 100;
  const isComplete = progress === 100;

  // Handlers
  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleBlur = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const field = fields.find((f) => f.key === key);
    if (field?.required !== false && (!values[key] || !String(values[key]).trim())) {
      setErrors((prev) => ({ ...prev, [key]: tx.fieldRequired }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    let valid = true;
    fields.forEach((f) => {
      if (f.required !== false && (!values[f.key] || !String(values[f.key]).trim())) {
        newErrors[f.key] = tx.fieldRequired;
        valid = false;
      }
    });
    setErrors(newErrors);
    const allT = {};
    fields.forEach((f) => (allT[f.key] = true));
    setTouched(allT);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setIsSubmitting(true);
    try { await onSubmit(values); }
    catch (e) { console.error("[DocumentFieldsModal]", e); }
    finally   { setIsSubmitting(false); }
  };

  const handleCancelClick   = () => onConfirmOpen();
  const handleConfirmCancel = () => { onConfirmClose(); onClose(null, true); };
  const handleXClose = () => {
    if (isEditMode) onConfirmOpen();
    else            onClose(values, false);
  };

  // Field renderer
  const renderField = (field) => {
    const { key, label, type, required, example, description } = field;
    const isRequired = required !== false;
    const hasError   = touched[key] && errors[key];
    const value      = values[key] || "";

    const baseProps = {
      value,
      onChange: (e) => handleChange(key, e.target.value),
      onBlur:   () => handleBlur(key),
      placeholder: example ? `${tx.example} ${example}` : "",
      bg:          inputBg,
      borderColor: hasError ? "red.400" : inputBorder,
      borderWidth: "1.5px",
      borderRadius: "lg",
      fontSize:    "sm",
      transition:  "all 0.2s",
      _hover:  { borderColor: hasError ? "red.400" : inputFocus },
      _focus:  { borderColor: inputFocus, boxShadow: focusShadow, bg: inputBg },
    };

    let inputEl;
    if (type === "date") {
      inputEl = <Input type="date" {...baseProps} placeholder="" />;
    } else if (type === "textarea" || type === "string_list" || label?.toLowerCase().includes("address")) {
      inputEl = <Textarea {...baseProps} rows={3} resize="vertical" />;
    } else if (type === "select" && field.options) {
      inputEl = (
        <Select {...baseProps} placeholder="-- Select --">
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      );
    } else {
      inputEl = <Input type="text" {...baseProps} />;
    }

    return (
      <FormControl key={key} isInvalid={!!hasError} isRequired={isRequired}>
        <FormLabel mb={1.5}>
          <HStack spacing={2} align="center">
            <Text fontSize="sm" fontWeight="600" color={labelColor}>{label || key}</Text>
            <Badge
              fontSize="9px" px={1.5} py={0.5} borderRadius="full"
              colorScheme={isRequired ? "red" : "gray"} variant="subtle"
            >
              {isRequired ? tx.required : tx.optional}
            </Badge>
          </HStack>
        </FormLabel>
        {description && (
          <Text fontSize="xs" color={mutedText} mb={1.5} lineHeight="1.5">{description}</Text>
        )}
        {inputEl}
        {hasError && (
          <FormErrorMessage fontSize="xs" mt={1}>
            <Icon as={FiAlertCircle} mr={1} />{errors[key]}
          </FormErrorMessage>
        )}
      </FormControl>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleXClose}
        size="xl"
        scrollBehavior="inside"
        closeOnOverlayClick={false}
        motionPreset="slideInBottom"
        isCentered
      >
        <ModalOverlay bg={overlayBg} backdropFilter="blur(10px)" />

        <ModalContent
          bg={modalBg}
          maxW="820px"
          borderRadius="2xl"
          overflow="hidden"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 30px 80px rgba(0,0,0,0.45)"
          mx={4}
          my={6}
        >
          <ModalCloseButton
            top={4} right={4} color="white" zIndex={10}
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={handleXClose}
          />

          {/* Gradient Header */}
          <Box
            bgGradient="linear(135deg, #1a237e 0%, #283593 55%, #3949ab 100%)"
            px={8} pt={8} pb={6}
            position="relative"
            overflow="hidden"
          >
            <Circle size="140px" bg="whiteAlpha.50" position="absolute" top="-40px" right="-40px" />
            <Circle size="70px"  bg="whiteAlpha.50" position="absolute" top="12px"  right="70px" />
            <Circle size="40px"  bg="whiteAlpha.30" position="absolute" bottom="-10px" left="40px" />

            <HStack spacing={4} align="flex-start" position="relative" zIndex={1}>
              <Box
                p={3} borderRadius="xl"
                bg="whiteAlpha.200" backdropFilter="blur(12px)"
                border="1px solid" borderColor="whiteAlpha.300"
              >
                <Icon as={FiFileText} color="white" boxSize={6} />
              </Box>
              <VStack align="start" spacing={0.5} flex={1}>
                <Text fontSize="xl" fontWeight="700" color="white" letterSpacing="-0.3px">
                  {tx.fillDetails}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.800" fontWeight="500">{templateTitle}</Text>
                <Text fontSize="xs" color="whiteAlpha.600" mt={1}>{tx.subtitle}</Text>
              </VStack>
            </HStack>

            {/* Live progress bar */}
            <Box mt={5} position="relative" zIndex={1}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" color="whiteAlpha.700" fontWeight="500">
                  {filledRequired.length} / {requiredFields.length} required fields
                </Text>
                <HStack spacing={1}>
                  <Icon
                    as={isComplete ? FaCheck : FaExclamationCircle}
                    color={isComplete ? "#86efac" : "#fbbf24"}
                    boxSize={3}
                  />
                  <Text fontSize="xs" fontWeight="700" color={isComplete ? "#86efac" : "#fbbf24"}>
                    {progress}%
                  </Text>
                </HStack>
              </HStack>
              <Box h="6px" bg="whiteAlpha.200" borderRadius="full" overflow="hidden">
                <Box
                  h="full"
                  w={`${progress}%`}
                  bgGradient={isComplete ? "linear(to-r, #4ade80, #86efac)" : "linear(to-r, #818cf8, #a78bfa)"}
                  borderRadius="full"
                  transition="width 0.4s cubic-bezier(0.4,0,0.2,1)"
                />
              </Box>
            </Box>
          </Box>

          {/* Body */}
          <Box overflowY="auto" maxH="52vh" px={8} py={6}>
            {summaryBox && (
              <Box
                mb={6} p={4} borderRadius="xl"
                bg={summaryBg}
                borderLeft="4px solid" borderLeftColor="blue.400"
              >
                <HStack mb={2} color="blue.400" spacing={2}>
                  <Icon as={FiFileText} boxSize={3.5} />
                  <Text fontWeight="700" fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                    Document Summary
                  </Text>
                </HStack>
                <Text fontSize="sm" color={labelColor} whiteSpace="pre-wrap" lineHeight="1.7">
                  {summaryBox}
                </Text>
              </Box>
            )}

            {fields.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {fields.map((field) => (
                  <Box
                    key={field.key}
                    p={4} bg={cardBg} borderRadius="xl"
                    border="1.5px solid" borderColor={cardBorder}
                    transition="all 0.2s"
                    _hover={{ borderColor: inputFocus, boxShadow: "0 4px 16px rgba(108,111,255,0.10)" }}
                  >
                    {renderField(field)}
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Flex direction="column" align="center" justify="center" py={14} color={mutedText}>
                <Icon as={FiFileText} boxSize={10} mb={3} opacity={0.2} />
                <Text fontSize="sm">No fields required for this template.</Text>
              </Flex>
            )}
          </Box>

          {/* Footer */}
          <Box
            px={8} py={5}
            borderTop="1px solid" borderColor={borderColor}
            bg={footerBg}
          >
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" color={mutedText}>
                {isComplete
                  ? "All required fields filled"
                  : `${requiredFields.length - filledRequired.length} required field(s) remaining`}
              </Text>

              <HStack spacing={3}>
                <Button
                  variant="ghost" size="sm"
                  onClick={handleCancelClick}
                  isDisabled={isSubmitting}
                  _hover={{ bg: cancelHoverBg, color: "red.400" }}
                  transition="all 0.2s"
                >
                  {tx.cancel}
                </Button>

                <Button
                  size="sm"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Generating..."
                  isDisabled={!isComplete}
                  leftIcon={<Icon as={FiZap} />}
                  bgGradient={isComplete ? "linear(to-r, #3949ab, #7c7fff)" : undefined}
                  colorScheme={isComplete ? undefined : "gray"}
                  color={isComplete ? "white" : undefined}
                  fontWeight="600"
                  px={6}
                  borderRadius="lg"
                  boxShadow={isComplete ? "0 4px 16px rgba(108,111,255,0.35)" : "none"}
                  _hover={isComplete ? {
                    bgGradient: "linear(to-r, #283593, #6060ee)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 20px rgba(108,111,255,0.45)",
                  } : {}}
                  _active={isComplete ? { transform: "translateY(0px)" } : {}}
                  transition="all 0.2s"
                >
                  {tx.submit}
                </Button>
              </HStack>
            </Flex>
          </Box>
        </ModalContent>
      </Modal>

      {/* Cancel Confirmation */}
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onConfirmClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(6px)">
          <AlertDialogContent
            borderRadius="xl" bg={modalBg}
            border="1px solid" borderColor={borderColor}
            boxShadow="0 20px 50px rgba(0,0,0,0.4)"
          >
            <AlertDialogHeader
              fontSize="md" fontWeight="700"
              borderBottom="1px solid" borderColor={borderColor} pb={3}
            >
              {tx.cancelConfirmTitle}
            </AlertDialogHeader>
            <AlertDialogBody py={4} fontSize="sm" color={labelColor} lineHeight="1.7">
              {tx.cancelConfirmBody}
            </AlertDialogBody>
            <AlertDialogFooter gap={3} borderTop="1px solid" borderColor={borderColor} pt={4}>
              <Button ref={cancelRef} variant="ghost" size="sm" onClick={onConfirmClose}>
                {tx.cancelConfirmNo}
              </Button>
              <Button colorScheme="red" size="sm" onClick={handleConfirmCancel} fontWeight="600">
                {tx.cancelConfirmYes}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DocumentFieldsModal;