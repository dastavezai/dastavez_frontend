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
  Textarea,
  Radio,
  RadioGroup,
  Select,
  useColorModeValue,
  Icon,
  Progress,
  Badge,
} from '@chakra-ui/react';
import { FaQuestionCircle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const LegalGuidanceModal = ({ isOpen, onClose, onComplete, language = 'en' }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mainCategory: '',
    subCategory: '',
    situation: '',
    urgency: '',
    parties: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  
  const mainCategories = {
    'property': {
      labelEn: 'Property & Real Estate',
      labelHi: 'संपत्ति और अचल संपदा',
      situations: [
        { en: 'Buying or selling property', hi: 'संपत्ति खरीदना या बेचना' },
        { en: 'Renting property (as landlord or tenant)', hi: 'संपत्ति किराए पर देना/लेना' },
        { en: 'Property inheritance/succession', hi: 'संपत्ति विरासत/उत्तराधिकार' },
        { en: 'Property dispute with family/neighbor', hi: 'परिवार/पड़ोसी के साथ संपत्ति विवाद' },
        { en: 'Gift property to someone', hi: 'किसी को संपत्ति उपहार में देना' },
        { en: 'Give someone authority over my property', hi: 'किसी को मेरी संपत्ति पर अधिकार देना' },
      ]
    },
    'family': {
      labelEn: 'Family & Marriage',
      labelHi: 'परिवार और विवाह',
      situations: [
        { en: 'Divorce/separation issues', hi: 'तलाक/अलगाव के मुद्दे' },
        { en: 'Child custody or maintenance', hi: 'बच्चे की हिरासत या भरण-पोषण' },
        { en: 'Domestic violence/abuse', hi: 'घरेलू हिंसा/दुर्व्यवहार' },
        { en: 'Adoption of a child', hi: 'बच्चा गोद लेना' },
        { en: 'Creating a will/testament', hi: 'वसीयत बनाना' },
        { en: 'Guardianship of minor', hi: 'नाबालिग का संरक्षक' },
      ]
    },
    'financial': {
      labelEn: 'Money & Financial',
      labelHi: 'पैसा और वित्तीय',
      situations: [
        { en: 'Someone owes me money', hi: 'कोई मुझे पैसे देना है' },
        { en: 'Cheque bounced', hi: 'चेक बाउंस हो गया' },
        { en: 'Loan agreement needed', hi: 'ऋण समझौता चाहिए' },
        { en: 'Business partnership agreement', hi: 'व्यापार साझेदारी समझौता' },
        { en: 'Consumer complaint (defective product/service)', hi: 'उपभोक्ता शिकायत (खराब उत्पाद/सेवा)' },
        { en: 'Insurance claim issue', hi: 'बीमा दावा समस्या' },
      ]
    },
    'employment': {
      labelEn: 'Employment & Work',
      labelHi: 'रोजगार और काम',
      situations: [
        { en: 'Need employment contract', hi: 'रोजगार अनुबंध चाहिए' },
        { en: 'Wrongful termination/firing', hi: 'गलत तरीके से नौकरी से निकाला गया' },
        { en: 'Workplace harassment', hi: 'कार्यस्थल पर उत्पीड़न' },
        { en: 'Salary/wages not paid', hi: 'वेतन नहीं मिला' },
        { en: 'Service agreement needed', hi: 'सेवा समझौता चाहिए' },
        { en: 'Non-compete/NDA agreement', hi: 'गैर-प्रतिस्पर्धा/गोपनीयता समझौता' },
      ]
    },
    'criminal': {
      labelEn: 'Criminal & Police',
      labelHi: 'आपराधिक और पुलिस',
      situations: [
        { en: 'Need to file FIR/police complaint', hi: 'FIR/पुलिस शिकायत दर्ज करनी है' },
        { en: 'Need bail application', hi: 'जमानत आवेदन चाहिए' },
        { en: 'Victim of theft/robbery', hi: 'चोरी/डकैती का शिकार' },
        { en: 'Defamation/slander case', hi: 'मानहानि का मामला' },
        { en: 'Cyber crime complaint', hi: 'साइबर अपराध शिकायत' },
        { en: 'False accusation against me', hi: 'मेरे खिलाफ झूठा आरोप' },
      ]
    },
    'business': {
      labelEn: 'Business & Company',
      labelHi: 'व्यापार और कंपनी',
      situations: [
        { en: 'Starting a new business', hi: 'नया व्यापार शुरू करना' },
        { en: 'Partnership agreement', hi: 'साझेदारी समझौता' },
        { en: 'Company incorporation', hi: 'कंपनी निगमन' },
        { en: 'Trademark/copyright registration', hi: 'ट्रेडमार्क/कॉपीराइट पंजीकरण' },
        { en: 'Business contract/agreement', hi: 'व्यापार अनुबंध/समझौता' },
        { en: 'GST/tax related', hi: 'GST/कर संबंधित' },
      ]
    },
    'other': {
      labelEn: 'Other Legal Matter',
      labelHi: 'अन्य कानूनी मामला',
      situations: [
        { en: 'RTI (Right to Information) application', hi: 'आरटीआई आवेदन' },
        { en: 'Name change affidavit', hi: 'नाम परिवर्तन शपथ पत्र' },
        { en: 'General affidavit', hi: 'सामान्य शपथ पत्र' },
        { en: 'Legal notice to send', hi: 'कानूनी नोटिस भेजना' },
        { en: 'Court appeal/petition', hi: 'कोर्ट अपील/याचिका' },
        { en: 'Something else', hi: 'कुछ और' },
      ]
    }
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
    
    const category = formData.mainCategory;
    const situation = formData.subCategory || formData.situation;
    
    let fullDescription = `${language === 'hi' ? 'मुझे मदद चाहिए: ' : 'I need help with: '}${situation}`;
    
    if (formData.situation) {
      fullDescription += `\n\n${language === 'hi' ? 'विवरण: ' : 'Details: '}${formData.situation}`;
    }
    
    if (formData.urgency) {
      fullDescription += `\n${language === 'hi' ? 'तात्कालिकता: ' : 'Urgency: '}${formData.urgency}`;
    }
    
    if (formData.parties) {
      fullDescription += `\n${language === 'hi' ? 'पक्ष शामिल: ' : 'Parties involved: '}${formData.parties}`;
    }

    onComplete(fullDescription, category, formData);
    onClose();
    
    
    setStep(1);
    setFormData({
      mainCategory: '',
      subCategory: '',
      situation: '',
      urgency: '',
      parties: '',
    });
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      mainCategory: '',
      subCategory: '',
      situation: '',
      urgency: '',
      parties: '',
    });
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium">
              {language === 'hi' 
                ? '1️⃣ आपकी कानूनी स्थिति किस श्रेणी में आती है?'
                : '1️⃣ Which category does your legal situation fall into?'}
            </Text>
            
            <RadioGroup 
              value={formData.mainCategory} 
              onChange={(val) => setFormData({ ...formData, mainCategory: val })}
            >
              <VStack spacing={2} align="stretch">
                {Object.keys(mainCategories).map(catKey => (
                  <Box
                    key={catKey}
                    p={3}
                    borderWidth={1}
                    borderColor={formData.mainCategory === catKey ? 'blue.400' : borderColor}
                    borderRadius="md"
                    bg={formData.mainCategory === catKey ? 'blue.50' : 'transparent'}
                    cursor="pointer"
                    _hover={{ borderColor: 'blue.300', bg: useColorModeValue('blue.50', 'blue.900') }}
                    onClick={() => setFormData({ ...formData, mainCategory: catKey })}
                  >
                    <Radio value={catKey} colorScheme="blue">
                      <Text fontWeight="medium">
                        {language === 'hi' ? mainCategories[catKey].labelHi : mainCategories[catKey].labelEn}
                      </Text>
                    </Radio>
                  </Box>
                ))}
              </VStack>
            </RadioGroup>
          </VStack>
        );

      case 2:
        const selectedCategory = mainCategories[formData.mainCategory];
        if (!selectedCategory) return null;

        return (
          <VStack spacing={4} align="stretch">
            <HStack>
              <Badge colorScheme="blue">
                {language === 'hi' ? selectedCategory.labelHi : selectedCategory.labelEn}
              </Badge>
            </HStack>

            <Text fontWeight="medium">
              {language === 'hi' 
                ? '2️⃣ आपकी स्थिति का सबसे अच्छा विवरण कौन सा है?'
                : '2️⃣ Which best describes your situation?'}
            </Text>
            
            <RadioGroup 
              value={formData.subCategory} 
              onChange={(val) => setFormData({ ...formData, subCategory: val })}
            >
              <VStack spacing={2} align="stretch">
                {selectedCategory.situations.map((sit, idx) => (
                  <Box
                    key={idx}
                    p={3}
                    borderWidth={1}
                    borderColor={formData.subCategory === (language === 'hi' ? sit.hi : sit.en) ? 'blue.400' : borderColor}
                    borderRadius="md"
                    bg={formData.subCategory === (language === 'hi' ? sit.hi : sit.en) ? 'blue.50' : 'transparent'}
                    cursor="pointer"
                    _hover={{ borderColor: 'blue.300', bg: useColorModeValue('blue.50', 'blue.900') }}
                    onClick={() => setFormData({ ...formData, subCategory: language === 'hi' ? sit.hi : sit.en })}
                  >
                    <Radio value={language === 'hi' ? sit.hi : sit.en} colorScheme="blue">
                      <Text fontSize="sm">
                        {language === 'hi' ? sit.hi : sit.en}
                      </Text>
                    </Radio>
                  </Box>
                ))}
              </VStack>
            </RadioGroup>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium">
              {language === 'hi' 
                ? '3️⃣ कृपया अपनी स्थिति का विस्तार से वर्णन करें'
                : '3️⃣ Please describe your situation in detail'}
            </Text>
            
            <Textarea
              placeholder={language === 'hi' 
                ? 'अपनी स्थिति के बारे में विस्तार से बताएं... (वैकल्पिक)'
                : 'Tell us more about your situation... (optional)'}
              value={formData.situation}
              onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
              rows={4}
            />

            <Text fontWeight="medium" mt={2}>
              {language === 'hi' ? 'यह कितना जरूरी है?' : 'How urgent is this?'}
            </Text>
            <Select
              placeholder={language === 'hi' ? 'चुनें...' : 'Select...'}
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            >
              <option value={language === 'hi' ? 'बहुत जरूरी (तुरंत चाहिए)' : 'Very urgent (need immediately)'}>
                {language === 'hi' ? 'बहुत जरूरी (तुरंत चाहिए)' : 'Very urgent (need immediately)'}
              </option>
              <option value={language === 'hi' ? 'जरूरी (कुछ दिनों में)' : 'Urgent (within few days)'}>
                {language === 'hi' ? 'जरूरी (कुछ दिनों में)' : 'Urgent (within few days)'}
              </option>
              <option value={language === 'hi' ? 'सामान्य (कुछ हफ्तों में)' : 'Normal (within few weeks)'}>
                {language === 'hi' ? 'सामान्य (कुछ हफ्तों में)' : 'Normal (within few weeks)'}
              </option>
              <option value={language === 'hi' ? 'जल्दी नहीं' : 'Not urgent'}>
                {language === 'hi' ? 'जल्दी नहीं' : 'Not urgent'}
              </option>
            </Select>

            <Text fontWeight="medium" mt={2}>
              {language === 'hi' ? 'कितने पक्ष शामिल हैं?' : 'How many parties are involved?'}
            </Text>
            <Select
              placeholder={language === 'hi' ? 'चुनें...' : 'Select...'}
              value={formData.parties}
              onChange={(e) => setFormData({ ...formData, parties: e.target.value })}
            >
              <option value={language === 'hi' ? 'केवल मैं' : 'Just me'}>
                {language === 'hi' ? 'केवल मैं' : 'Just me'}
              </option>
              <option value={language === 'hi' ? 'मैं और एक व्यक्ति' : 'Me and one other person'}>
                {language === 'hi' ? 'मैं और एक व्यक्ति' : 'Me and one other person'}
              </option>
              <option value={language === 'hi' ? 'कई लोग/पक्ष' : 'Multiple people/parties'}>
                {language === 'hi' ? 'कई लोग/पक्ष' : 'Multiple people/parties'}
              </option>
              <option value={language === 'hi' ? 'एक कंपनी/संगठन' : 'A company/organization'}>
                {language === 'hi' ? 'एक कंपनी/संगठन' : 'A company/organization'}
              </option>
            </Select>
          </VStack>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.mainCategory !== '';
    if (step === 2) return formData.subCategory !== '';
    if (step === 3) return true;
    return false;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={FaQuestionCircle} color="blue.500" boxSize={5} />
              <Text fontSize="xl" fontWeight="bold">
                {language === 'hi' ? '🧭 कानूनी मार्गदर्शन' : '🧭 Legal Guidance'}
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="normal" color="gray.500">
              {language === 'hi' 
                ? 'मुझे बताएं कि आपको किस मदद की जरूरत है, और मैं सही दस्तावेज़ सुझाऊंगा'
                : 'Tell me what help you need, and I\'ll suggest the right document'}
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
                  ? (language === 'hi' ? '✅ सुझाव दें' : '✅ Get Suggestions')
                  : (language === 'hi' ? 'अगला' : 'Next')}
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LegalGuidanceModal;
