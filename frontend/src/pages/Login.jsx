import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <Link to="/login" className="brand">
          <span className="brand-mark">
            <Droplet size={17} color="#fff" strokeWidth={2.5} />
          </span>
          <span className="brand-name">Sweety</span>
        </Link>

        <div className="auth-copy">
          <h2>A clearer picture of your blood glucose, every day.</h2>
          <p>
            Log up to four readings a day — morning, after breakfast, after lunch, after
            dinner — and see daily, month-to-date and monthly trends at a glance.
          </p>
        </div>

        <div className="auth-stats">
          <div>
            <span className="num">4×</span>
            <span className="label">daily check-ins</span>
          </div>
          <div>
            <span className="num">40–600</span>
            <span className="label">mg/dl tracked range</span>
          </div>
          <div>
            <span className="num">3</span>
            <span className="label">report views</span>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Log in to see today's readings.</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
