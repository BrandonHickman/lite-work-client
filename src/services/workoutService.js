import { fetchWithResponse } from "./fetcher";

export function getWorkouts() {
  return fetchWithResponse("workouts");
}

export function getWorkout(id) {
  return fetchWithResponse(`workouts/${id}`);
}

export function createWorkout(payload) {
  return fetchWithResponse("workouts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeWorkout(id) {
  return fetchWithResponse(`workouts/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}


export function addExercisesToWorkout(workoutId, exerciseIds) {
  return fetchWithResponse(`workouts/${workoutId}/add-exercises`, {
    method: "POST",
    body: JSON.stringify({ exercise_ids: exerciseIds }),
  });
}
