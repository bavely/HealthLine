# FHIR Resource Mapping

HealthLine fetches resources connected to a selected `Patient` and converts each supported resource into a shared `TimelineEntry` shape.

| Resource | Search parameter | Timeline type | Date source |
| --- | --- | --- | --- |
| Encounter | `patient` | `encounter` | `period.start` |
| Condition | `patient` | `condition` | `onsetDateTime` or `recordedDate` |
| MedicationRequest | `patient` | `medication` | `authoredOn` or dosage timing |
| Observation | `patient` | `observation` | `effectiveDateTime` or `issued` |
| Procedure | `patient` | `procedure` | `performedDateTime` or `performedPeriod.start` |
| AllergyIntolerance | `patient` | Sidebar badge | Not rendered as timeline event in the starter |

The normalizers preserve the original FHIR resource on each entry for detail views while also exposing display-friendly fields for timeline cards.
