import React from 'react';
import {
  Flex, Box, VStack, Tooltip, Icon, Text, IconButton, useColorModeValue
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FiGrid, FiMessageSquare, FiCpu, FiLayers, FiClock, FiFileText, FiGlobe, FiSettings, FiRefreshCw } from 'react-icons/fi';
import JusticeIcon from '../../../components/JusticeIcon';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const IconSidebar = () => {
  const {
    activeTab, setActiveTab, colorMode, toggleColorMode, logout, borderColor
  } = useAdvancedChat();

  const cv_white_gray_900 = useColorModeValue('white', 'gray.900');
  const cv_gray_600_gray_450 = useColorModeValue('gray.600', 'gray.450');
  const cv_gray_100_rgba_212_175_55_0_08 = useColorModeValue('gray.100', 'rgba(212, 175, 55, 0.08)');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'history', label: 'History', icon: FiMessageSquare },
    { id: 'research', label: 'Deep Research', icon: FiCpu },
    { id: 'review', label: 'Parallel Review', icon: FiLayers },
    { id: 'chronology', label: 'Time Chronology', icon: FiClock },
    { id: 'drafting', label: 'Drafting', icon: FiFileText },
    { id: 'profile', label: 'Company Profile', icon: FiGlobe },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  return (
    <Flex
      w="70px"
      h="full"
      bg={cv_white_gray_900}
      borderRight="1px solid"
      borderColor={borderColor}
      direction="column"
      justify="space-between"
      zIndex={10}
      boxShadow="sm"
    >
      <Box w="full">
        {/* Header logo alignment box */}
        <Box 
          h="60px" 
          borderBottom="1px solid" 
          borderColor={borderColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box 
            cursor="pointer" 
            transition="transform 0.3s ease" 
            _hover={{ transform: 'scale(1.08)' }}
          >
            <JusticeIcon size="42px" />
          </Box>
        </Box>
        
        <VStack spacing={2.5} w="full" pt={5} align="center">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <Tooltip key={tab.id} label={tab.label} placement="right">
                <VStack
                  spacing={1}
                  align="center"
                  justify="center"
                  w="90%"
                  py={2}
                  px={1}
                  borderRadius="xl"
                  cursor="pointer"
                  bg={isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent'}
                  border="1px solid"
                  borderColor={isActive ? 'rgba(212, 175, 55, 0.25)' : 'transparent'}
                  color={isActive ? 'judicial.gold' : cv_gray_600_gray_450}
                  transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
                  onClick={() => {
                    setActiveTab(prev => prev === tab.id ? 'closed' : tab.id);
                  }}
                  _hover={{
                    bg: isActive ? 'rgba(212, 175, 55, 0.18)' : cv_gray_100_rgba_212_175_55_0_08,
                    color: 'judicial.gold',
                    transform: 'translateY(-1px)',
                    borderColor: 'rgba(212, 175, 55, 0.3)',
                    boxShadow: '0 0 10px rgba(212, 175, 55, 0.18)'
                  }}
                >
                  <Icon as={tab.icon} w={5} h={5} mb={0.5} />
                  <Text fontSize="7.5px" fontWeight="bold" textAlign="center" lineHeight="1.2">
                    {tab.label}
                  </Text>
                </VStack>
              </Tooltip>
            );
          })}
        </VStack>
      </Box>

      <VStack spacing={4} align="center" pb={4}>
        <IconButton
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          size="sm"
          aria-label="Toggle color mode"
        />
        <IconButton
          icon={<Icon as={FiRefreshCw} />}
          onClick={logout}
          variant="ghost"
          colorScheme="red"
          size="sm"
          aria-label="Logout"
        />
      </VStack>
    </Flex>
  );
};

export default IconSidebar;
