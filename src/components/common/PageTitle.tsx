import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  badge?: number;
  className?: string;
}

export default function PageTitle({
  title,
  icon,
  action,
  badge,
  className,
}: PageTitleProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6", className)}>
      <div className="flex items-center">
        {icon && <div className="mr-2 text-gray-700">{icon}</div>}
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {badge !== undefined && (
          <span className="ml-2 bg-gray-200 text-gray-700 text-sm px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {action && <div className="flex flex-col sm:flex-row gap-3">{action}</div>}
    </div>
  );
}
