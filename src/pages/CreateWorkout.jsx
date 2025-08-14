import { useEffect, useState } from 'react';
import { createWorkout, addExercisesToWorkout } from '../services/workoutService';
import { getMuscleGroups } from '../services/muscleService';
import { getExercisesByMuscles } from '../services/exerciseService';
import { useNavigate } from 'react-router-dom';

export default function CreateWorkout() {
  const nav = useNavigate();
  const [title, setTitle] = useState('My Workout');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [description, setDesc] = useState('');
  const [duration, setDuration] = useState(45);
  const [muscles, setMuscles] = useState([]);
  const [exerciseIds, setExerciseIds] = useState([]);
  const [allMuscles, setAllMuscles] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getMuscleGroups().then(setAllMuscles).catch(()=>{}); }, []);
  useEffect(() => { getExercisesByMuscles(muscles).then(setExercises).catch(()=>{}); }, [muscles]);

  const toggleMuscle = (id) =>
    setMuscles(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const toggleExercise = (id) =>
    setExerciseIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  async function onCreate() {
    setLoading(true);
    try {
      const workout = await createWorkout({
        title,
        date,
        description,
        duration_minutes: duration,
        workout_type: null,
        completed: false
      });
      if (exerciseIds.length) {
        await addExercisesToWorkout(workout.id, exerciseIds);
      }
      nav(`/workouts/${workout.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 960, margin:'0 auto', padding:16, display:'grid', gap:16 }}>
      <h2>Create Workout</h2>

      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <textarea value={description} onChange={e=>setDesc(e.target.value)} placeholder="Description" />
      <input type="number" value={duration} onChange={e=>setDuration(Number(e.target.value))} placeholder="Duration (min)" />

      <section>
        <h3>Select muscle groups</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:8 }}>
          {allMuscles.sort((a,b)=>a.id-b.id).map(m => (
            <label key={m.id} style={{ border:'1px solid #ddd', borderRadius:8, padding:8 }}>
              <input type="checkbox" checked={muscles.includes(m.id)} onChange={()=>toggleMuscle(m.id)} /> {m.name}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3>Pick exercises</h3>
        <div style={{ display:'grid', gap:8 }}>
          {exercises.map(ex => (
            <label key={ex.id} style={{ border:'1px solid #ddd', borderRadius:8, padding:8, display:'flex', gap:8 }}>
              <input type="checkbox" checked={exerciseIds.includes(ex.id)} onChange={()=>toggleExercise(ex.id)} />
              <div>
                <div><strong>{ex.name}</strong></div>
                <div style={{ fontSize:12, opacity:.7 }}>{ex.category}</div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <button onClick={onCreate} disabled={loading}>{loading ? 'Creating…' : 'Create Workout'}</button>
    </div>
  );
}
