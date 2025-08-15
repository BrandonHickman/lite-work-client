import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MuscleSelection from "../components/MuscleSelection";
import { getExercisesByMuscles } from "../services/exerciseService";
import {
  createWorkout,
  addExercisesToWorkout,
} from "../services/workoutService";
import { updateWorkoutExercise } from "../services/workoutExerciseService.js";

export default function CreateWorkout() {
  const nav = useNavigate();

  // workout form
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [muscleIds, setMuscleIds] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [picked, setPicked] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingExercises(true);
      try {
        const data = await getExercisesByMuscles(muscleIds);
        if (mounted) setExercises(data || []);
      } finally {
        if (mounted) setLoadingExercises(false);
      }
    })();
    return () => (mounted = false);
  }, [muscleIds]);

  const toggleExercise = (ex) => {
    setPicked((curr) => {
      const copy = { ...curr };
      if (copy[ex.id]) {
        delete copy[ex.id];
      } else {
        copy[ex.id] = {
          sets: 0,
          reps: 0,
          weight: null,
          duration_seconds: null,
        };
      }
      return copy;
    });
  };

  const onChangeField = (exId, field, value) => {
    setPicked((curr) => ({
      ...curr,
      [exId]: { ...curr[exId], [field]: value },
    }));
  };

  const pickedList = useMemo(() => Object.entries(picked), [picked]);

  const onSubmit = async (e) => {
  e.preventDefault();
  if (!title.trim()) {
    return alert("Please give your workout a title.");
  }

  if (pickedList.length === 0) {
    return alert("Pick at least one exercise before creating the workout.");
  }

  // 1) Create workout
  const workout = await createWorkout({
    title,
    date,
    description,
    workout_type: 1,
    duration_minutes: 0,
  });

  // 2) Create rows by exercise IDs (backend assigns positions)
  const selectedExerciseIds = pickedList.map(([exerciseId]) => Number(exerciseId));
  if (selectedExerciseIds.length) {
    const createdRows = await addExercisesToWorkout(workout.id, selectedExerciseIds);

    const cfgByExerciseId = Object.fromEntries(
      pickedList.map(([id, cfg]) => [Number(id), cfg])
    );

    // 3) PATCH each row with sets/reps/weight/duration you gathered in the form
    await Promise.all(
      (createdRows || []).map((row) => {
        const cfg = cfgByExerciseId[row.exercise];
        if (!cfg) return Promise.resolve();

        const payload = {
          sets: cfg.sets ? Number(cfg.sets) : null,
          reps: cfg.reps ? Number(cfg.reps) : null,
          weight:
            cfg.weight !== null && cfg.weight !== "" ? Number(cfg.weight) : null,
          duration_seconds:
            cfg.duration_seconds !== null && cfg.duration_seconds !== ""
              ? Number(cfg.duration_seconds)
              : null,
        };
        return updateWorkoutExercise(row.id, payload);
      })
    );
  }

  // 4) Navigate to the session page
  nav(`/workouts/${workout.id}`);
};

  return (
    <div className="container page-content">
      <div className="page-card">
        <h1 className="mb-6">Create Workout</h1>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:gap-6">
          <div className="mb-4">
            <label className="text-sm mb-2 block">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Push Day, Leg Day, Full Body"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm mb-2 block">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="text-sm mb-2 block">Description (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes for this workout..."
            />
          </div>

          <MuscleSelection selected={muscleIds} onChange={setMuscleIds} />

          <div className="page-card">
            <h2 className="mb-4">Pick exercises</h2>

            {loadingExercises ? (
              <div className="text-sm">Loading exercises…</div>
            ) : exercises.length === 0 ? (
              <div className="text-sm muted">
                No exercises match your current selection.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
                {exercises.map((ex) => {
                  const active = !!picked[ex.id];
                  return (
                    <div
                      key={ex.id}
                      className="page-card"
                      style={{ padding: "1rem" }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div
                            className="text-base"
                            style={{ fontWeight: 700 }}
                          >
                            {ex.name}
                          </div>
                          <div className="text-sm muted">{ex.category}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleExercise(ex)}
                          aria-label={`Select ${ex.name}`}
                        />
                      </div>

                      {active && (
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div className="flex gap-2">
                            <input
                              className="input"
                              inputMode="numeric"
                              placeholder="Sets"
                              value={picked[ex.id]?.sets ?? ""}
                              onChange={(e) =>
                                onChangeField(ex.id, "sets", e.target.value)
                              }
                              style={{ maxWidth: 90 }}
                            />
                            <input
                              className="input"
                              inputMode="numeric"
                              placeholder="Reps"
                              value={picked[ex.id]?.reps ?? ""}
                              onChange={(e) =>
                                onChangeField(ex.id, "reps", e.target.value)
                              }
                              style={{ maxWidth: 90 }}
                            />
                            <input
                              className="input"
                              inputMode="decimal"
                              placeholder="Weight"
                              value={picked[ex.id]?.weight ?? ""}
                              onChange={(e) =>
                                onChangeField(ex.id, "weight", e.target.value)
                              }
                              style={{ maxWidth: 120 }}
                            />
                          </div>

                          <div>
                            <input
                              className="input"
                              inputMode="numeric"
                              placeholder="Duration"
                              value={picked[ex.id]?.duration_seconds ?? ""}
                              onChange={(e) =>
                                onChangeField(
                                  ex.id,
                                  "duration_seconds",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button className="button" type="submit">
              Create Workout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
