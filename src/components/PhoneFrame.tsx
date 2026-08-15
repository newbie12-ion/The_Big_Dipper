import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { BottomNav, cx } from "./ui";

export const PhoneFrame = ({
  children,
  role,
  scanLabel,
}: {
  children: ReactNode;
  role: "farmer" | "exporter";
  scanLabel: string;
}) => {
  const location = useLocation();
  const hideBottomNav =
    location.pathname === "/" ||
    location.pathname.includes("/scan/analyzing") ||
    location.pathname.includes("/exporter");

  return (
    <div className="min-h-screen bg-brand-cream px-4 py-6 text-brand-ink">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px]">
        <div className="hidden rounded-[40px] bg-field p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-green">
              Build@HUB Hackathon 2026
            </div>
            <h1 className="mt-6 max-w-xl text-5xl font-bold leading-tight text-brand-dark">
              AgriTrust
            </h1>
            <p className="mt-4 max-w-xl text-lg text-brand-ink/80">
              The paperwork that farms itself. Diagnose crops, auto-log every field
              action, and prove traceability to buyers in one demo-ready mobile app.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              ["AI agronomist", "Free diagnosis + care guidance"],
              ["Blockchain trail", "Tamper-proof farm timeline"],
              ["Premium sale", "Direct exporter purchase at +22%"],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-card backdrop-blur"
              >
                <p className="text-sm font-semibold text-brand-dark">{title}</p>
                <p className="mt-2 text-sm text-brand-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[420px]">
          <div className="relative rounded-[42px] bg-[#17211c] p-3 shadow-[0_35px_90px_rgba(0,0,0,0.22)]">
            <div className="absolute left-1/2 top-3 h-6 w-32 -translate-x-1/2 rounded-full bg-black/70" />
            <div
              className={cx(
                "min-h-[860px] rounded-[34px] border border-white/40 bg-brand-cream p-4 pt-10",
                "shadow-inner",
              )}
            >
              {children}
              {!hideBottomNav ? <BottomNav role={role} scanLabel={scanLabel} /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
