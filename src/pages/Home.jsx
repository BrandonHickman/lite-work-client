import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile } from "../services/profileService";
import { getWorkouts } from "../services/workoutService";
import { listWorkoutExercises } from "../services/workoutExerciseService";
import { listSetsForWorkoutExercise } from "../services/workoutSetService";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [workouts, setWorkouts] = useState([]);


  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalWorkout, setModalWorkout] = useState(null);
  const [modalRows, setModalRows] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [p, w] = await Promise.all([
          getMyProfile().catch(() => null),
          getWorkouts().catch(() => []),
        ]);
        if (!mounted) return;
        setProfile(p || {});
        setWorkouts(w || []);
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
  const progress = goal ? Math.min(100, Math.round((completedLast30.length / goal) * 100)) : 0;

  const inProgress = useMemo(() => (workouts || []).filter((w) => !w.completed), [workouts]);
  const recentCompleted = useMemo(
    () =>
      completed
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 10),
    [completed]
  );


  const onViewWorkout = async (w) => {
    setModalOpen(true);
    setModalWorkout(w);
    setModalRows([]);
    setModalLoading(true);
    try {
      const wes = await listWorkoutExercises(w.id);
      const setsLists = await Promise.all(
        (wes || []).map((we) => listSetsForWorkoutExercise(we.id))
      );
      const combined = (wes || []).map((we, idx) => ({
        we,
        sets: (setsLists[idx] ?? []).sort((a, b) => a.index - b.index || a.id - b.id),
      }));
      setModalRows(combined);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalWorkout(null);
    setModalRows([]);
  };

  if (loading) return <div className="container page-content">Loading…</div>;

  return (
    <div className="container page-content">
      <div className="page-card">
        <div className="flex items-center justify-between mb-6">
          <h1>Welcome back</h1>
          <Link className="button" to="/workouts/create">
            + New Workout
          </Link>
        </div>

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
            {goal ? (
              <>
                <div className="text-lg" style={{ fontWeight: 700 }}>
                  {completedLast30.length}/{goal} workouts in the last 30 days
                </div>
                <div className="text-sm muted">
                  Progress updates automatically as you complete workouts.
                </div>
              </>
            ) : (
              <div className="text-sm muted">No challenge set yet—configure it in your profile.</div>
            )}
          </div>
        </div>
      </div>

      <div className="page-card">
        <div className="flex items-center justify-between mb-4">
          <h2>In progress</h2>
          <Link className="button secondary" to="/workouts">
            Browse Workouts
          </Link>
        </div>
        {inProgress.length === 0 ? (
          <div className="text-sm muted">No workouts in progress.</div>
        ) : (
          <ul className="grid grid-cols-1 gap-2">
            {inProgress
              .slice()
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((w) => (
                <li key={w.id} className="page-card" style={{ padding: "1rem" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base" style={{ fontWeight: 700 }}>
                        ⏱ {w.title}
                      </div>
                      <div className="text-sm muted">{w.date}</div>
                      {!!w.description && (
                        <div className="text-xs muted" style={{ marginTop: 4 }}>
                          {w.description}
                        </div>
                      )}
                    </div>
                    <Link className="button" to={`/workouts/${w.id}`}>
                      Continue
                    </Link>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="page-card">
        <h2 className="mb-4">Recent workouts</h2>
        {recentCompleted.length === 0 ? (
          <div className="text-sm muted">No completed workouts yet.</div>
        ) : (
          <ul className="grid grid-cols-1 gap-2">
            {recentCompleted.map((w) => (
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
                  </div>
                  <div className="flex gap-2">
                    <button className="button" onClick={() => onViewWorkout(w)}>
                      View
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="page-card"
            style={{
              width: "min(720px, 92vw)",
              maxHeight: "80vh",
              overflow: "auto",
              padding: "1rem",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-lg" style={{ fontWeight: 700 }}>
                  {modalWorkout?.title}
                </div>
                <div className="text-sm muted">{modalWorkout?.date}</div>
                {!!modalWorkout?.description && (
                  <div className="text-xs muted" style={{ marginTop: 4 }}>
                    {modalWorkout.description}
                  </div>
                )}
              </div>
              <button className="button secondary" onClick={closeModal}>
                Close
              </button>
            </div>

            {modalLoading ? (
              <div className="text-sm">Loading details…</div>
            ) : modalRows.length === 0 ? (
              <div className="text-sm muted">No exercises.</div>
            ) : (
              <ul className="grid grid-cols-1 gap-2">
                {modalRows.map(({ we, sets }) => (
                  <li key={we.id} className="page-card" style={{ padding: "1rem" }}>
                    <div className="text-base" style={{ fontWeight: 700 }}>
                      {we.exercise_name ?? `Exercise #${we.exercise}`}
                    </div>
                    {sets.length === 0 ? (
                      <div className="text-sm muted" style={{ marginTop: 6 }}>
                        No sets recorded.
                      </div>
                    ) : (
                      <table className="table" style={{ marginTop: 8, width: "100%" }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left" }}>Set</th>
                            <th style={{ textAlign: "left" }}>Reps</th>
                            <th style={{ textAlign: "left" }}>Weight</th>
                            <th style={{ textAlign: "left" }}>Duration (sec)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sets.map((s) => (
                            <tr key={s.id}>
                              <td>{s.index}</td>
                              <td>{s.reps ?? "—"}</td>
                              <td>{s.weight ?? "—"}</td>
                              <td>{s.duration_seconds ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
