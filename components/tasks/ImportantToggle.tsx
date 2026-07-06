export function ImportantToggle({
  isImportant,
  onToggle,
}: {
  isImportant: boolean;
  onToggle: (next: boolean) => void;
}) {
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    onToggle(!isImportant);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isImportant ? "重要" : "重要にする"}
      aria-label={isImportant ? "重要" : "重要にする"}
      className="flex h-5 w-5 shrink-0 items-center justify-center text-xs leading-none"
    >
      {isImportant ? "⭐" : "☆"}
    </button>
  );
}
