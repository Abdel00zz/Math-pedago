/**
 * Icons - Système d'icônes moderne et propre avec SVG
 * Icônes optimisées pour la visibilité et le design moderne
 */

import React from 'react';

// Type de base pour les props d'icônes
type IconProps = React.SVGProps<SVGSVGElement> & {
    className?: string;
    size?: number;
};

// Composant de base pour les icônes SVG
const SvgIcon: React.FC<IconProps & { children: React.ReactNode }> = ({
    children,
    className = '',
    size = 24,
    ...props
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`inline-block ${className}`}
        {...props}
    >
        {children}
    </svg>
);

// Icônes principales avec designs modernes
export const BookOpenIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </SvgIcon>
);

export const UploadCloudIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M16 16l-4-4-4 4"/>
        <path d="M12 12v9"/>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        <path d="M16 16l-4-4-4 4"/>
    </SvgIcon>
);

export const SaveIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
    </SvgIcon>
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </SvgIcon>
);

export const EditIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </SvgIcon>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
    </SvgIcon>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </SvgIcon>
);

export const XCircleIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
    </SvgIcon>
);

export const PlusCircleIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
    </SvgIcon>
);

export const ArrowUpIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <line x1="12" y1="19" x2="12" y2="5"/>
        <polyline points="5 12 12 5 19 12"/>
    </SvgIcon>
);

export const ArrowDownIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <line x1="12" y1="5" x2="12" y2="19"/>
        <polyline points="19 12 12 19 5 12"/>
    </SvgIcon>
);

export const DuplicateIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </SvgIcon>
);

export const DocumentTextIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
    </SvgIcon>
);

export const VideoCameraIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </SvgIcon>
);

export const QuestionMarkCircleIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </SvgIcon>
);

export const PencilSquareIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </SvgIcon>
);

export const InformationCircleIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
    </SvgIcon>
);

export const LightBulbIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M9 18h6"/>
        <path d="M10 22h4"/>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </SvgIcon>
);

export const HomeIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
    </SvgIcon>
);

export const ImageIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
    </SvgIcon>
);

export const EyeIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </SvgIcon>
);

export const UndoIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
    </SvgIcon>
);

export const RedoIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </SvgIcon>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <polyline points="9 18 15 12 9 6"/>
    </SvgIcon>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <polyline points="6 9 12 15 18 9"/>
    </SvgIcon>
);

export const GripVerticalIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <circle cx="9" cy="5" r="1"/>
        <circle cx="9" cy="12" r="1"/>
        <circle cx="9" cy="19" r="1"/>
        <circle cx="15" cy="5" r="1"/>
        <circle cx="15" cy="12" r="1"/>
        <circle cx="15" cy="19" r="1"/>
    </SvgIcon>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </SvgIcon>
);

export const FolderIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </SvgIcon>
);

export const LayoutIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
    </SvgIcon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
    </SvgIcon>
);

export const TrophyIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </SvgIcon>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/>
        <path d="M19 17v4"/>
        <path d="M3 5h4"/>
        <path d="M17 19h4"/>
    </SvgIcon>
);

export const AcademicCapIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </SvgIcon>
);

export const ExclamationTriangleIcon: React.FC<IconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </SvgIcon>
);