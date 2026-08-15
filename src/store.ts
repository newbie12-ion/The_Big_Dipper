// AgriTrust simulated backend.
//
// There is no server. This store IS the backend: sensor simulation, the
// hash-chained ledger, certificate readiness, the market batch lifecycle and
// notifications all live here. The UI only reads and calls actions.

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ledgerHash } from './lib/hash'
import {
  coopRain,
  seedLastBlock,
  seedLedger,
  seedNotifs,
  type BatchStatus,
  type Bilingual,
  type EventType,
  type Lang,
  type LedgerEvent,
  type Notif,
} from './data/fixtures'

// The frontend imports `sha256Hex` from the store today — keep that path alive.
export { sha256Hex, shortHash, ledgerHash } from './lib/hash'

export interface HistoryPoint {
  t: number
  moisture: number
  temp: number
  humidity: number
  ec: number
}

export interface NewEvent {
  type: EventType
  title: Bilingual
  detail: Bilingual
}

export interface NewNotif {
  icon: string
  title: Bilingual
  body: Bilingual
}

export interface State {
  // --- sensors (never persisted — they re-seed on every load) ---
  moisture: number
  temp: number
  humidity: number
  soilEC: number // dS/m — salinity. Replaces the excluded NPK pseudo-sensor.
  rainMm24h: number // co-op gauge 1.2 km away, mm in last 24 h. Fixed on stage.
  history: HistoryPoint[]
  pumpOn: boolean
  pumpTicks: number
  togglePump: () => void
  tick: () => void

  // --- ledger ---
  ledger: LedgerEvent[]
  lastBlock: number
  addEvent: (
    typeOrEvent: EventType | NewEvent,
    title?: Bilingual,
    detail?: Bilingual,
  ) => LedgerEvent
  readiness: () => number

  // --- market ---
  batchStatus: BatchStatus
  listBatch: () => void
  sellBatch: () => void

  // --- notifications ---
  notifs: Notif[]
  markNotifsRead: () => void
  pushNotif: (n: NewNotif) => void

  // --- language ---
  lang: Lang
  langChosen: boolean
  setLang: (l: Lang) => void
  chooseLang: (l: Lang) => void

  resetDemo: () => void
}

// ---------------------------------------------------------------------------
// Simulation constants
// ---------------------------------------------------------------------------

const HISTORY_LEN = 24
const PUMP_TICKS = 10 // ~15 s at the UI's 1.5 s cadence
const PUMP_GAIN = 1.4 // % moisture per tick → ~+14% over one activation
const DRY_DRIFT = -0.22 // dry-day baseline loss per tick

const MOISTURE_MIN = 20
const MOISTURE_MAX = 78

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const round1 = (v: number) => Math.round(v * 10) / 10
const round2 = (v: number) => Math.round(v * 100) / 100

/** Symmetric noise in roughly -1..1. */
const drift = () => Math.random() * 2 - 1

function seedHistory(moisture: number, temp: number, humidity: number, ec: number): HistoryPoint[] {
  const out: HistoryPoint[] = []
  // Walk backwards from "now" so the chart ends exactly on the live values.
  let m = moisture
  for (let i = HISTORY_LEN - 1; i >= 0; i--) {
    out[i] = {
      t: i,
      moisture: round1(clamp(m, MOISTURE_MIN, MOISTURE_MAX)),
      temp: round1(clamp(temp + drift() * 1.8, 29, 34)),
      humidity: Math.round(clamp(humidity + drift() * 8, 50, 95)),
      ec: round2(clamp(ec + drift() * 0.08, 0.7, 1.8)),
    }
    m += 0.35 + Math.random() * 0.3 // older points were wetter (dry day)
  }
  return out
}

function seedState() {
  const moisture = 61
  const temp = 31.4
  const humidity = 72
  const soilEC = 1.1
  return {
    moisture,
    temp,
    humidity,
    soilEC,
    rainMm24h: coopRain.mm24h,
    history: seedHistory(moisture, temp, humidity, soilEC),
    pumpOn: false,
    pumpTicks: 0,
    ledger: seedLedger.map((e) => ({ ...e })),
    lastBlock: seedLastBlock,
    batchStatus: 'draft' as BatchStatus,
    notifs: seedNotifs.map((n) => ({ ...n })),
    lang: 'vi' as Lang,
    langChosen: false,
  }
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** `dd/MM · HH:mm`, matching the seed ledger format. */
function stamp(d = new Date()) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

let eventSeq = 0

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...seedState(),

      // -------------------------------------------------------------------
      // Sensors
      // -------------------------------------------------------------------

      togglePump: () => {
        const s = get()
        if (s.pumpOn) {
          // Stopping early just halts the climb — the activation was already
          // logged, and one activation must never produce two ledger events.
          set({ pumpOn: false, pumpTicks: 0 })
          return
        }
        set({ pumpOn: true, pumpTicks: 0 })
        get().addEvent({
          type: 'water',
          title: { vi: 'Bật bơm tưới Khu 1', en: 'Irrigation pump ON — Zone 1' },
          detail: {
            vi: 'Tưới nhỏ giọt tự động · trạm A-102',
            en: 'Automatic drip cycle · station A-102',
          },
        })
      },

      tick: () => {
        const s = get()

        const pumping = s.pumpOn && s.pumpTicks < PUMP_TICKS
        const delta = pumping ? PUMP_GAIN + drift() * 0.15 : DRY_DRIFT + drift() * 0.12
        const moisture = round1(clamp(s.moisture + delta, MOISTURE_MIN, MOISTURE_MAX))

        const temp = round1(clamp(s.temp + drift() * 0.25, 29, 34))
        const humidity = Math.round(clamp(s.humidity + drift() * 1.5, 50, 95))
        const soilEC = round2(clamp(s.soilEC + drift() * 0.02, 0.7, 1.8))

        const nextTicks = s.pumpOn ? s.pumpTicks + 1 : 0
        const autoOff = s.pumpOn && nextTicks >= PUMP_TICKS

        // Rolling 24-point window, newest last.
        const history = s.history
          .slice(-(HISTORY_LEN - 1))
          .concat({ t: 0, moisture, temp, humidity, ec: soilEC })
          .map((p, i) => ({ ...p, t: i }))

        set({
          moisture,
          temp,
          humidity,
          soilEC,
          history,
          pumpOn: autoOff ? false : s.pumpOn,
          pumpTicks: autoOff ? 0 : nextTicks,
          // rainMm24h intentionally untouched — determinism beats realism on stage.
        })
      },

      // -------------------------------------------------------------------
      // Ledger
      // -------------------------------------------------------------------

      addEvent: (typeOrEvent, title, detail) => {
        const input: NewEvent =
          typeof typeOrEvent === 'string'
            ? {
                type: typeOrEvent,
                title: title ?? { vi: '', en: '' },
                detail: detail ?? { vi: '', en: '' },
              }
            : typeOrEvent

        const s = get()
        const block = s.lastBlock + 3 + Math.floor(Math.random() * 20) // +3..+22
        const event: LedgerEvent = {
          id: `ev-${Date.now()}-${eventSeq++}`,
          type: input.type,
          title: input.title,
          detail: input.detail,
          time: stamp(),
          hash: ledgerHash({
            type: input.type,
            title: input.title,
            detail: input.detail,
            prevHash: s.ledger[0]?.hash ?? null,
            block,
            ts: Date.now(),
          }),
          block,
        }

        set({ ledger: [event, ...s.ledger], lastBlock: block })
        return event
      },

      // Draft certificate: 78% with the 14 seeded records, +2% per new event,
      // capped at 96% — a draft dossier is never 100%.
      readiness: () => Math.min(96, 78 + Math.max(0, get().ledger.length - 14) * 2),

      // -------------------------------------------------------------------
      // Market
      // -------------------------------------------------------------------

      listBatch: () => {
        if (get().batchStatus !== 'draft') return
        set({ batchStatus: 'listed' })
      },

      sellBatch: () => {
        // Guard: Purchase tapped twice must not sell twice.
        if (get().batchStatus === 'sold') return

        set({ batchStatus: 'sold' })

        get().pushNotif({
          icon: '🎉',
          title: { vi: 'Đã bán lô hàng!', en: 'Batch sold!' },
          body: {
            vi: 'Lô 001 · 1.200 kg · nhà nhập khẩu EU đã thanh toán',
            en: 'Batch 001 · 1,200 kg · EU importer has paid',
          },
        })

        get().addEvent({
          type: 'scan',
          title: { vi: 'Bán lô hàng cho nhà xuất khẩu EU', en: 'Batch sold to EU exporter' },
          detail: {
            vi: 'Lô 001 · 1.200 kg · 1,85 USD/kg · chuyển quyền sở hữu',
            en: 'Batch 001 · 1,200 kg · USD 1.85/kg · ownership transferred',
          },
        })
      },

      // -------------------------------------------------------------------
      // Notifications
      // -------------------------------------------------------------------

      markNotifsRead: () => set({ notifs: get().notifs.map((n) => ({ ...n, read: true })) }),

      pushNotif: (n) =>
        set({
          notifs: [
            { id: `nt-${Date.now()}-${eventSeq++}`, ...n, time: stamp(), read: false },
            ...get().notifs,
          ],
        }),

      // -------------------------------------------------------------------
      // Language
      // -------------------------------------------------------------------

      setLang: (l) => set({ lang: l }),
      chooseLang: (l) => set({ lang: l, langChosen: true }),

      // -------------------------------------------------------------------
      // Stage reset
      // -------------------------------------------------------------------

      // Restores everything to seed, including langChosen: false, so the next
      // launch starts at the Welcome screen. This is the between-demos button.
      resetDemo: () => set({ ...seedState() }),
    }),
    {
      name: 'agritrust-demo-v2',
      storage: createJSONStorage(() => localStorage),
      // Sensors are deliberately absent: every load gets fresh drift.
      partialize: (s) => ({
        lang: s.lang,
        langChosen: s.langChosen,
        ledger: s.ledger,
        lastBlock: s.lastBlock,
        batchStatus: s.batchStatus,
        notifs: s.notifs,
      }),
    },
  ),
)

/** Unread badge count for the bottom nav. */
export const unreadCount = (s: State) => s.notifs.filter((n) => !n.read).length

export default useStore
