'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, AlertTriangle, FileX, Edit3 } from 'lucide-react';

export type ComplianceStatus = 
  | 'NOT_ASSESSED'
  | 'NC_U'  // Non-Compliant Unofficial
  | 'NC_O'  // Non-Compliant Official
  | 'CU'    // Compliant Unofficial
  | 'CO'    // Compliant Official
  | 'NA_U'  // Not Applicable Unofficial
  | 'NA_O'; // Not Applicable Official

interface ComplianceStatusProps {
  currentStatus?: ComplianceStatus;
  notes?: string;
  assessedBy?: string;
  assessedAt?: string;
  onStatusChange?: (status: ComplianceStatus, notes: string) => void;
  readonly?: boolean;
}

const statusConfig = {
  NOT_ASSESSED: {
    label: 'Not Assessed',
    icon: Clock,
    variant: 'secondary' as const,
    color: 'text-muted-foreground'
  },
  NC_U: {
    label: 'Non-Compliant (Unofficial)',
    icon: XCircle,
    variant: 'destructive' as const,
    color: 'text-red-600'
  },
  NC_O: {
    label: 'Non-Compliant (Official)',
    icon: XCircle,
    variant: 'destructive' as const,
    color: 'text-red-700'
  },
  CU: {
    label: 'Compliant (Unofficial)',
    icon: CheckCircle,
    variant: 'default' as const,
    color: 'text-green-600'
  },
  CO: {
    label: 'Compliant (Official)',
    icon: CheckCircle,
    variant: 'default' as const,
    color: 'text-green-700'
  },
  NA_U: {
    label: 'Not Applicable (Unofficial)',
    icon: FileX,
    variant: 'outline' as const,
    color: 'text-gray-600'
  },
  NA_O: {
    label: 'Not Applicable (Official)',
    icon: FileX,
    variant: 'outline' as const,
    color: 'text-gray-700'
  }
};

export function ComplianceStatus({ 
  currentStatus = 'NOT_ASSESSED', 
  notes = '', 
  assessedBy,
  assessedAt,
  onStatusChange,
  readonly = false 
}: ComplianceStatusProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ComplianceStatus>(currentStatus);
  const [statusNotes, setStatusNotes] = useState(notes);

  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  const handleSave = () => {
    onStatusChange?.(selectedStatus, statusNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setStatusNotes(notes);
    setIsEditing(false);
  };

  if (readonly || !isEditing) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Compliance Status
            </span>
            {!readonly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${config.color}`} />
              <Badge variant={config.variant} className="text-xs">
                {config.label}
              </Badge>
            </div>
            
            {notes && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <strong>Notes:</strong> {notes}
              </div>
            )}
            
            {assessedBy && assessedAt && (
              <div className="text-xs text-muted-foreground">
                Assessed by {assessedBy} on {new Date(assessedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Update Compliance Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Status
            </label>
            <Select value={selectedStatus} onValueChange={(value: ComplianceStatus) => setSelectedStatus(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => {
                  const StatusIcon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-3 w-3 ${config.color}`} />
                        <span className="text-xs">{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Notes (Optional)
            </label>
            <Textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add assessment notes, evidence, or rationale..."
              className="text-xs"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
