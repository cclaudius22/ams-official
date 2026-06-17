# Multi-source DIS — strategic moat (brainstorm log)

*17 June 2026. Captured for future brainstorming. Triggered by the Review Queue API design with Neeraj + a channel-model correction.*

## The thesis (Chris)

Being able to feed DIS from **multiple application sources** — and present a single, source-agnostic review/decision layer above them — is a major strategic advantage, potentially a **moat**. Governments are then **not reduced to any one input system**: DIS becomes the decision engine regardless of where applications originate (VisaKey, GovDirect, and — the bigger vision — other/future input systems). Could be revolutionary; at minimum, one of our moats going forward.

## Current architecture (the reality we corrected to)

- DIS is deployed **per single-channel environment**: a **VisaKey DIS** (only VisaKey applications) and a **GovDirect DIS** (only GovDirect applications). A given deployment holds only its own channel's data.
- The AMS provider seam (`getDISProvider`, `DIS_DATA_PROVIDER` + the deployment's URL/creds) is **deployment-agnostic** — it targets one deployment via config. So "test both" = point AMS at each; nothing in AMS hard-codes a channel.

## Why merging is an OV/AMS capability, not Deloitte's

A single DIS deployment physically contains only one channel's data, so it can't return multiple sources — **aggregation inherently lives ABOVE the deployments.** That layer is exactly where a **unified, multi-source government console** would be built — i.e. the moat surface is ours to own. It also keeps us cleanly in scope with Deloitte (below).

## The three AMS topologies (decision DEFERRED)

1. **Per-channel AMS instances** — one AMS per deployment, config-driven. Simplest; fits if sources are different operators. *(Depends on what governments decide.)*
2. **Unified queue across sources** — one AMS calls multiple deployments and merges into one pane of glass. **The strategically interesting one** — the multi-source console. More work (cross-deployment merge/pagination/sort), but additive on the AMS side. *(Risky to commit to before governments signal they want consolidation — but it's where the moat is.)*
3. **Switch active source** — one AMS, toggle the active deployment. **Safest for OV testing right now.**

Deferred until a real government requirement exists. Keeping the seam deployment-agnostic preserves all three at near-zero cost; unified is an *additive* change, never a rebuild.

## Deloitte scope line (so we never drift)

Only ever ask Deloitte for **the same single-channel read API, deployed to each environment.** All cross-source aggregation/merge is OV/AMS. This both protects scope *and* keeps the moat (the unified layer) in our hands.

## Open questions for future brainstorming

- Would governments actually want to consolidate multiple sources into one console, or keep them siloed per-operator?
- What sources beyond VisaKey / GovDirect could feed DIS? (The "many input systems" vision — where's the ceiling?)
- Multi-tenancy / auth / data-segregation across sources in a unified console.
- Per-source SLAs, teams, audit boundaries.
- Commercial framing: is the source-agnostic decision layer itself the product we sell to governments?

## Status

Parked. Revisit when a government requirement or strategic push makes it concrete. Today's decision: **AMS stays deployment-agnostic; topology unresolved by design.**
