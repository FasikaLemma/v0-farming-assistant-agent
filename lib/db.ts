import { createClient } from '@/lib/supabase/server'

export interface ChatSession {
  id: string
  session_id: string
  title: string
  mode: 'farming' | 'help'
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  image_url?: string
  tool_calls?: unknown
  metadata?: unknown
  created_at: string
}

// Create or get a chat session
export async function getOrCreateSession(sessionId: string, mode: 'farming' | 'help' = 'farming'): Promise<ChatSession | null> {
  const supabase = await createClient()
  
  // Try to get existing session
  const { data: existing } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single()
  
  if (existing) {
    return existing as ChatSession
  }
  
  // Create new session
  const { data: newSession, error } = await supabase
    .from('chat_sessions')
    .insert({ session_id: sessionId, mode })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating session:', error)
    return null
  }
  
  return newSession as ChatSession
}

// Get all messages for a session
export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  
  return (data || []) as ChatMessage[]
}

// Save a message to the database
export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  options?: {
    imageUrl?: string
    toolCalls?: unknown
    metadata?: unknown
  }
): Promise<ChatMessage | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content,
      image_url: options?.imageUrl,
      tool_calls: options?.toolCalls,
      metadata: options?.metadata,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error saving message:', error)
    return null
  }
  
  return data as ChatMessage
}

// Update session title based on first message
export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  const supabase = await createClient()
  
  const truncatedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title
  
  await supabase
    .from('chat_sessions')
    .update({ title: truncatedTitle })
    .eq('session_id', sessionId)
}

// Get all chat sessions ordered by most recent
export async function getAllSessions(mode?: 'farming' | 'help'): Promise<ChatSession[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (mode) {
    query = query.eq('mode', mode)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
  
  return (data || []) as ChatSession[]
}

// Delete a session and all its messages
export async function deleteSession(sessionId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('session_id', sessionId)
  
  if (error) {
    console.error('Error deleting session:', error)
    return false
  }
  
  return true
}
