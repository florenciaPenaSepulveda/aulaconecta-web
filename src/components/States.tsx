import { ReactNode } from "react";

export const Spinner = ({ label = "Cargando..." }: { label?: string }) => (
  <div className="flex items-center justify-center gap-3 py-12 text-base-content/70">
    <span className="loading loading-spinner loading-md text-primary" />
    <span className="text-sm">{label}</span>
  </div>
);

interface EmptyProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyProps) => (
  <div className="flex flex-col items-center gap-2 rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
    <p className="text-base font-semibold text-neutral">{title}</p>
    {description && <p className="max-w-md text-sm text-base-content/70">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const ErrorState = ({ message }: { message: string }) => (
  <div role="alert" className="alert alert-error text-sm">
    <span>{message}</span>
  </div>
);
