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

  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {})
  });
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: buildPatientSummaryMessages(timeline),
    response_format: { type: "json_object" }
  });

  return parseSummary(completion.choices[0]?.message?.content ?? "");
}

export function parseSummary(content: string): SummaryResponse {
  try {
    const jsonContent = JSON.parse(extractJsonObject(content));
    const parsed = summarySchema.parse(jsonContent);

    return {
      summary: parsed.summary,
      glossary: parsed.glossary,
      disclaimer: parsed.disclaimer || AI_SUMMARY_DISCLAIMER
    };
  } catch {
    return {
      summary: content || "No summary was returned.",
      glossary: [],
      disclaimer: AI_SUMMARY_DISCLAIMER
    };
  }
}

function extractJsonObject(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]?.trim();
  if (fencedJson) {
    return fencedJson;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}
