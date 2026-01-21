import React, { useState, useMemo, useRef, useEffect } from 'react';
import MitreViz from './components/MitreViz';
import DetailPanel from './components/DetailPanel';
import Uploader from './components/Uploader';
import Logo from './components/Logo';
import { INITIAL_USE_CASES } from './constants';
import { UseCase } from './types';

const STORAGE_KEY = 'security_custom_catalog';

// Define union type for selection state
type SelectionState = 
  | { type: 'usecase'; data: UseCase }
  | { type: 'tactic'; id: string }
  | null;

const COLOR_PALETTE = [
  '#38BDF8', // Sky Blue
  '#4ADE80', // Mint Green
  '#818CF8', // Periwinkle
  '#FB923C', // Orange
  '#F472B6', // Pink
  '#A78BFA', // Violet
  '#FACC15', // Yellow
  '#2DD4BF', // Teal
  '#FB7185', // Rose
  '#94A3B8'  // Slate
];

function App() {
  // Initialize state from localStorage or fallback to constants
  const [data, setData] = useState<UseCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load custom catalog from storage", e);
        return INITIAL_USE_CASES;
      }
    }
    return INITIAL_USE_CASES;
  });
  
  const [selection, setSelection] = useState<SelectionState>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const isResizingSidebar = useRef(false);

  // Persistence logic: save data whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const categoryColors = useMemo(() => {
    const categories = Array.from(new Set(data.map(uc => uc.category || 'Unknown')));
    const mapping: Record<string, string> = {};
    categories.forEach((cat: string, index) => {
      mapping[cat] = COLOR_PALETTE[index % COLOR_PALETTE.length];
    });
    return mapping;
  }, [data]);

  const handleReset = () => {
    if (window.confirm("This will delete your custom catalog and restore the default use cases. Are you sure?")) {
      localStorage.removeItem(STORAGE_KEY);
      setData(INITIAL_USE_CASES);
      setSelection(null);
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Description', 'Tactics', 'Techniques', 'Category'];
    const rows = data.map(uc => {
        const safeDesc = uc.description.replace(/"/g, '""');
        const safeTactics = uc.tactics.join(';');
        const safeTechniques = uc.techniques.join(';');
        return `"${uc.id}","${safeDesc}","${safeTactics}","${safeTechniques}","${uc.category}"`;
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'use_cases.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const detailPanelProps = useMemo(() => {
    if (!selection) return null;
    if (selection.type === 'usecase') return { type: 'usecase' as const, data: selection.data };
    if (selection.type === 'tactic') {
      const relatedUseCases = data.filter(uc => {
        const hasAll = uc.tactics.some(t => t.toLowerCase() === 'all');
        const hasTactic = uc.tactics.includes(selection.id);
        return hasAll || hasTactic;
      }).sort((a, b) => a.id.localeCompare(b.id));
      return { type: 'tactic' as const, id: selection.id, relatedUseCases };
    }
    return null;
  }, [selection, data]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth * 0.7) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      document.body.style.cursor = 'default';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const isUsingDefaultData = JSON.stringify(data) === JSON.stringify(INITIAL_USE_CASES);

  return (
    <div className="flex flex-col h-screen w-full font-sans text-brand-dark">
      <header className="flex-none h-16 bg-gradient-to-r from-brand-dark to-brand-turq shadow-md flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        
        <div className="flex items-center gap-6">
            <div className="hidden lg:flex gap-4 text-sm text-gray-200 font-medium overflow-x-auto px-2 py-1 scrollbar-hide">
                {Object.entries(categoryColors).map(([cat, color]) => (
                  <div key={cat} className="flex items-center gap-2 whitespace-nowrap">
                    <span className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20" style={{ backgroundColor: color }}></span> {cat}
                  </div>
                ))}
            </div>

            <div className="h-6 w-px bg-white/20 mx-2 hidden lg:block"></div>

            <div className="flex items-center gap-3">
                <div className="bg-white/10 border border-white/20 px-3 py-1 rounded-md text-xs font-mono text-white shadow-sm">
                    {data.length} <span className="text-white opacity-70">Cases</span>
                </div>

                <button
                    onClick={() => setIsCapturing(!isCapturing)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border shadow-sm ${
                        isCapturing 
                        ? 'bg-white text-brand-dark border-white font-bold' 
                        : 'bg-brand-amazon/50 text-white border-white/10 hover:bg-brand-amazon'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    <span className="hidden sm:inline">{isCapturing ? 'Static: ON' : 'Static: OFF'}</span>
                </button>

                <div className="flex items-center gap-1">
                  {!isUsingDefaultData && (
                    <button 
                      onClick={handleReset}
                      className="p-2 bg-red-500/20 hover:bg-red-500 text-red-100 hover:text-white rounded-lg transition-all border border-red-500/30 group"
                      title="Restore Default Catalog"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  )}
                  <Uploader onDataLoaded={(newData) => {
                      setData(newData);
                      setSelection(null);
                  }} />
                </div>
                
                <button 
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-2 px-3 py-2 bg-brand-amazon hover:bg-brand-dark rounded-lg text-sm text-white transition-colors border border-white/10 shadow-sm"
                    title="Export to CSV"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span className="hidden sm:inline">Export</span>
                </button>
            </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative bg-gradient-to-b from-brand-grey to-white">
        <main className="flex-1 transition-all duration-300 ease-out relative bg-transparent">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(#004254 0.8px, transparent 0.8px)',
                backgroundSize: '25px 25px'
            }}></div>
            <div className="p-4 h-full">
                 <MitreViz 
                    data={data} 
                    currentSelection={selection}
                    categoryColors={categoryColors}
                    isCapturing={isCapturing}
                    onSelectUseCase={(uc) => setSelection(uc ? { type: 'usecase', data: uc } : null)}
                    onSelectTactic={(tacticId) => setSelection(tacticId ? { type: 'tactic', id: tacticId } : null)} 
                 />
            </div>
        </main>

        {!isCapturing && selection && (
            <div 
                className="w-1.5 hover:w-3 hover:bg-brand-turq/50 cursor-col-resize flex items-center justify-center z-40 transition-all duration-200"
                onMouseDown={(e) => {
                    e.preventDefault();
                    isResizingSidebar.current = true;
                    document.body.style.cursor = 'col-resize';
                }}
            >
                <div className="w-0.5 h-8 bg-brand-grey hover:bg-brand-dark rounded-full"></div>
            </div>
        )}

        {!isCapturing && (
            <aside 
                style={{ width: selection ? `${sidebarWidth}px` : '0px' }}
                className={`
                    fixed lg:static right-0 top-16 bottom-0 z-30
                    bg-white overflow-hidden
                    transition-width duration-300 ease-in-out shadow-2xl border-l border-brand-grey
                    ${selection ? 'opacity-100' : 'opacity-0 w-0'}
                `}
            >
                <div style={{ width: `${sidebarWidth}px` }} className="h-full">
                    <DetailPanel 
                        selection={detailPanelProps}
                        categoryColors={categoryColors}
                        onClose={() => setSelection(null)}
                        onSelectUseCase={(uc) => setSelection({ type: 'usecase', data: uc })} 
                    />
                </div>
            </aside>
        )}
      </div>
    </div>
  );
}

export default App;