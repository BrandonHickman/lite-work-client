import { useEffect, useState } from "react";
import { getWorkouts } from "../services/workoutService";
import { Link } from "react-router-dom";

export default function Workouts() {
  const [workouts, setWorkouts] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getWorkouts()
      .then(setWorkouts)
      .catch(() => setErr("Failed to fetch workouts (are you logged in?)"));
  }, []);

  if (err) return <div style={{ color: "crimson" }}>{err}</div>;
  if (!workouts) return <div>Loading…</div>;

  return (
    <div className="container page-content">
      <div className="page-card">
        <div className="flex justify-between items-center mb-4">
          <h1>Workouts</h1>
          <Link to="/workouts/create" className="button">
            + Create Workout
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div>No workouts yet.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-3 md:gap-6" style={{ listStyle: "none", padding: 0 }}>
            {workouts.map((w) => (
              <li key={w.id} className="page-card" style={{ padding: "1rem" }}>
                <div className="flex justify-between items-center">
                  <strong>{w.title}</strong>
                  <span>{w.completed ? "✅" : "⏳"}</span>
                </div>
                <div className="text-sm muted mt-2">{w.date}</div>
                {w.description && <div className="mt-2">{w.description}</div>}
                <Link to={`/workouts/${w.id}`} className="button mt-4" style={{ display: "inline-block" }}>
                  Open session →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
