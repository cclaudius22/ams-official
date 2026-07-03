'use client'
import { AlertCircle } from 'lucide-react'
import { useProcessingMetrics } from '@/hooks/useProcessingMetrics'
import { OFFICER_DAILY_DECISION_CAP } from '@/lib/officerQueue'
import {
  LineWithTarget,
  HBar,
  Donut,
  StackedBar,
  Heatmap,
  KpiCard,
  CHART_INK,
  SEMANTIC_COLORS,
} from '@/components/charts'

// Backlog by day × DIS stage — preserved demo data (real wiring is the deferred contract
// track). Row vocabulary = the DIS pipeline; colours are Chris-locked (3 Jul), don't restyle.
const BACKLOG_ROWS = [
  { id: 'Received', cells: [{ x: 'Mon', value: 12 }, { x: 'Tue', value: 18 }, { x: 'Wed', value: 14 }, { x: 'Thu', value: 8 }, { x: 'Fri', value: 10 }] },
  { id: 'Document Processing', cells: [{ x: 'Mon', value: 22 }, { x: 'Tue', value: 28 }, { x: 'Wed', value: 32 }, { x: 'Thu', value: 26 }, { x: 'Fri', value: 20 }] },
  { id: 'Rules & Checks', cells: [{ x: 'Mon', value: 6 }, { x: 'Tue', value: 9 }, { x: 'Wed', value: 14 }, { x: 'Thu', value: 12 }, { x: 'Fri', value: 8 }] },
  { id: 'Officer Review', cells: [{ x: 'Mon', value: 18 }, { x: 'Tue', value: 22 }, { x: 'Wed', value: 24 }, { x: 'Thu', value: 20 }, { x: 'Fri', value: 15 }] },
  { id: 'Decided', cells: [{ x: 'Mon', value: 4 }, { x: 'Tue', value: 8 }, { x: 'Wed', value: 12 }, { x: 'Thu', value: 10 }, { x: 'Fri', value: 5 }] },
]

// Two-clocks vocabulary (elapsed SLA vs active touch-time)
const TIME_SERIES = [
  { key: 'queueTime', label: 'Waiting (elapsed)', color: '#cbd5e1' },
  { key: 'activeTime', label: 'Active touch-time', color: CHART_INK },
]

// Decision effort per outcome IS a semantic series — each bar means an outcome.
const effortColor = (entry: Record<string, unknown>) => {
  switch (entry.name) {
    case 'Clear approve':
      return SEMANTIC_COLORS.positive
    case 'Clear reject':
      return SEMANTIC_COLORS.negative
    default:
      return SEMANTIC_COLORS.warning // Manual + RFI
  }
}

// Triage donut: clear = the estate ink, manual review = the warning bucket (as everywhere).
const triageColor = (entry: Record<string, unknown>) =>
  entry.name === 'Manual review' ? SEMANTIC_COLORS.warning : CHART_INK

export const ProcessingMetricsTab = () => {
  const {
    slaAttainmentTrend,
    slaByVisaType,
    slaMissReasons,
    decisionEffortByOutcome,
    queueVsActiveTime,
    externalChecksClearRate,
    triageSplit,
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

  const clearShare = triageSplit[0].value
  const manualToday = triageSplit[1].value * 10 // of the 1,000/day demo intake

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* --- SLA Performance (decision SLA — 15 working days) --- */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">SLA Performance</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <LineWithTarget
              title="Decision SLA Attainment Over Time (%) — 15 Working Days"
              data={slaAttainmentTrend}
              xKey="date"
              valueKey="value"
              valueLabel="SLA %"
              color={CHART_INK}
              yDomain={[70, 100]}
              valueFormatter={(v) => `${v}%`}
              loading={isLoading}
            />
          </div>
          <HBar
            title="SLA Attainment by Visa Type (%)"
            data={slaByVisaType}
            valueKey="value"
            labelWidth={150}
            color={CHART_INK}
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

      {/* --- Decision Lane Efficiency (the human bottleneck — the machine is <1 min) --- */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Decision Lane Efficiency</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Machine Processing Time" value="< 1" unit=" min" subtitle="Was ~2 weeks pre-DIS" />
          <KpiCard title="Decision Queue" value={7} unit=" days" trend={-2} invertTrend subtitle="Today's intake clears in-SLA" />
          <KpiCard title="SLA Attainment" value={94.8} unit="%" trend={1.2} subtitle="Last 30 days" />
          <KpiCard title="Decision Backlog" value={848} trend={-12} invertTrend subtitle="Awaiting officer decision" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <HBar
            title="Decision Effort by Recommendation (min)"
            data={decisionEffortByOutcome}
            valueKey="avgMinutes"
            labelWidth={120}
            color={effortColor}
            valueFormatter={(v) => `${v} min`}
            loading={isLoading}
          />
          <StackedBar
            title="Where the Elapsed Time Goes (Avg Days)"
            data={queueVsActiveTime}
            series={TIME_SERIES}
            loading={isLoading}
          />
          <div className="lg:col-span-2">
            <Heatmap title="Backlog Distribution by Day and Stage" rows={BACKLOG_ROWS} loading={isLoading} />
          </div>
        </div>
      </section>

      {/* --- Triage & Efficiency (DIS recommends, officers decide — Phase 1 HITL) --- */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Triage &amp; Efficiency</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Donut
            title="Triage: Clear Recommendation vs Manual Review"
            data={triageSplit}
            color={triageColor}
            valueFormatter={(v) => `${v}%`}
            loading={isLoading}
          />
          <HBar
            title="External Checks — First-Pass Clear Rate (%)"
            data={externalChecksClearRate}
            valueKey="value"
            labelWidth={170}
            color={CHART_INK}
            valueFormatter={(v) => `${v}%`}
            loading={isLoading}
          />
        </div>
        <HBar
          title="Top Escalation Reasons"
          data={escalationReasons}
          valueKey="value"
          labelWidth={120}
          color={CHART_INK}
          loading={isLoading}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Clear Recommendations" value={clearShare} unit="%" subtitle="DIS triage — officers decide" />
          <KpiCard title="Manual Reviews (Today)" value={manualToday} subtitle="Of 1,000 daily intake" />
          <KpiCard title="Decision Capacity" value={OFFICER_DAILY_DECISION_CAP} unit=" /officer/day" subtitle="Allocation cap" />
          <KpiCard title="Avg. Escalation Resolution" value={escalatedResolutionTime} unit=" days" subtitle="vs previous month" />
        </div>
      </section>
    </div>
  )
}
