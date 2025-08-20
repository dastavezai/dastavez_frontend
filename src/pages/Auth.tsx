import { useState, useEffect } from 'react';
import { z } from 'zod';
import ScalesAnimation from '../components/ScalesAnimation';
import GavelAnimation from '../components/GavelAnimation';
import FloatingCard from '../components/FloatingCard';
import LoginIcon from '../components/LoginIcon';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const otpSchema = z.string().regex(/^\d{6}$/, 'OTP must be 6 digits');

interface AuthState {
  step: 'email' | 'login' | 'register';
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

interface ValidationErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
}

const inputClasses = `
  w-full p-3 rounded-lg
  bg-gradient-to-br from-judicial-blue/30 to-judicial-blue/10
  text-white
  border border-judicial-gold/30
  shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
  backdrop-blur-lg
  focus:outline-none focus:ring-2 focus:ring-judicial-lightGold focus:border-transparent
  transition-all duration-300
  bg-judicial-blue/40
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

const Auth = () => {
  const [state, setState] = useState<AuthState>({
    step: 'email',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = () => {
    try {
      emailSchema.parse(state.email);
      setErrors({ ...errors, email: undefined });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, email: error.errors[0].message });
      }
      return false;
    }
  };

  const validateName = (name: string, field: 'firstName' | 'lastName') => {
    try {
      nameSchema.parse(name);
      setErrors({ ...errors, [field]: undefined });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, [field]: error.errors[0].message });
      }
      return false;
    }
  };

  const validatePassword = () => {
    try {
      passwordSchema.parse(state.password);
      if (state.password !== state.confirmPassword) {
        setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
        return false;
      }
      setErrors({ ...errors, password: undefined, confirmPassword: undefined });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, password: error.errors[0].message });
      }
      return false;
    }
  };

  const validateLoginPassword = () => {
    try {
      passwordSchema.parse(state.password);
      setErrors({ ...errors, password: undefined });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, password: error.errors[0].message });
      }
      return false;
    }
  };

  const validateOtp = () => {
    try {
      otpSchema.parse(state.otp);
      setErrors({ ...errors, otp: undefined });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, otp: error.errors[0].message });
      }
      return false;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const data = await authAPI.checkEmail(state.email);
      if (data.exists) {
        localStorage.setItem('lastLoginEmail', state.email);
      }
      setState({ ...state, step: data.exists ? 'login' : 'register' });
    } catch (error) {
      console.error('Error checking user:', error);
      setErrors({ ...errors, email: 'Failed to check email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Get email from state or localStorage as fallback
    const emailToUse = state.email || localStorage.getItem('lastLoginEmail') || '';
    if (!emailToUse) {
      setErrors({ ...errors, password: "Email is missing. Please go back and enter your email." });
      return;
    }
    if (!state.password || state.password.trim() === '') {
      setErrors({ ...errors, password: "Password is required." });
      return;
    }
    if (!validateLoginPassword()) return;

    setIsLoading(true);
    try {
      const data: any = await authAPI.login(emailToUse, state.password);
      if (data && (data.token || data.jwt || data.accessToken)) {
        const token = data.token || data.jwt || data.accessToken;
        localStorage.setItem('jwt', token);

        // If backend directly signals admin access with boolean/success flags
        const responseTrue = (data === true) || (data?.success === true) || (data?.allowed === true) || (data?.isAdmin === true);
        if (responseTrue) {
          window.location.href = '/admin';
          return;
        }

        // Fetch current user to reliably determine admin + verification
        try {
          const currentUser: any = await authAPI.getCurrentUser();
          const isAdmin = Boolean(
            currentUser?.isAdmin === true ||
            currentUser?.admin === true ||
            currentUser?.role === 'admin' ||
            (Array.isArray(currentUser?.roles) && currentUser.roles.includes('admin'))
          );
          const isVerified = Boolean(
            currentUser?.isVerified === true ||
            currentUser?.verified === true ||
            currentUser?.emailVerified === true ||
            currentUser?.isEmailVerified === true
          );

          if (isAdmin && isVerified) {
            window.location.href = '/admin';
          } else {
            window.location.href = '/chat';
          }
        } catch {
          // Fallback if user fetch fails
          window.location.href = '/chat';
        }
      } else {
        setErrors({ ...errors, password: data?.message || 'Login failed' });
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      setErrors({ ...errors, password: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validateName(state.firstName, 'firstName') ||
      !validateName(state.lastName, 'lastName') ||
      !validatePassword() ||
      !validateOtp()
    ) return;

    setIsLoading(true);
    try {
      const data = await authAPI.signup({
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        password: state.password,
        confirmPassword: state.confirmPassword,
        otp: state.otp,
      });
      
      if (data.token) {
        localStorage.setItem('jwt', data.token);
        window.location.href = '/chat';
      } else {
        setErrors({ ...errors, otp: data.message || 'Registration failed' });
      }
    } catch (error: any) {
      console.error('Error registering:', error);
      setErrors({ ...errors, otp: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Add floating particles effect
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      };
    };

    const initParticles = () => {
      particles = Array.from({ length: 50 }, createParticle);
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 171, 85, ${particle.opacity})`;
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });

      requestAnimationFrame(drawParticles);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.body.removeChild(canvas);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pb-20">
      {/* Removed <LoginIcon /> from login page */}
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/courthouse.jpg')`,
          filter: 'brightness(0.3)'
        }}
      />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-judicial-dark to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-judicial-dark to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 -mt-20">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
            <GavelAnimation />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-judicial-gold to-judicial-lightGold bg-clip-text text-transparent">
            Dastawez AI
          </h1>
          <p className="text-judicial-lightGold/80 text-lg">
            Legal Intelligence Platform
          </p>
        </div>

        {/* Auth Card */}
        <FloatingCard>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-judicial-gold mb-2">
              {state.step === 'email' ? 'Welcome' :
               state.step === 'login' ? 'Login' : 'Create Account'}
            </h2>
            <p className="text-judicial-lightGold/80">
              {state.step === 'email' ? 'Enter your email to continue' :
               state.step === 'login' ? 'Enter your password to login' :
               'Complete your registration'}
            </p>
          </div>

          {state.step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={state.email}
                  onChange={(e) => setState({ ...state, email: e.target.value })}
                  className={inputClasses}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={buttonClasses}
              >
                {isLoading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          )}

          {state.step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={state.password}
                  onChange={(e) => {
                    console.log('Password changed:', e.target.value.length, 'characters');
                    setState({ ...state, password: e.target.value });
                  }}
                  className={inputClasses}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <p className="mt-1 text-xs text-gray-400">
                    Password length: {state.password.length}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={buttonClasses}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setState({ ...state, step: 'email', password: '' })}
                className="w-full py-2 mt-2 rounded-lg bg-transparent border border-judicial-gold text-judicial-gold font-semibold hover:bg-judicial-gold/10 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/forgot-password', { state: { email: state.email } });
                  }}
                  className="text-judicial-lightGold/80 hover:text-judicial-gold text-sm transition-all duration-300 hover:scale-105"
                >
                  Forgot password
                </button>
              </div>
            </form>
          )}

          {state.step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="email" value={state.email} disabled className={inputClasses + ' opacity-60 cursor-not-allowed'} />
              {[
                {
                  type: 'text',
                  placeholder: 'First Name',
                  value: state.firstName,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                    setState({ ...state, firstName: e.target.value }),
                  error: errors.firstName
                },
                {
                  type: 'text',
                  placeholder: 'Last Name',
                  value: state.lastName,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                    setState({ ...state, lastName: e.target.value }),
                  error: errors.lastName
                },
                {
                  type: 'password',
                  placeholder: 'Password',
                  value: state.password,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                    setState({ ...state, password: e.target.value }),
                  error: errors.password
                },
                {
                  type: 'password',
                  placeholder: 'Confirm Password',
                  value: state.confirmPassword,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                    setState({ ...state, confirmPassword: e.target.value }),
                  error: errors.confirmPassword
                },
                {
                  type: 'text',
                  placeholder: 'Enter OTP',
                  value: state.otp,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setState({ ...state, otp: value });
                  },
                  error: errors.otp
                }
              ].map((field, index) => (
                <div 
                  key={field.placeholder}
                  style={{ 
                    opacity: 0,
                    animation: 'fadeInUp 0.5s forwards',
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={field.onChange}
                    className={inputClasses}
                  />
                  {field.error && (
                    <p className="mt-1 text-sm text-red-500">{field.error}</p>
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={isLoading}
                className={buttonClasses}
                style={{
                  opacity: 0,
                  animation: 'fadeInUp 0.5s forwards',
                  animationDelay: '250ms'
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => setState({ ...state, step: 'email' })}
                className="w-full py-2 mt-2 rounded-lg bg-transparent border border-judicial-gold text-judicial-gold font-semibold hover:bg-judicial-gold/10 transition flex items-center justify-center gap-2"
                style={{ opacity: 0, animation: 'fadeInUp 0.5s forwards', animationDelay: '300ms' }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </button>
            </form>
          )}

          {/* Removed the 'Forgot password' button from the register/signup section and email entry section.
              The email is already stored in the state and preserved across steps. */}
        </FloatingCard>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Auth; 
