import Image from "next/image";
import type { StoreItem } from "@/lib/types";

interface StoreItemThumbnailProps {
  item: Pick<StoreItem, "name" | "imageUrl" | "emoji">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-16 w-16 text-2xl",
  md: "h-20 w-20 text-3xl",
  lg: "aspect-square w-full text-5xl",
};

export function StoreItemThumbnail({
  item,
  size = "md",
  className = "",
}: StoreItemThumbnailProps) {
  const base = `relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-light ${sizeClasses[size]} ${className}`;

  if (item.imageUrl) {
    return (
      <div className={base}>
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          unoptimized
          sizes="160px"
        />
      </div>
    );
  }

  return (
    <div className={base} aria-hidden>
      {item.emoji ?? "🎁"}
    </div>
  );
}
