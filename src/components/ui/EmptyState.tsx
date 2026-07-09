interface EmptyStateProps {
  message: string;
  onRetry?: () => void;
}

export function EmptyState({ message, onRetry }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface px-5 py-10 text-center shadow-[var(--shadow-card)]">
      <p className="text-[14px] text-text-secondary">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex h-11 items-center justify-center rounded-full bg-primary px-5 text-[14px] font-semibold text-white"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
