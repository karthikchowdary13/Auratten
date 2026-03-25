'use client';

import React from 'react';
import styles from './Select.module.css';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
}

export default function Select({ label, options, error, ...props }: SelectProps) {
    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.selectWrapper}>
                <select className={`${styles.select} ${error ? styles.selectError : ''}`} {...props}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className={styles.arrow} />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
}
