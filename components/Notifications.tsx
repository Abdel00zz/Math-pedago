import React from 'react';
import ReactDOM from 'react-dom';
import { useNotification } from '../context/NotificationContext';
import { ToastNotificationType } from '../types';

export const Notifications: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    const portalRoot = document.body;
    if (!portalRoot) return null;

    const typeInfo: { [key in ToastNotificationType]: { bg: string; icon: string } } = {
        success: { bg: 'bg-success', icon: 'check_circle' },
        warning: { bg: 'bg-warning', icon: 'warning' },
        error: { bg: 'bg-error', icon: 'error' },
        info: { bg: 'bg-info', icon: 'info' },
    };

    return ReactDOM.createPortal(
        <div className="fixed top-5 right-5 sm:top-8 sm:right-8 z-[1000] space-y-3 w-full max-w-sm">
            {notifications.map((notif) => {
                const info = typeInfo[notif.type];
                
                const handleActionClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (notif.action) {
                        notif.action.onClick();
                    }
                    removeNotification(notif.id);
                };

                const isClickable = !!notif.action;

                return (
                    <div
                        key={notif.id}
                        role="alert"
                        onClick={isClickable ? handleActionClick : undefined}
                        className={`relative w-full p-4 rounded-xl shadow-2xl animate-slideInUp flex items-start gap-4 text-white overflow-hidden ${info.bg} ${isClickable ? 'cursor-pointer' : ''}`}
                    >
                        {/* Background subtle icon */}
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 !text-8xl text-white/10 select-none -rotate-12">{info.icon}</span>

                        <span className="material-symbols-outlined !text-2xl mt-0.5 z-10">{info.icon}</span>
                        
                        <div className="flex-grow z-10">
                            {notif.title && <h4 className="font-bold text-white font-title text-lg">{notif.title}</h4>}
                            {notif.message && <p className="text-sm text-white/90 font-sans mt-0.5" dangerouslySetInnerHTML={{ __html: notif.message }}></p>}
                        </div>

                        {notif.action && (
                            <button
                                onClick={handleActionClick}
                                className="z-10 self-center ml-2 px-3 py-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 rounded-md transition-colors flex-shrink-0 font-button"
                            >
                                {notif.action.label}
                            </button>
                        )}
                        
                        <button
                            onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                            className="z-10 p-1 -mr-1 -mt-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                            aria-label="Fermer"
                        >
                            <span className="material-symbols-outlined !text-xl">close</span>
                        </button>
                    </div>
                );
            })}
        </div>,
        portalRoot
    );
};
