// src/components/ProcessingMetricsTab.tsx 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { useProcessingMetrics } from '@/hooks/useProcessingMetrics'; 

// Import Nivo components
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveCalendar } from '@nivo/calendar';

// Define your color themes
const THEME_COLORS = {
  background: 'transparent',
  textColor: '#6b7280',
  tooltip: {
    container: {
      background: 'white',
      color: '#111827',
      fontSize: '12px',
      borderRadius: '4px',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      padding: '8px 12px',
    }
  },
  grid: {
    line: {
      stroke: '#e5e7eb',
      strokeWidth: 1,
    }
  },
  crosshair: {
    line: {
      stroke: '#6b7280',
      strokeWidth: 1,
      strokeOpacity: 0.35,
    }
  }
};

// Color palettes
const BLUE_GREEN_SCHEME = [
  '#38bdf8', // Light blue
  '#34d399', // Light green
  '#0891b2', // Cyan
  '#0d9488', // Teal
  '#2563eb', // Blue
  '#059669', // Green
];

const CATEGORICAL_SCHEME = [
  '#60a5fa', // Blue
  '#34d399', // Green
  '#facc15', // Yellow  
  '#fb923c', // Orange
  '#a78bfa', // Purple
  '#f472b6', // Pink
];

// KPI Card component
const KpiCard = ({ title, value, unit = '', trend = 0, subtitle = '' }: { 
  title: string; 
  value: string | number; 
  unit?: string;
  trend?: number;
  subtitle?: string;
}) => (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {value}{unit}
                </div>
                {trend !== 0 && (
                    <span className={`ml-2 text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
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
        fetchData
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

    // Format SLA trend data for Nivo line chart
    const slaLineData = [{
        id: 'SLA %',
        color: '#3b82f6',
        data: slaAttainmentTrend.map(item => ({
            x: item.date,
            y: item.value
        }))
    }];

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
                        {/* SLA Trend Chart */}
                        <Card className={cn("lg:col-span-2", cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>SLA Attainment Rate Over Time (%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveLine
                                        data={slaLineData}
                                        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                                        xScale={{ type: 'point' }}
                                        yScale={{ 
                                            type: 'linear', 
                                            min: 70, 
                                            max: 100, 
                                            stacked: false 
                                        }}
                                        curve="monotoneX"
                                        axisTop={null}
                                        axisRight={null}
                                        axisBottom={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Date',
                                            legendOffset: 36,
                                            legendPosition: 'middle'
                                        }}
                                        axisLeft={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'SLA %',
                                            legendOffset: -40,
                                            legendPosition: 'middle',
                                            format: value => `${value}%`
                                        }}
                                        colors={['#3b82f6']}
                                        lineWidth={3}
                                        pointSize={8}
                                        pointColor={'#ffffff'}
                                        pointBorderWidth={2}
                                        pointBorderColor={{ from: 'serieColor' }}
                                        pointLabelYOffset={-12}
                                        enableArea={true}
                                        areaOpacity={0.15}
                                        useMesh={true}
                                        gridYValues={[75, 80, 85, 90, 95, 100]}
                                        theme={THEME_COLORS}
                                        enableSlices="x"
                                        crosshairType="cross"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* SLA by Visa Type Chart */}
                        <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>SLA Attainment by Visa Type (%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveBar
                                        data={slaByVisaType}
                                        keys={['value']}
                                        indexBy="name"
                                        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                                        padding={0.3}
                                        layout="horizontal"
                                        valueScale={{ type: 'linear' }}
                                        colors={CATEGORICAL_SCHEME}
                                        borderRadius={4}
                                        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                        axisTop={null}
                                        axisRight={null}
                                        axisBottom={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'SLA Attainment (%)',
                                            legendPosition: 'middle',
                                            legendOffset: 40
                                        }}
                                        axisLeft={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                        }}
                                        valueFormat={value => `${value}%`}
                                        labelFormat={value => `${value}%`}
                                        labelSkipWidth={12}
                                        labelSkipHeight={12}
                                        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                        animate={true}
                                        motionStiffness={90}
                                        motionDamping={15}
                                        theme={THEME_COLORS}
                                        maxValue={100}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* SLA Miss Reasons Pie Chart */}
                        <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Top Reasons for SLA Misses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsivePie
                                        data={slaMissReasons}
                                        margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                                        innerRadius={0.5}
                                        padAngle={0.7}
                                        cornerRadius={3}
                                        activeOuterRadiusOffset={8}
                                        colors={CATEGORICAL_SCHEME}
                                        borderWidth={1}
                                        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                                        arcLinkLabelsSkipAngle={10}
                                        arcLinkLabelsTextColor="#6b7280"
                                        arcLinkLabelsThickness={2}
                                        arcLinkLabelsColor={{ from: 'color' }}
                                        arcLabelsSkipAngle={10}
                                        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                                        valueFormat={value => `${value}`}
                                        theme={THEME_COLORS}
                                        legends={[
                                            {
                                                anchor: 'right',
                                                direction: 'column',
                                                justify: false,
                                                translateX: 70,
                                                translateY: 0,
                                                itemsSpacing: 0,
                                                itemWidth: 60,
                                                itemHeight: 20,
                                                itemTextColor: '#999',
                                                itemDirection: 'left-to-right',
                                                itemOpacity: 1,
                                                symbolSize: 12,
                                                symbolShape: 'circle',
                                            }
                                        ]}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* --- Process Stage Efficiency Section --- */}
                <section className="space-y-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Process Stage Efficiency</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard 
                            title="Average Processing Time" 
                            value={42}
                            unit=" min"
                            trend={-5}
                            subtitle="Across all stages"
                        />
                        <KpiCard 
                            title="Queue Time" 
                            value="3.2"
                            unit=" days"
                            trend={2}
                            subtitle="Average wait time"
                        />
                        <KpiCard 
                            title="SLA Performance" 
                            value={94.8}
                            unit="%"
                            trend={1.2}
                            subtitle="Last 30 days"
                        />
                        <KpiCard 
                            title="Current Backlog" 
                            value={283}
                            trend={-12}
                            subtitle="Across all stages"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cycle Time by Stage */}
                        <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Average Cycle Time by Stage (Days)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveBar
                                        data={cycleTimeByStage}
                                        keys={['avgDays']}
                                        indexBy="name"
                                        margin={{ top: 20, right: 20, bottom: 50, left: 100 }}
                                        padding={0.3}
                                        layout="horizontal"
                                        valueScale={{ type: 'linear' }}
                                        colors={BLUE_GREEN_SCHEME}
                                        borderRadius={4}
                                        axisTop={null}
                                        axisRight={null}
                                        axisBottom={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Days',
                                            legendPosition: 'middle',
                                            legendOffset: 40
                                        }}
                                        axisLeft={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                        }}
                                        labelFormat={value => `${value}d`}
                                        valueFormat={value => `${value} days`}
                                        labelSkipWidth={12}
                                        labelSkipHeight={12}
                                        labelTextColor="#ffffff"
                                        animate={true}
                                        theme={THEME_COLORS}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Queue vs Active Time */}
                        <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Queue vs Active Time per Stage (Avg Days)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveBar
                                        data={queueVsActiveTime}
                                        keys={['queueTime', 'activeTime']}
                                        indexBy="name"
                                        margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
                                        padding={0.3}
                                        groupMode="stacked"
                                        valueScale={{ type: 'linear' }}
                                        colors={['#d1d5db', '#3b82f6']}
                                        borderRadius={4}
                                        axisTop={null}
                                        axisRight={null}
                                        axisBottom={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: -35,
                                            legend: 'Process Stage',
                                            legendPosition: 'middle',
                                            legendOffset: 40
                                        }}
                                        axisLeft={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Days',
                                            legendPosition: 'middle',
                                            legendOffset: -40
                                        }}
                                        labelSkipWidth={12}
                                        labelSkipHeight={12}
                                        legends={[
                                            {
                                                dataFrom: 'keys',
                                                anchor: 'right',
                                                direction: 'column',
                                                justify: false,
                                                translateX: 120,
                                                translateY: 0,
                                                itemsSpacing: 2,
                                                itemWidth: 100,
                                                itemHeight: 20,
                                                itemDirection: 'left-to-right',
                                                itemOpacity: 0.85,
                                                symbolSize: 12,
                                                symbolShape: 'square',
                                            }
                                        ]}
                                        animate={true}
                                        theme={THEME_COLORS}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Backlog Heatmap */}
                        <Card className={cn("lg:col-span-2", cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>Backlog Distribution by Day and Stage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveHeatMap
                                        data={[
                                            { id: 'Application Intake', data: [
                                                { x: 'Monday', y: 12 },
                                                { x: 'Tuesday', y: 18 },
                                                { x: 'Wednesday', y: 14 },
                                                { x: 'Thursday', y: 8 },
                                                { x: 'Friday', y: 10 },
                                            ]},
                                            { id: 'Document Verification', data: [
                                                { x: 'Monday', y: 22 },
                                                { x: 'Tuesday', y: 28 },
                                                { x: 'Wednesday', y: 32 },
                                                { x: 'Thursday', y: 26 },
                                                { x: 'Friday', y: 20 },
                                            ]},
                                            { id: 'Background Check', data: [
                                                { x: 'Monday', y: 6 },
                                                { x: 'Tuesday', y: 9 },
                                                { x: 'Wednesday', y: 14 },
                                                { x: 'Thursday', y: 12 },
                                                { x: 'Friday', y: 8 },
                                            ]},
                                            { id: 'Officer Review', data: [
                                                { x: 'Monday', y: 18 },
                                                { x: 'Tuesday', y: 22 },
                                                { x: 'Wednesday', y: 24 },
                                                { x: 'Thursday', y: 20 },
                                                { x: 'Friday', y: 15 },
                                            ]},
                                            { id: 'Final Decision', data: [
                                                { x: 'Monday', y: 4 },
                                                { x: 'Tuesday', y: 8 },
                                                { x: 'Wednesday', y: 12 },
                                                { x: 'Thursday', y: 10 },
                                                { x: 'Friday', y: 5 },
                                            ]},
                                        ]}
                                        margin={{ top: 40, right: 80, bottom: 40, left: 120 }}
                                        axisTop={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Day of Week',
                                            legendOffset: -20
                                        }}
                                        axisRight={null}
                                        axisBottom={null}
                                        axisLeft={{
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'Process Stage',
                                            legendPosition: 'middle',
                                            legendOffset: -100
                                        }}
                                        colors={{
                                            type: 'sequential',
                                            scheme: 'blues',
                                        }}
                                        emptyColor="#eeeeee"
                                        borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
                                        cellOpacity={0.9}
                                        cellBorderWidth={1}
                                        labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                                        legends={[
                                            {
                                                anchor: 'right',
                                                translateX: 60,
                                                translateY: 0,
                                                length: 240,
                                                thickness: 10,
                                                direction: 'column',
                                                tickPosition: 'after',
                                                tickSize: 3,
                                                tickSpacing: 4,
                                                tickOverlap: false,
                                                title: 'Cases',
                                                titleAlign: 'start',
                                                titleOffset: 4,
                                            }
                                        ]}
                                        hoverTarget="cell"
                                        cellHoverOthersOpacity={0.5}
                                        theme={THEME_COLORS}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* --- Automation Section --- */}
                <section className="space-y-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Automation & Efficiency</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Manual vs Automated Pie Chart */}
                        <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>
                                    Manual vs Automated Processing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsivePie
                                        data={manualVsAuto}
                                        margin={{ top: 20, right: 120, bottom: 20, left: 80 }}
                                        innerRadius={0.6}
                                        padAngle={0.7}
                                        cornerRadius={3}
                                        activeOuterRadiusOffset={8}
                                        colors={['#4ade80', '#93c5fd']}
                                        borderWidth={1}
                                        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                                        arcLinkLabelsSkipAngle={10}
                                        arcLinkLabelsTextColor="#6b7280"
                                        arcLinkLabelsThickness={2}
                                        arcLinkLabelsColor={{ from: 'color' }}
                                        arcLabelsSkipAngle={10}
                                        arcLabelsTextColor="#ffffff"
                                        valueFormat={value => `${value}%`}
                                        theme={THEME_COLORS}
                                        legends={[
                                            {
                                                anchor: 'right',
                                                direction: 'column',
                                                justify: false,
                                                translateX: 80,
                                                translateY: 0,
                                                itemsSpacing: 5,
                                                itemWidth: 80,
                                                itemHeight: 20,
                                                itemTextColor: '#999',
                                                itemDirection: 'left-to-right',
                                                itemOpacity: 1,
                                                symbolSize: 12,
                                                symbolShape: 'circle',
                                            }
                                        ]}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Processing Calendar Heatmap */}
                        <Card className={cn(cardBg, cardBorder)}>
                            <CardHeader className="pb-2">
                                <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>
                                    Processing Volume by Day (Last 3 Months)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveCalendar
                                        data={[
                                            // This would normally come from your data source
                                            // Sample data for 3 months
                                            { day: '2023-10-01', value: 12 },
                                            { day: '2023-10-02', value: 18 },
                                            { day: '2023-10-03', value: 15 },
                                            { day: '2023-10-04', value: 22 },
                                            // More dates would go here
                                            { day: '2023-12-20', value: 28 },
                                            { day: '2023-12-21', value: 16 },
                                            { day: '2023-12-22', value: 14 },
                                        ]}
                                        from="2023-10-01"
                                        to="2023-12-31"
                                        emptyColor="#eeeeee"
                                        colors={[
                                            '#a8e0ff',
                                            '#8ecae6',
                                            '#219ebc',
                                            '#126782',
                                            '#023047'
                                        ]}
                                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                        yearSpacing={40}
                                        monthSpacing={10}
                                        monthBorderColor="#ffffff"
                                        dayBorderWidth={2}
                                        dayBorderColor="#ffffff"
                                        legends={[
                                            {
                                                anchor: 'bottom-right',
                                                direction: 'row',
                                                translateY: 36,
                                                itemCount: 4,
                                                itemWidth: 42,
                                                itemHeight: 36,
                                                itemsSpacing: 14,
                                                itemDirection: 'right-to-left'
                                            }
                                        ]}
                                        theme={THEME_COLORS}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </div>
    );
};