import React from 'react';
import { VehicleTelemetry, RiskLevel, Language } from '../types';
import { UI_TEXT } from '../constants';
import { ROAD_NETWORKS } from '../services/simulationService';

interface RiskMapProps {
  vehicles: VehicleTelemetry[];
  onVehicleClick: (v: VehicleTelemetry) => void;
  lang?: Language;
}

export const RiskMap: React.FC<RiskMapProps> = ({ vehicles, onVehicleClick, lang = Language.AR }) => {
  const t = UI_TEXT[lang];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-[#0f172a] rounded-xl overflow-hidden shadow-2xl border border-slate-700 group select-none">
      
      {/* 1. Map Background (Land & Blocks) */}
      <div className="absolute inset-0 bg-[#0f172a]">
        {/* Abstract City Blocks Pattern */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-20 pointer-events-none">
           <defs>
             <pattern id="city-blocks" x="0" y="0" width="25%" height="25%" patternUnits="objectBoundingBox">
                <rect x="2" y="2" width="20" height="20" fill="#1e293b" />
                <rect x="24" y="2" width="15" height="40" fill="#1e293b" />
                <rect x="2" y="24" width="20" height="15" fill="#1e293b" />
                <rect x="42" y="10" width="30" height="30" fill="#1e293b" />
             </pattern>
           </defs>
           <rect width="100%" height="100%" fill="url(#city-blocks)" />
        </svg>
      </div>

      {/* 2. Road Network Layer */}
      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* Glow Filter */}
        <defs>
          <filter id="road-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Draw Roads */}
        {ROAD_NETWORKS.map((road) => {
           const pointsStr = road.points.map(p => `${p.x},${p.y}`).join(' ');
           return (
             <g key={road.id}>
                {/* Road Casing (Border) */}
                <polyline 
                  points={pointsStr} 
                  fill="none" 
                  stroke="#334155" 
                  strokeWidth={road.width + 1.5} 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                {/* Road Surface */}
                <polyline 
                  points={pointsStr} 
                  fill="none" 
                  stroke="#475569" 
                  strokeWidth={road.width} 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={road.type === 'highway' ? 'opacity-100' : 'opacity-60'}
                />
                {/* Center Line for Highways */}
                {road.type === 'highway' && (
                  <polyline 
                    points={pointsStr} 
                    fill="none" 
                    stroke="#64748b" 
                    strokeWidth="0.3" 
                    strokeDasharray="1,1"
                    strokeOpacity="0.5"
                  />
                )}
             </g>
           );
        })}
      </svg>
      
      {/* 3. Context Labels (Street Names) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[3%] left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 bg-[#0f172a]/80 px-2 rounded tracking-widest uppercase">الطريق الدائري الشمالي</div>
         <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 bg-[#0f172a]/80 px-2 rounded tracking-widest uppercase">الطريق الدائري الجنوبي</div>
         <div className="absolute top-1/2 left-[5%] -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-500 bg-[#0f172a]/80 px-2 rounded tracking-widest uppercase">طريق جدة</div>
         <div className="absolute top-[25%] left-1/2 text-[10px] font-bold text-slate-600 -rotate-12">طريق العليا</div>
         <div className="absolute top-[50%] right-[2%] translate-x-0 -rotate-90 text-[10px] font-bold text-slate-500 bg-[#0f172a]/80 px-2 rounded tracking-widest uppercase">طريق المطار</div>
         <div className="absolute top-[45%] left-[45%] text-xs font-bold text-slate-700 opacity-50">حي النخيل</div>
      </div>

      {/* 4. Radar Scan Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-1/2 -translate-y-1/2 animate-spin-slow origin-center rounded-full pointer-events-none" style={{ animationDuration: '4s' }}></div>
      </div>

      {/* 5. Vehicles Layer */}
      {vehicles.map((vehicle) => {
        const isHighRisk = vehicle.riskLevel === RiskLevel.CRITICAL || vehicle.riskLevel === RiskLevel.HIGH;
        // Use more "neon" colors for dark mode
        const color = isHighRisk ? '#ef4444' : vehicle.riskLevel === RiskLevel.MODERATE ? '#fbbf24' : '#34d399';
        
        return (
          <div
            key={vehicle.id}
            role="button"
            tabIndex={0}
            aria-label={`${t.driver} ${vehicle.plateNumber}, ${t.riskScore}: ${vehicle.riskLevel}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onVehicleClick(vehicle);
              }
            }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-[1500ms] ease-linear group/marker z-10"
            style={{ 
              left: `${vehicle.coordinates.x}%`, 
              top: `${vehicle.coordinates.y}%`,
            }}
            onClick={() => onVehicleClick(vehicle)}
          >
            {/* Risk Aura */}
            {isHighRisk && (
              <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping pointer-events-none"></div>
            )}

            {/* Car Body shape - Rotated based on heading */}
            <div 
              className="relative transition-transform duration-300"
              style={{ transform: `rotate(${vehicle.heading}deg)` }}
            >
               {/* Headlights effect */}
               <div className="absolute -top-3 -left-1 w-2 h-6 bg-gradient-to-t from-white/0 to-white/40 blur-[2px] rounded-full"></div>
               <div className="absolute -top-3 left-1 w-2 h-6 bg-gradient-to-t from-white/0 to-white/40 blur-[2px] rounded-full"></div>

               {/* The Car SVG */}
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg filter">
                  <path d="M12 2L14.5 9H9.5L12 2Z" fill={color} /> {/* Nose */}
                  <rect x="8" y="9" width="8" height="10" rx="2" fill={color} /> {/* Body */}
                  <rect x="8" y="12" width="8" height="4" fill="rgba(0,0,0,0.3)" /> {/* Windshield */}
               </svg>
            </div>

            {/* Hover Tooltip (Enhanced) */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur border border-slate-600 text-white text-[10px] px-2 py-1.5 rounded shadow-xl opacity-0 group-hover/marker:opacity-100 pointer-events-none min-w-[80px] z-20 transition-opacity">
              <div className="font-bold text-emerald-400 mb-0.5">{vehicle.plateNumber}</div>
              <div className="flex justify-between text-slate-300">
                <span>{vehicle.speed} km/h</span>
                <span className={isHighRisk ? 'text-red-400' : 'text-emerald-400'}>{vehicle.riskScore}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* 6. UI Overlays */}
      {/* Compass */}
      <div className="absolute top-4 left-4 w-10 h-10 border-2 border-slate-600 rounded-full flex items-center justify-center bg-slate-800/50 backdrop-blur">
          <div className="w-1 h-3 bg-red-500 absolute top-1"></div>
          <div className="w-1 h-3 bg-white absolute bottom-1"></div>
          <span className="text-[8px] text-white font-bold absolute top-[-12px]">N</span>
      </div>

      {/* Legend Overlay */}
      <div className={`absolute bottom-4 ${lang === Language.AR ? 'left-4' : 'right-4'} bg-slate-800/90 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs space-y-2 shadow-xl`}>
        <div className="font-semibold mb-1 text-slate-300 border-b border-slate-700 pb-1">{t.mapLegend}</div>
        <div className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span> {t.safe}</div>
        <div className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span> {t.moderate}</div>
        <div className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> {t.critical}</div>
      </div>
    </div>
  );
};