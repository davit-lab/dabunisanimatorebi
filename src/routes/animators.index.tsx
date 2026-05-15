import { createFileRoute, Link } from '@tanstack/react-router';
import { useLangStore } from '@/store/langStore';
import { useContentStore } from '@/store/contentStore';
import { ArrowRight, Star } from 'lucide-react';

export const Route = createFileRoute('/animators/')({ component: AnimatorsPage });

function AnimatorsPage() {
  const { lang } = useLangStore();
  const { translations } = useContentStore();
  const t = translations[lang];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          {t.ui.animatorsSubtitle || (lang === 'ka' ? 'გაიცანით ჩვენი' : 'Meet Our')}
        </span>
        
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-primary leading-tight">
          {t.ui.animatorsTitle || (lang === 'ka' ? 'ანიმატორები' : 'Animators')}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
          {t.ui.animatorsDesc || (lang === 'ka' 
            ? 'პროფესიონალი პერსონაჟები, რომლებიც გახდიან თქვენი ბავშვის საუკეთესო მეგობრები და დღესასწაულის გმირები'
            : 'Professional characters who will become your child\'s best friends and the heroes of the celebration')}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {(t.animators || []).map((a: any) => (
          <div 
            key={a.id} 
            className="group relative overflow-hidden rounded-[2rem] bg-white border border-border/50 shadow-card hover:shadow-float transition-all duration-500"
          >
            <Link to="/animators/$animatorId" params={{ animatorId: a.id }} className="block">
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={a.image} 
                  alt={a.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-primary">
                    {a.category}
                  </span>
                </div>
                
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-heading font-bold mb-2 group-hover:text-primary-light transition-colors">
                    {a.name}
                  </h3>
                  <p className="text-sm opacity-80 line-clamp-2 mb-4 font-medium leading-relaxed">
                    {a.description}
                  </p>
                  <div className="flex justify-end">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-primary transition-colors">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(t.animators || []).length === 0 && (
        <div className="text-center py-20">
          <h3 className="font-heading text-xl font-bold text-muted-foreground mb-2">
            {lang === 'ka' ? 'ანიმატორები მალე დაემატება' : 'Animators coming soon'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {lang === 'ka' ? 'გთხოვთ, მოგვიანებით ეწვიოთ' : 'Please visit us later'}
          </p>
        </div>
      )}
    </div>
  );
}
