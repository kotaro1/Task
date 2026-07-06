import { Category, Task, TaskStatus } from "@/lib/types";
import { formatJpDay, formatWeekRangeJp, isSameDay, toDateInputValue } from "@/lib/dates";
import { TaskRow } from "./TaskRow";
import clsx from "clsx";

export function WeekCalendarView({
  weeks,
  tasks,
  categoriesById,
  onStatusChange,
  onImportantChange,
  onTaskClick,
  onAddTask,
}: {
  weeks: Date[][];
  tasks: Task[];
  categoriesById: Map<string, Category>;
  onStatusChange: (task: Task, next: TaskStatus) => void;
  onImportantChange: (task: Task, next: boolean) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (dueDate: string) => void;
}) {
  const today = new Date();
  const todayValue = toDateInputValue(today);

  return (
    <div className="flex flex-col gap-4">
      {weeks.map((weekDays) => (
        <div key={toDateInputValue(weekDays[0])}>
          <p className="mb-1 px-1 text-xs text-neutral-400">
            {formatWeekRangeJp(weekDays)}
          </p>
          <div className="grid grid-cols-1 gap-1.5 md:grid-cols-7">
            {weekDays.map((day) => {
              const dayTasks = tasks.filter(
                (t) => t.due_date && isSameDay(t.due_date, day),
              );
              const dateValue = toDateInputValue(day);
              const isToday = dateValue === todayValue;
              const isPast = dateValue < todayValue;
              const dayOfWeek = day.getDay();

              return (
                <div
                  key={dateValue}
                  className={clsx(
                    "flex flex-col gap-1 rounded-xl border p-1",
                    isToday && "border-2 border-neutral-900 bg-neutral-50",
                    !isToday && isPast && "border-neutral-200 opacity-50",
                    !isToday &&
                      !isPast &&
                      dayOfWeek === 6 &&
                      "border-sky-200 bg-sky-50",
                    !isToday &&
                      !isPast &&
                      dayOfWeek === 0 &&
                      "border-red-200 bg-red-50",
                    !isToday &&
                      !isPast &&
                      dayOfWeek !== 6 &&
                      dayOfWeek !== 0 &&
                      "border-neutral-200",
                  )}
                >
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-neutral-700">
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
                  <div className="flex flex-col gap-1">
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
                        onImportantChange={(next) =>
                          onImportantChange(task, next)
                        }
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
        </div>
      ))}
    </div>
  );
}
