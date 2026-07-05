"use client";

import { useRouter } from "next/navigation";
import { AchievementForm } from "@/components/achievements/AchievementForm";

export default function NewAchievementPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-lg font-semibold text-neutral-900">
        実績を追加
      </h1>
      <AchievementForm
        onSaved={() => router.push("/achievements")}
        onCancel={() => router.push("/achievements")}
      />
    </div>
  );
}
