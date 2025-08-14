import { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login({ username, password });
      nav('/workouts');
    } catch {
      setErr('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, margin:'0 auto', display:'grid', gap:12 }}>
      <h2>Log in</h2>
      {err && <div style={{ color:'crimson' }}>{err}</div>}
      <input placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
      <button disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
    </form>
  );
}
