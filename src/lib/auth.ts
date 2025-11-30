import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simple registration - calls server API
export async function signUp(email: string, password: string, name: string, role: 'STUDENT' | 'LIBRARIAN' = 'STUDENT') {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }

    // Store user in localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data.user;
}

// Simple login - calls server API
export async function signIn(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    // Store user in localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data.user;
}

// Simple logout
export async function signOut() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
    }
}

// Get current user from localStorage
export function getCurrentUser() {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

// Get session (for compatibility)
export function getSession() {
    const user = getCurrentUser();
    return {
        data: {
            session: user ? { user } : null
        }
    };
}

// Check if user is librarian
export function isLibrarian() {
    const user = getCurrentUser();
    return user?.role === 'LIBRARIAN';
}

// Listen for auth state changes (simplified)
export function onAuthStateChange(callback: (user: any) => void) {
    // Check immediately
    callback(getCurrentUser());

    // Set up interval to check for changes
    const interval = setInterval(() => {
        callback(getCurrentUser());
    }, 1000);

    return () => clearInterval(interval);
}
