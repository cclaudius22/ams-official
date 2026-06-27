'use client'
/**
 * Dev-only preview gallery for the chart primitives — NOT a production surface.
 * Renders representative charts with illustrative numbers so the palette and
 * grammar can be judged on populated charts. Data here is hardcoded sample data;
 * real surfaces consume the queue-contract via an adapter (deferred data track).
 */
import { Users, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  HBar,
  Donut,
  StackedBar,
  AreaTrend,
  LineWithTarget,
  Heatmap,
  KpiCard,
  MetricCard,
  ChartCard,
  ChartEmpty,
  ChartSkeleton,
  visaTypeColor,
  recommendationColor,
  statusColor,
  SEMANTIC_COLORS,
} from '@/components/charts'

const visaDist = [
  { name: 'Skilled Worker', value: 612, visaTypeId: 'skilled_worker_visa' },
  { name: 'Student', value: 240, visaTypeId: 'student_visa' },
  { name: 'Senior / Specialist', value: 180, visaTypeId: 'senior_specialist_worker_visa' },
  { name: 'Spouse / Partner', value: 150, visaTypeId: 'spouse_partner_visa' },
  { name: 'Global Talent', value: 90, visaTypeId: 'global_talent_visa' },
  { name: 'Innovator Founder', value: 60, visaTypeId: 'innovator_founder_visa' },
]

const recommendationDist = [
  { name: 'Recommend approve', value: 600, key: 'RECOMMEND_APPROVE' },
  { name: 'Recommend reject', value: 250, key: 'RECOMMEND_REJECT' },
  { name: 'Manual review', value: 150, key: 'MANUAL_REVIEW' },
]

const statusDist = [
  { name: 'Received', value: 220, status: 'Received' },
  { name: 'In Progress', value: 410, status: 'In Progress' },
  { name: 'Awaiting Allocation', value: 96, status: 'Awaiting Allocation' },
  { name: 'Decided', value: 274, status: 'Decided' },
]

const slaTrend = [
  { name: '00:00', within: 95 },
  { name: '04:00', within: 97 },
  { name: '08:00', within: 92 },
  { name: '12:00', within: 98 },
  { name: '16:00', within: 95 },
  { name: '20:00', within: 97 },
  { name: 'Now', within: 96 },
]

const todayFlow = [
  { name: '9AM', received: 18, approved: 11, rejected: 3 },
  { name: '10AM', received: 24, approved: 15, rejected: 5 },
  { name: '11AM', received: 20, approved: 13, rejected: 4 },
  { name: '12PM', received: 28, approved: 18, rejected: 6 },
  { name: '1PM', received: 16, approved: 10, rejected: 3 },
  { name: '2PM', received: 22, approved: 14, rejected: 4 },
  { name: '3PM', received: 26, approved: 17, rejected: 5 },
  { name: '4PM', received: 19, approved: 12, rejected: 4 },
]

const stageTime = [
  { name: 'Intake', queueTime: 1.2, activeTime: 0.6 },
  { name: 'Doc Verify', queueTime: 2.4, activeTime: 1.1 },
  { name: 'Background', queueTime: 1.8, activeTime: 0.9 },
  { name: 'Review', queueTime: 2.1, activeTime: 1.4 },
  { name: 'Decision', queueTime: 0.8, activeTime: 0.5 },
]

const flowSeries = [
  { key: 'received', label: 'Received', color: visaTypeColor('skilled_worker_visa') },
  { key: 'approved', label: 'Approved', color: SEMANTIC_COLORS.positive },
  { key: 'rejected', label: 'Rejected', color: SEMANTIC_COLORS.negative },
]

const stageSeries = [
  { key: 'queueTime', label: 'Queue time', color: '#cbd5e1' },
  { key: 'activeTime', label: 'Active time', color: visaTypeColor('skilled_worker_visa') },
]

const backlog = [
  { id: 'Intake', cells: [{ x: 'Mon', value: 12 }, { x: 'Tue', value: 18 }, { x: 'Wed', value: 14 }, { x: 'Thu', value: 8 }, { x: 'Fri', value: 10 }] },
  { id: 'Doc Verify', cells: [{ x: 'Mon', value: 22 }, { x: 'Tue', value: 28 }, { x: 'Wed', value: 32 }, { x: 'Thu', value: 26 }, { x: 'Fri', value: 20 }] },
  { id: 'Background', cells: [{ x: 'Mon', value: 6 }, { x: 'Tue', value: 9 }, { x: 'Wed', value: 14 }, { x: 'Thu', value: 12 }, { x: 'Fri', value: 8 }] },
  { id: 'Review', cells: [{ x: 'Mon', value: 18 }, { x: 'Tue', value: 22 }, { x: 'Wed', value: 24 }, { x: 'Thu', value: 20 }, { x: 'Fri', value: 15 }] },
  { id: 'Decision', cells: [{ x: 'Mon', value: 4 }, { x: 'Tue', value: 8 }, { x: 'Wed', value: 12 }, { x: 'Thu', value: 10 }, { x: 'Fri', value: 5 }] },
]

export function ChartsPreview() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Chart primitives — preview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            One grammar: stable colour-as-meaning, hairline chrome, one tooltip, designed states.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Volume (30d)" value={1332} trend={8} subtitle="Applications received" />
          <KpiCard title="Avg processing time" value={42} unit=" min" trend={-5} invertTrend subtitle="Across all stages" />
          <KpiCard title="Approval rate" value={70.6} unit="%" trend={1.4} subtitle="Recommend approve" />
          <KpiCard title="SLA compliance" value={94.8} unit="%" trend={1.2} subtitle="Within 15 working days" />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Applications" value={1332} icon={<Users className="h-5 w-5" />} accentClassName="bg-indigo-500" />
          <MetricCard label="Pending Review" value={316} icon={<Clock className="h-5 w-5" />} accentClassName="bg-amber-500" />
          <MetricCard label="In Progress" value={410} icon={<CheckCircle2 className="h-5 w-5" />} accentClassName="bg-sky-500" />
          <MetricCard label="Over Capacity" value={96} icon={<AlertTriangle className="h-5 w-5" />} accentClassName="bg-rose-500" />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <HBar
            title="Applications by Visa Type"
            data={visaDist}
            color={(d) => visaTypeColor(String(d.visaTypeId))}
            labelWidth={120}
          />
          <Donut
            title="Recommendation distribution"
            data={recommendationDist}
            color={(d) => recommendationColor(String(d.key) as never)}
          />
          <LineWithTarget
            title="SLA performance (last 24h)"
            data={slaTrend}
            valueKey="within"
            valueLabel="% Within SLA"
            target={95}
            targetLabel="Target 95%"
            yDomain={[85, 100]}
            valueFormatter={(v) => `${v}%`}
          />
          <Donut title="Status distribution" data={statusDist} color={(d) => statusColor(String(d.status))} />
          <AreaTrend title="Applications processing today" data={todayFlow} series={flowSeries} />
          <StackedBar title="Queue vs active time per stage (days)" data={stageTime} series={stageSeries} />
        </section>

        <section className="grid grid-cols-1 gap-4">
          <Heatmap title="Backlog distribution by day and stage" rows={backlog} />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Empty state (designed)">
            <ChartEmpty message="No applications in this range" hint="Try widening the date range." height={220} />
          </ChartCard>
          <ChartCard title="Loading state (skeleton)">
            <ChartSkeleton height={220} />
          </ChartCard>
        </section>
      </div>
    </div>
  )
}
