import { useEffect, useState } from "react";

const KEY = "theme"; // 'light' | 'dark' | 'system'

function getSystemPref() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const resolved = theme === "system" ? getSystemPref() : theme;
  document.documentElement.setAttribute("data-theme", resolved);
}

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(KEY) || "system"; } catch { return "system"; }
  });

  useEffect(() => {
    // Apply on mount and whenever theme changes
    applyTheme(theme);
    try { localStorage.setItem(KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    // Auto-update if system theme changes while in 'system' mode
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [theme]);

  function toggle() {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      return next;
    });
  }

  return { theme, setTheme, toggle };
}
