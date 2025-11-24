import React, { useEffect, useState } from 'react';
import { VehicleTelemetry, GeminiAnalysis, LocationInsight, Language } from '../types';
import { analyzeRisk, analyzeLocationContext } from '../services/geminiService';
import { UI_TEXT } from '../constants';
import { X, AlertTriangle, ShieldCheck, Gauge, Bot, MapPin, ExternalLink } from 'lucide-react';
import { Button } from './Button';

interface Props {
  vehicle: VehicleTelemetry | null;
  onClose: () => void;
  lang: Language;
}

export const RiskAnalysisModal: React.FC<Props> = ({ vehicle, onClose, lang }) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [locationInsight, setLocationInsight] = useState<LocationInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const t = UI_TEXT[lang];

  useEffect(() => {
    if (vehicle) {
      setLoading(true);
      
      // Fetch both risk analysis and location context in parallel
      Promise.all([
        analyzeRisk(vehicle, lang),
        analyzeLocationContext(vehicle.lat, vehicle.lng, lang)
      ]).then(([riskData, locationData]) => {
        setAnalysis(riskData);
        setLocationInsight(locationData);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [vehicle, lang]);

  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-absher-green p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-white/80" />
            <h3 className="font-bold text-lg">{t.aiInsight}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/20 p-1 rounded-full transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Vehicle Snapshot */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-100">
             <div>
                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">{t.driver}</p>
                <p className="text-xl font-bold text-slate-900">{vehicle.driverName}</p>
                <p className="text-sm text-slate-600">{vehicle.plateNumber}</p>
             </div>
             <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-slate-500 text-sm mb-1">
                    <Gauge size={16} />
                    <span>{t.speed}</span>
                </div>
                <div className={`text-2xl font-mono font-bold ${vehicle.speed > 120 ? 'text-red-600' : 'text-slate-800'}`}>
                  {vehicle.speed} <span className="text-sm text-slate-500">km/h</span>
                </div>
             </div>
          </div>

          {/* AI Content */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="w-12 h-12 border-4 border-absher-green border-t-transparent rounded-full animate-spin"></div>
              <p className="animate-pulse">{t.analyzing}</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Risk Assessment */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    {t.assessment}
                 </h4>
                 <p className="text-slate-700 leading-relaxed text-sm">
                    {analysis.summary}
                 </p>
              </div>

              {/* Location Context (Google Maps Grounding) */}
              {locationInsight && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    {t.locationContext}
                  </h4>
                  <p className="text-blue-800 leading-relaxed text-sm mb-3">
                    {locationInsight.text}
                  </p>
                  
                  {/* Source Links */}
                  {locationInsight.sources.length > 0 && (
                    <div className="border-t border-blue-200/50 pt-2 mt-2">
                      <span className="text-xs text-blue-600 font-semibold mb-1 block">{t.sources}:</span>
                      <div className="flex flex-wrap gap-2">
                        {locationInsight.sources.map((source, idx) => (
                          <a 
                            key={idx}
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition"
                            aria-label={`Open source: ${source.title}`}
                          >
                            <ExternalLink size={10} />
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    {t.recommendations}
                </h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-lg text-emerald-900 text-sm">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                       {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
             <p className="text-center text-red-500">Analysis failed.</p>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
           <Button variant="outline" onClick={onClose}>{t.close}</Button>
        </div>
      </div>
    </div>
  );
};