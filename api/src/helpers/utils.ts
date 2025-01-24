import { randomUUID } from "node:crypto";
import { ScrapeRequestsObject } from "../DurableObjects/ScrapeRequests";
// import { XHandlesObject } from "../DurableObjects/XHandles";

export const getRandomUUID = () => randomUUID();

export const getScrapeRequestDO = (env: CloudflareBindings, scrapeRequestId: string): ScrapeRequestsObject => {
  const objectScrapeID = env.SCRAPE_REQUESTS.idFromString(scrapeRequestId);
  return env.SCRAPE_REQUESTS.get(objectScrapeID);
};

// export const getXHandleDO = (env: CloudflareBindings, xHandle: string): XHandlesObject => {
//   const objectXHandleID = env.XHANDLES.idFromName(xHandle);
//   return env.XHANDLES.get(objectXHandleID);
// };

export const removeDuplicates = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};
