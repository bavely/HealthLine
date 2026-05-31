import { DateMarker } from "./DateMarker";
import { TimelineEntry } from "./TimelineEntry";
import { TimelineFilter } from "./TimelineFilter";
import { monthMarker } from "../../lib/date-utils";
import { useFilterStore } from "../../store/filter-store";
import { useTimelineStore } from "../../store/timeline-store";
import { usePatientStore } from "../../store/patient-store";
export function Timeline() {
  const { activePatient } = usePatientStore();
  const { entries, isLoading, error } = useTimelineStore();
  const { visibleTypes } = useFilterStore();
  const visibleEntries = entries.filter((entry) => visibleTypes.includes(entry.type));
  let currentMonth = "";

  return (
    <section className="min-h-0 flex-1 bg-paper">
      <TimelineFilter />
      <div className="h-full overflow-auto px-5 py-4">
        {isLoading ? <p className="py-8 text-sm text-neutral-600">Loading patient timeline...</p> : null}
        {error ? <p className="py-8 text-sm text-coral-600">{error}</p> : null}
        {!isLoading && !error && !entries.length && !activePatient ? (
          <p className="py-8 text-sm text-neutral-600">Search for a patient to populate the timeline.</p>
        ) : null}
        {!isLoading && entries.length > 0 && visibleEntries.length === 0 ? (
          <p className="py-8 text-sm text-neutral-600">No timeline entries match the active filters.</p>
        ) : null}
        {!isLoading && !error && !entries.length && activePatient ? (
          <p className="py-8 text-sm text-neutral-600">No timeline entries found for this patient.</p>
        ) : null}
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
