import { PersonMedia } from "~/services/types";
import { languages } from "./languages";

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

export function formatRuntime(minutes: number) {
  const seconds = minutes * 60;
  let secondsLeft = seconds;

  // hours
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft = secondsLeft % 3600;

  // mins
  const mins = Math.floor(secondsLeft / 60);
  secondsLeft = secondsLeft % 60;

  return `${hours ? hours + "h" : ""} ${mins}min`;
}

export function formatYear(time: string) {
  return time.substring(0, 4);
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


export function formatCrew(crew: PersonMedia[]) {
    const mycrew = crew.filter(
      (crew) =>
        crew.job == 'Director' ||
        crew.job == 'Screenplay' ||
        crew.job == 'Producer'
    );
    if (mycrew.length == 0) { return [] }
    return mycrew
  }
