import React from 'react';
import {
  VStack, Text, Box, HStack, Center, Icon, Badge, useColorModeValue
} from '@chakra-ui/react';
import { FiGlobe, FiLayers, FiGrid, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const DashboardSubSidebar = () => {
  const { user, textColor } = useAdvancedChat();

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.45)', 'rgba(13, 17, 23, 0.25)');
  const cardBorderColor = useColorModeValue('rgba(212, 175, 55, 0.18)', 'rgba(212, 175, 55, 0.12)');
  const cardShadow = useColorModeValue('sm', '0 8px 32px 0 rgba(0, 0, 0, 0.3)');
  const cv_gray_50_rgba_212_175_55_0_12 = useColorModeValue('gray.50', 'rgba(212, 175, 55, 0.12)');

  return (
    <VStack spacing={4} align="stretch" w="full">
      {/* Quick Status Card */}
      <Box 
        p={5} 
        borderRadius="2xl" 
        bg={cardBg} 
        border="1px solid" 
        borderColor={cardBorderColor}
        boxShadow={cardShadow}
        backdropFilter="blur(8px)"
      >
        <HStack justify="space-between" mb={3}>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
            Engine Health
          </Text>
          <Icon as={FiCheckCircle} color="green.400" w={4} h={4} />
        </HStack>
        <HStack spacing={2} align="center">
          <Badge colorScheme="green" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="2xs">
            ONLINE
          </Badge>
          <Text fontSize="xs" color="gray.400">All services active</Text>
        </HStack>
      </Box>

      {/* Workspace Details Card */}
      <Box 
        p={5} 
        borderRadius="2xl" 
        bg={cardBg} 
        border="1px solid" 
        borderColor={cardBorderColor}
        boxShadow={cardShadow}
        backdropFilter="blur(8px)"
        transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
        _hover={{ 
          transform: 'translateY(-2px)', 
          boxShadow: '0 12px 24px rgba(212, 175, 55, 0.15)', 
          borderColor: 'judicial.gold' 
        }}
      >
        <HStack justify="space-between" mb={4}>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
            Workspace Details
          </Text>
          <Icon as={FiGlobe} color="judicial.gold" w={4} h={4} />
        </HStack>
        
        <VStack align="stretch" spacing={3.5}>
          <HStack align="center" spacing={3}>
            <Center w={7} h={7} borderRadius="md" bg={cv_gray_50_rgba_212_175_55_0_12} border="1px solid" borderColor="rgba(212, 175, 55, 0.15)">
              <Icon as={FiLayers} color="judicial.gold" w={3.5} h={3.5} />
            </Center>
            <Box flex={1}>
              <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="bold">Company</Text>
              <Text fontSize="sm" fontWeight="bold" color={textColor}>{user?.companyName || 'N/A'}</Text>
            </Box>
          </HStack>

          <HStack align="center" spacing={3}>
            <Center w={7} h={7} borderRadius="md" bg={cv_gray_50_rgba_212_175_55_0_12} border="1px solid" borderColor="rgba(212, 175, 55, 0.15)">
              <Icon as={FiGrid} color="judicial.gold" w={3.5} h={3.5} />
            </Center>
            <Box flex={1}>
              <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="bold">Sector</Text>
              <Text fontSize="sm" fontWeight="bold" color={textColor} textTransform="capitalize">{user?.sector || 'N/A'}</Text>
            </Box>
          </HStack>

          <HStack align="center" spacing={3}>
            <Center w={7} h={7} borderRadius="md" bg={cv_gray_50_rgba_212_175_55_0_12} border="1px solid" borderColor="rgba(212, 175, 55, 0.15)">
              <Icon as={FiGlobe} color="judicial.gold" w={3.5} h={3.5} />
            </Center>
            <Box flex={1}>
              <Text fontSize="2xs" color="gray.400" textTransform="uppercase" fontWeight="bold">Slug</Text>
              <Badge 
                colorScheme="yellow" 
                variant="subtle" 
                fontSize="2xs" 
                borderRadius="md" 
                px={2} 
                py={0.5} 
                bg="rgba(212, 175, 55, 0.15)"
                color="judicial.gold"
                border="1px solid"
                borderColor="rgba(212, 175, 55, 0.25)"
                maxW="full"
                textTransform="uppercase"
                fontWeight="bold"
              >
                {user?.companySlug || 'N/A'}
              </Badge>
            </Box>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default DashboardSubSidebar;
