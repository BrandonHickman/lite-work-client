import { fetchWithoutResponse, fetchWithResponse } from "./fetcher";

export function listWorkoutExercises(workoutId) {
  return fetchWithResponse(`workout-exercises?workout=${workoutId}`);
}


export function getWorkoutExercises(id) {
  return fetchWithResponse(`workout-exercises/${id}`);
}


export function updateWorkoutExercise(id, payload) {
  return fetchWithResponse(`workout-exercises/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}


export function deleteWorkoutExercise(id) {
  return fetchWithoutResponse(`workout-exercises/${id}`, {
    method: "DELETE",
  });
}
