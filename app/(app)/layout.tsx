import { ReactNode } from "react";
import { BottomNav } from "@/components/nav/BottomNav";
import { BackgroundManager } from "@/components/settings/BackgroundManager";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <BackgroundManager />
      <BottomNav />
      <main className="flex-1 px-4 pb-20 pt-6 md:px-8 md:pb-8">
        {children}
      </main>
    </div>
  );
}
