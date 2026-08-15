export type Language = "vi" | "en";

export type LocalizedText = Record<Language, string>;

export const tText = (
  value: LocalizedText | string,
  language: Language,
): string => {
  if (typeof value === "string") {
    return value;
  }

  return value[language];
};

export const formatMoney = (value: number, language: Language) =>
  new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercent = (value: number, language: Language) =>
  new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);

export const languageLabel: Record<Language, string> = {
  vi: "Tiếng Việt",
  en: "English",
};
