import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./Navbar.css";

export default function Navbar() {
  const nav = useNavigate();
  const [theme, setTheme] = useState("light");
  const [token, setToken] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Load theme + token on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);

    setToken(localStorage.getItem("token") || null);

    const onStorage = () => setToken(localStorage.getItem("token") || null);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  function logout() {
    try { localStorage.removeItem("token"); } catch {}
    setToken(null);
    setMenuOpen(false);
    nav("/login");
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/workouts" className="nav__brand">LiteWork</NavLink>

        <nav className="nav__right">
          {/* Theme toggle */}
          <button className="nav__iconbtn" onClick={toggleTheme} title="Toggle theme">
            {theme === "light" ? "🌞" : "🌙"}
          </button>

          {/* Notification bell (placeholder) */}
          <button className="nav__iconbtn" title="Notifications">🔔</button>

          {/* Auth links / Profile menu */}
          {!token ? (
            <NavLink to="/login" className="nav__link">Login</NavLink>
          ) : (
            <div className="profile" ref={menuRef}>
              <button
                className="profile__btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                title="Profile"
              >
                {/* Hamburger / avatar placeholder */}
                <span className="profile__avatar">☰</span>
              </button>
              {menuOpen && (
                <div className="profile__menu" role="menu">
                  <NavLink to="/profile" className="profile__item" onClick={() => setMenuOpen(false)}>
                    View Profile
                  </NavLink>
                  <button className="profile__item" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
