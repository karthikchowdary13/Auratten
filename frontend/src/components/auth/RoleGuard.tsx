'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, isHydrated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isHydrated) {
            if (!user) {
                router.replace('/login');
            } else if (!allowedRoles.includes(user.role)) {
                router.replace('/dashboard');
            }
        }
    }, [user, isHydrated, allowedRoles, router]);

    if (!isHydrated || !user || !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
