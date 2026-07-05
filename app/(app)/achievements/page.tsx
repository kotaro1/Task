"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Achievement } from "@/lib/types";
import { useFocusRefetch } from "@/lib/hooks/useFocusRefetch";
import { AchievementCard } from "@/components/achievements/AchievementCard";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .order("achieved_at", { ascending: false });
    setAchievements((data as Achievement[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // fetchAchievements is also reused by useFocusRefetch below; its setState
    // calls happen after an await, not synchronously during this effect's commit.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAchievements();
  }, [fetchAchievements]);

  useFocusRefetch(fetchAchievements);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">実績ログ</h1>
        <Link
          href="/achievements/new"
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          + 実績追加
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">読み込み中...</p>
      ) : achievements.length === 0 ? (
        <p className="text-sm text-neutral-400">
          まだ実績がありません。タスクを達成するか、直接追加してみましょう。
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {achievements.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </div>
      )}
    </div>
  );
}
