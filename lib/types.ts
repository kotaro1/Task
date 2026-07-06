export type TaskScale = "day" | "week" | "month" | "year" | "school" | "life";
export type TaskStatus = "not_started" | "in_progress" | "done";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  color: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scale: TaskScale;
  status: TaskStatus;
  category_id: string | null;
  due_date: string | null; // YYYY-MM-DD
  is_deadline: boolean; // true = "do by this date", false = "do on this date"
  is_important: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  source_task_id: string | null;
  title: string;
  achieved_at: string;
  description: string | null;
  image_path: string | null;
  created_at: string;
};

export const TASK_SCALE_LABELS: Record<TaskScale, string> = {
  day: "日",
  week: "週",
  month: "月",
  year: "年",
  school: "在学中",
  life: "人生",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "未着手",
  in_progress: "実行中",
  done: "達成",
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "not_started",
  "in_progress",
  "done",
];

export type UserSettings = {
  id: string;
  background_image_path: string | null;
  updated_at: string;
};

export const DEFAULT_CATEGORY_NAMES = [
  "勉強系",
  "その他雑用",
  "他人関係",
  "イベント",
] as const;
