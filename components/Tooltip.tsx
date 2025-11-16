
import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none absolute bottom-full left-1/2 z-[1200] mb-3 w-max max-w-xs -translate-x-1/2 rounded-xl border border-slate-700/40 bg-slate-900/95 px-3.5 py-2 text-sm font-medium text-white shadow-[0_12px_32px_rgba(15,23,42,0.35)] backdrop-blur group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 opacity-0 translate-y-1 scale-95 transition-all duration-200 ease-out"
      >
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-900/95 border-r border-b border-slate-700/40"></div>
      </div>
    </div>
  );
};

export default Tooltip;
