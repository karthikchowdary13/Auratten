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
    STUDENT: '/student/dashboard',
    TEACHER: '/teacher/dashboard',
    ADMIN: '/admin/dashboard',
};

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const { showToast } = useToast();
    const setAuth = useAuthStore((state) => state.setAuth);

    const onRegisterClick = async () => {
        console.log('onRegisterClick started');
        setError(null);
        setLoading(true);

        try {
            console.log('Sending registration request...');
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role, mobileNumber })
            });

            const regData = await response.json();
            console.log('Registration response:', regData);

            if (!response.ok) {
                throw new Error(regData.detail || regData.message || 'Registration failed');
            }

            console.log('Attempting automatic login...');
            const loginResponse = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const loginData = await loginResponse.json();
            console.log('Login response:', loginData);

            if (!loginResponse.ok) {
                console.warn('Login failed, redirecting to login page');
                router.push('/login?registered=true');
                return;
            }

            // Sync Auth State
            const { user: authUser, accessToken, refreshToken } = loginData;
            saveAuthSession(accessToken, refreshToken, authUser);
            setAuth(authUser, accessToken, refreshToken);

            console.log('Redirecting to dashboard for role:', authUser.role);
            showToast('success', 'Success', 'Account created successfully!');
            router.push(DASHBOARD_MAP[authUser.role] || '/dashboard');

        } catch (err: any) {
            console.error('Registration/Login error:', err);
            setError(err.message || 'An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-[#0a0a0c] text-white">
            <div className="w-full max-w-xl bg-[#16161a] border border-white/10 rounded-2xl p-10 shadow-2xl relative z-[1000]">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-2xl bg-primary/10 overflow-hidden mb-6">
                        <img 
                            src="/auratten-logos/logo-main.png" 
                            alt="Auratten Logo" 
                            style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
                        />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Create account</h1>
                    <p className="text-gray-400">Join Auratten and start tracking attendance</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                        >
                            {ROLES.map((r) => (
                                <option key={r} value={r} className="bg-[#16161a] text-white">{r}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={onRegisterClick}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create account'
                        )}
                    </button>

                    <p className="text-center text-gray-500">
                        Already have an account?{' '}
                        <a href="/login" className="text-indigo-400 hover:underline">Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
