import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  CloudRain,
  Droplets,
  Languages,
  Leaf,
  MapPinned,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  analysisStages,
  certificateRows,
  exporterBatches,
  nearbyAlert,
  satelliteInsights,
  scanScenarios,
  sensorHistory,
  weatherCard,
} from "../data/mockData";
import { formatMoney, tText } from "../lib/i18n";
import {
  farmerProfile,
  getCertificateReadiness,
  plots,
  useAppStore,
  type Role,
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

const eventTone: Record<string, "good" | "warn" | "alert" | "neutral"> = {
  scan: "good",
  irrigation: "good",
  fertilizer: "warn",
  spray: "warn",
  sensor: "neutral",
  certificate: "good",
  sale: "good",
};

const filterLabels = {
  all: { vi: "Tất cả", en: "All" },
  scan: { vi: "Quét", en: "Scans" },
  irrigation: { vi: "Tưới", en: "Irrigation" },
  sensor: { vi: "Cảm biến", en: "Sensors" },
  certificate: { vi: "Chứng nhận", en: "Certificate" },
};

const roleLabels: Record<Role, { vi: string; en: string }> = {
  farmer: { vi: "Nông dân", en: "Farmer" },
  exporter: { vi: "Nhà nhập khẩu", en: "Exporter" },
};

export const WelcomeScreen = () => {
  const navigate = useNavigate();
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setRole = useAppStore((state) => state.setRole);

  const pickLanguage = (language: "vi" | "en") => {
    setLanguage(language);
    setRole("farmer");
    navigate("/farmer/home");
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
          <p className="text-sm font-semibold text-brand-dark">Choose language</p>
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
        <NotificationBell badge={Math.min(notifications.length, 9)} />
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
            onClick={() => navigate(`/farmer/farm/plot/${plot.id}`)}
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

      <PrimaryButton onClick={() => navigate("/farmer/scan")}>
        <ScanSearch className="mr-2 h-5 w-5" />
        {language === "vi" ? "Quét cây" : "Scan crop"}
      </PrimaryButton>
    </div>
  );
};

export const ScanCaptureScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const selectedScanId = useAppStore((state) => state.selectedScanId);
  const setSelectedScanId = useAppStore((state) => state.setSelectedScanId);
  const scenario = scanScenarios.find((item) => item.id === selectedScanId) ?? scanScenarios[0];

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Quét cây" : "Crop scanner"}
        subtitle={
          language === "vi"
            ? "Chọn ảnh demo để mô phỏng máy ảnh."
            : "Choose a demo image to simulate the camera."
        }
      />

      <AppCard className="overflow-hidden p-0">
        <div className="relative aspect-[4/5] overflow-hidden bg-black">
          <img
            src={scenario.imageUrl}
            alt={tText(scenario.shortLabel, language)}
            className="h-full w-full object-cover opacity-95"
          />
          <div className="pointer-events-none absolute inset-6 rounded-[28px] border-2 border-white/80" />
          <div className="pointer-events-none absolute inset-10 rounded-[24px] border border-dashed border-white/60" />
        </div>
      </AppCard>

      <div className="grid grid-cols-2 gap-3">
        {scanScenarios.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedScanId(item.id)}
            className={cx(
              "overflow-hidden rounded-[24px] border text-left transition",
              selectedScanId === item.id
                ? "border-brand-green ring-2 ring-emerald-200"
                : "border-brand-line",
            )}
          >
            <img
              src={item.imageUrl}
              alt={tText(item.shortLabel, language)}
              className="h-24 w-full object-cover"
            />
            <div className="bg-white p-3">
              <p className="text-xs font-semibold text-brand-dark">
                {tText(item.shortLabel, language)}
              </p>
            </div>
          </button>
        ))}
      </div>

      <PrimaryButton onClick={() => navigate("/farmer/scan/analyzing")}>
        {language === "vi" ? "Phân tích ảnh này" : "Analyze this image"}
      </PrimaryButton>
    </div>
  );
};

export const ScanAnalyzingScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const selectedScanId = useAppStore((state) => state.selectedScanId);
  const scenario = scanScenarios.find((item) => item.id === selectedScanId) ?? scanScenarios[0];
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStageIndex((value) => Math.min(value + 1, analysisStages.length - 1));
    }, 800);
    const timeout = window.setTimeout(() => navigate("/farmer/scan/result"), 2600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="space-y-5">
      <SectionHeading
        title={language === "vi" ? "Đang phân tích" : "Analyzing"}
        subtitle={analysisStages[stageIndex][language]}
      />

      <AppCard className="overflow-hidden p-0">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={scenario.imageUrl}
            alt={tText(scenario.shortLabel, language)}
            className="h-full w-full object-cover"
          />
          <motion.div
            initial={{ y: -40, opacity: 0.3 }}
            animate={{ y: 400, opacity: 1 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-20 bg-gradient-to-b from-emerald-400/5 via-emerald-300/60 to-transparent"
          />
        </div>
      </AppCard>

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

export const ScanResultScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const selectedScanId = useAppStore((state) => state.selectedScanId);
  const logSelectedScan = useAppStore((state) => state.logSelectedScan);
  const loggedScanIds = useAppStore((state) => state.loggedScanIds);
  const scenario = scanScenarios.find((item) => item.id === selectedScanId) ?? scanScenarios[0];
  const [tab, setTab] = useState<"treatment" | "care" | "prevention">("treatment");
  const [showToast, setShowToast] = useState(false);
  const alreadyLogged = loggedScanIds.includes(selectedScanId);
  const plotId = scenario.affectsPlotId;

  const currentList = {
    treatment: scenario.treatment,
    care: scenario.care,
    prevention: scenario.prevention,
  }[tab];

  const handleLog = () => {
    if (!alreadyLogged) {
      logSelectedScan();
    }
    setShowToast(true);
    window.setTimeout(() => navigate(`/farmer/farm/plot/${plotId}/timeline`), 900);
  };

  return (
    <div className="space-y-4">
      {showToast ? (
        <div className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-semibold text-white">
          0x3f9a... ✓ {language === "vi" ? "Đã xác nhận trên chuỗi" : "Confirmed on-chain"}
        </div>
      ) : null}

      <AppCard className="overflow-hidden p-0">
        <img
          src={scenario.imageUrl}
          alt={tText(scenario.shortLabel, language)}
          className="h-44 w-full object-cover"
        />
        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-brand-muted">{tText(scenario.plantName, language)}</p>
              <h1 className="text-2xl font-bold text-brand-dark">
                {tText(scenario.diagnosis, language)}
              </h1>
            </div>
            <Badge tone={scenario.confidence >= 90 ? "good" : "warn"}>
              {tText(scenario.severity, language)}
            </Badge>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-brand-muted">
              <span>{language === "vi" ? "Độ tin cậy" : "Confidence"}</span>
              <span>{scenario.confidence}%</span>
            </div>
            <div className="h-3 rounded-full bg-emerald-100">
              <div
                className="h-3 rounded-full bg-brand-green transition-all"
                style={{ width: `${scenario.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </AppCard>

      <AppCard>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["treatment", language === "vi" ? "Điều trị" : "Treatment"],
            ["care", language === "vi" ? "Chăm sóc" : "How to grow"],
            ["prevention", language === "vi" ? "Phòng ngừa" : "Prevention"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={cx(
                "rounded-2xl px-3 py-3 text-sm font-semibold",
                tab === key
                  ? "bg-brand-green text-white"
                  : "bg-brand-cream text-brand-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {currentList.map((item) => (
            <div key={item.en} className="rounded-2xl bg-brand-cream px-4 py-3 text-sm text-brand-dark">
              {item[language]}
            </div>
          ))}
        </div>
      </AppCard>

      <PrimaryButton onClick={handleLog}>
        {alreadyLogged
          ? language === "vi"
            ? "Đã ghi vào sổ"
            : "Already logged"
          : language === "vi"
            ? "Ghi vào sổ"
            : "Log to ledger"}
      </PrimaryButton>
    </div>
  );
};

export const FarmScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Hồ sơ nông dân" : "Farmer profile"}
        subtitle={
          language === "vi"
            ? "Cơ sở dữ liệu số cho toàn bộ vườn."
            : "Digital record for the entire farm."
        }
      />

      <AppCard>
        <div className="flex items-start gap-4">
          <img
            src={farmerProfile.avatarUrl}
            alt={farmerProfile.name}
            className="h-20 w-20 rounded-3xl object-cover"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-brand-dark">{farmerProfile.name}</h1>
            <p className="text-sm text-brand-muted">{farmerProfile.location}</p>
            <p className="text-sm text-brand-muted">{farmerProfile.cooperative}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Badge tone="good">{farmerProfile.areaHectares} ha</Badge>
              <Badge tone="neutral">
                {language === "vi" ? `Từ ${farmerProfile.memberSince}` : `Since ${farmerProfile.memberSince}`}
              </Badge>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="space-y-3">
        {plots.map((plot) => (
          <button
            key={plot.id}
            onClick={() => navigate(`/farmer/farm/plot/${plot.id}`)}
            className="w-full text-left"
          >
            <AppCard>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                    {plot.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-dark">{tText(plot.crop, language)}</p>
                    <p className="text-sm text-brand-muted">
                      {plot.area} · {plot.plantingDate}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-brand-muted" />
              </div>
            </AppCard>
          </button>
        ))}
      </div>
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
      to: `/farmer/farm/plot/${plot.id}/sensors`,
      tone: "bg-emerald-50",
    },
    {
      icon: Leaf,
      label: language === "vi" ? "Dòng thời gian" : "Timeline",
      to: `/farmer/farm/plot/${plot.id}/timeline`,
      tone: "bg-amber-50",
    },
    {
      icon: MapPinned,
      label: language === "vi" ? "Vệ tinh" : "Satellite",
      to: `/farmer/farm/plot/${plot.id}/satellite`,
      tone: "bg-sky-50",
    },
    {
      icon: ShieldCheck,
      label: language === "vi" ? "Chứng nhận" : "Certificate",
      to: `/farmer/farm/plot/${plot.id}/certificate`,
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
  const pumpCycles = useAppStore((state) => state.pumpCycles);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!irrigationOn) {
      return;
    }

    const interval = window.setInterval(() => {
      setPulse((value) => Math.min(value + 1, 6));
    }, 900);

    return () => window.clearInterval(interval);
  }, [irrigationOn]);

  const moistureNow = Math.min(41 + pumpCycles * 6 + pulse * 2, 68);
  const chartData = sensorHistory.map((point, index) => ({
    ...point,
    moisture:
      point.hour === "Now"
        ? moistureNow
        : index > sensorHistory.length - 3 && irrigationOn
          ? point.moisture + Math.min(pulse * 2, 12)
          : point.moisture,
  }));

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Cảm biến & bộ kit" : "Sensors + device kit"}
        subtitle={language === "vi" ? "Bộ kit #A-102 · LoRaWAN · Pin 87%" : "Kit #A-102 · LoRaWAN · Battery 87%"}
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={language === "vi" ? "Độ ẩm đất" : "Soil moisture"}
          value={`${moistureNow}%`}
          icon="💧"
          tone={moistureNow >= 50 ? "good" : "warn"}
        />
        <StatCard
          label="NPK"
          value="74"
          icon="🧪"
          tone="good"
        />
        <StatCard
          label={language === "vi" ? "Nhiệt độ" : "Temperature"}
          value="31°C"
          icon="🌡️"
          tone="warn"
        />
        <StatCard
          label={language === "vi" ? "Độ ẩm không khí" : "Humidity"}
          value="72%"
          icon="☁️"
          tone="neutral"
        />
      </div>

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
            onClick={togglePump}
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
          <AppCard key={event.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
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
          <div className="absolute inset-5 rounded-[30px] border-2 border-dashed border-white/70" />
          <div className="absolute left-6 top-8 h-12 w-20 rounded-2xl bg-emerald-400/80 blur-sm" />
          <div className="absolute bottom-12 right-10 h-16 w-24 rounded-3xl bg-amber-300/60 blur-sm" />
          {showNdvi ? (
            <div className="absolute inset-6 rounded-[28px] bg-[linear-gradient(135deg,rgba(34,197,94,0.35),rgba(234,179,8,0.25),rgba(239,68,68,0.26))]" />
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
      ? `${window.location.origin}${window.location.pathname}#/exporter/verify`
      : "https://agritrust.demo/#/exporter/verify";

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Chứng nhận nháp" : "Draft certificate"}
        subtitle={language === "vi" ? "QR thật để mở trang kiểm chứng." : "Live QR opens the verification page."}
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

        <div className="mt-6 rounded-2xl border-2 border-dashed border-rose-200 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-rose-500">
          Draft - pending certifier review
        </div>
      </AppCard>
    </div>
  );
};

export const MarketScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const marketSold = useAppStore((state) => state.marketSold);
  const setRole = useAppStore((state) => state.setRole);
  const batch = exporterBatches[0];

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Bán hàng" : "Market"}
        subtitle={language === "vi" ? "Bán trực tiếp với premium nhờ chứng nhận." : "Sell direct with a certification premium."}
      />

      <AppCard className="bg-brand-dark text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-emerald-100">{batch.weight}</p>
            <h2 className="mt-1 text-2xl font-semibold">{batch.crop[language]}</h2>
            <p className="mt-2 text-sm text-emerald-100">
              {marketSold
                ? language === "vi"
                  ? "Đã bán trực tiếp cho nhà nhập khẩu EU"
                  : "Sold directly to an EU importer"
                : language === "vi"
                  ? "Sẵn sàng niêm yết với premium +15-30%"
                  : "Ready to list with a +15-30% premium"}
            </p>
          </div>
          <Badge tone="good">{marketSold ? "Sold +22%" : "Certified ✓"}</Badge>
        </div>

        <div className="mt-5 rounded-3xl bg-white/10 p-4">
          <div className="flex items-center justify-between text-sm">
            <span>{language === "vi" ? "Giá thị trường" : "Market price"}</span>
            <span>{formatMoney(batch.marketPrice, language)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-base font-semibold">
            <span>{language === "vi" ? "Giá chứng nhận" : "Certified price"}</span>
            <span>{formatMoney(batch.premiumPrice, language)}</span>
          </div>
        </div>
      </AppCard>

      <PrimaryButton
        onClick={() => {
          setRole("exporter");
          navigate("/exporter");
        }}
      >
        {marketSold
          ? language === "vi"
            ? "Xem giao dịch đã hoàn tất"
            : "View completed deal"
          : language === "vi"
            ? "Mở cổng nhà nhập khẩu"
            : "Open exporter portal"}
      </PrimaryButton>
    </div>
  );
};

export const ProfileScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "vi");
  const role = useAppStore((state) => state.role);
  const setRole = useAppStore((state) => state.setRole);
  const toggleLanguage = useAppStore((state) => state.toggleLanguage);
  const notifications = useAppStore((state) => state.notifications);
  const resetDemo = useAppStore((state) => state.resetDemo);

  return (
    <div className="space-y-4">
      <SectionHeading
        title={language === "vi" ? "Thông báo & hồ sơ" : "Notifications & profile"}
        subtitle={language === "vi" ? "Đổi ngôn ngữ hoặc chuyển vai trò demo." : "Switch language or role for the demo."}
      />

      <AppCard>
        <div className="flex items-center gap-4">
          <img
            src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20Vietnamese%20woman%20farmer%20portrait%2C%20sun%20hat%2C%20flat%20mobile%20app%20illustration%2C%20green%20palette&image_size=square_hd"
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

      <AppCard>
        <SectionHeading
          title={language === "vi" ? "Vai trò" : "Role"}
          trailing={<Badge tone="neutral">{roleLabels[role][language]}</Badge>}
        />
        <div className="grid grid-cols-2 gap-2">
          {(["farmer", "exporter"] as Role[]).map((nextRole) => (
            <button
              key={nextRole}
              onClick={() => {
                setRole(nextRole);
                navigate(nextRole === "farmer" ? "/farmer/home" : "/exporter");
              }}
              className={cx(
                "rounded-2xl px-4 py-3 text-sm font-semibold",
                role === nextRole
                  ? "bg-brand-green text-white"
                  : "bg-brand-cream text-brand-muted",
              )}
            >
              {roleLabels[nextRole][language]}
            </button>
          ))}
        </div>
      </AppCard>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <AppCard key={notification.id}>
            <p className="text-sm font-semibold text-brand-dark">
              {notification.title[language]}
            </p>
            <p className="mt-1 text-sm leading-6 text-brand-muted">
              {notification.body[language]}
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-brand-muted">
              {notification.timestamp}
            </p>
          </AppCard>
        ))}
      </div>

      <button
        onClick={resetDemo}
        className="mx-auto block text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted opacity-60"
      >
        reset demo
      </button>
    </div>
  );
};
