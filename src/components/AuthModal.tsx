import { useState } from 'react';
import { login, register } from '../api/api';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../store/useAuthStore';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const storeLogin = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = isLogin 
        ? await login({ email, password })
        : await register({ username, email, password });
      
      storeLogin(data.user, data.accessToken);
      showToast(isLogin ? 'Logged in successfully!' : 'Registered successfully!');
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay open" onClick={onClose}>
      <div className="overlay-content auth-modal" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h2>{isLogin ? 'LOGIN' : 'REGISTER'}</h2>
          <button type="button" className="btn-close" onClick={onClose}>X</button>
        </div>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-row">
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Create account' : 'Back to login'}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}