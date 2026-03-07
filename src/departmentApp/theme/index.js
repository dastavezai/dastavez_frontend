import { extendTheme } from '@chakra-ui/react';


const parchment = extendTheme({
  config: { initialColorMode: 'light', useSystemColorMode: false },
  colors: {
    brand: {
      50: '#fdf6e3', 100: '#f5e6c8', 200: '#e8c98a', 300: '#d4a84b',
      400: '#c0922a', 500: '#a67c1d', 600: '#8b6514', 700: '#6e4f0e',
      800: '#513a09', 900: '#372705',
    },
    surface: {
      bg: '#f5f0e8', card: '#ede7d9', sidebar: '#ede0cb',
      navbar: 'rgba(237,224,203,0.95)', border: '#c9b99a',
      hover: '#e5dcc9',
    },
  },
  fonts: {
    heading: `'Georgia', 'Times New Roman', serif`,
    body: `'Palatino Linotype', 'Book Antiqua', serif`,
  },
  styles: {
    global: {
      'html, body': { bg: '#f5f0e8', color: '#2d1f0a' },
      '::-webkit-scrollbar': { width: '6px' },
      '::-webkit-scrollbar-track': { bg: '#ede7d9' },
      '::-webkit-scrollbar-thumb': { bg: '#c9b99a', borderRadius: '3px' },
    },
  },
  components: {
    Button: { defaultProps: { colorScheme: 'orange' } },
    Modal: { baseStyle: { dialog: { bg: '#ede7d9', color: '#2d1f0a' } } },
    Menu: { baseStyle: { list: { bg: '#ede7d9', borderColor: '#c9b99a' }, item: { bg: '#ede7d9', _hover: { bg: '#e5dcc9' } } } },
    Tooltip: { baseStyle: { bg: '#5a4020', color: '#f5f0e8' } },
    Badge: { baseStyle: { borderRadius: 'md' } },
    Tabs: { baseStyle: { tab: { _selected: { color: 'brand.600', borderColor: 'brand.500' } } } },
    Tag: { baseStyle: { container: { bg: 'brand.100', color: 'brand.800' } } },
  },
  semanticTokens: {
    colors: {
      'chakra-body-bg': { default: '#f5f0e8' },
      'chakra-body-text': { default: '#2d1f0a' },
      'chakra-border-color': { default: '#c9b99a' },
      'chakra-placeholder-color': { default: '#8a7a60' },
    },
  },
});


const parchmentDark = extendTheme({
  config: { initialColorMode: 'dark', useSystemColorMode: false },
  colors: {
    brand: {
      50: '#fdf6e3', 100: '#f5e6c8', 200: '#e8c98a', 300: '#d4a84b',
      400: '#c0922a', 500: '#a67c1d', 600: '#8b6514', 700: '#6e4f0e',
      800: '#513a09', 900: '#372705',
    },
    surface: {
      bg: '#1a1008', card: '#241a0e', sidebar: '#1e1409',
      navbar: 'rgba(26,16,8,0.95)', border: '#3d2e18',
      hover: '#2e2012',
    },
  },
  fonts: {
    heading: `'Georgia', 'Times New Roman', serif`,
    body: `'Palatino Linotype', 'Book Antiqua', serif`,
  },
  styles: {
    global: {
      'html, body': { bg: '#1a1008', color: '#e8dcc8' },
      '::-webkit-scrollbar': { width: '6px' },
      '::-webkit-scrollbar-track': { bg: '#1a1008' },
      '::-webkit-scrollbar-thumb': { bg: '#3d2e18', borderRadius: '3px' },
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'yellow' },
      variants: {
        solid: (p) => p.colorScheme === 'yellow' ? {
          bg: 'brand.500', color: '#1a1008', fontWeight: 700,
          _hover: { bg: 'brand.400' },
        } : {},
      },
    },
    Modal: { baseStyle: { dialog: { bg: '#241a0e', color: '#e8dcc8' } } },
    Menu: { baseStyle: { list: { bg: '#241a0e', borderColor: '#3d2e18' }, item: { bg: '#241a0e', _hover: { bg: '#2e2012' } } } },
    Tooltip: { baseStyle: { bg: '#3d2e18', color: '#e8dcc8' } },
    Badge: { baseStyle: { borderRadius: 'md' } },
    Tabs: { baseStyle: { tab: { _selected: { color: 'brand.300', borderColor: 'brand.400' } } } },
    Tag: { baseStyle: { container: { bg: 'brand.900', color: 'brand.300' } } },
  },
  semanticTokens: {
    colors: {
      'chakra-body-bg': { default: '#1a1008' },
      'chakra-body-text': { default: '#e8dcc8' },
      'chakra-border-color': { default: '#3d2e18' },
      'chakra-placeholder-color': { default: '#7a6a50' },
    },
  },
});


export const themes = { parchment, parchmentDark };
export const defaultTheme = 'parchment';

export const themeList = [
  { key: 'parchment',     label: 'Parchment',       icon: '📜',  desc: 'Warm cream & sepia — aged-paper, classic briefs' },
  { key: 'parchmentDark', label: 'Parchment Dark',  icon: '🕯️',  desc: 'Deep warm brown & gold — candlelit legal chambers' },
];
