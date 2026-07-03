"use client";

import { getPanelVisibility } from "@/lib/chapters";
import { SCENARIO_SECTIONS, type ScenarioSection } from "@/lib/scenario";
import type { SceneTheme } from "@/lib/theme";

interface ChapterOverlayProps {
  scrollProgress: number;
  theme: SceneTheme;
}

// hubtown.co.in-style content layer: full website sections (eyebrow +
// headline + supporting copy + CTA together) in a fixed screen-space HTML
// overlay, fading/sliding with the scroll while the 3D valley plays behind.

const ALIGN_WRAPPER: Record<ScenarioSection["align"], string> = {
  left: "justify-start pl-[7vw] pr-[7vw] text-left",
  right: "justify-end pl-[7vw] pr-[7vw] text-right",
  center: "justify-center px-[7vw] text-center",
};

const ALIGN_INNER: Record<ScenarioSection["align"], string> = {
  left: "items-start",
  right: "items-end",
  center: "items-center",
};

function Section({
  section,
  visibility,
  theme,
}: {
  section: ScenarioSection;
  visibility: number;
  theme: SceneTheme;
}) {
  if (visibility < 0.015) return null;

  const eased = visibility * visibility * (3 - 2 * visibility);
  const translate = (1 - eased) * 26;
  const dark = theme === "dark";

  const eyebrowColor = dark ? "text-[#7cd9ff]" : "text-[#0f5f7a]";
  const titleColor = dark ? "text-[#f4f8ff]" : "text-[#0c1a26]";
  const bodyColor = dark ? "text-[#a9bdd4]" : "text-[#3d5568]";
  const itemTitleColor = dark ? "text-[#e6efff]" : "text-[#12222f]";
  const statGlow = dark
    ? { textShadow: "0 0 55px rgba(110,200,255,0.5), 0 0 16px rgba(150,220,255,0.3)" }
    : undefined;

  return (
    <div
      className={`absolute inset-0 flex items-center ${ALIGN_WRAPPER[section.align]}`}
      style={{ opacity: eased, transform: `translateY(${translate}px)` }}
    >
      <div className={`flex max-w-[min(86vw,760px)] flex-col gap-5 md:gap-6 ${ALIGN_INNER[section.align]}`}>
        {section.eyebrow ? (
          <p className={`text-[0.68rem] font-medium uppercase tracking-[0.35em] md:text-xs ${eyebrowColor}`}>
            {section.eyebrow}
          </p>
        ) : null}

        <h2
          className={`text-[clamp(2.1rem,5.2vw,4.4rem)] font-semibold leading-[1.06] tracking-tight ${titleColor}`}
        >
          {section.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        {section.paragraph ? (
          <p className={`max-w-xl text-base leading-relaxed md:text-lg ${bodyColor}`}>
            {section.paragraph}
          </p>
        ) : null}

        {section.items ? (
          <ul className={`flex flex-col gap-3 md:gap-4 ${ALIGN_INNER[section.align]}`}>
            {section.items.map((item) => (
              <li key={item.title} className="max-w-xl">
                <p className={`text-lg font-medium md:text-xl ${itemTitleColor}`}>{item.title}</p>
                {item.desc ? (
                  <p className={`mt-1 text-sm leading-relaxed md:text-base ${bodyColor}`}>
                    {item.desc}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {section.stats ? (
          <div className="mt-2 flex flex-wrap justify-center gap-10 md:gap-16">
            {section.stats.map((stat) => (
              <div key={stat.value} className="flex max-w-[220px] flex-col items-center gap-2 text-center">
                <p
                  className={`text-[clamp(2.8rem,6.5vw,5rem)] font-semibold leading-none tracking-tight ${titleColor}`}
                  style={statGlow}
                >
                  {stat.value}
                </p>
                <p className={`text-sm leading-snug md:text-base ${bodyColor}`}>{stat.label}</p>
                <p className={`text-[0.65rem] uppercase tracking-[0.2em] ${eyebrowColor}`}>
                  {stat.source}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {section.cta ? (
          <a
            href={section.cta.href}
            className={`pointer-events-auto mt-2 inline-flex items-center gap-3 border px-7 py-3 text-[0.72rem] font-medium uppercase tracking-[0.3em] transition-colors md:text-xs ${
              dark
                ? "border-[#3d6c94] bg-[#0a1930]/60 text-[#e6f3ff] backdrop-blur-sm hover:border-[#7cd9ff] hover:bg-[#12263f]/70"
                : "border-[#0f5f7a] bg-white/50 text-[#0c1a26] backdrop-blur-sm hover:bg-white/80"
            }`}
          >
            <span className={`inline-block h-1.5 w-1.5 ${dark ? "bg-[#7cd9ff]" : "bg-[#0f5f7a]"}`} />
            {section.cta.label}
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function ChapterOverlay({ scrollProgress, theme }: ChapterOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {SCENARIO_SECTIONS.map((section) => (
        <Section
          key={section.id}
          section={section}
          visibility={getPanelVisibility(scrollProgress, section.peakProgress, section.fadeHalfWidth)}
          theme={theme}
        />
      ))}
    </div>
  );
}
