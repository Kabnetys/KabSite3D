import { DISTRICTS } from "@/lib/districts";

interface TextVersionProps {
  onClose?: () => void;
}

export function TextVersion({ onClose }: TextVersionProps) {
  return (
    <div className="min-h-screen bg-[#040d1a] px-6 py-16 text-[#e8f4ff]">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">KabNetys</h1>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[#1565c0] px-4 py-2 text-sm hover:bg-[#1565c0]/20"
            >
              Retour a la version 3D
            </button>
          ) : null}
        </div>
        <ul className="flex flex-col gap-6">
          {DISTRICTS.map((district) => (
            <li key={district.id} id={district.slug} className="border-b border-white/10 pb-6">
              <a href={`#${district.slug}`} className="text-lg font-medium text-[#00e5ff]">
                {district.label}
              </a>
              <p className="mt-2 text-sm text-[#e8f4ff]/70">{district.placeholder}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
