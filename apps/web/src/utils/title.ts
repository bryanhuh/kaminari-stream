export type TitleLanguage = "english" | "romaji" | "native";

export interface TitleObj {
  english?: string | null;
  romaji?: string | null;
  native?: string | null;
}

const FALLBACK: Record<TitleLanguage, TitleLanguage[]> = {
  english: ["english", "romaji", "native"],
  romaji: ["romaji", "english", "native"],
  native: ["native", "romaji", "english"],
};

export function resolveTitle(
  title: TitleObj | null | undefined,
  pref: TitleLanguage = "english"
): string {
  if (!title) return "Unknown";
  for (const lang of FALLBACK[pref]) {
    const v = title[lang];
    if (v) return v;
  }
  return "Unknown";
}
