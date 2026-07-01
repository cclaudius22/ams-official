/**
 * Exchange a GCS object path for a viewable URL (DISDocument.image_url).
 *
 * 2F.3 STUB — returns the gcs_path unchanged. Real signed-URL minting is
 * deferred to 2F.5: it needs @google-cloud/storage + the KMS-decrypt / GCS
 * objectViewer grant (still outstanding with Deloitte DevOps) and real objects
 * behind the paths — none of which exist against the local replica, where
 * gcs_path values are synthetic placeholders. Isolated here so 2F.5 swaps a
 * single function and every caller picks it up.
 */
export function signUrl(gcsPath: string | null | undefined): string | undefined {
  if (!gcsPath) return undefined
  // TODO(2F.5): mint a real time-limited signed URL via @google-cloud/storage.
  return gcsPath
}
