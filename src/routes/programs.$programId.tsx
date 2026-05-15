import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useLangStore } from '@/store/langStore';
import { useContentStore } from '@/store/contentStore';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { VideoPlayer } from '@/components/site/VideoPlayer';
import { ReviewsSection } from '@/components/site/ReviewsSection';

export const Route = createFileRoute('/programs/$programId')({
  component: ProgramDetail,
  notFoundComponent: () => (
    <div className="max-w-xl mx-auto p-10 text-center">
      <h1 className="font-display text-4xl gradient-text">404</h1>
      <Link to="/programs" className="mt-6 inline-block px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm">Back</Link>
    </div>
  ),
});

function ProgramDetail() {
  const { programId } = Route.useParams();
  const { lang } = useLangStore();
  const { translations } = useContentStore();
  const t = translations[lang];
  const p = (t.programs || []).find((x: any) => x.id === programId);
  if (!p) throw notFound();

  const gallery: string[] = p.gallery || [p.image];
  const reviews: any[] = p.reviews || [];
  const faq: any[] = p.faq || [];
  const features: string[] = p.features || [];
  const [active, setActive] = useState(0);

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-8 md:py-14">
      <Link to="/programs" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-secondary mb-6">
        <ChevronLeft size={14} /> {lang === 'ka' ? 'უკან პროგრამებზე' : 'Back to programs'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col gap-3">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[4/5] overflow-hidden rounded-[32px] bg-card border border-border shadow-glow">
            <img src={gallery[active] || p.image} alt={p.name} className="w-full h-full object-cover" />
          </motion.div>
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {gallery.map((img, i) => (
                <button key={i} onClick={() => setActive(i)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 ${active === i ? 'border-secondary' : 'border-transparent'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {p.video && (
            <div className="aspect-video overflow-hidden rounded-[24px] bg-black border border-border">
              <VideoPlayer src={p.video} poster={p.image} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{p.category}</span>
            {p.ageRange && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/30">
                {p.ageRange}y+
              </span>
            )}
          </div>
          <h1 className="font-display text-4xl md:text-6xl gradient-text leading-tight">{p.name}</h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium">{p.description}</p>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl text-secondary">{p.pricePerHour}₾</span>
            <span className="text-lg text-muted-foreground">/{lang === 'ka' ? 'საათი' : 'hour'}</span>
          </div>

          {features.length > 0 && (
            <ul className="flex flex-col gap-2 mt-4 p-4 bg-muted/40 rounded-2xl border border-border/50">
              <p className="text-sm font-bold uppercase text-secondary mb-2">{lang === 'ka' ? 'რა შედის?' : 'What\'s Included?'}</p>
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-semibold">
                  <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} /></span>
                  {f}
                </li>
              ))}
            </ul>
          )}

          {p.longDescription && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-accent/10 rounded-2xl border border-accent/20"
            >
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{p.longDescription}</p>
            </motion.div>
          )}

          <div className="flex gap-3 flex-wrap pt-2">
            <Link
              to="/booking"
              className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-secondary text-foreground font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-glow"
            >
              {t.ui.book} <ArrowRight size={18} />
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-4 rounded-full bg-muted text-muted-foreground font-bold text-sm hover:bg-muted/80 transition-colors border border-border"
            >
              {lang === 'ka' ? 'კითხვა' : 'Ask'}
            </motion.button>
          </div>
        </div>
      </div>

      <ReviewsSection targetType="program" targetId={p.id} staticReviews={reviews} />

      {faq.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl md:text-4xl gradient-text mb-6">{lang === 'ka' ? 'ხშირი კითხვები' : 'FAQ'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faq.map((q: any, i: number) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-card border border-border p-5 group hover:shadow-card transition-all cursor-pointer"
              >
                <summary className="font-bold cursor-pointer flex justify-between items-center list-none">
                  <span className="text-sm md:text-base">{q.question}</span>
                  <span className="text-secondary group-open:rotate-180 transition-transform flex-shrink-0 ml-2">▾</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{q.answer}</p>
              </motion.details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
