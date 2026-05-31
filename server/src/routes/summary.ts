import { Router } from "express";
import { summarizeTimeline } from "../services/aiSummarizer";
import { fetchPatientResourceSet } from "../services/resourceFetcher";
import { buildTimeline } from "../services/timelineBuilder";
import type { TimelineResponse } from "../types";

export const summaryRouter = Router();

summaryRouter.post("/:id/summary", async (req, res, next) => {
  try {
    const timeline = hasTimelineBody(req.body) ? req.body : buildTimeline(await fetchPatientResourceSet(req.params.id));
    const summary = await summarizeTimeline(timeline);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

function hasTimelineBody(value: unknown): value is TimelineResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "patient" in value &&
    "entries" in value &&
    Array.isArray((value as TimelineResponse).entries)
  );
}
