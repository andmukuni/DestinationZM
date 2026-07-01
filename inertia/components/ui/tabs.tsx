import { createContext, useContext, useState, type ReactNode } from 'react'

type TabsContextValue = {
  active: string
  setActive: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

export function Tabs({
  defaultTab,
  activeTab: controlledActive,
  onActiveTabChange,
  children,
  className = '',
}: {
  defaultTab: string
  activeTab?: string
  onActiveTabChange?: (id: string) => void
  children: ReactNode
  className?: string
}) {
  const [internalActive, setInternalActive] = useState(defaultTab)
  const active = controlledActive ?? internalActive

  const setActive = (id: string) => {
    if (controlledActive === undefined) {
      setInternalActive(id)
    }
    onActiveTabChange?.(id)
  }

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  id,
  children,
  onSelect,
}: {
  id: string
  children: ReactNode
  onSelect?: () => void
}) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')

  const isActive = ctx.active === id

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => {
        ctx.setActive(id)
        onSelect?.()
      }}
      className={`shrink-0 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? 'border border-slate-200/80 bg-white text-slate-900 shadow-sm'
          : 'border border-transparent text-slate-500 hover:bg-white/60 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  id,
  children,
  className = 'pt-6',
}: {
  id: string
  children: ReactNode
  className?: string
}) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')

  if (ctx.active !== id) return null

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  )
}
