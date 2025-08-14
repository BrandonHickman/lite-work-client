import { fetchWithResponse } from "./fetcher";

export function getWorkouts() {
  // DRF router is under /api
  return fetchWithResponse("/workouts");
}

export function getWorkout(id) {
  return fetchWithResponse(`/workouts/${id}`);
}

export function createWorkout(payload) {
  // { title, date, description, duration_minutes, workout_type: null|id, completed: false }
  return fetchWithResponse("/workouts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeWorkout(id) {
  return fetchWithResponse(`/workouts/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// Bulk add exercises to a workout (tiny round-trip saver)
export function addExercisesToWorkout(workoutId, exerciseIds) {
  return fetchWithResponse(`/workouts/${workoutId}/add_exercises`, {
    method: "POST",
    body: JSON.stringify({ exercise_ids: exerciseIds }),
  });
}
