import React from 'react';
import {
  VStack, Text, HStack, Center, Icon, useColorModeValue
} from '@chakra-ui/react';
import { FiFileText, FiZap, FiEdit, FiGlobe, FiMaximize2 } from 'react-icons/fi';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const DraftingSubSidebar = () => {
  const { handleSuggestedActionClick, handleBrowseTemplatesClick, handlePrecedenceAnalysisClick, handleCounterMakerClick } = useAdvancedChat();

  const cv_gray_550_gray_400 = useColorModeValue('gray.550', 'gray.400');
  const cv_white_rgba_212_175_55_0_005 = useColorModeValue('white', 'rgba(212, 175, 55, 0.005)');
  const cv_gray_200_rgba_212_175_55_0_15 = useColorModeValue('gray.200', 'rgba(212, 175, 55, 0.15)');
  const cv_rgba_212_175_55_0_04_rgba_212_175_55_0_03 = useColorModeValue('rgba(212, 175, 55, 0.04)', 'rgba(212, 175, 55, 0.03)');
  const cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05 = useColorModeValue('rgba(212, 175, 55, 0.08)', 'rgba(212, 175, 55, 0.05)');
  const cv_gray_800_gray_100 = useColorModeValue('gray.800', 'gray.100');

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="xs" color="gray.550" _dark={{ color: 'gray.400' }} px={1} lineHeight="1.5">
        Select or design templates to draft custom affidavits, compliance notices, complaints, and general agreements.
      </Text>
      <VStack spacing={3} align="stretch" w="full">
        {[
          {
            id: 'templates',
            title: 'Browse Templates',
            subtext: 'Pre-designed legal documents & forms',
            icon: FiFileText,
            onClick: handleBrowseTemplatesClick
          },
          {
            id: 'precedence',
            title: 'Precedence Analysis',
            subtext: 'Analyze relevant court precedents',
            icon: FiZap,
            onClick: handlePrecedenceAnalysisClick
          },
          {
            id: 'counter',
            title: 'Counter Maker',
            subtext: 'Create counter affidavit responses',
            icon: FiEdit,
            onClick: handleCounterMakerClick
          },
          {
            id: 'translate',
            title: 'Document Translator',
            subtext: 'Translate templates and drafts',
            icon: FiGlobe,
            onClick: () => handleSuggestedActionClick({ type: 'TRANSLATE_DOCUMENT', text: 'Translate a document file' })
          }
        ].map(action => (
          <HStack
            key={action.id}
            p={3.5}
            spacing={3.5}
            bg={cv_white_rgba_212_175_55_0_005}
            border="1px solid"
            borderColor={cv_gray_200_rgba_212_175_55_0_15}
            borderRadius="xl"
            cursor="pointer"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            onClick={action.onClick}
            role="group"
            _hover={{
              bg: cv_rgba_212_175_55_0_04_rgba_212_175_55_0_03,
              borderColor: 'judicial.gold',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)'
            }}
          >
            <Center
              w={14}
              h={14}
              borderRadius="xl"
              bg={cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05}
              border="1px solid"
              borderColor="rgba(212, 175, 55, 0.2)"
              transition="transform 0.4s ease"
              _groupHover={{ transform: 'scale(1.08)' }}
              flexShrink={0}
            >
              <Icon as={action.icon} w={8} h={8} color="judicial.gold" />
            </Center>
            <VStack align="start" spacing={0} flex="1">
              <Text fontSize="xs" fontWeight="bold" color={cv_gray_800_gray_100}>
                {action.title}
              </Text>
              <Text fontSize="10px" color={cv_gray_550_gray_400}>
                {action.subtext}
              </Text>
            </VStack>
            <Icon 
              as={FiMaximize2} 
              w={3} 
              h={3} 
              color="gray.400" 
              transition="all 0.3s ease" 
              _groupHover={{ color: 'judicial.gold', transform: 'scale(1.1)' }} 
            />
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};

export default DraftingSubSidebar;
