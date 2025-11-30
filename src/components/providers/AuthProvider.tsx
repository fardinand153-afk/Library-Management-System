"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';

type User = {
    id: string;
    email: string;
    name: string;
    role: string;
} | null;

type AuthContextType = {
    user: User;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial user
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setLoading(false);

        // Listen for changes
        const unsubscribe = onAuthStateChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
