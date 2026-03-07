import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  useColorModeValue,
  Text,
  Avatar,
  IconButton,
  Divider,
  Heading,
  PinInput,
  PinInputField,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Badge,
  Tooltip,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import { EditIcon, ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useAppTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import fileService from '../services/fileService';

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const { preferences: sharedPrefs, updatePreferences: saveSharedPrefs } = usePreferences();
  const { setTheme: applyTheme } = useAppTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [currentEmailOtp, setCurrentEmailOtp] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmailOtp, setNewEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState(1);

  
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordOTP, setPasswordOTP] = useState('');
  const [passwordChangeInitiated, setPasswordChangeInitiated] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);

  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [preferences, setPreferences] = useState({
    language: 'en',
    aiResponseLanguage: 'auto',
    defaultCourt: '',
    editorFontSize: 14,
    theme: 'system',
  });
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  useEffect(() => {
    setPreferences(prev => ({ ...prev, ...sharedPrefs }));
  }, [sharedPrefs]);

  
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);
  const chatUserMsgBg  = useColorModeValue('blue.50', 'blue.900');
  const chatAiMsgBg    = useColorModeValue('gray.50', 'gray.750');
  const accordionHover = useColorModeValue('gray.50', 'gray.750');

  const loadChatHistory = useCallback(async () => {
    if (chatLoaded) return;
    setIsChatLoading(true);
    try {
      const res = await axios.get('/api/chat/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgs = res.data?.messages || res.data || [];
      setChatHistory(Array.isArray(msgs) ? msgs : []);
      setChatLoaded(true);
    } catch (e) {
      setChatHistory([]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatLoaded, token]);

  const handleProfileUpdate = async () => {
    try {
      setIsUpdatingProfile(true);
      const response = await axios.put(
        '/api/profile/profile',
        { firstName, lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      updateUser(response.data);
      toast({
        title: 'Profile Updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not update profile',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    try {
      const response = await axios.post(
        '/api/auth/2fa/toggle',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTwoFactorEnabled(response.data.twoFactorEnabled);
      updateUser({ twoFactorEnabled: response.data.twoFactorEnabled });
      toast({
        title: response.data.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not update 2FA',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const initiateEmailChange = async () => {
    try {
      setLoading(true);
      await axios.post(
        '/api/profile/email/initiate-change',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmailStep(2);
      toast({
        title: 'OTP Sent',
        description: 'Please check your current email for OTP',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not send OTP',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyCurrentEmailOtp = async () => {
    try {
      setLoading(true);
      await axios.post(
        '/api/profile/email/verify-current',
        { otp: currentEmailOtp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmailStep(3);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid OTP',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const initiateNewEmail = async () => {
    try {
      setLoading(true);
      await axios.post(
        '/api/profile/email/initiate-new',
        { newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmailStep(4);
      toast({
        title: 'OTP Sent',
        description: 'Please check your new email for OTP',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not send OTP',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const completeEmailChange = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        '/api/profile/email/complete-change',
        { otp: newEmailOtp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      
      updateUser(prev => ({
        ...prev,
        email: response.data.email
      }));
      
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      
      setIsChangingEmail(false);
      setEmailStep(1);
      setCurrentEmailOtp('');
      setNewEmail('');
      setNewEmailOtp('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error changing email',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCurrentEmailOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/profile/email/resend-current-otp');
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error resending OTP',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendNewEmailOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/profile/email/resend-new-otp');
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error resending OTP',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePasswordChange = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/profile/password/initiate-change', {
        currentPassword,
      });
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setPasswordChangeInitiated(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error initiating password change',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePasswordChange = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('/api/profile/password/complete-change', {
        otp: passwordOTP,
        newPassword,
        confirmPassword,
      });
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setPasswordChangeInitiated(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOTP('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error changing password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendPasswordOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/profile/password/resend-otp');
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error resending OTP',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!uploadedImage) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      
      const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
      formData.append('profileImage', file);

      const uploadResponse = await axios.post('/api/profile/profile-image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.data && uploadResponse.data.imageUrl) {
        
        const updatedUser = {
          ...user,
          profileImage: uploadResponse.data.imageUrl
        };
        updateUser(updatedUser);

        onClose();
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not upload image',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  
  const renderSubscriptionSection = () => (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      mb={6}
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Subscription Plan</Heading>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" color={textColor}>
              Current Plan: {user?.subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
            </Text>
            <Text fontSize="sm" color={textColor}>
              {user?.subscriptionStatus === 'premium' 
                ? 'You have unlimited messages'
                : 'You have 5 messages per day'}
            </Text>
          </VStack>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/subscription')}
          >
            {user?.subscriptionStatus === 'premium' ? 'Manage Plan' : 'Upgrade Plan'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box 
        w="full" 
        py={{ base: 3, md: 4 }} 
        px={{ base: 4, md: 6 }} 
        bg={bgColor} 
        borderBottomWidth={1} 
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.lg">
          <Flex justify="space-between" align="center">
            <HStack spacing={{ base: 2, md: 4 }}>
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                variant="ghost"
                aria-label="Back to home"
                size={{ base: "md", md: "lg" }}
              />
              <Heading size={{ base: "md", md: "lg" }}>Profile</Heading>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.md" py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 4, md: 8 }} align="stretch">
          <Box textAlign="center">
            <Box position="relative" display="inline-block">
              <Avatar
                size={{ base: "xl", md: "2xl" }}
                name={user?.firstName + ' ' + user?.lastName}
                src={user?.profileImage}
              />
              <IconButton
                aria-label="Change profile picture"
                icon={<EditIcon />}
                size={{ base: "xs", md: "sm" }}
                colorScheme="blue"
                rounded="full"
                position="absolute"
                bottom={0}
                right={0}
                onClick={onOpen}
              />
            </Box>
          </Box>

          {renderSubscriptionSection()}

          <Box 
            p={{ base: 4, md: 6 }} 
            bg={bgColor} 
            borderRadius="xl" 
            borderWidth={1} 
            borderColor={borderColor}
          >
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <Heading size={{ base: "sm", md: "md" }} color={textColor}>Profile Information</Heading>
              <FormControl>
                <FormLabel color={textColor}>First Name</FormLabel>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  bg={bgColor}
                  size={{ base: "md", md: "lg" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Last Name</FormLabel>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  bg={bgColor}
                  size={{ base: "md", md: "lg" }}
                />
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={handleProfileUpdate}
                isLoading={isUpdatingProfile}
                size={{ base: "md", md: "lg" }}
              >
                Update Profile
              </Button>
            </VStack>
          </Box>

          <Box 
            p={{ base: 4, md: 6 }} 
            bg={bgColor} 
            borderRadius="xl" 
            borderWidth={1} 
            borderColor={borderColor}
          >
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <Heading size={{ base: "sm", md: "md" }} color={textColor}>Email Settings</Heading>
              <Text color={textColor} fontSize={{ base: "sm", md: "md" }}>Current Email: {user?.email}</Text>
              {!isChangingEmail ? (
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    setIsChangingEmail(true);
                    initiateEmailChange();
                  }}
                  size={{ base: "md", md: "lg" }}
                >
                  Change Email
                </Button>
              ) : (
                <>
                  {emailStep === 2 && (
                    <VStack spacing={{ base: 3, md: 4 }}>
                      <Text color={textColor} fontSize={{ base: "sm", md: "md" }}>Enter OTP sent to your current email</Text>
                      <HStack justify="center" spacing={{ base: 1, md: 2 }}>
                        <PinInput value={currentEmailOtp} onChange={setCurrentEmailOtp} size={{ base: "md", md: "lg" }}>
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                        </PinInput>
                      </HStack>
                      <Flex gap={4}>
                        <Button colorScheme="blue" onClick={verifyCurrentEmailOtp} size={{ base: "md", md: "lg" }}>
                          Verify OTP
                        </Button>
                        <Button
                          onClick={handleResendCurrentEmailOTP}
                          isLoading={loading}
                          variant="outline"
                        >
                          Resend OTP
                        </Button>
                        <Button
                          onClick={() => {
                            setIsChangingEmail(false);
                            setEmailStep(1);
                            setCurrentEmailOtp('');
                          }}
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      </Flex>
                    </VStack>
                  )}

                  {emailStep === 3 && (
                    <VStack spacing={{ base: 3, md: 4 }}>
                      <FormControl>
                        <FormLabel color={textColor}>New Email</FormLabel>
                        <Input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          size={{ base: "md", md: "lg" }}
                        />
                      </FormControl>
                      <Button colorScheme="blue" onClick={initiateNewEmail} size={{ base: "md", md: "lg" }}>
                        Send OTP to New Email
                      </Button>
                    </VStack>
                  )}

                  {emailStep === 4 && (
                    <VStack spacing={{ base: 3, md: 4 }}>
                      <Text color={textColor} fontSize={{ base: "sm", md: "md" }}>Enter OTP sent to {newEmail}</Text>
                      <HStack justify="center" spacing={{ base: 1, md: 2 }}>
                        <PinInput value={newEmailOtp} onChange={setNewEmailOtp} size={{ base: "md", md: "lg" }}>
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                          <PinInputField />
                        </PinInput>
                      </HStack>
                      <Flex gap={4}>
                        <Button colorScheme="blue" onClick={completeEmailChange} size={{ base: "md", md: "lg" }}>
                          Complete Email Change
                        </Button>
                        <Button
                          onClick={handleResendNewEmailOTP}
                          isLoading={loading}
                          variant="outline"
                        >
                          Resend OTP
                        </Button>
                        <Button
                          onClick={() => {
                            setIsChangingEmail(false);
                            setEmailStep(1);
                            setCurrentEmailOtp('');
                            setNewEmail('');
                            setNewEmailOtp('');
                          }}
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      </Flex>
                    </VStack>
                  )}
                </>
              )}
            </VStack>
          </Box>

          <Box 
            p={{ base: 4, md: 6 }} 
            bg={bgColor} 
            borderRadius="xl" 
            borderWidth={1} 
            borderColor={borderColor}
          >
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <Heading size={{ base: "sm", md: "md" }} color={textColor}>Password Settings</Heading>
              {!passwordChangeInitiated ? (
                <form onSubmit={handleInitiatePasswordChange}>
                  <FormControl mb={4}>
                    <FormLabel color={textColor}>Current Password</FormLabel>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </FormControl>
                  <Button colorScheme="blue" type="submit" isLoading={loading}>
                    Initiate Password Change
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCompletePasswordChange}>
                  <FormControl mb={4}>
                    <FormLabel color={textColor}>OTP</FormLabel>
                    <Input
                      value={passwordOTP}
                      onChange={(e) => setPasswordOTP(e.target.value)}
                      placeholder="Enter OTP"
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel color={textColor}>New Password</FormLabel>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel color={textColor}>Confirm New Password</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </FormControl>
                  <Button colorScheme="blue" type="submit" isLoading={loading}>
                    Complete Password Change
                  </Button>
                  <Button
                    onClick={handleResendPasswordOTP}
                    isLoading={loading}
                    variant="outline"
                    ml={4}
                  >
                    Resend OTP
                  </Button>
                  <Button
                    onClick={() => setPasswordChangeInitiated(false)}
                    variant="ghost"
                    ml={4}
                  >
                    Cancel
                  </Button>
                </form>
              )}
            </VStack>
          </Box>

          <Box 
            p={{ base: 4, md: 6 }} 
            bg={bgColor} 
            borderRadius="xl" 
            borderWidth={1} 
            borderColor={borderColor}
          >
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <Heading size={{ base: "sm", md: "md" }} color={textColor}>Security</Heading>
              <HStack justify="space-between">
                <Text color={textColor}>Two-Factor Authentication</Text>
                <Button variant="outline" onClick={handleToggleTwoFactor}>
                  {twoFactorEnabled ? 'Disable' : 'Enable'}
                </Button>
              </HStack>
              <Text color={textColor} fontSize="sm">
                {twoFactorEnabled ? 'OTP required on login' : 'Add an extra layer of security'}
              </Text>
            </VStack>
          </Box>

          <Box
            p={{ base: 4, md: 6 }}
            bg={bgColor}
            borderRadius="xl"
            borderWidth={1}
            borderColor={borderColor}
          >
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <Heading size={{ base: 'sm', md: 'md' }} color={textColor}>App Settings</Heading>

              <FormControl>
                <FormLabel color={textColor} fontSize="sm">UI Language</FormLabel>
                <Select
                  size="sm"
                  value={preferences.language}
                  onChange={(e) => setPreferences(p => ({ ...p, language: e.target.value }))}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontSize="sm">AI Response Language</FormLabel>
                <Select
                  size="sm"
                  value={preferences.aiResponseLanguage}
                  onChange={(e) => setPreferences(p => ({ ...p, aiResponseLanguage: e.target.value }))}
                >
                  <option value="auto">Auto-detect</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontSize="sm">Default Court</FormLabel>
                <Select
                  size="sm"
                  value={preferences.defaultCourt}
                  onChange={(e) => setPreferences(p => ({ ...p, defaultCourt: e.target.value }))}
                  placeholder="Select court"
                >
                  <option value="Supreme Court of India">Supreme Court of India</option>
                  <option value="Delhi High Court">Delhi High Court</option>
                  <option value="Bombay High Court">Bombay High Court</option>
                  <option value="Calcutta High Court">Calcutta High Court</option>
                  <option value="Madras High Court">Madras High Court</option>
                  <option value="Allahabad High Court">Allahabad High Court</option>
                  <option value="Karnataka High Court">Karnataka High Court</option>
                  <option value="Punjab & Haryana High Court">Punjab & Haryana High Court</option>
                  <option value="Gujarat High Court">Gujarat High Court</option>
                  <option value="Rajasthan High Court">Rajasthan High Court</option>
                  <option value="Kerala High Court">Kerala High Court</option>
                  <option value="District Court">District Court</option>
                  <option value="NCLT">NCLT</option>
                  <option value="NCLAT">NCLAT</option>
                  <option value="Consumer Forum">Consumer Forum</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontSize="sm">Editor Font Size: {preferences.editorFontSize}px</FormLabel>
                <Slider
                  min={10}
                  max={24}
                  step={1}
                  value={preferences.editorFontSize}
                  onChange={(val) => setPreferences(p => ({ ...p, editorFontSize: val }))}
                >
                  <SliderTrack><SliderFilledTrack /></SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontSize="sm">Theme</FormLabel>
                <Select
                  size="sm"
                  value={preferences.theme}
                  onChange={(e) => setPreferences(p => ({ ...p, theme: e.target.value }))}
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </FormControl>

              <Divider />

              <FormControl>
                <FormLabel color={textColor} fontSize="sm">Auto-Save Interval: {preferences.autoSaveInterval || 3}s</FormLabel>
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={preferences.autoSaveInterval || 3}
                  onChange={(val) => setPreferences(p => ({ ...p, autoSaveInterval: val }))}
                >
                  <SliderTrack><SliderFilledTrack /></SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontSize="sm">Default Jurisdiction</FormLabel>
                <Input
                  size="sm"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={preferences.defaultJurisdiction || ''}
                  onChange={(e) => setPreferences(p => ({ ...p, defaultJurisdiction: e.target.value }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontSize="sm">Scan Depth</FormLabel>
                <Select
                  size="sm"
                  value={preferences.scanDepth || 'thorough'}
                  onChange={(e) => setPreferences(p => ({ ...p, scanDepth: e.target.value }))}
                >
                  <option value="thorough">Thorough (recommended)</option>
                  <option value="basic">Basic (faster)</option>
                </Select>
              </FormControl>

              <Button
                colorScheme="blue"
                size="sm"
                isLoading={prefsSaving}
                onClick={async () => {
                  setPrefsSaving(true);
                  try {
                    const saved = await saveSharedPrefs(preferences);
                    setPreferences(prev => ({ ...prev, ...saved }));
                    updateUser({ preferences: { ...preferences, ...saved } });
                    // Sync theme with ThemeContext
                    const themeVal = (saved || preferences).theme;
                    if (themeVal === 'dark') applyTheme('parchmentDark');
                    else if (themeVal === 'light') applyTheme('parchment');
                    else {
                      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      applyTheme(prefersDark ? 'parchmentDark' : 'parchment');
                    }
                    toast({ title: 'Settings saved', status: 'success', duration: 2000 });
                  } catch (err) {
                    toast({ title: 'Failed to save settings', status: 'error', duration: 3000 });
                  } finally {
                    setPrefsSaving(false);
                  }
                }}
              >
                Save Settings
              </Button>
            </VStack>
          </Box>

          <Box
            bg={bgColor}
            borderRadius="xl"
            borderWidth={1}
            borderColor={borderColor}
            overflow="hidden"
          >
            <Accordion allowToggle onChange={(idx) => { if (idx === 0) loadChatHistory(); }}>
              <AccordionItem border="none">
                <AccordionButton
                  px={{ base: 4, md: 6 }}
                  py={{ base: 3, md: 4 }}
                  _hover={{ bg: accordionHover }}
                >
                  <Box flex={1} textAlign="left">
                    <HStack>
                      <Heading size={{ base: 'sm', md: 'md' }} color={textColor}>
                        Chat History
                      </Heading>
                      <Badge colorScheme="gray" fontSize="2xs">Read-only</Badge>
                    </HStack>
                    <Text fontSize="xs" color={textColor} mt={0.5}>
                      Previous AI assistant conversations
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel px={{ base: 4, md: 6 }} pb={4}>
                  {isChatLoading && (
                    <HStack justify="center" py={6}>
                      <Spinner size="sm" color="blue.400" />
                      <Text fontSize="sm" color={textColor}>Loading…</Text>
                    </HStack>
                  )}
                  {!isChatLoading && chatHistory.length === 0 && (
                    <Text fontSize="sm" color={textColor} textAlign="center" py={4}>
                      No chat history found.
                    </Text>
                  )}
                  {!isChatLoading && chatHistory.length > 0 && (
                    <VStack align="stretch" spacing={2} maxH="360px" overflowY="auto">
                      {chatHistory.map((msg, i) => (
                        <Box
                          key={msg._id || i}
                          p={3}
                          borderRadius="lg"
                          bg={msg.role === 'user'
                            ? chatUserMsgBg
                            : chatAiMsgBg
                          }
                        >
                          <HStack mb={1} spacing={2}>
                            <Badge
                              colorScheme={msg.role === 'user' ? 'blue' : 'purple'}
                              fontSize="2xs"
                            >
                              {msg.role === 'user' ? 'You' : 'AI'}
                            </Badge>
                            {msg.createdAt && (
                              <Text fontSize="2xs" color={textColor}>
                                {new Date(msg.createdAt).toLocaleString()}
                              </Text>
                            )}
                          </HStack>
                          <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap" noOfLines={5}>
                            {msg.content || msg.message || ''}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>

          <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "md" }}>
            <ModalOverlay />
            <ModalContent mx={{ base: 4, md: 0 }}>
              <ModalHeader fontSize={{ base: "lg", md: "xl" }}>Update Profile Picture</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={{ base: 3, md: 4 }}>
                  {uploadedImage && (
                    <Avatar
                      size={{ base: "xl", md: "2xl" }}
                      src={uploadedImage}
                    />
                  )}
                  <Button onClick={() => fileInputRef.current.click()} size={{ base: "md", md: "lg" }}>
                    Select Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  <Button
                    colorScheme="blue"
                    onClick={handleImageUpload}
                    isLoading={isUploadingImage}
                    isDisabled={!uploadedImage}
                    size={{ base: "md", md: "lg" }}
                  >
                    Upload Image
                  </Button>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  );
};

export default Profile; 