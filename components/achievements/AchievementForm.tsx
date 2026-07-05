"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Achievement } from "@/lib/types";

function toDateTimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function AchievementForm({
  sourceTaskId = null,
  initialTitle = "",
  initialDescription = "",
  onSaved,
  onCancel,
}: {
  sourceTaskId?: string | null;
  initialTitle?: string;
  initialDescription?: string;
  onSaved: (achievement: Achievement) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [achievedAt, setAchievedAt] = useState(
    toDateTimeLocalValue(new Date().toISOString()),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("ログインが必要です");
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("achievements")
      .insert({
        user_id: user.id,
        source_task_id: sourceTaskId,
        title: title.trim(),
        description: description.trim() || null,
        achieved_at: new Date(achievedAt).toISOString(),
      })
      .select()
      .single();

    if (insertError || !inserted) {
      setSaving(false);
      setError(insertError?.message ?? "保存に失敗しました");
      return;
    }

    let achievement = inserted as Achievement;

    if (imageFile) {
      const path = `${user.id}/${achievement.id}/${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("achievement-images")
        .upload(path, imageFile, { upsert: true });

      if (!uploadError) {
        const { data: updated, error: updateError } = await supabase
          .from("achievements")
          .update({ image_path: path })
          .eq("id", achievement.id)
          .select()
          .single();
        if (!updateError && updated) {
          achievement = updated as Achievement;
        }
      }
    }

    setSaving(false);
    onSaved(achievement);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        autoFocus
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
      />
      <input
        type="datetime-local"
        value={achievedAt}
        onChange={(e) => setAchievedAt(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="説明（任意）"
        rows={3}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
      />
      <div>
        <label className="mb-1 block text-xs text-neutral-500">
          画像（任意）
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "保存中..." : "実績に保存"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
