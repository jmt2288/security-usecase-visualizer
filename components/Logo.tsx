import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width="32" height="24" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <path d="M5 5C15 10 25 10 35 5" stroke="#00B0BD" strokeWidth="4" strokeLinecap="round"/>
        <path d="M5 25C15 20 25 20 35 25" stroke="#00B0BD" strokeWidth="4" strokeLinecap="round"/>
      </svg>
      <span className="text-2xl font-bold text-white tracking-tight leading-none">
        Security<span className="text-brand-turq">Catalog</span>
      </span>
    </div>
  );
};

export default Logo;