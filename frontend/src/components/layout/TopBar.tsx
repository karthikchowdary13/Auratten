'use client';

import { Bell, Search, User, ChevronDown, LogOut, Settings, BarChart, Moon, Sun, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { clearAuthSession } from '@/lib/auth';
import { Button, Input } from '@/components/ui';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function TopBar() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { searchQuery, setSearchQuery, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('auratten-theme', isDark ? 'dark' : 'light');
    };

    return (
        <header className="h-16 bg-card/50 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50">
            <div className="flex items-center gap-4 w-1/2 lg:w-1/3">
                <button 
                    onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="relative w-full max-w-sm hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search anything..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                    />
                </div>
                {/* Mobile Search Icon only */}
                <button className="sm:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground">
                    <Search size={20} />
                </button>
            </div>

            <div className="flex items-center gap-2 lg:gap-6">
                <div className="relative" ref={notificationsRef}>
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={cn(
                            "relative p-2 rounded-full hover:bg-accent transition-all text-muted-foreground",
                            isNotificationsOpen && "bg-accent text-primary"
                        )}
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card" />
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 top-full mt-3 w-80 bg-black border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
                                <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                                <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:opacity-80 transition-opacity">
                                    Mark all as read
                                </button>
                            </div>
                            
                            <div className="max-h-[400px] overflow-y-auto">
                                {[
                                    { id: 1, title: 'Session Started', msg: 'A new QR session for Math 101 has begun.', time: '2m ago', type: 'info' },
                                    { id: 2, title: 'Low Attendance', msg: 'Section B attendance dropped below 75%.', time: '1h ago', type: 'warning' },
                                    { id: 3, title: 'System Update', msg: 'Auratten v1.2 is now live with profile photos!', time: '5h ago', type: 'success' },
                                ].map((n) => (
                                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="flex gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                                n.type === 'info' ? "bg-primary" :
                                                n.type === 'warning' ? "bg-amber-500" : "bg-green-500"
                                            )} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                                                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.msg}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button className="w-full p-3 text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest hover:bg-white/5 hover:text-primary transition-all border-t border-white/5">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-border/50" />

                <div className="relative" ref={dropdownRef}>
                    <div 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-2 group cursor-pointer select-none"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold leading-none text-foreground">{user?.name || 'User Profile'}</p>
                            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary overflow-hidden transition-transform group-hover:scale-105">
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${user.avatar}`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <span className="text-sm font-bold">{user?.name ? getInitials(user.name) : <User size={20} />}</span>
                            )}
                        </div>
                        <ChevronDown size={16} className={cn("text-muted-foreground transition-all duration-300 hidden xs:block", isProfileOpen && "rotate-180 text-primary")} />
                    </div>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-3 w-72 bg-black border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                            {/* Section 1: Identity */}
                             <div className="p-5 flex items-center gap-4 bg-gradient-to-br from-black/40 to-transparent border-b border-white/5">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold border border-primary/20 overflow-hidden">
                                    {user?.avatar ? (
                                        <img 
                                            src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${user.avatar}`} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        user?.name ? getInitials(user.name) : 'U'
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-foreground truncate">{user?.name}</h4>
                                    <p className="text-xs text-muted-foreground truncate mb-1">{user?.email}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full uppercase tracking-tighter border border-primary/10">
                                            {user?.role}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground truncate opacity-70">
                                            ID: {user?.institutionId?.slice(0, 8)}...
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-white/5" />

                            {/* Section 2: Navigation */}
                            <div className="p-2 space-y-1">
                                {[
                                    { icon: User, label: 'My Profile', sub: 'View and edit your details', href: '/profile' },
                                    { icon: BarChart, label: 'My Activity', sub: 'Sessions and attendance', href: '/profile#activity' },
                                    { icon: Bell, label: 'Notifications', sub: 'Manage your alerts', href: '/profile#notifications' },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            router.push(item.href);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                                    >
                                        <div className="p-2 bg-white/5 rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                                            <item.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground leading-tight">{item.label}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">{item.sub}</p>
                                        </div>
                                    </button>
                                ))}

                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="p-2 bg-white/5 rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                                        <Moon size={18} className="dark:hidden" />
                                        <Sun size={18} className="hidden dark:block" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground leading-tight">Theme</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">Dark / Light mode</p>
                                    </div>
                                </button>
                            </div>

                            <div className="h-px bg-white/5" />

                            {/* Section 3: Logout */}
                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        clearAuthSession();
                                        useAuthStore.getState().logout();
                                        router.replace('/login');
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 transition-all text-left group"
                                >
                                    <div className="p-2 bg-destructive/5 rounded-lg text-destructive/70 group-hover:text-destructive transition-colors">
                                        <LogOut size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-destructive leading-tight">Logout</p>
                                        <p className="text-[10px] text-destructive/50 mt-0.5 leading-none">Sign out of Auratten</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
