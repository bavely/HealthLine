import { Calendar, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DateMarker } from "./DateMarker";
import { TimelineEntry } from "./TimelineEntry";
import { TimelineFilter } from "./TimelineFilter";
import { monthMarker } from "../../lib/date-utils";
import { useFilterStore } from "../../store/filter-store";
import { useTimelineStore } from "../../store/timeline-store";
import { usePatientStore } from "../../store/patient-store";

const SKELETON_IDS = ["tl-sk-1", "tl-sk-2", "tl-sk-3", "tl-sk-4", "tl-sk-5"];

function TimelineEntrySkeletonRow() {
  return (
    <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
      <div className="flex justify-center">
        <Skeleton className="mt-1 h-9 w-9 rounded-md" />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-56" />
          </div>
          <Skeleton className="h-4 w-24 shrink-0" />
        </div>
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: Readonly<{
  icon: typeof Calendar;
  title: string;
  description: string;
}>) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Timeline() {
  const { activePatient } = usePatientStore();
  const { entries, isLoading, error } = useTimelineStore();
  const { visibleTypes } = useFilterStore();
  const visibleEntries = entries.filter((entry) =>
    visibleTypes.includes(entry.type)
  );
  let currentMonth = "";

  return (
    <section className="min-h-0 flex-1 bg-background">
      <TimelineFilter />
      <div className="h-full overflow-auto px-5 py-2">
        {isLoading && (
          <div>
            {SKELETON_IDS.map((id) => (
              <TimelineEntrySkeletonRow key={id} />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <EmptyState
            icon={Calendar}
            title="Unable to load timeline"
            description={error}
          />
        )}

        {!isLoading && !error && !activePatient && (
          <EmptyState
            icon={Search}
            title="No patient selected"
            description="Search for a patient in the left panel to view their clinical timeline."
          />
        )}

        {!isLoading && !error && activePatient && entries.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="No timeline entries"
            description="No clinical records were found for this patient."
          />
        )}

        {!isLoading && entries.length > 0 && visibleEntries.length === 0 && (
          <EmptyState
            icon={Search}
            title="No matching entries"
            description="No entries match the active filters. Try resetting the filters."
          />
        )}

        {visibleEntries.map((entry) => {
          const marker = monthMarker(entry.date);
          const shouldRenderMarker = marker !== currentMonth;
          currentMonth = marker;

          return (
            <div key={entry.id}>
              {shouldRenderMarker ? <DateMarker label={marker} /> : null}
              <TimelineEntry entry={entry} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
