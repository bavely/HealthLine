import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { resourceIcons, resourceLabels } from "../../lib/resource-icons";
import { useFilterStore } from "../../store/filter-store";
import { useTimelineStore } from "../../store/timeline-store";
import type { TimelineResourceType } from "../../types/timeline";
import { Button } from "@/components/ui/button";

const resourceTypes = Object.keys(resourceLabels) as TimelineResourceType[];

const typeActiveStyle: Record<TimelineResourceType, string> = {
  encounter: "border-blue-500 bg-blue-50 text-blue-800",
  condition: "border-coral-600 bg-coral-50 text-coral-600",
  medication: "border-teal-600 bg-teal-50 text-teal-800",
  observation: "border-violet-500 bg-violet-50 text-violet-800",
  procedure: "border-amber-500 bg-amber-50 text-amber-800",
};

const typeIconStyle: Record<TimelineResourceType, string> = {
  encounter: "text-blue-500",
  condition: "text-coral-600",
  medication: "text-teal-600",
  observation: "text-violet-500",
  procedure: "text-amber-500",
};

export function TimelineFilter() {
  const { visibleTypes, toggleType, reset } = useFilterStore();
  const { entries } = useTimelineStore();

  function countForType(type: TimelineResourceType) {
    return entries.filter((e) => e.type === type).length;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-5 py-3">
      {resourceTypes.map((type) => {
        const Icon = resourceIcons[type];
        const isActive = visibleTypes.includes(type);
        const count = countForType(type);

        return (
          <button
            key={type}
            type="button"
            aria-pressed={isActive}
            onClick={() => toggleType(type)}
            title={`Toggle ${resourceLabels[type]}`}
            className={cn(
              "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-all duration-150",
              isActive
                ? typeActiveStyle[type]
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5",
                isActive ? "" : typeIconStyle[type]
              )}
            />
            <span>{resourceLabels[type]}</span>
            {count > 0 && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 py-px text-xs font-semibold",
                  isActive ? "bg-white/60" : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto text-muted-foreground"
        onClick={reset}
        title="Reset filters"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reset</span>
      </Button>
    </div>
  );
}
