import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Heading, Text, Button, Icon, Flex,
  SimpleGrid, Badge, Avatar,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  Container, Tooltip, Divider,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaBalanceScale, FaShieldAlt, FaBrain,
  FaArrowRight,
  FaCloudUploadAlt, FaRegFileAlt, FaGavel, FaFileSignature,
} from 'react-icons/fa';
import { MdGavel, MdOutlineDocumentScanner, MdPalette } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import UploadWizard from '../components/UploadWizard';

const MotionBox = motion(Box);


const FEATURES = [
  { icon: FaGavel, color: 'red', label: 'Counter Affidavit Drafting',
    desc: 'AI-generated para-wise replies to petitions with case law backing and court-ready formatting.' },
  { icon: FaBalanceScale, color: 'purple', label: 'Precedent Analysis Engine',
    desc: 'Matches relevant SC and High Court case law to your document with auto-cited references.' },
  { icon: FaShieldAlt, color: 'orange', label: 'Compliance & Risk Assessment',
    desc: 'Flags missing mandatory clauses, procedural violations, and rates risk severity.' },
  { icon: MdOutlineDocumentScanner, color: 'blue', label: 'Smart Document Scanning',
    desc: '10+ formats supported — PDF, DOCX, RTF, images with OCR. Extracts parties, dates, and causes.' },
  { icon: FaBrain, color: 'pink', label: 'AI Clause Detection',
    desc: 'Identifies weak, ambiguous, or flawed clauses with severity scoring and rewrite suggestions.' },
  { icon: FaFileSignature, color: 'green', label: 'A4 Word-Processor Editor',
    desc: 'Multi-page editing with real page breaks, track changes, and one-click DOCX/PDF export.' },
];


const HOW_STEPS = [
  { num: '01', label: 'Upload Your Document', desc: 'Drop a petition, agreement, notice, or any legal document — PDF, DOCX, or scanned image.' },
  { num: '02', label: 'AI Categorises & Extracts', desc: 'Our AI identifies the document type, matches templates, and extracts key fields automatically.' },
  { num: '03', label: 'Review Analysis Modules', desc: 'Inspect precedent matches, compliance flags, risk scores, and clause-level findings.' },
  { num: '04', label: 'Edit & Export', desc: 'Fill details, apply AI suggestions, draft counter affidavits, and export your final document.' },
];

const STATS = [
  { value: '660+', label: 'Legal Templates' },
  { value: '10+', label: 'Document Formats' },
  { value: '100%', label: 'Indian Law Focused' },
];

const USE_CASES = [
  { label: 'Counter Affidavits', desc: 'Generate structured para-wise replies with relevant case law for High Court and SC proceedings.' },
  { label: 'Service & Tender Disputes', desc: 'Analyse government order challenges with compliance checklists and precedent matching.' },
  { label: 'Criminal Pleadings', desc: 'Draft bail applications, quashing petitions, and FIR-related filings with statutory references.' },
  { label: 'Property & Rent Matters', desc: 'Lease agreements, eviction suits, and sale deeds with clause-level risk assessment.' },
];


const ThemeSwitcher = () => {
  const { activeTheme, setTheme, themeList } = useAppTheme();
  const current = themeList.find((t) => t.key === activeTheme);
  return (
    <Menu placement="bottom-end">
      <Tooltip label="Switch Theme" hasArrow>
        <MenuButton
          as={Button}
          size="sm"
          variant="ghost"
          leftIcon={<Icon as={MdPalette} />}
          fontSize="sm"
          px={3}
        >
          <Text display={{ base: 'none', md: 'inline' }}>
            {current?.icon} {current?.label}
          </Text>
          <Text display={{ base: 'inline', md: 'none' }}>{current?.icon}</Text>
        </MenuButton>
      </Tooltip>
      <MenuList minW="300px" py={2}>
        <Text px={3} pb={1} fontSize="xs" fontWeight="bold" opacity={0.5} textTransform="uppercase" letterSpacing="wider">
          Choose Theme
        </Text>
        <Divider mb={1} />
        {themeList.map((t) => (
          <MenuItem
            key={t.key}
            onClick={() => setTheme(t.key)}
            closeOnSelect
            icon={<Text fontSize="16px">{t.icon}</Text>}
            command={activeTheme === t.key ? '✓' : ''}
          >
            <VStack align="start" spacing={0}>
              <Text fontWeight={activeTheme === t.key ? 'bold' : 'normal'} fontSize="sm">{t.label}</Text>
              <Text fontSize="xs" opacity={0.6} noOfLines={1}>{t.desc}</Text>
            </VStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};


const LandingPage = () => {
  const { user, logout } = useAuth();
  const { activeTheme, chakraTheme } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [wizardOpen, setWizardOpen] = useState(false);

  
  const surface    = chakraTheme?.colors?.surface || {};
  const bg         = surface.bg      || '#0d1b2a';
  const cardBg     = surface.card    || '#162030';
  const border     = surface.border  || '#243447';
  const navbarBg   = surface.navbar  || 'rgba(10,22,37,0.92)';

  const isDark = chakraTheme?.config?.initialColorMode === 'dark';
  const textColor  = isDark ? '#e8dcc8' : '#1a1f36';
  const mutedColor = isDark ? '#8a9bb5' : '#64748b';
  const accentColor =
    activeTheme === 'parchmentDark' ? '#d4a84b' :
    '#a67c1d';

  const handleOpenEditor = (params) => navigate('/department/editor', { state: params });

  useEffect(() => {
    if (location?.state?.openWizard) setWizardOpen(true);
  }, [location?.state?.openWizard]);

  return (
    <Box minH="100vh" bg={bg} color={textColor}>

      <Box as="nav" position="sticky" top={0} zIndex={200} bg={navbarBg}
        backdropFilter="blur(16px)" borderBottom="1px solid" borderColor={border}>
        <Container maxW="7xl" py={3}>
          <HStack justify="space-between">
            <HStack spacing={2} cursor="pointer" onClick={() => navigate('/department')}>
              <Icon as={MdGavel} color={accentColor} boxSize={6} />
              <Text fontWeight="800" fontSize="lg" letterSpacing="tight" color={textColor}>Dastavezai</Text>
              <Badge fontSize="2xs" px={2} py={0.5} borderRadius="full"
                bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'}>Beta</Badge>
            </HStack>
            <HStack spacing={2}>
              <ThemeSwitcher />
              {user ? (
                <>
                  <Button size="sm" bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'}
                    fontWeight="700" leftIcon={<Icon as={FaCloudUploadAlt} />}
                    onClick={() => setWizardOpen(true)} _hover={{ opacity: 0.88 }}>
                    New Document
                  </Button>
                  <Menu>
                    <MenuButton as={Button} size="sm" variant="ghost" borderRadius="full" px={2}>
                      <HStack spacing={2}>
                        <Avatar size="xs" name={user.fullName || user.email} />
                        <Text fontSize="sm" maxW="120px" noOfLines={1} display={{ base: 'none', md: 'inline' }}>
                          {user.fullName || user.email}
                        </Text>
                      </HStack>
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => navigate('/department/profile')}>Profile</MenuItem>
                      <MenuItem onClick={() => navigate('/department/subscription')}>Subscription</MenuItem>
                      <MenuDivider />
                      <MenuItem color="red.400" onClick={logout}>Sign Out</MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <Button size="sm" bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'}
                  fontWeight="700" onClick={() => navigate('/department/login')} _hover={{ opacity: 0.88 }}>
                  Sign In
                </Button>
              )}
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Box pt={{ base: '80px', md: '120px' }} pb={{ base: '70px', md: '100px' }}
        px={4} position="relative" overflow="hidden">
        <Box position="absolute" top="0" left="50%" transform="translateX(-50%)"
          w="700px" h="380px" borderRadius="full" bg={accentColor}
          opacity={isDark ? 0.06 : 0.07} filter="blur(80px)" pointerEvents="none" />

        <Container maxW="3xl" textAlign="center" position="relative">
          <MotionBox initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge fontSize="xs" px={4} py={1} borderRadius="full" mb={5}
              bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'}
              fontWeight="700" letterSpacing="wider" textTransform="uppercase">
              AI-Powered Legal Document Platform
            </Badge>

            <Heading fontSize={{ base: '3xl', md: '5xl' }} lineHeight={1.15} mb={6}
              fontFamily={chakraTheme?.fonts?.heading || 'Georgia, serif'} color={textColor}>
              Draft, Analyse{' '}
              <Box as="span" style={{
                background: `linear-gradient(135deg, ${accentColor}, ${isDark ? '#a78bfa' : '#3b7bf8'})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                &amp; Perfect
              </Box>
              {' '}Legal Documents
            </Heading>

            <Text fontSize={{ base: 'md', md: 'lg' }} color={mutedColor} maxW="560px"
              mx="auto" mb={10} lineHeight={1.75}>
              Upload a petition, agreement, or deed — get instant AI analysis with precedent matching,
              risk scoring, and counter affidavit drafting for Indian courts.
            </Text>

            <Flex justify="center" gap={4} flexWrap="wrap">
              {user ? (
                <Button size="lg" bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'}
                  fontWeight="800" rightIcon={<Icon as={FaArrowRight} />}
                  onClick={() => setWizardOpen(true)} px={8} py={6} borderRadius="xl"
                  _hover={{ opacity: 0.88, transform: 'translateY(-2px)' }} transition="all 0.2s">
                  Start Editing a Document
                </Button>
              ) : (
                <Button size="lg" bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'}
                  fontWeight="800" rightIcon={<Icon as={FaArrowRight} />}
                  onClick={() => navigate('/department/login', { state: { from: '/department', openWizard: true } })} px={8} py={6} borderRadius="xl"
                  _hover={{ opacity: 0.88, transform: 'translateY(-2px)' }} transition="all 0.2s">
                  Sign In to Get Started
                </Button>
              )}
              <Button size="lg" variant="outline" borderColor={border} color={mutedColor}
                leftIcon={<Icon as={FaRegFileAlt} />}
                onClick={() => setWizardOpen(true)} isDisabled={!user}
                px={7} py={6} borderRadius="xl"
                _hover={{ borderColor: accentColor, color: textColor }} transition="all 0.2s">
                Start Blank Document
              </Button>
            </Flex>
          </MotionBox>
        </Container>
      </Box>

      
      <Box borderTop="1px solid" borderBottom="1px solid" borderColor={border} py={7} bg={cardBg}>
        <Container maxW="5xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {STATS.map((s, i) => (
              <MotionBox key={s.label} initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} textAlign="center">
                <Text fontSize="3xl" fontWeight="900" color={accentColor}>{s.value}</Text>
                <Text fontSize="xs" color={mutedColor} mt={1}>{s.label}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      
      <Box py={{ base: 14, md: 20 }} px={4}>
        <Container maxW="5xl">
          <VStack mb={12} spacing={3}>
            <Badge fontSize="xs" px={3} py={1} borderRadius="full"
              bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'} fontWeight="700">Intelligence Layer</Badge>
            <Heading size="lg" textAlign="center"
              fontFamily={chakraTheme?.fonts?.heading || 'Georgia, serif'}>
              What Dastavezai Does For You
            </Heading>
            <Text color={mutedColor} textAlign="center" maxW="480px">
              Every uploaded document is automatically scanned across six specialised legal AI modules — built for Indian courts.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
            {FEATURES.map((f, i) => (
              <MotionBox key={f.label} initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}
                bg={cardBg} border="1px solid" borderColor={border} borderRadius="2xl" p={6}
                _hover={{ borderColor: accentColor, transform: 'translateY(-3px)' }}
                style={{ transition: 'all 0.22s ease-out' }}>
                <Flex w="44px" h="44px" borderRadius="xl"
                  bg={isDark ? `${f.color}.900` : `${f.color}.50`}
                  align="center" justify="center" mb={4}>
                  <Icon as={f.icon} color={`${f.color}.${isDark ? '400' : '600'}`} boxSize={5} />
                </Flex>
                <Text fontWeight="700" fontSize="sm" mb={2} color={textColor}>{f.label}</Text>
                <Text fontSize="sm" color={mutedColor} lineHeight={1.65}>{f.desc}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      
      <Box py={{ base: 14, md: 20 }} px={4} bg={cardBg}>
        <Container maxW="5xl">
          <VStack mb={12} spacing={3}>
            <Badge fontSize="xs" px={3} py={1} borderRadius="full"
              bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'} fontWeight="700">Workflow</Badge>
            <Heading size="lg" textAlign="center"
              fontFamily={chakraTheme?.fonts?.heading || 'Georgia, serif'}>How It Works</Heading>
          </VStack>
          
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }}
            justify="center" gap={{ base: 8, md: 0 }}>
            {HOW_STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <Flex direction="column" align="center" flex="1" px={{ md: 4 }} maxW={{ md: '200px' }}>
                  <Flex w="58px" h="58px" borderRadius="full"
                    bg={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                    border="2px solid" borderColor={accentColor}
                    align="center" justify="center" mb={4} flexShrink={0}>
                    <Text fontWeight="900" color={accentColor} fontSize="md">{s.num}</Text>
                  </Flex>
                  <Text fontWeight="700" textAlign="center" fontSize="sm" mb={2} color={textColor}>{s.label}</Text>
                  <Text fontSize="xs" color={mutedColor} textAlign="center" lineHeight={1.65}>{s.desc}</Text>
                </Flex>
                {i < HOW_STEPS.length - 1 && (
                  <Flex align="center" pt="20px" flexShrink={0} display={{ base: 'none', md: 'flex' }}>
                    <Icon as={FaArrowRight} color={border} boxSize={4} />
                  </Flex>
                )}
              </React.Fragment>
            ))}
          </Flex>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box py={{ base: 14, md: 20 }} px={4}>
        <Container maxW="5xl">
          <VStack mb={12} spacing={3}>
            <Badge fontSize="xs" px={3} py={1} borderRadius="full"
              bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'} fontWeight="700">Use Cases</Badge>
            <Heading size="lg" textAlign="center"
              fontFamily={chakraTheme?.fonts?.heading || 'Georgia, serif'}>
              Built for Real Legal Work
            </Heading>
            <Text color={mutedColor} textAlign="center" maxW="480px">
              From High Court counter affidavits to property disputes — Dastavezai handles the full spectrum of Indian legal drafting.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {USE_CASES.map((uc, i) => (
              <MotionBox key={uc.label} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}
                bg={cardBg} border="1px solid" borderColor={border} borderRadius="2xl" p={6}
                _hover={{ borderColor: accentColor }} style={{ transition: 'border-color 0.2s' }}>
                <Text fontWeight="700" fontSize="md" mb={2} color={accentColor}>{uc.label}</Text>
                <Text fontSize="sm" color={mutedColor} lineHeight={1.65}>{uc.desc}</Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      
      {!user && (
        <Box py={{ base: 14, md: 20 }} px={4} textAlign="center">
          <Container maxW="2xl">
            <MotionBox initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              bg={cardBg} border="1px solid" borderColor={accentColor}
              borderRadius="2xl" p={{ base: 8, md: 12 }} position="relative" overflow="hidden">
              <Box position="absolute" inset={0} bg={accentColor} opacity={0.04} pointerEvents="none" />
              <VStack spacing={5} position="relative">
                <Heading size="lg" fontFamily={chakraTheme?.fonts?.heading || 'Georgia, serif'} color={textColor}>
                  Ready to transform your legal workflow?
                </Heading>
                <Text color={mutedColor} maxW="380px">
                  Join legal professionals using Dastavezai to draft, analyse, and perfect documents with AI.
                </Text>
                <Button size="lg" bg={accentColor} color={isDark ? '#0d1b2a' : '#ffffff'}
                  fontWeight="800" rightIcon={<Icon as={FaArrowRight} />}
                  onClick={() => navigate('/department/login')} px={10}
                  _hover={{ opacity: 0.88, transform: 'translateY(-2px)' }} transition="all 0.2s">
                  Get Started Free
                </Button>
              </VStack>
            </MotionBox>
          </Container>
        </Box>
      )}

      
      <Box py={6} borderTop="1px solid" borderColor={border} textAlign="center">
        <HStack justify="center" spacing={2} mb={1}>
          <Icon as={MdGavel} color={accentColor} boxSize={4} />
          <Text fontWeight="bold" fontSize="sm" color={textColor}>Dastavezai</Text>
        </HStack>
        <Text fontSize="xs" color={mutedColor}>
          &copy; {new Date().getFullYear()} Dastavezai — AI Legal Document Platform. Built for Indian Law.
        </Text>
      </Box>

      
      <UploadWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onOpenEditor={handleOpenEditor}
      />
    </Box>
  );
};

export default LandingPage;
