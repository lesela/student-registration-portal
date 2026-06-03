import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldCheck, Palette, Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const ProfilePage: React.FC = () => {
  const { student, updateStudent } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const [name, setName] = useState(student?.name || '');
  const [email, setEmail] = useState(student?.email || '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: (payload: { name: string; email: string }) => 
      authService.updateProfile(student!.id, payload),
    onSuccess: (updatedStudent) => {
      updateStudent(updatedStudent);
      success('Successfully updated profile settings!');
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to update profile settings.';
      error(errMsg);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    profileMutation.mutate({ name, email });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Student Control Room</h2>
        <p className="text-sm text-muted-foreground">Manage your identity credentials, interface styling, and notifications preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Identity Form Card */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle>Identity Credentials</CardTitle>
              <CardDescription>Verify and modify your school account registry</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                {/* Name */}
                <Input
                  label="Display Full Name"
                  placeholder="Lesela"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />

                {/* Email */}
                <Input
                  label="Registered Academic Email"
                  placeholder="lesela@university.edu"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    className="flex items-center space-x-2"
                    isLoading={profileMutation.isPending}
                  >
                    <RefreshCw className="h-4.5 w-4.5 mr-1" />
                    <span>Update Registry</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Preferences Card */}
        <div className="space-y-6">
          {/* Interface themes */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle>Interface Styling</CardTitle>
              <CardDescription>Tailor Lesela eCourse colors</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40">
                <div className="flex items-center space-x-3 text-xs font-semibold">
                  <Palette className="h-4.5 w-4.5 text-primary" />
                  <span>Toggle Dark Mode</span>
                </div>
                <Button size="sm" variant="glass" onClick={toggleTheme} className="text-xs uppercase font-bold px-3.5 h-8">
                  {theme}
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 text-left leading-normal">
                <ShieldCheck className="h-4.5 w-4.5 flex-shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-bold">Portal Access Secured</p>
                  <p className="text-[10px] opacity-90 mt-0.5">Session encrypted via end-to-end HTTPS/JWT. Standard API queries sandboxed.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Notifications config */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle>Alert Channels</CardTitle>
              <CardDescription>Timetable sync frequencies</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20 text-xs">
                <div className="flex items-center space-x-3 text-muted-foreground font-semibold">
                  <Bell className="h-4.5 w-4.5" />
                  <span>Email Timetable Sync</span>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">Daily</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
