"use client";

import { useState, useEffect } from "react";
import { Home, Sparkles, Zap, Heart } from "lucide-react";
import { PropertyForm } from "@/components/PropertyForm";
import { Results } from "@/components/Results";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/language-context";
import { GeneratedOutput } from "@/types";

function PageContent() {
  const { t, language } = useLanguage();
  const [result, setResult] = useState<GeneratedOutput | null>(null);
  const [remaining, setRemaining] = useState(5);
  const [used, setUsed] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedRemaining = localStorage.getItem("descrify_remaining");
    const storedUsed = localStorage.getItem("descrify_used");
    
    if (storedRemaining) setRemaining(parseInt(storedRemaining, 10));
    if (storedUsed) setUsed(parseInt(storedUsed, 10));
  }, []);

  if (!mounted) {
    return null;
  }

  const handleGenerationComplete = (
    data: GeneratedOutput,
    newRemaining: number,
    newUsed: number
  ) => {
    setResult(data);
    setRemaining(newRemaining);
    setUsed(newUsed);
    localStorage.setItem("descrify_remaining", String(newRemaining));
    localStorage.setItem("descrify_used", String(newUsed));
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Descrify</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-slate-400">
                  {used} {t('usedToday')}
                </span>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100 mb-3">
            {language === "hr" ? (
              <>
                {t('titleBefore')}{" "}
                <span className="gradient-text">SEO optimizirane</span>{" "}
                {t('titleAfter')}
              </>
            ) : (
              <>
                {t('titleBefore')}{" "}
                <span className="gradient-text">SEO-optimized</span>{" "}
                {t('titleAfter')}
              </>
            )}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>{t('fillDetails')}</span>
            </div>
            <PropertyForm
              remainingGenerations={remaining}
              usedGenerations={used}
              onGenerationComplete={handleGenerationComplete}
            />
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="glass rounded-3xl p-6 lg:p-8 min-h-[400px]">
              <Results data={result} />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/50 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500">
            © 2026 Created with <Heart className="inline-block h-4 w-4 text-red-400 mx-1" /> by <a href="https://www.brodaric.xyz" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Luka Brodaric</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return <PageContent />;
}
