import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { AppThemeProvider } from './context/ThemeContext';
import App from './App';
import './tailwind.css';


axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const csrfToken = localStorage.getItem('csrfToken');
if (csrfToken) {
  axios.defaults.headers.common['x-csrf-token'] = csrfToken;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>
); 