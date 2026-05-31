import { parseSummary } from "../src/services/aiSummarizer";
import { AI_SUMMARY_DISCLAIMER } from "../src/prompts/patientSummary";

describe("aiSummarizer", () => {
  it("parses model JSON into a safe summary response", () => {
    const response = parseSummary(
      JSON.stringify({
        summary: "The patient had an office visit.",
        glossary: [{ term: "Encounter", definition: "A health care visit." }],
        disclaimer: AI_SUMMARY_DISCLAIMER
      })
    );

    expect(response.summary).toContain("office visit");
    expect(response.glossary).toHaveLength(1);
    expect(response.disclaimer).toBe(AI_SUMMARY_DISCLAIMER);
  });

  it("parses fenced JSON when the model includes markdown formatting", () => {
    const response = parseSummary(`\`\`\`json
{
  "summary": "The patient has sparse timeline data.",
  "glossary": [],
  "disclaimer": "${AI_SUMMARY_DISCLAIMER}"
}
\`\`\``);

    expect(response.summary).toBe("The patient has sparse timeline data.");
    expect(response.glossary).toEqual([]);
    expect(response.disclaimer).toBe(AI_SUMMARY_DISCLAIMER);
  });
});
