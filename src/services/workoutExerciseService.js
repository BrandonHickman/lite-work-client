import { fetchWithResponse } from "./fetcher";

export function getWorkoutExercises(workoutId) {
  return fetchWithResponse(`/workout-exercises?workout=${workoutId}`);
}

export function updateWorkoutExercise(id, payload) {
  return fetchWithResponse(`/workout-exercises/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
