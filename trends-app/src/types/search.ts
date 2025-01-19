import { TypesenseTweetData } from "./tweet";

export interface SearchResult {
  found: number;
  out_of: number;
  page: number;
  hits: {
    document: TypesenseTweetData;
    text_match: number;
  }[];
  facet_counts: SearchResultFacet[];
}

export interface SearchResultFacet {
  counts: {
    count: number;
    value: string;
  }[];
  field_name: SearchResultFacetField;
}

export enum SearchResultFacetField {
  KEY_TOPICS = "keyTopics",
  KEY_ENTITIES = "keyEntities",
  KEY_USERS = "keyUsers",
}
