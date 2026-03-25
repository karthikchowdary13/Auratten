'use client';

import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    children,
    disabled,
    className = '',
    ...rest
}: ButtonProps) {
    return (
        <button
            className={[
                styles.btn,
                styles[variant],
                styles[size],
                fullWidth ? styles.fullWidth : '',
                loading ? styles.loading : '',
                className,
            ].join(' ')}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? <span className={styles.spinner} /> : null}
            {children}
        </button>
    );
}
