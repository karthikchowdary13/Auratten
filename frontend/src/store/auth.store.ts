import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN' | 'HR';
    institutionId: string | null;
    avatar?: string | null;
    mobileNumber?: string | null;
    updatedAt: string;
    createdAt: string;
    institution?: {
        id: string;
        name: string;
        logo?: string;
    };
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    setHydrated: () => void;
}

const STORAGE_KEY = 'auratten-auth';
const LEGACY_USER_KEY = 'auratten_user';

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isHydrated: false,
            setAuth: (user, accessToken, refreshToken) => {
                // Sync with cookies for middleware/SSR 
                Cookies.set('accessToken', accessToken, { expires: 1, path: '/' });
                Cookies.set('refreshToken', refreshToken, { expires: 7, path: '/' });
                Cookies.set('userRole', user.role, { expires: 1, path: '/' });
                
                // Sync with legacy key
                localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                set({ user, accessToken, refreshToken, isAuthenticated: true });
            },
            logout: () => {
                Cookies.remove('accessToken', { path: '/' });
                Cookies.remove('refreshToken', { path: '/' });
                Cookies.remove('userRole', { path: '/' });
                localStorage.removeItem(LEGACY_USER_KEY);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },
            updateUser: (userData) =>
                set((state) => {
                    const newUser = state.user ? { ...state.user, ...userData } : null;
                    if (newUser) localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(newUser));
                    return { user: newUser };
                }),
            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: STORAGE_KEY,
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);
