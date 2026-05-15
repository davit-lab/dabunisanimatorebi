import { createFileRoute, Link } from '@tanstack/react-router';
import { useLangStore } from '@/store/langStore';
import { useContentStore } from '@/store/contentStore';
import { ArrowRight, Star, PartyPopper, Cake, Gift } from 'lucide-react';
import { VideoPlayer } from '@/components/site/VideoPlayer';
import { isVideoFile, getEmbedUrl } from '@/lib/media';

export const Route = createFileRoute('/')({ component: Home });

const STICKER_COLORS = ['bg-coral', 'bg-sun', 'bg-grass', 'bg-sky'] as const;

function Sticker({
  item,
  type,
  index,
}: {
  item: any;
  type: 'animator' | 'service' | 'program';
  index: number;
}) {
  const { lang } = useLangStore();
  const tilt = index % 2 === 0 ? 'tilt-l-soft' : 'tilt-r-soft';
  const tape = STICKER_COLORS[index % STICKER_COLORS.length];

  return (
    <div className={`group relative bg-white border-[3px] border-ink rounded-3xl p-3 shadow-sticker-md press ${tilt}`}>
      {/* washi tape on top */}
      <div className={`washi ${tape === 'bg-coral' ? 'washi-coral' : tape === 'bg-sun' ? '' : tape === 'bg-grass' ? 'washi-grass' : 'washi-sky'} -top-3 left-6 -rotate-6 rounded-sm`} />

      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-[3px] border-ink">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.category && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-sun text-ink text-[11px] font-black uppercase tracking-wider border-[2px] border-ink rounded-full shadow-sticker">
            {item.category}
          </span>
        )}
        {type === 'program' && item.ageRange && (
          <span className="absolute top-3 right-3 px-3 py-1 bg-grass text-white text-[11px] font-black border-[2px] border-ink rounded-full shadow-sticker">
            {item.ageRange}y+
          </span>
        )}
      </div>

      <div className="px-2 pt-4 pb-2 flex flex-col gap-2">
        <h3 className="font-display text-xl text-ink leading-tight">{item.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 font-medium">{item.description}</p>
        <div className="flex items-center justify-between mt-1">
          {type !== 'animator' ? (
            <span className="font-display text-2xl text-coral">
              {type === 'program' ? `${item.pricePerHour}₾` : `${item.price}₾`}
              <span className="text-sm text-muted-foreground font-body font-semibold ml-1">
                {type === 'program' ? (lang === 'ka' ? '/სთ' : '/hr') : ''}
              </span>
            </span>
          ) : (
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {lang === 'ka' ? 'გაიცანი' : 'Meet me'}
            </span>
          )}
          <span className="w-10 h-10 rounded-full bg-coral text-white border-[3px] border-ink flex items-center justify-center shadow-sticker group-hover:rotate-12 transition-transform">
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </div>
  );
}

function FeatureBox({
  icon,
  title,
  desc,
  color,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'coral' | 'sun' | 'grass' | 'sky';
  index: number;
}) {
  const tilt = index === 1 ? 'md:translate-y-4' : index === 2 ? 'md:-translate-y-2' : '';
  const colorBg: Record<string, string> = {
    coral: 'bg-coral text-white',
    sun: 'bg-sun text-ink',
    grass: 'bg-grass text-white',
    sky: 'bg-sky text-white',
  };
  return (
    <div className={`relative bg-white border-[3px] border-ink rounded-3xl p-7 md:p-8 shadow-sticker-md press ${tilt}`}>
      <div className={`absolute -top-6 -left-2 w-14 h-14 rounded-2xl border-[3px] border-ink ${colorBg[color]} flex items-center justify-center shadow-sticker -rotate-6`}>
        {icon}
      </div>
      <h3 className="font-display text-2xl text-ink mt-4 mb-2">{title}</h3>
      <p className="text-base text-muted-foreground font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  link,
  linkLabel,
  accent = 'coral',
}: {
  kicker: string;
  title: string;
  link: string;
  linkLabel: string;
  accent?: 'coral' | 'sun' | 'grass' | 'sky';
}) {
  const accentBg: Record<string, string> = {
    coral: 'bg-coral text-white',
    sun: 'bg-sun text-ink',
    grass: 'bg-grass text-white',
    sky: 'bg-sky text-white',
  };
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
      <div className="flex flex-col gap-3">
        <span className={`self-start inline-block px-3 py-1 ${accentBg[accent]} border-[2px] border-ink rounded-lg text-xs font-black uppercase tracking-wider shadow-sticker -rotate-2`}>
          {kicker}
        </span>
        <h2 className="font-display text-5xl md:text-6xl text-ink leading-none">
          <span className="underline-hand">{title}</span>
        </h2>
      </div>
      <Link
        to={link}
        className="inline-flex items-center gap-2 bg-white text-ink border-[3px] border-ink rounded-xl px-5 py-3 font-black text-sm uppercase tracking-wider shadow-sticker press"
      >
        {linkLabel}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function Home() {
  const { lang } = useLangStore();
  const { translations, assets } = useContentStore();
  const t = translations[lang];
  const heroVideo = (assets as any).heroVideo as string | undefined;
  const heroFallback = (assets as any).heroFallback as string | undefined;
  const showVideo = heroVideo && (isVideoFile(heroVideo) || getEmbedUrl(heroVideo));

  const features = [
    {
      icon: <Star size={26} />,
      title: lang === 'ka' ? 'პროფესიონალი ანიმატორები' : 'Pro Animators',
      desc:
        lang === 'ka'
          ? 'გამოცდილი პერსონაჟები, რომლებიც გახდიან თქვენი დღესასწაულის გმირები.'
          : 'Experienced characters who become the heroes of every celebration.',
      color: 'coral' as const,
    },
    {
      icon: <PartyPopper size={26} />,
      title: lang === 'ka' ? 'ასაკის შესაბამისად' : 'Age-Appropriate',
      desc:
        lang === 'ka'
          ? 'ინდივიდუალურად შერჩეული გასართობი თითოეული ასაკისთვის.'
          : 'Hand-picked entertainment for every age group.',
      color: 'sun' as const,
    },
    {
      icon: <Gift size={26} />,
      title: lang === 'ka' ? 'სრული სერვისი' : 'Full Service',
      desc:
        lang === 'ka'
          ? 'ფოტო, ვიდეო, დეკორაცია, ნამცხვარი — ყველაფერი ერთ ადგილას.'
          : 'Photo, video, decoration, cake — everything in one place.',
      color: 'grass' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-20 md:gap-28 pb-8">
      {/* === HERO === */}
      <section className="pt-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-white border-[3px] border-ink rounded-[2rem] md:rounded-[2.5rem] shadow-sticker-xl overflow-hidden relative">
          <div className="grid lg:grid-cols-2">
            {/* Text side */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center gap-6 relative">
              <span className="self-start inline-flex items-center gap-2 px-4 py-1.5 bg-grass text-white border-[2px] border-ink rounded-lg font-black text-xs uppercase tracking-wider shadow-sticker -rotate-2">
                <PartyPopper size={14} /> {lang === 'ka' ? 'სიხარული გარანტირებულია' : 'Happiness guaranteed'}
              </span>

              <h1 className="font-display text-7xl md:text-8xl lg:text-9xl text-ink leading-[0.85] tracking-tight">
                <span className="inline-block">DUBUNI</span>
                <span className="text-coral">!</span>
              </h1>
              <div className="h-3 w-44 bg-sun -mt-2 rounded-full -rotate-1 border-[2px] border-ink" />

              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                {t.ui.heroDesc ||
                  (lang === 'ka'
                    ? 'დაუვიწყარი თავგადასავლები, ანიმატორები და საუკეთესო გარემო თქვენი დღესასწაულისთვის.'
                    : 'Unforgettable adventures, animators and the best vibes for your celebration.')}
              </p>

              <div className="flex flex-wrap gap-4 mt-2">
                <Link
                  to="/animators"
                  className="inline-flex items-center gap-2 bg-coral text-white border-[3px] border-ink rounded-2xl px-6 py-4 font-display text-lg shadow-sticker-lg press"
                >
                  {t.ui.seeAnimators || (lang === 'ka' ? 'ანიმატორების ნახვა' : 'See animators')}
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 bg-white text-ink border-[3px] border-ink rounded-2xl px-6 py-4 font-display text-lg shadow-sticker-lg press"
                >
                  {t.ui.book || (lang === 'ka' ? 'დაჯავშნა' : 'Book now')}
                </Link>
              </div>

              <div className="mt-4 inline-flex items-center gap-3 self-start bg-cream border-[3px] border-dashed border-ink rounded-2xl p-3">
                <div className="flex -space-x-2">
                  {(['bg-sun', 'bg-coral', 'bg-grass', 'bg-sky'] as const).map((c, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full ${c} border-[2px] border-ink flex items-center justify-center text-ink`}
                    >
                      <Star size={14} className="fill-ink" />
                    </div>
                  ))}
                </div>
                <span className="font-bold text-ink">
                  {lang === 'ka' ? '500+ ბედნიერი ოჯახი' : '500+ happy families'}
                </span>
              </div>
            </div>

            {/* Media side */}
            <div className="relative bg-sun border-l-0 lg:border-l-[3px] border-t-[3px] lg:border-t-0 border-ink p-6 md:p-10 flex items-center justify-center min-h-[420px]">
              {/* Decorative dots */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, var(--ink) 1.5px, transparent 1.5px)',
                  backgroundSize: '22px 22px',
                }}
              />
              <div className="relative w-full max-w-md aspect-[4/5] bg-white border-[3px] border-ink rounded-2xl shadow-sticker-xl overflow-hidden tilt-r hover:rotate-0 transition-transform duration-500">
                {showVideo ? (
                  getEmbedUrl(heroVideo!) ? (
                    <VideoPlayer src={heroVideo!} />
                  ) : (
                    <video
                      src={heroVideo}
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster={heroFallback}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : heroFallback ? (
                  <img src={heroFallback} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-coral flex items-center justify-center">
                    <Cake size={80} className="text-white" />
                  </div>
                )}
              </div>

              {/* Floating badges */}
              <div className="absolute top-8 right-6 bg-coral text-white border-[3px] border-ink rounded-2xl px-4 py-2 font-display text-lg shadow-sticker rotate-12 hidden md:block">
                PARTY!
              </div>
              <div className="absolute bottom-8 left-6 bg-sky text-white border-[3px] border-ink rounded-full px-4 py-2 font-display text-base shadow-sticker -rotate-6 hidden md:block">
                🎈 join us
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 pt-4">
          {features.map((f, i) => (
            <FeatureBox key={i} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* === ANIMATORS === */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker={t.ui.animatorsSubtitle || (lang === 'ka' ? 'გაიცანი ჩვენი' : 'Meet our')}
            title={t.ui.animatorsTitle || (lang === 'ka' ? 'გმირები' : 'Heroes')}
            link="/animators"
            linkLabel={t.ui.seeAll || (lang === 'ka' ? 'ყველა' : 'See all')}
            accent="coral"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(t.animators || []).slice(0, 3).map((a: any, i: number) => (
              <Link key={a.id} to="/animators/$animatorId" params={{ animatorId: a.id }}>
                <Sticker item={a} type="animator" index={i} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === HOSTS === */}
      {(t.hosts || []).length > 0 && (
        <section className="px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              kicker={t.ui.hostsSubtitle || (lang === 'ka' ? 'ჩვენი' : 'Our')}
              title={t.ui.hostsTitle || (lang === 'ka' ? 'წამყვანები' : 'Hosts')}
              link="/hosts"
              linkLabel={t.ui.seeAll || (lang === 'ka' ? 'ყველა' : 'See all')}
              accent="sky"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(t.hosts || []).slice(0, 3).map((h: any, i: number) => (
                <Link key={h.id} to="/hosts/$hostId" params={{ hostId: h.id }}>
                  <Sticker item={h} type="animator" index={i} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === PROGRAMS === */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker={t.ui.programsSubtitle || (lang === 'ka' ? 'ასაკის მიხედვით' : 'By age')}
            title={t.ui.programsTitle || (lang === 'ka' ? 'პროგრამები' : 'Programs')}
            link="/programs"
            linkLabel={t.ui.seeAll || (lang === 'ka' ? 'ყველა' : 'See all')}
            accent="sun"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(t.programs || []).map((p: any, i: number) => (
              <Link key={p.id} to="/programs/$programId" params={{ programId: p.id }}>
                <Sticker item={p} type="program" index={i} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === SERVICES === */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker={t.ui.servicesSubtitle || (lang === 'ka' ? 'სპეციალურად' : 'Specially')}
            title={t.ui.services || (lang === 'ka' ? 'სერვისები' : 'Services')}
            link="/services"
            linkLabel={t.ui.seeAll || (lang === 'ka' ? 'ყველა' : 'See all')}
            accent="grass"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(t.services || []).slice(0, 3).map((s: any, i: number) => (
              <Link key={s.id} to="/services/$serviceId" params={{ serviceId: s.id }}>
                <Sticker item={s} type="service" index={i} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="px-4 md:px-8">
        <div className="max-w-6xl mx-auto bg-coral border-[3px] border-ink rounded-[2rem] shadow-sticker-xl p-10 md:p-16 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle, white 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />
          <Cake size={48} className="mx-auto text-white mb-4 wiggle" />
          <h2 className="font-display text-4xl md:text-6xl text-white text-balance mb-4 relative">
            {lang === 'ka' ? 'მზად ხართ დღესასწაულისთვის?' : 'Ready to celebrate?'}
          </h2>
          <p className="text-white/90 text-lg max-w-xl mx-auto mb-8 font-medium relative">
            {lang === 'ka'
              ? 'შექმენი დაუვიწყარი მომენტი ჩვენთან ერთად. დაჯავშნე ერთ წუთში.'
              : "Let's make the day unforgettable. Book in under a minute."}
          </p>
          <Link
            to="/booking"
            className="relative inline-flex items-center gap-2 bg-white text-ink border-[3px] border-ink rounded-2xl px-7 py-4 font-display text-xl shadow-sticker-lg press"
          >
            {t.ui.book || (lang === 'ka' ? 'დაჯავშნა' : 'Book now')}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
