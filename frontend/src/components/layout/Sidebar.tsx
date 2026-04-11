'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { clearAuthSession } from '@/lib/auth';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    QrCode,
    ShieldCheck,
    GraduationCap,
    Briefcase,
    Layers,
    Menu
} from 'lucide-react';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { searchQuery, isSidebarCollapsed, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

    const getMenuItems = () => {
        const baseItems = [
            { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        ];

        switch (user?.role) {
            case 'STUDENT':
                return [
                    ...baseItems,
                    { name: 'Scan Attendance', icon: QrCode, href: '/dashboard/attendance' },
                    { name: 'My History', icon: Calendar, href: '/dashboard/history' },
                    { name: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
                ];
            case 'TEACHER':
                return [
                    ...baseItems,
                    { name: 'Generate QR', icon: QrCode, href: '/dashboard/qr' },
                    { name: 'Sections', icon: Layers, href: '/dashboard/sections' },
                    { name: 'Attendance List', icon: UserCheck, href: '/dashboard/attendance' },
                    { name: 'Students', icon: Users, href: '/dashboard/users' },
                    { name: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
                ];
            case 'HR':
                return [
                    ...baseItems,
                    { name: 'Staff Management', icon: Users, href: '/dashboard/users' },
                    { name: 'Leave Requests', icon: Calendar, href: '/hr/leave' },
                    { name: 'Payroll', icon: Briefcase, href: '/hr/payroll' },
                ];
            case 'ADMIN':
                return [
                    ...baseItems,
                    { name: 'Institutions', icon: ShieldCheck, href: '/dashboard/institutions' },
                    { name: 'Sections', icon: Layers, href: '/dashboard/sections' },
                    { name: 'User Management', icon: Users, href: '/dashboard/users' },
                    { name: 'System Logs', icon: Settings, href: '/admin/logs' },
                ];
            default:
                return baseItems;
        }
    };

    const menuItems = getMenuItems();

    return (
        <aside className={cn(
            "h-screen bg-black lg:bg-white/10 backdrop-blur-2xl border-r border-white/20 flex flex-col fixed inset-y-0 left-0 lg:sticky top-0 transition-all duration-300 ease-in-out z-[60] overflow-hidden",
            isSidebarCollapsed ? "lg:w-28" : "lg:w-64",
            isMobileMenuOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Header - Fixed Height and Absolute Positioning for Sync */}
            <div className="h-24 flex items-center relative w-full">
                <Link href="/" className="absolute left-4 flex items-center gap-3 group cursor-pointer transition-opacity hover:opacity-80">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-[750ms]">
                        <img 
                            src="/auratten-logos/favicon.png" 
                            alt="Auratten" 
                            style={{ width: '28px', height: '28px', objectFit: 'contain' }} 
                        />
                    </div>
                    {/* Text removed as it is now part of logo-main.png */}
                </Link>
                <button 
                    onClick={() => {
                        if (isMobileMenuOpen) {
                            setMobileMenuOpen(false);
                        } else {
                            toggleSidebar();
                        }
                    }}
                    className={cn(
                        "absolute right-4 p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0",
                        isMobileMenuOpen ? "block" : "hidden lg:block"
                    )}
                    title={isSidebarCollapsed ? "Expand" : "Collapse"}
                >
                    <Menu size={22} />
                </button>
            </div>

            <nav className="flex-1 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setMobileMenuOpen(false);
                                }
                            }}
                            className={cn(
                                "flex items-center gap-5 px-4 py-3 transition-all duration-300 group text-sm font-medium whitespace-nowrap overflow-hidden",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                            title={isSidebarCollapsed ? item.name : ""}
                        >
                            <item.icon className={cn("h-6 w-6 flex-shrink-0", isActive ? "text-white" : "text-muted-foreground group-hover:text-accent-foreground")} />
                            <span className={cn(
                                "transition-all duration-[750ms] overflow-hidden",
                                isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => {
                        clearAuthSession();
                        useAuthStore.getState().logout();
                        router.replace('/login');
                    }}
                    className="flex items-center gap-5 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-[750ms] text-sm font-medium whitespace-nowrap overflow-hidden"
                    title={isSidebarCollapsed ? "Logout" : ""}
                >
                    <LogOut size={22} className="flex-shrink-0" />
                    <span className={cn(
                        "transition-all duration-[750ms] overflow-hidden",
                        isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
}
