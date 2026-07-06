"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, GoogleCalendarEvent, Task } from "@/lib/types";
import { getWeeks, toDateInputValue } from "@/lib/dates";
import { useFocusRefetch } from "@/lib/hooks/useFocusRefetch";
import { useTaskMutations } from "@/lib/hooks/useTaskMutations";
import { WeekCalendarView } from "@/components/tasks/WeekCalendarView";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { PromoteToAchievementModal } from "@/components/achievements/PromoteToAchievementModal";
import clsx from "clsx";

const WEEK_COUNT = 5;

export default function WeekPage() {
  const weeks = useMemo(() => getWeeks(new Date(), WEEK_COUNT), []);
  const rangeStart = toDateInputValue(weeks[0][0]);
  const lastWeek = weeks[weeks.length - 1];
  const rangeEnd = toDateInputValue(lastWeek[lastWeek.length - 1]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTask, setFormTask] = useState<Task | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [promotingTask, setPromotingTask] = useState<Task | null>(null);
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();
    const [{ data: taskData }, { data: categoryData }, { data: settings }] =
      await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .gte("due_date", rangeStart)
          .lte("due_date", rangeEnd)
          .order("due_date"),
        supabase.from("categories").select("*").order("sort_order"),
        supabase
          .from("user_settings")
          .select("show_google_calendar")
          .maybeSingle(),
      ]);
    setTasks((taskData as Task[]) ?? []);
    setCategories((categoryData as Category[]) ?? []);
    setShowGoogleCalendar(settings?.show_google_calendar ?? false);
    setLoading(false);
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    // fetchTasks is also reused by useFocusRefetch below; its setState calls
    // happen after an await, not synchronously during this effect's commit.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  useFocusRefetch(fetchTasks);

  const fetchGoogleEvents = useCallback(async () => {
    const res = await fetch(
      `/api/google-calendar?from=${rangeStart}&to=${rangeEnd}`,
    );
    const data = await res.json();
    setGoogleEvents(data.events ?? []);
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    if (!showGoogleCalendar) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoogleEvents();
  }, [showGoogleCalendar, fetchGoogleEvents]);

  async function toggleGoogleCalendar() {
    const next = !showGoogleCalendar;
    setShowGoogleCalendar(next);
    if (!next) setGoogleEvents([]);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("user_settings")
        .upsert({ id: user.id, show_google_calendar: next });
    }
  }

  const googleEventsByDate = useMemo(() => {
    const map = new Map<string, GoogleCalendarEvent[]>();
    for (const event of googleEvents) {
      const key = toDateInputValue(new Date(event.start));
      const existing = map.get(key) ?? [];
      existing.push(event);
      map.set(key, existing);
    }
    return map;
  }, [googleEvents]);

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const { changeStatus, toggleImportant, upsertLocal, removeLocal } =
    useTaskMutations(setTasks, setPromotingTask);

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-neutral-900">
          今後のタスク
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleGoogleCalendar}
            aria-pressed={showGoogleCalendar}
            className={clsx(
              "rounded-lg border px-3 py-1.5 text-sm font-medium",
              showGoogleCalendar
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-600",
            )}
          >
            Googleカレンダー{showGoogleCalendar ? "表示中" : "も表示"}
          </button>
          <button
            type="button"
            onClick={() => openNewTaskForm(toDateInputValue(new Date()))}
            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            + タスク追加
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">読み込み中...</p>
      ) : (
        <WeekCalendarView
          weeks={weeks}
          tasks={tasks}
          categoriesById={categoriesById}
          googleEventsByDate={googleEventsByDate}
          onStatusChange={changeStatus}
          onImportantChange={toggleImportant}
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
