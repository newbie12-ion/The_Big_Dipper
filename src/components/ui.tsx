import type { ReactNode } from "react";
import {
  Bell,
  Home,
  Leaf,
  ScanSearch,
  UserRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const tones = {
  good: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warn: "bg-amber-50 text-amber-700 ring-amber-200",
  alert: "bg-rose-50 text-rose-700 ring-rose-200",
  neutral: "bg-slate-50 text-slate-700 ring-slate-200",
};

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const AppCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cx(
      "rounded-[28px] border border-brand-line bg-white p-4 shadow-card",
      className,
    )}
  >
    {children}
  </div>
);

export const PrimaryButton = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cx(
      "flex h-14 w-full items-center justify-center rounded-2xl bg-brand-green px-5 text-base font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export const SecondaryButton = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cx(
      "flex h-12 items-center justify-center rounded-2xl border border-brand-line bg-white px-4 text-sm font-semibold text-brand-ink transition hover:border-brand-green hover:text-brand-green",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export const SectionHeading = ({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) => (
  <div className="mb-4 flex items-start justify-between gap-3">
    <div>
      <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-brand-muted">{subtitle}</p> : null}
    </div>
    {trailing}
  </div>
);

export const Badge = ({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) => (
  <span
    className={cx(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
      tones[tone],
    )}
  >
    {children}
  </span>
);

export const StatCard = ({
  label,
  value,
  icon,
  unit,
  tone = "good",
}: {
  label: string;
  value: string;
  icon: string;
  unit?: string;
  tone?: keyof typeof tones;
}) => (
  <AppCard className="p-3">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-2xl">{icon}</span>
      <Badge tone={tone}>{label}</Badge>
    </div>
    <p className="text-2xl font-semibold text-brand-ink">{value}{unit ? <span className="ml-1 text-sm font-medium text-brand-muted">{unit}</span> : null}</p>
  </AppCard>
);

export const ProgressRing = ({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: string;
}) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-28 w-28">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#e8efe8"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={accent ?? "#16a34a"}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-bold text-brand-ink">{value}%</p>
        <p className="max-w-[68px] text-[11px] font-medium leading-tight text-brand-muted">
          {label}
        </p>
      </div>
    </div>
  );
};

export const BottomNav = ({
  scanLabel,
  language,
}: {
  scanLabel: string;
  language: "vi" | "en";
}) => {
  const navItems = [
    { label: language === "vi" ? "Trang chủ" : "Home", icon: Home, to: "/home" },
    { label: language === "vi" ? "Nông trại" : "Farm", icon: Leaf, to: "/farm" },
    { label: scanLabel, icon: ScanSearch, to: "/scan" },
    { label: language === "vi" ? "Hồ sơ" : "Profile", icon: UserRound, to: "/profile" },
  ];

  return (
    <nav className="shrink-0 rounded-[30px] border border-brand-line bg-white/95 p-2 shadow-card backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  "flex min-h-[62px] flex-col items-center justify-center rounded-2xl px-1 text-center text-[11px] font-semibold transition",
                  isActive ? "bg-emerald-50 text-brand-green" : "text-brand-muted",
                )
              }
            >
              <Icon className="mb-1 h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export const NotificationBell = ({ badge }: { badge: number }) => (
  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-ink shadow-card">
    <Bell className="h-5 w-5" />
    <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
      {badge}
    </span>
  </div>
);
