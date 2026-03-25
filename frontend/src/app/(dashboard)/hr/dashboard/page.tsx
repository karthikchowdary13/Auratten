'use client';

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
    Briefcase,
    Users,
    Clock,
    Banknote,
    FileText,
    Filter
} from 'lucide-react';

const staffMembers = [
    { id: 1, name: 'Dr. Sarah Wilson', role: 'Faculty', attendance: '98%', status: 'ON_DUTY' },
    { id: 2, name: 'James Thompson', role: 'Security', attendance: '94%', status: 'OFF_DUTY' },
    { id: 3, name: 'Emily Chen', role: 'Admin Staff', attendance: '96%', status: 'LEAVE' },
];

import { useRouter } from 'next/navigation';

export default function HRDashboard() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">HR Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Staff oversight, payroll tracking, and resource allocation.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter size={18} />
                        Filter Staff
                    </Button>
                    <Button
                        className="gap-2 h-11 px-6 shadow-lg shadow-primary/20"
                        onClick={() => router.push('/dashboard/users')}
                    >
                        <Briefcase size={18} />
                        Hire Staff
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users size={16} className="text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">84</div>
                        <p className="text-xs text-muted-foreground mt-1">Across 6 departments</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                        <Clock size={16} className="text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">96.8%</div>
                        <p className="text-xs text-muted-foreground mt-1">Maintain high efficiency</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                        <Banknote size={16} className="text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹4.2M</div>
                        <p className="text-xs text-muted-foreground mt-1">Processing in 4 days</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card/50 border-border/50">
                <CardHeader>
                    <CardTitle>Staff Attendance Directory</CardTitle>
                    <CardDescription>Real-time status of institution personnel</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Staff Member</TableHead>
                                    <TableHead className="whitespace-nowrap">Department/Role</TableHead>
                                    <TableHead className="whitespace-nowrap">Attendance Rate</TableHead>
                                    <TableHead className="whitespace-nowrap">Current Status</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Profile</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staffMembers.map((staff) => (
                                    <TableRow key={staff.id}>
                                        <TableCell className="font-semibold whitespace-nowrap">{staff.name}</TableCell>
                                        <TableCell className="text-muted-foreground whitespace-nowrap">{staff.role}</TableCell>
                                        <TableCell className="whitespace-nowrap">{staff.attendance}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Badge variant={
                                                staff.status === 'ON_DUTY' ? 'success' :
                                                    staff.status === 'LEAVE' ? 'destructive' : 'secondary'
                                            }>
                                                {staff.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <Button
                                                variant="ghost" size="sm" className="gap-2"
                                                onClick={() => router.push('/dashboard/users')}
                                            >
                                                <FileText size={14} />
                                                Records
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
