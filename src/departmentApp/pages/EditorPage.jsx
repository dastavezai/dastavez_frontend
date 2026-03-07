import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Spinner, VStack, Text, Button, Icon } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import FullPageEditor from '../components/FullPageEditor';

const EditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || null;

  
  const [redirecting, setRedirecting] = useState(!state);

  useEffect(() => {
    if (!state) {
      const t = setTimeout(() => navigate('/', { replace: true }), 2500);
      return () => clearTimeout(t);
    }
  }, [state, navigate]);

  if (redirecting || !state) {
    return (
      <Box
        minH="100vh"
        bg="gray.950"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4} color="white" textAlign="center">
          <Spinner size="lg" color="blue.400" />
          <Text>No document loaded. Redirecting to home…</Text>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            leftIcon={<Icon as={FaArrowLeft} />}
            onClick={() => navigate('/')}
          >
            Go Home Now
          </Button>
        </VStack>
      </Box>
    );
  }

  const {
    fileId,
    sessionId,
    scanData,
    htmlContent,
    fileName,
    isBlank,
    templateData,
  } = state;

  // Build a minimal file-like object for FullPageEditor's `selectedFile` prop
  const selectedFileObj = fileId
    ? { _id: fileId, fileName: fileName || 'document', originalName: fileName }
    : isBlank && templateData
      ? { _id: null, fileName: fileName || 'New Document', isTemplate: true, templateData }
      : { _id: null, fileName: fileName || 'New Document' };

  
  const sessionObj = sessionId
    ? { _id: sessionId, sessionId, fileName, htmlContent }
    : null;

  return (
    <FullPageEditor
      isOpen={true}
      onClose={() => navigate('/', { replace: true })}
      session={sessionObj}
      selectedFile={selectedFileObj}
      htmlContent={htmlContent || templateData?.htmlContent || templateData?.content || ''}
      scanData={scanData}
      scanResults={scanData?.scanResults || null}
      formatMetadata={scanData?.formatMetadata || null}
      smartSuggestions={scanData?.smartSuggestions || []}
    />
  );
};

export default EditorPage;
