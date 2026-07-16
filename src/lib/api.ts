import axios from 'axios';

// API Configuration - Connected to Cloud Run Backend
// Use relative path '/api' if VITE_API_URL is not set (for local proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

// Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  isVerified: boolean;
  isAdmin: boolean;
  subscriptionStatus: 'free' | 'basic' | 'pro' | 'premium' | 'standard' | 'departmental';
  userTier?: 'free' | 'basic' | 'pro' | 'premium' | 'standard' | 'departmental';
  remainingMessages?: number;
  companyName?: string | null;
  sector?: string | null;
  companySlug?: string | null;
  createdAt: string;
  lastLogin: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FileUpload {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface Subscription {
  plan: 'free' | 'premium';
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
}

export interface Lawyer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  originalAmount: number;
  finalAmount: number;
}

export interface AdminCoupon {
  _id: string;
  code: string;
  discountPercentage: number;
  maxUses: number;
  used?: number;
  validFrom: string; // ISO
  validUntil: string; // ISO
  createdAt?: string;
  updatedAt?: string;
}

// Mock Backend Router for offline demo / development mode
export const getMockUser = (): User => {
  const isMockAdmin = localStorage.getItem('mock_user_role') === 'admin';
  const stored = localStorage.getItem('mock_user_profile');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { }
  }
  const defaultUser: User = {
    _id: "mock-user-id",
    email: isMockAdmin ? "admin@dastavez.ai" : "user@dastavez.ai",
    firstName: "Demo",
    lastName: isMockAdmin ? "Admin" : "User",
    isVerified: true,
    isAdmin: isMockAdmin,
    subscriptionStatus: "premium",
    userTier: "premium",
    remainingMessages: 100,
    createdAt: "2026-06-27T00:00:00Z",
    lastLogin: new Date().toISOString()
  };
  localStorage.setItem('mock_user_profile', JSON.stringify(defaultUser));
  return defaultUser;
};

export function routeMockRequest(url: string, method: string = 'GET', body: any = null): any {
  const cleanUrl = url.replace(/^\/api/, '').split('?')[0];
  const m = method ? method.toUpperCase() : 'GET';

  // 1. Auth & Profile
  if (cleanUrl === '/auth/check-email') {
    return { exists: true };
  }
  if (cleanUrl === '/auth/login' || cleanUrl === '/auth/signup') {
    localStorage.setItem('use_mock_backend', 'true');
    localStorage.setItem('jwt', 'mock-jwt-token-xyz');
    return {
      token: 'mock-jwt-token-xyz',
      csrfToken: 'mock-csrf-token',
      refreshToken: 'mock-refresh-token',
      user: getMockUser()
    };
  }
  if (cleanUrl === '/auth/user' || cleanUrl === '/profile/info') {
    if (m === 'PUT') {
      const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
      const current = getMockUser();
      const updated = { ...current, ...parsedBody };
      localStorage.setItem('mock_user_profile', JSON.stringify(updated));
      return updated;
    }
    return getMockUser();
  }
  if (cleanUrl === '/profile/company-setup') {
    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    const current = getMockUser();
    const slug = (parsedBody?.companyName || 'demo-company')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const updated = { 
      ...current, 
      companyName: parsedBody?.companyName || 'Demo Company', 
      sector: parsedBody?.sector || 'legal',
      companySlug: slug || 'demo-company'
    };
    localStorage.setItem('mock_user_profile', JSON.stringify(updated));
    return { success: true, user: updated };
  }
  if (cleanUrl === '/auth/verify-reset-otp' || cleanUrl === '/auth/reset-password' || cleanUrl === '/auth/forgot-password') {
    return { success: true };
  }

  // 2. Chat
  if (cleanUrl === '/chat/sessions') {
    const stored = localStorage.getItem('mock_chat_sessions');
    if (stored) return JSON.parse(stored);
    const defaults = [
      { slug: "nda-review", preview: "Reviewing Non-Disclosure Agreement", updatedAt: new Date().toISOString(), feature: "nda" },
      { slug: "employment-contract", preview: "Consulting on Employment Contract", updatedAt: new Date().toISOString(), feature: "employment" }
    ];
    localStorage.setItem('mock_chat_sessions', JSON.stringify(defaults));
    return defaults;
  }
  if (cleanUrl === '/chat/history' || cleanUrl === '/chat') {
    const stored = localStorage.getItem('mock_chat_history');
    if (stored) return JSON.parse(stored);
    const defaults = [
      { role: 'assistant', content: "Hello! I am Dastavez AI, your legal intelligence assistant. How can I help you analyze, draft, or review your legal documents today?", timestamp: new Date().toISOString() }
    ];
    localStorage.setItem('mock_chat_history', JSON.stringify(defaults));
    return defaults;
  }
  if (cleanUrl === '/chat/message' || cleanUrl === '/chat') {
    let userMsg = '';
    if (typeof body === 'string') {
      try {
        userMsg = JSON.parse(body).message || '';
      } catch {
        userMsg = body;
      }
    } else if (body && typeof body === 'object') {
      userMsg = body.message || '';
    }

    const currentHistory = routeMockRequest('/chat/history', 'GET');
    const newUserMsg = { role: 'user', content: userMsg, timestamp: new Date().toISOString() };
    
    let aiContent = "I've received your request. As Dastavez AI, I can help analyze this legal point. In general, legal documents require clear definitions of terms, obligations, and dispute resolution mechanisms. Could you provide more specific clauses or documents?";
    const msgLower = userMsg.toLowerCase();
    if (msgLower.includes("nda") || msgLower.includes("non-disclosure")) {
      aiContent = "Analyzing Non-Disclosure Agreement (NDA) clause. Key areas to verify:\n1. **Definition of Confidential Information**: Ensure it is not overly broad.\n2. **Term & Obligations**: Usually 2-5 years after termination.\n3. **Exceptions**: Standard exclusions (public domain, prior knowledge) should be present.\n4. **Remedies**: Confirm if injunctions and damages are specified.";
    } else if (msgLower.includes("indemnity") || msgLower.includes("indemnification")) {
      aiContent = "Examining Indemnification clause. In standard commercial contracts:\n- **Scope**: Indemnity should be limited to direct losses arising from breach of agreement or negligence.\n- **Cap**: Ensure there is a reasonable liability cap (e.g., 1x or 2x contract value).\n- **Notice**: A prompt notice requirement for third-party claims should be included.";
    } else if (msgLower.includes("termination")) {
      aiContent = "Reviewing Termination clause. Recommendation:\n- **For Cause**: Standard 30-day cure period for remediable breaches.\n- **For Convenience**: Ensure mutual notice period (e.g., 30 to 60 days) is defined.\n- **Effects of Termination**: Clearly state obligations regarding data return, deletion, and payment for services rendered up to termination date.";
    } else if (msgLower.includes("arbitration") || msgLower.includes("governing law")) {
      aiContent = "Checking Governing Law & Dispute Resolution:\n- **Jurisdiction**: Verify the courts of choice (e.g., New Delhi, Mumbai, or as per agreement).\n- **Arbitration**: Under the Arbitration and Conciliation Act, 1996, specifying the place of arbitration, language (English), and sole arbitrator selection process.";
    }

    const newAiMsg = {
      role: 'assistant',
      content: aiContent,
      response: aiContent,
      missingFields: null,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...currentHistory, newUserMsg, newAiMsg];
    localStorage.setItem('mock_chat_history', JSON.stringify(updatedHistory));
    
    return newAiMsg;
  }
  if (cleanUrl === '/chat/clear') {
    localStorage.removeItem('mock_chat_history');
    return { success: true };
  }

  // 3. Files
  if (cleanUrl === '/files/all') {
    const stored = localStorage.getItem('mock_uploaded_files');
    if (stored) return JSON.parse(stored);
    const defaults = [
      {
        _id: "file-1",
        fileName: "nda_draft_final.pdf",
        fileType: "pdf",
        fileSize: 184520,
        fileUrl: "#",
        uploadedBy: { _id: "mock-user-id", firstName: "Demo", lastName: "User", email: "demo@dastavez.ai" },
        createdAt: "2026-06-27T10:15:00Z"
      }
    ];
    localStorage.setItem('mock_uploaded_files', JSON.stringify(defaults));
    return defaults;
  }
  if (cleanUrl === '/files/upload') {
    const files = routeMockRequest('/files/all', 'GET');
    const newFile = {
      _id: "file_" + Date.now(),
      fileName: "uploaded_document.pdf",
      fileType: "pdf",
      fileSize: 250000,
      fileUrl: "#",
      uploadedBy: { _id: "mock-user-id", firstName: "Demo", lastName: "User", email: "demo@dastavez.ai" },
      createdAt: new Date().toISOString()
    };
    files.push(newFile);
    localStorage.setItem('mock_uploaded_files', JSON.stringify(files));
    return newFile;
  }
  if (cleanUrl.startsWith('/files/analyze/')) {
    return { analysis: "Based on the uploaded document, I found 3 key liability clauses. First, the liability cap is set to $10,000. Second, the governing law is Delaware. Third, the indemnification obligations are reciprocal." };
  }
  if (cleanUrl.startsWith('/files/')) {
    if (m === 'DELETE') {
      const fileId = cleanUrl.split('/').pop();
      const files = routeMockRequest('/files/all', 'GET');
      const filtered = files.filter((f: any) => f._id !== fileId);
      localStorage.setItem('mock_uploaded_files', JSON.stringify(filtered));
      return { success: true };
    }
  }

  // 4. Subscriptions
  if (cleanUrl === '/subscription/status') {
    return { subscription: { plan: 'premium', status: 'active', startDate: '2026-06-27T00:00:00Z', endDate: '2027-06-27T00:00:00Z' } };
  }
  if (cleanUrl === '/subscription/price') {
    return { price: 999 };
  }
  if (cleanUrl === '/subscription/validate-coupon') {
    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    return { coupon: { code: parsedBody?.code || 'MOCK50', discountPercentage: 50, originalAmount: 999, finalAmount: 499.5 } };
  }
  if (cleanUrl === '/subscription/order') {
    return { id: 'order_mock_' + Date.now(), amount: 999, currency: 'INR' };
  }
  if (cleanUrl === '/subscription/verify') {
    return { success: true };
  }

  // 5. Admin
  if (cleanUrl === '/admin/users') {
    return [
      { _id: "user-1", firstName: "John", lastName: "Doe", email: "john@example.com", isAdmin: false, subscriptionStatus: "free", createdAt: "2026-06-01T12:00:00Z", lastLogin: "2026-06-25T14:30:00Z" },
      { _id: "user-2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", isAdmin: false, subscriptionStatus: "premium", createdAt: "2026-06-05T09:00:00Z", lastLogin: "2026-06-27T08:15:00Z" },
      { _id: "user-3", firstName: "Admin", lastName: "Dastavez", email: "admin@dastavez.ai", isAdmin: true, subscriptionStatus: "premium", createdAt: "2026-05-01T00:00:00Z", lastLogin: "2026-06-27T13:30:00Z" }
    ];
  }
  if (cleanUrl === '/admin/financial-stats') {
    return {
      totalRevenue: 450000,
      activeSubscriptions: 120,
      totalUsers: 1250,
      monthlyEarnings: [
        { month: "Jan", amount: 35000 },
        { month: "Feb", amount: 42000 },
        { month: "Mar", amount: 50000 },
        { month: "Apr", amount: 62000 },
        { month: "May", amount: 75000 },
        { month: "Jun", amount: 86000 }
      ]
    };
  }
  if (cleanUrl === '/admin/settings/free-message-limit') {
    return { limit: 10 };
  }
  if (cleanUrl === '/lawyers' || cleanUrl === '/admin/lawyers') {
    return [
      { _id: "lawyer-1", name: "Harish Salve", phone: "+91 98765 43210", email: "harish.salve@courts.gov.in", address: "Delhi High Court Chambers, New Delhi", createdAt: "2026-01-10T10:00:00Z" },
      { _id: "lawyer-2", name: "Indira Jaising", phone: "+91 98765 43211", email: "indira.jaising@courts.gov.in", address: "Supreme Court Chambers, New Delhi", createdAt: "2026-01-15T12:00:00Z" }
    ];
  }

  return { success: true };
}

// Axios Mock adapter setup
const originalAdapter = axios.getAdapter(axios.defaults.adapter);
axios.defaults.adapter = async (config: any) => {
  if (localStorage.getItem('use_mock_backend') === 'true') {
    try {
      const responseData = routeMockRequest(config.url || '', config.method, config.data);
      return {
        data: responseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    } catch (e: any) {
      return Promise.reject(new Error(e.message || 'Mock Adapter Error'));
    }
  }
  if (originalAdapter) {
    try {
      return await originalAdapter(config);
    } catch (err: any) {
      console.warn("Axios request failed:", err);
      return Promise.reject(err);
    }
  }
  return Promise.reject(new Error('No Axios adapter configured'));
};

// Helper function for authenticated API requests (with CSRF retry on 403)
export async function apiFetch(url: string, options: RequestInit = {}, retried = false): Promise<any> {
  if (localStorage.getItem('use_mock_backend') === 'true') {
    return routeMockRequest(url, options.method, options.body);
  }
  const token = localStorage.getItem('jwt');
  const csrfToken = localStorage.getItem('csrfToken');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (csrfToken) headers['x-csrf-token'] = csrfToken;

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });

    // On 403 CSRF error, refresh token and retry once
    if (response.status === 403 && !retried && token) {
      const errorData = await response.json().catch(() => ({}));
      const isCsrfError =
        errorData?.message === 'Invalid CSRF token' || errorData?.error === 'Invalid CSRF token';
      if (isCsrfError) {
        try {
          const refreshResp = await fetch(`${API_BASE_URL}/auth/refresh-csrf`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
          const refreshData = await refreshResp.json();
          if (refreshData?.csrfToken) {
            localStorage.setItem('csrfToken', refreshData.csrfToken);
            return apiFetch(url, options, true);
          }
        } catch {
          // fall through
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`Network/API error for ${url}:`, err);
    throw err;
  }
}

// Authentication API
export const authAPI = {
  // Check if email exists
  checkEmail: async (email: string) => {
    return apiFetch('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.token) {
      localStorage.setItem('jwt', response.token);
    }
    if (response.csrfToken) {
      localStorage.setItem('csrfToken', response.csrfToken);
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  },

  // Register user
  signup: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }) => {
    const response = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.token) {
      localStorage.setItem('jwt', response.token);
    }
    if (response.csrfToken) {
      localStorage.setItem('csrfToken', response.csrfToken);
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const data = await apiFetch('/auth/user');
    // Normalize to plain User object regardless of whether backend returns { user: ... } or direct user
    const user = (data && typeof data === 'object' && 'user' in data) ? (data as any).user : data;
    return user as User;
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Verify reset OTP
  verifyResetOtp: async (email: string, otp: string) => {
    return apiFetch('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  },

  // Reset password
  resetPassword: async (email: string, otp: string, newPassword: string, confirmPassword: string) => {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword, confirmPassword })
    });
  },

  // Google OAuth login/signup
  googleAuth: async (idToken: string) => {
    const response = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });

    if (response.token) {
      localStorage.setItem('jwt', response.token);
    }
    if (response.csrfToken) {
      localStorage.setItem('csrfToken', response.csrfToken);
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('csrfToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('use_mock_backend');
    localStorage.removeItem('mock_user_role');
    localStorage.removeItem('mock_user_profile');
    localStorage.removeItem('mock_chat_history');
    localStorage.removeItem('mock_chat_sessions');
    localStorage.removeItem('mock_uploaded_files');
    localStorage.removeItem('user');
    localStorage.removeItem('login_timestamp');
  }
};

// Chat API
export const chatAPI = {
  // Send message
  sendMessage: async (message: string) => {
    return apiFetch('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // Get chat history
  getHistory: async (): Promise<ChatMessage[]> => {
    return apiFetch('/chat/history');
  },

  // Get all chat sessions (slugs)
  getSessions: async (): Promise<{ slug: string; preview: string; updatedAt: string; feature: string }[]> => {
    return apiFetch('/chat/sessions');
  },

  // Clear chat history
  clearHistory: async () => {
    return apiFetch('/chat/clear?soft=true', {
      method: 'DELETE'
    });
  }
};

// File Management API 
export const fileAPI = {
  // Upload file
  uploadFile: async (file: File) => {
    if (localStorage.getItem('use_mock_backend') === 'true') {
      return routeMockRequest('/files/upload', 'POST', null);
    }
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('jwt');
    const csrfToken = localStorage.getItem('csrfToken');
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };
    if (csrfToken) headers['x-csrf-token'] = csrfToken;

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get all files
  getAllFiles: async (): Promise<FileUpload[]> => {
    return apiFetch('/files/all');
  },

  // Analyze file
  analyzeFile: async (fileId: string, question: string) => {
    return apiFetch(`/files/analyze/${fileId}`, {
      method: 'POST',
      body: JSON.stringify({ question })
    });
  },

  // Delete file
  deleteFile: async (fileId: string) => {
    return apiFetch(`/files/${fileId}`, {
      method: 'DELETE'
    });
  }
};

// Subscription & Payments API
export const subscriptionAPI = {
  // Get subscription price
  getPrice: async (): Promise<{ price: number }> => {
    // Try multiple endpoints and normalize response shape
    const tryEndpoints = [
      '/subscription/price',
    ];

    let lastError: unknown = undefined;
    for (const endpoint of tryEndpoints) {
      try {
        const data = await apiFetch(endpoint);
        const priceRaw = (data && typeof data === 'object')
          ? ((data as any).price ?? (data as any).amount ?? (data as any).value)
          : data;
        const priceNum = Number(priceRaw);
        if (!Number.isNaN(priceNum)) {
          return { price: priceNum };
        }
      } catch (err) {
        lastError = err;
      }
    }
    if (lastError) throw lastError;
    return { price: 0 };
  },

  // Create payment order
  createOrder: async (amount: number, currency: string = 'INR', couponCode?: string) => {
    return apiFetch('/subscription/order', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, couponCode })
    });
  },

  // Verify payment
  verifyPayment: async (paymentId: string, orderId: string, signature: string) => {
    return apiFetch('/subscription/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentId, orderId, signature })
    });
  },

  // Get subscription status
  getStatus: async (): Promise<{ subscription: Subscription }> => {
    return apiFetch('/subscription/status');
  },

  // Validate coupon
  validateCoupon: async (code: string): Promise<{ coupon: Coupon }> => {
    return apiFetch('/subscription/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }
};

// Profile Management API
export const profileAPI = {
  // Get profile info
  getInfo: async (): Promise<User> => {
    const data = await apiFetch('/profile/info');
    const user = (data && typeof data === 'object' && 'user' in data) ? (data as any).user : data;
    return user as User;
  },

  // Update profile
  updateInfo: async (data: { firstName?: string; lastName?: string }) => {
    return apiFetch('/profile/info', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Setup company onboarding details
  setupCompany: async (companyName: string, sector: string): Promise<{ success: boolean; user: User }> => {
    return apiFetch('/profile/company-setup', {
      method: 'PUT',
      body: JSON.stringify({ companyName, sector })
    });
  },

  // Upload profile image
  uploadImage: async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);

    const token = localStorage.getItem('jwt');
    const csrfToken = localStorage.getItem('csrfToken');
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };
    if (csrfToken) headers['x-csrf-token'] = csrfToken;

    const response = await fetch(`${API_BASE_URL}/profile/profile-image`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  initiatePasswordChange: async (currentPassword: string) => {
    return apiFetch('/profile/password/initiate-change', {
      method: 'POST',
      body: JSON.stringify({ currentPassword })
    });
  },

  completePasswordChange: async (otp: string, newPassword: string, confirmPassword: string) => {
    return apiFetch('/profile/password/complete-change', {
      method: 'POST',
      body: JSON.stringify({ otp, newPassword, confirmPassword })
    });
  }
};

// Contact API
export const contactAPI = {
  // Send contact email
  sendContact: async (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    return apiFetch('/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Admin API (for admin users only)
export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    return apiFetch('/admin/users');
  },
  // Update user subscription tier
  updateUserTier: async (id: string, tier: string): Promise<{ success: boolean; user: any }> => {
    return apiFetch(`/admin/users/${id}/tier`, {
      method: 'PUT',
      body: JSON.stringify({ tier })
    });
  },
  //GET financial stats
  getStats: async () => {
    return apiFetch('/admin/financial-stats');
  },

  // Update subscription price
  updateSubscriptionPrice: async (amount: number) => {
    return apiFetch('/subscription/price', {
      method: 'PUT',
      body: JSON.stringify({ amount })
    });
  },

  // Create coupon
  createCoupon: async (data: {
    code: string;
    discountPercentage: number;
    maxUses: number;
    validFrom: string;
    validUntil: string;
  }) => {
    return apiFetch('/subscription/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Settings: free daily message limit
  getFreeMessageLimit: async (): Promise<{ value: number }> => {
    return apiFetch('/admin/settings/free-message-limit');
  },
  setFreeMessageLimit: async (value: number): Promise<{ success: boolean; value: number }> => {
    return apiFetch('/admin/settings/free-message-limit', {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  },

  // List, update, delete coupons (admin)
  listCoupons: async (): Promise<AdminCoupon[]> => {
    // Normalize different coupon list endpoints and response shapes
    const tryEndpoints = [
      '/subscription/coupons',
    ];

    const normalize = (raw: any): AdminCoupon | null => {
      if (!raw) return null;
      const id = raw._id || raw.id || `${raw.code}-${raw.validFrom || ''}`;
      const code = raw.code || raw.couponCode || raw.name;
      const discountPercentage =
        raw.discountPercentage ?? raw.discount ?? raw.percent ?? 0;
      const maxUses = raw.maxUses ?? raw.max_uses ?? raw.limit ?? raw.max ?? 0;
      const used = raw.used ?? raw.uses ?? raw.usedCount ?? 0;
      const validFrom = raw.validFrom || raw.valid_from || raw.startDate || raw.from || '';
      const validUntil = raw.validUntil || raw.valid_until || raw.endDate || raw.until || '';
      if (!code) return null;
      return {
        _id: id,
        code,
        discountPercentage: Number(discountPercentage),
        maxUses: Number(maxUses),
        used: Number(used),
        validFrom,
        validUntil,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      } as AdminCoupon;
    };

    let lastError: unknown = undefined;
    for (const endpoint of tryEndpoints) {
      try {
        const data = await apiFetch(endpoint);
        const list = Array.isArray((data as any)?.coupons)
          ? (data as any).coupons
          : Array.isArray(data)
            ? data
            : Array.isArray((data as any)?.data)
              ? (data as any).data
              : [];
        const normalized = (list as any[]).map(normalize).filter(Boolean) as AdminCoupon[];
        if (normalized.length > 0 || Array.isArray(list)) {
          return normalized;
        }
      } catch (err) {
        lastError = err;
        // try next endpoint
      }
    }
    // If all fail, rethrow the last error so callers can see an issue
    if (lastError) throw lastError;
    return [];
  },

  updateCoupon: async (id: string, payload: Partial<{
    code: string; discountPercentage: number; maxUses: number; validFrom: string; validUntil: string;
  }>): Promise<AdminCoupon> => {
    return apiFetch(`/subscription/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteCoupon: async (id: string): Promise<{ success: boolean }> => {
    return apiFetch(`/subscription/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  // Delete a user (admin)
  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    return apiFetch(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Lawyers Management API (Admin)
export const lawyerAPI = {
  // List all lawyers
  list: async (): Promise<Lawyer[]> => {
    return apiFetch('/lawyers');
  },

  // Create a new lawyer
  create: async (payload: { name: string; phone: string; email: string; address: string }): Promise<Lawyer> => {
    return apiFetch('/admin/lawyers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Update lawyer
  update: async (id: string, payload: Partial<{ name: string; phone: string; email: string; address: string }>): Promise<Lawyer> => {
    return apiFetch(`/admin/lawyers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Delete lawyer
  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiFetch(`/admin/lawyers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Utility functions
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('jwt');
};

export const getToken = (): string | null => {
  return localStorage.getItem('jwt');
}; 
