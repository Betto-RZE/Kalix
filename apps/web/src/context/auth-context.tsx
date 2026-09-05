'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchApi } from '@/lib/api';

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('kalix_token');
        const savedUser = localStorage.getItem('kalix_user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const res = await fetchApi<{ user: UserProfile; accessToken: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        setToken(res.accessToken);
        setUser(res.user);

        localStorage.setItem('kalix_token', res.accessToken);
        localStorage.setItem('kalix_user', JSON.stringify(res.user));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('kalix_token');
        localStorage.removeItem('kalix_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
    }
    return context;
}
