export interface FhirResource {
  resourceType?: string;
  id?: string;
  [key: string]: unknown;
}

export interface FhirBundle<TResource = FhirResource> {
  resourceType: "Bundle";
  entry?: Array<{
    resource?: TResource;
  }>;
}
