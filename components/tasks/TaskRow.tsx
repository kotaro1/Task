import { Category, Task, TaskStatus } from "@/lib/types";
import { TaskStatusToggle } from "./TaskStatusToggle";
import { CategoryChip } from "./CategoryChip";
import { ImportantToggle } from "./ImportantToggle";
import clsx from "clsx";

export function TaskRow({
  task,
  category,
  onStatusChange,
  onImportantChange,
  onClick,
}: {
  task: Task;
  category: Category | null;
  onStatusChange: (next: TaskStatus) => void;
  onImportantChange: (next: boolean) => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "cursor-pointer rounded-lg border bg-white px-1.5 py-1 hover:border-neutral-400",
        task.is_deadline
          ? "border-dashed border-neutral-400"
          : "border-solid border-neutral-200",
      )}
    >
      <p
        className={clsx(
          "break-words text-xs font-medium leading-snug text-neutral-900",
          task.status === "done" && "text-neutral-400 line-through",
        )}
      >
        {task.title}{" "}
        <span className="inline-flex items-center gap-0.5 align-middle">
          <ImportantToggle
            isImportant={task.is_important}
            onToggle={onImportantChange}
          />
          <CategoryChip category={category} />
          <TaskStatusToggle status={task.status} onNext={onStatusChange} />
        </span>
      </p>
    </div>
  );
}
