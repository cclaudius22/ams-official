// src/components/ProcessingMetricsTab.tsx 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Area 
} from 'recharts';
import { cn } from '@/lib/utils'; 
import { useProcessingMetrics } from '@/hooks/useProcessingMetrics'; 
// Remove CustomTooltip import

const SUBTLE_COLORS = [
    '#60a5fa', '#34d399', '#facc15', '#fb923c', '#a78bfa', '#fb7185', '#9ca3af',
    '#818cf8', '#f472b6', '#fde047'
];
const STAGE_COLORS = ['#a78bfa', '#60a5fa', '#fb923c', '#34d399', '#facc15', '#10b981'];
const QUEUE_ACTIVE_COLORS = ['#d1d5db', '#60a5fa']; // gray-300, blue-400

// Simple inline tooltip component
const SimpleTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center py-0.5">
          <span 
            className="w-2 h-2 rounded-full mr-1.5"
            style={{ backgroundColor: entry.color || entry.stroke || '#3b82f6' }}
          />
          <span>{entry.name || entry.dataKey}:</span>
          <span className="font-semibold ml-1">
            {typeof entry.value === 'number' 
              ? entry.value.toLocaleString(undefined, {maximumFractionDigits: 1}) 
              : entry.value}
            {entry.unit || ''}
          </span>
        </div>
      ))}
    </div>
  );
};

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
                                            <Tooltip content={<SimpleTooltip />} />
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
                                            <Tooltip content={<SimpleTooltip />} />
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
                                     <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={slaByTeam} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" vertical={false}/>
                                             <XAxis dataKey="name" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400" angle={-20} textAnchor="end" height={40}/>
                                             <YAxis domain={[0, 100]} unit="%" stroke="#6b7280" fontSize={10} className="dark:stroke-gray-400"/>
                                             <Tooltip content={<SimpleTooltip />} />
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
                        
                        {/* More charts with SimpleTooltip... */}
                        {/* Note: All other charts would follow the same pattern, replacing <CustomTooltip /> with <SimpleTooltip /> */}
                        
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
                                            <Tooltip content={<SimpleTooltip />} />
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
                        
                        {/* Rest of the component with SimpleTooltip everywhere */}
                        {/* ... */}
                        
                    </div>
                </section>
                
                {/* Other sections would follow the same pattern */}
                {/* ... */}
                
             </div>
        </div>
    );
};