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
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:border-neutral-300"
    >
      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            "truncate text-sm font-medium text-neutral-900",
            task.status === "done" && "text-neutral-400 line-through",
          )}
        >
          {task.title}
        </p>
        {category && (
          <div className="mt-1">
            <CategoryChip category={category} />
          </div>
        )}
      </div>
      <TaskStatusToggle status={task.status} onNext={onStatusChange} />
    </div>
  );
}
