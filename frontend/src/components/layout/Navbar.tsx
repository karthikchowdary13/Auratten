'use client';

import Link from 'next/link';
import { QrCode } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <img 
                        src="/auratten-logos/logo-website.png" 
                        alt="Auratten Logo" 
                        style={{ height: '40px', width: 'auto', objectFit: 'contain' }} 
                    />
                    <span>Auratten</span>
                </Link>
                <div className={styles.actions}>
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
