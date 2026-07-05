"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Category,
  Task,
  TaskScale,
  TASK_SCALE_LABELS,
} from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { toDateInputValue } from "@/lib/dates";

const SCALES: TaskScale[] = ["day", "week", "year", "school", "life"];

export function TaskFormModal({
  onClose,
  onSaved,
  onDeleted,
  task,
  defaultScale = "day",
  defaultDueDate,
}: {
  onClose: () => void;
  onSaved: (task: Task) => void;
  onDeleted?: (taskId: string) => void;
  task?: Task | null;
  defaultScale?: TaskScale;
  defaultDueDate?: string;
}) {
  // The parent mounts a fresh instance (via `key`) each time the modal opens
  // for a different task, so initial state can just read from props directly.
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [scale, setScale] = useState<TaskScale>(task?.scale ?? defaultScale);
  const [categoryId, setCategoryId] = useState<string>(task?.category_id ?? "");
  const [dueDate, setDueDate] = useState<string>(
    task?.due_date ?? defaultDueDate ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");

    const supabase = createClient();
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      scale,
      category_id: categoryId || null,
      due_date: dueDate || null,
    };

    if (task) {
      const { data, error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", task.id)
        .select()
        .single();
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
      onSaved(data as Task);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSaving(false);
        setError("ログインが必要です");
        return;
      }
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
      onSaved(data as Task);
    }
    onClose();
  }

  async function handleDelete() {
    if (!task) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    onDeleted?.(task.id);
    onClose();
  }

  return (
    <Modal open onClose={onClose}>
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">
        {task ? "タスクを編集" : "タスクを追加"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          autoFocus
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明（任意）"
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />

        <div className="flex gap-2">
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value as TaskScale)}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          >
            {SCALES.map((s) => (
              <option key={s} value={s}>
                {TASK_SCALE_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          >
            <option value="">分類なし</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">
            期日（任意。日/週スケールは週ビューに表示するため設定推奨）
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          {!dueDate && (
            <button
              type="button"
              onClick={() => setDueDate(toDateInputValue(new Date()))}
              className="mt-1 text-xs text-neutral-500 underline"
            >
              今日を設定
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          {task && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600"
            >
              削除
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
