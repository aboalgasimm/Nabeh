import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { RiskMap } from './components/RiskMap';
import { RiskAnalysisModal } from './components/RiskAnalysisModal';
import { Button } from './components/Button';
import { Language, VehicleTelemetry, Incident } from './types';
import { UI_TEXT } from './constants';
import { generateInitialVehicles, updateVehicleData, generateMockIncidents } from './services/simulationService';
import { Activity, Users, AlertOctagon, TrendingUp, Zap, History, AlertTriangle, Construction } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const App: React.FC = () => {
  // Default to Arabic
  const [lang, setLang] = useState<Language>(Language.AR);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState<VehicleTelemetry[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTelemetry | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const t = UI_TEXT[lang];

  // Initialize Data
  useEffect(() => {
    const initialData = generateInitialVehicles(12);
    setVehicles(initialData);
    setIncidents(generateMockIncidents());
  }, []);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(current => updateVehicleData(current));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const toggleLang = () => {
    setLang(prev => prev === Language.EN ? Language.AR : Language.EN);
  };

  const handleExport = () => {
    const msg = lang === Language.AR ? "جاري تصدير تقرير تقييم المخاطر (PDF)..." : "Exporting Risk Assessment Report (PDF)...";
    alert(msg);
  };

  // Derived Metrics
  const avgRisk = Math.round(vehicles.reduce((acc, v) => acc + v.riskScore, 0) / vehicles.length) || 0;
  const highRiskCount = vehicles.filter(v => v.riskScore > 75).length;
  
  // Chart Data Mock
  const chartData = [
    { time: '00:00', risk: 20, traffic: 40 },
    { time: '04:00', risk: 15, traffic: 20 },
    { time: '08:00', risk: 65, traffic: 85 },
    { time: '12:00', risk: 45, traffic: 60 },
    { time: '16:00', risk: 70, traffic: 90 },
    { time: '20:00', risk: 55, traffic: 75 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <div className="h-[calc(100vh-8rem)] w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            <RiskMap vehicles={vehicles} onVehicleClick={setSelectedVehicle} lang={lang} />
            <div className={`absolute top-4 ${lang === Language.AR ? 'right-4' : 'left-4'} bg-white/90 p-4 rounded-xl shadow-lg backdrop-blur-sm z-10 max-w-xs border border-slate-100`}>
               <h4 className="font-bold text-slate-800 text-sm mb-1">{t.map}</h4>
               <p className="text-xs text-slate-500 leading-relaxed">{t.mapDescription}</p>
               <div className="mt-3 flex gap-2">
                  <div className="flex items-center gap-1 text-xs text-slate-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {t.safe}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-600"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> {t.critical}</div>
               </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-6">{t.riskTrends}</h3>
              <div className="h-80 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRisk2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'left' }} />
                    <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-6">{t.incidentSeverity}</h3>
                <div className="h-64" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Minor', count: 14, fill: '#3b82f6' },
                      { name: 'Major', count: 5, fill: '#f59e0b' },
                      { name: 'Critical', count: 2, fill: '#ef4444' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                      <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                  <Zap size={40} />
                </div>
                <h3 className="text-3xl font-bold text-slate-800">99.8%</h3>
                <p className="text-slate-500 font-medium">{t.systemAvailability}</p>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden" dir="ltr">
                  <div className="h-full bg-emerald-500 w-[99.8%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">{t.alerts}</h2>
                <div className="flex gap-2">
                   <Button variant="outline" className="text-xs h-9" onClick={handleExport}>{t.exportReport}</Button>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-medium text-slate-500 text-xs uppercase tracking-wider flex">
                   <div className="flex-1">{t.alertSource}</div>
                   <div className="flex-1">{t.riskFactor}</div>
                   <div className="w-32">{t.timestamp}</div>
                   <div className="w-24 text-right">{t.action}</div>
                </div>
                
                {vehicles.filter(v => v.riskScore > 50).length === 0 && incidents.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{t.noAlerts}</p>
                  </div>
                ) : (
                  <>
                    {/* High Risk Vehicles */}
                    {vehicles.filter(v => v.riskScore > 50).sort((a,b) => b.riskScore - a.riskScore).map(v => (
                       <div 
                         key={v.id} 
                         className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 flex items-center transition cursor-pointer group" 
                         onClick={() => setSelectedVehicle(v)}
                         role="button"
                         tabIndex={0}
                         onKeyDown={(e) => { if(e.key === 'Enter') setSelectedVehicle(v); }}
                       >
                          <div className="flex-1 flex items-center gap-3">
                             <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs ring-2 ring-transparent group-hover:ring-red-200 transition-all">{v.riskScore}</div>
                             <div>
                                <div className="font-semibold text-slate-800">{v.plateNumber}</div>
                                <div className="text-xs text-slate-500">{v.driverName}</div>
                             </div>
                          </div>
                          <div className="flex-1">
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                <AlertTriangle size={10} />
                                {v.factors[0] || (lang === Language.AR ? 'قيادة متهورة' : 'Aggressive Driving')}
                             </span>
                          </div>
                          <div className="w-32 text-sm text-slate-500">{t.liveNow}</div>
                          <div className="w-24 text-right">
                             <button 
                                className="text-absher-green hover:text-absher-dark text-sm font-semibold focus:outline-none focus:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedVehicle(v);
                                }}
                             >
                                {t.analyze}
                             </button>
                          </div>
                       </div>
                    ))}
                    
                    {/* Recent Incidents */}
                    {incidents.map(inc => (
                       <div key={inc.id} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 flex items-center transition opacity-75">
                          <div className="flex-1 flex items-center gap-3">
                             <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center"><AlertOctagon size={18}/></div>
                             <div>
                                <div className="font-semibold text-slate-700">{inc.type}</div>
                                <div className="text-xs text-slate-500">{inc.location}</div>
                             </div>
                          </div>
                          <div className="flex-1">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                inc.severity === 'Critical' || inc.severity === 'حرج' ? 'bg-red-100 text-red-800' : 
                                inc.severity === 'Major' || inc.severity === 'متوسط' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                             }`}>
                                {inc.severity}
                             </span>
                          </div>
                          <div className="w-32 text-sm text-slate-500">{inc.timestamp}</div>
                          <div className="w-24 text-right">
                             <span className="text-slate-400 text-sm">{t.logged}</span>
                          </div>
                       </div>
                    ))}
                  </>
                )}
             </div>
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-slate-500 text-sm font-medium">{t.totalMonitored}</span>
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                </div>
                <div className="text-3xl font-bold text-slate-800">{vehicles.length}</div>
                <div className="text-xs text-green-600 mt-2 flex items-center" dir="ltr">
                  <TrendingUp size={12} className="mr-1" /> {t.newVehicles}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-slate-500 text-sm font-medium">{t.avgNetworkRisk}</span>
                   <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={20} /></div>
                </div>
                <div className="text-3xl font-bold text-slate-800">{avgRisk}/100</div>
                 <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden" dir="ltr">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${avgRisk}%` }}></div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 ring-1 ring-red-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-slate-500 text-sm font-medium">{t.criticalAlerts}</span>
                   <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertOctagon size={20} /></div>
                </div>
                <div className="text-3xl font-bold text-red-600">{highRiskCount}</div>
                <div className="text-xs text-red-500 mt-2 font-medium">{t.requiresAttention}</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-slate-500 text-sm font-medium">{t.roadQuality}</span>
                   <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Construction size={20} /></div>
                </div>
                <div className="text-lg font-bold text-slate-800 mb-1">{t.bumpyRoadAlert}</div>
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">{t.caution}</div>
              </div>
            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Map & Live List */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Map Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800">{t.map}</h3>
                      <span className="flex items-center gap-2 text-xs text-slate-400 px-2 py-1 bg-slate-50 rounded border border-slate-100">
                         <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                         LIVE
                      </span>
                   </div>
                   <div className="p-1">
                      <RiskMap vehicles={vehicles} onVehicleClick={setSelectedVehicle} lang={lang} />
                   </div>
                </div>

                {/* Analytics Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800 mb-6">{t.riskTrends}</h3>
                  <div className="h-64 w-full" dir="ltr">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                          <Tooltip 
                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'left' }}
                          />
                          <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                       </AreaChart>
                     </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right Column: Feed & Incidents */}
              <div className="space-y-8">
                
                {/* Live Feed */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
                   <div className="p-4 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-800">{t.activeVehicles}</h3>
                   </div>
                   <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      {vehicles.sort((a,b) => b.riskScore - a.riskScore).map(vehicle => (
                         <div 
                            key={vehicle.id} 
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedVehicle(vehicle)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedVehicle(vehicle);
                              }
                            }}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-slate-50 flex items-center justify-between ${
                              vehicle.riskScore > 75 ? 'border-red-100 bg-red-50/30' : 'border-slate-100'
                            }`}
                         >
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                                  vehicle.riskScore > 75 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                               }`}>
                                  {vehicle.riskScore}
                               </div>
                               <div>
                                  <p className="text-sm font-medium text-slate-800">{vehicle.plateNumber}</p>
                                  <p className="text-xs text-slate-500" dir="ltr">{vehicle.speed} km/h</p>
                               </div>
                            </div>
                            {vehicle.riskScore > 75 && (
                               <AlertTriangle size={16} className="text-red-500" />
                            )}
                         </div>
                      ))}
                   </div>
                </div>

                {/* Incident History */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                   <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                      <History size={18} className="text-slate-400"/>
                      <h3 className="font-semibold text-slate-800">{t.incidentHistory}</h3>
                   </div>
                   <div className="p-4 space-y-4">
                      {incidents.map(incident => (
                         <div key={incident.id} className="flex gap-4 relative">
                            {/* Timeline Line */}
                            <div className="absolute right-[19px] top-8 bottom-[-20px] w-0.5 bg-slate-100 last:hidden"></div>
                            
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-white shadow-sm z-10 ${
                               incident.severity === 'Critical' || incident.severity === 'حرج' ? 'bg-red-500' : incident.severity === 'Major' || incident.severity === 'متوسط' ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>
                               <AlertOctagon size={16} className="text-white" />
                            </div>
                            <div>
                               <p className="text-sm font-semibold text-slate-800">{incident.type}</p>
                               <p className="text-xs text-slate-500">{incident.location} • {incident.timestamp}</p>
                               <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                                  incident.status === 'Resolved' || incident.status === 'منتهي' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                               }`}>
                                  {incident.status}
                               </span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
      currentLang={lang} 
      onToggleLang={toggleLang}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
      
      {/* AI Analysis Modal */}
      {selectedVehicle && (
        <RiskAnalysisModal 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
          lang={lang}
        />
      )}
    </Layout>
  );
};

export default App;