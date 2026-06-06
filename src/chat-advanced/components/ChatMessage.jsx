import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Link,
  useColorModeValue,
  Image,
  Badge,
} from '@chakra-ui/react';
import { FaFile, FaImage, FaDownload } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import SuggestedActions from './SuggestedActions';

const ChatMessage = ({ message, onSuggestedActionClick, onDownload, language = 'en' }) => {
  const isUser = message.role === 'user';
  const bgColor = useColorModeValue(
    isUser ? 'blue.50' : 'gray.50',
    isUser ? 'blue.900' : 'gray.700'
  );
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const fileBg = useColorModeValue('white', 'gray.800');
  const fileBorder = useColorModeValue('gray.200', 'gray.600');
  const boldColor = useColorModeValue('blue.700', 'blue.200');

  const getFileIcon = (fileType) => {
    if (!fileType) return FaFile;
    return fileType.startsWith('image/') ? FaImage : FaFile;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderFile = (file) => {
    if (!file) return null;

    const isImage = file.fileType?.startsWith('image/');

    return (
      <Box
        mt={2}
        p={3}
        bg={fileBg}
        borderRadius="md"
        borderWidth={1}
        borderColor={fileBorder}
        maxW="400px"
      >
        <HStack spacing={3}>
          <Icon
            as={getFileIcon(file.fileType)}
            boxSize={5}
            color={useColorModeValue('blue.500', 'blue.300')}
          />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              {file.fileName}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme="blue" fontSize="xs">
                {formatFileSize(file.fileSize)}
              </Badge>
              {isImage && (
                <Badge colorScheme="green" fontSize="xs">
                  Image
                </Badge>
              )}
              {file.isEdited && (
                <Badge colorScheme="orange" fontSize="xs">
                  ✏️ Edited
                </Badge>
              )}
            </HStack>
          </VStack>
          {onDownload ? (
            <Icon
              as={FaDownload}
              boxSize={4}
              color={useColorModeValue('blue.500', 'blue.300')}
              cursor="pointer"
              _hover={{ color: useColorModeValue('blue.600', 'blue.200'), transform: 'scale(1.1)' }}
              onClick={() => onDownload(file.fileUrl, file.fileName)}
              title="Download Securely"
            />
          ) : (
            <Link href={file.fileUrl} download={file.fileName} isExternal>
              <Icon
                as={FaDownload}
                boxSize={4}
                color={useColorModeValue('blue.500', 'blue.300')}
                _hover={{ color: useColorModeValue('blue.600', 'blue.200') }}
              />
            </Link>
          )}
        </HStack>
        {isImage && (
          <Box mt={2}>
            <Image
              src={file.fileUrl}
              alt={file.fileName}
              maxH="200px"
              objectFit="contain"
              borderRadius="md"
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
      maxW="80%"
      bg={bgColor}
      p={4}
      borderRadius="lg"
      borderWidth={1}
      borderColor={borderColor}
    >
      <VStack align="start" spacing={3}>
        <Box color={textColor} whiteSpace="pre-wrap" w="100%">
          <ReactMarkdown
            components={{
              // Render bold text with nice styling
              strong: ({ children }) => (
                <Text as="span" fontWeight="bold" color={boldColor}>
                  {children}
                </Text>
              ),
              // Render paragraphs properly
              p: ({ children }) => (
                <Text mb={2} lineHeight="1.6">
                  {children}
                </Text>
              ),
              // Render lists nicely
              ul: ({ children }) => (
                <Box as="ul" pl={4} mb={2}>
                  {children}
                </Box>
              ),
              ol: ({ children }) => (
                <Box as="ol" pl={4} mb={2}>
                  {children}
                </Box>
              ),
              li: ({ children }) => (
                <Text as="li" mb={1}>
                  {children}
                </Text>
              ),
              // Handle code/preformatted text
              code: ({ children }) => (
                <Text as="code" bg={useColorModeValue('gray.100', 'gray.600')} px={1} borderRadius="sm" fontSize="sm">
                  {children}
                </Text>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </Box>

        {/* Note: Missing fields list is now included in the message content itself
            to support language preferences (Hindi/English) from the backend */}

        {message.file && renderFile(message.file)}

        {/* Render suggested actions if present */}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <SuggestedActions
            suggestions={message.suggestedActions}
            onActionClick={onSuggestedActionClick}
            language={language}
            isActive={message.actionsActive !== false}
          />
        )}
      </VStack>
    </Box>
  );
};

export default ChatMessage; 