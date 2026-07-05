import {
  Category,
  Task,
  TaskStatus,
  TASK_STATUS_LABELS,
  TASK_STATUS_ORDER,
} from "@/lib/types";
import { TaskRow } from "./TaskRow";

export function TaskScaleList({
  tasks,
  categoriesById,
  onStatusChange,
  onTaskClick,
}: {
  tasks: Task[];
  categoriesById: Map<string, Category>;
  onStatusChange: (task: Task, next: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {TASK_STATUS_ORDER.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="flex flex-col gap-2">
            <h2 className="px-1 text-sm font-semibold text-neutral-700">
              {TASK_STATUS_LABELS[status]}
              <span className="ml-1 text-neutral-400">
                ({columnTasks.length})
              </span>
            </h2>
            <div className="flex flex-col gap-1.5">
              {columnTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  category={
                    task.category_id
                      ? (categoriesById.get(task.category_id) ?? null)
                      : null
                  }
                  onStatusChange={(next) => onStatusChange(task, next)}
                  onClick={() => onTaskClick(task)}
                />
              ))}
              {columnTasks.length === 0 && (
                <p className="px-1 text-xs text-neutral-300">タスクなし</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
