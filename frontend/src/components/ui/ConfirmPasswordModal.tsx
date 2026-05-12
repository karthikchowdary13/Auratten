import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import styles from './ConfirmPasswordModal.module.css';
import { Loader2, Lock } from 'lucide-react';

interface ConfirmPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
    title?: string;
    description?: string;
}

export default function ConfirmPasswordModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Password',
    description = 'Please enter your login password to confirm this sensitive action.'
}: ConfirmPasswordModalProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setLoading(true);
        setError(null);
        try {
            await onConfirm(password);
            setPassword('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Incorrect password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className={styles.container}>
                <div className={styles.iconWrapper}>
                    <Lock size={24} />
                </div>
                <p className={styles.description}>{description}</p>

                <div className={styles.inputGroup}>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className={styles.passwordInput}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                        required
                    />
                    {error && <p className={styles.errorMessage}>{error}</p>}
                </div>

                <div className={styles.footer}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading || !password}
                    >
                        {loading ? (
                            <><Loader2 size={16} className="smooth-loader" style={{ marginRight: 8 }} /> Verifying...</>
                        ) : (
                            'Confirm & Update'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
