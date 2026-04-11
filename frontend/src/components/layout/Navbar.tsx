'use client';

import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Navbar.module.css';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'light') {
                document.documentElement.classList.add('light');
            }
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <img 
                        src="/auratten-logos/logo-main.png" 
                        alt="Auratten" 
                        style={{ height: '60px', width: 'auto', objectFit: 'contain' }} 
                    />
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
