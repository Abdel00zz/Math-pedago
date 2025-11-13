import React from 'react';

interface Props {
    variant?: 'list' | 'year' | 'resume';
    className?: string;
}

const ConcoursBackground: React.FC<Props> = ({ variant = 'list', className }) => {
    // A single modern, chic SVG background used across concours views.
    // Opacities and colors vary slightly by variant via simple size differences.
    return (
        <div className={`absolute inset-0 pointer-events-none ${className || ''}`} aria-hidden={true}>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <linearGradient id="cp-grad" x1="0%" x2="100%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#f1f5f9" stopOpacity="1" />
                    </linearGradient>

                    <filter id="cp-blur" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="60" />
                    </filter>

                    <pattern id="cp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M24 0 L0 0 0 24" fill="none" stroke="#e6eef8" strokeWidth="0.5" opacity="0.6" />
                    </pattern>

                    <pattern id="cp-dots" width="80" height="80" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="2" fill="#c7d2fe" opacity="0.06" />
                    </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#cp-grad)" />

                    <g filter="url(#cp-blur)" opacity="0.18">
                        <circle cx="12%" cy="20%" r={variant === 'list' ? 240 : variant === 'year' ? 200 : 160} fill="#dbeafe" />
                        <circle cx="85%" cy="18%" r={variant === 'list' ? 220 : variant === 'year' ? 180 : 140} fill="#e6fffa" />
                    </g>

                <rect width="100%" height="100%" fill="url(#cp-dots)" opacity="0.06" />
                <rect width="100%" height="100%" fill="url(#cp-grid)" opacity="0.04" />

                {/* subtle left rule for notebook feel */}
                <line x1="72" y1="0" x2="72" y2="100%" stroke="#ffd7d7" strokeWidth="1.2" opacity="0.06" />
            </svg>
        </div>
    );
};

export default ConcoursBackground;
