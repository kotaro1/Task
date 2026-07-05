"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, Task, TaskScale, TASK_SCALE_LABELS } from "@/lib/types";
import { useFocusRefetch } from "@/lib/hooks/useFocusRefetch";
import { useTaskMutations } from "@/lib/hooks/useTaskMutations";
import { TaskScaleList } from "@/components/tasks/TaskScaleList";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { PromoteToAchievementModal } from "@/components/achievements/PromoteToAchievementModal";
import clsx from "clsx";

const LONG_SCALES: TaskScale[] = ["year", "school", "life"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScales, setActiveScales] = useState<TaskScale[]>(LONG_SCALES);
  const [formTask, setFormTask] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [promotingTask, setPromotingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();
    const [{ data: taskData }, { data: categoryData }] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .in("scale", LONG_SCALES)
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    setTasks((taskData as Task[]) ?? []);
    setCategories((categoryData as Category[]) ?? []);
    setLoading(false);
  }, []);

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

  const visibleTasks = tasks.filter((t) => activeScales.includes(t.scale));

  function toggleScale(scale: TaskScale) {
    setActiveScales((prev) =>
      prev.includes(scale)
        ? prev.filter((s) => s !== scale)
        : [...prev, scale],
    );
  }

  function openNewTaskForm() {
    setFormTask(null);
    setFormOpen(true);
  }

  function openEditForm(task: Task) {
    setFormTask(task);
    setFormOpen(true);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">
          長期スケールのタスク
        </h1>
        <button
          type="button"
          onClick={openNewTaskForm}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          + タスク追加
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {LONG_SCALES.map((scale) => (
          <button
            key={scale}
            type="button"
            onClick={() => toggleScale(scale)}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium",
              activeScales.includes(scale)
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-500",
            )}
          >
            {TASK_SCALE_LABELS[scale]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">読み込み中...</p>
      ) : (
        <TaskScaleList
          tasks={visibleTasks}
          categoriesById={categoriesById}
          onStatusChange={changeStatus}
          onTaskClick={openEditForm}
        />
      )}

      {formOpen && (
        <TaskFormModal
          key={formTask?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={upsertLocal}
          onDeleted={removeLocal}
          task={formTask}
          defaultScale="year"
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
