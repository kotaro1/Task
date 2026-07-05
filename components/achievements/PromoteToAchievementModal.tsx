"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Achievement, Task } from "@/lib/types";
import { AchievementForm } from "./AchievementForm";

export function PromoteToAchievementModal({
  task,
  onClose,
  onSaved,
}: {
  task: Task | null;
  onClose: () => void;
  onSaved: (achievement: Achievement) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  if (!task) return null;

  return (
    <Modal open={!!task} onClose={onClose}>
      <h2 className="mb-2 text-lg font-semibold text-neutral-900">
        「{task.title}」達成おめでとうございます 🎉
      </h2>
      {!showForm ? (
        <>
          <p className="mb-4 text-sm text-neutral-500">
            この達成を実績ログに残しますか？
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
            >
              実績に追加する
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700"
            >
              そのままにする
            </button>
          </div>
        </>
      ) : (
        <AchievementForm
          sourceTaskId={task.id}
          initialTitle={task.title}
          initialDescription={task.description ?? ""}
          onSaved={onSaved}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
