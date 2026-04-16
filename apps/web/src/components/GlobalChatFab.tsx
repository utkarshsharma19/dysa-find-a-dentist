'use client'

import { ChatFab } from './ChatFab'
import { useAssistantContext } from '@/lib/chat-context'

export function GlobalChatFab() {
  const { context } = useAssistantContext()
  return <ChatFab context={context} />
}
