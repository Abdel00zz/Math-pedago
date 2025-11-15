import React from 'react';

interface ModernLightBulbIconProps {
    className?: string;
}

const ModernLightBulbIcon: React.FC<ModernLightBulbIconProps> = ({ className = '' }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        role="img"
        aria-hidden="true"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 2.75c-3.1 0-5.6 2.4-5.6 5.36 0 2.03 1 3.84 2.63 4.97.3.21.47.55.47.89v1.29c0 .98.8 1.78 1.78 1.78h2.44c.98 0 1.78-.8 1.78-1.78v-1.29c0-.34.17-.67.47-.89 1.63-1.13 2.63-2.94 2.63-4.97 0-2.96-2.5-5.36-5.6-5.36Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M9.25 18.5h5.5M10.25 20.75h3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M9 7.25h.01M12 5.5h.01M15 7.25h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default ModernLightBulbIcon;
