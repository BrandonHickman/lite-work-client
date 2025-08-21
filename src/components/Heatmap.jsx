import { useMemo } from "react";

export function Heatmap({ heatmap }) {
  const squareSize = 10;
  const gap = 3;

  const days = useMemo(() => {
    const days = [];
    const today = new Date();
    const startMonth = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let current = new Date(startMonth);
    while (current <= endMonth) {
      days.push({
        d: new Date(current),
        date: current.toISOString().slice(0, 10),
        month: current.toLocaleString("default", { month: "short" }),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, []);

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(heatmap || {})),
    [heatmap]
  );

  const colorFor = (count) => {
    if (!count) return "var(--mutedx)";
    const t = count / maxCount;
    if (t < 0.25) return "#d1fae5";
    if (t < 0.5) return "#a7f3d0";
    if (t < 0.75) return "#6ee7b7";
    return "#34d399";
  };

  const heatmapData = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return days.map((day) => ({
      ...day,
      count: day.date > todayStr ? 0 : heatmap[day.date] ?? 0,
    }));
  }, [days, heatmap]);

  const gridData = useMemo(() => {
    const totalDays = days.length;
    const offset = days[0].d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const totalSlots = offset + totalDays;
    const numColumns = Math.ceil(totalSlots / 7);

    // Compute month groups
    const monthGroups = [];
    let currentMonth = null;
    let startCol = 0;
    let span = 0;

    for (let col = 0; col < numColumns; col++) {
      let firstDay = null;
      for (let row = 0; row < 7; row++) {
        const slot = col * 7 + row;
        if (slot >= offset && slot - offset < totalDays) {
          firstDay = days[slot - offset];
          break;
        }
      }
      if (!firstDay) continue;

      const month = firstDay.month;
      if (month !== currentMonth) {
        if (currentMonth !== null) {
          monthGroups.push({
            month: currentMonth,
            colStart: startCol + 2, // grid column 2 is first week
            span,
          });
        }
        currentMonth = month;
        startCol = col;
        span = 1;
      } else {
        span++;
      }
    }
    if (currentMonth !== null) {
      monthGroups.push({
        month: currentMonth,
        colStart: startCol + 2,
        span,
      });
    }

    // Compute squares
    const squares = [];
    for (let col = 0; col < numColumns; col++) {
      for (let row = 0; row < 7; row++) {
        const slot = col * 7 + row;
        let background = "#e5e7eb";
        let title = "";
        let isEmpty = true;
        if (slot >= offset && slot - offset < totalDays) {
          const day = heatmapData[slot - offset];
          background = colorFor(day.count);
          title = `${day.date}: ${day.count} workout(s)`;
          isEmpty = false;
        }
        squares.push({
          col,
          row,
          background,
          title,
          isEmpty,
        });
      }
    }

    return { numColumns, monthGroups, squares };
  }, [days, heatmapData]);

  const daysOfWeekLabels = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

  return (
    <div className="page-card">
      <h2 className="mb-4">Past year activity</h2>
      <div style={{ overflowX: "auto", paddingBottom: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `40px repeat(${gridData.numColumns}, ${squareSize}px)`,
            gap: `${gap}px`,
            minWidth: "fit-content",
          }}
          aria-label="Workout activity heatmap"
        >
          {/* Month labels */}
          {gridData.monthGroups.map((group) => (
            <div
              key={group.month}
              style={{
                gridRow: 1,
                gridColumn: `${group.colStart} / span ${group.span}`,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-primary)",
                textAlign: "left",
              }}
            >
              {group.month}
            </div>
          ))}

          {/* Day of week labels */}
          {daysOfWeekLabels.map((label, idx) => (
            <div
              key={idx}
              style={{
                gridRow: idx + 2,
                gridColumn: 1,
                textAlign: "right",
                fontSize: 10,
                color: "var(--color-primary)",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {label}
            </div>
          ))}

          {/* Squares */}
          {gridData.squares.map((square, idx) =>
            square.isEmpty ? null : (
              <div
                key={idx}
                title={square.title}
                style={{
                  gridRow: square.row + 2,
                  gridColumn: square.col + 2,
                  width: squareSize,
                  height: squareSize,
                  borderRadius: 2,
                  background: square.background,
                  border: "var(--mutedx)",
                }}
              />
            )
          )}
        </div>
      </div>
      <div className="text-xs muted mt-2">Darker = more workouts that day</div>
    </div>
  );
}