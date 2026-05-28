import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import fileService from '../services/fileService';
import {
  buildAnchorCandidates,
  mergeAnchorCandidateLists,
  automationInsertCitation,
  automationJumpToAnchor,
  automationGetDocumentPlainText,
} from '../utils/onlyOfficeCitationAutomation';

const OnlyOfficeEditor = React.forwardRef(({ fileId, refreshKey = 0, onConfigLoaded = null, onEditorReady = null }, ref) => {
  const wrapperRef = useRef(null);
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const connectorRef = useRef(null);
  const mountSeqRef = useRef(0);
  const appReadyRef = useRef(false);
  const documentReadyRef = useRef(false);
  const frameHeightRef = useRef(860);
  const pollAttemptsRef = useRef(0);
  const [frameHeightPx, setFrameHeightPx] = useState(860);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
    appReadyRef.current = false;
    documentReadyRef.current = false;
    if (!inst?.destroyEditor) return;
    try {
      inst.destroyEditor();
    } catch (err) {
      if (!isIgnorableDomMutationError(err)) {
        console.warn('[OnlyOffice][destroy-error]', { reason, message: String(err?.message || err) });
      }
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const waitForEditorReady = async (maxWaitMs = 25000) => {
    const deadline = Date.now() + Math.max(1000, Number(maxWaitMs) || 25000);
    while (Date.now() < deadline) {
      if (documentReadyRef.current || appReadyRef.current) return true;
      await sleep(150);
    }
    return false;
  };

  const focusOnlyOfficeFrame = () => {
    try {
      const iframe = holderRef.current?.querySelector('iframe');
      if (iframe?.contentWindow?.focus) {
        iframe.contentWindow.focus();
      } else if (iframe?.focus) {
        iframe.focus();
      }
    } catch (_) {
      // no-op
    }
  };

  const ensureConnector = async (maxWaitMs = 15000) => {
    const deadline = Date.now() + Math.max(500, Number(maxWaitMs) || 9000);
    while (Date.now() < deadline) {
      if (!connectorRef.current && editorRef.current?.createConnector && (appReadyRef.current || documentReadyRef.current)) {
        try {
          connectorRef.current = editorRef.current.createConnector();
          window.ONLYOFFICE_CONNECTOR = connectorRef.current;
        } catch (_) {
          // no-op
        }
      }

      const conn = window.ONLYOFFICE_CONNECTOR || connectorRef.current;
      if (conn?.executeMethod) return conn;

      focusOnlyOfficeFrame();
      await sleep(120);
    }
    return null;
  };

  const execMethodAsync = (conn, method, args = []) =>
    new Promise((resolve) => {
      if (!conn?.executeMethod) {
        resolve(false);
        return;
      }
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        resolve(!!value);
      };
      try {
        conn.executeMethod(method, args, (result) => finish(result));
        setTimeout(() => finish(false), 2500);
      } catch (err) {
        console.warn('[CONNECTOR-TRACE] executeMethod failed:', method, err?.message || err);
        finish(false);
      }
    });

  const trySearchAndReplace = async (conn, searchString, replaceString) => {
    if (!conn?.executeMethod) return false;
    try {
      await execMethodAsync(conn, 'SearchAndReplace', [{
        searchString,
        replaceString,
        matchCase: false,
      }]);
      return true;
    } catch (_) {
      return false;
    }
  };

  const trySearchNext = async (conn, searchString) => {
    if (!conn?.executeMethod) return false;
    focusOnlyOfficeFrame();
    const variants = [
      [{ searchString, matchCase: false }, true],
      [{ searchString, matchCase: false }],
    ];
    for (const args of variants) {
      const found = await execMethodAsync(conn, 'SearchNext', args);
      if (found) return true;
    }
    return false;
  };

  const insertAfterAnchor = async (conn, anchorCandidates, text, mode = 'append') => {
    const cleanedText = String(text || '').trim();
    if (!cleanedText) return { ok: false, anchorUsed: '' };

    const pastePayload = mode === 'append'
      ? `\n${cleanedText}`
      : cleanedText;

    for (const candidate of anchorCandidates) {
      const found = await trySearchNext(conn, candidate);
      if (!found) continue;

      focusOnlyOfficeFrame();
      const pasted = await execMethodAsync(conn, 'PasteText', [pastePayload]);
      if (pasted !== false) {
        return { ok: true, anchorUsed: candidate };
      }
    }
    return { ok: false, anchorUsed: '' };
  };

  React.useImperativeHandle(ref, () => ({
    insertText: async (text, anchorText = '', mode = 'replace') => {
      console.log('[CONNECTOR-TRACE] insertText-called. Searching for connection...');

      const ready = await waitForEditorReady(25000);
      if (!ready) {
        console.warn('[CONNECTOR-TRACE] editor did not become ready in time', {
          appReady: appReadyRef.current,
          documentReady: documentReadyRef.current,
        });
        return false;
      }

      const doApply = async (conn) => {
        if (!conn || (!conn.executeMethod && !conn.callCommand)) {
          console.error('[CONNECTOR-TRACE] invalid connector object');
          return false;
        }
        try {
          const cleanedText = String(text || '').trim();
          if (!cleanedText) return false;

          const candidates = buildAnchorCandidates(anchorText);
          focusOnlyOfficeFrame();

          if (conn.callCommand && candidates.length > 0) {
            const auto = await automationInsertCitation(conn, cleanedText, candidates, mode);
            if (auto.inserted) return true;
          }

          if (candidates.length > 0 && mode === 'append') {
            const placed = await insertAfterAnchor(conn, candidates, cleanedText, 'append');
            if (placed.ok) {
              console.info('[CONNECTOR-TRACE] inserted after anchor via SearchNext+PasteText', {
                anchor: placed.anchorUsed.substring(0, 60),
              });
              return true;
            }
          }

          if (candidates.length > 0 && mode === 'replace') {
            for (const candidate of candidates) {
              const replaced = await trySearchAndReplace(conn, candidate, cleanedText);
              if (replaced) return true;
            }
          }

          console.log('[CONNECTOR-TRACE] using PasteText at cursor');
          const pasted = await execMethodAsync(conn, 'PasteText', [cleanedText]);
          return pasted !== false;
        } catch (err) {
          console.error('[CONNECTOR-TRACE] execution failed:', err);
          return false;
        }
      };

      const conn = await ensureConnector(15000);
      if (conn) {
        console.info('[CONNECTOR-TRACE] link established!');
        return await doApply(conn);
      }

      console.warn('[CONNECTOR-TRACE] connector not available; direct insert skipped', {
        appReady: appReadyRef.current,
        documentReady: documentReadyRef.current,
      });
      return false;
    },

    replaceText: async (searchString, replaceString) => {
      const ready = await waitForEditorReady(25000);
      if (!ready) return false;

      const conn = await ensureConnector(15000);
      if (!conn?.executeMethod) return false;

      try {
        conn.executeMethod('SearchAndReplace', [{
          searchString: String(searchString || ''),
          replaceString: String(replaceString || ''),
          matchCase: false,
        }]);
        return true;
      } catch (err) {
        console.error('[CONNECTOR-TRACE] replaceText failed:', err);
        return false;
      }
    },

    jumpToAnchor: async (anchorText = '') => {
      const anchor = String(anchorText || '').trim();
      if (anchor.length < 8) return false;

      const ready = await waitForEditorReady(12000);
      if (!ready) return false;

      const conn = await ensureConnector(8000);
      if (!conn) return false;

      focusOnlyOfficeFrame();
      const candidates = buildAnchorCandidates(anchor);

      if (conn.callCommand) {
        const jumped = await automationJumpToAnchor(conn, [anchor, ...candidates]);
        if (jumped) return true;
      }

      if (!conn.executeMethod) return false;
      for (const candidate of candidates) {
        const found = await trySearchNext(conn, candidate);
        if (found) return true;
      }
      return false;
    },

    insertCitationAfterAnchor: async (citationText, anchorCandidates = [], mode = 'append') => {
      const ready = await waitForEditorReady(25000);
      if (!ready) return { inserted: false, anchorUsed: '', method: 'none', reason: 'editor_not_ready' };

      const conn = await ensureConnector(15000);
      if (!conn) return { inserted: false, anchorUsed: '', method: 'none', reason: 'no_connector' };

      const merged = mergeAnchorCandidateLists(
        anchorCandidates,
        buildAnchorCandidates(anchorCandidates[0] || '')
      );

      focusOnlyOfficeFrame();

      if (conn.callCommand) {
        const auto = await automationInsertCitation(conn, citationText, merged, mode);
        if (auto.inserted) {
          console.info('[OO-Automation] citation placed', {
            anchor: auto.anchorUsed?.substring(0, 80),
            method: auto.method,
          });
          return {
            inserted: true,
            anchorUsed: auto.anchorUsed,
            method: auto.method || 'automation',
            reason: '',
          };
        }
        console.warn('[OO-Automation] citation not placed', auto.reason);
      }

      if (conn.executeMethod) {
        const placed = await insertAfterAnchor(conn, merged, citationText, mode);
        if (placed.ok) {
          return {
            inserted: true,
            anchorUsed: placed.anchorUsed,
            method: 'search_next_paste',
            reason: '',
          };
        }
        const pasted = await execMethodAsync(conn, 'PasteText', [`\n${String(citationText || '').trim()}`]);
        if (pasted !== false) {
          return { inserted: true, anchorUsed: '', method: 'paste_at_cursor', reason: '' };
        }
      }

      return { inserted: false, anchorUsed: '', method: 'none', reason: 'all_methods_failed' };
    },

    getDocumentPlainText: async () => {
      const ready = await waitForEditorReady(12000);
      if (!ready) return '';
      const conn = await ensureConnector(8000);
      if (!conn?.callCommand) return '';
      focusOnlyOfficeFrame();
      return automationGetDocumentPlainText(conn);
    },

    undoLastAction: async () => {
      const ready = await waitForEditorReady(8000);
      if (!ready) return false;

      const conn = await ensureConnector(5000);
      if (!conn?.executeMethod) return false;

      try {
        conn.executeMethod('Undo', []);
        return true;
      } catch (_) {
        return false;
      }
    },
  }));

  useEffect(() => {
    frameHeightRef.current = frameHeightPx;
  }, [frameHeightPx]);

  useLayoutEffect(() => {
    const updateHeight = () => {
      const top = wrapperRef.current?.getBoundingClientRect?.().top ?? 0;
      const viewport = typeof window !== 'undefined' ? window.innerHeight : 900;
      const available = Math.round(viewport - top - 16);
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

          if (config.document?.url) {
            const url = new URL(config.document.url, window.location.origin);
            url.searchParams.set('v', Date.now());
            config.document.url = url.toString();
          }

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
              appReadyRef.current = true;
              documentReadyRef.current = true;
              if (typeof onEditorReady === 'function') {
                try { onEditorReady(true); } catch (_) {}
              }
              if (editorRef.current?.createConnector) {
                console.log('[OnlyOffice][connector] pre-initializing bridge...');
                connectorRef.current = editorRef.current.createConnector();
                window.ONLYOFFICE_CONNECTOR = connectorRef.current;
              }
            },
            onAppReady: () => {
              console.log('[OnlyOffice][onAppReady]');
              appReadyRef.current = true;
              if (!connectorRef.current && editorRef.current?.createConnector) {
                try {
                  connectorRef.current = editorRef.current.createConnector();
                  window.ONLYOFFICE_CONNECTOR = connectorRef.current;
                } catch (_) {
                  // no-op
                }
              }
            },
          };

          const scriptSrc = `${docServerUrl}/web-apps/apps/api/documents/api.js`;
          await loadScript(scriptSrc);
          if (cancelled || myMountSeq !== mountSeqRef.current) return;

          safeDestroyEditor('pre-mount');

          if (!holderRef.current || !document.getElementById(holderId)) {
            throw new Error('OnlyOffice container is not ready. Please retry.');
          }

          try {
            editorRef.current = new window.DocsAPI.DocEditor(holderId, config);
          } catch (mountErr) {
            const msg = String(mountErr?.message || mountErr || '');
            const isDomRace = /insertBefore|removeChild|not a child of this node/i.test(msg);
            if (isDomRace && attempt < 1 && !cancelled && myMountSeq === mountSeqRef.current) {
              console.warn('[OnlyOffice][mount-retry-dom-race]', { attempt: attempt + 1, message: msg });
              safeDestroyEditor('dom-race-retry');
              await new Promise((resolve) => setTimeout(resolve, 100));
              return mountEditor(payload, attempt + 1);
            }
            throw mountErr;
          }
          requestAnimationFrame(() => {
            const iframe = holderRef.current?.querySelector('iframe');
            if (iframe) {
              iframe.style.height = `${frameHeightRef.current}px`;
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
            if (Number(e?.response?.status || 0) === 202) return { pending: true };
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
                  setError('OnlyOffice preparation timed out. Please retry.');
                  setLoading(false);
                }
                return;
              }
              const next = await fetchConfigWhenReady();
              if (cancelled || !next || next.pending) return;
              if (typeof onConfigLoaded === 'function') {
                try { onConfigLoaded(next); } catch (_) {}
              }
              clearInterval(pollTimer);
              await mountEditor(next);
            } catch (pollErr) {
              clearInterval(pollTimer);
              if (!cancelled) {
                setError(pollErr?.message || 'Failed to initialize editor.');
                setLoading(false);
              }
            }
          }, 1500);
          return;
        }

        if (typeof onConfigLoaded === 'function') {
          try { onConfigLoaded(cfgRes); } catch (_) {}
        }

        await mountEditor(cfgRes);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to initialize editor.');
      } finally {
        if (!cancelled && !pollTimer) setLoading(false);
      }
    };
    boot();
    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      safeDestroyEditor('cleanup');
    };
  }, [fileId, holderId, refreshKey, internalRefreshKey, onConfigLoaded, onEditorReady]);

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
