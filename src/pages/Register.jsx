import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerUser } from '../services/authService';

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);


    if (!form.username || !form.email || !form.password || !form.first_name || !form.last_name) {
      setErr('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirm) {
      setErr('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      nav('/workouts');
    } catch (e) {
      setErr('Registration failed. Try a different username/email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page-content">
      <div className="page-card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2 className="mb-4">Create an account</h2>

        {err && (
          <div className="mb-4 text-sm" style={{ color: '#ff6b6b' }}>
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="text-sm">First Name</label>
            <input
              className="input mt-2"
              placeholder=""
              value={form.first_name}
              onChange={update('first_name')}
              autoComplete="first_name"
              required
            />
          </div>
          <div>
            <label className="text-sm">Last Name</label>
            <input
              className="input mt-2"
              placeholder=""
              value={form.last_name}
              onChange={update('last_name')}
              autoComplete="last_name"
              required
            />
          </div>
          <div>
            <label className="text-sm">Username</label>
            <input
              className="input mt-2"
              placeholder=""
              value={form.username}
              onChange={update('username')}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="text-sm">Email</label>
            <input
              className="input mt-2"
              type="email"
              placeholder=""
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-sm">Password</label>
            <input
              className="input mt-2"
              type="password"
              placeholder=""
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="text-sm">Confirm password</label>
            <input
              className="input mt-2"
              type="password"
              placeholder=""
              value={form.confirm}
              onChange={update('confirm')}
              autoComplete="new-password"
              required
            />
          </div>

          <button className="button" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <div className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
}
