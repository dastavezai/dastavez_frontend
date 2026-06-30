import React, { useEffect } from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { AdvancedChatProvider, useAdvancedChat } from './AdvancedChatContext';
import MainSidebar from './Sidebar/MainSidebar';
import SubSidebar from './Sidebar/SubSidebar';
import TimelinePanel from './Panels/TimelinePanel';
import PrecedencePanel from './Panels/PrecedencePanel';
import CounterMakerPanel from './Panels/CounterMakerPanel';
import ResearchPanel from './Panels/ResearchPanel';
import BulkReviewPanel from './Panels/BulkReviewPanel';
import DocumentEditor from './Editor/DocumentEditor';
import ChatInterface from './Chat/ChatInterface';

const AdvancedChatLayout = () => {
  const {
    activeTab,
    isTimelinePanelOpen,
    isPrecedencePanelOpen,
    isCounterMakerPanelOpen,
    isReportPanelOpen,
    isBulkReviewPanelOpen,
    isEditMode
  } = useAdvancedChat();

  const bgMain = useColorModeValue('gray.50', 'gray.900');

  // Logic to determine if a right panel is open
  const isRightPanelOpen = 
    (activeTab === 'chronology' && isTimelinePanelOpen) ||
    (activeTab === 'drafting' && isPrecedencePanelOpen) ||
    (activeTab === 'drafting' && isCounterMakerPanelOpen) ||
    (activeTab === 'research' && isReportPanelOpen) ||
    (activeTab === 'review' && isBulkReviewPanelOpen) ||
    isEditMode;

  return (
    <Flex h="100vh" w="100vw" overflow="hidden" bg={bgMain}>
      {/* 1. Main Sidebar */}
      <Box w="70px" borderRight="1px solid" borderColor={useColorModeValue('gray.200', 'gray.700')} bg={useColorModeValue('white', 'gray.900')}>
        <MainSidebar />
      </Box>

      {/* 2. Sub Sidebar */}
      <Box w="280px" p={5} borderRight="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} bg={useColorModeValue('white', 'gray.900')} overflowY="auto" boxShadow="sm">
        <SubSidebar />
      </Box>

      {/* 3. Main Chat Area */}
      <Box flex="1" position="relative" display="flex" flexDirection="column">
        <ChatInterface />
      </Box>

      {/* 4. Right Split Panel (Dynamic based on active feature) */}
      {isRightPanelOpen && (
        <Box w="45%" minW="400px" maxW="600px" borderLeft="1px" borderColor="gray.200" bg="white" overflowY="auto">
          {activeTab === 'chronology' && isTimelinePanelOpen && <TimelinePanel />}
          {activeTab === 'drafting' && isPrecedencePanelOpen && <PrecedencePanel />}
          {activeTab === 'drafting' && isCounterMakerPanelOpen && <CounterMakerPanel />}
          {activeTab === 'research' && isReportPanelOpen && <ResearchPanel />}
          {activeTab === 'review' && isBulkReviewPanelOpen && <BulkReviewPanel />}
          {isEditMode && <DocumentEditor />}
        </Box>
      )}
    </Flex>
  );
};

export default function AdvancedChatModular() {
  return (
    <AdvancedChatProvider>
      <AdvancedChatLayout />
    </AdvancedChatProvider>
  );
}