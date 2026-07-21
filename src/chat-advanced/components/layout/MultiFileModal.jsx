import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, VStack, Text, Button, useColorModeValue
} from '@chakra-ui/react';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const MultiFileModal = () => {
  const {
    isMultiFileModalOpen, setIsMultiFileModalOpen, multiFilePendingAction, handleConfirmMultiFileChoice, textColor
  } = useAdvancedChat();

  const cv_white_gray_900 = useColorModeValue('white', 'gray.900');
  const cv_gray_600_gray_400 = useColorModeValue('gray.600', 'gray.400');

  return (
    <Modal isOpen={isMultiFileModalOpen} onClose={() => setIsMultiFileModalOpen(false)} isCentered size="md">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent borderRadius="2xl" p={2} bg={cv_white_gray_900} border="1px solid" borderColor="judicial.gold">
        <ModalHeader color={textColor} pt={4} fontSize="md" fontWeight="bold">
          Start New Chat or Continue?
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={3} align="start">
            <Text fontSize="sm" color={cv_gray_600_gray_400} lineHeight="1.5">
              You are starting <strong>{multiFilePendingAction === 'chronology' ? 'Timeline Chronology' : 'Parallel Document Review'}</strong>.
              Would you like to start a brand new chat session for this analysis or continue in your current conversation?
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            variant="outline"
            size="sm"
            borderRadius="xl"
            onClick={() => handleConfirmMultiFileChoice(false)}
          >
            Continue in Current Chat
          </Button>
          <Button
            bg="judicial.gold"
            color="judicial.dark"
            size="sm"
            borderRadius="xl"
            fontWeight="bold"
            _hover={{ bg: 'judicial.lightGold' }}
            onClick={() => handleConfirmMultiFileChoice(true)}
          >
            Start New Chat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MultiFileModal;
