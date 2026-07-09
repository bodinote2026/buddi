interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({
  label,
  active = false,
  onClick,
  className = "",
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center rounded-full px-4 text-[13px] font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-surface text-text-secondary shadow-[var(--shadow-card)]"
      } ${className}`}
    >
      {label}
    </button>
  );
}
