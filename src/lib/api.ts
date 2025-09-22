// API Configuration - Connected to Cloud Run Backend
const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://api.dastavezai.org/api';

// Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  isVerified: boolean;
  isAdmin: boolean;
  subscriptionStatus: 'free' | 'premium';
  remainingMessages?: number;
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

// Helper function for authenticated API requests
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('jwt');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
  
  const response = await fetch(`${API_BASE_URL}${url}`, { 
    ...options, 
    headers 
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
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
    return apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('jwt');
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

  // Clear chat history
  clearHistory: async () => {
    return apiFetch('/chat/clear', {
      method: 'DELETE'
    });
  }
};

// File Management API 
export const fileAPI = {
  // Upload file
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
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

  // Upload profile image
  uploadImage: async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${API_BASE_URL}/profile/profile-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};

// Contact API
export const contactAPI = {
  // Send contact email
  sendContact: async (data: {
    name: string;
    email: string;
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
