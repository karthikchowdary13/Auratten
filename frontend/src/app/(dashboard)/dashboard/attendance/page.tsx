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
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '@/context/ToastContext';

// Safe date formatting helpers to prevent RangeError
const safeFormatDate = (dateStr: any, formatStr: string, fallback: string = 'N/A') => {
    try {
        if (!dateStr) return fallback;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return fallback;
        return format(d, formatStr);
    } catch (e) {
        return fallback;
    }
};

const safeFormatTime = (dateStr: any, fallback: string = '-') => {
    try {
        if (!dateStr) return fallback;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return fallback;
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return fallback;
    }
};

const safeGetTime = (dateStr: any, fallback: number = 0) => {
    try {
        if (!dateStr) return fallback;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? fallback : d.getTime();
    } catch (e) {
        return fallback;
    }
};

export default function AttendanceScannerPage() {
    const { user, isHydrated } = useAuthStore();
    const { showToast } = useToast();

    // Student State
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [deviceFingerprint, setDeviceFingerprint] = useState('');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [isScannerReady, setIsScannerReady] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

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
            
            // Add polling for "real-time" history updates (every 10s)
            const historyInterval = setInterval(() => {
                if (!searchQuery && !selectedSession) {
                    loadSessionHistory();
                }
            }, 10000);
            
            // Update when the tab becomes active again
            window.addEventListener('focus', loadSessionHistory);
            
            return () => {
                clearInterval(historyInterval);
                window.removeEventListener('focus', loadSessionHistory);
            };
        }
    }, [user]);

    // --- Student Logic (Camera Management) ---
    useEffect(() => {
        if (user?.role === 'STUDENT' && status === 'idle') {
            const html5QrCode = new Html5Qrcode('reader');
            scannerRef.current = html5QrCode;

            const startScanner = async () => {
                try {
                    await html5QrCode.start(
                        { facingMode: facingMode },
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        (decodedText) => onScanSuccess(decodedText),
                        (errorMessage) => { /* ignore normal scanning errors */ }
                    );
                    setIsScannerReady(true);
                } catch (err) {
                    console.error("Scanner start error:", err);
                    showToast('error', 'Camera Error', 'Could not access the requested camera.');
                }
            };

            startScanner();
        }

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop()
                    .catch(e => console.error("Scanner stop error:", e));
            }
        };
    }, [user?.role, status, facingMode]);

    const toggleCamera = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            setIsScannerReady(false);
            await scannerRef.current.stop();
            setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        }
    };

    async function onScanSuccess(decodedText: string) {
        if (loading) return;
        if (scannerRef.current && scannerRef.current.isScanning) {
            try { await scannerRef.current.stop(); } catch (err) { console.error(err); }
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
            const createdAt = s.createdAt;
            const dateStr = safeFormatDate(createdAt, 'P', ''); // Use localized date format for search
            const createdTime = safeGetTime(createdAt);

            const matchesSearch =
                String(s.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.section?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dateStr.includes(searchQuery);

            // If the user is actively searching, always show matches regardless of clear state
            if (searchQuery.length > 0) return matchesSearch;

            const isHidden = lastClearedAt && createdTime <= lastClearedAt;

            // Not hidden — show normally
            if (!isHidden) return true;

            // Hidden — only reveal if it matches the restoreQuery
            if (restoreQuery.trim()) {
                const q = restoreQuery.trim().toLowerCase();
                return (
                    s.section?.name?.toLowerCase().includes(q) ||
                    s.createdBy?.name?.toLowerCase().includes(q) ||
                    dateStr.toLowerCase().includes(restoreQuery.trim().toLowerCase())
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
                            <Search size={18} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by section, ID, or activity..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                            <div className={styles.dateDisplay}>
                                {format(new Date(), 'dd/MM/yyyy')}
                            </div>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                className={styles.searchButton}
                                onClick={loadSessionHistory}
                            >
                                <Search size={16} /> Search
                            </Button>
                            <div className={styles.historyActions}>
                                {lastClearedAt ? (
                                    <Button variant="secondary" size="sm" onClick={() => setShowRestoreModal(true)} title="Restore Specific Records">
                                        <History size={16} style={{ marginRight: 6 }} /> Restore
                                    </Button>
                                ) : (
                                    <Button 
                                        className={styles.clearAllBtn}
                                        onClick={() => setShowClearModal(true)} 
                                        title="Clear Recent History"
                                    >
                                        <Trash2 size={16} /> Clear All
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
                                                const totalStudents = session.section?.studentCount || 0;
                                                const rate = totalStudents > 0 ? Math.round((session.attendanceCount / totalStudents) * 100) : 0;
                                                
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
                                                                        {session.section?.name || 'General Session'}
                                                                    </span>
                                                                    <span className={session.isActive ? styles.statusActive : styles.statusEnded}>
                                                                        {session.isActive ? 'Active' : 'Ended'}
                                                                    </span>
                                                                </div>
                                                                <div className={styles.sessionMeta}>
                                                                    <span>{safeFormatDate(session.createdAt, 'd MMM, h:mm a')}</span>
                                                                    <span className={styles.dot}>•</span>
                                                                    <span>By {session.createdBy?.name || 'Teacher'}</span>
                                                                    <span className={styles.dot}>•</span>
                                                                    <span>ID: {String(session.id || '').slice(-6).toUpperCase()}</span>
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
                                                        <td>{record.deviceFingerprint === 'NOT_SCANNED' ? '-' : safeFormatTime(record.markedAt)}</td>
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
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="text-lg font-bold text-white m-0">Session Analysis</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className={styles.infoRowPremium}>
                                            <div className="flex items-center gap-3">
                                                <div className={styles.infoIcon}><Layers size={16} /></div>
                                                <label>Section</label>
                                            </div>
                                            <span>{selectedSession.section?.name || 'General Session'}</span>
                                        </div>

                                        <div className={styles.infoRowPremium}>
                                            <div className="flex items-center gap-3">
                                                <div className={styles.infoIcon}><UserCheck size={16} /></div>
                                                <label>Lead Teacher</label>
                                            </div>
                                            <span>{selectedSession.createdBy?.name || 'Teacher'}</span>
                                        </div>

                                        <div className={styles.infoRowPremium}>
                                            <div className="flex items-center gap-3">
                                                <div className={styles.infoIcon}><Calendar size={16} /></div>
                                                <label>Date</label>
                                            </div>
                                            <span>{safeFormatDate(selectedSession.createdAt, 'EEEE, d MMM yyyy')}</span>
                                        </div>

                                        <div className={styles.infoRowPremium}>
                                            <div className="flex items-center gap-3">
                                                <div className={styles.infoIcon}><Clock size={16} /></div>
                                                <label>Start Time</label>
                                            </div>
                                            <span>{safeFormatTime(selectedSession.createdAt)}</span>
                                        </div>

                                        <div className={styles.infoRowPremium}>
                                            <div className="flex items-center gap-3">
                                                <div className={styles.infoIcon}><AlertTriangle size={16} /></div>
                                                <label>Session ID</label>
                                            </div>
                                            <code className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                                {String(selectedSession.id || '').toUpperCase()}
                                            </code>
                                        </div>
                                    </div>

                                    <div className={styles.dividerPremium} />

                                    <div className={styles.summaryStatsPremium}>
                                        <div className={cn(styles.sumStatPremium, styles.sumStatPresent)}>
                                            <span className={styles.sumValPremium}>{sessionAttendance.filter(r => r.status === 'PRESENT').length}</span>
                                            <span className={styles.sumLabPremium}>Present</span>
                                        </div>
                                        <div className={cn(styles.sumStatPremium, styles.sumStatAbsent)}>
                                            <span className={styles.sumValPremium}>{sessionAttendance.filter(r => r.status === 'ABSENT').length}</span>
                                            <span className={styles.sumLabPremium}>Absent</span>
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
                    Align the QR code on the projector within the frame
                </p>
            </div>

            <div className={styles.scannerCard}>
                {status === 'idle' ? (
                    <div className={styles.scannerWrapper}>
                        <div id="reader" className={styles.reader} style={{ border: 'none' }}></div>
                        
                        {isScannerReady && (
                            <div className={styles.cameraControls}>
                                <button 
                                    className={styles.cameraToggleBtn}
                                    onClick={toggleCamera}
                                >
                                    <Camera size={20} />
                                    {facingMode === 'user' ? 'Switch to Back Camera' : 'Switch to Front Camera'}
                                </button>
                            </div>
                        )}

                        <div className={styles.scanOverlay}>
                            <div className={styles.scanLine}></div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.iconWrapper}>
                        {status === 'success' ? (
                            <CheckCircle2 size={64} className={styles.mainIcon} style={{ color: '#22c55e' }} />
                        ) : (
                            <ScanFace size={64} className={styles.mainIcon} />
                        )}
                    </div>
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
                                onClick={() => {
                                    setStatus('idle');
                                    setIsScannerReady(false);
                                }}
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
                                onClick={() => {
                                    setStatus('idle');
                                    setIsScannerReady(false);
                                }}
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                <div className={styles.fingerprintDisclaimer}>
                    <p>Anti-Proxy ID: <code>{deviceFingerprint}</code></p>
                    <span>Unique device verification is active.</span>
                </div>
            </div>
        </div>
    );
}
