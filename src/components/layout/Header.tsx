import { Bell, Settings } from "lucide-react";

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  showBell?: boolean;
  showSettings?: boolean;
  onSettingsClick?: () => void;
}

export function Header({
  title,
  showLogo = false,
  showBell = false,
  showSettings = false,
  onSettingsClick,
}: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between px-5">
      {showLogo ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[20px] font-bold tracking-tight text-primary">
            BUDDI.
          </span>
          <span className="whitespace-nowrap rounded-md bg-[#E8F5EE] px-1.5 py-0.5 text-[11px] font-semibold text-success">
            웰니스
          </span>
        </div>
      ) : (
        <h1 className="text-[20px] font-bold text-text-primary">{title}</h1>
      )}

      <div className="flex items-center gap-1">
        {showBell && (
          <button
            type="button"
            aria-label="알림"
            className="flex h-11 w-11 items-center justify-center text-text-secondary"
          >
            <Bell size={22} strokeWidth={1.8} />
          </button>
        )}
        {showSettings && (
          <button
            type="button"
            aria-label="프로필 편집"
            onClick={onSettingsClick}
            className="flex h-11 w-11 items-center justify-center text-text-secondary"
          >
            <Settings size={22} strokeWidth={1.8} />
          </button>
        )}
        {!showLogo && !showSettings && (
          <span className="whitespace-nowrap rounded-md bg-[#E8F5EE] px-1.5 py-0.5 text-[11px] font-semibold text-success">
            웰니스
          </span>
        )}
      </div>
    </header>
  );
}
