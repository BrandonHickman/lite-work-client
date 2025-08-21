import { useEffect, useState } from "react";
import { getMuscleGroups } from "../services/muscleService";

export default function MuscleSelection({ selected, onChange }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMuscleGroups();
        if (mounted) setGroups(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const toggle = (id) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    onChange(next);
  };

  if (loading) return <div className="text-sm">Loading muscle groups…</div>;

  return (
    <div className="page-card">
      <h2 className="mb-4">Select muscle groups</h2>
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const isActive = selected.includes(g.id);
          return (
            <button
              type="button"
              key={g.id}
              onClick={(e) => {
                e.preventDefault();
                toggle(g.id);
              }}
              className="chip"
              data-active={isActive ? "true" : "false"}
              title={g.name}
            >
              {g.name}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm muted">
        Tip: Selecting muscle group(s) will filter the exercises!
      </p>
    </div>
  );
}
