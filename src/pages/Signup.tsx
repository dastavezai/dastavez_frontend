import { useState } from 'react';
import { z } from 'zod';
import FloatingCard from '../components/FloatingCard';
import GavelAnimation from '../components/GavelAnimation';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const emailSchema = z.string().email('Please enter a valid email address');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const otpSchema = z.string().regex(/^\d{6}$/, 'OTP must be 6 digits');

const inputClasses = `
  w-full p-3 rounded-lg
  bg-gradient-to-br from-judicial-blue/30 to-judicial-blue/10
  text-white
  border border-judicial-gold/30
  shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
  backdrop-blur-lg
  focus:outline-none focus:ring-2 focus:ring-judicial-lightGold focus:border-transparent
  transition-all duration-300
  hover:bg-judicial-blue/40
  transform hover:translate-y-[-2px]
  placeholder-judicial-lightGold/50
`;

const buttonClasses = `
  w-full py-3 px-4 rounded-lg
  bg-gradient-to-br from-judicial-gold to-judicial-accent
  text-judicial-dark font-semibold
  shadow-lg shadow-judicial-gold/20
  transition-all duration-300
  disabled:opacity-50
  transform hover:scale-[1.02] hover:shadow-xl
  hover:from-judicial-lightGold hover:to-judicial-gold
  active:scale-[0.98]
`;

export default function Signup() {
  type SignupForm = {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    otp: string;
  };
  type SignupErrors = Partial<Record<keyof SignupForm, string>>;

  const navigate = useNavigate();

  // Get email from localStorage or default to empty string
  const storedEmail = localStorage.getItem('signupEmail') || '';

  const [form, setForm] = useState<SignupForm>({
    email: storedEmail,
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let valid = true;
    let errs: SignupErrors = {};
    try { nameSchema.parse(form.firstName); } catch (e) { errs.firstName = e.errors?.[0]?.message; valid = false; }
    try { nameSchema.parse(form.lastName); } catch (e) { errs.lastName = e.errors?.[0]?.message; valid = false; }
    try { passwordSchema.parse(form.password); } catch (e) { errs.password = e.errors?.[0]?.message; valid = false; }
    if (form.password !== form.confirmPassword) { errs.confirmPassword = 'Passwords do not match'; valid = false; }
    try { otpSchema.parse(form.otp); } catch (e) { errs.otp = e.errors?.[0]?.message; valid = false; }
    setErrors(errs);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
              await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          otp: form.otp,
        }),
      });
      // Redirect or show success message here
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pb-20">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/courthouse.jpg')`, filter: 'brightness(0.3)' }} />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-judicial-dark to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-judicial-dark to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-md px-6 -mt-20">
        <div className="mb-8 text-center">
          <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
            <GavelAnimation />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-judicial-gold to-judicial-lightGold bg-clip-text text-transparent">
            Dastawez AI
          </h1>
          <p className="text-judicial-lightGold/80 text-lg">Legal Intelligence Platform</p>
        </div>
        <FloatingCard>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-judicial-gold mb-2">Create your account</h2>
            <p className="text-judicial-lightGold/80">Sign up to get started</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email address" value={form.email} disabled className={inputClasses + ' opacity-60 cursor-not-allowed'} />
            {errors?.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            <input type="text" placeholder="First Name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className={inputClasses} />
            {errors?.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
            <input type="text" placeholder="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className={inputClasses} />
            {errors?.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputClasses} />
            {errors?.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} className={inputClasses} />
            {errors?.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            <input type="text" placeholder="OTP" value={form.otp} onChange={e => setForm(f => ({ ...f, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className={inputClasses} />
            {errors?.otp && <p className="mt-1 text-sm text-red-500">{errors.otp}</p>}
            <div className="text-xs text-gray-400 text-center mb-2">Check your email for the OTP</div>
            <button type="submit" disabled={isLoading} className={buttonClasses}>{isLoading ? 'Creating Account...' : 'Create Account'}</button>
            <button type="button" onClick={() => navigate('/auth')} className="w-full py-2 mt-2 rounded-lg bg-transparent border border-judicial-gold text-judicial-gold font-semibold hover:bg-judicial-gold/10 transition flex items-center justify-center gap-2"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Login</button>
          </form>
        </FloatingCard>
      </div>
    </div>
  );
} 