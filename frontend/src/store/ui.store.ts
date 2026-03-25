import { create } from 'zustand';

interface UIState {
    searchQuery: string;
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    setSearchQuery: (query: string) => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    searchQuery: '',
    isSidebarCollapsed: false,
    isMobileMenuOpen: false,
    setSearchQuery: (query) => set({ searchQuery: query }),
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}));
