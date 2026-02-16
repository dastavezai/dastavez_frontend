import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Select, Heading, Badge,
  FormControl, FormLabel, Input, NumberInput, NumberInputField,
  NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, ModalFooter, Switch, Tabs, TabList, TabPanels,
  Tab, TabPanel, Textarea, Checkbox, Wrap, WrapItem, Tooltip, Icon,
  SimpleGrid, Divider, Slider, SliderTrack, SliderFilledTrack,
  SliderThumb, IconButton, useColorModeValue, Spinner, Flex, Tag,
  TagLabel, TagCloseButton, Grid, GridItem, Image, Stack,
} from '@chakra-ui/react';
import {
  FiUpload, FiType, FiLayout, FiImage, FiSettings, FiFileText,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify,
  FiBold, FiItalic, FiUnderline, FiPlus, FiTrash2, FiEdit,
  FiMaximize2, FiMinimize2, FiChevronDown, FiChevronUp,
} from 'react-icons/fi';
import { FaPalette, FaRulerHorizontal, FaStamp } from 'react-icons/fa';

// ─── Constants ─────────────────────────────────────────────────────────────────

const FONT_FAMILIES = [
  { label: 'Times New Roman', value: 'Times New Roman', category: 'Serif' },
  { label: 'Georgia', value: 'Georgia', category: 'Serif' },
  { label: 'Garamond', value: 'Garamond', category: 'Serif' },
  { label: 'Palatino', value: 'Palatino Linotype', category: 'Serif' },
  { label: 'Book Antiqua', value: 'Book Antiqua', category: 'Serif' },
  { label: 'Cambria', value: 'Cambria', category: 'Serif' },
  { label: 'Baskerville', value: 'Baskerville', category: 'Serif' },
  { label: 'Arial', value: 'Arial', category: 'Sans-Serif' },
  { label: 'Calibri', value: 'Calibri', category: 'Sans-Serif' },
  { label: 'Helvetica', value: 'Helvetica', category: 'Sans-Serif' },
  { label: 'Verdana', value: 'Verdana', category: 'Sans-Serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS', category: 'Sans-Serif' },
  { label: 'Segoe UI', value: 'Segoe UI', category: 'Sans-Serif' },
  { label: 'Tahoma', value: 'Tahoma', category: 'Sans-Serif' },
  { label: 'Century Gothic', value: 'Century Gothic', category: 'Sans-Serif' },
  { label: 'Courier New', value: 'Courier New', category: 'Monospace' },
  { label: 'Consolas', value: 'Consolas', category: 'Monospace' },
  { label: 'Lucida Console', value: 'Lucida Console', category: 'Monospace' },
];

const PAGE_SIZES = {
  A4: { width: 595, height: 842, label: 'A4 (210 × 297 mm)' },
  Legal: { width: 612, height: 1008, label: 'Legal (8.5 × 14 in)' },
  Letter: { width: 612, height: 792, label: 'Letter (8.5 × 11 in)' },
  A5: { width: 420, height: 595, label: 'A5 (148 × 210 mm)' },
};

const LINE_SPACING_PRESETS = [
  { label: 'Single', value: 1.0 },
  { label: '1.15', value: 1.15 },
  { label: '1.5', value: 1.5 },
  { label: 'Double', value: 2.0 },
  { label: '2.5', value: 2.5 },
  { label: 'Triple', value: 3.0 },
];

const BORDER_STYLES = [
  { value: 'none', label: 'None', icon: '—' },
  { value: 'single', label: 'Single Line', icon: '│' },
  { value: 'double', label: 'Double Line', icon: '║' },
  { value: 'thick', label: 'Thick Line', icon: '┃' },
  { value: 'dotted', label: 'Dotted', icon: '┊' },
  { value: 'dashed', label: 'Dashed', icon: '┆' },
  { value: 'shadow', label: 'Shadow', icon: '▓' },
];

const IMAGE_POSITIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center (Watermark)' },
];

const DEFAULT_CONFIG = {
  fontFamily: 'Times New Roman',
  fontSize: 12,
  headingSize: 16,
  lineSpacing: 1.15,
  letterSpacing: 0,
  paragraphSpacing: { before: 0, after: 6 },
  textTransform: 'none',
  wordSpacing: 0,
  pageSize: 'A4',
  pageOrientation: 'portrait',
  margins: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
  firstLineIndent: 0,
  titleAlignment: 'center',
  titleBold: true,
  titleUnderline: false,
  titleItalic: false,
  bodyAlignment: 'justified',
  headerText: '',
  footerText: '',
  headerAlignment: 'center',
  footerAlignment: 'center',
  showHeaderOnFirst: true,
  showFooterOnFirst: true,
  pageNumbering: 'none',
  borderStyle: 'none',
  borderColor: '#000000',
  borderWidth: 1,
  colorScheme: { primary: '#000000', accent: '#1a365d', background: '#ffffff' },
  watermarkText: '',
  watermarkOpacity: 0.1,
  images: [],
};

// ─── Editable Design Preview ───────────────────────────────────────────────────

const EditableDesignPreview = ({ config, isFullScreen, onToggleFullScreen }) => {
  const c = { ...DEFAULT_CONFIG, ...config };
  const previewRef = useRef(null);
  const [selectionStyle, setSelectionStyle] = useState({});

  const fontFamily = c.fontFamily || 'Times New Roman';
  const fontSize = c.fontSize || 12;
  const headingSize = c.headingSize || 16;
  const titleAlign = c.titleAlignment || 'center';
  const bodyAlign = c.bodyAlignment === 'justified' ? 'justify' : (c.bodyAlignment || 'left');
  const titleBold = c.titleBold !== undefined ? c.titleBold : true;
  const titleUnderline = c.titleUnderline || false;
  const titleItalic = c.titleItalic || false;
  const lineHeight = c.lineSpacing ? `${c.lineSpacing * 1.4}` : '1.6';
  const letterSpacing = c.letterSpacing ? `${c.letterSpacing}px` : 'normal';
  const wordSpacing = c.wordSpacing ? `${c.wordSpacing}px` : 'normal';
  const textTransform = c.textTransform || 'none';
  const paraSpacingBefore = c.paragraphSpacing?.before || 0;
  const paraSpacingAfter = c.paragraphSpacing?.after || 6;
  const firstIndent = c.firstLineIndent ? `${c.firstLineIndent / 1440}in` : '0';
  const textColor = c.colorScheme?.primary || '#000000';
  const accentColor = c.colorScheme?.accent || '#1a365d';
  const bgColor = c.colorScheme?.background || '#ffffff';

  // Margin conversion: twips to screen px (scaled)
  const marginScale = isFullScreen ? 0.05 : 0.035;
  const marginTop = (c.margins?.top || 1440) * marginScale;
  const marginBottom = (c.margins?.bottom || 1440) * marginScale;
  const marginLeft = (c.margins?.left || 1440) * marginScale;
  const marginRight = (c.margins?.right || 1440) * marginScale;

  // Border styling
  const getBorderCSS = () => {
    if (c.borderStyle === 'none') return {};
    const color = c.borderColor || '#000000';
    const width = c.borderWidth || 1;
    const styleMap = {
      single: 'solid', double: 'double', thick: 'solid',
      dotted: 'dotted', dashed: 'dashed', shadow: 'solid',
    };
    const css = {
      border: `${c.borderStyle === 'thick' ? width * 2 : width}px ${styleMap[c.borderStyle]} ${color}`,
    };
    if (c.borderStyle === 'shadow') {
      css.boxShadow = `3px 3px 6px rgba(0,0,0,0.3)`;
    }
    return css;
  };

  // Image positioning
  const getImageStyle = (img) => {
    const positions = {
      'top-left': { top: marginTop + 4, left: marginLeft + 4 },
      'top-center': { top: marginTop + 4, left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: marginTop + 4, right: marginRight + 4 },
      'bottom-left': { bottom: marginBottom + 4, left: marginLeft + 4 },
      'bottom-center': { bottom: marginBottom + 4, left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: marginBottom + 4, right: marginRight + 4 },
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    };
    return {
      position: 'absolute',
      ...positions[img.position || 'top-right'],
      width: `${img.width || 80}px`,
      height: `${img.height || 80}px`,
      opacity: img.opacity ?? 1,
      pointerEvents: 'none',
      zIndex: img.position === 'center' ? 0 : 2,
    };
  };

  // Inline formatting toolbar
  const applyInlineFormat = (command) => {
    document.execCommand(command, false, null);
  };

  // Ruler Component
  const Ruler = () => {
    const rulerWidth = isFullScreen ? 700 : 450;
    const leftM = (c.margins?.left || 1440) / 1440;
    const rightM = (c.margins?.right || 1440) / 1440;
    const totalInches = 8.27; // A4 width
    const pxPerInch = rulerWidth / totalInches;

    return (
      <Box
        w={`${rulerWidth}px`}
        h="24px"
        bg={useColorModeValue('gray.100', 'gray.600')}
        borderBottom="1px solid"
        borderColor={useColorModeValue('gray.300', 'gray.500')}
        position="relative"
        mx="auto"
        mb={1}
        borderRadius="sm"
        overflow="hidden"
      >
        {/* Tick marks */}
        {Array.from({ length: Math.ceil(totalInches) + 1 }, (_, i) => (
          <React.Fragment key={i}>
            <Box
              position="absolute"
              left={`${i * pxPerInch}px`}
              bottom="0"
              w="1px"
              h="14px"
              bg={useColorModeValue('gray.500', 'gray.300')}
            />
            <Text
              position="absolute"
              left={`${i * pxPerInch + 2}px`}
              top="0"
              fontSize="8px"
              color={useColorModeValue('gray.500', 'gray.300')}
              userSelect="none"
            >
              {i}
            </Text>
            {/* Half-inch marks */}
            {i < totalInches && (
              <Box
                position="absolute"
                left={`${(i + 0.5) * pxPerInch}px`}
                bottom="0"
                w="1px"
                h="8px"
                bg={useColorModeValue('gray.400', 'gray.400')}
              />
            )}
          </React.Fragment>
        ))}
        {/* Left margin indicator */}
        <Box
          position="absolute"
          left={`${leftM * pxPerInch - 4}px`}
          bottom="0"
          w="0"
          h="0"
          borderLeft="5px solid transparent"
          borderRight="5px solid transparent"
          borderBottom="8px solid"
          borderBottomColor="blue.500"
        />
        {/* Right margin indicator */}
        <Box
          position="absolute"
          left={`${(totalInches - rightM) * pxPerInch - 4}px`}
          bottom="0"
          w="0"
          h="0"
          borderLeft="5px solid transparent"
          borderRight="5px solid transparent"
          borderBottom="8px solid"
          borderBottomColor="blue.500"
        />
      </Box>
    );
  };

  const toolbarBg = useColorModeValue('gray.50', 'gray.700');
  const toolbarBorder = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      position="relative"
      h={isFullScreen ? '80vh' : '100%'}
      display="flex"
      flexDir="column"
    >
      {/* Formatting Toolbar */}
      <Flex
        bg={toolbarBg}
        borderBottom="1px solid"
        borderColor={toolbarBorder}
        p={1}
        gap={1}
        align="center"
        borderRadius="md"
        mb={1}
        flexWrap="wrap"
      >
        <Tooltip label="Bold (Ctrl+B)">
          <IconButton
            icon={<FiBold />}
            size="xs"
            variant="ghost"
            onClick={() => applyInlineFormat('bold')}
            aria-label="Bold"
          />
        </Tooltip>
        <Tooltip label="Italic (Ctrl+I)">
          <IconButton
            icon={<FiItalic />}
            size="xs"
            variant="ghost"
            onClick={() => applyInlineFormat('italic')}
            aria-label="Italic"
          />
        </Tooltip>
        <Tooltip label="Underline (Ctrl+U)">
          <IconButton
            icon={<FiUnderline />}
            size="xs"
            variant="ghost"
            onClick={() => applyInlineFormat('underline')}
            aria-label="Underline"
          />
        </Tooltip>
        <Box w="1px" h="20px" bg={toolbarBorder} mx={1} />
        <Tooltip label="Align Left">
          <IconButton
            icon={<FiAlignLeft />}
            size="xs"
            variant="ghost"
            onClick={() => applyInlineFormat('justifyLeft')}
            aria-label="Align Left"
          />
        </Tooltip>
        <Tooltip label="Align Center">
          <IconButton
            icon={<FiAlignCenter />}
            size="xs"
            variant="ghost"
            onClick={() => applyInlineFormat('justifyCenter')}
            aria-label="Align Center"
          />
        </Tooltip>
        <Tooltip label="Align Right">
          <IconButton
            icon={<FiAlignRight />}
            size="xs"
            variant="ghost"
            onClick={() => applyInlineFormat('justifyRight')}
            aria-label="Align Right"
          />
        </Tooltip>
        <Tooltip label="Justify">
          <IconButton
            icon={<FiAlignJustify />}
            size="xs"
            variant="ghost"
            onClick={() => applyInlineFormat('justifyFull')}
            aria-label="Justify"
          />
        </Tooltip>
        <Box w="1px" h="20px" bg={toolbarBorder} mx={1} />
        <Tooltip label="Increase Font Size">
          <IconButton
            icon={<FiChevronUp />}
            size="xs"
            variant="ghost"
            onClick={() => applyInlineFormat('increaseFontSize')}
            aria-label="Increase Size"
          />
        </Tooltip>
        <Tooltip label="Decrease Font Size">
          <IconButton
            icon={<FiChevronDown />}
            size="xs"
            variant="ghost"
            onClick={() => applyInlineFormat('decreaseFontSize')}
            aria-label="Decrease Size"
          />
        </Tooltip>
        <Box flex={1} />
        <Tooltip label={isFullScreen ? 'Exit Full Screen' : 'Full Screen Editor'}>
          <IconButton
            icon={isFullScreen ? <FiMinimize2 /> : <FiMaximize2 />}
            size="xs"
            variant="ghost"
            colorScheme="blue"
            onClick={onToggleFullScreen}
            aria-label="Toggle Full Screen"
          />
        </Tooltip>
      </Flex>

      {/* Ruler */}
      <Ruler />

      {/* Editable Document Preview */}
      <Box
        ref={previewRef}
        flex={1}
        bg={bgColor}
        color={textColor}
        fontFamily={fontFamily}
        fontSize={`${fontSize}px`}
        letterSpacing={letterSpacing}
        wordSpacing={wordSpacing}
        textTransform={textTransform}
        position="relative"
        overflowY="auto"
        borderRadius="md"
        boxShadow="lg"
        {...getBorderCSS()}
      >
        {/* Watermark */}
        {c.watermarkText && (
          <Text
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%) rotate(-45deg)"
            fontSize="60px"
            fontWeight="bold"
            color={textColor}
            opacity={c.watermarkOpacity || 0.1}
            pointerEvents="none"
            whiteSpace="nowrap"
            zIndex={0}
            userSelect="none"
          >
            {c.watermarkText}
          </Text>
        )}

        {/* Placed Images */}
        {(c.images || []).map((img, idx) => (
          img.data && (
            <Image
              key={idx}
              src={img.data}
              alt={img.label || 'Stamp'}
              {...getImageStyle(img)}
            />
          )
        ))}

        {/* Header */}
        {c.headerText && (
          <Box
            pt={`${marginTop}px`}
            px={`${marginLeft}px`}
            textAlign={c.headerAlignment || 'center'}
            fontSize={`${fontSize - 2}px`}
            color="gray.500"
            borderBottom="1px solid"
            borderColor="gray.200"
            pb={2}
            mb={2}
            position="relative"
            zIndex={1}
          >
            {c.headerText}
          </Box>
        )}

        {/* Editable Content Area */}
        <Box
          pt={c.headerText ? 2 : `${marginTop}px`}
          pb={c.footerText ? 2 : `${marginBottom}px`}
          pl={`${marginLeft}px`}
          pr={`${marginRight}px`}
          minH={isFullScreen ? '60vh' : '350px'}
          position="relative"
          zIndex={1}
          contentEditable
          suppressContentEditableWarning
          outline="none"
          _focus={{ outline: 'none' }}
          sx={{
            '& p, & div': {
              marginTop: `${paraSpacingBefore}pt`,
              marginBottom: `${paraSpacingAfter}pt`,
              textIndent: firstIndent,
              lineHeight: lineHeight,
            },
          }}
        >
          {/* Title */}
          <Text
            as="div"
            textAlign={titleAlign}
            fontWeight={titleBold ? 'bold' : 'normal'}
            textDecoration={titleUnderline ? 'underline' : 'none'}
            fontStyle={titleItalic ? 'italic' : 'normal'}
            fontSize={`${headingSize}px`}
            color={accentColor}
            mb={4}
            suppressContentEditableWarning
          >
            DOCUMENT TITLE
          </Text>

          {/* Body paragraphs */}
          <Box textAlign={bodyAlign} lineHeight={lineHeight}>
            <Text as="p" mb={`${paraSpacingAfter}pt`} mt={`${paraSpacingBefore}pt`} textIndent={firstIndent} suppressContentEditableWarning>
              This is a sample legal document paragraph. Select any text in this preview and use the toolbar above to apply bold, italic, underline, or alignment changes — just like a word processor.
            </Text>
            <Text as="p" mb={`${paraSpacingAfter}pt`} mt={`${paraSpacingBefore}pt`} textIndent={firstIndent} suppressContentEditableWarning>
              WHEREAS, this agreement is made on this day between the parties mentioned herein, and both parties agree to the terms and conditions set forth in this document.
            </Text>
            <Text as="p" mb={`${paraSpacingAfter}pt`} mt={`${paraSpacingBefore}pt`} textIndent={firstIndent} suppressContentEditableWarning>
              NOW THIS DEED WITNESSETH that in consideration of the mutual covenants and agreements herein contained, the parties agree as follows:
            </Text>
            <Text as="p" mb={`${paraSpacingAfter}pt`} mt={`${paraSpacingBefore}pt`} textIndent={firstIndent} suppressContentEditableWarning>
              1. The first party shall fulfill all obligations as mentioned in Clause A of this agreement.
            </Text>
            <Text as="p" mb={`${paraSpacingAfter}pt`} mt={`${paraSpacingBefore}pt`} textIndent={firstIndent} suppressContentEditableWarning>
              2. The second party agrees to comply with all terms outlined in the preceding sections.
            </Text>
            <Text as="p" mt={6} fontWeight="bold" color={accentColor} suppressContentEditableWarning>
              IN WITNESS WHEREOF
            </Text>
            <Text as="p" mb={`${paraSpacingAfter}pt`} mt={`${paraSpacingBefore}pt`} suppressContentEditableWarning>
              The parties have executed this document on the date first mentioned above.
            </Text>
          </Box>
        </Box>

        {/* Footer */}
        {c.footerText && (
          <Box
            pb={`${marginBottom}px`}
            px={`${marginLeft}px`}
            textAlign={c.footerAlignment || 'center'}
            fontSize={`${fontSize - 2}px`}
            color="gray.500"
            borderTop="1px solid"
            borderColor="gray.200"
            pt={2}
            mt={2}
            position="relative"
            zIndex={1}
          >
            {c.footerText}
          </Box>
        )}

        {/* Page Number */}
        {c.pageNumbering && c.pageNumbering !== 'none' && (
          <Text
            position="absolute"
            fontSize={`${fontSize - 2}px`}
            color="gray.400"
            {...(c.pageNumbering === 'bottom-center' ? { bottom: '8px', left: '50%', transform: 'translateX(-50%)' } :
              c.pageNumbering === 'bottom-right' ? { bottom: '8px', right: `${marginRight}px` } :
              { top: '8px', right: `${marginRight}px` })}
          >
            — 1 —
          </Text>
        )}
      </Box>
    </Box>
  );
};

// ─── Margin Visual Diagram ─────────────────────────────────────────────────────

const MarginDiagram = ({ margins, onChange }) => {
  const twipsToInch = (t) => (t / 1440).toFixed(2);
  const inchToTwips = (i) => Math.round(i * 1440);
  const pageBg = useColorModeValue('white', 'gray.700');
  const pageBorder = useColorModeValue('gray.300', 'gray.500');
  const marginColor = useColorModeValue('blue.50', 'blue.900');

  return (
    <Box position="relative" w="200px" h="260px" mx="auto" my={4}>
      {/* Page outline */}
      <Box
        w="100%"
        h="100%"
        border="2px solid"
        borderColor={pageBorder}
        bg={pageBg}
        borderRadius="sm"
        position="relative"
      >
        {/* Content area */}
        <Box
          position="absolute"
          top={`${(margins.top / 1440) * 40}px`}
          bottom={`${(margins.bottom / 1440) * 40}px`}
          left={`${(margins.left / 1440) * 30}px`}
          right={`${(margins.right / 1440) * 30}px`}
          bg={marginColor}
          border="1px dashed"
          borderColor="blue.300"
          borderRadius="xs"
        >
          {/* Content lines */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Box key={i} h="2px" bg="gray.300" mx={2} mt={`${10 + i * 12}px`} borderRadius="full" />
          ))}
        </Box>
      </Box>
      {/* Top label */}
      <Text position="absolute" top="-18px" left="50%" transform="translateX(-50%)" fontSize="10px" fontWeight="bold" color="blue.500">
        {twipsToInch(margins.top)}"
      </Text>
      {/* Bottom label */}
      <Text position="absolute" bottom="-18px" left="50%" transform="translateX(-50%)" fontSize="10px" fontWeight="bold" color="blue.500">
        {twipsToInch(margins.bottom)}"
      </Text>
      {/* Left label */}
      <Text position="absolute" left="-28px" top="50%" transform="translateY(-50%) rotate(-90deg)" fontSize="10px" fontWeight="bold" color="blue.500">
        {twipsToInch(margins.left)}"
      </Text>
      {/* Right label */}
      <Text position="absolute" right="-28px" top="50%" transform="translateY(-50%) rotate(90deg)" fontSize="10px" fontWeight="bold" color="blue.500">
        {twipsToInch(margins.right)}"
      </Text>
    </Box>
  );
};

// ─── Main Modal Component ──────────────────────────────────────────────────────

const DesignCreatorModal = ({
  isOpen,
  onClose,
  editingDesign,
  designForm,
  setDesignForm,
  onSave,
  onFileUpload,
  isAnalyzing,
  isSaving,
  templateCategories,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const imageInputRef = useRef(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const accentBg = useColorModeValue('blue.50', 'blue.900');

  // Helper to update config
  const updateConfig = useCallback((key, value) => {
    setDesignForm(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  }, [setDesignForm]);

  const updateNestedConfig = useCallback((parent, key, value) => {
    setDesignForm(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [parent]: { ...(prev.config[parent] || {}), [key]: value }
      }
    }));
  }, [setDesignForm]);

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check max 10 images limit
    const currentImages = designForm.config.images || [];
    if (currentImages.length >= 10) {
      alert('Maximum 10 images allowed per template design');
      return;
    }
    
    // Check individual file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    
    // Check total size (10MB)
    const currentTotalSize = currentImages.reduce((sum, img) => {
      // Estimate base64 size from data URI length
      const base64Length = (img.data || '').length;
      const estimatedBytes = base64Length * 0.75; // base64 is ~133% of binary size
      return sum + estimatedBytes;
    }, 0);
    
    const newTotalSize = currentTotalSize + file.size;
    if (newTotalSize > 10 * 1024 * 1024) {
      const remainingMB = ((10 * 1024 * 1024 - currentTotalSize) / (1024 * 1024)).toFixed(1);
      alert(`Total image size would exceed 10MB limit. Only ${remainingMB}MB remaining.`);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newImage = {
        data: ev.target.result,
        label: file.name.replace(/\.[^.]+$/, ''),
        position: 'top-right',
        width: 80,
        height: 80,
        opacity: 1,
        isWatermark: false,
        offsetX: 0,  // Horizontal offset
        offsetY: 0,  // Vertical offset
      };
      updateConfig('images', [...(designForm.config.images || []), newImage]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    const images = [...(designForm.config.images || [])];
    images.splice(idx, 1);
    updateConfig('images', images);
  };

  const updateImage = (idx, key, value) => {
    const images = [...(designForm.config.images || [])];
    images[idx] = { ...images[idx], [key]: value };
    updateConfig('images', images);
  };

  // ─── Full-Screen Editor Modal ──────────────────────────────────────────────

  if (isFullScreen) {
    return (
      <Modal isOpen={true} onClose={() => setIsFullScreen(false)} size="full">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent m={0} borderRadius={0} bg={useColorModeValue('gray.100', 'gray.900')}>
          <ModalHeader py={2} px={4} borderBottom="1px solid" borderColor={useColorModeValue('gray.200', 'gray.700')}>
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Icon as={FaPalette} color="teal.500" />
                <Text fontSize="md">Design Editor — {designForm.name || 'Untitled'}</Text>
              </HStack>
              <Button size="sm" onClick={() => setIsFullScreen(false)} variant="ghost">
                Exit Full Screen
              </Button>
            </HStack>
          </ModalHeader>
          <ModalBody p={4}>
            <EditableDesignPreview
              config={designForm.config}
              isFullScreen={true}
              onToggleFullScreen={() => setIsFullScreen(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  // ─── Main Modal ────────────────────────────────────────────────────────────

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="92vw" maxH="92vh">
        <ModalHeader borderBottom="1px solid" borderColor={useColorModeValue('gray.200', 'gray.600')} py={3}>
          <HStack spacing={3}>
            <Icon as={FaPalette} color="teal.500" boxSize={5} />
            <Text>{editingDesign ? 'Edit Design' : 'Create New Design'}</Text>
            {editingDesign && <Badge colorScheme="blue">{editingDesign.name}</Badge>}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <Flex h="78vh" overflow="hidden">
            {/* Left Panel: Form Controls */}
            <Box w="50%" borderRight="1px solid" borderColor={useColorModeValue('gray.200', 'gray.600')} overflowY="auto" p={4}>
              {/* Auto-Extract Box */}
              <Box mb={4} p={3} bg={accentBg} borderRadius="md" border="1px solid" borderColor="blue.200">
                <HStack mb={2}>
                  <Icon as={FiUpload} color="blue.500" />
                  <Text fontWeight="bold" fontSize="sm">Quick Setup: Upload & Auto-Extract</Text>
                </HStack>
                <Text fontSize="xs" color={labelColor} mb={2}>
                  Upload a .docx file to automatically extract its formatting settings
                </Text>
                <Input type="file" accept=".docx" onChange={onFileUpload} size="sm" />
                {isAnalyzing && (
                  <HStack mt={2}><Spinner size="xs" /><Text fontSize="xs">Analyzing...</Text></HStack>
                )}
              </Box>

              {/* General Info */}
              <VStack spacing={3} align="stretch" mb={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="bold">Design Name</FormLabel>
                  <Input
                    size="sm"
                    value={designForm.name}
                    onChange={(e) => setDesignForm({ ...designForm, name: e.target.value })}
                    placeholder="e.g., Classic Legal, Modern Professional"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold">Description</FormLabel>
                  <Textarea
                    size="sm"
                    value={designForm.description}
                    onChange={(e) => setDesignForm({ ...designForm, description: e.target.value })}
                    placeholder="Brief description of this design style"
                    rows={2}
                  />
                </FormControl>
                <FormControl>
                  <HStack justify="space-between" mb={1}>
                    <FormLabel fontSize="sm" fontWeight="bold" mb={0}>Apply To</FormLabel>
                    <Checkbox
                      size="sm"
                      isChecked={designForm.isUniversal}
                      onChange={(e) => setDesignForm({ ...designForm, isUniversal: e.target.checked, categories: e.target.checked ? [] : designForm.categories })}
                    >
                      <Text fontSize="xs">All Categories</Text>
                    </Checkbox>
                  </HStack>
                  {!designForm.isUniversal && (
                    <Wrap spacing={1}>
                      {templateCategories.map(cat => (
                        <WrapItem key={cat}>
                          <Checkbox
                            size="sm"
                            isChecked={designForm.categories.includes(cat)}
                            onChange={(e) => {
                              const cats = e.target.checked
                                ? [...designForm.categories, cat]
                                : designForm.categories.filter(c => c !== cat);
                              setDesignForm({ ...designForm, categories: cats });
                            }}
                          >
                            <Text fontSize="xs">{cat}</Text>
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </FormControl>
                <HStack>
                  <Checkbox
                    size="sm"
                    isChecked={designForm.isDefault}
                    onChange={(e) => setDesignForm({ ...designForm, isDefault: e.target.checked })}
                  >
                    <Text fontSize="xs">Set as Default</Text>
                  </Checkbox>
                </HStack>
              </VStack>

              <Divider mb={4} />

              {/* Tabbed Settings */}
              <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" size="sm" colorScheme="teal">
                <TabList flexWrap="wrap">
                  <Tab fontSize="xs" px={2}><HStack spacing={1}><FiType size={12} /><Text>Typography</Text></HStack></Tab>
                  <Tab fontSize="xs" px={2}><HStack spacing={1}><FiLayout size={12} /><Text>Layout</Text></HStack></Tab>
                  <Tab fontSize="xs" px={2}><HStack spacing={1}><FaPalette size={12} /><Text>Colors</Text></HStack></Tab>
                  <Tab fontSize="xs" px={2}><HStack spacing={1}><FiFileText size={12} /><Text>Header/Footer</Text></HStack></Tab>
                  <Tab fontSize="xs" px={2}><HStack spacing={1}><FiImage size={12} /><Text>Images</Text></HStack></Tab>
                  <Tab fontSize="xs" px={2}><HStack spacing={1}><FiSettings size={12} /><Text>Advanced</Text></HStack></Tab>
                </TabList>

                <TabPanels>
                  {/* ═══ TYPOGRAPHY TAB ═══ */}
                  <TabPanel px={0} pt={4}>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Font Family</FormLabel>
                        <Select
                          size="sm"
                          value={designForm.config.fontFamily}
                          onChange={(e) => updateConfig('fontFamily', e.target.value)}
                        >
                          {['Serif', 'Sans-Serif', 'Monospace'].map(cat => (
                            <optgroup key={cat} label={cat}>
                              {FONT_FAMILIES.filter(f => f.category === cat).map(f => (
                                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                                  {f.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </Select>
                      </FormControl>

                      <SimpleGrid columns={2} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs">Body Font Size (pt)</FormLabel>
                          <NumberInput size="sm" value={designForm.config.fontSize} min={6} max={72}
                            onChange={(v) => updateConfig('fontSize', Number(v))}>
                            <NumberInputField />
                            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">Heading Font Size (pt)</FormLabel>
                          <NumberInput size="sm" value={designForm.config.headingSize} min={8} max={96}
                            onChange={(v) => updateConfig('headingSize', Number(v))}>
                            <NumberInputField />
                            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel fontSize="xs">Line Spacing</FormLabel>
                        <HStack spacing={2} flexWrap="wrap">
                          {LINE_SPACING_PRESETS.map(p => (
                            <Button
                              key={p.value}
                              size="xs"
                              variant={designForm.config.lineSpacing === p.value ? 'solid' : 'outline'}
                              colorScheme={designForm.config.lineSpacing === p.value ? 'teal' : 'gray'}
                              onClick={() => updateConfig('lineSpacing', p.value)}
                            >
                              {p.label}
                            </Button>
                          ))}
                        </HStack>
                        <HStack mt={2}>
                          <Text fontSize="xs" w="60px">Custom:</Text>
                          <Slider
                            min={0.5} max={4} step={0.05}
                            value={designForm.config.lineSpacing}
                            onChange={(v) => updateConfig('lineSpacing', v)}
                            flex={1}
                          >
                            <SliderTrack><SliderFilledTrack bg="teal.400" /></SliderTrack>
                            <SliderThumb boxSize={4} />
                          </Slider>
                          <Text fontSize="xs" w="40px" textAlign="right">{designForm.config.lineSpacing?.toFixed(2)}</Text>
                        </HStack>
                      </FormControl>

                      <SimpleGrid columns={2} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs">Letter Spacing (px)</FormLabel>
                          <NumberInput size="sm" value={designForm.config.letterSpacing || 0} min={-2} max={10} step={0.5} precision={1}
                            onChange={(v) => updateConfig('letterSpacing', Number(v))}>
                            <NumberInputField />
                            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">Word Spacing (px)</FormLabel>
                          <NumberInput size="sm" value={designForm.config.wordSpacing || 0} min={-2} max={20} step={0.5} precision={1}
                            onChange={(v) => updateConfig('wordSpacing', Number(v))}>
                            <NumberInputField />
                            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={2} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs">Paragraph Spacing Before (pt)</FormLabel>
                          <NumberInput size="sm" value={designForm.config.paragraphSpacing?.before || 0} min={0} max={72}
                            onChange={(v) => updateNestedConfig('paragraphSpacing', 'before', Number(v))}>
                            <NumberInputField />
                            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">Paragraph Spacing After (pt)</FormLabel>
                          <NumberInput size="sm" value={designForm.config.paragraphSpacing?.after || 6} min={0} max={72}
                            onChange={(v) => updateNestedConfig('paragraphSpacing', 'after', Number(v))}>
                            <NumberInputField />
                            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel fontSize="xs">Text Transform</FormLabel>
                        <Select size="sm" value={designForm.config.textTransform || 'none'}
                          onChange={(e) => updateConfig('textTransform', e.target.value)}>
                          <option value="none">Normal</option>
                          <option value="uppercase">UPPERCASE</option>
                          <option value="lowercase">lowercase</option>
                          <option value="capitalize">Capitalize Each Word</option>
                        </Select>
                      </FormControl>

                      <Divider />
                      <Text fontSize="xs" fontWeight="bold" color={labelColor}>Title Formatting</Text>
                      <SimpleGrid columns={2} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs">Title Alignment</FormLabel>
                          <HStack>
                            {[{ v: 'left', icon: FiAlignLeft }, { v: 'center', icon: FiAlignCenter }, { v: 'right', icon: FiAlignRight }].map(a => (
                              <IconButton
                                key={a.v}
                                icon={<a.icon />}
                                size="sm"
                                variant={designForm.config.titleAlignment === a.v ? 'solid' : 'outline'}
                                colorScheme={designForm.config.titleAlignment === a.v ? 'teal' : 'gray'}
                                onClick={() => updateConfig('titleAlignment', a.v)}
                                aria-label={a.v}
                              />
                            ))}
                          </HStack>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">Body Alignment</FormLabel>
                          <HStack>
                            {[{ v: 'left', icon: FiAlignLeft }, { v: 'center', icon: FiAlignCenter }, { v: 'right', icon: FiAlignRight }, { v: 'justified', icon: FiAlignJustify }].map(a => (
                              <IconButton
                                key={a.v}
                                icon={<a.icon />}
                                size="sm"
                                variant={designForm.config.bodyAlignment === a.v ? 'solid' : 'outline'}
                                colorScheme={designForm.config.bodyAlignment === a.v ? 'teal' : 'gray'}
                                onClick={() => updateConfig('bodyAlignment', a.v)}
                                aria-label={a.v}
                              />
                            ))}
                          </HStack>
                        </FormControl>
                      </SimpleGrid>
                      <HStack spacing={4}>
                        <Checkbox size="sm" isChecked={designForm.config.titleBold}
                          onChange={(e) => updateConfig('titleBold', e.target.checked)}>
                          <Text fontSize="xs" fontWeight="bold">Bold</Text>
                        </Checkbox>
                        <Checkbox size="sm" isChecked={designForm.config.titleItalic}
                          onChange={(e) => updateConfig('titleItalic', e.target.checked)}>
                          <Text fontSize="xs" fontStyle="italic">Italic</Text>
                        </Checkbox>
                        <Checkbox size="sm" isChecked={designForm.config.titleUnderline}
                          onChange={(e) => updateConfig('titleUnderline', e.target.checked)}>
                          <Text fontSize="xs" textDecoration="underline">Underline</Text>
                        </Checkbox>
                      </HStack>
                    </VStack>
                  </TabPanel>

                  {/* ═══ LAYOUT TAB ═══ */}
                  <TabPanel px={0} pt={4}>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={2} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">Page Size</FormLabel>
                          <Select size="sm" value={designForm.config.pageSize || 'A4'}
                            onChange={(e) => updateConfig('pageSize', e.target.value)}>
                            {Object.entries(PAGE_SIZES).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs" fontWeight="bold">Orientation</FormLabel>
                          <HStack>
                            {['portrait', 'landscape'].map(o => (
                              <Button
                                key={o}
                                size="sm"
                                flex={1}
                                variant={designForm.config.pageOrientation === o ? 'solid' : 'outline'}
                                colorScheme={designForm.config.pageOrientation === o ? 'teal' : 'gray'}
                                onClick={() => updateConfig('pageOrientation', o)}
                                textTransform="capitalize"
                              >
                                {o}
                              </Button>
                            ))}
                          </HStack>
                        </FormControl>
                      </SimpleGrid>

                      <Divider />
                      <Text fontSize="xs" fontWeight="bold" color={labelColor}>Margins (inches)</Text>

                      <MarginDiagram margins={designForm.config.margins || DEFAULT_CONFIG.margins} />

                      <SimpleGrid columns={2} spacing={3}>
                        {['top', 'bottom', 'left', 'right'].map(side => (
                          <FormControl key={side}>
                            <FormLabel fontSize="xs" textTransform="capitalize">{side}</FormLabel>
                            <NumberInput
                              size="sm"
                              value={((designForm.config.margins?.[side] || 1440) / 1440).toFixed(2)}
                              min={0} max={3} step={0.1} precision={2}
                              onChange={(v) => updateNestedConfig('margins', side, Math.round(Number(v) * 1440))}
                            >
                              <NumberInputField />
                              <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                        ))}
                      </SimpleGrid>

                      <Divider />
                      <FormControl>
                        <FormLabel fontSize="xs">First Line Indent (inches)</FormLabel>
                        <Slider
                          min={0} max={2} step={0.1}
                          value={(designForm.config.firstLineIndent || 0) / 1440}
                          onChange={(v) => updateConfig('firstLineIndent', Math.round(v * 1440))}
                        >
                          <SliderTrack><SliderFilledTrack bg="teal.400" /></SliderTrack>
                          <SliderThumb boxSize={4} />
                        </Slider>
                        <Text fontSize="xs" textAlign="right" color={labelColor}>
                          {((designForm.config.firstLineIndent || 0) / 1440).toFixed(1)}"
                        </Text>
                      </FormControl>

                      <Divider />
                      <Text fontSize="xs" fontWeight="bold" color={labelColor}>Border</Text>
                      <SimpleGrid columns={2} spacing={3}>
                        <FormControl>
                          <FormLabel fontSize="xs">Border Style</FormLabel>
                          <Select size="sm" value={designForm.config.borderStyle || 'none'}
                            onChange={(e) => updateConfig('borderStyle', e.target.value)}>
                            {BORDER_STYLES.map(b => (
                              <option key={b.value} value={b.value}>{b.icon} {b.label}</option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="xs">Border Width (px)</FormLabel>
                          <NumberInput size="sm" value={designForm.config.borderWidth || 1} min={1} max={8}
                            onChange={(v) => updateConfig('borderWidth', Number(v))}>
                            <NumberInputField />
                            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>
                      <FormControl>
                        <FormLabel fontSize="xs">Border Color</FormLabel>
                        <HStack>
                          <Input
                            type="color"
                            size="sm"
                            w="60px"
                            value={designForm.config.borderColor || '#000000'}
                            onChange={(e) => updateConfig('borderColor', e.target.value)}
                            p={0}
                            border="none"
                            cursor="pointer"
                          />
                          <Input
                            size="sm"
                            value={designForm.config.borderColor || '#000000'}
                            onChange={(e) => updateConfig('borderColor', e.target.value)}
                            maxW="120px"
                          />
                        </HStack>
                      </FormControl>
                    </VStack>
                  </TabPanel>

                  {/* ═══ COLORS TAB ═══ */}
                  <TabPanel px={0} pt={4}>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="xs" fontWeight="bold" color={labelColor}>Color Scheme</Text>
                      {[
                        { key: 'primary', label: 'Text Color', desc: 'Main body text color' },
                        { key: 'accent', label: 'Accent Color', desc: 'Headings and highlights' },
                        { key: 'background', label: 'Background Color', desc: 'Page background' },
                      ].map(c => (
                        <FormControl key={c.key}>
                          <FormLabel fontSize="xs">{c.label}</FormLabel>
                          <HStack>
                            <Input
                              type="color"
                              w="50px"
                              h="36px"
                              p={0}
                              border="none"
                              cursor="pointer"
                              value={designForm.config.colorScheme?.[c.key] || DEFAULT_CONFIG.colorScheme[c.key]}
                              onChange={(e) => updateNestedConfig('colorScheme', c.key, e.target.value)}
                            />
                            <VStack align="start" spacing={0}>
                              <Input
                                size="sm"
                                value={designForm.config.colorScheme?.[c.key] || DEFAULT_CONFIG.colorScheme[c.key]}
                                onChange={(e) => updateNestedConfig('colorScheme', c.key, e.target.value)}
                                maxW="120px"
                              />
                              <Text fontSize="2xs" color={labelColor}>{c.desc}</Text>
                            </VStack>
                          </HStack>
                        </FormControl>
                      ))}

                      <Divider />
                      <Text fontSize="xs" fontWeight="bold" color={labelColor}>Preset Color Schemes</Text>
                      <Wrap spacing={2}>
                        {[
                          { name: 'Classic', primary: '#000000', accent: '#1a365d', background: '#ffffff' },
                          { name: 'Warm', primary: '#2d1b00', accent: '#8b4513', background: '#fffaf0' },
                          { name: 'Cool', primary: '#1a202c', accent: '#2b6cb0', background: '#f7fafc' },
                          { name: 'Dark', primary: '#e2e8f0', accent: '#63b3ed', background: '#1a202c' },
                          { name: 'Legal Green', primary: '#1a3a1a', accent: '#2d6a2d', background: '#f0fff0' },
                          { name: 'Royal', primary: '#1a003a', accent: '#6b21a8', background: '#faf5ff' },
                        ].map(preset => (
                          <WrapItem key={preset.name}>
                            <Tooltip label={preset.name}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateConfig('colorScheme', {
                                  primary: preset.primary,
                                  accent: preset.accent,
                                  background: preset.background,
                                })}
                              >
                                <HStack spacing={1}>
                                  <Box w={3} h={3} bg={preset.background} border="1px solid" borderColor="gray.300" borderRadius="sm" />
                                  <Box w={3} h={3} bg={preset.primary} borderRadius="sm" />
                                  <Box w={3} h={3} bg={preset.accent} borderRadius="sm" />
                                  <Text fontSize="xs">{preset.name}</Text>
                                </HStack>
                              </Button>
                            </Tooltip>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </VStack>
                  </TabPanel>

                  {/* ═══ HEADER/FOOTER TAB ═══ */}
                  <TabPanel px={0} pt={4}>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="xs" fontWeight="bold" color={labelColor}>Header</Text>
                      <FormControl>
                        <FormLabel fontSize="xs">Header Text</FormLabel>
                        <Input size="sm" value={designForm.config.headerText || ''}
                          onChange={(e) => updateConfig('headerText', e.target.value)}
                          placeholder="e.g., CONFIDENTIAL, Court Name, Organization" />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs">Header Alignment</FormLabel>
                        <HStack>
                          {[{ v: 'left', icon: FiAlignLeft }, { v: 'center', icon: FiAlignCenter }, { v: 'right', icon: FiAlignRight }].map(a => (
                            <IconButton
                              key={a.v}
                              icon={<a.icon />}
                              size="sm"
                              variant={(designForm.config.headerAlignment || 'center') === a.v ? 'solid' : 'outline'}
                              colorScheme={(designForm.config.headerAlignment || 'center') === a.v ? 'teal' : 'gray'}
                              onClick={() => updateConfig('headerAlignment', a.v)}
                              aria-label={a.v}
                            />
                          ))}
                        </HStack>
                      </FormControl>
                      <Checkbox size="sm"
                        isChecked={designForm.config.showHeaderOnFirst !== false}
                        onChange={(e) => updateConfig('showHeaderOnFirst', e.target.checked)}>
                        <Text fontSize="xs">Show header on first page</Text>
                      </Checkbox>

                      <Divider />
                      <Text fontSize="xs" fontWeight="bold" color={labelColor}>Footer</Text>
                      <FormControl>
                        <FormLabel fontSize="xs">Footer Text</FormLabel>
                        <Input size="sm" value={designForm.config.footerText || ''}
                          onChange={(e) => updateConfig('footerText', e.target.value)}
                          placeholder="e.g., Page {page}, Draft Copy, Firm Name" />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs">Footer Alignment</FormLabel>
                        <HStack>
                          {[{ v: 'left', icon: FiAlignLeft }, { v: 'center', icon: FiAlignCenter }, { v: 'right', icon: FiAlignRight }].map(a => (
                            <IconButton
                              key={a.v}
                              icon={<a.icon />}
                              size="sm"
                              variant={(designForm.config.footerAlignment || 'center') === a.v ? 'solid' : 'outline'}
                              colorScheme={(designForm.config.footerAlignment || 'center') === a.v ? 'teal' : 'gray'}
                              onClick={() => updateConfig('footerAlignment', a.v)}
                              aria-label={a.v}
                            />
                          ))}
                        </HStack>
                      </FormControl>
                      <Checkbox size="sm"
                        isChecked={designForm.config.showFooterOnFirst !== false}
                        onChange={(e) => updateConfig('showFooterOnFirst', e.target.checked)}>
                        <Text fontSize="xs">Show footer on first page</Text>
                      </Checkbox>

                      <Divider />
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">Page Numbering</FormLabel>
                        <Select size="sm" value={designForm.config.pageNumbering || 'none'}
                          onChange={(e) => updateConfig('pageNumbering', e.target.value)}>
                          <option value="none">None</option>
                          <option value="bottom-center">Bottom Center</option>
                          <option value="bottom-right">Bottom Right</option>
                          <option value="top-right">Top Right</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </TabPanel>

                  {/* ═══ IMAGES TAB ═══ */}
                  <TabPanel px={0} pt={4}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="bold" color={labelColor}>Stamps, Logos & Watermarks</Text>
                          <Text fontSize="2xs" color={labelColor}>
                            {(() => {
                              const currentImages = designForm.config.images || [];
                              const totalSizeMB = currentImages.reduce((sum, img) => {
                                const base64Length = (img.data || '').length;
                                const estimatedBytes = base64Length * 0.75;
                                return sum + estimatedBytes;
                              }, 0) / (1024 * 1024);
                              return `${currentImages.length}/10 images • ${totalSizeMB.toFixed(1)}/10 MB used`;
                            })()}
                          </Text>
                        </VStack>
                        <Button
                          size="sm"
                          leftIcon={<FiPlus />}
                          colorScheme="teal"
                          variant="outline"
                          onClick={() => imageInputRef.current?.click()}
                          isDisabled={(designForm.config.images || []).length >= 10}
                        >
                          Add Image
                        </Button>
                        <Input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          display="none"
                          onChange={handleImageUpload}
                        />
                      </HStack>

                      {(designForm.config.images || []).length === 0 ? (
                        <Box
                          p={8}
                          textAlign="center"
                          bg={sectionBg}
                          borderRadius="md"
                          border="2px dashed"
                          borderColor="gray.300"
                          cursor="pointer"
                          onClick={() => imageInputRef.current?.click()}
                          _hover={{ borderColor: 'teal.400', bg: accentBg }}
                          transition="all 0.2s"
                        >
                          <Icon as={FaStamp} boxSize={8} color="gray.400" mb={2} />
                          <Text fontSize="sm" color={labelColor}>Click to add stamps, logos, or e-stamps</Text>
                          <Text fontSize="xs" color={labelColor}>Supports PNG, JPG, SVG</Text>
                        </Box>
                      ) : (
                        <VStack spacing={3}>
                          {(designForm.config.images || []).map((img, idx) => (
                            <Box key={idx} p={3} bg={sectionBg} borderRadius="md" w="100%">
                              <HStack mb={2} justify="space-between">
                                <HStack>
                                  {img.data && (
                                    <Image src={img.data} alt={img.label} boxSize="40px" objectFit="contain" borderRadius="sm" />
                                  )}
                                  <Input
                                    size="xs"
                                    value={img.label || ''}
                                    onChange={(e) => updateImage(idx, 'label', e.target.value)}
                                    placeholder="Label"
                                    maxW="120px"
                                  />
                                </HStack>
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => removeImage(idx)}
                                  aria-label="Remove"
                                />
                              </HStack>
                              <Checkbox 
                                size="sm" 
                                mb={2}
                                isChecked={img.isWatermark || false}
                                onChange={(e) => updateImage(idx, 'isWatermark', e.target.checked)}
                              >
                                <Text fontSize="xs">Use as full-page watermark (behind text)</Text>
                              </Checkbox>
                              <SimpleGrid columns={2} spacing={2}>
                                {!img.isWatermark && (
                                  <FormControl>
                                    <FormLabel fontSize="2xs">Position</FormLabel>
                                    <Select size="xs" value={img.position || 'top-right'}
                                      onChange={(e) => updateImage(idx, 'position', e.target.value)}>
                                      {IMAGE_POSITIONS.map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                                <FormControl>
                                  <FormLabel fontSize="2xs">Opacity {img.isWatermark ? '(watermark: 10-50%)' : ''}</FormLabel>
                                  <Slider 
                                    min={img.isWatermark ? 0.1 : 0.1} 
                                    max={img.isWatermark ? 0.5 : 1} 
                                    step={0.05} 
                                    value={img.isWatermark ? Math.min(img.opacity ?? 0.2, 0.5) : (img.opacity ?? 1)}
                                    onChange={(v) => updateImage(idx, 'opacity', v)}>
                                    <SliderTrack><SliderFilledTrack bg="teal.400" /></SliderTrack>
                                    <SliderThumb boxSize={3} />
                                  </Slider>
                                </FormControl>
                                <FormControl>
                                  <FormLabel fontSize="2xs">Width (px)</FormLabel>
                                  <NumberInput size="xs" value={img.width || 80} min={20} max={img.isWatermark ? 600 : 300}
                                    onChange={(v) => updateImage(idx, 'width', Number(v))}>
                                    <NumberInputField />
                                  </NumberInput>
                                </FormControl>
                                <FormControl>
                                  <FormLabel fontSize="2xs">Height (px)</FormLabel>
                                  <NumberInput size="xs" value={img.height || 80} min={20} max={img.isWatermark ? 600 : 300}
                                    onChange={(v) => updateImage(idx, 'height', Number(v))}>
                                    <NumberInputField />
                                  </NumberInput>
                                </FormControl>
                                {!img.isWatermark && (
                                  <>
                                    <FormControl>
                                      <FormLabel fontSize="2xs">Horizontal Offset ({img.offsetX || 0}px)</FormLabel>
                                      <Slider 
                                        min={-100} 
                                        max={100} 
                                        step={5} 
                                        value={img.offsetX || 0}
                                        onChange={(v) => updateImage(idx, 'offsetX', v)}>
                                        <SliderTrack><SliderFilledTrack bg="blue.400" /></SliderTrack>
                                        <SliderThumb boxSize={3} />
                                      </Slider>
                                    </FormControl>
                                    <FormControl>
                                      <FormLabel fontSize="2xs">Vertical Offset ({img.offsetY || 0}px)</FormLabel>
                                      <Slider 
                                        min={-100} 
                                        max={100} 
                                        step={5} 
                                        value={img.offsetY || 0}
                                        onChange={(v) => updateImage(idx, 'offsetY', v)}>
                                        <SliderTrack><SliderFilledTrack bg="green.400" /></SliderTrack>
                                        <SliderThumb boxSize={3} />
                                      </Slider>
                                    </FormControl>
                                  </>
                                )}
                              </SimpleGrid>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* ═══ ADVANCED TAB ═══ */}
                  <TabPanel px={0} pt={4}>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="xs" fontWeight="bold" color={labelColor}>Watermark</Text>
                      <FormControl>
                        <FormLabel fontSize="xs">Watermark Text</FormLabel>
                        <Input size="sm" value={designForm.config.watermarkText || ''}
                          onChange={(e) => updateConfig('watermarkText', e.target.value)}
                          placeholder="e.g., DRAFT, CONFIDENTIAL, SAMPLE" />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs">Watermark Opacity ({((designForm.config.watermarkOpacity || 0.1) * 100).toFixed(0)}%)</FormLabel>
                        <Slider min={0.02} max={0.5} step={0.02}
                          value={designForm.config.watermarkOpacity || 0.1}
                          onChange={(v) => updateConfig('watermarkOpacity', v)}>
                          <SliderTrack><SliderFilledTrack bg="teal.400" /></SliderTrack>
                          <SliderThumb boxSize={4} />
                        </Slider>
                      </FormControl>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>

            {/* Right Panel: Live Preview */}
            <Box w="50%" p={4} bg={useColorModeValue('gray.100', 'gray.900')} overflowY="auto">
              <HStack mb={2} justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaRulerHorizontal} color="teal.500" boxSize={3} />
                  <Text fontSize="sm" fontWeight="bold">Live Preview</Text>
                </HStack>
                <Badge colorScheme="teal" fontSize="2xs">
                  {designForm.config.pageSize || 'A4'} • {designForm.config.pageOrientation || 'Portrait'}
                </Badge>
              </HStack>
              <EditableDesignPreview
                config={designForm.config}
                isFullScreen={false}
                onToggleFullScreen={() => setIsFullScreen(true)}
              />
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor={useColorModeValue('gray.200', 'gray.600')} py={3}>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button
            colorScheme="teal"
            onClick={onSave}
            isLoading={isSaving}
            isDisabled={!designForm.name}
            leftIcon={<FiEdit />}
          >
            {editingDesign ? 'Save Changes' : 'Create Design'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DesignCreatorModal;
