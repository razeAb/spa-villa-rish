import { createContext, useContext, useEffect, useState } from "react";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState("he");

  useEffect(() => {
    document.documentElement.lang = locale === "he" ? "he" : "en";
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale]);

  const toggleLocale = () => setLocale((prev) => (prev === "he" ? "en" : "he"));

  return <LocaleContext.Provider value={{ locale, toggleLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
