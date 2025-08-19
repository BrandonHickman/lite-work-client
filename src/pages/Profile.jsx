import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile, uploadAvatar } from "../services/profileService";
import { getWorkouts, deleteWorkout } from "../services/workoutService";
import { getHeatmap } from "../services/analyticsService";
import { getWorkout } from "../services/workoutService";
import { listWorkoutExercises } from "../services/workoutExerciseService";
import { listSetsForWorkoutExercise } from "../services/workoutSetService";

export default function Profile() {
  const nav = useNavigate();

  const [profile, setProfile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [heatmap, setHeatmap] = useState({});

  const [workouts, setWorkouts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewWorkout, setViewWorkout] = useState(null);
  const [viewRows, setViewRows] = useState([]);


  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [p, w, h] = await Promise.all([
          getMyProfile().catch(() => null),
          getWorkouts().catch(() => []),
          getHeatmap().catch(() => ({})),
        ]);
        if (!mounted) return;
        setProfile(p || {});
        setWorkouts(w || []);
        setHeatmap(h || {});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const completed = useMemo(() => (workouts || []).filter((w) => w.completed), [workouts]);

  const completedLast30 = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return completed.filter((w) => new Date(w.date) >= cutoff);
  }, [completed]);

  const goal = profile?.challenge_goal ?? null;
  const progress = goal
    ? Math.min(100, Math.round((completedLast30.length / goal) * 100))
    : 0;


  const onUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const updated = await uploadAvatar(file);
    setProfile(updated);
  };

  const onChangeBio = async (e) => {
    const bio = e.target.value;
    setProfile((p) => ({ ...p, bio }));
    setSavingProfile(true);
    try {
      const updated = await updateMyProfile({ bio });
      setProfile(updated);
    } finally {
      setSavingProfile(false);
    }
  };

  const onCreateOrUpdateChallenge = async () => {
    const raw = prompt(
      "How many workouts do you want to complete in the next 30 days?",
      profile?.challenge_goal ?? ""
    );
    if (!raw) return;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Please enter a positive number.");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await updateMyProfile({ challenge_goal: n });
      setProfile(updated);
    } finally {
      setSavingProfile(false);
    }
  };

  const onDeleteChallenge = async () => {
    if (!confirm("Delete your challenge?")) return;
    setSavingProfile(true);
    try {
      const updated = await updateMyProfile({ challenge_goal: null });
      setProfile(updated);
    } finally {
      setSavingProfile(false);
    }
  };


  const onDeleteWorkout = async (id) => {
    if (!confirm("Delete this workout?")) return;
    setDeleting(true);
    try {
      await deleteWorkout(id);
      setWorkouts((ws) => (ws || []).filter((w) => w.id !== id));
    } finally {
      setDeleting(false);
    }
  };

  const onEditWorkout = (id) => {
    nav(`/workouts/${id}/edit`);
  };


  const onViewWorkout = async (id) => {
    setViewWorkout(null);
    setViewRows([]);
    setViewOpen(true);
    try {
      const wk = await getWorkout(id);
      const wes = await listWorkoutExercises(id);
      const setsLists = await Promise.all((wes || []).map((we) => listSetsForWorkoutExercise(we.id)));
      const rows = (wes || []).map((we, idx) => ({
        we,
        sets: (setsLists[idx] ?? []).sort((a, b) => a.index - b.index || a.id - b.id),
      }));
      setViewWorkout(wk);
      setViewRows(rows);
    } catch (e) {
      setViewOpen(false);
      alert("Failed to load workout details.");
    }
  };

  const closeView = () => {
    setViewOpen(false);
    setViewWorkout(null);
    setViewRows([]);
  };


  function getPastDates(n = 365) {
    const days = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }
  const days = useMemo(() => getPastDates(365), []);
  const maxCount = useMemo(() => Math.max(1, ...Object.values(heatmap || {})), [heatmap]);
  const colorFor = (count) => {
    if (!count) return "#e5e7eb";
    const t = count / maxCount;
    if (t < 0.25) return "#d1fae5";
    if (t < 0.5) return "#a7f3d0";
    if (t < 0.75) return "#6ee7b7";
    return "#34d399";
  };

  if (loading) return <div className="container page-content">Loading profile…</div>;

  return (
    <div className="container page-content">
      <div className="page-card">
        <div className="flex items-start gap-6">
          <div style={{ width: 96 }}>
            <div className="mb-2">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 12 }}
                />
              ) : (
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 12,
                    background: "#f3f4f6",
                    display: "grid",
                    placeItems: "center",
                    color: "#6b7280",
                    fontSize: 12,
                  }}
                >
                  No photo
                </div>
              )}
            </div>
            <label className="button secondary" style={{ display: "inline-block" }}>
              Upload
              <input type="file" accept="image/*" onChange={onUploadAvatar} style={{ display: "none" }} />
            </label>
          </div>

          <div className="flex-1 grid gap-4">
            <div>
              <div className="text-sm mb-1 muted">Name</div>
              <div className="text-base" style={{ fontWeight: 600 }}>
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="text-sm muted">{profile?.email}</div>
            </div>

            <div>
              <label className="text-sm mb-2 block">Bio</label>
              <textarea
                className="input"
                rows={3}
                value={profile?.bio ?? ""}
                onChange={onChangeBio}
                placeholder="Say a little about yourself…"
              />
              {savingProfile && <div className="text-xs muted mt-1">Saving…</div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-2 block">Challenge goal (workouts / 30 days)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={profile?.challenge_goal ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : "";
                    setProfile((p) => ({ ...p, challenge_goal: val === "" ? null : val }));
                  }}
                  onBlur={async (e) => {
                    const v = e.target.value ? Number(e.target.value) : null;
                    setSavingProfile(true);
                    try {
                      const updated = await updateMyProfile({ challenge_goal: v });
                      setProfile(updated);
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                  placeholder="e.g., 12"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-card">
        <div className="flex items-center justify-between mb-6">
          <h2>Challenge</h2>
          <Link className="button" to="/workouts/create">+ New Workout</Link>
        </div>

        {goal ? (
          <div className="flex items-center gap-6">
            <div
              title={`${progress}%`}
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `conic-gradient(var(--color-accent) ${progress}%, var(--border) ${progress}% 100%)`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "var(--card)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                }}
              >
                {progress}%
              </div>
            </div>

            <div>
              <div className="text-lg" style={{ fontWeight: 700 }}>
                {completedLast30.length}/{goal} workouts in the last 30 days
              </div>
              <div className="text-sm muted">Progress updates automatically as you complete workouts.</div>

              <div className="flex gap-2 mt-3">
                <button className="button" onClick={onCreateOrUpdateChallenge}>Edit</button>
                <button className="button secondary" onClick={onDeleteChallenge} disabled={savingProfile}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm muted">No challenge yet—set a goal for the next 30 days.</div>
            <button className="button" onClick={onCreateOrUpdateChallenge}>Create challenge</button>
          </div>
        )}
      </div>

      <div className="page-card">
        <h2 className="mb-4">Past year activity</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(53, 12px)",
            gap: 3,
            alignItems: "center",
          }}
          aria-label="Workout activity heatmap"
        >
          {days.map((d) => (
            <div
              key={d}
              title={`${d}: ${heatmap[d] ?? 0} workout(s)`}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: colorFor(heatmap[d] || 0),
                border: "1px solid #e5e7eb",
              }}
            />
          ))}
        </div>
        <div className="text-xs muted mt-2">Darker = more workouts that day</div>
      </div>

      <div className="page-card">
        <h2 className="mb-4">Workout history</h2>
        {(completed || []).length === 0 ? (
          <div className="text-sm muted">No completed workouts yet.</div>
        ) : (
          <ul className="grid grid-cols-1 gap-2">
            {completed
              .slice()
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((w) => (
                <li key={w.id} className="page-card" style={{ padding: "1rem" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base" style={{ fontWeight: 700 }}>{w.title}</div>
                      <div className="text-sm muted">{w.date}</div>
                      {!!w.description && (
                        <div className="text-xs muted" style={{ marginTop: 4 }}>{w.description}</div>
                      )}
                      {!!w.exercise_names?.length && (
                        <div className="text-xs muted" style={{ marginTop: 4 }}>
                          {w.exercise_names.join(" • ")}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="button secondary" onClick={() => onViewWorkout(w.id)}>
                        View
                      </button>
                      <button className="button" onClick={() => onEditWorkout(w.id)}>
                        Edit
                      </button>
                      <button className="button secondary" onClick={() => onDeleteWorkout(w.id)} disabled={deleting}>
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {viewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeView}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 1000,
          }}
        >
          <div
            className="page-card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(800px, 95vw)", maxHeight: "85vh", overflow: "auto", padding: 16 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-lg" style={{ fontWeight: 700 }}>
                  {viewWorkout?.title ?? "Workout"}
                </div>
                <div className="text-sm muted">{viewWorkout?.date}</div>
              </div>
              <button className="button secondary" onClick={closeView}>Close</button>
            </div>
            {!!viewWorkout?.description && (
              <p className="text-sm" style={{ marginBottom: 12 }}>{viewWorkout.description}</p>
            )}

            {(viewRows || []).length === 0 ? (
              <div className="text-sm muted">No exercises.</div>
            ) : (
              <ul className="grid grid-cols-1 gap-2">
                {viewRows.map(({ we, sets }) => (
                  <li key={we.id} className="page-card" style={{ padding: "1rem" }}>
                    <div className="text-base" style={{ fontWeight: 700 }}>
                      {we.exercise_name ?? `Exercise #${we.exercise}`}
                    </div>
                    {sets.length === 0 ? (
                      <div className="text-sm muted">No sets recorded.</div>
                    ) : (
                      <ul className="grid grid-cols-1 gap-1" style={{ marginTop: 8 }}>
                        {sets.map((s) => (
                          <li key={s.id} className="text-sm">
                            <strong>Set {s.index}:</strong>{" "}
                            Reps: {s.reps ?? "—"} • Weight: {s.weight ?? "—"} • Duration (sec): {s.duration_seconds ?? "—"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
