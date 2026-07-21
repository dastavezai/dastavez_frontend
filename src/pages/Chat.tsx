
import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from '../chat-advanced/AuthBridge';
import AdvancedChatApp from '../chat-advanced/AdvancedChatApp';

// Custom theme to make Chakra play nice with our dark mode
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    judicial: {
      dark: "#0b0f16",
      navy: "#1a2235",
      gold: "#d4af37",
      lightGold: "#f4cf57",
    }
  },
  styles: {
    global: (props: any) => ({
      'html, body': {
        margin: 0,
        padding: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      },
      body: {
        bg: props.colorMode === 'dark' ? 'judicial.dark' : 'white',
      },
    }),
  },
});

const Chat = () => {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <AdvancedChatApp />
      </AuthProvider>
    </ChakraProvider>
  );
};

export default Chat;