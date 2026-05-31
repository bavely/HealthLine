import { normalizeFhirResource } from "../src/lib/fhir-normalizer";

describe("normalizeFhirResource", () => {
  it("maps FHIR observations into timeline entries", () => {
    const entry = normalizeFhirResource({
      resourceType: "Observation",
      id: "obs-1",
      effectiveDateTime: "2024-03-12",
      code: { text: "Hemoglobin A1c" },
      valueQuantity: { value: 6.4, unit: "%" },
      referenceRange: [{ low: { value: 4 }, high: { value: 5.6 } }]
    });

    expect(entry).toMatchObject({
      id: "Observation/obs-1",
      type: "observation",
      title: "Hemoglobin A1c",
      detail: "6.4 %",
      values: {
        value: 6.4,
        unit: "%",
        referenceRange: {
          low: 4,
          high: 5.6
        }
      }
    });
  });

  it("uses medication dosage timing when authoredOn is missing", () => {
    const entry = normalizeFhirResource({
      resourceType: "MedicationRequest",
      id: "med-1",
      status: "active",
      medicationCodeableConcept: { text: "Lisinopril" },
      dosageInstruction: [
        {
          text: "Take once daily",
          timing: {
            repeat: {
              boundsPeriod: {
                start: "2024-02-01",
                end: "2024-05-01"
              }
            }
          }
        }
      ]
    });

    expect(entry).toMatchObject({
      id: "MedicationRequest/med-1",
      date: "2024-02-01",
      endDate: "2024-05-01",
      type: "medication",
      title: "Lisinopril",
      detail: "Take once daily",
      status: "active"
    });
  });

  it("falls back to abatement dates for resolved conditions", () => {
    const entry = normalizeFhirResource({
      resourceType: "Condition",
      id: "cond-1",
      abatementDateTime: "2024-04-05",
      code: { text: "Acute sinusitis" },
      verificationStatus: { text: "confirmed" }
    });

    expect(entry).toMatchObject({
      id: "Condition/cond-1",
      date: "2024-04-05",
      endDate: "2024-04-05",
      type: "condition",
      title: "Acute sinusitis",
      status: "confirmed"
    });
  });
});
