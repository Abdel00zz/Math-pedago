import React from 'react';

// Base Icon component to render Material Symbols
const Icon: React.FC<React.HTMLAttributes<HTMLSpanElement> & { iconName: string }> = ({ iconName, className, ...props }) => (
  <span className={`material-symbols-outlined select-none ${className || ''}`} {...props}>
    {iconName}
  </span>
);

// Mapping to new Material Symbols
export const BookOpenIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="menu_book" {...props} />;
export const UploadCloudIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="cloud_upload" {...props} />;
export const SaveIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="save" {...props} />;
export const RefreshIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="refresh" {...props} />;
export const EditIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="edit" {...props} />;
export const TrashIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="delete" {...props} />;
export const CheckCircleIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="check_circle" {...props} />;
export const XCircleIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="cancel" {...props} />;
export const PlusCircleIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="add_circle" {...props} />;
export const ArrowUpIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="arrow_upward" {...props} />;
export const ArrowDownIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="arrow_downward" {...props} />;
export const DuplicateIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="content_copy" {...props} />;
export const DocumentTextIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="article" {...props} />;
export const VideoCameraIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="videocam" {...props} />;
export const QuestionMarkCircleIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="help" {...props} />;
export const PencilSquareIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="edit_square" {...props} />;
export const InformationCircleIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="info" {...props} />;
export const LightBulbIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="lightbulb" {...props} />;
export const HomeIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="home" {...props} />;
export const ImageIcon: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => <Icon iconName="image" {...props} />;