export function formatDate(date: string): string {
  const partial = parsePartialFhirDate(date);
  if (partial?.precision === "year") {
    return String(partial.year);
  }

  if (partial?.precision === "month") {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric"
    }).format(new Date(partial.year, partial.month - 1, 1));
  }

  const parsed = partial
    ? new Date(partial.year, partial.month - 1, partial.day)
    : new Date(date);

  if (!isValidDate(parsed)) {
    return date;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(parsed);
}

export function monthMarker(date: string): string {
  const partial = parsePartialFhirDate(date);
  if (partial?.precision === "year") {
    return String(partial.year);
  }

  const parsed = partial
    ? new Date(partial.year, partial.month - 1, 1)
    : new Date(date);

  if (!isValidDate(parsed)) {
    return date.slice(0, 7);
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(parsed);
}

function parsePartialFhirDate(date: string):
  | { precision: "year"; year: number }
  | { precision: "month"; year: number; month: number }
  | { precision: "day"; year: number; month: number; day: number }
  | undefined {
  const match = date.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : undefined;
  const day = match[3] ? Number(match[3]) : undefined;

  if (!month) {
    return { precision: "year", year };
  }

  if (!isValidMonth(month)) {
    return undefined;
  }

  if (!day) {
    return { precision: "month", year, month };
  }

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }

  return { precision: "day", year, month, day };
}

function isValidMonth(month: number): boolean {
  return Number.isInteger(month) && month >= 1 && month <= 12;
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
