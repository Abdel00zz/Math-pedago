import React, { useMemo } from 'react';
import { UINotification } from '../types';
import Modal from './Modal';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: UINotification[];
}

type NotificationCategory = 'update' | 'launch' | 'deadline' | 'achievement' | 'welcome' | 'general';

interface CategorisedNotifications {
    byCategory: Record<NotificationCategory, UINotification[]>;
    ordered: Array<{ notification: UINotification; category: NotificationCategory }>;
    total: number;
}

interface SummaryChip {
    category: NotificationCategory;
    label: string;
    count: number;
}

interface SummaryInfo {
    message: string;
    chips: SummaryChip[];
    total: number;
}

const CATEGORY_META: Record<NotificationCategory, { label: string; keywords: string[] }> = {
    update: {
        label: 'Mises à jour',
        keywords: ['mis à jour', 'version', 'actualisation', 'nouveau contenu'],
    },
    launch: {
        label: 'Nouveautés',
        keywords: ['nouveau', 'disponible', 'lancement', 'commence', 'arrive'],
    },
    deadline: {
        label: 'Rappels',
        keywords: ['imminente', 'deadline', 'date limite', 'rappel', 'bientôt'],
    },
    achievement: {
        label: 'Réussites',
        keywords: ['score', 'travail', 'bravo', 'terminé', 'félicitations', 'succès'],
    },
    welcome: {
        label: 'Bienvenues',
        keywords: ['bienvenue', 'bonjour', 'démarrer', 'introduction'],
    },
    general: {
        label: 'Infos clés',
        keywords: [],
    },
};

const detectCategory = (notif: UINotification): NotificationCategory => {
    const title = notif.title.toLowerCase();

    for (const [category, meta] of Object.entries(CATEGORY_META) as [NotificationCategory, (typeof CATEGORY_META)[NotificationCategory]][]) {
        if (category === 'general') {
            continue;
        }

        if (meta.keywords.some(keyword => title.includes(keyword))) {
            return category;
        }
    }

    return 'general';
};

const categoriseNotifications = (notifications: UINotification[]): CategorisedNotifications => {
    const byCategory: Record<NotificationCategory, UINotification[]> = {
        update: [],
        launch: [],
        deadline: [],
        achievement: [],
        welcome: [],
        general: [],
    };

    const orderedEntries: Array<{ notification: UINotification; category: NotificationCategory }> = [];

    [...notifications]
        .sort((a, b) => b.timestamp - a.timestamp)
        .forEach(notif => {
        const category = detectCategory(notif);
        byCategory[category].push(notif);
        orderedEntries.push({ notification: notif, category });
    });

    return {
        byCategory,
        ordered: orderedEntries,
        total: orderedEntries.length,
    };
};

const buildSummary = (categorised: CategorisedNotifications): SummaryInfo => {
    if (categorised.total === 0) {
        return {
            message: 'Aucune notification en attente pour le moment.',
            chips: [],
            total: 0,
        };
    }

    const chips: SummaryChip[] = Object.entries(categorised.byCategory)
        .filter(([, list]) => list.length > 0)
        .map(([category, list]) => ({
            category: category as NotificationCategory,
            label: CATEGORY_META[category as NotificationCategory].label,
            count: list.length,
        }))
        .sort((a, b) => b.count - a.count);

    const [primaryChip] = chips;

    const focusEntry = categorised.ordered[0];
    const focusNotification = focusEntry?.notification;

    const messageParts: string[] = [];

    if (primaryChip) {
        messageParts.push(`${primaryChip.count} ${primaryChip.label.toLowerCase()} à consulter`);
    }

    if (focusNotification) {
        messageParts.push(`Commencez par « ${focusNotification.title} »`);
    }

    const message = messageParts.length
        ? messageParts.join(' · ')
        : 'Parcourez vos notifications pour rester à jour.';

    return {
        message,
        chips,
        total: categorised.total,
    };
};

const timeAgo = (timestamp: number): string => {
    const diffInSeconds = Math.floor((Date.now() - timestamp) / 1000);

    if (diffInSeconds < 60) {
        return "à l'instant";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `il y a ${diffInMinutes} min`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `il y a ${diffInHours} h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `il y a ${diffInDays} j`;
    }

    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
    });
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, notifications }) => {
    const categorised = useMemo(() => categoriseNotifications(notifications), [notifications]);
    const summary = useMemo(() => buildSummary(categorised), [categorised]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Notifications"
            className="notification-modal"
        >
            <div className="notification-list">
                {categorised.total > 0 ? (
                    categorised.ordered.map(({ notification, category }) => (
                        <div key={notification.id} className="notification-item">
                            <div className="notification-item__header">
                                <span className="notification-item__category">
                                    {CATEGORY_META[category].label}
                                </span>
                                <span className="notification-item__time">{timeAgo(notification.timestamp)}</span>
                            </div>
                            <h4 className="notification-item__title">{notification.title}</h4>
                            <p className="notification-item__message" dangerouslySetInnerHTML={{ __html: notification.message }} />
                        </div>
                    ))
                ) : (
                    <div className="notification-empty">
                        <span className="material-symbols-outlined">notifications_off</span>
                        <p>Aucune notification</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default NotificationCenter;
