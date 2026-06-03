import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, LayoutDashboard, BookOpen, FileText, Settings, LogOut, 
  Menu, X, ShoppingCart, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ThemeSwitcher } from '../components/shared/ThemeSwitcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onOpenCart: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onOpenCart }) => {
  const { student, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Course Catalog', path: '/catalog', icon: BookOpen },
    { name: 'My Registrations', path: '/management', icon: FileText },
    { name: 'Profile Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#5B8A72] text-white flex-shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center space-x-2.5 text-white">
            <GraduationCap className="h-7 w-7 text-white" />
            <span className="font-extrabold text-lg tracking-tight text-white">
              Lesela eCourse
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4.5 w-4.5" />
                  <span>{link.name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 opacity-80" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                {student?.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{student?.name}</p>
                <p className="text-xs text-white/60 truncate">{student?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-full hover:bg-red-500/20 text-white/70 hover:text-red-300 transition-all"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 w-72 max-w-xs bg-[#5B8A72] text-white flex flex-col h-full shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                <Link to="/dashboard" className="flex items-center space-x-2 text-white">
                  <GraduationCap className="h-7 w-7 text-white" />
                  <span className="font-extrabold text-base tracking-tight text-white">
                    Lesela eCourse
                  </span>
                </Link>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-white/15 text-white shadow-md'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 mr-3" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                      {student?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{student?.name}</p>
                      <p className="text-xs text-white/60">{student?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-full hover:bg-red-500/20 text-white/70 hover:text-red-300"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header / Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/25 backdrop-blur-lg sticky top-0 z-30">
          {/* Burger Menu for Mobile */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Title or Page Context */}
          <div className="hidden md:block">
            <h1 className="text-sm font-bold tracking-tight text-muted-foreground">
              Welcome back, <span className="text-foreground">{student?.name}</span> 👋
            </h1>
          </div>

          {/* Action Items */}
          <div className="flex items-center space-x-4 ml-auto md:ml-0">
            <ThemeSwitcher />

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCart}
              className="relative p-2 rounded-full glass border-white/20 dark:border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm"
              title="Cart Drawer"
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
                  {cartItems.length}
                </span>
              )}
            </motion.button>

            {/* Mock User Details */}
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-inner">
              {student?.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Shell */}
        <main className="flex-1 p-6 md:p-8 relative">
          <div className="max-w-6xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
