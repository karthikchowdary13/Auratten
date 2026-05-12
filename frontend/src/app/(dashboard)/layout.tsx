'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import SearchOverlay from '@/components/layout/SearchOverlay';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient());
    const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
    const isHydrated = useAuthStore((state) => state.isHydrated);

    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 smooth-loader text-primary" />
                    <p className="text-muted-foreground animate-pulse">Establishing secure connection...</p>
                </div>
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex min-h-screen bg-background text-foreground overflow-hidden relative">
                <SearchOverlay />
                <Sidebar />
                
                {/* Mobile Sidebar Backdrop */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <TopBar />
                    <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar scroll-smooth">
                        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </QueryClientProvider>
    );
}
