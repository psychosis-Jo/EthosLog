export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-2xl px-4">
      {children}
    </div>
  )
} 