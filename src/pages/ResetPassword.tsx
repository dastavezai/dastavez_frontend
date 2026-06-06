import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage("");
    try {
      const data = await authAPI.resetPassword(email, otp, newPassword, confirmPassword);
      if (data) {
        setStatus('success');
        setMessage(data.message || 'Password reset successfully.');
        setTimeout(() => {
          navigate('/auth');
        }, 1500);
      } else {
        setStatus('error');
        setMessage('Failed to reset password.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-judicial-dark">
      <div className="bg-judicial-navy/80 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-judicial-gold mb-4 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="w-full p-3 rounded bg-judicial-blue/20 text-white border border-judicial-gold/30 focus:outline-none focus:ring-2 focus:ring-judicial-gold"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-3 rounded bg-judicial-blue/20 text-white border border-judicial-gold/30 focus:outline-none focus:ring-2 focus:ring-judicial-gold"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />  
          <button
            type="submit"
            className="w-full py-3 rounded bg-judicial-gold text-judicial-dark font-semibold hover:bg-judicial-gold/90 transition"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {status !== 'idle' && (
          <div className={`mt-4 text-center ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message}</div>
        )}
      </div>
    </div>
  );
} 