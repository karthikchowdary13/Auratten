'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import {
    History as HistoryIcon,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    ChevronRight,
} from 'lucide-react';
import styles from './history.module.css';

// Dynamically import ExportButtons with SSR disabled to avoid jspdf build errors
const ExportButtons = dynamic(() => import('./ExportButtons'), { 
    ssr: false,
    loading: () => <div className="h-10 w-48 bg-white/5 animate-pulse rounded-xl" />
});

// Sample data for the history page
const SAMPLE_HISTORY = [
    {
        id: 'att-001',
        section: 'CS-A (Computer Science)',
        subject: 'Data Structures',
        teacher: 'Dr. Ramesh Kumar',
        markedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        status: 'PRESENT',
        sessionToken: 'DS-2026-X7Y9'
    },
    {
        id: 'att-002',
        section: 'CS-A (Computer Science)',
        subject: 'Operating Systems',
        teacher: 'Prof. Sneha Sharma',
        markedAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        status: 'PRESENT',
        sessionToken: 'OS-2026-A2B3'
    },
    {
        id: 'att-003',
        section: 'CS-A (Computer Science)',
        subject: 'Database Systems',
        teacher: 'Dr. Amit Varma',
        markedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'ABSENT',
        sessionToken: 'DB-2026-L5K8'
    },
    {
        id: 'att-004',
        section: 'CS-A (Computer Science)',
        subject: 'Algorithm Design',
        teacher: 'Dr. Ramesh Kumar',
        markedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        status: 'PRESENT',
        sessionToken: 'AL-2026-P0Q1'
    },
    {
        id: 'att-005',
        section: 'CS-A (Computer Science)',
        subject: 'Computer Networks',
        teacher: 'Prof. Rajesh Khanna',
        markedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        status: 'PRESENT',
        sessionToken: 'CN-2026-R4S5'
    }
];

export default function HistoryPage() {
    const { user, isHydrated } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [history] = useState(SAMPLE_HISTORY);

    const filteredHistory = history.filter(item => {
        const matchesSearch = 
            item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.section.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = filter === 'ALL' || item.status === filter;
        
        const matchesDate = !selectedDate || format(new Date(item.markedAt), 'yyyy-MM-dd') === selectedDate;
        
        return matchesSearch && matchesFilter && matchesDate;
    });

    if (!isHydrated) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className="flex items-center justify-between w-full flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <HistoryIcon size={28} />
                        </div>
                        <div>
                            <h1 className={styles.title}>My Attendance History</h1>
                            <p className={styles.subtitle}>Review your past attendance records and status</p>
                        </div>
                    </div>
                    
                    <ExportButtons filteredHistory={filteredHistory} user={user} />
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by subject or teacher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                
                <div className={styles.dateFilterWrapper}>
                    <Calendar size={18} className={styles.calendarIcon} />
                    <input 
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={styles.dateInput}
                    />
                    {selectedDate && (
                        <button onClick={() => setSelectedDate('')} className={styles.clearDate}>
                            <XCircle size={14} />
                        </button>
                    )}
                </div>

                <div className={styles.filterWrapper}>
                    <Filter size={18} className={styles.filterIcon} />
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value as any)}
                        className={styles.filterSelect}
                    >
                        <option value="ALL">All Records</option>
                        <option value="PRESENT">Present Only</option>
                        <option value="ABSENT">Absent Only</option>
                    </select>
                </div>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.miniCard}>
                    <span className={styles.miniLabel}>Total Classes</span>
                    <span className={styles.miniValue}>{history.length}</span>
                </div>
                <div className={styles.miniCard}>
                    <span className={styles.miniLabel}>Present</span>
                    <span className={styles.miniValue} style={{ color: '#22c55e' }}>
                        {history.filter(h => h.status === 'PRESENT').length}
                    </span>
                </div>
                <div className={styles.miniCard}>
                    <span className={styles.miniLabel}>Attendance %</span>
                    <span className={styles.miniValue} style={{ color: '#a78bfa' }}>
                        {history.length > 0 ? Math.round((history.filter(h => h.status === 'PRESENT').length / history.length) * 100) : 0}%
                    </span>
                </div>
            </div>

            <div className={styles.historyList}>
                {filteredHistory.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Search size={48} opacity={0.2} />
                        <p>No records found matching your criteria.</p>
                    </div>
                ) : (
                    filteredHistory.map((item) => (
                        <div key={item.id} className={styles.historyCard}>
                            <div className={styles.cardLeft}>
                                <div className={styles.statusIcon} style={{ 
                                    background: item.status === 'PRESENT' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: item.status === 'PRESENT' ? '#22c55e' : '#ef4444'
                                }}>
                                    {item.status === 'PRESENT' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                </div>
                                <div className={styles.info}>
                                    <h3 className={styles.subjectName}>{item.subject}</h3>
                                    <div className={styles.meta}>
                                        <span className={styles.teacherName}>{item.teacher}</span>
                                        <span className={styles.dot}>•</span>
                                        <span className={styles.sectionName}>{item.section}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.cardRight}>
                                <div className={styles.dateTime}>
                                    <div className={styles.date}>
                                        <Calendar size={14} />
                                        <span>{format(new Date(item.markedAt), 'MMM d, yyyy')}</span>
                                    </div>
                                    <div className={styles.time}>
                                        <Clock size={14} />
                                        <span>{format(new Date(item.markedAt), 'h:mm a')}</span>
                                    </div>
                                </div>
                                
                                <div className={styles.statusBadge} style={{ 
                                    background: item.status === 'PRESENT' ? '#064E3B' : '#450A0A',
                                    color: item.status === 'PRESENT' ? '#34D399' : '#F87171'
                                }}>
                                    {item.status}
                                </div>
                                <ChevronRight size={20} className={styles.chevron} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
