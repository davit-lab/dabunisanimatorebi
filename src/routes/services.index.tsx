import { createFileRoute, Link } from '@tanstack/react-router';
import { useLangStore } from '@/store/langStore';
import { useContentStore } from '@/store/contentStore';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/services/')({ component: ServicesPage });

function ServicesPage() {
  const { lang } = useLangStore();
  const { translations } = useContentStore();
  const t = translations[lang];
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-10 md:py-16 flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{t.ui.services}</span>
        <h1 className="font-display text-5xl md:text-8xl gradient-text">{t.ui.services}</h1>
        <p className="text-lg md:text-xl text-muted-foreground font-semibold max-w-2xl">{t.ui.servicesDesc}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(t.services || []).map((s: any) => (
          <motion.div key={s.id} whileHover={{ y: -8 }} className="group relative overflow-hidden rounded-[32px] bg-card border border-border shadow-soft">
            <Link to="/services/$serviceId" params={{ serviceId: s.id }} className="block">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-glow">{s.category}</span>
                <h3 className="text-2xl md:text-3xl font-display">{s.name}</h3>
                <p className="text-sm opacity-90 font-medium line-clamp-2">{s.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xl font-display">{s.price}₾</span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-primary font-bold text-xs uppercase tracking-widest group-hover:scale-105 transition-all">
                    {lang === 'ka' ? 'დეტალურად' : 'Details'} <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
