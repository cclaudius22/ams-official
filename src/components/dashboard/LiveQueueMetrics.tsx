'use client'
import { useMemo } from 'react'
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { LiveApplication } from '@/types/liveQueue'
import { ConsulateOfficial } from '@/api-contracts/users'
// Registry functions imported from their client-safe source (the queue-contract barrel also
// re-exports getDataProvider, which is server-only — importing values from it into a client
// component pulls fs/promises into the browser bundle).
import { normalizeVisaType, visaTypeLabel } from '@/config/visaTypes'
import { HBar, Donut, MetricCard, visaTypeColor, statusColor, SEMANTIC_COLORS } from '@/components/charts'

// Pending bucket = pre-decision lifecycle (new statuses + legacy). Owned by the data lane (Agent 1):
// keep statusData['Pending'] and metrics.pending counting these, or the queue backlog reads as 0.
const PENDING_STATUSES = ['Pending', 'Pending Assignment', 'Awaiting Info', 'Received', 'Processed', 'Awaiting Allocation']
const isPending = (status: string) => PENDING_STATUSES.includes(status)
const isInProgress = (status: string) => status === 'In Progress' || status === 'Escalated'

// Resolve an application to a canonical visa-type key. Prefer the contract's visaTypeId; otherwise
// route the wire/display vocab through the registry's normaliser (handles 'skilled-worker' and the
// 'Skilled Worker Visa' display form alike). Colour + label always come from the registry — no
// hardcoded map, so they can't drift (gate finding #7).
export function toVisaKey(visaTypeId: string | undefined, visaType: string): string {
  if (visaTypeId) return visaTypeId
  const direct = normalizeVisaType(visaType)
  if (direct) return direct
  const slug = visaType
    .replace(/visa/gi, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return normalizeVisaType(slug) ?? 'unknown'
}

interface LiveQueueMetricsProps {
  applications: LiveApplication[]
  officials: ConsulateOfficial[]
}

function LiveQueueMetrics({ applications, officials }: LiveQueueMetricsProps) {
  // Applications by canonical visa type — colour + label keyed off the registry (visaTypeId), so
  // they can't drift from display strings (gate finding #7: 3/6 bars were rendering gray).
  const visaTypeData = useMemo(() => {
    const counts: Record<string, number> = {}
    applications.forEach((app) => {
      const key = toVisaKey(app.visaTypeId, app.visaType)
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .map(([key, count]) => ({ key, name: visaTypeLabel(key), count }))
      .sort((a, b) => b.count - a.count)
  }, [applications])

  // Status distribution — preserves the pending bucket (new lifecycle statuses + legacy).
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { Pending: 0, 'In Progress': 0, Approved: 0, Rejected: 0 }
    applications.forEach((app) => {
      if (isPending(app.status)) counts['Pending']++
      else if (isInProgress(app.status)) counts['In Progress']++
      else if (app.status === 'Approved') counts['Approved']++
      else if (app.status === 'Rejected') counts['Rejected']++
    })
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
  }, [applications])

  const officerWorkloadData = useMemo(() => {
    return officials
      .map((o) => ({ name: o.firstName, applications: o.activeApplications, sla: o.slaCompliance }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 6)
  }, [officials])

  const metrics = useMemo(() => {
    const pending = applications.filter((app) => isPending(app.status)).length
    const inProgress = applications.filter((app) => isInProgress(app.status)).length
    const avgSla =
      officials.length > 0 ? Math.round(officials.reduce((sum, o) => sum + o.slaCompliance, 0) / officials.length) : 0
    return { pending, inProgress, avgSla, total: applications.length }
  }, [applications, officials])

  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total Applications" value={metrics.total} icon={<Users className="h-5 w-5" />} accentClassName="bg-indigo-500" />
        <MetricCard label="Pending Review" value={metrics.pending} icon={<Clock className="h-5 w-5" />} accentClassName="bg-amber-500" />
        <MetricCard label="In Progress" value={metrics.inProgress} icon={<CheckCircle className="h-5 w-5" />} accentClassName="bg-sky-500" />
        <MetricCard label="Avg. SLA Compliance" value={`${metrics.avgSla}%`} icon={<AlertCircle className="h-5 w-5" />} accentClassName="bg-violet-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <HBar
          title="Applications by Visa Type"
          data={visaTypeData}
          valueKey="count"
          color={(d) => visaTypeColor(String(d.key))}
          height={200}
          labelWidth={110}
        />
        <Donut title="Status Distribution" data={statusData} color={(d) => statusColor(String(d.name))} height={200} />
        <HBar
          title="Officer Workload"
          data={officerWorkloadData}
          valueKey="applications"
          color={(d) => {
            const n = Number(d.applications) || 0
            return n > 200 ? SEMANTIC_COLORS.negative : n > 100 ? SEMANTIC_COLORS.warning : SEMANTIC_COLORS.positive
          }}
          valueFormatter={(v) => `${v} cases`}
          height={200}
          labelWidth={64}
        />
      </div>
    </div>
  )
}

export default LiveQueueMetrics
