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
import { FiUser, FiCpu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import SuggestedActions from './SuggestedActions';

const ChatMessage = ({ message, onSuggestedActionClick, onDownload, language = 'en', fontSize = 14 }) => {
  const isUser = message.role === 'user';
  const bgColor = isUser 
    ? useColorModeValue('rgba(212, 175, 55, 0.06)', 'rgba(212, 175, 55, 0.12)') 
    : useColorModeValue('white', 'rgba(13, 17, 23, 0.45)');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = isUser 
    ? 'rgba(212, 175, 55, 0.35)' 
    : useColorModeValue('gray.200', 'rgba(212, 175, 55, 0.18)');
  const fileBg = useColorModeValue('white', 'gray.800');
  const fileBorder = useColorModeValue('gray.200', 'gray.600');
  const boldColor = useColorModeValue('gray.900', 'judicial.gold');

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
    <HStack
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
      spacing={2.5}
      maxW="72%"
      align="start"
    >


      {/* AI Avatar — left of AI bubble */}
      {!isUser && (
        <Box
          p={2.5}
          borderRadius="full"
          bg="rgba(212, 175, 55, 0.22)"
          border="1.5px solid"
          borderColor="judicial.gold"
          color="judicial.gold"
          boxShadow="0 0 16px rgba(212, 175, 55, 0.35), inset 0 1px 1px rgba(255,255,255,0.1)"
          mt={1}
          transition="all 0.2s ease"
          _hover={{ transform: 'scale(1.1) rotate(10deg)', boxShadow: '0 0 24px rgba(212, 175, 55, 0.55)' }}
        >
          <Icon as={FiCpu} w={5} h={5} />
        </Box>
      )}

      <Box
        bg={bgColor}
        p={3}
        borderRadius="xl"
        borderWidth="1px"
        borderLeft={isUser ? '1px solid' : '2.5px solid'}
        borderLeftColor={isUser ? 'rgba(212, 175, 55, 0.35)' : 'judicial.gold'}
        borderColor={borderColor}
        boxShadow={isUser ? '0 2px 8px rgba(212, 175, 55, 0.06)' : '0 4px 20px rgba(0, 0, 0, 0.14)'}
        backdropFilter="blur(16px)"
        fontSize={`${fontSize}px`}
        fontFamily="'Inter', 'Plus Jakarta Sans', sans-serif"
        letterSpacing="0.01em"
        transition="all 0.2s ease"
      >
        <VStack align="start" spacing={3}>
          <Box color={textColor} whiteSpace="pre-wrap" w="100%">
            <ReactMarkdown
            components={{
              // Render bold text with nice styling
              strong: ({ children }) => (
                <Text as="span" fontWeight="600" color={boldColor} letterSpacing="0.02em">
                  {children}
                </Text>
              ),
              // Render paragraphs properly
              p: ({ children }) => (
                <Text mb={1.5} lineHeight="1.65" fontSize="inherit">
                  {children}
                </Text>
              ),
              // Render lists nicely
              ul: ({ children }) => (
                <Box as="ul" pl={3} mb={1.5}>
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
                <Text as="code" bg={useColorModeValue('gray.100', 'gray.600')} px={1} borderRadius="sm" fontSize="0.9em">
                  {children}
                </Text>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </Box>

        {/* Note: Missing fields list is now included in the message content itself
            to allow proper AI context and inline explanation */}

        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <SuggestedActions
            actions={message.suggestedActions}
            onActionClick={onSuggestedActionClick}
          />
        )}

        {message.rightPanelToggle && (
          <Box
            onClick={() => onSuggestedActionClick({
              type: 'toggle_right_panel',
              tab: message.rightPanelToggle.tab,
              panelKey: message.rightPanelToggle.panelKey
            })}
            cursor="pointer"
            p={3.5}
            borderRadius="xl"
            bg={useColorModeValue('rgba(212, 175, 55, 0.05)', 'rgba(212, 175, 55, 0.12)')}
            border="1px solid"
            borderColor="judicial.gold"
            transition="all 0.2s ease"
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25)'
            }}
            mt={2.5}
            w="full"
          >
            <HStack justify="space-between" w="full">
              <HStack spacing={3}>
                <Icon as={FiCpu} color="judicial.gold" boxSize={5} />
                <VStack align="start" spacing={0.5}>
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>
                    {message.rightPanelToggle.label}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Click to view full interactive analysis report in the right panel.
                  </Text>
                </VStack>
              </HStack>
              <Text fontSize="xs" fontWeight="bold" color="judicial.gold">
                View Report →
              </Text>
            </HStack>
          </Box>
        )}

        {message.files && message.files.length > 0 && (
          <VStack align="stretch" spacing={2} w="100%">
            {message.files.map((file, idx) => renderFile(file))}
          </VStack>
        )}
      </VStack>
    </Box>

      {/* User Avatar — right of user bubble */}
      {isUser && (
        <Box
          p={2.5}
          borderRadius="full"
          bg={useColorModeValue('rgba(212, 175, 55, 0.12)', 'rgba(212, 175, 55, 0.2)')}
          border="1.5px solid"
          borderColor="judicial.gold"
          color="judicial.gold"
          boxShadow="0 0 14px rgba(212, 175, 55, 0.25), inset 0 1px 1px rgba(255,255,255,0.08)"
          mt={1}
          transition="all 0.2s ease"
          _hover={{ transform: 'scale(1.1)', boxShadow: '0 0 20px rgba(212, 175, 55, 0.45)' }}
        >
          <Icon as={FiUser} w={5} h={5} />
        </Box>
      )}
  </HStack>
  );
};

export default ChatMessage;