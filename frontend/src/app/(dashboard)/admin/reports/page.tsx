'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import RoleGuard from '@/components/auth/RoleGuard';
import { 
    BarChart3, 
    Download, 
    FileText, 
    TrendingUp, 
    Users, 
    Calendar,
    ArrowDownToLine,
    Filter,
    Loader2
} from 'lucide-react';

export default function AdminReports() {
    const [loading, setLoading] = useState(false);

    const reportTypes = [
        { title: 'Global Attendance Summary', desc: 'Overview of all institutions and sections', icon: BarChart3, color: '#6366f1' },
        { title: 'Fraud & Spoofing Log', desc: 'List of all flagged attendance attempts', icon: Users, color: '#ef4444' },
        { title: 'Active Session History', desc: 'Detailed log of every QR session created', icon: Calendar, color: '#f59e0b' },
        { title: 'System Audit Trail', desc: 'Chronological list of all admin actions', icon: FileText, color: '#10b981' },
    ];

    return (
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN']}>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
                        <p className="text-sm text-muted-foreground">Extract deep insights and export data for offline use</p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-primary/20 to-transparent border border-white/10 p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <TrendingUp className="text-primary" size={24} />
                            <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-1 rounded">+12% vs last month</span>
                        </div>
                        <h3 className="text-3xl font-bold">89.4%</h3>
                        <p className="text-sm text-white/60">Avg. Plateform Attendance</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <BarChart3 className="text-green-400" size={24} />
                        </div>
                        <h3 className="text-3xl font-bold">1,240</h3>
                        <p className="text-sm text-white/60">Sessions Conducted</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <Users className="text-yellow-500" size={24} />
                        </div>
                        <h3 className="text-3xl font-bold">42</h3>
                        <p className="text-sm text-white/60">Active Institutions</p>
                    </div>
                </div>

                <h2 className="text-lg font-semibold border-b border-white/10 pb-4">Available Reports</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reportTypes.map((report, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div 
                                    className="p-3 rounded-xl"
                                    style={{ background: `${report.color}15`, color: report.color }}
                                >
                                    <report.icon size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold">{report.title}</h3>
                                    <p className="text-xs text-white/40">{report.desc}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-white/5 rounded-xl hover:bg-primary/20 text-primary transition-colors" title="Download PDF">
                                    <Download size={18} />
                                </button>
                                <button className="p-2.5 bg-white/5 rounded-xl hover:bg-green-500/20 text-green-400 transition-colors" title="Export CSV">
                                    <ArrowDownToLine size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Section for Advanced Export */}
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
                    <h3 className="text-xl font-bold mb-6">Advanced Data Export</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Institution</label>
                            <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer">
                                <option>All Institutions</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Date Range</label>
                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5">
                                <Calendar size={16} className="text-white/30" />
                                <span className="text-sm">Last 30 Days</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Format</label>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-primary text-[11px] font-bold py-2.5 rounded-lg">PDF</button>
                                <button className="flex-1 bg-white/5 text-[11px] font-bold py-2.5 rounded-lg border border-white/10">CSV</button>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button 
                                onClick={() => {
                                    const url = adminApi.getExportUrl();
                                    import('@/lib/api').then(m => m.downloadFile(url, 'attendance_report.csv'));
                                }}
                                className="w-full bg-white text-black text-sm font-bold py-2.5 rounded-xl hover:bg-white/80 transition-all shadow-xl shadow-white/10"
                            >
                                Generate & Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
