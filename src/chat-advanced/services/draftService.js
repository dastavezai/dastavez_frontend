import axios from 'axios';
import { API_BASE_URL as BASE_URL } from '../constants';

/**
 * Get template schema for form-based field collection
 * @param {string} templatePath - Path to the template
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Template schema with fields
 */
export const getTemplateSchema = async (templatePath, token) => {
  console.log('📤 [draftService.getTemplateSchema] Requesting schema for:', templatePath);

  try {
    const response = await axios.get(`${BASE_URL}/draft/schema`, {
      params: { templatePath },
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📥 [draftService.getTemplateSchema] Response received:', {
      success: response.data.success,
      fieldCount: response.data.fields?.length,
      displayTitle: response.data.displayTitle
    });

    return response.data;
  } catch (error) {
    console.error('❌ [draftService.getTemplateSchema] Request failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Generate document from form fields
 * @param {string} templatePath - Path to the template
 * @param {Object} fields - Field values (key-value pairs)
 * @param {string} language - Language preference ('en' or 'hi')
 * @param {string} token - Auth token
 * @param {Object} [designConfig] - Optional design configuration from TemplateDesign
 * @returns {Promise<Object>} Generated document data
 */
export const generateFromForm = async (templatePath, fields, language, token, designConfig = null) => {
  const body = { templatePath, fields, language };

  // 🔍 DEBUG: Log what we're sending
  console.log('📤 generateFromForm sending:', {
    templatePath,
    fieldCount: Object.keys(fields).length,
    language,
    hasDesignConfig: !!designConfig,
    designConfigKeys: designConfig ? Object.keys(designConfig) : []
  });

  if (designConfig) {
    console.log('   ✅ Adding designConfig to request:', designConfig);
    body.designConfig = designConfig;
  } else {
    console.log('   ⚠️  NO designConfig in request - will use backend defaults');
  }

  const response = await axios.post(
    `${BASE_URL}/draft/form-generate`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log('📥 generateFromForm received response:', { success: response.data.success, fileSize: response.data.file?.size });

  return response.data;
};

const draftService = {
  getTemplateSchema,
  generateFromForm
};

export default draftService;
