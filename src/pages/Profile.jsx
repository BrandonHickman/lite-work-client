import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
} from "../services/profileService";
import { getWorkouts, deleteWorkout, getWorkout } from "../services/workoutService";
import { Heatmap } from "../components/Heatmap";
import { listWorkoutExercises } from "../services/workoutExerciseService";
import { listSetsForWorkoutExercise } from "../services/workoutSetService";
import { getHeatmap } from "../services/analyticsService.js";

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
  const [bioDraft, setBioDraft] = useState("");
  const [goalDraft, setGoalDraft] = useState("");
  const [windowDraft, setWindowDraft] = useState(30);
  const [labelDraft, setLabelDraft] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [p, w, h] = await Promise.all([
          getMyProfile().catch(() => null),
          getWorkouts().catch(() => []),
          getHeatmap(365).catch(() => ({})),
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

  useEffect(() => {
    if (!profile) return;
    setBioDraft(profile.bio ?? "");
    setGoalDraft(profile.challenge_goal ?? "");
    setWindowDraft(profile.challenge_window_days ?? 30);
    setLabelDraft(profile.challenge_label ?? "");
  }, [profile]);

  const completed = useMemo(
    () => (workouts || []).filter((w) => w.completed),
    [workouts]
  );

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

  const onSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        bio: bioDraft,
        challenge_goal: goalDraft === "" ? null : Number(goalDraft),
        challenge_window_days: Number(windowDraft) || 30,
        challenge_label: labelDraft,
      };
      const updated = await updateMyProfile(payload);
      setProfile(updated);
    } finally {
      setSavingProfile(false);
    }
  };

  const onCancelProfile = () => {
    if (!profile) return;
    setBioDraft(profile.bio ?? "");
    setGoalDraft(profile.challenge_goal ?? "");
    setWindowDraft(profile.challenge_window_days ?? 30);
    setLabelDraft(profile.challenge_label ?? "");
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
      const setsLists = await Promise.all(
        (wes || []).map((we) => listSetsForWorkoutExercise(we.id))
      );
      const rows = (wes || []).map((we, idx) => ({
        we,
        sets: (setsLists[idx] ?? []).sort(
          (a, b) => a.index - b.index || a.id - b.id
        ),
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

  if (loading)
    return <div className="container page-content">Loading profile…</div>;

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
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
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
              <input
                type="file"
                accept="image/*"
                onChange={onUploadAvatar}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div className="flex-1 grid gap-4">
            <div>
              <div className="text-base" style={{ fontWeight: 600 }}>
                {profile?.first_name} {profile?.last_name}
              </div>
              {/* <div className="text-sm muted">{profile?.email}</div> */}
            </div>

            <div>
              <label className="text-sm mb-2 block">Bio</label>
              <textarea
                className="input"
                rows={3}
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder="Say a little about yourself…"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-sm mb-2 block">
                  Challenge
                </label>
                <input
                  className="input"
                  value={labelDraft}
                  onChange={(e) => setLabelDraft(e.target.value)}
                  placeholder='"20 workouts in 30 days" or "Lose 15 lbs"'
                />
              </div>
              <div>
                <label className="text-sm mb-2 block">Goal (# of workouts)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  placeholder=""
                />
              </div>
              <div>
                <label className="text-sm mb-2 block">Window (days)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={windowDraft}
                  onChange={(e) => setWindowDraft(e.target.value)}
                  placeholder="e.g., 60"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button className="button" onClick={onSaveProfile} disabled={savingProfile}>
                Save
              </button>
              <button
                className="button secondary"
                onClick={onCancelProfile}
                disabled={savingProfile}
              >
                Cancel
              </button>
              {savingProfile && <span className="text-xs muted">Saving…</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="page-card">
        <div className="flex items-center justify-between mb-6">
          <h2>Challenge</h2>
          <Link className="button" to="/workouts/create">
            + New Workout
          </Link>
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
              <div className="text-sm muted">
                Progress updates automatically as you complete workouts.
              </div>

              <div className="flex gap-2 mt-3">
                {/* <button className="button" onClick={onSaveProfile}>
                  Edit
                </button> */}
                <button
                  className="button secondary"
                  onClick={onDeleteChallenge}
                  disabled={savingProfile}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm muted">
              No challenge yet—set a goal for the next 30 days.
            </div>
            <button className="button" onClick={onSaveProfile}>
              Create challenge
            </button>
          </div>
        )}
      </div>

      <Heatmap heatmap={heatmap} />

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
                      <div className="text-base" style={{ fontWeight: 700 }}>
                        {w.title}
                      </div>
                      <div className="text-sm muted">{w.date}</div>
                      {!!w.description && (
                        <div className="text-xs muted" style={{ marginTop: 4 }}>
                          {w.description}
                        </div>
                      )}
                      {!!w.exercise_names?.length && (
                        <div className="text-xs muted" style={{ marginTop: 4 }}>
                          {w.exercise_names.join(" • ")}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="button secondary"
                        onClick={() => onViewWorkout(w.id)}
                      >
                        View
                      </button>
                      <button
                        className="button"
                        onClick={() => onEditWorkout(w.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="button secondary"
                        onClick={() => onDeleteWorkout(w.id)}
                        disabled={deleting}
                      >
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
            style={{
              width: "min(800px, 95vw)",
              maxHeight: "85vh",
              overflow: "auto",
              padding: 16,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-lg" style={{ fontWeight: 700 }}>
                  {viewWorkout?.title ?? "Workout"}
                </div>
                <div className="text-sm muted">{viewWorkout?.date}</div>
              </div>
              <button className="button secondary" onClick={closeView}>
                Close
              </button>
            </div>
            {!!viewWorkout?.description && (
              <p className="text-sm" style={{ marginBottom: 12 }}>
                {viewWorkout.description}
              </p>
            )}

            {(viewRows || []).length === 0 ? (
              <div className="text-sm muted">No exercises.</div>
            ) : (
              <ul className="grid grid-cols-1 gap-2">
                {viewRows.map(({ we, sets }) => (
                  <li
                    key={we.id}
                    className="page-card"
                    style={{ padding: "1rem" }}
                  >
                    <div className="text-base" style={{ fontWeight: 700 }}>
                      {we.exercise_name ?? `Exercise #${we.exercise}`}
                    </div>
                    {sets.length === 0 ? (
                      <div className="text-sm muted">No sets recorded.</div>
                    ) : (
                      <ul
                        className="grid grid-cols-1 gap-1"
                        style={{ marginTop: 8 }}
                      >
                        {sets.map((s) => (
                          <li key={s.id} className="text-sm">
                            <strong>Set {s.index}:</strong> Reps: {s.reps ?? "—"} •
                            Weight: {s.weight ?? "—"} • Duration (sec):{" "}
                            {s.duration_seconds ?? "—"}
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
