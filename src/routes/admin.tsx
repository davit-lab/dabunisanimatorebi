import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useContentStore } from '@/store/contentStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, RotateCcw, Image as ImageIcon, Type, Users, MessageSquare, ShoppingBag, ChevronDown, Plus, Trash2, Save, Upload, Loader2, Lock, Palette, Phone, Download, Star, PartyPopper, CalendarDays, Ban, CheckCircle2, MapPin, ExternalLink } from 'lucide-react';
import type { Language } from '@/types';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export const Route = createFileRoute('/admin')({ component: AdminGate });

function AdminGate() {
  const { user, isAdmin, isLoaded } = useContentStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setChecking(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (!user && checking) return <Splash text="Checking session..." />;
  if (!user) return <NotAuthed />;
  if (!isAdmin && checking) return <Splash text="Checking permissions..." />;
  if (!isAdmin) return <NotAdmin />;
  if (!isLoaded) return <Splash text="Loading content..." />;
  return <AdminPanel />;
}

function Splash({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero">
      <div className="bg-card rounded-3xl p-8 shadow-glow flex items-center gap-3">
        <Loader2 className="animate-spin text-primary" />
        <span className="font-bold">{text}</span>
      </div>
    </div>
  );
}

function NotAuthed() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="bg-card rounded-[40px] p-10 shadow-glow w-full max-w-md border border-border text-center">
        <Lock className="mx-auto text-primary mb-4" size={40} />
        <h1 className="font-display text-3xl gradient-text mb-2">Sign In Required</h1>
        <p className="text-muted-foreground mb-6 text-sm font-medium">Please sign in to access the admin panel.</p>
        <Link to="/auth" className="inline-block px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-glow">
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}

function NotAdmin() {
  const { signOut, setAuth, user } = useContentStore();
  const [claiming, setClaiming] = useState(false);

  const claim = async () => {
    setClaiming(true);
    const { data, error } = await (supabase.rpc as any)('claim_admin_if_first');
    setClaiming(false);
    if (error) return toast.error(error.message);
    if (data === true) {
      toast.success('You are now an admin!');
      setAuth(user, true);
    } else {
      toast.error('An admin already exists. Ask them to grant you access.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <Toaster richColors position="top-right" />
      <div className="bg-card rounded-[40px] p-10 shadow-glow w-full max-w-md border border-border text-center">
        <Lock className="mx-auto text-destructive mb-4" size={40} />
        <h1 className="font-display text-3xl mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 text-sm font-medium">
          Your account is not an admin yet.
        </p>
        <button onClick={claim} disabled={claiming} className="w-full mb-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-glow disabled:opacity-60 flex items-center justify-center gap-2">
          {claiming && <Loader2 size={16} className="animate-spin" />}
          Claim admin (first user only)
        </button>
        <button onClick={() => { signOut(); window.location.href = '/'; }} className="w-full px-8 py-4 rounded-2xl bg-muted font-bold uppercase tracking-widest hover:bg-card transition-all">
          Sign Out
        </button>
      </div>
    </div>
  );
}

type Tab = 'bookings' | 'schedule' | 'reviews' | 'media' | 'theme' | 'contact' | 'animators' | 'hosts' | 'programs' | 'services' | 'timeslots' | 'ui' | 'faq';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'bookings', label: 'Bookings', icon: <ShoppingBag size={16} /> },
  { id: 'schedule', label: 'Schedule', icon: <CalendarDays size={16} /> },
  { id: 'reviews', label: 'Reviews', icon: <Star size={16} /> },
  { id: 'media', label: 'Media & Logo', icon: <ImageIcon size={16} /> },
  { id: 'theme', label: 'Theme Colors', icon: <Palette size={16} /> },
  { id: 'contact', label: 'Contact Info', icon: <Phone size={16} /> },
  { id: 'animators', label: 'Heroes', icon: <Star size={16} /> },
  { id: 'hosts', label: 'Animators', icon: <Users size={16} /> },
  { id: 'programs', label: 'Programs', icon: <PartyPopper size={16} /> },
  { id: 'services', label: 'Services', icon: <MessageSquare size={16} /> },
  { id: 'timeslots', label: 'Time Slots', icon: <Type size={16} /> },
  { id: 'ui', label: 'UI Texts', icon: <Type size={16} /> },
  { id: 'faq', label: 'FAQ', icon: <MessageSquare size={16} /> },
];

function AdminPanel() {
  const { assets, translations, updateAssets, updateTranslation, signOut, resetToDefault } = useContentStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('bookings');
  const [lang, setLang] = useState<Language>('ka');
  const [saved, setSaved] = useState(false);
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1200); };

  return (
    <div className="min-h-screen flex bg-background">
      <Toaster richColors position="top-right" />
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <img src={assets.logo} alt="" className="w-10 h-10 rounded-xl object-contain" />
          <span className="font-display text-lg gradient-text">DUBUNI Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {TABS.map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === tb.id ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-muted'}`}>
              {tb.icon}<span className="truncate">{tb.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-border flex flex-col gap-1">
          <button onClick={() => { if (confirm('Reset all content to defaults?')) { resetToDefault(); flash(); } }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10"><RotateCcw size={14} /> Reset</button>
          <a href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted">← Back to site</a>
          <button onClick={async () => { await signOut(); navigate({ to: '/auth' }); }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"><LogOut size={14} /> Sign out</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-14 border-b border-border bg-card/70 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between px-6">
          <span className="font-bold text-sm">{TABS.find(t => t.id === tab)?.label}</span>
          <div className="flex items-center gap-3">
            {tab !== 'bookings' && tab !== 'media' && tab !== 'theme' && tab !== 'contact' && (
              <div className="flex bg-muted rounded-full p-1">
                {(['ka', 'en'] as Language[]).map((l) => (
                  <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
            {saved && <span className="text-xs font-bold text-primary flex items-center gap-1"><Save size={12} /> Saved</span>}
          </div>
        </header>
        <div className="p-6 md:p-10 max-w-5xl">
          {tab === 'bookings' && <BookingsList />}
          {tab === 'schedule' && <ScheduleManager translations={translations} assets={assets} updateAssets={(a) => { updateAssets(a); flash(); }} />}
          {tab === 'reviews' && <ReviewsModeration />}
          {tab === 'media' && <MediaTab assets={assets} update={(a) => { updateAssets(a); flash(); }} />}
          {tab === 'theme' && <ThemeTab assets={assets} update={(a) => { updateAssets(a); flash(); }} />}
          {tab === 'contact' && <ContactTab assets={assets} update={(a) => { updateAssets(a); flash(); }} />}
          {tab === 'animators' && <ListEditor lang={lang} field="animators" priceKey="pricePerHour" updateTranslation={updateTranslation} translations={translations} flash={flash} />}
          {tab === 'hosts' && <ListEditor lang={lang} field="hosts" priceKey="pricePerHour" updateTranslation={updateTranslation} translations={translations} flash={flash} />}
          {tab === 'programs' && <ListEditor lang={lang} field="programs" priceKey="pricePerHour" updateTranslation={updateTranslation} translations={translations} flash={flash} />}
          {tab === 'services' && <ListEditor lang={lang} field="services" priceKey="price" updateTranslation={updateTranslation} translations={translations} flash={flash} />}
          {tab === 'timeslots' && <TimeSlotsEditor lang={lang} updateTranslation={updateTranslation} translations={translations} flash={flash} />}
          {tab === 'ui' && <UITextsEditor lang={lang} updateTranslation={updateTranslation} translations={translations} flash={flash} />}
          
          {tab === 'faq' && <FAQEditor lang={lang} updateTranslation={updateTranslation} translations={translations} flash={flash} />}
        </div>
      </main>
    </div>
  );
}

function ListEditor({ lang, field, priceKey, translations, updateTranslation, flash }: any) {
  const items = translations[lang][field] || [];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-display capitalize">{field}</h2>
        <span className="text-xs text-muted-foreground">{items.length} items</span>
      </div>
      {items.map((item: any, i: number) => (
        <details key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
          <summary className="p-4 font-bold cursor-pointer flex justify-between items-center hover:bg-muted">
            <div className="flex items-center gap-3">
              {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
              <span>{item.name} · {item[priceKey]}₾</span>
            </div>
            <ChevronDown size={16} />
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="ID (slug, no spaces)" value={item.id} onChange={(v) => { updateTranslation(lang, `${field}.${i}.id`, v); flash(); }} />
            <Field label="Name" value={item.name} onChange={(v) => { updateTranslation(lang, `${field}.${i}.name`, v); flash(); }} />
            <Field label="Category" value={item.category} onChange={(v) => { updateTranslation(lang, `${field}.${i}.category`, v); flash(); }} />
            <Field label={priceKey} value={String(item[priceKey])} onChange={(v) => { updateTranslation(lang, `${field}.${i}.${priceKey}`, Number(v) || 0); flash(); }} />
            {(field === 'animators' || field === 'hosts') && <Field label="Role (e.g. გმირი / წამყვანი)" value={item.role || ''} onChange={(v) => { updateTranslation(lang, `${field}.${i}.role`, v); flash(); }} />}
            {(field === 'animators' || field === 'hosts') && <Field label="Age Group" value={item.ageGroup || ''} onChange={(v) => { updateTranslation(lang, `${field}.${i}.ageGroup`, v); flash(); }} />}
            {(field === 'animators' || field === 'hosts') && <Field label="Max Hours (e.g. 4)" value={String(item.maxHours ?? 4)} onChange={(v) => { updateTranslation(lang, `${field}.${i}.maxHours`, parseInt(v) || 1); flash(); }} />}
            {field === 'programs' && <Field label="Age Range (e.g. 3-9)" value={item.ageRange || ''} onChange={(v) => { updateTranslation(lang, `${field}.${i}.ageRange`, v); flash(); }} />}
            {field === 'programs' && <Field label="Max Hours" value={String(item.maxHours ?? 3)} onChange={(v) => { updateTranslation(lang, `${field}.${i}.maxHours`, parseInt(v) || 1); flash(); }} />}
            {field === 'programs' && <Field label="Max Heroes (0 = hide)" value={String(item.maxAnimators ?? 0)} onChange={(v) => { updateTranslation(lang, `${field}.${i}.maxAnimators`, parseInt(v) || 0); flash(); }} />}
            {field === 'programs' && <Field label="Max Animators (0 = hide)" value={String(item.maxHosts ?? 0)} onChange={(v) => { updateTranslation(lang, `${field}.${i}.maxHosts`, parseInt(v) || 0); flash(); }} />}
            {field === 'services' && <Field label="Max Quantity (1 = single toggle)" value={String(item.maxQuantity ?? 1)} onChange={(v) => { updateTranslation(lang, `${field}.${i}.maxQuantity`, parseInt(v) || 1); flash(); }} />}
            {field === 'services' && <Field label="Max Hours (1 = no hours selector)" value={String(item.maxHours ?? 1)} onChange={(v) => { updateTranslation(lang, `${field}.${i}.maxHours`, parseInt(v) || 1); flash(); }} />}
            <div className="md:col-span-2"><MediaPicker label="Main Image" accept="image/*" value={item.image} onChange={(v) => { updateTranslation(lang, `${field}.${i}.image`, v); flash(); }} /></div>
            <Field label="Short description" value={item.description} onChange={(v) => { updateTranslation(lang, `${field}.${i}.description`, v); flash(); }} className="md:col-span-2" multiline />
            <Field label="Long description (product page)" value={item.longDescription || ''} onChange={(v) => { updateTranslation(lang, `${field}.${i}.longDescription`, v); flash(); }} className="md:col-span-2" multiline />
            <div className="md:col-span-2"><MediaPicker label="Promo Video URL (optional)" accept="video/*" value={item.video || ''} onChange={(v) => { updateTranslation(lang, `${field}.${i}.video`, v); flash(); }} /></div>

            <div className="md:col-span-2 border-t border-border pt-3">
              <SubLabel>Gallery images</SubLabel>
              <div className="flex flex-col gap-2 mt-2">
                {(item.gallery || []).map((g: string, gi: number) => (
                  <div key={gi} className="flex items-center gap-2">
                    {g && <img src={g} className="w-10 h-10 rounded-lg object-cover" />}
                    <input value={g} onChange={(e) => { const next = [...(item.gallery || [])]; next[gi] = e.target.value; updateTranslation(lang, `${field}.${i}.gallery`, next); flash(); }} className="flex-1 p-2 rounded-lg bg-input border border-border text-xs" />
                    <button onClick={() => { const next = [...(item.gallery || [])]; next.splice(gi, 1); updateTranslation(lang, `${field}.${i}.gallery`, next); flash(); }} className="text-destructive"><Trash2 size={14} /></button>
                  </div>
                ))}
                <MediaPicker label="Add gallery image" accept="image/*" value="" onChange={(v) => { const next = [...(item.gallery || []), v]; updateTranslation(lang, `${field}.${i}.gallery`, next); flash(); }} multiple onChangeMany={(urls) => { const next = [...(item.gallery || []), ...urls]; updateTranslation(lang, `${field}.${i}.gallery`, next); flash(); }} />
              </div>
            </div>

            <div className="md:col-span-2 border-t border-border pt-3">
              <SubLabel>Features (bullet points)</SubLabel>
              {(item.features || []).map((f: string, fi: number) => (
                <div key={fi} className="flex items-center gap-2 mt-2">
                  <input value={f} onChange={(e) => { const next = [...(item.features || [])]; next[fi] = e.target.value; updateTranslation(lang, `${field}.${i}.features`, next); flash(); }} className="flex-1 p-2 rounded-lg bg-input border border-border text-xs" />
                  <button onClick={() => { const next = [...(item.features || [])]; next.splice(fi, 1); updateTranslation(lang, `${field}.${i}.features`, next); flash(); }} className="text-destructive"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => { updateTranslation(lang, `${field}.${i}.features`, [...(item.features || []), 'New feature']); flash(); }} className="mt-2 text-primary text-xs font-bold flex items-center gap-1"><Plus size={12} /> Add feature</button>
            </div>

            <div className="md:col-span-2 border-t border-border pt-3">
              <SubLabel>Reviews</SubLabel>
              {(item.reviews || []).map((r: any, ri: number) => (
                <div key={ri} className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 p-2 rounded-lg bg-muted/40">
                  <input placeholder="Author" value={r.author || ''} onChange={(e) => { const next = [...(item.reviews || [])]; next[ri] = { ...r, author: e.target.value }; updateTranslation(lang, `${field}.${i}.reviews`, next); flash(); }} className="p-2 rounded-lg bg-input border border-border text-xs" />
                  <input placeholder="Rating 1-5" type="number" min={1} max={5} value={r.rating || 5} onChange={(e) => { const next = [...(item.reviews || [])]; next[ri] = { ...r, rating: Number(e.target.value) }; updateTranslation(lang, `${field}.${i}.reviews`, next); flash(); }} className="p-2 rounded-lg bg-input border border-border text-xs" />
                  <button onClick={() => { const next = [...(item.reviews || [])]; next.splice(ri, 1); updateTranslation(lang, `${field}.${i}.reviews`, next); flash(); }} className="text-destructive text-xs"><Trash2 size={14} /></button>
                  <textarea placeholder="Review text" value={r.text || ''} onChange={(e) => { const next = [...(item.reviews || [])]; next[ri] = { ...r, text: e.target.value }; updateTranslation(lang, `${field}.${i}.reviews`, next); flash(); }} className="md:col-span-3 p-2 rounded-lg bg-input border border-border text-xs min-h-[60px]" />
                </div>
              ))}
              <button onClick={() => { updateTranslation(lang, `${field}.${i}.reviews`, [...(item.reviews || []), { author: 'Anonymous', rating: 5, text: '' }]); flash(); }} className="mt-2 text-primary text-xs font-bold flex items-center gap-1"><Plus size={12} /> Add review</button>
            </div>

            <div className="md:col-span-2 border-t border-border pt-3">
              <SubLabel>FAQ for this item</SubLabel>
              {(item.faq || []).map((q: any, qi: number) => (
                <div key={qi} className="grid grid-cols-1 gap-2 mt-2 p-2 rounded-lg bg-muted/40">
                  <input placeholder="Question" value={q.question || ''} onChange={(e) => { const next = [...(item.faq || [])]; next[qi] = { ...q, question: e.target.value }; updateTranslation(lang, `${field}.${i}.faq`, next); flash(); }} className="p-2 rounded-lg bg-input border border-border text-xs font-bold" />
                  <textarea placeholder="Answer" value={q.answer || ''} onChange={(e) => { const next = [...(item.faq || [])]; next[qi] = { ...q, answer: e.target.value }; updateTranslation(lang, `${field}.${i}.faq`, next); flash(); }} className="p-2 rounded-lg bg-input border border-border text-xs min-h-[60px]" />
                  <button onClick={() => { const next = [...(item.faq || [])]; next.splice(qi, 1); updateTranslation(lang, `${field}.${i}.faq`, next); flash(); }} className="text-destructive text-xs self-end"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => { updateTranslation(lang, `${field}.${i}.faq`, [...(item.faq || []), { question: 'New question?', answer: '' }]); flash(); }} className="mt-2 text-primary text-xs font-bold flex items-center gap-1"><Plus size={12} /> Add Q&A</button>
            </div>

            <button onClick={() => { const next = [...items]; next.splice(i, 1); updateTranslation(lang, field, next); flash(); }} className="md:col-span-2 self-end text-destructive text-xs font-bold flex items-center gap-1 mt-3"><Trash2 size={12} /> Remove item</button>
          </div>
        </details>
      ))}
      <button onClick={() => {
        const newItem = field === 'hosts'
          ? { id: `h_${Date.now()}`, name: 'New', category: '-', image: '', description: '', pricePerHour: 60, ageGroup: 'ყველა', maxHours: 6, role: 'ანიმATORი' }
          : field === 'animators'
          ? { id: `a_${Date.now()}`, name: 'New', category: '-', image: '', description: '', pricePerHour: 50, ageGroup: '6-12', maxHours: 4, role: 'გმირი' }
          : field === 'programs'
          ? { id: `p_${Date.now()}`, name: 'New', category: '-', image: '', description: '', pricePerHour: 60, ageRange: '3-12', maxAnimators: 1 }
          : { id: `s_${Date.now()}`, name: 'New', category: '-', image: '', description: '', price: 50 };
        updateTranslation(lang, field, [...items, newItem]); flash();
      }} className="self-start flex items-center gap-2 text-primary font-bold text-sm"><Plus size={14} /> Add</button>
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-black uppercase tracking-widest text-primary">{children}</span>;
}

function ThemeTab({ assets, update }: { assets: any; update: (a: any) => void }) {
  const colors = assets.colors || {};
  const set = (key: string, value: string) => update({ colors: { ...colors, [key]: value } });
  const presets = [
    { name: 'Sky Blue', primary: 'oklch(0.72 0.16 230)', accent: 'oklch(0.72 0.22 350)', secondary: 'oklch(0.86 0.16 90)' },
    { name: 'Sunset', primary: 'oklch(0.7 0.18 35)', accent: 'oklch(0.75 0.2 320)', secondary: 'oklch(0.85 0.16 75)' },
    { name: 'Forest', primary: 'oklch(0.6 0.16 155)', accent: 'oklch(0.7 0.2 60)', secondary: 'oklch(0.82 0.13 100)' },
    { name: 'Candy', primary: 'oklch(0.72 0.22 350)', accent: 'oklch(0.78 0.18 280)', secondary: 'oklch(0.86 0.16 90)' },
  ];
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h2 className="text-2xl font-display">Theme Colors</h2>
      <p className="text-sm text-muted-foreground">Use OKLCH format. Example: <code className="bg-muted px-2 py-0.5 rounded">oklch(0.72 0.16 230)</code></p>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.name} onClick={() => update({ colors: { ...colors, primary: p.primary, accent: p.accent, secondary: p.secondary } })} className="px-4 py-2 rounded-full bg-card border border-border text-xs font-bold hover:border-primary flex items-center gap-2">
            <span className="flex gap-0.5">
              <span className="w-3 h-3 rounded-full" style={{ background: p.primary }} />
              <span className="w-3 h-3 rounded-full" style={{ background: p.accent }} />
              <span className="w-3 h-3 rounded-full" style={{ background: p.secondary }} />
            </span>
            {p.name}
          </button>
        ))}
      </div>

      {(['primary', 'accent', 'secondary', 'background'] as const).map((k) => (
        <div key={k} className="flex flex-col gap-2 p-4 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold capitalize">{k}</label>
            <span className="w-10 h-10 rounded-xl border-2 border-border" style={{ background: colors[k] || 'transparent' }} />
          </div>
          <input value={colors[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder="oklch(0.72 0.16 230)" className="p-3 rounded-xl bg-input border border-border font-mono text-sm focus:border-primary outline-none" />
        </div>
      ))}
    </div>
  );
}

function ContactTab({ assets, update }: { assets: any; update: (a: any) => void }) {
  const c = assets.contact || {};
  const set = (key: string, value: string) => update({ contact: { ...c, [key]: value } });
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h2 className="text-2xl font-display">Contact Info</h2>
      <Field label="Phone" value={c.phone || ''} onChange={(v) => set('phone', v)} />
      <Field label="Email" value={c.email || ''} onChange={(v) => set('email', v)} />
      <Field label="Address" value={c.address || ''} onChange={(v) => set('address', v)} />
    </div>
  );
}

function TimeSlotsEditor({ lang, translations, updateTranslation, flash }: any) {
  const slots = translations[lang].timeSlots || [];
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-display">Time Slots</h2>
      <p className="text-sm text-muted-foreground">Multiplier modifies animator hourly rates by time-of-day.</p>
      {slots.map((s: any, i: number) => (
        <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-2xl border border-border bg-card">
          <Field label="Time" value={s.time} onChange={(v) => { updateTranslation(lang, `timeSlots.${i}.time`, v); flash(); }} />
          <Field label="Label" value={s.label} onChange={(v) => { updateTranslation(lang, `timeSlots.${i}.label`, v); flash(); }} />
          <Field label="Territory ₾" value={String(s.territoryPrice)} onChange={(v) => { updateTranslation(lang, `timeSlots.${i}.territoryPrice`, Number(v) || 0); flash(); }} />
          <Field label="Multiplier" value={String(s.multiplier)} onChange={(v) => { updateTranslation(lang, `timeSlots.${i}.multiplier`, Number(v) || 1); flash(); }} />
          <button onClick={() => { const n = [...slots]; n.splice(i, 1); updateTranslation(lang, 'timeSlots', n); flash(); }} className="self-end text-destructive text-xs"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={() => { updateTranslation(lang, 'timeSlots', [...slots, { time: '00:00', label: 'New', territoryPrice: 200, multiplier: 1.0 }]); flash(); }} className="self-start flex items-center gap-2 text-primary font-bold text-sm"><Plus size={14} /> Add slot</button>
    </div>
  );
}

function UITextsEditor({ lang, translations, updateTranslation, flash }: any) {
  const ui = translations[lang].ui || {};
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-display">UI Texts</h2>
      {Object.entries(ui).map(([k, v]) => (
        <Field key={k} label={k} value={String(v)} onChange={(val) => { updateTranslation(lang, `ui.${k}`, val); flash(); }} />
      ))}
    </div>
  );
}

function FAQEditor({ lang, translations, updateTranslation, flash }: any) {
  const faq = translations[lang].faq || [];
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-display">FAQ</h2>
      {faq.map((item: any, i: number) => (
        <div key={i} className="p-4 rounded-2xl border border-border bg-card flex flex-col gap-3">
          <Field label="Question" value={item.question} onChange={(v) => { updateTranslation(lang, `faq.${i}.question`, v); flash(); }} />
          <Field label="Answer" value={item.answer} onChange={(v) => { updateTranslation(lang, `faq.${i}.answer`, v); flash(); }} multiline />
          <button onClick={() => { const n = [...faq]; n.splice(i, 1); updateTranslation(lang, 'faq', n); flash(); }} className="self-end text-destructive text-xs"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={() => { updateTranslation(lang, 'faq', [...faq, { question: 'New?', answer: 'Answer.' }]); flash(); }} className="self-start flex items-center gap-2 text-primary font-bold text-sm"><Plus size={14} /> Add</button>
    </div>
  );
}


function MediaTab({ assets, update }: { assets: any; update: (a: any) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-display">Media & Logo</h2>
      <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
        <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Logo</h3>
        {assets.logo && <img src={assets.logo} className="w-24 h-24 object-contain rounded-xl bg-muted p-2" />}
        <MediaPicker label="Logo" accept="image/*" value={assets.logo} onChange={(v) => update({ logo: v })} />
      </div>
      <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
        <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Hero Background Video</h3>
        {assets.heroVideo && <video src={assets.heroVideo} className="w-full max-h-60 rounded-xl bg-black" controls muted />}
        <MediaPicker label="Video" accept="video/*" value={assets.heroVideo} onChange={(v) => update({ heroVideo: v })} />
      </div>
      <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4">
        <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Hero Fallback Image</h3>
        {assets.heroFallback && <img src={assets.heroFallback} className="w-full max-h-60 object-cover rounded-xl" />}
        <MediaPicker label="Image" accept="image/*" value={assets.heroFallback} onChange={(v) => update({ heroFallback: v })} />
      </div>
    </div>
  );
}

function MediaPicker({ label, accept, value, onChange, multiple, onChangeMany }: { label: string; accept: string; value: string; onChange: (url: string) => void; multiple?: boolean; onChangeMany?: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const uploadOne = async (file: File): Promise<string | null> => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error(`${file.name}: too large (max 50MB)`);
      return null;
    }
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error(`${file.name}: ${error.message}`); return null; }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    const arr = Array.from(files);
    if (multiple && onChangeMany) {
      const urls: string[] = [];
      setProgress({ done: 0, total: arr.length });
      for (let i = 0; i < arr.length; i++) {
        const url = await uploadOne(arr[i]);
        if (url) urls.push(url);
        setProgress({ done: i + 1, total: arr.length });
      }
      if (urls.length) { onChangeMany(urls); toast.success(`Uploaded ${urls.length}/${arr.length}`); }
    } else {
      const url = await uploadOne(arr[0]);
      if (url) { onChange(url); toast.success('Uploaded'); }
    }
    setUploading(false);
    setProgress(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label} {multiple ? '(multi)' : 'URL'}</label>
      {!multiple && (
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="p-3 rounded-xl bg-input border border-border font-medium text-sm focus:border-primary outline-none" placeholder="https://... or upload below (YouTube/Vimeo links also supported for video)" />
      )}
      <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all w-fit">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading
          ? (progress ? `Uploading ${progress.done}/${progress.total}...` : 'Uploading...')
          : (multiple ? 'Upload files (multi-select)' : 'Upload file')}
        <input type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => { const f = e.target.files; if (f && f.length) handleFiles(f); e.target.value = ''; }} />
      </label>
    </div>
  );
}

function BookingsList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ status } as any).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this booking?')) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    load();
  };

  const exportCSV = () => {
    const header = ['Created','Status','Date','Time','Name','Phone','Email','Address','Comments','Program','Animators','Services','Total'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [header.join(',')].concat(rows.map((b: any) => [
      new Date(b.created_at).toISOString(), b.status, b.booking_date, b.time_slot?.time || '',
      b.customer_name, b.customer_phone, b.customer_email || '', b.address || '', (b.comments || '').replace(/\n/g, ' '),
      b.program?.name || '',
      (b.animators || []).map((a: any) => `${a.name}x${a.quantity}(${a.hours}h)`).join('; '),
      (b.services || []).map((s: any) => s.name).join('; '),
      b.total_price,
    ].map(esc).join(',')));
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-display">Bookings ({rows.length})</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>Pending: {rows.filter(r => r.status === 'pending').length}</span>
            <span>·</span>
            <span>Confirmed: {rows.filter(r => r.status === 'confirmed').length}</span>
          </div>
          <button onClick={exportCSV} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1"><Download size={12} /> Export CSV</button>
        </div>
      </div>
      {rows.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
      <div className="flex flex-col gap-3">
        {rows.map((b) => (
          <details key={b.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            <summary className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-muted">
              <div className="flex flex-col">
                <span className="font-bold">{b.customer_name} · {b.customer_phone}</span>
                <span className="text-xs text-muted-foreground">{b.booking_date} · {b.time_slot?.time || '-'} · {b.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${b.status === 'confirmed' ? 'bg-primary/15 text-primary' : b.status === 'cancelled' ? 'bg-destructive/15 text-destructive' : 'bg-accent/15 text-accent-foreground'}`}>{b.status}</span>
                <span className="font-display text-xl">{b.total_price}₾</span>
              </div>
            </summary>
            <div className="p-4 border-t border-border text-sm flex flex-col gap-2">
              <div><b>Address:</b> {b.city ? `${b.city}, ` : ''}{b.address || '—'}</div>
              {b.address_lat && b.address_lng && (
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-primary flex-shrink-0" />
                  <a
                    href={`https://www.google.com/maps?q=${b.address_lat},${b.address_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline font-semibold flex items-center gap-1 hover:opacity-80"
                  >
                    {Number(b.address_lat).toFixed(5)}, {Number(b.address_lng).toFixed(5)}
                    <ExternalLink size={11} />
                  </a>
                  <a
                    href={`https://yandex.com/maps/?ll=${b.address_lng},${b.address_lat}&z=16&pt=${b.address_lng},${b.address_lat}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground underline hover:opacity-80"
                  >
                    Yandex
                  </a>
                </div>
              )}
              {b.customer_email && <div><b>Email:</b> {b.customer_email}</div>}
              {b.comments && <div><b>Comments:</b> {b.comments}</div>}
              {b.program?.name && <div><b>Program:</b> {b.program.name}</div>}
              {b.animators?.length > 0 && <div><b>Animators:</b> {b.animators.map((a: any) => `${a.name}×${a.quantity} (${a.hours}h)`).join(', ')}</div>}
              {b.services?.length > 0 && <div><b>Services:</b> {b.services.map((s: any) => s.name).join(', ')}</div>}
              <div className="text-xs text-muted-foreground mt-2">Created: {new Date(b.created_at).toLocaleString()}</div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {b.status !== 'confirmed' && <button onClick={() => setStatus(b.id, 'confirmed')} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Confirm</button>}
                {b.status !== 'pending' && <button onClick={() => setStatus(b.id, 'pending')} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-bold">Mark pending</button>}
                {b.status !== 'cancelled' && <button onClick={() => setStatus(b.id, 'cancelled')} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-bold">Cancel</button>}
                <button onClick={() => remove(b.id)} className="ml-auto px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-bold flex items-center gap-1"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, className = '' }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      {multiline ? (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className="p-3 rounded-xl bg-input border border-border font-medium text-sm focus:border-primary outline-none min-h-[80px]" />
      ) : (
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="p-3 rounded-xl bg-input border border-border font-medium text-sm focus:border-primary outline-none" />
      )}
    </div>
  );
}

function ReviewsModeration() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const load = async () => {
    setLoading(true);
    let q = supabase.from('reviews' as any).select('*').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await (supabase.from('reviews' as any).update({ status }) as any).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const { error } = await supabase.from('reviews' as any).delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Deleted');
    load();
  };

  const counts = { pending: rows.filter(r => r.status === 'pending').length };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-display">Reviews ({rows.length})</h2>
        <div className="flex bg-muted rounded-full p-1 text-xs font-bold">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              {f}{f === 'pending' && counts.pending > 0 ? ` (${counts.pending})` : ''}
            </button>
          ))}
        </div>
      </div>
      {loading && <p className="text-muted-foreground text-sm">Loading...</p>}
      {!loading && rows.length === 0 && <p className="text-muted-foreground text-sm">No reviews.</p>}
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold">{r.customer_name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={12} className={j < r.rating ? 'fill-secondary text-secondary' : 'text-muted'} />
                  ))}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${r.status === 'approved' ? 'bg-primary/15 text-primary' : r.status === 'rejected' ? 'bg-destructive/15 text-destructive' : 'bg-accent/15 text-accent-foreground'}`}>{r.status}</span>
              </div>
              <span className="text-xs text-muted-foreground">{r.target_type}{r.target_id ? `: ${r.target_id}` : ''} · {new Date(r.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm leading-relaxed">"{r.text}"</p>
            <div className="flex gap-2 flex-wrap">
              {r.status !== 'approved' && <button onClick={() => setStatus(r.id, 'approved')} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">Approve</button>}
              {r.status !== 'rejected' && <button onClick={() => setStatus(r.id, 'rejected')} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-bold">Reject</button>}
              <button onClick={() => remove(r.id)} className="ml-auto px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-bold flex items-center gap-1"><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleManager({ translations, assets, updateAssets }: { translations: any; assets: any; updateAssets: (a: any) => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const timeSlots: any[] = translations['ka']?.timeSlots || translations['en']?.timeSlots || [];
  const blockedSlots: Record<string, string[]> = assets?.blockedSlots || {};
  const blockedForDate: string[] = blockedSlots[date] || [];

  const load = async (d: string) => {
    setLoading(true);
    const { data } = await supabase.from('bookings').select('id, customer_name, time_slot').eq('booking_date', d);
    setUserBookings((data || []).filter((row: any) => row.customer_name !== '[BLOCKED]'));
    setLoading(false);
  };

  useEffect(() => { load(date); }, [date]);

  const blockSlot = (slotTime: string) => {
    if (blockedForDate.includes(slotTime)) return;
    const updated = { ...blockedSlots, [date]: [...blockedForDate, slotTime] };
    updateAssets({ blockedSlots: updated });
    toast.success(`${slotTime} blocked`);
  };

  const unblockSlot = (slotTime: string) => {
    const updated = { ...blockedSlots, [date]: blockedForDate.filter(t => t !== slotTime) };
    updateAssets({ blockedSlots: updated });
    toast.success(`${slotTime} unblocked`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-display mb-1">Schedule Manager</h2>
        <p className="text-sm text-muted-foreground">Block time slots for external/offline bookings. Blocked slots cannot be booked online.</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          className="p-3 rounded-xl border border-border bg-input font-bold focus:border-primary outline-none"
        />
        {loading && <Loader2 size={18} className="animate-spin text-muted-foreground" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {timeSlots.map((slot: any) => {
          const booking = userBookings.find((b: any) => b.time_slot?.time === slot.time);
          const isBlocked = blockedForDate.includes(slot.time);
          const isUserBooked = !!booking;

          return (
            <div key={slot.time} className={`p-4 rounded-2xl border-2 transition-all ${
              isBlocked ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20' :
              isUserBooked ? 'border-destructive bg-destructive/5' :
              'border-border bg-card'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-display text-xl">{slot.time}</span>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{slot.label}</p>
                  <p className="text-xs font-bold mt-0.5">{slot.territoryPrice}₾</p>
                </div>
                {isBlocked && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
                    <Ban size={10} /> BLOCKED
                  </span>
                )}
                {isUserBooked && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                    <CheckCircle2 size={10} /> BOOKED
                  </span>
                )}
                {!booking && !isBlocked && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">FREE</span>
                )}
              </div>

              {isUserBooked && (
                <p className="text-xs font-bold text-destructive truncate mb-2">{booking.customer_name}</p>
              )}

              {!isUserBooked && (
                <button
                  onClick={() => isBlocked ? unblockSlot(slot.time) : blockSlot(slot.time)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isBlocked
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-muted hover:bg-destructive/10 hover:text-destructive'
                  }`}
                >
                  {isBlocked ? <><CheckCircle2 size={12} /> Unblock</> : <><Ban size={12} /> Block Slot</>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {timeSlots.length === 0 && (
        <p className="text-sm text-muted-foreground">No time slots configured. Add them in the Time Slots tab first.</p>
      )}
    </div>
  );
}
