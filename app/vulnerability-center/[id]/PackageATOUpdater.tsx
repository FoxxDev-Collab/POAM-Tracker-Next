"use client"

import { ATODetails } from "@/components/packages/ato-details"
import type { PackageRow } from "@/lib/db"
import { useRouter } from "next/navigation"

interface PackageATOUpdaterProps {
  packageData: PackageRow
}

export default function PackageATOUpdater({ packageData }: PackageATOUpdaterProps) {
  const router = useRouter()

  async function handleUpdate(data: Partial<PackageRow>) {
    const response = await fetch(`/api/packages/${packageData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update package")
    }

    router.refresh()
  }

  return <ATODetails packageData={packageData} onUpdate={handleUpdate} />
}