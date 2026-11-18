import { ReactNode } from "react";

interface NoticeProps {
  tone?: "error" | "info";
  title?: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function Notice({
  tone = "error",
  title,
  children,
  actionLabel,
  onAction,
}: NoticeProps) {
  const palette =
    tone === "error"
      ? "border-high/40 bg-high-soft text-high"
      : "border-line bg-band text-ink";
  return (
    <div
      role={tone === "error" ? "alert" : "note"}
      className={`flex flex-wrap items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm ${palette}`}
    >
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className={title ? "mt-0.5" : ""}>{children}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-secondary btn-sm shrink-0 !text-ink"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
