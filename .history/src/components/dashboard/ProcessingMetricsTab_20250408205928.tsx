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
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer } from 'recharts';

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

const SUBTLE_COLORS = [
    '#60a5fa', // Blue
    '#34d399', // Green
    '#facc15', // Yellow
    '#fb923c', // Orange
    '#a78bfa', // Purple
    '#fb7185', // Pink
    '#9ca3af'  // Gray
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
                            curve="natural"  // Changed to natural for smoother curves
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
                            colors={['#6366f1']} // Modern indigo
                            lineWidth={3}
                            pointSize={8}
                            pointColor={'#ffffff'}
                            pointBorderWidth={2}
                            pointBorderColor={{ from: 'serieColor' }}
                            pointLabelYOffset={-12}
                            enableArea={true}
                            areaBaselineValue={70}
                            areaOpacity={0.15}
                            areaBlendMode="multiply"
                            defs={[
                                {
                                    id: 'gradientArea',
                                    type: 'linearGradient',
                                    colors: [
                                        { offset: 0, color: '#6366f1', opacity: 0.4 },
                                        { offset: 100, color: '#6366f1', opacity: 0 },
                                    ],
                                },
                                {
                                    id: 'gradientLine',
                                    type: 'linearGradient',
                                    colors: [
                                        { offset: 0, color: '#818cf8' },
                                        { offset: 100, color: '#4f46e5' },
                                    ],
                                }
                            ]}
                            fill={[{ match: '*', id: 'gradientArea' }]}
                            stroke={{ from: 'color' }}
                            useMesh={true}
                            gridYValues={[75, 80, 85, 90, 95, 100]}
                            theme={{
                                ...THEME_COLORS,
                                grid: {
                                    line: {
                                        stroke: '#e5e7eb',
                                        strokeDasharray: '4 4',
                                        strokeWidth: 1,
                                    }
                                },
                                crosshair: {
                                    line: {
                                        stroke: '#6366f1',
                                        strokeWidth: 1,
                                        strokeOpacity: 0.35,
                                    }
                                }
                            }}
                            enableSlices="x"
                            crosshairType="cross"
                            motionConfig="gentle"
                            enablePoints={true}
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
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie
                                data={slaMissReasons}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {slaMissReasons.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={SUBTLE_COLORS[index % SUBTLE_COLORS.length]}
                                />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value) => [`${value}%`, 'Percentage']}
                            />
                            <Legend 
                                layout="vertical" 
                                align="right"
                                verticalAlign="middle"
                                iconType="circle"
                                iconSize={10}
                                formatter={(value, entry) => (
                                <span style={{ color: '#6b7280', fontSize: '12px' }}>{value}</span>
                                )}
                            />
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
        {
            id: 'Application Intake',
            data: [
                { x: 'Mon', y: 12 },
                { x: 'Tue', y: 18 },
                { x: 'Wed', y: 14 },
                { x: 'Thu', y: 8 },
                { x: 'Fri', y: 10 },
            ]
        },
        {
            id: 'Document Verification',
            data: [
                { x: 'Mon', y: 22 },
                { x: 'Tue', y: 28 },
                { x: 'Wed', y: 32 },
                { x: 'Thu', y: 26 },
                { x: 'Fri', y: 20 },
            ]
        },
        {
            id: 'Background Check',
            data: [
                { x: 'Mon', y: 6 },
                { x: 'Tue', y: 9 },
                { x: 'Wed', y: 14 },
                { x: 'Thu', y: 12 },
                { x: 'Fri', y: 8 },
            ]
        },
        {
            id: 'Officer Review',
            data: [
                { x: 'Mon', y: 18 },
                { x: 'Tue', y: 22 },
                { x: 'Wed', y: 24 },
                { x: 'Thu', y: 20 },
                { x: 'Fri', y: 15 },
            ]
        },
        {
            id: 'Final Decision',
            data: [
                { x: 'Mon', y: 4 },
                { x: 'Tue', y: 8 },
                { x: 'Wed', y: 12 },
                { x: 'Thu', y: 10 },
                { x: 'Fri', y: 5 },
            ]
        },
    ]}
    margin={{ top: 40, right: 60, bottom: 30, left: 120 }}
    axisTop={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: '',
        legendOffset: -25
    }}
    axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Process Stage',
        legendPosition: 'middle',
        legendOffset: -100,
    }}
    colors={{
        type: 'sequential',
        scheme: 'blues',
        minValue: 0,
        maxValue: 35,
    }}
    emptyColor="#f3f4f6"
    borderColor={{ theme: 'background' }}
    borderWidth={1}
    borderRadius={2}
    enableLabels={true}
    labelTextColor={{
        from: 'color',
        modifiers: [['darker', 3]],
    }}
    annotations={[
        {
            type: 'rect',
            match: { id: 'Document Verification', x: 'Wed' },
            noteTextOffset: 5,
            offset: -3,
            noteWidth: 120,
            noteHeight: 30,
            noteBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            note: 'Peak Load 🔔',
        },
    ]}
    hoverTarget="cell"
    cellHoverOthersOpacity={0.5}
    cellOpacity={1}
    motionConfig="gentle"
    theme={{
        background: 'transparent',
        textColor: '#6b7280',
        fontSize: 12,
        axis: {
            domain: {
                line: {
                    stroke: '#e5e7eb',
                    strokeWidth: 1
                }
            },
            ticks: {
                line: {
                    stroke: '#e5e7eb',
                    strokeWidth: 1
                }
            }
        },
        grid: {
            line: {
                stroke: '#e5e7eb',
                strokeWidth: 1
            }
        },
        legends: {
            text: {
                fontSize: 11
            }
        },
        tooltip: {
            container: {
                background: 'white',
                color: '#111827',
                fontSize: '12px',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(109, 125, 231, 0.1)',
                padding: '8px 12px',
            }
        }
    }}
    legends={[
        {
            anchor: 'right',
            translateX: 40,
            translateY: 0,
            length: 200,
            thickness: 8,
            direction: 'column',
            tickPosition: 'after',
            tickSize: 3,
            tickSpacing: 4,
            tickOverlap: false,
            tickFormat: '>-.2s',
            title: 'Cases',
            titleAlign: 'start',
            titleOffset: 4
        }
    ]}
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
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={manualVsAuto}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {manualVsAuto.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || (index === 0 ? '#4ade80' : '#93c5fd')} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  fontSize: '12px'
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{
                  paddingLeft: "20px",
                  fontSize: "12px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

    {/* Automation Accuracy Card */}
    <Card className={cn(cardBg, cardBorder)}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>
          Automation Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Accuracy', value: automationAccuracy, fill: '#4ade80' },
                { name: 'Processing Speed', value: 92, fill: '#60a5fa' },
                { name: 'Cost Efficiency', value: 85, fill: '#f59e0b' },
                { name: 'Error Rate', value: 7, fill: '#ef4444' },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Score']}
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
              >
                {/* Use Cell to apply the fill color from the data */}
                {[
                  { name: 'Accuracy', value: automationAccuracy, fill: '#4ade80' },
                  { name: 'Processing Speed', value: 92, fill: '#60a5fa' },
                  { name: 'Cost Efficiency', value: 85, fill: '#f59e0b' },
                  { name: 'Error Rate', value: 7, fill: '#ef4444' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Escalation Reasons Bar Chart - Full width */}
  <Card className={cn(cardBg, cardBorder)}>
    <CardHeader className="pb-2">
      <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>
        Top Escalation Reasons
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={escalationReasons}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '4px',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="value" 
              name="Count" 
              radius={[0, 4, 4, 0]}
            >
              {escalationReasons.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SUBTLE_COLORS[index % SUBTLE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>

  {/* KPI Cards Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card className={cn(cardBg, cardBorder)}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>
          Automation Accuracy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {automationAccuracy}%
        </div>
        <p className="text-xs text-green-500 mt-1">
          +2.1% from previous month
        </p>
      </CardContent>
    </Card>

    <Card className={cn(cardBg, cardBorder)}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>
          Avg. Escalation Resolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {escalatedResolutionTime} days
        </div>
        <p className="text-xs text-red-500 mt-1">
          +0.5 days from previous month
        </p>
      </CardContent>
    </Card>

    <Card className={cn(cardBg, cardBorder)}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>
          Automation Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          72%
        </div>
        <p className="text-xs text-green-500 mt-1">
          +5% from previous month
        </p>
      </CardContent>
    </Card>

    <Card className={cn(cardBg, cardBorder)}>
      <CardHeader className="pb-2">
        <CardTitle className={cn("text-sm font-medium", textMutedForeground)}>
          Manual Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          214
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Last 30 days
        </p>
      </CardContent>
    </Card>

                        
                    </div>
                </section>
            </div>
        </div>
    );
};