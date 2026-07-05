import { Category } from "@/lib/types";

export function CategoryChip({ category }: { category: Category | null }) {
  if (!category) return null;

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: category.color ?? "#737373" }}
    >
      {category.name}
    </span>
  );
}
