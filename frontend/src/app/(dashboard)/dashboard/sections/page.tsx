'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Layers, Plus, Users, Trash2, X, AlertCircle, Loader2, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { sectionsApi, authApi, usersApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmPasswordModal from '@/components/ui/ConfirmPasswordModal';
import { useToast } from '@/context/ToastContext';
import styles from './sections.module.css';
import { cn } from '@/lib/utils';

export default function SectionsPage() {
    const { user, isHydrated } = useAuthStore();
    const { showToast } = useToast();
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [sectionToDelete, setSectionToDelete] = useState<{ id: string, name: string } | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Students Modal state
    const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    const loadSections = async () => {
        const instId = user?.institutionId || (user as any)?.institution_id;
        if (!instId) return;
        setLoading(true);
        const { data, error: apiErr } = await sectionsApi.getByInstitution(instId);
        if (apiErr) setError(apiErr);
        else setSections(data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadSections();
    }, [user]);

    // -- Summary Stats --
    const summaryStats = useMemo(() => {
        if (!sections || !sections.length) return null;
        const totalStudents = sections.reduce((acc, s) => acc + (s.studentCount || 0), 0);
        const validStats = sections.filter(s => typeof s.avgAttendance30Days === 'number');
        const avgAtt = validStats.length > 0 
            ? Math.round(validStats.reduce((acc, s) => acc + s.avgAttendance30Days, 0) / validStats.length)
            : 0;
            
        return {
            count: sections.length,
            totalStudents,
            avgAtt
        };
    }, [sections]);

    const handleCreateSection = async (password: string) => {
        const instId = user?.institutionId || (user as any)?.institution_id;
        if (!newSectionName.trim() || !instId) return;
        setCreateLoading(true);
        try {
            const { error: verifyErr } = await authApi.verifyPassword(password);
            if (verifyErr) {
                showToast('error', 'Verification Failed', verifyErr);
                return;
            }

            const { error: apiErr } = await sectionsApi.create(instId, newSectionName.trim());
            if (apiErr) {
                showToast('error', 'Failed to create section', apiErr);
            } else {
                showToast('success', 'Section Created', `"${newSectionName}" has been added.`);
                setNewSectionName('');
                setIsCreateModalOpen(false);
                loadSections();
            }
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteSection = async (password: string) => {
        if (!sectionToDelete) return;
        try {
            const { error: verifyErr } = await authApi.verifyPassword(password);
            if (verifyErr) {
                showToast('error', 'Verification Failed', verifyErr);
                return;
            }

            const { error: apiErr } = await sectionsApi.delete(sectionToDelete.id);
            if (apiErr) {
                showToast('error', 'Delete failed', apiErr);
            } else {
                showToast('success', 'Section Deleted', `"${sectionToDelete.name}" has been removed.`);
                setSectionToDelete(null);
                setIsDeleteModalOpen(false);
                loadSections();
            }
        } finally {}
    };

    const handleViewStudents = async (section: any) => {
        setSelectedSection(section);
        setIsStudentsModalOpen(true);
        setStudentsLoading(true);
        setStudents([]);

        const instId = user?.institutionId || (user as any)?.institution_id;
        const { data, error } = await usersApi.findAll(instId || '', section.id);
        if (data) {
            setStudents(data);
        } else if (error) {
            showToast('error', 'Failed to load students', error);
        }
        setStudentsLoading(false);
    };

    const formatLastSession = (dateStr: string | null) => {
        if (!dateStr) return 'No sessions yet';
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        if (diffDays === 1) return `Yesterday`;
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getHealthClass = (avg: number, hasData: boolean) => {
        if (!hasData) return styles.healthNone;
        if (avg > 85) return styles.healthHigh;
        if (avg >= 75) return styles.healthMedium;
        return styles.healthLow;
    };

    const getSparklineColor = (percent: number) => {
        if (percent > 85) return '#34D399';
        if (percent >= 75) return '#F59E0B';
        return '#EF4444';
    };

    if (!isHydrated) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p>Syncing secure workspace...</p>
                </div>
            </div>
        );
    }

    const currentInstId = user?.institutionId || (user as any)?.institution_id;
    if (!currentInstId) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyCard} style={{ marginTop: 100 }}>
                    <AlertCircle size={48} color="#EF4444" />
                    <h3>Workspace Required</h3>
                    <p>Please set up your institution workspace first.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Sections Management</h1>
                    <p className={styles.subtitle}>Manage student groupings for your institution</p>
                    {summaryStats && (
                        <div className={styles.summaryLine}>
                            <span>{summaryStats.count} Sections</span>
                            <span className={styles.bullet}>•</span>
                            <span>{summaryStats.totalStudents} Total Students</span>
                            <span className={styles.bullet}>•</span>
                            <span>{summaryStats.avgAtt}% Avg Attendance</span>
                        </div>
                    )}
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus size={18} /> Add Section
                </Button>
            </div>
 
            {error && (
                <div className={cn(styles.error, "mb-6 animate-fadeIn")}>
                    <AlertCircle size={20} />
                    <p>{error}</p>
                    <Button variant="ghost" size="sm" onClick={loadSections} className="ml-auto underline decoration-dotted">
                        Retry Sync
                    </Button>
                </div>
            )}
 
            {loading ? (
                <div className={styles.loading}>
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p>Fetching institutional sections...</p>
                </div>
            ) : sections.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyCard}>
                        <div className={styles.emptyIcon}>
                            <Layers size={32} />
                        </div>
                        <h3>Create your first section</h3>
                        <p>Start tracking attendance by grouping your students into sections.</p>
                        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} className="px-8 font-bold">
                            <Plus size={18} className="mr-2" /> Add Section
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={styles.grid}>
                    {sections.map((section) => {
                        const hasData = !!section.lastSessionAt;
                        return (
                            <div key={section.id} className={cn(styles.card, getHealthClass(section.avgAttendance30Days, hasData))}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.sectionIcon}>
                                        <Layers size={18} />
                                    </div>
                                    <button 
                                        className={styles.deleteBtn}
                                        onClick={() => {
                                            setSectionToDelete({ id: section.id, name: section.name });
                                            setIsDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <div>
                                    <h3 className={styles.sectionName}>{section.name}</h3>
                                    <div className={styles.statsRow}>
                                        <div className={styles.stats}>
                                            <Users size={14} />
                                            <span>{section.studentCount || 0} Students</span>
                                        </div>
                                    </div>

                                    <div className={styles.attendanceInfo}>
                                        <div className="flex justify-between items-center">
                                            <span>
                                                <span className={styles.avgText}>{section.avgAttendance30Days}%</span> avg attendance
                                            </span>
                                            {section.last7History && section.last7History.length > 0 && (
                                                <div className={styles.sparklineWrapper}>
                                                    {section.last7History.map((val: number, i: number) => (
                                                        <div 
                                                            key={i} 
                                                            title={`${val}% attendance`}
                                                            style={{ 
                                                                width: 4, 
                                                                height: `${Math.max(4, (val / 100) * 24)}px`, 
                                                                background: getSparklineColor(val),
                                                                borderRadius: 2
                                                            }} 
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.lastSession}>
                                            Last session: {formatLastSession(section.lastSessionAt)}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <Button 
                                        variant="secondary" 
                                        fullWidth 
                                        size="sm"
                                        onClick={() => handleViewStudents(section)}
                                        className="font-semibold"
                                    >
                                        View Students
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Section Modal */}
            {isCreateModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={styles.modalTitle}>New Section</h2>
                            <button onClick={() => setIsCreateModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <p className={styles.modalSub}>
                            Organize your students into groups for efficient tracking.
                        </p>
                        <form onSubmit={(e) => { e.preventDefault(); setShowPasswordModal(true); }} className="space-y-6">
                            <Input
                                label="Section Name"
                                placeholder="e.g. CS-201, Grade 10-A"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                required
                            />
                            <div className="flex gap-3">
                                <Button type="button" variant="ghost" fullWidth onClick={() => setIsCreateModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" fullWidth loading={createLoading}>
                                    Create Section
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Students List Modal */}
            {isStudentsModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsStudentsModalOpen(false)}>
                    <div className={cn(styles.modal, styles.studentsModal)} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className={styles.modalTitle}>{selectedSection?.name} Enrollment</h2>
                                <p className={styles.modalSub}>Current students in this section</p>
                            </div>
                            <button onClick={() => setIsStudentsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.studentsListWrapper}>
                            {studentsLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 size={24} className="animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Syncing member list...</p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Users size={32} className="mx-auto mb-3 opacity-20" />
                                    <p>No students assigned yet.</p>
                                </div>
                            ) : (
                                <div className={styles.studentsList}>
                                    {students.map((student) => (
                                        <div key={student.id} className={styles.studentItem}>
                                            <div className="flex items-center gap-3">
                                                <div className={styles.studentAvatar}>{student.name[0]}</div>
                                                <div>
                                                    <div className={styles.studentName}>{student.name}</div>
                                                    <div className={styles.studentEmail}>{student.email}</div>
                                                </div>
                                            </div>
                                            <span className={styles.rollBadge}>{student.rollNumber || 'ID-NONE'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button variant="secondary" onClick={() => setIsStudentsModalOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ConfirmPasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title="Confirm Creation"
                onConfirm={handleCreateSection}
            />

            <ConfirmPasswordModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Removal"
                description={`Delete "${sectionToDelete?.name}"? All students will be unassigned.`}
                onConfirm={handleDeleteSection}
            />
        </div>
    );
}
