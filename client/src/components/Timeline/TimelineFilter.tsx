import { RotateCcw } from "lucide-react";
import { resourceIcons, resourceLabels } from "../../lib/resource-icons";
import { useFilterStore } from "../../store/filter-store";
import type { TimelineResourceType } from "../../types/timeline";
import { Button } from "../ui/Button";

const resourceTypes = Object.keys(resourceLabels) as TimelineResourceType[];

export function TimelineFilter() {
  const { visibleTypes, toggleType, reset } = useFilterStore();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-5 py-3">
      {resourceTypes.map((type) => {
        const Icon = resourceIcons[type];
        const isActive = visibleTypes.includes(type);

        return (
          <button
            key={type}
            type="button"
            aria-pressed={isActive}
            onClick={() => toggleType(type)}
            className={
              isActive
                ? "inline-flex min-h-9 items-center gap-2 rounded-md border border-teal-600 bg-teal-50 px-3 text-sm font-medium text-teal-800"
                : "inline-flex min-h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-neutral-600 hover:bg-paper"
            }
            title={`Toggle ${resourceLabels[type]}`}
          >
            <Icon className="h-4 w-4" />
            <span>{resourceLabels[type]}</span>
          </button>
        );
      })}
      <Button variant="ghost" className="ml-auto" onClick={reset} title="Reset filters">
        <RotateCcw className="h-4 w-4" />
        <span>Reset</span>
      </Button>
    </div>
  );
}
