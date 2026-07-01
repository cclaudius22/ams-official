# Cloud Run Demo Deployment Runbook

**Date:** 2026-07-01
**Audience:** Marshall, Lenny, Sam, and any deployment agent
**Status:** Required before public demo-domain sign-off

## Purpose

The AMS demo must launch on a domain with the self-contained AMS corpus already active. No visitor, demo operator, or agent should need to make a manual browser or terminal change after deploy.

The important distinction:

- **Code merge** makes the provider code available.
- **Runtime configuration** decides which provider the running service actually uses.

If Cloud Run starts with the wrong provider, the code can be correct while the demo still looks broken: AutoQ will no-op, the RFI lane will 404, and the queue will show old `APP-20260117...` records.

## Required Runtime Mode

The public demo service must run with:

```bash
DATA_PROVIDER=ams-demo
AMS_DEMO_CORPUS_PATH=data/demo-corpus
```

This makes AMS load:

```text
data/demo-corpus/bulk/applications/       # 1,000 multi-visa queue apps
data/demo-corpus/deep_set/applications/   # 18 deep-review apps
data/demo-corpus/deep_set/rfi_artifacts/  # 3 RFI hero flows
```

Do **not** rely on `.env` for Cloud Run. Cloud Run uses environment variables configured on the service/revision.

## Cloud Run Configuration

On first deploy:

```bash
gcloud run deploy AMS_SERVICE_NAME \
  --source . \
  --region REGION \
  --set-env-vars DATA_PROVIDER=ams-demo,AMS_DEMO_CORPUS_PATH=data/demo-corpus
```

For an existing service:

```bash
gcloud run services update AMS_SERVICE_NAME \
  --region REGION \
  --set-env-vars DATA_PROVIDER=ams-demo,AMS_DEMO_CORPUS_PATH=data/demo-corpus
```

Also confirm the container/image includes `data/demo-corpus/**`. The app is intentionally self-contained for the demo and must not depend on `../openvisa-synthetic-data` in Cloud Run.

## Release Gate Smoke Tests

Run these against the deployed URL, not only localhost.

1. Provider sanity:

```bash
curl -s 'https://DEMO_DOMAIN/api/applications?pageSize=3'
```

Pass condition:

- `total` is `1000`.
- Queue items are from the AMS demo corpus.
- Statuses support the new flow (`Received`, `Processed`, `Awaiting Allocation`, etc.).
- It is **not** serving old `APP-20260117...` json-provider data.

2. RFI lane:

```bash
curl -s 'https://DEMO_DOMAIN/api/ams-demo/rfis?officerId=officer-demo'
```

Pass condition:

- HTTP 200.
- Returns Rachel's RFI rows, including `HO-SW-DEEP-2026-00012` and `HO-SW-DEEP-2026-00013`.
- Must not return `RFI queue not available for the active data provider`.

3. Deep review:

```bash
curl -s 'https://DEMO_DOMAIN/api/ams-demo/applications/HO-SW-DEEP-2026-00012/review'
```

Pass condition:

- HTTP 200.
- Response includes applicant-specific `disView`, `ovAssessment`, and `rfi`.
- Must not fall back to `mockDISApplicationView` / synthetic OV.

4. Browser smoke:

- Open `/dashboard/livequeue`.
- Click **Process intake**.
- Click **Auto-allocate**.
- Confirm capacity/backlog output appears.
- Open `/dashboard/reviewer/rfis`.
- Open `HO-SW-DEEP-2026-00012`.
- Confirm the review page shows Tunde Bello and the RFI panel.

## No Silent Fallback Policy

Before public demo-domain sign-off, add a fail-loud guard so production/demo deploys cannot silently fall back to `DATA_PROVIDER=json`.

Required behavior:

- In a deployed demo environment, if `DATA_PROVIDER !== 'ams-demo'`, the app must fail a health check or expose a clear startup/config error.
- The app must not quietly serve old json-provider data on the public demo domain.

Suggested implementation shape:

- Add a small config assertion used by API routes or a health endpoint.
- Gate it behind an explicit env such as `REQUIRE_AMS_DEMO_PROVIDER=true`.
- On Cloud Run set:

```bash
REQUIRE_AMS_DEMO_PROVIDER=true
DATA_PROVIDER=ams-demo
AMS_DEMO_CORPUS_PATH=data/demo-corpus
```

Then smoke:

```bash
curl -s 'https://DEMO_DOMAIN/api/applications?pageSize=3'
curl -s 'https://DEMO_DOMAIN/api/ams-demo/rfis?officerId=officer-demo'
```

If the guard is not implemented yet, Marshall must record this as a demo launch risk and Lenny must explicitly audit provider wiring on the deployed URL.

## Local Development Note

Local `.env` currently points at the old JSON provider. For local demo work, use either:

```bash
DATA_PROVIDER=ams-demo AMS_DEMO_CORPUS_PATH=data/demo-corpus PORT=3000 bun run dev
```

or create local-only `.env.local`:

```bash
DATA_PROVIDER=ams-demo
AMS_DEMO_CORPUS_PATH=data/demo-corpus
```

`.env.local` is ignored by git and must not be treated as deployment configuration.

## Agent Responsibilities

**Marshall**

- Owns the Cloud Run release gate.
- Confirms env vars on the service.
- Collects deployed-URL smoke evidence before sign-off.
- Blocks release if deployed URL serves json-provider data.

**Lenny**

- Independently verifies provider behavior with deployed API responses.
- Confirms queue, RFI, and deep-review routes are using AMS demo data.
- Calls out any mock fallback or silent provider mismatch as a blocker.

**Sam**

- Implements the fail-loud guard when scheduled.
- Keeps auth/gateway work separate from provider-runtime correctness unless explicitly asked.
