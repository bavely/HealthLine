import { AlertTriangle, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePatientStore } from "../../store/patient-store";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function PatientHeader() {
  const { activePatient, allergies } = usePatientStore();

  if (!activePatient) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <UserRound className="h-4 w-4 shrink-0" />
        <span className="text-sm">Select a patient to load their timeline</span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="sm" className="shrink-0">
        <AvatarFallback className="bg-teal-50 text-teal-700 text-xs font-semibold">
          {getInitials(activePatient.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-semibold leading-tight text-ink">
          {activePatient.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[activePatient.gender, activePatient.birthDate, activePatient.id]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {allergies.length > 0 && (
        <div className="ml-2 hidden shrink-0 items-center gap-1.5 xl:flex">
          <AlertTriangle className="h-3.5 w-3.5 text-coral-600" />
          {allergies.slice(0, 3).map((allergy) => (
            <span
              key={allergy}
              className="rounded-full bg-coral-50 px-2 py-0.5 text-xs font-medium text-coral-600"
            >
              {allergy}
            </span>
          ))}
          {allergies.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{allergies.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
