import { Category } from "@/lib/types";

export function CategoryChip({ category }: { category: Category | null }) {
  if (!category) return null;

  return (
    <span
      title={category.name}
      aria-label={category.name}
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: category.color ?? "#737373" }}
    >
      {category.name.slice(0, 1)}
    </span>
  );
}
