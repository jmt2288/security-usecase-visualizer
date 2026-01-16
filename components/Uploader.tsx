import React, { useRef, useState } from 'react';
import { UseCase } from '../types';

interface UploaderProps {
  onDataLoaded: (data: UseCase[]) => void;
}

const JSON_EXAMPLE = `[
  {
    "id": "CUSTOM-001",
    "description": "Detection of unauthorized access attempt",
    "tactics": ["Initial Access", "Credential Access"],
    "techniques": ["T1078", "T1110.003"],
    "category": "Cloud Security"
  },
  {
    "id": "CUSTOM-002",
    "description": "Unusual administrative activity detected",
    "tactics": ["Persistence", "Privilege Escalation"],
    "techniques": ["T1098"],
    "category": "Identity"
  }
]`;

const Uploader: React.FC<UploaderProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    const text = await file.text();

    try {
        let newData: UseCase[] = [];

        if (file.name.endsWith('.json')) {
            newData = JSON.parse(text);
        } else {
            throw new Error("Unsupported file type. Please use a .json file.");
        }
        
        if (Array.isArray(newData) && newData.length > 0) {
            onDataLoaded(newData);
            setShowMenu(false);
        } else {
            setError("The JSON file must contain a non-empty array of use cases.");
        }

    } catch (err: any) {
        console.error(err);
        setError("Failed to parse JSON: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
    // Reset input value to allow uploading the same file again if edited
    event.target.value = '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".json"
      />
      
      <button 
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm shadow-md ${
            loading 
            ? 'bg-brand-grey text-gray-500 cursor-not-allowed' 
            : 'bg-white text-brand-turq hover:bg-brand-turq hover:text-white border border-white'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        {loading ? "Processing..." : "Load JSON"}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-3 w-[450px] bg-white rounded-xl shadow-2xl border border-brand-grey z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-amazon p-4 text-white flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-lg leading-tight">JSON Import Guide</h4>
                    <p className="text-xs opacity-70">Structure your data as an array of objects</p>
                </div>
                <button onClick={() => setShowMenu(false)} className="hover:text-brand-turq transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-amazon uppercase tracking-widest">Example Structure</span>
                  <button 
                      onClick={() => copyToClipboard(JSON_EXAMPLE)}
                      className="flex items-center gap-1.5 text-brand-turq hover:text-brand-amazon transition-colors text-[10px] font-bold"
                  >
                      {copied ? "Copied!" : "Copy Code"}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                      </svg>
                  </button>
                </div>

                <div className="relative">
                    <pre className="bg-brand-dark text-brand-turq p-3 rounded-lg text-[10px] font-mono overflow-x-auto max-h-56 scrollbar-hide border border-white/10">
                        {JSON_EXAMPLE}
                    </pre>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="text-[11px] text-brand-amazon/80 space-y-1">
                        <p>• <strong>id</strong>: Unique identifier (string).</p>
                        <p>• <strong>tactics</strong>: Array of MITRE tactics (must match standard names).</p>
                        <p>• <strong>techniques/subtechniques</strong>: Array of IDs (e.g. ["T1078","T1059","T1548.002" ]).</p>
                    </div>
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 bg-brand-turq hover:bg-brand-amazon text-white rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Upload JSON File
                    </button>
                    
                    {error && <p className="text-red-500 text-[10px] text-center font-bold bg-red-50 py-1.5 rounded border border-red-100">{error}</p>}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Uploader;