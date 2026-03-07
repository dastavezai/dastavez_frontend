import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Flex, HStack, Text, Badge, Button, IconButton, Select,
  Spinner, Tooltip, Divider, useToast,
} from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { FiCopy, FiCheck, FiX, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { MdOutlineSwapHoriz, MdGavel, MdPerson } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';


const PERSPECTIVES = [
  { value: 'respondent', label: 'Respondent',      icon: MdPerson,  color: '#f97316', badge: 'orange' },
  { value: 'petitioner', label: 'Petitioner',      icon: MdGavel,   color: '#a855f7', badge: 'purple' },
  { value: 'judge',      label: "Judge's View",    icon: MdGavel,   color: '#3b82f6', badge: 'blue'   },
  { value: 'counsel',    label: 'Neutral Counsel', icon: MdPerson,  color: '#14b8a6', badge: 'teal'   },
];


const C = {
  topBar:    '#0d1b2a',
  topBorder: '#1e3a5f',
  canvas:    '#e8e8e8',
  paper:     '#ffffff',
  text:      '#1a1a1a',
  muted:     '#64748b',
  shadow:    '0 4px 24px rgba(0,0,0,0.18)',
};


const buildComponents = (fontFamily, fontSize, lineHeight) => ({
  p:          ({ children }) => <p style={{ marginBottom: '0.6em', fontFamily, fontSize, lineHeight, color: C.text }}>{children}</p>,
  h1:         ({ children }) => <h1 style={{ fontSize: '1.6em', fontWeight: 700, marginBottom: '0.5em', marginTop: '0.9em', fontFamily, color: C.text }}>{children}</h1>,
  h2:         ({ children }) => <h2 style={{ fontSize: '1.3em', fontWeight: 700, marginBottom: '0.4em', marginTop: '0.8em', fontFamily, color: C.text }}>{children}</h2>,
  h3:         ({ children }) => <h3 style={{ fontSize: '1.1em', fontWeight: 700, marginBottom: '0.35em', marginTop: '0.7em', fontFamily, color: C.text }}>{children}</h3>,
  strong:     ({ children }) => <strong style={{ fontWeight: 700, color: C.text, fontFamily }}>{children}</strong>,
  em:         ({ children }) => <em style={{ fontStyle: 'italic', color: C.text, fontFamily }}>{children}</em>,
  ul:         ({ children }) => <ul style={{ paddingLeft: '1.6em', marginBottom: '0.6em', color: C.text, fontFamily, fontSize, lineHeight }}>{children}</ul>,
  ol:         ({ children }) => <ol style={{ paddingLeft: '1.6em', marginBottom: '0.6em', color: C.text, fontFamily, fontSize, lineHeight }}>{children}</ol>,
  li:         ({ children }) => <li style={{ marginBottom: '0.25em', color: C.text, fontFamily, fontSize, lineHeight }}>{children}</li>,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #94a3b8', paddingLeft: '1em', marginLeft: '0.5em', fontStyle:'italic', color: '#374151', marginBottom: '0.6em', fontFamily, fontSize }}>{children}</blockquote>,
  hr:         () => <hr style={{ border: 'none', borderTop: '1px solid #d1d5db', margin: '1em 0' }} />,
  table:      ({ children }) => <table style={{ borderCollapse:'collapse', width:'100%', marginBottom:'0.8em', fontFamily, fontSize }}>{children}</table>,
  th:         ({ children }) => <th style={{ border:'1px solid #aaa', padding:'4px 8px', background:'rgba(0,0,0,0.05)', fontWeight:700, color: C.text }}>{children}</th>,
  td:         ({ children }) => <td style={{ border:'1px solid #aaa', padding:'4px 8px', color: C.text }}>{children}</td>,
  code:       ({ children, inline }) => inline
    ? <code style={{ background:'#f1f5f9', borderRadius:'3px', padding:'1px 4px', fontSize:'0.92em', color:'#1e40af', fontFamily:'monospace' }}>{children}</code>
    : <pre style={{ background:'#f1f5f9', borderRadius:'6px', padding:'0.7em 1em', overflowX:'auto', marginBottom:'0.6em' }}><code style={{ fontSize:'0.88em', color:'#1e40af', fontFamily:'monospace' }}>{children}</code></pre>,
});

const RoleSwapPanel = ({ sourceHtml, documentType, language, fileService, pageStyle = {}, onExit }) => {
  const toast = useToast();

  const [perspective,  setPerspective] = useState('respondent');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [markdown,     setMarkdown]     = useState('');
  const [wordCount,    setWordCount]    = useState(0);

  const perspInfo = PERSPECTIVES.find(p => p.value === perspective) || PERSPECTIVES[0];

  
  const paperFont = pageStyle.fontFamily || "Georgia, 'Times New Roman', serif";
  const paperSize = pageStyle.fontSize   || '12pt';
  const paperLH   = pageStyle.lineHeight || 1.5;
  const padTop    = pageStyle.paddingTop    || '72px';
  const padBottom = pageStyle.paddingBottom || '72px';
  const padLeft   = pageStyle.paddingLeft   || '72px';
  const padRight  = pageStyle.paddingRight  || '72px';

  
  const generatePerspective = useCallback(async (persp) => {
    if (!sourceHtml || !fileService) return;
    setIsGenerating(true);

    const sourceText = sourceHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 6000);

    const instructions = {
      respondent: `You are senior legal counsel for the RESPONDENT. Rewrite this ${documentType || 'legal document'} completely from the RESPONDENT's perspective — defend against every petitioner claim, assert counter-arguments, and highlight any procedural infirmities in the original filing.`,
      petitioner: `You are senior legal counsel for the PETITIONER. Rewrite this ${documentType || 'legal document'} from the PETITIONER's perspective — strengthen every allegation, preempt defences, and reinforce the legal basis for relief sought.`,
      judge:      `You are a HIGH COURT JUDGE reviewing this ${documentType || 'legal document'}. Write a balanced judicial analysis — identify legally sound points from both sides, flag procedural defects, cite relevant precedents, and state whether the petition deserves admission.`,
      counsel:    `You are a NEUTRAL SENIOR COUNSEL. Rewrite this ${documentType || 'legal document'} as an objective legal opinion presenting both sides with equal weight, noting strengths and weaknesses of each position.`,
    };

    const prompt = `${instructions[persp] || instructions.respondent}

ORIGINAL DOCUMENT:
${sourceText}

STRICT OUTPUT RULES:
- Return ONLY the rewritten document using proper Markdown formatting.
- Use # / ## / ### for headings, **text** for important terms, numbered or bulleted lists where appropriate.
- Match the same overall structure as the original (same sections, headings, numbered points).
- Use formal Indian legal language; preserve all case numbers, dates, and party names.
- Do NOT add any preamble, explanation, or "Sure, here is..." opener. Start directly with the document.`;

    try {
      const context = sourceText.substring(0, 400);
      const aiRes = await fileService.aiChatAboutDocument(prompt, context, [], language || 'en');
      const text = (aiRes?.response || '').trim();
      if (text) {
        setMarkdown(text);
        setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
        toast({ title: `${perspInfo.label} view generated`, status: 'success', duration: 2000 });
      } else {
        setMarkdown('*Could not generate perspective. Please check LLM connection and retry.*');
        toast({ title: 'LLM returned empty response', status: 'warning', duration: 3000 });
      }
    } catch (err) {
      console.error('RoleSwap LLM error:', err);
      setMarkdown('*Error generating perspective. Please retry.*');
      toast({ title: 'Generation failed', description: err.message, status: 'error', duration: 4000 });
    } finally {
      setIsGenerating(false);
    }
  }, [sourceHtml, documentType, language, fileService, perspInfo.label, toast]);

  
  useEffect(() => {
    if (sourceHtml) generatePerspective(perspective);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePerspectiveChange = (newPersp) => {
    setPerspective(newPersp);
    generatePerspective(newPersp);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${perspInfo.label.replace(/\s+/g, '_')}_perspective.md`;
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
        bg={C.topBar}
        borderBottom={`1px solid ${C.topBorder}`}
        flexShrink={0}
        minH="44px"
      >
        <HStack spacing={2}>
          <Icon as={MdOutlineSwapHoriz} color={perspInfo.color} boxSize={4} flexShrink={0} />
          <Text fontWeight="bold" fontSize="sm" color="white" letterSpacing="0.03em">
            Role Swap
          </Text>
          <Badge
            colorScheme={perspInfo.badge}
            fontSize="2xs" px={2} py={0.5}
            borderRadius="full"
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            {perspInfo.label}
          </Badge>
        </HStack>

        <HStack spacing={1.5} flexShrink={0}>
          <Select
            size="xs"
            value={perspective}
            onChange={(e) => handlePerspectiveChange(e.target.value)}
            w="148px"
            fontSize="xs"
            bg="#1e3a5f"
            color="white"
            border="1px solid #2d5a8e"
            borderRadius="6px"
            _hover={{ bg: '#243f6a' }}
            sx={{ option: { background: '#0d1b2a', color: 'white' } }}
          >
            {PERSPECTIVES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>

          <Divider orientation="vertical" h="22px" borderColor="#2d5a8e" />

          <Tooltip label="Re-generate" fontSize="xs" hasArrow>
            <IconButton
              icon={<FiRefreshCw size={13} />}
              size="xs" variant="ghost"
              color="gray.300"
              isLoading={isGenerating}
              onClick={() => generatePerspective(perspective)}
              aria-label="Regenerate"
              _hover={{ bg: '#1e3a5f', color: 'white' }}
            />
          </Tooltip>

          <Tooltip label="Copy as plain text" fontSize="xs" hasArrow>
            <IconButton
              icon={copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
              size="xs" variant="ghost"
              color={copied ? 'green.400' : 'gray.300'}
              onClick={handleCopy}
              aria-label="Copy"
              _hover={{ bg: '#1e3a5f', color: 'white' }}
            />
          </Tooltip>

          <Tooltip label="Download as Markdown" fontSize="xs" hasArrow>
            <IconButton
              icon={<FiDownload size={13} />}
              size="xs" variant="ghost"
              color="gray.300"
              onClick={handleDownload}
              aria-label="Download"
              _hover={{ bg: '#1e3a5f', color: 'white' }}
            />
          </Tooltip>

          <Divider orientation="vertical" h="22px" borderColor="#2d5a8e" />

          <Tooltip label="Exit dual view  (Esc)" fontSize="xs" hasArrow>
            <Button
              leftIcon={<FiX size={12} />}
              size="xs"
              bg="transparent"
              color="#f87171"
              border="1px solid #ef4444"
              borderRadius="6px"
              fontSize="xs"
              _hover={{ bg: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}
              onClick={onExit}
            >
              Exit
            </Button>
          </Tooltip>
        </HStack>
      </Flex>

      <Box
        px={4} py={1} flexShrink={0}
        bg={perspInfo.color + '22'}
        borderBottom={`1px solid ${perspInfo.color}44`}
        display="flex" alignItems="center" justifyContent="center" gap="10px"
      >
        <Icon as={perspInfo.icon} color={perspInfo.color} boxSize={3} />
        <Text fontSize="xs" fontWeight="bold" color={perspInfo.color}
          letterSpacing="0.13em" textTransform="uppercase">
          {perspInfo.label} · AI-Generated View
        </Text>
        {wordCount > 0 && (
          <Text fontSize="2xs" color={C.muted}>{wordCount} words</Text>
        )}
      </Box>

      <Box flex="1" overflowY="auto" bg={C.canvas} position="relative">

        {isGenerating && (
          <Flex
            position="absolute" inset={0} zIndex={20}
            align="center" justify="center"
            bg="rgba(14,26,42,0.60)" direction="column" gap={3}
            style={{ backdropFilter: 'blur(3px)' }}
          >
            <Spinner size="lg" color={perspInfo.color} thickness="3px" />
            <Text fontSize="sm" color="white" fontWeight="medium">
              Generating {perspInfo.label} perspective…
            </Text>
          </Flex>
        )}

        <Box
          mx="auto" my={8} mb={12}
          w="794px" minH="1122px"
          bg={C.paper}
          boxShadow={C.shadow}
          borderRadius="2px"
          style={{
            paddingTop:    padTop,
            paddingBottom: padBottom,
            paddingLeft:   padLeft,
            paddingRight:  padRight,
            color:         C.text,
            fontFamily:    paperFont,
            fontSize:      paperSize,
            lineHeight:    paperLH,
          }}
        >
          {markdown
            ? <ReactMarkdown components={mdComps}>{markdown}</ReactMarkdown>
            : !isGenerating && (
                <Text color={C.muted} fontStyle="italic">
                  Select a perspective and click Re-generate to begin.
                </Text>
              )
          }
        </Box>
      </Box>

      <Box
        px={4} py={1.5}
        bg={C.topBar}
        borderTop={`1px solid ${C.topBorder}`}
        flexShrink={0}
      >
        <Text fontSize="2xs" color={C.muted} textAlign="center">
          AI-generated {perspInfo.label} view — not legal advice · Compare with original on the left
        </Text>
      </Box>
    </Flex>
  );
};

export default RoleSwapPanel;
