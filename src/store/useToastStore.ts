import { create } from 'zustand';

interface ToastState {
  message: string;
  isError: boolean;
  visible: boolean;
  showToast: (message: string, isError?: boolean) => void;
  showError: (message: string) => void;
  hideToast: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set, get) => ({
  message: '',
  isError: false,
  visible: false,

  showToast: (message, isError = false) => {
    if (timer) clearTimeout(timer);
    set({ message, isError, visible: true });
    timer = setTimeout(() => get().hideToast(), 2800);
  },

  showError: (message) => get().showToast(message, true),

  hideToast: () => set({ visible: false }),
}));