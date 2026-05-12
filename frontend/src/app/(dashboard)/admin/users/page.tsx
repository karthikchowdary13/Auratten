'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import RoleGuard from '@/components/auth/RoleGuard';
import { 
    Users, 
    Search, 
    Filter, 
    MoreVertical,
    CheckCircle2,
    XCircle,
    UserMinus,
    UserCog,
    History as HistoryIcon,
    Loader2
} from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await adminApi.getUsers();
        if (data) setUsers(data);
        setLoading(false);
    };

    const handleUpdateStatus = async (userId: string, status: string) => {
        const { error } = await adminApi.updateUser(userId, { status });
        if (!error) fetchUsers();
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to permanently delete this user?')) {
            const { error } = await adminApi.deleteUser(userId);
            if (!error) fetchUsers();
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN']}>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-sm text-muted-foreground">Manage accounts, roles, and access across the platform</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={18} className="text-white/30" />
                        <select 
                            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="smooth-loader text-primary" size={32} />
                            <p className="text-white/40 animate-pulse">Loading user database...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-20 text-white/40">
                            <Users size={48} className="mx-auto mb-4 opacity-10" />
                            <p>No users found matching your criteria.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-white/40 text-xs font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Active</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-white/40">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md border border-white/10">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                user.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-white/40">
                                            {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {user.status === 'PENDING' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(user.id, 'ACTIVE')}
                                                        className="p-1.5 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {}} // Open role change modal
                                                    className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                                                    title="Change Role"
                                                >
                                                    <UserCog size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <UserMinus size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
