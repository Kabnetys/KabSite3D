interface TextVersionToggleProps {
  onClick: () => void;
}

export function TextVersionToggle({ onClick }: TextVersionToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto fixed left-4 top-4 z-30 rounded-full border border-[#1565c0] bg-black/40 px-4 py-2 text-xs text-[#e8f4ff] backdrop-blur-md hover:bg-[#1565c0]/30"
    >
      Version texte
    </button>
  );
}
