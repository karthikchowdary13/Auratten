'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    QrCode,
    Users,
    ClipboardList,
    BarChart2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import styles from './BottomNav.module.css';

const getNavItems = (role: string) => [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/qr', label: 'QR', icon: QrCode, roles: ['ADMIN', 'TEACHER'] },
    { href: '/dashboard/attendance', label: 'Scan', icon: QrCode, roles: ['STUDENT'] },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart2 },
    { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['ADMIN', 'TEACHER', 'HR'] },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { user, isHydrated } = useAuthStore();

    if (!isHydrated || !user) return null;

    const filteredItems = getNavItems(user.role).filter(item =>
        !item.roles || item.roles.includes(user.role)
    );

    return (
        <nav className={styles.bottomNav}>
            {filteredItems.map(({ href, label, icon: Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className={[styles.navItem, pathname === href ? styles.active : ''].join(' ')}
                >
                    <Icon size={20} />
                    <span>{label}</span>
                </Link>
            ))}
        </nav>
    );
}
