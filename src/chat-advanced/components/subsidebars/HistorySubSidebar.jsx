import React, { useState } from 'react';
import {
  VStack, Button, Center, Spinner, Box, Icon, Text, HStack, Badge,
  useColorModeValue, IconButton, Input, useToast, Tooltip,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, useDisclosure
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { FiMessageSquare, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5173/api').replace(/\/+$/, '');

const HistorySubSidebar = () => {
  const {
    sessionsList, setSessionsList, sessionsListLoading, slug, navigate, handleStartNewChat, textColor, token, user
  } = useAdvancedChat();

  const toast = useToast();
  const [editingSlug, setEditingSlug] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deletingSession, setDeletingSession] = useState(null);

  const cv_white_rgba_212_175_55_0_08 = useColorModeValue('white', 'rgba(212, 175, 55, 0.08)');
  const cv_white_transparent = useColorModeValue('white', 'transparent');
  const cv_gray_100_transparent = useColorModeValue('gray.100', 'transparent');
  const cv_gray_50_rgba_212_175_55_0_04 = useColorModeValue('gray.50', 'rgba(212, 175, 55, 0.04)');
  const cv_gray_300_rgba_212_175_55_0_15 = useColorModeValue('gray.300', 'rgba(212, 175, 55, 0.15)');
  const cv_gray_100_rgba_212_175_55_0_08 = useColorModeValue('gray.100', 'rgba(212, 175, 55, 0.08)');
  const cv_gray_600_gray_400 = useColorModeValue('gray.600', 'gray.400');
  const cancelRef = React.useRef();

  const handleStartEdit = (e, session) => {
    e.stopPropagation();
    setEditingSlug(session.slug);
    setEditTitle(session.title || session.preview || '');
  };

  const handleSaveTitle = async (e, targetSlug) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      setEditingSlug(null);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.patch(
        `${API_BASE_URL}/chat/session/${targetSlug}/title`,
        { title: editTitle.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.success) {
        setSessionsList(prev => prev.map(s => s.slug === targetSlug ? { ...s, title: editTitle.trim() } : s));
        toast({
          title: 'Title updated',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error updating title:', err);
      toast({
        title: 'Failed to update title',
        description: err.response?.data?.message || 'Error saving changes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setEditingSlug(null);
    }
  };

  const handleConfirmDelete = (e, session) => {
    e.stopPropagation();
    setDeletingSession(session);
    onDeleteOpen();
  };

  const handleDeleteSession = async () => {
    if (!deletingSession) return;
    const targetSlug = deletingSession.slug;

    try {
      setIsSubmitting(true);
      await axios.delete(
        `${API_BASE_URL}/chat/session/${targetSlug}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSessionsList(prev => prev.filter(s => s.slug !== targetSlug));
      toast({
        title: 'Chat session deleted',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      if (slug === targetSlug) {
        handleStartNewChat();
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      toast({
        title: 'Failed to delete session',
        description: err.response?.data?.message || 'Error deleting session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      setDeletingSession(null);
      onDeleteClose();
    }
  };

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/* New Chat Session Button */}
      <Button
        size="md"
        bg="judicial.gold"
        color="judicial.dark"
        _hover={{
          bg: 'judicial.lightGold',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
        }}
        _active={{ transform: 'translateY(0)' }}
        leftIcon={<AddIcon />}
        onClick={handleStartNewChat}
        w="full"
        borderRadius="xl"
        fontWeight="bold"
        fontSize="xs"
        letterSpacing="wide"
        transition="all 0.2s ease"
      >
        NEW CHAT SESSION
      </Button>

      {/* Session List */}
      {sessionsListLoading ? (
        <Center py={8}>
          <Spinner size="md" color="judicial.gold" />
        </Center>
      ) : sessionsList.length === 0 ? (
        <VStack spacing={4} py={10} px={2} align="center" justify="center">
          <Center 
            w={12} 
            h={12} 
            borderRadius="full" 
            bg={cv_gray_100_rgba_212_175_55_0_08} 
            border="1px dashed" 
            borderColor="rgba(212, 175, 55, 0.3)"
          >
            <Icon as={FiMessageSquare} w={5} h={5} color="judicial.gold" />
          </Center>
          <VStack spacing={1} textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color={textColor}>
              No Conversations
            </Text>
            <Text fontSize="xs" color="gray.500" maxW="200px" lineHeight="1.4">
              Create a new session above to start asking legal questions.
            </Text>
          </VStack>
        </VStack>
      ) : (
        <VStack spacing={3} align="stretch">
          {sessionsList.map(session => {
            const isActive = slug === session.slug;
            const isEditing = editingSlug === session.slug;

            return (
              <Box
                key={session.slug}
                p={3.5}
                borderRadius="xl"
                bg={isActive ? cv_white_rgba_212_175_55_0_08 : cv_white_transparent}
                border="1px solid"
                borderColor={isActive ? 'judicial.gold' : cv_gray_100_transparent}
                cursor="pointer"
                onClick={() => {
                  const comp = user?.companySlug || 'legal';
                  navigate(`/${comp}/${session.slug}`);
                }}
                transition="all 0.25s cubic-bezier(.08,.52,.52,1)"
                boxShadow={isActive ? '0 4px 15px rgba(212, 175, 55, 0.1)' : 'none'}
                position="relative"
                role="group"
                _hover={{
                  transform: 'translateY(-1px)',
                  bg: cv_gray_50_rgba_212_175_55_0_04,
                  borderColor: isActive ? 'judicial.gold' : cv_gray_300_rgba_212_175_55_0_15,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <Box 
                    position="absolute" 
                    left={0} 
                    top="20%" 
                    bottom="20%" 
                    w="3px" 
                    bg="judicial.gold" 
                    borderRadius="full" 
                  />
                )}
                
                <HStack justify="space-between" mb={2}>
                  <Badge 
                    fontSize="2xs" 
                    px={2} 
                    py={0.5} 
                    borderRadius="md"
                    colorScheme={
                      session.feature === 'document_ready' ? 'purple' :
                      session.feature === 'legal_analysis' ? 'green' : 'yellow'
                    }
                    variant="subtle"
                    textTransform="uppercase"
                    fontWeight="bold"
                  >
                    {session.feature?.replace('_', ' ') || 'Chat'}
                  </Badge>

                  <HStack spacing={1}>
                    <Text fontSize="2xs" color="gray.400" fontWeight="medium">
                      {new Date(session.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>

                    {/* Edit & Delete Action Buttons */}
                    {!isEditing && (
                      <HStack spacing={0.5} opacity={0.65} _groupHover={{ opacity: 1 }} transition="opacity 0.2s">
                        <Tooltip label="Rename title" fontSize="2xs">
                          <IconButton
                            icon={<FiEdit2 />}
                            size="xs"
                            variant="ghost"
                            colorScheme="yellow"
                            aria-label="Edit title"
                            onClick={(e) => handleStartEdit(e, session)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete chat" fontSize="2xs">
                          <IconButton
                            icon={<FiTrash2 />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete session"
                            onClick={(e) => handleConfirmDelete(e, session)}
                          />
                        </Tooltip>
                      </HStack>
                    )}
                  </HStack>
                </HStack>

                {isEditing ? (
                  <HStack onClick={(e) => e.stopPropagation()} spacing={1} mt={1}>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle(e, session.slug);
                        if (e.key === 'Escape') setEditingSlug(null);
                      }}
                      size="xs"
                      borderRadius="md"
                      borderColor="judicial.gold"
                      autoFocus
                    />
                    <IconButton
                      icon={<FiCheck />}
                      size="xs"
                      colorScheme="green"
                      aria-label="Save title"
                      isLoading={isSubmitting}
                      onClick={(e) => handleSaveTitle(e, session.slug)}
                    />
                    <IconButton
                      icon={<FiX />}
                      size="xs"
                      variant="ghost"
                      aria-label="Cancel editing"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSlug(null);
                      }}
                    />
                  </HStack>
                ) : (
                  <Text 
                    fontSize="xs" 
                    noOfLines={2} 
                    color={isActive ? textColor : cv_gray_600_gray_400}
                    fontWeight={isActive ? "semibold" : "normal"}
                    lineHeight="1.4"
                  >
                    {session.title || session.preview || "No message preview"}
                  </Text>
                )}
              </Box>
            );
          })}
        </VStack>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="md" fontWeight="bold">
              Delete Chat Session
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm">
              Are you sure you want to delete this chat session? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} size="sm" onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" size="sm" onClick={handleDeleteSession} isLoading={isSubmitting} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default HistorySubSidebar;
