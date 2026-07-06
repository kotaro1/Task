import { Dispatch, SetStateAction } from "react";
import { createClient } from "@/lib/supabase/client";
import { Task, TaskStatus } from "@/lib/types";

export function useTaskMutations(
  setTasks: Dispatch<SetStateAction<Task[]>>,
  onBecameDone: (task: Task) => void,
) {
  async function changeStatus(task: Task, next: TaskStatus) {
    const wasDone = task.status === "done";
    const previous = task;

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)),
    );

    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: next,
        completed_at: next === "done" ? new Date().toISOString() : null,
      })
      .eq("id", task.id)
      .select()
      .single();

    if (error || !data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? previous : t)),
      );
      return;
    }

    const updated = data as Task;
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

    if (next === "done" && !wasDone) {
      onBecameDone(updated);
    }
  }

  async function toggleImportant(task: Task, next: boolean) {
    const previous = task;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_important: next } : t)),
    );

    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update({ is_important: next })
      .eq("id", task.id)
      .select()
      .single();

    if (error || !data) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? previous : t)));
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? (data as Task) : t)),
    );
  }

  function upsertLocal(task: Task) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      return exists
        ? prev.map((t) => (t.id === task.id ? task : t))
        : [...prev, task];
    });
  }

  function removeLocal(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  return { changeStatus, toggleImportant, upsertLocal, removeLocal };
}
