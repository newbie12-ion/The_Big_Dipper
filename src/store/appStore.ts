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
  type LedgerEvent,
  type NotificationItem,
  type PlotId,
} from "../data/mockData";
import {
  persistDemoState,
  persistLedgerEvent,
  persistNotification,
} from "../lib/backend";
import type { Language } from "../lib/i18n";

export type Role = "farmer" | "exporter";

interface AppState {
  language: Language | null;
  role: Role;
  selectedPlotId: PlotId;
  selectedScanId: string;
  irrigationOn: boolean;
  pumpCycles: number;
  marketSold: boolean;
  loggedScanIds: string[];
  notifications: NotificationItem[];
  ledgerEvents: LedgerEvent[];
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  setRole: (role: Role) => void;
  setSelectedPlotId: (plotId: PlotId) => void;
  setSelectedScanId: (scanId: string) => void;
  logSelectedScan: () => void;
  togglePump: () => void;
  completePurchase: () => void;
  resetDemo: () => void;
}

const sortEvents = (events: LedgerEvent[]) =>
  [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).reverse();

const getInitialState = () => ({
  language: null as Language | null,
  role: "farmer" as Role,
  selectedPlotId: "plot-dragon" as PlotId,
  selectedScanId: scanScenarios[0].id,
  irrigationOn: false,
  pumpCycles: 0,
  marketSold: false,
  loggedScanIds: [] as string[],
  notifications: baseNotifications,
  ledgerEvents: sortEvents(seededLedgerEvents),
});

const syncDemoState = (state: Pick<
  AppState,
  | "language"
  | "role"
  | "selectedPlotId"
  | "selectedScanId"
  | "irrigationOn"
  | "pumpCycles"
  | "marketSold"
  | "loggedScanIds"
>) => {
  void persistDemoState({
    language: state.language,
    role: state.role,
    selectedPlotId: state.selectedPlotId,
    selectedScanId: state.selectedScanId,
    irrigationOn: state.irrigationOn,
    pumpCycles: state.pumpCycles,
    marketSold: state.marketSold,
    loggedScanIds: state.loggedScanIds,
  });
};

export const getCertificateReadiness = (state: Pick<
  AppState,
  "loggedScanIds" | "pumpCycles" | "marketSold"
>) => {
  const readiness = 78 + state.loggedScanIds.length * 4 + state.pumpCycles * 4;
  return Math.min(state.marketSold ? 100 : readiness, 100);
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      setLanguage: (language) =>
        set((state) => {
          const nextState = { ...state, language };
          syncDemoState(nextState);
          return { language };
        }),
      toggleLanguage: () =>
        set((state) => {
          const language: Language = state.language === "vi" ? "en" : "vi";
          const nextState = { ...state, language };
          syncDemoState(nextState);
          return { language };
        }),
      setRole: (role) =>
        set((state) => {
          const nextState = { ...state, role };
          syncDemoState(nextState);
          return { role };
        }),
      setSelectedPlotId: (selectedPlotId) =>
        set((state) => {
          const nextState = { ...state, selectedPlotId };
          syncDemoState(nextState);
          return { selectedPlotId };
        }),
      setSelectedScanId: (selectedScanId) => {
        const scenario = scanScenarios.find((item) => item.id === selectedScanId);
        set((state) => {
          const nextState = {
            ...state,
            selectedScanId,
            selectedPlotId: scenario?.affectsPlotId ?? get().selectedPlotId,
          };
          syncDemoState(nextState);
          return {
            selectedScanId,
            selectedPlotId: scenario?.affectsPlotId ?? get().selectedPlotId,
          };
        });
      },
      logSelectedScan: () => {
        const state = get();
        if (state.loggedScanIds.includes(state.selectedScanId)) {
          return;
        }

        const scenario = scanScenarios.find((item) => item.id === state.selectedScanId);
        if (!scenario) {
          return;
        }

        const event = buildScanEvent(scenario);
        const notification = scanLoggedNotification;

        set((currentState) => {
          const nextState = {
            ...currentState,
            ledgerEvents: sortEvents([...currentState.ledgerEvents, event]),
            loggedScanIds: [...currentState.loggedScanIds, scenario.id],
            notifications: [notification, ...currentState.notifications],
          };
          syncDemoState(nextState);
          return {
            ledgerEvents: nextState.ledgerEvents,
            loggedScanIds: nextState.loggedScanIds,
            notifications: nextState.notifications,
          };
        });

        void persistLedgerEvent(event);
        void persistNotification(notification);
      },
      togglePump: () => {
        const state = get();
        const nextOn = !state.irrigationOn;
        const nextNotifications = nextOn
          ? [pumpNotification, ...state.notifications]
          : state.notifications;
        const event = buildPumpEvent(nextOn);

        set((currentState) => {
          const nextState = {
            ...currentState,
            irrigationOn: nextOn,
            pumpCycles: nextOn ? currentState.pumpCycles + 1 : currentState.pumpCycles,
            ledgerEvents: sortEvents([...currentState.ledgerEvents, event]),
            notifications: nextNotifications,
          };
          syncDemoState(nextState);
          return {
            irrigationOn: nextState.irrigationOn,
            pumpCycles: nextState.pumpCycles,
            ledgerEvents: nextState.ledgerEvents,
            notifications: nextState.notifications,
          };
        });

        void persistLedgerEvent(event);
        if (nextOn) {
          void persistNotification(pumpNotification);
        }
      },
      completePurchase: () => {
        const state = get();
        if (state.marketSold) {
          return;
        }

        const event: LedgerEvent = {
          id: "evt-sale",
          type: "sale",
          title: {
            vi: "Bán lô hàng chứng nhận +22%",
            en: "Certified batch sold at +22%",
          },
          detail: {
            vi: `${exporterBatches[0].weight} ${plots[0].crop.vi} đã bán trực tiếp cho nhà nhập khẩu EU.`,
            en: `${exporterBatches[0].weight} of ${plots[0].crop.en} sold directly to an EU importer.`,
          },
          timestamp: "18:24",
          hash: "sale22e4af3a9c7b12f65d8ea21b789c44f3308b1d57eecc123f890a0bb",
          blockNumber: 48317,
        };

        set((currentState) => {
          const nextState = {
            ...currentState,
            role: "farmer" as Role,
            marketSold: true,
            notifications: [soldNotification, ...currentState.notifications],
            ledgerEvents: sortEvents([...currentState.ledgerEvents, event]),
          };
          syncDemoState(nextState);
          return {
            role: "farmer",
            marketSold: true,
            notifications: nextState.notifications,
            ledgerEvents: nextState.ledgerEvents,
          };
        });

        void persistLedgerEvent(event);
        void persistNotification(soldNotification);
      },
      resetDemo: () =>
        set(() => {
          const initialState = getInitialState();
          syncDemoState(initialState);
          return initialState;
        }),
    }),
    {
      name: "agritrust-demo-store",
      partialize: (state) => ({
        language: state.language,
        role: state.role,
        selectedPlotId: state.selectedPlotId,
        selectedScanId: state.selectedScanId,
        irrigationOn: state.irrigationOn,
        pumpCycles: state.pumpCycles,
        marketSold: state.marketSold,
        loggedScanIds: state.loggedScanIds,
        notifications: state.notifications,
        ledgerEvents: state.ledgerEvents,
      }),
    },
  ),
);

export { farmerProfile, plots, scanScenarios };
