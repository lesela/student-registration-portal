import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Trash2, ShieldAlert, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registrationService } from '../services/registrationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import type { Registration } from '../types';

export const ManagementPage: React.FC = () => {
  const { student, refreshUser } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isUnregisterModalOpen, setIsUnregisterModalOpen] = useState(false);

  // Load registered courses
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['registrations', student?.id],
    queryFn: () => registrationService.getRegistrations(student!.id),
    enabled: !!student?.id,
  });

  // Unregister mutation
  const unregisterMutation = useMutation({
    mutationFn: (regId: number) => registrationService.unregister(regId),
    onSuccess: async () => {
      success('Successfully unregistered from the course.');
      setIsUnregisterModalOpen(false);
      setSelectedReg(null);

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });

      // Refresh student credits
      await refreshUser();
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || 'Failed to unregister course.';
      error(errMsg);
    }
  });

  const handleUnregisterClick = (reg: Registration) => {
    setSelectedReg(reg);
    setIsUnregisterModalOpen(true);
  };

  const confirmUnregister = () => {
    if (selectedReg) {
      unregisterMutation.mutate(selectedReg.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader variant="spinner" />
        <span className="text-sm font-semibold text-muted-foreground">Gathering your semester profile...</span>
      </div>
    );
  }

  // Completed Mock history courses for visual polish
  const historyCourses = [
    { code: 'MATH-101', name: 'Calculus I', credits: 3, grade: 'A', semester: 'Fall 2025' },
    { code: 'CS-100', name: 'Logic and Programming', credits: 4, grade: 'A-', semester: 'Fall 2025' },
    { code: 'BUS-110', name: 'Principles of Finance', credits: 3, grade: 'B+', semester: 'Spring 2025' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Academic Registration Manager</h2>
        <p className="text-sm text-muted-foreground">View your active timetable load, modify enrollments, and browse academic histories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active registrations grid list */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Registrations</CardTitle>
                <CardDescription>Semester course list currently registered</CardDescription>
              </div>
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {registrations.length} Enrolled
              </span>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {registrations.length > 0 ? (
                registrations.map((reg) => (
                  <div key={reg.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start space-x-4 min-w-0">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                        {reg.courseCode.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-primary">{reg.courseCode}</span>
                        <h4 className="text-sm font-bold text-foreground truncate mt-0.5">{reg.course?.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                            {reg.course?.day}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                            {reg.course?.startTime.slice(0, 5)} - {reg.course?.endTime.slice(0, 5)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4 border-t border-border/40 pt-4 sm:pt-0 sm:border-none">

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-9"
                        onClick={() => handleUnregisterClick(reg)}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        <span>Drop</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-muted-foreground text-xs space-y-4">
                  <p>You haven't enrolled in any courses for this semester yet.</p>
                  <Button size="sm">Search Catalog</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historic side bar listing */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle>Academic History</CardTitle>
              <CardDescription>Completed semesters record</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {historyCourses.map((c) => (
                <div key={c.code} className="p-3 bg-muted/30 border border-border/30 rounded-xl flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground">{c.semester}</p>
                    <h4 className="text-xs font-bold text-foreground truncate mt-0.5">{c.code}: {c.name}</h4>

                  </div>
                  <div className="flex items-center space-x-1 font-bold text-xs text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>{c.grade}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Unregister Drop Modal */}
      <Modal
        isOpen={isUnregisterModalOpen}
        onClose={() => setIsUnregisterModalOpen(false)}
        title="Unregister Course"
      >
        {selectedReg && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start space-x-3 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-bold">Are you sure you want to drop this course?</p>
                <p className="mt-1 text-[11px] leading-normal opacity-90">
                  Dropping <span className="font-bold text-foreground">{selectedReg.courseCode}: {selectedReg.course?.name}</span> will instantly free up seats in the course and remove it from your weekly schedule.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUnregisterModalOpen(false)}
                disabled={unregisterMutation.isPending}
              >
                Keep Enrolled
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmUnregister}
                isLoading={unregisterMutation.isPending}
              >
                Confirm Drop
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
