import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '@/types'
import { STORAGE_KEYS } from '@/lib/constants/config'

interface SettingsState {
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void
  reset: () => void
}

const initialSettings: UserSettings = {
  theme: 'system',
  language: 'fr',
  notifications: true,
  soundEffects: true,
  autoSave: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: initialSettings,

      updateSettings: (newSettings: Partial<UserSettings>) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      reset: () => set({ settings: initialSettings }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
    }
  )
)
