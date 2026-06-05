import React, { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  Tooltip,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  MdGavel, MdSearch, MdEdit, MdPerson, MdBalance, MdList,
  MdDescription, MdVerifiedUser, MdFolder, MdTableRows, MdCheckCircle,
  MdArrowUpward, MdArrowDownward
} from 'react-icons/md';
import { FaBalanceScale } from 'react-icons/fa';
import { isPlaceholderValue } from '../utils/counterStudioBlanks';
import fileService from '../services/fileService';
import { formatDepartmentApiError } from '../services/apiBase';
import {
  buildDefaultIndexEntries,
  resolveCounterOnBehalfParticulars,
} from '../utils/counterStudioIndex';
import PrecedencePanel from './analysis/PrecedencePanel';
import CaseLawSearchPanel from './analysis/CaseLawSearchPanel';

/* ─── style helpers ───────────────────────────────────── */
const BLANK_PLACEHOLDER = '_______________';

const fieldSx = (needsFill) => ({
  w: '100%',
  minH: needsFill ? '2.4rem' : '2.2rem',
  fontSize: 'sm',
  ...(needsFill ? {
    borderColor: 'orange.300',
    bg: 'orange.50',
    _dark: { bg: 'rgba(251,140,0,0.06)' },
    _focus: { borderColor: 'orange.400', boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)' },
  } : {}),
});

const textareaSx = (needsFill) => ({
  w: '100%',
  minH: needsFill ? '5rem' : '4rem',
  resize: 'vertical',
  fontSize: 'sm',
  ...(needsFill ? {
    borderColor: 'orange.300',
    bg: 'orange.50',
    _dark: { bg: 'rgba(251,140,0,0.06)' },
    _focus: { borderColor: 'orange.400', boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)' },
  } : {}),
});

/* ─── section header inside accordion ────────────────── */
const SectionLabel = ({ icon, label, badge, badgeColor = 'purple' }) => (
  <HStack flex="1" spacing={2} mr={2}>
    <Icon as={icon} color="purple.400" boxSize={3.5} flexShrink={0} />
    <Text fontWeight="600" fontSize="sm" textAlign="left">{label}</Text>
    {badge > 0 && (
      <Badge colorScheme={badgeColor} fontSize="2xs" borderRadius="full" ml={0.5}>{badge}</Badge>
    )}
  </HStack>
);

/* ─── add / remove row button ─────────────────────────── */
const AddRowBtn = ({ onClick, label = 'Add' }) => (
  <Button
    size="xs"
    variant="ghost"
    colorScheme="purple"
    leftIcon={<AddIcon boxSize={2.5} />}
    onClick={onClick}
    alignSelf="flex-start"
    fontWeight="500"
  >
    {label}
  </Button>
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const CounterFillBlanksPanel = ({
  result,
  blankCount,
  onPatch,
  onPatchCounterDraft,
  onAnnexureChange,
  activeEditTarget,
  scanData,
  fileId,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [accordionIndices, setAccordionIndices] = useState([0, 1, 2, 3]);

  /* color tokens */
  const borderColor   = useColorModeValue('gray.200', 'whiteAlpha.100');
  const muted         = useColorModeValue('gray.500', 'gray.400');
  const cardBg        = useColorModeValue('white', '#1a1d2e');
  const sectionBg     = useColorModeValue('gray.50', '#161928');
  const rowBg         = useColorModeValue('white', '#1e2235');
  const inputBg       = useColorModeValue('white', '#0f1117');
  const toast         = useToast();
  const annexureFileRef = useRef(null);
  const [annexureDescription, setAnnexureDescription] = useState('');
  const [annexureUploading, setAnnexureUploading] = useState(false);

  /* highlight flash keyframes */
  const highlightCss = `
    @keyframes highlightFlash {
      0%   { background-color: rgba(128,90,213,0.25) !important; box-shadow: 0 0 0 3px rgba(128,90,213,0.3) !important; }
      60%  { background-color: rgba(128,90,213,0.08) !important; box-shadow: 0 0 0 1px rgba(128,90,213,0.1) !important; }
      100% { background-color: inherit; box-shadow: inherit; }
    }
    .highlight-flash { animation: highlightFlash 1.1s ease-out; }
  `;

  /* ── auto-scroll to field on preview click ─── */
  useEffect(() => {
    if (!activeEditTarget) return;
    const mapTargetToAccordionIndex = (target) => {
      if (target.field) {
        const f = target.field;
        if (['court','caseNumber','petitionerName','respondentName','jurisdictionLine','documentTitle'].includes(f)) return 0;
        if (f === 'captionSubject') return 1;
        if (['deponentDetails','prayer','verification'].includes(f)) return 3;
      }
      if (target.section) {
        const s = target.section;
        if (s === 'introductoryParagraphs') return 2;
        if (s === 'defenceSection') return 4;
        if (s === 'preliminaryObjections') return 5;
        if (s === 'counterDraft') return 6;
        if (s === 'statementOfAdditionalFacts') return 7;
        if (s === 'closingParagraphs') return 8;
      }
      return -1;
    };
    const accIdx = mapTargetToAccordionIndex(activeEditTarget);
    if (accIdx === -1) return;
    setActiveTab(0);
    setAccordionIndices((prev) => prev.includes(accIdx) ? prev : [...prev, accIdx]);
    const timer = setTimeout(() => {
      let targetId = '';
      if (activeEditTarget.field) targetId = `edit-field-${activeEditTarget.field}`;
      else if (activeEditTarget.section) {
        const index = activeEditTarget.index !== null ? activeEditTarget.index : 0;
        targetId = `edit-section-${activeEditTarget.section}-${index}`;
      }
      if (!targetId) return;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
        element.classList.remove('highlight-flash');
        void element.offsetWidth;
        element.classList.add('highlight-flash');
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [activeEditTarget]);

  if (!result) return null;

  const patch = (fields) => onPatch?.(fields);

  /* ── derived values ─────────────────────────── */
  const ensureArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return String(val).split(/\n+/).map(p => p.trim()).filter(Boolean);
  };

  const jurisdictionValue = result.jurisdictionLine || (typeof result.jurisdiction === 'string' ? result.jurisdiction : '');
  const counterDraft      = result.counterDraft || [];
  const objections        = ensureArray(result.preliminaryObjections);
  const addFacts          = ensureArray(result.statementOfAdditionalFacts);
  const defenceParagraphs = ensureArray(result.defenceSection);
  const introParagraphs   = ensureArray(result.introductoryParagraphs);
  const closingParagraphs = ensureArray(result.closingParagraphs);
  const indexEntries      = Array.isArray(result.indexEntries) && result.indexEntries.length > 0 ? result.indexEntries : buildDefaultIndexEntries(result);
  const uploadedAnnexures = (Array.isArray(result.annexureIndex) ? result.annexureIndex : []).filter((a) => a?.userUploaded || a?.fileId);

  /* ── patch helpers ──────────────────────────── */
  const moveArrayItem = (arr, i, dir) => {
    if (i + dir < 0 || i + dir >= arr.length) return arr;
    const n = [...arr];
    [n[i], n[i+dir]] = [n[i+dir], n[i]];
    return n;
  };
  const patchIntroParagraph   = (i, v) => { const n=[...introParagraphs]; n[i]=v; patch({introductoryParagraphs:n}); };
  const addIntroParagraph     = ()     => patch({introductoryParagraphs:[...introParagraphs,'']});
  const removeIntroParagraph  = (i)    => patch({introductoryParagraphs:introParagraphs.filter((_,j)=>j!==i)});
  const moveIntroParagraph    = (i, d) => patch({introductoryParagraphs: moveArrayItem(introParagraphs, i, d)});
  const patchClosingParagraph  = (i, v) => { const n=[...closingParagraphs]; n[i]=v; patch({closingParagraphs:n}); };
  const addClosingParagraph    = ()     => patch({closingParagraphs:[...closingParagraphs,'']});
  const removeClosingParagraph = (i)    => patch({closingParagraphs:closingParagraphs.filter((_,j)=>j!==i)});
  const moveClosingParagraph   = (i, d) => patch({closingParagraphs: moveArrayItem(closingParagraphs, i, d)});
  const patchObjection         = (i, v) => { const n=[...objections]; n[i]=v; patch({preliminaryObjections:n}); };
  const addObjection           = ()     => patch({preliminaryObjections:[...objections,'']});
  const removeObjection        = (i)    => patch({preliminaryObjections:objections.filter((_,j)=>j!==i)});
  const moveObjection          = (i, d) => patch({preliminaryObjections: moveArrayItem(objections, i, d)});
  const patchAdditionalFact    = (i, v) => { const n=[...addFacts]; n[i]=v; patch({statementOfAdditionalFacts:n}); };
  const addAdditionalFact      = ()     => patch({statementOfAdditionalFacts:[...addFacts,'']});
  const removeAdditionalFact   = (i)    => patch({statementOfAdditionalFacts:addFacts.filter((_,j)=>j!==i)});
  const moveAdditionalFact     = (i, d) => patch({statementOfAdditionalFacts: moveArrayItem(addFacts, i, d)});
  const patchDefenceParagraph  = (i, v) => { const n=[...defenceParagraphs]; n[i]=v; patch({defenceSection:n}); };
  const addDefenceParagraph    = ()     => patch({defenceSection:[...defenceParagraphs,'']});
  const removeDefenceParagraph = (i)    => patch({defenceSection:defenceParagraphs.filter((_,j)=>j!==i)});
  const moveDefenceParagraph   = (i, d) => patch({defenceSection: moveArrayItem(defenceParagraphs, i, d)});
  const addCounterDraftRow     = ()     => patch({counterDraft:[...counterDraft,{paraNo:counterDraft.length+1,petitionParaNo:counterDraft.length+1,stance:'deny',counterArgument:'',supportingLaw:''}]});
  const removeCounterDraftRow  = (i)    => patch({counterDraft:counterDraft.filter((_,j)=>j!==i)});
  const moveCounterDraftRow    = (i, d) => patch({counterDraft: moveArrayItem(counterDraft, i, d)});
  const patchIndexRow    = (i, f, v) => { const n=indexEntries.map((r,j)=>j===i?{...r,[f]:v}:r); patch({indexEntries:n}); };
  const addIndexRow      = ()        => patch({indexEntries:[...indexEntries,{slNo:String(indexEntries.length+1),particulars:'',page:'',rowType:'annexure'}]});
  const removeIndexRow   = (i)       => { if(indexEntries.length<=1)return; const n=indexEntries.filter((_,j)=>j!==i).map((r,j)=>({...r,slNo:String(j+1)})); patch({indexEntries:n}); };
  const moveIndexRow     = (i, d)    => patch({indexEntries: moveArrayItem(indexEntries, i, d)});
  const resetMainIndexRow = () => {
    const next=[...indexEntries];
    next[0]={...next[0],slNo:'1',rowType:'main',particulars:resolveCounterOnBehalfParticulars(result)};
    patch({indexEntries:next});
  };
  const removeUploadedAnnexure = (letter) => {
    const key=String(letter||'').toUpperCase();
    const next=(result.annexureIndex||[]).filter(a=>String(a?.letter||'').toUpperCase()!==key);
    patch({annexureIndex:next});
    onAnnexureChange?.();
  };
  const handleAnnexureFilePick = async (event) => {
    const file=event.target.files?.[0];
    event.target.value='';
    if(!file)return;
    const description=annexureDescription.trim();
    if(!description){toast({title:'Describe the annexure',description:'Enter what this document is.',status:'warning',duration:4000});return;}
    setAnnexureUploading(true);
    try{
      const uploadRes=await fileService.uploadFile(file);
      const fid=uploadRes?.file?._id||uploadRes?.fileId;
      if(!fid)throw new Error('Upload did not return a file id');
      const reg=await fileService.registerCounterAnnexure({fileId:fid,description,annexureIndex:result.annexureIndex||[]});
      patch({annexureIndex:reg.annexureIndex||[]});
      setAnnexureDescription('');
      onAnnexureChange?.();
      toast({title:'Annexure added',description:reg.annexure?.letter?`Annexure-${reg.annexure.letter} — INDEX updated.`:'INDEX table updated.',status:'success',duration:4000});
    }catch(err){
      toast({title:'Could not attach annexure',description:formatDepartmentApiError(err,'Upload or registration failed.'),status:'error',duration:6000});
    }finally{setAnnexureUploading(false);}
  };

  const handleInsertCitation = (citationText) => {
    if (!citationText) return;
    const next = [...defenceParagraphs, citationText];
    onPatch?.({ defenceSection: next });
    toast({ title: '✓ Citation added', description: "Added to Defence paragraphs. Edit it in 'Fill Template → Defence paragraphs'.", status: 'success', duration: 3500 });
    setActiveTab(0);
  };
  const handleApplyCasePrinciple = (suggestion) => {
    if (!suggestion) return;
    const cn = suggestion.caseName || '';
    const cite = suggestion.citation || '';
    const prin = suggestion.principle || suggestion.suggestedText || '';
    handleInsertCitation(`As held in ${cn}${cite ? ` (${cite})` : ''}${prin ? `: ${prin}` : ''}`);
  };

  /* ── scan-derived data for precedences tab ─── */
  const precedences          = scanData?.precedenceAnalysis || [];
  const statutes             = scanData?.statutesReferenced || [];
  const aiSuggestedPrecedents = scanData?.aiSuggestedPrecedents || [];
  const detectedDocType      = scanData?.detectedDocType || scanData?.scanResults?.documentType || '';
  const totalPrecedences     = precedences.length + aiSuggestedPrecedents.length;

  /* ═══ RENDER ════════════════════════════════════════════════ */
  return (
    <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" overflow="hidden">
      <style>{highlightCss}</style>

      {/* ── Tab bar ──────────────────────────────────────────── */}
      <Tabs
        index={activeTab}
        onChange={setActiveTab}
        variant="unstyled"
        size="sm"
        isLazy
      >
        {/* PANEL HEADER: blank status + tabs */}
        <Box borderBottomWidth="1px" borderColor={borderColor} bg={sectionBg}>
          {/* completion status bar */}
          <HStack px={4} pt={3} pb={2} justify="space-between">
            <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.06em" color={muted}>
              Editor Panel
            </Text>
            {blankCount > 0 ? (
              <Badge colorScheme="orange" variant="subtle" fontSize="2xs" borderRadius="full" px={2}>
                {blankCount} blank{blankCount > 1 ? 's' : ''} remaining
              </Badge>
            ) : (
              <Badge colorScheme="green" variant="subtle" fontSize="2xs" borderRadius="full" px={2}>
                <Icon as={MdCheckCircle} boxSize={2.5} mr={0.5} mb="-1px" />
                All filled
              </Badge>
            )}
          </HStack>

          {/* Tab row */}
          <TabList px={3} gap={0}>
            {[
              { icon: MdEdit, label: 'Fill Template', badge: blankCount > 0 ? blankCount : null, badgeColor: 'orange' },
              { icon: MdGavel, label: 'Precedences', badge: totalPrecedences > 0 ? totalPrecedences : null, badgeColor: 'purple' },
              { icon: MdSearch, label: 'Case Search', badge: null },
            ].map((tab, i) => (
              <Tab
                key={tab.label}
                flex={1}
                py={2}
                fontSize="xs"
                fontWeight="600"
                color={activeTab === i ? 'purple.500' : muted}
                borderBottom="2px solid"
                borderColor={activeTab === i ? 'purple.500' : 'transparent'}
                bg="transparent"
                _hover={{ color: 'purple.400' }}
                transition="all 0.15s"
                _selected={{}}
              >
                <HStack spacing={1} justify="center">
                  <Icon as={tab.icon} boxSize={3.5} />
                  <Text>{tab.label}</Text>
                  {tab.badge && (
                    <Badge colorScheme={tab.badgeColor} fontSize="2xs" borderRadius="full" px={1.5}>{tab.badge}</Badge>
                  )}
                </HStack>
              </Tab>
            ))}
          </TabList>
        </Box>

        <TabPanels>

          {/* ════════════════════════════════════════
              TAB 0: FILL TEMPLATE
          ════════════════════════════════════════ */}
          <TabPanel p={0}>
            <Accordion
              allowMultiple
              index={accordionIndices}
              onChange={(indices) => setAccordionIndices(indices)}
            >
              {/* 0 — Caption & Parties */}
              <AccordionItem borderWidth="0" borderBottomWidth="1px" borderColor={borderColor}>
                <AccordionButton px={4} py={3} _hover={{ bg: 'transparent' }}>
                  <SectionLabel icon={MdPerson} label="Caption & Parties" />
                  <AccordionIcon color={muted} />
                </AccordionButton>
                <AccordionPanel pb={4} px={4}>
                  <VStack spacing={3} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="xs" color={muted} mb={1}>Court</FormLabel>
                        <Input id="edit-field-court" size="sm" value={result.court || ''} onChange={(e) => patch({ court: e.target.value })} placeholder={BLANK_PLACEHOLDER} sx={fieldSx(isPlaceholderValue(result.court))} borderRadius="md" bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" color={muted} mb={1}>Case number</FormLabel>
                        <Input id="edit-field-caseNumber" size="sm" value={result.caseNumber || ''} onChange={(e) => patch({ caseNumber: e.target.value })} placeholder="MJC NO. ______ OF ______" sx={fieldSx(isPlaceholderValue(result.caseNumber))} borderRadius="md" bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" color={muted} mb={1}>Petitioner</FormLabel>
                        <Textarea id="edit-field-petitionerName" size="sm" rows={2} value={result.petitionerName || ''} onChange={(e) => patch({ petitionerName: e.target.value })} placeholder="Enter ; to add multiple parties" sx={textareaSx(isPlaceholderValue(result.petitionerName))} borderRadius="md" bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" color={muted} mb={1}>Respondent / opposite party</FormLabel>
                        <Textarea id="edit-field-respondentName" size="sm" rows={2} value={result.respondentName || ''} onChange={(e) => patch({ respondentName: e.target.value })} placeholder="Enter ; to add multiple parties" sx={textareaSx(isPlaceholderValue(result.respondentName))} borderRadius="md" bg={inputBg} />
                      </FormControl>
                      <FormControl gridColumn={{ md: 'span 2' }}>
                        <FormLabel fontSize="xs" color={muted} mb={1}>Jurisdiction line</FormLabel>
                        <Input id="edit-field-jurisdictionLine" size="sm" value={jurisdictionValue} onChange={(e) => patch({ jurisdictionLine: e.target.value })} placeholder="(Miscellaneous Jurisdiction Case)" sx={fieldSx(isPlaceholderValue(jurisdictionValue))} borderRadius="md" bg={inputBg} />
                      </FormControl>
                      <FormControl gridColumn={{ md: 'span 2' }}>
                        <FormLabel fontSize="xs" color={muted} mb={1}>Document title (caption)</FormLabel>
                        <Input id="edit-field-documentTitle" size="sm" value={result.documentTitle || resolveCounterOnBehalfParticulars(result)} onChange={(e) => patch({ documentTitle: e.target.value })} placeholder={BLANK_PLACEHOLDER} sx={fieldSx(isPlaceholderValue(result.documentTitle || resolveCounterOnBehalfParticulars(result)))} borderRadius="md" bg={inputBg} />
                      </FormControl>
                      {(result.oppositePartyNo != null || result.showCauseOnBehalfOfOpNo != null) && (
                        <>
                          <FormControl>
                            <FormLabel fontSize="xs" color={muted} mb={1}>Opposite party no.</FormLabel>
                            <Input id="edit-field-oppositePartyNo" size="sm" value={result.oppositePartyNo || ''} onChange={(e) => patch({ oppositePartyNo: e.target.value })} sx={fieldSx(isPlaceholderValue(result.oppositePartyNo))} borderRadius="md" bg={inputBg} />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs" color={muted} mb={1}>Show cause on behalf of (Op. no.)</FormLabel>
                            <Input id="edit-field-showCauseOnBehalfOfOpNo" size="sm" value={result.showCauseOnBehalfOfOpNo || ''} onChange={(e) => patch({ showCauseOnBehalfOfOpNo: e.target.value })} sx={fieldSx(isPlaceholderValue(result.showCauseOnBehalfOfOpNo))} borderRadius="md" bg={inputBg} />
                          </FormControl>
                        </>
                      )}
                    </SimpleGrid>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 1 — Subject & Index */}
              <AccordionItem borderWidth="0" borderBottomWidth="1px" borderColor={borderColor}>
                <AccordionButton px={4} py={3} _hover={{ bg: 'transparent' }}>
                  <SectionLabel icon={MdTableRows} label="Subject & Index (first page)" />
                  <AccordionIcon color={muted} />
                </AccordionButton>
                <AccordionPanel pb={4} px={4}>
                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="xs" color={muted} mb={1}>Subject line</FormLabel>
                      <Input id="edit-field-captionSubject" size="sm" value={result.captionSubject || 'Counter Affidavit'} onChange={(e) => patch({ captionSubject: e.target.value })} placeholder="Counter Affidavit" borderRadius="md" bg={inputBg} />
                      <Text fontSize="2xs" color={muted} mt={1}>Shown as "Subject: …" on the first page.</Text>
                    </FormControl>

                    <Box>
                      <HStack justify="space-between" align="center" mb={2}>
                        <Text fontSize="xs" fontWeight="600" color={muted} textTransform="uppercase" letterSpacing="0.05em">INDEX table</Text>
                        <HStack spacing={1}>
                          <Button size="xs" variant="ghost" colorScheme="gray" onClick={resetMainIndexRow} fontSize="2xs">Reset row 1</Button>
                          <Button size="xs" variant="outline" colorScheme="purple" leftIcon={<AddIcon boxSize={2} />} onClick={addIndexRow} fontSize="2xs">Add row</Button>
                        </HStack>
                      </HStack>
                      <VStack spacing={2} align="stretch">
                        {indexEntries.map((row, i) => (
                          <Box key={`idx-${i}-${row.slNo}`} p={3} borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={rowBg}>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="xs" fontWeight="600" color={muted}>Row {row.slNo || i + 1}{i === 0 ? ' — counter on behalf of' : ''}</Text>
                              {indexEntries.length > 1 && (
                                <IconButton aria-label="Remove row" size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} onClick={() => removeIndexRow(i)} />
                              )}
                            </HStack>
                            <VStack spacing={2}>
                              <FormControl>
                                <FormLabel fontSize="2xs" color={muted} mb={0.5}>Particulars</FormLabel>
                                <Textarea size="sm" rows={i === 0 ? 2 : 3} value={row.particulars || ''} onChange={(e) => patchIndexRow(i, 'particulars', e.target.value)} placeholder={i === 0 ? 'Counter Affidavit on behalf of …' : 'Annexure-A: …'} sx={textareaSx(isPlaceholderValue(row.particulars))} borderRadius="md" bg={inputBg} />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="2xs" color={muted} mb={0.5}>Page no.</FormLabel>
                                <Input size="sm" value={row.page || ''} onChange={(e) => patchIndexRow(i, 'page', e.target.value)} placeholder="—" borderRadius="md" bg={inputBg} />
                              </FormControl>
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>

                    {/* Annexure upload */}
                    <Box pt={3} borderTopWidth="1px" borderColor={borderColor}>
                      <Text fontSize="xs" fontWeight="600" mb={1}>Attach annexure file</Text>
                      <Text fontSize="2xs" color={muted} mb={2}>PDF or image. An INDEX row is created and photostat pages included in court export.</Text>
                      <VStack spacing={2} align="stretch">
                        <FormControl isRequired>
                          <FormLabel fontSize="2xs" color={muted} mb={0.5}>What is this annexure?</FormLabel>
                          <Input size="sm" value={annexureDescription} onChange={(e) => setAnnexureDescription(e.target.value)} placeholder="e.g. Copy of order dated 15.03.2024" borderRadius="md" bg={inputBg} />
                        </FormControl>
                        <input ref={annexureFileRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleAnnexureFilePick} />
                        <Button size="sm" colorScheme="purple" variant="outline" onClick={() => annexureFileRef.current?.click()} isLoading={annexureUploading} loadingText="Uploading…" borderRadius="md">
                          Choose file & add to INDEX
                        </Button>
                        {uploadedAnnexures.length > 0 && (
                          <VStack spacing={1} align="stretch">
                            {uploadedAnnexures.map((a) => (
                              <HStack key={`${a.letter}-${a.fileId}`} justify="space-between" p={2} borderWidth="1px" borderColor={borderColor} borderRadius="md" fontSize="2xs">
                                <Box flex={1} minW={0}>
                                  <Text fontWeight="600">Annexure-{a.letter}</Text>
                                  <Text noOfLines={1} color={muted}>{a.description || a.fileName}</Text>
                                  {(a.pageRange || a.page) && <Text color={muted}>Pages: {a.pageRange || a.page}</Text>}
                                </Box>
                                <IconButton aria-label="Remove annexure" size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} onClick={() => removeUploadedAnnexure(a.letter)} />
                              </HStack>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 2 — Introductory paragraphs */}
              <AccordionItem borderWidth="0" borderBottomWidth="1px" borderColor={borderColor}>
                <AccordionButton px={4} py={3} _hover={{ bg: 'transparent' }}>
                  <SectionLabel icon={MdDescription} label="Introductory paragraphs" badge={introParagraphs.length} />
                  <AccordionIcon color={muted} />
                </AccordionButton>
                <AccordionPanel pb={4} px={4}>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="2xs" color={muted}>Initial declarations (designation, authorization, general denial) before the main defence.</Text>
                    {introParagraphs.length === 0 ? (
                      <AddRowBtn onClick={addIntroParagraph} label="Add introductory paragraph" />
                    ) : (
                      <>
                        {introParagraphs.map((para, i) => (
                          <FormControl key={`intro-${i}`}>
                            <HStack justify="space-between" mb={1}>
                              <FormLabel fontSize="xs" color={muted} mb={0}>Paragraph {i + 1}</FormLabel>
                              <HStack spacing={0.5}>
                                <IconButton aria-label="Move Up" size="xs" variant="ghost" icon={<MdArrowUpward />} onClick={() => moveIntroParagraph(i, -1)} isDisabled={i === 0} />
                                <IconButton aria-label="Move Down" size="xs" variant="ghost" icon={<MdArrowDownward />} onClick={() => moveIntroParagraph(i, 1)} isDisabled={i === introParagraphs.length - 1} />
                                <IconButton aria-label="Remove" size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} onClick={() => removeIntroParagraph(i)} />
                              </HStack>
                            </HStack>
                            <Textarea id={`edit-section-introductoryParagraphs-${i}`} size="sm" rows={3} value={para || ''} onChange={(e) => patchIntroParagraph(i, e.target.value)} placeholder="That the deponent states…" sx={textareaSx(isPlaceholderValue(para))} borderRadius="md" bg={inputBg} />
                          </FormControl>
                        ))}
                        <AddRowBtn onClick={addIntroParagraph} label="Add paragraph" />
                      </>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 3 — Deponent, Prayer, Verification */}
              <AccordionItem borderWidth="0" borderBottomWidth="1px" borderColor={borderColor}>
                <AccordionButton px={4} py={3} _hover={{ bg: 'transparent' }}>
                  <SectionLabel icon={MdVerifiedUser} label="Deponent, Prayer & Verification" />
                  <AccordionIcon color={muted} />
                </AccordionButton>
                <AccordionPanel pb={4} px={4}>
                  <VStack align="stretch" spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="xs" color={muted} mb={1}>Details of the deponent</FormLabel>
                      <Textarea id="edit-field-deponentDetails" size="sm" rows={4} value={result.deponentDetails || ''} onChange={(e) => patch({ deponentDetails: e.target.value })} placeholder={BLANK_PLACEHOLDER} sx={textareaSx(isPlaceholderValue(result.deponentDetails))} borderRadius="md" bg={inputBg} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs" color={muted} mb={1}>Prayer</FormLabel>
                      <Textarea id="edit-field-prayer" size="sm" rows={3} value={result.prayer || ''} onChange={(e) => patch({ prayer: e.target.value })} placeholder={BLANK_PLACEHOLDER} sx={textareaSx(isPlaceholderValue(result.prayer))} borderRadius="md" bg={inputBg} />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs" color={muted} mb={1}>Verification</FormLabel>
                      <Textarea id="edit-field-verification" size="sm" rows={3} value={result.verification || ''} onChange={(e) => patch({ verification: e.target.value })} placeholder="Verified at ______ on this ______ day of ______, 20____" sx={textareaSx(isPlaceholderValue(result.verification))} borderRadius="md" bg={inputBg} />
                    </FormControl>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 4 — Defence */}
              <AccordionItem borderWidth="0" borderBottomWidth="1px" borderColor={borderColor}>
                <AccordionButton px={4} py={3} _hover={{ bg: 'transparent' }}>
                  <SectionLabel icon={FaBalanceScale} label="Defence paragraphs" badge={defenceParagraphs.filter((p) => String(p||'').trim()).length} />
                  <AccordionIcon color={muted} />
                </AccordionButton>
                <AccordionPanel pb={4} px={4}>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="2xs" color={muted}>Added under "DEFENCE" heading. One box per numbered paragraph.</Text>
                    {defenceParagraphs.length === 0 ? (
                      <AddRowBtn onClick={addDefenceParagraph} label="Add defence paragraph" />
                    ) : (
                      <>
                        {defenceParagraphs.map((para, i) => (
                          <FormControl key={`defence-${i}`}>
                            <HStack justify="space-between" mb={1}>
                              <FormLabel fontSize="xs" color={muted} mb={0}>Paragraph {i + 1}</FormLabel>
                              <HStack spacing={0.5}>
                                <IconButton aria-label="Move Up" size="xs" variant="ghost" icon={<MdArrowUpward />} onClick={() => moveDefenceParagraph(i, -1)} isDisabled={i === 0} />
                                <IconButton aria-label="Move Down" size="xs" variant="ghost" icon={<MdArrowDownward />} onClick={() => moveDefenceParagraph(i, 1)} isDisabled={i === defenceParagraphs.length - 1} />
                                <IconButton aria-label="Remove" size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} onClick={() => removeDefenceParagraph(i)} />
                              </HStack>
                            </HStack>
                            <Textarea id={`edit-section-defenceSection-${i}`} size="sm" rows={4} value={typeof para === 'string' ? para : String(para || '')} onChange={(e) => patchDefenceParagraph(i, e.target.value)} placeholder="That the respondent states that…" sx={textareaSx(isPlaceholderValue(para))} borderRadius="md" bg={inputBg} />
                          </FormControl>
                        ))}
                        <AddRowBtn onClick={addDefenceParagraph} label="Add paragraph" />
                      </>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 5 — Preliminary objections */}
              <AccordionItem borderWidth="0" borderBottomWidth="1px" borderColor={borderColor}>
                <AccordionButton px={4} py={3} _hover={{ bg: 'transparent' }}>
                  <SectionLabel icon={MdBalance} label="Preliminary objections" badge={objections.length} />
                  <AccordionIcon color={muted} />
                </AccordionButton>
                <AccordionPanel pb={4} px={4}>
                  <VStack align="stretch" spacing={2}>
                    {objections.length === 0 ? (
                      <AddRowBtn onClick={addObjection} label="Add objection" />
                    ) : (
                      <>
                        {objections.map((obj, i) => (
                          <FormControl key={`objection-${i}`}>
                            <HStack justify="space-between" mb={1}>
                              <FormLabel fontSize="xs" color={muted} mb={0}>Objection {i + 1}</FormLabel>
                              <HStack spacing={0.5}>
                                <IconButton aria-label="Move Up" size="xs" variant="ghost" icon={<MdArrowUpward />} onClick={() => moveObjection(i, -1)} isDisabled={i === 0} />
                                <IconButton aria-label="Move Down" size="xs" variant="ghost" icon={<MdArrowDownward />} onClick={() => moveObjection(i, 1)} isDisabled={i === objections.length - 1} />
                                <IconButton aria-label="Remove" size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} onClick={() => removeObjection(i)} />
                              </HStack>
                            </HStack>
                            <Textarea id={`edit-section-preliminaryObjections-${i}`} size="sm" rows={2} value={typeof obj === 'string' ? obj : String(obj || '')} onChange={(e) => patchObjection(i, e.target.value)} placeholder={BLANK_PLACEHOLDER} sx={textareaSx(isPlaceholderValue(obj))} borderRadius="md" bg={inputBg} />
                          </FormControl>
                        ))}
                        <AddRowBtn onClick={addObjection} label="Add objection" />
                      </>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 6 — Para-wise reply */}
              <AccordionItem borderWidth="0" borderBottomWidth="1px" borderColor={borderColor}>
                <AccordionButton px={4} py={3} _hover={{ bg: 'transparent' }}>
                  <SectionLabel icon={MdList} label="Para-wise reply" badge={counterDraft.length} badgeColor="blue" />
                  <AccordionIcon color={muted} />
                </AccordionButton>
                <AccordionPanel pb={4} px={4} maxH="440px" overflowY="auto">
                  <VStack align="stretch" spacing={3}>
                    {counterDraft.length === 0 ? (
                      <AddRowBtn onClick={addCounterDraftRow} label="Add para reply" />
                    ) : (
                      <>
                        {counterDraft.map((item, i) => (
                          <Box key={`counter-${i}`} p={3} borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={rowBg}>
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="xs" fontWeight="600" color={muted}>
                                Para {item.petitionParaNo ?? item.paraNo ?? i + 1}
                                {item.stance ? <> · <Text as="span" color="purple.400">{item.stance}</Text></> : ''}
                              </Text>
                              <HStack spacing={0.5}>
                                <IconButton aria-label="Move Up" size="xs" variant="ghost" icon={<MdArrowUpward />} onClick={() => moveCounterDraftRow(i, -1)} isDisabled={i === 0} />
                                <IconButton aria-label="Move Down" size="xs" variant="ghost" icon={<MdArrowDownward />} onClick={() => moveCounterDraftRow(i, 1)} isDisabled={i === counterDraft.length - 1} />
                                <IconButton aria-label="Remove" size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} onClick={() => removeCounterDraftRow(i)} />
                              </HStack>
                            </HStack>
                            <SimpleGrid columns={2} spacing={2} mb={2}>
                              <FormControl>
                                <FormLabel fontSize="2xs" color={muted} mb={0.5}>Para No.</FormLabel>
                                <Input size="sm" value={item.petitionParaNo ?? item.paraNo ?? ''} onChange={(e) => onPatchCounterDraft?.(i, 'petitionParaNo', Number(e.target.value) || e.target.value)} borderRadius="md" bg={inputBg} />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="2xs" color={muted} mb={0.5}>Stance</FormLabel>
                                <Input size="sm" value={item.stance || ''} onChange={(e) => onPatchCounterDraft?.(i, 'stance', e.target.value)} borderRadius="md" bg={inputBg} />
                              </FormControl>
                            </SimpleGrid>
                            <FormControl mb={2}>
                              <FormLabel fontSize="xs" color={muted} mb={0.5}>Reply</FormLabel>
                              <Textarea id={`edit-section-counterDraft-${i}`} size="sm" rows={3} value={item.counterArgument || ''} onChange={(e) => onPatchCounterDraft?.(i, 'counterArgument', e.target.value)} placeholder={BLANK_PLACEHOLDER} sx={textareaSx(isPlaceholderValue(item.counterArgument))} borderRadius="md" bg={inputBg} />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="xs" color={muted} mb={0.5}>Supporting law (optional)</FormLabel>
                              <Input size="sm" value={item.supportingLaw || ''} onChange={(e) => onPatchCounterDraft?.(i, 'supportingLaw', e.target.value)} placeholder={BLANK_PLACEHOLDER} sx={fieldSx(isPlaceholderValue(item.supportingLaw))} borderRadius="md" bg={inputBg} />
                            </FormControl>
                          </Box>
                        ))}
                        <AddRowBtn onClick={addCounterDraftRow} label="Add para reply" />
                      </>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 7 — Additional facts */}
              <AccordionItem borderWidth="0" borderBottomWidth="1px" borderColor={borderColor}>
                <AccordionButton px={4} py={3} _hover={{ bg: 'transparent' }}>
                  <SectionLabel icon={MdFolder} label="Additional facts" badge={addFacts.length} />
                  <AccordionIcon color={muted} />
                </AccordionButton>
                <AccordionPanel pb={4} px={4}>
                  <VStack align="stretch" spacing={2}>
                    {addFacts.length === 0 ? (
                      <AddRowBtn onClick={addAdditionalFact} label="Add additional fact" />
                    ) : (
                      <>
                        {addFacts.map((f, i) => (
                          <FormControl key={`fact-${i}`}>
                            <HStack justify="space-between" mb={1}>
                              <FormLabel fontSize="xs" color={muted} mb={0}>Fact {i + 1}</FormLabel>
                              <HStack spacing={0.5}>
                                <IconButton aria-label="Move Up" size="xs" variant="ghost" icon={<MdArrowUpward />} onClick={() => moveAdditionalFact(i, -1)} isDisabled={i === 0} />
                                <IconButton aria-label="Move Down" size="xs" variant="ghost" icon={<MdArrowDownward />} onClick={() => moveAdditionalFact(i, 1)} isDisabled={i === addFacts.length - 1} />
                                <IconButton aria-label="Remove" size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} onClick={() => removeAdditionalFact(i)} />
                              </HStack>
                            </HStack>
                            <Textarea id={`edit-section-statementOfAdditionalFacts-${i}`} size="sm" rows={2} value={typeof f === 'string' ? f : String(f || '')} onChange={(e) => patchAdditionalFact(i, e.target.value)} placeholder={BLANK_PLACEHOLDER} sx={textareaSx(isPlaceholderValue(f))} borderRadius="md" bg={inputBg} />
                          </FormControl>
                        ))}
                        <AddRowBtn onClick={addAdditionalFact} label="Add fact" />
                      </>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 8 — Closing paragraphs */}
              <AccordionItem borderWidth="0">
                <AccordionButton px={4} py={3} _hover={{ bg: 'transparent' }}>
                  <SectionLabel icon={MdDescription} label="Closing paragraphs" badge={closingParagraphs.length} />
                  <AccordionIcon color={muted} />
                </AccordionButton>
                <AccordionPanel pb={4} px={4}>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="2xs" color={muted}>Final declarations before the verification signature.</Text>
                    {closingParagraphs.length === 0 ? (
                      <AddRowBtn onClick={addClosingParagraph} label="Add closing paragraph" />
                    ) : (
                      <>
                        {closingParagraphs.map((para, i) => (
                          <FormControl key={`closing-${i}`}>
                            <HStack justify="space-between" mb={1}>
                              <FormLabel fontSize="xs" color={muted} mb={0}>Paragraph {i + 1}</FormLabel>
                              <HStack spacing={0.5}>
                                <IconButton aria-label="Move Up" size="xs" variant="ghost" icon={<MdArrowUpward />} onClick={() => moveClosingParagraph(i, -1)} isDisabled={i === 0} />
                                <IconButton aria-label="Move Down" size="xs" variant="ghost" icon={<MdArrowDownward />} onClick={() => moveClosingParagraph(i, 1)} isDisabled={i === closingParagraphs.length - 1} />
                                <IconButton aria-label="Remove" size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} onClick={() => removeClosingParagraph(i)} />
                              </HStack>
                            </HStack>
                            <Textarea id={`edit-section-closingParagraphs-${i}`} size="sm" rows={3} value={para || ''} onChange={(e) => patchClosingParagraph(i, e.target.value)} placeholder="That the deponent states…" sx={textareaSx(isPlaceholderValue(para))} borderRadius="md" bg={inputBg} />
                          </FormControl>
                        ))}
                        <AddRowBtn onClick={addClosingParagraph} label="Add paragraph" />
                      </>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </TabPanel>

          {/* ════════════════════════════════════════
              TAB 1: PRECEDENCES
          ════════════════════════════════════════ */}
          <TabPanel p={0}>
            <Box px={4} py={3} borderBottomWidth="1px" borderColor={borderColor} bg={sectionBg}>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" fontWeight="600">Case Precedences</Text>
                  <Text fontSize="2xs" color={muted}>Click <strong>Apply Principle</strong> to add a citation as a Defence paragraph.</Text>
                </VStack>
                {totalPrecedences > 0 && (
                  <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} fontSize="2xs">
                    {totalPrecedences} case{totalPrecedences > 1 ? 's' : ''}
                  </Badge>
                )}
              </HStack>
            </Box>
            <Box
              overflowY="auto"
              maxH={{ lg: 'calc(100vh - 200px)' }}
              p={3}
              css={{
                '&::-webkit-scrollbar': { width: '3px' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(128,90,213,0.25)', borderRadius: '2px' },
              }}
            >
              <PrecedencePanel
                precedences={precedences}
                statutes={statutes}
                aiSuggestedPrecedents={aiSuggestedPrecedents}
                fileId={fileId}
                compact={true}
                docType={detectedDocType}
                docSnippet={scanData?.scanResults?.summary || ''}
                onApplySuggestion={handleApplyCasePrinciple}
              />
            </Box>
          </TabPanel>

          {/* ════════════════════════════════════════
              TAB 2: CASE SEARCH
          ════════════════════════════════════════ */}
          <TabPanel p={0}>
            <Box px={4} py={3} borderBottomWidth="1px" borderColor={borderColor} bg={sectionBg}>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="600">Case Law Search</Text>
                <Text fontSize="2xs" color={muted}>Search Indian case law — click <strong>Cite</strong> to add to Defence.</Text>
              </VStack>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              h={{ lg: 'calc(100vh - 200px)' }}
              overflow="hidden"
            >
              <CaseLawSearchPanel
                compact={true}
                onApplySuggestion={(suggestion) => {
                  const citeText = suggestion?.suggestedText || '';
                  if (citeText) handleInsertCitation(citeText);
                }}
              />
            </Box>
          </TabPanel>

        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CounterFillBlanksPanel;
