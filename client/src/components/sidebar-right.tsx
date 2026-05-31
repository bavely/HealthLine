import * as React from "react";
import { useState } from "react";
import { Bot, Info, Loader2, Sparkles, X } from "lucide-react";
import { summarizePatientTimeline } from "../services/api";
import { usePatientStore } from "../store/patient-store";
import { useTimelineStore } from "../store/timeline-store";
import type { SummaryResponse } from "../types/timeline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

function SummarySkeleton() {
  return (
    <div className="space-y-2.5 p-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { activePatient, allergies } = usePatientStore();
  const { entries, fetchedAt } = useTimelineStore();
  const [summary, setSummary] = useState<SummaryResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function generateSummary() {
    if (!activePatient) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const response = await summarizePatientTimeline(activePatient.id, {
        patient: activePatient,
        allergies,
        entries,
        fetchedAt: fetchedAt ?? new Date().toISOString(),
      });
      setSummary(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate summary."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function renderContent() {
    if (error) {
      return (
        <div className="m-4 flex items-start gap-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      );
    }

    if (isLoading) {
      return <SummarySkeleton />;
    }

    if (summary) {
      return (
        <div className="space-y-4 p-4 text-sm text-neutral-700">
          <p className="leading-relaxed">{summary.summary}</p>
          {summary.glossary.length > 0 && (
            <div className="rounded-lg border border-border bg-background p-3">
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Glossary
              </h3>
              <dl className="space-y-2.5">
                {summary.glossary.map((item) => (
                  <div key={item.term}>
                    <dt className="font-semibold text-ink">{item.term}</dt>
                    <dd className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      {item.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
          <Sparkles className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {activePatient ? "Ready to summarize" : "No patient selected"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {activePatient
              ? "Click Generate Summary for an AI plain-language overview"
              : "Load a patient timeline first, then generate a summary"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      side="right"
      {...props}
    >
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 shrink-0">
            <Bot className="h-4 w-4 text-teal-600" />
          </div>
          <h2 className="flex-1 text-sm font-semibold text-ink">AI Summary</h2>
          {summary && !isLoading && (
            <button
              type="button"
              onClick={() => setSummary(undefined)}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Clear summary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          className="mt-2 w-full"
          onClick={() => void generateSummary()}
          disabled={!activePatient || !entries.length || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>{isLoading ? "Generating…" : "Generate Summary"}</span>
        </Button>
      </SidebarHeader>

      <SidebarContent>{renderContent()}</SidebarContent>

      {summary && !isLoading && (
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>{summary.disclaimer}</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
