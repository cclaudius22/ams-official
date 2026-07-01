// src/app/dashboard/reviewer/rfis/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CornerDownLeft,
  AlertTriangle,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOfficer } from '@/contexts/OfficerContext';
import type { RfiLaneItem, RfiLaneState } from '@/data/providers/rfiQueueAdapter';

/**
 * "My RFIs" — the officer's RFI lane (pre-auth subset, Task 10).
 *
 * Lists the officer's RFI-enabled cases from GET /api/ams-demo/rfis, grouped by
 * derived state: Awaiting / Returned / Overdue. Status-led (no numeric grades);
 * each row links to the per-case deep review where the RFI panel walks the
 * gap → awaiting → responded flow. Corpus-derived, no persistence (see the
 * 2026-06-30 design note §5).
 */

type GroupConfig = {
  state: RfiLaneState;
  title: string;
  blurb: string;
  empty: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; // left border + icon colour
  chip: string; // per-row status chip
};

const GROUPS: GroupConfig[] = [
  {
    state: 'awaiting',
    title: 'Awaiting response',
    blurb: 'Requested, within deadline — waiting on the applicant.',
    empty: 'No requests are waiting on an applicant.',
    icon: Clock,
    accent: 'border-l-amber-400 text-amber-600',
    chip: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  {
    state: 'returned',
    title: 'Returned — ready to re-review',
    blurb: 'The applicant supplied the missing evidence. Re-review and decide.',
    empty: 'Nothing has come back for re-review yet.',
    icon: CornerDownLeft,
    accent: 'border-l-blue-500 text-blue-600',
    chip: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  {
    state: 'overdue',
    title: 'Overdue',
    blurb: 'Past the deadline with no response — chase, decide on available evidence, or refuse.',
    empty: 'No requests are past their deadline.',
    icon: AlertTriangle,
    accent: 'border-l-red-500 text-red-600',
    chip: 'bg-red-50 text-red-700 border border-red-200',
  },
];

function formatDue(iso?: string): string {
  if (!iso) return 'No deadline set';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'No deadline set';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReviewerRfiLanePage() {
  const { currentOfficer, isLoading: officerLoading } = useOfficer();
  const officerId = currentOfficer?.id ?? 'officer-demo';
  const officerName = currentOfficer ? `${currentOfficer.firstName} ${currentOfficer.lastName}` : '';

  const [items, setItems] = useState<RfiLaneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (officerLoading) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/ams-demo/rfis?officerId=${encodeURIComponent(officerId)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load RFIs');
        if (!cancelled) setItems(json.data as RfiLaneItem[]);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load your RFIs');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [officerId, officerLoading]);

  const countFor = (state: RfiLaneState) => items.filter((i) => i.state === state).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard/reviewer" className="hover:text-blue-600">
            Reviewer
          </Link>
          <span>/</span>
          <span className="text-gray-700">My RFIs</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">My RFIs</h1>
        <p className="text-sm text-gray-500">
          Requests for information{officerName ? ` assigned to ${officerName}` : ''}. The applicant supplies
          the missing evidence — you re-review and decide. The system never decides.
        </p>
      </div>

      {/* Derived summary strip */}
      {!loading && !error && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-white px-4 py-3 text-sm">
          <span className="font-medium text-gray-800">
            {items.length} open {items.length === 1 ? 'request' : 'requests'}
          </span>
          {GROUPS.map((g) => (
            <span key={g.state} className="flex items-center gap-1.5 text-gray-600">
              <g.icon className={`h-4 w-4 ${g.accent.split(' ').pop()}`} />
              {countFor(g.state)} {g.state}
            </span>
          ))}
        </div>
      )}

      {/* Loading / error */}
      {loading && <div className="rounded-lg border bg-white p-8 text-center text-sm text-gray-500">Loading your RFIs…</div>}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load your RFIs: {error}
        </div>
      )}

      {/* Groups */}
      {!loading && !error && (
        <div className="space-y-6">
          {GROUPS.map((group) => {
            const groupItems = items.filter((i) => i.state === group.state);
            const Icon = group.icon;
            return (
              <Card key={group.state} className="bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                    <Icon className={`h-5 w-5 ${group.accent.split(' ').pop()}`} />
                    {group.title}
                    <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {groupItems.length}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-gray-500">{group.blurb}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  {groupItems.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-md bg-gray-50 px-4 py-6 text-sm text-gray-400">
                      <Inbox className="h-4 w-4" />
                      {group.empty}
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {groupItems.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            className={`group flex items-center gap-4 border-l-2 py-3 pl-4 pr-2 transition-colors hover:bg-gray-50 ${group.accent.split(' ')[0]}`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium text-gray-800">{item.applicantName}</span>
                                <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${group.chip}`}>
                                  {group.state === 'returned'
                                    ? 'Responded'
                                    : group.state === 'overdue'
                                      ? 'Overdue'
                                      : 'Awaiting'}
                                </span>
                              </div>
                              <p className="truncate text-sm text-gray-500">{item.issue}</p>
                              {item.requestedDocumentType && (
                                <p className="truncate text-xs text-gray-500">
                                  <span className="font-medium text-gray-600">Requested:</span>{' '}
                                  <span className="font-mono text-gray-700">{item.requestedDocumentType}</span>
                                </p>
                              )}
                            </div>
                            <div className="hidden shrink-0 text-right sm:block">
                              <div className="text-xs uppercase tracking-wide text-gray-400">Due</div>
                              <div className="text-sm text-gray-600">{formatDue(item.dueAt)}</div>
                            </div>
                            <div className="shrink-0 font-mono text-xs text-gray-400">{item.id}</div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-blue-600" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
