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
        "relative cursor-pointer rounded-lg border bg-white py-1 pl-1.5 pr-1 hover:border-neutral-400",
        task.is_deadline
          ? "border-neutral-200 border-l-[3px] border-l-amber-500"
          : "border-neutral-200",
      )}
    >
      <p
        className={clsx(
          "break-words pb-4 text-xs font-medium leading-snug text-neutral-900",
          task.status === "done" && "text-neutral-400 line-through",
        )}
      >
        {task.title}
      </p>
      <div className="absolute bottom-0 right-0 flex items-center gap-0.5 rounded-tl-md">
        <ImportantToggle
          isImportant={task.is_important}
          onToggle={onImportantChange}
        />
        <CategoryChip category={category} />
        <TaskStatusToggle status={task.status} onNext={onStatusChange} />
      </div>
    </div>
  );
}
