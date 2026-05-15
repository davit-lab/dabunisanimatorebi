import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useLangStore } from '@/store/langStore';
import { useContentStore } from '@/store/contentStore';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { VideoPlayer } from '@/components/site/VideoPlayer';
import { ReviewsSection } from '@/components/site/ReviewsSection';

export const Route = createFileRoute('/animators/$animatorId')({
  component: AnimatorDetail,
  notFoundComponent: () => (
    <div className="max-w-xl mx-auto p-10 text-center">
      <h1 className="font-display text-4xl gradient-text">404</h1>
      <Link to="/animators" className="mt-6 inline-block px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm">Back</Link>
    </div>
  ),
});

function AnimatorDetail() {
  const { animatorId } = Route.useParams();
  const { lang } = useLangStore();
  const { translations } = useContentStore();
  const t = translations[lang];
  const a = (t.animators || []).find((x: any) => x.id === animatorId);
  if (!a) throw notFound();

  const gallery: string[] = a.gallery || [a.image];
  const reviews: any[] = a.reviews || [];
  const faq: any[] = a.faq || [];
  const features: string[] = a.features || [];
  const [active, setActive] = useState(0);

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-8 md:py-14">
      <Link to="/animators" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft size={14} /> {lang === 'ka' ? 'უკან ანიმატორებზე' : 'Back to animators'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col gap-3">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[4/5] overflow-hidden rounded-[32px] bg-card border border-border shadow-glow">
            <img src={gallery[active] || a.image} alt={a.name} className="w-full h-full object-cover" />
          </motion.div>
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {gallery.map((img, i) => (
                <button key={i} onClick={() => setActive(i)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 ${active === i ? 'border-primary' : 'border-transparent'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {a.video && (
            <div className="aspect-video overflow-hidden rounded-[24px] bg-black border border-border">
              <VideoPlayer src={a.video} poster={a.image} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{a.category}</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl gradient-text leading-tight">{a.name}</h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium">{a.description}</p>


          {features.length > 0 && (
            <ul className="flex flex-col gap-2 mt-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-semibold">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} /></span>
                  {f}
                </li>
              ))}
            </ul>
          )}

          {a.longDescription && <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{a.longDescription}</p>}

          <Link to="/booking" className="mt-2 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-glow w-fit">
            {t.ui.book} <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <ReviewsSection targetType="animator" targetId={a.id} staticReviews={reviews} />

      {faq.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl md:text-4xl gradient-text mb-6">{lang === 'ka' ? 'კითხვები' : 'Questions'}</h2>
          <div className="flex flex-col gap-3">
            {faq.map((q: any, i: number) => (
              <details key={i} className="rounded-2xl bg-card border border-border p-5 group">
                <summary className="font-bold cursor-pointer flex justify-between items-center">{q.question}<span className="text-primary group-open:rotate-180 transition-transform">▾</span></summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{q.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
