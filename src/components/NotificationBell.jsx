import { useEffect, useState } from "react";

/**
 * Placeholder bell with a badge.
 * Later, replace the "loadCount" with a real fetch to your /notifications endpoint.
 */
export default function NotificationBell({ onClick }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // TODO: Replace with real API call (e.g., unread follows/messages)
    const loadCount = async () => {
      // Example: setCount((await api.get('/notifications/unread-count')).count)
      setCount(0); // start at 0 for MVP
    };
    loadCount();
  }, []);

  return (
    <button
      aria-label="Notifications"
      onClick={onClick}
      style={{
        position: "relative",
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--bg)",
        color: "var(--text)",
        cursor: "pointer"
      }}
    >
      {/* Bell icon (SVG) */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 005 15h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 01-2.995-2.824L9 19h6a3 3 0 01-2.824 2.995L12 22z"/>
      </svg>
      {count > 0 && (
        <span
          aria-label={`${count} unread notifications`}
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            minWidth: 16,
            height: 16,
            padding: "0 4px",
            background: "#d00",
            color: "#fff",
            borderRadius: 999,
            fontSize: 10,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
