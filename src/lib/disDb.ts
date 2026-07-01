// src/lib/disDb.ts
// Connection pool for the local DIS Postgres replica (db/docker-compose.yml,
// :5499). Separate from src/lib/db.ts (the Prisma/Neon auth DB) — Deloitte owns
// the DIS schema, so this is a raw `pg` read pool over a throwaway replica that
// 2F.4 swaps for Deloitte's endpoints behind the DIS provider seam.
//
// Singleton mirrors the globalForPrisma hot-reload guard so Next dev doesn't
// leak a new pool on every reload.

import { Pool } from 'pg'
import type { QueryResultRow } from 'pg'

/** Matches db/README.md + scripts/seedReplica.ts default. Override per-env. */
export const DEFAULT_DIS_REPLICA_URL = 'postgres://dis:dis@localhost:5499/openvisa_pg_db'

const globalForDisPool = globalThis as unknown as { disPool: Pool | undefined }

export const disPool: Pool =
  globalForDisPool.disPool ??
  new Pool({
    connectionString: process.env.DIS_REPLICA_URL ?? DEFAULT_DIS_REPLICA_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  })

// An idle client dropping (e.g. the replica container restarting) must not take
// down the Node process — log and let the next query re-establish.
disPool.on('error', (err) => {
  console.error('[disDb] idle client error:', err.message)
})

if (process.env.NODE_ENV !== 'production') {
  globalForDisPool.disPool = disPool
}

/** Strip credentials from a connection string for safe logging (host:port/db only). */
function redactDbUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.host}${u.pathname}`
  } catch {
    return '(unparseable DIS_REPLICA_URL)'
  }
}

/**
 * Parameterised query against the DIS replica. Returns typed rows.
 * Re-throws with a clear, actionable message when the replica is unreachable so
 * route handlers can map it to a 500 with useful context (rather than a cryptic
 * ECONNREFUSED).
 */
export async function disQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  try {
    const result = await disPool.query<T>(text, params)
    return result.rows
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(
      `[disDb] query failed — is the replica up on DIS_REPLICA_URL ` +
        `(${redactDbUrl(process.env.DIS_REPLICA_URL ?? DEFAULT_DIS_REPLICA_URL)})? Underlying: ${msg}`,
    )
  }
}
