import React from 'react';
import {
  VStack, Text, Box, Center, Icon, HStack, Spinner, Progress, IconButton, Button, useColorModeValue
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { FiFileText, FiLayers } from 'react-icons/fi';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const ReviewSubSidebar = () => {
  const {
    isUploadingReview, reviewFiles, setReviewFiles, triggerParallelReviewAction, reviewStatus,
    setIsBulkReviewPanelOpen
  } = useAdvancedChat();

  const cv_gray_250_rgba_212_175_55_0_25 = useColorModeValue('gray.250', 'rgba(212, 175, 55, 0.25)');
  const cv_rgba_212_175_55_0_015_rgba_212_175_55_0_005 = useColorModeValue('rgba(212, 175, 55, 0.015)', 'rgba(212, 175, 55, 0.005)');
  const cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05 = useColorModeValue('rgba(212, 175, 55, 0.08)', 'rgba(212, 175, 55, 0.05)');
  const cv_gray_800_gray_100 = useColorModeValue('gray.800', 'gray.100');
  const cv_gray_550_gray_400 = useColorModeValue('gray.550', 'gray.400');
  const cv_gray_50_rgba_212_175_55_0_04 = useColorModeValue('gray.50', 'rgba(212, 175, 55, 0.04)');
  const cv_gray_850_gray_100 = useColorModeValue('gray.850', 'gray.100');
  const cv_gray_200_rgba_212_175_55_0_15 = useColorModeValue('gray.200', 'rgba(212, 175, 55, 0.15)');

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="xs" color="gray.550" _dark={{ color: 'gray.400' }} px={1} lineHeight="1.5">
        Parallel Review: Upload multiple legal briefs, contracts, or court transcripts to compare clause compliance and verify cross-document alignments.
      </Text>
      <Box
        role="group"
        position="relative"
        border="2px dashed"
        borderColor={cv_gray_250_rgba_212_175_55_0_25}
        borderRadius="xl"
        p={6}
        textAlign="center"
        cursor="pointer"
        bg={cv_rgba_212_175_55_0_015_rgba_212_175_55_0_005}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        onClick={() => document.getElementById('review-file-upload')?.click()}
        _hover={{ 
          borderColor: 'judicial.gold',
          bg: 'rgba(212, 175, 55, 0.04)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)'
        }}
      >
        <Center 
          mx="auto"
          w={12} 
          h={12} 
          borderRadius="full" 
          bg={cv_rgba_212_175_55_0_08_rgba_212_175_55_0_05}
          border="1px solid"
          borderColor="rgba(212, 175, 55, 0.2)"
          mb={3}
          transition="transform 0.4s ease"
          _groupHover={{ transform: 'rotate(15deg) scale(1.05)' }}
        >
          <Icon as={FiLayers} w={5} h={5} color="judicial.gold" />
        </Center>
        <Text fontSize="xs" fontWeight="bold" color={cv_gray_800_gray_100} mb={1}>
          Upload Multiple Files
        </Text>
        <Text fontSize="10px" color={cv_gray_550_gray_400}>
          Upload up to 10 files in parallel
        </Text>
      </Box>

      {/* Uploading Status Indicator */}
      {isUploadingReview && (
        <Box 
          p={3.5} 
          bg={cv_gray_50_rgba_212_175_55_0_04} 
          border="1px solid"
          borderColor="judicial.gold"
          borderRadius="xl"
        >
          <HStack spacing={2}>
            <Spinner size="xs" color="judicial.gold" />
            <Text fontSize="xs" fontWeight="bold" color={cv_gray_850_gray_100}>
              Uploading file(s)...
            </Text>
          </HStack>
          <Progress size="2xs" isIndeterminate colorScheme="yellow" mt={2} borderRadius="full" />
        </Box>
      )}

      {/* List of Uploaded Review Files */}
      {reviewFiles.length > 0 && (
        <VStack spacing={3} align="stretch">
          <Text fontSize="11px" fontWeight="bold" color="gray.500" textTransform="uppercase">
            Uploaded Files ({reviewFiles.length})
          </Text>
          <VStack spacing={2} align="stretch" maxH="220px" overflowY="auto">
            {reviewFiles.map((rf, idx) => (
              <Box
                key={idx}
                p={2.5}
                bg={cv_gray_50_rgba_212_175_55_0_04}
                border="1px solid"
                borderColor={cv_gray_200_rgba_212_175_55_0_15}
                borderRadius="lg"
              >
                <HStack justify="space-between">
                  <HStack spacing={2} maxW="85%">
                    <Icon as={FiFileText} color="judicial.gold" w={3.5} h={3.5} />
                    <Text fontSize="xs" isTruncated color={cv_gray_850_gray_100}>
                      {rf.file?.fileName || rf.file?.name || `File ${idx + 1}`}
                    </Text>
                  </HStack>
                  <IconButton
                    icon={<FaTimes />}
                    size="2xs"
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'red.500' }}
                    onClick={() => {
                      setReviewFiles(prev => prev.filter((_, i) => i !== idx));
                    }}
                    aria-label="Remove file"
                  />
                </HStack>
              </Box>
            ))}
          </VStack>

          <Button
            size="sm"
            w="full"
            bg="judicial.gold"
            color="judicial.dark"
            fontWeight="bold"
            borderRadius="xl"
            leftIcon={<Icon as={FiLayers} />}
            onClick={triggerParallelReviewAction}
            isLoading={reviewStatus === 'starting' || reviewStatus === 'processing'}
            loadingText="Reviewing..."
            _hover={{
              bg: 'judicial.lightGold',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
            }}
          >
            Start Parallel Review
          </Button>

          {reviewStatus === 'completed' && (
            <Button
              size="sm"
              w="full"
              variant="outline"
              borderColor="judicial.gold"
              color="judicial.gold"
              borderRadius="xl"
              fontWeight="bold"
              onClick={() => setIsBulkReviewPanelOpen(true)}
              _hover={{ bg: 'rgba(212, 175, 55, 0.08)' }}
            >
              Open Parallel Review
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default ReviewSubSidebar;
