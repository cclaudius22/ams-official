// src/app/dashboard/reviewer/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Inbox,
  ArrowRight,
  BellRing,
} from 'lucide-react';
import { useOfficer } from '@/contexts/OfficerContext';
import type { RfiLaneItem } from '@/data/providers/rfiQueueAdapter';

/**
 * Officer gateway (Task 6, design-note §3 amended). This used to open on
 * `mockDashboardStats` — hardcoded activeQueueCount/accuracyRate/completedToday/
 * slaWarningsCount and an "SLA Breach Alert" banner that had no data behind
 * them. All of that is gone: every number below is either a real count from
 * an API the rest of the app already trusts (/api/applications,
 * /api/ams-demo/rfis). If a stat has no real source, it does not render.
 *
 * SLA: the "SLA policy" tile does NOT derive an operational SLA figure from
 * corpus dates — that drifted into "everything overdue" as real calendar time
 * passed the curated demo dates. SLA is illustrative/future-configured, so the
 * tile points to the forthcoming Policy Manager (client SLA rules, working-day
 * calendars, escalation thresholds). The derivation helpers still exist
 * (src/lib/officerGatewayStats.ts, tested) but are intentionally unwired here;
 * full derivation + true working-day math are tracked as a post-demo ticket:
 * docs/cc-notes/2026-07-06-sla-policy-module.md.
 *
 * Identity: scoped to `useOfficer()`'s current officer throughout. An admin
 * session has no personal case queue, so visiting this page renders whatever
 * officer OfficerContext currently holds (demo-wide access, per the 3 Jul
 * amendment) — acceptable demo behavior, not a crash.
 */

export default function ReviewerDashboardPage() {
  const { currentOfficer, isLoading: officerLoading } = useOfficer();
  const officerId = currentOfficer?.id ?? 'officer-demo';

  // --- "My Queue" tile: the /api/applications envelope's `total` is the REAL
  // assigned-case count (My Queue tile and the sidebar badge both trace back
  // to this same field — see useOfficerQueueCount).
  const [queueTotal, setQueueTotal] = useState<number | null>(null);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);

  useEffect(() => {
    if (officerLoading) return;
    let cancelled = false;
    setQueueLoading(true);
    setQueueError(null);

    const params = new URLSearchParams({ assignedTo: officerId, pageSize: '1' });
    fetch(`/api/applications?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.success) {
          setQueueTotal(typeof json.total === 'number' ? json.total : (json.data?.length ?? 0));
        } else {
          setQueueError(json?.error || 'Failed to load your queue');
        }
      })
      .catch(() => {
        if (!cancelled) setQueueError('Failed to load your queue');
      })
      .finally(() => {
        if (!cancelled) setQueueLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [officerId, officerLoading]);

  // --- My RFIs strip + tile (Task 5/8) — real lane data from
  // GET /api/ams-demo/rfis. Token-first: for a signed-in OFFICER session the
  // server reads officerId from the auth token and IGNORES `?officerId=`
  // entirely (src/app/api/ams-demo/rfis/route.ts); the query param below only
  // matters for an ADMIN session, where it's required (400 without it) for
  // oversight-viewing a specific officer's lane. Sending it is therefore
  // always correct: a no-op for officers, load-bearing for admin.
  const [rfis, setRfis] = useState<RfiLaneItem[]>([]);
  const [rfisLoading, setRfisLoading] = useState(true);
  const [rfisError, setRfisError] = useState<string | null>(null);

  useEffect(() => {
    if (officerLoading) return;
    let cancelled = false;
    setRfisLoading(true);
    setRfisError(null);
    fetch(`/api/ams-demo/rfis?officerId=${encodeURIComponent(officerId)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load RFIs');
        if (!cancelled) setRfis(json.data as RfiLaneItem[]);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRfis([]);
          setRfisError(err instanceof Error ? err.message : 'Unable to load your RFIs');
        }
      })
      .finally(() => {
        if (!cancelled) setRfisLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [officerId, officerLoading]);

  const rfiCount = (state: RfiLaneItem['state']) => rfis.filter((r) => r.state === state).length;
  const nearestDue = rfis
    .map((r) => r.dueAt)
    .filter((d): d is string => !!d)
    .sort()[0];

  return (
    <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
           <h1 className="text-2xl font-semibold text-gray-800">Reviewer Dashboard</h1>
        </div>

      {/* My RFIs strip — derived from the RFI lane endpoint, real data only */}
      {!rfisLoading && !rfisError && rfis.length > 0 && (
        <Link
          href="/dashboard/reviewer/rfis"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-white px-4 py-3 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50/40"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <BellRing className="h-4 w-4 text-blue-600" />
            My RFIs
          </span>
          <span className="text-gray-600">{rfiCount('returned')} ready to re-review</span>
          <span className="text-gray-600">{rfiCount('awaiting')} awaiting</span>
          <span className={rfiCount('overdue') > 0 ? 'text-red-600' : 'text-gray-600'}>
            {rfiCount('overdue')} overdue
          </span>
          {nearestDue && (
            <span className="text-gray-500">
              nearest due {new Date(nearestDue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-blue-600">
            View <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}

      {/* Doorway tiles — replaces mockDashboardStats. Every number here is
          real or a pure derivation of real data; nothing renders a fake
          placeholder (Task 6). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* My Queue */}
          <Link href="/dashboard/reviewer/queue" className="block">
            <Card className="bg-white h-full transition-colors hover:border-blue-300 hover:bg-blue-50/40">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">My Queue</CardTitle>
                 <Inbox className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">
                   {queueLoading || queueError ? '—' : queueTotal ?? 0}
                 </div>
                 <p className="text-xs text-muted-foreground">
                   {queueError ? "Couldn't load your queue" : 'Applications assigned to you'}
                 </p>
               </CardContent>
            </Card>
          </Link>

          {/* My RFIs */}
          <Link href="/dashboard/reviewer/rfis" className="block">
            <Card className="bg-white h-full transition-colors hover:border-blue-300 hover:bg-blue-50/40">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">My RFIs</CardTitle>
                 <BellRing className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold">
                   {rfisLoading || rfisError ? '—' : rfis.length}
                 </div>
                 <p className="text-xs text-muted-foreground">
                   {rfisError
                     ? "Couldn't load your RFIs"
                     : `${rfiCount('awaiting')} awaiting · ${rfiCount('returned')} to re-review · ${rfiCount('overdue')} overdue`}
                 </p>
               </CardContent>
            </Card>
          </Link>

          {/* SLA policy — illustrative, not operational truth. The gateway
              deliberately does NOT derive an SLA figure from corpus dates
              (that drifted into "everything overdue" as real time passed the
              curated demo dates). Points to the forthcoming Policy Manager;
              real derivation + working-day math tracked post-demo
              (docs/cc-notes/2026-07-06-sla-policy-module.md). */}
          <Card className="bg-white h-full">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">SLA policy</CardTitle>
               <Clock className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-lg font-semibold text-gray-900">
                 Defined in Policy Manager
               </div>
               <p className="text-xs text-muted-foreground">
                 Client SLA rules, working calendars, and escalation thresholds are configured centrally.
               </p>
             </CardContent>
          </Card>
      </div>
    </div>
  );
}
