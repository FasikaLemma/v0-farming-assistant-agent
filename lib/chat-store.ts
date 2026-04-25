import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatSession {
  id: string
  title: string
  preview: string
  timestamp: number
  messageCount: number
}

interface ChatStore {
  sessions: ChatSession[]
  currentSessionId: string | null
  addSession: (session: ChatSession) => void
  updateSession: (id: string, updates: Partial<ChatSession>) => void
  deleteSession: (id: string) => void
  setCurrentSession: (id: string | null) => void
  clearAllSessions: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,
      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
          currentSessionId: session.id,
        })),
      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          currentSessionId:
            state.currentSessionId === id ? null : state.currentSessionId,
        })),
      setCurrentSession: (id) => set({ currentSessionId: id }),
      clearAllSessions: () => set({ sessions: [], currentSessionId: null }),
    }),
    {
      name: 'farm-assistant-chat-history',
    }
  )
)
