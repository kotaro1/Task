"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { SignOutButton } from "./SignOutButton";

const ITEMS = [
  { href: "/week", label: "週" },
  { href: "/tasks", label: "長期" },
  { href: "/achievements", label: "実績" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-neutral-200 bg-white md:sticky md:top-0 md:h-screen md:w-48 md:flex-col md:border-r md:border-t-0">
      <div className="px-4 py-4 hidden md:block">
        <p className="text-sm font-semibold text-neutral-900">タスク管理</p>
      </div>
      {ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium md:flex-none md:items-start md:px-4 md:text-sm",
              active
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-600",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <SignOutButton />
    </nav>
  );
}
