import axios from 'axios';

// Use the base URL from environment variable or default to localhost
import { API_BASE_URL as BASE_URL } from '../constants';
// Don't add '/api' here - axios baseURL already includes it from BASE_URL
const API_URL = '/files';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
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
    // Handle both array and { files: [...] }
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
  deleteFile,
  downloadFile,
  // Analyze a file with AI (supports intent-aware analysis)
  analyzeFile: async (fileId, question, intentOverride = null, language = 'en') => {
    try {
      console.log('📖 Client analyzing file:', { fileId, intentOverride, language, questionLength: question?.length });
      const response = await api.post(`${API_URL}/analyze/${fileId}`, {
        question: question || 'Analyze this file',
        intentOverride, // Pass intent for context-aware analysis
        language // Pass language preference for AI response
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
      throw error; // Throw the original error to handle it in the component
    }
  },

  // ============================================
  // SMART SCANNER
  // ============================================

  // Run smart scan on uploaded file (extract formatting + AI analysis)
  smartScan: async (fileId) => {
    try {
      const response = await api.post(`${API_URL}/${fileId}/smart-scan`, {}, { timeout: 120000 });
      return response.data;
    } catch (error) {
      console.error('Smart scan error:', error);
      throw error;
    }
  },

  // Get scan status for a file
  getScanStatus: async (fileId) => {
    try {
      const response = await api.get(`${API_URL}/${fileId}/scan-status`);
      return response.data;
    } catch (error) {
      console.error('Get scan status error:', error);
      throw error;
    }
  },

  // Update suggestion status (apply/dismiss)
  updateSuggestionStatus: async (suggestionId, status) => {
    try {
      const response = await api.patch(`${API_URL}/edit/suggestion/${suggestionId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Update suggestion error:', error);
      throw error;
    }
  },

  // Save HTML content from rich editor
  saveHtmlContent: async (htmlContent, plainText) => {
    try {
      const response = await api.post(`${API_URL}/edit/save-html`, { htmlContent, plainText });
      return response.data;
    } catch (error) {
      console.error('Save HTML error:', error);
      throw error;
    }
  },

  // AI Chat about document (Harvey-style helper)
  aiChatAboutDocument: async (message, selectedText = '', chatHistory = [], language = 'en') => {
    try {
      const response = await api.post(`${API_URL}/edit/ai-chat`, {
        message, selectedText, chatHistory, language
      }, { timeout: 60000 });
      return response.data;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  },

  // ============================================
  // DOCUMENT EDITING METHODS
  // ============================================

  // Start an edit session for a file
  startEditSession: async (fileId) => {
    try {
      const response = await api.post(`${API_URL}/${fileId}/edit/start`);
      return response.data;
    } catch (error) {
      console.error('Start edit session error:', error);
      throw error;
    }
  },

  // Apply an edit to the document
  applyEdit: async (editInstruction) => {
    try {
      const response = await api.post(`${API_URL}/edit/apply`, { editInstruction });
      return response.data;
    } catch (error) {
      console.error('Apply edit error:', error);
      throw error;
    }
  },

  // Get current edit session status
  getEditStatus: async () => {
    try {
      const response = await api.get(`${API_URL}/edit/status`);
      return response.data;
    } catch (error) {
      console.error('Get edit status error:', error);
      throw error;
    }
  },

  // Get document analysis (structure, risks, suggestions)
  getDocumentAnalysis: async () => {
    try {
      const response = await api.get(`${API_URL}/edit/analysis`);
      return response.data;
    } catch (error) {
      console.error('Get document analysis error:', error);
      throw error;
    }
  },

  // Download edited document as DOCX or PDF
  downloadEdited: async (format = 'docx', designConfig = null) => {
    try {
      // If designConfig is provided, use POST to send it
      let response;
      if (designConfig && format === 'docx') {
        response = await api.post(`${API_URL}/edit/download`,
          { format, designConfig },
          { responseType: 'blob', timeout: 60000 }
        );
      } else {
        response = await api.get(`${API_URL}/edit/download?format=${format}`, {
          responseType: 'blob',
          timeout: 60000,
        });
      }

      // Check if the response is actually an error (JSON instead of blob)
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // It's a JSON error response, parse it
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Download failed');
      }

      // Validate blob size
      if (!response.data || response.data.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      console.log(`Downloaded ${format}: ${response.data.size} bytes`);
      return response.data;
    } catch (error) {
      console.error('Download edited error:', error);
      // Handle blob error response
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

  // Clear edit session
  clearEditSession: async () => {
    try {
      const response = await api.post(`${API_URL}/edit/clear`);
      return response.data;
    } catch (error) {
      console.error('Clear edit session error:', error);
      throw error;
    }
  },

  // Apply manual edit (direct text replacement without AI)
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

  // Download edited document (with proper blob handling and IDM support)
  // Supports: docx, pdf, rtf, html, md (markdown)
  downloadEditedDocument: async (format = 'docx', designConfig = null) => {
    try {
      // If designConfig provided, use POST and blob download instead of iframe
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

      // Get the token for authorization
      const token = localStorage.getItem('jwt');
      // Add timestamp to prevent caching and ensure IDM grabs the right file
      const timestamp = Date.now();
      const downloadUrl = `${BASE_URL}${API_URL}/edit/download?format=${format}&token=${encodeURIComponent(token || '')}&t=${timestamp}`;

      // Use hidden iframe for download - works better with IDM for all file types
      // This prevents opening new tabs and allows IDM to intercept properly
      let iframe = document.getElementById('download-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'download-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }

      // Set the iframe src to trigger download
      iframe.src = downloadUrl;

      // Return success - the download manager will handle the actual download
      return { success: true, message: 'Download initiated' };
    } catch (error) {
      console.error('Download error:', error);
      // Even if there's an error, the download may have been intercepted by IDM
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        return { success: true, message: 'Download initiated (may be handled by download manager)' };
      }
      throw error;
    }
  },

  // ============================================
  // UNDO/REDO OPERATIONS
  // ============================================

  // Undo last edit
  undo: async () => {
    try {
      const response = await api.post(`${API_URL}/edit/undo`);
      return response.data;
    } catch (error) {
      console.error('Undo error:', error);
      throw error;
    }
  },

  // Redo previously undone edit
  redo: async () => {
    try {
      const response = await api.post(`${API_URL}/edit/redo`);
      return response.data;
    } catch (error) {
      console.error('Redo error:', error);
      throw error;
    }
  },

  // Get undo/redo state
  getUndoRedoState: async () => {
    try {
      const response = await api.get(`${API_URL}/edit/undo-redo-state`);
      return response.data;
    } catch (error) {
      console.error('Get undo/redo state error:', error);
      throw error;
    }
  },

  // ============================================
  // AUTOSAVE
  // ============================================

  // Autosave current text (without creating change record)
  autosave: async (text) => {
    try {
      const response = await api.post(`${API_URL}/edit/autosave`, { text });
      return response.data;
    } catch (error) {
      console.error('Autosave error:', error);
      throw error;
    }
  },

  // Commit autosaved changes as a proper change record
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

  // ============================================
  // DIFF & TRACK CHANGES
  // ============================================

  // Get diff between two versions
  getDiff: async (fromVersion = 0, toVersion = -1) => {
    try {
      const response = await api.get(`${API_URL}/edit/diff?from=${fromVersion}&to=${toVersion}`);
      return response.data;
    } catch (error) {
      console.error('Get diff error:', error);
      throw error;
    }
  },

  // ============================================
  // SESSION HISTORY
  // ============================================

  // Get user's edit sessions history
  getEditSessions: async (limit = 10) => {
    try {
      const response = await api.get(`${API_URL}/edit/sessions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  },

  // Load a specific session
  loadSession: async (sessionId) => {
    try {
      const response = await api.post(`${API_URL}/edit/sessions/${sessionId}/load`);
      return response.data;
    } catch (error) {
      console.error('Load session error:', error);
      throw error;
    }
  },

  // ============================================
  // TEMPLATE VARIABLES
  // ============================================

  // Fill template variables
  fillTemplateVariables: async (variables) => {
    try {
      const response = await api.post(`${API_URL}/edit/fill-variables`, { variables });
      return response.data;
    } catch (error) {
      console.error('Fill variables error:', error);
      throw error;
    }
  },

  // ============================================
  // CHUNKED AI EDITING (for large documents)
  // ============================================

  // Apply chunked edit for large documents
  applyChunkedEdit: async (editInstruction) => {
    try {
      const response = await api.post(`${API_URL}/edit/apply-chunked`, { editInstruction });
      return response.data;
    } catch (error) {
      console.error('Apply chunked edit error:', error);
      throw error;
    }
  },
};

fileService.forgotPasswordRequest = forgotPasswordRequest;
fileService.verifyResetOTP = verifyResetOTP;
fileService.resetPassword = resetPassword;

export default fileService; 