import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Collapse,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[Error Boundary caught rendering exception]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReload={this.handleReload}
          onResetAndReload={this.handleResetAndReload}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReload, onResetAndReload }) => {
  const { isOpen, onToggle } = useDisclosure();
  const bg = useColorModeValue('gray.50', 'gray.950');
  const cardBg = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const detailsBg = useColorModeValue('gray.100', 'gray.800');

  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bg}
      p={4}
      fontFamily="'Inter', 'Plus Jakarta Sans', sans-serif"
    >
      <VStack
        spacing={6}
        p={8}
        bg={cardBg}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={useColorModeValue('gray.200', 'rgba(212, 175, 55, 0.2)')}
        boxShadow="xl"
        maxW="600px"
        w="full"
        textAlign="center"
      >
        <Box
          p={4}
          borderRadius="full"
          bg="rgba(229, 62, 62, 0.1)"
          color="red.500"
          mb={2}
        >
          <Icon as={FiAlertTriangle} boxSize={12} />
        </Box>

        <VStack spacing={2}>
          <Heading size="lg" color={useColorModeValue('gray.900', 'white')}>
            Oops! Workspace Crashed
          </Heading>
          <Text fontSize="sm" color={textColor}>
            An unexpected error occurred during rendering. We've captured the diagnostics below.
          </Text>
        </VStack>

        <HStack spacing={4} w="full" justify="center">
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="yellow"
            bg="judicial.gold"
            color="judicial.dark"
            _hover={{ bg: 'judicial.lightGold' }}
            onClick={onReload}
            borderRadius="xl"
            fontWeight="bold"
          >
            Reload Application
          </Button>
          <Button
            leftIcon={<FiTrash2 />}
            variant="outline"
            borderColor="red.300"
            color="red.500"
            _hover={{ bg: 'red.50' }}
            onClick={onResetAndReload}
            borderRadius="xl"
            fontWeight="bold"
          >
            Reset Session & Exit
          </Button>
        </HStack>

        <Box w="full" textAlign="left" borderTop="1px solid" borderColor={useColorModeValue('gray.200', 'gray.850')} pt={4}>
          <Button
            size="xs"
            variant="ghost"
            rightIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
            onClick={onToggle}
            mb={2}
            color="gray.500"
          >
            {isOpen ? 'Hide Diagnostic Details' : 'Show Diagnostic Details'}
          </Button>
          <Collapse in={isOpen}>
            <Box
              p={4}
              bg={detailsBg}
              borderRadius="xl"
              fontSize="xs"
              fontFamily="monospace"
              overflowX="auto"
              maxH="200px"
              overflowY="auto"
              color={useColorModeValue('gray.600', 'gray.300')}
              borderWidth="1px"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <Text fontWeight="bold" color="red.500" mb={1}>
                Error: {error?.message || String(error)}
              </Text>
              <Text whiteSpace="pre-wrap">
                {errorInfo?.componentStack || 'No stack trace available.'}
              </Text>
            </Box>
          </Collapse>
        </Box>
      </VStack>
    </Box>
  );
};

export default function ErrorBoundary({ children }) {
  return <ErrorBoundaryInner>{children}</ErrorBoundaryInner>;
}
