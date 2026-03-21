import type { CastCrew } from "~/services/models";
import { languages } from "./languages";

const KEY_CREW_JOBS = new Set(["Director", "Screenplay", "Producer"]);

const getYearDifference = (from: string, to: string) =>
  new Date(to).getFullYear() - new Date(from).getFullYear();

export function formatDate(date: string, lang: string) {
  return new Date(date).toLocaleDateString(lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatCurrency(amount: number, lang: string) {
  const formatter = new Intl.NumberFormat(lang, {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  });

  return formatter.format(amount || 0);
}

export function formatYear(time?: string | null) {
  if (!time) {
    return 0;
  }

  const year = Number.parseInt(time.slice(0, 4), 10);
  return Number.isNaN(year) ? 0 : year;
}

export function formatRating(r: number) {
  return r.toFixed(1);
}

export function formatLanguage(iso?: string) {
  const fullLang = languages.find((lang) => lang.iso_639_1 === iso);

  if (fullLang) {
    return fullLang.english_name;
  }

  return iso;
}

export function formatCrew(crew: CastCrew[]) {
  return crew.filter((item) => KEY_CREW_JOBS.has(item.job ?? ""));
}

export function showYearOld(birth: string): string {
  return getYearDifference(birth, new Date().toISOString()).toString();
}

export function showDeathYear(birth: string, death: string): string {
  return getYearDifference(birth, death).toString();
}
