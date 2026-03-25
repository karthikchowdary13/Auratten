'use client';

import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge
} from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
    Shield,
    Building2,
    Users,
    Activity,
    Lock,
    Plus
} from 'lucide-react';

const institutions = [
    { id: 1, name: 'Royal Academy of Science', type: 'UNIVERSITY', students: 1250, status: 'ACTIVE' },
    { id: 2, name: 'St. Mary High School', type: 'SCHOOL', students: 850, status: 'ACTIVE' },
    { id: 3, name: 'Elite Tech Institute', type: 'COLLEGE', students: 420, status: 'SUSPENDED' },
];

import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                    <p className="text-muted-foreground mt-1">
                        Global orchestration and infrastructure monitoring.
                    </p>
                </div>
                <Button
                    className="gap-2 h-11 px-6 shadow-lg shadow-primary/20"
                    onClick={() => router.push('/dashboard/institutions')}
                >
                    <Plus size={18} />
                    Register Institution
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Institutions</CardTitle>
                        <Building2 size={16} className="text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground mt-1">Across 12 regions</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users size={16} className="text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18.4K</div>
                        <p className="text-xs text-muted-foreground mt-1">1.2K active now</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity size={16} className="text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">99.9%</div>
                        <p className="text-xs text-muted-foreground mt-1">All services operational</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Security Threats</CardTitle>
                        <Shield size={16} className="text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">Scan completed 2m ago</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card/50 border-border/50">
                <CardHeader>
                    <CardTitle>Institutions Directory</CardTitle>
                    <CardDescription>Management of registered educational bodies</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Institution Name</TableHead>
                                    <TableHead className="whitespace-nowrap">Type</TableHead>
                                    <TableHead className="whitespace-nowrap">Total Students</TableHead>
                                    <TableHead className="whitespace-nowrap">Status</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Orchestration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {institutions.map((inst) => (
                                    <TableRow key={inst.id}>
                                        <TableCell className="font-semibold whitespace-nowrap">{inst.name}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground">{inst.type}</Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{inst.students.toLocaleString()}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Badge variant={inst.status === 'ACTIVE' ? 'success' : 'destructive'}>
                                                {inst.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                                            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/institutions')}>Manage</Button>
                                            <Button variant="ghost" size="icon"><Lock size={14} /></Button>
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
