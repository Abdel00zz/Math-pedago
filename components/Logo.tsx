import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-2 border-4 border-gray-800 rounded-lg shadow-md bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}>
    <div className={`flex flex-col items-center -space-y-1`}>
      {/* Line 1: MATHS */}
      <div className="flex items-center">
        <span className="text-4xl font-bungee uppercase text-gray-800 tracking-tight">M</span>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#A78BFA', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#8B5CF6', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <path d="M12 2L2 22H22L12 2Z" fill="url(#grad1)" transform="rotate(-5 12 12)"/>
        </svg>
        <span className="text-4xl font-bungee uppercase text-gray-800 tracking-tight">THS</span>
      </div>
      {/* Line 2: MIN */}
      <div className="flex items-center">
        <span className="text-4xl font-bungee uppercase text-gray-800 tracking-tight">MIN</span>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#FCD34D', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#FBBF24', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          <path d="M 6,3 L 6,21 C 22,21 22,3 6,3 Z" fill="url(#grad2)" stroke="#FBBF24" strokeWidth="2" transform="rotate(5 12 12)"/>
        </svg>
      </div>
    </div>
  </div>
);

export default Logo;