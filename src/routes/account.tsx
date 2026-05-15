import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useContentStore } from '@/store/contentStore';
import { useLangStore } from '@/store/langStore';
import { Calendar, MapPin, Clock, LogOut, CheckCircle2, Hourglass, XCircle, Loader2, User, Bell } from 'lucide-react';

export const Route = createFileRoute('/account')({
  component: AccountPage,
  head: () => ({ meta: [{ title: 'ჩემი ანგარიში · Dubuni' }] }),
});

interface Booking {
  id: string;
  booking_date: string;
  status: string;
  total_price: number;
  city: string | null;
  address: string;
  time_slot: any;
  program: any;
  animators: any[];
  services: any[];
  created_at: string;
}

interface Notif {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  read_at: string | null;
  type: string;
}

function AccountPage() {
  const { user, signOut } = useContentStore();
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [tab, setTab] = useState<'bookings' | 'notifications'>('bookings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) return; // wait for hydration
    if (!user) { navigate({ to: '/auth' }); return; }
    let cancel = false;
    (async () => {
      setLoading(true);
      const [b, n] = await Promise.all([
        supabase.from('bookings').select('*').eq('user_id', user.id).order('booking_date', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      ]);
      if (cancel) return;
      setBookings((b.data || []) as any);
      setNotifs((n.data || []) as any);
      setLoading(false);
    })();

    const ch = supabase.channel('account-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` }, (p) => {
        if (p.eventType === 'INSERT') setBookings((prev) => [p.new as any, ...prev]);
        else if (p.eventType === 'UPDATE') setBookings((prev) => prev.map((x) => x.id === (p.new as any).id ? p.new as any : x));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (p) => {
        if (p.eventType === 'INSERT') setNotifs((prev) => [p.new as any, ...prev]);
        else if (p.eventType === 'UPDATE') setNotifs((prev) => prev.map((x) => x.id === (p.new as any).id ? p.new as any : x));
      })
      .subscribe();
    return () => { cancel = true; supabase.removeChannel(ch); };
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: '/' });
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-coral" />
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter((b) => b.booking_date >= today);
  const past = bookings.filter((b) => b.booking_date < today);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-10 md:py-14 flex flex-col gap-8">
      {/* Header */}
      <div className="bg-white border-[3px] border-ink rounded-[2.5rem] p-6 md:p-8 shadow-sticker-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-coral text-white border-[3px] border-ink shadow-sticker -rotate-3 flex items-center justify-center">
            <User size={28} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-coral">{lang === 'ka' ? 'მოგესალმებით' : 'Welcome'}</span>
            <h1 className="font-display text-2xl md:text-4xl text-ink leading-tight">{user.email?.split('@')[0]}</h1>
            <p className="text-xs text-ink/60 font-medium mt-0.5">{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 bg-white text-ink border-[3px] border-ink rounded-xl px-4 py-2 font-black text-sm shadow-sticker press">
          <LogOut size={16} /> {lang === 'ka' ? 'გასვლა' : 'Sign out'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 flex-wrap">
        <TabBtn active={tab === 'bookings'} onClick={() => setTab('bookings')} icon={<Calendar size={16} />} label={lang === 'ka' ? `ჯავშნები (${bookings.length})` : `Bookings (${bookings.length})`} />
        <TabBtn active={tab === 'notifications'} onClick={() => setTab('notifications')} icon={<Bell size={16} />} label={lang === 'ka' ? `შეტყობინებები (${notifs.filter(n => !n.read_at).length})` : `Notifications (${notifs.filter(n => !n.read_at).length})`} />
      </div>

      {tab === 'bookings' && (
        <div className="flex flex-col gap-8">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin inline text-coral" /></div>
          ) : bookings.length === 0 ? (
            <EmptyState lang={lang} />
          ) : (
            <>
              {upcoming.length > 0 && (
                <section className="flex flex-col gap-4">
                  <h2 className="font-display text-2xl text-ink flex items-center gap-2">
                    <span className="w-1 h-7 bg-coral rounded-full" />
                    {lang === 'ka' ? 'მომავალი ჯავშნები' : 'Upcoming'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcoming.map((b) => <BookingCard key={b.id} b={b} lang={lang} />)}
                  </div>
                </section>
              )}
              {past.length > 0 && (
                <section className="flex flex-col gap-4">
                  <h2 className="font-display text-2xl text-ink/60 flex items-center gap-2">
                    <span className="w-1 h-7 bg-ink/20 rounded-full" />
                    {lang === 'ka' ? 'გასული' : 'Past'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-80">
                    {past.map((b) => <BookingCard key={b.id} b={b} lang={lang} />)}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="flex flex-col gap-3">
          {notifs.length === 0 && <p className="py-20 text-center text-muted-foreground italic">{lang === 'ka' ? 'შეტყობინება ჯერ არ მიგიღია' : 'No notifications yet'}</p>}
          {notifs.map((n) => (
            <div key={n.id} className={`bg-white border-[3px] border-ink rounded-2xl p-5 shadow-sticker flex items-start gap-4 ${!n.read_at ? '' : 'opacity-70'}`}>
              <div className={`w-11 h-11 rounded-2xl border-[3px] border-ink shadow-sticker -rotate-3 flex items-center justify-center flex-shrink-0 ${n.type === 'booking_confirmed' ? 'bg-grass text-white' : 'bg-sun text-ink'}`}>
                {n.type === 'booking_confirmed' ? <CheckCircle2 size={20} /> : <Bell size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg text-ink leading-tight">{n.title}</p>
                {n.body && <p className="text-sm text-ink/70 font-medium mt-1">{n.body}</p>}
                <p className="text-[10px] font-black uppercase tracking-wider text-ink/40 mt-2">{new Date(n.created_at).toLocaleString('ka-GE')}</p>
              </div>
              {!n.read_at && <span className="w-3 h-3 rounded-full bg-coral mt-2 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-[3px] border-ink font-black text-sm shadow-sticker press ${active ? 'bg-coral text-white' : 'bg-white text-ink hover:bg-cream'}`}
    >
      {icon} {label}
    </button>
  );
}

function statusInfo(status: string, lang: string) {
  if (status === 'confirmed') return { label: lang === 'ka' ? 'დადასტურებული' : 'Confirmed', cls: 'bg-grass text-white', icon: <CheckCircle2 size={12} /> };
  if (status === 'cancelled') return { label: lang === 'ka' ? 'გაუქმებული' : 'Cancelled', cls: 'bg-coral text-white', icon: <XCircle size={12} /> };
  return { label: lang === 'ka' ? 'მოლოდინში' : 'Pending', cls: 'bg-sun text-ink', icon: <Hourglass size={12} /> };
}

function BookingCard({ b, lang }: { b: Booking; lang: string }) {
  const s = statusInfo(b.status, lang);
  const t = b.time_slot;
  return (
    <div className="bg-white border-[3px] border-ink rounded-[1.75rem] p-5 shadow-sticker-md flex flex-col gap-3 relative overflow-hidden">
      <div className="washi washi-sun -top-2 right-8 -rotate-2 rounded-sm" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-coral">#{b.id.slice(0, 6)}</span>
          <p className="font-display text-2xl text-ink leading-tight mt-0.5">{new Date(b.booking_date).toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border-[2px] border-ink shadow-sticker text-[10px] font-black uppercase ${s.cls}`}>
          {s.icon} {s.label}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-ink/80 font-medium">
        {t && <div className="flex items-center gap-2"><Clock size={14} className="text-ink/50" /> {t.time} · {t.label}</div>}
        <div className="flex items-start gap-2"><MapPin size={14} className="text-ink/50 mt-0.5" /> <span>{[b.city, b.address].filter(Boolean).join(', ')}</span></div>
        {b.program && <div className="text-xs text-ink/60">🎈 {b.program.name}</div>}
      </div>
      {(b.animators?.length > 0 || b.services?.length > 0) && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t-[2px] border-dashed border-ink/15">
          {b.animators?.map((a, i) => <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-coral/10 text-coral rounded-full">{a.name} ×{a.quantity}</span>)}
          {b.services?.map((s, i) => <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-sky/10 text-sky rounded-full">{s.name}</span>)}
        </div>
      )}
      <div className="flex justify-between items-end pt-2 border-t-[2px] border-dashed border-ink/15">
        <span className="text-[10px] font-black uppercase tracking-widest text-ink/50">{lang === 'ka' ? 'ჯამი' : 'Total'}</span>
        <span className="font-display text-3xl text-coral">{b.total_price}₾</span>
      </div>
    </div>
  );
}

function EmptyState({ lang }: { lang: string }) {
  return (
    <div className="py-16 text-center bg-white border-[3px] border-dashed border-ink/30 rounded-[2rem]">
      <div className="text-6xl mb-3">🎈</div>
      <p className="font-display text-2xl text-ink mb-2">{lang === 'ka' ? 'ჯერ ჯავშანი არ გაქვთ' : 'No bookings yet'}</p>
      <p className="text-sm text-ink/60 mb-5">{lang === 'ka' ? 'დაიწყეთ ახალი თავგადასავალი!' : 'Start a new adventure!'}</p>
      <Link to="/booking" className="inline-flex items-center gap-2 bg-coral text-white border-[3px] border-ink rounded-xl px-6 py-3 font-black text-sm shadow-sticker press">
        {lang === 'ka' ? 'დაჯავშნე ახლა' : 'Book now'}
      </Link>
    </div>
  );
}
