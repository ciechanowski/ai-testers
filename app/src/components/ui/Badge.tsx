interface BadgeProps { count: number; }

export function Badge({ count }: BadgeProps) {
  if (count === 0) return null;
  return (
    <span data-testid="cart-badge" aria-live="polite" className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {count}
    </span>
  );
}
