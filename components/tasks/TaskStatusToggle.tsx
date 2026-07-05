import { TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "@/lib/types";
import clsx from "clsx";

const EMOJI: Record<TaskStatus, string> = {
  not_started: "⚪",
  in_progress: "🟡",
  done: "✅",
};

const STYLES: Record<TaskStatus, string> = {
  not_started: "bg-neutral-100 border-neutral-300",
  in_progress: "bg-amber-50 border-amber-300",
  done: "bg-emerald-50 border-emerald-300",
};

export function TaskStatusToggle({
  status,
  onNext,
}: {
  status: TaskStatus;
  onNext: (next: TaskStatus) => void;
}) {
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    const currentIndex = TASK_STATUS_ORDER.indexOf(status);
    const next = TASK_STATUS_ORDER[(currentIndex + 1) % TASK_STATUS_ORDER.length];
    onNext(next);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={TASK_STATUS_LABELS[status]}
      aria-label={TASK_STATUS_LABELS[status]}
      className={clsx(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none transition-colors",
        STYLES[status],
      )}
    >
      {EMOJI[status]}
    </button>
  );
}
