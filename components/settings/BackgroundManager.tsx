"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";

const BUCKET = "backgrounds";

export function BackgroundManager() {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("user_settings")
      .select("background_image_path")
      .maybeSingle()
      .then(({ data }) => setImagePath(data?.background_image_path ?? null));
  }, []);

  useEffect(() => {
    if (!imagePath) return;
    let cancelled = false;
    const supabase = createClient();
    supabase.storage
      .from(BUCKET)
      .createSignedUrl(imagePath, 3600)
      .then(({ data }) => {
        if (!cancelled) setImageUrl(data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [imagePath]);

  async function handleUpload(file: File) {
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

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/background.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setSaving(false);
      setError(uploadError.message);
      return;
    }

    const { error: upsertError } = await supabase
      .from("user_settings")
      .upsert({ id: user.id, background_image_path: path });
    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setImagePath(path);
    setOpen(false);
  }

  async function handleRemove() {
    setSaving(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    const { error: upsertError } = await supabase
      .from("user_settings")
      .upsert({ id: user.id, background_image_path: null });
    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setImagePath(null);
    setImageUrl(null);
    setOpen(false);
  }

  return (
    <>
      {imageUrl && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="背景を設定"
        aria-label="背景を設定"
        className="fixed bottom-16 right-2 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-sm shadow-sm md:bottom-2 md:right-2"
      >
        🖼️
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          背景画像
        </h2>
        <input
          type="file"
          accept="image/*"
          disabled={saving}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          className="w-full text-sm"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          {imagePath && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600"
            >
              背景を削除
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={saving}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700"
          >
            閉じる
          </button>
        </div>
      </Modal>
    </>
  );
}
