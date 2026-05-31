import { render, screen } from "@testing-library/react";
import { TimelineEntry } from "../src/components/Timeline/TimelineEntry";

describe("TimelineEntry", () => {
  it("renders the timeline entry title and metadata", () => {
    render(
      <TimelineEntry
        entry={{
          id: "Condition/c1",
          date: "2024-01-10",
          type: "condition",
          title: "Hypertension",
          detail: "active"
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Hypertension" })).toBeInTheDocument();
    expect(screen.getByText("Conditions")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });
});
