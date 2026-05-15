import { Link, useLocation } from '@tanstack/react-router';
import { useLangStore } from '@/store/langStore';
import { useContentStore } from '@/store/contentStore';
import { useCartStore } from '@/store/cartStore';
import { Menu, X, ShoppingBag, Instagram, Facebook, Phone, Mail, User, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NotificationBell } from './Notifications';
import { Logo } from './Logo';
export { Logo };

function LangSwitch() {
  const { lang, setLang } = useLangStore();
  return (
    <div className="flex border-[3px] border-ink rounded-xl overflow-hidden bg-white">
      {(['ka', 'en'] as const).map((c) => (
        <button
          key={c}
          onClick={() => setLang(c)}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
            lang === c ? 'bg-ink text-cream' : 'text-ink hover:bg-cream'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function Nav() {
  const { lang } = useLangStore();
  const { translations, user, isAdmin } = useContentStore();
  const cart = useCartStore();
  const location = useLocation();
  const cartCount =
    Object.keys(cart.animators).length +
    Object.keys(cart.services).length +
    (cart.timeSlotTime ? 1 : 0);
  const t = translations[lang];
  const [open, setOpen] = useState(false);

  const navLinks = (t.nav || []).filter((l: any) => l.href !== '/menu');

  // Close mobile menu on route change (overlay otherwise blocks page interaction)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-6xl z-50">
        <div className="bg-white border-[3px] border-ink rounded-2xl shadow-sticker-md px-3 md:px-5 py-2.5 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <Logo className="w-12 h-12 md:w-14 md:h-14 group-hover:rotate-0 transition-transform" />
            <span className="hidden sm:inline font-display text-2xl text-ink">Dubuni</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link: any) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative px-3 py-2 rounded-lg text-sm font-bold text-ink hover:bg-cream transition-colors"
                activeProps={{ className: 'bg-sun border-[2px] border-ink shadow-sticker' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <LangSwitch />
            <NotificationBell />
            {user ? (
              <Link to={isAdmin ? '/admin' : '/account'} className="inline-flex items-center justify-center w-10 h-10 bg-white border-[3px] border-ink rounded-xl shadow-sticker text-ink hover:bg-cream" aria-label="Account">
                <User size={18} />
              </Link>
            ) : (
              <Link to="/auth" className="hidden sm:inline-flex items-center justify-center w-10 h-10 bg-white border-[3px] border-ink rounded-xl shadow-sticker text-ink hover:bg-cream" aria-label="Sign in">
                <LogIn size={18} />
              </Link>
            )}
            <div className="relative">
              <Link
                to="/booking"
                className="inline-flex items-center gap-1.5 md:gap-2 bg-coral text-white border-[3px] border-ink rounded-xl px-3 md:px-4 py-2 font-black text-sm shadow-sticker press"
              >
                <ShoppingBag size={16} />
                <span className="hidden sm:inline">{t.ui.book}</span>
              </Link>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-sun text-ink text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-[2px] border-ink">
                  {cartCount}
                </span>
              )}
            </div>
            <button
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 bg-white border-[3px] border-ink rounded-xl shadow-sticker text-ink"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 pt-24 px-4 bg-cream/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="bg-white border-[3px] border-ink rounded-2xl shadow-sticker-md p-4 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map((link: any) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-bold text-ink hover:bg-cream transition-colors"
                activeProps={{ className: 'bg-sun border-[2px] border-ink' }}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-bold text-ink hover:bg-cream transition-colors flex items-center gap-2"
              >
                <LogIn size={18} />
                {lang === 'ka' ? 'შესვლა / რეგისტრაცია' : 'Sign in / Register'}
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  const { lang } = useLangStore();
  const { translations } = useContentStore();
  const t = translations[lang];

  return (
    <footer className="w-full mt-20 md:mt-28 px-4 md:px-8 pb-8">
      <div className="max-w-6xl mx-auto bg-ink text-cream border-[3px] border-ink rounded-3xl shadow-sticker-lg overflow-hidden relative">
        {/* Marquee strip */}
        <div className="bg-sun text-ink border-b-[3px] border-ink py-3 overflow-hidden">
          <div className="marquee whitespace-nowrap font-black uppercase tracking-wider text-sm">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-10 pr-10">
                <span>{lang === 'ka' ? '🎉 დაბადების დღეები' : '🎉 Birthdays'}</span>
                <span>★</span>
                <span>{lang === 'ka' ? 'ანიმატორები' : 'Animators'}</span>
                <span>★</span>
                <span>{lang === 'ka' ? 'შოუ პროგრამები' : 'Show programs'}</span>
                <span>★</span>
                <span>{lang === 'ka' ? 'სახალისო თამაშები' : 'Fun games'}</span>
                <span>★</span>
                <span>{lang === 'ka' ? 'სრული სერვისი' : 'Full service'}</span>
                <span>★</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 w-fit">
              <div className="w-14 h-14 bg-coral border-[3px] border-cream rounded-2xl flex items-center justify-center -rotate-3 shadow-[4px_4px_0_0_var(--sun)]">
                <span className="text-white font-display text-2xl">O</span>
              </div>
              <span className="font-display text-3xl">Dubuni</span>
            </Link>
            <p className="text-cream/80 leading-relaxed max-w-sm">
              {t.ui.footerDesc ||
                (lang === 'ka'
                  ? 'ვქმნით ჯადოსნურ მომენტებს თქვენი პატარებისთვის — დაუვიწყარი დღესასწაულები ერთ ადგილას.'
                  : 'Crafting magical moments for your little ones — unforgettable celebrations in one place.')}
            </p>
            <div className="flex gap-3 mt-2">
              <SocialButton icon={<Instagram size={18} />} href="https://www.instagram.com/dubuni/" />
              <SocialButton icon={<Facebook size={18} />} href="https://www.facebook.com/dubuni" />
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="font-display text-sun text-lg">{lang === 'ka' ? 'სერვისები' : 'Services'}</h4>
            <FootLink to="/animators">{t.ui.animatorsTitle}</FootLink>
            <FootLink to="/hosts">{lang === 'ka' ? 'გმირები' : 'Hosts'}</FootLink>
            <FootLink to="/programs">{lang === 'ka' ? 'პროგრამები' : 'Programs'}</FootLink>
            <FootLink to="/services">{t.ui.services}</FootLink>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3">
            <h4 className="font-display text-sun text-lg">{lang === 'ka' ? 'დაგვიკავშირდი' : 'Get in touch'}</h4>
            <a href="tel:+995555535754" className="inline-flex items-center gap-2 text-cream/90 hover:text-sun transition-colors">
              <Phone size={16} /> +995 555 53 57 54
            </a>
            <a href="mailto:info@dubuni.ge" className="inline-flex items-center gap-2 text-cream/90 hover:text-sun transition-colors">
              <Mail size={16} /> info@dubuni.ge
            </a>
            <Link
              to="/booking"
              className="self-start mt-2 inline-flex items-center gap-2 bg-sun text-ink border-[3px] border-cream rounded-xl px-5 py-2.5 font-black shadow-[4px_4px_0_0_var(--coral)] press"
            >
              <ShoppingBag size={16} /> {t.ui.book}
            </Link>
          </div>
        </div>

        <div className="px-8 md:px-12 py-5 border-t-[3px] border-cream/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p className="text-cream/70 font-semibold">
            © {new Date().getFullYear()} Dubuni. {lang === 'ka' ? 'ყველა უფლება დაცულია.' : 'All rights reserved.'}
          </p>
          <a
            href="https://codezero.ge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/70 hover:text-sun transition-colors"
          >
            Made by CodeZero Academy
          </a>
        </div>
      </div>
    </footer>
  );
}

function FootLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-cream/85 font-semibold hover:text-sun hover:translate-x-1 inline-flex items-center gap-2 transition-all"
    >
      <span className="w-2 h-2 bg-sun rounded-full" /> {children}
    </Link>
  );
}

function SocialButton({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-11 h-11 rounded-xl bg-cream text-ink border-[3px] border-cream flex items-center justify-center shadow-[4px_4px_0_0_var(--sun)] press"
    >
      {icon}
    </a>
  );
}

export function Blobs() {
  // Subtle paper-style decorative confetti, fixed to background
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none paper">
      <div className="absolute top-24 -left-10 w-40 h-40 bg-sun/40 rounded-full border-[3px] border-ink/10 -rotate-12" />
      <div className="absolute top-1/3 right-10 w-24 h-24 bg-grass/40 rounded-2xl border-[3px] border-ink/10 rotate-12" />
      <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-sky/30 rounded-3xl border-[3px] border-ink/10 -rotate-6" />
      <div className="absolute bottom-10 right-1/4 w-20 h-20 bg-coral/30 rounded-full border-[3px] border-ink/10 rotate-6" />
      {/* Dotted pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--ink) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
}
