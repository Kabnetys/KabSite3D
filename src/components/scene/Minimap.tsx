import { DISTRICTS, getActiveDistrictIndex } from "@/lib/districts";
import { PALETTE } from "@/lib/palette";

interface MinimapProps {
  scrollProgress: number;
  onSelect: (slug: string) => void;
}

const MINIMAP_WIDTH = 140;
const MINIMAP_HEIGHT = 220;

function toMinimapCoords(index: number, total: number) {
  const margin = 20;
  const usable = MINIMAP_HEIGHT - margin * 2;
  const y = margin + (usable * index) / (total - 1);
  const wave = index % 2 === 0 ? -1 : 1;
  const x = MINIMAP_WIDTH / 2 + wave * 24;
  return { x, y };
}

export function Minimap({ scrollProgress, onSelect }: MinimapProps) {
  const activeIndex = getActiveDistrictIndex(scrollProgress);
  const points = DISTRICTS.map((district, index) => ({
    district,
    index,
    ...toMinimapCoords(index, DISTRICTS.length),
  }));

  return (
    <nav
      aria-label="Navigation de la cite KabNetys"
      className="pointer-events-auto fixed right-4 top-1/2 z-30 -translate-y-1/2 rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-md"
      style={{ width: MINIMAP_WIDTH + 24 }}
    >
      <svg
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
        role="presentation"
      >
        {points.slice(1).map((point, i) => {
          const prev = points[i];
          return (
            <line
              key={`edge-${point.index}`}
              x1={prev.x}
              y1={prev.y}
              x2={point.x}
              y2={point.y}
              stroke={PALETTE.neon}
              strokeOpacity={0.5}
              strokeWidth={2}
            />
          );
        })}
        {points.map((point) => {
          const isActive = point.index === activeIndex;
          return (
            <circle
              key={point.district.id}
              cx={point.x}
              cy={point.y}
              r={isActive ? 7 : 4.5}
              fill={isActive ? PALETTE.glow : PALETTE.primary}
              stroke={PALETTE.text}
              strokeOpacity={isActive ? 0.8 : 0.2}
              strokeWidth={isActive ? 2 : 1}
            />
          );
        })}
      </svg>
      <ul className="mt-2 flex flex-col gap-1">
        {DISTRICTS.map((district, index) => (
          <li key={district.id}>
            <button
              type="button"
              onClick={() => onSelect(district.slug)}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                index === activeIndex
                  ? "bg-[#00b4ff]/20 text-[#e8f4ff]"
                  : "text-[#e8f4ff]/60 hover:text-[#e8f4ff]"
              }`}
            >
              {district.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
