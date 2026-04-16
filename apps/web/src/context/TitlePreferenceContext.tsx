import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TitleLanguage } from "../utils/title";

const STORAGE_KEY = "raijin_title_lang";

function loadPref(): TitleLanguage {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "english" || v === "romaji" || v === "native") return v;
  return "english";
}

interface TitlePreferenceContextValue {
  pref: TitleLanguage;
  setPreference: (lang: TitleLanguage) => void;
}

const TitlePreferenceContext = createContext<TitlePreferenceContextValue>({
  pref: "english",
  setPreference: () => {},
});

export function TitlePreferenceProvider({ children }: { children: ReactNode }) {
  const [pref, setPref] = useState<TitleLanguage>(loadPref);

  const setPreference = useCallback((lang: TitleLanguage) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setPref(lang);
  }, []);

  return (
    <TitlePreferenceContext.Provider value={{ pref, setPreference }}>
      {children}
    </TitlePreferenceContext.Provider>
  );
}

export function useTitlePreference() {
  return useContext(TitlePreferenceContext);
}
