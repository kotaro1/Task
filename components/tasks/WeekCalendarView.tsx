import { Category, Task, TaskStatus } from "@/lib/types";
import { formatJpDay, isSameDay, toDateInputValue } from "@/lib/dates";
import { TaskRow } from "./TaskRow";
import clsx from "clsx";

export function WeekCalendarView({
  weekDays,
  tasks,
  categoriesById,
  onStatusChange,
  onTaskClick,
  onAddTask,
}: {
  weekDays: Date[];
  tasks: Task[];
  categoriesById: Map<string, Category>;
  onStatusChange: (task: Task, next: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (dueDate: string) => void;
}) {
  const today = new Date();

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
      {weekDays.map((day) => {
        const dayTasks = tasks.filter(
          (t) => t.due_date && isSameDay(t.due_date, day),
        );
        const dateValue = toDateInputValue(day);

        return (
          <div
            key={dateValue}
            className={clsx(
              "flex flex-col gap-2 rounded-xl border p-2",
              isSameDay(dateValue, today)
                ? "border-neutral-900 bg-neutral-50"
                : "border-neutral-200",
            )}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-neutral-700">
                {formatJpDay(day)}
              </span>
              <button
                type="button"
                onClick={() => onAddTask(dateValue)}
                className="rounded-full px-2 text-sm text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
              >
                +
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {dayTasks.map((task) => (
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
              {dayTasks.length === 0 && (
                <p className="px-1 text-xs text-neutral-300">タスクなし</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
