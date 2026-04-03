import { QrCode, Activity, ShieldCheck, Users, FileText, Building2, LucideIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from './page.module.css';

interface Feature {
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
}

const features: Feature[] = [
  {
    title: 'Instant QR Generation',
    desc: 'Generate dynamic, time-limited QR codes for any session in seconds.',
    icon: QrCode,
    color: '#6366f1',
  },
  {
    title: 'Real-Time Tracking',
    desc: 'See attendance as it happens — no delays, no manual entry.',
    icon: Activity,
    color: '#22c55e',
  },
  {
    title: 'Anti-Spoofing Security',
    desc: 'Device fingerprinting and IP validation prevent proxy attendance fraud.',
    icon: ShieldCheck,
    color: '#f43f5e',
  },
  {
    title: 'Role-Based Access',
    desc: 'Separate views and permissions for Students, Teachers, HR, and Admins.',
    icon: Users,
    color: '#f59e0b',
  },
  {
    title: 'Instant Reports',
    desc: 'Export attendance summaries per session, user, or institution.',
    icon: FileText,
    color: '#8b5cf6',
  },
  {
    title: 'Multi-Institution',
    desc: 'Manage dozens of institutions and departments from one account.',
    icon: Building2,
    color: '#06b6d4',
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroLogo}>
            <img 
              src="/auratten-logos/logo-main.png" 
              alt="Auratten Logo" 
              style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '2rem' }} 
            />
          </div>
          <div className={styles.heroBadge}>
            <span className={styles.statusDot}></span>
            Beta Now Live
          </div>
          <h1 className={styles.heroTitle}>
            Smart Attendance,<br />
            Powered by QR
          </h1>
          <p className={styles.heroSubtitle}>
            Auratten replaces paper registers with instant, fraud-proof QR code attendance
            for schools, colleges, and enterprises.
          </p>
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.primaryBtn}>
              Get Started Free
              <ChevronRight size={18} style={{ marginLeft: 6 }} />
            </Link>
            <Link href="/login" className={styles.secondaryBtn}>
              Sign In
            </Link>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>10k+</span>
              <span className={styles.statLabel}>Attendances</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>50+</span>
              <span className={styles.statLabel}>Institutions</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>99.9%</span>
              <span className={styles.statLabel}>Accuracy</span>
            </div>
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
            {features.map(({ title, desc, icon: Icon, color }) => (
              <div 
                key={title} 
                className={styles.featureCard}
                style={{ '--feature-color': color } as React.CSSProperties}
              >
                <div className={styles.featureIcon} style={{ background: `${color}15` }}>
                   <Icon size={32} color={color} className={styles.featureIconSvg} />
                </div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to modernize your institution?</h2>
          <p className={styles.ctaSubtext}>Join Auratten today and eliminate attendance fraud forever. Free for small teams.</p>
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.primaryBtn}>
              Create Free Account
              <ChevronRight size={18} style={{ marginLeft: 6 }} />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
