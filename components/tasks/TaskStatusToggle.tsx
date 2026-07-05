import { TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "@/lib/types";
import clsx from "clsx";

const STYLES: Record<TaskStatus, string> = {
  not_started: "bg-neutral-100 text-neutral-500 border-neutral-300",
  in_progress: "bg-amber-100 text-amber-700 border-amber-300",
  done: "bg-emerald-100 text-emerald-700 border-emerald-300",
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
      className={clsx(
        "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        STYLES[status],
      )}
    >
      {TASK_STATUS_LABELS[status]}
    </button>
  );
}
