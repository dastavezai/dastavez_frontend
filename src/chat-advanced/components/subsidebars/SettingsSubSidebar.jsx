import React from 'react';
import {
  VStack, Text, FormControl, FormLabel, Select, Badge, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, useColorModeValue
} from '@chakra-ui/react';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const SettingsSubSidebar = () => {
  const {
    language, setLanguage, colorMode, toggleColorMode, chatFontSize, setChatFontSize
  } = useAdvancedChat();

  const cv_gray_200_gray_700 = useColorModeValue('gray.200', 'gray.700');

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">App Preferences</Text>
      <FormControl>
        <FormLabel fontSize="xs">System Language</FormLabel>
        <Select size="sm" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English (EN)</option>
          <option value="hi">हिंदी (HI)</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Theme Mode</FormLabel>
        <Select size="sm" value={colorMode} onChange={() => toggleColorMode()}>
          <option value="light">Light Mode</option>
          <option value="dark">Dark Mode</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs" display="flex" justifyContent="space-between" alignItems="center">
          <span>Chat Font Size</span>
          <Badge colorScheme="purple" fontSize="10px" px={1.5} py={0.5} borderRadius="md">{chatFontSize}px</Badge>
        </FormLabel>
        <HStack spacing={4}>
          <Text fontSize="2xs" color="gray.400">Small</Text>
          <Slider
            min={12}
            max={20}
            step={1}
            value={chatFontSize}
            onChange={(val) => setChatFontSize(val)}
            focusThumbOnChange={false}
            flex={1}
          >
            <SliderTrack bg={cv_gray_200_gray_700} h="4px" borderRadius="full">
              <SliderFilledTrack bg="judicial.gold" />
            </SliderTrack>
            <SliderThumb boxSize={4} bg="white" borderColor="judicial.gold" borderWidth={2} shadow="md" _focus={{ boxShadow: 'none' }} />
          </Slider>
          <Text fontSize="2xs" color="gray.400">Large</Text>
        </HStack>
      </FormControl>
    </VStack>
  );
};

export default SettingsSubSidebar;
