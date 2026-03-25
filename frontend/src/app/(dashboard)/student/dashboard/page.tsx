'use client';

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    QrCode,
    AlertCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const data = [
    { name: 'Mon', attendance: 1 },
    { name: 'Tue', attendance: 1 },
    { name: 'Wed', attendance: 0 },
    { name: 'Thu', attendance: 1 },
    { name: 'Fri', attendance: 1 },
];

const recentAttendance = [
    { id: 1, subject: 'Mathematics', teacher: 'Dr. Smith', time: '09:00 AM', status: 'PRESENT', date: 'Oct 24, 2023' },
    { id: 2, subject: 'Physics', teacher: 'Prof. Miller', time: '11:30 AM', status: 'PRESENT', date: 'Oct 24, 2023' },
    { id: 3, subject: 'Chemistry', teacher: 'Dr. Brown', time: '02:00 PM', status: 'ABSENT', date: 'Oct 23, 2023' },
    { id: 4, subject: 'English', teacher: 'Ms. Davis', time: '10:00 AM', status: 'PRESENT', date: 'Oct 23, 2023' },
];

import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {user?.name}. Here&apos;s your attendance overview.
                    </p>
                </div>
                <Button
                    className="gap-2 h-11 px-6 shadow-lg shadow-primary/20"
                    onClick={() => router.push('/dashboard/attendance')}
                >
                    <QrCode size={18} />
                    Scan QR Code
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                        <TrendingUp size={16} className="text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85.4%</div>
                        <p className="text-xs text-muted-foreground mt-1">+2.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                        <CheckCircle2 size={16} className="text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground mt-1">Sessions marked present</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
                        <XCircle size={16} className="text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">Sessions missed</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                        <Clock size={16} className="text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground mt-1">3 this week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card/50 border-border/50 overflow-hidden">
                    <CardHeader>
                        <CardTitle>Attendance History</CardTitle>
                        <CardDescription>Your last 5 sessions tracked</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentAttendance.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    {row.subject}
                                                    <p className="text-xs font-normal text-muted-foreground">{row.teacher}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                                            <TableCell className="whitespace-nowrap">{row.time}</TableCell>
                                            <TableCell>
                                                <Badge variant={row.status === 'PRESENT' ? 'success' : 'destructive'}>
                                                    {row.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle>Weekly Activity</CardTitle>
                        <CardDescription>Presence trend</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e2e" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6868aa', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#1a1a26' }}
                                    contentStyle={{ backgroundColor: '#12121a', border: '1px solid #1e1e2e', borderRadius: '8px' }}
                                />
                                <Bar dataKey="attendance" radius={[4, 4, 0, 0]} barSize={32}>
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.attendance === 1 ? '#6c63ff' : '#ef4444'}
                                            fillOpacity={0.8}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-4 pt-6">
                    <AlertCircle className="text-primary h-6 w-6 shrink-0" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-primary">Attendance Warning</h4>
                        <p className="text-sm text-primary/80">
                            Your Chemistry attendance has dropped to 72%. Maintain 75% to avoid eligibility issues.
                        </p>
                    </div>
                    <Button
                        variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10"
                        onClick={() => router.push('/dashboard/attendance')}
                    >
                        View Details
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
