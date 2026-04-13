'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { 
    User, 
    Mail, 
    Building, 
    Calendar, 
    Edit2, 
    Check, 
    X, 
    BarChart3, 
    Users, 
    Clock, 
    Activity,
    Lock,
    Bell,
    Trash2,
    ChevronRight,
    Search,
    Phone,
    Camera
} from 'lucide-react';
import { 
    Button, 
    Input, 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent, 
    Badge, 
    Table, 
    TableHeader, 
    TableBody, 
    TableRow, 
    TableHead, 
    TableCell,
    Switch,
    Skeleton
} from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { authApi, qrApi, attendanceApi, usersApi } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user, updateUser: updateUserStore } = useAuthStore();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    // Section 1: Identity State
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(user?.name || '');
    
    // Section 4: Settings State
    const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
    const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [mobileInput, setMobileInput] = useState(user?.mobileNumber || '');
    const [emailInput, setEmailInput] = useState(user?.email || '');
    
    const [notifications, setNotifications] = useState({
        absenceAlerts: true,
        weeklySummary: true,
        lowAttendance: true
    });
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isPhotoPopupOpen, setIsPhotoPopupOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('auratten-notifications');
            if (saved) setNotifications(JSON.parse(saved));
        }
    }, []);

    const saveNotifications = (newPrefs: typeof notifications) => {
        setNotifications(newPrefs);
        localStorage.setItem('auratten-notifications', JSON.stringify(newPrefs));
    };

    // Queries
    const { data: qrHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['qr-history', user?.institutionId],
        queryFn: async () => {
            const res = await qrApi.getHistory(user?.institutionId || undefined);
            return res.data || [];
        },
        enabled: !!user?.id
    });

    const { data: students, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['students-count', user?.institutionId],
        queryFn: async () => {
            const res = await usersApi.findAll(user?.institutionId || undefined);
            return (res.data || []).filter((u: any) => u.role === 'STUDENT');
        },
        enabled: !!user?.id && user?.role === 'TEACHER'
    });

    // Mutations
    const updateUserStore = useAuthStore((state) => state.updateUser);

    const updateNameMutation = useMutation({
        mutationFn: (newName: string) => usersApi.update(user!.id, { name: newName }),
        onSuccess: (res) => {
            if (res.error) {
                alert('Failed to update name: ' + res.error);
                return;
            }
            setIsEditingName(false);
            if (res.data) updateUserStore(res.data);
        },
        onError: (error: any) => console.error(error.message || 'Update failed')
    });

    const updateContactMutation = useMutation({
        mutationFn: (data: { email?: string; mobileNumber?: string }) => usersApi.update(user!.id, data),
        onSuccess: (res) => {
            if (res.error) {
                alert('Failed to update contact info: ' + res.error);
                return;
            }
            setIsContactInfoOpen(false);
            if (res.data) updateUserStore(res.data);
        },
        onError: (error: any) => console.error(error.message || 'Update contact failed')
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadAvatarMutation = useMutation({
        mutationFn: (file: File) => usersApi.uploadAvatar(user!.id, file),
        onSuccess: (res) => {
            if (res.error) {
                alert('Failed to upload photo: ' + res.error);
                return;
            }
            if (res.data) updateUserStore({ avatar: res.data.avatarUrl });
        },
        onError: (error: any) => console.error(error.message || 'Upload failed')
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Create local preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            
            uploadAvatarMutation.mutate(file, {
                onSuccess: () => {
                    // Preview can be cleared as user.avatar will now be updated
                    setPreviewUrl(null);
                },
                onError: () => {
                    setPreviewUrl(null);
                    alert('Upload failed. Please try again.');
                }
            });
        }
    };

    const changePasswordMutation = useMutation({
        mutationFn: () => authApi.changePassword({ currentPassword, newPassword }),
        onSuccess: (res) => {
            if (res.error) {
                showToast('error', 'Update Failed', res.error);
                return;
            }
            showToast('success', 'Security Updated', 'Your password has been changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsPasswordChangeOpen(false);
            
            // update local password update timestamp if we want, or just let it be next refresh
            if (user) updateUserStore({ ...user, passwordUpdatedAt: new Date().toISOString() });
        },
        onError: (error: any) => {
            showToast('error', 'Critical Error', error.message || 'Password update failed');
        }
    });

    const deleteAccountMutation = useMutation({
        mutationFn: () => usersApi.delete(user!.id, deletePassword),
        onSuccess: (res) => {
            if (res.error) {
                alert('Account deletion failed: ' + res.error);
                return;
            }
            useAuthStore.getState().logout();
            window.location.href = '/login';
        },
        onError: (error: any) => {
            alert(error.message || 'Account deletion failed. Please check your password.');
        }
    });

    if (!isMounted || !user) {
        return (
            <div className="max-w-[800px] mx-auto p-8 space-y-12 animate-in fade-in duration-500">
                <Skeleton className="h-[200px] w-full rounded-2xl" />
                <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    // Helpers
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Stat Calculations
    const stats = {
        sessionsThisMonth: qrHistory?.filter((s: any) => new Date(s.createdAt).getMonth() === new Date().getMonth()).length || 0,
        studentsManaged: students?.length || 0,
        avgAttendance: qrHistory?.length ? Math.round(qrHistory.reduce((acc: number, s: any) => acc + (s.attendancePercentage || 0), 0) / qrHistory.length) : 0,
        activeToday: qrHistory?.filter((s: any) => isToday(new Date(s.createdAt))).length || 0
    };

    return (
        <div className="max-w-[800px] mx-auto p-8 space-y-12 animate-in fade-in duration-500">
            {/* SECTION 1: Identity Card */}
            <Card className="bg-card/50 backdrop-blur-2xl border-white/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                    {!isEditingName ? (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)} className="text-muted-foreground hover:text-primary">
                            <Edit2 size={16} className="mr-2" /> Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsEditingName(false)} className="text-destructive">
                                <X size={16} className="mr-1" /> Cancel
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => updateNameMutation.mutate(nameInput)}>
                                <Check size={16} className="mr-1" /> Save
                            </Button>
                        </div>
                    )}
                </div>
                
                <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="flex flex-col items-center gap-4 relative">
                        <div 
                            className="relative w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary text-3xl font-bold shadow-2xl shadow-primary/20 overflow-hidden group shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            onClick={() => {
                                if (isEditingName) {
                                    fileInputRef.current?.click();
                                } else {
                                    setIsPhotoPopupOpen(true);
                                }
                            }}
                        >
                            {previewUrl ? (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover animate-pulse"
                                />
                            ) : user?.avatar ? (
                                <img 
                                    src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${user.avatar}`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.name ? getInitials(user.name) : <User size={40} />
                            )}
                            
                            {isEditingName && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center">
                                    {uploadAvatarMutation.isPending ? (
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">Wait...</span>
                                    ) : (
                                        <>
                                            <Camera size={20} className="text-white mb-1" />
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider text-center leading-tight mt-1">Edit<br/>Photo</span>
                                        </>
                                    )}
                                </div>
                            )}
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            {isEditingName ? (
                                <Input 
                                    value={nameInput} 
                                    onChange={(e) => setNameInput(e.target.value)}
                                    className="max-w-xs text-xl font-bold h-9"
                                />
                            ) : (
                                <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
                            )}
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 uppercase tracking-tighter text-[10px] px-3 font-bold">
                                {user?.role}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Building size={16} className="text-primary/60" />
                                <span>Auratten Academy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-primary/60" />
                                <span>{user?.email}</span>
                            </div>
                            {user?.mobileNumber && (
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-primary/60" />
                                    <span>{user.mobileNumber}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-primary/60" />
                                <span>Member since March 2026</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 2: Activity Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Sessions This Month', value: stats.sessionsThisMonth, icon: Activity },
                    { label: 'Students Managed', value: stats.studentsManaged, icon: Users },
                    { label: 'Avg Attendance Rate', value: `${stats.avgAttendance}%`, icon: BarChart3 },
                    { label: 'Active Today', value: stats.activeToday, icon: Clock },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/30 border-white/5 p-5 hover:bg-white/5 transition-all group">
                        {(isLoadingHistory || isLoadingStudents) ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-2xl font-bold text-primary tracking-tight">{stat.value}</p>
                                    <stat.icon size={18} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            </>
                        )}
                    </Card>
                ))}
            </div>

            {/* SECTION 3: Recent Sessions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Clock size={20} className="text-primary" /> Recent Sessions
                    </h2>
                    <Button variant="ghost" size="sm" className="text-primary text-xs font-bold uppercase tracking-wider">
                        View All <ChevronRight size={14} className="ml-1" />
                    </Button>
                </div>
                <Card className="bg-card/20 border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">Section</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">Date</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">Duration</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">Attendance %</TableHead>
                                    <TableHead className="text-[10px] uppercase font-bold tracking-wider text-right whitespace-nowrap">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingHistory ? (
                                    [1, 2, 3].map(i => (
                                        <TableRow key={i} className="border-white/5"><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                                    ))
                                ) : qrHistory?.slice(0, 5).map((session: any) => (
                                    <TableRow key={session.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-semibold text-foreground whitespace-nowrap">{session.section?.name || 'General'}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{session.expiresInMinutes}m</TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "font-bold",
                                                (session.attendancePercentage || 0) >= 80 ? "text-green-400" :
                                                (session.attendancePercentage || 0) >= 50 ? "text-amber-400" : "text-red-400"
                                            )}>
                                                {session.attendancePercentage || 0}%
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={session.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-[9px] px-2 py-0">
                                                {session.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* SECTION 4: Account Settings */}
            <div className="space-y-8">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Lock size={20} className="text-primary" /> Account Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8 h-full">
                        {/* Subsection A: Change Password */}
                        <Card className="bg-card/30 border-white/5 p-6">
                            <CardTitle className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Lock size={18} className="text-primary/70" /> Security
                            </CardTitle>
                            
                            <div 
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" 
                                onClick={() => setIsPasswordChangeOpen(!isPasswordChangeOpen)}
                            >
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Password</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Last updated: {user?.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleDateString() : 'Never'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-primary">Change</span>
                                    <ChevronRight className={cn("text-muted-foreground transition-transform", isPasswordChangeOpen && "rotate-90")} size={16} />
                                </div>
                            </div>

                            {isPasswordChangeOpen && (
                                <div className="space-y-4 mt-4 p-4 border border-white/5 bg-black/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Current Password</label>
                                        <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-white/5 border-white/10" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">New Password</label>
                                        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-white/5 border-white/10" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Confirm New Password</label>
                                        <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-white/5 border-white/10" placeholder="••••••••" />
                                    </div>
                                    <Button 
                                        className="w-full mt-4" 
                                        disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || changePasswordMutation.isPending}
                                        onClick={() => changePasswordMutation.mutate()}
                                    >
                                        {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* Subsection C: Contact Info */}
                        <Card className="bg-card/30 border-white/5 p-6">
                            <CardTitle className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Mail size={18} className="text-primary/70" /> Contact Info
                            </CardTitle>
                            
                            <div 
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" 
                                onClick={() => setIsContactInfoOpen(!isContactInfoOpen)}
                            >
                                <div className="space-y-1.5">
                                    <p className="text-sm font-semibold text-foreground">Email & Mobile</p>
                                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                                        <span>{user?.email || 'No email set'}</span>
                                        <span>{user?.mobileNumber || 'No mobile set'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-primary">Edit</span>
                                    <ChevronRight className={cn("text-muted-foreground transition-transform", isContactInfoOpen && "rotate-90")} size={16} />
                                </div>
                            </div>

                            {isContactInfoOpen && (
                                <div className="space-y-4 mt-4 p-4 border border-white/5 bg-black/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Email Address</label>
                                        <Input value={emailInput} onChange={e => setEmailInput(e.target.value)} className="bg-white/5 border-white/10" placeholder="your@email.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Mobile Number</label>
                                        <Input value={mobileInput} onChange={e => setMobileInput(e.target.value)} className="bg-white/5 border-white/10" placeholder="+1 (555) 000-0000" />
                                    </div>
                                    <Button 
                                        className="w-full mt-4"
                                        variant="secondary"
                                        disabled={updateContactMutation.isPending || (mobileInput === (user?.mobileNumber || '') && emailInput === (user?.email || ''))}
                                        onClick={() => updateContactMutation.mutate({ mobileNumber: mobileInput, email: emailInput })}
                                    >
                                        {updateContactMutation.isPending ? 'Saving...' : 'Save Contact Info'}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Subsection B: Notification Preferences */}
                    <Card className="bg-card/30 border-white/5 p-6 h-full">
                        <CardTitle className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Bell size={18} className="text-primary/70" /> Notifications
                        </CardTitle>
                        <div className="space-y-6">
                            {[
                                { id: 'absenceAlerts', label: 'Absence alerts', sub: 'Get notified when a student is absent' },
                                { id: 'weeklySummary', label: 'Weekly summary', sub: 'Receive weekly report every Monday' },
                                { id: 'lowAttendance', label: 'Low attendance warnings', sub: 'Alert when attendance drops below 75%' },
                            ].map((pref) => (
                                <div key={pref.id} className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                                        <p className="text-[11px] text-muted-foreground leading-none">{pref.sub}</p>
                                    </div>
                                    <Switch 
                                        checked={(notifications as any)[pref.id]} 
                                        onCheckedChange={(checked) => saveNotifications({ ...notifications, [pref.id]: checked })} 
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Subsection C: Danger Zone */}
                <div className="pt-8 border-t border-white/5">
                    <Card className="border-destructive/30 bg-destructive/5 p-6 border-2 border-dashed">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center md:text-left">
                                <h3 className="text-lg font-bold text-destructive flex items-center gap-2 justify-center md:justify-start">
                                    <Trash2 size={20} /> Danger Zone
                                </h3>
                                <p className="text-sm text-destructive/70">Permanently delete your account and all associated data.</p>
                            </div>
                            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                Delete Account
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Delete Account"
            >
                <div className="space-y-6 p-1">
                    <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 text-destructive text-sm leading-relaxed">
                        <p className="font-bold mb-1">Are you sure? This action cannot be undone.</p>
                        <p>All your sessions, reports, and attendance data will be permanently deleted from our servers.</p>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                type="password"
                                placeholder="Enter your password to confirm"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="pl-12 bg-white/5 border-white/10 focus-visible:ring-primary/20 h-12 rounded-xl"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-3 justify-end pt-2">
                        <Button variant="ghost" onClick={() => {
                            setIsDeleteDialogOpen(false);
                            setDeletePassword('');
                        }}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => {
                                if (!deletePassword) {
                                    alert('Please enter your password to confirm deletion');
                                    return;
                                }
                                deleteAccountMutation.mutate();
                            }}
                            disabled={deleteAccountMutation.isPending || !deletePassword}
                            className="px-8 shadow-lg shadow-destructive/20"
                        >
                            {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete permanently'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Photo View Overlay (Round Only) */}
            {isPhotoPopupOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setIsPhotoPopupOpen(false)}
                >
                    <button 
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                        onClick={() => setIsPhotoPopupOpen(false)}
                    >
                        <X size={32} />
                    </button>
                    
                    <div 
                        className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full overflow-hidden border-8 border-primary/20 shadow-[0_0_100px_rgba(var(--primary-rgb),0.2)] animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {user?.avatar ? (
                            <img 
                                src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${user.avatar}`} 
                                alt="Profile Full" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-primary bg-gradient-to-br from-primary/10 to-accent/10">
                                <div className="w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center text-7xl font-bold">
                                    {user?.name ? getInitials(user.name) : 'U'}
                                </div>
                                <p className="text-lg font-bold uppercase tracking-widest">No photo set</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
