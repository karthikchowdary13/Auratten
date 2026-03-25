import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from './page.module.css';

const features = [
  {
    title: 'Instant QR Generation',
    desc: 'Generate dynamic, time-limited QR codes for any session in seconds.',
    icon: '⚡',
  },
  {
    title: 'Real-Time Tracking',
    desc: 'See attendance as it happens — no delays, no manual entry.',
    icon: '📡',
  },
  {
    title: 'Anti-Spoofing Security',
    desc: 'Device fingerprinting and IP validation prevent proxy attendance fraud.',
    icon: '🛡️',
  },
  {
    title: 'Role-Based Access',
    desc: 'Separate views and permissions for Students, Teachers, HR, and Admins.',
    icon: '🔐',
  },
  {
    title: 'Instant Reports',
    desc: 'Export attendance summaries per session, user, or institution.',
    icon: '📊',
  },
  {
    title: 'Multi-Institution',
    desc: 'Manage dozens of institutions and departments from one account.',
    icon: '🏛️',
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>v1.0 Ready</div>
          <h1 className={styles.heroTitle}>
            Smart Attendance,<br />
            <span className="gradient-text">Powered by QR</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Auratten replaces paper registers with instant, fraud-proof QR code attendance
            for schools, colleges, and enterprises.
          </p>
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.primaryBtn}>
              Get Started Free
            </Link>
            <Link href="/login" className={styles.secondaryBtn}>
              Sign In
            </Link>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>Everything you need</h2>
            <p className={styles.featuresSubtitle}>
              Built for real institutions, with the features that matter most.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map(({ title, desc, icon }) => (
              <div key={title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{icon}</div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to modernise attendance?</h2>
          <p className={styles.ctaSubtext}>Join Auratten today — it&apos;s free to get started.</p>
          <Link href="/register" className={styles.primaryBtn}>
            Create your account
          </Link>
        </section>
      </main>
    </>
  );
}
