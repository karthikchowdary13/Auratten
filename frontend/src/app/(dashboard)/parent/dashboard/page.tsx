'use client';

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
    User,
    Heart,
    MessageSquare,
    Calendar,
    AlertTriangle,
    Download
} from 'lucide-react';

const studentProfile = {
    name: 'Alex Johnson',
    grade: '10th B',
    rollNo: '24',
    attendance: '92%',
};

const recentLogs = [
    { id: 1, date: 'Oct 24, 2023', status: 'PRESENT', remark: '-' },
    { id: 2, date: 'Oct 23, 2023', status: 'PRESENT', remark: '-' },
    { id: 3, date: 'Oct 22, 2023', status: 'PRESENT', remark: '-' },
    { id: 4, date: 'Oct 21, 2023', status: 'ABSENT', remark: 'Informed - Medical' },
];

export default function ParentDashboard() {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Parent Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitoring profile for {studentProfile.name}.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <MessageSquare size={18} />
                        Contact Teacher
                    </Button>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Download size={18} />
                        Download Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <User size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{studentProfile.name}</h3>
                            <p className="text-sm text-muted-foreground">{studentProfile.grade} • Roll #{studentProfile.rollNo}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{studentProfile.attendance}</div>
                        <div className="w-full bg-accent h-2 mt-4 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: '92%' }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Wellness Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <Heart size={20} className="text-red-500 fill-red-500/20" />
                        <span className="text-lg font-semibold">Healthy</span>
                        <p className="text-xs text-muted-foreground ml-auto">No medical alerts</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle>Recent Attendance History</CardTitle>
                        <CardDescription>Daily check-in logs for your child</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Date</TableHead>
                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                        <TableHead className="whitespace-nowrap">Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium whitespace-nowrap">{log.date}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge variant={log.status === 'PRESENT' ? 'success' : 'destructive'}>
                                                    {log.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground whitespace-nowrap">{log.remark}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle>Academic Calendar</CardTitle>
                        <CardDescription>Upcoming events and holidays</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors pointer-cursor">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg text-center min-w-[50px]">
                                <span className="block text-xs font-bold uppercase">Oct</span>
                                <span className="text-xl font-bold">28</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Parent-Teacher Meet</h4>
                                <p className="text-xs text-muted-foreground">Virtual Meeting • 04:00 PM</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors pointer-cursor">
                            <div className="bg-secondary/10 text-secondary p-2 rounded-lg text-center min-w-[50px]">
                                <span className="block text-xs font-bold uppercase">Nov</span>
                                <span className="text-xl font-bold">01</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Institution Holiday</h4>
                                <p className="text-xs text-muted-foreground">Regional Festival</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-600">
                    <AlertTriangle size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-yellow-700">Medical Notice</h3>
                    <p className="text-sm text-yellow-600 mt-1">
                        Student was absent on Oct 21st due to medical reasons as per your notification. Please provide the certificate when they return.
                    </p>
                </div>
                <Button variant="outline" className="border-yellow-500/30 text-yellow-700 hover:bg-yellow-500/10">
                    Submit Documents
                </Button>
            </div>
        </div>
    );
}
