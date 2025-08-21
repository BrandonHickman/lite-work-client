import { fetchWithResponse } from "./fetcher";

export function getHeatmap(days = 365) {
  const q = days ? `?days=${encodeURIComponent(days)}` : "";
  return fetchWithResponse(`analytics/heatmap/${q}`);
}
