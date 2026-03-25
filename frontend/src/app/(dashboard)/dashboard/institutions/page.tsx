'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Building2,
    MapPin,
    Hash,
    Loader2,
    CheckCircle2,
    XCircle,
    Trash2
} from 'lucide-react';
import { institutionsApi, authApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmPasswordModal from '@/components/ui/ConfirmPasswordModal';
import styles from './institutions.module.css';
import { useToast } from '@/context/ToastContext';

interface Institution {
    id: string;
    name: string;
    code: string;
    address: string | null;
    isActive: boolean;
    createdAt: string;
}

export default function InstitutionsPage() {
    const { showToast } = useToast();
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [instToDelete, setInstToDelete] = useState<Institution | null>(null);

    const fetchInstitutions = async () => {
        setLoading(true);
        const { data, error: apiErr } = await institutionsApi.findAll();
        if (apiErr) {
            console.error(apiErr);
        } else {
            setInstitutions(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError('');

        const { error: apiErr } = await institutionsApi.create({
            name: newName,
            code: newCode.toUpperCase(),
            address: newAddress,
        });

        if (apiErr) {
            setError(apiErr);
        } else {
            setIsCreateModalOpen(false);
            setNewName('');
            setNewCode('');
            setNewAddress('');
            showToast('success', 'Institution Onboarded', `${newName} has been successfully added to the platform.`);
            fetchInstitutions();
        }
        setFormLoading(false);
    };

    const handleDeleteClick = (inst: Institution) => {
        setInstToDelete(inst);
        setShowDeleteModal(true);
    };

    const confirmDeleteInst = async (password: string) => {
        if (!instToDelete) return;

        try {
            // Use centralized authApi instead of broken proxy fetch
            const { error: authErr } = await authApi.verifyPassword(password);

            if (authErr) {
                throw new Error(authErr);
            }

            const { error: apiErr } = await institutionsApi.deactivate(instToDelete.id);
            if (apiErr) throw new Error(apiErr);

            showToast('success', 'Institution Deactivated', `${instToDelete.name} has been deactivated.`);
            setInstToDelete(null);
            setShowDeleteModal(false);
            fetchInstitutions();
        } catch (err: any) {
            showToast('error', 'Authentication Failed', err.message);
        }
    };

    const filteredInstitutions = institutions.filter(inst =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Institutions</h1>
                    <p className={styles.subtitle}>Manage global organizations and their access codes</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} /> Add Institution
                </Button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingWrapper}>
                    <Loader2 size={40} className="animate-spin" />
                    <p>Loading your institutions...</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Institution Name</th>
                                <th>Unique Code</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInstitutions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={styles.emptyState}>
                                        No institutions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredInstitutions.map((inst) => (
                                    <tr key={inst.id}>
                                        <td>
                                            <div className={styles.instName}>{inst.name}</div>
                                        </td>
                                        <td>
                                            <span className={styles.instCode}>{inst.code}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                                                <MapPin size={14} />
                                                {inst.address || 'Global / Online'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${inst.isActive ? styles.statusActive : styles.statusInactive}`}>
                                                {inst.isActive ? (
                                                    <><CheckCircle2 size={12} style={{ marginRight: 4 }} /> Active</>
                                                ) : (
                                                    <><XCircle size={12} style={{ marginRight: 4 }} /> Inactive</>
                                                )}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                            {new Date(inst.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button
                                                className={styles.actionButton}
                                                style={{ color: 'var(--error)' }}
                                                onClick={() => handleDeleteClick(inst)}
                                                title={inst.isActive ? "Deactivate Institution" : "Delete Institution"}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Onboard New Institution"
            >
                <form onSubmit={handleCreate} className={styles.form}>
                    {error && <div className="errorBanner">{error}</div>}

                    <Input
                        label="Institution Name"
                        placeholder="e.g. Stanford University"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />

                    <Input
                        label="Unique Access Code"
                        placeholder="e.g. STANFORD2024"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        required
                    />

                    <Input
                        label="Full Address (Optional)"
                        placeholder="Street, City, Country"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                    />

                    <div className={styles.formFooter}>
                        <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} type="button">
                            Cancel
                        </Button>
                        <Button type="submit" loading={formLoading}>
                            Confirm Onboard
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmPasswordModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setInstToDelete(null);
                }}
                onConfirm={confirmDeleteInst}
            />
        </div>
    );
}
