"use client"

import * as React from "react"
import { useState } from "react";
import { Activity, ChevronRight, Loader2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePatientStore } from "../store/patient-store";
import { useTimelineStore } from "../store/timeline-store";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const SKELETON_KEYS = ["sk-a", "sk-b", "sk-c", "sk-d"];

function PatientSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [query, setQuery] = useState("smith");
  const { searchResults, isSearching, searchError, search, setActivePatient } =
    usePatientStore();
  const { loadPatientTimeline } = useTimelineStore();

  async function handleSearch() {
    if (query.trim()) {
      await search(query.trim());
    }
  }

  async function selectPatient(patientId: string) {
    const patient = searchResults.find((r) => r.id === patientId);
    setActivePatient(patient);
    await loadPatientTimeline(patientId);
  }

  function renderContent() {
    if (searchError) {
      return (
        <p className="rounded-lg bg-coral-50 px-3 py-2.5 text-sm text-coral-600">
          {searchError}
        </p>
      );
    }

    if (isSearching) {
      return (
        <div className="space-y-2">
          {SKELETON_KEYS.map((key) => (
            <PatientSkeleton key={key} />
          ))}
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <>
          <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
            {searchResults.length} patient
            {searchResults.length === 1 ? "" : "s"} found
          </p>
          <div className="space-y-1.5">
            {searchResults.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => void selectPatient(patient.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-all duration-150 hover:border-teal-600/50 hover:bg-accent hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar size="sm" className="shrink-0">
                  <AvatarFallback className="bg-teal-50 text-teal-700 text-xs font-semibold">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {patient.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {[patient.gender, patient.birthDate]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No patients yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Search by name to find patients
          </p>
        </div>
      </div>
    );
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="p-4 pb-3 border-b border-sidebar-border">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600 shrink-0">
            <Activity className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold tracking-tight text-ink">
            HealthLine
          </span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSearch();
          }}
          className="flex flex-col gap-2"
        >
          <label className="sr-only" htmlFor="patient-search">
            Patient name
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="patient-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
              placeholder="Search patients..."
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>{isSearching ? "Searching…" : "Search"}</span>
          </Button>
        </form>
      </SidebarHeader>

      <SidebarContent className="p-3">{renderContent()}</SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
