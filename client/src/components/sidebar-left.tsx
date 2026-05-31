"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { FormEvent, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatientStore } from "../store/patient-store";
import { useTimelineStore } from "../store/timeline-store";


export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
   const [query, setQuery] = useState("smith");
    const { searchResults, isSearching, searchError, search, setActivePatient } = usePatientStore();
    const { loadPatientTimeline } = useTimelineStore();
  
    async function handleSubmit(event: FormEvent) {
      event.preventDefault();
      if (query.trim()) {
        await search(query.trim());
      }
    }
  
    async function selectPatient(patientId: string) {
      const patient = searchResults.find((result) => result.id === patientId);
      setActivePatient(patient);
      await loadPatientTimeline(patientId);
    }
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="p-4">
     <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="patient-search">
          Patient name
        </label>
        <input
          id="patient-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-10 min-w-0 flex-1 rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-50"
          placeholder="Search patients"
        />
        <Button type="submit" disabled={isSearching || !query.trim()} title="Search patients">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>Search</span>
        </Button>
      </form>
      </SidebarHeader>
      <hr className="border-line" />
      <SidebarContent className="p-4">
      {searchError ? <p className="mt-3 text-sm text-coral-600">{searchError}</p> : null}
        {searchResults.map((patient) => (
          <button
            key={patient.id}
            type="button"
            onClick={() => void selectPatient(patient.id)}
            className="w-full rounded-md border border-line bg-paper px-3 py-3 text-left transition hover:border-teal-600 hover:bg-white"
          >
            <span className="block text-sm font-semibold text-ink">{patient.name}</span>
            <span className="mt-1 block text-xs text-neutral-600">
              {[patient.gender, patient.birthDate, patient.id].filter(Boolean).join(" | ")}
            </span>
          </button>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
