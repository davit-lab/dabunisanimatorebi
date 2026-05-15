import { create } from 'zustand';

export interface CartAnimator {
  id: string;
  name: string;
  pricePerHour: number;
  quantity: number;
  hours: number;
  image: string;
}

export interface CartService {
  id: string;
  name: string;
  price: number;
  quantity: number;
  hours: number;
}

export interface CartState {
  date: string;
  timeSlotTime: string | null;
  programId: string | null;
  animators: Record<string, CartAnimator>;
  services: Record<string, CartService>;
  setDate: (d: string) => void;
  setTimeSlot: (time: string | null) => void;
  setProgram: (id: string | null) => void;
  setAnimator: (a: CartAnimator) => void;
  removeAnimator: (id: string) => void;
  setService: (s: CartService) => void;
  toggleService: (s: CartService) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  date: '',
  timeSlotTime: null,
  programId: null,
  animators: {},
  services: {},
  setDate: (d) => set({ date: d }),
  setTimeSlot: (time) => set({ timeSlotTime: time }),
  setProgram: (id) => set({ programId: id }),
  setAnimator: (a) =>
    set((s) => {
      const next = { ...s.animators };
      if (a.quantity <= 0) delete next[a.id];
      else next[a.id] = a;
      return { animators: next };
    }),
  removeAnimator: (id) =>
    set((s) => {
      const next = { ...s.animators };
      delete next[id];
      return { animators: next };
    }),
  setService: (svc) =>
    set((s) => {
      const next = { ...s.services };
      if (svc.quantity <= 0) delete next[svc.id];
      else next[svc.id] = svc;
      return { services: next };
    }),
  toggleService: (svc) =>
    set((s) => {
      const next = { ...s.services };
      if (next[svc.id]) delete next[svc.id];
      else next[svc.id] = { ...svc, quantity: svc.quantity || 1, hours: svc.hours || 1 };
      return { services: next };
    }),
  clear: () => set({ date: '', timeSlotTime: null, programId: null, animators: {}, services: {} }),
}));
