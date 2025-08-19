// import { useEffect, useState } from "react";
// import { getWorkouts } from "../services/workoutService";
// import { Link } from "react-router-dom";

// export default function Workouts() {
//   const [workouts, setWorkouts] = useState(null);
//   const [err, setErr] = useState(null);

//   useEffect(() => {
//     getWorkouts()
//       .then(setWorkouts)
//       .catch(() => setErr("Failed to fetch workouts (are you logged in?)"));
//   }, []);

//   if (err) return <div style={{ color: "crimson" }}>{err}</div>;
//   if (!workouts) return <div>Loading…</div>;

//   return (
//     <div className="container page-content">
//       <div className="page-card">
//         <div className="flex justify-between items-center mb-4">
//           <h1>Workouts</h1>
//           <Link to="/workouts/create" className="button">
//             + Create Workout
//           </Link>
//         </div>

//         {workouts.length === 0 ? (
//           <div>No workouts yet.</div>
//         ) : (
//           <ul className="grid grid-cols-1 md:grid-cols-3 md:gap-6" style={{ listStyle: "none", padding: 0 }}>
//             {workouts.map((w) => (
//               <li key={w.id} className="page-card" style={{ padding: "1rem" }}>
//                 <div className="flex justify-between items-center">
//                   <strong>{w.title}</strong>
//                   <span>{w.completed ? "✅" : "⏳"}</span>
//                 </div>
//                 <div className="text-sm muted mt-2">{w.date}</div>
//                 {w.description && <div className="mt-2">{w.description}</div>}
//                 <Link to={`/workouts/${w.id}`} className="button mt-4" style={{ display: "inline-block" }}>
//                   Open session →
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { getWorkoutTemplates, startTemplate } from "../services/templateService";
import { useNavigate } from "react-router-dom";

export default function Workouts() {
  const nav = useNavigate();
  const [templates, setTemplates] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const t = await getWorkoutTemplates().catch(() => []);
      if (!mounted) return;
      setTemplates(t || []);
    })();
    return () => (mounted = false);
  }, []);

  const onStart = async (templateId) => {
    const w = await startTemplate(templateId);
    nav(`/workouts/${w.id}`);
  };

  if (!templates) return <div className="container page-content">Loading…</div>;

  return (
    <div className="container page-content">
      <div className="page-card">
        <h1>Premade Workouts</h1>
      </div>

      {templates.length === 0 ? (
        <div className="page-card">No templates yet.</div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map(t => (
            <li key={t.id} className="page-card" style={{ padding: "1rem" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base" style={{ fontWeight: 700 }}>{t.title}</div>
                  {!!t.description && <div className="text-sm muted">{t.description}</div>}
                  {!!t.exercise_names?.length && (
                    <div className="text-xs muted" style={{ marginTop: 4 }}>
                      {t.exercise_names.join(" • ")}
                    </div>
                  )}
                </div>
                <button className="button" onClick={() => onStart(t.id)}>
                  Start workout
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
