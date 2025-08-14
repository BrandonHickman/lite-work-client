import { fetchWithResponse } from "./fetcher";

export function getExercisesByMuscles(muscleIds = []) {
  const q = muscleIds.length ? `?muscle_group=${muscleIds.join(",")}` : "";
  return fetchWithResponse(`/exercises${q}`);
}
