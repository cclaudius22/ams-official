'use client'
import { AlertCircle } from 'lucide-react'
import { useProcessingMetrics } from '@/hooks/useProcessingMetrics'
import {
  LineWithTarget,
  HBar,
  Donut,
  StackedBar,
  Heatmap,
  KpiCard,
  ChartCard,
  visaTypeColor,
  seriesColor,
  SEMANTIC_COLORS,
} from '@/components/charts'

// Backlog by day × stage — preserved demo data (real wiring is the deferred contract track).
const BACKLOG_ROWS = [
  { id: 'Application Intake', cells: [{ x: 'Mon', value: 12 }, { x: 'Tue', value: 18 }, { x: 'Wed', value: 14 }, { x: 'Thu', value: 8 }, { x: 'Fri', value: 10 }] },
  { id: 'Document Verification', cells: [{ x: 'Mon', value: 22 }, { x: 'Tue', value: 28 }, { x: 'Wed', value: 32 }, { x: 'Thu', value: 26 }, { x: 'Fri', value: 20 }] },
  { id: 'Background Check', cells: [{ x: 'Mon', value: 6 }, { x: 'Tue', value: 9 }, { x: 'Wed', value: 14 }, { x: 'Thu', value: 12 }, { x: 'Fri', value: 8 }] },
  { id: 'Officer Review', cells: [{ x: 'Mon', value: 18 }, { x: 'Tue', value: 22 }, { x: 'Wed', value: 24 }, { x: 'Thu', value: 20 }, { x: 'Fri', value: 15 }] },
  { id: 'Final Decision', cells: [{ x: 'Mon', value: 4 }, { x: 'Tue', value: 8 }, { x: 'Wed', value: 12 }, { x: 'Thu', value: 10 }, { x: 'Fri', value: 5 }] },
]

const STAGE_TIME_SERIES = [
  { key: 'queueTime', label: 'Queue time', color: '#cbd5e1' },
  { key: 'activeTime', label: 'Active time', color: visaTypeColor('skilled_worker_visa') },
]

// Automation performance bars — each metric to a fixed semantic colour.
const automationPerfColor = (entry: Record<string, unknown>) => {
  switch (entry.name) {
    case 'Error Rate':
      return SEMANTIC_COLORS.negative
    case 'Cost Efficiency':
      return SEMANTIC_COLORS.warning
    case 'Processing Speed':
      return SEMANTIC_COLORS.info
    default:
      return SEMANTIC_COLORS.positive
  }
}

export const ProcessingMetricsTab = () => {
  const {
    slaAttainmentTrend,
    slaByVisaType,
    slaMissReasons,
    cycleTimeByStage,
    queueVsActiveTime,
    manualVsAuto,
    automationAccuracy,
    escalationReasons,
    escalatedResolutionTime,
    isLoading,
    error,
  } = useProcessingMetrics()

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-red-600">
        <AlertCircle className="mr-2 h-6 w-6" />
        {error}
      </div>
    )
  }

  const automationPerf = [
    { name: 'Accuracy', value: automationAccuracy },
    { name: 'Processing Speed', value: 92 },
    { name: 'Cost Efficiency', value: 85 },
    { name: 'Error Rate', value: 7 },
  ]

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* --- SLA Performance --- */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">SLA Performance</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <LineWithTarget
              title="SLA Attainment Rate Over Time (%)"
              data={slaAttainmentTrend}
              xKey="date"
              valueKey="value"
              valueLabel="SLA %"
              color={visaTypeColor('skilled_worker_visa')}
              yDomain={[70, 100]}
              valueFormatter={(v) => `${v}%`}
              loading={isLoading}
            />
          </div>
          <HBar
            title="SLA Attainment by Visa Type (%)"
            data={slaByVisaType}
            valueKey="value"
            color={(_, i) => seriesColor(i)}
            valueFormatter={(v) => `${v}%`}
            loading={isLoading}
          />
          <Donut
            title="Top Reasons for SLA Misses"
            data={slaMissReasons}
            valueFormatter={(v) => `${v}%`}
            loading={isLoading}
          />
        </div>
      </section>

      {/* --- Process Stage Efficiency --- */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Process Stage Efficiency</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Average Processing Time" value={42} unit=" min" trend={-5} invertTrend subtitle="Across all stages" />
          <KpiCard title="Queue Time" value="3.2" unit=" days" trend={2} invertTrend subtitle="Average wait time" />
          <KpiCard title="SLA Performance" value={94.8} unit="%" trend={1.2} subtitle="Last 30 days" />
          <KpiCard title="Current Backlog" value={283} trend={-12} invertTrend subtitle="Across all stages" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <HBar
            title="Average Cycle Time by Stage (Days)"
            data={cycleTimeByStage}
            valueKey="avgDays"
            labelWidth={120}
            color={(_, i) => seriesColor(i)}
            valueFormatter={(v) => `${v} days`}
            loading={isLoading}
          />
          <StackedBar
            title="Queue vs Active Time per Stage (Avg Days)"
            data={queueVsActiveTime}
            series={STAGE_TIME_SERIES}
            loading={isLoading}
          />
          <div className="lg:col-span-2">
            <Heatmap title="Backlog Distribution by Day and Stage" rows={BACKLOG_ROWS} loading={isLoading} />
          </div>
        </div>
      </section>

      {/* --- Automation & Efficiency --- */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Automation &amp; Efficiency</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Donut title="Manual vs Automated Processing" data={manualVsAuto} valueFormatter={(v) => `${v}%`} loading={isLoading} />
          <HBar
            title="Automation Performance Metrics"
            data={automationPerf}
            valueKey="value"
            color={automationPerfColor}
            valueFormatter={(v) => `${v}%`}
          />
        </div>
        <HBar
          title="Top Escalation Reasons"
          data={escalationReasons}
          valueKey="value"
          labelWidth={120}
          color={(_, i) => seriesColor(i)}
          loading={isLoading}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Automation Accuracy" value={automationAccuracy} unit="%" trend={2.1} subtitle="vs previous month" />
          <KpiCard title="Avg. Escalation Resolution" value={escalatedResolutionTime} unit=" days" subtitle="vs previous month" />
          <KpiCard title="Automation Rate" value={72} unit="%" trend={5} subtitle="vs previous month" />
          <KpiCard title="Manual Reviews" value={214} subtitle="Last 30 days" />
        </div>
      </section>
    </div>
  )
}
