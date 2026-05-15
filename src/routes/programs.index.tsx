import { createFileRoute, Link } from '@tanstack/react-router';
import { useLangStore } from '@/store/langStore';
import { useContentStore } from '@/store/contentStore';
import { ArrowRight, Star } from 'lucide-react';

export const Route = createFileRoute('/programs/')({ component: ProgramsPage });

function ProgramsPage() {
  const { lang } = useLangStore();
  const { translations } = useContentStore();
  const t = translations[lang];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex flex-col gap-4 mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-secondary">
          {lang === 'ka' ? 'ასაკის მიხედვით' : 'By Age Group'}
        </span>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-secondary leading-tight">
          {t.ui.programsTitle || (lang === 'ka' ? 'პროგრამები' : 'Programs')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
          {t.ui.programsDesc || (lang === 'ka'
            ? 'ასაკის მიხედვით შერჩეული პროგრამები — ყველა ბავშვისთვის სახალისო და დაუვიწყარი დღესასწაული'
            : 'Age-appropriate programs so every child has an unforgettable celebration')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {(t.programs || []).map((p: any) => (
          <div
            key={p.id}
            className="group relative overflow-hidden rounded-[2rem] bg-white border border-border/50 shadow-card hover:shadow-float transition-all duration-500"
          >
            <Link to="/programs/$programId" params={{ programId: p.id }} className="block">
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-secondary">
                    {p.category}
                  </span>
                </div>

                {p.ageRange && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-secondary/90 backdrop-blur-sm text-foreground flex items-center gap-1">
                      <Star size={10} className="fill-foreground" />
                      {p.ageRange}y+
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-heading font-bold mb-2 group-hover:text-secondary-light transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm opacity-80 line-clamp-2 mb-4 font-medium leading-relaxed">
                    {p.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-2xl font-display font-bold">
                        {p.pricePerHour}₾
                      </span>
                      <span className="text-xs opacity-70 font-medium">
                        /{lang === 'ka' ? 'საათი' : 'hour'}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-secondary group-hover:text-foreground transition-colors">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {(t.programs || []).length === 0 && (
        <div className="text-center py-20">
          <h3 className="font-heading text-xl font-bold text-muted-foreground mb-2">
            {lang === 'ka' ? 'პროგრამები მალე დაემატება' : 'Programs coming soon'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {lang === 'ka' ? 'გთხოვთ, მოგვიანებით ეწვიოთ' : 'Please visit us later'}
          </p>
        </div>
      )}
    </div>
  );
}
