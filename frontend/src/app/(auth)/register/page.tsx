'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { QrCode, Mail, Lock, User, Shield, Loader2, Phone, CheckCircle2, Send } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import styles from './register.module.css';

const ROLES = ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'HR'];

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    
    // OTP States
    const [emailOtp, setEmailOtp] = useState('');
    const [mobileOtp, setMobileOtp] = useState('');
    const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
    const [isMobileOtpSent, setIsMobileOtpSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [sendingOtp, setSendingOtp] = useState<string | null>(null);
    const [verifyingOtp, setVerifyingOtp] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const { showToast } = useToast();

    async function handleSendOtp(identifier: string, type: 'EMAIL' | 'MOBILE') {
        if (!identifier) {
            showToast('error', 'Required Field', `Please enter your ${type.toLowerCase()}`);
            return;
        }

        setSendingOtp(type);
        const { error: apiError } = await authApi.sendOtp(identifier, type);
        setSendingOtp(null);

        if (apiError) {
            showToast('error', 'OTP Error', apiError);
            return;
        }

        if (type === 'EMAIL') setIsEmailOtpSent(true);
        else setIsMobileOtpSent(true);
        showToast('success', 'OTP Sent', `Verification code sent to your ${type.toLowerCase()}`);
    }

    async function handleVerifyOtp(identifier: string, code: string, type: 'EMAIL' | 'MOBILE') {
        if (!code) {
            showToast('error', 'Required', 'Please enter the OTP');
            return;
        }

        setVerifyingOtp(type);
        const { data, error: apiError } = await authApi.verifyOtp(identifier, code, type);
        setVerifyingOtp(null);

        if (apiError || !data?.success) {
            showToast('error', 'Verification Failed', apiError || 'Invalid OTP');
            return;
        }

        if (type === 'EMAIL') setIsEmailVerified(true);
        else setIsMobileVerified(true);
        showToast('success', 'Verified', `${type === 'EMAIL' ? 'Email' : 'Mobile'} verified successfully!`);
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        
        if (!isEmailVerified || !isMobileVerified) {
            setError('Please verify both email and mobile number before registering');
            return;
        }

        setError(null);
        setLoading(true);

        const { error: apiError } = await authApi.register({ 
            name, 
            email, 
            password, 
            role, 
            mobileNumber,
            emailOtp,
            mobileOtp
        });

        if (apiError) {
            setError(apiError);
            setLoading(false);
            return;
        }

        router.push('/login?registered=true');
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,99,255,0.05),transparent)] pointer-events-none" />

            <Card className="w-full max-w-xl border-border/50 bg-card/50 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                <CardHeader className="space-y-6 text-center pt-10">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                            <QrCode size={40} />
                        </div>
                    </div>
                    <CardTitle className="text-4xl font-bold tracking-tight">Create account</CardTitle>
                    <CardDescription className="text-base">
                        Join Auratten and start tracking attendance
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="space-y-8 px-10">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="relative">
                                <User className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Full Name"
                                    className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Email Address"
                                        className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading || isEmailVerified}
                                    />
                                </div>
                                {!isEmailVerified ? (
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        className="h-12 border-primary/30 text-primary hover:bg-primary/5"
                                        onClick={() => handleSendOtp(email, 'EMAIL')}
                                        disabled={loading || sendingOtp === 'EMAIL'}
                                    >
                                        {sendingOtp === 'EMAIL' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get OTP'}
                                    </Button>
                                ) : (
                                    <div className="flex items-center px-4 h-12 rounded-md bg-green-500/10 text-green-500 border border-green-500/20 gap-2">
                                        <CheckCircle2 size={18} />
                                        <span className="font-semibold text-sm">Verified</span>
                                    </div>
                                )}
                            </div>
                            
                            {isEmailOtpSent && !isEmailVerified && (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                    <Input
                                        placeholder="Enter 6-digit OTP"
                                        className="h-12 bg-background/50 border-border/50 focus:border-primary/50 text-center tracking-[0.5em] font-bold"
                                        maxLength={6}
                                        value={emailOtp}
                                        onChange={(e) => setEmailOtp(e.target.value)}
                                        disabled={loading || verifyingOtp === 'EMAIL'}
                                    />
                                    <Button 
                                        type="button"
                                        className="h-12 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                                        onClick={() => handleVerifyOtp(email, emailOtp, 'EMAIL')}
                                        disabled={loading || verifyingOtp === 'EMAIL'}
                                    >
                                        {verifyingOtp === 'EMAIL' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Phone className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Mobile Number"
                                        className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                                        type="tel"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        required
                                        disabled={loading || isMobileVerified}
                                    />
                                </div>
                                {!isMobileVerified ? (
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        className="h-12 border-primary/30 text-primary hover:bg-primary/5"
                                        onClick={() => handleSendOtp(mobileNumber, 'MOBILE')}
                                        disabled={loading || sendingOtp === 'MOBILE'}
                                    >
                                        {sendingOtp === 'MOBILE' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get OTP'}
                                    </Button>
                                ) : (
                                    <div className="flex items-center px-4 h-12 rounded-md bg-green-500/10 text-green-500 border border-green-500/20 gap-2">
                                        <CheckCircle2 size={18} />
                                        <span className="font-semibold text-sm">Verified</span>
                                    </div>
                                )}
                            </div>
                            
                            {isMobileOtpSent && !isMobileVerified && (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                    <Input
                                        placeholder="Enter 6-digit OTP"
                                        className="h-12 bg-background/50 border-border/50 focus:border-primary/50 text-center tracking-[0.5em] font-bold"
                                        maxLength={6}
                                        value={mobileOtp}
                                        onChange={(e) => setMobileOtp(e.target.value)}
                                        disabled={loading || verifyingOtp === 'MOBILE'}
                                    />
                                    <Button 
                                        type="button"
                                        className="h-12 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                                        onClick={() => handleVerifyOtp(mobileNumber, mobileOtp, 'MOBILE')}
                                        disabled={loading || verifyingOtp === 'MOBILE'}
                                    >
                                        {verifyingOtp === 'MOBILE' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Shield className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="flex h-12 w-full rounded-md border border-border/50 bg-background/50 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all font-medium"
                                    disabled={loading}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r} className="bg-background text-foreground">{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-8 px-10 pb-12">
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                            disabled={loading || !isEmailVerified || !isMobileVerified}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    {!isEmailVerified || !isMobileVerified ? (
                                        'Complete verification to continue'
                                    ) : (
                                        'Create account'
                                    )}
                                </>
                            )}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
