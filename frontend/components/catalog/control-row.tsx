'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TableCell, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronRight, Shield, BookOpen, Link } from 'lucide-react';
import { ComplianceStatus } from './compliance-status';

interface CCI {
  cci: string;
  definition: string;
  complianceStatus?: string;
  complianceNotes?: string;
  assessedBy?: string;
  assessedAt?: string;
}

interface RelatedControl {
  relatedControlId: string;
}

interface NistControl {
  id: number;
  controlId: string;
  name: string;
  controlText: string;
  discussion?: string;
  complianceStatus?: string;
  complianceNotes?: string;
  assessedBy?: string;
  assessedAt?: string;
  createdAt: string;
  updatedAt: string;
  ccis: CCI[];
  relatedControls: RelatedControl[];
}

interface ControlRowProps {
  control: NistControl;
}

export function ControlRow({ control }: ControlRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <>
        <TableRow className="group hover:bg-muted/50">
          <TableCell className="w-[120px]">
            <Badge variant="outline" className="font-mono">
              {control.controlId}
            </Badge>
          </TableCell>
          <TableCell className="max-w-md">
            <div className="font-medium line-clamp-1">{control.name}</div>
          </TableCell>
          <TableCell className="text-center">
            <Badge variant="secondary" className="text-xs">
              {control.ccis.length}
            </Badge>
          </TableCell>
          <TableCell className="text-center">
            <Badge variant="secondary" className="text-xs">
              {control.relatedControls.length}
            </Badge>
          </TableCell>
          <TableCell className="w-[100px]">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start p-2"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="ml-1 text-xs">Details</span>
              </Button>
            </CollapsibleTrigger>
          </TableCell>
        </TableRow>
        
        <CollapsibleContent asChild>
          <TableRow>
            <TableCell colSpan={5} className="p-0">
              <div className="bg-muted/20 border-t">
                <div className="p-6 space-y-6">
                  {/* Control Text */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">Control Requirements</h4>
                    </div>
                    <div className="bg-background rounded-lg p-4 border">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                        {control.controlText}
                      </p>
                    </div>
                  </div>

                  {/* Discussion */}
                  {control.discussion && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-sm">Implementation Guidance</h4>
                      </div>
                      <div className="bg-background rounded-lg p-4 border">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                          {control.discussion}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Related Controls */}
                  {control.relatedControls && control.relatedControls.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Link className="h-4 w-4" />
                        Related Controls
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {control.relatedControls.map((relation, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {relation.relatedControlId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CCIs - Moved below Related Controls with more spacing */}
                  {control.ccis && control.ccis.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        Control Correlation Identifiers (CCIs)
                      </div>
                      <div className="grid gap-4">
                        {control.ccis.map((cci, index) => (
                          <div key={index} className="p-4 bg-muted/50 rounded-lg border">
                            <div className="font-semibold text-sm mb-2 text-primary">{cci.cci}</div>
                            <div className="text-sm text-muted-foreground leading-relaxed mb-3">{cci.definition}</div>
                            <div className="mt-3">
                              <ComplianceStatus
                                currentStatus={cci.complianceStatus as any}
                                notes={cci.complianceNotes}
                                assessedBy={cci.assessedBy}
                                assessedAt={cci.assessedAt}
                                onStatusChange={(status, notes) => {
                                  // TODO: Implement API call to update CCI compliance status
                                  console.log('Update CCI compliance:', cci.cci, status, notes);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Control-level Compliance Status */}
                  <div className="mt-6 pt-6 border-t">
                    <ComplianceStatus
                      currentStatus={control.complianceStatus as any}
                      notes={control.complianceNotes}
                      assessedBy={control.assessedBy}
                      assessedAt={control.assessedAt}
                      onStatusChange={(status, notes) => {
                        // TODO: Implement API call to update control compliance status
                        console.log('Update control compliance:', control.controlId, status, notes);
                      }}
                    />
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}
