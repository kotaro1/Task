"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";

const BUCKET = "backgrounds";

export function SettingsManager() {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [icsUrl, setIcsUrl] = useState<string | null>(null);
  const [icsInput, setIcsInput] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("user_settings")
      .select("background_image_path, google_calendar_ics_url")
      .maybeSingle()
      .then(({ data }) => {
        setImagePath(data?.background_image_path ?? null);
        setIcsUrl(data?.google_calendar_ics_url ?? null);
        setIcsInput(data?.google_calendar_ics_url ?? "");
      });
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
  }

  async function handleRemoveBackground() {
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
  }

  async function handleSaveIcsUrl() {
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
    const trimmed = icsInput.trim();
    const { error: upsertError } = await supabase
      .from("user_settings")
      .upsert({ id: user.id, google_calendar_ics_url: trimmed || null });
    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setIcsUrl(trimmed || null);
  }

  async function handleDisconnectCalendar() {
    setIcsInput("");
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    await supabase
      .from("user_settings")
      .upsert({ id: user.id, google_calendar_ics_url: null });
    setSaving(false);
    setIcsUrl(null);
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
        title="設定"
        aria-label="設定"
        className="fixed bottom-16 right-2 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-sm shadow-sm md:bottom-2 md:right-2"
      >
        ⚙️
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">設定</h2>

        <section className="mb-5">
          <h3 className="mb-1 text-sm font-semibold text-neutral-700">
            背景画像
          </h3>
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
          {imagePath && (
            <button
              type="button"
              onClick={handleRemoveBackground}
              disabled={saving}
              className="mt-2 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600"
            >
              背景を削除
            </button>
          )}
        </section>

        <section className="mb-2">
          <h3 className="mb-1 text-sm font-semibold text-neutral-700">
            Googleカレンダー連携
          </h3>
          <p className="mb-2 text-xs text-neutral-500">
            Googleカレンダーの設定 →
            対象のカレンダー→「カレンダーの統合」→「非公開URL（iCal形式）」をコピーして貼り付けてください。
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={icsInput}
              onChange={(e) => setIcsInput(e.target.value)}
              placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSaveIcsUrl}
              disabled={saving}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              保存
            </button>
            {icsUrl && (
              <button
                type="button"
                onClick={handleDisconnectCalendar}
                disabled={saving}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600"
              >
                連携を解除
              </button>
            )}
          </div>
          {icsUrl && (
            <p className="mt-1 text-xs text-emerald-600">連携中です</p>
          )}
        </section>

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700"
        >
          閉じる
        </button>
      </Modal>
    </>
  );
}
