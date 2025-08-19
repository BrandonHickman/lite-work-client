import { fetchWithoutResponse, fetchWithResponse } from "./fetcher";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Token ${token}` } : {};
};

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

export function deleteWorkout(id) {
  return fetchWithoutResponse(`workouts/${id}`, {
    method: "DELETE",
  });
}

export function repeatWorkout(id) {
  return fetchWithResponse(`workouts/${id}/repeat`, { method: "POST" });
}

export function getWorkoutMuscleGroups(workoutId) {
  return fetchWithResponse(`workouts/${workoutId}/muscle-groups`);
}

export function updateWorkout(id, payload) {
  return fetchWithResponse(`workouts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
}