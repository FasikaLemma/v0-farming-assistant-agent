import { create } from 'zustand'

export interface ChatSession {
  id: string
  session_id: string
  title: string
  mode: 'farming' | 'help'
  created_at: string
  updated_at: string
}

interface ChatStore {
  sessions: ChatSession[]
  
  // Session actions
  fetchSessions: (mode?: 'farming' | 'help') => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
}

export const useChatStore = create<ChatStore>((set) => ({
  sessions: [],

  fetchSessions: async (mode) => {
    try {
      const url = mode ? `/api/sessions?mode=${mode}` : '/api/sessions'
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.sessions) {
        set({ sessions: data.sessions })
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await fetch(`/api/sessions?sessionId=${sessionId}`, { method: 'DELETE' })
      set((state) => ({
        sessions: state.sessions.filter((s) => s.session_id !== sessionId),
      }))
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  },
}))
