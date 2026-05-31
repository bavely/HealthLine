import { resourceIcons, resourceLabels } from "../../lib/resource-icons";
import { formatDate } from "../../lib/date-utils";
import type { TimelineEntry as TimelineEntryType } from "../../types/timeline";
import { ResourceDetail } from "../ResourceDetail/ResourceDetail";

interface TimelineEntryProps {
  entry: TimelineEntryType;
}

export function TimelineEntry({ entry }: TimelineEntryProps) {
  const Icon = resourceIcons[entry.type];

  return (
    <article className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
      <div className="flex justify-center">
        <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-teal-600">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="rounded-md border border-line bg-white p-4 shadow-panel">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-neutral-500">{resourceLabels[entry.type]}</p>
            <h3 className="mt-1 text-base font-semibold text-ink">{entry.title}</h3>
          </div>
          <time className="text-sm font-medium text-neutral-600" dateTime={entry.date}>
            {formatDate(entry.date)}
          </time>
        </div>
        {entry.detail ? <p className="mt-2 text-sm text-neutral-700">{entry.detail}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.status ? (
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">{entry.status}</span>
          ) : null}
          {entry.values?.value !== undefined ? (
            <span className="rounded-md bg-paper px-2 py-1 text-xs font-medium text-neutral-700">
              {entry.values.value} {entry.values.unit}
            </span>
          ) : null}
          {entry.endDate ? (
            <span className="rounded-md bg-paper px-2 py-1 text-xs font-medium text-neutral-700">
              Ends {formatDate(entry.endDate)}
            </span>
          ) : null}
        </div>
        <ResourceDetail resource={entry.resource} />
      </div>
    </article>
  );
}
