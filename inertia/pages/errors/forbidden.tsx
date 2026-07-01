type ForbiddenProps = {
  message: string
}

export default function Forbidden({ message }: ForbiddenProps) {
  return (
    <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
    </div>
  )
}
