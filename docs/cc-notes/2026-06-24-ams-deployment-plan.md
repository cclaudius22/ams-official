# AMS Official — Deployment Plan (working note)

**Date:** 2026-06-24 · **Status:** intent captured; scaffolding NOT yet built. Sequenced **after task 2.15, before Cloud Run** (see [[ams-dashboard-auth-required]]).

## Target

| | Plan |
|---|---|
| **Runtime** | Next.js → container → **Cloud Run** |
| **Host project** | **`prj-demo-dis-6549`** (the DIS demo / dashboard host; see [[dis-gcp-environments]]) |
| **Identity** | `sa-ov-dis-read@prj-demo-dis-6549.iam.gserviceaccount.com` |
| **Access gate** | admin login (**LB-2**) before any public exposure; full RBAC later |

## Data strategy (decided 24 Jun)
- **Application JSON** (queue + deep-set review data) → **bundled in the repo/image** (`data/demo-corpus/`, ~12M, self-contained). No cross-repo `../` dependency; survives clone / IDE crash / deploy.
- **Documents (PDFs)** → **GCS bucket** in `prj-demo-dis-6549`, served to the panels via **time-limited signed URLs** (`src/data/dis-providers/signUrl.ts`, **LB-3**). This *is* the production path (Deloitte's DIS stores docs in GCS; the read layer mints signed URLs), so doing it for the synthetic demo de-risks LB-3 and keeps the container image lean. Do **not** bundle the 65M+ of PDFs into the image.

## Deploy backlog (not yet done)
1. `next.config` → `output: 'standalone'` + multi-stage **Dockerfile** (+ `.dockerignore`).
2. **cloudbuild / deploy config** (or `gcloud run deploy`) targeting `prj-demo-dis-6549`.
3. **Auth gate (LB-2)** — wire `/api/auth/{login,logout,me}` + `JWT_SECRET` to gate `/dashboard/*` before exposure.
4. **GCS bucket + real `signUrl()` (LB-3)** — upload synthetic docs; `@google-cloud/storage`; KMS/GCS grants.
5. **Env wiring** — `DATA_PROVIDER=ams-demo`, `AMS_DEMO_CORPUS_PATH=data/demo-corpus` (the provider appends `/bulk/applications` internally — do NOT include `/bulk`), `JWT_SECRET`, GCS bucket name.

## Open / to check
- Existing AMS deployment IaC in `dis-ov-iac` / `core-dis-gcp` (avoid duplicating) — not yet checked.
- Cross-repo synthetic-data: only the **JSON** is copied in-repo; the generation pipeline stays in `openvisa-synthetic-data`.

*Nothing here blocks the current queue/allocation work (Slices 0/1 use no documents).*
