import {
  Category,
  Task,
  TaskScale,
  TaskStatus,
  TASK_SCALE_LABELS,
} from "@/lib/types";
import { TaskRow } from "./TaskRow";

const COLUMN_SCALES: TaskScale[] = ["month", "year", "school", "life"];

export function TaskScaleList({
  tasks,
  categoriesById,
  onStatusChange,
  onImportantChange,
  onTaskClick,
}: {
  tasks: Task[];
  categoriesById: Map<string, Category>;
  onStatusChange: (task: Task, next: TaskStatus) => void;
  onImportantChange: (task: Task, next: boolean) => void;
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {COLUMN_SCALES.map((scale) => {
        const columnTasks = tasks.filter((t) => t.scale === scale);
        return (
          <div key={scale} className="flex flex-col gap-2">
            <h2 className="px-1 text-sm font-semibold text-neutral-700">
              {TASK_SCALE_LABELS[scale]}
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
                  onImportantChange={(next) => onImportantChange(task, next)}
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
