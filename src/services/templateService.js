import { fetchWithResponse } from "./fetcher";

export function getWorkoutTemplates() {
  return fetchWithResponse("workout-templates");
}

export function startTemplate(id) {
  return fetchWithResponse(`workout-templates/${id}/start`, { method: "POST", body: JSON.stringify({}) });
}
