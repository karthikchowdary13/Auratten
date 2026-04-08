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
            
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-xl border border-white/10 bg-[#16161a]/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-xl shadow-primary/10 mb-8">
                        <img 
                            src="/auratten-logos/logo-main.png" 
                            alt="Auratten Logo" 
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2 leading-tight">Join Auratten</h1>
                    <p className="text-white/40 font-medium">Experience the next generation of attendance tracking</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 ml-1 uppercase tracking-widest">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full pl-12 pr-4 h-14 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 transition-all outline-none text-white font-medium placehoder:text-white/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 ml-1 uppercase tracking-widest">Mobile (Optional)</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    name="mobileNumber"
                                    type="tel"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    placeholder="+91 00000 00000"
                                    className="w-full pl-12 pr-4 h-14 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 transition-all outline-none text-white font-medium placehoder:text-white/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/50 ml-1 uppercase tracking-widest">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@institution.com"
                                className="w-full pl-12 pr-4 h-14 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 transition-all outline-none text-white font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-white/50 ml-1 uppercase tracking-widest">Secure Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 h-14 bg-black/40 border border-white/10 rounded-2xl focus:border-primary/50 focus:bg-primary/5 transition-all outline-none text-white font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-white/50 ml-1 uppercase tracking-widest">Identify as</label>
                        <div className="grid grid-cols-3 gap-3 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
                            {['STUDENT', 'TEACHER', 'ADMIN'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => handleRoleSelect(r)}
                                    className={`py-3.5 rounded-xl text-xs font-bold tracking-tight transition-all duration-300 ${
                                        formData.role === r 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 relative group overflow-hidden"
                            disabled={loading}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            {loading ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create account</span>
                                    <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-sm text-white/30 pt-4">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary/80 font-bold transition-all ml-1">
                            Sign in to dashboard
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}