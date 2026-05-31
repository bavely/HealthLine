import { normalizeFhirResource } from "../src/lib/fhir-normalizer";

describe("normalizeFhirResource", () => {
  it("maps FHIR observations into timeline entries", () => {
    const entry = normalizeFhirResource({
      resourceType: "Observation",
      id: "obs-1",
      effectiveDateTime: "2024-03-12",
      code: { text: "Hemoglobin A1c" },
      valueQuantity: { value: 6.4, unit: "%" }
    });

    expect(entry).toMatchObject({
      id: "Observation/obs-1",
      type: "observation",
      title: "Hemoglobin A1c",
      detail: "6.4 %",
      values: {
        value: 6.4,
        unit: "%"
      }
    });
  });
});
