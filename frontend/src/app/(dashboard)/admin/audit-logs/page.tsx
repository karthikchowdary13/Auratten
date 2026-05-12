'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import RoleGuard from '@/components/auth/RoleGuard';
import { 
    Clock, 
    ShieldCheck, 
    User, 
    Activity, 
    Database, 
    Terminal,
    Loader2
} from 'lucide-react';

export default function AuditLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        const { data } = await adminApi.getAuditLogs();
        if (data) setLogs(data);
        setLoading(false);
    };

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'text-red-400';
        if (action.includes('CREATE')) return 'text-green-400';
        if (action.includes('UPDATE')) return 'text-blue-400';
        return 'text-white/60';
    };

    return (
        <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                    <p className="text-sm text-muted-foreground">Immutable record of all administrative actions performed on the platform</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="smooth-loader text-primary" size={32} />
                            <p className="text-white/40">Fetching security logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-20 text-white/40">
                            <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" />
                            <p>No audit records found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">Admin</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Target</th>
                                        <th className="px-6 py-4">IP Address</th>
                                        <th className="px-6 py-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-mono text-xs">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-white/60">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-primary" />
                                                    ID: {log.admin_id}
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 font-bold ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </td>
                                            <td className="px-6 py-4 text-white/80">
                                                <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[10px] mr-2">
                                                    {log.target_type}
                                                </span>
                                                {log.target_id}
                                            </td>
                                            <td className="px-6 py-4 text-white/40">
                                                {log.ip_address || '---'}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-white/30">
                                                {log.details ? JSON.stringify(log.details) : 'None'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
