import { useEffect, useState } from 'react';
import { getWorkouts } from '../services/workoutService';

export default function Workouts() {
  const [workouts, setWorkouts] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getWorkouts().then(setWorkouts).catch(() => setErr('Failed to fetch workouts (are you logged in?)'));
  }, []);

  if (err) return <div style={{ color:'crimson' }}>{err}</div>;
  if (!workouts) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 960, margin:'0 auto', padding:16 }}>
      <h2>Your Workouts</h2>
      {workouts.length === 0 && <div>No workouts yet.</div>}
      <ul style={{ padding:0, listStyle:'none', display:'grid', gap:12 }}>
        {workouts.map(w => (
          <li key={w.id} style={{ border:'1px solid #ddd', borderRadius:8, padding:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <strong>{w.title}</strong>
              <span>{w.completed ? '✅' : '⏳'}</span>
            </div>
            <div style={{ fontSize:12, opacity:.7 }}>{w.date}</div>
            <div style={{ marginTop:8 }}>{w.description}</div>
            <a href={`/workouts/${w.id}`} style={{ display:'inline-block', marginTop:8 }}>Open session →</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
