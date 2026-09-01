// Theme definitions for Questlog.
// Free themes are available to all users; premium themes require Premium.
// Each theme overrides the CSS custom properties defined in :root.

export const THEMES = [
  // --- Free themes ---
  { id: "default", name: "Questlog", premium: false, vars: {} },
  {
    id: "daylight",
    name: "Daylight",
    premium: false,
    vars: {
      "--bg": "#f4f5fb",
      "--bg-soft": "#ffffff",
      "--bg-card": "#ffffff",
      "--bg-elev": "#eef0f7",
      "--border": "#dfe3ee",
      "--text": "#1a1d2e",
      "--text-dim": "#5a6080",
      "--text-mute": "#9aa0bc",
      "--accent": "#6c4cf0",
      "--accent-2": "#3b82f6",
      "--accent-soft": "rgba(108,76,240,0.12)",
      "--shadow": "0 8px 30px rgba(0,0,0,0.08)",
    },
  },
  {
    id: "slate",
    name: "Slate",
    premium: false,
    vars: {
      "--bg": "#e9ecf3",
      "--bg-soft": "#f5f7fb",
      "--bg-card": "#ffffff",
      "--bg-elev": "#e4e8f0",
      "--border": "#d2d8e4",
      "--text": "#2a2d3e",
      "--text-dim": "#6b7280",
      "--text-mute": "#9ca3af",
      "--accent": "#6366f1",
      "--accent-2": "#0ea5e9",
      "--accent-soft": "rgba(99,102,241,0.12)",
      "--shadow": "0 8px 30px rgba(0,0,0,0.07)",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    premium: false,
    vars: {
      "--bg": "#0a1929",
      "--bg-soft": "#0f2942",
      "--bg-card": "#122e4a",
      "--bg-elev": "#1a3a5c",
      "--border": "#1e3a5f",
      "--text": "#e2e8f0",
      "--text-dim": "#94a3b8",
      "--text-mute": "#64748b",
      "--accent": "#38bdf8",
      "--accent-2": "#22d3ee",
      "--accent-soft": "rgba(56,189,248,0.14)",
      "--shadow": "0 8px 30px rgba(0,0,0,0.4)",
    },
  },
  // --- Premium themes ---
  {
    id: "neon",
    name: "Neon",
    premium: true,
    vars: {
      "--bg": "#0a0a0f",
      "--bg-soft": "#12121f",
      "--bg-card": "#16162a",
      "--bg-elev": "#1e1e36",
      "--border": "#2a2a4a",
      "--text": "#f0f0ff",
      "--text-dim": "#a0a0d0",
      "--text-mute": "#6a6a9a",
      "--accent": "#ff00ff",
      "--accent-2": "#00ffff",
      "--accent-soft": "rgba(255,0,255,0.14)",
      "--shadow": "0 8px 30px rgba(255,0,255,0.15)",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    premium: true,
    vars: {
      "--bg": "#0f0518",
      "--bg-soft": "#1a0a26",
      "--bg-card": "#1f0e30",
      "--bg-elev": "#2a1640",
      "--border": "#3a1f55",
      "--text": "#fde8ff",
      "--text-dim": "#c89ae0",
      "--text-mute": "#8a6aa8",
      "--accent": "#ff2a6d",
      "--accent-2": "#05d9e8",
      "--accent-soft": "rgba(255,42,109,0.14)",
      "--shadow": "0 8px 30px rgba(255,42,109,0.2)",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    premium: true,
    vars: {
      "--bg": "#060818",
      "--bg-soft": "#0c0f24",
      "--bg-card": "#10142c",
      "--bg-elev": "#181d3a",
      "--border": "#1f2548",
      "--text": "#e8ecff",
      "--text-dim": "#8b94c8",
      "--text-mute": "#5a6498",
      "--accent": "#4361ee",
      "--accent-2": "#4cc9f0",
      "--accent-soft": "rgba(67,97,238,0.14)",
      "--shadow": "0 8px 30px rgba(0,0,0,0.5)",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    premium: true,
    vars: {
      "--bg": "#1a0f1f",
      "--bg-soft": "#261530",
      "--bg-card": "#2e1a3d",
      "--bg-elev": "#3a234d",
      "--border": "#4a2f60",
      "--text": "#fff0f5",
      "--text-dim": "#d4a8c0",
      "--text-mute": "#a07090",
      "--accent": "#ff6b6b",
      "--accent-2": "#ffa94d",
      "--accent-soft": "rgba(255,107,107,0.14)",
      "--shadow": "0 8px 30px rgba(255,107,107,0.15)",
    },
  },
  {
    id: "pixel",
    name: "Pixel",
    premium: true,
    vars: {
      "--bg": "#1a1a2e",
      "--bg-soft": "#22223e",
      "--bg-card": "#2a2a4a",
      "--bg-elev": "#33335a",
      "--border": "#3d3d68",
      "--text": "#e8e8ff",
      "--text-dim": "#a0a0d8",
      "--text-mute": "#6a6aa0",
      "--accent": "#e94560",
      "--accent-2": "#0f3460",
      "--accent-soft": "rgba(233,69,96,0.14)",
      "--shadow": "0 8px 30px rgba(0,0,0,0.4)",
    },
  },
];

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyTheme(id) {
  const theme = getTheme(id);
  const root = document.documentElement;
  // Clear any previously applied theme variables
  THEMES.forEach((t) => {
    Object.keys(t.vars).forEach((k) => root.style.removeProperty(k));
  });
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function isPremiumTheme(id) {
  return getTheme(id).premium;
}
