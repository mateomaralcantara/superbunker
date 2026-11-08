"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [, setTick] = useState(0);

  useEffect(() => {
    try {
      const v = localStorage.getItem("sb-theme");
      if (v === "dark" || v === "light") document.documentElement.setAttribute("data-theme", v);
    } catch {}
    setTick((t) => t + 1);
  }, []);

  function toggle() {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.getAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("sb-theme", next); } catch {}
    setTick((t) => t + 1);
  }

  return (
    <button className="theme-btn" onClick={toggle} aria-label="Cambiar tema" title="Tema claro / oscuro">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
