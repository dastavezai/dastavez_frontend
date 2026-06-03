import React, { useRef, useState } from 'react';
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
  IconButton,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { isPlaceholderValue } from '../utils/counterStudioBlanks';
import fileService from '../services/fileService';
import { formatDepartmentApiError } from '../services/apiBase';
import {
  buildDefaultIndexEntries,
  resolveCounterOnBehalfParticulars,
} from '../utils/counterStudioIndex';

const BLANK_PLACEHOLDER = '_______________';

const fieldSx = (needsFill) => ({
  w: '100%',
  minH: needsFill ? '2.5rem' : '2.25rem',
  ...(needsFill
    ? {
      borderColor: 'orange.300',
      bg: 'orange.50',
      _dark: { bg: 'whiteAlpha.100' },
      _focus: { borderColor: 'orange.400', boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)' },
    }
    : {}),
});

const textareaSx = (needsFill) => ({
  w: '100%',
  minH: needsFill ? '5rem' : '4rem',
  resize: 'vertical',
  ...(needsFill
    ? {
      borderColor: 'orange.300',
      bg: 'orange.50',
      _dark: { bg: 'whiteAlpha.100' },
      _focus: { borderColor: 'orange.400', boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)' },
    }
    : {}),
});

const CounterFillBlanksPanel = ({ result, blankCount, onPatch, onPatchCounterDraft, onAnnexureChange }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const sectionBg = useColorModeValue('gray.50', 'gray.750');
  const toast = useToast();
  const annexureFileRef = useRef(null);
  const [annexureDescription, setAnnexureDescription] = useState('');
  const [annexureUploading, setAnnexureUploading] = useState(false);

  if (!result) return null;

  const patch = (fields) => onPatch?.(fields);

  const jurisdictionValue =
    result.jurisdictionLine ||
    (typeof result.jurisdiction === 'string' ? result.jurisdiction : '');

  const counterDraft = result.counterDraft || [];
  const objections = result.preliminaryObjections || [];
  const addFacts = result.statementOfAdditionalFacts || [];
  const defenceParagraphs = Array.isArray(result.defenceSection) ? result.defenceSection : [];

  const patchDefenceParagraph = (index, value) => {
    const next = [...defenceParagraphs];
    next[index] = value;
    patch({ defenceSection: next });
  };

  const addDefenceParagraph = () => {
    patch({ defenceSection: [...defenceParagraphs, ''] });
  };

  const removeDefenceParagraph = (index) => {
    const next = defenceParagraphs.filter((_, i) => i !== index);
    patch({ defenceSection: next });
  };

  const indexEntries =
    Array.isArray(result.indexEntries) && result.indexEntries.length > 0
      ? result.indexEntries
      : buildDefaultIndexEntries(result);

  const patchIndexRow = (rowIndex, field, value) => {
    const next = indexEntries.map((row, i) => (
      i === rowIndex ? { ...row, [field]: value } : row
    ));
    patch({ indexEntries: next });
  };

  const addIndexRow = () => {
    const next = [
      ...indexEntries,
      {
        slNo: String(indexEntries.length + 1),
        particulars: '',
        page: '',
        rowType: 'annexure',
      },
    ];
    patch({ indexEntries: next });
  };

  const removeIndexRow = (rowIndex) => {
    if (indexEntries.length <= 1) return;
    const next = indexEntries
      .filter((_, i) => i !== rowIndex)
      .map((row, i) => ({ ...row, slNo: String(i + 1) }));
    patch({ indexEntries: next });
  };

  const uploadedAnnexures = (Array.isArray(result.annexureIndex) ? result.annexureIndex : [])
    .filter((a) => a?.userUploaded || a?.fileId);

  const removeUploadedAnnexure = (letter) => {
    const key = String(letter || '').toUpperCase();
    const next = (result.annexureIndex || []).filter(
      (a) => String(a?.letter || '').toUpperCase() !== key
    );
    patch({ annexureIndex: next });
    onAnnexureChange?.();
  };

  const handleAnnexureFilePick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const description = annexureDescription.trim();
    if (!description) {
      toast({
        title: 'Describe the annexure',
        description: 'Enter what this document is (shown in the INDEX particulars column).',
        status: 'warning',
        duration: 4000,
      });
      return;
    }

    setAnnexureUploading(true);
    try {
      const uploadRes = await fileService.uploadFile(file);
      const fileId = uploadRes?.file?._id || uploadRes?.fileId;
      if (!fileId) throw new Error('Upload did not return a file id');

      const reg = await fileService.registerCounterAnnexure({
        fileId,
        description,
        annexureIndex: result.annexureIndex || [],
      });

      patch({ annexureIndex: reg.annexureIndex || [] });
      setAnnexureDescription('');
      onAnnexureChange?.();
      toast({
        title: 'Annexure added',
        description: reg.annexure?.letter
          ? `Annexure-${reg.annexure.letter} — INDEX updated${reg.annexure.pageRange ? ` (pages ${reg.annexure.pageRange})` : ''}.`
          : 'INDEX table updated.',
        status: 'success',
        duration: 4000,
      });
    } catch (err) {
      toast({
        title: 'Could not attach annexure',
        description: formatDepartmentApiError(err, 'Upload or registration failed.'),
        status: 'error',
        duration: 6000,
      });
    } finally {
      setAnnexureUploading(false);
    }
  };

  const resetMainIndexRow = () => {
    const next = [...indexEntries];
    next[0] = {
      ...next[0],
      slNo: '1',
      rowType: 'main',
      particulars: resolveCounterOnBehalfParticulars(result),
    };
    patch({ indexEntries: next });
  };

  return (
    <Box
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
    >
      <Box px={4} py={2} borderBottomWidth="1px" borderColor={borderColor} bg={sectionBg}>
        <Text fontSize="sm" fontWeight="semibold">Fill in the template</Text>
        <Text fontSize="xs" color={muted} mt={0.5}>
          Changes update the formatted preview above and are used for PDF/HTML export (court layout).
        </Text>
        {blankCount > 0 ? (
          <Badge mt={2} colorScheme="orange" fontSize="2xs">
            {blankCount} field{blankCount === 1 ? '' : 's'} still look blank
          </Badge>
        ) : (
          <Badge mt={2} colorScheme="green" fontSize="2xs">No obvious blanks detected</Badge>
        )}
      </Box>

      <Accordion allowMultiple defaultIndex={[0, 1, 2, 3]} px={2} pb={2}>
        <AccordionItem border="none">
          <AccordionButton px={2} py={2}>
            <Text flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">Caption & parties</Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={3} px={1}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <FormControl>
                <FormLabel fontSize="xs">Court</FormLabel>
                <Input
                  size="sm"
                  value={result.court || ''}
                  onChange={(e) => patch({ court: e.target.value })}
                  placeholder={BLANK_PLACEHOLDER}
                  sx={fieldSx(isPlaceholderValue(result.court))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Case number</FormLabel>
                <Input
                  size="sm"
                  value={result.caseNumber || ''}
                  onChange={(e) => patch({ caseNumber: e.target.value })}
                  placeholder="MJC NO. ______ OF ______"
                  sx={fieldSx(isPlaceholderValue(result.caseNumber))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Petitioner</FormLabel>
                <Textarea
                  size="sm"
                  rows={2}
                  value={result.petitionerName || ''}
                  onChange={(e) => patch({ petitionerName: e.target.value })}
                  placeholder="Enter ; to add more parties in new line"
                  sx={textareaSx(isPlaceholderValue(result.petitionerName))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Respondent / opposite party</FormLabel>
                <Textarea
                  size="sm"
                  rows={2}
                  value={result.respondentName || ''}
                  onChange={(e) => patch({ respondentName: e.target.value })}
                  placeholder="Enter ; to add more parties in new line"
                  sx={textareaSx(isPlaceholderValue(result.respondentName))}
                />
              </FormControl>
              <FormControl gridColumn={{ md: 'span 2' }}>
                <FormLabel fontSize="xs">Jurisdiction line (caption)</FormLabel>
                <Input
                  size="sm"
                  value={jurisdictionValue}
                  onChange={(e) => patch({ jurisdictionLine: e.target.value })}
                  placeholder="(Miscellaneous Jurisdiction Case)"
                  sx={fieldSx(isPlaceholderValue(jurisdictionValue))}
                />
              </FormControl>
              <FormControl gridColumn={{ md: 'span 2' }}>
                <FormLabel fontSize="xs">Document title (caption)</FormLabel>
                <Input
                  size="sm"
                  value={result.documentTitle || ''}
                  onChange={(e) => patch({ documentTitle: e.target.value })}
                  placeholder={BLANK_PLACEHOLDER}
                  sx={fieldSx(isPlaceholderValue(result.documentTitle))}
                />
              </FormControl>
              {(result.oppositePartyNo != null || result.showCauseOnBehalfOfOpNo != null) && (
                <>
                  <FormControl>
                    <FormLabel fontSize="xs">Opposite party no.</FormLabel>
                    <Input
                      size="sm"
                      value={result.oppositePartyNo || ''}
                      onChange={(e) => patch({ oppositePartyNo: e.target.value })}
                      sx={fieldSx(isPlaceholderValue(result.oppositePartyNo))}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs">Show cause on behalf of (Op. no.)</FormLabel>
                    <Input
                      size="sm"
                      value={result.showCauseOnBehalfOfOpNo || ''}
                      onChange={(e) => patch({ showCauseOnBehalfOfOpNo: e.target.value })}
                      sx={fieldSx(isPlaceholderValue(result.showCauseOnBehalfOfOpNo))}
                    />
                  </FormControl>
                </>
              )}
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem border="none">
          <AccordionButton px={2} py={2}>
            <Text flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">Subject &amp; index (first page)</Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={3} px={1}>
            <VStack align="stretch" spacing={3}>
              <FormControl>
                <FormLabel fontSize="xs">Subject line</FormLabel>
                <Input
                  size="sm"
                  value={result.captionSubject || 'Counter Affidavit'}
                  onChange={(e) => patch({ captionSubject: e.target.value })}
                  placeholder="Counter Affidavit"
                />
                <Text fontSize="2xs" color={muted} mt={1}>
                  Shown as &quot;Subject: …&quot; on the first page of the court template.
                </Text>
              </FormControl>
              <HStack justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="semibold">INDEX table</Text>
                <HStack spacing={1}>
                  <Button size="xs" variant="ghost" onClick={resetMainIndexRow}>
                    Reset row 1
                  </Button>
                  <Button size="xs" leftIcon={<AddIcon />} onClick={addIndexRow}>
                    Add row
                  </Button>
                </HStack>
              </HStack>
              {indexEntries.map((row, i) => (
                <Box
                  key={`idx-${i}-${row.slNo}`}
                  p={2}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight="medium">
                      Row {row.slNo || i + 1}
                      {i === 0 ? ' (counter on behalf of)' : ''}
                    </Text>
                    {indexEntries.length > 1 && (
                      <IconButton
                        aria-label="Remove index row"
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        icon={<DeleteIcon />}
                        onClick={() => removeIndexRow(i)}
                      />
                    )}
                  </HStack>
                  <VStack align="stretch" spacing={2}>
                    <FormControl>
                      <FormLabel fontSize="2xs">Particulars</FormLabel>
                      <Textarea
                        size="sm"
                        rows={i === 0 ? 2 : 3}
                        value={row.particulars || ''}
                        onChange={(e) => patchIndexRow(i, 'particulars', e.target.value)}
                        placeholder={i === 0 ? 'Counter Affidavit on behalf of …' : 'Annexure-A: …'}
                        sx={textareaSx(isPlaceholderValue(row.particulars))}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="2xs">Page no.</FormLabel>
                      <Input
                        size="sm"
                        value={row.page || ''}
                        onChange={(e) => patchIndexRow(i, 'page', e.target.value)}
                        placeholder="—"
                      />
                    </FormControl>
                  </VStack>
                </Box>
              ))}
              <Box pt={3} mt={2} borderTopWidth="1px" borderColor={borderColor}>
                <Text fontSize="xs" fontWeight="semibold" mb={2}>Attach annexure file</Text>
                <Text fontSize="2xs" color={muted} mb={2}>
                  PDF or image. We add an INDEX row (Annexure letter, particulars, page no.) and include photostat pages in court export when possible.
                </Text>
                <VStack align="stretch" spacing={2}>
                  <FormControl isRequired>
                    <FormLabel fontSize="2xs">What is this annexure?</FormLabel>
                    <Input
                      size="sm"
                      value={annexureDescription}
                      onChange={(e) => setAnnexureDescription(e.target.value)}
                      placeholder="e.g. Copy of order dated 15.03.2024"
                    />
                  </FormControl>
                  <input
                    ref={annexureFileRef}
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={handleAnnexureFilePick}
                  />
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => annexureFileRef.current?.click()}
                    isLoading={annexureUploading}
                    loadingText="Uploading…"
                  >
                    Choose file &amp; add to INDEX
                  </Button>
                  {uploadedAnnexures.length > 0 && (
                    <VStack align="stretch" spacing={1} pt={1}>
                      {uploadedAnnexures.map((a) => (
                        <HStack
                          key={`${a.letter}-${a.fileId}`}
                          fontSize="2xs"
                          justify="space-between"
                          p={2}
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="md"
                        >
                          <Box flex="1" minW={0}>
                            <Text fontWeight="semibold">Annexure-{a.letter}</Text>
                            <Text noOfLines={2} color={muted}>{a.description || a.fileName}</Text>
                            {(a.pageRange || a.page) && (
                              <Text color={muted}>Pages in bundle: {a.pageRange || a.page}</Text>
                            )}
                          </Box>
                          <IconButton
                            aria-label="Remove annexure"
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            icon={<DeleteIcon />}
                            onClick={() => removeUploadedAnnexure(a.letter)}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem border="none">
          <AccordionButton px={2} py={2}>
            <Text flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">Body — deponent, prayer, verification</Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={3} px={1}>
            <VStack align="stretch" spacing={3}>
              <FormControl>
                <FormLabel fontSize="xs">Details of the deponent</FormLabel>
                <Textarea
                  size="sm"
                  rows={4}
                  value={result.deponentDetails || ''}
                  onChange={(e) => patch({ deponentDetails: e.target.value })}
                  placeholder={BLANK_PLACEHOLDER}
                  sx={textareaSx(isPlaceholderValue(result.deponentDetails))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Prayer</FormLabel>
                <Textarea
                  size="sm"
                  rows={3}
                  value={result.prayer || ''}
                  onChange={(e) => patch({ prayer: e.target.value })}
                  placeholder={BLANK_PLACEHOLDER}
                  sx={textareaSx(isPlaceholderValue(result.prayer))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs">Verification</FormLabel>
                <Textarea
                  size="sm"
                  rows={3}
                  value={result.verification || ''}
                  onChange={(e) => patch({ verification: e.target.value })}
                  placeholder="Verified at ______ on this ______ day of ______, 20____"
                  sx={textareaSx(isPlaceholderValue(result.verification))}
                />
              </FormControl>
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem border="none">
          <AccordionButton px={2} py={2}>
            <Text flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">Defence</Text>
            {defenceParagraphs.filter((p) => String(p || '').trim()).length > 0 && (
              <Badge ml={2} colorScheme="blue">
                {defenceParagraphs.filter((p) => String(p || '').trim()).length}
              </Badge>
            )}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={3} px={1}>
            <VStack align="stretch" spacing={2}>
              <Text fontSize="2xs" color={muted}>
                Added under the heading &quot;DEFENCE&quot; in the court template (after the deponent block, before preliminary objections). Use one box per numbered paragraph when the template uses numbered body paragraphs.
              </Text>
              {defenceParagraphs.length === 0 ? (
                <Button size="sm" variant="outline" leftIcon={<AddIcon />} onClick={addDefenceParagraph}>
                  Add defence paragraph
                </Button>
              ) : (
                <>
                  {defenceParagraphs.map((para, i) => (
                    <FormControl key={`defence-${i}`}>
                      <HStack justify="space-between" mb={1}>
                        <FormLabel fontSize="xs" mb={0}>Paragraph {i + 1}</FormLabel>
                        <IconButton
                          aria-label="Remove defence paragraph"
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          icon={<DeleteIcon />}
                          onClick={() => removeDefenceParagraph(i)}
                        />
                      </HStack>
                      <Textarea
                        size="sm"
                        rows={4}
                        value={typeof para === 'string' ? para : String(para || '')}
                        onChange={(e) => patchDefenceParagraph(i, e.target.value)}
                        placeholder="That the respondent states that…"
                        sx={textareaSx(isPlaceholderValue(para))}
                      />
                    </FormControl>
                  ))}
                  <Button size="xs" variant="ghost" leftIcon={<AddIcon />} alignSelf="flex-start" onClick={addDefenceParagraph}>
                    Add another paragraph
                  </Button>
                </>
              )}
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {objections.length > 0 && (
          <AccordionItem border="none">
            <AccordionButton px={2} py={2}>
              <Text flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">Preliminary objections</Text>
              <Badge ml={2}>{objections.length}</Badge>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={3} px={1}>
              <VStack align="stretch" spacing={2}>
                {objections.map((obj, i) => (
                  <FormControl key={i}>
                    <FormLabel fontSize="xs">Objection {i + 1}</FormLabel>
                    <Textarea
                      size="sm"
                      rows={2}
                      value={typeof obj === 'string' ? obj : String(obj?.text || obj || '')}
                      onChange={(e) => {
                        const next = [...objections];
                        next[i] = e.target.value;
                        patch({ preliminaryObjections: next });
                      }}
                      placeholder={BLANK_PLACEHOLDER}
                      sx={textareaSx(isPlaceholderValue(obj))}
                    />
                  </FormControl>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        )}

        {counterDraft.length > 0 && (
          <AccordionItem border="none">
            <AccordionButton px={2} py={2}>
              <Text flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">Para-wise reply</Text>
              <Badge ml={2} colorScheme="purple">{counterDraft.length}</Badge>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={3} px={1} maxH="420px" overflowY="auto">
              <VStack align="stretch" spacing={3}>
                {counterDraft.map((item, i) => (
                  <Box key={i} p={2} borderWidth="1px" borderColor={borderColor} borderRadius="md">
                    <Text fontSize="xs" fontWeight="bold" mb={2}>
                      Petition para {item.petitionParaNo ?? item.paraNo ?? i + 1}
                      {item.stance ? ` · ${item.stance}` : ''}
                    </Text>
                    <FormControl mb={2}>
                      <FormLabel fontSize="xs">Reply</FormLabel>
                      <Textarea
                        size="sm"
                        rows={3}
                        value={item.counterArgument || ''}
                        onChange={(e) => onPatchCounterDraft?.(i, 'counterArgument', e.target.value)}
                        placeholder={BLANK_PLACEHOLDER}
                        sx={textareaSx(isPlaceholderValue(item.counterArgument))}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs">Supporting law (optional)</FormLabel>
                      <Input
                        size="sm"
                        value={item.supportingLaw || ''}
                        onChange={(e) => onPatchCounterDraft?.(i, 'supportingLaw', e.target.value)}
                        placeholder={BLANK_PLACEHOLDER}
                        sx={fieldSx(isPlaceholderValue(item.supportingLaw))}
                      />
                    </FormControl>
                  </Box>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        )}

        {addFacts.length > 0 && (
          <AccordionItem border="none">
            <AccordionButton px={2} py={2}>
              <Text flex="1" textAlign="left" fontWeight="semibold" fontSize="sm">Additional facts</Text>
              <Badge ml={2}>{addFacts.length}</Badge>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={3} px={1}>
              <VStack align="stretch" spacing={2}>
                {addFacts.map((f, i) => (
                  <FormControl key={i}>
                    <FormLabel fontSize="xs">Fact {i + 1}</FormLabel>
                    <Textarea
                      size="sm"
                      rows={2}
                      value={typeof f === 'string' ? f : String(f || '')}
                      onChange={(e) => {
                        const next = [...addFacts];
                        next[i] = e.target.value;
                        patch({ statementOfAdditionalFacts: next });
                      }}
                      placeholder={BLANK_PLACEHOLDER}
                      sx={textareaSx(isPlaceholderValue(f))}
                    />
                  </FormControl>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        )}
      </Accordion>
    </Box>
  );
};

export default CounterFillBlanksPanel;
