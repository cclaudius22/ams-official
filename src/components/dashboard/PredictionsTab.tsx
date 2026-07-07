'use client'
import { useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import { Users } from 'lucide-react'
import { SLA_WORKING_DAYS } from '@/lib/officerQueue'
import {
  dailyDecisionCapacity,
  daysToClear,
  clearanceTrajectory,
  annualDecisionCapacity,
} from '@/lib/capacityProjection'
import { AreaTrend, ChartCard, KpiCard, CHART_INK, SEMANTIC_COLORS } from '@/components/charts'

// Demo-region constants — one day's synthetic intake (matches the Live Queue corpus).
const DEMO_BACKLOG = 848
const DEMO_DAILY_INTAKE = 1000

// Operational forecasting ONLY — applicant-level prediction is deliberately absent
// (Phase-1 HITL + scoring-display policy; per-case intelligence lives in the officer's
// OV panel, not on an executive analytics surface).
const intakeForecast = () =>
  Array.from({ length: 30 }, (_, i) => ({
    date: format(addDays(new Date(), i + 1), 'MMM dd'),
    expected: Math.round(DEMO_DAILY_INTAKE + Math.sin((i / 30) * Math.PI * 2) * 80 + (Math.random() * 60 - 30)),
  }))

const FORECAST_SERIES = [{ key: 'expected', label: 'Expected intake', color: CHART_INK }]
const TRAJECTORY_SERIES = [{ key: 'backlog', label: 'Backlog', color: CHART_INK }]

const formatAnnual = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n.toLocaleString())

export const PredictionsTab = () => {
  const [officers, setOfficers] = useState(8)
  const forecast = useMemo(intakeForecast, [])

  const capacity = dailyDecisionCapacity(officers)
  const days = daysToClear(DEMO_BACKLOG, officers)
  const annual = annualDecisionCapacity(officers)
  const insideSla = days <= SLA_WORKING_DAYS
  const trajectory = useMemo(
    () => clearanceTrajectory(DEMO_BACKLOG, officers).map((p) => ({ ...p, label: `Day ${p.day}` })),
    [officers],
  )

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* --- Capacity what-if: the national-scale slider --- */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Capacity What-If</h3>
        <ChartCard title="Officers on Decisions — Scale the Human Layer">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Users className="h-5 w-5 text-gray-400" />
              <input
                type="range"
                min={4}
                max={200}
                step={2}
                value={officers}
                onChange={(e) => setOfficers(Number(e.target.value))}
                className="w-full accent-[#2d5a9e]"
                aria-label="Number of officers on decisions"
              />
              <span className="w-24 text-right text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                {officers}
              </span>
            </div>
            <p className="text-sm" style={{ color: insideSla ? SEMANTIC_COLORS.positive : SEMANTIC_COLORS.negative }}>
              {insideSla
                ? `Clears the ${DEMO_BACKLOG}-case backlog in ${days} working day${days === 1 ? '' : 's'} — inside the ${SLA_WORKING_DAYS}-working-day SLA.`
                : `Needs ${days} working days to clear the ${DEMO_BACKLOG}-case backlog — outside the ${SLA_WORKING_DAYS}-working-day SLA.`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              DIS processes every application in under a minute regardless of scale — the slider moves the only real
              bottleneck: officer decision capacity. Projection covers today&apos;s backlog; steady-state intake of{' '}
              {DEMO_DAILY_INTAKE.toLocaleString()}/day is shown in the forecast below.
            </p>
          </div>
        </ChartCard>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard title="Decision Capacity" value={capacity.toLocaleString()} unit=" /day" subtitle={`${officers} officers × 25 cap`} />
          <KpiCard title="Days to Clear Backlog" value={Number.isFinite(days) ? days : '—'} unit=" days" subtitle={`${DEMO_BACKLOG} awaiting decision`} />
          <KpiCard title="Annual Throughput" value={formatAnnual(annual)} subtitle="At 250 working days/year" />
          <KpiCard title="SLA Headroom" value={Number.isFinite(days) ? SLA_WORKING_DAYS - days : '—'} unit=" days" subtitle={`${SLA_WORKING_DAYS}-day standard`} />
        </div>
        <AreaTrend
          title="Backlog Clearance Projection (Working Days)"
          data={trajectory}
          series={TRAJECTORY_SERIES}
          xKey="label"
        />
      </section>

      {/* --- Intake forecast --- */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Intake Forecast</h3>
        <AreaTrend
          title="Projected Applications — Next 30 Days"
          data={forecast}
          series={FORECAST_SERIES}
          xKey="date"
        />
      </section>
    </div>
  )
}
