import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, QrCode, ShieldCheck, Wallet } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { exporterBatches } from "../data/mockData";
import { formatMoney } from "../lib/i18n";
import { getCertificateReadiness, useAppStore } from "../store/appStore";
import { AppCard, Badge, PrimaryButton, SecondaryButton, SectionHeading } from "../components/ui";

export const ExporterBatchListScreen = () => {
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language ?? "en");
  const marketSold = useAppStore((state) => state.marketSold);

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 text-sm font-semibold text-brand-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === "vi" ? "Quay lại hồ sơ" : "Back to profile"}
      </button>

      <SectionHeading
        title="AgriTrust Verify"
        subtitle={language === "vi" ? "Cổng nhà nhập khẩu" : "Exporter portal"}
      />

      {exporterBatches.map((batch, index) => (
        <AppCard key={batch.id} className={index === 0 ? "border-emerald-300" : ""}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-brand-dark">{batch.crop[language]}</h2>
              <p className="mt-1 text-sm text-brand-muted">
                {batch.cooperative} · {batch.weight}
              </p>
            </div>
            <Badge tone={index === 0 ? "good" : "neutral"}>
              {marketSold && index === 0 ? "Purchased" : "Verified"}
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {batch.badges.map((badge) => (
              <Badge key={badge} tone="good">
                {badge}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-sm text-brand-muted">{batch.origin[language]}</p>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
                {language === "vi" ? "Giá premium" : "Premium price"}
              </p>
              <p className="text-xl font-bold text-brand-green">
                {formatMoney(batch.premiumPrice, language)}
              </p>
            </div>
            {index === 0 ? (
              <PrimaryButton className="h-12 w-auto px-5" onClick={() => navigate(`/exporter/verify/${batch.id}`)}>
                {language === "vi" ? "Kiểm chứng" : "Verify batch"}
              </PrimaryButton>
            ) : null}
          </div>
        </AppCard>
      ))}
    </div>
  );
};

export const ExporterVerifyScreen = () => {
  const navigate = useNavigate();
  const { batchId = "batch-dragon" } = useParams();
  const language = useAppStore((state) => state.language ?? "en");
  const ledgerEvents = useAppStore((state) => state.ledgerEvents);
  const readiness = useAppStore(getCertificateReadiness);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setScanning(false), 850);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/exporter")}
        className="flex items-center gap-2 text-sm font-semibold text-brand-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === "vi" ? "Danh sách lô hàng" : "Back to batches"}
      </button>

      <AppCard className="bg-brand-dark text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <QrCode className="h-6 w-6 text-emerald-200" />
            </div>
            <div>
              <p className="text-sm text-emerald-100">
                {scanning ? (language === "vi" ? "Đang đọc mã QR..." : "Scanning QR certificate...") : (language === "vi" ? "Mã QR đã xác minh" : "QR certificate verified")}
              </p>
              <h1 className="text-xl font-semibold">Dragon fruit batch</h1>
            </div>
          </div>
          <Badge tone="good">{readiness}%</Badge>
        </div>
      </AppCard>

      <AppCard className="border-emerald-200 bg-emerald-50">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-brand-green" />
          <p className="font-semibold text-brand-dark">
            {language === "vi"
              ? `Tất cả ${ledgerEvents.length} bản ghi đã được xác minh mật mã`
              : `All ${ledgerEvents.length} records are cryptographically verified`}
          </p>
        </div>
      </AppCard>

      <AppCard>
        <SectionHeading
          title={language === "vi" ? "Tóm tắt chứng nhận" : "Certificate summary"}
          trailing={
            <div className="flex gap-2">
              <Badge tone="good">GlobalGAP</Badge>
              <Badge tone="good">EUDR</Badge>
            </div>
          }
        />
        <div className="space-y-3 text-sm text-brand-dark">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-green" />
            <span>{language === "vi" ? "Nông hộ: Chị Hoa" : "Farmer: Chị Hoa"}</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-green" />
            <span>GPS: 10.3642, 106.3625</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-green" />
            <span>{language === "vi" ? "Nguồn gốc: Tiền Giang, Việt Nam" : "Origin: Tien Giang, Vietnam"}</span>
          </div>
        </div>
      </AppCard>

      <div className="space-y-3">
        {ledgerEvents.slice(0, 6).map((event) => (
          <AppCard key={event.id}>
            <p className="text-sm font-semibold text-brand-dark">{event.title[language]}</p>
            <p className="mt-1 text-sm text-brand-muted">{event.detail[language]}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-brand-muted">
              block #{event.blockNumber}
            </p>
          </AppCard>
        ))}
      </div>

      <PrimaryButton onClick={() => navigate(`/exporter/purchase/${batchId}`)}>
        {language === "vi" ? "Mua với premium" : "Buy at +22% premium"}
      </PrimaryButton>
    </div>
  );
};

export const ExporterPurchaseScreen = () => {
  const navigate = useNavigate();
  const { batchId = "batch-dragon" } = useParams();
  const language = useAppStore((state) => state.language ?? "en");
  const completePurchase = useAppStore((state) => state.completePurchase);
  const marketSold = useAppStore((state) => state.marketSold);
  const [success, setSuccess] = useState(marketSold);
  const batch = exporterBatches[0];

  const handlePurchase = () => {
    completePurchase();
    setSuccess(true);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(`/exporter/verify/${batchId}`)}
        className="flex items-center gap-2 text-sm font-semibold text-brand-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === "vi" ? "Quay lại kiểm chứng" : "Back to verification"}
      </button>

      <SectionHeading
        title={language === "vi" ? "Mua lô hàng" : "Purchase batch"}
        subtitle={language === "vi" ? "Trả trực tiếp cho nông dân." : "Pay the farmer directly."}
      />

      <AppCard className="bg-field">
        <div className="flex items-center justify-between text-sm text-brand-muted">
          <span>{language === "vi" ? "Giá thị trường" : "Market price"}</span>
          <span>{formatMoney(batch.marketPrice, language)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xl font-bold text-brand-dark">
          <span>{language === "vi" ? "Giá chứng nhận" : "Certified price"}</span>
          <span>{formatMoney(batch.premiumPrice, language)}</span>
        </div>
        <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-brand-green">
          +22%
        </div>
      </AppCard>

      {success ? (
        <AppCard className="border-emerald-200 bg-emerald-50">
          <div className="flex items-start gap-3">
            <Wallet className="mt-1 h-6 w-6 text-brand-green" />
            <div>
              <p className="font-semibold text-brand-dark">
                {language === "vi"
                  ? "Thanh toán đã gửi trực tiếp cho nông dân"
                  : "Payment sent directly to the farmer"}
              </p>
              <p className="mt-1 text-sm text-brand-muted">
                {language === "vi" ? "0 middlemen. Lô hàng đã cập nhật về phía nông dân." : "0 middlemen. The farmer view now shows the sale result."}
              </p>
            </div>
          </div>
        </AppCard>
      ) : null}

      <PrimaryButton onClick={handlePurchase}>
        {success
          ? language === "vi"
            ? "Đã hoàn tất"
            : "Purchase complete"
          : language === "vi"
            ? "Thanh toán ngay"
            : "Purchase now"}
      </PrimaryButton>

      <SecondaryButton className="w-full" onClick={() => navigate("/home")}>
        {language === "vi" ? "Quay về phía nông dân" : "Return to farmer app"}
      </SecondaryButton>
    </div>
  );
};
