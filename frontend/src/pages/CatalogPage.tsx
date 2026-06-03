import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Clock, User, ShoppingCart, Check, AlertTriangle, ShoppingBag 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { courseService } from '../services/courseService';
import { registrationService } from '../services/registrationService';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import type { Course } from '../types';

export const CatalogPage: React.FC = () => {
  const { student } = useAuth();
  const { cartItems, addToCart, removeFromCart, getConflicts } = useCart();
  const { success, error, info } = useToast();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('NAME_ASC');

  // Load all courses
  const { data: courses = [], isLoading: isCoursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getCourses(),
  });

  // Load registered courses to perform conflict checks
  const { data: registrations = [], isLoading: isRegsLoading } = useQuery({
    queryKey: ['registrations', student?.id],
    queryFn: () => registrationService.getRegistrations(student!.id),
    enabled: !!student?.id,
  });

  // Unique departments for filter list
  const departments = useMemo(() => {
    const depts = new Set(courses.map(c => c.department));
    return ['ALL', ...Array.from(depts)];
  }, [courses]);

  // Handle Filtering & Sorting locally for instant responsiveness
  const processedCourses = useMemo(() => {
    let result = [...courses];

    // 1. Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        c => c.name.toLowerCase().includes(q) || 
             c.code.toLowerCase().includes(q) || 
             c.instructor.toLowerCase().includes(q)
      );
    }

    // 2. Filter by Department
    if (deptFilter !== 'ALL') {
      result = result.filter(c => c.department.toUpperCase() === deptFilter.toUpperCase());
    }



    // 4. Filter by Availability
    if (availableOnly) {
      result = result.filter(c => c.enrolledStudents < c.capacity);
    }

    // 5. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'NAME_ASC':
          return a.name.localeCompare(b.name);
        case 'NAME_DESC':
          return b.name.localeCompare(a.name);

        case 'CAPACITY_DESC':
          return b.capacity - a.capacity;
        case 'SEATS_ASC':
          const seatsA = a.capacity - a.enrolledStudents;
          const seatsB = b.capacity - b.enrolledStudents;
          return seatsA - seatsB; // most full first
        default:
          return 0;
      }
    });

    return result;
  }, [courses, searchQuery, deptFilter, availableOnly, sortBy]);

  const handleCartAction = (course: Course) => {
    const isInCart = cartItems.some(item => item.id === course.id);
    if (isInCart) {
      removeFromCart(course.id);
      info(`Removed ${course.code} from cart.`);
    } else {
      // Check for structural block (like duplicate enrollment)
      const conflicts = getConflicts(course, registrations);
      const isAlreadyRegistered = conflicts.some(c => c.type === 'duplicate');
      
      if (isAlreadyRegistered) {
        error(`You are already registered for ${course.code}.`);
        return;
      }

      addToCart(course);
      success(`Added ${course.code} to registration cart!`);
    }
  };

  const isLoading = isCoursesLoading || isRegsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader variant="spinner" />
        <span className="text-sm font-semibold text-muted-foreground">Scouting current catalogs...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Course Directory</h2>
          <p className="text-sm text-muted-foreground">Discover, filter, and plan your ideal syllabus schedule.</p>
        </div>
      </div>

      {/* 1. Interactive Filter Controls Pane */}
      <Card className="p-5 glass border-white/15 dark:border-white/5 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by course code, title, or professor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-input bg-transparent pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {departments.map(dept => (
                <option key={dept} value={dept.toUpperCase()}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="NAME_ASC">Name (A-Z)</option>
              <option value="NAME_DESC">Name (Z-A)</option>

              <option value="CAPACITY_DESC">Capacity (High to Low)</option>
              <option value="SEATS_ASC">Seats Available (Least First)</option>
            </select>
          </div>
        </div>

        {/* Extended filters */}
        <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">


            {/* Toggle Show Available Only */}
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary bg-transparent"
              />
              <span className="text-xs font-semibold text-muted-foreground uppercase">Show Available Only</span>
            </label>
          </div>

          <div className="text-xs text-muted-foreground font-semibold">
            Showing <span className="text-foreground font-bold">{processedCourses.length}</span> of {courses.length} courses
          </div>
        </div>
      </Card>

      {/* 2. Courses Grid */}
      <AnimatePresence mode="popLayout">
        {processedCourses.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {processedCourses.map((course) => {
              const isInCart = cartItems.some(item => item.id === course.id);
              const isRegistered = registrations.some(reg => reg.courseId === course.id);
              const conflicts = getConflicts(course, registrations);
              
              const hasConflict = conflicts.length > 0;
              const hasOverlap = conflicts.some(c => c.type === 'schedule');

              const isFull = course.enrolledStudents >= course.capacity;

              return (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                >
                  <Card glass={true} className={`relative flex flex-col justify-between h-full border-t-2 ${
                    isRegistered 
                      ? 'border-t-emerald-500' 
                      : isInCart 
                      ? 'border-t-primary' 
                      : hasConflict && !isRegistered 
                      ? 'border-t-amber-500' 
                      : 'border-t-border'
                  }`}>
                    <CardContent className="p-6 space-y-4 flex-1">
                      {/* Department and Code */}
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                          {course.department}
                        </span>
                        <span className="text-xs font-mono font-bold text-primary">
                          {course.code}
                        </span>
                      </div>

                      {/* Course Title & Instructor */}
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-base text-foreground leading-snug tracking-tight group-hover:text-primary transition-colors">
                          {course.name}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <User className="h-3.5 w-3.5 mr-1 text-muted-foreground/70" />
                          {course.instructor}
                        </p>
                      </div>

                      {/* Timeline Day & Time slot */}
                      <div className="flex flex-col space-y-1.5 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/30">
                        <div className="flex items-center space-x-1.5 font-bold text-foreground">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{course.day}</span>
                        </div>
                        <div className="text-muted-foreground font-semibold pl-5">
                          {course.startTime.slice(0, 5)} - {course.endTime.slice(0, 5)}
                        </div>
                      </div>

                      {/* Credit details & Capacity seats bar */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-semibold">Enrolled Capacity:</span>
                          <span className={`font-bold ${isFull ? 'text-rose-500 font-extrabold' : 'text-foreground'}`}>
                            {course.enrolledStudents} / {course.capacity} seats
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-primary to-indigo-500'
                            }`}
                            style={{ width: `${(course.enrolledStudents / course.capacity) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Conflict alert warnings */}
                      {!isRegistered && hasConflict && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start space-x-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <div className="leading-normal">
                            {hasOverlap && "Schedule overlap clash."}
                            {!hasOverlap && isFull && "Course is full."}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    {/* Footer Actions */}
                    <div className="p-6 pt-0 border-t border-border/40 mt-auto flex items-center justify-between">


                      {isRegistered ? (
                        <div className="flex items-center space-x-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                          <Check className="h-4 w-4" />
                          <span>Registered</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant={isInCart ? 'outline' : 'primary'}
                          onClick={() => handleCartAction(course)}
                          className="flex items-center space-x-1.5"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>{isInCart ? 'Remove' : 'Add to Cart'}</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Custom Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto"
          >
            <div className="p-4 bg-muted rounded-full text-muted-foreground border border-border/40 animate-pulse">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">No Courses Found</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn't find any courses matching your search query. Try broadening your filter selections or checking alternate departments.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setDeptFilter('ALL');

                setAvailableOnly(false);
              }}
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
