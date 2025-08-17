import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkout, completeWorkout } from "../services/workoutService";
import { listWorkoutExercises } from "../services/workoutExerciseService";
import {
  listSetsForWorkoutExercise,
  createWorkoutSet,
  updateWorkoutSet,
  deleteWorkoutSet,
} from "../services/workoutSetService";

export default function WorkoutSession() {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const nav = useNavigate()
  const seeded = useRef(new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const wk = await getWorkout(id);
        const wes = await listWorkoutExercises(id);
        const setsLists = await Promise.all(
          (wes || []).map((we) => listSetsForWorkoutExercise(we.id))
        );
        if (!mounted) return;

        const combined = (wes || []).map((we, idx) => ({
          we,
          sets: (setsLists[idx] ?? []).sort(
            (a, b) => a.index - b.index || a.id - b.id
          ),
        }));

        setWorkout(wk);
        setRows(combined);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  useEffect(() => {
    if (!rows || rows.length === 0) return;
    (async () => {
      for (const r of rows) {
        if ((r.sets?.length ?? 0) === 0 && !seeded.current.has(r.we.id)) {
          seeded.current.add(r.we.id);
          await onAddSet(r.we.id);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const [editing, setEditing] = useState({});
  const [drafts, setDrafts] = useState({});

  const onAddSet = async (weId) => {
    const target = rows.find((r) => r.we.id === weId);
    const nextIndex = (target?.sets?.length || 0) + 1;

    setSaving(true);
    try {
      const created = await createWorkoutSet({
        workout_exercise: weId,
        index: nextIndex,
        reps: null,
        weight: null,
        duration_seconds: null,
      });
      setRows((curr) =>
        curr.map((r) =>
          r.we.id === weId ? { ...r, sets: [...r.sets, created] } : r
        )
      );
      setEditing((curr) => ({ ...curr, [created.id]: true }));
      setDrafts((d) => ({
        ...d,
        [created.id]: {
          reps: created.reps ?? "",
          weight: created.weight ?? "",
          duration_seconds: created.duration_seconds ?? "",
        },
      }));
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (set) => {
    setEditing((e) => ({ ...e, [set.id]: true }));
    setDrafts((d) => ({
      ...d,
      [set.id]: {
        reps: set.reps ?? "",
        weight: set.weight ?? "",
        duration_seconds: set.duration_seconds ?? "",
      },
    }));
  };

  const onChangeDraft = (setId, field, val) => {
    setDrafts((d) => ({ ...d, [setId]: { ...d[setId], [field]: val } }));
  };

  const saveSet = async (setRow) => {
    const d = drafts[setRow.id] || {};
    const payload = {
      reps: d.reps !== "" ? Number(d.reps) : null,
      weight: d.weight !== "" ? Number(d.weight) : null,
      duration_seconds: d.duration_seconds !== "" ? Number(d.duration_seconds) : null,
    };

    setSaving(true);
    try {
      const updated = await updateWorkoutSet(setRow.id, payload);
      setRows((curr) =>
        curr.map((r) =>
          r.we.id === setRow.workout_exercise
            ? {
                ...r,
                sets: r.sets.map((s) => (s.id === setRow.id ? updated : s)),
              }
            : r
        )
      );
      setEditing((e) => ({ ...e, [setRow.id]: false }));
    } finally {
      setSaving(false);
    }
  };

  const removeSet = async (setRow) => {
    if (!confirm("Delete this set?")) return;
    setSaving(true);
    try {
      await deleteWorkoutSet(setRow.id);
      setRows((curr) =>
        curr.map((r) =>
          r.we.id === setRow.workout_exercise
            ? { ...r, sets: r.sets.filter((s) => s.id !== setRow.id) }
            : r
        )
      );
    } finally {
      setSaving(false);
    }
  };

    const onFinishWorkout = async () => {
    setSaving(true);
    try {
      await completeWorkout(id);
            // alert("Workout marked complete!"); --- congratulations view before being sent to /profile ??
      nav("/profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="container page-content">Loading session…</div>;
  if (!workout)
    return <div className="container page-content">Workout not found.</div>;

  return (
    <div className="container page-content">
      <div className="page-card">
        <div className="flex justify-between items-center mb-2">
          <h1>{workout.title}</h1>
          <div className="text-sm muted">{workout.date}</div>
        </div>
        {workout.description && <p className="mt-2">{workout.description}</p>}
      </div>

      {rows.map(({ we, sets }) => (
        <div key={we.id} className="page-card">
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-lg" style={{ fontWeight: 700 }}>
                {we.exercise_name || `Exercise #${we.exercise}`}
              </div>
            </div>
            <button
              className="button"
              onClick={() => onAddSet(we.id)}
              disabled={saving}
            >
              + Add set
            </button>
          </div>

          {sets.length === 0 ? (
            <div className="text-sm muted">No sets yet. Click “Add set”.</div>
          ) : (
            <ul className="grid grid-cols-1 gap-2">
              {sets.map((s) => {
                const isEdit = !!editing[s.id];
                const d = drafts[s.id] || {};
                return (
                  <li
                    key={s.id}
                    className="page-card"
                    style={{ padding: "1rem" }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <strong>Set {s.index}</strong>
                      {!isEdit ? (
                        <div className="flex gap-2">
                          <button
                            className="button"
                            onClick={() => beginEdit(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="button secondary"
                            onClick={() => removeSet(s)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {!isEdit ? (
                      <div className="text-sm">
                        <div>Reps: {s.reps ?? "—"}</div>
                        <div>Weight: {s.weight ?? "—"}</div>
                        <div>Duration (sec): {s.duration_seconds ?? ""}</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex gap-2">
                          <input
                            className="input"
                            placeholder="Reps"
                            inputMode="numeric"
                            value={d.reps ?? ""}
                            onChange={(e) =>
                              onChangeDraft(s.id, "reps", e.target.value)
                            }
                            style={{ maxWidth: 100 }}
                          />
                          <input
                            className="input"
                            placeholder="Weight"
                            inputMode="decimal"
                            value={d.weight ?? ""}
                            onChange={(e) =>
                              onChangeDraft(s.id, "weight", e.target.value)
                            }
                            style={{ maxWidth: 120 }}
                          />
                          <input
                            className="input"
                            placeholder="Duration (sec)"
                            inputMode="numeric"
                            value={d.duration_seconds ?? ""}
                            onChange={(e) =>
                              onChangeDraft(
                                s.id,
                                "duration_seconds",
                                e.target.value
                              )
                            }
                            style={{ maxWidth: 160 }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="button"
                            onClick={() => saveSet(s)}
                            disabled={saving}
                          >
                            Finish set
                          </button>
                          <button
                            className="button secondary"
                            onClick={() =>
                              setEditing((e) => ({ ...e, [s.id]: false }))
                            }
                            disabled={saving}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}

      <div className="flex justify-end mt-6">
        <button
          className="button secondary"
          onClick={onFinishWorkout}
          disabled={saving}
        >
          Finish workout
        </button>
      </div>
    </div>
  );
}
