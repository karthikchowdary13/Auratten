'use client';

import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Navbar.module.css';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    if (!mounted) {
        return null; // Avoid hydration mismatch
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <img 
                        src="/auratten-logos/favicon.png" 
                        alt="Auratten Icon" 
                        style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
                    />
                    <span className={styles.wordmark}>Auratten</span>
                </Link>
                <div className={styles.actions}>
                    <button 
                        onClick={toggleTheme}
                        className={styles.themeToggle}
                        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Link href="/login">
                        <Button variant="ghost" size="sm">Log in</Button>
                    </Link>
                    <Link href="/register">
                        <Button variant="primary" size="sm">Get Started</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
