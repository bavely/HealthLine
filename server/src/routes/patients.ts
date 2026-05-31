import { Router } from "express";
import { FhirClient } from "../services/fhirClient";

export const patientsRouter = Router();

patientsRouter.get("/search", async (req, res, next) => {
  try {
    const query = String(req.query.q ?? "").trim();
    if (!query) {
      res.json({ patients: [] });
      return;
    }

    const patients = await new FhirClient().searchPatients(query);
    res.json({ patients });
  } catch (error) {
    next(error);
  }
});
