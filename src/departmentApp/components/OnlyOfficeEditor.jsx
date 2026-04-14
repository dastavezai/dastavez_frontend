import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import fileService from '../services/fileService';

const OnlyOfficeEditor = React.forwardRef(({ fileId, refreshKey = 0 }, ref) => {
  const wrapperRef = useRef(null);
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const connectorRef = useRef(null);
  const mountSeqRef = useRef(0);
  const frameHeightRef = useRef(860);
  const pollAttemptsRef = useRef(0);
  const [frameHeightPx, setFrameHeightPx] = useState(860);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Do not include refreshKey in holderId! 
  // Changing the key forces React to unmount the Box exactly while DocsAPI is trying to destroy its own iframe,
  // causing "Failed to execute 'removeChild' on 'Node'" DOM crashes.
  const holderId = useMemo(
    () => `onlyoffice-holder-${String(fileId || 'file')}`,
    [fileId]
  );

  const isIgnorableDomMutationError = (err) => {
    const msg = String(err?.message || err || '');
    return /removeChild|insertBefore|not a child of this node/i.test(msg);
  };

  const safeDestroyEditor = (reason = 'unknown') => {
    const inst = editorRef.current;
    editorRef.current = null;
    connectorRef.current = null;
    if (!inst?.destroyEditor) return;
    try {
      inst.destroyEditor();
    } catch (err) {
      if (!isIgnorableDomMutationError(err)) {
        console.warn('[OnlyOffice][destroy-error]', { reason, message: String(err?.message || err) });
      }
    }
  };

  React.useImperativeHandle(ref, () => ({
    insertText: (text) => {
      if (!editorRef.current) return false;
      try {
        // Try creating connector if not already exists
        if (!connectorRef.current && editorRef.current.createConnector) {
          connectorRef.current = editorRef.current.createConnector();
        }
        
        if (connectorRef.current) {
          connectorRef.current.executeMethod("PasteText", [text]);
          return true;
        }
        
        // Fallback for non-connector instances/editions
        return false;
      } catch (err) {
        console.warn('[OnlyOffice][insert-error]', err);
        return false;
      }
    }
  }));

  useEffect(() => {
    frameHeightRef.current = frameHeightPx;
  }, [frameHeightPx]);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const top = wrapperRef.current?.getBoundingClientRect?.().top ?? 0;
      const viewport = typeof window !== 'undefined' ? window.innerHeight : 900;
      const available = Math.round(viewport - top - 16);
      // Keep a comfortable minimum for legal-document work and avoid oversized jumps.
      const next = Math.max(700, Math.min(1200, available));
      setFrameHeightPx(next);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    const iframe = holderRef.current?.querySelector('iframe');
    if (!iframe) return;
    const h = `${frameHeightPx}px`;
    iframe.style.height = h;
    iframe.style.minHeight = h;
    iframe.style.width = '100%';
    iframe.style.display = 'block';
  }, [frameHeightPx, holderId]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer = null;
    mountSeqRef.current += 1;
    const myMountSeq = mountSeqRef.current;
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

        const mountEditor = async (payload, attempt = 0) => {
          if (cancelled || myMountSeq !== mountSeqRef.current) return;
          const docServerUrl = String(payload?.docServerUrl || '').replace(/\/+$/, '');
          const config = payload?.config ? { ...payload.config } : null;
          if (!docServerUrl || !config) {
            throw new Error('Invalid OnlyOffice configuration from server.');
          }

          // Do not rely on inherited 100% height; explicit height prevents blank iframe render.
          config.height = `${frameHeightRef.current}px`;
          config.width = '100%';

          config.events = {
            ...(config.events || {}),
            onError: (event) => {
              const msg = event?.data?.errorDescription || event?.data?.errorCode || 'OnlyOffice runtime error';
              console.error('[OnlyOffice][onError]', event);
              if (!cancelled) setError(String(msg));
            },
            onDocumentReady: () => {
              console.log('[OnlyOffice][onDocumentReady]');
              // Initialize connector once ready
              if (editorRef.current?.createConnector) {
                connectorRef.current = editorRef.current.createConnector();
              }
            },
            onAppReady: () => {
              console.log('[OnlyOffice][onAppReady]');
            },
          };

          const scriptSrc = `${docServerUrl}/web-apps/apps/api/documents/api.js`;
          await loadScript(scriptSrc);
          if (cancelled || myMountSeq !== mountSeqRef.current) return;

          safeDestroyEditor('pre-mount');

          // Avoid mounting into a detached/stale node during rapid refreshes.
          if (!holderRef.current || !document.getElementById(holderId)) {
            throw new Error('OnlyOffice container is not ready. Please retry.');
          }

          try {
            editorRef.current = new window.DocsAPI.DocEditor(holderId, config);
          } catch (mountErr) {
            const msg = String(mountErr?.message || mountErr || '');
            const isDomRace = /insertBefore|removeChild|not a child of this node/i.test(msg);
            if (isDomRace && attempt < 1 && !cancelled && myMountSeq === mountSeqRef.current) {
              console.warn('[OnlyOffice][mount-retry-after-dom-race]', { holderId, attempt: attempt + 1, message: msg });
              safeDestroyEditor('dom-race-retry');
              await new Promise((resolve) => setTimeout(resolve, 100));
              return mountEditor(payload, attempt + 1);
            }
            throw mountErr;
          }
          requestAnimationFrame(() => {
            const h = `${frameHeightRef.current}px`;
            const iframe = holderRef.current?.querySelector('iframe');
            if (iframe) {
              iframe.style.height = h;
              iframe.style.minHeight = h;
              iframe.style.width = '100%';
              iframe.style.display = 'block';
            }
          });
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
      safeDestroyEditor('effect-cleanup');
    };
  }, [fileId, holderId, refreshKey]);

  if (error) {
    return (
      <Box border="1px solid" borderColor="red.200" bg="red.50" borderRadius="md" p={4}>
        <Text fontSize="sm" color="red.700">{error}</Text>
      </Box>
    );
  }

  return (
    <Box
      ref={wrapperRef}
      position="relative"
      h={`${frameHeightPx}px`}
      minH="700px"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      bg="white"
      overflow="hidden"
    >
      <VStack 
        position="absolute" 
        inset={0} 
        justify="center" 
        align="center" 
        spacing={2} 
        bg="whiteAlpha.900" 
        zIndex={10}
        display={loading ? 'flex' : 'none'}
      >
        <Spinner />
        <Text fontSize="sm" color="gray.600">Loading OnlyOffice editor...</Text>
      </VStack>
      <Box w="100%" h="100%">
        <Box
          id={holderId}
          ref={holderRef}
          w="100%"
          h="100%"
          sx={{
            '& iframe': {
              width: '100% !important',
              height: '100% !important',
              border: '0',
              display: 'block',
            },
          }}
        />
      </Box>
    </Box>
  );
});

export default OnlyOfficeEditor;
