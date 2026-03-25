import styles from './auth.layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.bgOrb1} />
            <div className={styles.bgOrb2} />
            {children}
        </div>
    );
}
