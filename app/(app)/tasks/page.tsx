"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category, Task, TaskScale } from "@/lib/types";
import { useFocusRefetch } from "@/lib/hooks/useFocusRefetch";
import { useTaskMutations } from "@/lib/hooks/useTaskMutations";
import { TaskScaleList } from "@/components/tasks/TaskScaleList";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { PromoteToAchievementModal } from "@/components/achievements/PromoteToAchievementModal";

const LONG_SCALES: TaskScale[] = ["month", "year", "school", "life"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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
        .eq("status", "not_started")
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

  // Once a task's status moves off "not_started" it drops out of this backlog
  // view (this page is for not-yet-started long-term goals only), so remove
  // it locally instead of re-filtering into the not_started-only fetch above.
  const { changeStatus, upsertLocal, removeLocal } = useTaskMutations(
    setTasks,
    setPromotingTask,
  );

  function handleStatusChange(task: Task, next: Task["status"]) {
    changeStatus(task, next);
    if (next !== "not_started") removeLocal(task.id);
  }

  function handleSaved(task: Task) {
    if (!LONG_SCALES.includes(task.scale) || task.status !== "not_started") {
      removeLocal(task.id);
      return;
    }
    upsertLocal(task);
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
          長期タスク（未着手）
        </h1>
        <button
          type="button"
          onClick={openNewTaskForm}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          + タスク追加
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">読み込み中...</p>
      ) : (
        <TaskScaleList
          tasks={tasks}
          categoriesById={categoriesById}
          onStatusChange={handleStatusChange}
          onTaskClick={openEditForm}
        />
      )}

      {formOpen && (
        <TaskFormModal
          key={formTask?.id ?? "new"}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
          onDeleted={removeLocal}
          task={formTask}
          defaultScale="month"
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
