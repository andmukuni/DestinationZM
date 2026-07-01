type ModulePageProps = Record<string, unknown>

export default function ModulePage({ title, ...props }: ModulePageProps & { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <pre className="overflow-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-700">
        {JSON.stringify(props, null, 2)}
      </pre>
    </div>
  )
}
