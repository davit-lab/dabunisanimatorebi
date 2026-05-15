import { createFileRoute } from '@tanstack/react-router';
import { useLangStore } from '@/store/langStore';
import { useContentStore } from '@/store/contentStore';
import { ChevronDown } from 'lucide-react';

export const Route = createFileRoute('/faq')({ component: FAQPage });

function FAQPage() {
  const { lang } = useLangStore();
  const { translations } = useContentStore();
  const t = translations[lang];
  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-10 py-10 md:py-16 flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-5xl md:text-7xl gradient-text">FAQ</h1>
      </div>
      <div className="flex flex-col gap-4">
        {(t.faq || []).map((item: any, i: number) => (
          <details key={i} className="group rounded-3xl bg-card border border-border overflow-hidden shadow-soft">
            <summary className="p-6 font-display text-lg md:text-xl cursor-pointer list-none flex justify-between items-center">
              {item.question}
              <ChevronDown className="text-primary group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-6 pb-6 text-muted-foreground font-medium leading-relaxed">{item.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
