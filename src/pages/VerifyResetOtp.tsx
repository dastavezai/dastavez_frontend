import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function VerifyResetOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage("");
    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'OTP verified successfully.');
        setTimeout(() => {
          navigate('/reset-password', { state: { email, otp } });
        }, 1000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-judicial-dark">
      <div className="bg-judicial-navy/80 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-judicial-gold mb-4 text-center">Verify OTP</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full p-3 rounded bg-judicial-blue/20 text-white border border-judicial-gold/30 focus:outline-none focus:ring-2 focus:ring-judicial-gold"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            maxLength={6}
          />
          <button
            type="submit"
            className="w-full py-3 rounded bg-judicial-gold text-judicial-dark font-semibold hover:bg-judicial-gold/90 transition"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        {status !== 'idle' && (
          <div className={`mt-4 text-center ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message}</div>
        )}
      </div>
    </div>
  );
} 