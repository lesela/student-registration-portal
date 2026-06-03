import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Laptop, Palette, TrendingUp, Atom, BookOpen, LineChart, 
  Search, ChevronDown, ChevronRight, ChevronLeft, Calendar as CalendarIcon 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/registrationService';
import { courseService } from '../services/courseService';
import { Loader } from '../components/ui/Loader';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Course } from '../types';

// Simple descriptions of each course to show on their card
const descriptionsOfEachCourse: Record<string, string> = {
  'CS-101': 'Learn the basic computer system architectures, programming fundamentals, and software creation foundations.',
  'CS-201': 'Learn fundamental data structures including trees, graphs, heaps, and advanced sorting algorithms.',
  'CS-301': 'Explore advanced software patterns, microservices architectures, and distributed systems design.',
  'DES-102': 'Learn modern user experience methodologies, Figma wireframing, typography, and responsive interface design.',
  'BUS-210': 'Master SaaS entrepreneurship principles, subscription models, market validation, and growth hacking.',
  'PHY-350': 'Explore quantum mechanics basics, qubits, quantum gates, superposition, and quantum computing programming.',
  'MATH-202': 'Master matrix calculations, eigenvalues, and vectors essential for machine learning algorithms.',
  'CS-420': 'Deep dive into artificial neural networks, backpropagation, CNNs, RNNs, and generative models.',
  'DES-301': 'Master advanced UI transitions, micro-interactions, scroll animations, and interactive prototyping.',
  'BUS-101': 'Explore modern product management cycles, roadmap creation, agile sprints, and customer interviews.'
};

// Styling sets matching our custom Spring/Sage color theme
const stylesOfCourseCards = [
  {
    bg: 'bg-[#F2F8F5] dark:bg-emerald-950/10',
    border: 'border-[#E3EFE8] dark:border-emerald-900/30',
    accent: 'bg-[#5B8A72]',
    text: 'text-[#5B8A72]',
    graphicBg: 'bg-[#D6EAE0] dark:bg-emerald-900/20',
    iconColor: 'text-[#5B8A72]'
  },
  {
    bg: 'bg-[#FAFDF6] dark:bg-[#1E293B]/20',
    border: 'border-[#EFF7E7] dark:border-[#334155]/30',
    accent: 'bg-[#7BC96F]',
    text: 'text-[#7BC96F]',
    graphicBg: 'bg-[#E2F3D9] dark:bg-[#334155]/40',
    iconColor: 'text-[#7BC96F]'
  },
  {
    bg: 'bg-[#EAF7ED] dark:bg-green-950/10',
    border: 'border-[#D7EFE0] dark:border-green-900/30',
    accent: 'bg-[#48A96F]',
    text: 'text-[#48A96F]',
    graphicBg: 'bg-[#C6ECD4] dark:bg-green-900/20',
    iconColor: 'text-[#48A96F]'
  },
  {
    bg: 'bg-[#F5F8F2] dark:bg-lime-950/10',
    border: 'border-[#E7EFE0] dark:border-lime-900/30',
    accent: 'bg-[#8FB075]',
    text: 'text-[#8FB075]',
    graphicBg: 'bg-[#DCEACF] dark:bg-lime-900/20',
    iconColor: 'text-[#8FB075]'
  }
];

// Fallback course list to show as preview classes if the user hasn't registered for any classes yet
const availableCoursesSampleList: Course[] = [
  {
    id: 1,
    code: 'CS-101',
    name: 'Introduction to Computer Science',
    department: 'Computer Science',
    instructor: 'Dr. Alan Turing',
    credits: 4,
    day: 'MONDAY',
    startTime: '10:00:00',
    endTime: '12:00:00',
    capacity: 30,
    enrolledStudents: 0
  },
  {
    id: 2,
    code: 'CS-201',
    name: 'Data Structures and Algorithms',
    department: 'Computer Science',
    instructor: 'Dr. Grace Hopper',
    credits: 4,
    day: 'TUESDAY',
    startTime: '13:00:00',
    endTime: '15:00:00',
    capacity: 25,
    enrolledStudents: 0
  },
  {
    id: 3,
    code: 'CS-301',
    name: 'Advanced Software Architecture',
    department: 'Computer Science',
    instructor: 'Dr. Martin Fowler',
    credits: 3,
    day: 'MONDAY',
    startTime: '11:00:00',
    endTime: '13:00:00',
    capacity: 20,
    enrolledStudents: 0
  },
  {
    id: 4,
    code: 'DES-102',
    name: 'User Experience & UI Design',
    department: 'Design',
    instructor: 'Prof. Dieter Rams',
    credits: 3,
    day: 'WEDNESDAY',
    startTime: '09:00:00',
    endTime: '11:30:00',
    capacity: 15,
    enrolledStudents: 0
  },
  {
    id: 5,
    code: 'BUS-210',
    name: 'SaaS Entrepreneurship & Strategy',
    department: 'Business',
    instructor: 'Prof. Peter Drucker',
    credits: 3,
    day: 'THURSDAY',
    startTime: '14:00:00',
    endTime: '16:00:00',
    capacity: 40,
    enrolledStudents: 0
  },
  {
    id: 6,
    code: 'PHY-350',
    name: 'Quantum Computing Foundations',
    department: 'Physics',
    instructor: 'Dr. Richard Feynman',
    credits: 4,
    day: 'FRIDAY',
    startTime: '10:00:00',
    endTime: '12:30:00',
    capacity: 12,
    enrolledStudents: 0
  },
  {
    id: 7,
    code: 'MATH-202',
    name: 'Linear Algebra for AI',
    department: 'Mathematics',
    instructor: 'Dr. Gilbert Strang',
    credits: 3,
    day: 'TUESDAY',
    startTime: '10:00:00',
    endTime: '12:00:00',
    capacity: 50,
    enrolledStudents: 0
  },
  {
    id: 8,
    code: 'CS-420',
    name: 'Artificial Intelligence & Neural Networks',
    department: 'Computer Science',
    instructor: 'Dr. Yann LeCun',
    credits: 4,
    day: 'THURSDAY',
    startTime: '10:00:00',
    endTime: '12:00:00',
    capacity: 30,
    enrolledStudents: 0
  },
  {
    id: 9,
    code: 'DES-301',
    name: 'Interactive Motion & Prototyping',
    department: 'Design',
    instructor: 'Prof. John Maeda',
    credits: 3,
    day: 'WEDNESDAY',
    startTime: '14:00:00',
    endTime: '16:00:00',
    capacity: 18,
    enrolledStudents: 0
  },
  {
    id: 10,
    code: 'BUS-101',
    name: 'Modern Product Management',
    department: 'Business',
    instructor: 'Prof. Clay Christensen',
    credits: 3,
    day: 'FRIDAY',
    startTime: '14:00:00',
    endTime: '16:00:00',
    capacity: 35,
    enrolledStudents: 0
  }
];

// Department choices list with cute icons
const subjectOptionsList = [
  { id: 'ALL', label: 'All Subjects', emoji: '✨' },
  { id: 'COMPUTER SCIENCE', label: 'Comp Science', emoji: '💻' },
  { id: 'DESIGN', label: 'Design', emoji: '🎨' },
  { id: 'BUSINESS', label: 'Business', emoji: '📈' },
  { id: 'PHYSICS', label: 'Physics', emoji: '⚛️' },
  { id: 'MATHEMATICS', label: 'Math', emoji: '🔢' }
];


// Day options list for weekly calendar filter
const dayOptionsList = [
  { id: 'ALL', label: 'Any Day', emoji: '📅' },
  { id: 'MONDAY', label: 'Monday', emoji: '🌙' },
  { id: 'TUESDAY', label: 'Tuesday', emoji: '🔥' },
  { id: 'WEDNESDAY', label: 'Wednesday', emoji: '💧' },
  { id: 'THURSDAY', label: 'Thursday', emoji: '🌳' },
  { id: 'FRIDAY', label: 'Friday', emoji: '🪙' }
];

export const DashboardPage: React.FC = () => {
  // Retrieve authentication state and student profile
  const { student: loggedInStudent } = useAuth();
  
  // Retrieve active cart items
  const { cartItems: myCartCourses } = useCart();
  
  // User's text search input value
  const [searchedKeyword, setSearchedKeyword] = useState('');
  
  // Selected department filter
  const [chosenSubject, setChosenSubject] = useState('ALL');
  
  
  // Selected schedule day filter
  const [chosenDay, setChosenDay] = useState('ALL');

  // Load the classes that the student is registered for
  const { data: myRegisteredClasses = [], isLoading: loadingMyClasses } = useQuery({
    queryKey: ['registrations', loggedInStudent?.id],
    queryFn: () => registrationService.getRegistrations(loggedInStudent!.id),
    enabled: !!loggedInStudent?.id,
  });

  // Load the general catalog list to use as custom previews
  const { data: allCatalogCourses = [], isLoading: loadingCatalogCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getCourses(),
  });

  // Check if any network data is still loading
  const isPageStillLoading = loadingMyClasses || loadingCatalogCourses;

  // Decide if we should show real database classes or fall back to mock preview courses
  const previewCoursesList = useMemo(() => {
    if (allCatalogCourses && allCatalogCourses.length > 0) {
      return allCatalogCourses;
    }
    return availableCoursesSampleList;
  }, [allCatalogCourses]);

  // Filter the student's registered classes using search inputs and drop-down filters
  const filteredRegisteredClasses = useMemo(() => {
    return myRegisteredClasses.filter(registrationItem => {
      const courseObj = registrationItem.course;
      if (!courseObj) return false;
      
      const searchMatches = 
        courseObj.name.toLowerCase().includes(searchedKeyword.toLowerCase()) ||
        courseObj.code.toLowerCase().includes(searchedKeyword.toLowerCase()) ||
        courseObj.instructor.toLowerCase().includes(searchedKeyword.toLowerCase());
        
      const departmentMatches = chosenSubject === 'ALL' || courseObj.department.toUpperCase() === chosenSubject.toUpperCase();
      const dayMatches = chosenDay === 'ALL' || courseObj.day.toUpperCase() === chosenDay.toUpperCase();
      
      return searchMatches && departmentMatches && dayMatches;
    });
  }, [myRegisteredClasses, searchedKeyword, chosenSubject, chosenDay]);

  // Filter the general preview classes using search inputs and drop-down filters
  const filteredPreviewCourses = useMemo(() => {
    return previewCoursesList.filter(courseObj => {
      const searchMatches = 
        courseObj.name.toLowerCase().includes(searchedKeyword.toLowerCase()) ||
        courseObj.code.toLowerCase().includes(searchedKeyword.toLowerCase()) ||
        courseObj.instructor.toLowerCase().includes(searchedKeyword.toLowerCase());
        
      const departmentMatches = chosenSubject === 'ALL' || courseObj.department.toUpperCase() === chosenSubject.toUpperCase();
      const dayMatches = chosenDay === 'ALL' || courseObj.day.toUpperCase() === chosenDay.toUpperCase();
      
      return searchMatches && departmentMatches && dayMatches;
    });
  }, [previewCoursesList, searchedKeyword, chosenSubject, chosenDay]);

  // Check if the student has signed up for at least one class
  const userHasRegisteredClasses = myRegisteredClasses.length > 0;



  // Get a subject emoji icon depending on the course department
  const getIconForSubject = (departmentName: string) => {
    switch (departmentName.toUpperCase()) {
      case 'COMPUTER SCIENCE':
        return Laptop;
      case 'DESIGN':
        return Palette;
      case 'BUSINESS':
        return TrendingUp;
      case 'PHYSICS':
        return Atom;
      case 'MATHEMATICS':
        return LineChart;
      default:
        return BookOpen;
    }
  };

  // Setup options for generating our monthly grid (June 2026 starting on a Monday)
  const totalDaysInJune = 30;
  const emptyDaysBeforeJuneStarts = 0; 
  const juneDaysNumbers = Array.from({ length: totalDaysInJune }, (_, index) => index + 1);

  // Return the name of the day (e.g. MONDAY) for a given date in June 2026
  const getNameOfDayForJuneDate = (dayNumber: number) => {
    const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return weekDays[(dayNumber - 1) % 7];
  };

  // Determine what courses are currently shown in the list on the screen
  const currentlyVisibleCourses = userHasRegisteredClasses 
    ? filteredRegisteredClasses.map(registrationItem => registrationItem.course).filter(Boolean) as Course[]
    : filteredPreviewCourses;

  // Track the days of the week that contain classes to highlight them on the calendar
  const daysOfVisibleCourses = currentlyVisibleCourses.map(courseObj => courseObj.day?.toUpperCase()).filter(Boolean);
  const daysOfCartCourses = myCartCourses.map(cartItem => cartItem.day?.toUpperCase()).filter(Boolean);
  const highlightedScheduledDays = Array.from(new Set([...daysOfVisibleCourses, ...daysOfCartCourses]));

  // Retrieve course details scheduled for a specific day of the week to display as tooltips
  const getCourseNamesScheduledForDay = (dayOfWeekName: string) => {
    const classSummaryList: string[] = [];
    currentlyVisibleCourses.forEach(courseObj => {
      if (courseObj && courseObj.day?.toUpperCase() === dayOfWeekName) {
        classSummaryList.push(`${courseObj.code}: ${courseObj.name}`);
      }
    });
    myCartCourses.forEach(cartItem => {
      if (cartItem.day?.toUpperCase() === dayOfWeekName) {
        classSummaryList.push(`[Cart] ${cartItem.code}: ${cartItem.name}`);
      }
    });
    return Array.from(new Set(classSummaryList));
  };

  // Renders a loading spinner if course list data is being fetched
  if (isPageStillLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader variant="spinner" />
        <span className="text-sm font-semibold text-[#5B8A72]">Generating your dashboard cockpit...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-6"
    >
      {/* Banner / Greeting & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Banner Card */}
        <div className="lg:col-span-2 relative p-6 rounded-[32px] bg-gradient-to-r from-[#FAFDF6] to-[#F2F8F5] dark:from-emerald-950/10 dark:to-emerald-900/10 border border-[#E3EFE8] dark:border-emerald-900/30 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(91,138,114,0.04)] transition-all">
          <div className="absolute right-6 bottom-2 opacity-15 pointer-events-none transform translate-y-2 select-none">
            <span className="text-7xl sm:text-8xl">🌱</span>
          </div>
          <div className="relative z-10 space-y-1.5">
            <span className="text-[10px] font-bold text-[#5B8A72] dark:text-[#7BC96F] uppercase tracking-wider bg-[#E3EFE8]/60 dark:bg-emerald-900/30 px-3 py-1 rounded-full animate-float">
              Lesela eCourse Portal ✨
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              Welcome back, {loggedInStudent?.name || 'Lesela'}! 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Explore your registered classes, manage your dynamic calendar schedule, or search the directory for upcoming classes. Let's make learning beautiful!
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_50px_rgba(91,138,114,0.05)] hover:-translate-y-0.5 transition-all duration-350 flex items-center justify-between">
          <div className="flex items-center space-x-4 min-w-0">
            {/* Initials badge */}
            <div className="h-14 w-14 rounded-[22px] bg-gradient-to-tr from-[#5B8A72] to-[#7BC96F] text-white flex items-center justify-center font-extrabold text-lg tracking-wide shadow-md shadow-[#5B8A72]/20 flex-shrink-0">
              {loggedInStudent?.name ? loggedInStudent.name.substring(0, 2).toUpperCase() : 'LE'}
            </div>
            <div className="min-w-0">
              <h4 className="text-base font-extrabold text-slate-850 dark:text-slate-100 truncate">
                {loggedInStudent?.name || 'Lesela'}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                Student ID: {loggedInStudent?.id ? `109488${loggedInStudent.id}` : '1094881001'}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {loggedInStudent?.email || 'lesela@university.edu'}
              </p>
            </div>
          </div>
          <div className="h-3 w-3 rounded-full bg-[#7BC96F] animate-pulse flex-shrink-0 shadow-sm shadow-[#7BC96F]" title="Portal Session Active" />
        </div>
      </div>

      {/* Main Grid Layout: Left is core view, Right is helper widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* =======================================================================
            CENTER COLUMN: Course lists, search input, filters & grids (Col Span 2)
            ======================================================================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat 1: Registered Courses Count */}
            <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-[28px] p-4.5 flex items-center space-x-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_12px_45px_rgba(91,138,114,0.06)] hover:-translate-y-0.5 transition-all">
              <div className="h-10 w-10 rounded-2xl bg-[#E3EFE8] dark:bg-emerald-950/40 flex items-center justify-center text-[#5B8A72] text-lg shadow-sm">
                📚
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Courses</span>
                <span className="text-lg font-extrabold text-slate-850 dark:text-slate-100 block mt-0.5">
                  {myRegisteredClasses.length} <span className="text-xs font-semibold text-slate-400">course{myRegisteredClasses.length !== 1 && 's'}</span>
                </span>
                <Link to="/management" className="text-[10px] font-bold text-[#5B8A72] dark:text-[#7BC96F] hover:underline mt-1 block">
                  Manage Classes →
                </Link>
              </div>
            </div>

            {/* Stat 2: Items in Cart (Drafts) */}
            <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-[28px] p-4.5 flex items-center space-x-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_12px_45px_rgba(91,138,114,0.06)] hover:-translate-y-0.5 transition-all">
              <div className="h-10 w-10 rounded-2xl bg-[#FAFDF6] dark:bg-lime-950/40 flex items-center justify-center text-[#7BC96F] text-lg shadow-sm">
                🛒
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Cart (Draft)</span>
                <span className="text-lg font-extrabold text-slate-850 dark:text-slate-100 block mt-0.5">
                  {myCartCourses.length} <span className="text-xs font-semibold text-slate-400">course{myCartCourses.length !== 1 && 's'}</span>
                </span>
                <Link to="/catalog" className="text-[10px] font-bold text-[#5B8A72] dark:text-[#7BC96F] hover:underline mt-1 block">
                  Go to Catalog →
                </Link>
              </div>
            </div>

            {/* Stat 3: Total Scheduled Class Days */}
            <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-[28px] p-4.5 flex items-center space-x-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_12px_45px_rgba(91,138,114,0.06)] hover:-translate-y-0.5 transition-all">
              <div className="h-10 w-10 rounded-2xl bg-[#F5F8F2] dark:bg-green-950/40 flex items-center justify-center text-[#8FB075] text-lg shadow-sm">
                📅
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Days</span>
                <span className="text-lg font-extrabold text-slate-850 dark:text-slate-100 block mt-0.5">
                  {highlightedScheduledDays.length} <span className="text-xs font-semibold text-slate-400">class day{highlightedScheduledDays.length !== 1 && 's'}</span>
                </span>
                <span className="text-[9px] text-slate-400 font-bold block mt-1 truncate uppercase">
                  {highlightedScheduledDays.length > 0 ? highlightedScheduledDays.join(', ') : 'No classes'}
                </span>
              </div>
            </div>
          </div>

          {/* User-friendly Filters Panel */}
          <div className="bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-[32px] p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.005)]">
            
            {/* Row 1: Search box and title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                {userHasRegisteredClasses ? '🔍 Filter My Courses' : '🔍 Filter Available Courses'}
              </h3>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450 dark:text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search course code, name, instructor..."
                  value={searchedKeyword}
                  onChange={(e) => setSearchedKeyword(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#5B8A72] focus:ring-1 focus:ring-[#5B8A72] transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Row 2: Subject pills selection list */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Subject Filters</span>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {subjectOptionsList.map((subjectItem) => {
                  const isActive = chosenSubject === subjectItem.id;
                  return (
                    <button
                      key={subjectItem.id}
                      onClick={() => setChosenSubject(subjectItem.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 shadow-3xs cursor-pointer ${
                        isActive
                          ? 'bg-[#5B8A72] text-white shadow-md shadow-[#5B8A72]/20 scale-102 border-transparent'
                          : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-[#7BC96F] hover:bg-[#FAFDF6] dark:hover:bg-[#7BC96F]/10'
                      }`}
                    >
                      <span>{subjectItem.emoji}</span>
                      <span>{subjectItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Class days schedule dropdown select */}
            <div className="pt-1">
              
              {/* Day filter select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Weekly Schedule Day</label>
                <div className="relative">
                  <select
                    value={chosenDay}
                    onChange={(e) => setChosenDay(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#5B8A72] focus:ring-1 focus:ring-[#5B8A72] transition-all cursor-pointer appearance-none shadow-3xs"
                  >
                    {dayOptionsList.map(dayItem => (
                      <option key={dayItem.id} value={dayItem.id}>{dayItem.emoji} {dayItem.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Courses Deck listing matching items */}
          <div className="space-y-5">
            {userHasRegisteredClasses ? (
              filteredRegisteredClasses.length > 0 ? (
                filteredRegisteredClasses.map((registrationItem, index) => {
                  const courseObj = registrationItem.course;
                  if (!courseObj) return null;
                  const theme = stylesOfCourseCards[index % stylesOfCourseCards.length];
                  const SubjectIcon = getIconForSubject(courseObj.department);
                  const descriptionText = descriptionsOfEachCourse[courseObj.code] || 'Explore the fundamentals, core abstractions, and advanced applications of this class.';

                  return (
                    <motion.div
                      key={registrationItem.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative flex flex-col md:flex-row items-center p-5 rounded-[32px] border ${theme.border} ${theme.bg} shadow-[0_12px_30px_-10px_rgba(91,138,114,0.08)] hover:shadow-[0_20px_40px_-5px_rgba(91,138,114,0.18)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300`}
                    >
                      {/* Left Graphic decoration */}
                      <div className="relative w-full md:w-36 h-24 md:h-28 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden mb-4 md:mb-0 md:mr-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className={`absolute inset-0 opacity-20 ${theme.graphicBg} scale-90 rounded-2xl animate-pulse-slow`} />
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`p-3 rounded-2xl ${theme.graphicBg} shadow-inner`}>
                            <SubjectIcon className={`h-7 w-7 ${theme.iconColor}`} />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full border border-slate-200 dark:border-slate-800" />
                      </div>

                      {/* Course summary Details */}
                      <div className="flex-1 text-center md:text-left min-w-0 pr-0 md:pr-4">
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                          <span className="text-[10px] font-extrabold bg-white/80 dark:bg-slate-900/80 px-2.5 py-0.5 rounded-full text-slate-450 dark:text-slate-500 uppercase tracking-widest shadow-3xs border border-slate-100/50 dark:border-slate-800/30">
                            {courseObj.code}
                          </span>

                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mt-2 truncate">
                          {courseObj.name}
                        </h3>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 max-w-lg leading-relaxed">
                          {descriptionText}
                        </p>

                        <div className="flex items-center justify-center md:justify-start space-x-3 mt-3 flex-wrap gap-y-1.5">
                          <span className="flex items-center text-[10px] font-bold text-[#5B8A72] dark:text-[#7BC96F] bg-white/80 dark:bg-slate-900/60 px-2.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 shadow-3xs">
                            📅 {courseObj.day}
                          </span>
                          <span className="flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/60 px-2.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 shadow-3xs">
                            ⏰ {courseObj.startTime.substring(0, 5)} - {courseObj.endTime.substring(0, 5)}
                          </span>
                        </div>
                        
                        <p className="text-[11px] font-bold text-slate-450 dark:text-slate-550 mt-3.5">
                          Professor: <span className="text-slate-650 dark:text-slate-300 font-semibold">{courseObj.instructor}</span>
                        </p>
                      </div>

                      {/* Manage button details */}
                      <Link to="/management" className="mt-4 md:mt-0 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1, x: 4 }}
                          whileTap={{ scale: 0.9 }}
                          className={`h-11 w-11 rounded-full ${theme.accent} flex items-center justify-center text-white shadow-md shadow-[#5B8A72]/20 transition-all cursor-pointer`}
                          title="Manage Enrolled Course"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </motion.button>
                      </Link>
                    </motion.div>
                  );
                })
              ) : null
            ) : (
              // If registrations are empty, render catalog previews matching active filters
              <>
                <div className="p-4 bg-[#5B8A72]/5 border border-[#5B8A72]/15 rounded-[22px] text-xs font-semibold text-[#5B8A72] dark:text-[#7BC96F]/90 leading-relaxed shadow-3xs">
                  📢 <span className="font-bold">Lesela eCourse Live Demo Mode:</span> You aren't enrolled in any courses yet! Showing available preview classes. Click the green arrow button to enroll or explore the Catalog to register.
                </div>
                {filteredPreviewCourses.length > 0 ? (
                  filteredPreviewCourses.map((mockCourse, index) => {
                    const theme = stylesOfCourseCards[index % stylesOfCourseCards.length];
                    const SubjectIcon = getIconForSubject(mockCourse.department);
                    const descriptionText = descriptionsOfEachCourse[mockCourse.code] || 'Explore the fundamentals, core abstractions, and advanced applications of this class.';

                    return (
                      <motion.div
                        key={mockCourse.code}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group relative flex flex-col md:flex-row items-center p-5 rounded-[32px] border ${theme.border} ${theme.bg} shadow-[0_12px_30px_-10px_rgba(91,138,114,0.08)] hover:shadow-[0_20px_40px_-5px_rgba(91,138,114,0.18)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300`}
                      >
                        {/* Left Graphic decoration */}
                        <div className="relative w-full md:w-36 h-24 md:h-28 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden mb-4 md:mb-0 md:mr-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                          <div className={`absolute inset-0 opacity-20 ${theme.graphicBg} scale-90 rounded-2xl animate-pulse-slow`} />
                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`p-3 rounded-2xl ${theme.graphicBg} shadow-inner`}>
                              <SubjectIcon className={`h-7 w-7 ${theme.iconColor}`} />
                            </div>
                          </div>
                          <div className="absolute top-2 left-2 h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <div className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full border border-slate-200 dark:border-slate-800" />
                        </div>

                        {/* Details summary */}
                        <div className="flex-1 text-center md:text-left min-w-0 pr-0 md:pr-4">
                          <div className="flex items-center justify-center md:justify-start space-x-2">
                            <span className="text-[10px] font-extrabold bg-white/80 dark:bg-slate-900/80 px-2.5 py-0.5 rounded-full text-slate-450 dark:text-slate-500 uppercase tracking-widest shadow-3xs border border-slate-100/50 dark:border-slate-800/30">
                              {mockCourse.code}
                            </span>

                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mt-2 truncate">
                            {mockCourse.name}
                          </h3>
                          
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 max-w-lg leading-relaxed">
                            {descriptionText}
                          </p>

                          <div className="flex items-center justify-center md:justify-start space-x-3 mt-3 flex-wrap gap-y-1.5">
                            <span className="flex items-center text-[10px] font-bold text-[#5B8A72] dark:text-[#7BC96F] bg-white/80 dark:bg-slate-900/60 px-2.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 shadow-3xs">
                              📅 {mockCourse.day}
                            </span>
                            <span className="flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/60 px-2.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 shadow-3xs">
                              ⏰ {mockCourse.startTime.substring(0, 5)} - {mockCourse.endTime.substring(0, 5)}
                            </span>
                          </div>
                          
                          <p className="text-[11px] font-bold text-slate-450 dark:text-slate-550 mt-3.5">
                            Professor: <span className="text-slate-650 dark:text-slate-300 font-semibold">{mockCourse.instructor}</span>
                          </p>
                        </div>

                        {/* Redirect button to Catalog Page */}
                        <Link to="/catalog" className="mt-4 md:mt-0 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.1, x: 4 }}
                            whileTap={{ scale: 0.9 }}
                            className={`h-11 w-11 rounded-full ${theme.accent} flex items-center justify-center text-white shadow-md shadow-[#5B8A72]/20 transition-all cursor-pointer`}
                            title="Register on Catalog"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </motion.button>
                        </Link>
                      </motion.div>
                    );
                  })
                ) : null}
              </>
            )}

            {/* Empty state fallbacks if no courses match active filter criteria */}
            {((userHasRegisteredClasses && filteredRegisteredClasses.length === 0) || (!userHasRegisteredClasses && filteredPreviewCourses.length === 0)) && (
              <div className="text-center py-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 rounded-[32px] space-y-4 shadow-sm">
                <Search className="h-10 w-10 mx-auto text-[#5B8A72]/45 dark:text-[#7BC96F]/45 animate-pulse" />
                <div className="space-y-1.5 text-center">
                  <h3 className="text-base font-bold text-slate-750 dark:text-slate-200">No matching courses</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">We couldn't find any courses matching your active filter criteria.</p>
                  <button 
                    onClick={() => {
                      setSearchedKeyword('');
                      setChosenSubject('ALL');
                      setChosenDay('ALL');
                    }}
                    className="mt-3 px-4 py-2 text-xs font-bold text-white bg-[#5B8A72] hover:bg-[#7BC96F] rounded-full transition-all shadow-sm cursor-pointer"
                  >
                    Clear All Filters ✨
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================================
            RIGHT COLUMN: Calendar Grid Widget & Action Shortcuts (Col Span 1)
            ======================================================================= */}
        <div className="space-y-7">

          {/* Premium Calendar widget */}
          <div className="bg-gradient-to-tr from-[#F2F8F5]/90 to-[#FAFDF6]/90 dark:from-emerald-950/20 dark:to-emerald-900/10 backdrop-blur-md border border-[#D8EDE2] dark:border-emerald-900/40 rounded-[32px] p-5 shadow-[0_12px_40px_rgba(91,138,114,0.08)] hover:shadow-[0_20px_50px_rgba(91,138,114,0.18)] hover:-translate-y-1 transition-all duration-300 space-y-4">
            
            {/* Calendar header details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#5B8A72] dark:text-[#7BC96F]">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">June 2026</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-450">
                <button className="p-1 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="p-1 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days grid titles */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-[#E3EFE8] dark:border-emerald-900/20 pb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayTitle => (
                <span key={dayTitle}>{dayTitle}</span>
              ))}
            </div>

            {/* Monthly calendar dates */}
            <div className="grid grid-cols-7 gap-y-3.5 gap-x-1.5 text-center text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              {/* Pre-fill empty offset days if any */}
              {Array.from({ length: emptyDaysBeforeJuneStarts }).map((_, index) => (
                <span key={`empty-${index}`} />
              ))}
              
              {/* Real June days */}
              {juneDaysNumbers.map((dayNumber) => {
                const dayOfWeekName = getNameOfDayForJuneDate(dayNumber);
                const isSelected = highlightedScheduledDays.includes(dayOfWeekName);
                const classesOnThisDay = getCourseNamesScheduledForDay(dayOfWeekName);
                const hoverText = classesOnThisDay.length > 0 
                  ? `Scheduled classes on ${dayOfWeekName}:\n• ${classesOnThisDay.join('\n• ')}`
                  : `No classes scheduled on ${dayOfWeekName}`;
                
                return (
                  <div key={dayNumber} className="flex justify-center items-center">
                    {isSelected ? (
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 3 }}
                        whileTap={{ scale: 0.9 }}
                        className="h-8 w-8 rounded-xl bg-[#E2F3D9] dark:bg-emerald-900/40 text-[#2F523E] dark:text-[#E2F3D9] border border-[#A8D5BA] dark:border-emerald-700/60 flex items-center justify-center font-extrabold shadow-sm shadow-[#A8D5BA]/50 dark:shadow-emerald-950/50 cursor-pointer text-[12px]"
                        title={hoverText}
                      >
                        {dayNumber}
                      </motion.div>
                    ) : (
                      <span 
                        className="h-8 w-8 flex items-center justify-center hover:bg-white/80 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer text-slate-650 dark:text-slate-400 hover:text-[#5B8A72]"
                        title={hoverText}
                      >
                        {dayNumber}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar description guides */}
            <div className="pt-2 border-t border-[#E3EFE8] dark:border-emerald-900/20 text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#7BC96F]" /> Class Scheduled</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-350 dark:bg-slate-700" /> Empty Day</span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.015)] space-y-4">
            <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
              ⚡ Quick Actions
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/catalog" className="w-full">
                <button className="w-full py-2.5 px-4 rounded-2xl bg-[#E3EFE8] hover:bg-[#5B8A72] text-[#5B8A72] hover:text-white font-bold text-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-3xs">
                  <span>📖</span> Explore Course Catalog
                </button>
              </Link>
              <Link to="/management" className="w-full">
                <button className="w-full py-2.5 px-4 rounded-2xl bg-[#FAFDF6] hover:bg-[#7BC96F] text-[#7BC96F] hover:text-white font-bold text-xs transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-3xs">
                  <span>🛠️</span> Manage Registrations
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
