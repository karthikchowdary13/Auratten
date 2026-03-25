import Cookies from 'js-cookie';
import { AuthUser } from './api';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'auratten_user';

export function saveAuthSession(
    accessToken: string,
    refreshToken: string,
    user: AuthUser,
): void {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1, path: '/', sameSite: 'lax' });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, path: '/', sameSite: 'lax' });
    Cookies.set('userRole', user.role, { expires: 1, path: '/', sameSite: 'lax' });
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function saveUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken(): string | undefined {
    return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function clearAuthSession(): void {
    const options = { path: '/' };
    Cookies.remove(ACCESS_TOKEN_KEY, options);
    Cookies.remove(REFRESH_TOKEN_KEY, options);
    Cookies.remove('userRole', options);
    
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auratten-auth');
    }
}

export function isAuthenticated(): boolean {
    return !!Cookies.get(ACCESS_TOKEN_KEY);
}
