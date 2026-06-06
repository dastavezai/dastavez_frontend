import { Component } from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          p={8} 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          minH="100vh"
        >
          <VStack spacing={4} textAlign="center" maxW="md">
            <Heading size="lg" color="red.500">Something went wrong</Heading>
            <Text color="gray.600">{this.state.error?.message}</Text>
            <Button 
              colorScheme="blue" 
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
