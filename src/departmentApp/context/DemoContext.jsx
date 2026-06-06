import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Joyride, { STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { useColorModeValue } from '@chakra-ui/react';
import { TOURS } from '../components/DemoMode/DemoTours';

const DemoContext = createContext(null);

const STORAGE_KEY = 'dastavezai_demo_completed';

function getCompleted() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}
function setCompleted(tourId) {
  const c = getCompleted();
  c[tourId] = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

export function DemoProvider({ children }) {
  const [activeTour, setActiveTour] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [run, setRun] = useState(false);
  const [completed, setCompletedState] = useState(getCompleted);

  const primaryColor = useColorModeValue('#319795', '#4FD1C5');
  const bgColor = useColorModeValue('#ffffff', '#1a202c');
  const textColor = useColorModeValue('#1a202c', '#e2e8f0');

  const startTour = useCallback((tourId) => {
    const tour = TOURS[tourId];
    if (!tour) return;
    setActiveTour(tourId);
    setStepIndex(0);
    setRun(true);
  }, []);

  const stopTour = useCallback(() => {
    setRun(false);
    setActiveTour(null);
    setStepIndex(0);
  }, []);

  const isTourCompleted = useCallback((tourId) => !!completed[tourId], [completed]);

  const resetAllTours = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCompletedState({});
  }, []);

  const handleJoyrideCallback = useCallback((data) => {
    const { status, action, index, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      if (status === STATUS.FINISHED && activeTour) {
        setCompleted(activeTour);
        setCompletedState(getCompleted());
      }
      stopTour();
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextIndex);
    }
  }, [activeTour, stopTour]);

  const steps = useMemo(() => {
    if (!activeTour || !TOURS[activeTour]) return [];
    return TOURS[activeTour].steps;
  }, [activeTour]);

  const joyrideStyles = useMemo(() => ({
    options: {
      primaryColor,
      backgroundColor: bgColor,
      textColor,
      arrowColor: bgColor,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: '12px',
      padding: '20px',
      fontSize: '14px',
    },
    tooltipTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
    },
    buttonNext: {
      borderRadius: '8px',
      fontSize: '13px',
      padding: '8px 16px',
    },
    buttonBack: {
      borderRadius: '8px',
      fontSize: '13px',
      marginRight: 8,
    },
    buttonSkip: {
      fontSize: '12px',
    },
    spotlight: {
      borderRadius: '8px',
    },
  }), [primaryColor, bgColor, textColor]);

  const value = useMemo(() => ({
    activeTour,
    startTour,
    stopTour,
    isTourCompleted,
    resetAllTours,
    tourList: Object.entries(TOURS).map(([id, t]) => ({
      id,
      title: t.title,
      description: t.description,
      context: t.context || null,
      stepCount: t.steps.length,
      completed: !!completed[id],
    })),
  }), [activeTour, startTour, stopTour, isTourCompleted, resetAllTours, completed]);

  return (
    <DemoContext.Provider value={value}>
      {children}
      <Joyride
        steps={steps}
        stepIndex={stepIndex}
        run={run}
        continuous
        scrollToFirstStep
        showSkipButton
        showProgress
        disableOverlayClose
        callback={handleJoyrideCallback}
        styles={joyrideStyles}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Done',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be inside DemoProvider');
  return ctx;
}
