"use client";

import { useState } from "react";
import type { AppExample, DemoBadge, DemoRow } from "@/lib/appExamples";
import type { SceneTheme } from "@/lib/theme";

interface AppShowcaseProps {
  app: AppExample | null;
  theme: SceneTheme;
  onClose: () => void;
}

const BADGE_STYLES: Record<DemoBadge, { dark: string; light: string; label: string }> = {
  ok: { dark: "bg-[#0e3a24] text-[#4ade80]", light: "bg-[#d9f5e3] text-[#15803d]", label: "OK" },
  warn: { dark: "bg-[#3a2c0e] text-[#fbbf24]", light: "bg-[#fdf0d5] text-[#b45309]", label: "!" },
  info: { dark: "bg-[#122a4a] text-[#60a5fa]", light: "bg-[#dbeafe] text-[#1d4ed8]", label: "i" },
};

// Detail card opened by clicking one of the three glowing stops on the
// light trail: the example's story on the left, and a genuinely interactive
// mock application on the right -- clickable screen tabs and a primary
// action that adds a live row, so visitors can "touch" what KabNetys builds.
export function AppShowcase({ app, theme, onClose }: AppShowcaseProps) {
  if (!app) return null;
  // Keyed on the app id so demo state (active tab, added rows) resets
  // naturally whenever a different app is opened.
  return <AppShowcaseContent key={app.id} app={app} theme={theme} onClose={onClose} />;
}

function AppShowcaseContent({
  app,
  theme,
  onClose,
}: {
  app: AppExample;
  theme: SceneTheme;
  onClose: () => void;
}) {
  const [activeScreen, setActiveScreen] = useState(0);
  const [addedRows, setAddedRows] = useState<DemoRow[]>([]);

  const dark = theme === "dark";
  const screen = app.screens[activeScreen];
  const rows = activeScreen === 0 ? [...addedRows, ...screen.rows] : screen.rows;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Exemple d'application : ${app.name}`}
    >
      <style>{`
        @keyframes showcase-backdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes showcase-card { from { opacity: 0; transform: translateY(26px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes showcase-item { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes showcase-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-md ${dark ? "bg-[#02060e]/75" : "bg-[#0c1a26]/40"}`}
        style={{ animation: "showcase-backdrop 0.35s ease both" }}
      />

      <div
        className={`relative grid w-full max-w-4xl gap-8 border p-6 md:grid-cols-[1.1fr_1fr] md:p-10 ${
          dark ? "border-[#1c355a] bg-[#050d1c]/95 text-[#eaf3ff]" : "border-[#9db4cc] bg-white/95 text-[#0c1a26]"
        }`}
        style={{ animation: "showcase-card 0.45s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fiche"
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center border text-lg transition-colors ${
            dark
              ? "border-[#28466e] text-[#9db4cc] hover:border-[#7cd9ff] hover:text-white"
              : "border-[#9db4cc] text-[#3d5568] hover:border-[#0f5f7a] hover:text-[#0c1a26]"
          }`}
        >
          ×
        </button>

        <div className="flex flex-col gap-4">
          <p
            className="text-[0.65rem] font-medium uppercase tracking-[0.35em]"
            style={{ color: app.accent, animation: "showcase-item 0.4s 0.1s ease both" }}
          >
            Exemple d&apos;application
          </p>
          <h3
            className="text-3xl font-semibold tracking-tight md:text-4xl"
            style={{ animation: "showcase-item 0.4s 0.16s ease both" }}
          >
            {app.name}
          </h3>
          <p
            className={`text-lg ${dark ? "text-[#bcd2ea]" : "text-[#2a4257]"}`}
            style={{ animation: "showcase-item 0.4s 0.22s ease both" }}
          >
            {app.tagline}
          </p>
          <p
            className={`text-sm leading-relaxed md:text-base ${dark ? "text-[#8fa3bd]" : "text-[#3d5568]"}`}
            style={{ animation: "showcase-item 0.4s 0.28s ease both" }}
          >
            {app.description}
          </p>
          <ul className="mt-2 flex flex-col gap-2.5">
            {app.features.map((feature, index) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm md:text-base"
                style={{ animation: `showcase-item 0.4s ${0.34 + index * 0.07}s ease both` }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0"
                  style={{ backgroundColor: app.accent }}
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Mock application window */}
        <div
          className={`flex flex-col overflow-hidden border ${
            dark ? "border-[#1c355a] bg-[#03101f]" : "border-[#c8d8e8] bg-[#f4f8fc]"
          }`}
          style={{ animation: "showcase-item 0.5s 0.25s ease both" }}
        >
          <div
            className={`flex items-center gap-1.5 px-4 py-2.5 ${dark ? "bg-[#0a1a32]" : "bg-[#e2ecf5]"}`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c941]" />
            <span
              className={`ml-3 text-[0.6rem] uppercase tracking-[0.25em] ${
                dark ? "text-[#5c7799]" : "text-[#7a92a8]"
              }`}
            >
              {app.name}
            </span>
          </div>
          {/* Screen tabs */}
          <div
            className={`flex gap-1 border-b px-3 pt-2 ${
              dark ? "border-[#16305a]" : "border-[#cfdeec]"
            }`}
          >
            {app.screens.map((s, index) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveScreen(index)}
                className={`px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.15em] transition-colors ${
                  index === activeScreen
                    ? dark
                      ? "bg-[#12294d] text-white"
                      : "bg-white text-[#0c1a26]"
                    : dark
                      ? "text-[#5c7799] hover:text-[#9db4cc]"
                      : "text-[#7a92a8] hover:text-[#3d5568]"
                }`}
                style={
                  index === activeScreen
                    ? { boxShadow: `inset 0 -2px 0 ${app.accent}` }
                    : undefined
                }
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Rows for the active screen */}
          <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
            {rows.map((row, index) => {
              const badge = row.badge ? BADGE_STYLES[row.badge] : null;
              return (
                <div
                  key={`${screen.id}-${row.label}-${index}`}
                  className={`flex items-center justify-between gap-3 border px-3 py-2 text-xs md:text-sm ${
                    dark ? "border-[#12294d] bg-[#071729]" : "border-[#dbe7f2] bg-white"
                  }`}
                  style={{ animation: `showcase-item 0.3s ${index * 0.05}s ease both` }}
                >
                  <span className="truncate">{row.label}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {row.value ? (
                      <span className={dark ? "text-[#9db4cc]" : "text-[#3d5568]"}>{row.value}</span>
                    ) : null}
                    {badge ? (
                      <span
                        className={`flex h-5 min-w-5 items-center justify-center px-1 text-[0.6rem] font-semibold ${
                          dark ? badge.dark : badge.light
                        }`}
                      >
                        {badge.label}
                      </span>
                    ) : null}
                  </span>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setActiveScreen(0);
                setAddedRows((current) => [app.action.resultRow, ...current].slice(0, 3));
              }}
              className="mt-auto self-start px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#03101f] transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: app.accent }}
            >
              {app.action.label}
            </button>

            <div
              className={`flex items-center justify-between border-t pt-3 text-[0.6rem] uppercase tracking-[0.2em] ${
                dark ? "border-[#16305a] text-[#5c7799]" : "border-[#cfdeec] text-[#7a92a8]"
              }`}
            >
              <span>Démo interactive — sur mesure</span>
              <span style={{ color: app.accent }}>KabNetys</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
