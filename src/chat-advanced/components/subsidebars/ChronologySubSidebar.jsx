import React from 'react';
import {
  VStack, Text, Box, Center, Icon, HStack, Spinner, Progress, IconButton, Button, useColorModeValue
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { FiFileText, FiClock } from 'react-icons/fi';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const ChronologySubSidebar = () => {
  const {
    isUploadingChronology, chronologyFiles, setChronologyFiles, triggerChronologyAction, chronologyStatus,
    setIsTimelinePanelOpen
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
        Analyze a list of events, legal summons, or case history text/files to compile a structured chronological order timeline of events automatically.
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
        onClick={() => document.getElementById('chronology-file-upload')?.click()}
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
          <Icon as={FiClock} w={5} h={5} color="judicial.gold" />
        </Center>
        <Text fontSize="xs" fontWeight="bold" color={cv_gray_800_gray_100} mb={1}>
          Upload Chronology File
        </Text>
        <Text fontSize="10px" color={cv_gray_550_gray_400}>
          Analyze timeline sources
        </Text>
      </Box>

      {/* Uploading Status Indicator */}
      {isUploadingChronology && (
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

      {/* List of Uploaded Chronology Files */}
      {chronologyFiles.length > 0 && (
        <VStack spacing={3} align="stretch">
          <Text fontSize="11px" fontWeight="bold" color="gray.500" textTransform="uppercase">
            Uploaded Files ({chronologyFiles.length})
          </Text>
          <VStack spacing={2} align="stretch" maxH="220px" overflowY="auto">
            {chronologyFiles.map((cf, idx) => (
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
                      {cf.file?.fileName || cf.file?.name || `File ${idx + 1}`}
                    </Text>
                  </HStack>
                  <IconButton
                    icon={<FaTimes />}
                    size="2xs"
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: 'red.500' }}
                    onClick={() => {
                      setChronologyFiles(prev => prev.filter((_, i) => i !== idx));
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
            leftIcon={<Icon as={FiClock} />}
            onClick={triggerChronologyAction}
            isLoading={chronologyStatus === 'starting' || chronologyStatus === 'processing'}
            loadingText="Building Timeline..."
            _hover={{
              bg: 'judicial.lightGold',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
            }}
          >
            Build Chronology
          </Button>

          {chronologyStatus === 'completed' && (
            <Button
              size="sm"
              w="full"
              variant="outline"
              borderColor="judicial.gold"
              color="judicial.gold"
              borderRadius="xl"
              fontWeight="bold"
              onClick={() => setIsTimelinePanelOpen(true)}
              _hover={{ bg: 'rgba(212, 175, 55, 0.08)' }}
            >
              Open Chronology Timeline
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default ChronologySubSidebar;
