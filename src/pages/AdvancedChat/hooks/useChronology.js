import React, { useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import chronologyService from '../../../chat-advanced/services/chronologyService';
import fileService from '../../../chat-advanced/services/fileService';
import { useAdvancedChat } from './AdvancedChatContext';

export const useChronology = () => {
  const toast = useToast();
  const {
    chronologySessionId, setChronologySessionId,
    chronologyStatus, setChronologyStatus,
    setChronologyResults,
    setChronologyElapsed,
    setChronologyEta,
    setChronologyAgentStage,
    setIsTimelinePanelOpen,
    chronologyFiles, setChronologyFiles
  } = useAdvancedChat();

  const chronologyPollRef = useRef(null);
  const chronologyTimerRef = useRef(null);

  const stopChronologyPolling = () => {
    if (chronologyPollRef.current) clearInterval(chronologyPollRef.current);
    if (chronologyTimerRef.current) clearInterval(chronologyTimerRef.current);
  };

  const pollChronologyStatus = (sessionId) => {
    stopChronologyPolling();

    const stages = [
      { label: 'Extracting events from files...', at: 0 },
      { label: 'Building unified timeline...', at: 25 },
      { label: 'Sorting & deduplicating events...', at: 40 },
      { label: 'Generating timeline summary...', at: 50 },
    ];

    chronologyTimerRef.current = setInterval(() => {
      setChronologyElapsed(prev => {
        const next = prev + 1;
        const currentStage = [...stages].reverse().find(s => next >= s.at);
        if (currentStage) setChronologyAgentStage(currentStage.label);
        return next;
      });
    }, 1000);

    chronologyPollRef.current = setInterval(async () => {
      try {
        const result = await chronologyService.getChronologyResults(sessionId);
        if (['completed', 'completed_with_errors', 'failed'].includes(result.status)) {
          stopChronologyPolling();
          setChronologyResults(result);
          setChronologyStatus(result.status);
          setIsTimelinePanelOpen(true);
          setChronologyAgentStage(result.status === 'failed' ? 'Analysis failed' : 'Timeline ready!');

          if (result.status !== 'failed') {
            toast({
              title: '📅 Chronology Complete',
              description: `Timeline built with ${result.events?.length || 0} events.`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } catch (err) {
        console.error('Chronology poll error:', err);
      }
    }, 5000);
  };

  const handleChronologyFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const allowedTypes = [
      'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    ];
    const allowedExtensions = ['.pdf', '.txt', '.md', '.csv', '.json', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return allowedTypes.includes(file.type) || allowedExtensions.includes(ext);
    });

    if (validFiles.length === 0) {
      toast({ title: 'No valid files', description: 'Supported: PDF, Word, Text, Images', status: 'error', duration: 3000 });
      e.target.value = '';
      return;
    }

    if (validFiles.length > 10) {
      toast({ title: 'Too many files', description: 'Maximum 10 files allowed.', status: 'warning', duration: 3000 });
      e.target.value = '';
      return;
    }

    toast({
      title: `Uploading ${validFiles.length} file(s)...`,
      status: 'info',
      duration: 2000,
    });

    const uploaded = [];
    for (const file of validFiles) {
      try {
        const response = await fileService.uploadFile(file);
        const editResult = await fileService.startEditSession(response.file._id);
        const editSessionId = editResult.sessionId || editResult._id || editResult.editSession?._id;
        uploaded.push({
          file: response.file,
          editSessionId,
        });
      } catch (err) {
        console.error(`Failed to upload "${file.name}":`, err);
        toast({
          title: `Upload failed: ${file.name}`,
          description: err?.message || 'Unknown error',
          status: 'error',
          duration: 3000,
        });
      }
    }

    if (uploaded.length > 0) {
      setChronologyFiles(prev => [...prev, ...uploaded]);
      toast({
        title: `✅ ${uploaded.length} file(s) ready`,
        description: 'Click "Build Chronology" to analyze.',
        status: 'success',
        duration: 3000,
      });
    }

    e.target.value = '';
  };

  const handleStartChronology = async () => {
    if (chronologyFiles.length === 0) {
      toast({ title: 'No files', description: 'Upload at least one file.', status: 'warning', duration: 3000 });
      return;
    }

    try {
      setChronologyStatus('starting');
      setChronologyResults(null);
      setChronologyElapsed(0);
      setChronologyAgentStage('Preparing files...');
      setIsTimelinePanelOpen(true);
      setChronologyEta(40 + chronologyFiles.length * 20);

      const editSessionIds = chronologyFiles.map(f => f.editSessionId);
      const result = await chronologyService.startChronology(editSessionIds);
      const newSessionId = result.sessionId;

      setChronologySessionId(newSessionId);
      localStorage.setItem('chronologySessionId', newSessionId);
      setChronologyStatus('processing');

      pollChronologyStatus(newSessionId);
    } catch (err) {
      console.error('Chronology start error:', err);
      setChronologyStatus('failed');
      toast({
        title: 'Chronology Failed',
        description: err?.response?.data?.error || err.message || 'Failed to start chronology',
        status: 'error',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    const savedId = localStorage.getItem('chronologySessionId');
    if (savedId && chronologyStatus === 'idle') {
      chronologyService.getChronologyResults(savedId).then(result => {
        setChronologyResults(result);
        setChronologySessionId(savedId);
        if (['completed', 'completed_with_errors'].includes(result.status)) {
          setChronologyStatus(result.status);
        } else if (result.status === 'processing' || result.status === 'pending') {
          setChronologyStatus('processing');
          setIsTimelinePanelOpen(true);
          pollChronologyStatus(savedId);
        } else {
          localStorage.removeItem('chronologySessionId');
        }
      }).catch(() => {
        localStorage.removeItem('chronologySessionId');
      });
    }
    return () => stopChronologyPolling();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    handleChronologyFilesUpload,
    handleStartChronology,
    stopChronologyPolling
  };
};