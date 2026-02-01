
import React from 'react';
import { Globe, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { GlobalNewsResult } from '../services/geminiService.ts';

interface GlobalNewsSearchProps {
  results: GlobalNewsResult | null;
  isLoading: boolean;
  error: string | null;
  query: string;
}

export const GlobalNewsSearch: React.FC<GlobalNewsSearchProps> = ({ results, isLoading, error, query }) => {
  if (!isLoading && !results && !error) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
      <div className="bg-blue-600 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white">
          <Globe className="w-4 h-4" />
          <h2 className="text-xs font-black uppercase tracking-widest">Search: {query}</h2>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-blue-200 animate-spin" />}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-sm font-bold animate-pulse">Scanning world news feeds...</p>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-3 text-red-500 p-4 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : results ? (
          <div className="space-y-6">
            <div className="prose prose-slate prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed font-medium">
                {results.text}
              </p>
            </div>

            {results.sources.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {results.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all group"
                    >
                      <span className="truncate max-w-[150px]">{source.title}</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
