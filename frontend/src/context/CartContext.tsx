import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Course, Registration } from '../types';
import { useAuth } from './AuthContext';

interface CartConflict {
  type: 'schedule' | 'credits' | 'duplicate' | 'full';
  message: string;
  conflictingCourse?: Course;
}

interface CartContextType {
  cartItems: Course[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: number) => void;
  clearCart: () => void;
  getConflicts: (course: Course, registered: Registration[]) => CartConflict[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Course[]>([]);
  const { student } = useAuth();

  // Load cart items from localStorage on startup if user is logged in
  useEffect(() => {
    if (student) {
      const saved = localStorage.getItem(`cart_${student.id}`);
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } else {
      setCartItems([]);
    }
  }, [student]);

  // Save to localStorage when changed
  useEffect(() => {
    if (student) {
      localStorage.setItem(`cart_${student.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, student]);

  const addToCart = (course: Course) => {
    if (cartItems.some(item => item.id === course.id)) return;
    setCartItems(prev => [...prev, course]);
  };

  const removeFromCart = (courseId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== courseId));
  };

  const clearCart = () => {
    setCartItems([]);
  };



  // Checks overlaps between two courses
  const isTimeOverlapping = (c1: Course, c2: Course): boolean => {
    if (c1.day.toUpperCase() !== c2.day.toUpperCase()) return false;
    // Format: "10:00" or "10:00:00" -> extract hours & minutes
    const parseTime = (t: string) => {
      const parts = t.split(':');
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };

    const start1 = parseTime(c1.startTime);
    const end1 = parseTime(c1.endTime);
    const start2 = parseTime(c2.startTime);
    const end2 = parseTime(c2.endTime);

    return Math.max(start1, start2) < Math.min(end1, end2);
  };

  const getConflicts = (course: Course, registered: Registration[]): CartConflict[] => {
    const conflicts: CartConflict[] = [];

    // 1. Check duplicate
    const isAlreadyRegistered = registered.some(reg => reg.courseId === course.id);
    if (isAlreadyRegistered) {
      conflicts.push({
        type: 'duplicate',
        message: `You are already registered for ${course.code}.`,
      });
      return conflicts; // No need to check other conflicts
    }

    // 2. Check full course
    if (course.enrolledStudents >= course.capacity) {
      conflicts.push({
        type: 'full',
        message: `${course.code} is full (${course.enrolledStudents}/${course.capacity} seats taken).`,
      });
    }



    // 4. Check schedule conflict with registered courses
    for (const reg of registered) {
      if (reg.course && isTimeOverlapping(course, reg.course)) {
        conflicts.push({
          type: 'schedule',
          message: `Schedule conflict on ${course.day} with registered course ${reg.course.code} (${reg.course.startTime.slice(0, 5)} - ${reg.course.endTime.slice(0, 5)}).`,
          conflictingCourse: reg.course,
        });
      }
    }

    // 5. Check schedule conflict with other cart items
    for (const item of cartItems) {
      if (item.id !== course.id && isTimeOverlapping(course, item)) {
        conflicts.push({
          type: 'schedule',
          message: `Schedule conflict on ${course.day} with course in cart ${item.code} (${item.startTime.slice(0, 5)} - ${item.endTime.slice(0, 5)}).`,
          conflictingCourse: item,
        });
      }
    }

    return conflicts;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getConflicts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
