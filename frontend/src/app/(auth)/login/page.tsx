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
            const response = await authApi.login({ 
                email: email.toLowerCase().trim(), 
                password 
            });
            
            if (response.error) {
                setError(response.error);
                setLoading(false);
                return;
            }

            const { user, accessToken, refreshToken } = response.data;
            saveAuthSession(accessToken, refreshToken, user);
            setAuth(user, accessToken, refreshToken);

            const dashboardMap: Record<string, string> = {
                STUDENT: '/dashboard/attendance',
                TEACHER: '/dashboard',
                ADMIN: '/admin',
                SUPER_ADMIN: '/admin',
                INSTITUTION_ADMIN: '/admin',
            };

            router.push(dashboardMap[user.role] || '/dashboard');
        } catch (err: any) {
            setError('Authentication failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-[#0a0a0c] relative overflow-hidden">
             <style jsx global>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 50px #16161a inset !important;
                    -webkit-text-fill-color: white !important;
                    caret-color: white !important;
                }
            `}</style>

            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-xl border border-white/10 bg-[#16161a]/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="space-y-6 text-center mb-10">
                    <Link href="/" className="inline-flex group cursor-pointer transition-all hover:scale-105 active:scale-95">
                        <div className="p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-xl shadow-primary/10 mb-2 group-hover:shadow-primary/20 group-hover:border-primary/40 transition-all">
                            <img 
                                src="/auratten-logos/logo-main.png" 
                                alt="Auratten Logo" 
                                className="w-16 h-16 object-contain"
                            />
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-2 leading-tight">Welcome back</h1>
                        <p className="text-white/40 font-medium">Enter your credentials to access your account</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/50 ml-1 uppercase tracking-widest">Institution Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@institution.com"
                                className="w-full pl-12 pr-4 h-14 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 transition-all outline-none text-white font-medium"
                                type="email"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/50 ml-1 uppercase tracking-widest">Secure Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                type="password"
                                className="w-full pl-12 pr-4 h-14 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 transition-all outline-none text-white font-medium"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative group overflow-hidden"
                            disabled={loading}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            {loading ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>

                    <p className="text-center text-sm text-white/30 pt-4">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-primary hover:text-primary/80 font-bold transition-all ml-1">
                            Sign up for free
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
