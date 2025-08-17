import { fetchWithResponse } from "./fetcher";

export function getExercisesByMuscles(ids = []) {
  const param = ids.length ? `?muscle_group=${ids.join(",")}` : "";
  return fetchWithResponse(`exercises${param}`, {
    headers: { "Content-Type": "application/json" },
  });
}

export function getMuscleGroups() {
  return fetchWithResponse("muscle-groups");
}

export function getExercisesByMuscleGroups(ids = []) {
  const qs = ids.length ? `?muscle_group=${ids.join(",")}` : "";
  return fetchWithResponse(`/exercises${qs}`);
}

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Token ${token}` } : {};
};

export function updateWorkoutExercise(id, payload) {
  return fetchWithResponse(`workout-exercises/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
}