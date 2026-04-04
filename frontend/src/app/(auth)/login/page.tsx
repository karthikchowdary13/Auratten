'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { saveAuthSession } from '@/lib/auth';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authApi.login({ email, password });
            
            if (response.error) {
                setError(response.error);
                setLoading(false);
                return;
            }

            const { user, accessToken, refreshToken } = response.data;
            saveAuthSession(accessToken, refreshToken, user);
            setAuth(user, accessToken, refreshToken);

            const dashboardMap: Record<string, string> = {
                STUDENT: '/student/dashboard',
                TEACHER: '/teacher/dashboard',
                ADMIN: '/admin/dashboard',
            };

            router.push(dashboardMap[user.role] || '/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-black relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,99,255,0.05),transparent)] pointer-events-none" />

            <div className="w-full max-w-xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 relative z-10">
                <div className="space-y-6 text-center mb-10">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-3xl bg-primary/10 overflow-hidden">
                            <img 
                                src="/auratten-logos/logo-main.png" 
                                alt="Auratten Logo" 
                                style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
                            />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
                        <p className="text-white/50">Enter your credentials to access your account</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 ml-1">Institution Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@institution.com"
                                className="w-full pl-12 pr-4 h-14 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-white/10 transition-all outline-none text-white font-medium"
                                type="email"
                                required
                                disabled={loading}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin(e as any)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 ml-1">Secure Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                type="password"
                                className="w-full pl-12 pr-4 h-14 bg-white/5 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-white/10 transition-all outline-none text-white font-medium"
                                required
                                disabled={loading}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin(e as any)}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="button"
                            onClick={(e) => handleLogin(e as any)}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>

                    <p className="text-center text-sm text-white/40 pt-4">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-primary hover:text-primary/80 hover:underline font-bold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
