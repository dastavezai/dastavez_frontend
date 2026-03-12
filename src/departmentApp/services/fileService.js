import axios from 'axios';
import { addRefreshInterceptors } from './axiosWithRefresh.js';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/files`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const csrfToken = localStorage.getItem('csrfToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

addRefreshInterceptors(api);


export const uploadFile = async (file, onProgress) => {
  try {
    console.log('📤 Client uploading file:', {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });
    
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    console.log('✅ Client upload successful:', { 
      fileId: response.data?.file?._id, 
      fileName: response.data?.file?.fileName 
    });
    return response.data;
  } catch (error) {
    console.error('❌ Upload error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error.response?.data || error.message;
  }
};

export const getAllFiles = async () => {
  try {
    const response = await api.get(`${API_URL}/all`);
    
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.files)) return response.data.files;
    return [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserFiles = async () => {
  try {
    const response = await api.get(`${API_URL}/user-files`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.files)) return response.data.files;
    return [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteFile = async (fileId) => {
  try {
    const response = await api.delete(`${API_URL}/${fileId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const downloadFile = async (fileId) => {
  try {
    const response = await api.get(`${API_URL}/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const forgotPasswordRequest = async (email) => {
  return api.post('/auth/forgot-password', { email });
};

export const verifyResetOTP = async (email, otp) => {
  return api.post('/auth/verify-reset-otp', { email, otp });
};

export const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  return api.post('/auth/reset-password', { email, otp, newPassword, confirmPassword });
};

const fileService = {
  uploadFile,
  getAllFiles,
  getUserFiles,
  deleteFile,
  downloadFile,
  
  analyzeFile: async (fileId, question, intentOverride = null, language = 'en') => {
    try {
      console.log('📖 Client analyzing file:', { fileId, intentOverride, language, questionLength: question?.length });
      const response = await api.post(`${API_URL}/analyze/${fileId}`, { 
        question: question || 'Analyze this file',
        intentOverride,
        language
      });
      console.log('✅ Client analysis successful:', { 
        fileName: response.data?.fileName, 
        analysisLength: response.data?.analysis?.length 
      });
      return response.data;
    } catch (error) {
      console.error('❌ File analysis error:', { 
        message: error.message, 
        status: error.response?.status,
        data: error.response?.data 
      });
      throw error;
    }
  },
  
  
  
  

  
  smartScan: async (fileId) => {
    try {
      const response = await api.post(`${API_URL}/${fileId}/smart-scan`, {}, { timeout: 240000 });
      return response.data;
    } catch (error) {
      console.error('Smart scan error:', error);
      throw error;
    }
  },

  
  getScanStatus: async (fileId) => {
    try {
      const response = await api.get(`${API_URL}/${fileId}/scan-status`);
      return response.data;
    } catch (error) {
      console.error('Get scan status error:', error);
      throw error;
    }
  },

  discoverPrecedents: async (fileId) => {
    try {
      const response = await api.post(`${API_URL}/${fileId}/discover-precedents`, {}, { timeout: 120000 });
      return response.data;
    } catch (error) {
      console.error('Discover precedents error:', error);
      throw error;
    }
  },

  
  updateSuggestionStatus: async (suggestionId, status, fileId = null) => {
    
    if (!suggestionId || suggestionId === 'undefined') {
      console.warn('updateSuggestionStatus: skipping undefined suggestionId');
      return { success: true, localOnly: true };
    }
    try {
      const body = { status };
      if (fileId) body.fileId = fileId;
      const response = await api.patch(`${API_URL}/edit/suggestion/${suggestionId}`, body);
      return response.data;
    } catch (error) {
      console.error('Update suggestion error:', error);
      throw error;
    }
  },

  
  revertSuggestion: async (suggestionId, fileId = null) => {
    if (!suggestionId || suggestionId === 'undefined') {
      console.warn('revertSuggestion: skipping undefined suggestionId');
      return { success: true, localOnly: true };
    }
    try {
      const body = { status: 'pending' };
      if (fileId) body.fileId = fileId;
      const response = await api.patch(`${API_URL}/edit/suggestion/${suggestionId}`, body);
      return response.data;
    } catch (error) {
      console.error('Revert suggestion error:', error);
      throw error;
    }
  },

  
  getCaseAugmentation: async (caseName, noLLM = false) => {
    try {
      const response = await api.post(`${BASE_URL}/api/cases/augment`, { caseName, noLLM }, { timeout: 20000 });
      return response.data;
    } catch (error) {
      console.error('Case augmentation error:', error.message);
      return null;
    }
  },

  
  saveHtmlContent: async (htmlContent, plainText, fileId = null) => {
    try {
      const body = { htmlContent, plainText };
      if (fileId) body.fileId = fileId;
      const response = await api.post(`${API_URL}/edit/save-html`, body);
      return response.data;
    } catch (error) {
      console.error('Save HTML error:', error);
      throw error;
    }
  },

  
  aiChatAboutDocument: async (message, selectedText = '', chatHistory = [], language = 'en') => {
    try {
      const response = await api.post(`${API_URL}/edit/ai-chat`, { 
        message, selectedText, chatHistory, language 
      }, { timeout: 120000 });
      return response.data;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },

  
  
  
  
  
  startEditSession: async (fileId) => {
    try {
      const response = await api.post(`${API_URL}/${fileId}/edit/start`);
      return response.data;
    } catch (error) {
      console.error('Start edit session error:', error);
      throw error;
    }
  },
  
  
  applyEdit: async (editInstruction) => {
    try {
      const response = await api.post(`${API_URL}/edit/apply`, { editInstruction });
      return response.data;
    } catch (error) {
      console.error('Apply edit error:', error);
      throw error;
    }
  },
  
  
  getEditStatus: async () => {
    try {
      const response = await api.get(`${API_URL}/edit/status`);
      return response.data;
    } catch (error) {
      console.error('Get edit status error:', error);
      throw error;
    }
  },
  
  
  getDocumentAnalysis: async () => {
    try {
      const response = await api.get(`${API_URL}/edit/analysis`);
      return response.data;
    } catch (error) {
      console.error('Get document analysis error:', error);
      throw error;
    }
  },
  
  
  downloadEdited: async (format = 'docx', designConfig = null, fileId = null) => {
    try {
      
      let response;
      if (designConfig && (format === 'docx' || format === 'pdf')) {
        const body = { format, designConfig };
        if (fileId) body.fileId = fileId;
        response = await api.post(`${API_URL}/edit/download`, 
          body,
          { responseType: 'blob', timeout: 60000 }
        );
      } else {
        const params = `format=${format}${fileId ? `&fileId=${encodeURIComponent(fileId)}` : ''}`;
        response = await api.get(`${API_URL}/edit/download?${params}`, {
          responseType: 'blob',
          timeout: 60000,
        });
      }
      
      
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Download failed');
      }
      
      
      if (!response.data || response.data.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      console.log(`Downloaded ${format}: ${response.data.size} bytes`);
      return response.data;
    } catch (error) {
      console.error('Download edited error:', error);
      
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Download failed');
        } catch (parseError) {
          throw error;
        }
      }
      throw error;
    }
  },
  
  
  clearEditSession: async () => {
    try {
      const response = await api.post(`${API_URL}/edit/clear`);
      return response.data;
    } catch (error) {
      console.error('Clear edit session error:', error);
      throw error;
    }
  },
  
  
  applyManualEdit: async (newText, description = 'Manual edit') => {
    try {
      const response = await api.post(`${API_URL}/edit/manual`, { 
        newText, 
        description 
      });
      return response.data;
    } catch (error) {
      console.error('Apply manual edit error:', error);
      throw error;
    }
  },
  
  
  
  downloadEditedDocument: async (format = 'docx', designConfig = null) => {
    try {
      
      if (designConfig && format === 'docx') {
        const response = await api.post(`${API_URL}/edit/download`, 
          { format, designConfig },
          { responseType: 'blob', timeout: 60000 }
        );
        
        if (response.data && response.data.size > 0) {
          const url = window.URL.createObjectURL(response.data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `document_styled.${format}`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
        return { success: true, message: 'Download with design complete' };
      }

      // Use axios for download so JWT/CSRF refresh interceptor can retry on 403
      const response = await api.get(`${API_URL}/edit/download?format=${format}`, {
        responseType: 'blob',
        timeout: 60000,
      });

      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Download failed');
      }

      if (response.data && response.data.size > 0) {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      return { success: true, message: 'Download complete' };
    } catch (error) {
      console.error('Download error:', error);
      
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        return { success: true, message: 'Download initiated (may be handled by download manager)' };
      }
      throw error;
    }
  },
  
  
  
  
  
  
  undo: async () => {
    try {
      const response = await api.post(`${API_URL}/edit/undo`);
      return response.data;
    } catch (error) {
      console.error('Undo error:', error);
      throw error;
    }
  },
  
  
  redo: async () => {
    try {
      const response = await api.post(`${API_URL}/edit/redo`);
      return response.data;
    } catch (error) {
      console.error('Redo error:', error);
      throw error;
    }
  },
  
  
  getUndoRedoState: async () => {
    try {
      const response = await api.get(`${API_URL}/edit/undo-redo-state`);
      return response.data;
    } catch (error) {
      console.error('Get undo/redo state error:', error);
      throw error;
    }
  },
  
  
  
  
  
  
  autosave: async (text) => {
    try {
      const response = await api.post(`${API_URL}/edit/autosave`, { text });
      return response.data;
    } catch (error) {
      console.error('Autosave error:', error);
      throw error;
    }
  },
  
  
  commitAutosave: async (text, description = 'Manual edits') => {
    try {
      const response = await api.post(`${API_URL}/edit/autosave`, { 
        text, 
        commit: true,
        description
      });
      return response.data;
    } catch (error) {
      console.error('Commit autosave error:', error);
      throw error;
    }
  },
  
  
  
  
  
  
  getDiff: async (fromVersion = 0, toVersion = -1) => {
    try {
      const response = await api.get(`${API_URL}/edit/diff?from=${fromVersion}&to=${toVersion}`);
      return response.data;
    } catch (error) {
      console.error('Get diff error:', error);
      throw error;
    }
  },
  
  
  
  
  
  
  getEditSessions: async (limit = 10) => {
    try {
      const response = await api.get(`${API_URL}/edit/sessions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  },
  
  
  loadSession: async (sessionId) => {
    try {
      const response = await api.post(`${API_URL}/edit/sessions/${sessionId}/load`);
      return response.data;
    } catch (error) {
      console.error('Load session error:', error);
      throw error;
    }
  },
  
  
  
  
  
  
  fillTemplateVariables: async (variables) => {
    try {
      const response = await api.post(`${API_URL}/edit/fill-variables`, { variables });
      return response.data;
    } catch (error) {
      console.error('Fill variables error:', error);
      throw error;
    }
  },

  // Save filled field values to session for persistence
  saveFilledFieldValues: async (fileId, filledValues) => {
    try {
      const response = await api.post(`${API_URL}/edit/save-field-values`, { fileId, filledValues });
      return response.data;
    } catch (error) {
      console.error('Save field values error:', error);
      throw error;
    }
  },
  
  
  
  
  
  
  applyChunkedEdit: async (editInstruction) => {
    try {
      const response = await api.post(`${API_URL}/edit/apply-chunked`, { editInstruction });
      return response.data;
    } catch (error) {
      console.error('Apply chunked edit error:', error);
      throw error;
    }
  },

  
  
  

  
  autoFillFields: async (templateTitle, fields) => {
    try {
      const response = await api.post(`${API_URL}/autofill-fields`, { templateTitle, fields });
      return response.data;
    } catch (error) {
      console.error('Auto-fill fields error:', error);
      throw error;
    }
  },

  
  
  

  searchCases: async (query, limit = 5) => {
    try {
      const response = await api.get(
        `${BASE_URL}/api/cases/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Case search error:', error);
      throw error;
    }
  },

  
  
  

  loadTemplateHtml: async (relPath) => {
    try {
      const response = await api.get(
        `${BASE_URL}/api/templates/load/${encodeURIComponent(relPath)}`
      );
      return response.data;
    } catch (error) {
      console.error('Template load error:', error);
      throw error;
    }
  },
};

fileService.forgotPasswordRequest = forgotPasswordRequest;
fileService.verifyResetOTP = verifyResetOTP;
fileService.resetPassword = resetPassword;

fileService.generateCounterAffidavit = async ({ fileId, petitionText, court, language }) => {
  const response = await api.post('/api/draft/counter-affidavit', { fileId, petitionText, court, language }, { timeout: 120000 });
  return response.data;
};

fileService.exportCounterAffidavit = async ({ counterData, format, court, language }) => {
  const response = await api.post('/api/draft/counter-affidavit/export', { counterData, format, court, language }, { responseType: format === 'pdf' ? 'blob' : 'text' });
  return response.data;
};

fileService.exportAuditLog = async (sessionId, format = 'pdf') => {
  const response = await api.get(`/api/files/edit/${sessionId}/audit-log?format=${format}`, {
    responseType: format === 'pdf' ? 'blob' : 'text',
    timeout: 60000,
  });
  return response.data;
};

fileService.getPreferences = async () => {
  const response = await api.get('/api/profile/preferences');
  return response.data;
};

fileService.updatePreferences = async (prefs) => {
  const response = await api.patch('/api/profile/preferences', prefs);
  return response.data;
};

export default fileService; 