import {
  Activity,
  CalendarDays,
  ClipboardList,
  Pill,
  Stethoscope,
  type LucideIcon
} from "lucide-react";
import type { TimelineResourceType } from "../types/timeline";

export const resourceIcons: Record<TimelineResourceType, LucideIcon> = {
  encounter: CalendarDays,
  condition: Stethoscope,
  medication: Pill,
  observation: Activity,
  procedure: ClipboardList
};

export const resourceLabels: Record<TimelineResourceType, string> = {
  encounter: "Encounters",
  condition: "Conditions",
  medication: "Medications",
  observation: "Observations",
  procedure: "Procedures"
};
