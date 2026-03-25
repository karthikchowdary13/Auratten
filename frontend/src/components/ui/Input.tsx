'use client';

import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function Input({ label, error, id, ...rest }: InputProps) {
    return (
        <div className={styles.wrapper}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>
            <input
                id={id}
                className={[styles.input, error ? styles.hasError : ''].join(' ')}
                {...rest}
            />
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}
