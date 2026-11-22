"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DICTIONARIES,
  LOCALE_STORAGE_KEY,
  type LocaleId,
} from "./dictionaries";

type LocaleCtx = {
  locale: LocaleId;
  setLocale: (l: LocaleId) => void;
  t: (key: string, fallback?: string) => string;
};

const Ctx = createContext<LocaleCtx | null>(null);

function readStored(): LocaleId {
  if (typeof window === "undefined") return "en-US";
  try {
    const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (v === "zh-CN" || v === "en-US") return v;
  } catch {
    /* ignore */
  }
  return "en-US";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>("en-US");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readStored());
    setReady(true);
  }, []);

  const setLocale = useCallback((l: LocaleId) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      const dict = DICTIONARIES[locale] ?? DICTIONARIES["en-US"];
      return dict[key] ?? fallback ?? DICTIONARIES["en-US"][key] ?? key;
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  // Avoid hydration mismatch flash for lang-dependent chrome
  if (!ready) {
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      locale: "en-US",
      setLocale: () => undefined,
      t: (key, fallback) =>
        DICTIONARIES["en-US"][key] ?? fallback ?? key,
    };
  }
  return ctx;
}

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        type="button"
        className={`rounded px-2 py-1 ${
          locale === "en-US" ? "bg-stone-800 text-white" : "text-stone-600"
        }`}
        onClick={() => setLocale("en-US")}
      >
        {t("lang.en")}
      </button>
      <button
        type="button"
        className={`rounded px-2 py-1 ${
          locale === "zh-CN" ? "bg-stone-800 text-white" : "text-stone-600"
        }`}
        onClick={() => setLocale("zh-CN")}
      >
        {t("lang.zh")}
      </button>
    </div>
  );
}
