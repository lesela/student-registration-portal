import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, Trash2, ShieldCheck, Calendar, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminService } from '../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import type { Registration } from '../types';
import type { AdminStudent } from '../services/adminService';

type Tab = 'students' | 'registrations';

export const AdminPage: React.FC = () => {
  const { student } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'student' | 'registration'; id: number; label: string } | null>(null);

  // Fetch all students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: adminService.getAllStudents,
  });

  // Fetch all registrations
  const { data: registrations = [], isLoading: regsLoading } = useQuery({
    queryKey: ['admin-registrations'],
    queryFn: adminService.getAllRegistrations,
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteStudent(id),
    onSuccess: () => {
      success('Student removed successfully.');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
    },
    onError: () => error('Failed to remove student.'),
  });

  // Drop registration mutation
  const dropRegMutation = useMutation({
    mutationFn: (id: number) => adminService.dropRegistration(id),
    onSuccess: () => {
      success('Registration dropped successfully.');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    },
    onError: () => error('Failed to drop registration.'),
  });

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'student') {
      deleteStudentMutation.mutate(deleteTarget.id);
    } else {
      dropRegMutation.mutate(deleteTarget.id);
    }
  };

  const formatTime = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const statsData = [
    { label: 'Total Students', value: students.filter(s => s.role === 'STUDENT').length, icon: Users, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { label: 'Total Registrations', value: registrations.length, icon: BookOpen, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { label: 'Active Enrollments', value: registrations.length, icon: Calendar, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">Admin Console</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            <span className="animated-gradient-text">Management Panel</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time oversight of students and course registrations.
          </p>
        </div>
        <div className="spotlight-card hidden md:flex items-center gap-3 px-4 py-2.5 border border-border/60 bg-card"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
          }}
        >
          <div className="spotlight-overlay" />
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#5B8A72] to-[#7BC96F] flex items-center justify-center font-bold text-xs text-white shadow-md">
            {student?.name.charAt(0)}
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-foreground">{student?.name}</p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsData.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bento-stat"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/60 px-2 py-0.5 rounded-full">live</span>
              </div>
              <div className="counter-animate">
                <span className="number-font text-3xl font-extrabold text-foreground">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs — shimmer on active */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(['students', 'registrations'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab
                ? 'shimmer-btn text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'students' ? `Students (${students.filter(s => s.role === 'STUDENT').length})` : `Registrations (${registrations.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border border-border/60 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-border/60">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  All Students
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {studentsLoading ? (
                  <div className="flex justify-center py-16"><Loader variant="spinner" /></div>
                ) : students.filter(s => s.role === 'STUDENT').length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm">No students registered yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40">
                          <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Name</th>
                          <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Email</th>
                          <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Courses Enrolled</th>
                          <th className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(s => s.role === 'STUDENT').map((s, idx) => (
                          <motion.tr
                            key={s.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className="frost-row border-b border-border/40 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center font-bold text-xs text-primary">
                                  {s.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-foreground">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{s.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                s.registrationCount > 0
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {s.registrationCount} {s.registrationCount === 1 ? 'course' : 'courses'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setDeleteTarget({ type: 'student', id: s.id, label: s.name })}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                title="Remove student"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'registrations' && (
          <motion.div
            key="registrations"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border border-border/60 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-border/60">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  All Registrations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {regsLoading ? (
                  <div className="flex justify-center py-16"><Loader variant="spinner" /></div>
                ) : registrations.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm">No registrations found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40">
                          <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Student</th>
                          <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Course</th>
                          <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Schedule</th>
                          <th className="text-left px-6 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Registered</th>
                          <th className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg, idx) => (
                          <motion.tr
                            key={reg.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="frost-row border-b border-border/40 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-7 w-7 rounded-full bg-violet-500/15 flex items-center justify-center font-bold text-xs text-violet-600 dark:text-violet-400">
                                  {(students.find(s => s.id === reg.studentId)?.name || 'U').charAt(0)}
                                </div>
                                <span className="font-semibold text-foreground">
                                  {students.find(s => s.id === reg.studentId)?.name || `Student #${reg.studentId}`}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-foreground">{reg.course?.name || reg.courseName}</p>
                                <p className="text-xs text-muted-foreground">{reg.course?.code || reg.courseCode}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {reg.course ? (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="text-xs">
                                    {reg.course.day?.charAt(0) + reg.course.day?.slice(1).toLowerCase()} · {formatTime(reg.course.startTime)} – {formatTime(reg.course.endTime)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              {reg.registeredAt
                                ? new Date(reg.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setDeleteTarget({ type: 'registration', id: reg.id, label: `${reg.course?.name || reg.courseName}` })}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                                title="Drop registration"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget?.type === 'student' ? 'Remove Student' : 'Drop Registration'}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {deleteTarget?.type === 'student'
              ? `Are you sure you want to remove "${deleteTarget?.label}"? This will also delete all their registrations.`
              : `Are you sure you want to drop "${deleteTarget?.label}" from this registration?`}
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger"
              onClick={handleConfirmDelete}
              disabled={deleteStudentMutation.isPending || dropRegMutation.isPending}
            >
              {deleteStudentMutation.isPending || dropRegMutation.isPending ? 'Removing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
