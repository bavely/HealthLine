interface DateMarkerProps {
  label: string;
}

export function DateMarker({ label }: DateMarkerProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-line bg-paper/95 px-1 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-600 backdrop-blur">
      {label}
    </div>
  );
}
