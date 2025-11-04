import React, { ReactNode } from 'react';

interface StandardHeaderProps {
  /** Titre principal du header */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Texte du badge (ex: "Plan de travail", "Quiz", etc.) */
  badgeText?: string;
  /** Icône du badge */
  badgeIcon?: string;
  /** Classe CSS additionnelle */
  className?: string;
  /** Contenu additionnel à afficher */
  children?: ReactNode;
  /** Style variant du header */
  variant?: 'default' | 'dashboard' | 'lesson';
  /** Callback pour le bouton retour */
  onBack?: () => void;
  /** Label du bouton retour */
  backLabel?: string;
}

const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeIcon = 'assignment',
  className = '',
  children,
  variant = 'default',
  onBack,
  backLabel = 'Retour',
}) => {
  const hasAside = Boolean(children);

  const renderBackButton = (isLesson = false) => {
    if (!onBack) return null;
    
    return (
      <button
        onClick={onBack}
        className={`standard-header__back-btn ${isLesson ? 'standard-header__back-btn--lesson' : ''}`}
        aria-label={backLabel}
        title={backLabel}
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
    );
  };

  if (variant === 'dashboard') {
    return (
      <header className={`dashboard-header ${className}`}>
        <div className="dashboard-header__inner">
          <div className="dashboard-hero">{children}</div>
        </div>
      </header>
    );
  }

  if (variant === 'lesson') {
    return (
      <>
        {onBack && (
          <div className="lesson-back-floating">
            {renderBackButton(true)}
          </div>
        )}
        <header className={`standard-header--lesson ${className}`}>
          <div className="standard-header__lesson-bar">
            <span className="standard-header__lesson-spacer" aria-hidden="true" />
            <div className="standard-header__lesson-meta">
              {subtitle && <p className="standard-header__lesson-subtitle">{subtitle}</p>}
              <h1 className="standard-header__lesson-title">{title}</h1>
            </div>
            <span className="standard-header__lesson-spacer" aria-hidden="true" />
          </div>
          {children ? <div className="standard-header__lesson-extra">{children}</div> : null}
        </header>
      </>
    );
  }

  return (
    <header className={`standard-header ${className}`}>
      <div className="standard-header__inner">
        {onBack ? renderBackButton() : <span className="standard-header__spacer" aria-hidden="true" />}
        <div className="standard-header__main">
          {badgeText && (
            <div className="standard-header__badge">
              <span className="material-symbols-outlined !text-sm">{badgeIcon}</span>
              <p>{badgeText}</p>
            </div>
          )}
          <h1 className="standard-header__title">{title}</h1>
          {subtitle && <p className="standard-header__subtitle">{subtitle}</p>}
        </div>
        {hasAside ? (
          <div className="standard-header__aside">{children}</div>
        ) : (
          <span className="standard-header__spacer" aria-hidden="true" />
        )}
      </div>
    </header>
  );
};

export default StandardHeader;