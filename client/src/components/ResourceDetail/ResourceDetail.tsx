interface ResourceDetailProps {
  resource?: unknown;
}

export function ResourceDetail({ resource }: ResourceDetailProps) {
  if (!resource) {
    return null;
  }

  return (
    <details className="mt-3 rounded-md border border-line bg-white">
      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-neutral-700">FHIR details</summary>
      <pre className="max-h-72 overflow-auto border-t border-line p-3 text-xs leading-5 text-neutral-700">
        {JSON.stringify(resource, null, 2)}
      </pre>
    </details>
  );
}
