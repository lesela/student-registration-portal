import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Calendar, Award, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { registrationService } from '../../services/registrationService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { student, refreshUser } = useAuth();
  const { cartItems, removeFromCart, clearCart, getConflicts } = useCart();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load registered courses to perform conflict checks in the cart
  const { data: registrations = [] } = useQuery({
    queryKey: ['registrations', student?.id],
    queryFn: () => registrationService.getRegistrations(student!.id),
    enabled: !!student?.id && isOpen,
  });



  // Evaluate conflicts for all cart items
  const allCartConflicts = cartItems.map(course => {
    const conflicts = getConflicts(course, registrations);
    return {
      course,
      conflicts,
    };
  });

  const hasAnyConflicts = allCartConflicts.some(item => item.conflicts.length > 0);
  const isCheckoutDisabled = cartItems.length === 0 || hasAnyConflicts;

  // Mass checkout mutation using standard Promise.all or serial requests
  const handleCheckout = async () => {
    if (isCheckoutDisabled) return;
    setIsSubmitting(true);
    setIsConfirmOpen(false);

    try {
      // Enroll courses in sequence to ensure database safety and get correct error responses
      for (const course of cartItems) {
        await registrationService.registerCourse(course.id, student!.id);
      }

      success(`Successfully registered for ${cartItems.length} courses!`);
      clearCart();
      
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      await refreshUser(); // Update student totalCredits count
      onClose();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to complete registration.';
      error(`Registration Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-out Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full pl-10 flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-card/90 border-l border-border backdrop-blur-xl flex flex-col h-full shadow-2xl relative"
              >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary animate-pulse" />
                    <h2 className="text-base font-bold tracking-tight text-foreground">
                      Registration Cart
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                      {cartItems.length} Courses
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cartItems.length > 0 ? (
                    <div className="space-y-4">
                      {allCartConflicts.map(({ course, conflicts }) => {
                        const isCourseConflict = conflicts.length > 0;
                        return (
                          <div
                            key={course.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isCourseConflict 
                                ? 'bg-amber-500/5 border-amber-500/20' 
                                : 'bg-muted/40 border-border/50 hover:bg-muted/65'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-mono font-bold text-primary">{course.code}</span>
                                <h4 className="text-sm font-bold text-foreground truncate mt-0.5">{course.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1 text-indigo-400" />
                                  {course.day} • {course.startTime.slice(0, 5)} - {course.endTime.slice(0, 5)}
                                </p>
                              </div>
                              
                              <button
                                onClick={() => removeFromCart(course.id)}
                                className="p-1.5 ml-3 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                title="Remove from cart"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Show specific conflicts for this course */}
                            {isCourseConflict && (
                              <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                                {conflicts.map((conf, index) => (
                                  <div key={index} className="flex items-start space-x-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 leading-tight">
                                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                    <span>{conf.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Empty State inside Cart */
                    <div className="text-center py-20 text-muted-foreground text-xs space-y-4 max-w-xs mx-auto">
                      <div className="p-4 bg-muted rounded-full w-14 h-14 flex items-center justify-center mx-auto border border-border/40">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <h4 className="font-bold text-foreground text-sm">Your Cart is Empty</h4>
                      <p>Browse the course catalog and select the lectures you want to include in your semester plan.</p>
                      <Button variant="outline" size="sm" onClick={onClose}>Explore Catalog</Button>
                    </div>
                  )}
                </div>

                {/* Footer calculations & checkout */}
                {cartItems.length > 0 && (
                  <div className="p-6 border-t border-border bg-card/50 space-y-4">


                    {/* Conflict Warnings blocking Checkout */}
                    {hasAnyConflicts && (
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <span>Checkouts are blocked. Resolve all schedule conflicts or remove exceeding courses to proceed.</span>
                        </div>
                      </div>
                    )}

                    {/* Checkout Buttons */}
                    <div className="flex space-x-3 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={clearCart}
                        disabled={isSubmitting}
                      >
                        Clear All
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={isCheckoutDisabled}
                        isLoading={isSubmitting}
                        onClick={() => setIsConfirmOpen(true)}
                      >
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Enrollment"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to register for <span className="font-bold text-foreground">{cartItems.length} courses</span>:
          </p>
          
          <div className="p-3 bg-muted rounded-lg border border-border/40 divide-y divide-border/40 max-h-40 overflow-y-auto">
            {cartItems.map(c => (
              <div key={c.id} className="py-2 flex items-center justify-between text-xs font-bold text-foreground">
                <span>{c.code} - {c.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
            <span>This will finalize your registration and add these courses to your weekly timetable schedule.</span>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCheckout}>
              Confirm & Enroll
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
