"use client";

import { useState } from "react";
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
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

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
            {section.items.map((item, itemIndex) =>
              item.details ? (
                <li key={item.title} className="w-full max-w-xl">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedItem(expandedItem === item.title ? null : item.title)
                    }
                    aria-expanded={expandedItem === item.title}
                    className={`group pointer-events-auto relative w-full px-6 py-5 text-left transition-all duration-500 ${
                      dark
                        ? expandedItem === item.title
                          ? "bg-[#0a1a32]/85"
                          : "bg-[#050f20]/60 hover:bg-[#081527]/75"
                        : expandedItem === item.title
                          ? "bg-white/90"
                          : "bg-white/55 hover:bg-white/75"
                    }`}
                    style={{
                      backgroundImage: dark
                        ? "linear-gradient(rgba(124,217,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,217,255,0.04) 1px, transparent 1px)"
                        : "linear-gradient(rgba(15,95,122,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,95,122,0.05) 1px, transparent 1px)",
                      backgroundSize: "22px 22px",
                      boxShadow:
                        expandedItem === item.title && dark
                          ? "0 0 40px rgba(57,200,255,0.12), inset 0 0 30px rgba(57,200,255,0.04)"
                          : undefined,
                    }}
                  >
                    {/* Corner brackets -- tech frame instead of a plain border */}
                    {[
                      "left-0 top-0 border-l-2 border-t-2",
                      "right-0 top-0 border-r-2 border-t-2",
                      "left-0 bottom-0 border-l-2 border-b-2",
                      "right-0 bottom-0 border-r-2 border-b-2",
                    ].map((cls) => (
                      <span
                        key={cls}
                        aria-hidden="true"
                        className={`absolute h-4 w-4 transition-all duration-500 ${cls} ${
                          dark
                            ? expandedItem === item.title
                              ? "border-[#7cd9ff]"
                              : "border-[#2c4f7c] group-hover:border-[#4a7cb0]"
                            : expandedItem === item.title
                              ? "border-[#0f5f7a]"
                              : "border-[#9db4cc] group-hover:border-[#0f5f7a]"
                        } ${expandedItem === item.title ? "h-6 w-6" : ""}`}
                      />
                    ))}

                    <span
                      className={`block font-mono text-[0.6rem] uppercase tracking-[0.4em] ${eyebrowColor}`}
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {`// co-fondateur 0${itemIndex + 1}`}
                    </span>

                    <span className="mt-2 flex items-center justify-between gap-4">
                      <span className={`text-xl font-semibold tracking-tight md:text-2xl ${itemTitleColor}`}>
                        {item.title}
                      </span>
                      <span
                        className={`font-mono text-lg transition-transform duration-500 ${eyebrowColor} ${
                          expandedItem === item.title ? "rotate-90" : ""
                        }`}
                        aria-hidden="true"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {""}&gt;
                      </span>
                    </span>
                    {item.desc ? (
                      <span className={`mt-1 block text-sm md:text-base ${bodyColor}`}>
                        {item.desc}
                      </span>
                    ) : null}

                    <span
                      className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
                      style={{
                        gridTemplateRows: expandedItem === item.title ? "1fr" : "0fr",
                        opacity: expandedItem === item.title ? 1 : 0,
                      }}
                    >
                      <span className="block overflow-hidden">
                        <span
                          className={`mt-4 block font-mono text-[0.65rem] uppercase tracking-[0.3em] ${eyebrowColor}`}
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          &gt; {item.details.role}
                        </span>
                        <span
                          className={`mt-2 block border-l-2 pl-3 text-sm italic leading-relaxed md:text-base ${bodyColor} ${
                            dark ? "border-[#2c4f7c]" : "border-[#9db4cc]"
                          }`}
                        >
                          {item.details.quote}
                        </span>
                        <span className="mt-4 flex flex-wrap gap-2">
                          {item.details.skills.map((skill, skillIndex) => (
                            <span
                              key={skill}
                              className={`border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-all duration-300 ${
                                dark
                                  ? "border-[#2c4f7c] bg-[#0a1f3d]/70 text-[#9fc6e8]"
                                  : "border-[#7a92a8] bg-white/70 text-[#2a4257]"
                              }`}
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                                transitionDelay:
                                  expandedItem === item.title ? `${skillIndex * 60}ms` : "0ms",
                                transform:
                                  expandedItem === item.title ? "translateY(0)" : "translateY(8px)",
                                opacity: expandedItem === item.title ? 1 : 0,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ) : (
                <li key={item.title} className="max-w-xl">
                  <p className={`text-lg font-medium md:text-xl ${itemTitleColor}`}>{item.title}</p>
                  {item.desc ? (
                    <p className={`mt-1 text-sm leading-relaxed md:text-base ${bodyColor}`}>
                      {item.desc}
                    </p>
                  ) : null}
                </li>
              )
            )}
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
