import React from 'react';
import { Language } from '../types';
import { UI_TEXT, APP_NAME } from '../constants';
import { LayoutDashboard, Map as MapIcon, BarChart3, AlertTriangle, Globe, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentLang: Language;
  onToggleLang: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentLang, onToggleLang, activeTab, onTabChange }) => {
  const isRTL = currentLang === Language.AR;
  const t = UI_TEXT[currentLang];
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'map', icon: MapIcon, label: t.map },
    { id: 'analytics', icon: BarChart3, label: t.analytics },
    { id: 'alerts', icon: AlertTriangle, label: t.alerts },
  ];

  return (
    <div className={`min-h-screen flex bg-slate-50 font-${isRTL ? 'arabic' : 'sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex flex-col w-64 bg-white border-${isRTL ? 'l' : 'r'} border-slate-200 fixed h-full z-10`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-absher-green rounded-lg flex items-center justify-center text-white font-bold">ن</div>
          <h1 className="text-xl font-bold text-slate-800">{APP_NAME[currentLang]}</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-absher-light text-absher-green font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon size={20} className={isRTL ? 'ml-2' : 'mr-2'} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-3 rounded-md border border-emerald-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             {t.connectAbsher}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white z-20 border-b border-slate-200 p-4 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-absher-green rounded-lg flex items-center justify-center text-white font-bold">ن</div>
            <h1 className="text-lg font-bold text-slate-800">{APP_NAME[currentLang]}</h1>
         </div>
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600">
           <Menu />
         </button>
      </div>

       {/* Mobile Menu */}
       {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-white pt-20 px-4 pb-4">
           <nav className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg text-lg ${
                  activeTab === item.id ? 'bg-absher-light text-absher-green' : 'text-slate-600'
                }`}
              >
                <item.icon size={24} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
       )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col ${isRTL ? 'md:mr-64' : 'md:ml-64'} pt-20 md:pt-0 transition-all`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 hidden md:block">
            {navItems.find(i => i.id === activeTab)?.label}
          </h2>
          
          <div className="flex items-center gap-4 ml-auto md:ml-0 w-full md:w-auto justify-end">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {t.systemStatus}
            </div>
            
            <button 
              onClick={onToggleLang}
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors"
            >
              <Globe size={16} />
              <span>{currentLang === Language.EN ? 'العربية' : 'English'}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};