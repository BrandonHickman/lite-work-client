import { fetchWithResponse } from "./fetcher";

export function getMuscleGroups() {
  return fetchWithResponse("muscle-groups", {
    headers: { "Content-Type": "application/json" },
  });
}
