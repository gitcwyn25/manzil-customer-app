import { en, type MessageKey } from "./en";
import { uz } from "./uz";
import { ru } from "./ru";
import type { Locale } from "@/domain/types";

export type { MessageKey };

export const dictionaries: Record<Locale, Record<MessageKey, string>> = { en, uz, ru };

export const localeTags: Record<Locale, string> = { en: "en", uz: "uz-Latn", ru: "ru" };

export const localeLabels: Record<Locale, string> = {
  en: "English",
  uz: "Oʻzbek (lotin)",
  ru: "Русский",
};

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const template = dictionaries[locale][key] ?? en[key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
}

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/** Countable nouns with locale-correct plural forms (e.g. RU one/few/many). */
const plurals: Record<"replies" | "places" | "experiences" | "posts", Record<Locale, PluralForms>> = {
  replies: {
    en: { one: "reply", other: "replies" },
    uz: { other: "javob" },
    ru: { one: "ответ", few: "ответа", many: "ответов", other: "ответа" },
  },
  places: {
    en: { one: "place", other: "places" },
    uz: { other: "joy" },
    ru: { one: "место", few: "места", many: "мест", other: "места" },
  },
  experiences: {
    en: { one: "experience", other: "experiences" },
    uz: { other: "tajriba" },
    ru: { one: "отзыв об опыте", few: "отзыва об опыте", many: "отзывов об опыте", other: "отзыва об опыте" },
  },
  posts: {
    en: { one: "post", other: "posts" },
    uz: { other: "post" },
    ru: { one: "пост", few: "поста", many: "постов", other: "поста" },
  },
};

export type PluralNoun = keyof typeof plurals;

export function pluralize(locale: Locale, count: number, noun: PluralNoun): string {
  const rule = new Intl.PluralRules(localeTags[locale]).select(count);
  const forms = plurals[noun][locale];
  const word = forms[rule] ?? forms.other;
  return `${new Intl.NumberFormat(localeTags[locale]).format(count)} ${word}`;
}

export function relativeTime(locale: Locale, iso: string, now = Date.now()): string {
  const diffSec = Math.round((new Date(iso).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(localeTags[locale], { numeric: "auto", style: "short" });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(Math.round(diffSec), "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 86400 * 365) return rtf.format(Math.round(diffSec / (86400 * 30)), "month");
  return rtf.format(Math.round(diffSec / (86400 * 365)), "year");
}

export function absoluteTime(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(localeTags[locale], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tashkent",
  }).format(new Date(iso));
}
