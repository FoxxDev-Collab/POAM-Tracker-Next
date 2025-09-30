"use client"

import TopologyDiagramUpload from "../../components/topology-diagram-upload"

interface TopologyTabProps {
  packageId: number
}

export function TopologyTab({ packageId }: TopologyTabProps) {
  return (
    <div className="space-y-6">
      <TopologyDiagramUpload packageId={packageId} />
    </div>
  )
}