import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Spinner, VStack, Text, Button, Icon } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import FullPageEditor from '../components/FullPageEditor';
import fileService from '../services/fileService';

const EditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || null;

  
  const [redirecting, setRedirecting] = useState(!state);
  const [hydratedScanData, setHydratedScanData] = useState(state?.scanData || null);
  const [smartScanRequested, setSmartScanRequested] = useState(false);

  useEffect(() => {
    if (!state) {
      const t = setTimeout(() => navigate('/', { replace: true }), 2500);
      return () => clearTimeout(t);
    }
  }, [state, navigate]);

  // Temporary guard: disable Escape key behavior on editor page
  // to avoid unintended modal-close + homepage redirects.
  useEffect(() => {
    const blockEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', blockEscape, true);
    return () => window.removeEventListener('keydown', blockEscape, true);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!state?.fileId) return;
      const hasLayout = Array.isArray(hydratedScanData?.layoutModel?.pages) && hydratedScanData.layoutModel.pages.length > 0;
      const hasAnalysis = !!(
        (hydratedScanData?.scanResults && Object.keys(hydratedScanData.scanResults || {}).length > 0) ||
        (hydratedScanData?.complianceIssues || []).length ||
        (hydratedScanData?.clauseFlaws || []).length ||
        (hydratedScanData?.missingClauses || []).length ||
        (hydratedScanData?.precedenceAnalysis || []).length ||
        (hydratedScanData?.internalContradictions || []).length ||
        (hydratedScanData?.chronologicalIssues || []).length ||
        (hydratedScanData?.outdatedReferences || []).length
      );

      if (hasLayout && hasAnalysis) return;
      try {
        const status = await fileService.getScanStatus(state.fileId);
        if (!status) return;
        setHydratedScanData((prev) => ({ ...(prev || {}), ...status }));
        if (!state.fileUrl && status?.fileUrl) {
          state.fileUrl = status.fileUrl; // local state object from route; keep minimal and in-place
        }
        console.log('[EDITOR-PROPS-FIDELITY]', {
          event: 'hydrated-scan-status',
          fileId: state.fileId,
          hasLayoutModel: Array.isArray(status?.layoutModel?.pages) && status.layoutModel.pages.length > 0,
          layoutPages: Array.isArray(status?.layoutModel?.pages) ? status.layoutModel.pages.length : 0,
          hasFileUrl: !!status?.fileUrl,
        });

        const statusHasAnalysis = !!(
          (status?.scanResults && Object.keys(status.scanResults || {}).length > 0) ||
          (status?.complianceIssues || []).length ||
          (status?.clauseFlaws || []).length ||
          (status?.missingClauses || []).length ||
          (status?.precedenceAnalysis || []).length ||
          (status?.internalContradictions || []).length ||
          (status?.chronologicalIssues || []).length ||
          (status?.outdatedReferences || []).length
        );

        if (!statusHasAnalysis && !smartScanRequested) {
          setSmartScanRequested(true);
          const scanResult = await fileService.smartScan(state.fileId);
          if (scanResult) {
            setHydratedScanData((prev) => ({ ...(prev || {}), ...scanResult }));
            console.log('[EDITOR-PROPS-FIDELITY]', {
              event: 'triggered-smart-scan',
              fileId: state.fileId,
              hasAnalysis: true,
            });
          }
        }
      } catch (e) {
        console.warn('[EDITOR-PROPS-FIDELITY] failed to hydrate scan status', e?.message || e);
      }
    };
    run();
  }, [state, hydratedScanData?.layoutModel, smartScanRequested]);

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
    fileUrl,
    isBlank,
    templateData,
  } = state;
  const resolvedFileUrl = fileUrl || hydratedScanData?.fileUrl || null;

  // Build a minimal file-like object for FullPageEditor's `selectedFile` prop
  const selectedFileObj = fileId
    ? { _id: fileId, fileName: fileName || 'document', originalName: fileName, fileUrl: resolvedFileUrl, url: resolvedFileUrl }
    : isBlank && templateData
      ? { _id: null, fileName: fileName || 'New Document', isTemplate: true, templateData }
      : { _id: null, fileName: fileName || 'New Document' };

  
  const sessionObj = sessionId
    ? {
      _id: sessionId,
      sessionId,
      fileName,
      htmlContent,
      fileUrl: resolvedFileUrl,
      layoutModel: hydratedScanData?.layoutModel || null,
      documentGraph: hydratedScanData?.documentGraph || null,
      fidelityEdits: hydratedScanData?.fidelityEdits || null,
      exportMode: hydratedScanData?.exportMode || 'fidelity',
    }
    : null;

  try {
    const hasScanData = !!hydratedScanData;
    const layoutPages = Array.isArray(hydratedScanData?.layoutModel?.pages)
      ? hydratedScanData.layoutModel.pages.length
      : 0;
    const hasLayoutModel = !!(hydratedScanData?.layoutModel && layoutPages > 0);
    const scanResultsDocType =
      hydratedScanData?.scanResults?.documentType || hydratedScanData?.detectedDocType || null;

    // Fidelity/prop QA logging — no behavior change
    console.log('[EDITOR-PROPS-FIDELITY]', {
      event: 'editor-page-props',
      fileId,
      sessionId,
      fileName: fileName || selectedFileObj.fileName,
      isBlank,
      isTemplate: !!selectedFileObj.isTemplate,
      hasScanData: !!hydratedScanData,
      hasLayoutModel,
      layoutPages,
      scanResultsDocType,
      hasFileUrl: !!resolvedFileUrl,
      hasHtmlContent: !!htmlContent,
      hasTemplateHtml:
        !!(templateData?.htmlContent || templateData?.content),
    });
  } catch (logErr) {
    console.warn('[EDITOR-PROPS-FIDELITY] log-error', logErr);
  }

  return (
    <FullPageEditor
      isOpen={true}
      onClose={() => navigate('/', { replace: true })}
      session={sessionObj}
      selectedFile={selectedFileObj}
      htmlContent={htmlContent || templateData?.htmlContent || templateData?.content || ''}
      scanData={hydratedScanData}
      scanResults={hydratedScanData?.scanResults || null}
      formatMetadata={hydratedScanData?.formatMetadata || null}
      smartSuggestions={hydratedScanData?.smartSuggestions || []}
    />
  );
};

export default EditorPage;
