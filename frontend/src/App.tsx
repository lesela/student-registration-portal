import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Contexts
import { useAuth } from './context/AuthContext';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CatalogPage } from './pages/CatalogPage';
import { ManagementPage } from './pages/ManagementPage';
import { ProfilePage } from './pages/ProfilePage';

// Layouts & Drawers
import { DashboardLayout } from './layouts/DashboardLayout';
import { CartDrawer } from './components/registration/CartDrawer';
import { Loader } from './components/ui/Loader';

// 1. Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader variant="spinner" />
        <span className="text-sm text-muted-foreground font-semibold">Decrypting secure tokens...</span>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 2. Public-Only Route Guard (redirects already logged-in users to /dashboard)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader variant="spinner" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// 3. Wrapper to inject Dashboard Shell and Cart Drawer dynamically
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Animated Page Transitions
  const pageVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2, ease: 'easeIn' as const } },
  };

  const wrapInTransition = (component: React.ReactElement) => (
    <motion.div
      key={location.pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full flex flex-col"
    >
      {component}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Views */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                {wrapInTransition(<LoginPage />)}
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                {wrapInTransition(<LoginPage />)}
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                {wrapInTransition(<RegisterPage />)}
              </PublicRoute>
            } 
          />

          {/* Private Shell Views */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCart={() => setIsCartOpen(true)}>
                  {wrapInTransition(<DashboardPage />)}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCart={() => setIsCartOpen(true)}>
                  {wrapInTransition(<CatalogPage />)}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/management"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCart={() => setIsCartOpen(true)}>
                  {wrapInTransition(<ManagementPage />)}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout onOpenCart={() => setIsCartOpen(true)}>
                  {wrapInTransition(<ProfilePage />)}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {/* Persistent cart drawer for protected views */}
      {isAuthenticated && (
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
