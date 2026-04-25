import { create } from 'zustand'

export interface ChatSession {
  id: string
  session_id: string
  title: string
  mode: 'farming' | 'help'
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
}

interface ChatStore {
  sessions: ChatSession[]
  currentSessionId: string | null
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  
  // Session actions
  fetchSessions: (mode?: 'farming' | 'help') => Promise<void>
  setCurrentSession: (id: string | null) => void
  deleteSession: (sessionId: string) => Promise<void>
  
  // Message actions
  fetchMessages: (sessionId: string) => Promise<void>
  sendMessage: (
    content: string,
    sessionId: string,
    options?: {
      mode?: 'farming' | 'help'
      image?: string
      soilData?: {
        nitrogen?: number
        phosphorus?: number
        potassium?: number
        ph?: number
        moisture?: number
      }
    }
  ) => Promise<void>
  clearMessages: () => void
  setError: (error: string | null) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isLoading: false,
  error: null,

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

  setCurrentSession: (id) => set({ currentSessionId: id }),

  deleteSession: async (sessionId) => {
    try {
      await fetch(`/api/sessions?sessionId=${sessionId}`, { method: 'DELETE' })
      set((state) => ({
        sessions: state.sessions.filter((s) => s.session_id !== sessionId),
        currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
      }))
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  },

  fetchMessages: async (sessionId) => {
    try {
      set({ isLoading: true })
      const response = await fetch(`/api/agent?sessionId=${sessionId}`)
      const data = await response.json()
      
      if (data.messages) {
        set({ 
          messages: data.messages.map((msg: { role: string; content: string; imageUrl?: string }) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            imageUrl: msg.imageUrl,
          })),
          currentSessionId: sessionId,
        })
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  sendMessage: async (content, sessionId, options) => {
    const { messages } = get()
    
    // Add user message optimistically
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      imageUrl: options?.image ? 'image' : undefined,
    }
    
    set({ 
      messages: [...messages, userMessage],
      isLoading: true,
      error: null,
    })

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }],
          sessionId,
          mode: options?.mode || 'farming',
          image: options?.image,
          soilData: options?.soilData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
      }
      
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }))
      
      // Refresh sessions to get updated list
      get().fetchSessions()
    } catch (error) {
      console.error('Error sending message:', error)
      set({ 
        error: 'Failed to send message. Please try again.',
        isLoading: false,
      })
    }
  },

  clearMessages: () => set({ messages: [], currentSessionId: null }),
  
  setError: (error) => set({ error }),
}))
