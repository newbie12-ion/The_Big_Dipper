import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  baseNotifications,
  buildPumpEvent,
  buildScanEvent,
  exporterBatches,
  farmerProfile,
  plots,
  pumpNotification,
  scanLoggedNotification,
  scanScenarios,
  seededLedgerEvents,
  soldNotification,
  type EventType,
  type LedgerEvent,
  type NotificationItem,
  type PlotId,
  type ZoneId,
} from "../data/mockData";
import { persistDemoState, persistLedgerEvent, persistNotification } from "../lib/backend";
import type { Language, LocalizedText } from "../lib/i18n";

export type Role = "farmer" | "exporter";
export type BatchStatus = "draft" | "listed" | "sold";

interface AppState {
  language: Language | null;
  lang: Language;
  langChosen: boolean;
  role: Role;
  selectedPlotId: PlotId;
  selectedZoneId: ZoneId;
  selectedScanId: string;
  moisture: number;
  soilEC: number;
  temp: number;
  humidity: number;
  rainMm24h: number;
  history: Array<{ hour: string; moisture: number }>;
  pumpOn: boolean;
  irrigationOn: boolean;
  pumpTicks: number;
  pumpCycles: number;
  batchStatus: BatchStatus;
  marketSold: boolean;
  loggedScanIds: string[];
  ledger: LedgerEvent[];
  ledgerEvents: LedgerEvent[];
  lastBlock: number;
  notifs: NotificationItem[];
  notifications: NotificationItem[];
  setLanguage: (language: Language) => void;
  chooseLang: (language: Language) => void;
  toggleLanguage: () => void;
  setRole: (role: Role) => void;
  setSelectedPlotId: (plotId: PlotId) => void;
  setSelectedZoneId: (zoneId: ZoneId) => void;
  setSelectedScanId: (scanId: string) => void;
  addEvent: (type: EventType, title: LocalizedText, detail?: LocalizedText) => LedgerEvent;
  logSelectedScan: () => LedgerEvent | undefined;
  togglePump: () => void;
  tick: () => void;
  readiness: () => number;
  listBatch: () => void;
  sellBatch: () => void;
  completePurchase: () => void;
  markNotifsRead: () => void;
  pushNotif: (notification: NotificationItem) => void;
  resetDemo: () => void;
}

const sortEvents = (events: LedgerEvent[]) =>
  [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).reverse();

const initialHistory = [
  { hour: "00:00", moisture: 58 }, { hour: "04:00", moisture: 55 },
  { hour: "08:00", moisture: 52 }, { hour: "12:00", moisture: 48 },
  { hour: "16:00", moisture: 44 }, { hour: "20:00", moisture: 41 },
  { hour: "Now", moisture: 41 },
];

const initialState = () => ({
  language: null as Language | null,
  lang: "vi" as Language,
  langChosen: false,
  role: "farmer" as Role,
  selectedPlotId: "plot-dragon" as PlotId,
  selectedZoneId: "zone-1" as ZoneId,
  selectedScanId: "dragon-anthracnose",
  moisture: 41, soilEC: 1.1, temp: 31, humidity: 72, rainMm24h: 0,
  history: initialHistory,
  pumpOn: false, irrigationOn: false, pumpTicks: 0, pumpCycles: 0,
  batchStatus: "draft" as BatchStatus, marketSold: false,
  loggedScanIds: [] as string[],
  ledger: sortEvents(seededLedgerEvents),
  ledgerEvents: sortEvents(seededLedgerEvents),
  lastBlock: 48305,
  notifs: baseNotifications,
  notifications: baseNotifications,
});

const syncDemoState = (state: AppState) => {
  void persistDemoState({
    language: state.language, role: state.role, selectedPlotId: state.selectedPlotId,
    selectedScanId: state.selectedScanId, irrigationOn: state.pumpOn,
    pumpCycles: state.pumpTicks, marketSold: state.batchStatus === "sold",
    loggedScanIds: state.loggedScanIds,
  });
};

export const getCertificateReadiness = (state: Pick<AppState, "ledger">) =>
  Math.min(96, 78 + Math.max(0, state.ledger.length - 14) * 2);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState(),
      setLanguage: (language) => set((state) => {
        const next = { language, lang: language, langChosen: true };
        syncDemoState({ ...state, ...next });
        return next;
      }),
      chooseLang: (language) => get().setLanguage(language),
      toggleLanguage: () => get().setLanguage(get().lang === "vi" ? "en" : "vi"),
      setRole: (role) => set({ role }),
      setSelectedPlotId: (selectedPlotId) => set({ selectedPlotId }),
      setSelectedZoneId: (selectedZoneId) => set({ selectedZoneId }),
      setSelectedScanId: (selectedScanId) => {
        const scenario = scanScenarios.find((item) => item.id === selectedScanId);
        set({ selectedScanId, selectedPlotId: scenario?.affectsPlotId ?? get().selectedPlotId });
      },
      addEvent: (type, title, detail) => {
        const state = get();
        const blockNumber = state.lastBlock + 1;
        const event: LedgerEvent = {
          id: `evt-${type}-${blockNumber}`, type, title,
          detail: detail ?? { vi: "Đã ghi tự động bởi AgriTrust.", en: "Automatically logged by AgriTrust." },
          timestamp: `18:${String(Math.min(59, state.ledger.length - 4)).padStart(2, "0")}`,
          hash: `${type}${blockNumber}a3f9c7e2b6d1f0428ed159ac7430b8f7`.padEnd(64, "0"), blockNumber,
        };
        const ledger = sortEvents([event, ...state.ledger]);
        set({ ledger, ledgerEvents: ledger, lastBlock: blockNumber });
        void persistLedgerEvent(event);
        return event;
      },
      logSelectedScan: () => {
        const state = get();
        if (state.loggedScanIds.includes(state.selectedScanId)) return undefined;
        const scenario = scanScenarios.find((item) => item.id === state.selectedScanId);
        if (!scenario) return undefined;
        const event = buildScanEvent(scenario);
        const ledger = sortEvents([event, ...state.ledger]);
        const notifications = [scanLoggedNotification, ...state.notifications];
        set({ ledger, ledgerEvents: ledger, lastBlock: event.blockNumber,
          loggedScanIds: [...state.loggedScanIds, scenario.id], notifications, notifs: notifications });
        void persistLedgerEvent(event); void persistNotification(scanLoggedNotification);
        return event;
      },
      togglePump: () => {
        const state = get(); const pumpOn = !state.pumpOn; const event = buildPumpEvent(pumpOn);
        const ledger = sortEvents([event, ...state.ledger]);
        const notifications = pumpOn ? [pumpNotification, ...state.notifications] : state.notifications;
        set({ pumpOn, irrigationOn: pumpOn, pumpTicks: pumpOn ? state.pumpTicks + 1 : state.pumpTicks,
          pumpCycles: pumpOn ? state.pumpCycles + 1 : state.pumpCycles, ledger, ledgerEvents: ledger,
          lastBlock: event.blockNumber, notifications, notifs: notifications });
        void persistLedgerEvent(event); if (pumpOn) void persistNotification(pumpNotification);
      },
      tick: () => {
        const state = get(); const drift = () => (Math.random() - 0.5) * 0.8;
        const moisture = Math.min(72, Math.max(34, Math.round((state.moisture + drift() + (state.pumpOn ? 1.4 : -0.1)) * 10) / 10));
        const soilEC = Math.min(1.8, Math.max(0.7, Math.round((state.soilEC + drift() * 0.02) * 100) / 100));
        const temp = Math.round((state.temp + drift() * 0.6) * 10) / 10;
        const humidity = Math.min(90, Math.max(45, Math.round(state.humidity + drift() * 2)));
        const history = state.history.map((point, index) => index === state.history.length - 1 ? { ...point, moisture } : point);
        set({ moisture, soilEC, temp, humidity, history });
      },
      readiness: () => getCertificateReadiness(get()),
      listBatch: () => set({ batchStatus: get().batchStatus === "draft" ? "listed" : get().batchStatus }),
      sellBatch: () => {
        if (get().batchStatus === "sold") return;
        const state = get(); const blockNumber = state.lastBlock + 1;
        const event: LedgerEvent = { id: "evt-sale", type: "sale", blockNumber, timestamp: "18:24",
          title: { vi: "Bán lô hàng chứng nhận +22%", en: "Certified batch sold at +22%" },
          detail: { vi: `${exporterBatches[0].weight} thanh long đã bán trực tiếp cho nhà nhập khẩu EU.`, en: `${exporterBatches[0].weight} of dragon fruit sold directly to an EU importer.` },
          hash: "sale22e4af3a9c7b12f65d8ea21b789c44f3308b1d57eecc123f890a0bb" };
        const ledger = sortEvents([event, ...state.ledger]); const notifications = [soldNotification, ...state.notifications];
        set({ batchStatus: "sold", marketSold: true, ledger, ledgerEvents: ledger, lastBlock: blockNumber, notifications, notifs: notifications });
        void persistLedgerEvent(event); void persistNotification(soldNotification);
      },
      completePurchase: () => get().sellBatch(),
      markNotifsRead: () => {
        const notifications = get().notifications.map((notification) => ({ ...notification, read: true }));
        set({ notifications, notifs: notifications });
      },
      pushNotif: (notification) => {
        const notifications = [notification, ...get().notifications];
        set({ notifications, notifs: notifications }); void persistNotification(notification);
      },
      resetDemo: () => set(initialState()),
    }),
    {
      name: "agritrust-demo-v2",
      partialize: (state) => ({
        language: state.language, lang: state.lang, langChosen: state.langChosen, role: state.role,
        selectedPlotId: state.selectedPlotId, selectedZoneId: state.selectedZoneId, selectedScanId: state.selectedScanId, moisture: state.moisture,
        soilEC: state.soilEC, temp: state.temp, humidity: state.humidity, rainMm24h: state.rainMm24h,
        history: state.history, pumpOn: state.pumpOn, irrigationOn: state.irrigationOn, pumpTicks: state.pumpTicks,
        pumpCycles: state.pumpCycles, batchStatus: state.batchStatus, marketSold: state.marketSold,
        loggedScanIds: state.loggedScanIds, ledger: state.ledger, ledgerEvents: state.ledgerEvents,
        lastBlock: state.lastBlock, notifs: state.notifs, notifications: state.notifications,
      }),
    },
  ),
);

export { farmerProfile, plots, scanScenarios };
