// src/components/ProcessingMetricsTab.tsx 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area } from 'recharts';
import { cn } from '@/lib/utils'; 
import { useProcessingMetrics } from '@/hooks/useProcessingMetrics'; 


const SUBTLE_COLORS = [
    '#60a5fa', '#34d399', '#facc15', '#fb923c', '#a78bfa', '#fb7185', '#9ca3af',
    '#818cf8', '#f472b6', '#fde047'
];
const STAGE_COLORS = ['#a78bfa', '#60a5fa', '#fb923c', '#34d399', '#facc15', '#10b981'];
const QUEUE_ACTIVE_COLORS = ['#d1d5db', '#60a5fa']; // gray-300, blue-400

// --- Chart Components (Specific for this tab or made reusable) ---

const KpiCard = ({ title, value, unit = '' }: { title: string; value: string | number; unit?: string }) => (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {value}{unit}
            </div>
        </CardContent>
    </Card>
);

// --- Main Tab Component ---

export const ProcessingMetricsTab = () => {
    const {
        slaAttainmentTrend,
        slaByVisaType,
        slaByTeam,
        processingTimeDistribution,
        slaMissReasons,
        cycleTimeByStage,
        queueVsActiveTime,
        stageCompletionRate,
        backlogByStage,
        manualVsAuto,
        automationAccuracy,
        escalationRateTrend,
        escalationReasons,
        escalatedResolutionTime,
        isLoading,
        error,
        fetchData // Can be triggered by a button or filters
    } = useProcessingMetrics();

    // Define shared text/bg colors for consistency
    const textMutedForeground = "text-gray-500 dark:text-gray-400";
    const cardBg = "bg-white dark:bg-gray-900";
    const cardBorder = "border border-gray-200 dark:border-gray-700";

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-600">
                <AlertCircle className="w-6 h-6 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6 relative">
             {/* Optional: Add Filters (Date Range, etc.) and Refresh Button here */}
             {/* <div className="flex justify-end mb-4">
                 <button onClick={() => fetchData()} disabled={isLoading}>Refresh</button>
             </div> */}

             {isLoading && (
                 <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center rounded-md">
                     <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                 </div>
             )}

             <div className={cn(isLoading && "opacity-50 pointer-events-none")}>
                {/* --- SLA Performance Section --- */}
                <section className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">SLA Performance</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className={cn("lg:col-span-2", cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>SLA Attainment Rate Over Time (%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={slaAttainmentTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600"/>
                                            <XAxis dataKey="date" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <YAxis domain={[70, 100]} unit="%" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="value" name="SLA %" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>SLA Attainment by Visa Type (%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={slaByVisaType} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} barCategoryGap="20%">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" horizontal={false}/>
                                            <XAxis type="number" domain={[0, 100]} unit="%" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <YAxis dataKey="name" type="category" width={80} stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400" tickLine={false} axisLine={false}/>
                                            <Tooltip content={<CustomTooltip />} formatter={(value) => `${value}%`} cursor={{ fill: '#f3f4f6', className: 'dark:fill-gray-700' }}/>
                                            <Bar dataKey="value" name="SLA %" radius={[0, 4, 4, 0]}>
                                                {slaByVisaType.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={SUBTLE_COLORS[index % SUBTLE_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>SLA Attainment by Team (%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    {/* Similar Bar Chart as above, but using slaByTeam data */}
                                     <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={slaByTeam} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" vertical={false}/>
                                             <XAxis dataKey="name" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400" angle={-20} textAnchor="end" height={40}/>
                                             <YAxis domain={[0, 100]} unit="%" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                             <Tooltip content={<CustomTooltip />} formatter={(value) => `${value}%`} cursor={{ fill: '#f3f4f6', className: 'dark:fill-gray-700' }}/>
                                             <Bar dataKey="value" name="SLA %" radius={[4, 4, 0, 0]}>
                                                 {slaByTeam.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={SUBTLE_COLORS[index % SUBTLE_COLORS.length]} />
                                                 ))}
                                             </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Add Charts for Distribution of Processing Time vs SLA & Top Reasons for SLA Misses here */}
                         <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Processing Time vs SLA Target</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={processingTimeDistribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" vertical={false}/>
                                            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <YAxis stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: '10px' }}/>
                                            <Bar dataKey="value" name="Applications" radius={[4, 4, 0, 0]}>
                                                 {processingTimeDistribution.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={SUBTLE_COLORS[index % SUBTLE_COLORS.length]} />
                                                 ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Top Reasons for SLA Misses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={slaMissReasons} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="75%" paddingAngle={2}>
                                                 {slaMissReasons.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={entry.fill} />
                                                 ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                             <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', lineHeight: '1.5' }} layout="vertical" verticalAlign="middle" align="right" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                 {/* --- Process Stage Efficiency Section --- */}
                <section className="space-y-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Process Stage Efficiency</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Add Charts for Cycle Time, Queue/Active, Completion Rate, Backlog */}
                         <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Average Cycle Time by Stage (Days)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={cycleTimeByStage} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} barCategoryGap="20%">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" horizontal={false}/>
                                            <XAxis type="number" unit="d" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <YAxis dataKey="name" type="category" width={90} stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400" tickLine={false} axisLine={false}/>
                                            <Tooltip content={<CustomTooltip />} formatter={(value) => `${value}d`} cursor={{ fill: '#f3f4f6', className: 'dark:fill-gray-700' }}/>
                                            <Bar dataKey="avgDays" name="Avg Days" radius={[0, 4, 4, 0]}>
                                                {cycleTimeByStage.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Queue vs Active Time per Stage (Avg Days)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                         <BarChart data={queueVsActiveTime} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" vertical={false}/>
                                            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400" angle={-20} textAnchor="end" height={40}/>
                                            <YAxis unit="d" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <Tooltip content={<CustomTooltip />} formatter={(value) => `${value.toFixed(1)}d`}/>
                                            <Legend wrapperStyle={{ fontSize: '10px' }}/>
                                            <Bar dataKey="queueTime" name="Queue Time" stackId="a" fill={QUEUE_ACTIVE_COLORS[0]} radius={[4, 4, 0, 0]}/>
                                            <Bar dataKey="activeTime" name="Active Time" stackId="a" fill={QUEUE_ACTIVE_COLORS[1]} radius={[4, 4, 0, 0]}/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Stage Completion Rate (Cumulative %)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    {/* Using a Bar chart to visualize completion rate per stage */}
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stageCompletionRate} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" vertical={false}/>
                                            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400" angle={-20} textAnchor="end" height={40}/>
                                            <YAxis domain={[0, 100]} unit="%" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <Tooltip content={<CustomTooltip />} formatter={(value) => `${value}%`} />
                                            <Bar dataKey="completionRate" name="Completion %" radius={[4, 4, 0, 0]}>
                                                {stageCompletionRate.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Current Backlog by Stage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={backlogByStage} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" vertical={false}/>
                                            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400" angle={-20} textAnchor="end" height={40}/>
                                            <YAxis stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="backlogCount" name="Backlog" radius={[4, 4, 0, 0]}>
                                                 {backlogByStage.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                                                 ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                 {/* --- Automation & Escalation Section --- */}
                <section className="space-y-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Automation & Escalation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* KPI Cards */}
                        <KpiCard title="Automation Accuracy" value={automationAccuracy} unit="%"/>
                        <KpiCard title="Avg. Escalation Resolution" value={escalatedResolutionTime} unit=" days"/>

                         <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Manual vs Automated Decisions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48"> {/* Smaller height for Pie */}
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={manualVsAuto} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={3}>
                                                {manualVsAuto.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={cn(cardBg, cardBorder)}>
                             <CardHeader className="pb-2">
                                 <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Escalation Rate Over Time (%)</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={escalationRateTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600"/>
                                            <XAxis dataKey="date" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <YAxis domain={[0, 'auto']} unit="%" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="value" name="Escalation %" stroke="#fb7185" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                 </div>
                             </CardContent>
                         </Card>
                    </div>
                     <div className="grid grid-cols-1"> {/* Reason chart full width or half? */}
                          <Card className={cn(cardBg, cardBorder)}>
                             <CardHeader className="pb-2">
                                 <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Top Escalation Reasons</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <div className="h-72">
                                     <ResponsiveContainer width="100%" height="100%">
                                         <BarChart data={escalationReasons} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} barCategoryGap="20%">
                                             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" horizontal={false}/>
                                             <XAxis type="number" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                             <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400" tickLine={false} axisLine={false}/>
                                             <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', className: 'dark:fill-gray-700' }}/>
                                             <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                                                 {escalationReasons.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={SUBTLE_COLORS[index % SUBTLE_COLORS.length]} />
                                                 ))}
                                             </Bar>
                                         </BarChart>
                                     </ResponsiveContainer>
                                 </div>
                             </CardContent>
                         </Card>
                     </div>
                </section>
             </div>
        </div>
    );
};