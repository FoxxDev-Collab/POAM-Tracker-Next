import { MainLayout } from "@/components/layout/main-layout"

export default function NISTRMFLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
