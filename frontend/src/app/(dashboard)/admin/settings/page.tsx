'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import RoleGuard from '@/components/auth/RoleGuard';
import { 
    Settings as SettingsIcon, 
    Mail, 
    Clock, 
    Save,
    Bell,
    MailOpen,
    ShieldAlert,
    Loader2
} from 'lucide-react';

export default function AdminSettings() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data } = await adminApi.getSettings();
        if (data) setSettings(data);
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const { error } = await adminApi.updateSettings(settings);
        if (!error) alert('Settings saved successfully!');
        setSaving(false);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/40">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p>Loading system configuration...</p>
        </div>
    );

    return (
        <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">System Settings</h1>
                        <p className="text-sm text-muted-foreground">Global configuration for the Auratten platform</p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* General & Security */}
                    <div className="space-y-6">
                        <section className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <ShieldAlert className="text-primary" size={20} />
                                QR & Sessions
                            </h3>
                            
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Clock size={14} /> QR Rotation Interval (Seconds)
                                </label>
                                <input 
                                    type="number"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={settings?.qr_expiry_seconds}
                                    onChange={e => setSettings({...settings, qr_expiry_seconds: parseInt(e.target.value)})}
                                />
                                <p className="text-[10px] text-white/30 mt-2">How often the QR code token rotates to prevent fraud.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Clock size={14} /> Default Session Timeout (Minutes)
                                </label>
                                <input 
                                    type="number"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={settings?.session_timeout_minutes}
                                    onChange={e => setSettings({...settings, session_timeout_minutes: parseInt(e.target.value)})}
                                />
                            </div>
                        </section>

                        <section className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <Bell className="text-green-400" size={20} />
                                Notifications
                            </h3>
                            
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Mail size={14} /> Admin Notification Email
                                </label>
                                <input 
                                    type="email"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={settings?.admin_notification_email}
                                    onChange={e => setSettings({...settings, admin_notification_email: e.target.value})}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Email Templates */}
                    <div className="space-y-6">
                        <section className="bg-white/5 border border-white/10 p-6 rounded-2xl h-full flex flex-col">
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                <MailOpen className="text-yellow-500" size={20} />
                                Email Templates
                            </h3>
                            
                            <div className="flex-1 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">User Approval Email</label>
                                    <textarea 
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm h-32 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                        value={settings?.approval_email_template}
                                        onChange={e => setSettings({...settings, approval_email_template: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">User Rejection Email</label>
                                    <textarea 
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm h-32 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                        value={settings?.rejection_email_template}
                                        onChange={e => setSettings({...settings, rejection_email_template: e.target.value})}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
