import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const loginTime = localStorage.getItem('login_timestamp');
    const cachedUser = localStorage.getItem('user');
    if (loginTime && cachedUser && (Date.now() - Number(loginTime)) < 24 * 60 * 60 * 1000) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token') || localStorage.getItem('jwt'));
  const [csrfToken, setCsrfToken] = useState(localStorage.getItem('csrfToken'));

  // Global Axios Interceptor for Silent JWT Refresh
  useEffect(() => {
    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, newToken = null) => {
      failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(newToken);
        }
      });
      failedQueue = [];
    };

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const errorMsg = error.response?.data?.message || '';

        const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
          originalRequest?.url?.includes('/auth/signup') ||
          originalRequest?.url?.includes('/auth/refresh');

        const isTokenExpired =
          (status === 401 || status === 403) &&
          (errorMsg === 'Invalid token' ||
            errorMsg.includes('Invalid token') ||
            errorMsg.includes('Token expired') ||
            errorMsg.includes('jwt expired'));

        if (isTokenExpired && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            return Promise.reject(error);
          }

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((newToken) => {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axios(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          isRefreshing = true;
          try {
            const refreshResp = await axios.post('/api/auth/refresh', { refreshToken });
            const newToken = refreshResp.data?.accessToken;
            if (newToken) {
              setToken(newToken);
              localStorage.setItem('token', newToken);
              localStorage.setItem('jwt', newToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              processQueue(null, newToken);
              return axios(originalRequest);
            }
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Set up axios defaults and check user on mount
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (csrfToken) {
        axios.defaults.headers.common['x-csrf-token'] = csrfToken;
      }
      checkUser();
    } else {
      setLoading(false);
    }
  }, [token, csrfToken]);

  const checkUser = async () => {
    try {
      const response = await axios.get('/api/auth/user');

      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('login_timestamp', Date.now().toString());
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);

      // Attempt silent refresh before logging the user out
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResp = await axios.post('/api/auth/refresh', { refreshToken });
          const newToken = refreshResp.data?.accessToken;
          if (newToken) {
            setToken(newToken);
            localStorage.setItem('token', newToken);
            localStorage.setItem('jwt', newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            const retryResp = await axios.get('/api/auth/user', {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            const userData = retryResp.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('login_timestamp', Date.now().toString());
            setLoading(false);
            return;
          }
        } catch (refreshErr) {
          console.error('Auto token refresh failed during checkUser:', refreshErr);
        }
      }

      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('login_timestamp');
      setLoading(false);
    }
  };

  const updateUser = (newUserData) => {
    const updatedUser = {
      ...user,
      ...newUserData
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const setSession = ({ token, refreshToken, csrfToken, user }) => {
    setToken(token);
    setUser(user);
    setCsrfToken(csrfToken || null);
    localStorage.setItem('token', token);
    localStorage.setItem('jwt', token);
    localStorage.setItem('login_timestamp', Date.now().toString());
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (csrfToken) localStorage.setItem('csrfToken', csrfToken);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (csrfToken) axios.defaults.headers.common['x-csrf-token'] = csrfToken;
  };

  const login = async (emailOrToken, password) => {
    try {
      let token, userData;
      
      if (password === undefined) {
        // Direct token login
        token = emailOrToken;
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('jwt', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await checkUser(); // This will set the user data
      } else {
        // Email/password login
        const response = await axios.post('/api/auth/login', { 
          email: emailOrToken, 
          password 
        });
        if (response.data.requiresTwoFactor) {
          return { success: false, requiresTwoFactor: true, email: response.data.email };
        }
        token = response.data.token;
        userData = response.data.user;
        const refreshToken = response.data.refreshToken;
        const csrfToken = response.data.csrfToken;
        setToken(token);
        setUser(userData);
        setCsrfToken(csrfToken || null);
        localStorage.setItem('token', token);
        localStorage.setItem('jwt', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (csrfToken) localStorage.setItem('csrfToken', csrfToken);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        if (csrfToken) axios.defaults.headers.common['x-csrf-token'] = csrfToken;
      }
      
      return { success: true, isAdmin: userData?.isAdmin || false };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('/api/auth/signup', userData);
      const { token, user, refreshToken, csrfToken } = response.data;
      setToken(token);
      setUser(user);
      setCsrfToken(csrfToken || null);
      localStorage.setItem('token', token);
      localStorage.setItem('jwt', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (csrfToken) localStorage.setItem('csrfToken', csrfToken);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (csrfToken) axios.defaults.headers.common['x-csrf-token'] = csrfToken;
      return { success: true, isAdmin: user.isAdmin };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setCsrfToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('csrfToken');
      localStorage.removeItem('user');
      localStorage.removeItem('login_timestamp');
      delete axios.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['x-csrf-token'];
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    setSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 