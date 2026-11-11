import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message: string, type: ToastType = "info", duration: number = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearAll: () => set({ toasts: [] }),
}));

// Convenience singleton helper
export const toast = {
  success: (message: string, duration = 3500) =>
    useToastStore.getState().addToast(message, "success", duration),
  error: (message: string, duration = 4500) =>
    useToastStore.getState().addToast(message, "error", duration),
  info: (message: string, duration = 3000) =>
    useToastStore.getState().addToast(message, "info", duration),
  warning: (message: string, duration = 4000) =>
    useToastStore.getState().addToast(message, "warning", duration),
};
