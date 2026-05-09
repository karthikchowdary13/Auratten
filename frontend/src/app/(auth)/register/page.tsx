'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { saveAuthSession } from '@/lib/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { QrCode, Mail, Lock, User, Shield, Loader2, Phone, CheckCircle2, Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import styles from './register.module.css';

const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'];

const DASHBOARD_MAP: Record<string, string> = {
    STUDENT: '/dashboard/attendance',
    TEACHER: '/dashboard',
    ADMIN: '/dashboard',
};

export default function RegisterPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { showToast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        password: '',
        role: 'STUDENT'
    });
    
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRoleSelect = (role: string) => {
        setFormData(prev => ({ ...prev, role }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const regResponse = await authApi.register({
                name: formData.name,
                email: formData.email.toLowerCase().trim(),
                password: formData.password,
                role: formData.role,
                mobileNumber: formData.mobileNumber
            });

            if (regResponse.error) {
                setError(regResponse.error);
                setLoading(false);
                return;
            }

            const loginResponse = await authApi.login({
                email: formData.email.toLowerCase().trim(),
                password: formData.password
            });

            if (loginResponse.error) {
                showToast('info', 'Account Created', 'Please sign in with your new credentials');
                router.push('/login?registered=true');
                return;
            }

            const { user, accessToken, refreshToken } = loginResponse.data;
            saveAuthSession(accessToken, refreshToken, user);
            setAuth(user, accessToken, refreshToken);

            showToast('success', 'Welcome!', 'Your account has been created successfully');
            router.push(DASHBOARD_MAP[user.role] || '/dashboard');

        } catch (err: any) {
            setError('Connection failed. Please try again later.');
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
            
            {/* Ambient Background Glows - Subdued for professional look */}
            <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#13111C] via-[#0a0a0c] to-[#0a0a0c] pointer-events-none -z-10" />

            <div className="w-full max-w-[1200px] grid lg:grid-cols-2 bg-[#0C0C0E]/80 backdrop-blur-3xl border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* LEFT PANEL - Premium Branding (Hidden on Mobile) */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-[#0E0E11]/50 border-r border-white/[0.05] relative overflow-hidden">
                    {/* Subtle noise texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-3 mb-16">
                            <img 
                                src="/auratten-logos/logo-main.png" 
                                alt="Auratten Logo" 
                                className="h-8 object-contain"
                            />
                            <span className="text-white font-bold text-xl tracking-tight">Auratten</span>
                        </div>
                        
                        <h2 className="text-[2.75rem] font-bold text-white mb-6 leading-[1.1] tracking-tighter">
                            Smart Attendance,<br/>
                            <span className="text-white/40">
                                Powered by QR.
                            </span>
                        </h2>
                        
                        <p className="text-white/50 text-lg leading-relaxed max-w-md font-normal">
                            The professional standard for educational institutions. Seamless, secure, and blazingly fast attendance tracking.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-white/[0.02] transition-all duration-300 cursor-default group">
                            <div className="w-10 h-10 bg-white/[0.05] border border-white/[0.05] rounded-xl flex items-center justify-center group-hover:bg-white/[0.1] group-hover:scale-110 group-hover:border-white/[0.1] transition-all duration-300">
                                <Shield className="text-white/80 group-hover:text-white h-5 w-5 transition-colors duration-300" />
                            </div>
                            <div>
                                <h4 className="text-white/90 font-semibold text-sm group-hover:text-white transition-colors duration-300">Enterprise Grade Security</h4>
                                <p className="text-white/40 text-xs mt-0.5 group-hover:text-white/60 transition-colors duration-300">End-to-end encrypted sessions</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-white/[0.02] transition-all duration-300 cursor-default group">
                            <div className="w-10 h-10 bg-white/[0.05] border border-white/[0.05] rounded-xl flex items-center justify-center group-hover:bg-white/[0.1] group-hover:scale-110 group-hover:border-white/[0.1] transition-all duration-300">
                                <CheckCircle2 className="text-white/80 group-hover:text-white h-5 w-5 transition-colors duration-300" />
                            </div>
                            <div>
                                <h4 className="text-white/90 font-semibold text-sm group-hover:text-white transition-colors duration-300">Real-time Analytics</h4>
                                <p className="text-white/40 text-xs mt-0.5 group-hover:text-white/60 transition-colors duration-300">Instant insights and reporting</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - Form */}
                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-transparent">
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <img 
                            src="/auratten-logos/logo-main.png" 
                            alt="Auratten Logo" 
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-white font-bold text-xl tracking-tight">Auratten</span>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Create an account</h1>
                        <p className="text-white/40 text-sm">Enter your details below to get started</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="w-1 h-1 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-white/60">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white/70 transition-colors" />
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 h-11 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-xl focus:border-white/20 focus:bg-white/[0.05] transition-all outline-none text-white text-sm placeholder:text-white/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-white/60">Mobile (Optional)</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white/70 transition-colors" />
                                    <input
                                        name="mobileNumber"
                                        type="tel"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full pl-10 pr-4 h-11 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-xl focus:border-white/20 focus:bg-white/[0.05] transition-all outline-none text-white text-sm placeholder:text-white/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-white/60">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white/70 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@institution.com"
                                    className="w-full pl-10 pr-4 h-11 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-xl focus:border-white/20 focus:bg-white/[0.05] transition-all outline-none text-white text-sm placeholder:text-white/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-white/60">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white/70 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 h-11 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-xl focus:border-white/20 focus:bg-white/[0.05] transition-all outline-none text-white text-sm placeholder:text-white/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-white/60">Account Type</label>
                            <div className="grid grid-cols-3 gap-2 p-1 bg-white/[0.02] border border-white/[0.05] rounded-[14px]">
                                {['STUDENT', 'TEACHER', 'ADMIN'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => handleRoleSelect(r)}
                                        className={`py-2.5 rounded-[10px] text-[11px] font-semibold transition-all duration-200 ${
                                            formData.role === r 
                                                ? 'bg-white/10 text-white shadow-sm' 
                                                : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </button>
                        </div>

                        <p className="text-center text-[13px] text-white/40 pt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:text-primary/80 font-bold transition-all ml-1">
                                Sign in here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}