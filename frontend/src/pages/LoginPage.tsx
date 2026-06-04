import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      login(res.token, res.student);
      success('Welcome back to Lesela eCourse!');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid email or password.';
      error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0F172A] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden font-sans">
      
      {/* Background Video */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A]/80 via-[#0F172A]/40 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-2 rounded-[32px] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.5)] border border-white/5 bg-[#1E293B]"
      >
        
        {/* =======================================================================
            LEFT COLUMN: Dark, Sleek Minimalist Login Form
            ======================================================================= */}
        <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-between bg-[#131316] text-white">
          
          {/* Top Brand Logo */}
          <div className="flex items-center space-x-2.5 mb-8">
            <GraduationCap className="h-6 w-6 text-[#5B8A72]" />
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#5B8A72] to-[#A8D5BA]">
              Lesela eCourse
            </span>
          </div>

          <div className="space-y-6 my-auto">
            {/* Title & Header */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                <span className="animated-gradient-text">Login</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                Enter your account details
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Username/Email Line Input */}
              <div className="relative border-b border-white/10 focus-within:border-[#5B8A72] transition-all pb-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Academic Email
                </label>
                <div className="flex items-center">
                  <Mail className="h-4.5 w-4.5 text-slate-500 mr-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full bg-transparent border-none text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-0 p-0"
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] font-bold text-red-400 mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Password Line Input */}
              <div className="relative border-b border-white/10 focus-within:border-[#5B8A72] transition-all pb-1.5">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <button 
                    type="button" 
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <Lock className="h-4.5 w-4.5 text-slate-500 mr-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-none text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-0 p-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] font-bold text-red-400 mt-1.5">{errors.password}</p>
                )}
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="shimmer-btn w-full h-11 rounded-2xl text-white text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Footer Signup line */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5 text-xs text-slate-400 font-semibold">
            <span>Don't have an account?</span>
            <Link to="/register">
              <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs transition-all cursor-pointer">
                Sign up
              </button>
            </Link>
          </div>

        </div>

        {/* =======================================================================
            RIGHT COLUMN: Soft Sage/Mint Green Abstract Illustration Pane
            ======================================================================= */}
        <div className="bg-[#5B8A72] p-12 sm:p-16 flex flex-col justify-center relative overflow-hidden hidden lg:flex select-none">
          
          {/* Abstract curved background graphics */}
          <div className="absolute inset-0">
            <svg className="absolute w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
              <path d="M-50,250 C100,150 200,300 450,200 L450,450 L-50,450 Z" fill="#ffffff" />
              <circle cx="350" cy="50" r="30" fill="none" stroke="#ffffff" strokeWidth="2" />
              <circle cx="50" cy="350" r="15" fill="none" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>

          {/* Heading Text panel */}
          <div className="relative z-10 text-white space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Welcome to<br />student portal
            </h1>
            <p className="text-sm font-semibold text-white/80">
              Login to access your account
            </p>
          </div>

        </div>


      </motion.div>
    </div>
  );
};
