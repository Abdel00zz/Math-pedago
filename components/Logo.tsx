import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex justify-center items-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}>
    <img src="/logo.svg" alt="Logo" className="h-24" />
  </div>
);

export default Logo;