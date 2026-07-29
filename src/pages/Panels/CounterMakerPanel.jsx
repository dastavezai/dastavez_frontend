import React from 'react';
import { Box, Flex, HStack, Text, Badge, Icon, IconButton, useColorModeValue } from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { useAdvancedChat } from '../AdvancedChatContext';
import CounterEditorPage from '../../departmentApp/pages/CounterEditorPage';

const CounterMakerPanel = () => {
  const {
    setIsCounterMakerPanelOpen,
    selectedFile
  } = useAdvancedChat();

  const panelBg = useColorModeValue('white', 'gray.850');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('purple.50', 'purple.900');

  const fileId = selectedFile?.fileId || selectedFile?._id;

  return (
    <Box w="100%" h="100%" flex="1" bg={panelBg} borderLeft="1px solid" borderColor={panelBorder} display="flex" flexDirection="column" overflow="hidden">
      {/* Panel Header */}
      <Flex h="48px" align="center" justify="space-between" px={4} borderBottom="1px solid" borderColor={panelBorder} bg={headerBg} flexShrink={0}>
        <HStack spacing={2} overflow="hidden" flex={1}>
          <Icon as={FiEdit} color="purple.500" boxSize={4} />
          <Text fontSize="sm" fontWeight="bold" whiteSpace="nowrap">Counter Affidavit Studio</Text>
          {selectedFile && (
            <Text fontSize="xs" color="gray.500" isTruncated maxW="280px" title={selectedFile.originalName || selectedFile.fileName}>
              - {selectedFile.originalName || selectedFile.fileName}
            </Text>
          )}
          {!selectedFile && (
            <Badge colorScheme="purple" fontSize="2xs">No File</Badge>
          )}
        </HStack>
        <IconButton icon={<FaTimes />} size="xs" variant="ghost" aria-label="Close" onClick={() => setIsCounterMakerPanelOpen(false)} />
      </Flex>

      {/* Embedded Counter Studio */}
      <Box flex={1} overflow="hidden" display="flex" flexDirection="column">
        {fileId ? (
          <CounterEditorPage isEmbedded={true} embeddedFileId={fileId} />
        ) : (
          <Flex flex={1} align="center" justify="center" p={6} textAlign="center">
            <Text color="gray.500" fontSize="sm">
              Please upload a petition or document in the chat first to use the Counter Affidavit Studio.
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default CounterMakerPanel;
