import React from 'react';
import ReactDOM from 'react-dom';
import { useNotification, NotificationType } from '../context/NotificationContext';

export const Notifications: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    const portalRoot = document.body;
    if (!portalRoot) return null;

    const typeInfo: { [key in NotificationType]: { bg: string; icon: string } } = {
        success: { bg: 'bg-emerald-600', icon: 'check_circle' },
        warning: { bg: 'bg-amber-500', icon: 'warning' },
        error: { bg: 'bg-red-600', icon: 'error' },
        info: { bg: 'bg-blue-600', icon: 'info' },
    };

    return ReactDOM.createPortal(
        <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[1000] space-y-4 w-full max-w-md">
            {notifications.map((notif) => {
                const info = typeInfo[notif.type];
                const baseClasses = `w-full p-5 rounded-xl shadow-2xl animate-slideInUp flex items-center gap-4 text-white ${info.bg}`;

                return (
                    <div
                        key={notif.id}
                        className={baseClasses}
                        role="alert"
                    >
                        <span className="material-symbols-outlined !text-2xl">{info.icon}</span>
                        <p className="text-base font-semibold font-sans flex-grow">{notif.message}</p>
                        <button
                            onClick={() => removeNotification(notif.id)}
                            className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
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
