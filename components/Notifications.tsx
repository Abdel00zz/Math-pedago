
import React from 'react';
import ReactDOM from 'react-dom';
import { useNotification, Notification } from '../context/NotificationContext';

const Toast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
    const typeStyles = {
        success: 'bg-success',
        error: 'bg-error',
        info: 'bg-info',
    };

    return (
        <div
            className={`w-full max-w-sm p-4 text-white rounded-lg shadow-2xl animate-slideInRight ${typeStyles[notification.type]} flex items-center justify-between`}
            role="alert"
        >
            <span>{notification.message}</span>
            <button 
                onClick={() => onDismiss(notification.id)} 
                className="ml-4 -mr-1 p-1 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Fermer"
            >
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    );
};

export const Notifications: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    return ReactDOM.createPortal(
        <div className="fixed bottom-5 right-5 z-[1000] space-y-3">
            {notifications.map(n => (
                <Toast key={n.id} notification={n} onDismiss={removeNotification} />
            ))}
        </div>,
        document.body
    );
};