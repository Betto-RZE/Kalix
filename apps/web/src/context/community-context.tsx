'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { fetchApi } from '@/lib/api';

export interface CommunityInfo {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
}

export interface UserMembership {
    id: string;
    communityId: string;
    role: {
        id: string;
        name: string;
    };
    community: CommunityInfo;
}

interface CommunityContextType {
    memberships: UserMembership[];
    activeMembership: UserMembership | null;
    setActiveCommunityId: (communityId: string) => void;
    isLoading: boolean;
    refreshMemberships: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
    const { user, token } = useAuth();
    const [memberships, setMemberships] = useState<UserMembership[]>([]);
    const [activeMembership, setActiveMembership] = useState<UserMembership | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshMemberships = async () => {
        if (!token || !user) {
            setMemberships([]);
            setActiveMembership(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await fetchApi<UserMembership[]>('/memberships/me', {}, token);
            setMemberships(data);

            const savedCommunityId = localStorage.getItem('kalix_active_community_id');
            const found = data.find((m) => m.communityId === savedCommunityId) || data[0] || null;

            setActiveMembership(found);
            if (found) {
                localStorage.setItem('kalix_active_community_id', found.communityId);
            }
        } catch (err) {
            console.error('Error al cargar membresías:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshMemberships();
    }, [token, user]);

    const setActiveCommunityId = (communityId: string) => {
        const found = memberships.find((m) => m.communityId === communityId) || null;
        setActiveMembership(found);
        if (found) {
            localStorage.setItem('kalix_active_community_id', found.communityId);
        }
    };

    return (
        <CommunityContext.Provider
            value={{
                memberships,
                activeMembership,
                setActiveCommunityId,
                isLoading,
                refreshMemberships,
            }}
        >
            {children}
        </CommunityContext.Provider>
    );
}

export function useCommunity() {
    const context = useContext(CommunityContext);
    if (!context) {
        throw new Error('useCommunity debe utilizarse dentro de un CommunityProvider');
    }
    return context;
}
