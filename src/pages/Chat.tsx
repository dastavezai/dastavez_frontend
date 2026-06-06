
import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from '../chat-advanced/AuthBridge';
import AdvancedChatPage from './AdvancedChat';

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
        <div className="min-h-screen bg-white dark:bg-judicial-dark flex flex-col">
          <div className="flex-1 overflow-hidden">
            <AdvancedChatPage />
          </div>
        </div>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default Chat;