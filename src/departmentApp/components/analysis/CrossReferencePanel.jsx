import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, Button, IconButton, useColorModeValue,
  Spinner, Collapse, Tooltip, Checkbox, Divider, useToast, Tag,
} from '@chakra-ui/react';
import {
  MdCompareArrows, MdExpandMore, MdExpandLess, MdDescription,
  MdWarning, MdCheckCircle, MdLink, MdUpload, MdDelete,
} from 'react-icons/md';
import { FaExchangeAlt, FaSearch, FaQuoteRight } from 'react-icons/fa';
import fileService from '../../services/fileService';

const CrossReferencePanel = ({ compact = false, onApplySuggestion, currentFileId }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const headingColor = useColorModeValue('blue.700', 'blue.300');

  
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await fileService.getUserFiles();
        const fileList = Array.isArray(res) ? res : (res?.files || []);
        
        setFiles(fileList.filter(f => f._id !== currentFileId));
      } catch {
        setFiles([]);
      } finally {
        setFilesLoading(false);
      }
    };
    loadFiles();
  }, [currentFileId]);

  const toggleFile = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleUploadForCompare = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fileService.uploadFile(file);
      const uploaded = res?.file || res;
      if (uploaded?._id) {
        setFiles(prev => [...prev, uploaded]);
        setSelectedFiles(prev => [...prev, uploaded._id]);
        toast({ title: `"${uploaded.fileName || file.name}" uploaded`, status: 'success', duration: 2500 });
      }
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, status: 'error', duration: 3000 });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [toast]);

  const runCrossReference = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast({ title: 'Select at least one document to compare', status: 'warning', duration: 2000 });
      return;
    }
    setLoading(true);
    try {
      const selectedNames = selectedFiles
        .map(id => files.find(f => f._id === id))
        .filter(Boolean)
        .map(f => f.fileName || f.originalName || 'Document')
        .join(', ');

      const prompt = `You are a senior Indian lawyer performing a CROSS-REFERENCE ANALYSIS between the current document and the following referenced documents: ${selectedNames}.

Analyze the current document and identify:
1. Clauses or terms that may CONFLICT with standard provisions in the referenced document types
2. MISSING cross-references that should be added
3. INCONSISTENT definitions or terms used differently
4. Related provisions that should be HARMONIZED

Return your response as a JSON object:
{
  "summary": "Brief summary of cross-reference findings",
  "totalIssues": <number>,
  "findings": [
    {
      "type": "conflict|missing_reference|inconsistency|harmonize",
      "severity": "high|medium|low",
      "title": "Brief title of the finding",
      "currentDocClause": "Text from current document or description of section",
      "referenceDoc": "Which referenced document",
      "referenceClause": "Related text from reference or what should exist",
      "recommendation": "What should be done",
      "suggestedText": "Optional corrected or additional text"
    }
  ],
  "sharedTerms": [
    {"term": "Term name", "currentDef": "How it's used here", "referenceDef": "How it's used in reference"}
  ],
  "citationOverlaps": [
    {"citation": "Case or statute citation", "inCurrent": true, "inReference": true, "note": "brief note"}
  ]
}

Provide 5-10 findings. Return ONLY JSON.`;

      const res = await fileService.aiChatAboutDocument(prompt, '', [], 'en');
      const raw = (res?.reply || res?.response || res?.message || '').trim();
      const jsonMatch = raw.match(/\{[\s\S]*"findings"[\s\S]*\}/);
      if (jsonMatch) {
        setResults(JSON.parse(jsonMatch[0]));
      } else {
        toast({ title: 'Could not parse cross-reference results', status: 'warning', duration: 3000 });
      }
    } catch (err) {
      console.error('Cross-reference error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      toast({ title: 'Cross-reference analysis failed', description: errMsg, status: 'error', duration: 4000 });
    } finally {
      setLoading(false);
    }
  }, [selectedFiles, files, toast]);

  const typeConfig = {
    conflict: { icon: MdWarning, color: 'red', label: 'Conflict' },
    missing_reference: { icon: MdLink, color: 'orange', label: 'Missing Ref' },
    inconsistency: { icon: MdCompareArrows, color: 'yellow', label: 'Inconsistent' },
    harmonize: { icon: MdCheckCircle, color: 'blue', label: 'Harmonize' },
  };

  const handleInsertFix = (finding) => {
    if (!finding.suggestedText) return;
    onApplySuggestion?.({
      title: finding.title,
      description: finding.recommendation || 'Cross-reference fix',
      originalText: finding.currentDocClause || '',
      suggestedText: finding.suggestedText,
      type: finding.currentDocClause ? 'clause_improvement' : 'insert_clause',
    });
  };

  return (
    <VStack spacing={3} align="stretch" h="100%">
      <Box px={compact ? 2 : 3} pt={compact ? 2 : 3}>
        <Text fontWeight="semibold" fontSize={compact ? 'sm' : 'md'}>
          Cross-Reference Analysis
        </Text>
        <Text fontSize="2xs" color={mutedColor}>
          Compare with other documents for conflicts and gaps
        </Text>
      </Box>

      <Box flex={1} overflowY="auto" px={compact ? 2 : 3} pb={2}>
        <Box mb={3}>
          <HStack justify="space-between" align="center" mb={1}>
            <Text fontSize="xs" fontWeight="bold" color={headingColor}>
              Select documents to compare:
            </Text>
            <Button
              size="xs" variant="ghost" colorScheme="blue"
              leftIcon={uploading ? <Spinner size="xs" /> : <Icon as={MdUpload} boxSize={3} />}
              onClick={() => fileInputRef.current?.click()}
              isDisabled={uploading}
              fontSize="2xs"
            >
              Upload
            </Button>
          </HStack>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,.docx,.doc,.txt,.rtf"
            onChange={handleUploadForCompare}
          />
          {filesLoading ? (
            <Spinner size="sm" />
          ) : files.length === 0 ? (
            <Text fontSize="2xs" color={mutedColor}>No documents yet. Click Upload to add one.</Text>
          ) : (
            <VStack spacing={1} align="stretch" maxH="150px" overflowY="auto">
              {files.slice(0, 20).map((f) => (
                <HStack
                  key={f._id}
                  spacing={2}
                  p={1.5}
                  bg={selectedFiles.includes(f._id) ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => toggleFile(f._id)}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                >
                  <Checkbox
                    size="sm"
                    isChecked={selectedFiles.includes(f._id)}
                    onChange={() => toggleFile(f._id)}
                  />
                  <Icon as={MdDescription} color={mutedColor} boxSize={3} />
                  <Text fontSize="2xs" color={textColor} noOfLines={1} flex={1}>
                    {f.fileName || f.originalName || 'Untitled'}
                  </Text>
                  <IconButton
                    icon={<Icon as={MdDelete} boxSize={3} />}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    aria-label="Delete file"
                    isLoading={deleting === f._id}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!window.confirm('Delete this file permanently?')) return;
                      setDeleting(f._id);
                      try {
                        await fileService.deleteFile(f._id);
                        setFiles(prev => prev.filter(x => x._id !== f._id));
                        setSelectedFiles(prev => prev.filter(id => id !== f._id));
                        toast({ title: 'File deleted', status: 'success', duration: 2000 });
                      } catch (err) {
                        toast({ title: 'Delete failed', description: err.message || 'Try again', status: 'error', duration: 3000 });
                      } finally {
                        setDeleting(null);
                      }
                    }}
                  />
                </HStack>
              ))}
            </VStack>
          )}
          {files.length > 0 && (
            <HStack mt={2} spacing={2}>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={runCrossReference}
                isLoading={loading}
                loadingText="Analyzing..."
                fontSize="xs"
                leftIcon={<Icon as={FaExchangeAlt} boxSize={3} />}
                isDisabled={selectedFiles.length === 0}
                flex={1}
              >
                Compare ({selectedFiles.length} selected)
              </Button>
              {selectedFiles.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  fontSize="xs"
                  onClick={() => setSelectedFiles([])}
                >
                  Clear
                </Button>
              )}
            </HStack>
          )}
        </Box>

        {results && (
          <VStack spacing={3} align="stretch">
            <Box
              bg={cardBg} border="1px solid" borderColor={borderColor}
              borderRadius="md" p={3}
            >
              <Text fontSize="xs" color={textColor}>{results.summary}</Text>
              <HStack mt={2} spacing={3}>
                <Badge colorScheme="blue" fontSize="2xs">{results.totalIssues || results.findings?.length || 0} Issues</Badge>
                {results.sharedTerms?.length > 0 && (
                  <Badge colorScheme="purple" fontSize="2xs">{results.sharedTerms.length} Shared Terms</Badge>
                )}
                {results.citationOverlaps?.length > 0 && (
                  <Badge colorScheme="green" fontSize="2xs">{results.citationOverlaps.length} Citation Overlaps</Badge>
                )}
              </HStack>
            </Box>

            {results.findings?.map((finding, idx) => {
              const cfg = typeConfig[finding.type] || typeConfig.conflict;
              const isExpanded = expandedIdx === idx;
              return (
                <Box
                  key={idx} bg={cardBg} border="1px solid" borderColor={borderColor}
                  borderLeft="3px solid" borderLeftColor={`${cfg.color}.400`}
                  borderRadius="md" overflow="hidden"
                >
                  <HStack
                    p={2} cursor="pointer"
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  >
                    <Icon as={cfg.icon} color={`${cfg.color}.400`} boxSize={3.5} />
                    <Box flex={1}>
                      <Text fontSize="xs" fontWeight="bold" color={textColor}>{finding.title}</Text>
                      <HStack spacing={1} mt={0.5}>
                        <Badge colorScheme={cfg.color} fontSize="2xs">{cfg.label}</Badge>
                        <Badge colorScheme={finding.severity === 'high' ? 'red' : finding.severity === 'medium' ? 'orange' : 'green'} fontSize="2xs">
                          {finding.severity}
                        </Badge>
                      </HStack>
                    </Box>
                    <Icon as={isExpanded ? MdExpandLess : MdExpandMore} color={mutedColor} boxSize={3} />
                  </HStack>
                  <Collapse in={isExpanded}>
                    <Box px={2} pb={2} borderTop="1px solid" borderColor={borderColor}>
                      {finding.currentDocClause && (
                        <Box mt={1}>
                          <Text fontSize="2xs" fontWeight="bold" color={mutedColor}>In this document:</Text>
                          <Text fontSize="2xs" color={textColor} bg={useColorModeValue('red.50', 'red.900')} p={1} borderRadius="sm">
                            {finding.currentDocClause}
                          </Text>
                        </Box>
                      )}
                      {finding.referenceClause && (
                        <Box mt={1}>
                          <Text fontSize="2xs" fontWeight="bold" color={mutedColor}>
                            In {finding.referenceDoc || 'referenced doc'}:
                          </Text>
                          <Text fontSize="2xs" color={textColor} bg={useColorModeValue('blue.50', 'blue.900')} p={1} borderRadius="sm">
                            {finding.referenceClause}
                          </Text>
                        </Box>
                      )}
                      <Text fontSize="2xs" color="blue.400" mt={1}>
                        💡 {finding.recommendation}
                      </Text>
                      {finding.suggestedText && (
                        <Button
                          size="xs"
                          colorScheme="green"
                          variant="outline"
                          fontSize="2xs"
                          mt={2}
                          leftIcon={<Icon as={FaQuoteRight} boxSize={2.5} />}
                          onClick={(e) => { e.stopPropagation(); handleInsertFix(finding); }}
                        >
                          Apply Fix
                        </Button>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}

            {results.sharedTerms?.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="purple.400" mb={1}>
                  Shared Terms
                </Text>
                <VStack spacing={1} align="stretch">
                  {results.sharedTerms.map((st, i) => (
                    <HStack key={i} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="md" p={2} spacing={2}>
                      <Tag size="sm" colorScheme="purple" fontSize="2xs" flexShrink={0}>{st.term}</Tag>
                      <Box flex={1}>
                        <Text fontSize="2xs" color={textColor}>Here: {st.currentDef}</Text>
                        <Text fontSize="2xs" color={mutedColor}>Ref: {st.referenceDef}</Text>
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {results.citationOverlaps?.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="green.400" mb={1}>
                  Citation Overlaps
                </Text>
                <VStack spacing={1} align="stretch">
                  {results.citationOverlaps.map((co, i) => (
                    <HStack key={i} spacing={2} p={1}>
                      <Icon as={MdLink} color="green.400" boxSize={3} />
                      <Text fontSize="2xs" color={textColor} flex={1}>{co.citation}</Text>
                      <Text fontSize="2xs" color={mutedColor}>{co.note}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

export default CrossReferencePanel;
