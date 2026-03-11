import React, { useState, useMemo } from 'react';
import {
  Box, Tabs, TabList, Tab, TabPanels, TabPanel,
  HStack, Text, Badge, Icon, VStack, useColorModeValue,
  Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid, Divider,
  Spinner, Button, Progress, Tooltip, Alert, AlertIcon,
  Collapse, Textarea,
} from '@chakra-ui/react';
import {
  MdGavel, MdSecurity, MdTimeline, MdCompareArrows, MdLightbulb, MdDescription,
  MdPerson, MdBalance, MdAutoFixHigh, MdPictureAsPdf, MdVerified,
  MdLibraryBooks, MdAutoAwesome, MdSearch, MdFormatSize,
} from 'react-icons/md';
import { FaBalanceScale, FaShieldAlt, FaUserTie, FaGavel, FaExchangeAlt, FaClipboardCheck } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

import PrecedencePanel from './PrecedencePanel';
import CompliancePanel from './CompliancePanel';
import ChronologyPanel from './ChronologyPanel';
import ContradictionPanel from './ContradictionPanel';
import CaseLawSearchPanel from './CaseLawSearchPanel';
import ArgumentBuilderPanel from './ArgumentBuilderPanel';
import ContractReviewPanel from './ContractReviewPanel';
import CourtFormattingPanel from './CourtFormattingPanel';
import CrossReferencePanel from './CrossReferencePanel';
import CounterAffidavitPanel from './CounterAffidavitPanel';
import SmartSuggestionsPanel from '../SmartSuggestionsPanel';
import fileService from '../../services/fileService';

const PartyRow = ({ label, value, colorScheme = 'gray', compact }) => {
  if (!value) return null;
  return (
    <HStack spacing={compact ? 1 : 2} mb={1} align="start" wrap="wrap">
      <Badge
        colorScheme={colorScheme}
        fontSize="2xs"
        minW={compact ? '60px' : '80px'}
        textAlign="center"
        flexShrink={0}
      >
        {label}
      </Badge>
      <Text fontSize="xs" flex={1}>{value}</Text>
    </HStack>
  );
};

const cleanPartyValue = (val) => {
  if (!val) return null;
  const cleaned = val.replace(/_{3,}/g, '').replace(/\s{2,}/g, ' ').replace(/^[\s,./;:-]+|[\s,./;:-]+$/g, '').trim();
  return cleaned.length > 2 ? cleaned : null;
};

const AnalysisDashboard = ({
  scanData = {},
  onApplySuggestion,
  onDismissSuggestion,
  onUndoSuggestion,
  onViewInDocument,
  onFollowUp,
  onFindCaseInDoc,
  compact = false,
  editor,
  currentFileId,
  documentContext = '',
  sofExpanded = false,
  onSofExpandToggle,
  sofValue,
  onSofChange,
}) => {
  const [deepAnalysis, setDeepAnalysis] = useState(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [clauseSuggestions, setClauseSuggestions] = useState([]);
  const [clauseLoading, setClauseLoading] = useState(false);
  const [localSofExpanded, setLocalSofExpanded] = useState(false);
  const [localSofValue, setLocalSofValue] = useState('');
  const isSofControlled = onSofExpandToggle != null;
  const showSof = isSofControlled ? sofExpanded : localSofExpanded;
  const toggleSof = () => {
    if (isSofControlled) onSofExpandToggle();
    else setLocalSofExpanded((p) => !p);
  };
  const sofText = sofValue !== undefined ? sofValue : (localSofValue || scanData?.scanResults?.summary || '');
  const setSofText = onSofChange || setLocalSofValue;

  const runDeepAnalysis = async () => {
    setDeepLoading(true);
    try {
      const prompt = `You are Harvey — a senior Indian lawyer AI assistant. Perform a comprehensive legal analysis of this ${detectedDocType || 'legal document'}.

Return your response in the following structured markdown format:

## 1. Executive Summary
Brief overview of the document's purpose, parties, and key legal nature.

## 2. Key Legal Issues & Risks
List each significant legal issue, risk, or vulnerability found in the document.

## 3. Relevant Indian Statutes & Sections
List applicable Acts, Articles, and Sections with brief explanation of relevance.

## 4. Relevant Case Law (with Citations)
List relevant precedent cases (Supreme Court / High Court) with citations and brief holdings.

## 5. Lawyer Recommendations
Actionable recommendations for the advocate representing the client — what to argue, what to watch for, how to strengthen the position.

Be thorough, specific, and cite exact legal provisions where possible.`;
      const res = await fileService.aiChatAboutDocument(prompt, '', [], 'en');
      setDeepAnalysis(res?.response || res?.message || 'No analysis generated.');
    } catch (err) {
      console.error('Deep analysis error:', err);
      setDeepAnalysis('Error generating analysis. Please ensure an edit session is active and try again.');
    } finally {
      setDeepLoading(false);
    }
  };

  const {
    detectedDocType = '',
    extractedParties = null,
    precedenceAnalysis = [],
    statutesReferenced = [],
    complianceIssues = [],
    missingClauses = [],
    clauseFlaws = [],
    chronologicalIssues = [],
    outdatedReferences = [],
    internalContradictions = [],
    governmentCompliance = null,
    smartSuggestions = [],
    scanResults = null,
    aiSuggestedPrecedents = [],
  } = scanData;

  
  const healthScore = useMemo(() => Math.max(0, Math.min(100,
    100
    - (complianceIssues.length * 5)
    - (missingClauses.length * 3)
    - (internalContradictions.length * 8)
    - (outdatedReferences.length * 4)
    - (chronologicalIssues.length * 3)
    - (clauseFlaws.length * 2)
  )), [complianceIssues, missingClauses, internalContradictions, outdatedReferences, chronologicalIssues, clauseFlaws]);

  const healthColor = healthScore >= 80 ? 'green' : healthScore >= 50 ? 'yellow' : 'red';

  const blankCount = useMemo(() => {
    if (!extractedParties) return 0;
    const allText = [
      extractedParties.petitioner, extractedParties.respondent,
      extractedParties.court, extractedParties.caseNumber,
      ...(Array.isArray(extractedParties.petitionerAdvocates) ? extractedParties.petitionerAdvocates : []),
      ...(Array.isArray(extractedParties.respondentAdvocates) ? extractedParties.respondentAdvocates : []),
      ...(Array.isArray(extractedParties.judges) ? extractedParties.judges : []),
    ].filter(Boolean).join(' ');
    return (allText.match(/_{3,}/g) || []).length;
  }, [extractedParties]);

  
  const exportAnalysisPdf = () => {
    const parties = extractedParties || {};
    const reportHtml = `<!DOCTYPE html><html><head><title>Legal Analysis Report</title>
<style>
  body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;color:#1a1a1a;line-height:1.6}
  h1{color:#1a365d;border-bottom:2px solid #c9b99a;padding-bottom:8px;font-size:22px}
  h2{color:#2d3748;margin-top:24px;font-size:16px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
  .badge{display:inline-block;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:bold;color:white}
  .badge-blue{background:#3182ce} .badge-red{background:#e53e3e} .badge-green{background:#38a169}
  .badge-orange{background:#dd6b20} .badge-cyan{background:#00b5d8} .badge-pink{background:#d53f8c}
  table{border-collapse:collapse;width:100%;margin:12px 0}
  td,th{border:1px solid #ddd;padding:8px 12px;text-align:left;font-size:13px}
  th{background:#f7f7f7;font-weight:bold}
  .score{font-size:48px;font-weight:bold;text-align:center;margin:16px 0}
  .score.green{color:#38a169} .score.yellow{color:#d69e2e} .score.red{color:#e53e3e}
  .footer{margin-top:40px;font-size:11px;color:gray;border-top:1px solid #eee;padding-top:8px}
  @media print{body{margin:0;padding:20px}}
</style></head><body>
<h1>Legal Analysis Report</h1>
<p><strong>Document Type:</strong> ${detectedDocType || 'N/A'}</p>
${parties.petitioner ? `<p><strong>Petitioner:</strong> ${parties.petitioner}</p>` : ''}
${parties.respondent ? `<p><strong>Respondent:</strong> ${parties.respondent}</p>` : ''}
${parties.court ? `<p><strong>Court:</strong> ${parties.court}</p>` : ''}
${parties.caseNumber ? `<p><strong>Case No.:</strong> ${parties.caseNumber}</p>` : ''}

<h2>Document Health Score</h2>
<div class="score ${healthColor}">${healthScore}/100</div>

<h2>Analysis Summary</h2>
<table>
<tr><th>Category</th><th>Issues</th></tr>
<tr><td>Precedences Cited</td><td>${precedenceAnalysis.length}</td></tr>
<tr><td>Compliance Issues</td><td>${complianceIssues.length}</td></tr>
<tr><td>Missing Clauses</td><td>${missingClauses.length}</td></tr>
<tr><td>Clause Flaws</td><td>${clauseFlaws.length}</td></tr>
<tr><td>Timeline Issues</td><td>${chronologicalIssues.length}</td></tr>
<tr><td>Contradictions</td><td>${internalContradictions.length}</td></tr>
<tr><td>Outdated References</td><td>${outdatedReferences.length}</td></tr>
</table>

${precedenceAnalysis.length > 0 ? `<h2>Cited Precedences</h2><ul>${precedenceAnalysis.map(p => `<li><strong>${p.caseName || p.citation || 'Unknown'}</strong> — ${p.relevance || p.summary || ''}</li>`).join('')}</ul>` : ''}

${complianceIssues.length > 0 ? `<h2>Compliance Issues</h2><ul>${complianceIssues.map(c => `<li>${c.description || c.issue || c.title || JSON.stringify(c)}</li>`).join('')}</ul>` : ''}

${deepAnalysis ? `<h2>AI Deep Analysis</h2><div>${deepAnalysis.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^## (.+)$/gm, '<h3>$1</h3>').replace(/^# (.+)$/gm, '<h2>$1</h2>')}</div>` : ''}

<div class="footer">Generated by Dastavezai AI Legal Platform &middot; ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
</body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(reportHtml); win.document.close(); setTimeout(() => win.print(), 600); }
  };

  
  const suggestMissingClauses = async () => {
    setClauseLoading(true);
    try {
      const prompt = `You are a senior Indian legal drafter. Analyze this ${detectedDocType || 'legal document'} and identify STANDARD CLAUSES that are MISSING but should be present.

For each missing clause, return a JSON array of objects with these exact keys:
- "title": Short clause name (e.g., "Jurisdiction Clause")
- "description": Why this clause is important
- "text": The full text of the suggested clause, written in formal Indian legal language

Return ONLY the JSON array, no explanation. Suggest 3-8 clauses.`;
      const res = await fileService.aiChatAboutDocument(prompt, '', [], 'en');
      const raw = (res?.response || '').trim();
      
      const jsonMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setClauseSuggestions(Array.isArray(parsed) ? parsed : []);
      } else {
        setClauseSuggestions([{ title: 'AI Response', description: raw.substring(0, 200), text: raw }]);
      }
    } catch (err) {
      console.error('Clause suggestion error:', err);
      setClauseSuggestions([]);
    } finally {
      setClauseLoading(false);
    }
  };

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const headingColor = useColorModeValue('blue.700', 'blue.300');
  const textareaBg = useColorModeValue('white', 'gray.700');

  
  const totalIssues =
    complianceIssues.length +
    missingClauses.length +
    clauseFlaws.length +
    chronologicalIssues.length +
    outdatedReferences.length +
    internalContradictions.length;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: MdDescription,
      count: 0,
      colorScheme: 'gray',
    },
    {
      id: 'precedences',
      label: compact ? 'Cases' : 'Precedences',
      icon: MdGavel,
      count: precedenceAnalysis.length + aiSuggestedPrecedents.length,
      colorScheme: 'purple',
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: FaShieldAlt,
      count: complianceIssues.length + missingClauses.length + statutesReferenced.length,
      colorScheme: 'teal',
    },
    {
      id: 'clauses',
      label: compact ? 'Clauses' : 'Clause Flaws',
      icon: MdLightbulb,
      count: smartSuggestions.filter(s => s.status === 'pending').length,
      colorScheme: 'yellow',
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: MdCompareArrows,
      count: chronologicalIssues.length + outdatedReferences.length + internalContradictions.length,
      colorScheme: 'pink',
    },
    {
      id: 'caseSearch',
      label: compact ? 'Search' : 'Case Search',
      icon: MdSearch,
      count: 0,
      colorScheme: 'purple',
    },
    {
      id: 'arguments',
      label: compact ? 'Args' : 'Arguments',
      icon: FaBalanceScale,
      count: 0,
      colorScheme: 'blue',
      interactive: true,
    },
    {
      id: 'contract',
      label: compact ? 'Contract' : 'Contract Review',
      icon: FaClipboardCheck,
      count: 0,
      colorScheme: 'teal',
      interactive: true,
    },
    {
      id: 'courtFormat',
      label: compact ? 'Court' : 'Court Format',
      icon: MdFormatSize,
      count: 0,
      colorScheme: 'red',
      interactive: true,
    },
    {
      id: 'crossRef',
      label: compact ? 'X-Ref' : 'Cross-Ref',
      icon: FaExchangeAlt,
      count: 0,
      colorScheme: 'orange',
      interactive: true,
    },
    {
      id: 'counterAff',
      label: compact ? 'Counter' : 'Counter Aff.',
      icon: MdGavel,
      count: 0,
      colorScheme: 'purple',
      interactive: true,
    },
  ];

  // Determine which tabs to visually dim based on doc type relevance
  const docTypeLower = (detectedDocType || '').toLowerCase();
  const isLitigation = /petition|plaint|suit|complaint|appeal|bail|slp|written statement|writ|application|revision|review/.test(docTypeLower);
  const isContract = /agreement|deed|contract|lease|rental|mou|memorandum/.test(docTypeLower);
  const isOrder = /order|judgment|decree|ruling|opinion/.test(docTypeLower);
  // Map interactive tab relevance by document type
  const tabRelevance = {
    overview: true,
    precedences: true,
    compliance: true,
    clauses: isContract || (!isLitigation && !isOrder),
    issues: true,
    caseSearch: true,
    arguments: isLitigation || isOrder,
    contractReview: isContract,
    courtFormat: isLitigation || isOrder,
    crossRef: true,
    counterAff: isLitigation,
  };

  return (
    <Box h="100%" display="flex" flexDirection="column">
      <Tabs
        variant="soft-rounded"
        colorScheme="blue"
        size={compact ? 'sm' : 'md'}
        h="100%"
        display="flex"
        flexDirection="column"
      >
        <TabList
          data-tour="analysis-tablist"
          px={compact ? 2 : 3}
          py={compact ? 1 : 2}
          borderBottom="1px solid"
          borderColor={borderColor}
          flexWrap="wrap"
          gap={1}
          flexShrink={0}
        >
          {tabs.map(t => {
            const relevant = tabRelevance[t.id] !== false;
            const dimmed = (!t.interactive && t.count === 0) || (t.interactive && !relevant);
            return (
            <Tab key={t.id} data-tour={`tab-${t.id}`} fontSize={compact ? 'xs' : 'sm'} px={compact ? 2 : 3} py={1} opacity={dimmed ? 0.5 : 1}>
              <Icon as={t.icon} boxSize={compact ? 3 : 4} mr={1} />
              {t.label}
              {t.count > 0 && (
                <Badge ml={1} colorScheme={t.colorScheme} fontSize="2xs" borderRadius="full">
                  {t.count}
                </Badge>
              )}
            </Tab>
            );
          })}
        </TabList>

        <TabPanels flex="1" overflowY="auto">
          <TabPanel px={compact ? 2 : 4} py={compact ? 2 : 4}>
            <VStack spacing={3} align="stretch">
              <Box
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                p={3}
              >
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedColor} mb={1}>
                  Document Type
                </Text>
                <Text fontWeight="bold" fontSize={compact ? 'sm' : 'md'} color={textColor}>
                  {detectedDocType || scanResults?.documentType || 'Unknown'}
                </Text>
                {scanResults?.caseType && (
                  <Badge mt={1} colorScheme="blue" fontSize="xs">{scanResults.caseType}</Badge>
                )}
              </Box>

              {extractedParties && (
                <Box
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                  p={3}
                >
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedColor} mb={2}>
                    Parties Identified
                  </Text>
                  <PartyRow label="Petitioner" value={cleanPartyValue(extractedParties.petitioner)} colorScheme="blue" compact={compact} />
                  <PartyRow label="Respondent" value={cleanPartyValue(extractedParties.respondent)} colorScheme="red" compact={compact} />
                  <PartyRow label="Court" value={cleanPartyValue(extractedParties.court)} colorScheme="purple" compact={compact} />
                  <PartyRow label="Case No." value={cleanPartyValue(extractedParties.caseNumber)} colorScheme="gray" compact={compact} />
                  {Array.isArray(extractedParties.petitionerAdvocates) && extractedParties.petitionerAdvocates.filter(a => cleanPartyValue(a)).map((a, i) => (
                    <PartyRow key={`pa_${i}`} label="Pet. Adv." value={cleanPartyValue(a)} colorScheme="cyan" compact={compact} />
                  ))}
                  {Array.isArray(extractedParties.respondentAdvocates) && extractedParties.respondentAdvocates.filter(a => cleanPartyValue(a)).map((a, i) => (
                    <PartyRow key={`ra_${i}`} label="Res. Adv." value={cleanPartyValue(a)} colorScheme="teal" compact={compact} />
                  ))}
                  {Array.isArray(extractedParties.judges) && extractedParties.judges.filter(j => cleanPartyValue(j)).map((j, i) => (
                    <PartyRow key={`j_${i}`} label="Judge" value={cleanPartyValue(j)} colorScheme="yellow" compact={compact} />
                  ))}
                  {blankCount > 0 && (
                    <Alert status="warning" size="xs" borderRadius="md" py={1} mt={2}>
                      <AlertIcon boxSize={3} />
                      <Text fontSize="2xs">{blankCount} blank field{blankCount > 1 ? 's' : ''} present — fill details for complete analysis</Text>
                    </Alert>
                  )}
                  
                  {Array.isArray(extractedParties.dates) && extractedParties.dates.length > 0 && (
                    <Box mt={2}>
                      <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" color={mutedColor} mb={1}>
                        Key Dates
                      </Text>
                      {extractedParties.dates.slice(0, 5).map((d, i) => (
                        <Text key={i} fontSize="2xs" color={textColor} mb={0.5}>• {d}</Text>
                      ))}
                    </Box>
                  )}
                  {Array.isArray(extractedParties.otherParties) && extractedParties.otherParties.slice(0, 5).map((p, i) => (
                    <PartyRow key={i} label="Other" value={p} colorScheme="orange" compact={compact} />
                  ))}
                </Box>
              )}

              {/* Summary of File (SOF) - collapsible, editable */}
              {scanData && (
                <Box
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                  p={3}
                >
                  <HStack justify="space-between" mb={showSof ? 2 : 0}>
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedColor}>
                      Summary of File (SOF)
                    </Text>
                    <Button
                      size="xs"
                      colorScheme="blue"
                      variant={showSof ? 'solid' : 'outline'}
                      onClick={toggleSof}
                    >
                      {showSof ? 'Hide SOF' : 'See SOF'}
                    </Button>
                  </HStack>
                  <Collapse in={showSof} animateOpacity>
                    <Textarea
                      value={sofText}
                      onChange={(e) => setSofText(e.target.value)}
                      placeholder="Summary of the document (SOF) will appear here after scan..."
                      size="sm"
                      minH="80px"
                      fontSize="xs"
                      bg={textareaBg}
                      borderColor={borderColor}
                      _placeholder={{ color: mutedColor }}
                    />
                  </Collapse>
                </Box>
              )}

              <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="md" p={3}>
                <HStack spacing={2} mb={2}>
                  <Icon as={MdVerified} color={`${healthColor}.400`} boxSize={4} />
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color={mutedColor}>
                    Document Health
                  </Text>
                </HStack>
                <HStack spacing={4} align="center">
                  <Box textAlign="center" minW="60px">
                    <Text fontSize={compact ? '2xl' : '3xl'} fontWeight="bold" color={`${healthColor}.400`}>
                      {healthScore}
                    </Text>
                    <Text fontSize="2xs" color={mutedColor}>/ 100</Text>
                  </Box>
                  <Box flex={1}>
                    <Progress value={healthScore} colorScheme={healthColor} size="sm" borderRadius="full" mb={1} />
                    <Text fontSize="2xs" color={mutedColor}>
                      {healthScore >= 80 ? 'Excellent — document is well-structured and compliant'
                        : healthScore >= 50 ? 'Moderate — some issues need attention before filing'
                        : 'Needs work — multiple compliance and structural issues detected'}
                    </Text>
                  </Box>
                </HStack>
              </Box>

              <SimpleGrid columns={compact ? 2 : 3} spacing={2}>
                {[
                  { label: 'Precedences', value: precedenceAnalysis.length, color: 'purple' },
                  { label: 'Compliance', value: complianceIssues.length, color: 'teal' },
                  { label: 'Missing', value: missingClauses.length, color: 'orange' },
                  { label: 'Clause Flaws', value: clauseFlaws.length, color: 'yellow' },
                  { label: 'Timeline', value: chronologicalIssues.length, color: 'cyan' },
                  { label: 'Conflicts', value: outdatedReferences.length + internalContradictions.length, color: 'pink' },
                ].map(s => (
                  <Box
                    key={s.label}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderTop="3px solid"
                    borderTopColor={`${s.color}.400`}
                    borderRadius="md"
                    p={2}
                    textAlign="center"
                  >
                    <Text fontSize={compact ? 'xl' : '2xl'} fontWeight="bold" color={`${s.color}.400`}>
                      {s.value}
                    </Text>
                    <Text fontSize="2xs" color={mutedColor}>{s.label}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </TabPanel>

          <TabPanel px={compact ? 2 : 4} py={compact ? 2 : 4}>
            <PrecedencePanel
              precedences={precedenceAnalysis}
              aiSuggestedPrecedents={aiSuggestedPrecedents}
              fileId={currentFileId}
              compact={compact}
              docType={detectedDocType}
              onFollowUp={onFollowUp}
              onApplySuggestion={onApplySuggestion}
              onFindCaseInDoc={onFindCaseInDoc}
            />
          </TabPanel>

          <TabPanel px={compact ? 2 : 4} py={compact ? 2 : 4}>
            <CompliancePanel
              complianceIssues={complianceIssues}
              missingClauses={missingClauses}
              statutesReferenced={statutesReferenced}
              compact={compact}
              onApplySuggestion={onApplySuggestion}
              onFollowUp={onFollowUp}
              onFindCaseInDoc={onFindCaseInDoc}
            />
            {governmentCompliance && governmentCompliance.applicable && (
              <Box mt={4} p={3} borderWidth="1px" borderColor={borderColor} borderRadius="md" bg={cardBg}>
                <HStack spacing={2} mb={3}>
                  <Icon as={MdGavel} color="purple.500" boxSize={5} />
                  <Text fontSize="sm" fontWeight="bold">Government Compliance</Text>
                  <Badge
                    colorScheme={governmentCompliance.riskLevel === 'high' ? 'red' : governmentCompliance.riskLevel === 'medium' ? 'orange' : governmentCompliance.riskLevel === 'low' ? 'green' : 'gray'}
                    fontSize="2xs"
                  >
                    {governmentCompliance.riskLevel?.toUpperCase() || 'N/A'} RISK
                  </Badge>
                </HStack>
                {Array.isArray(governmentCompliance.findings) && governmentCompliance.findings.length > 0 ? (
                  <VStack align="stretch" spacing={2}>
                    {governmentCompliance.findings.map((f, idx) => (
                      <Box key={idx} p={2} borderWidth="1px" borderColor={borderColor} borderRadius="sm" bg={f.status === 'fail' ? 'red.50' : f.status === 'pass' ? 'green.50' : 'gray.50'}>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" fontWeight="bold">{f.area}</Text>
                          <Badge
                            colorScheme={f.status === 'fail' ? 'red' : f.status === 'pass' ? 'green' : 'gray'}
                            fontSize="2xs"
                          >
                            {f.status?.toUpperCase()}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color={mutedColor}>{f.description}</Text>
                        {f.correctiveAction && (
                          <Text fontSize="xs" color="blue.600" mt={1}>Fix: {f.correctiveAction}</Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="xs" color={mutedColor}>No specific government compliance findings.</Text>
                )}
              </Box>
            )}
          </TabPanel>

          <TabPanel px={0} py={0} h="100%" display="flex" flexDirection="column">
            <Box px={compact ? 2 : 3} py={2} borderBottom="1px solid" borderColor={borderColor}>
              <HStack justify="space-between" align="center">
                <HStack spacing={2}>
                  <Icon as={MdLibraryBooks} color="yellow.500" boxSize={4} />
                  <Text fontSize="xs" fontWeight="bold">Clause Library</Text>
                  {clauseSuggestions.length > 0 && (
                    <Badge colorScheme="yellow" fontSize="2xs">{clauseSuggestions.length}</Badge>
                  )}
                </HStack>
                <Button
                  size="xs" colorScheme="yellow" variant="outline"
                  leftIcon={clauseLoading ? <Spinner size="xs" /> : <Icon as={MdAutoAwesome} boxSize={3} />}
                  onClick={suggestMissingClauses}
                  isLoading={clauseLoading}
                  loadingText="Finding…"
                  fontSize="2xs"
                >
                  {clauseSuggestions.length > 0 ? 'Re-scan' : 'Find Missing Clauses'}
                </Button>
              </HStack>

              {clauseSuggestions.length > 0 && (
                <VStack spacing={2} mt={2} align="stretch" maxH="200px" overflowY="auto">
                  {clauseSuggestions.map((clause, i) => (
                    <Box
                      key={i} bg={cardBg} border="1px solid" borderColor={borderColor}
                      borderLeft="3px solid" borderLeftColor="yellow.400"
                      borderRadius="md" p={2}
                    >
                      <HStack justify="space-between" align="start">
                        <Box flex={1}>
                          <Text fontSize="xs" fontWeight="bold" color={textColor}>{clause.title}</Text>
                          <Text fontSize="2xs" color={mutedColor} noOfLines={2}>{clause.description}</Text>
                        </Box>
                        {onApplySuggestion && clause.text && (
                          <Tooltip label="Insert this clause into document" fontSize="xs" hasArrow>
                            <Button
                              size="xs" colorScheme="yellow" variant="solid" fontSize="2xs"
                              onClick={() => onApplySuggestion({
                                title: clause.title,
                                description: clause.description || '',
                                suggestedText: clause.text,
                                originalText: '',
                                type: 'insert_clause',
                              })}
                            >
                              Insert
                            </Button>
                          </Tooltip>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

            <Box flex={1} overflow="hidden">
              <SmartSuggestionsPanel
                suggestions={smartSuggestions}
                onApply={onApplySuggestion}
                onDismiss={onDismissSuggestion}
                onUndo={onUndoSuggestion}
                onViewInDocument={onViewInDocument}
              />
            </Box>
          </TabPanel>

          <TabPanel px={compact ? 2 : 4} py={compact ? 2 : 4}>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="xs" color="cyan.400">Timeline Issues</Text>
              <ChronologyPanel
                chronologicalIssues={chronologicalIssues}
                extractedDates={extractedParties?.dates || []}
                compact={compact}
                onApplySuggestion={onApplySuggestion}
              />
              <Text fontWeight="bold" fontSize="xs" color="pink.400" mt={2}>Conflicts & Contradictions</Text>
              <ContradictionPanel
                outdatedReferences={outdatedReferences}
                internalContradictions={internalContradictions}
                compact={compact}
                onApplySuggestion={onApplySuggestion}
              />
            </VStack>
          </TabPanel>

          <TabPanel px={0} py={0} h="100%">
            <CaseLawSearchPanel
              compact={compact}
              onApplySuggestion={onApplySuggestion}
              onFollowUp={onFollowUp}
            />
          </TabPanel>

          <TabPanel px={0} py={0} h="100%">
            <ArgumentBuilderPanel
              compact={compact}
              onApplySuggestion={onApplySuggestion}
              documentContext={documentContext}
            />
          </TabPanel>

          <TabPanel px={0} py={0} h="100%">
            <ContractReviewPanel
              compact={compact}
              onApplySuggestion={onApplySuggestion}
              deepAnalysis={deepAnalysis}
              deepLoading={deepLoading}
              onRunDeepAnalysis={runDeepAnalysis}
              onExportPdf={exportAnalysisPdf}
            />
          </TabPanel>

          <TabPanel px={0} py={0} h="100%">
            <CourtFormattingPanel
              compact={compact}
              editor={editor}
              onApplySuggestion={onApplySuggestion}
            />
          </TabPanel>

          <TabPanel px={0} py={0} h="100%">
            <CrossReferencePanel
              compact={compact}
              onApplySuggestion={onApplySuggestion}
              currentFileId={currentFileId}
            />
          </TabPanel>

          <TabPanel px={0} py={0} h="100%">
            <CounterAffidavitPanel
              compact={compact}
              currentFileId={currentFileId}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AnalysisDashboard;
