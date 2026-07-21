import React from 'react';
import {
  VStack, Text, FormControl, FormLabel, Input, Select, Button, useColorModeValue
} from '@chakra-ui/react';
import { useAdvancedChat } from '../../context/AdvancedChatContext';

const ProfileSubSidebar = () => {
  const {
    onboardCompanyName, setOnboardCompanyName,
    onboardSector, setOnboardSector,
    handleOnboardSubmit, isOnboardingSubmitLoading
  } = useAdvancedChat();

  const cv_gray_550_gray_400 = useColorModeValue('gray.550', 'gray.400');
  const cv_gray_600_gray_400 = useColorModeValue('gray.600', 'gray.400');
  const cv_gray_250_rgba_212_175_55_0_25 = useColorModeValue('gray.250', 'rgba(212, 175, 55, 0.25)');
  const cv_white_rgba_212_175_55_0_005 = useColorModeValue('white', 'rgba(212, 175, 55, 0.005)');

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="xs" color="gray.550" _dark={{ color: 'gray.400' }} px={1} lineHeight="1.5">
        Set your legal organization metadata. Your company slug is generated from these settings to configure custom document routes.
      </Text>
      <form onSubmit={handleOnboardSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl id="company-name" isRequired>
            <FormLabel fontSize="11px" fontWeight="bold" color={cv_gray_600_gray_400} mb={1.5} textTransform="uppercase" letterSpacing="0.05em">
              Company Name
            </FormLabel>
            <Input
              size="sm"
              borderRadius="xl"
              borderColor={cv_gray_250_rgba_212_175_55_0_25}
              bg={cv_white_rgba_212_175_55_0_005}
              _focus={{
                borderColor: 'judicial.gold',
                boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.3)'
              }}
              value={onboardCompanyName}
              onChange={(e) => setOnboardCompanyName(e.target.value)}
              placeholder="e.g. Richardson & Associates"
            />
          </FormControl>
          
          <FormControl id="company-sector" isRequired>
            <FormLabel fontSize="11px" fontWeight="bold" color={cv_gray_600_gray_400} mb={1.5} textTransform="uppercase" letterSpacing="0.05em">
              Sector
            </FormLabel>
            <Select
              size="sm"
              borderRadius="xl"
              borderColor={cv_gray_250_rgba_212_175_55_0_25}
              bg={cv_white_rgba_212_175_55_0_005}
              _focus={{
                borderColor: 'judicial.gold',
                boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.3)'
              }}
              value={onboardSector}
              onChange={(e) => setOnboardSector(e.target.value)}
            >
              <option value="legal">Legal & Compliance</option>
              <option value="finance">Finance & Banking</option>
              <option value="tech">Technology & IT</option>
              <option value="healthcare">Healthcare & Pharma</option>
              <option value="realestate">Real Estate & Construction</option>
              <option value="retail">Retail & E-commerce</option>
              <option value="other">Other / General</option>
            </Select>
          </FormControl>

          <Button
            size="sm"
            w="full"
            bgGradient="linear(to-br, judicial.gold, judicial.accent)"
            color="judicial.dark"
            fontWeight="bold"
            borderRadius="xl"
            type="submit"
            isLoading={isOnboardingSubmitLoading}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              bgGradient: 'linear(to-br, judicial.lightGold, judicial.gold)',
              transform: 'translateY(-1.5px)',
              boxShadow: '0 6px 18px rgba(212, 175, 55, 0.2)'
            }}
            _active={{
              transform: 'translateY(0.5px)'
            }}
          >
            Update Company Settings
          </Button>
        </VStack>
      </form>
    </VStack>
  );
};

export default ProfileSubSidebar;
