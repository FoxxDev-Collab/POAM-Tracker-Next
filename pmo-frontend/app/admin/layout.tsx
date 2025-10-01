import { TopNav } from "@/components/layout/top-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <TopNav />
      {children}
    </div>
  )
}
