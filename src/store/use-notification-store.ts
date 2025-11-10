import { create } from 'zustand'
import type { Notification } from '@/types'
import { generateId } from '@/lib/utils'

interface NotificationState {
  notifications: Notification[]
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  clearAll: () => void
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: generateId(),
          createdAt: new Date(),
          read: false,
        },
        ...state.notifications,
      ],
    })),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  markAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearAll: () => set({ notifications: [] }),

  getUnreadCount: () => {
    const { notifications } = get()
    return notifications.filter((n) => !n.read).length
  },
}))
