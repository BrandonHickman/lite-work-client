import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { logout } from "../services/authService";
import "./Navbar.css";

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState("light");
  const [token, setToken] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
    setToken(localStorage.getItem("token") || null);
  }, []);

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token") || null);
    window.addEventListener("auth-changed", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("auth-changed", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  useEffect(() => {
    setToken(localStorage.getItem("token") || null);
  }, [location]);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
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

  function handleLogout() {
    logout();
    setMenuOpen(false);
    nav("/login");
  }

  return (
    <header className="nav">
      <div className="nav__inner">
        {/* Brand */}
        <Link to="/" className="nav__brand">
          LiteWork
        </Link>

        {/* Left-side links (only when logged in) */}
        {token && (
          <div className="nav__leftlinks">
            <NavLink to="/workouts" className="nav__link">
              Workouts
            </NavLink>
            <NavLink to="/my-workouts" className="nav__link">
              My Workouts
            </NavLink>
          </div>
        )}

        {/* Right-side controls */}
        <nav className="nav__right">
          <button
            className="nav__iconbtn"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === "light" ? "🌞" : "🌙"}
          </button>
          <button className="nav__iconbtn" title="Notifications">
            🔔
          </button>

          {!token ? (
            <>
              <NavLink to="/login" className="nav__link">
                Login
              </NavLink>
              <NavLink to="/register" className="nav__link">
                Register
              </NavLink>
            </>
          ) : (
            <div className="profile" ref={menuRef}>
              <button
                className="profile__btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                title="Profile"
              >
                <span className="profile__avatar">☰</span>
              </button>
              {menuOpen && (
                <div className="profile__menu" role="menu">
                  <NavLink
                    to="/profile"
                    className="profile__item"
                    onClick={() => setMenuOpen(false)}
                  >
                    View Profile
                  </NavLink>
                  <button className="profile__item" onClick={handleLogout}>
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
