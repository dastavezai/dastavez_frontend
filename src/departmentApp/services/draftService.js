import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

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

export const generateFromForm = async (templatePath, fields, language, token, designConfig = null) => {
  const body = { templatePath, fields, language };
  
  
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
