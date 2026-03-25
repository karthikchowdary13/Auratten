'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { attendanceApi, qrApi, authApi } from '@/lib/api';
import { format, isToday, isYesterday } from 'date-fns';
import {
    ScanFace,
    AlertTriangle,
    CheckCircle2,
    Keyboard,
    Camera,
    History,
    Users,
    Calendar,
    ChevronRight,
    Search,
    Clock,
    UserCheck,
    UserX,
    Filter,
    Trash2,
    XCircle,
    Layers
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmPasswordModal from '@/components/ui/ConfirmPasswordModal';
import styles from './attendance.module.css';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useToast } from '@/context/ToastContext';

export default function AttendanceScannerPage() {
    const { user, isHydrated } = useAuthStore();
    const { showToast } = useToast();

    // Student State
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [deviceFingerprint, setDeviceFingerprint] = useState('');
    const [isManual, setIsManual] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Teacher/Admin State
    const [sessionHistory, setSessionHistory] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [sessionAttendance, setSessionAttendance] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [lastClearedAt, setLastClearedAt] = useState<number | null>(null);
    const [showClearModal, setShowClearModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoreQuery, setRestoreQuery] = useState('');

    useEffect(() => {
        if (!isHydrated || !user) return;

        // Load history clear state
        const clearedKey = `auratten_history_cleared_${user.id}`;
        const stored = localStorage.getItem(clearedKey);
        if (stored) setLastClearedAt(parseInt(stored));

        if (user.role === 'STUDENT') {
            // Student Setup
            let storedFp = localStorage.getItem('auratten_device_fp');
            if (!storedFp) {
                storedFp = 'device-' + Math.random().toString(36).substring(2, 15);
                localStorage.setItem('auratten_device_fp', storedFp);
            }
            setDeviceFingerprint(storedFp);
        } else {
            // Teacher/Admin Setup
            loadSessionHistory();
        }
    }, [user]);

    // --- Student Logic ---
    useEffect(() => {
        if (!isManual && user?.role === 'STUDENT' && status === 'idle') {
            const scanner = new Html5QrcodeScanner(
                'reader',
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error('Failed to clear scanner', err));
                scannerRef.current = null;
            }
        };
    }, [isManual, user?.role, status]);

    async function onScanSuccess(decodedText: string) {
        if (loading) return;
        if (scannerRef.current) {
            try { await scannerRef.current.clear(); } catch (err) { console.error(err); }
        }
        handleMarkAttendance(decodedText);
    }

    function onScanFailure(error: any) { }

    const handleMarkAttendance = async (inputToken: string) => {
        if (!inputToken.trim()) return;
        setLoading(true);
        setStatus('idle');
        setMessage('');

        const { error: apiErr } = await attendanceApi.markAttendance({
            token: inputToken.trim(),
            deviceFingerprint,
        });

        if (apiErr) {
            setStatus('error');
            setMessage(apiErr);
            showToast('error', 'Attendance Failed', apiErr);
        } else {
            setStatus('success');
            setMessage('Awesome! You have been successfully marked PRESENT.');
            showToast('success', 'Attendance Marked', 'You are officially present for this session!');
            setToken('');
        }
        setLoading(false);
    };

    // --- Teacher Logic ---
    const loadSessionHistory = async () => {
        const targetId = user?.institutionId;
        if (targetId) {
            setLoading(true);
            const { data } = await qrApi.getHistory(targetId);
            if (data) setSessionHistory(data);
            setLoading(false);
        }
    };

    const viewSessionDetails = async (session: any) => {
        setSelectedSession(session);
        setLoading(true);
        const { data } = await attendanceApi.getSessionAttendance(session.id);
        const records = (data as any)?.records || data;
        if (records) setSessionAttendance(records);
        setLoading(false);
    };

    const handleClearHistory = async (password: string) => {
        const { error: verifyErr } = await authApi.verifyPassword(password);

        if (verifyErr) {
            throw new Error(verifyErr);
        }

        const now = Date.now();
        setLastClearedAt(now);
        if (user) {
            localStorage.setItem(`auratten_history_cleared_${user.id}`, now.toString());
        }
        showToast('success', 'History Cleared', 'Recent history has been hidden from your view.');
    };

    const undoClear = (all: boolean = false) => {
        if (all) {
            setLastClearedAt(null);
            if (user) localStorage.removeItem(`auratten_history_cleared_${user.id}`);
            showToast('info', 'History Restored', 'All past sessions are now visible.');
        }
        setShowRestoreModal(false);
        setRestoreQuery('');
    };

    // --- Render Helpers ---
    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (user?.role !== 'STUDENT') {
        // FILTERING LOGIC
        const filteredSessions = sessionHistory.filter(s => {
            const matchesSearch =
                s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.section?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                new Date(s.createdAt).toLocaleDateString().includes(searchQuery);

            // If the user is actively searching, always show matches regardless of clear state
            if (searchQuery.length > 0) return matchesSearch;

            const createdTime = new Date(s.createdAt).getTime();
            const isHidden = lastClearedAt && createdTime <= lastClearedAt;

            // Not hidden — show normally
            if (!isHidden) return true;

            // Hidden — only reveal if it matches the restoreQuery
            if (restoreQuery.trim()) {
                const q = restoreQuery.trim().toLowerCase();
                return (
                    s.section?.name?.toLowerCase().includes(q) ||
                    s.createdBy?.name?.toLowerCase().includes(q) ||
                    new Date(s.createdAt).toLocaleDateString().includes(restoreQuery.trim())
                );
            }

            // Hidden and no restore filter active
            return false;
        });

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {selectedSession ? (
                            <Button variant="secondary" size="sm" onClick={() => setSelectedSession(null)}>
                                Back to List
                            </Button>
                        ) : (
                            <History size={28} className={styles.iconAccent} />
                        )}
                        <div>
                            <h1 className={styles.title}>{selectedSession ? 'Session Details' : 'Attendance History'}</h1>
                            <p className={styles.subtitle}>
                                {selectedSession
                                    ? <span>Reviewing attendance for <strong>{selectedSession.section?.name || 'General (All Sections)'}</strong> session</span>
                                    : 'Browse and manage all previous attendance sessions'}
                            </p>
                        </div>
                    </div>
                </div>

                {!selectedSession ? (
                    <div className={styles.historySection}>
                        <div className={styles.searchBar}>
                            <div className={styles.searchInputWrapper}>
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search by section, date (MM/DD/YYYY), or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                            <div className={styles.historyActions}>
                                {lastClearedAt ? (
                                    <Button variant="secondary" size="sm" onClick={() => setShowRestoreModal(true)} title="Restore Specific Records">
                                        <History size={16} style={{ marginRight: 6 }} /> Restore
                                    </Button>
                                ) : (
                                    <Button variant="danger" size="sm" onClick={() => setShowClearModal(true)} title="Clear Recent History">
                                        <Trash2 size={16} style={{ marginRight: 6 }} /> Clear All
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Selective Restore Modal */}
                        {showRestoreModal && (
                            <div className={styles.restoreModal}>
                                <div className={styles.restoreModalHeader}>
                                    <History size={18} className={styles.iconAccent} />
                                    <span>Restore Specific History</span>
                                    <button className={styles.restoreModalClose} onClick={() => { setShowRestoreModal(false); setRestoreQuery(''); }}>
                                        <XCircle size={18} />
                                    </button>
                                </div>
                                <p className={styles.restoreModalDesc}>
                                    Enter a <strong>section name</strong> or <strong>date (MM/DD/YYYY)</strong> to restore matching sessions only.
                                </p>
                                <div className={styles.restoreModalInputRow}>
                                    <input
                                        type="text"
                                        placeholder="e.g. Section 1  or  3/19/2026"
                                        value={restoreQuery}
                                        onChange={(e) => setRestoreQuery(e.target.value)}
                                        className={styles.restoreInput}
                                        autoFocus
                                    />
                                </div>
                                <div className={styles.restoreModalFooter}>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => undoClear(true)}
                                    >
                                        Restore All
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            if (!restoreQuery.trim()) return;
                                            setShowRestoreModal(false);
                                            showToast('success', 'Filtered Restore', `Showing sessions matching "${restoreQuery}"`);
                                        }}
                                        disabled={!restoreQuery.trim()}
                                    >
                                        Show Matching Sessions
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className={styles.sessionList}>
                            {filteredSessions.length === 0 ? (
                                <div className={styles.emptySessions}>
                                    <Clock size={48} opacity={0.2} />
                                    <p>No past sessions found matching your criteria.</p>
                                </div>
                            ) : (
                                Object.entries(
                                    filteredSessions.reduce((groups: any, session) => {
                                        const sectionName = session.section?.name || 'General (Institutional)';
                                        if (!groups[sectionName]) groups[sectionName] = [];
                                        groups[sectionName].push(session);
                                        return groups;
                                    }, {})
                                ).map(([sectionName, sessions]: [string, any]) => {
                                    return (
                                        <div key={sectionName} className={styles.dateGroup}>
                                            <div className={styles.dateHeader}>
                                                <Layers size={18} className="text-primary/60" />
                                                <span className={styles.dateLabel}>{sectionName}</span>
                                                <span className={styles.sessionCount}>({sessions.length} {sessions.length === 1 ? 'session' : 'sessions'})</span>
                                            </div>
                                            {sessions.map((session: any) => {
                                                const totalStudents = session.section?._count?.users || 0;
                                                const rate = totalStudents > 0 ? Math.round((session._count?.attendanceRecords / totalStudents) * 100) : 0;
                                                
                                                const getBadgeStyle = (r: number) => {
                                                    if (r >= 85) return { background: '#064E3B', color: '#34D399' };
                                                    if (r >= 75) return { background: '#451A03', color: '#F59E0B' };
                                                    return { background: '#450A0A', color: '#F87171' };
                                                };

                                                return (
                                                    <div
                                                        key={session.id}
                                                        className={styles.sessionItem}
                                                        onClick={() => viewSessionDetails(session)}
                                                    >
                                                        <div className={styles.sessionMain}>
                                                            <div className={styles.sessionIcon}>
                                                                <Calendar size={20} />
                                                            </div>
                                                            <div>
                                                                <div className={styles.sessionTop}>
                                                                    <span className={styles.sessionName}>
                                                                        {format(new Date(session.createdAt), 'd MMMM yyyy, h:mm a')}
                                                                    </span>
                                                                    <span className={session.isActive ? styles.statusActive : styles.statusEnded}>
                                                                        {session.isActive ? 'Active' : 'Ended'}
                                                                    </span>
                                                                </div>
                                                                <div className={styles.sessionMeta}>
                                                                    <span>By {session.createdBy?.name}</span>
                                                                    <span className={styles.dot}>•</span>
                                                                    <span>{session.id.slice(-8).toUpperCase()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={styles.sessionRight}>
                                                            {rate > 0 && rate <= 100 && (
                                                                <div className={styles.attendanceBadge} style={getBadgeStyle(rate)}>
                                                                    {rate}%
                                                                </div>
                                                            )}
                                                            <div className={styles.sessionStatsMini}>
                                                                <Users size={14} />
                                                                <span>{session._count?.attendanceRecords || 0} Records</span>
                                                            </div>
                                                            <ChevronRight size={18} className={styles.chevron} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.detailsSection}>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailsMain}>
                                <div className={styles.attendanceTableWrapper}>
                                    <table className={styles.attendanceTable}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}>S.no</th>
                                                <th>Roll No.</th>
                                                <th>Student</th>
                                                <th>Time</th>
                                                <th>Status</th>
                                                <th>Device ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sessionAttendance.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className={styles.emptyTable}>
                                                        No attendance records found for this session.
                                                    </td>
                                                </tr>
                                            ) : (
                                                sessionAttendance.map((record, index) => (
                                                    <tr key={record.id}>
                                                        <td style={{ opacity: 0.5, fontSize: '13px' }}>{index + 1}</td>
                                                        <td className={styles.rollCell}>{record.user.rollNumber || '-'}</td>
                                                        <td>
                                                            <div className={styles.studentCell}>
                                                                <div className={styles.avatarSmall}>{record.user.name[0]}</div>
                                                                <div>
                                                                    <div className={styles.sName}>{record.user.name}</div>
                                                                    <div className={styles.sEmail}>{record.user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{record.deviceFingerprint === 'NOT_SCANNED' ? '-' : new Date(record.markedAt).toLocaleTimeString()}</td>
                                                        <td>
                                                            <span className={record.status === 'PRESENT' ? styles.badgePresent : styles.badgeAbsent}>
                                                                {record.status === 'PRESENT' ? <UserCheck size={12} /> : <UserX size={12} />}
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className={styles.codeCell}><code>{record.deviceFingerprint}</code></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className={styles.detailsSide}>
                                <div className={styles.sideCard}>
                                    <h3>Session Info</h3>
                                    <div className={styles.infoRow}>
                                        <label>ID</label>
                                        <span>{selectedSession.id.slice(0, 12)}...</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <label>Section</label>
                                        <span>{selectedSession.section?.name || 'General Session'}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <label>Teacher</label>
                                        <span>{selectedSession.createdBy?.name}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <label>Date</label>
                                        <span>{new Date(selectedSession.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <label>Time</label>
                                        <span>{new Date(selectedSession.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <hr className={styles.divider} />
                                    <div className={styles.summaryStats}>
                                        <div className={styles.sumStat}>
                                            <span className={styles.sumVal}>{sessionAttendance.filter(r => r.status === 'PRESENT').length}</span>
                                            <span className={styles.sumLab}>Present</span>
                                        </div>
                                        <div className={styles.sumStat}>
                                            <span className={styles.sumVal}>{sessionAttendance.filter(r => r.status === 'ABSENT').length}</span>
                                            <span className={styles.sumLab}>Absent</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <ConfirmPasswordModal
                    isOpen={showClearModal}
                    onClose={() => setShowClearModal(false)}
                    onConfirm={handleClearHistory}
                    title="Clear Attendance History"
                    description="This will hide all current sessions from your history list. Records remain safely in the database and can be searched by date at any time."
                />
            </div>
        );
    }

    // --- STUDENT SCANNER VIEW ---
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Mark Your Attendance</h1>
                <p className={styles.subtitle}>
                    {isManual
                        ? 'Enter the security token from the projector'
                        : 'Align the QR code on the projector within the frame'}
                </p>
            </div>

            <div className={styles.scannerCard}>
                {!isManual && status === 'idle' ? (
                    <div className={styles.scannerWrapper}>
                        <div id="reader" className={styles.reader}></div>
                        <div className={styles.scanOverlay}>
                            <div className={styles.scanLine}></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={styles.iconWrapper}>
                            {status === 'success' ? (
                                <CheckCircle2 size={64} className={styles.mainIcon} style={{ color: '#22c55e' }} />
                            ) : (
                                <ScanFace size={64} className={styles.mainIcon} />
                            )}
                        </div>

                        {status !== 'success' && (
                            <form onSubmit={(e) => { e.preventDefault(); handleMarkAttendance(token); }} className={styles.form}>
                                <Input
                                    label="Security Token"
                                    type="text"
                                    placeholder="Enter token manually..."
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    required
                                />

                                <Button type="submit" loading={loading} style={{ marginTop: '10px' }}>
                                    Confirm Token
                                </Button>
                            </form>
                        )}
                    </>
                )}

                {status === 'success' && (
                    <div className={styles.successBanner}>
                        <CheckCircle2 size={24} />
                        <div>
                            <strong>Attendance Recorded!</strong>
                            <p>{message}</p>
                            <Button
                                variant="secondary"
                                style={{ marginTop: 12, fontSize: 12, padding: '4px 12px' }}
                                onClick={() => setStatus('idle')}
                            >
                                Scan Again
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className={styles.errorBanner}>
                        <AlertTriangle size={24} />
                        <div>
                            <strong>Scan Failed</strong>
                            <p>{message}</p>
                            <Button
                                variant="secondary"
                                style={{ marginTop: 12, fontSize: 12, padding: '4px 12px', color: '#ef4444' }}
                                onClick={() => setStatus('idle')}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                <button
                    className={styles.manualToggle}
                    onClick={() => {
                        setIsManual(!isManual);
                        setStatus('idle');
                    }}
                >
                    {isManual ? (
                        <><Camera size={14} style={{ marginRight: 6 }} /> Use Camera Scanner</>
                    ) : (
                        <><Keyboard size={14} style={{ marginRight: 6 }} /> Enter Token Manually</>
                    )}
                </button>

                <div className={styles.fingerprintDisclaimer}>
                    <p>Anti-Proxy ID: <code>{deviceFingerprint}</code></p>
                    <span>Unique device verification is active.</span>
                </div>
            </div>
        </div>
    );
}
