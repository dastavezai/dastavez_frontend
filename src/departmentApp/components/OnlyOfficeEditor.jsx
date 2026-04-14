import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import fileService from '../services/fileService';

const OnlyOfficeEditor = ({ fileId }) => {
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const pollAttemptsRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const holderId = useMemo(() => `onlyoffice-holder-${String(fileId || 'file')}`, [fileId]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer = null;
    const boot = async () => {
      if (!fileId) {
        setError('No file selected for OnlyOffice.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        pollAttemptsRef.current = 0;

        const loadScript = async (scriptSrc) => {
          if (window.DocsAPI) return;
          await new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${scriptSrc}"]`);
            if (existing) {
              existing.addEventListener('load', resolve, { once: true });
              existing.addEventListener('error', () => reject(new Error('Failed to load OnlyOffice script')), { once: true });
              return;
            }
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load OnlyOffice script'));
            document.body.appendChild(script);
          });
        };

        const mountEditor = async (payload) => {
          const docServerUrl = String(payload?.docServerUrl || '').replace(/\/+$/, '');
          const config = payload?.config ? { ...payload.config } : null;
          if (!docServerUrl || !config) {
            throw new Error('Invalid OnlyOffice configuration from server.');
          }

          config.events = {
            ...(config.events || {}),
            onError: (event) => {
              const msg = event?.data?.errorDescription || event?.data?.errorCode || 'OnlyOffice runtime error';
              console.error('[OnlyOffice][onError]', event);
              if (!cancelled) setError(String(msg));
            },
            onDocumentReady: () => {
              console.log('[OnlyOffice][onDocumentReady]');
            },
            onAppReady: () => {
              console.log('[OnlyOffice][onAppReady]');
            },
          };

          const scriptSrc = `${docServerUrl}/web-apps/apps/api/documents/api.js`;
          await loadScript(scriptSrc);
          if (cancelled) return;

          if (editorRef.current?.destroyEditor) {
            try { editorRef.current.destroyEditor(); } catch (_) {}
            editorRef.current = null;
          }
          editorRef.current = new window.DocsAPI.DocEditor(holderId, config);
          setLoading(false);
        };

        const fetchConfigWhenReady = async () => {
          try {
            const cfg = await fileService.getOnlyOfficeConfig(fileId);
            return cfg;
          } catch (e) {
            const status = Number(e?.response?.status || 0);
            if (status === 202) return { pending: true };
            throw e;
          }
        };

        const cfgRes = await fetchConfigWhenReady();
        if (cancelled) return;
        if (cfgRes?.pending) {
          pollTimer = setInterval(async () => {
            try {
              pollAttemptsRef.current += 1;
              if (pollAttemptsRef.current > 60) {
                clearInterval(pollTimer);
                if (!cancelled) {
                  setError('OnlyOffice setup timed out while preparing DOCX. Please try reopening the file.');
                  setLoading(false);
                }
                return;
              }
              const next = await fetchConfigWhenReady();
              if (cancelled || !next || next.pending) return;
              clearInterval(pollTimer);
              await mountEditor(next);
            } catch (pollErr) {
              clearInterval(pollTimer);
              if (!cancelled) {
                setError(pollErr?.message || 'Failed to initialize OnlyOffice editor.');
                setLoading(false);
              }
            }
          }, 1500);
          return;
        }

        await mountEditor(cfgRes);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to initialize OnlyOffice editor.');
      } finally {
        if (!cancelled && !pollTimer) setLoading(false);
      }
    };
    boot();
    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (editorRef.current?.destroyEditor) {
        try { editorRef.current.destroyEditor(); } catch (_) {}
      }
      editorRef.current = null;
    };
  }, [fileId, holderId]);

  if (error) {
    return (
      <Box border="1px solid" borderColor="red.200" bg="red.50" borderRadius="md" p={4}>
        <Text fontSize="sm" color="red.700">{error}</Text>
      </Box>
    );
  }

  return (
    <Box position="relative" minH="70vh" border="1px solid" borderColor="gray.200" borderRadius="md" bg="white" overflow="hidden">
      {loading && (
        <VStack position="absolute" inset={0} justify="center" align="center" spacing={2} bg="whiteAlpha.900" zIndex={1}>
          <Spinner />
          <Text fontSize="sm" color="gray.600">Loading OnlyOffice editor...</Text>
        </VStack>
      )}
      <Box id={holderId} ref={holderRef} w="100%" h="80vh" />
    </Box>
  );
};

export default OnlyOfficeEditor;
