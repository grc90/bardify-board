interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-800 px-6 py-16 text-center">
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      <h3 className="text-base font-semibold text-neutral-100">{title}</h3>
      <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
