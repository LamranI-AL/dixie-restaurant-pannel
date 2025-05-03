import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-3">
        {icon || <FolderOpen className="h-10 w-10 text-muted-foreground/60" />}
      </div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      {description && <p className="mb-6 text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
