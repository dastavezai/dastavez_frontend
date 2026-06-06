import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';

export default function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  // Try to get email from navigation state, localStorage, or default to empty string
  const initialEmail = location.state?.email || localStorage.getItem('lastLoginEmail') || '';
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>("idle");
  const [message, setMessage] = useState("");

  // If email is present, submit automatically on mount
  useEffect(() => {
    if (email) {
      handleSubmitAuto();
    }
    // eslint-disable-next-line
  }, []);

  const handleSubmitAuto = async () => {
    setStatus('loading');
    setMessage("");
    try {
      const data = await authAPI.forgotPassword(email);
      setStatus('success');
      setMessage(data.message || 'Password reset instructions sent to your email.');
      setTimeout(() => {
        navigate('/verify-reset-otp', { state: { email } });
      }, 1000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Failed to send reset instructions.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitAuto();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-judicial-dark">
      <div className="bg-judicial-navy/80 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-judicial-gold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full p-3 rounded bg-judicial-blue/20 text-white border border-judicial-gold/30 focus:outline-none focus:ring-2 focus:ring-judicial-gold"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded bg-judicial-gold text-judicial-dark font-semibold hover:bg-judicial-gold/90 transition"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        {status !== 'idle' && (
          <div className={`mt-4 text-center ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message}</div>
        )}
      </div>
    </div>
  );
} 