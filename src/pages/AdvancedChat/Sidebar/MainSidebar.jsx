import React from 'react';
import { VStack, IconButton, Tooltip, Icon, useColorMode, useColorModeValue, Spacer, Avatar } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { FiMessageSquare, FiClock, FiLayers, FiCpu, FiSettings, FiGrid, FiFileText, FiGlobe, FiZap, FiLogOut, FiRefreshCw, FiFolder, FiCamera } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAdvancedChat } from '../AdvancedChatContext';

const MainSidebar = () => {
  const { activeTab, setActiveTab, user, logout } = useAdvancedChat();
  const { colorMode, toggleColorMode } = useColorMode();
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <>
      {/* 1. Left-most Icon Sidebar */}
      <VStack
        w="70px"
        bg={useColorModeValue('white', 'gray.900')}
        borderRight="1px solid"
        borderColor={borderColor}
        py={4}
        spacing={6}
        align="center"
        justify="space-between"
        zIndex={10}
        boxShadow="sm"
      >
        <VStack spacing={6} align="center" w="full">
          <Link to="/">
            <Icon as={FiZap} w={6} h={6} color="judicial.gold" cursor="pointer" />
          </Link>
          
          <VStack spacing={4} w="full">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
              { id: 'history', label: 'History', icon: FiMessageSquare },
              { id: 'my_files', label: 'My Files', icon: FiFolder },
              { id: 'ocr_intelligence', label: 'OCR Intelligence', icon: FiCamera },
              { id: 'research', label: 'Deep Research', icon: FiCpu },
              { id: 'review', label: 'Parallel Review', icon: FiLayers },
              { id: 'chronology', label: 'Time Chronology', icon: FiClock },
              { id: 'drafting', label: 'Drafting', icon: FiFileText },
              { id: 'profile', label: 'Company Profile', icon: FiGlobe },
              { id: 'settings', label: 'Settings', icon: FiSettings }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <Tooltip key={tab.id} label={tab.label} placement="right">
                  <IconButton
                    icon={<Icon as={tab.icon} w={5} h={5} />}
                    onClick={() => setActiveTab(tab.id)}
                    variant={isActive ? 'solid' : 'ghost'}
                    colorScheme={isActive ? 'blue' : 'gray'}
                    bg={isActive ? 'blue.500' : 'transparent'}
                    color={isActive ? 'white' : useColorModeValue('gray.600', 'gray.400')}
                    _hover={{
                      bg: isActive ? 'blue.600' : useColorModeValue('gray.100', 'gray.800'),
                      color: isActive ? 'white' : 'blue.500'
                    }}
                    borderRadius="lg"
                    aria-label={tab.label}
                  />
                </Tooltip>
              );
            })}
          </VStack>
        </VStack>

        <VStack spacing={4} align="center">
          <Link to="/profile">
            <Avatar
              size="sm"
              name={user?.firstName}
              src={user?.profileImage}
              cursor="pointer"
              _hover={{ boxShadow: 'outline', border: '2px solid #3182ce' }}
            />
          </Link>
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
      </VStack>

    </>
  );
};

export default MainSidebar;
