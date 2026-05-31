import { formatDate, monthMarker } from "../src/lib/date-utils";

describe("date-utils", () => {
  it("formats FHIR date-only values without timezone drift", () => {
    expect(formatDate("2024-01-10")).toBe("Jan 10, 2024");
    expect(monthMarker("2024-01-01")).toBe("January 2024");
  });

  it("keeps partial FHIR dates precise", () => {
    expect(formatDate("2024")).toBe("2024");
    expect(formatDate("2024-03")).toBe("Mar 2024");
    expect(monthMarker("2024")).toBe("2024");
    expect(monthMarker("2024-03")).toBe("March 2024");
  });
});
