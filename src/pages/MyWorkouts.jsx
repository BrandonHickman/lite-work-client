import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkouts } from "../services/workoutService";

export default function MyWorkouts() {
  const [workouts, setWorkouts] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const w = await getWorkouts().catch(() => []);
      if (!mounted) return;
      setWorkouts((w || []).filter(x => !x.completed));
    })();
    return () => (mounted = false);
  }, []);

  if (!workouts) return <div className="container page-content">Loading…</div>;

  return (
    <div className="container page-content">
      <div className="page-card">
        <h1>My Workouts</h1>
      </div>

      {workouts.length === 0 ? (
        <div className="page-card">No in-progress workouts. <Link to="/workouts/create">Start one</Link>.</div>
      ) : (
        <ul className="grid grid-cols-1 gap-2">
          {workouts.map(w => (
            <li key={w.id} className="page-card" style={{ padding: "1rem" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base" style={{ fontWeight: 700 }}>⏳ {w.title}</div>
                  <div className="text-sm muted">{w.date}</div>
                </div>
                <Link className="button" to={`/workouts/${w.id}`}>Resume</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
