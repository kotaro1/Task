"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, Task } from "@/lib/types";
import { getWeekDays, toDateInputValue } from "@/lib/dates";
import { useFocusRefetch } from "@/lib/hooks/useFocusRefetch";
import { useTaskMutations } from "@/lib/hooks/useTaskMutations";
import { WeekCalendarView } from "@/components/tasks/WeekCalendarView";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { PromoteToAchievementModal } from "@/components/achievements/PromoteToAchievementModal";

export default function WeekPage() {
  const weekDays = useMemo(() => getWeekDays(new Date()), []);
  const rangeStart = toDateInputValue(weekDays[0]);
  const rangeEnd = toDateInputValue(weekDays[weekDays.length - 1]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTask, setFormTask] = useState<Task | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [promotingTask, setPromotingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();
    const [{ data: taskData }, { data: categoryData }] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .gte("due_date", rangeStart)
        .lte("due_date", rangeEnd)
        .order("due_date"),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    setTasks((taskData as Task[]) ?? []);
    setCategories((categoryData as Category[]) ?? []);
    setLoading(false);
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    // fetchTasks is also reused by useFocusRefetch below; its setState calls
    // happen after an await, not synchronously during this effect's commit.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  useFocusRefetch(fetchTasks);

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const { changeStatus, upsertLocal, removeLocal } = useTaskMutations(
    setTasks,
    setPromotingTask,
  );

  function openNewTaskForm(dueDate: string) {
    setFormTask(null);
    setFormDefaultDate(dueDate);
    setFormOpen(true);
  }

  function openEditForm(task: Task) {
    setFormTask(task);
    setFormDefaultDate(undefined);
    setFormOpen(true);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">
          今週のタスク
        </h1>
        <button
          type="button"
          onClick={() => openNewTaskForm(toDateInputValue(new Date()))}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          + タスク追加
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">読み込み中...</p>
      ) : (
        <WeekCalendarView
          weekDays={weekDays}
          tasks={tasks}
          categoriesById={categoriesById}
          onStatusChange={changeStatus}
          onTaskClick={openEditForm}
          onAddTask={openNewTaskForm}
        />
      )}

      {formOpen && (
        <TaskFormModal
          key={formTask?.id ?? `new-${formDefaultDate ?? ""}`}
          onClose={() => setFormOpen(false)}
          onSaved={upsertLocal}
          onDeleted={removeLocal}
          task={formTask}
          defaultScale="day"
          defaultDueDate={formDefaultDate}
        />
      )}

      <PromoteToAchievementModal
        task={promotingTask}
        onClose={() => setPromotingTask(null)}
        onSaved={() => setPromotingTask(null)}
      />
    </div>
  );
}
