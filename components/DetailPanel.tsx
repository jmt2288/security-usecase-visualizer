import React from 'react';
import { UseCase } from '../types';
import { TACTIC_COLORS } from '../constants';

interface DetailPanelProps {
  selection: { type: 'usecase'; data: UseCase } | { type: 'tactic'; id: string; relatedUseCases: UseCase[] } | null;
  categoryColors: Record<string, string>;
  onClose: () => void;
  onSelectUseCase: (useCase: UseCase) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ selection, categoryColors, onClose, onSelectUseCase }) => {
  
  const getMitreUrl = (techId: string) => {
    const cleanId = techId.trim();
    if (cleanId.includes('.')) {
        const [main, sub] = cleanId.split('.');
        return `https://attack.mitre.org/techniques/${main}/${sub}`;
    }
    return `https://attack.mitre.org/techniques/${cleanId}`;
  };

  if (!selection) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-6 text-brand-amazon/60 border-l border-brand-grey bg-white/50">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50 text-brand-turq">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        <p className="text-lg font-bold text-brand-dark">Select a node to view details</p>
        <p className="text-sm mt-2">Click on a use case (circle) or a tactic (text).</p>
      </div>
    );
  }

  if (selection.type === 'tactic') {
    return (
      <div className="h-full flex flex-col bg-white border-l border-brand-grey shadow-xl w-full">
        <div className="p-6 pb-2">
          <div className="flex justify-between items-start mb-6">
            <span className="inline-flex items-center rounded-md bg-brand-grey px-2 py-1 text-xs font-bold text-brand-dark ring-1 ring-inset ring-brand-dark/10">
              MITRE Tactic
            </span>
            <button onClick={onClose} className="text-brand-amazon hover:text-brand-turq transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <h2 className="text-2xl font-extrabold text-brand-dark mb-2 leading-snug">
            {selection.id}
          </h2>
          <p className="text-sm text-brand-amazon mb-4">
            {selection.relatedUseCases.length} Associated Use Case(s)
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-3">
              {selection.relatedUseCases.map(uc => (
                 <div 
                    key={uc.id}
                    onClick={() => onSelectUseCase(uc)}
                    className="p-3 rounded-lg border border-brand-grey hover:border-brand-turq hover:bg-brand-turq/5 cursor-pointer transition-all group"
                 >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[uc.category || 'Unknown'] }}></span>
                      <span className="text-xs font-bold text-brand-amazon group-hover:text-brand-turq">{uc.id}</span>
                    </div>
                    <p className="text-sm text-brand-dark font-medium leading-tight">
                      {uc.description}
                    </p>
                 </div>
              ))}
            </div>
        </div>
      </div>
    );
  }

  const { data: selectedUseCase } = selection;

  return (
    <div className="h-full flex flex-col bg-white border-l border-brand-grey shadow-xl overflow-y-auto w-full">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <span className="inline-flex items-center rounded-md bg-brand-grey px-2 py-1 text-xs font-bold text-brand-dark ring-1 ring-inset ring-brand-dark/10">
            {selectedUseCase.id}
          </span>
          <button onClick={onClose} className="text-brand-amazon hover:text-brand-turq transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h2 className="text-xl font-extrabold text-brand-dark mb-4 leading-snug">
          {selectedUseCase.description}
        </h2>

        {selectedUseCase.category && (
             <div className="mb-6">
             <h3 className="text-xs uppercase tracking-wide text-brand-amazon mb-2 font-semibold">Category</h3>
             <div className="flex items-center gap-2">
                 <span className="w-3.5 h-3.5 rounded-full shadow-sm ring-1 ring-black/5" style={{ backgroundColor: categoryColors[selectedUseCase.category] }}></span>
                 <span className="text-sm text-brand-dark font-medium">{selectedUseCase.category}</span>
             </div>
           </div>
        )}

        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wide text-brand-amazon mb-3 font-semibold">MITRE Tactics</h3>
          <div className="flex flex-wrap gap-2">
            {selectedUseCase.tactics.map(tactic => (
              <span 
                key={tactic} 
                className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: TACTIC_COLORS[tactic] || TACTIC_COLORS['All'] }}
              >
                {tactic}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide text-brand-amazon mb-3 font-semibold">MITRE Techniques</h3>
          {selectedUseCase.techniques.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {selectedUseCase.techniques.map(tech => (
                <a 
                  key={tech}
                  href={getMitreUrl(tech)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded bg-brand-grey/30 border border-brand-grey hover:border-brand-turq transition-colors group"
                >
                  <span className="text-sm font-mono text-brand-dark font-semibold">{tech}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-brand-amazon group-hover:text-brand-turq">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No specific sub-techniques listed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;