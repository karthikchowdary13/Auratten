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
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative">
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

            {/* Ambient Background Glows */}
            <div className="fixed top-1/4 -right-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed bottom-1/4 -left-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-[#09090b]/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* LEFT PANEL - Premium Branding (Hidden on Mobile) */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-primary/10 via-transparent to-transparent border-r border-white/5 relative overflow-hidden">
                    {/* Inner glows */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-50 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 shadow-xl mb-12 hover:bg-white/10 transition-colors">
                            <img 
                                src="/auratten-logos/logo-main.png" 
                                alt="Auratten Logo" 
                                className="h-8 object-contain drop-shadow-md"
                            />
                        </Link>
                        
                        <h2 className="text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                            Welcome back to<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                                the future.
                            </span>
                        </h2>
                        
                        <p className="text-white/50 text-lg leading-relaxed max-w-md font-medium">
                            Log in to access your dashboard, monitor attendance, and manage your institution with unparalleled ease.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-colors cursor-default group">
                            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Shield className="text-primary h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm tracking-wide">Secure Session</h4>
                                <p className="text-white/40 text-xs font-medium mt-0.5">Your data is fully encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - Form */}
                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#16161a]/40">
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/" className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-xl shadow-primary/10 transition-transform hover:scale-105 active:scale-95">
                            <img 
                                src="/auratten-logos/logo-main.png" 
                                alt="Auratten Logo" 
                                className="w-12 h-12 object-contain"
                            />
                        </Link>
                    </div>

                    <div className="text-center lg:text-left mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">Welcome back</h1>
                        <p className="text-white/40 font-medium">Enter your credentials to access your account</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="w-1 h-1 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/50 ml-1 uppercase tracking-widest">Institution Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@institution.com"
                                    className="w-full pl-12 pr-4 h-14 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-white font-medium placeholder:text-white/20"
                                    type="email"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/50 ml-1 uppercase tracking-widest">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    type="password"
                                    className="w-full pl-12 pr-4 h-14 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-white font-medium placeholder:text-white/20"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full h-14 sm:h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl text-base sm:text-lg font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative group overflow-hidden"
                                disabled={loading}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
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

                        <p className="text-center text-sm text-white/40 pt-6 border-t border-white/5">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-primary hover:text-primary/80 font-bold transition-all ml-1">
                                Sign up for free
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
