interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-3 flex items-center justify-between ${className}`}>
      <h2 className="text-[17px] font-semibold text-text-primary">{title}</h2>
      {action}
    </div>
  );
}
