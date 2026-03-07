import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import fileService from '../services/fileService';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext(null);

const DEFAULTS = {
  language: 'en',
  aiResponseLanguage: 'auto',
  defaultCourt: '',
  editorFontSize: 14,
  theme: 'system',
  autoSaveInterval: 3,
  defaultJurisdiction: '',
  scanDepth: 'thorough',
  showLineNumbers: false,
};

export const PreferencesProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [preferences, setPreferences] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!token) return;
    fileService.getPreferences()
      .then(p => {
        setPreferences(prev => ({ ...prev, ...p }));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [token]);

  const updatePreferences = useCallback(async (newPrefs) => {
    const merged = { ...preferences, ...newPrefs };
    setPreferences(merged);
    try {
      const saved = await fileService.updatePreferences(newPrefs);
      setPreferences(prev => ({ ...prev, ...saved }));
      return saved;
    } catch (err) {
      console.error('Failed to save preferences:', err);
      throw err;
    }
  }, [preferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, loaded }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside <PreferencesProvider>');
  return ctx;
};

export default PreferencesContext;
