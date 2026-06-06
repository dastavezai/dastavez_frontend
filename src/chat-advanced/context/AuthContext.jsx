import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [csrfToken, setCsrfToken] = useState(localStorage.getItem('csrfToken'));

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
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('csrfToken');
      localStorage.removeItem('user');
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