import { cn } from "@/lib/utils";
import { resourceIcons, resourceLabels } from "../../lib/resource-icons";
import { formatDate } from "../../lib/date-utils";
import type { TimelineEntry as TimelineEntryType, TimelineResourceType } from "../../types/timeline";
import { ResourceDetail } from "../ResourceDetail/ResourceDetail";

interface TimelineEntryProps {
  readonly entry: TimelineEntryType;
}

const typeConfig: Record<
  TimelineResourceType,
  { icon: string; borderLeft: string; label: string; badge: string }
> = {
  encounter: {
    icon: "bg-blue-50 text-blue-600 border-blue-200",
    borderLeft: "border-l-blue-500",
    label: "text-blue-600",
    badge: "bg-blue-50 text-blue-700",
  },
  condition: {
    icon: "bg-coral-50 text-coral-600 border-coral-600/20",
    borderLeft: "border-l-coral-600",
    label: "text-coral-600",
    badge: "bg-coral-50 text-coral-600",
  },
  medication: {
    icon: "bg-teal-50 text-teal-600 border-teal-600/20",
    borderLeft: "border-l-teal-600",
    label: "text-teal-700",
    badge: "bg-teal-50 text-teal-700",
  },
  observation: {
    icon: "bg-violet-50 text-violet-600 border-violet-200",
    borderLeft: "border-l-violet-500",
    label: "text-violet-600",
    badge: "bg-violet-50 text-violet-700",
  },
  procedure: {
    icon: "bg-amber-50 text-amber-600 border-amber-200",
    borderLeft: "border-l-amber-500",
    label: "text-amber-700",
    badge: "bg-amber-50 text-amber-700",
  },
};

export function TimelineEntry({ entry }: TimelineEntryProps) {
  const Icon = resourceIcons[entry.type];
  const config = typeConfig[entry.type];

  return (
    <article className="grid grid-cols-[2.5rem_1fr] gap-3 py-3">
      <div className="flex justify-center">
        <span
          className={cn(
            "mt-1 inline-flex h-9 w-9 items-center justify-center rounded-md border",
            config.icon
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div
        className={cn(
          "rounded-xl border border-border border-l-4 bg-card p-4 shadow-sm transition-shadow duration-150 hover:shadow-md",
          config.borderLeft
        )}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className={cn("text-xs font-semibold uppercase tracking-wide", config.label)}>
              {resourceLabels[entry.type]}
            </p>
            <h3 className="mt-1 text-base font-semibold text-ink">{entry.title}</h3>
          </div>
          <time
            className="shrink-0 text-sm font-medium text-muted-foreground"
            dateTime={entry.date}
          >
            {formatDate(entry.date)}
          </time>
        </div>
        {entry.detail && (
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{entry.detail}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.status && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                config.badge
              )}
            >
              {entry.status}
            </span>
          )}
          {entry.values?.value !== undefined && (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
              {entry.values.value} {entry.values.unit}
            </span>
          )}
          {entry.endDate && (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Ends {formatDate(entry.endDate)}
            </span>
          )}
        </div>
        <ResourceDetail resource={entry.resource} />
      </div>
    </article>
  );
}
