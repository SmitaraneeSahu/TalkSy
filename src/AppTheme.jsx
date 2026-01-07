
// AppRoot.jsx
import React from 'react';
import { useEffect } from 'react';

const THEME_KEY = 'theme';
const BG_KEY = 'background';
const FONT_KEY = 'font';

export default function AppRoot({ children }) {
  useEffect(() => {
    // 1) Initial apply on mount (read from localStorage)
    const theme = localStorage.getItem(THEME_KEY) || 'light';
    const background = localStorage.getItem(BG_KEY) || 'none';
    const font = localStorage.getItem(FONT_KEY) || 'system';

    applyTheme(theme);
    applyBackground(background);
    applyFont(font);

    // 2) Cross-tab sync (storage event)
    const onStorage = (e) => {
      if (!e.key) return;
      if (e.key === THEME_KEY || e.key === BG_KEY || e.key === FONT_KEY) {
        const t = localStorage.getItem(THEME_KEY) || 'light';
        const b = localStorage.getItem(BG_KEY) || 'none';
        const f = localStorage.getItem(FONT_KEY) || 'system';
        applyTheme(t);
        applyBackground(b);
        applyFont(f);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <>{children}</>;
}

/* ---------- same helpers you already wrote, now at root ---------- */
function applyTheme(theme) {
  const root = document.documentElement; // <html>
  root.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
  root.classList.add(`theme-${theme}`);
}

function applyBackground(background) {
  document.documentElement.setAttribute('data-bg', background);
}

function applyFont(font) {
  document.documentElement.setAttribute('data-font', font);
}
