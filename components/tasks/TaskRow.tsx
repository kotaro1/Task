import { Category, Task, TaskStatus } from "@/lib/types";
import { TaskStatusToggle } from "./TaskStatusToggle";
import { CategoryChip } from "./CategoryChip";
import clsx from "clsx";

export function TaskRow({
  task,
  category,
  onStatusChange,
  onClick,
}: {
  task: Task;
  category: Category | null;
  onStatusChange: (next: TaskStatus) => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-1.5 py-1 hover:border-neutral-300"
    >
      <p
        className={clsx(
          "line-clamp-3 break-words text-xs font-medium leading-snug text-neutral-900",
          task.status === "done" && "text-neutral-400 line-through",
        )}
      >
        {task.title}
      </p>
      <div className="mt-1 flex items-center gap-1">
        <CategoryChip category={category} />
        <TaskStatusToggle status={task.status} onNext={onStatusChange} />
      </div>
    </div>
  );
}
