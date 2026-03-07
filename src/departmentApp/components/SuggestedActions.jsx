import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Button,
  Text,
  useColorModeValue,
  Wrap,
  WrapItem,
  Tooltip,
} from '@chakra-ui/react';

const SuggestedActions = ({ suggestions, onActionClick, language = 'en', isActive = true }) => {
  const buttonBg = useColorModeValue('white', 'gray.700');
  const buttonBorder = useColorModeValue('blue.300', 'blue.500');
  const buttonHoverBg = useColorModeValue('blue.50', 'blue.800');
  const textColor = useColorModeValue('blue.600', 'blue.200');
  
  
  const disabledBg = useColorModeValue('gray.100', 'gray.800');
  const disabledBorder = useColorModeValue('gray.300', 'gray.600');
  const disabledText = useColorModeValue('gray.500', 'gray.500');

  if (!suggestions || suggestions.length === 0) return null;

  const handleClick = (suggestion) => {
    if (!isActive) return;
    
    console.log('🔘 SuggestedActions button clicked:', suggestion.action, suggestion);
    if (onActionClick) {
      console.log('📞 Calling onActionClick with:', suggestion.action);
      onActionClick(suggestion.action, suggestion);
    } else {
      console.error('❌ onActionClick is not defined!');
    }
  };

  const renderButton = (suggestion, label, icon, action) => {
    
    const displayLabel = icon && label && label.startsWith(icon) ? label.slice(icon.length).trimStart() : label;
    return (
    <Button
      size="sm"
      variant="outline"
      bg={isActive ? buttonBg : disabledBg}
      borderColor={isActive ? buttonBorder : disabledBorder}
      color={isActive ? textColor : disabledText}
      fontWeight="medium"
      borderRadius="full"
      px={4}
      py={2}
      height="auto"
      isDisabled={!isActive}
      cursor={isActive ? 'pointer' : 'not-allowed'}
      opacity={isActive ? 1 : 0.6}
      onMouseDown={(e) => {
        if (!isActive) return;
        e.stopPropagation();
        console.log('🖱️ MOUSEDOWN on button:', action);
      }}
      onClick={(e) => {
        if (!isActive) return;
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ CLICK event fired for:', action);
        handleClick({ ...suggestion, action });
      }}
      _hover={isActive ? {
        bg: buttonHoverBg,
        borderColor: 'blue.400',
        transform: 'translateY(-1px)',
        shadow: 'sm',
      } : {}}
      _active={isActive ? {
        transform: 'translateY(0)',
        shadow: 'none',
      } : {}}
      transition="all 0.15s ease"
    >
      <HStack spacing={2}>
        <Text fontSize="sm">{icon}</Text>
        <Text fontSize="sm">{displayLabel}</Text>
      </HStack>
    </Button>
  );
  };

  return (
    <Box mt={2} w="100%">
      <Wrap spacing={2} justify="flex-start">
        {suggestions.map((suggestion, index) => (
          <WrapItem key={index}>
            {suggestion.type === 'rating' ? (
              <Box>
                <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} mb={1}>
                  {suggestion.label}
                </Text>
                <HStack spacing={2}>
                  <Tooltip label={language === 'hi' ? 'अच्छा लगा' : 'I liked it'} placement="top" hasArrow>
                    {renderButton(suggestion, '', '😊', 'RATE_LIKE')}
                  </Tooltip>
                  <Tooltip label={language === 'hi' ? 'सुधार चाहिए' : 'Needs improvement'} placement="top" hasArrow>
                    {renderButton(suggestion, '', '😞', 'RATE_DISLIKE')}
                  </Tooltip>
                </HStack>
              </Box>
            ) : (
              <Tooltip 
                label={suggestion.description} 
                placement="top" 
                hasArrow
                openDelay={300}
              >
                {renderButton(suggestion, suggestion.label, suggestion.icon, suggestion.action)}
              </Tooltip>
            )}
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
};

export default SuggestedActions;
