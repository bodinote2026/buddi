import Image from "next/image";
import { User } from "lucide-react";

type UserAvatarShape = "circle" | "square" | "rounded";

interface UserAvatarProps {
  src?: string | null;
  alt: string;
  shape?: UserAvatarShape;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

function hasAvatarSrc(src?: string | null): boolean {
  return Boolean(src?.trim());
}

function shapeClass(shape: UserAvatarShape): string {
  if (shape === "circle") return "rounded-full";
  if (shape === "rounded") return "rounded-2xl";
  return "rounded-none";
}

function AvatarPlaceholder({
  shape,
  className = "",
}: {
  shape: UserAvatarShape;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[#D8E2EE] ${shapeClass(shape)} ${className}`}
      aria-hidden={!className}
    >
      <User
        className="h-[42%] w-[42%] min-h-6 min-w-6 text-white"
        strokeWidth={1.75}
        aria-hidden
      />
    </div>
  );
}

export function UserAvatar({
  src,
  alt,
  shape = "circle",
  className = "",
  fill = false,
  priority = false,
  sizes,
}: UserAvatarProps) {
  const showImage = hasAvatarSrc(src);

  if (fill) {
    return (
      <div
        className={`absolute inset-0 overflow-hidden ${shapeClass(shape)} ${className}`}
      >
        {showImage ? (
          <Image
            src={src!.trim()}
            alt={alt}
            fill
            className="object-cover"
            unoptimized
            sizes={sizes}
            priority={priority}
          />
        ) : (
          <AvatarPlaceholder shape={shape} />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${shapeClass(shape)} ${className}`}
    >
      {showImage ? (
        <Image
          src={src!.trim()}
          alt={alt}
          fill
          className="object-cover"
          unoptimized
          sizes={sizes}
          priority={priority}
        />
      ) : (
        <AvatarPlaceholder shape={shape} />
      )}
    </div>
  );
}
