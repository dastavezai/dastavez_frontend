
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(() => {
        const stored = localStorage.getItem('jwt');
        return (stored && stored !== 'undefined' && stored !== 'null') ? stored : null;
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            checkUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const checkUser = async () => {
        try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
            setLoading(false);
        } catch (error) {
            console.error('Error checking user:', error);
            setUser(null);
            setToken(null);
            localStorage.removeItem('jwt');
            setLoading(false);
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
        setToken(null);
        navigate('/auth');
    };

    const value = {
        user,
        token,
        loading,
        logout,
        checkUser
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
