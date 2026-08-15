import type { LedgerEvent, NotificationItem } from "../data/mockData";
import type { Language } from "./i18n";
import { hasSupabaseConfig, supabase } from "./supabase";

interface DemoStatePayload {
  language: Language | null;
  role: string;
  selectedPlotId: string;
  selectedScanId: string;
  irrigationOn: boolean;
  pumpCycles: number;
  marketSold: boolean;
  loggedScanIds: string[];
}

const DEMO_ID = "agritrust-demo";

const logError = (scope: string, error: unknown) => {
  console.error(`[supabase:${scope}]`, error);
};

export const persistLedgerEvent = async (event: LedgerEvent) => {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("ledger_events").upsert(
    {
      id: event.id,
      event_type: event.type,
      title_vi: event.title.vi,
      title_en: event.title.en,
      detail_vi: event.detail.vi,
      detail_en: event.detail.en,
      timestamp_label: event.timestamp,
      hash: event.hash,
      block_number: event.blockNumber,
    },
    { onConflict: "id" },
  );

  if (error) {
    logError("ledger_events", error);
  }
};

export const persistNotification = async (notification: NotificationItem) => {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("notifications").upsert(
    {
      id: notification.id,
      title_vi: notification.title.vi,
      title_en: notification.title.en,
      body_vi: notification.body.vi,
      body_en: notification.body.en,
      tone: notification.tone,
      timestamp_label: notification.timestamp,
    },
    { onConflict: "id" },
  );

  if (error) {
    logError("notifications", error);
  }
};

export const persistDemoState = async (payload: DemoStatePayload) => {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("demo_state").upsert(
    {
      id: DEMO_ID,
      language: payload.language,
      role: payload.role,
      selected_plot_id: payload.selectedPlotId,
      selected_scan_id: payload.selectedScanId,
      irrigation_on: payload.irrigationOn,
      pump_cycles: payload.pumpCycles,
      market_sold: payload.marketSold,
      logged_scan_ids: payload.loggedScanIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    logError("demo_state", error);
  }
};

export const trackDeploymentHealth = async () => {
  if (!supabase) {
    return { enabled: false };
  }

  const { error } = await supabase.from("deployment_heartbeats").insert({
    source: "web",
    created_at: new Date().toISOString(),
  });

  if (error) {
    logError("deployment_heartbeats", error);
    return { enabled: true, healthy: false };
  }

  return { enabled: true, healthy: true };
};

export { hasSupabaseConfig };
