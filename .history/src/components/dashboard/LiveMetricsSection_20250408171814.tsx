import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Clock, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

// --- Configuration ---
const TOP_N_ITEMS = 7; // Max items to show in bar charts before grouping

// Define a subtle color palette (e.g., using Tailwind shades or custom)
// Using example Tailwind shades (adjust to your theme)
const SUBTLE_COLORS = [
    'hsl(var(--chart-1))', // Define these in your globals.css or theme
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    // Add more if needed
    '#a8a29e', // stone-400
    '#a3a3a3', // neutral-400
    '#a1a1aa', // zinc-400
];

const STATUS_COLORS = { // Use semantic names or map directly
    Pending: 'hsl(var(--chart-warning))', // Example: Orange/Yellow
    'In Progress': 'hsl(var(--chart-info))', // Example: Blue
    Approved: 'hsl(var(--chart-success))', // Example: Green
    Rejected: 'hsl(var(--chart-danger))', // Example: Red
};

// --- Data Simulation (Should be replaced with actual fetching) ---
// Keep data generation simple, processing happens later
const generateRawTimeSeriesData = () => {/* ... same as before ... */ return Array.from({ length: 8 }, (_, i) => ({ name: `${9 + i}AM`, applications: Math.floor(Math.random() * 20) + 5, approved: Math.floor(Math.random() * 15), rejected: Math.floor(Math.random() * 5) })) };
const generateRawProcessingTimeData = () => {
    const types = ['Business', 'Student', 'Tourist', 'Work', 'Family', 'Diplomatic', 'Transit', 'Investor', 'Journalist', 'Medical', 'Spouse', 'Other'];
    return types.map(type => ({ name: type, avgTime: Math.floor(Math.random() * 120) + 30 }));
};
const generateRawStatusDistributionData = () => [
    { name: 'Pending', value: Math.floor(Math.random() * 50) + 20 },
    { name: 'In Progress', value: Math.floor(Math.random() * 60) + 30 },
    { name: 'Approved', value: Math.floor(Math.random() * 20) + 10 },
    { name: 'Rejected', value: Math.floor(Math.random() * 10) + 2 }
];
const generateRawCountryData = () => {
    const countries = ['United Kingdom', 'United States', 'Germany', 'Australia', 'Canada', 'France', 'India', 'China', 'Brazil', 'Nigeria', 'South Africa', 'Japan'];
    return countries.map(c => ({ name: c, value: Math.floor(Math.random() * 25) + 70 }));
}
const generateRawSLAData = () => {/* ... same as before ... */ return [{ time: '00:00', within: 95 }, { time: '04:00', within: 97 }, { time: '08:00', within: 92 }, { time: '12:00', within: 98 }, { time: '16:00', within: 95 }, { time: '20:00', within: 97 }, { time: 'Now', within: 96 }] };
const generateRawEfficiencyMetrics = () => [ /* ... hardcoded for now ... */
    { label: 'Avg. Processing Time', value: '42 min', change: '+3%', isPositiveChangeGood: false },
    { label: 'Approval Rate', value: '86%', change: '+2%', isPositiveChangeGood: true },
    { label: 'SLA Compliance', value: '96%', change: '+1%', isPositiveChangeGood: true },
    { label: 'Time to First Review', value: '15 min', change: '-5%', isPositiveChangeGood: true },
    { label: 'Escalation Rate', value: '7%', change: '-2%', isPositiveChangeGood: true },
    { label: 'Auto-Verification Rate', value: '34%', change: '+8%', isPositiveChangeGood: true }
];


// --- Custom Hook for Data Management ---
const useVisaMetrics = () => {
    const [rawData, setRawData] = useState({
        timeSeries: generateRawTimeSeriesData(),
        processingTime: generateRawProcessingTimeData(),
        statusDistribution: generateRawStatusDistributionData(),
        country: generateRawCountryData(),
        sla: generateRawSLAData(),
        efficiency: generateRawEfficiencyMetrics()
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const refreshData = useCallback(() => {
        setIsRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRawData({
                timeSeries: generateRawTimeSeriesData(),
                processingTime: generateRawProcessingTimeData(),
                statusDistribution: generateRawStatusDistributionData(),
                country: generateRawCountryData(),
                sla: generateRawSLAData(),
                efficiency: generateRawEfficiencyMetrics()
            });
            setLastUpdated(new Date());
            setIsRefreshing(false);
        }, 800);
    }, []);

    // Process data for charts (Memoized)
    const processedData = useMemo(() => {
        // Helper for Top N + Other
        const getTopNData = (data, valueKey, nameKey = 'name') => {
            if (data.length <= TOP_N_ITEMS) {
                return data;
            }
            const sortedData = [...data].sort((a, b) => b[valueKey] - a[valueKey]);
            const topN = sortedData.slice(0, TOP_N_ITEMS);
            const otherSum = sortedData.slice(TOP_N_ITEMS).reduce((sum, item) => sum + item[valueKey], 0);
            const otherCount = data.length - TOP_N_ITEMS;

            // Calculate average for 'Other' if summing doesn't make sense (like for rates)
            // For processing time, an average might be better than a sum
            const otherValue = otherSum / otherCount; // Or just sum if appropriate

            return [
                ...topN,
                { [nameKey]: `Other (${otherCount})`, [valueKey]: Math.round(otherValue), isOther: true }
            ];
        };

        return {
            timeSeries: rawData.timeSeries, // No processing needed here yet
            processingTime: getTopNData(rawData.processingTime, 'avgTime'),
            statusDistribution: rawData.statusDistribution.map(item => ({
                ...item,
                fill: STATUS_COLORS[item.name] || SUBTLE_COLORS[5] // Fallback color
            })),
            country: getTopNData(rawData.country, 'value'),
            sla: rawData.sla,
            efficiency: rawData.efficiency
        };
    }, [rawData]);

    return { ...processedData, isRefreshing, lastUpdated, refreshData };
};


// --- Chart Components (or inline as before, but using processed data) ---

const ApplicationsChart = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
                 {/* Use CSS variables or defined palette for fills */}
                <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-info))" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-info))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-success))" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-success))" stopOpacity={0.1}/>
                </linearGradient>
                 <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-danger))" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-danger))" stopOpacity={0.1}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="applications" name="Received" stroke="hsl(var(--chart-info))" fillOpacity={1} fill="url(#colorApplications)" strokeWidth={2} />
            <Area type="monotone" dataKey="approved" name="Approved" stroke="hsl(var(--chart-success))" fillOpacity={1} fill="url(#colorApproved)" strokeWidth={2} />
            <Area type="monotone" dataKey="rejected" name="Rejected" stroke="hsl(var(--chart-danger))" fillOpacity={1} fill="url(#colorRejected)" strokeWidth={2} />
        </AreaChart>
    </ResponsiveContainer>
);

const ProcessingTimeChart = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false}/>
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} /* Adjust width as needed */ />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }}/>
            <Bar dataKey="avgTime" name="Avg Time (min)" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isOther ? SUBTLE_COLORS[5] : SUBTLE_COLORS[index % (SUBTLE_COLORS.length - 2)]} />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
);

const StatusDistributionChart = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85} // Slightly larger radius
                paddingAngle={3}
                dataKey="value"
                // labelLine={false} // Often better without lines
                // label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''} // Only label larger slices
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
    </ResponsiveContainer>
);

const SlaChart = ({ data }) => (
     <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis domain={[85, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%"/>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
                type="monotone"
                dataKey="within"
                name="% Within SLA"
                stroke="hsl(var(--chart-info))" // Use theme color
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--chart-info))" }}
                activeDot={{ r: 6, strokeWidth: 1, stroke: "hsl(var(--background))", fill: "hsl(var(--chart-info))" }}
            />
            <Line
                type="monotone"
                dataKey={() => 95} // Example Target
                name="Target (95%)"
                stroke="hsl(var(--chart-danger))" // Use theme color
                strokeDasharray="5 5"
                strokeWidth={1.5}
                dot={false}
            />
        </LineChart>
    </ResponsiveContainer>
);

const CountryApprovalChart = ({ data }) => (
     <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} /* Adjust width */ />
            <Tooltip content={<CustomTooltip />} formatter={(value) => `${value}%`} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
            <Bar dataKey="value" name="Approval Rate" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.isOther ? SUBTLE_COLORS[5] : SUBTLE_COLORS[index % (SUBTLE_COLORS.length - 2)]} />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
);

// --- Custom Tooltip (Refined Styling) ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background p-2 border border-border rounded shadow-lg text-xs text-foreground">
                <p className="font-medium mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center">
                         {/* Use the actual fill/stroke color from the chart element */}
                        <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color || entry.payload.fill || entry.stroke }}></span>
                        <span>{entry.name}:</span>
                        <span className="font-semibold ml-1">{entry.value}{entry.unit}</span>
                         {/* Optionally add payload details */}
                         {entry.payload?.payload?.change && ( // Example for efficiency metric tooltip
                            <span className={`ml-2 text-[10px] ${entry.payload.payload.isPositiveChangeGood === (entry.payload.payload.change.startsWith('+')) ? 'text-green-600' : 'text-red-600'}`}>
                                {entry.payload.payload.change}
                            </span>
                         )}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// --- Main Component ---
const LiveMetricsSection = () => {
    const {
        timeSeries,
        processingTime,
        statusDistribution,
        country,
        sla,
        efficiency,
        isRefreshing,
        lastUpdated,
        refreshData
    } = useVisaMetrics();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-y-2">
                <h2 className="text-xl font-semibold text-foreground">Live Queue Metrics</h2>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="ml-3 p-1 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        aria-label="Refresh data"
                    >
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    </button>
                </div>
            </div>

             {/* Grid Layout - Charts */}
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", isRefreshing && "opacity-70 pointer-events-none")}>
                {/* Applications Processing Chart */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Applications Processing Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ApplicationsChart data={timeSeries} />
                        </div>
                    </CardContent>
                </Card>

                {/* Visa Processing Times */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Processing Time by Visa Type (minutes)</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {/* Add fixed height and scroll if needed, but Top N is preferred */}
                         <div className="h-64" /* style={{ overflowY: processingTime.length > 8 ? 'auto' : 'visible' }} */>
                            <ProcessingTimeChart data={processingTime} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", isRefreshing && "opacity-70 pointer-events-none")}>
                 {/* Status Distribution */}
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Application Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                           <StatusDistributionChart data={statusDistribution} />
                        </div>
                    </CardContent>
                </Card>

                {/* SLA Metrics Card */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">SLA Performance (Last 24 Hours)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <SlaChart data={sla} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", isRefreshing && "opacity-70 pointer-events-none")}>
                 {/* Approval Rate By Country */}
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Visa Approval Rate By Country</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64" /* style={{ overflowY: country.length > 8 ? 'auto' : 'visible' }} */>
                           <CountryApprovalChart data={country} />
                        </div>
                    </CardContent>
                </Card>

                 {/* Processing Efficiency Card */}
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Processing Efficiency Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {/* Keep height consistent */}
                        <div className="h-64 flex flex-col justify-center">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                {efficiency.map((metric, i) => {
                                     const isPositive = metric.change.startsWith('+');
                                     const TrendIcon = isPositive ? ArrowUp : ArrowDown;
                                     const isGood = metric.isPositiveChangeGood ? isPositive : !isPositive;
                                     const trendColor = isGood ? 'text-success' : 'text-destructive'; // Use semantic colors

                                    return (
                                        <div key={i} className="bg-muted/50 p-3 rounded-lg">
                                            <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                                            <div className="font-semibold text-lg text-foreground">{metric.value}</div>
                                            <div className={cn("text-xs mt-1 flex items-center", trendColor)}>
                                                <TrendIcon className="h-3 w-3 mr-0.5" />
                                                <span>{metric.change}</span>
                                                <span className="text-muted-foreground ml-1">vs yesterday</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LiveMetricsSection;