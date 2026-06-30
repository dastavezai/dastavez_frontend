import React from 'react';
import {
  VStack, Box, Text, Button, Badge, Spinner, Input, InputGroup, InputRightElement, useColorModeValue, useColorMode, HStack, Center,
  FormControl, FormLabel, Progress, Icon, IconButton, Select
} from '@chakra-ui/react';
import { FiClock, FiUploadCloud, FiMessageSquare, FiCpu, FiLayers, FiFileText, FiZap, FiEdit, FiGlobe } from 'react-icons/fi';
import { FaFile, FaTimes, FaPaperclip } from 'react-icons/fa';
import { AddIcon } from '@chakra-ui/icons';
import { useAdvancedChat } from '../AdvancedChatContext';


const SubSidebar = () => {
  const {
    activeTab, setActiveTab,
    chronologyFiles, handleChronologyFilesUpload,
    handleStartChronology, handleResetChronology, chronologyStatus,
    sessionsList, sessionsListLoading,
    isUploading, uploadProgress, handleFileUpload,
    remainingMessages, user, slug,
    selectedFile,
    researchStatus, researchAgentStage, researchElapsed, researchEta, isReportPanelOpen,
    setResearchStatus, setResearchResults, setResearchSessionId, setIsReportPanelOpen, handleStartDeepResearch,
    chronologyElapsed, chronologyEta, isTimelinePanelOpen, chronologyResults, chronologyAgentStage,
    setChronologyStatus, setChronologyResults, setChronologySessionId, setChronologyFiles, setIsTimelinePanelOpen,
    reviewFiles, setReviewFiles, reviewStatus, setReviewStatus,
    setMessages,
    bulkReviewSessionId, setBulkReviewSessionId, bulkReviewResults, bulkReviewElapsed, bulkReviewEta, isBulkReviewPanelOpen, setIsBulkReviewPanelOpen, handleStartBulkReview,
    onboardCompanyName, setOnboardCompanyName,
    onboardSector, setOnboardSector,
    isOnboardingSubmitLoading, handleOnboardSubmit,
    language, setLanguage, navigate,
    handleSuggestedActionClick,
    startNewSession,
  } = useAdvancedChat();

  const uploading = isUploading;
  const safeActionClick = handleSuggestedActionClick || (() => {});
  const textColor = useColorModeValue('gray.800', 'white');
  const FILE_COLORS = ['blue', 'green', 'purple', 'orange', 'teal', 'cyan', 'pink', 'red', 'yellow'];

  const { colorMode, toggleColorMode } = useColorMode();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Rules of Hooks fixes:
  const bgBox = useColorModeValue('white', 'gray.900');
  const bgHistoryActive = useColorModeValue('blue.50', 'gray.900');
  const bgHistoryHover = useColorModeValue('gray.100', 'gray.850');
  const colorHistoryActive = useColorModeValue('blue.600', 'blue.300');

  switch (activeTab) {
      case 'dashboard':
        return (
          <VStack spacing={4} align="stretch">
            <Box p={4} borderRadius="lg" bg={bgBox} border="1px solid" borderColor={borderColor}>
              <Text fontSize="sm" fontWeight="bold">Balance Summary</Text>
              <Text fontSize="2xl" fontWeight="black" mt={2} color="judicial.gold">
                {remainingMessages !== null ? `${remainingMessages} Left` : 'Unlimited'}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>Remaining messages today</Text>
            </Box>
            <Box p={4} borderRadius="lg" bg={bgBox} border="1px solid" borderColor={borderColor}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Workspace Details</Text>
              <VStack align="stretch" mt={3} spacing={2} fontSize="sm">
                <HStack justify="space-between">
                  <Text color="gray.500">Company:</Text>
                  <Text fontWeight="semibold">{user?.companyName || 'N/A'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.500">Sector:</Text>
                  <Text fontWeight="semibold" textTransform="capitalize">{user?.sector || 'N/A'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.500">Slug:</Text>
                  <Badge colorScheme="blue">{user?.companySlug || 'N/A'}</Badge>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        );

      case 'history':
        return (
          <VStack spacing={2} align="stretch">
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<AddIcon />}
              onClick={() => {
                startNewSession();
              }}
              w="full"
              mb={2}
            >
              New Chat Session
            </Button>
            {sessionsListLoading ? (
              <Center py={6}><Spinner size="sm" /></Center>
            ) : sessionsList.length === 0 ? (
              <Text fontSize="xs" color="gray.500" textAlign="center">No conversation history yet.</Text>
            ) : (
              sessionsList.map(session => {
                const isActive = slug === session.slug;
                return (
                  <Box
                    key={session.slug}
                    p={3}
                    borderRadius="md"
                    bg={isActive ? bgHistoryActive : 'transparent'}
                    border={isActive ? '1px solid' : 'none'}
                    borderColor={isActive ? 'blue.200' : 'transparent'}
                    cursor="pointer"
                    onClick={() => navigate(`/c/${session.slug}`)}
                    _hover={{ bg: bgHistoryHover }}
                  >
                    <HStack justify="space-between" mb={1}>
                      <Badge size="xs" colorScheme={
                        session.feature === 'document_ready' ? 'purple' :
                        session.feature === 'legal_analysis' ? 'green' : 'blue'
                      }>
                        {session.feature.replace('_', ' ')}
                      </Badge>
                      <Text fontSize="2xs" color="gray.400">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="semibold" noOfLines={1} color={isActive ? colorHistoryActive : textColor}>
                      {session.title || 'Conversation'}
                    </Text>
                    <Text fontSize="xs" noOfLines={1} mt={0.5} color="gray.500">
                      {session.preview}
                    </Text>
                  </Box>
                );
              })
            )}
          </VStack>
        );

      case 'research':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Upload a legal case file or contract to perform automated compliance analysis and deep legal context searches.
            </Text>
            <Box
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'blue.500' }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Icon as={FaPaperclip} w={6} h={6} color="blue.500" mb={2} />
              <Text fontSize="xs" fontWeight="bold">Click to Upload File</Text>
              <Text fontSize="2xs" color="gray.400" mt={1}>PDF, Word, TXT, images</Text>
            </Box>
            {(selectedFile || uploading) && (
              <Box p={3} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="md">
                {selectedFile ? (
                  <Text fontSize="xs" fontWeight="semibold" isTruncated>{selectedFile.fileName}</Text>
                ) : (
                  <Text fontSize="xs" fontWeight="semibold" isTruncated>Uploading File...</Text>
                )}
                {(uploadProgress > 0 || uploading) && (
                  <Progress value={uploadProgress || 100} isIndeterminate={uploadProgress === 0} size="xs" colorScheme="blue" mt={2} borderRadius="full" />
                )}
              </Box>
            )}

            {/* Start Deep Research Button */}
            {selectedFile && researchStatus === 'idle' && !uploading && (
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Icon as={FiCpu} />}
                onClick={handleStartDeepResearch}
                w="full"
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                🔬 Start Deep Research
              </Button>
            )}

            {/* Processing Status */}
            {(researchStatus === 'starting' || researchStatus === 'processing') && (
              <Box p={3} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="md" border="1px solid" borderColor="blue.200">
                <HStack spacing={2} mb={2}>
                  <Spinner size="xs" color="blue.500" />
                  <Text fontSize="xs" fontWeight="bold" color="blue.600">
                    Research in Progress
                  </Text>
                </HStack>
                <Text fontSize="2xs" color="gray.500" mb={2}>{researchAgentStage}</Text>
                <Progress
                  value={Math.min(100, (researchElapsed / researchEta) * 100)}
                  size="xs"
                  colorScheme="blue"
                  borderRadius="full"
                />
                <Text fontSize="2xs" color="gray.400" mt={1}>
                  ~{Math.max(0, researchEta - researchElapsed)}s remaining
                </Text>
                {!isReportPanelOpen && (
                  <Button
                    size="xs"
                    variant="link"
                    colorScheme="blue"
                    onClick={() => setIsReportPanelOpen(true)}
                    mt={2}
                  >
                    View Progress →
                  </Button>
                )}
              </Box>
            )}

            {/* Completed – View Report */}
            {(researchStatus === 'completed' || researchStatus === 'completed_with_errors') && (
              <VStack spacing={2} align="stretch">
                <Box p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" border="1px solid" borderColor="green.200">
                  <HStack spacing={2}>
                    <Text fontSize="sm">✅</Text>
                    <Text fontSize="xs" fontWeight="bold" color="green.600" isTruncated>
                      Research Complete
                    </Text>
                  </HStack>
                </Box>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant={isReportPanelOpen ? 'solid' : 'outline'}
                  onClick={() => setIsReportPanelOpen(!isReportPanelOpen)}
                  w="full"
                >
                   {isReportPanelOpen ? 'Hide Report' : 'View Report →'}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => {
                    setResearchStatus('idle');
                    setResearchResults(null);
                    setResearchSessionId(null);
                    setIsReportPanelOpen(false);
                    setMessages([]);
                    localStorage.removeItem('deepResearchSessionId');
                    startNewSession();
                  }}
                >
                  Start New Research
                </Button>
              </VStack>
            )}

            {/* Failed – Retry */}
            {researchStatus === 'failed' && (
              <Box p={3} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md">
                <Text fontSize="xs" color="red.600" fontWeight="bold" mb={2}>
                  ❌ Research Failed
                </Text>
                <Button
                  size="xs"
                  colorScheme="blue"
                  onClick={handleStartDeepResearch}
                  w="full"
                >
                  Retry
                </Button>
              </Box>
            )}
          </VStack>
        );

      case 'review':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Upload multiple legal briefs, contracts, or court transcripts to compare clause compliance and verify cross-document alignments.
            </Text>

            {/* Upload drop zone */}
            <Box
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'purple.500' }}
              onClick={() => document.getElementById('review-file-upload')?.click()}
            >
              <Icon as={FiLayers} w={6} h={6} color="purple.500" mb={2} />
              <Text fontSize="xs" fontWeight="bold">Click to Upload Files</Text>
              <Text fontSize="2xs" color="gray.400" mt={1}>PDF, Word, TXT, images (max 10)</Text>
            </Box>

            {/* Uploaded files list */}
            {reviewFiles.length > 0 && (
              <VStack spacing={1} align="stretch">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  {reviewFiles.length} file(s) queued
                </Text>
                {reviewFiles.map((f, i) => (
                  <HStack key={i} p={2} bg="purple.50" _dark={{ bg: 'purple.900' }} borderRadius="md" fontSize="xs">
                    <Icon as={FaFile} color={`${FILE_COLORS[i % FILE_COLORS.length]}.500`} boxSize={3} />
                    <Text flex={1} isTruncated fontWeight="medium">{f.file?.fileName || f.file?.name || 'File'}</Text>
                    {reviewStatus !== 'processing' && (
                      <IconButton
                        icon={<FaTimes />}
                        size="2xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setReviewFiles(prev => prev.filter((_, idx) => idx !== i))}
                        aria-label="Remove file"
                      />
                    )}
                  </HStack>
                ))}
                {reviewStatus !== 'processing' && reviewFiles.length > 0 && (
                  <HStack justify="space-between" mt={2}>
                    <Button size="xs" variant="ghost" colorScheme="red" onClick={() => setReviewFiles([])}>
                      Clear All
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="purple"
                      onClick={() => document.getElementById('review-file-upload')?.click()}
                    >
                      + Add more
                    </Button>
                  </HStack>
                )}
              </VStack>
            )}

            {/* Start Review button — needs at least 2 files */}
            {reviewFiles.length >= 2 && reviewStatus === 'idle' && (
              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<Icon as={FiLayers} />}
                w="full"
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                transition="all 0.2s"
                onClick={handleStartBulkReview}
              >
                🔍 Start Parallel Review ({reviewFiles.length} files)
              </Button>
            )}

            {reviewFiles.length === 1 && reviewStatus === 'idle' && (
              <Text fontSize="xs" color="orange.500" textAlign="center">
                Upload at least 2 files to start a parallel review.
              </Text>
            )}

            {/* Processing Status */}
            {(reviewStatus === 'starting' || reviewStatus === 'processing') && (
              <Box p={3} bg="purple.50" _dark={{ bg: 'purple.900' }} borderRadius="md" border="1px solid" borderColor="purple.200">
                <HStack spacing={2} mb={2}>
                  <Spinner size="xs" color="purple.500" />
                  <Text fontSize="xs" fontWeight="bold" color="purple.600">
                    Analyzing in Parallel
                  </Text>
                </HStack>
                <Progress
                  value={Math.min(100, (bulkReviewElapsed / bulkReviewEta) * 100)}
                  size="xs"
                  colorScheme="purple"
                  borderRadius="full"
                />
                <Text fontSize="2xs" color="gray.400" mt={1}>
                  ~{Math.max(0, bulkReviewEta - bulkReviewElapsed)}s remaining
                </Text>
                {!isBulkReviewPanelOpen && (
                  <Button size="xs" variant="link" colorScheme="purple" onClick={() => setIsBulkReviewPanelOpen(true)} mt={2}>
                    View Progress →
                  </Button>
                )}
              </Box>
            )}

            {/* Completed Status */}
            {(reviewStatus === 'completed' || reviewStatus === 'completed_with_errors') && (
              <VStack spacing={2} align="stretch">
                <Box p={3} bg="purple.50" _dark={{ bg: 'purple.900' }} borderRadius="md" border="1px solid" borderColor="purple.200">
                  <HStack spacing={2}>
                    <Text fontSize="sm">✅</Text>
                    <Text fontSize="xs" fontWeight="bold" color="purple.600">
                      Analysis Complete ({bulkReviewResults?.documents?.length || 0} docs)
                    </Text>
                  </HStack>
                </Box>
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant={isBulkReviewPanelOpen ? 'solid' : 'outline'}
                  onClick={() => setIsBulkReviewPanelOpen(!isBulkReviewPanelOpen)}
                  w="full"
                >
                  {isBulkReviewPanelOpen ? 'Hide Report' : 'View Report →'}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => {
                    setReviewFiles([]);
                    setReviewStatus('idle');
                    setBulkReviewSessionId(null);
                    setIsBulkReviewPanelOpen(false);
                    setMessages([]);
                    localStorage.removeItem('bulkReviewSessionId');
                    startNewSession();
                  }}
                >
                  Start New Review
                </Button>
              </VStack>
            )}

            {/* Failed */}
            {reviewStatus === 'failed' && (
              <Box p={3} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md">
                <Text fontSize="xs" color="red.600" fontWeight="bold" mb={2}>❌ Analysis Failed</Text>
                <Button size="xs" colorScheme="purple" onClick={handleStartBulkReview} w="full">
                  Retry
                </Button>
              </Box>
            )}

          </VStack>
        );

      case 'chronology':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Upload one or more files to extract and build a structured chronological timeline of events automatically.
            </Text>

            {/* Multi-file upload area */}
            <Box
              border="2px dashed"
              borderColor={borderColor}
              borderRadius="lg"
              p={4}
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'green.500' }}
              onClick={() => document.getElementById('chronology-file-upload')?.click()}
            >
              <Icon as={FiClock} w={6} h={6} color="green.500" mb={2} />
              <Text fontSize="xs" fontWeight="bold">Upload Files</Text>
              <Text fontSize="2xs" color="gray.400" mt={1}>Select one or multiple files</Text>
              <Text fontSize="2xs" color="gray.400">PDF, Word, TXT, images (max 10)</Text>
            </Box>

            {/* Uploaded files list */}
            {chronologyFiles.length > 0 && (
              <VStack spacing={1} align="stretch">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  {chronologyFiles.length} file(s) queued
                </Text>
                {chronologyFiles.map((f, i) => (
                  <HStack key={i} p={2} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" fontSize="xs">
                    <Icon as={FaFile} color={`${FILE_COLORS[i % FILE_COLORS.length]}.500`} boxSize={3} />
                    <Text flex={1} isTruncated fontWeight="medium">{f.file?.fileName || 'File'}</Text>
                    {chronologyStatus !== 'processing' && chronologyStatus !== 'starting' && (
                      <IconButton
                        icon={<FaTimes />}
                        size="2xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setChronologyFiles(prev => prev.filter((_, idx) => idx !== i))}
                        aria-label="Remove file"
                      />
                    )}
                  </HStack>
                ))}
                {chronologyStatus !== 'processing' && chronologyStatus !== 'starting' && chronologyFiles.length > 0 && (
                  <HStack justify="space-between" mt={2}>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setChronologyFiles([])}
                    >
                      Clear All
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="green"
                      onClick={() => document.getElementById('chronology-file-upload')?.click()}
                    >
                      + Add more files
                    </Button>
                  </HStack>
                )}
              </VStack>
            )}

            {/* Build Chronology Button */}
            {chronologyFiles.length > 0 && chronologyStatus === 'idle' && (
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<Icon as={FiClock} />}
                onClick={handleStartChronology}
                w="full"
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                {chronologyFiles.length === 1 
                  ? `${chronologyFiles[0].file?.name || 'File'} | Build Chronology` 
                  : `${chronologyFiles.length} files | Build Chronology`}
              </Button>
            )}

            {/* Processing Status */}
            {(chronologyStatus === 'starting' || chronologyStatus === 'processing') && (
              <Box p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" border="1px solid" borderColor="green.200">
                <HStack spacing={2} mb={2}>
                  <Spinner size="xs" color="green.500" />
                  <Text fontSize="xs" fontWeight="bold" color="green.600">
                    Building Timeline
                  </Text>
                </HStack>
                <Text fontSize="2xs" color="gray.500" mb={2}>{chronologyAgentStage}</Text>
                <Progress
                  value={Math.min(100, (chronologyElapsed / chronologyEta) * 100)}
                  size="xs"
                  colorScheme="green"
                  borderRadius="full"
                />
                <Text fontSize="2xs" color="gray.400" mt={1}>
                  ~{Math.max(0, chronologyEta - chronologyElapsed)}s remaining
                </Text>
                {!isTimelinePanelOpen && (
                  <Button size="xs" variant="link" colorScheme="green" onClick={() => setIsTimelinePanelOpen(true)} mt={2}>
                    View Progress →
                  </Button>
                )}
              </Box>
            )}

            {/* Completed */}
            {(chronologyStatus === 'completed' || chronologyStatus === 'completed_with_errors') && (
              <VStack spacing={2} align="stretch">
                <Box p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" border="1px solid" borderColor="green.200">
                  <HStack spacing={2}>
                    <Icon as={FiClock} color="green.600" />
                    <Text fontSize="xs" fontWeight="bold" color="green.600" isTruncated>
                      {chronologyFiles.length === 1 
                        ? `${chronologyFiles[0].file?.name || 'File'} Timeline Ready` 
                        : `${chronologyFiles.length} Files Timeline Ready`} ({chronologyResults?.events?.length || 0} events)
                    </Text>
                  </HStack>
                </Box>
                <Button
                  size="sm"
                  colorScheme="green"
                  variant={isTimelinePanelOpen ? 'solid' : 'outline'}
                  onClick={() => setIsTimelinePanelOpen(!isTimelinePanelOpen)}
                  w="full"
                >
                   {isTimelinePanelOpen ? 'Hide Timeline' : 'View Timeline →'}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => {
                    handleResetChronology();
                    setMessages([]);
                  }}
                >
                  Start New Chronology
                </Button>
              </VStack>
            )}

            {/* Failed */}
            {chronologyStatus === 'failed' && (
              <Box p={3} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md">
                <Text fontSize="xs" color="red.600" fontWeight="bold" mb={2}>❌ Timeline Failed</Text>
                <Button size="xs" colorScheme="green" onClick={handleStartChronology} w="full">
                  Retry
                </Button>
              </Box>
            )}
          </VStack>
        );

      case 'drafting':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.500">
              Select or design templates to draft custom affidavits, compliance notices, complaints, and general agreements.
            </Text>
            <Button
              size="sm"
              colorScheme="purple"
              leftIcon={<Icon as={FiFileText} />}
              onClick={() => safeActionClick({ type: 'CREATE_DOCUMENT', text: 'Draft a dynamic template document' })}
              w="full"
            >
              Browse Template Categories
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="teal"
              leftIcon={<Icon as={FiZap} />}
              onClick={() => safeActionClick({ type: 'PRECEDENCE_ANALYSIS', text: 'Analyze court precedents' })}
              w="full"
            >
              Precedence Analysis
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="orange"
              leftIcon={<Icon as={FiEdit} />}
              onClick={() => safeActionClick({ type: 'COUNTER_AFFIDAVIT', text: 'Create a counter affidavit response' })}
              w="full"
            >
              Counter Maker
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              leftIcon={<Icon as={FiGlobe} />}
              onClick={() => safeActionClick({ type: 'TRANSLATE_DOCUMENT', text: 'Translate a document file' })}
              w="full"
            >
              Document Translator
            </Button>
          </VStack>
        );

      case 'profile':
        return (
          <VStack spacing={4} align="stretch">
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Configure Permanent Slug</Text>
            <form onSubmit={handleOnboardSubmit}>
              <VStack spacing={3}>
                <FormControl size="sm">
                  <FormLabel fontSize="xs">Company Name</FormLabel>
                  <Input
                    size="sm"
                    value={onboardCompanyName}
                    onChange={(e) => setOnboardCompanyName(e.target.value)}
                  />
                </FormControl>
                <FormControl size="sm">
                  <FormLabel fontSize="xs">Sector</FormLabel>
                  <Select
                    size="sm"
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
                  colorScheme="blue"
                  type="submit"
                  isLoading={isOnboardingSubmitLoading}
                >
                  Update Company Settings
                </Button>
              </VStack>
            </form>
          </VStack>
        );

      case 'settings':
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
              <Select size="sm" value={colorMode} onChange={(e) => { toggleColorMode(); }}>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </Select>
            </FormControl>
          </VStack>
        );
      default:
        return null;
    }
  }

export default SubSidebar;
