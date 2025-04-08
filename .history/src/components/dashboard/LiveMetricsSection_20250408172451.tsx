import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming Shadcn UI Card
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Clock, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from "@/lib/utils"; // Your utility for merging Tailwind classes (e.g., from Shadcn UI)

// --- Configuration ---
const TOP_N_ITEMS = 7; // Max items to show in bar charts before grouping

// Define a SUBTLE color palette with concrete HEX codes
const SUBTLE_COLORS = [
    '#60a5fa', // blue-400
    '#34d399', // emerald-400
    '#facc15', // yellow-400
    '#fb923c', // orange-400
    '#a78bfa', // violet-400
    '#fb7185', // rose-400
    '#9ca3af', // gray-400 (More distinct 'Other')
];

// Define Status colors with concrete HEX codes
const STATUS_COLORS = {
    Pending: '#f59e0b', // amber-500
    'In Progress': '#3b82f6', // blue-500
    Approved: '#10b981', // emerald-500
    Rejected: '#ef4444', // red-500
};

// Define Area chart colors
const AREA_CHART_COLORS = {
    applications: { stroke: '#3b82f6', fill: '#60a5fa' }, // blue-500 / blue-400
    approved: { stroke: '#10b981', fill: '#34d399' },   // emerald-500 / emerald-400
    rejected: { stroke: '#ef4444', fill: '#f87171' },   // red-500 / red-400
};

// Define SLA chart colors
const SLA_CHART_COLORS = {
    within: '#3b82f6', // blue-500
    target: '#f43f5e', // rose-500 (More distinct target line)
};

// --- Data Simulation (Replace with actual fetching) ---
const generateRawTimeSeriesData = () => Array.from({ length: 8 }, (_, i) => ({ name: `${9 + i}AM`, applications: Math.floor(Math.random() * 20) + 5, approved: Math.floor(Math.random() * 15), rejected: Math.floor(Math.random() * 5) }));
const generateRawProcessingTimeData = () => {
    const types = ['Business', 'Student', 'Tourist', 'Work', 'Family', 'Diplomatic', 'Transit', 'Investor', 'Journalist', 'Medical', 'Spouse', 'Other Visa']; // Ensure 'Other Visa' is distinct from calculated 'Other'
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
const generateRawSLAData = () => [{ time: '00:00', within: 95 }, { time: '04:00', within: 97 }, { time: '08:00', within: 92 }, { time: '12:00', within: 98 }, { time: '16:00', within: 95 }, { time: '20:00', within: 97 }, { time: 'Now', within: 96 }];
const generateRawEfficiencyMetrics = () => [
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
        console.log("Refreshing data...");
        setIsRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Data refreshed.");
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
            if (!data || data.length === 0) return [];
            if (data.length <= TOP_N_ITEMS) {
                return data.map(item => ({ ...item, isOther: false })); // Ensure isOther is present
            }

            // Sort descending by valueKey
            const sortedData = [...data].sort((a, b) => b[valueKey] - a[valueKey]);
            const topN = sortedData.slice(0, TOP_N_ITEMS).map(item => ({ ...item, isOther: false }));
            const otherItems = sortedData.slice(TOP_N_ITEMS);

            if (otherItems.length === 0) return topN;

            // Aggregate 'Other' category
            const otherSum = otherItems.reduce((sum, item) => sum + item[valueKey], 0);
            const otherCount = otherItems.length;

            // Calculate average for 'Other' (or sum depending on metric)
            // For processing time or rates, average is usually better
            const otherValue = otherSum / otherCount;

            return [
                ...topN,
                { [nameKey]: `Other (${otherCount})`, [valueKey]: Math.round(otherValue), isOther: true }
            ];
        };

        return {
            timeSeries: rawData.timeSeries,
            processingTime: getTopNData(rawData.processingTime, 'avgTime'),
            statusDistribution: rawData.statusDistribution.map(item => ({
                ...item,
                fill: STATUS_COLORS[item.name] || SUBTLE_COLORS[SUBTLE_COLORS.length - 1] // Use last subtle color as fallback
            })),
            country: getTopNData(rawData.country, 'value'),
            sla: rawData.sla,
            efficiency: rawData.efficiency
        };
    }, [rawData]);

    return { ...processedData, isRefreshing, lastUpdated, refreshData };
};


// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs text-gray-700 dark:text-gray-200 z-50">
                <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">{label}</p>
                {payload.map((entry, index) => {
                    // Determine color: check payload obj, then specific color prop, then fill/stroke
                    const color = entry.payload?.fill || entry.color || entry.stroke || entry.payload?.stroke || SUBTLE_COLORS[SUBTLE_COLORS.length -1]; // Fallback
                    const value = entry.value;
                    const name = entry.name || entry.dataKey; // Ensure we have a name

                    return (
                        <div key={index} className="flex items-center py-0.5">
                            <span
                                className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
                                style={{ backgroundColor: color }}
                           ></span>
                            <span>{name}:</span>
                            <span className="font-semibold ml-1">{value}{entry.unit}</span>
                        </div>
                    )
                })}
            </div>
        );
    }
    return null;
};

// --- Chart Components ---

const ApplicationsChart = React.memo(({ data }) => ( // Use React.memo for performance if data doesn't change often without refresh
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
                {Object.entries(AREA_CHART_COLORS).map(([key, { fill }]) => (
                    <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={fill} stopOpacity={0.7}/>
                        <stop offset="95%" stopColor={fill} stopOpacity={0.1}/>
                    </linearGradient>
                ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} className="dark:stroke-gray-400" />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} className="dark:stroke-gray-400" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#374151', paddingTop: '10px' }} iconSize={10} />
            <Area type="monotone" dataKey="applications" name="Received" stroke={AREA_CHART_COLORS.applications.stroke} fillOpacity={1} fill="url(#colorapplications)" strokeWidth={2} />
            <Area type="monotone" dataKey="approved" name="Approved" stroke={AREA_CHART_COLORS.approved.stroke} fillOpacity={1} fill="url(#colorapproved)" strokeWidth={2} />
            <Area type="monotone" dataKey="rejected" name="Rejected" stroke={AREA_CHART_COLORS.rejected.stroke} fillOpacity={1} fill="url(#colorrejected)" strokeWidth={2} />
        </AreaChart>
    </ResponsiveContainer>
));

const ProcessingTimeChart = React.memo(({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" horizontal={false}/>
            <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} className="dark:stroke-gray-400" />
            <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={90} tickLine={false} axisLine={false} className="dark:stroke-gray-400" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', className: 'dark:fill-gray-700' }}/>
            <Bar dataKey="avgTime" name="Avg Time (min)" radius={[0, 4, 4, 0]} >
                {data.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        // Use last color for 'Other', cycle rest through available colors minus the last one
                        fill={entry.isOther ? SUBTLE_COLORS[SUBTLE_COLORS.length -1] : SUBTLE_COLORS[index % (SUBTLE_COLORS.length - 1)]}
                     />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
));

const StatusDistributionChart = React.memo(({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%" // Use percentage for responsiveness
                outerRadius="80%" // Use percentage
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                // Optional: Add labels back if needed, maybe only for large slices
                // label={({ name, percent }) => percent > 0.1 ? `${(percent * 100).toFixed(0)}%` : ''}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={"#fff"} strokeWidth={1} className="dark:stroke-gray-800"/>
                ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ fontSize: '12px', lineHeight: '1.7', color: '#374151' }}
                className="dark:text-gray-300"
             />
        </PieChart>
    </ResponsiveContainer>
));

const SlaChart = React.memo(({ data }) => (
     <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} className="dark:stroke-gray-400"/>
            <YAxis domain={[85, 'auto']} stroke="#6b7280" fontSize={12} unit="%" tickLine={false} axisLine={false} className="dark:stroke-gray-400"/>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#374151', paddingTop: '10px' }} iconSize={10}/>
            <Line
                type="monotone"
                dataKey="within"
                name="% Within SLA"
                stroke={SLA_CHART_COLORS.within}
                strokeWidth={2}
                dot={{ r: 3, fill: SLA_CHART_COLORS.within }}
                activeDot={{ r: 6, strokeWidth: 1, stroke: "#fff", fill: SLA_CHART_COLORS.within }}
            />
            <Line
                type="monotone"
                dataKey={() => 95} // Example Target
                name="Target (95%)"
                stroke={SLA_CHART_COLORS.target}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
            />
        </LineChart>
    </ResponsiveContainer>
));

const CountryApprovalChart = React.memo(({ data }) => (
     <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} barCategoryGap="25%">
             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} className="dark:stroke-gray-400"/>
            <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={110} tickLine={false} axisLine={false} className="dark:stroke-gray-400"/>
            <Tooltip content={<CustomTooltip />} formatter={(value) => `${value}%`} cursor={{ fill: '#f3f4f6', className: 'dark:fill-gray-700' }} />
            <Bar dataKey="value" name="Approval Rate" radius={[0, 4, 4, 0]}>
                 {data.map((entry, index) => (
                     <Cell
                        key={`cell-${index}`}
                        // Use last color for 'Other', cycle rest through available colors minus the last one
                        fill={entry.isOther ? SUBTLE_COLORS[SUBTLE_COLORS.length -1] : SUBTLE_COLORS[index % (SUBTLE_COLORS.length - 1)]}
                     />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
));

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

    // Determine text color classes based on Tailwind setup (or use inline styles)
    // These assume standard Tailwind color names exist
    const textMutedForeground = "text-gray-500 dark:text-gray-400";
    const textForeground = "text-gray-900 dark:text-gray-100";
    const textSuccess = "text-emerald-600 dark:text-emerald-500";
    const textDestructive = "text-red-600 dark:text-red-500";
    const bgMuted = "bg-gray-100 dark:bg-gray-800";
    const cardBg = "bg-white dark:bg-gray-900"; // Example Card background
    const cardBorder = "border border-gray-200 dark:border-gray-700"; // Example Card border

    return (
        <div className="space-y-6 p-4 md:p-6"> {/* Add padding */}
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-y-2">
                <h2 className={cn("text-xl font-semibold", textForeground)}>Live Queue Metrics</h2>
                <div className={cn("flex items-center text-sm", textMutedForeground)}>
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span>Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className={cn(
                            "ml-3 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed",
                            textMutedForeground // Icon color inherits
                        )}
                        aria-label="Refresh data"
                    >
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    </button>
                </div>
            </div>

             {/* Grid Layout - Charts - Apply loading overlay */}
             <div className={cn("relative", isRefreshing && "opacity-60 pointer-events-none transition-opacity duration-300")}>
                {/* Optional: Add a subtle loading indicator overlay if desired */}
                {/* {isRefreshing && <div className="absolute inset-0 bg-white/30 dark:bg-black/30 z-10 flex items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-blue-500" /></div>} */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Applications Processing Chart */}
                    <Card className={cn(cardBg, cardBorder)}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Applications Processing Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72"> {/* Increased height slightly */}
                                <ApplicationsChart data={timeSeries} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visa Processing Times */}
                    <Card className={cn(cardBg, cardBorder)}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Average Processing Time by Visa Type (min)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72">
                                <ProcessingTimeChart data={processingTime} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {/* Status Distribution */}
                    <Card className={cn(cardBg, cardBorder)}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Application Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72">
                               <StatusDistributionChart data={statusDistribution} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* SLA Metrics Card */}
                    <Card className={cn("md:col-span-2", cardBg, cardBorder)}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>SLA Performance (Last 24 Hours)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72">
                                <SlaChart data={sla} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Approval Rate By Country */}
                    <Card className={cn(cardBg, cardBorder)}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Visa Approval Rate By Country (%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72">
                               <CountryApprovalChart data={country} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Processing Efficiency Card */}
                    <Card className={cn(cardBg, cardBorder)}>
                        <CardHeader className="pb-2">
                            <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Processing Efficiency Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-72 flex flex-col justify-center">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    {efficiency.map((metric, i) => {
                                        const isPositive = metric.change.startsWith('+');
                                        const TrendIcon = isPositive ? ArrowUp : ArrowDown;
                                        const isGood = metric.isPositiveChangeGood ? isPositive : !isPositive;
                                        const trendColorClass = isGood ? textSuccess : textDestructive;
                                        const metricValueColorClass = textForeground;
                                        const metricLabelColorClass = textMutedForeground;
                                        const vsYesterdayColorClass = "text-gray-400 dark:text-gray-500"; // Slightly more muted
                                        const itemBgClass = 'bg-gray-50 dark:bg-white/5'; // Very subtle background

                                        return (
                                            <div key={i} className={cn("p-3 rounded-lg", itemBgClass)}>
                                                <div className={cn("text-xs mb-1", metricLabelColorClass)}>{metric.label}</div>
                                                <div className={cn("font-semibold text-lg", metricValueColorClass)}>{metric.value}</div>
                                                <div className={cn("text-xs mt-1 flex items-center", trendColorClass)}>
                                                    <TrendIcon className="h-3 w-3 mr-0.5 flex-shrink-0" />
                                                    <span className="truncate">{metric.change}</span>
                                                    <span className={cn("ml-1 hidden sm:inline", vsYesterdayColorClass)}>vs yesterday</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div> {/* End of loading overlay wrapper */}
        </div>
    );
};

export default LiveMetricsSection;