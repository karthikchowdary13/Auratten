'use client';

import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { 
    LayoutDashboard, 
    UserCheck, 
    Users, 
    Calendar, 
    BarChart3, 
    QrCode, 
    ShieldCheck, 
    Layers,
    Search,
    X,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export default function SearchOverlay() {
    const { searchQuery, setSearchQuery } = useUIStore();
    const user = useAuthStore((state) => state.user);
    const overlayRef = useRef<HTMLDivElement>(null);

    if (!searchQuery) return null;

    const getNavItems = () => {
        const baseItems = [
            { name: 'Dashboard', icon: LayoutDashboard, href: `/dashboard`, category: 'Navigation' },
        ];

        let results = [];
        switch (user?.role) {
            case 'STUDENT':
                results = [
                    ...baseItems,
                    { name: 'Scan Attendance', icon: QrCode, href: '/dashboard/attendance', category: 'Navigation' },
                    { name: 'History', icon: Calendar, href: '/dashboard/attendance', category: 'Navigation' },
                    { name: 'Reports', icon: BarChart3, href: '/dashboard/reports', category: 'Navigation' },
                ];
                break;
            case 'TEACHER':
                results = [
                    ...baseItems,
                    { name: 'Generate QR', icon: QrCode, href: '/dashboard/qr', category: 'Navigation' },
                    { name: 'Sections', icon: Layers, href: '/dashboard/sections', category: 'Navigation' },
                    { name: 'Attendance List', icon: UserCheck, href: '/dashboard/attendance', category: 'Navigation' },
                    { name: 'Students', icon: Users, href: '/dashboard/users', category: 'Navigation' },
                    { name: 'Reports', icon: BarChart3, href: '/dashboard/reports', category: 'Navigation' },
                ];
                break;
            default:
                results = baseItems;
        }
        return results.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const navMatches = getNavItems();

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-black/40 animate-in fade-in duration-200"
            onClick={() => setSearchQuery('')}
        >
            <div 
                ref={overlayRef}
                className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-3">
                        <Search size={18} className="text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Results for "{searchQuery}"</span>
                    </div>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="p-1 hover:bg-accent rounded-md transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                    {navMatches.length > 0 ? (
                        <div className="space-y-1">
                            <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Navigation</p>
                            {navMatches.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSearchQuery('')}
                                    className="flex items-center justify-between group p-3 rounded-xl hover:bg-primary/10 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-background border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all">
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Go to {item.name.toLowerCase()}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No matching pages found</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Try searching for "Dashboard", "Reports", or "Students"</p>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-muted/20 border-t border-border/50 flex justify-between items-center text-[10px] text-muted-foreground/60">
                    <div className="flex gap-3">
                        <span><kbd className="bg-background px-1 rounded border">Enter</kbd> to select</span>
                        <span><kbd className="bg-background px-1 rounded border">Esc</kbd> to close</span>
                    </div>
                    <span>Search is localized to your role</span>
                </div>
            </div>
        </div>
    );
}
