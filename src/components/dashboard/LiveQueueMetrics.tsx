import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { LiveApplication } from '@/types/liveQueue';
import { ConsulateOfficial } from '@/api-contracts/users';

// Color palette
const COLORS = {
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    orange: '#f97316',
    purple: '#8b5cf6',
    red: '#ef4444',
    gray: '#6b7280',
    cyan: '#06b6d4',
};

// Visa type colors
const VISA_COLORS: Record<string, string> = {
    'Student': COLORS.blue,
    'Skilled Worker': COLORS.green,
    'Spouse/Partner': COLORS.purple,
    'Global Talent': COLORS.orange,
    'Senior Specialist': COLORS.cyan,
    'Innovator': COLORS.yellow,
};

// Status colors
const STATUS_COLORS: Record<string, string> = {
    'Pending': COLORS.yellow,
    'In Progress': COLORS.blue,
    'Approved': COLORS.green,
    'Rejected': COLORS.red,
};

// Shorten visa type names for chart
function shortenVisaType(visaType: string): string {
    const map: Record<string, string> = {
        'Student Visa': 'Student',
        'Skilled Worker Visa': 'Skilled Worker',
        'Senior Specialist Worker Visa': 'Senior Specialist',
        'Spouse/Partner Visa': 'Spouse/Partner',
        'Global Talent Visa': 'Global Talent',
        'Innovator Founder Visa': 'Innovator',
    };
    return map[visaType] || visaType.replace(' Visa', '');
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; fill?: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border rounded shadow-lg text-xs">
                <p className="font-medium">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.fill }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Metric Card Component
interface MetricCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color }) => (
    <div className="bg-white border rounded-lg p-4 flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
    </div>
);

// Main Component
interface LiveQueueMetricsProps {
    applications: LiveApplication[];
    officials: ConsulateOfficial[];
}

const LiveQueueMetrics: React.FC<LiveQueueMetricsProps> = ({ applications, officials }) => {
    // Count applications by visa type
    const visaTypeData = useMemo(() => {
        const counts: Record<string, number> = {};
        applications.forEach(app => {
            const shortName = shortenVisaType(app.visaType);
            counts[shortName] = (counts[shortName] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [applications]);

    // Count applications by status
    const statusData = useMemo(() => {
        const counts: Record<string, number> = {
            'Pending': 0,
            'In Progress': 0,
            'Approved': 0,
            'Rejected': 0,
        };
        applications.forEach(app => {
            if (app.status === 'Pending' || app.status === 'Pending Assignment' || app.status === 'Awaiting Info' || app.status === 'Received' || app.status === 'Processed' || app.status === 'Awaiting Allocation') {
                counts['Pending']++;
            } else if (app.status === 'In Progress' || app.status === 'Escalated') {
                counts['In Progress']++;
            } else if (app.status === 'Approved') {
                counts['Approved']++;
            } else if (app.status === 'Rejected') {
                counts['Rejected']++;
            }
        });
        return Object.entries(counts)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [applications]);

    // Officer workload data
    const officerWorkloadData = useMemo(() => {
        return officials
            .map(o => ({
                name: o.firstName,
                applications: o.activeApplications,
                sla: o.slaCompliance,
            }))
            .sort((a, b) => b.applications - a.applications)
            .slice(0, 6);
    }, [officials]);

    // Calculate summary metrics
    const metrics = useMemo(() => {
        const pending = applications.filter(app =>
            app.status === 'Pending' || app.status === 'Pending Assignment' || app.status === 'Awaiting Info' || app.status === 'Received' || app.status === 'Processed' || app.status === 'Awaiting Allocation'
        ).length;
        const inProgress = applications.filter(app =>
            app.status === 'In Progress' || app.status === 'Escalated'
        ).length;
        const avgSla = officials.length > 0
            ? Math.round(officials.reduce((sum, o) => sum + o.slaCompliance, 0) / officials.length)
            : 0;

        return { pending, inProgress, avgSla, total: applications.length };
    }, [applications, officials]);

    return (
        <div className="space-y-4">
            {/* Summary Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Total Applications"
                    value={metrics.total.toLocaleString()}
                    icon={<Users className="h-5 w-5 text-white" />}
                    color="bg-blue-500"
                />
                <MetricCard
                    label="Pending Review"
                    value={metrics.pending.toLocaleString()}
                    icon={<Clock className="h-5 w-5 text-white" />}
                    color="bg-yellow-500"
                />
                <MetricCard
                    label="In Progress"
                    value={metrics.inProgress.toLocaleString()}
                    icon={<CheckCircle className="h-5 w-5 text-white" />}
                    color="bg-green-500"
                />
                <MetricCard
                    label="Avg. SLA Compliance"
                    value={`${metrics.avgSla}%`}
                    icon={<AlertCircle className="h-5 w-5 text-white" />}
                    color="bg-purple-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Applications by Visa Type */}
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm font-medium text-gray-700 mb-3">Applications by Visa Type</div>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={visaTypeData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                                    <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} axisLine={false} width={75} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Applications" radius={[0, 4, 4, 0]}>
                                        {visaTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={VISA_COLORS[entry.name] || COLORS.gray} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm font-medium text-gray-700 mb-3">Status Distribution</div>
                        <div className="h-40 flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS.gray} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-1 text-xs min-w-[100px]">
                                {statusData.map((entry) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: STATUS_COLORS[entry.name] }}
                                        />
                                        <span className="text-gray-600">{entry.name}</span>
                                        <span className="font-medium ml-auto">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Officer Workload */}
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm font-medium text-gray-700 mb-3">Officer Workload</div>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={officerWorkloadData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                                    <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} axisLine={false} width={55} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="applications" name="Active Cases" radius={[0, 4, 4, 0]}>
                                        {officerWorkloadData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.applications > 200 ? COLORS.red : entry.applications > 100 ? COLORS.orange : COLORS.green}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LiveQueueMetrics;
