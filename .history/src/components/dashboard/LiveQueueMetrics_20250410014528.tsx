import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { LiveApplication, ConsulateOfficial } from '@/types/liveQueue';

// Define a compact color palette with concrete HEX codes
const COLORS = {
    blue: '#60a5fa',    // blue-400
    green: '#34d399',   // emerald-400
    yellow: '#facc15',  // yellow-400
    orange: '#fb923c',  // orange-400
    purple: '#a78bfa',  // violet-400
    red: '#fb7185',     // rose-400
    gray: '#9ca3af',    // gray-400
};

// Define Status colors
const STATUS_COLORS = {
    Pending: '#f59e0b',      // amber-500
    'In Progress': '#3b82f6', // blue-500
    Approved: '#10b981',     // emerald-500
    Rejected: '#ef4444',     // red-500
};

// Define tooltip props
interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        name?: string;
        value?: number | string;
        unit?: string;
        dataKey?: string;
        color?: string;
        fill?: string;
        stroke?: string;
        payload?: {
            name?: string;
            value?: number;
            fill?: string;
            stroke?: string;
        };
    }>;
    label?: string;
}

// Custom Tooltip Component
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs text-gray-700 dark:text-gray-200 z-50">
                <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">{label}</p>
                {payload.map((entry, index) => {
                    const color = entry.color || entry.fill || entry.stroke || COLORS.gray;
                    return (
                        <div key={index} className="flex items-center py-0.5">
                            <span
                                className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
                                style={{ backgroundColor: color }}
                            ></span>
                            <span>{entry.name || entry.dataKey}:</span>
                            <span className="font-semibold ml-1">{entry.value}{entry.unit}</span>
                        </div>
                    )
                })}
            </div>
        );
    }
    return null;
};

// Define chart data types
interface ProcessingTimeItem {
    name: string;
    avgTime: number;
}

// Processing Time Chart Component
const ProcessingTimeChart: React.FC<{ data: ProcessingTimeItem[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" horizontal={false}/>
            <XAxis type="number" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} className="dark:stroke-gray-400" />
            <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} width={70} tickLine={false} axisLine={false} className="dark:stroke-gray-400" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', className: 'dark:fill-gray-700' }}/>
            <Bar dataKey="avgTime" name="Avg Time (min)" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`}
                        fill={entry.avgTime > 60 ? COLORS.red : entry.avgTime > 40 ? COLORS.orange : COLORS.blue}
                    />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
);

interface StatusItem {
    name: string;
    value: number;
}

// Status Distribution Chart Component
const StatusDistributionChart: React.FC<{ data: StatusItem[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS.gray} stroke={"#fff"} strokeWidth={1} className="dark:stroke-gray-800"/>
                ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
                iconSize={8}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ fontSize: '10px', lineHeight: '1.5', color: '#374151' }}
                className="dark:text-gray-300"
            />
        </PieChart>
    </ResponsiveContainer>
);

interface SlaItem {
    time: string;
    within: number;
}

// SLA Compliance Chart Component
const SlaComplianceChart: React.FC<{ data: SlaItem[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} className="dark:stroke-gray-400"/>
            <YAxis domain={[85, 'auto']} stroke="#6b7280" fontSize={10} unit="%" tickLine={false} axisLine={false} className="dark:stroke-gray-400"/>
            <Tooltip content={<CustomTooltip />} />
            <Line
                type="monotone"
                dataKey="within"
                name="% Within SLA"
                stroke={COLORS.blue}
                strokeWidth={2}
                dot={{ r: 2, fill: COLORS.blue }}
                activeDot={{ r: 4, strokeWidth: 1, stroke: "#fff", fill: COLORS.blue }}
            />
            <Line
                type="monotone"
                dataKey={() => 95}
                name="Target (95%)"
                stroke={COLORS.red}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
            />
        </LineChart>
    </ResponsiveContainer>
);

// Official Workload Chart Component
const OfficialWorkloadChart: React.FC<{ data: ConsulateOfficial[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" horizontal={false}/>
            <XAxis type="number" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} className="dark:stroke-gray-400" />
            <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} width={70} tickLine={false} axisLine={false} className="dark:stroke-gray-400" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', className: 'dark:fill-gray-700' }}/>
            <Bar dataKey="activeApplications" name="Active Applications" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`}
                        fill={entry.activeApplications > 40 ? COLORS.red : entry.activeApplications > 30 ? COLORS.orange : COLORS.green}
                    />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
);

interface MetricCardProps {
    label: string;
    value: string;
    change: string;
    isPositiveChangeGood?: boolean;
}

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, isPositiveChangeGood = true }) => {
    const isPositive = change.startsWith('+');
    const TrendIcon = isPositive ? ArrowUp : ArrowDown;
    const isGood = isPositiveChangeGood ? isPositive : !isPositive;
    const trendColorClass = isGood ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500";
    
    return (
        <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
            <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">{value}</div>
            <div className={cn("text-xs mt-1 flex items-center", trendColorClass)}>
                <TrendIcon className="h-3 w-3 mr-0.5 flex-shrink-0" />
                <span className="truncate">{change}</span>
            </div>
        </div>
    );
};

// Main Component
interface LiveQueueMetricsProps {
    applications: LiveApplication[];
    officials: ConsulateOfficial[];
}

const LiveQueueMetrics: React.FC<LiveQueueMetricsProps> = ({ applications, officials }) => {
    // Process data for visa type processing times
    const processingTimeData = useMemo(() => {
        // In a real app, this would calculate actual processing times
        // For now, we'll generate mock data based on visa types
        const visaTypes = [...new Set(applications.map(app => app.visaType.split(',')[0].trim()))];
        return visaTypes.slice(0, 5).map(type => ({
            name: type,
            avgTime: Math.floor(Math.random() * 90) + 20
        }));
    }, [applications]);

    // Process data for status distribution
    const statusDistributionData = useMemo(() => {
        const statusCounts: Record<string, number> = {
            'Pending': 0,
            'In Progress': 0,
            'Approved': 0,
            'Rejected': 0
        };
        
        applications.forEach(app => {
            statusCounts[app.status]++;
        });
        
        return Object.entries(statusCounts).map(([name, value]) => ({ 
            name, 
            value 
        })) as StatusItem[];
    }, [applications]);

    // Process data for SLA compliance
    const slaComplianceData = useMemo(() => {
        // Mock SLA data - in a real app, this would be calculated from actual timestamps
        return [
            { time: '00:00', within: 97 },
            { time: '06:00', within: 96 },
            { time: '12:00', within: 94 },
            { time: '18:00', within: 93 },
            { time: 'Now', within: 95 }
        ];
    }, []);

    // Process data for official workload
    const officialWorkloadData = useMemo(() => {
        return officials.slice(0, 5);
    }, [officials]);

    // Calculate key metrics
    const metrics = useMemo(() => {
        const avgProcessingTime = Math.round(
            processingTimeData.reduce((sum, item) => sum + item.avgTime, 0) / processingTimeData.length
        );
        
        const pendingCount = applications.filter(app => app.status === 'Pending').length;
        const inProgressCount = applications.filter(app => app.status === 'In Progress').length;
        const approvedCount = applications.filter(app => app.status === 'Approved').length;
        const rejectedCount = applications.filter(app => app.status === 'Rejected').length;
        
        const approvalRate = Math.round((approvedCount / (approvedCount + rejectedCount)) * 100);
        
        return {
            avgProcessingTime: `${avgProcessingTime} min`,
            approvalRate: `${approvalRate}%`,
            pendingCount,
            inProgressCount
        };
    }, [applications, processingTimeData]);

    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Processing Time by Visa Type */}
                <Card className="col-span-1">
                    <CardContent className="p-4">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Processing Time by Visa Type</div>
                        <div className="h-36">
                            <ProcessingTimeChart data={processingTimeData} />
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card className="col-span-1">
                    <CardContent className="p-4">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Status Distribution</div>
                        <div className="h-36">
                            <StatusDistributionChart data={statusDistributionData} />
                        </div>
                    </CardContent>
                </Card>

                {/* SLA Compliance */}
                <Card className="col-span-1">
                    <CardContent className="p-4">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">SLA Compliance (24h)</div>
                        <div className="h-36">
                            <SlaComplianceChart data={slaComplianceData} />
                        </div>
                    </CardContent>
                </Card>

                {/* Official Workload */}
                <Card className="col-span-1">
                    <CardContent className="p-4">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Official Workload</div>
                        <div className="h-36">
                            <OfficialWorkloadChart data={officialWorkloadData} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <MetricCard 
                    label="Avg. Processing Time" 
                    value={metrics.avgProcessingTime} 
                    change="+5%" 
                    isPositiveChangeGood={false} 
                />
                <MetricCard 
                    label="Approval Rate" 
                    value={metrics.approvalRate} 
                    change="+2%" 
                    isPositiveChangeGood={true} 
                />
                <MetricCard 
                    label="Pending Applications" 
                    value={metrics.pendingCount.toString()} 
                    change="+8%" 
                    isPositiveChangeGood={false} 
                />
                <MetricCard 
                    label="In Progress" 
                    value={metrics.inProgressCount.toString()} 
                    change="-3%" 
                    isPositiveChangeGood={true} 
                />
            </div>
        </div>
    );
};

export default LiveQueueMetrics;
