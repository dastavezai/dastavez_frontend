import React, { useRef } from 'react';
import {
  Box, VStack, HStack, Icon, Text, Badge, IconButton, Button, Input, Menu, MenuButton, MenuList, MenuItem, Tooltip, useColorModeValue
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { FaFile, FaTimes } from 'react-icons/fa';
import { FiMic, FiMicOff, FiPaperclip } from 'react-icons/fi';
import { RiSendPlaneFill } from 'react-icons/ri';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const ChatInputBar = () => {
  const chatFileInputRef = useRef(null);
  const {
    selectedFile, setSelectedFile, scanStatus, editSessionActive, handleExitEditMode, textColor,
    intentOverride, setIntentOverride, intentLabel, setIntentLabel,
    input, setInput, interimTranscript, isPendingUserChoice, isListening, isEditMode, isLoading, analyzingFile,
    handleKeyPress, toggleListening, speechSupported, handleSendMessage, handleStartNewChat,
    handleChatFileUpload, uploading
  } = useAdvancedChat();

  const cv_blue_50_blue_900 = useColorModeValue('blue.50', 'blue.900');
  const cv_red_50_red_950 = useColorModeValue('red.50', 'red.950');
  const inputBg = useColorModeValue('white', 'gray.800');
  const cv_gray_250_rgba_212_175_55_0_25 = useColorModeValue('gray.250', 'rgba(212, 175, 55, 0.25)');
  const cv_gray_300_rgba_212_175_55_0_35 = useColorModeValue('gray.300', 'rgba(212, 175, 55, 0.35)');
  const cv_white_rgba_10_13_20_0_6 = useColorModeValue('white', 'rgba(10, 13, 20, 0.6)');
  const cv_gray_100_gray_800 = useColorModeValue('gray.100', 'gray.800');
  const cv_gray_400_gray_650 = useColorModeValue('gray.400', 'gray.650');

  return (
    <Box pt={1.5} w="full">
      <VStack spacing={1} w="full">
        {/* Selected File Display inline inside Chat */}
        {selectedFile && (
          <HStack
            bg={cv_blue_50_blue_900}
            p={2}
            px={3}
            borderRadius="md"
            w="100%"
            justify="space-between"
            borderWidth={1}
            borderColor="blue.100"
          >
            <HStack spacing={2}>
              <Icon as={FaFile} color="blue.500" />
              <Text color={textColor} fontSize="xs" fontWeight="semibold" isTruncated maxW="200px">
                {selectedFile.fileName}
              </Text>
              {scanStatus === 'scanned' && (
                <Badge colorScheme="green" fontSize="2xs">Scanned</Badge>
              )}
              {editSessionActive && (
                <Badge colorScheme="purple" fontSize="2xs">Edit Active</Badge>
              )}
            </HStack>
            <HStack spacing={1}>
              {editSessionActive && (
                <Button size="2xs" variant="ghost" colorScheme="gray" onClick={handleExitEditMode}>
                  Exit Edit
                </Button>
              )}
              <IconButton
                icon={<FaTimes />}
                size="xs"
                variant="ghost"
                colorScheme="blue"
                onClick={() => {
                  handleExitEditMode();
                  setSelectedFile(null);
                }}
                aria-label="Remove file"
              />
            </HStack>
          </HStack>
        )}

        <HStack w="100%" spacing={2}>
          {/* "+" Button to Start New Chat */}
          <Tooltip label="Start New Chat" placement="top">
            <IconButton
              icon={<AddIcon />}
              aria-label="Start New Chat"
              onClick={handleStartNewChat}
              size="md"
              h="40px"
              w="40px"
              borderRadius="lg"
              bg="judicial.gold"
              color="judicial.dark"
              transition="all 0.2s ease"
              _hover={{
                bg: 'judicial.lightGold',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.45)'
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
            />
          </Tooltip>

          <Input
            value={input + (interimTranscript ? ` ${interimTranscript}` : '')}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isPendingUserChoice
                ? 'Please use the suggested actions above'
                : isListening
                  ? "Listening... speak now"
                  : isEditMode
                    ? "Describe the edit you want to make..."
                    : "Type your message..."
            }
            size="md"
            h="40px"
            borderRadius="lg"
            bg={isListening ? cv_red_50_red_950 : inputBg}
            color={textColor}
            borderColor={cv_gray_250_rgba_212_175_55_0_25}
            _hover={{
              borderColor: cv_gray_300_rgba_212_175_55_0_35
            }}
            _focus={{
              borderColor: 'judicial.gold',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
              bg: cv_white_rgba_10_13_20_0_6
            }}
            fontFamily="'Inter', sans-serif"
            fontSize="sm"
            isDisabled={isPendingUserChoice || isLoading || analyzingFile}
            onKeyPress={handleKeyPress}
            flex={1}
            transition="all 0.2s ease"
          />
          <Tooltip label="Upload & Quick Scan Document" placement="top">
            <IconButton
              icon={<Icon as={FiPaperclip} />}
              onClick={() => chatFileInputRef.current?.click()}
              size="md"
              h="40px"
              w="40px"
              borderRadius="lg"
              bg="judicial.gold"
              color="judicial.dark"
              transition="all 0.2s ease"
              _hover={{
                bg: 'judicial.lightGold',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.45)'
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
              isLoading={uploading}
              isDisabled={isLoading}
              aria-label="Upload document"
            />
          </Tooltip>
          <input
            type="file"
            ref={chatFileInputRef}
            onChange={handleChatFileUpload}
            style={{ display: 'none' }}
            accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
          />

          <Tooltip label="Voice input" placement="top">
            <IconButton
              icon={isListening ? <FiMicOff /> : <FiMic />}
              onClick={toggleListening}
              size="md"
              h="40px"
              w="40px"
              borderRadius="lg"
              bg={isListening ? 'red.500' : 'judicial.gold'}
              color={isListening ? 'white' : 'judicial.dark'}
              transition="all 0.2s ease"
              _hover={isListening ? {
                bg: 'red.600',
                transform: 'translateY(-1px)'
              } : {
                bg: 'judicial.lightGold',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.45)'
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
              _disabled={{
                bg: cv_gray_100_gray_800,
                color: cv_gray_400_gray_650,
                cursor: 'not-allowed',
                boxShadow: 'none',
                transform: 'none'
              }}
              isDisabled={!speechSupported}
              aria-label="Voice input"
            />
          </Tooltip>

          <IconButton
            icon={<Icon as={RiSendPlaneFill} />}
            onClick={() => handleSendMessage()}
            size="md"
            h="40px"
            w="40px"
            borderRadius="lg"
            bg="judicial.gold"
            color="judicial.dark"
            transition="all 0.2s ease"
            _hover={{
              bg: 'judicial.lightGold',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.45)'
            }}
            _active={{
              transform: 'translateY(0px)'
            }}
            _disabled={{
              bg: cv_gray_100_gray_800,
              color: cv_gray_400_gray_650,
              cursor: 'not-allowed',
              boxShadow: 'none',
              transform: 'none'
            }}
            isDisabled={!input.trim() || isLoading}
            aria-label="Send message"
          />
        </HStack>
      </VStack>
    </Box>
  );
};

export default ChatInputBar;
