import React, { useCallback, useMemo } from 'react';
import {
  HStack, VStack, IconButton, Select, Divider, Tooltip, Box, Text,
  Popover, PopoverTrigger, PopoverContent, PopoverBody,
  SimpleGrid, Button, useColorModeValue, Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react';
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaListUl, FaListOl, FaIndent, FaOutdent,
  FaUndo, FaRedo, FaQuoteLeft, FaMinus, FaPalette,
  FaHighlighter, FaFileAlt, FaEraser, FaSuperscript, FaSubscript,
  FaTable,
} from 'react-icons/fa';
import { MdFormatSize, MdTitle, MdFormatClear, MdDoneAll } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';

const FONT_FAMILIES = [
  'Times New Roman', 'Arial', 'Calibri', 'Cambria', 'Georgia',
  'Garamond', 'Palatino Linotype', 'Book Antiqua', 'Century Schoolbook',
  'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS',
  'Courier New', 'Consolas', 'Lucida Console'
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48, 72];

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#cccccc',
  '#c0392b', '#e74c3c', '#e67e22', '#f39c12', '#f1c40f',
  '#27ae60', '#2ecc71', '#1abc9c', '#16a085', '#2980b9',
  '#3498db', '#8e44ad', '#9b59b6', '#2c3e50', '#34495e',
];

const HIGHLIGHT_COLORS = [
  'transparent', '#fef3cd', '#d1ecf1', '#d4edda', '#f8d7da',
  '#fff3cd', '#cce5ff', '#e2e3e5', '#fce4ec', '#e8f5e9',
];

const EditorToolbar = ({
  editor,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  undoLabel = 'Undo (Ctrl+Z)',
  redoLabel = 'Redo (Ctrl+Y)',
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const countColor = useColorModeValue('gray.500', 'gray.400');

  if (!editor) return null;

  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { wordCount, pageCount } = useMemo(() => {
    const text = editor.getText();
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    
    const pages = Math.max(1, Math.ceil(text.length / 3200));
    return { wordCount: words, pageCount: pages };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.state]);

  const ToolBtn = ({ icon, label, isActive, onClick, ...props }) => (
    <Tooltip label={label} fontSize="xs" hasArrow>
      <IconButton
        icon={icon}
        size="sm"
        variant="ghost"
        aria-label={label}
        isActive={isActive}
        onClick={onClick}
        bg={isActive ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
        minW="32px"
        h="32px"
        {...props}
      />
    </Tooltip>
  );

  const setFontFamily = (e) => {
    const font = e.target.value;
    if (font) editor.chain().focus().setFontFamily(font).run();
  };

  const setFontSize = (e) => {
    const size = e.target.value;
    if (size) {
      editor.chain().focus().setFontSize(`${size}pt`).run();
    }
  };

  
  const currentFontFamily = editor.getAttributes('textStyle').fontFamily ||
    (editor.isActive('paragraph') ? '' : '');
  const currentFontSizeRaw = editor.getAttributes('fontSize')?.fontSize || '';
  const currentFontSize = currentFontSizeRaw.replace('pt', '');

  
  const insertTable = (rows, cols) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  const setHeading = (level) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const resolvedCanUndo = typeof canUndo === 'boolean' ? canUndo : editor.can().undo();
  const resolvedCanRedo = typeof canRedo === 'boolean' ? canRedo : editor.can().redo();
  const handleUndo = onUndo || (() => editor.chain().focus().undo().run());
  const handleRedo = onRedo || (() => editor.chain().focus().redo().run());

  return (
    <Box
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={3}
      py={1.5}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <HStack spacing={1} flexWrap="wrap" align="center">
        <ToolBtn
          icon={<FaUndo />}
          label={undoLabel}
          onClick={handleUndo}
          isDisabled={!resolvedCanUndo}
        />
        <ToolBtn
          icon={<FaRedo />}
          label={redoLabel}
          onClick={handleRedo}
          isDisabled={!resolvedCanRedo}
        />

        <Divider orientation="vertical" h="24px" mx={1} />

        <Select
          size="sm"
          w="130px"
          variant="filled"
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' :
            editor.isActive('heading', { level: 4 }) ? '4' :
            '0'
          }
          onChange={(e) => setHeading(parseInt(e.target.value))}
        >
          <option value="0">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </Select>

        <Select
          size="sm"
          w="160px"
          variant="filled"
          value={currentFontFamily || ''}
          placeholder={currentFontFamily ? undefined : 'Font'}
          onChange={setFontFamily}
        >
          {FONT_FAMILIES.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </Select>

        <Select
          size="sm"
          w="72px"
          variant="filled"
          value={currentFontSize || ''}
          placeholder={currentFontSize ? undefined : '12'}
          onChange={setFontSize}
        >
          {FONT_SIZES.map(s => (
            <option key={s} value={String(s)}>{s}</option>
          ))}
        </Select>

        <Divider orientation="vertical" h="24px" mx={1} />

        
        <ToolBtn
          icon={<FaBold />}
          label="Bold (Ctrl+B)"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolBtn
          icon={<FaItalic />}
          label="Italic (Ctrl+I)"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolBtn
          icon={<FaUnderline />}
          label="Underline (Ctrl+U)"
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolBtn
          icon={<FaStrikethrough />}
          label="Strikethrough"
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        
        <ToolBtn
          icon={<FaSuperscript />}
          label="Superscript (e.g. Section 3³)"
          isActive={editor.isActive('superscript')}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        />
        <ToolBtn
          icon={<FaSubscript />}
          label="Subscript"
          isActive={editor.isActive('subscript')}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        />

        
        <ToolBtn
          icon={<MdFormatClear />}
          label="Clear All Formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />

        <Divider orientation="vertical" h="24px" mx={1} />

        <Popover placement="bottom-start">
          <PopoverTrigger>
            <span>
              <ToolBtn icon={<FaPalette />} label="Text Color" />
            </span>
          </PopoverTrigger>
          <PopoverContent w="auto">
            <PopoverBody p={2}>
              <SimpleGrid columns={5} spacing={1}>
                {TEXT_COLORS.map(color => (
                  <Box
                    key={color}
                    w="28px" h="28px"
                    bg={color}
                    border="1px solid"
                    borderColor="gray.300"
                    borderRadius="sm"
                    cursor="pointer"
                    _hover={{ transform: 'scale(1.15)' }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                ))}
              </SimpleGrid>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Popover placement="bottom-start">
          <PopoverTrigger>
            <span>
              <ToolBtn icon={<FaHighlighter />} label="Highlight" />
            </span>
          </PopoverTrigger>
          <PopoverContent w="auto">
            <PopoverBody p={2}>
              <SimpleGrid columns={5} spacing={1}>
                {HIGHLIGHT_COLORS.map(color => (
                  <Box
                    key={color}
                    w="28px" h="28px"
                    bg={color === 'transparent' ? 'white' : color}
                    border="1px solid"
                    borderColor="gray.300"
                    borderRadius="sm"
                    cursor="pointer"
                    _hover={{ transform: 'scale(1.15)' }}
                    onClick={() => {
                      if (color === 'transparent') {
                        editor.chain().focus().unsetHighlight().run();
                      } else {
                        editor.chain().focus().toggleHighlight({ color }).run();
                      }
                    }}
                  />
                ))}
              </SimpleGrid>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Divider orientation="vertical" h="24px" mx={1} />

        
        <ToolBtn
          icon={<FaAlignLeft />}
          label="Align Left"
          isActive={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolBtn
          icon={<FaAlignCenter />}
          label="Align Center"
          isActive={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolBtn
          icon={<FaAlignRight />}
          label="Align Right"
          isActive={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />
        <ToolBtn
          icon={<FaAlignJustify />}
          label="Justify"
          isActive={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        />

        <Divider orientation="vertical" h="24px" mx={1} />

        <ToolBtn
          icon={<FaListUl />}
          label="Bullet List"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolBtn
          icon={<FaListOl />}
          label="Numbered List"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />

        
        <ToolBtn
          icon={<FaIndent />}
          label="Indent (Tab)"
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          isDisabled={!editor.can().sinkListItem('listItem')}
        />
        <ToolBtn
          icon={<FaOutdent />}
          label="Outdent (Shift+Tab)"
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          isDisabled={!editor.can().liftListItem('listItem')}
        />

        <Divider orientation="vertical" h="24px" mx={1} />

        <ToolBtn
          icon={<FaQuoteLeft />}
          label="Blockquote (legal citation block)"
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolBtn
          icon={<FaMinus />}
          label="Horizontal Rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <Divider orientation="vertical" h="24px" mx={1} />

        <Menu>
          <Tooltip label="Insert Table" hasArrow>
            <MenuButton
              as={IconButton}
              icon={<FaTable />}
              size="sm"
              variant="ghost"
              aria-label="Insert Table"
              minW="32px"
              h="32px"
              _hover={{ bg: hoverBg }}
            />
          </Tooltip>
          <MenuList fontSize="sm" minW="160px">
            <MenuItem onClick={() => insertTable(2, 2)}>2 × 2 Table</MenuItem>
            <MenuItem onClick={() => insertTable(3, 3)}>3 × 3 Table</MenuItem>
            <MenuItem onClick={() => insertTable(3, 4)}>3 × 4 Table</MenuItem>
            <MenuItem onClick={() => insertTable(4, 4)}>4 × 4 Table</MenuItem>
            <MenuItem onClick={() => insertTable(5, 4)}>5 × 4 Table</MenuItem>
          </MenuList>
        </Menu>

        <Divider orientation="vertical" h="24px" mx={1} />

        
        <Divider orientation="vertical" h="24px" mx={1} />

        <ToolBtn
          icon={<MdDoneAll />}
          label="Accept All Changes (remove highlights)"
          onClick={() => {
            editor.chain().focus().selectAll().unsetHighlight().run();
          }}
        />

        
        <Box flex={1} />

        
        <Text fontSize="xs" color={countColor} whiteSpace="nowrap" pr={1}>
          {wordCount.toLocaleString()} words &bull; ~{pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </Text>
      </HStack>
    </Box>
  );
};

export default EditorToolbar;
