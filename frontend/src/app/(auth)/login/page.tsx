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
        <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-8 relative bg-gray-50 dark:bg-[#060608] overflow-hidden transition-colors duration-500">
             <style jsx global>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 50px transparent inset !important;
                    -webkit-text-fill-color: currentColor !important;
                    caret-color: currentColor !important;
                }
            `}</style>

            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-[#13111C] dark:via-[#0a0a0c] dark:to-[#0a0a0c] pointer-events-none -z-10 transition-colors duration-500" />

            <div className="w-full max-w-[1200px] grid lg:grid-cols-2 bg-white dark:bg-[#0C0C0E]/80 backdrop-blur-3xl border border-zinc-200/60 dark:border-white/[0.08] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors duration-500">
                
                {/* LEFT PANEL - Premium Branding (Hidden on Mobile) */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-zinc-50/50 dark:bg-[#0E0E11]/50 border-r border-zinc-200/60 dark:border-white/[0.05] relative overflow-hidden transition-colors duration-500">
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-black dark:bg-white"></div>
                    
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3 mb-16 hover:opacity-80 transition-opacity">
                            <img 
                                src="/auratten-logos/logo-main.png" 
                                alt="Auratten Logo" 
                                className="h-8 object-contain"
                            />
                            <span className="text-zinc-900 dark:text-white font-bold text-xl tracking-tight transition-colors duration-500">Auratten</span>
                        </Link>
                        
                        <h2 className="text-[2.75rem] font-bold text-zinc-900 dark:text-white mb-6 leading-[1.1] tracking-tighter transition-colors duration-500">
                            Welcome back to<br/>
                            <span className="text-zinc-500 dark:text-white/40 transition-colors duration-500">
                                the future.
                            </span>
                        </h2>
                        
                        <p className="text-zinc-600 dark:text-white/50 text-lg leading-relaxed max-w-md font-normal transition-colors duration-500">
                            Log in to access your dashboard, monitor attendance, and manage your institution with unparalleled ease.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-center gap-4 bg-white/60 dark:bg-white/[0.02] border border-zinc-200/60 dark:border-white/[0.05] p-4 rounded-2xl hover:bg-white dark:hover:bg-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.1] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-200/40 dark:hover:shadow-2xl dark:hover:shadow-white/[0.02] transition-all duration-300 cursor-default group backdrop-blur-sm">
                            <div className="w-10 h-10 bg-white dark:bg-white/[0.05] border border-zinc-100 dark:border-white/[0.05] rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:border-zinc-200 dark:group-hover:border-white/[0.1] transition-all duration-300 shadow-sm">
                                <Shield className="text-zinc-500 dark:text-white/80 group-hover:text-zinc-900 dark:group-hover:text-white h-5 w-5 transition-colors duration-300" />
                            </div>
                            <div>
                                <h4 className="text-zinc-900 dark:text-white/90 font-semibold text-sm group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-300">Secure Session</h4>
                                <p className="text-zinc-500 dark:text-white/40 text-xs mt-0.5 group-hover:text-zinc-700 dark:group-hover:text-white/60 transition-colors duration-300">Your data is fully encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - Form */}
                <div className="p-6 sm:p-10 lg:p-16 flex flex-col justify-center bg-transparent w-full max-w-md lg:max-w-none mx-auto">
                    <div className="lg:hidden flex items-center gap-3 mb-8 sm:mb-10">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <img 
                                src="/auratten-logos/logo-main.png" 
                                alt="Auratten Logo" 
                                className="w-8 h-8 object-contain"
                            />
                            <span className="text-gray-900 dark:text-white font-bold text-xl tracking-tight transition-colors duration-500">Auratten</span>
                        </Link>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2 transition-colors duration-500">Welcome back</h1>
                        <p className="text-zinc-500 dark:text-white/40 text-sm transition-colors duration-500">Enter your credentials to access your account</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 transition-colors duration-500">
                            <div className="w-1 h-1 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-zinc-700 dark:text-white/70 transition-colors duration-500 uppercase tracking-wider">Institution Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 dark:text-white/30 group-focus-within:text-zinc-900 dark:group-focus-within:text-white/90 transition-colors" />
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@institution.com"
                                    className="w-full pl-11 pr-4 h-12 bg-white dark:bg-white/[0.03] hover:border-zinc-300 dark:hover:border-white/[0.15] border border-zinc-200 dark:border-white/[0.08] rounded-xl focus:border-zinc-900 dark:focus:border-white/30 focus:bg-white dark:focus:bg-white/[0.05] focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all outline-none text-zinc-900 dark:text-white text-[15px] placeholder:text-zinc-400 dark:placeholder:text-white/20 shadow-sm"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold text-zinc-700 dark:text-white/70 transition-colors duration-500 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 dark:text-white/30 group-focus-within:text-zinc-900 dark:group-focus-within:text-white/90 transition-colors" />
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    type="password"
                                    autoComplete="current-password"
                                    className="w-full pl-11 pr-4 h-12 bg-white dark:bg-white/[0.03] hover:border-zinc-300 dark:hover:border-white/[0.15] border border-zinc-200 dark:border-white/[0.08] rounded-xl focus:border-zinc-900 dark:focus:border-white/30 focus:bg-white dark:focus:bg-white/[0.05] focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition-all outline-none text-zinc-900 dark:text-white text-[15px] placeholder:text-zinc-400 dark:placeholder:text-white/20 shadow-sm"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-white/90 rounded-xl text-[15px] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 smooth-loader" />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>

                        <p className="text-center text-[13px] text-gray-500 dark:text-white/40 pt-4 transition-colors duration-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-white/80 font-bold transition-all ml-1 underline decoration-zinc-900/20 hover:decoration-zinc-900/50 dark:decoration-white/20 dark:hover:decoration-white/50 underline-offset-4">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
