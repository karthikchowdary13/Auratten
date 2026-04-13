'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import RoleGuard from '@/components/auth/RoleGuard';
import { 
    Users, 
    ShieldCheck, 
    QrCode, 
    Clock, 
    CheckCircle2, 
    AlertTriangle,
    BarChart3,
    ArrowUpRight
} from 'lucide-react';
import styles from '../dashboard/dashboard.module.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const { data, error } = await adminApi.getStats();
        if (data) setStats(data);
        setLoading(false);
    };

    const cards = [
        { label: 'Total Users', value: stats?.total_users || 0, sub: `${stats?.active_users || 0} active`, icon: Users, color: '#6366f1' },
        { label: 'Institutions', value: stats?.total_institutions || 0, sub: 'Enrolled', icon: ShieldCheck, color: '#10b981' },
        { label: 'Live Sessions', value: stats?.live_sessions || 0, sub: 'Currently active', icon: QrCode, color: '#f59e0b' },
        { label: 'Pending Approvals', value: stats?.pending_approvals || 0, sub: 'Needs action', icon: Clock, color: '#ef4444' },
    ];

    return (
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN']}>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Admin Command Center
                    </h1>
                    <p className="text-muted-foreground mt-2">Overseeing the Auratten ecosystem</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div 
                                    className="p-3 rounded-xl"
                                    style={{ background: `${card.color}20`, color: card.color }}
                                >
                                    <card.icon size={24} />
                                </div>
                                <ArrowUpRight className="text-white/20 group-hover:text-white/60 transition-colors" size={20} />
                            </div>
                            <h3 className="text-3xl font-bold">{card.value}</h3>
                            <p className="text-sm text-white/60 font-medium mt-1">{card.label}</p>
                            <p className="text-xs text-white/40 mt-2">{card.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Placeholder for Recent Approvals */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="text-primary" size={20} />
                                Pending Requests
                            </h3>
                            <button className="text-xs text-primary hover:underline">View all</button>
                        </div>
                        {loading ? (
                            <div className="flex justify-center p-8"><Clock className="animate-spin" /></div>
                        ) : stats?.pending_approvals === 0 ? (
                            <div className="text-center py-12 text-white/40">
                                <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
                                <p>All clear! No pending requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Sample request item */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">J</div>
                                        <div>
                                            <p className="text-sm font-medium">John Doe</p>
                                            <p className="text-xs text-white/40">john@example.com</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30 transition-colors">Approve</button>
                                        <button className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors">Reject</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Placeholder for Fraud Alerts */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <AlertTriangle className="text-yellow-500" size={20} />
                                Fraud Alerts
                            </h3>
                            <button className="text-xs text-primary hover:underline">Logs</button>
                        </div>
                        <div className="text-center py-12 text-white/40">
                            <BarChart3 size={40} className="mx-auto mb-3 opacity-20" />
                            <p>No active spoofing attempts flagged today.</p>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
