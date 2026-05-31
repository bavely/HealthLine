import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { summarizePatientTimeline } from "../../services/api";
import { usePatientStore } from "../../store/patient-store";
import { useTimelineStore } from "../../store/timeline-store";
import type { SummaryResponse } from "../../types/timeline";
import { Button } from "@/components/ui/button";

export function AiSummaryPanel() {
  const { activePatient, allergies } = usePatientStore();
  const { entries, fetchedAt, isLoading: isTimelineLoading } = useTimelineStore();
  const [summary, setSummary] = useState<SummaryResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const summaryRequestId = useRef(0);

  useEffect(() => {
    summaryRequestId.current += 1;
    setSummary(undefined);
    setError(undefined);
    setIsLoading(false);
  }, [activePatient?.id, fetchedAt]);

  async function generateSummary() {
    if (!activePatient || isTimelineLoading || entries.length === 0) {
      return;
    }

    const requestId = ++summaryRequestId.current;
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await summarizePatientTimeline(activePatient.id, {
        patient: activePatient,
        allergies,
        entries,
        fetchedAt: fetchedAt ?? new Date().toISOString()
      });
      if (requestId === summaryRequestId.current) {
        setSummary(response);
      }
    } catch (requestError) {
      if (requestId === summaryRequestId.current) {
        setError(requestError instanceof Error ? requestError.message : "Unable to generate summary.");
      }
    } finally {
      if (requestId === summaryRequestId.current) {
        setIsLoading(false);
      }
    }
  }

  return (
    <aside className="border-t border-line bg-white p-4 lg:border-l lg:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-teal-600" />
          <h2 className="text-sm font-semibold uppercase text-neutral-700">AI Summary</h2>
        </div>
        <Button
          onClick={() => void generateSummary()}
          disabled={!activePatient || !entries.length || isLoading || isTimelineLoading}
          title="Generate patient summary"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>Summarize</span>
        </Button>
      </div>

      {error ? <p className="mt-4 rounded-md bg-coral-50 p-3 text-sm text-coral-600">{error}</p> : null}

      {summary ? (
        <div className="mt-4 space-y-4 text-sm text-neutral-700">
          <p className="leading-6">{summary.summary}</p>
          {summary.glossary.length ? (
            <div>
              <h3 className="text-xs font-semibold uppercase text-neutral-600">Glossary</h3>
              <dl className="mt-2 space-y-2">
                {summary.glossary.map((item) => (
                  <div key={item.term}>
                    <dt className="font-semibold text-ink">{item.term}</dt>
                    <dd className="text-neutral-700">{item.definition}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
          <p className="rounded-md border border-line bg-paper p-3 text-xs leading-5 text-neutral-600">
            {summary.disclaimer}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-neutral-600">
          Load a patient timeline, then generate a plain-language summary with glossary terms.
        </p>
      )}
    </aside>
  );
}
