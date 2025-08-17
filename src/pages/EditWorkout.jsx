import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MuscleSelection from "../components/MuscleSelection";
import { getExercisesByMuscles } from "../services/exerciseService";
import {
  getWorkout,
  addExercisesToWorkout,
  getWorkoutMuscleGroups,
} from "../services/workoutService";
import {
  deleteWorkoutExercise,
  listWorkoutExercises,
} from "../services/workoutExerciseService";


export default function EditWorkout() {
  const { id } = useParams();
  const nav = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [muscleIds, setMuscleIds] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [picked, setPicked] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [wk, wes, groups] = await Promise.all([
          getWorkout(id),
          listWorkoutExercises(id),
          getWorkoutMuscleGroups(id).catch(() => []),
        ]);
        if (!mounted) return;
        setWorkout(wk);
        setRows(wes || []);
        setMuscleIds((groups || []).map((g) => g.id));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingExercises(true);
      try {
        const data = await getExercisesByMuscles(muscleIds);
        if (!mounted) return;
        setExercises(data || []);
      } finally {
        if (mounted) setLoadingExercises(false);
      }
    })();
    return () => (mounted = false);
  }, [muscleIds]);

  const togglePick = (exId) => {
    setPicked((curr) => {
      const c = { ...curr };
      if (c[exId]) delete c[exId];
      else c[exId] = true;
      return c;
    });
  };

  const pickedIds = useMemo(
    () => Object.keys(picked).map((x) => Number(x)),
    [picked]
  );

  const onRemoveRow = async (rowId) => {
    if (!confirm("Remove this exercise from the workout?")) return;
    setSaving(true);
    try {
      await deleteWorkoutExercise(rowId);
      setRows((r) => r.filter((x) => x.id !== rowId));
    } finally {
      setSaving(false);
    }
  };

  const onSaveAndStart = async () => {
    if (pickedIds.length) {
      setSaving(true);
      try {
        await addExercisesToWorkout(id, pickedIds);
      } finally {
        setSaving(false);
      }
    }
    nav(`/workouts/${id}`);
  };

  if (loading)
    return <div className="container page-content">Loading editor…</div>;
  if (!workout)
    return <div className="container page-content">Workout not found.</div>;

  return (
    <div className="container page-content">
      <div className="page-card">
        <div className="flex items-center justify-between">
          <h1>Edit Workout</h1>
          <div className="text-sm muted">{workout.date}</div>
        </div>
        {!!workout.description && <p className="mt-2">{workout.description}</p>}
      </div>

      <div className="page-card">
        <h2 className="mb-4">Current exercises</h2>
        {rows.length === 0 ? (
          <div className="text-sm muted">None yet.</div>
        ) : (
          <ul className="grid grid-cols-1 gap-2">
            {rows
              .slice()
              .sort((a, b) => a.position - b.position || a.id - b.id)
              .map((r) => (
                <li
                  key={r.id}
                  className="page-card"
                  style={{ padding: "1rem" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-base" style={{ fontWeight: 700 }}>
                      {r.exercise_name ?? `Exercise #${r.exercise}`}
                    </div>
                    <button
                      className="button secondary"
                      onClick={() => onRemoveRow(r.id)}
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      <MuscleSelection selected={muscleIds} onChange={setMuscleIds} />

      <div className="page-card">
        <h2 className="mb-4">Add more exercises</h2>
        {loadingExercises ? (
          <div className="text-sm">Loading…</div>
        ) : exercises.length === 0 ? (
          <div className="text-sm muted">No matches.</div>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base" style={{ fontWeight: 700 }}>
                        {ex.name}
                      </div>
                      <div className="text-sm muted">{ex.category}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => togglePick(ex.id)}
                      aria-label={`Select ${ex.name}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button className="button" onClick={onSaveAndStart} disabled={saving}>
          Save & Start
        </button>
      </div>
    </div>
  );
}
