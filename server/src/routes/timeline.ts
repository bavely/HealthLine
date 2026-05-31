import { Router } from "express";
import { buildTimeline } from "../services/timelineBuilder";
import { fetchPatientResourceSet } from "../services/resourceFetcher";

export const timelineRouter = Router();

timelineRouter.get("/:id/timeline", async (req, res, next) => {
  try {
    const resourceSet = await fetchPatientResourceSet(req.params.id);
    res.json(buildTimeline(resourceSet));
  } catch (error) {
    next(error);
  }
});
