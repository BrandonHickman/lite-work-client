import { fetchWithResponse, fetchWithoutResponse } from "./fetcher";

export function listSetsForWorkoutExercise(workoutExerciseId) {
  return fetchWithResponse(`workout-sets?workout_exercise=${workoutExerciseId}`);
}

export function createWorkoutSet(payload) {
  return fetchWithResponse("workout-sets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateWorkoutSet(id, payload) {
  return fetchWithResponse(`workout-sets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteWorkoutSet(id) {
  return fetchWithoutResponse(`workout-sets/${id}`, {
    method: "DELETE",
  });
}

