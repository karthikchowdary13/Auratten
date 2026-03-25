'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import styles from '@/components/ui/Toast.module.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const MAX_TOASTS = 5;

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        
        setToasts((prev) => {
            const newToasts = [...prev, { id, type, title, message, duration }];
            if (newToasts.length > MAX_TOASTS) {
                return newToasts.slice(newToasts.length - MAX_TOASTS);
            }
            return newToasts;
        });

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map((toast) => (
                    <ToastComponent key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastComponent({ type, title, message, duration, onClose }: Toast & { onClose: () => void }) {
    const Icon = {
        success: CheckCircle,
        error: XCircle,
        info: Info,
        warning: AlertCircle,
    }[type];

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            <Icon className={styles.toastIcon} size={24} />
            <div className={styles.toastContent}>
                <div className={styles.toastTitle}>{title}</div>
                {message && <div className={styles.toastMessage}>{message}</div>}
            </div>
            <button className={styles.toastClose} onClick={onClose}>
                <X size={16} />
            </button>
            {duration && (
                <div
                    className={styles.progressBar}
                    style={{ animation: `shrink ${duration}ms linear forwards` }}
                />
            )}
            <style jsx>{`
                @keyframes shrink {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
}
