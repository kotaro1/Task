"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Achievement } from "@/lib/types";
import { formatDateTimeJp } from "@/lib/dates";

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!achievement.image_path) return;
    let cancelled = false;
    const supabase = createClient();
    supabase.storage
      .from("achievement-images")
      .createSignedUrl(achievement.image_path, 3600)
      .then(({ data }) => {
        if (!cancelled) setImageUrl(data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [achievement.image_path]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-400">
            {formatDateTimeJp(achievement.achieved_at)}
          </p>
          <h3 className="text-base font-semibold text-neutral-900">
            {achievement.title}
          </h3>
        </div>
      </div>
      {achievement.description && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">
          {achievement.description}
        </p>
      )}
      {imageUrl && (
        <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg bg-neutral-100">
          <Image
            src={imageUrl}
            alt={achievement.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
