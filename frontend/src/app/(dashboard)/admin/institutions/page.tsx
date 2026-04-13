'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import RoleGuard from '@/components/auth/RoleGuard';
import { 
    ShieldCheck, 
    Plus, 
    Building2, 
    MapPin, 
    Users, 
    Layers,
    Trash2,
    Edit2,
    Loader2,
    CheckCircle2
} from 'lucide-react';

export default function InstitutionManagement() {
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newInst, setNewInst] = useState({ name: '', type: 'College', address: '' });

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        setLoading(true);
        const { data } = await adminApi.getInstitutions();
        if (data) setInstitutions(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newInst.name) return;
        const { error } = await adminApi.createInstitution(newInst);
        if (!error) {
            fetchInstitutions();
            setIsAdding(false);
            setNewInst({ name: '', type: 'College', address: '' });
        }
    };

    return (
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Institution Management</h1>
                        <p className="text-sm text-muted-foreground">Manage schools, colleges, and corporate partners</p>
                    </div>
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        {isAdding ? 'Cancel' : <><Plus size={18} /> Add Institution</>}
                    </button>
                </div>

                {isAdding && (
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="e.g. Stanford University"
                                    value={newInst.name}
                                    onChange={e => setNewInst({...newInst, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Type</label>
                                <select 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none"
                                    value={newInst.type}
                                    onChange={e => setNewInst({...newInst, type: e.target.value})}
                                >
                                    <option value="School">School</option>
                                    <option value="College">College</option>
                                    <option value="University">University</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Address / Region</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none"
                                    placeholder="e.g. California, USA"
                                    value={newInst.address}
                                    onChange={e => setNewInst({...newInst, address: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                onClick={handleCreate}
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
                            >
                                Save Institution
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center py-20 gap-3">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <p className="text-white/40">Syncing institutions...</p>
                        </div>
                    ) : institutions.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-white/40">
                            <Building2 size={48} className="mx-auto mb-4 opacity-10" />
                            <p>No institutions registered yet.</p>
                        </div>
                    ) : (
                        institutions.map((inst) => (
                            <div key={inst.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 text-primary transition-colors"><Edit2 size={14} /></button>
                                    <button className="p-2 bg-white/5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 size={14} /></button>
                                </div>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{inst.name}</h3>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-2 py-0.5 bg-white/5 rounded border border-white/10">
                                            {inst.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-white/60">
                                        <MapPin size={16} className="text-primary" />
                                        {inst.address || 'Global Access'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/60">
                                        <Users size={16} className="text-primary" />
                                        Admin ID: {inst.admin_id || 'Not Assigned'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/60">
                                        <Layers size={16} className="text-primary" />
                                        {inst.departments?.length || 0} Departments
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-400 uppercase tracking-wider">
                                        <CheckCircle2 size={12} />
                                        {inst.status}
                                    </div>
                                    <button className="text-xs text-primary font-medium hover:underline">Manage Depts</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
