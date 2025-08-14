import useTheme from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggle, setTheme } = useTheme();

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {/* Optional: a quick cycle button */}
      <button
        onClick={toggle}
        title={`Theme: ${theme}`}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--bg)",
          color: "var(--text)",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        {theme === "dark" ? "🌙 Dark" : theme === "light" ? "☀️ Light" : "🖥 System"}
      </button>

      {/* Optional: explicit selector */}
      {/* 
      <select
        value={theme}
        onChange={e => setTheme(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      */}
    </div>
  );
}
