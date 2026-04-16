'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface AssistantContext {
  [key: string]: unknown
}

interface Value {
  context: AssistantContext
  setContext: (c: AssistantContext) => void
}

const Ctx = createContext<Value | null>(null)

export function AssistantContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<AssistantContext>({})
  const value = useMemo(() => ({ context, setContext }), [context])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAssistantContext(): Value {
  const v = useContext(Ctx)
  if (!v) throw new Error('AssistantContextProvider missing')
  return v
}
