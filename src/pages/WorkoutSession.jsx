import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWorkout, completeWorkout } from '../services/workoutService';
import { getWorkoutExercises, updateWorkoutExercise } from '../services/workoutExerciseService';

export default function WorkoutSession() {
  const { id } = useParams();
  const workoutId = Number(id);
  const [workout, setWorkout] = useState(null);
  const [rows, setRows] = useState(null);
  const [saving, setSaving] = useState(null);
  const [completing, setCompleting] = useState(false);

  async function load() {
    const [w, r] = await Promise.all([
      getWorkout(workoutId),
      getWorkoutExercises(workoutId)
    ]);
    setWorkout(w);
    setRows(r);
  }

  useEffect(() => { load().catch(()=>{}); }, [workoutId]);

  async function updateRow(rowId, payload) {
    setSaving(rowId);
    try {
      await updateWorkoutExercise(rowId, payload);
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function complete() {
    setCompleting(true);
    try {
      await completeWorkout(workoutId);
      await load();
    } finally {
      setCompleting(false);
    }
  }

  if (!workout || !rows) return <div style={{ padding:16 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 960, margin:'0 auto', padding:16, display:'grid', gap:16 }}>
      <h2>{workout.title}</h2>
      <div style={{ fontSize:12, opacity:.7 }}>
        {workout.date} • {workout.completed ? '✅ Completed' : '⏳ In progress'}
      </div>

      {rows.map(r => (
        <div key={r.id} style={{ border:'1px solid #ddd', borderRadius:8, padding:12 }}>
          <div style={{ fontSize:14, marginBottom:8 }}>
            Exercise #{r.exercise} • position {r.position}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, marginBottom:8 }}>
            <input
              type="number"
              placeholder="Sets"
              defaultValue={r.sets ?? ''}
              onBlur={(e)=>updateRow(r.id, { sets: e.target.value ? Number(e.target.value) : null })}
              disabled={saving===r.id}
            />
            <input
              type="number"
              placeholder="Reps"
              defaultValue={r.reps ?? ''}
              onBlur={(e)=>updateRow(r.id, { reps: e.target.value ? Number(e.target.value) : null })}
              disabled={saving===r.id}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Weight"
              defaultValue={r.weight ?? ''}
              onBlur={(e)=>updateRow(r.id, { weight: e.target.value ? Number(e.target.value) : null })}
              disabled={saving===r.id}
            />
          </div>
          <input
            type="number"
            placeholder="Duration (sec)"
            defaultValue={r.duration_seconds ?? ''}
            onBlur={(e)=>updateRow(r.id, { duration_seconds: e.target.value ? Number(e.target.value) : null })}
            disabled={saving===r.id}
            style={{ width:'100%' }}
          />
        </div>
      ))}

      {!workout.completed && (
        <button onClick={complete} disabled={completing} style={{ width:200 }}>
          {completing ? 'Finishing…' : 'Finish workout'}
        </button>
      )}
    </div>
  );
}
