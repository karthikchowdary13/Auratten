'use client';

import { useEffect, useState } from 'react';
import { adminApi, attendanceApi } from '@/lib/api';
import RoleGuard from '@/components/auth/RoleGuard';
import { 
    QrCode, 
    UserCheck, 
    AlertTriangle, 
    Calendar,
    Users,
    MoreVertical,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Download
} from 'lucide-react';

export default function AdminAttendance() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        // Using existing attendance history for now as a base
        const { data } = await attendanceApi.getRecent();
        if (data) setSessions(data);
        setLoading(false);
    };

    return (
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN']}>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Attendance & QR Control</h1>
                        <p className="text-sm text-muted-foreground">Monitor live sessions, override records, and handle fraud logs</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-all">
                            <Download size={18} /> Export Data
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Sessions Overview */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <QrCode size={20} className="text-primary" />
                                    Active / Global Sessions
                                </h3>
                            </div>
                            
                            {loading ? (
                                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                                            <tr>
                                                <th className="px-6 py-4">Institution/Section</th>
                                                <th className="px-6 py-4">Created By</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Attendance</th>
                                                <th className="px-6 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {/* Seed some sample session data if empty */}
                                            {sessions.length === 0 ? (
                                                <tr><td colSpan={5} className="p-10 text-center text-white/20">No active global sessions found.</td></tr>
                                            ) : (
                                                sessions.slice(0, 10).map((session, i) => (
                                                    <tr key={i} className="hover:bg-white/[0.02]">
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium">{session.qrSession?.section?.name || 'Main Hall'}</p>
                                                            <p className="text-xs text-white/40">{session.qrSession?.institution?.name || 'Auratten Main'}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-white/60">
                                                            {session.qrSession?.createdBy?.name || 'System Admin'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 uppercase">
                                                                Active
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-primary" style={{ width: '45%' }}></div>
                                                                </div>
                                                                <span className="text-xs text-white/40">45%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button className="text-white/40 hover:text-white transition-colors"><MoreVertical size={18} /></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fraud Alerts Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="font-semibold flex items-center gap-2 mb-6">
                                <AlertTriangle size={20} className="text-yellow-500" />
                                Flagged Attempts
                            </h3>
                            <div className="space-y-4">
                                {[1, 2].map((_, i) => (
                                    <div key={i} className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-[10px] font-bold text-red-400 hover:underline">Dismiss</button>
                                        </div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500"><AlertTriangle size={14} /></div>
                                            <div>
                                                <p className="text-sm font-bold">Suspicious Location</p>
                                                <p className="text-[10px] text-white/40">Student #420 • 2m ago</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-white/60 leading-relaxed">
                                            Attempted scan from IP 103.24.xx.xx which is 5km outside of session boundary.
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2 text-xs font-semibold border border-white/10 rounded-xl hover:bg-white/5 transition-all">View All Alerts</button>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
