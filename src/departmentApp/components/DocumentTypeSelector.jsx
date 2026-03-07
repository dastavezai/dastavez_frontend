import React, { useState } from 'react';
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
  Radio,
  RadioGroup,
  Input,
  Textarea,
  useColorModeValue,
  Icon,
  Progress,
  Badge,
} from '@chakra-ui/react';
import { FaFileContract, FaGavel, FaHome, FaUsers, FaMoneyBill, FaBook, FaBriefcase, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const DocumentTypeSelector = ({ isOpen, onClose, onSelectDocumentType, language = 'en' }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    documentType: '',
    specificDetails: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const activeBg = useColorModeValue('blue.50', 'blue.900');

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  
  const documentCategories = {
    'agreements': {
      icon: FaFileContract,
      labelEn: 'Agreements & Contracts',
      labelHi: 'समझौते और अनुबंध',
      descEn: 'Rent, sale, partnership, employment contracts',
      descHi: 'किराया, बिक्री, साझेदारी, रोजगार अनुबंध',
      documents: [
        { nameEn: 'Rent/Lease Agreement', nameHi: 'किराया/लीज़ समझौता' },
        { nameEn: 'Sale Agreement', nameHi: 'बिक्री समझौता' },
        { nameEn: 'Partnership Deed', nameHi: 'साझेदारी विलेख' },
        { nameEn: 'Employment Contract', nameHi: 'रोजगार अनुबंध' },
        { nameEn: 'Service Agreement', nameHi: 'सेवा समझौता' },
        { nameEn: 'Loan Agreement', nameHi: 'ऋण समझौता' },
        { nameEn: 'MOU / NDA', nameHi: 'एमओयू / गोपनीयता समझौता' },
      ]
    },
    'property': {
      icon: FaHome,
      labelEn: 'Property & Real Estate',
      labelHi: 'संपत्ति और अचल संपदा',
      descEn: 'Sale deed, gift deed, will, power of attorney',
      descHi: 'बिक्री विलेख, उपहार विलेख, वसीयत, मुख्तारनामा',
      documents: [
        { nameEn: 'Sale Deed', nameHi: 'बिक्री विलेख' },
        { nameEn: 'Gift Deed', nameHi: 'उपहार विलेख' },
        { nameEn: 'Will / Testament', nameHi: 'वसीयत' },
        { nameEn: 'Power of Attorney', nameHi: 'मुख्तारनामा' },
        { nameEn: 'Relinquishment Deed', nameHi: 'त्याग पत्र' },
        { nameEn: 'Partition Deed', nameHi: 'विभाजन विलेख' },
      ]
    },
    'family': {
      icon: FaUsers,
      labelEn: 'Family & Personal',
      labelHi: 'परिवार और व्यक्तिगत',
      descEn: 'Divorce, adoption, affidavit, maintenance',
      descHi: 'तलाक, गोद लेना, शपथ पत्र, भरण-पोषण',
      documents: [
        { nameEn: 'Divorce Petition', nameHi: 'तलाक याचिका' },
        { nameEn: 'Maintenance Application', nameHi: 'भरण-पोषण आवेदन' },
        { nameEn: 'Adoption Deed', nameHi: 'गोद लेने का विलेख' },
        { nameEn: 'Affidavit (General)', nameHi: 'शपथ पत्र (सामान्य)' },
        { nameEn: 'Name Change Affidavit', nameHi: 'नाम परिवर्तन शपथ पत्र' },
        { nameEn: 'Guardianship Application', nameHi: 'संरक्षकता आवेदन' },
      ]
    },
    'notices': {
      icon: FaGavel,
      labelEn: 'Legal Notices & Complaints',
      labelHi: 'कानूनी नोटिस और शिकायतें',
      descEn: 'Legal notice, police complaint, consumer complaint',
      descHi: 'कानूनी नोटिस, पुलिस शिकायत, उपभोक्ता शिकायत',
      documents: [
        { nameEn: 'Legal Notice', nameHi: 'कानूनी नोटिस' },
        { nameEn: 'Cheque Bounce Notice (Section 138)', nameHi: 'चेक बाउंस नोटिस (धारा 138)' },
        { nameEn: 'Consumer Complaint', nameHi: 'उपभोक्ता शिकायत' },
        { nameEn: 'FIR / Police Complaint', nameHi: 'एफआईआर / पुलिस शिकायत' },
        { nameEn: 'Defamation Notice', nameHi: 'मानहानि नोटिस' },
        { nameEn: 'RTI Application', nameHi: 'आरटीआई आवेदन' },
      ]
    },
    'court': {
      icon: FaBook,
      labelEn: 'Court Applications',
      labelHi: 'कोर्ट आवेदन',
      descEn: 'Bail, writ petition, appeal, SLP',
      descHi: 'जमानत, रिट याचिका, अपील, एसएलपी',
      documents: [
        { nameEn: 'Bail Application', nameHi: 'जमानत आवेदन' },
        { nameEn: 'Anticipatory Bail', nameHi: 'अग्रिम जमानत' },
        { nameEn: 'Writ Petition', nameHi: 'रिट याचिका' },
        { nameEn: 'Appeal / Revision', nameHi: 'अपील / पुनरीक्षण' },
        { nameEn: 'SLP (Special Leave Petition)', nameHi: 'विशेष अनुमति याचिका' },
        { nameEn: 'Caveat', nameHi: 'चेतावनी' },
      ]
    },
    'business': {
      icon: FaBriefcase,
      labelEn: 'Business & Commerce',
      labelHi: 'व्यापार और वाणिज्य',
      descEn: 'Company, GST, trademark, franchise',
      descHi: 'कंपनी, जीएसटी, ट्रेडमार्क, फ्रेंचाइजी',
      documents: [
        { nameEn: 'Company Incorporation', nameHi: 'कंपनी निगमन' },
        { nameEn: 'GST Registration', nameHi: 'जीएसटी पंजीकरण' },
        { nameEn: 'Trademark Application', nameHi: 'ट्रेडमार्क आवेदन' },
        { nameEn: 'Franchise Agreement', nameHi: 'फ्रेंचाइजी समझौता' },
        { nameEn: 'Shareholder Agreement', nameHi: 'शेयरधारक समझौता' },
      ]
    },
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const selectedCat = documentCategories[formData.category];
    const docName = formData.documentType;
    
    onSelectDocumentType(docName, formData.category);
    handleReset();
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
      category: '',
      documentType: '',
      specificDetails: '',
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canProceed = () => {
    if (step === 1) return formData.category !== '';
    if (step === 2) return formData.documentType !== '';
    return false;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium" fontSize="lg">
              {language === 'hi' 
                ? '1️⃣ आपको किस प्रकार का दस्तावेज़ चाहिए?'
                : '1️⃣ What type of document do you need?'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {language === 'hi' 
                ? 'कृपया एक श्रेणी चुनें'
                : 'Please select a category'}
            </Text>
            
            <RadioGroup 
              value={formData.category} 
              onChange={(val) => setFormData({ ...formData, category: val })}
            >
              <VStack spacing={3} align="stretch">
                {Object.keys(documentCategories).map(catKey => {
                  const cat = documentCategories[catKey];
                  return (
                    <Box
                      key={catKey}
                      p={4}
                      borderWidth={2}
                      borderColor={formData.category === catKey ? 'blue.500' : borderColor}
                      borderRadius="lg"
                      bg={formData.category === catKey ? activeBg : 'transparent'}
                      cursor="pointer"
                      _hover={{ borderColor: 'blue.300', bg: activeBg }}
                      transition="all 0.2s"
                      onClick={() => setFormData({ ...formData, category: catKey })}
                    >
                      <HStack spacing={3}>
                        <Icon as={cat.icon} boxSize={6} color="blue.500" />
                        <VStack align="start" spacing={0} flex={1}>
                          <Radio value={catKey} colorScheme="blue">
                            <Text fontWeight="semibold">
                              {language === 'hi' ? cat.labelHi : cat.labelEn}
                            </Text>
                          </Radio>
                          <Text fontSize="xs" color="gray.500" ml={6}>
                            {language === 'hi' ? cat.descHi : cat.descEn}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </RadioGroup>
          </VStack>
        );

      case 2:
        const selectedCat = documentCategories[formData.category];
        if (!selectedCat) return null;

        return (
          <VStack spacing={4} align="stretch">
            <HStack>
              <Badge colorScheme="blue" fontSize="sm">
                {language === 'hi' ? selectedCat.labelHi : selectedCat.labelEn}
              </Badge>
            </HStack>

            <Text fontWeight="medium" fontSize="lg">
              {language === 'hi' 
                ? '2️⃣ कौन सा विशिष्ट दस्तावेज़ बनाना है?'
                : '2️⃣ Which specific document would you like to create?'}
            </Text>
            
            <RadioGroup 
              value={formData.documentType} 
              onChange={(val) => setFormData({ ...formData, documentType: val })}
            >
              <VStack spacing={2} align="stretch">
                {selectedCat.documents.map((doc, idx) => {
                  const docName = language === 'hi' ? doc.nameHi : doc.nameEn;
                  return (
                    <Box
                      key={idx}
                      p={3}
                      borderWidth={2}
                      borderColor={formData.documentType === docName ? 'blue.500' : borderColor}
                      borderRadius="md"
                      bg={formData.documentType === docName ? activeBg : 'transparent'}
                      cursor="pointer"
                      _hover={{ borderColor: 'blue.300', bg: activeBg }}
                      transition="all 0.2s"
                      onClick={() => setFormData({ ...formData, documentType: docName })}
                    >
                      <Radio value={docName} colorScheme="blue">
                        <Text fontSize="sm" fontWeight="medium">
                          {docName}
                        </Text>
                      </Radio>
                    </Box>
                  );
                })}
              </VStack>
            </RadioGroup>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <Text fontSize="xl" fontWeight="bold">
              {language === 'hi' ? '📝 दस्तावेज़ बनाएं' : '📝 Create Document'}
            </Text>
            <Text fontSize="sm" fontWeight="normal" color="gray.500">
              {language === 'hi' 
                ? 'कुछ सवालों के जवाब दें, और हम सही दस्तावेज़ बनाएंगे'
                : 'Answer a few questions and we\'ll create the right document for you'}
            </Text>
          </VStack>
          <Box mt={3}>
            <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" />
          </Box>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {renderStep()}
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3} w="100%" justify="space-between">
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={handleBack}
              isDisabled={step === 1}
            >
              {language === 'hi' ? 'पीछे' : 'Back'}
            </Button>
            
            <HStack>
              <Button variant="ghost" onClick={handleClose}>
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button
                rightIcon={step === totalSteps ? null : <FaArrowRight />}
                colorScheme="blue"
                onClick={handleNext}
                isDisabled={!canProceed()}
              >
                {step === totalSteps 
                  ? (language === 'hi' ? '✅ बनाएं' : '✅ Create')
                  : (language === 'hi' ? 'अगला' : 'Next')}
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DocumentTypeSelector;
