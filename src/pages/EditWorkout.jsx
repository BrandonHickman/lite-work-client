import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MuscleSelection from "../components/MuscleSelection";
import { getExercisesByMuscles } from "../services/exerciseService";
import {
  getWorkout,
  addExercisesToWorkout,
  getWorkoutMuscleGroups,
  updateWorkout,
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

        setTitle(wk?.title ?? "");
        setDescription(wk?.description ?? "");
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

  const onSaveMeta = async () => {
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateWorkout(id, { title, description });
      setWorkout(updated);
    } finally {
      setSaving(false);
    }
  };

  const onSaveAndStart = async () => {
    setSaving(true);
    try {
      if (
        title.trim() !== (workout?.title ?? "") ||
        (description ?? "") !== (workout?.description ?? "")
      ) {
        await updateWorkout(id, { title, description });
      }
      if (pickedIds.length) {
        await addExercisesToWorkout(id, pickedIds);
      }
      nav(`/workouts/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="container page-content">Loading editor…</div>;
  if (!workout)
    return <div className="container page-content">Workout not found.</div>;

  return (
    <div className="container page-content">
      <div className="page-card">
        <h1 className="mb-4">Edit Workout</h1>

        <div className="grid gap-4">
          <div>
            <label className="text-sm mb-2 block">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Push Day, Legs, Full Body"
            />
          </div>

          <div>
            <label className="text-sm mb-2 block">Description (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes for this workout…"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              className="button secondary"
              onClick={onSaveMeta}
              disabled={saving}
            >
              Save
            </button>
          </div>
        </div>
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
