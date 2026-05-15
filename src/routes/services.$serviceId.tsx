import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useLangStore } from '@/store/langStore';
import { useContentStore } from '@/store/contentStore';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ChevronLeft, Check, Play, ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { VideoPlayer } from '@/components/site/VideoPlayer';
import { isVideoFile, getEmbedUrl } from '@/lib/media';
import { ReviewsSection } from '@/components/site/ReviewsSection';

export const Route = createFileRoute('/services/$serviceId')({
  component: ServiceDetail,
  notFoundComponent: () => (
    <div className="max-w-xl mx-auto p-10 text-center">
      <h1 className="font-display text-4xl gradient-text">404</h1>
      <p className="mt-2 text-muted-foreground">Service not found.</p>
      <Link to="/services" className="mt-6 inline-block px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm">Back</Link>
    </div>
  ),
});

type MediaItem = { type: 'image' | 'video'; src: string };

function ServiceDetail() {
  const { serviceId } = Route.useParams();
  const { lang } = useLangStore();
  const { translations } = useContentStore();
  const t = translations[lang];
  const service = (t.services || []).find((s: any) => s.id === serviceId);
  if (!service) throw notFound();

  // Build a unified media list (images + video) so video lives in the gallery, not duplicated below
  const galleryImages: string[] = (service.gallery && service.gallery.length ? service.gallery : [service.image]).filter(Boolean);
  const media: MediaItem[] = [
    ...galleryImages.map((src) => ({ type: 'image' as const, src })),
    ...(service.video ? [{ type: 'video' as const, src: service.video }] : []),
  ];
  const reviews: any[] = service.reviews || [];
  const faq: any[] = service.faq || [];
  const features: string[] = service.features || [];
  const [active, setActive] = useState(0);
  const current = media[active] || { type: 'image', src: service.image };

  const avgRating = reviews.length
    ? reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length
    : 0;

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-8 md:py-14">
      <Link to="/services" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ChevronLeft size={14} /> {lang === 'ka' ? 'სერვისებს უკან' : 'Back to services'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Media */}
        <div className="flex flex-col gap-3">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="aspect-[4/3] overflow-hidden rounded-[32px] bg-card border border-border shadow-glow relative group"
          >
            {current.type === 'video' ? (
              <VideoPlayer src={current.src} poster={service.image} />
            ) : (
              <img src={current.src} alt={service.name} className="w-full h-full object-cover" />
            )}
          </motion.div>

          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {media.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${active === i ? 'border-primary scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  aria-label={m.type === 'video' ? 'Play video' : `Image ${i + 1}`}
                >
                  {m.type === 'video' ? (
                    <>
                      {(isVideoFile(m.src) && !getEmbedUrl(m.src)) ? (
                        <video src={m.src} className="w-full h-full object-cover" muted />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play size={20} className="text-white fill-white" />
                      </span>
                    </>
                  ) : (
                    <img src={m.src} className="w-full h-full object-cover" alt="" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {service.category && (
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{service.category}</span>
            )}
            <h1 className="font-display text-4xl md:text-6xl gradient-text leading-tight">{service.name}</h1>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className={j < Math.round(avgRating) ? 'fill-secondary text-secondary' : 'text-muted'} />
                  ))}
                </div>
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span>· {reviews.length} {lang === 'ka' ? 'მიმოხილვა' : 'reviews'}</span>
              </div>
            )}
            <p className="text-base md:text-lg text-muted-foreground font-medium">{service.description}</p>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="font-display text-5xl text-primary">{service.price}₾</span>
            {service.oldPrice && <span className="text-xl line-through text-muted-foreground">{service.oldPrice}₾</span>}
          </div>

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

          {service.longDescription && (
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{service.longDescription}</p>
          )}

          <Link to="/booking" className="mt-2 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-glow w-fit">
            {t.ui.book} <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Video showcase (large) */}
      {service.video && (
        <section className="mt-16">
          <div className="flex items-center gap-2 mb-4">
            <Play size={18} className="text-primary fill-primary" />
            <h2 className="font-display text-2xl md:text-3xl gradient-text">{lang === 'ka' ? 'ვიდეო' : 'Video'}</h2>
          </div>
          <div className="aspect-video overflow-hidden rounded-[28px] bg-black border border-border shadow-glow">
            <VideoPlayer src={service.video} poster={service.image} />
          </div>
        </section>
      )}

      <ReviewsSection targetType="service" targetId={service.id} staticReviews={reviews} />

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="mt-16 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle size={18} className="text-primary" />
            <h2 className="font-display text-3xl md:text-4xl gradient-text">{lang === 'ka' ? 'ხშირი კითხვები' : 'FAQ'}</h2>
          </div>
          <div className="flex flex-col gap-3 max-w-3xl">
            {faq.map((q: any, i: number) => (
              <details key={i} className="rounded-2xl bg-card border border-border p-5 group hover:border-primary/40 transition-colors">
                <summary className="font-bold cursor-pointer flex justify-between items-center gap-4 list-none">
                  <span>{q.question}</span>
                  <ChevronDown size={18} className="text-primary group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{q.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
