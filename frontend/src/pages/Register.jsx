import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
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
        <Link to="/register" className="brand">
          <span className="brand-mark">
            <Droplet size={17} color="#fff" strokeWidth={2.5} />
          </span>
          <span className="brand-name">Sweety</span>
        </Link>

        <div className="auth-copy">
          <h2>Start tracking in under a minute.</h2>
          <p>
            No spreadsheets, no paper logs. Sweety validates every entry — the right range,
            no duplicate slots, no future dates — so your reports stay accurate.
          </p>
        </div>

        <div className="auth-stats">
          <div>
            <span className="num">Private</span>
            <span className="label">only you see your data</span>
          </div>
          <div>
            <span className="num">Free</span>
            <span className="label">to use</span>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h2>Create your account</h2>
          <p className="auth-subtitle">Takes less than a minute.</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label>
              Name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
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
                minLength={6}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign up'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
