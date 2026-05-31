import OpenAI from "openai";
import { z } from "zod";
import { AI_SUMMARY_DISCLAIMER, buildPatientSummaryMessages } from "../prompts/patientSummary";
import type { SummaryResponse, TimelineResponse } from "../types";

const summarySchema = z.object({
  summary: z.string().min(1),
  glossary: z
    .array(
      z.object({
        term: z.string().min(1),
        definition: z.string().min(1)
      })
    )
    .default([]),
  disclaimer: z.string().default(AI_SUMMARY_DISCLAIMER)
});

export async function summarizeTimeline(timeline: TimelineResponse): Promise<SummaryResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_ENDPOINT;
  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY is required for summaries.");
    (error as Error & { status?: number }).status = 503;
    throw error;
  }

  if (!baseURL) {
    const error = new Error("OPENAI_ENDPOINT is required for summaries.");
    (error as Error & { status?: number }).status = 503;
    throw error;
  }

  const client = new OpenAI({ 
      baseURL,
     apiKey
   });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4",
   store: true,
    messages: buildPatientSummaryMessages(timeline)
  });

  return parseSummary(completion.choices[0]?.message?.content ?? "");
}

export function parseSummary(content: string): SummaryResponse {
  try {
    console.log("Parsing summary content:", typeof content);
     const jsonContent = JSON.parse(content);
    console.log("Parsed JSON content:", typeof jsonContent, jsonContent);
    const parsed = summarySchema.parse(jsonContent);
    
    return {
      summary: parsed.summary,
      glossary: parsed.glossary,
      disclaimer: parsed.disclaimer || AI_SUMMARY_DISCLAIMER
    };
  } catch (parseError) {
    console.error("Error parsing summary content:", parseError);
    return {
      summary: content || "No summary was returned.",
      glossary: [],
      disclaimer: AI_SUMMARY_DISCLAIMER
    };
  }
}
