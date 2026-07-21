import React from 'react';
import {
  Box, Heading, Tooltip, IconButton, useColorModeValue
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

import DashboardSubSidebar from '../subsidebars/DashboardSubSidebar';
import HistorySubSidebar from '../subsidebars/HistorySubSidebar';
import ResearchSubSidebar from '../subsidebars/ResearchSubSidebar';
import ReviewSubSidebar from '../subsidebars/ReviewSubSidebar';
import ChronologySubSidebar from '../subsidebars/ChronologySubSidebar';
import DraftingSubSidebar from '../subsidebars/DraftingSubSidebar';
import ProfileSubSidebar from '../subsidebars/ProfileSubSidebar';
import SettingsSubSidebar from '../subsidebars/SettingsSubSidebar';

const SubSidebarContainer = () => {
  const { activeTab, borderColor, handleStartNewChat } = useAdvancedChat();

  const cv_gray_50_gray_950 = useColorModeValue('gray.50', 'gray.950');
  const cv_gray_100_rgba_212_175_55_0_08 = useColorModeValue('gray.100', 'rgba(212, 175, 55, 0.08)');

  if (activeTab === 'closed') return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSubSidebar />;
      case 'history':
        return <HistorySubSidebar />;
      case 'research':
        return <ResearchSubSidebar />;
      case 'review':
        return <ReviewSubSidebar />;
      case 'chronology':
        return <ChronologySubSidebar />;
      case 'drafting':
        return <DraftingSubSidebar />;
      case 'profile':
        return <ProfileSubSidebar />;
      case 'settings':
        return <SettingsSubSidebar />;
      default:
        return null;
    }
  };

  return (
    <Box
      w="280px"
      bg={cv_gray_50_gray_950}
      borderRight="1px solid"
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Box 
        h="60px" 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between"
        px={4} 
        borderBottom="1px solid" 
        borderColor={borderColor}
      >
        <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500">
          {activeTab.replace('-', ' ')}
        </Heading>
        <Tooltip label="Start New Chat" placement="bottom">
          <IconButton
            icon={<AddIcon />}
            size="xs"
            variant="ghost"
            color="judicial.gold"
            _hover={{ bg: cv_gray_100_rgba_212_175_55_0_08 }}
            onClick={handleStartNewChat}
            aria-label="Start New Chat"
          />
        </Tooltip>
      </Box>
      
      <Box flex="1" overflowY="auto" p={4}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default SubSidebarContainer;
