import { fetchWithResponse } from "./fetcher";

export function getHeatmap() {
  return fetchWithResponse("analytics/heatmap/");
}
