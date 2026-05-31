import { AlertTriangle, UserRound } from "lucide-react";
import { usePatientStore } from "../../store/patient-store";

export function PatientHeader() {
  const { activePatient, allergies } = usePatientStore();

  if (!activePatient) {
    return (
      <section className="border-b border-line bg-white px-5 py-4">
        <div className="flex items-center gap-3 text-neutral-600">
          <UserRound className="h-5 w-5" />
          <span className="text-sm">Select a patient to load their timeline.</span>
        </div>
      </section>
    );
  }

  return (
    // <section className="border-b border-line bg-white px-5 py-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">{activePatient.name}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {[activePatient.gender, activePatient.birthDate, activePatient.id].filter(Boolean).join(" | ")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700">
            <AlertTriangle className="h-4 w-4 text-coral-600" />
            Allergies
          </span>
          {allergies.length ? (
            allergies.map((allergy) => (
              <span key={allergy} className="rounded-md bg-coral-50 px-2 py-1 text-xs font-medium text-coral-600">
                {allergy}
              </span>
            ))
          ) : (
            <span className="rounded-md bg-paper px-2 py-1 text-xs font-medium text-neutral-600">None listed</span>
          )}
        </div>
      </div>
    // </section>
  );
}
