// Exporter-side verification helpers.
// The exporter never mutates farm state — it reads the same ledger the farmer
// writes, so the verify page is a genuine mirror rather than a second source.

import {
  batchGps,
  batches,
  coopRain,
  mirrorLedgers,
  plot,
  type Bilingual,
  type LedgerEvent,
} from '../data/fixtures'

/**
 * URL encoded into the certificate QR.
 *
 * HashRouter-safe: the route lives after `#`, so a phone that scans this and
 * opens it on a static host (Vercel, or a laptop serving the LAN) lands on the
 * verify page without any server-side rewrite.
 */
export function verifyUrl(batchId: string): string {
  return `${location.origin}${location.pathname}#/exporter/verify/${batchId}`
}

/**
 * Records behind a batch. `batch-001` is the farmer's own batch and reads the
 * live ledger, so anything logged during the demo shows up on the exporter side
 * immediately. Other batches return their static mirror.
 */
export function batchLedger(batchId: string, ledger: LedgerEvent[]): LedgerEvent[] {
  if (batchId === 'batch-001') return ledger
  return mirrorLedgers[batchId] ?? []
}

export interface VerifySummary {
  records: number
  allVerified: true
  gps: string
  coop: Bilingual
}

/** Drives the green "all records verified" banner on the verify page. */
export function verifySummary(batchId: string, ledger: LedgerEvent[]): VerifySummary {
  return {
    records: batchLedger(batchId, ledger).length,
    allVerified: true,
    gps: batchGps[batchId] ?? plot.gps,
    coop: coopRain.name,
  }
}

/** Batch metadata for the verify / purchase screens. */
export function findBatch(batchId: string) {
  return batches.find((b) => b.id === batchId)
}
