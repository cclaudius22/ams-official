# Gemma 4 Azure Training And Inference Quota Brief

Last updated: 2026-07-04

This brief exists so AMS agents can find the OpenVisa Gemma model facts without digging through the sibling `openvisa-synthetic-data` repo.

## Executive Answer

For the AMS/DIS Skilled Worker narrative service and training pipeline, plan Azure quota around a self-hosted **Gemma 4 31B** model.

Training target, matching the GCP pipeline as closely as Azure allows:

- **Primary Azure capacity region:** `Sweden Central` (`swedencentral`)
- **Primary GPU family:** `NC_A100_v4`
- **4-GPU training lane equivalent:** `Standard_NC96ads_A100_v4`, 4x A100 80GB
- **2-GPU training lane equivalent:** `Standard_NC48ads_A100_v4`, 2x A100 80GB
- **Minimum training quota:** **96 NC A100 v4 family vCPUs** for one 4x A100 training lane
- **Pragmatic staged quota:** **144 NC A100 v4 family vCPUs** for one 4x A100 lane plus one 2x A100 lane
- **Identical GCP concurrency quota:** **192 NC A100 v4 family vCPUs** for one 4x A100 lane plus two 2x A100 lanes

Azure does not offer an exact public match for the old GCP `a2-highgpu-4g` / `a2-highgpu-2g` A100 40GB pairing. `NC_A100_v4` is the closest operational match because it preserves the 4-GPU and 2-GPU A100 job shapes, with larger 80GB cards. `ND_A100_v4` preserves 40GB A100 cards, but only as an 8-GPU training node.

Production inference target:

- **Primary Azure capacity region:** `Sweden Central` (`swedencentral`)
- **UK data-residency preference:** `UK South`, only if Microsoft confirms H100 capacity/quota is realistically available there
- **Primary GPU family:** `NCads_H100_v5`
- **Minimum production quota:** 2x H100 GPUs, equivalent to about **80 NCads H100 v5 family vCPUs**
- **Recommended quota request:** 4x H100 GPUs, equivalent to about **160 NCads H100 v5 family vCPUs**
- **Confidential inference option:** request `NCCads_H100_v5` as well if Azure confidential GPU serving is required for applicant data.

Do not request T4/A10 as the production path for this model. A10/T4 may be useful for small dev tests, but the trained model is 31B and our inference payloads are long immigration evidence packets. H100 gives the right headroom for latency, KV cache, and concurrency.

If UK South cannot supply H100 quota, do not wait on it. Request **Sweden Central** first for real capacity, then **West Europe** as fallback. Keep UK South as a future in-country serving target if Microsoft can make H100 capacity available.

## Model Identity

The trained OpenVisa Gemma line is:

- **Base model:** `google/gemma-4-31b-it`
- **Parameter size:** 31B class; training monitor records **31.8B** base parameters.
- **Training method:** QLoRA
- **Quantization used during training:** bitsandbytes **4-bit NF4**
- **LoRA config:** rank 64, alpha 128, dropout 0.05
- **Target modules:** `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`
- **Max sequence length:** 3072
- **Effective batch size:** 32
- **Optimizer:** `adamw_8bit`
- **DeepSpeed:** ZeRO Stage 2, bf16
- **Trainable params in SW run:** 533,926,912, about 1.68% of 31.8B

Important deployment note: these are not plain bf16 full-weight exports. The training script loads the base with `load_in_4bit=True`, `bnb_4bit_quant_type="nf4"`, `bnb_4bit_compute_dtype=torch.bfloat16`, and `bnb_4bit_use_double_quant=True`. One validation note states the merged Family safetensors contain NF4-quantized weights and cannot be loaded as simple bfloat16. Azure serving must support either:

1. base model `google/gemma-4-31b-it` plus LoRA adapter, loaded with BNB 4-bit; or
2. the merged NF4 safetensors with the correct quantization config restored.

Do not assume a generic vLLM/TGI bf16 load will work without checking quantization support and the saved `config.json`.

## Current GCP Source Of Truth

| Item | Value |
|---|---|
| Source repo | `../openvisa-synthetic-data` |
| GCP project | `prj-rnd-4297` |
| GCP project number | `658150273844` |
| Main bucket | `gs://ov-rnd-synthetic-corpus/` |
| Model artifact root | `gs://ov-rnd-synthetic-corpus/models/` |
| Training-data root | `gs://ov-rnd-synthetic-corpus/datasets/training_data/gemma4/` |
| Gold corpus root | `gs://ov-rnd-synthetic-corpus/datasets/gold/` |
| GCP training region | `us-central1` |
| GCP bucket locality note | source docs describe the data bucket as `europe-west2`; verify bucket metadata before bulk transfer |
| Default compute service account | `658150273844-compute@developer.gserviceaccount.com` |

Known GCP training VMs from the source docs:

| VM | GCP shape | Zone | Use |
|---|---|---|---|
| `gemma4-sw-training` | `a2-highgpu-4g`, 4x A100 40GB | `us-central1-a` | SW, Germany, Schengen |
| `gemma4-aegis-training` | `a2-highgpu-2g`, 2x A100 40GB | `us-central1-b` | AEGIS, Portugal |
| `gemma4-family-training` | `a2-highgpu-2g`, 2x A100 40GB | `us-central1-f` | Family |

Training package versions observed on the Family VM:

- `transformers 5.7.0`
- `peft 0.19.1`
- `accelerate 1.13.0`
- `trl 1.3.0`
- `bitsandbytes 0.49.2`
- `deepspeed 0.18.9`
- `datasets 4.8.5`

## GCP To Azure Compute Mapping

The GCP machines were A100 training machines. The Azure request should separate three jobs:

1. transfer/storage of the corpora and model artifacts;
2. training/fine-tuning;
3. inference serving.

| Workload | What GCP used | Azure primary | Azure fallback | Notes |
|---|---|---|---|---|
| SW/Germany/Schengen training | `a2-highgpu-4g`, 4x A100 40GB | `Standard_NC96ads_A100_v4` in `Sweden Central` | `Standard_ND96asr_v4` if 40GB A100 parity matters more than GPU count | This is the closest Azure match to the GCP 4x A100 lane: same A100 family and same 4-GPU job shape, but 80GB per GPU instead of 40GB. |
| AEGIS/Portugal/Family training | `a2-highgpu-2g`, 2x A100 40GB | `Standard_NC48ads_A100_v4` in `Sweden Central` | Use one `Standard_NC96ads_A100_v4` and run the 2-GPU jobs sequentially if 2-GPU capacity is unavailable | This preserves the old 2-GPU training lane shape with more memory headroom. |
| Upgrade training lane | not used on GCP | `Standard_ND96isr_H100_v5` in `Sweden Central` | `Standard_ND96amsr_A100_v4` | This is not identical to GCP. Treat it as a future faster training lane, not the parity baseline. |
| Production inference | not on GCP yet | `Standard_NC40ads_H100_v5` | `Standard_NC80adis_H100_v5` for 2-GPU host | 1 H100 should be enough for initial Gemma 4 31B serving. Request 2 GPUs worth of quota so staging/failover is not blocked. |
| Corpus transfer / staging | GCS bucket | Azure Storage account with ADLS Gen2 in `Sweden Central` | Blob Storage without hierarchical namespace | Use AzCopy GCS -> Azure Blob server-side copy. The training VM should copy the current run locally before training. |

Important Azure SKU names:

| Family | VM size | GPUs | vCPUs | GPU memory | Use |
|---|---|---:|---:|---:|---|
| `NCads_H100_v5` | `Standard_NC40ads_H100_v5` | 1x H100 NVL | 40 | 94GB | Inference / batch inference / small ML dev |
| `NCads_H100_v5` | `Standard_NC80adis_H100_v5` | 2x H100 NVL | 80 | 188GB total | Higher-throughput inference |
| `NC_A100_v4` | `Standard_NC48ads_A100_v4` | 2x A100 | 48 | 160GB total | Closest Azure match to GCP 2x A100 training lane |
| `NC_A100_v4` | `Standard_NC96ads_A100_v4` | 4x A100 | 96 | 320GB total | Closest Azure match to GCP 4x A100 training lane |
| `ND_H100_v5` | `Standard_ND96isr_H100_v5` | 8x H100 | 96 | 640GB total | Future faster training lane |
| `ND_A100_v4` | `Standard_ND96asr_v4` | 8x A100 | 96 | 320GB total | A100 training fallback |
| `NDm_A100_v4` | `Standard_ND96amsr_A100_v4` | 8x A100 | 96 | 640GB total | Strong A100 fallback if H100 unavailable |

## Model Artifact Inventory

All paths are under `gs://ov-rnd-synthetic-corpus/models/`.

| Model | Domain | Azure priority | GCS path | Artifact notes |
|---|---|---:|---|---|
| `gemma4-immigration-sw-v1` | UK Skilled Worker | P0 | `gemma4-immigration-sw-v1/` | Source docs mark the model `SHIP IT`; canonical path exists in handover docs. Confirm final GCS export before Azure pull. |
| `gemma4-germany-sw-v1` | Germany Skilled Worker / Blue Card / Chancenkarte | P2 | `gemma4-germany-sw-v1/` | `merged/model.safetensors` documented at 17.01 GiB. Verdict: `SHIP IT`. |
| `gemma4-aegis-asylum-v1` | UK asylum / border intelligence | P2 | `gemma4-aegis-asylum-v1/` | Adapter export documented: 53 files, 1.02 GiB, `adapter_model.safetensors` 1,068,037,840 bytes. Local merged model documented at about 18 GB. |
| `gemma4-portugal-v1` | Portugal D8/D7/D2 | P3 | `gemma4-portugal-v1/` | GCS export documented complete: 18.03 GiB across 13 objects, `model.safetensors` 17.01 GiB. |
| `gemma4-immigration-family-v1` | UK Family / Appendix FM | P2 | `gemma4-immigration-family-v1/` | GCS export documented complete: adapter 1.02 GiB, merged 17.04 GiB, `model.safetensors` 17.01 GiB. Known load caveat: NF4 quantized weights. |
| `gemma4-schengen-v1` | Schengen Type C | P3 | `gemma4-schengen-v1/` | GCS export documented complete: adapter 1.02 GiB plus merged 17.01 GiB. Verdict: `ACCEPTABLE v1`. |

P0 for AMS is `gemma4-immigration-sw-v1`. The others matter for future OpenVisa products, but they should not drive the first Azure quota request unless we intend to serve multiple specialist models concurrently.

## Training Data Inventory

All instruct data is under `gs://ov-rnd-synthetic-corpus/datasets/training_data/gemma4/`.

| Run | Domain | Train | Eval | GCS path |
|---|---|---:|---:|---|
| Run 1 | UK Skilled Worker | 109,648 | 5,770 | `run1/` |
| Run 2 | UK Asylum / AEGIS | 22,554 | 1,185 | `run2/` |
| Run 3 | Portugal D8+D7+D2 | 65,746 | 3,422 | `run3/` |
| Run 4 | Germany Skilled Worker | 23,813 | 1,240 | `run4/` |
| Run 5 | UK Family | 22,813 | 1,164 | `run5/` |
| Schengen 10K | Schengen Type C | 9,503 | 497 | `schengen_10k/` |

Gold corpora are under `gs://ov-rnd-synthetic-corpus/datasets/gold/`, with the largest relevant AMS corpus at `skilled_worker/processed/`.

## GCP To Azure Corpus Transfer Plan

Use **AzCopy** from Google Cloud Storage to Azure Blob/ADLS Gen2. Microsoft documents this path directly: AzCopy can authorize to GCS with a Google service-account key and copy from `https://storage.cloud.google.com/...` to `https://<storage-account>.blob.core.windows.net/...`. The copy uses Azure Storage server-side APIs and does not route object bytes through the local laptop.

### What To Copy

Minimum for Azure training:

| Source | Destination prefix | Why |
|---|---|---|
| `gs://ov-rnd-synthetic-corpus/datasets/training_data/gemma4/` | `datasets/training_data/gemma4/` | Instruct JSONL used by the training launcher. |
| `gs://ov-rnd-synthetic-corpus/datasets/gold/` | `datasets/gold/` | Gold corpora and audit trail for regeneration/evaluation. |
| `gs://ov-rnd-synthetic-corpus/models/` | `models/` | Existing adapters, merged models, scorecards, and eval outputs. |
| `gs://ov-rnd-synthetic-corpus/automl/doc_classifier_v2/` | `automl/doc_classifier_v2/` | Optional, only if the Azure lane also retrains/serves the document classifier. |
| `gs://ov-rnd-synthetic-corpus/datasets/training_data/photo_classifier/` | `datasets/training_data/photo_classifier/` | Optional, only if Azure retrains/serves photo compliance. |

If time is tight, copy `datasets/training_data/gemma4/run1/` and `models/gemma4-immigration-sw-v1/` first, then backfill the rest.

### Azure Storage Target

Recommended target:

| Setting | Recommendation |
|---|---|
| Region | `Sweden Central` |
| Storage type | StorageV2 with hierarchical namespace enabled (ADLS Gen2) |
| Redundancy | LRS for first migration; upgrade replication policy later if needed |
| Container | `openvisa-corpus` |
| Prefix root | `gcp/ov-rnd-synthetic-corpus/` or direct roots such as `models/`, `datasets/` |

### Transfer Commands

Create a GCP service account key with read/list access to `gs://ov-rnd-synthetic-corpus/`. Store it outside the repo.

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/secure/path/gcp-ov-rnd-reader.json
export GOOGLE_CLOUD_PROJECT=prj-rnd-4297
export AZURE_STORAGE_ACCOUNT=<storage-account-name>
export AZURE_CONTAINER=openvisa-corpus
export AZURE_SAS='<container-sas-token>'
```

Copy training data:

```bash
azcopy copy \
  'https://storage.cloud.google.com/ov-rnd-synthetic-corpus/datasets/training_data/gemma4' \
  "https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/datasets/training_data/gemma4${AZURE_SAS}" \
  --recursive=true \
  --from-to=GCPBlob \
  --s2s-handle-invalid-metadata=RenameIfInvalid
```

Copy gold corpora:

```bash
azcopy copy \
  'https://storage.cloud.google.com/ov-rnd-synthetic-corpus/datasets/gold' \
  "https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/datasets/gold${AZURE_SAS}" \
  --recursive=true \
  --from-to=GCPBlob \
  --s2s-handle-invalid-metadata=RenameIfInvalid
```

Copy model artifacts:

```bash
azcopy copy \
  'https://storage.cloud.google.com/ov-rnd-synthetic-corpus/models' \
  "https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/models${AZURE_SAS}" \
  --recursive=true \
  --from-to=GCPBlob \
  --s2s-handle-invalid-metadata=RenameIfInvalid
```

### Verification

Generate source and destination manifests:

```bash
gcloud storage ls -l -r gs://ov-rnd-synthetic-corpus/datasets/training_data/gemma4/** \
  | sort > /tmp/gemma4-gcs-manifest.txt

az storage blob list \
  --account-name "${AZURE_STORAGE_ACCOUNT}" \
  --container-name "${AZURE_CONTAINER}" \
  --prefix datasets/training_data/gemma4 \
  --query "[].{name:name,size:properties.contentLength}" \
  -o tsv \
  | sort > /tmp/gemma4-azure-manifest.txt
```

At minimum verify object counts and total bytes for:

- `datasets/training_data/gemma4/`
- `datasets/gold/`
- `models/gemma4-immigration-sw-v1/`

Before training, copy the active run from Blob/ADLS to local NVMe on the training VM:

```bash
mkdir -p /mnt/resource/openvisa/training_data/gemma4/run1
azcopy copy \
  "https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/datasets/training_data/gemma4/run1${AZURE_SAS}" \
  /mnt/resource/openvisa/training_data/gemma4/run1 \
  --recursive=true
```

Run training from local disk, not directly over Blob, unless the Azure ML pipeline has already been benchmarked with mounted storage.

## Azure Quota Request

Request quota by Azure VM family in the target region. Azure quota is usually expressed as **family vCPUs**, not raw GPU count.

### Inference Quota Required For AMS Phase 1

| Priority | Azure region | Quota family | Ask | Why |
|---|---|---|---:|---|
| P0 | `Sweden Central` | `NCads_H100_v5` family vCPUs | **160 vCPUs** | Main capacity request for serving Gemma 4 31B: 2 prod replicas, 1 staging/canary, 1 benchmark/failover. |
| P0-minimum | `Sweden Central` | `NCads_H100_v5` family vCPUs | **80 vCPUs** | Absolute minimum for 2x 1-H100 prod replicas. |
| P1 | `UK South` | `NCads_H100_v5` family vCPUs | **80-160 vCPUs** | Only if Microsoft confirms supply; useful for in-country production once capacity exists. |
| P1 fallback | `West Europe` | `NCads_H100_v5` family vCPUs | **160 vCPUs** | First non-Sweden fallback. |

If the portal asks for specific machine family justification, say:

> OpenVisa needs to serve a self-hosted, immigration-specialist Gemma 4 31B QLoRA/NF4 model for UK Skilled Worker caseworker narrative inference. Each request may include long evidence packets and policy reasoning. H100-class GPUs are required for reliable latency, KV-cache headroom, and concurrent officer usage. Initial production target is two active replicas plus staging and benchmark/failover capacity.

### Training Quota Request

The `NCads_H100_v5` request above is mainly for **inference and small batch inference**. For a training pipeline that mirrors GCP, request the Azure A100 family first.

Recommended training request:

| Priority | Azure region | Quota family | Ask | Why |
|---|---|---|---:|---|
| P0 | `Sweden Central` | `NC_A100_v4` family vCPUs | **192 vCPUs** | Full GCP concurrency match: one 4x A100 lane (`Standard_NC96ads_A100_v4`) plus two 2x A100 lanes (`2 x Standard_NC48ads_A100_v4`). |
| P0-staged | `Sweden Central` | `NC_A100_v4` family vCPUs | **144 vCPUs** | Pragmatic staged ask if Microsoft pushes back: one 4x A100 lane plus one 2x A100 lane. |
| P0-minimum | `Sweden Central` | `NC_A100_v4` family vCPUs | **96 vCPUs** | Minimum viable parity: one 4x A100 lane. Run the old 2x A100 jobs sequentially on this lane if needed. |
| P1 fallback | `West Europe` | `NC_A100_v4` family vCPUs | **192 vCPUs** | Same full parity request if Sweden Central cannot supply A100 capacity. |
| P2 fallback | `Sweden Central` | `ND_A100_v4` family vCPUs | **96 vCPUs** | 8x A100 40GB. Same A100 memory size as GCP, but double the largest old GPU count. |
| P2 fallback | `Sweden Central` | `NDm_A100_v4` family vCPUs | **96 vCPUs** | 8x A100 80GB. Stronger A100 fallback if NC A100 is unavailable. |
| P3 upgrade | `Sweden Central` | `ND_H100_v5` family vCPUs | **96 vCPUs** | Future faster training lane. This is not the identical GCP setup, so do not make it the baseline parity ask. |

Training justification:

> OpenVisa trained Gemma 4 31B QLoRA/NF4 specialist immigration models on multi-GPU A100 infrastructure in GCP. The current Azure requirement is to reproduce that A100 training pipeline as closely as possible in Sweden Central. The GCP setup used one 4x A100 40GB lane and two 2x A100 40GB lanes. Azure NC A100 v4 provides the closest matching job shapes with 4x A100 and 2x A100 VMs, using 80GB A100 cards. We need 192 NC A100 v4 family vCPUs to mirror the three GCP training VMs concurrently. If capacity is constrained, 144 family vCPUs gives us one 4x lane and one 2x lane, and 96 family vCPUs is the minimum single-lane fallback.

If Microsoft pushes back on `NC_A100_v4`, ask for `ND_A100_v4` or `NDm_A100_v4` as the fallback. If Microsoft strongly prefers H100 capacity, accept `ND_H100_v5` as an upgrade lane, but keep the record clear that it is not the identical GCP training setup.

### Confidential GPU Option

Because this handles visa applicant data, also evaluate confidential GPU quota:

| Priority | Azure region | Quota family | Ask | Why |
|---|---|---|---:|---|
| P1 | `Sweden Central` | `NCCads_H100_v5` family vCPUs | 40-80 vCPUs | 1-2 confidential H100 instances for sensitive-data pilot if available. |
| P1 fallback | `UK South` | `NCCads_H100_v5` family vCPUs | 40-80 vCPUs | In-country confidential GPU target if Microsoft can supply it. |
| P2 fallback | `West Europe` | `NCCads_H100_v5` family vCPUs | 40-80 vCPUs | Fallback confidential GPU region. |

Do not block the main quota request on confidential GPU availability. Request standard `NCads_H100_v5` first so the inference lane can move.

### Not Recommended For Production

| GPU family | Position |
|---|---|
| `NCasT4_v3` / T4 16GB | Too small for production 31B serving. Use only for tiny test models or utility classifiers. |
| `NVadsA10_v5` / A10 24GB | Possible for constrained dev experiments, but too tight for long-context 31B production serving. |
| `ND_H100_v5` / 8x H100 | Not needed for first inference deployment and not identical to the old GCP A100 setup. Keep it as a future training upgrade, not the parity baseline. |

## Runtime Recommendation

Serve first with one model:

- `gemma4-immigration-sw-v1`
- 1 H100 per replica
- 2 active replicas for production
- 1 staging/canary replica
- 1 spare/benchmark slot while tuning serving stack

Candidate serving stacks:

- vLLM if Gemma 4 + NF4/LoRA path is supported in the selected version.
- Hugging Face TGI if BNB 4-bit and LoRA adapter loading is cleaner.
- Plain Transformers + PEFT for initial correctness validation before optimizing throughput.

Validation steps before production:

1. Pull `gemma4-immigration-sw-v1` artifacts from GCS.
2. Verify whether Azure will serve merged NF4 or base-plus-adapter.
3. Run a 10-case Skilled Worker blind eval against the same scorecard criteria used in training.
4. Benchmark real AMS evidence payloads, not toy prompts.
5. Measure p50/p95 latency with 1, 5, 10, and 25 concurrent officer-style requests.

## Useful Verification Commands

GCP:

```bash
gcloud config set project prj-rnd-4297
gcloud storage ls gs://ov-rnd-synthetic-corpus/models/
gcloud storage du -h gs://ov-rnd-synthetic-corpus/models/gemma4-immigration-sw-v1/**
gcloud storage ls gs://ov-rnd-synthetic-corpus/models/gemma4-immigration-sw-v1/merged/**
gcloud storage ls gs://ov-rnd-synthetic-corpus/models/gemma4-immigration-sw-v1/adapter/**
```

Azure SKU check after `az login`:

```bash
AZURE_CONFIG_DIR=/tmp/az-codex az vm list-skus \
  --location swedencentral \
  --resource-type virtualMachines \
  --all \
  --query "[?contains(name, 'A100') || contains(name, 'H100')].[name, restrictions]" \
  -o table
```

Repeat with `uksouth` and `westeurope`. This environment could not run the SKU check without Azure login.

## Source Files Consulted

Sibling repo: `../openvisa-synthetic-data`

- `src/v2/ml/training/train_gemma4_multigpu.py`
- `docs/SESSION_LOG.md`
- `docs/plans/vm-setup-requirements.md`
- `docs/plans/homerun_25apr-29may 2026/Final/sso-final-state.md`
- `docs/plans/homerun_25apr-29may 2026/02-gemma-training/sprint-results-final.md`
- `docs/plans/homerun_25apr-29may 2026/02-gemma-training/SW/sw-training-02may.md`
- `docs/plans/homerun_25apr-29may 2026/02-gemma-training/SW/sw-gcs-handover-before-germany.md`

Microsoft Azure docs to cross-check while filing quota:

- `https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nc-family`
- `https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nd-family`
- `https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nv-family`
