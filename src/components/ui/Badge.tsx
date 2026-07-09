interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "accent" | "neutral";
  className?: string;
}

const variantStyles = {
  primary: "bg-primary-light text-primary",
  success: "bg-[#E8F5EE] text-success",
  accent: "bg-[#FFF0EA] text-accent",
  neutral: "bg-[#F0F0F5] text-text-secondary",
} as const;

export function Badge({
  children,
  variant = "primary",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
