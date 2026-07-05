"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="hidden text-xs text-neutral-400 hover:text-neutral-600 md:mt-auto md:block md:px-2 md:pb-4 md:text-center"
    >
      ログアウト
    </button>
  );
}
