import React from 'react';
import {
  Box, VStack, HStack, Button, Text, Tooltip, IconButton, useColorModeValue, Center
} from '@chakra-ui/react';
import { FiMaximize2, FiDownload, FiX, FiCheck } from 'react-icons/fi';
import { useAdvancedChat } from '../AdvancedChatContext';

const DocumentEditor = () => {
  const {
    isEditMode, htmlContent, handleApplyEdit, handleExitEditMode, selectedFile,
    handleDownloadFile, isFullEditorOpen, setIsFullEditorOpen, handleDownloadEdited
  } = useAdvancedChat();

    return (
      <Flex w="full" h="full" direction="column" overflow="hidden" p={4}>
        {/* Messages scroll area */}
        <Box
          flex="1"
          w="full"
          overflowY="auto"
          borderRadius="xl"
          p={4}
          bg={bgColor}
          borderWidth={1}
          borderColor={borderColor}
          boxShadow="sm"
          position="relative"
          css={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { background: borderColor, borderRadius: '24px' }
          }}
        >
          {isInitialLoad ? (
            <Center h="full">
              <Spinner size="lg" color="blue.500" />
            </Center>
          ) : messages.length === 0 ? (
            <Center h="full">
              <VStack spacing={2}>
                <Text color={textColor} fontWeight="bold">Welcome to Dastavez AI</Text>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Select a tab from the left sidebar to upload files, load drafting templates, or ask legal questions.
                </Text>
              </VStack>
            </Center>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                role={msg.role}
                onSuggestedActionClick={handleSuggestedActionClick}
                onDownload={handleDownloadFile}
                language={language}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* User Input Prompt controls */}
        <Box pt={4} w="full">
          <VStack spacing={2} w="full">
            {/* Selected File Display inline inside Chat */}
            {selectedFile && (
              <HStack
                bg={useColorModeValue('blue.50', 'blue.900')}
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
              {/* Intent Menu "+" Button */}
              <Menu>
                <Tooltip label="Select intent type" placement="top">
                  <MenuButton
                    as={IconButton}
                    icon={<AddIcon />}
                    aria-label="Select intent"
                    size="md"
                    variant={intentOverride ? 'solid' : 'ghost'}
                    colorScheme={intentOverride ? 'purple' : 'blue'}
                  />
                </Tooltip>
                <MenuList>
                  <MenuItem onClick={() => { setIntentOverride(null); setIntentLabel(null); }}>
                    Ã°Å¸â€™Â¬ Auto-detect (Default)
                  </MenuItem>
                  <MenuItem onClick={() => { setIntentOverride('CONVERSATIONAL'); setIntentLabel('Chat'); }}>
                    Ã°Å¸â€”Â£Ã¯Â¸Â Conversational Chat
                  </MenuItem>
                  <MenuItem onClick={() => { setIntentOverride('LEGAL_INFORMATION'); setIntentLabel('Legal Query'); }}>
                    Ã¢Å¡â€“Ã¯Â¸Â Legal Information
                  </MenuItem>
                  <MenuItem onClick={() => { setIntentOverride('DOCUMENT_REQUEST'); setIntentLabel('Draft'); }}>
                    Ã°Å¸â€œÂ Draft Document
                  </MenuItem>
                </MenuList>
              </Menu>

              {intentLabel && (
                <Badge colorScheme="purple" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
                  {intentLabel} Ã¢Å“â€¢
                </Badge>
              )}

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
                        : (activeTab === 'research' && researchSessionId && ['completed', 'completed_with_errors'].includes(researchStatus))
                          ? "Ask questions about the research report..."
                          : (activeTab === 'chronology' && chronologySessionId && ['completed', 'completed_with_errors'].includes(chronologyStatus))
                            ? "Ask questions about the timeline..."
                            : "Type your message..."
                }
                size="md"
                bg={isListening ? useColorModeValue('red.50', 'red.900') : inputBg}
                color={textColor}
                isDisabled={isPendingUserChoice || isLoading || analyzingFile}
                onKeyPress={handleKeyPress}
                flex={1}
              />
              
              <Tooltip label="Voice input" placement="top">
                <IconButton
                  icon={isListening ? <FiMicOff /> : <FiMic />}
                  onClick={toggleListening}
                  size="md"
                  colorScheme={isListening ? 'red' : 'blue'}
                  isDisabled={!speechSupported}
                  aria-label="Voice input"
                />
              </Tooltip>

              <IconButton
                icon={<Icon as={RiSendPlaneFill} />}
                onClick={() => handleSendMessage()}
                size="md"
                colorScheme="blue"
                isDisabled={!input.trim() || isLoading}
                aria-label="Send message"
              />
            </HStack>
          </VStack>
        </Box>
      </Flex>
    );
  }

export default DocumentEditor;
