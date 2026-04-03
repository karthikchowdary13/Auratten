'use client';

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
    Users,
    Calendar,
    ClipboardCheck,
    QrCode,
    MoreVertical,
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi, sectionsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const pendingAlerts = [
    { id: 1, student: 'John Doe', reason: 'Absent for 3 consecutive days', type: 'WARNING' },
    { id: 2, student: 'Jane Smith', reason: 'Low attendance (68%)', type: 'CRITICAL' },
    { id: 3, student: 'Robert Fox', reason: 'Multiple missed morning sessions', type: 'WARNING' },
];

export default function TeacherDashboard() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const { data: dashboardData, isLoading: statsLoading } = useQuery({
        queryKey: ['teacherDashboard', user?.institutionId],
        queryFn: async () => {
            const { data } = await attendanceApi.getAnalytics(user?.institutionId || undefined);
            return data;
        },
        refetchInterval: 30000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        staleTime: 25000,
    });

    const { data: sections, isLoading: sectionsLoading } = useQuery({
        queryKey: ['teacherSections', user?.institutionId],
        queryFn: async () => {
            if (!user?.institutionId) return [];
            const { data } = await sectionsApi.getByInstitution(user.institutionId);
            return data || [];
        },
        enabled: !!user?.institutionId
    });

    const statsData = dashboardData?.stats || {
        totalUsers: 0,
        avgAttendance: '0%',
        totalSessions: 0,
        todayScans: 0,
        lastWeekTrend: null,
        hourlyStats: []
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your {sections?.length || 0} classes and monitor student attendance.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 border-border/50">
                        <Calendar size={18} />
                        Schedule
                    </Button>
                    <Button
                        className="gap-2 h-11 px-6 shadow-lg shadow-primary/20"
                        onClick={() => router.push('/dashboard/qr')}
                    >
                        <QrCode size={18} />
                        Generate QR
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users size={16} className="text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? '...' : statsData.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">Across {sections?.length || 0} classes</p>
                    </CardContent>
                </Card>
                
                <Card className="bg-card/50 border-border/50 relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                        <ClipboardCheck size={16} className="text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statsLoading ? '...' : statsData.avgAttendance}</div>
                        {statsData.lastWeekTrend !== undefined && statsData.lastWeekTrend !== null && (
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] sm:text-xs mt-1 font-medium",
                                statsData.lastWeekTrend >= 0 ? "text-[#34D399]" : "text-[#F87171]"
                            )}>
                                {statsData.lastWeekTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span>{statsData.lastWeekTrend >= 0 ? '▲' : '▼'} {Math.abs(statsData.lastWeekTrend)}% vs last week</span>
                            </div>
                        )}
                        {(statsData.lastWeekTrend === undefined || statsData.lastWeekTrend === null) && <p className="text-xs text-muted-foreground mt-1">Average for today</p>}
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
                        <ArrowUpRight size={16} className="text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingAlerts.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires your attention</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card/50 border-border/50">
                <CardHeader>
                    <CardTitle>My Classes</CardTitle>
                    <CardDescription>Status of your current academic sessions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Class Name</TableHead>
                                    <TableHead className="whitespace-nowrap">Students</TableHead>
                                    <TableHead className="whitespace-nowrap">Last Active</TableHead>
                                    <TableHead className="whitespace-nowrap">Status</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sectionsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Loading classes...</TableCell>
                                    </TableRow>
                                ) : (sections || []).map((cls) => (
                                    <TableRow key={cls.id}>
                                        <TableCell className="font-medium whitespace-nowrap">{cls.name}</TableCell>
                                        <TableCell className="whitespace-nowrap">{cls.studentCount}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {cls.lastSessionAt ? new Date(cls.lastSessionAt).toLocaleString() : 'Never'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={cls.lastSessionAt ? 'success' : 'outline'}>
                                                {cls.lastSessionAt ? 'ACTIVE' : 'IDLE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => router.push('/dashboard/qr')}
                                            >
                                                <QrCode size={14} className="mr-2" />
                                                QR
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
                <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle>Recent Alerts</CardTitle>
                        <CardDescription>Students with critical attendance issues</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingAlerts.map((alert, idx) => (
                            <div 
                                key={alert.id} 
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 animate-slide-in-top opacity-0",
                                    alert.type === 'CRITICAL' ? "pulse-red-left" : "pulse-amber-left"
                                )}
                                style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'forwards' }}
                            >
                                <div className="flex flex-col pl-2">
                                    <span className="font-semibold">{alert.student}</span>
                                    <span className="text-xs text-muted-foreground">{alert.reason}</span>
                                </div>
                                <Badge variant={alert.type === 'CRITICAL' ? 'destructive' : 'secondary'}>
                                    {alert.type}
                                </Badge>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full text-xs">View All Alerts</Button>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50 flex flex-col p-6 relative overflow-hidden min-h-[320px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <CardTitle className="text-lg">Live Today</CardTitle>
                            <CardDescription>Real-time attendance pulse</CardDescription>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Activity size={20} />
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-3 h-3 rounded-full bg-green-500 pulse-green" />
                            <span className="text-5xl font-black tracking-tighter">
                                {statsLoading ? '...' : statsData.todayScans}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground self-end mb-1 capitalize">Total Scans</span>
                        </div>

                        {/* Hourly Pulse Chart */}
                        <div className="w-full h-24 mb-6 flex items-end justify-between px-2">
                            {(statsData.hourlyStats || []).map((hData: any, i: number) => {
                                const max = Math.max(...(statsData.hourlyStats || []).map((d: any) => d.count), 5);
                                const height = (hData.count / max) * 100;
                                return (
                                    <div key={hData.hour} className="flex flex-col items-center gap-2 w-full">
                                        <div 
                                            className="w-2 sm:w-3 bg-[#7F77DD] rounded-t-sm transition-all duration-500 ease-out"
                                            style={{ height: `${Math.max(4, height)}%`, opacity: 0.6 + (i * 0.08) }}
                                        />
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase">{hData.hour}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Button 
                        className="w-full gap-2 shadow-lg shadow-primary/20 mt-auto" 
                        onClick={() => router.push('/dashboard/qr')}
                    >
                        <QrCode size={18} />
                        Generate QR
                    </Button>
                </Card>
            </div>
        </div>
    );
}
