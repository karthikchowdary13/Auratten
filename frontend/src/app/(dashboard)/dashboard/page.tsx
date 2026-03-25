'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Users, ClipboardCheck, BarChart2, Calendar, MapPin, Clock, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { isAuthenticated } from '@/lib/auth';
import { attendanceApi, qrApi } from '@/lib/api';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeSessions: 0,
        totalUsers: 1,
        attendanceToday: 0,
        reportsGenerated: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace('/login');
            return;
        }
        fetchDashboardData();
    }, [router, user]);
    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch recent activity based on user role
            const isStudent = user?.role === 'STUDENT';
            const { data: activityData } = isStudent
                ? await attendanceApi.getHistory()
                : await attendanceApi.getRecent();

            if (activityData) {
                const activity = isStudent ? (activityData as any).records : activityData;
                setRecentActivity(activity);

                // Calculate "Attendance Today" for Students
                if (isStudent) {
                    const today = new Date().toDateString();
                    const todayCount = activity.filter((record: any) =>
                        new Date(record.markedAt).toDateString() === today
                    ).length;
                    setStats(prev => ({
                        ...prev,
                        attendanceToday: todayCount,
                        avgAttendance: `${(activityData as any).percentage}%`
                    }));
                }
            }

            // Fetch analytics for staff roles
            if (user?.role !== 'STUDENT') {
                const { data: analytics } = await attendanceApi.getAnalytics();
                if (analytics) {
                    setStats(prev => ({
                        ...prev,
                        activeSessions: analytics.stats.totalSessions,
                        attendanceToday: analytics.stats.totalPresent,
                    }));
                }
            } else if (user?.institutionId) {
                // For Students, just fetch active session count
                const { data: sessions } = await qrApi.getActiveSessions(user.institutionId);
                if (sessions) {
                    setStats(prev => ({ ...prev, activeSessions: sessions.length }));
                }
            }
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Active QR Sessions', value: stats.activeSessions.toString(), icon: QrCode, color: '#6c63ff' },
        { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: '#22c55e' },
        { label: 'Attendance Today', value: stats.attendanceToday.toString(), icon: ClipboardCheck, color: '#f59e0b' },
        { label: 'My Attendance Rate', value: user?.role === 'STUDENT' ? (stats as any).avgAttendance || '0%' : (stats as any).avgAttendance || '0%', icon: BarChart2, color: '#a78bfa' },
    ];

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.greeting}>
                    Welcome back, <span className={styles.name}>{user?.name ?? 'User'}</span> 👋
                </h1>
                <p className={styles.subtext}>Here&apos;s your Auratten attendance overview</p>
            </div>

            <div className={styles.statsGrid}>
                {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: `${color}18`, color }}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className={styles.statValue}>{value}</p>
                            <p className={styles.statLabel}>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    {user?.role === 'STUDENT' ? 'Your Recent Activity' : 'Institutional Recent Activity'}
                </h2>

                {loading ? (
                    <div className={styles.emptyState}>
                        <p>Syncing latest records...</p>
                    </div>
                ) : recentActivity.length === 0 ? (
                    <div className={styles.emptyState}>
                        <QrCode size={40} color="var(--text-muted)" />
                        <p>No recent attendance activity.</p>
                        <p className={styles.emptyHint}>Activity will appear here as students mark their attendance.</p>
                    </div>
                ) : (
                    <div className={styles.activityList}>
                        {recentActivity.map((record) => (
                            <div key={record.id} className={styles.activityCard}>
                                <div className={styles.activityIcon}>
                                    <UserCheck size={20} />
                                </div>
                                <div className={styles.activityInfo}>
                                    <div className={styles.activityHeader}>
                                        <h4 className={styles.activityTitle}>
                                            {user?.role === 'STUDENT'
                                                ? (record.qrSession?.institution?.name || 'Institutional Session')
                                                : `${record.user?.name || 'Student'}`
                                            }
                                        </h4>
                                        <span className={styles.activityBadge}>
                                            {record.status || 'PRESENT'}
                                        </span>
                                    </div>
                                    <div className={styles.activityMeta}>
                                        {user?.role !== 'STUDENT' && (
                                            <div className={styles.metaItem}>
                                                <Users size={14} />
                                                {record.user?.role || 'STUDENT'}
                                            </div>
                                        )}
                                        <div className={styles.metaItem}>
                                            <Calendar size={14} />
                                            {new Date(record.markedAt).toLocaleDateString()}
                                        </div>
                                        <div className={styles.metaItem}>
                                            <Clock size={14} />
                                            {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {user?.role === 'STUDENT' && (
                                            <div className={styles.metaItem}>
                                                <Users size={14} />
                                                By {record.qrSession?.createdBy?.name || 'Teacher'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
