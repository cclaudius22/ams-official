'use client'
import { useState, useMemo, useCallback } from 'react'
import { Clock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AreaTrend,
  HBar,
  Donut,
  LineWithTarget,
  ChartCard,
  seriesColor,
  statusColor,
  visaTypeColor,
  SEMANTIC_COLORS,
} from '@/components/charts'

// --- Configuration ---
const TOP_N_ITEMS = 7 // Max items to show in bar charts before grouping

// --- Data Simulation (unchanged mock — real data is the deferred contract-wiring track) ---
const generateRawTimeSeriesData = () =>
  Array.from({ length: 8 }, (_, i) => ({
    name: `${9 + i}AM`,
    applications: Math.floor(Math.random() * 20) + 5,
    approved: Math.floor(Math.random() * 15),
    rejected: Math.floor(Math.random() * 5),
  }))
const generateRawProcessingTimeData = () => {
  const types = ['Business', 'Student', 'Tourist', 'Work', 'Family', 'Diplomatic', 'Transit', 'Investor', 'Journalist', 'Medical', 'Spouse', 'Other Visa']
  return types.map((type) => ({ name: type, avgTime: Math.floor(Math.random() * 120) + 30 }))
}
const generateRawStatusDistributionData = () => [
  { name: 'Pending', value: Math.floor(Math.random() * 50) + 20 },
  { name: 'In Progress', value: Math.floor(Math.random() * 60) + 30 },
  { name: 'Approved', value: Math.floor(Math.random() * 20) + 10 },
  { name: 'Rejected', value: Math.floor(Math.random() * 10) + 2 },
]
const generateRawCountryData = () => {
  const countries = ['United Kingdom', 'United States', 'Germany', 'Australia', 'Canada', 'France', 'India', 'China', 'Brazil', 'Nigeria', 'South Africa', 'Japan']
  return countries.map((c) => ({ name: c, value: Math.floor(Math.random() * 25) + 70 }))
}
const generateRawSLAData = () => [
  { time: '00:00', within: 95 },
  { time: '04:00', within: 97 },
  { time: '08:00', within: 92 },
  { time: '12:00', within: 98 },
  { time: '16:00', within: 95 },
  { time: '20:00', within: 97 },
  { time: 'Now', within: 96 },
]
const generateRawEfficiencyMetrics = () => [
  { label: 'Avg. Processing Time', value: '42 min', change: '+3%', isPositiveChangeGood: false },
  { label: 'Approval Rate', value: '86%', change: '+2%', isPositiveChangeGood: true },
  { label: 'SLA Compliance', value: '96%', change: '+1%', isPositiveChangeGood: true },
  { label: 'Time to First Review', value: '15 min', change: '-5%', isPositiveChangeGood: true },
  { label: 'Escalation Rate', value: '7%', change: '-2%', isPositiveChangeGood: true },
  { label: 'Auto-Verification Rate', value: '34%', change: '+8%', isPositiveChangeGood: true },
]

// --- Custom Hook for Data Management ---
const useVisaMetrics = () => {
  const [rawData, setRawData] = useState({
    timeSeries: generateRawTimeSeriesData(),
    processingTime: generateRawProcessingTimeData(),
    statusDistribution: generateRawStatusDistributionData(),
    country: generateRawCountryData(),
    sla: generateRawSLAData(),
    efficiency: generateRawEfficiencyMetrics(),
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const refreshData = useCallback(() => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRawData({
        timeSeries: generateRawTimeSeriesData(),
        processingTime: generateRawProcessingTimeData(),
        statusDistribution: generateRawStatusDistributionData(),
        country: generateRawCountryData(),
        sla: generateRawSLAData(),
        efficiency: generateRawEfficiencyMetrics(),
      })
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 800)
  }, [])

  // Process data for charts (Memoized) — Top-N + aggregated "Other"
  const processedData = useMemo(() => {
    const getTopNData = (data: Array<Record<string, number | string>>, valueKey: string, nameKey = 'name') => {
      if (!data || data.length === 0) return []
      if (data.length <= TOP_N_ITEMS) return data.map((item) => ({ ...item, isOther: false }))

      const sortedData = [...data].sort((a, b) => (b[valueKey] as number) - (a[valueKey] as number))
      const topN = sortedData.slice(0, TOP_N_ITEMS).map((item) => ({ ...item, isOther: false }))
      const otherItems = sortedData.slice(TOP_N_ITEMS)
      if (otherItems.length === 0) return topN

      const otherSum = otherItems.reduce((sum, item) => sum + (item[valueKey] as number), 0)
      const otherCount = otherItems.length
      const otherValue = otherSum / otherCount
      return [...topN, { [nameKey]: `Other (${otherCount})`, [valueKey]: Math.round(otherValue), isOther: true }]
    }

    return {
      timeSeries: rawData.timeSeries,
      processingTime: getTopNData(rawData.processingTime, 'avgTime'),
      statusDistribution: rawData.statusDistribution,
      country: getTopNData(rawData.country, 'value'),
      sla: rawData.sla,
      efficiency: rawData.efficiency,
    }
  }, [rawData])

  return { ...processedData, isRefreshing, lastUpdated, refreshData }
}

// --- Time-series series definitions (stable colour-as-meaning) ---
const TODAY_SERIES = [
  { key: 'applications', label: 'Received', color: visaTypeColor('skilled_worker_visa') },
  { key: 'approved', label: 'Approved', color: SEMANTIC_COLORS.positive },
  { key: 'rejected', label: 'Rejected', color: SEMANTIC_COLORS.negative },
]

// Colour bars by palette, but render the aggregated "Other" bucket as neutral.
const barColor = (entry: Record<string, unknown>, index: number) =>
  entry.isOther ? SEMANTIC_COLORS.neutral : seriesColor(index)

// --- Main Component ---
const LiveMetricsSection = () => {
  const { timeSeries, processingTime, statusDistribution, country, sla, efficiency, isRefreshing, lastUpdated, refreshData } =
    useVisaMetrics()

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Live Queue Metrics</h2>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="mr-1.5 h-4 w-4" />
          <span>Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="ml-3 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Refresh data"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className={cn('space-y-6 transition-opacity', isRefreshing && 'pointer-events-none opacity-60')}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AreaTrend title="Applications Processing Today" data={timeSeries} series={TODAY_SERIES} xKey="name" />
          <HBar
            title="Average Processing Time by Visa Type (min)"
            data={processingTime}
            valueKey="avgTime"
            color={barColor}
            valueFormatter={(v) => `${v} min`}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Donut title="Application Status Distribution" data={statusDistribution} color={(d) => statusColor(String(d.name))} />
          <div className="md:col-span-2">
            <LineWithTarget
              title="SLA Performance (Last 24 Hours)"
              data={sla}
              xKey="time"
              valueKey="within"
              valueLabel="% Within SLA"
              target={95}
              targetLabel="Target 95%"
              yDomain={[85, 100]}
              valueFormatter={(v) => `${v}%`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <HBar
            title="Visa Approval Rate By Country (%)"
            data={country}
            valueKey="value"
            labelWidth={120}
            color={barColor}
            valueFormatter={(v) => `${v}%`}
          />
          <ChartCard title="Processing Efficiency Metrics">
            <div className="grid grid-cols-2 gap-4">
              {efficiency.map((metric, i) => {
                const isPositive = metric.change.startsWith('+')
                const isGood = metric.isPositiveChangeGood ? isPositive : !isPositive
                return (
                  <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-white/5">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</div>
                    <div className="text-lg font-semibold tabular-nums text-gray-900 dark:text-gray-100">{metric.value}</div>
                    <div
                      className={cn(
                        'mt-0.5 text-xs font-medium',
                        isGood ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500',
                      )}
                    >
                      {metric.change} <span className="text-gray-400 dark:text-gray-500">vs yesterday</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

export default LiveMetricsSection
