import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    if (!name) {
      newErrors.name = 'Full Name is required';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authService.register({ name, email, password });
      login(res.token, res.student);
      success('Welcome to Lesela eCourse! Your profile was created successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-center items-center p-6 overflow-hidden">
      {/* Animated Gradients */}
      <div className="mesh-bg">
        <div className="absolute top-[20%] left-[20%] w-[45%] h-[45%] rounded-full bg-indigo-500/15 blur-[120px] dark:bg-indigo-500/5 animate-float" />
        <div className="absolute bottom-[20%] right-[20%] w-[45%] h-[45%] rounded-full bg-violet-500/15 blur-[120px] dark:bg-violet-500/5 animate-float-delayed" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2">
            <GraduationCap className="h-9 w-9 text-primary" />
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
              Lesela eCourse
            </span>
          </Link>
          <p className="text-xs text-muted-foreground mt-2 font-semibold uppercase tracking-widest">
            Enrolling tomorrow, today
          </p>
        </div>

        {/* Card */}
        <Card glass={true} className="p-6 border-white/20 dark:border-white/10 shadow-2xl">
          <CardContent className="p-0">
            <h3 className="text-lg font-bold tracking-tight mb-1 text-left">Get Started</h3>
            <p className="text-xs text-muted-foreground mb-6 text-left">Create a student profile to begin registering for courses.</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Name */}
              <div>
                <Input
                  label="Full Name"
                  placeholder="Lesela"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  label="University Email"
                  placeholder="lesela@university.edu"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              </div>

              {/* Password */}
              <div>
                <Input
                  label="Create Password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2"
                  isLoading={isLoading}
                >
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold transition-all">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
