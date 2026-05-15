export type Language = 'ka' | 'en';

export interface Animator {
  id: string;
  name: string;
  pricePerHour: number;
  category: string;
  image: string;
  description: string;
  ageGroup?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export interface TimeSlot {
  time: string;
  label: string;
  territoryPrice: number;
  multiplier: number;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  ageRange: string;
}

export interface NavLink { label: string; href: string; }
export interface FAQItem { question: string; answer: string; }
export interface MenuItem { name: string; price: string; }
export interface MenuCategory { title: string; items: MenuItem[]; }
