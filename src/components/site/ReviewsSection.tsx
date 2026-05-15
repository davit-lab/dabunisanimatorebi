import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLangStore } from '@/store/langStore';
import { Star, Send, Loader2, Plus, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

type Review = { id: string; customer_name: string; rating: number; text: string; created_at: string };

const TAPE_COLORS = ['washi-coral', '', 'washi-grass', 'washi-sky'];
const TILTS = ['tilt-l-soft', 'tilt-r-soft', '-rotate-1', 'rotate-1'];

export function ReviewsSection({
  targetType,
  targetId,
  staticReviews = [],
}: {
  targetType: 'service' | 'animator' | 'program' | 'general';
  targetId?: string;
  staticReviews?: any[];
}) {
  const { lang } = useLangStore();
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('reviews').select('*').eq('status', 'approved').eq('target_type', targetType).order('created_at', { ascending: false });
    if (targetId) q = q.eq('target_id', targetId);
    const { data } = await q;
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [targetType, targetId]);

  const all = [
    ...items.map((r) => ({ author: r.customer_name, rating: r.rating, text: r.text })),
    ...staticReviews,
  ];

  const avg = all.length ? all.reduce((s, r) => s + (r.rating || 5), 0) / all.length : 0;

  return (
    <section className="mt-16 md:mt-20">
      <Toaster richColors position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-3">
          <span className="self-start inline-block px-3 py-1 bg-sun text-ink border-[2px] border-ink rounded-lg text-xs font-black uppercase tracking-wider shadow-sticker -rotate-2">
            {lang === 'ka' ? 'მომხმარებლები ამბობენ' : 'People say'}
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-ink leading-none">
            <span className="underline-hand">{lang === 'ka' ? 'მიმოხილვები' : 'Reviews'}</span>
          </h2>
          {all.length > 0 && (
            <div className="flex items-center gap-3 mt-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={20} className={i < Math.round(avg) ? 'fill-coral text-coral' : 'text-ink/20'} />
                ))}
              </div>
              <span className="font-black text-ink text-lg">{avg.toFixed(1)}</span>
              <span className="text-sm font-bold text-muted-foreground">
                · {all.length} {lang === 'ka' ? 'შეფასება' : 'reviews'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-coral text-white border-[3px] border-ink rounded-2xl px-5 py-3 font-black text-sm uppercase tracking-wider shadow-sticker press"
        >
          <Plus size={16} /> {lang === 'ka' ? 'მიმოხილვის დატოვება' : 'Leave a review'}
        </button>
      </div>

      {showForm && (
        <ReviewForm targetType={targetType} targetId={targetId} onSubmitted={() => { setShowForm(false); load(); }} />
      )}

      {loading && all.length === 0 ? (
        <div className="bg-white border-[3px] border-dashed border-ink/40 rounded-3xl p-10 text-center text-muted-foreground font-bold">
          {lang === 'ka' ? 'იტვირთება...' : 'Loading...'}
        </div>
      ) : all.length === 0 ? (
        <div className="bg-white border-[3px] border-dashed border-ink/40 rounded-3xl p-10 text-center">
          <p className="font-display text-2xl text-ink mb-1">{lang === 'ka' ? 'ჯერ მიმოხილვა არ არის' : 'No reviews yet'}</p>
          <p className="text-sm text-muted-foreground font-medium">{lang === 'ka' ? 'იყავი პირველი ვინც დატოვებს' : 'Be the first to leave one!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {all.map((r, i) => {
            const tilt = TILTS[i % TILTS.length];
            const tape = TAPE_COLORS[i % TAPE_COLORS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`relative bg-white border-[3px] border-ink rounded-3xl p-6 shadow-sticker-md flex flex-col gap-4 press ${tilt}`}
              >
                <div className={`washi ${tape} -top-3 left-8 -rotate-6 rounded-sm`} />
                <Quote className="absolute top-4 right-4 text-sun" size={32} />

                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={16} className={j < (r.rating || 5) ? 'fill-coral text-coral' : 'text-ink/15'} />
                  ))}
                </div>
                <p className="text-base font-medium text-ink leading-relaxed">{r.text}</p>
                <div className="flex items-center gap-3 mt-auto pt-3 border-t-[2px] border-dashed border-ink/15">
                  <div className="w-10 h-10 rounded-full bg-grass border-[2px] border-ink flex items-center justify-center text-white font-display text-lg">
                    {(r.author || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-black text-ink text-sm">{r.author}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ReviewForm({ targetType, targetId, onSubmitted }: { targetType: string; targetId?: string; onSubmitted: () => void }) {
  const { lang } = useLangStore();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('reviews').insert({
      customer_name: name.trim(),
      rating,
      text: text.trim(),
      target_type: targetType,
      target_id: targetId || null,
      status: 'pending',
    } as any);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(lang === 'ka' ? 'მადლობა! მიმოხილვა გადამოწმების შემდეგ გამოჩნდება.' : 'Thank you! Your review will appear after approval.');
    setName(''); setText(''); setRating(5);
    onSubmitted();
  };

  return (
    <form
      onSubmit={submit}
      className="mb-8 relative bg-white border-[3px] border-ink rounded-3xl p-6 md:p-8 shadow-sticker-md flex flex-col gap-4"
    >
      <div className="washi washi-coral -top-3 left-12 -rotate-3 rounded-sm" />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-ink">
          {lang === 'ka' ? 'შენი შეფასება' : 'Your rating'}
        </label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < (hover || rating);
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i + 1)}
                className="p-1 transition-transform hover:scale-125"
              >
                <Star size={32} className={filled ? 'fill-coral text-coral' : 'text-ink/20'} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-ink">
            {lang === 'ka' ? 'სახელი' : 'Name'}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={lang === 'ka' ? 'შენი სახელი' : 'Your name'}
            className="px-4 py-3 rounded-xl bg-cream border-[3px] border-ink font-bold text-ink focus:outline-none focus:ring-4 focus:ring-sun/40"
            required
            maxLength={80}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-black uppercase tracking-widest text-ink">
          {lang === 'ka' ? 'შენი გამოცდილება' : 'Your experience'}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={lang === 'ka' ? 'მოგვიყევი როგორ ჩაგატარდა ღონისძიება...' : 'Tell us how it went...'}
          className="px-4 py-3 rounded-xl bg-cream border-[3px] border-ink font-medium text-ink focus:outline-none focus:ring-4 focus:ring-sun/40 min-h-[120px] resize-none"
          required
          maxLength={1000}
        />
      </div>

      <button
        disabled={busy}
        className="self-start inline-flex items-center gap-2 bg-grass text-white border-[3px] border-ink rounded-2xl px-6 py-3 font-black uppercase tracking-wider shadow-sticker press disabled:opacity-60"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {lang === 'ka' ? 'გაგზავნა' : 'Submit'}
      </button>
    </form>
  );
}
