export function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(parsed);
}

export function monthMarker(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date.slice(0, 7);
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(parsed);
}
