import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CameraOff,
  ChevronRight,
  CloudRain,
  Droplets,
  FlaskConical,
  ImagePlus,
  Languages,
  Leaf,
  MapPinned,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  SwitchCamera,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  certificateRows,
  coopRain,
  device,
  farmZones,
  nearbyAlert,
  satelliteInsights,
  sensorHistory,
  weatherCard,
} from "../data/mockData";
import { farmAreaSqm, formatDms, getZoneGeometry } from "../data/farmGeo";
import { formatHectares, formatSqm } from "../lib/geo";
import {
  VisionError,
  analyseCropPhoto,
  captureFrameFromVideo,
  fileToDataUrl,
  visionConfigured,
  type AiScanResult,
  type VisionErrorKind,
} from "../lib/vision";
import { tText, type LocalizedText } from "../lib/i18n";
import {
  farmerProfile,
  getCertificateReadiness,
  plots,
  useAppStore,
} from "../store/appStore";
import {
  AppCard,
  Badge,
  NotificationBell,
  PrimaryButton,
  ProgressRing,
  SecondaryButton,
  SectionHeading,
  StatCard,
  cx,
} from "../components/ui";
import { FarmMap, LayerToggle, MoistureLegend, type MapLayer } from "../components/FarmMap";

const eventTone: Record<string, "good" | "warn" | "alert" | "neutral"> = {
  scan: "good",
  irrigation: "good",
  fertilizer: "warn",
  spray: "warn",
  sensor: "neutral",
  certificate: "good",
  lab: "neutral",
  sale: "good",
};

const filterLabels = {
  all: { vi: "Tất cả", en: "All" },
  scan: { vi: "Quét", en: "Scans" },
  irrigation: { vi: "Tưới", en: "Irrigation" },
  sensor: { vi: "Cảm biến", en: "Sensors" },
  fertilizer: { vi: "Phân bón", en: "Fertilizer" },
  spray: { vi: "Phun", en: "Spray" },
  lab: { vi: "Mẫu đất", en: "Lab panel" },
  certificate: { vi: "Chứng nhận", en: "Certificate" },
  sale: { vi: "Bán hàng", en: "Sale" },
};

export const WelcomeScreen = () => {
  const navigate = useNavigate();
  const setLanguage = useAppStore((state) => state.setLanguage);

  const pickLanguage = (language: "vi" | "en") => {
    setLanguage(language);
    navigate("/home");
  };

  return (
    <div className="flex min-h-[780px] flex-col justify-between">
      <div className="space-y-6">
        <div className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-brand-green">
          AgriTrust
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-green">
            Build Beyond Limits
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-brand-dark">
            The paperwork that farms itself.
          </h1>
          <p className="mt-4 text-base leading-7 text-brand-muted">
            AI agronomist + digital passport for Vietnamese smallholder farms.
          </p>
        </div>

        <AppCard className="bg-field">
          <p className="text-sm font-semibold text-brand-dark">Chọn ngôn ngữ / Choose language</p>
          <p className="mt-2 text-sm text-brand-muted">
            Pick the language once. You can switch later in Profile.
          </p>
        </AppCard>
      </div>

      <div className="space-y-3">
        <PrimaryButton onClick={() => pickLanguage("vi")}>🇻🇳 Tiếng Việt</PrimaryButton>
        <SecondaryButton className="h-14 w-full rounded-2xl" onClick={() => pickLanguage("en")}>
          🇬🇧 English
        </SecondaryButton>
      </div>
    </div>
  );
};

export const HomeDashboardScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const notifications = useAppStore((state) => state.notifications);
  const readiness = useAppStore(getCertificateReadiness);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-brand-muted">
            {language === "vi" ? "Xin chào, chị Hoa" : "Hello, Chị Hoa"}
          </p>
          <h1 className="text-3xl font-bold text-brand-dark">
            {language === "vi" ? "Vườn hôm nay thế nào?" : "How is the farm today?"}
          </h1>
        </div>
        <button onClick={() => navigate("/notifications")} aria-label={language === "vi" ? "Thông báo" : "Notifications"}>
          <NotificationBell badge={Math.min(notifications.filter((item) => !item.read).length, 9)} />
        </button>
      </div>

      <AppCard className="bg-brand-dark text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-emerald-100">{weatherCard.temperature}</p>
            <h2 className="mt-1 text-xl font-semibold">{weatherCard.summary[language]}</h2>
          </div>
          <CloudRain className="h-10 w-10 text-emerald-200" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-2xl bg-white/10 px-2 py-3">
            <p className="text-xs text-emerald-100">
              {language === "vi" ? "Độ ẩm" : "Humidity"}
            </p>
            <p className="mt-1 text-base font-semibold">{weatherCard.humidity}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-2 py-3">
            <p className="text-xs text-emerald-100">{language === "vi" ? "Mưa" : "Rain"}</p>
            <p className="mt-1 text-base font-semibold">{weatherCard.rainfall}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-2 py-3">
            <p className="text-xs text-emerald-100">{language === "vi" ? "Vùng" : "Zone"}</p>
            <p className="mt-1 text-base font-semibold">Mekong</p>
          </div>
        </div>
      </AppCard>

      {/* Advisory only. Scanning lives in the bottom nav — one entry point, not three. */}
      <AppCard className="border-amber-200 bg-amber-50">
        <p className="text-sm font-semibold text-amber-800">⚠ {nearbyAlert[language]}</p>
      </AppCard>

      <AppCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-brand-muted">
              {language === "vi" ? "Mức sẵn sàng chứng nhận" : "Certificate readiness"}
            </p>
            <p className="mt-1 text-xl font-semibold text-brand-dark">
              {language === "vi"
                ? "Hồ sơ xuất khẩu đang tự hoàn thiện"
                : "Your export paperwork is building itself"}
            </p>
          </div>
          <ProgressRing
            value={readiness}
            label={language === "vi" ? "Sẵn sàng" : "Ready"}
          />
        </div>
      </AppCard>

      <div className="grid gap-3">
        {plots.map((plot) => (
          <button
            key={plot.id}
            onClick={() => navigate(`/plot/${plot.id}`)}
            className="rounded-[28px] text-left transition hover:-translate-y-0.5"
          >
            <AppCard className="bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                    {plot.icon}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-brand-dark">
                      {tText(plot.crop, language)}
                    </p>
                    <p className="text-sm text-brand-muted">
                      {plot.area} · {plot.soilMoisture}%{" "}
                      {language === "vi" ? "độ ẩm đất" : "soil moisture"}
                    </p>
                  </div>
                </div>
                <Badge tone={plot.badgeTone}>{tText(plot.healthStatus, language)}</Badge>
              </div>
            </AppCard>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Live camera capture. No demo images — the shutter grabs a real frame and the
 * upload button takes a real file, and either one goes straight to the vision model.
 */
export const ScanCaptureScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const beginScan = useAppStore((state) => state.beginScan);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const [busy, setBusy] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      setStarting(true);
      setCameraError(null);
      stopStream();

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          language === "vi"
            ? "Trình duyệt này không mở được máy ảnh. Hãy dùng nút tải ảnh lên."
            : "This browser cannot open a camera. Use the upload button instead.",
        );
        setStarting(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch (error) {
        if (cancelled) return;
        const name = (error as DOMException)?.name;
        // getUserMedia is gated on a secure context: https:// or localhost.
        const insecure = typeof window !== "undefined" && !window.isSecureContext;
        setCameraError(
          insecure
            ? language === "vi"
              ? "Máy ảnh chỉ chạy trên HTTPS hoặc localhost. Hãy tải ảnh lên."
              : "The camera needs HTTPS or localhost. Please upload a photo instead."
            : name === "NotAllowedError"
              ? language === "vi"
                ? "Bạn chưa cho phép dùng máy ảnh. Cho phép trong trình duyệt rồi thử lại."
                : "Camera permission was denied. Allow it in your browser and retry."
              : language === "vi"
                ? "Không tìm thấy máy ảnh trên thiết bị này."
                : "No camera was found on this device.",
        );
      } finally {
        if (!cancelled) setStarting(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [facingMode, language, stopStream]);

  const handoff = (dataUrl: string) => {
    stopStream();
    beginScan(dataUrl);
    navigate("/scan/analyzing");
  };

  const shoot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    setBusy(true);
    try {
      handoff(captureFrameFromVideo(video));
    } finally {
      setBusy(false);
    }
  };

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      handoff(await fileToDataUrl(file));
    } catch (error) {
      setCameraError((error as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Quét cây" : "Crop scanner"}
        subtitle={
          language === "vi"
            ? "Đưa máy ảnh sát vào lá hoặc thân bị bệnh, giữ ổn định rồi chụp."
            : "Hold the camera close to the affected leaf or stem, keep it steady, then shoot."
        }
      />

      {!visionConfigured ? (
        <AppCard className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">
            ⚠ {language === "vi"
              ? "Chưa cấu hình VITE_OPENROUTER_API_KEY — chẩn đoán AI sẽ không chạy."
              : "VITE_OPENROUTER_API_KEY is not set — AI diagnosis will not run."}
          </p>
        </AppCard>
      ) : null}

      <AppCard className="overflow-hidden p-0">
        <div className="relative aspect-[4/5] overflow-hidden bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={cx(
              "h-full w-full object-cover",
              cameraError ? "opacity-0" : "opacity-100",
              facingMode === "user" && "scale-x-[-1]",
            )}
          />

          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <CameraOff className="h-10 w-10 text-white/70" />
              <p className="text-sm font-medium text-white/90">{cameraError}</p>
            </div>
          ) : starting ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-medium text-white/80">
                {language === "vi" ? "Đang mở máy ảnh…" : "Opening camera…"}
              </p>
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-6 rounded-[28px] border-2 border-white/80" />
              <div className="pointer-events-none absolute inset-10 rounded-[24px] border border-dashed border-white/60" />
              <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs font-semibold text-white/85">
                {language === "vi" ? "Lấy nét vào vết bệnh" : "Frame the lesion"}
              </p>
            </>
          )}

          {!cameraError && !starting ? (
            <button
              onClick={() => setFacingMode((mode) => (mode === "environment" ? "user" : "environment"))}
              aria-label={language === "vi" ? "Đổi máy ảnh" : "Switch camera"}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </AppCard>

      <div className="flex items-center gap-3">
        <SecondaryButton
          className="h-14 flex-1"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <ImagePlus className="mr-2 h-5 w-5" />
          {language === "vi" ? "Tải ảnh lên" : "Upload photo"}
        </SecondaryButton>

        <button
          onClick={shoot}
          disabled={busy || Boolean(cameraError) || starting}
          aria-label={language === "vi" ? "Chụp ảnh" : "Take photo"}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-emerald-200 bg-brand-green text-white transition disabled:opacity-40"
        >
          <Camera className="h-7 w-7" />
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void pickFile(event.target.files?.[0])}
      />

      <p className="text-center text-[11px] leading-relaxed text-brand-muted">
        {language === "vi"
          ? "Ảnh chỉ được gửi tới mô hình AI để chẩn đoán, không lưu trên máy chủ."
          : "The photo is sent to the AI model for diagnosis only — nothing is stored on a server."}
      </p>
    </div>
  );
};

/** Stage labels shown while the real request is in flight. */
const analysisStages: LocalizedText[] = [
  { vi: "Đang gửi ảnh tới mô hình AI…", en: "Sending the photo to the AI model…" },
  { vi: "Đang nhận diện cây trồng…", en: "Identifying the crop…" },
  { vi: "Đang đối chiếu triệu chứng…", en: "Matching the visible symptoms…" },
  { vi: "Đang soạn khuyến nghị…", en: "Writing the recommendation…" },
];

export const ScanAnalyzingScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const capturedImage = useAppStore((state) => state.capturedImage);
  const completeScan = useAppStore((state) => state.completeScan);
  const failScan = useAppStore((state) => state.failScan);
  const moisture = useAppStore((state) => state.moisture);
  const humidity = useAppStore((state) => state.humidity);
  const temp = useAppStore((state) => state.temp);
  const selectedPlotId = useAppStore((state) => state.selectedPlotId);
  const [stageIndex, setStageIndex] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!capturedImage) {
      navigate("/scan", { replace: true });
      return;
    }

    const controller = new AbortController();
    // The stage ticker is cosmetic and stops one short of the end, so it can
    // never claim the request finished before it actually has.
    const ticker = window.setInterval(
      () => setStageIndex((value) => Math.min(value + 1, analysisStages.length - 1)),
      900,
    );

    void analyseCropPhoto(
      capturedImage,
      {
        province: farmerProfile.location,
        soilMoisturePct: Math.round(moisture),
        airHumidityPct: Math.round(humidity),
        temperatureC: Math.round(temp),
        weather: weatherCard.summary.en,
        date: new Date().toISOString().slice(0, 10),
      },
      controller.signal,
      () => {
        if (!controller.signal.aborted) setSlow(true);
      },
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        completeScan(result);
        navigate("/scan/result", { replace: true });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error as Error)?.name === "AbortError") return;
        // Only the category crosses into state — provider text and model names
        // stay in the console.
        if (!(error instanceof VisionError)) console.error("[scan]", error);
        failScan(error instanceof VisionError ? error.kind : "network");
        navigate("/scan/result", { replace: true });
      });

    return () => {
      controller.abort();
      window.clearInterval(ticker);
    };
    // Field context is read once, at request time — re-running on every sensor
    // tick would fire a new vision call every 1.5 s.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]);

  return (
    <div className="space-y-5">
      <SectionHeading
        title={language === "vi" ? "Đang phân tích" : "Analyzing"}
        subtitle={
          slow
            ? language === "vi"
              ? "Đang mất nhiều thời gian hơn bình thường, vui lòng chờ…"
              : "This is taking longer than usual — hang on…"
            : analysisStages[stageIndex][language]
        }
      />

      <AppCard className="overflow-hidden p-0">
        <div className="relative aspect-[4/5] overflow-hidden bg-black">
          {capturedImage ? (
            <img src={capturedImage} alt="" className="h-full w-full object-cover" />
          ) : null}
          <motion.div
            initial={{ y: -40, opacity: 0.3 }}
            animate={{ y: 400, opacity: 1 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-20 bg-gradient-to-b from-emerald-400/5 via-emerald-300/60 to-transparent"
          />
        </div>
      </AppCard>

      {slow ? (
        <AppCard className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">
            ⏳ {language === "vi"
              ? "Máy chủ đang bận. Hệ thống vẫn đang xử lý ảnh của bạn, đừng tắt màn hình."
              : "The server is busy. Your photo is still being processed — keep this screen open."}
          </p>
        </AppCard>
      ) : null}

      <div className="space-y-3">
        {analysisStages.map((stage, index) => (
          <div
            key={stage.en}
            className={cx(
              "rounded-2xl border px-4 py-3 text-sm",
              stageIndex >= index
                ? "border-emerald-200 bg-emerald-50 text-brand-dark"
                : "border-brand-line bg-white text-brand-muted",
            )}
          >
            {stage[language]}
          </div>
        ))}
      </div>
    </div>
  );
};

const severityTone: Record<string, "good" | "warn" | "alert"> = {
  none: "good",
  low: "good",
  moderate: "warn",
  high: "alert",
};

const severityLabel: Record<string, LocalizedText> = {
  none: { vi: "Không có triệu chứng", en: "No symptoms" },
  low: { vi: "Mức độ nhẹ", en: "Low severity" },
  moderate: { vi: "Mức độ trung bình", en: "Moderate severity" },
  high: { vi: "Mức độ nặng", en: "High severity" },
};

const urgencyLabel: Record<string, LocalizedText> = {
  monitor: { vi: "Theo dõi thêm", en: "Keep monitoring" },
  this_week: { vi: "Xử lý trong tuần", en: "Act this week" },
  today: { vi: "Xử lý ngay hôm nay", en: "Act today" },
};

/**
 * Failure copy written for a farmer, keyed off the error category.
 *
 * Raw provider text ("google/... returned 429") never reaches this screen —
 * it names infrastructure the user cannot act on, and reads as a broken app.
 */
const scanErrorMessage = (kind: VisionErrorKind | null, language: "vi" | "en") => {
  const copy: Record<VisionErrorKind | "unknown", LocalizedText> = {
    quota: {
      vi: "Hiện có quá nhiều người cùng quét nên hệ thống chưa xử lý kịp. Vui lòng thử lại sau khoảng một phút — ảnh của bạn không bị mất.",
      en: "Too many scans are running right now, so the service could not keep up. Try again in about a minute — your photo is not lost.",
    },
    network: {
      vi: "Không kết nối được máy chủ. Kiểm tra lại mạng rồi thử lại.",
      en: "Could not reach the server. Check your connection and try again.",
    },
    provider: {
      vi: "Máy chủ chẩn đoán đang gặp sự cố. Vui lòng thử lại sau ít phút.",
      en: "The diagnosis service hit a problem. Please try again in a few minutes.",
    },
    malformed: {
      vi: "Kết quả trả về không đọc được. Vui lòng chụp lại và thử lần nữa.",
      en: "The response could not be read. Please retake the photo and try again.",
    },
    blocked: {
      vi: "Ảnh này không được phép phân tích. Vui lòng chụp ảnh cây trồng khác.",
      en: "This photo could not be analysed. Please take a photo of a plant instead.",
    },
    "no-key": {
      vi: "Ứng dụng chưa được cấu hình khoá API. Liên hệ người quản trị.",
      en: "The app is missing its API key. Contact the administrator.",
    },
    unknown: {
      vi: "Có lỗi không xác định. Vui lòng thử lại.",
      en: "Something went wrong. Please try again.",
    },
  };

  return copy[kind ?? "unknown"][language];
};

export const ScanResultScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const scanPhase = useAppStore((state) => state.scanPhase);
  const result = useAppStore((state) => state.aiResult);
  const aiError = useAppStore((state) => state.aiError);
  const aiScanId = useAppStore((state) => state.aiScanId);
  const capturedImage = useAppStore((state) => state.capturedImage);
  const loggedScanIds = useAppStore((state) => state.loggedScanIds);
  const logAiScan = useAppStore((state) => state.logAiScan);
  const selectedPlotId = useAppStore((state) => state.selectedPlotId);
  const [tab, setTab] = useState<"treatment" | "care" | "prevention">("treatment");
  const [loggedHash, setLoggedHash] = useState<string | null>(null);

  useEffect(() => {
    if (scanPhase === "idle") navigate("/scan", { replace: true });
  }, [scanPhase, navigate]);

  // ── request failed ──
  if (scanPhase === "error" || (!result && aiError)) {
    return (
      <ScanFailure
        language={language}
        title={
          aiError === "quota"
            ? language === "vi"
              ? "Hệ thống đang bận"
              : "The service is busy"
            : language === "vi"
              ? "Chưa chẩn đoán được"
              : "Diagnosis failed"
        }
        message={scanErrorMessage(aiError, language)}
        onRetry={() => navigate("/scan")}
      />
    );
  }

  if (!result) return null;

  // ── the model refused the photo ──
  if (!result.isPlant) {
    return (
      <ScanFailure
        language={language}
        icon="reject"
        title={language === "vi" ? "Ảnh chưa dùng được" : "Photo not usable"}
        message={
          result.rejection?.[language] ??
          (language === "vi"
            ? "Ảnh này không phải cây trồng hoặc quá mờ để chẩn đoán."
            : "This photo is not a plant, or is too unclear to diagnose.")
        }
        image={capturedImage}
        onRetry={() => navigate("/scan")}
      />
    );
  }

  const healthy = result.status === "healthy";
  const alreadyLogged = Boolean(aiScanId && loggedScanIds.includes(aiScanId));

  // The plot's registered crop is never sent to the model — it would anchor the
  // identification. Comparing here instead keeps the note and leaves the
  // diagnosis uncontaminated.
  const registeredPlot = plots.find((item) => item.id === selectedPlotId);
  const detectedName = `${result.plantName?.vi ?? ""} ${result.plantName?.en ?? ""}`.toLowerCase();
  const cropMismatch = Boolean(
    registeredPlot &&
      detectedName.trim() &&
      !detectedName.includes(registeredPlot.crop.vi.toLowerCase()) &&
      !detectedName.includes(registeredPlot.crop.en.toLowerCase()),
  );
  const lists = {
    treatment: result.treatment ?? [],
    care: result.care ?? [],
    prevention: result.prevention ?? [],
  };

  const handleLog = () => {
    const event = logAiScan();
    setLoggedHash(event ? `0x${event.hash.slice(0, 10)}` : "0x…");
    window.setTimeout(() => navigate(`/plot/${selectedPlotId}/timeline`), 900);
  };

  return (
    <div className="space-y-4">
      {loggedHash ? (
        <div className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-semibold text-white">
          {loggedHash}… ✓ {language === "vi" ? "Đã xác nhận trên chuỗi" : "Confirmed on-chain"}
        </div>
      ) : null}

      <AppCard className="overflow-hidden p-0">
        {result.imageDataUrl ?? capturedImage ? (
          <img
            src={result.imageDataUrl ?? capturedImage ?? ""}
            alt={result.plantName?.[language] ?? ""}
            className="h-44 w-full object-cover"
          />
        ) : null}

        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-brand-muted">{result.plantName?.[language]}</p>
              <h1 className="text-2xl font-bold text-brand-dark">
                {result.diagnosis?.[language] ??
                  (language === "vi" ? "Không phát hiện bệnh" : "No disease detected")}
              </h1>
              {result.scientificName ? (
                <p className="mt-1 text-xs font-medium italic text-brand-muted">
                  {result.pathogenName || result.scientificName}
                </p>
              ) : null}
            </div>
            <Badge tone={severityTone[result.severity ?? "none"] ?? "neutral"}>
              {severityLabel[result.severity ?? "none"][language]}
            </Badge>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-brand-muted">
              <span>{language === "vi" ? "Độ tin cậy" : "Confidence"}</span>
              <span>{result.confidence}%</span>
            </div>
            <div className="h-3 rounded-full bg-emerald-100">
              <div
                className={cx(
                  "h-3 rounded-full transition-all",
                  result.confidence >= 70 ? "bg-brand-green" : "bg-amber-500",
                )}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.urgency ? (
              <Badge tone={result.urgency === "today" ? "alert" : result.urgency === "this_week" ? "warn" : "neutral"}>
                {urgencyLabel[result.urgency][language]}
              </Badge>
            ) : null}
            {result.preHarvestIntervalDays ? (
              <Badge tone="warn">
                {language === "vi"
                  ? `Cách ly ${result.preHarvestIntervalDays} ngày`
                  : `${result.preHarvestIntervalDays}-day pre-harvest interval`}
              </Badge>
            ) : result.chemicalWithoutInterval ? (
              <Badge tone="alert">
                {language === "vi" ? "Xem nhãn: thời gian cách ly" : "Check label: harvest interval"}
              </Badge>
            ) : null}
            {healthy ? <Badge tone="good">{language === "vi" ? "Cây khỏe" : "Healthy"}</Badge> : null}
          </div>
        </div>
      </AppCard>

      {result.chemicalWithoutInterval ? (
        <AppCard className="border-rose-200 bg-rose-50">
          <p className="text-sm font-semibold text-rose-900">
            ⚠ {language === "vi"
              ? "Khuyến nghị có phun thuốc nhưng chưa rõ thời gian cách ly. Đọc kỹ nhãn thuốc và KHÔNG thu hoạch trước thời gian ghi trên nhãn."
              : "A spray is recommended but the harvest interval is unknown. Read the product label and do NOT harvest before the interval it states."}
          </p>
        </AppCard>
      ) : null}

      {result.needsBetterPhoto ? (
        <AppCard className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">
            ⚠ {language === "vi"
              ? "Độ tin cậy thấp — hãy chụp lại gần hơn, đủ sáng, rõ vết bệnh."
              : "Low confidence — retake the photo closer, in better light, with the lesion in focus."}
          </p>
        </AppCard>
      ) : null}

      {result.observedSymptoms?.length ? (
        <AppCard>
          <SectionHeading
            title={language === "vi" ? "AI nhìn thấy gì" : "What the AI saw"}
            subtitle={
              language === "vi"
                ? "Mọi kết luận bên dưới dựa trên các dấu hiệu này."
                : "Everything below is derived from these visible signs."
            }
          />
          <ul className="space-y-2">
            {result.observedSymptoms.map((item) => (
              <li key={item.en} className="rounded-2xl bg-brand-cream px-4 py-3 text-sm text-brand-dark">
                {item[language]}
              </li>
            ))}
          </ul>
        </AppCard>
      ) : null}

      {result.differentials?.length ? (
        <AppCard className="border-sky-100 bg-sky-50">
          <p className="text-sm font-semibold text-brand-ink">
            {language === "vi" ? "Nguyên nhân khác cũng có thể" : "Other causes that would also fit"}
          </p>
          <ul className="mt-2 space-y-1.5">
            {result.differentials.map((item) => (
              <li key={item.en} className="text-sm text-brand-muted">
                · {item[language]}
              </li>
            ))}
          </ul>
        </AppCard>
      ) : null}

      {cropMismatch && registeredPlot ? (
        <AppCard className="border-sky-200 bg-sky-50">
          <p className="text-sm text-sky-900">
            📋 {language === "vi"
              ? `Lô này đang đăng ký là ${tText(registeredPlot.crop, "vi")}, nhưng ảnh cho thấy ${result.plantName?.vi}. Bản ghi sẽ lưu theo cây trong ảnh.`
              : `This plot is registered as ${tText(registeredPlot.crop, "en")}, but the photo shows ${result.plantName?.en}. The record follows the photo.`}
          </p>
        </AppCard>
      ) : null}

      {result.fieldNote ? (
        <AppCard className="border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">📋 {result.fieldNote[language]}</p>
        </AppCard>
      ) : null}

      <AppCard>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["treatment", language === "vi" ? "Điều trị" : "Treatment"],
              ["care", language === "vi" ? "Chăm sóc" : "How to grow"],
              ["prevention", language === "vi" ? "Phòng ngừa" : "Prevention"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cx(
                "rounded-2xl px-3 py-3 text-sm font-semibold",
                tab === key ? "bg-brand-green text-white" : "bg-brand-cream text-brand-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {lists[tab].length ? (
            lists[tab].map((item, index) => (
              <div key={item.en} className="flex gap-3 rounded-2xl bg-brand-cream px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-green">
                  {index + 1}
                </span>
                <span className="text-sm text-brand-dark">{item[language]}</span>
              </div>
            ))
          ) : (
            <p className="rounded-2xl bg-brand-cream px-4 py-3 text-sm text-brand-muted">
              {language === "vi" ? "Không có khuyến nghị cho mục này." : "No guidance for this tab."}
            </p>
          )}
        </div>
      </AppCard>

      <PrimaryButton onClick={handleLog} disabled={alreadyLogged}>
        {alreadyLogged
          ? language === "vi"
            ? "Đã ghi vào sổ"
            : "Already logged"
          : language === "vi"
            ? "Ghi vào sổ"
            : "Log to ledger"}
      </PrimaryButton>

      <SecondaryButton className="h-12 w-full" onClick={() => navigate("/scan")}>
        <RotateCcw className="mr-2 h-4 w-4" />
        {language === "vi" ? "Quét lại" : "Scan again"}
      </SecondaryButton>

      <p className="text-center text-[11px] leading-relaxed text-brand-muted">
        {language === "vi"
          ? "Gợi ý của AI không thay thế cán bộ khuyến nông. Luôn đọc nhãn thuốc trước khi phun."
          : "AI guidance does not replace an extension officer. Always read the product label before spraying."}
      </p>
    </div>
  );
};

const ScanFailure = ({
  language,
  title,
  message,
  onRetry,
  image,
  icon = "error",
}: {
  language: "vi" | "en";
  title: string;
  message: string;
  onRetry: () => void;
  image?: string | null;
  icon?: "error" | "reject";
}) => (
  <div className="space-y-4">
    <SectionHeading title={title} />

    {image ? (
      <AppCard className="overflow-hidden p-0">
        <img src={image} alt="" className="h-40 w-full object-cover" />
      </AppCard>
    ) : null}

    <AppCard className={icon === "reject" ? "border-amber-200 bg-amber-50" : "border-rose-200 bg-rose-50"}>
      <div className="flex gap-3">
        <AlertTriangle
          className={cx("h-6 w-6 shrink-0", icon === "reject" ? "text-amber-600" : "text-rose-600")}
        />
        <p className={cx("text-sm", icon === "reject" ? "text-amber-900" : "text-rose-900")}>{message}</p>
      </div>
    </AppCard>

    <AppCard>
      <p className="text-sm font-semibold text-brand-ink">
        {language === "vi" ? "Chụp lại thế nào cho tốt" : "How to take a better photo"}
      </p>
      <ul className="mt-2 space-y-1.5 text-sm text-brand-muted">
        {(language === "vi"
          ? [
              "Đưa máy cách lá 20–30 cm, lấy nét vào vết bệnh.",
              "Chụp ngoài trời hoặc nơi đủ sáng, tránh bóng đổ.",
              "Chỉ để một lá hoặc một cành trong khung hình.",
            ]
          : [
              "Hold the phone 20–30 cm away and focus on the lesion.",
              "Shoot in daylight or good light, avoid hard shadows.",
              "Keep a single leaf or stem in the frame.",
            ]
        ).map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
    </AppCard>

    <PrimaryButton onClick={onRetry}>
      <RotateCcw className="mr-2 h-5 w-5" />
      {language === "vi" ? "Chụp lại" : "Try again"}
    </PrimaryButton>
  </div>
);
export const FarmScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const selectedZoneId = useAppStore((state) => state.selectedZoneId);
  const setSelectedZoneId = useAppStore((state) => state.setSelectedZoneId);
  const [layer, setLayer] = useState<MapLayer>("satellite");

  const zone = farmZones.find((item) => item.id === selectedZoneId) ?? farmZones[0];
  const geometry = getZoneGeometry(zone.id);

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Bản đồ nông trại" : "Farm map"}
        subtitle={
          language === "vi"
            ? `${formatHectares(farmAreaSqm, "vi")} ha · ${farmZones.length} khu canh tác · Chợ Gạo, Tiền Giang`
            : `${formatHectares(farmAreaSqm, "en")} ha · ${farmZones.length} zones · Cho Gao, Tien Giang`
        }
        trailing={<Badge tone="good">{formatHectares(farmAreaSqm, language)} ha</Badge>}
      />

      <AppCard className="p-3">
        <FarmMap
          selectedZoneId={zone.id}
          onSelectZone={setSelectedZoneId}
          layer={layer}
          language={language}
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <LayerToggle layer={layer} onChange={setLayer} language={language} />
          {layer === "moisture" ? <MoistureLegend language={language} /> : (
            <p className="text-[11px] font-medium text-brand-muted">
              {language === "vi"
                ? "Chạm vào một khu trên bản đồ"
                : "Tap a zone on the map"}
            </p>
          )}
        </div>
      </AppCard>

      {/* selected-zone sheet */}
      <AppCard className="bg-field">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-muted">{tText(zone.crop, language)}</p>
            <h2 className="mt-0.5 text-2xl font-bold text-brand-dark">{tText(zone.name, language)}</h2>
            <p className="mt-1 text-xs font-medium text-brand-muted">
              {formatSqm(geometry.areaSqm, language)} m² · {formatHectares(geometry.areaSqm, language)} ha
            </p>
          </div>
          <Badge tone={zone.tone}>{tText(zone.status, language)}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: language === "vi" ? "Độ ẩm đất" : "Soil moisture", value: `${zone.moisture}%` },
            { label: language === "vi" ? "pH đất" : "Soil pH", value: zone.ph.toFixed(1) },
            { label: language === "vi" ? "Ẩm không khí" : "Air humidity", value: `${zone.humidity}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/80 px-2 py-3">
              <p className="text-base font-semibold text-brand-ink">{item.value}</p>
              <p className="mt-1 text-[11px] font-medium text-brand-muted">{item.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[11px] font-medium text-brand-muted">
          📍 {formatDms(geometry.centre)} · {zone.sensorStation}
        </p>

        <PrimaryButton className="mt-3" onClick={() => navigate(`/farm/zone/${zone.id}`)}>
          {language === "vi" ? "Xem chỉ số cảm biến" : "View sensor readings"}
          <ChevronRight className="ml-1 h-5 w-5" />
        </PrimaryButton>
      </AppCard>

      {/* zone list — a second, scannable way into the same eight zones */}
      <div className="grid grid-cols-4 gap-2">
        {farmZones.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setSelectedZoneId(item.id)}
            aria-pressed={item.id === zone.id}
            className={cx(
              "rounded-2xl border px-1 py-2 text-center transition",
              item.id === zone.id
                ? "border-brand-green bg-emerald-50 text-brand-green"
                : "border-brand-line bg-white text-brand-muted",
            )}
          >
            <span className="block text-sm font-bold">{index + 1}</span>
            <span className="block text-[10px] font-semibold">{item.moisture}%</span>
          </button>
        ))}
      </div>

      <p className="text-center text-[11px] text-brand-muted">
        {language === "vi"
          ? "Diện tích được tính trực tiếp từ ranh giới GPS trên bản đồ."
          : "Areas are computed directly from the GPS boundary drawn on the map."}
      </p>
    </div>
  );
};

export const ZoneDashboardScreen = () => {
  const navigate = useNavigate();
  const { zoneId } = useParams();
  const language = useAppStore((state) => state.language ?? "vi");
  const selectedZoneId = useAppStore((state) => state.selectedZoneId);
  const zone = farmZones.find((item) => item.id === zoneId || item.id === selectedZoneId) ?? farmZones[0];
  const geometry = getZoneGeometry(zone.id);
  const moistureIsLow = zone.moisture < 50;

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/farm")}
        className="inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-semibold text-brand-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === "vi" ? "Tất cả khu" : "All zones"}
      </button>

      <AppCard className="bg-field">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-muted">
              {tText(zone.crop, language)} · {formatHectares(geometry.areaSqm, language)} ha
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-dark">{tText(zone.name, language)}</h1>
            <p className="mt-2 text-sm text-brand-ink">{zone.sensorStation} · LoRaWAN · {language === "vi" ? "pin 87%" : "battery 87%"}</p>
            <p className="mt-1 text-xs font-medium text-brand-muted">📍 {formatDms(geometry.centre)}</p>
          </div>
          <Badge tone={zone.tone}>{tText(zone.status, language)}</Badge>
        </div>
      </AppCard>

      {moistureIsLow ? (
        <AppCard className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">
            ⚠ {language === "vi" ? "Độ ẩm đất thấp — nên tưới trong hôm nay." : "Soil moisture is low — irrigate today."}
          </p>
        </AppCard>
      ) : null}

      <SectionHeading
        title={language === "vi" ? "Chỉ số cảm biến" : "Sensor readings"}
        subtitle={language === "vi" ? "Dữ liệu mới nhất của khu này." : "Latest readings for this zone."}
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={language === "vi" ? "pH đất" : "Soil pH"}
          value={zone.ph.toFixed(1)}
          icon="🧪"
          tone={zone.ph >= 5.5 && zone.ph <= 6.8 ? "good" : "warn"}
        />
        <StatCard
          label={language === "vi" ? "Độ ẩm đất" : "Soil moisture"}
          value={`${zone.moisture}%`}
          icon="💧"
          tone={zone.moisture >= 50 ? "good" : "warn"}
        />
        <AppCard className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-2xl">🌿</span>
            <Badge tone="good">NPK</Badge>
          </div>
          <p className="text-base font-bold text-brand-ink">
            N {zone.npk.nitrogen} · P {zone.npk.phosphorus} · K {zone.npk.potassium}
          </p>
          <p className="mt-1 text-xs font-medium text-brand-muted">mg/kg</p>
        </AppCard>
        <StatCard
          label={language === "vi" ? "Độ ẩm không khí" : "Air humidity"}
          value={`${zone.humidity}%`}
          icon="☁️"
          tone="neutral"
        />
      </div>

      <AppCard>
        <SectionHeading
          title={language === "vi" ? "Độ ẩm đất · 24 giờ" : "Soil moisture · 24 hours"}
          subtitle={language === "vi" ? "Phần trăm (%)" : "Percent (%)"}
          trailing={<Badge tone={zone.moisture >= 50 ? "good" : "warn"}>{zone.moisture}%</Badge>}
        />
        <div className="h-52" role="img" aria-label={language === "vi" ? "Biểu đồ độ ẩm đất 24 giờ" : "24-hour soil moisture chart"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={zone.moistureHistory}>
              <defs>
                <linearGradient id="zoneMoistureFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#dce6de" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#3f5148", fontSize: 11 }} />
              <YAxis width={28} tick={{ fill: "#3f5148", fontSize: 11 }} domain={[30, 80]} />
              <Tooltip />
              <Area type="monotone" dataKey="moisture" name={language === "vi" ? "Độ ẩm đất" : "Soil moisture"} unit="%" stroke="#16a34a" fill="url(#zoneMoistureFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </AppCard>

      <AppCard className="border-sky-100 bg-sky-50">
        <p className="text-sm font-semibold text-brand-ink">🌧 {language === "vi" ? "Vũ kế HTX Chợ Gạo · 1,2 km · 0 mm/24h" : "Cho Gao co-op rain gauge · 1.2 km · 0 mm/24h"}</p>
        <p className="mt-1 text-sm text-brand-muted">{language === "vi" ? "Mưa được đọc từ vũ kế của hợp tác xã." : "Rain comes from the cooperative gauge."}</p>
      </AppCard>
    </div>
  );
};

export const PlotDetailScreen = () => {
  const language = useAppStore((state) => state.language ?? "vi");
  const selectedPlotId = useAppStore((state) => state.selectedPlotId);
  const setSelectedPlotId = useAppStore((state) => state.setSelectedPlotId);
  const plot = plots.find((item) => item.id === selectedPlotId) ?? plots[0];

  useEffect(() => {
    setSelectedPlotId(plot.id);
  }, [plot.id, setSelectedPlotId]);

  const tiles = [
    {
      icon: Droplets,
      label: language === "vi" ? "Cảm biến" : "Sensors",
      to: `/plot/${plot.id}/sensors`,
      tone: "bg-emerald-50",
    },
    {
      icon: Leaf,
      label: language === "vi" ? "Dòng thời gian" : "Timeline",
      to: `/plot/${plot.id}/timeline`,
      tone: "bg-amber-50",
    },
    {
      icon: MapPinned,
      label: language === "vi" ? "Vệ tinh" : "Satellite",
      to: `/plot/${plot.id}/satellite`,
      tone: "bg-sky-50",
    },
    {
      icon: ShieldCheck,
      label: language === "vi" ? "Chứng nhận" : "Certificate",
      to: `/plot/${plot.id}/certificate`,
      tone: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-4">
      <SectionHeading
        title={tText(plot.crop, language)}
        subtitle={
          language === "vi"
            ? `${plot.area} · Gieo trồng ${plot.plantingDate}`
            : `${plot.area} · Planted ${plot.plantingDate}`
        }
      />

      <AppCard className="bg-field">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-brand-muted">{language === "vi" ? "Tình trạng" : "Status"}</p>
            <h2 className="mt-1 text-2xl font-bold text-brand-dark">
              {tText(plot.healthStatus, language)}
            </h2>
          </div>
          <Badge tone={plot.badgeTone}>{plot.soilMoisture}%</Badge>
        </div>
      </AppCard>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to}>
            <AppCard className={cx("h-full p-4", tile.tone)}>
              <tile.icon className="h-7 w-7 text-brand-green" />
              <p className="mt-6 text-lg font-semibold text-brand-dark">{tile.label}</p>
            </AppCard>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const SensorsScreen = () => {
  const language = useAppStore((state) => state.language ?? "vi");
  const irrigationOn = useAppStore((state) => state.irrigationOn);
  const togglePump = useAppStore((state) => state.togglePump);
  const moisture = useAppStore((state) => state.moisture);
  const soilEC = useAppStore((state) => state.soilEC);
  const temp = useAppStore((state) => state.temp);
  const humidity = useAppStore((state) => state.humidity);
  const history = useAppStore((state) => state.history);
  const tick = useAppStore((state) => state.tick);
  const [pumpToast, setPumpToast] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(tick, 1500);
    return () => window.clearInterval(interval);
  }, [tick]);

  const chartData = history.length ? history : sensorHistory;

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Cảm biến & bộ kit" : "Sensors + device kit"}
        subtitle={language === "vi" ? "Bộ kit #A-102 · LoRaWAN · Pin 87%" : "Kit #A-102 · LoRaWAN · Battery 87%"}
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={language === "vi" ? "Độ ẩm đất" : "Soil moisture"}
          value={`${moisture}%`}
          icon="💧"
          tone={moisture >= 50 ? "good" : "warn"}
        />
        <StatCard
          label={language === "vi" ? "Độ mặn đất" : "Soil salinity"}
          value={soilEC.toFixed(2)}
          unit="dS/m"
          icon="🧪"
          tone={soilEC < 1.4 ? "good" : "warn"}
        />
        <StatCard
          label={language === "vi" ? "Nhiệt độ" : "Temperature"}
          value={`${temp.toFixed(1)}°C`}
          icon="🌡️"
          tone="warn"
        />
        <StatCard
          label={language === "vi" ? "Độ ẩm không khí" : "Humidity"}
          value={`${humidity}%`}
          icon="☁️"
          tone="neutral"
        />
      </div>

      <AppCard className="border-sky-100 bg-sky-50">
        <p className="text-sm font-semibold text-brand-dark">🌧 {tText(coopRain.name, language)} · {coopRain.distanceKm.toFixed(1)} km · {coopRain.mm24h} mm/24h</p>
        <p className="mt-1 text-xs text-brand-muted">{language === "vi" ? "Mưa đọc từ vũ kế hợp tác xã, không phải cảm biến trên bộ kit." : "Rain comes from the co-op gauge, not the kit."}</p>
      </AppCard>

      <AppCard>
        <SectionHeading
          title={language === "vi" ? "Độ ẩm 24 giờ" : "24h moisture"}
          trailing={<Badge tone={irrigationOn ? "good" : "neutral"}>{irrigationOn ? "Pump ON" : "Pump OFF"}</Badge>}
        />
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="moistureFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5ece5" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#6a7d72", fontSize: 12 }} />
              <YAxis hide domain={[30, 80]} />
              <Tooltip />
              <Area
                type="monotone"
              dataKey="moisture"
                stroke="#16a34a"
                fill="url(#moistureFill)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </AppCard>

      <AppCard>
        <p className="text-sm font-semibold text-brand-dark">{device.name} · {device.network} · 🔋 {device.battery}%</p>
        <p className="mt-1 text-sm text-brand-muted">{tText(device.zone, language)}</p>
      </AppCard>

      <AppCard className="bg-brand-dark text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-emerald-100">
              {language === "vi" ? "Điều khiển thiết bị" : "Device control"}
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              {language === "vi" ? "Bơm tưới" : "Irrigation pump"}
            </h2>
          </div>
          <button
            onClick={() => {
              togglePump();
              setPumpToast(true);
              window.setTimeout(() => setPumpToast(false), 2200);
            }}
            aria-label={language === "vi" ? "Bật hoặc tắt bơm tưới" : "Toggle irrigation pump"}
            className={cx(
              "relative h-12 w-24 rounded-full transition",
              irrigationOn ? "bg-emerald-400" : "bg-white/20",
            )}
          >
            <span
              className={cx(
                "absolute top-1 h-10 w-10 rounded-full bg-white transition",
                irrigationOn ? "left-12" : "left-1",
              )}
            />
          </button>
        </div>
        <p className="mt-3 text-sm text-emerald-100">
          {language === "vi"
            ? "Bật ON để thấy đường độ ẩm tăng và sự kiện tự ghi vào sổ."
            : "Flip ON to see moisture rise and the ledger update automatically."}
        </p>
      </AppCard>
      {pumpToast ? <div className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-semibold text-white">✓ {language === "vi" ? "Đã ghi vào sổ" : "Logged to ledger"}</div> : null}
    </div>
  );
};

export const TimelineScreen = () => {
  const language = useAppStore((state) => state.language ?? "vi");
  const ledgerEvents = useAppStore((state) => state.ledgerEvents);
  const readiness = useAppStore(getCertificateReadiness);
  const [filter, setFilter] = useState<keyof typeof filterLabels>("all");

  const filteredEvents = useMemo(
    () =>
      filter === "all"
        ? ledgerEvents
        : ledgerEvents.filter((item) => item.type === filter),
    [filter, ledgerEvents],
  );

  return (
    <div className="space-y-4">
      <AppCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-brand-muted">
              {language === "vi" ? "Sổ truy xuất" : "Traceability ledger"}
            </p>
            <h1 className="mt-1 text-xl font-semibold text-brand-dark">
              {language === "vi"
                ? "Mỗi hành động đều có dấu thời gian"
                : "Every farm action gets a trusted timestamp"}
            </h1>
          </div>
          <ProgressRing value={readiness} label={language === "vi" ? "Sẵn sàng" : "Ready"} />
        </div>
      </AppCard>

      <div className="flex flex-wrap gap-2">
        {Object.entries(filterLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as keyof typeof filterLabels)}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold",
              filter === key
                ? "bg-brand-green text-white"
                : "bg-white text-brand-muted ring-1 ring-brand-line",
            )}
          >
            {label[language]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredEvents.map((event) => (
          <motion.div key={event.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <AppCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {event.type === "lab" ? <FlaskConical className="h-4 w-4 text-brand-green" /> : null}
                  <Badge tone={eventTone[event.type] ?? "neutral"}>
                    {filterLabels[event.type as keyof typeof filterLabels]?.[language] ??
                      event.type}
                  </Badge>
                  <p className="text-xs text-brand-muted">
                    {language === "vi" ? "Khối" : "Block"} #{event.blockNumber}
                  </p>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-brand-dark">
                  {event.title[language]}
                </h3>
                <p className="mt-1 text-sm text-brand-muted">{event.detail[language]}</p>
              </div>
              <p className="text-sm font-semibold text-brand-muted">{event.timestamp}</p>
            </div>
            <div className="mt-4 rounded-2xl bg-brand-cream px-4 py-3 text-xs font-medium text-brand-dark">
              0x{event.hash.slice(0, 14)}... ✓ {language === "vi" ? "Confirmed" : "Confirmed"} ·{" "}
              {language === "vi" ? "Block" : "Block"} #{event.blockNumber}
            </div>
          </AppCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const SatelliteScreen = () => {
  const language = useAppStore((state) => state.language ?? "vi");
  const [showNdvi, setShowNdvi] = useState(true);

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Phân tích vệ tinh" : "Satellite analysis"}
        subtitle={satelliteInsights.climate[language]}
      />

      <AppCard className="overflow-hidden p-0">
        <div className="relative h-72 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.65),_transparent_35%),linear-gradient(135deg,_#406949,_#243b2b)]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 480 380" aria-label="Farm plot boundary">
            <polygon points={satelliteInsights.boundary} fill="rgba(255,255,255,.08)" stroke="white" strokeWidth="4" strokeDasharray="10 8" />
          </svg>
          <div className="absolute left-6 top-8 h-12 w-20 rounded-2xl bg-emerald-400/80 blur-sm" />
          <div className="absolute bottom-12 right-10 h-16 w-24 rounded-3xl bg-amber-300/60 blur-sm" />
          {showNdvi ? (
            <>
              <div className="absolute inset-6 rounded-[28px] bg-[linear-gradient(135deg,rgba(34,197,94,0.3),rgba(234,179,8,0.2),rgba(239,68,68,0.28))]" />
              {satelliteInsights.ndviZones.map((zone) => <span key={zone.cx} className="absolute h-20 w-20 rounded-full blur-xl" style={{ left: `calc(${zone.cx} - 2.5rem)`, top: `calc(${zone.cy} - 2.5rem)`, background: zone.color, opacity: zone.opacity }} />)}
            </>
          ) : null}
          <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-brand-dark">
            GPS: 10.3642, 106.3625
          </div>
        </div>
      </AppCard>

      <SecondaryButton className="w-full" onClick={() => setShowNdvi((value) => !value)}>
        {showNdvi
          ? language === "vi"
            ? "Tắt lớp NDVI"
            : "Hide NDVI overlay"
          : language === "vi"
            ? "Bật lớp NDVI"
            : "Show NDVI overlay"}
      </SecondaryButton>

      <AppCard>
        <p className="text-sm font-semibold text-brand-dark">
          {language === "vi" ? "Khuyến nghị khí hậu" : "Climate advisory"}
        </p>
        <p className="mt-2 text-sm leading-6 text-brand-muted">
          {satelliteInsights.advisory[language]}
        </p>
      </AppCard>

      <div className="grid grid-cols-7 gap-2">
        {satelliteInsights.forecast.map((day) => (
          <AppCard key={day.day} className="p-3 text-center">
            <p className="text-xs font-semibold text-brand-muted">{day.day}</p>
            <p className="mt-2 text-base font-bold text-brand-dark">{day.temp}</p>
            <p className="mt-1 text-xs text-sky-700">{day.rain}</p>
          </AppCard>
        ))}
      </div>
    </div>
  );
};

export const CertificateScreen = () => {
  const language = useAppStore((state) => state.language ?? "vi");
  const ledgerEvents = useAppStore((state) => state.ledgerEvents);
  const readiness = useAppStore(getCertificateReadiness);
  const qrValue =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#/certificate`
      : "https://agritrust.demo/#/certificate";

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Chứng nhận nháp" : "Draft certificate"}
        subtitle={language === "vi" ? "QR thật để mở hộ chiếu số của nông trại." : "Live QR opens the farm's digital passport."}
      />

      <AppCard className="border-emerald-200 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green">
              AgriTrust Passport
            </p>
            <h1 className="mt-2 text-2xl font-bold text-brand-dark">
              {language === "vi" ? "Chứng nhận truy xuất" : "Traceability certificate"}
            </h1>
          </div>
          <Badge tone="good">{readiness}%</Badge>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_108px] gap-4">
          <div className="space-y-2 text-sm text-brand-dark">
            <p>
              <span className="font-semibold">{language === "vi" ? "Nông dân:" : "Farmer:"}</span>{" "}
              Chị Hoa
            </p>
            <p>
              <span className="font-semibold">{language === "vi" ? "Lô đất:" : "Plot:"}</span>{" "}
              Dragon fruit · 0.4 ha
            </p>
            <p>
              <span className="font-semibold">GPS:</span> 10.3642, 106.3625
            </p>
            <p>
              <span className="font-semibold">{language === "vi" ? "Mùa vụ:" : "Season:"}</span>{" "}
              2026 Export Batch
            </p>
            <p>
              <span className="font-semibold">{language === "vi" ? "Bản ghi:" : "Records:"}</span>{" "}
              {ledgerEvents.length} {language === "vi" ? "mục đã xác minh" : "verified records"}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-2 ring-1 ring-brand-line">
            <QRCodeSVG value={qrValue} size={92} />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {certificateRows.map((row) => (
            <div
              key={row.label.en}
              className="flex items-center justify-between rounded-2xl bg-brand-cream px-4 py-3 text-sm"
            >
              <span className="font-medium text-brand-dark">{row.label[language]}</span>
              <Badge tone={row.status === "ready" ? "good" : "warn"}>
                {row.status === "ready"
                  ? language === "vi"
                    ? "Đạt"
                    : "Ready"
                  : language === "vi"
                    ? "Chờ"
                    : "Pending"}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-6 rotate-[-4deg] rounded-2xl border-2 border-dashed border-rose-200 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-rose-500">
          Draft - pending certifier review
        </div>
      </AppCard>
    </div>
  );
};

export const NotificationsScreen = () => {
  const language = useAppStore((state) => state.language ?? "vi");
  const notifications = useAppStore((state) => state.notifications);
  const markNotifsRead = useAppStore((state) => state.markNotifsRead);

  useEffect(() => { markNotifsRead(); }, [markNotifsRead]);

  const dotTone = { green: "bg-emerald-500", amber: "bg-amber-400", blue: "bg-sky-500" };
  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Thông báo" : "Notifications"}
        subtitle={language === "vi" ? "Tin mới từ vườn của bạn." : "Updates from your farm."}
      />
      {notifications.map((notification) => (
        <AppCard key={notification.id} className={notification.read ? "" : "border-emerald-200"}>
          <div className="flex items-start gap-3">
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotTone[notification.tone]}`} />
            <div>
              <p className="font-semibold text-brand-dark">{notification.title[language]}</p>
              <p className="mt-1 text-sm leading-6 text-brand-muted">{notification.body[language]}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-brand-muted">{notification.timestamp}</p>
            </div>
          </div>
        </AppCard>
      ))}
    </div>
  );
};

export const ProfileScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const toggleLanguage = useAppStore((state) => state.toggleLanguage);
  const resetDemo = useAppStore((state) => state.resetDemo);
  const holdTimer = useRef<number | undefined>(undefined);

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Hồ sơ & cài đặt" : "Profile & settings"}
        subtitle={language === "vi" ? "Quản lý ngôn ngữ cho ứng dụng nông trại." : "Manage the language for your farm app."}
      />

      <AppCard>
        <div className="flex items-center gap-4">
          <img
            src={farmerProfile.avatarUrl}
            alt="Chi Hoa"
            className="h-16 w-16 rounded-3xl object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold text-brand-dark">Chị Hoa</h2>
            <p className="text-sm text-brand-muted">Mekong Fresh Cooperative</p>
          </div>
        </div>
      </AppCard>

      <AppCard>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Languages className="h-5 w-5 text-brand-green" />
            <div>
              <p className="font-semibold text-brand-dark">
                {language === "vi" ? "Ngôn ngữ" : "Language"}
              </p>
              <p className="text-sm text-brand-muted">{language === "vi" ? "Tiếng Việt" : "English"}</p>
            </div>
          </div>
          <SecondaryButton onClick={toggleLanguage}>
            {language === "vi" ? "Đổi sang EN" : "Switch to VI"}
          </SecondaryButton>
        </div>
      </AppCard>

      <button
        onPointerDown={() => { holdTimer.current = window.setTimeout(() => { resetDemo(); navigate("/"); }, 800); }}
        onPointerUp={() => { if (holdTimer.current) window.clearTimeout(holdTimer.current); }}
        onPointerLeave={() => { if (holdTimer.current) window.clearTimeout(holdTimer.current); }}
        className="mx-auto block text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted opacity-60"
      >
        AgriTrust demo · v1.0
      </button>
    </div>
  );
};
