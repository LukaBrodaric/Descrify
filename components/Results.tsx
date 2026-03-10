"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Check, FileText, Search, Tag, Eye, Sparkles, Globe, ChevronDown, Loader2 } from "lucide-react";
import { GeneratedOutput } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

interface ResultsProps {
  data: GeneratedOutput | null;
}

function ResultCard({
  title,
  content,
  icon: Icon,
  color,
}: {
  title: string;
  content: string;
  icon: React.ElementType;
  color: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-slate-800/40 border-slate-700/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-5 pt-5">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}

function TranslationDropdown({ 
  onTranslate,
  isTranslating 
}: { 
  onTranslate: (lang: string) => void;
  isTranslating: boolean;
}) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: "hr", label: "Croatian" },
    { code: "en", label: "English" },
    { code: "de", label: "German" },
    { code: "it", label: "Italian" },
  ];

  const currentLang = languages.find(l => l.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isTranslating && setIsOpen(!isOpen)}
        disabled={isTranslating}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors text-sm text-slate-300 disabled:opacity-50"
      >
        {isTranslating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        <span>{isTranslating ? t('generating') : `Translate: ${currentLang?.label}`}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-40 rounded-xl bg-slate-800 border border-slate-700 shadow-lg overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onTranslate(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                language === lang.code
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Results({ data }: ResultsProps) {
  const { t, language } = useLanguage();
  const [currentData, setCurrentData] = useState<GeneratedOutput | null>(data);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  const handleTranslate = async (targetLanguage: string) => {
    if (!currentData) return;

    setIsTranslating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: currentData,
          targetLanguage,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setCurrentData(result.data);
      }
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!currentData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4">
          <Sparkles className="h-10 w-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          {t('readyToGenerate')}
        </h3>
        <p className="text-slate-400 max-w-xs">
          {t('readyToGenerateSubtitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <span>{currentData.listingVersion}</span>
      </div>

      <ResultCard
        title={t('seoTitle')}
        content={currentData.seoTitle}
        icon={Search}
        color="text-blue-400"
      />

      <ResultCard
        title={t('shortDescription')}
        content={currentData.shortDescription}
        icon={FileText}
        color="text-green-400"
      />

      <ResultCard
        title={t('longDescription')}
        content={currentData.longDescription}
        icon={FileText}
        color="text-violet-400"
      />

      {currentData.detectedImageFeatures && currentData.detectedImageFeatures.length > 0 && (
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              {t('detectedImageFeatures')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex flex-wrap gap-2">
              {currentData.detectedImageFeatures.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs"
                >
                  {feature}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentData.suggestedKeywords && currentData.suggestedKeywords.length > 0 && (
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-orange-400" />
              {t('suggestedKeywords')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex flex-wrap gap-2">
              {currentData.suggestedKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-4 flex justify-end">
        <TranslationDropdown onTranslate={handleTranslate} isTranslating={isTranslating} />
      </div>
    </div>
  );
}
