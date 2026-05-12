'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    User as UserIcon,
    Trash2,
    Loader2,
    Filter,
    Eye,
    X,
    Calendar,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import { usersApi, institutionsApi, authApi, AuthUser, attendanceApi, sectionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { saveUser } from '@/lib/auth';
import Button from '@/components/ui/Button';
import ConfirmPasswordModal from '@/components/ui/ConfirmPasswordModal';
import SelectDropdown from '@/components/ui/SelectDropdown';
import styles from './users.module.css';
import { useToast } from '@/context/ToastContext';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function UsersPage() {
    const { user, updateUser: setUser, isHydrated } = useAuthStore();
    const { showToast } = useToast();
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [instFilter, setInstFilter] = useState('');
    const [sections, setSections] = useState<any[]>([]);
    const [sectionFilter, setSectionFilter] = useState('');
    
    // Attendance data
    const [attendanceMap, setAttendanceMap] = useState<Record<string, number>>({});
    
    // Quick Category Filter
    const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'AT_RISK' | 'EXCELLENT' | 'ON_TRACK'>('ALL');

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [drawerData, setDrawerData] = useState<any>(null);
    const [drawerUser, setDrawerUser] = useState<AuthUser | null>(null);

    const searchParams = useSearchParams();
    const initialSectionId = searchParams.get('sectionId');

    // Modals
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [roleUpdatePending, setRoleUpdatePending] = useState<{ userId: string, newRole: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [showInstModal, setShowInstModal] = useState(false);
    const [instUpdatePending, setInstUpdatePending] = useState<{ userId: string, newId: string | null } | null>(null);

    useEffect(() => {
        if (!isHydrated || !user) return;
        if (user?.institutionId && !instFilter) {
            setInstFilter(user.institutionId);
        }
    }, [user, isHydrated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, instRes, sectionsRes, analyticsRes] = await Promise.all([
                usersApi.findAll(instFilter || undefined),
                institutionsApi.findAll(),
                user?.institutionId ? sectionsApi.getByInstitution(user.institutionId) : Promise.resolve({ data: [], error: null }),
                instFilter ? (attendanceApi as any).getAnalytics(instFilter) : Promise.resolve({ data: null, error: null })
            ]);
            
            if (!usersRes.error) setUsers(usersRes.data || []);
            if (!instRes.error) setInstitutions(instRes.data || []);
            if (sectionsRes && !sectionsRes.error) setSections(sectionsRes.data || []);

            // Map attendance percentages
            if (analyticsRes?.data?.studentStats) {
                const map: Record<string, number> = {};
                analyticsRes.data.studentStats.forEach((s: any) => {
                    map[s.id] = s.percentage;
                });
                setAttendanceMap(map);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialSectionId) setSectionFilter(initialSectionId);
    }, [initialSectionId]);

    useEffect(() => {
        fetchData();
    }, [instFilter]);

    // -- Helpers --
    const getAvatarInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.trim().slice(0, 2).toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = ['#3B1F8C', '#0C4A6E', '#064E3B', '#451A03', '#1C1917', '#4A1942'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getAttendanceHealth = (percent: number | undefined) => {
        if (percent === undefined || percent > 100) return { color: 'var(--text-muted)', bg: 'var(--bg-primary)', label: null, risk: false };
        if (percent > 85) return { color: '#34D399', bg: '#064E3B', label: 'EXCELLENT', risk: false };
        if (percent >= 75) return { color: '#F59E0B', bg: '#451A03', label: 'ON TRACK', risk: false };
        return { color: '#F87171', bg: '#450A0A', label: 'AT RISK', risk: true };
    };

    // -- Summary Stats --
    const stats = useMemo(() => {
        const total = users.length;
        let atRisk = 0, onTrack = 0, excellent = 0;
        
        users.forEach(u => {
            const p = attendanceMap[u.id];
            if (p !== undefined) {
                const health = getAttendanceHealth(p);
                if (health.risk) atRisk++;
                else if (p > 85) excellent++;
                else onTrack++;
            }
        });

        return { total, atRisk, onTrack, excellent };
    }, [users, attendanceMap]);

    // -- Filtering --
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesRole = (roleFilter === '' || u.role === roleFilter);
            const matchesSection = (sectionFilter === '' || u.sectionId === sectionFilter);
            
            const p = attendanceMap[u.id];
            const matchesCategory = 
                categoryFilter === 'ALL' ||
                (categoryFilter === 'AT_RISK' && p !== undefined && p < 75) ||
                (categoryFilter === 'EXCELLENT' && p !== undefined && p > 85) ||
                (categoryFilter === 'ON_TRACK' && p !== undefined && p >= 75 && p <= 85);

            return matchesSearch && matchesRole && matchesSection && matchesCategory;
        });
    }, [users, searchTerm, roleFilter, sectionFilter, categoryFilter, attendanceMap]);

    // -- Drawer Logic --
    const openDrawer = async (u: AuthUser) => {
        setDrawerUser(u);
        setDrawerOpen(true);
        setDrawerLoading(true);
        setDrawerData(null);
        try {
            const { data } = await (attendanceApi as any).getUserDetails(u.id);
            if (data) setDrawerData(data);
        } catch (e) {
            showToast('error', 'History Error', 'Failed to load student attendance history.');
        } finally {
            setDrawerLoading(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string, currentPassword?: string) => {
        const { error } = await usersApi.update(userId, { role: newRole, currentPassword });
        if (error) throw new Error(error);
        showToast('success', 'Role Updated', `User role changed to ${newRole}.`);
        fetchData();
    };

    const confirmDeleteUser = async (password: string) => {
        if (!userToDelete) return;
        const { error: verifyErr } = await authApi.verifyPassword(password);
        if (verifyErr) throw new Error(verifyErr);
        const { error } = await usersApi.delete(userToDelete);
        if (error) throw new Error(error);
        showToast('success', 'User Deactivated', 'The user account has been removed.');
        setUserToDelete(null);
        setShowDeleteModal(false);
        fetchData();
    };

    const handleUpdateInstitution = async (userId: string, newId: string | null, password?: string) => {
        const { error: verifyErr } = await authApi.verifyPassword(password || '');
        if (verifyErr) throw new Error(verifyErr);
        const { error } = await usersApi.update(userId, { institutionId: newId });
        if (error) throw new Error(error);
        if (user && userId === user.id) {
            const updated = { ...user, institutionId: newId };
            setUser(updated);
        }
        showToast('success', 'Institution Updated', 'Institutional assignment updated.');
        fetchData();
    };

    if (!isHydrated) {
        return (
            <div className={styles.loadingWrapper}>
                <Loader2 size={40} className="smooth-loader text-primary" />
                <p>Initializing secure session...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>User Management</h1>
                    <p className={styles.subtitle}>Direct student roster and institutional access control</p>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={16} />
                    <input
                        type="text"
                        placeholder="Search student name or email..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <SelectDropdown
                        value={roleFilter}
                        onChange={(val) => setRoleFilter(val)}
                        options={[
                            { label: 'All Roles', value: '' },
                            { label: 'Admins', value: 'ADMIN' },
                            { label: 'Teachers', value: 'TEACHER' },
                            { label: 'Students', value: 'STUDENT' },
                        ]}
                    />
                    <SelectDropdown
                        value={instFilter}
                        onChange={(val) => setInstFilter(val)}
                        options={[
                            { label: 'All Institutions', value: '' },
                            ...institutions.map(inst => ({ label: inst.name, value: inst.id }))
                        ]}
                    />
                    {sections.length > 0 && (
                        <SelectDropdown
                            value={sectionFilter}
                            onChange={(val) => setSectionFilter(val)}
                            options={[
                                { label: 'All Sections', value: '' },
                                ...sections.map(s => ({ label: s.name, value: s.id }))
                            ]}
                        />
                    )}
                </div>
            </div>

            {/* Change 4: Stats Summary Bar */}
            <div className={styles.summaryBar}>
                <div 
                    className={cn(styles.statPill, categoryFilter === 'ALL' && styles.statPillActive)}
                    onClick={() => setCategoryFilter('ALL')}
                >
                    <span className={styles.totalText}>Total: {stats.total} students</span>
                </div>
                <div 
                    className={cn(styles.statPill, categoryFilter === 'AT_RISK' && styles.statPillActive)}
                    onClick={() => setCategoryFilter('AT_RISK')}
                >
                    <AlertCircle size={14} className={styles.atRiskTextPill} />
                    <span className={styles.atRiskTextPill}>At Risk: {stats.atRisk}</span>
                </div>
                <div 
                    className={cn(styles.statPill, categoryFilter === 'ON_TRACK' && styles.statPillActive)}
                    onClick={() => setCategoryFilter('ON_TRACK')}
                >
                    <TrendingUp size={14} className={styles.onTrackTextPill} />
                    <span className={styles.onTrackTextPill}>On Track: {stats.onTrack}</span>
                </div>
                <div 
                    className={cn(styles.statPill, categoryFilter === 'EXCELLENT' && styles.statPillActive)}
                    onClick={() => setCategoryFilter('EXCELLENT')}
                >
                    <CheckCircle2 size={14} className={styles.excellentTextPill} />
                    <span className={styles.excellentTextPill}>Excellent: {stats.excellent}</span>
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingWrapper}>
                    <Loader2 size={40} className="smooth-loader text-primary" />
                    <p>Syncing institutional directory...</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}>S.No</th>
                                <th>User</th>
                                <th>Access Role</th>
                                <th>Institution</th>
                                <th>Joined</th>
                                <th>Attendance</th>
                                <th style={{ width: 120, textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={styles.emptyState}>No records found matching current criteria.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((userItem, index) => {
                                    const percent = attendanceMap[userItem.id];
                                    const health = getAttendanceHealth(percent);
                                    return (
                                        <tr key={userItem.id} className={cn(health.risk && styles.atRiskRow)}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                                {(index + 1).toString().padStart(2, '0')}
                                            </td>
                                            <td>
                                                <div className={styles.userCell}>
                                                    {health.risk && <div className={styles.atRiskDot} />}
                                                    <div 
                                                        className={styles.avatar} 
                                                        style={{ background: getAvatarColor(userItem.name) }}
                                                    >
                                                        {getAvatarInitials(userItem.name)}
                                                    </div>
                                                    <div>
                                                        <div className={styles.userName}>{userItem.name}</div>
                                                        <div className={styles.userEmail}>{userItem.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <SelectDropdown
                                                    value={userItem.role}
                                                    onChange={(val) => {
                                                        setRoleUpdatePending({ userId: userItem.id, newRole: val });
                                                        setShowRoleModal(true);
                                                    }}
                                                    options={[
                                                        { label: 'ADMIN', value: 'ADMIN' },
                                                        { label: 'TEACHER', value: 'TEACHER' },
                                                        { label: 'STUDENT', value: 'STUDENT' },
                                                    ]}
                                                />
                                            </td>
                                            <td>
                                                <SelectDropdown
                                                    value={userItem.institutionId || ''}
                                                    onChange={(newId) => {
                                                        setInstUpdatePending({ userId: userItem.id, newId: newId || null });
                                                        setShowInstModal(true);
                                                    }}
                                                    options={[
                                                        { label: 'Unassigned', value: '' },
                                                        ...institutions.map(inst => ({ label: inst.name, value: inst.id }))
                                                    ]}
                                                />
                                            </td>
                                            <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                                {new Date(userItem.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {percent !== undefined && percent <= 100 ? (
                                                    <div className={styles.attendanceTableCol}>
                                                        <div 
                                                            className={styles.attendanceBadge}
                                                            style={{ background: health.bg, color: health.color }}
                                                        >
                                                            {percent}%
                                                        </div>
                                                        {health.risk && <span className={styles.atRiskLabel}>AT RISK</span>}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button 
                                                        className={styles.iconBtn}
                                                        onClick={() => openDrawer(userItem)}
                                                        title="View History"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className={cn(styles.iconBtn, styles.deleteBtn)}
                                                        onClick={() => {
                                                            setUserToDelete(userItem.id);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        title="Delete Student"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Change 5: Slide-out Drawer */}
            {drawerOpen && (
                <>
                    <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)} />
                    <div className={styles.drawer}>
                        <div className={styles.drawerHeader}>
                            <h2 className={styles.drawerTitle}>Student Profile</h2>
                            <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-primary rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {drawerLoading ? (
                            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
                                <Loader2 size={32} className="smooth-loader text-primary" />
                                <p>Loading attendance data...</p>
                            </div>
                        ) : drawerUser && (
                            <div className="flex-1 overflow-y-auto pr-2">
                                <div className="flex items-center gap-4 mb-8">
                                    <div 
                                        className={cn(styles.avatar, "w-14 h-14 text-xl")} 
                                        style={{ background: getAvatarColor(drawerUser.name) }}
                                    >
                                        {getAvatarInitials(drawerUser.name)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{drawerUser.name}</h3>
                                        <p className="text-muted-foreground text-sm">{drawerUser.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className={styles.drawerSection}>
                                        <span className={styles.drawerLabel}>Role</span>
                                        <span className={styles.drawerValue}>{drawerUser.role}</span>
                                    </div>
                                    <div className={styles.drawerSection}>
                                        <span className={styles.drawerLabel}>Institution</span>
                                        <span className={styles.drawerValue}>
                                            {institutions.find(i => i.id === drawerUser.institutionId)?.name || 'Unassigned'}
                                        </span>
                                    </div>
                                    <div className={styles.drawerSection}>
                                        <span className={styles.drawerLabel}>Attendance</span>
                                        <div className={cn("text-2xl font-black", getAttendanceHealth(drawerData?.percentage).color)}>
                                            {drawerData?.percentage ?? 0}%
                                        </div>
                                    </div>
                                    <div className={styles.drawerSection}>
                                        <span className={styles.drawerLabel}>Joined</span>
                                        <span className={styles.drawerValue}>{new Date(drawerUser.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className={styles.drawerSection}>
                                    <span className={styles.drawerLabel}>Recent Sessions</span>
                                    <div className={styles.historyList}>
                                        {drawerData?.history?.slice(0, 10).map((h: any, i: number) => (
                                            <div key={i} className={styles.historyItem}>
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={16} className="text-muted-foreground" />
                                                    <div>
                                                        <div className="text-sm font-semibold">
                                                            {new Date(h.markedAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {new Date(h.markedAt).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div 
                                                    className={cn("text-[11px] font-bold px-2 py-1 rounded-md", 
                                                        h.status === 'PRESENT' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}
                                                >
                                                    {h.status}
                                                </div>
                                            </div>
                                        ))}
                                        {(!drawerData?.history || drawerData.history.length === 0) && (
                                            <p className="text-sm text-muted-foreground py-4 text-center">No attendance records found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modals */}
            <ConfirmPasswordModal
                isOpen={showRoleModal}
                onClose={() => { setShowRoleModal(false); setRoleUpdatePending(null); }}
                onConfirm={async (p) => {
                    if (roleUpdatePending) {
                        await handleUpdateRole(roleUpdatePending.userId, roleUpdatePending.newRole, p);
                    }
                }}
            />
            <ConfirmPasswordModal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                onConfirm={confirmDeleteUser}
            />
            <ConfirmPasswordModal
                isOpen={showInstModal}
                onClose={() => { setShowInstModal(false); setInstUpdatePending(null); }}
                title="Confirm Institution Change"
                onConfirm={async (p) => {
                    if (instUpdatePending) {
                        await handleUpdateInstitution(instUpdatePending.userId, instUpdatePending.newId, p);
                    }
                }}
            />
        </div>
    );
}
