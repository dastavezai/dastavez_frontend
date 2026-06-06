import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Flex, HStack, VStack, Text, Badge, Button, IconButton, Select,
  Spinner, Tooltip, Divider, useToast, Icon, Progress,
} from '@chakra-ui/react';
import {
  FiCopy, FiCheck, FiX, FiRefreshCw, FiDownload, FiArrowRight,
} from 'react-icons/fi';
import {
  MdOutlineTransform, MdCompare, MdCheckCircle, MdGavel,
} from 'react-icons/md';
import ReactMarkdown from 'react-markdown';


const CONVERSION_MAP = {
  
  'Writ Petition':          ['Written Statement', 'Counter Affidavit', 'Reply Affidavit', 'Judicial Analysis'],
  'Civil Writ Petition':    ['Written Statement', 'Counter Affidavit', 'Reply Affidavit'],
  'Criminal Writ Petition': ['Counter Affidavit', 'Opposition Brief', 'Bail Opposition'],
  'Petition':               ['Written Statement', 'Counter Affidavit', 'Reply', 'Rejoinder'],
  'SLP':                    ['Counter to SLP', 'Reply Affidavit', 'Judicial Analysis'],
  'Special Leave Petition': ['Counter to SLP', 'Reply Affidavit'],

  
  'Plaint':            ['Written Statement', 'Counter-Claim', 'Third Party Notice'],
  'Written Statement': ['Rejoinder', 'Counter-Claim', 'Amended Plaint'],
  'Suit':              ['Written Statement', 'Counter-Claim'],

  
  'FIR':                ['Anticipatory Bail u/s 438 CrPC', 'Quashing Petition u/s 482 CrPC', 'Charge Sheet Response'],
  'Charge Sheet':       ['Defence Brief', 'Discharge Application', 'Cross-Exam Plan'],
  'Criminal Complaint': ['Defence Statement', 'Quashing Application'],
  'Bail Application':   ['Opposition to Bail', 'Bail Cancellation'],

  
  'Legal Notice':      ['Reply to Legal Notice', 'Counter Notice', 'Defamation Notice'],
  'Rent Agreement':    ['Eviction Notice', 'Rent Revision Notice'],
  'Rental Agreement':  ['Eviction Notice', 'Rent Dispute Petition'],
  'Sale Deed':         ['Cancellation Deed', 'Rectification Deed'],

  
  'Appeal':       ['Cross-Appeal', 'Reply to Appeal', 'Stay Application'],
  'First Appeal': ['Cross-Appeal', 'Reply to Appeal'],

  
  'Affidavit':              ['Counter-Affidavit', 'Supplementary Affidavit'],
  'Power of Attorney':      ['Revocation of POA', 'Amendment to POA'],
  'Will':                   ['Probate Application', 'Will Contest Petition', 'Codicil'],
  'Arbitration Agreement':  ['Statement of Claim', 'Statement of Defence'],
};

const GENERIC_CONVERSIONS = [
  'Case Summary / Brief',
  'Legal Memo',
  'Research Report',
  'Client Advisory Letter',
];


const C = {
  topBar:    '#0d1b2a',
  topBorder: '#1e3a5f',
  canvas:    '#e8e8e8',
  paper:     '#ffffff',
  text:      '#1a1a1a',
  muted:     '#64748b',
  accent:    '#3b82f6',
  green:     '#10b981',
  shadow:    '0 4px 24px rgba(0,0,0,0.18)',
};


const buildComponents = (fontFamily, fontSize, lineHeight) => ({
  p:          ({ children }) => <p style={{ marginBottom: '0.6em', fontFamily, fontSize, lineHeight, color: C.text }}>{children}</p>,
  h1:         ({ children }) => <h1 style={{ fontSize: '1.6em', fontWeight: 700, marginBottom: '0.5em', marginTop: '0.9em', fontFamily, color: C.text }}>{children}</h1>,
  h2:         ({ children }) => <h2 style={{ fontSize: '1.3em', fontWeight: 700, marginBottom: '0.4em', marginTop: '0.8em', fontFamily, color: C.text }}>{children}</h2>,
  h3:         ({ children }) => <h3 style={{ fontSize: '1.1em', fontWeight: 700, marginBottom: '0.35em', marginTop: '0.7em', fontFamily, color: C.text }}>{children}</h3>,
  strong:     ({ children }) => <strong style={{ fontWeight: 700, color: C.text }}>{children}</strong>,
  em:         ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  ul:         ({ children }) => <ul style={{ paddingLeft: '1.6em', marginBottom: '0.6em', color: C.text, fontFamily, fontSize, lineHeight }}>{children}</ul>,
  ol:         ({ children }) => <ol style={{ paddingLeft: '1.6em', marginBottom: '0.6em', color: C.text, fontFamily, fontSize, lineHeight }}>{children}</ol>,
  li:         ({ children }) => <li style={{ marginBottom: '0.25em', color: C.text, fontFamily, fontSize, lineHeight }}>{children}</li>,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #94a3b8', paddingLeft: '1em', marginLeft: '0.5em', fontStyle: 'italic', color: '#374151', marginBottom: '0.6em', fontFamily, fontSize }}>{children}</blockquote>,
  hr:         () => <hr style={{ border: 'none', borderTop: '1px solid #d1d5db', margin: '1em 0' }} />,
  table:      ({ children }) => <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0.8em', fontFamily, fontSize }}>{children}</table>,
  th:         ({ children }) => <th style={{ border: '1px solid #aaa', padding: '4px 8px', background: 'rgba(0,0,0,0.05)', fontWeight: 700, color: C.text }}>{children}</th>,
  td:         ({ children }) => <td style={{ border: '1px solid #aaa', padding: '4px 8px', color: C.text }}>{children}</td>,
});


const markdownToHtml = (md) => {
  if (!md) return '';
  let html = md;

  
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm,  '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm,   '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm,    '<h1>$1</h1>');

  
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');

  
  html = html.replace(/^---+$/gm, '<hr>');

  
  const lines = html.split('\n');
  const result = [];
  let inOl = false, inUl = false;

  for (const line of lines) {
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    const ulMatch = line.match(/^[-*]\s+(.+)/);

    if (olMatch) {
      if (!inOl) { if (inUl) { result.push('</ul>'); inUl = false; } result.push('<ol>'); inOl = true; }
      result.push(`<li>${olMatch[1]}</li>`);
    } else if (ulMatch) {
      if (!inUl) { if (inOl) { result.push('</ol>'); inOl = false; } result.push('<ul>'); inUl = true; }
      result.push(`<li>${ulMatch[1]}</li>`);
    } else {
      if (inOl) { result.push('</ol>'); inOl = false; }
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (line.trim() && !line.match(/^<[a-zA-Z]/)) {
        result.push(`<p>${line}</p>`);
      } else {
        result.push(line);
      }
    }
  }
  if (inOl) result.push('</ol>');
  if (inUl) result.push('</ul>');

  return result.join('\n');
};


const DocumentConverter = ({
  sourceHtml,
  documentType,
  language,
  fileService,
  pageStyle = {},
  editor,
  onExit,
  onContentReplaced,
}) => {
  const toast = useToast();

  const [conversionType, setConversionType] = useState('');
  const [isConverting, setIsConverting]     = useState(false);
  const [progress, setProgress]             = useState(0);
  const [markdown, setMarkdown]             = useState('');
  const [wordCount, setWordCount]           = useState(0);
  const [copied, setCopied]                 = useState(false);
  const [accepted, setAccepted]             = useState(false);

  
  const allConversions = useMemo(() => {
    const norm = (documentType || '').toLowerCase();
    const specific = Object.entries(CONVERSION_MAP).find(
      ([key]) => norm.includes(key.toLowerCase())
    )?.[1] || [];
    return [...specific, ...GENERIC_CONVERSIONS];
  }, [documentType]);

  
  useEffect(() => {
    if (allConversions.length > 0 && !conversionType) {
      setConversionType(allConversions[0]);
    }
  }, [allConversions]);  // eslint-disable-line

  
  const paperFont = pageStyle.fontFamily || "Georgia, 'Times New Roman', serif";
  const paperSize = pageStyle.fontSize   || '12pt';
  const paperLH   = pageStyle.lineHeight || 1.5;
  const padTop    = pageStyle.paddingTop    || '72px';
  const padBottom = pageStyle.paddingBottom || '72px';
  const padLeft   = pageStyle.paddingLeft   || '72px';
  const padRight  = pageStyle.paddingRight  || '72px';

  
  const convertDocument = useCallback(async (targetType) => {
    if (!sourceHtml || !fileService || !targetType) return;
    setIsConverting(true);
    setProgress(15);

    const sourceText = sourceHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 8000);

    setProgress(30);

    const prompt = `You are an EXPERT Indian legal document drafter with 25+ years of Supreme Court and High Court experience. Convert the following ${documentType || 'legal document'} into a complete, court-ready **${targetType}**.

ORIGINAL DOCUMENT:
${sourceText}

STRICT CONVERSION RULES:
1. Transform the document COMPLETELY into a proper ${targetType} format as filed in Indian courts.
2. Preserve ALL case numbers, dates, party names, court details, and factual details verbatim.
3. Use the STANDARD FORMAT for a ${targetType} in Indian legal practice — proper cause title, prayer sections, verification, etc.
4. If this is an opposing document (e.g. Petition → Written Statement), construct para-wise replies with counter-arguments for EACH numbered point.
5. Include ALL standard sections expected in a ${targetType} — do not skip any.
6. Use proper formal Indian legal language — cite Section numbers, Act names, and Rules correctly.
7. Use Markdown formatting: # for headings, **bold** for important terms, numbered lists for para-wise replies.
8. Start DIRECTLY with the document — no preamble, no "Here is", no explanation.

OUTPUT: A complete, court-filing-ready ${targetType} in Markdown.`;

    try {
      const context = sourceText.substring(0, 400);
      setProgress(50);
      const aiRes = await fileService.aiChatAboutDocument(prompt, context, [], language || 'en');
      setProgress(90);
      const text = (aiRes?.response || '').trim();

      if (text) {
        setMarkdown(text);
        setWordCount(text.split(/\s+/).filter(Boolean).length);
        toast({ title: `Converted to ${targetType}`, status: 'success', duration: 2000 });
      } else {
        setMarkdown('*Conversion failed. Please check LLM connection and retry.*');
        toast({ title: 'LLM returned empty', status: 'warning', duration: 3000 });
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setMarkdown('*Error during conversion. Please retry.*');
      toast({ title: 'Conversion failed', description: err.message, status: 'error', duration: 4000 });
    } finally {
      setProgress(100);
      setTimeout(() => { setIsConverting(false); setProgress(0); }, 300);
    }
  }, [sourceHtml, documentType, language, fileService, toast]);

  
  useEffect(() => {
    if (sourceHtml && conversionType) convertDocument(conversionType);
  }, []);  // eslint-disable-line

  const handleConversionChange = (newType) => {
    setConversionType(newType);
    setAccepted(false);
    convertDocument(newType);
  };

  
  const handleAcceptAll = () => {
    if (!editor || !markdown) return;
    const html = markdownToHtml(markdown);
    editor.commands.setContent(html);
    setAccepted(true);
    onContentReplaced?.();
    toast({
      title: 'Document replaced',
      description: `Content converted to ${conversionType}. Use Ctrl+Z to undo.`,
      status: 'success',
      duration: 4000,
    });
    setTimeout(() => onExit?.(), 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversionType.replace(/\s+/g, '_')}_converted.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mdComps = buildComponents(paperFont, paperSize, paperLH);

  
  return (
    <Flex direction="column" h="100%" bg={C.canvas} flex="1" overflow="hidden"
      style={{ fontFamily: paperFont }}>

      <Flex
        align="center" justify="space-between"
        px={3} py={1.5}
        bg={C.topBar} borderBottom={`1px solid ${C.topBorder}`}
        flexShrink={0} minH="44px"
      >
        <HStack spacing={2}>
          <Icon as={MdOutlineTransform} color={C.accent} boxSize={4} />
          <Text fontWeight="bold" fontSize="sm" color="white">
            Role Swap
          </Text>
          {conversionType && (
            <Badge colorScheme="blue" fontSize="2xs" px={2} py={0.5}
              borderRadius="full" textTransform="uppercase" letterSpacing="0.06em">
              {conversionType}
            </Badge>
          )}
        </HStack>

        <HStack spacing={1.5} flexShrink={0}>
          <Select
            size="xs" value={conversionType}
            onChange={e => handleConversionChange(e.target.value)}
            w="190px" fontSize="xs"
            bg="#1e3a5f" color="white" border="1px solid #2d5a8e" borderRadius="6px"
            _hover={{ bg: '#243f6a' }}
            sx={{ option: { background: '#0d1b2a', color: 'white' } }}
          >
            {allConversions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>

          <Divider orientation="vertical" h="22px" borderColor="#2d5a8e" />

          <Tooltip label="Re-convert" fontSize="xs" hasArrow>
            <IconButton icon={<FiRefreshCw size={13} />} size="xs" variant="ghost"
              color="gray.300" isLoading={isConverting}
              onClick={() => convertDocument(conversionType)} aria-label="Reconvert"
              _hover={{ bg: '#1e3a5f', color: 'white' }} />
          </Tooltip>
          <Tooltip label="Copy as text" fontSize="xs" hasArrow>
            <IconButton icon={copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
              size="xs" variant="ghost"
              color={copied ? 'green.400' : 'gray.300'}
              onClick={handleCopy} aria-label="Copy"
              _hover={{ bg: '#1e3a5f', color: 'white' }} />
          </Tooltip>
          <Tooltip label="Download Markdown" fontSize="xs" hasArrow>
            <IconButton icon={<FiDownload size={13} />} size="xs" variant="ghost"
              color="gray.300" onClick={handleDownload} aria-label="Download"
              _hover={{ bg: '#1e3a5f', color: 'white' }} />
          </Tooltip>

          <Divider orientation="vertical" h="22px" borderColor="#2d5a8e" />

          <Button
            size="xs" colorScheme="green"
            leftIcon={<MdCheckCircle size={14} />}
            onClick={handleAcceptAll}
            isDisabled={!markdown || isConverting || accepted}
            borderRadius="6px" fontSize="xs"
          >
            {accepted ? 'Accepted ✓' : 'Accept All'}
          </Button>

          <Tooltip label="Exit dual view (Esc)" fontSize="xs" hasArrow>
            <Button leftIcon={<FiX size={12} />} size="xs" bg="transparent"
              color="#f87171" border="1px solid #ef4444" borderRadius="6px" fontSize="xs"
              _hover={{ bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}
              onClick={onExit}>
              Exit
            </Button>
          </Tooltip>
        </HStack>
      </Flex>

      <Box
        px={4} py={1} flexShrink={0}
        bg="rgba(59,130,246,0.08)"
        borderBottom="1px solid rgba(59,130,246,0.15)"
        display="flex" alignItems="center" justifyContent="center" gap="10px"
      >
        <Badge colorScheme="orange" fontSize="2xs">{documentType || 'Document'}</Badge>
        <Icon as={FiArrowRight} color={C.accent} boxSize={3} />
        <Badge colorScheme="blue" fontSize="2xs">{conversionType}</Badge>
        {wordCount > 0 && (
          <Text fontSize="2xs" color={C.muted}>{wordCount} words</Text>
        )}
      </Box>

      {isConverting && (
        <Progress value={progress} size="xs" colorScheme="blue"
          bg="transparent" hasStripe isAnimated />
      )}

      <Box flex="1" overflowY="auto" bg={C.canvas} position="relative">
        {isConverting && (
          <Flex
            position="absolute" inset={0} zIndex={20}
            align="center" justify="center"
            bg="rgba(14,26,42,0.55)" direction="column" gap={3}
            style={{ backdropFilter: 'blur(3px)' }}
          >
            <Spinner size="lg" color={C.accent} thickness="3px" />
            <Text fontSize="sm" color="white" fontWeight="medium">
              Converting to {conversionType}…
            </Text>
            <Text fontSize="xs" color="gray.400">This may take 15-30 seconds</Text>
          </Flex>
        )}

        <Box
          mx="auto" my={8} mb={12}
          w="794px" minH="1122px"
          bg={C.paper} boxShadow={C.shadow} borderRadius="2px"
          style={{
            paddingTop: padTop, paddingBottom: padBottom,
            paddingLeft: padLeft, paddingRight: padRight,
            color: C.text, fontFamily: paperFont,
            fontSize: paperSize, lineHeight: paperLH,
          }}
        >
          {markdown
            ? <ReactMarkdown components={mdComps}>{markdown}</ReactMarkdown>
            : !isConverting && (
                <VStack spacing={4} align="center" py={16}>
                  <Icon as={MdOutlineTransform} boxSize={12} color="gray.400" />
                  <Text color={C.muted} fontStyle="italic" textAlign="center" maxW="400px">
                    Select a conversion type above and the document will be automatically
                    transformed using AI legal expertise.
                  </Text>
                  <HStack spacing={2} flexWrap="wrap" justify="center">
                    {allConversions.slice(0, 4).map(t => (
                      <Badge key={t} colorScheme="blue" cursor="pointer" px={2} py={1}
                        borderRadius="full" fontSize="2xs"
                        onClick={() => handleConversionChange(t)}
                        _hover={{ opacity: 0.8 }}>
                        {t}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              )
          }
        </Box>
      </Box>

      <Box px={4} py={1.5} bg={C.topBar} borderTop={`1px solid ${C.topBorder}`} flexShrink={0}>
        <Text fontSize="2xs" color={C.muted} textAlign="center">
          AI-powered conversion  ·  Review carefully  ·  Click "Accept All" to replace document  ·  Ctrl+Z to undo
        </Text>
      </Box>
    </Flex>
  );
};

export default DocumentConverter;
