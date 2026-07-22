import React from 'react';
import {
  Flex, HStack, Heading, Badge, Tooltip, Button, Spinner, Icon, Avatar, IconButton, useColorModeValue
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { FiEdit } from 'react-icons/fi';
import { MdDocumentScanner } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const HeaderBar = () => {
  const {
    activeTab, subscriptionStatus, remainingMessages, selectedFile,
    scanStatus, handleSmartScan, handleOpenEditor, user, language, toggleLanguage,
    handleClearChat, handleStartNewChat, borderColor, textColor
  } = useAdvancedChat();

  const cv_white_gray_900 = useColorModeValue('white', 'gray.900');
  const cv_gray_700_white = useColorModeValue('gray.700', 'white');
  const cv_gray_350_white = useColorModeValue('gray.350', 'white');
  const cv_rgba_212_175_55_0_05_rgba_212_175_55_0_08 = useColorModeValue('rgba(212, 175, 55, 0.05)', 'rgba(212, 175, 55, 0.08)');
  const cv_gray_600_gray_400 = useColorModeValue('gray.600', 'gray.400');
  const cv_gray_100_rgba_212_175_55_0_08 = useColorModeValue('gray.100', 'rgba(212, 175, 55, 0.08)');

  return (
    <Flex
      h="60px"
      align="center"
      justify="space-between"
      px={6}
      borderBottom="1px solid"
      borderColor={borderColor}
      bg={cv_white_gray_900}
    >
      <HStack spacing={4}>
        <Heading size="md" color={textColor} whiteSpace="nowrap" isTruncated maxW={{ base: '200px', md: '350px' }}>
          {activeTab === 'dashboard' ? 'Workspace Dashboard' :
           activeTab === 'history' ? 'Conversation Explorer' :
           activeTab === 'research' ? 'Deep Research Assistant' :
           activeTab === 'review' ? 'Parallel Document Review' :
           activeTab === 'chronology' ? 'Timeline Chronology Parser' :
           activeTab === 'drafting' ? 'Legal Drafting Workspace' :
           activeTab === 'profile' ? 'Company Metadata Setup' :
           'System Preferences'}
        </Heading>
        {subscriptionStatus === 'departmental' ? (
          <Badge colorScheme="purple" fontSize="sm">Departmental</Badge>
        ) : (subscriptionStatus === 'pro' || subscriptionStatus === 'premium') ? (
          <Badge colorScheme="green" fontSize="sm">Pro</Badge>
        ) : (subscriptionStatus === 'standard' || subscriptionStatus === 'basic') ? (
          <Badge colorScheme="blue" fontSize="sm">Standard</Badge>
        ) : (
          <Tooltip label="Upgrade to Standard/Pro for more features">
            <Badge colorScheme="yellow" fontSize="sm">
              {remainingMessages !== null ? `${remainingMessages} messages left today` : 'Free Plan'}
            </Badge>
          </Tooltip>
        )}
      </HStack>

      <HStack spacing={2}>
        {selectedFile && (
          <>
            <Button
              size="sm"
              colorScheme="green"
              variant={scanStatus === 'scanned' ? 'solid' : 'outline'}
              leftIcon={scanStatus === 'scanning' ? <Spinner size="xs" /> : <Icon as={MdDocumentScanner} />}
              onClick={handleSmartScan}
              isDisabled={scanStatus === 'scanning'}
            >
              {scanStatus === 'scanned' ? 'Scanned ✓' : 'Smart Scan'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              leftIcon={<Icon as={FiEdit} />}
              onClick={handleOpenEditor}
            >
              Edit
            </Button>
          </>
        )}
        <Link to="/profile">
          <Avatar
            size="sm"
            name={user?.firstName}
            src={user?.profileImage}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ 
              transform: 'scale(1.05)', 
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)', 
              border: '2px solid #d4af37' 
            }}
          />
        </Link>
        <Button
          size="sm"
          variant="outline"
          bg="transparent"
          color={cv_gray_700_white}
          borderColor={cv_gray_350_white}
          onClick={toggleLanguage}
          fontWeight="bold"
          transition="all 0.2s ease"
          _hover={{
            color: 'judicial.gold',
            borderColor: 'judicial.gold',
            bg: cv_rgba_212_175_55_0_05_rgba_212_175_55_0_08,
            transform: 'scale(1.02)'
          }}
          _active={{
            bg: 'transparent'
          }}
        >
          {language === 'en' ? 'EN' : 'हिं'}
        </Button>
        <Tooltip label="New Chat Session" placement="bottom">
          <IconButton
            icon={<AddIcon />}
            onClick={handleStartNewChat}
            variant="ghost"
            size="sm"
            aria-label="New chat session"
            color={cv_gray_600_gray_400}
            transition="all 0.2s ease"
            _hover={{
              color: 'judicial.gold',
              bg: cv_gray_100_rgba_212_175_55_0_08,
              transform: 'scale(1.05)'
            }}
            _active={{
              bg: 'transparent'
            }}
          />
        </Tooltip>
        <IconButton
          icon={<DeleteIcon />}
          onClick={handleClearChat}
          variant="ghost"
          size="sm"
          aria-label="Clear chat"
          color={cv_gray_600_gray_400}
          transition="all 0.2s ease"
          _hover={{
            color: 'judicial.gold',
            bg: cv_gray_100_rgba_212_175_55_0_08,
            transform: 'scale(1.05)'
          }}
          _active={{
            bg: 'transparent'
          }}
        />
      </HStack>
    </Flex>
  );
};

export default HeaderBar;
