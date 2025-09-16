'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Upload, RefreshCw, BookOpen, Shield, AlertCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { ControlRow } from '@/components/catalog/control-row';

interface CCI {
  cci: string;
  definition: string;
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
  createdAt: string;
  updatedAt: string;
  ccis: CCI[];
  relatedControls: RelatedControl[];
}

interface CatalogStats {
  totalControls: number;
  totalCcis: number;
  totalRelations: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ControlsResponse {
  controls: NistControl[];
  pagination: PaginationInfo;
}

// Common control families in NIST SP 800-53
const CONTROL_FAMILIES = [
  { id: 'all', name: 'All Controls', description: 'View all security controls' },
  { id: 'AC', name: 'Access Control', description: 'AC-1 through AC-25' },
  { id: 'AU', name: 'Audit and Accountability', description: 'AU-1 through AU-16' },
  { id: 'AT', name: 'Awareness and Training', description: 'AT-1 through AT-6' },
  { id: 'CM', name: 'Configuration Management', description: 'CM-1 through CM-14' },
  { id: 'CP', name: 'Contingency Planning', description: 'CP-1 through CP-13' },
  { id: 'IA', name: 'Identification and Authentication', description: 'IA-1 through IA-12' },
  { id: 'IR', name: 'Incident Response', description: 'IR-1 through IR-10' },
  { id: 'MA', name: 'Maintenance', description: 'MA-1 through MA-7' },
  { id: 'MP', name: 'Media Protection', description: 'MP-1 through MP-8' },
  { id: 'PE', name: 'Physical and Environmental Protection', description: 'PE-1 through PE-20' },
  { id: 'PL', name: 'Planning', description: 'PL-1 through PL-11' },
  { id: 'PS', name: 'Personnel Security', description: 'PS-1 through PS-8' },
  { id: 'RA', name: 'Risk Assessment', description: 'RA-1 through RA-10' },
  { id: 'SA', name: 'System and Services Acquisition', description: 'SA-1 through SA-23' },
  { id: 'SC', name: 'System and Communications Protection', description: 'SC-1 through SC-51' },
  { id: 'SI', name: 'System and Information Integrity', description: 'SI-1 through SI-23' },
];

export default function ControlCatalogPage() {
  const [controls, setControls] = useState<NistControl[]>([]);
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [activeFamily, setActiveFamily] = useState('all');

  const fetchControls = async (page = 1, search = '', family = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
        ...(family !== 'all' && { family }),
      });

      const response = await fetch(`/api/catalog/controls?${params}`);
      const data = await response.json();

      if (data.success) {
        setControls(data.data.controls);
        setPagination(data.data.pagination);
      } else {
        toast.error('Failed to fetch controls');
      }
    } catch (error) {
      toast.error('Error fetching controls');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/catalog/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      const response = await fetch('/api/catalog/import', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Successfully imported ${data.data.imported} controls`);
        if (data.data.errors.length > 0) {
          toast.warning(`${data.data.errors.length} errors occurred during import`);
        }
        await fetchControls();
        await fetchStats();
      } else {
        toast.error(data.message || 'Failed to import catalog');
      }
    } catch (error) {
      toast.error('Error importing catalog');
      console.error('Error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchControls(1, value, activeFamily);
  };

  const handleFamilyChange = (family: string) => {
    setActiveFamily(family);
    setCurrentPage(1);
    fetchControls(1, searchTerm, family);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchControls(page, searchTerm, activeFamily);
  };

  useEffect(() => {
    fetchControls(1, '', 'all');
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIST Control Catalog</h1>
          <p className="text-muted-foreground">
            Manage and browse NIST SP 800-53 security controls
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={importing}>
                <Upload className="mr-2 h-4 w-4" />
                Import Catalog
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Import NIST Control Catalog</AlertDialogTitle>
                <AlertDialogDescription>
                  This will import the NIST control catalog from the example-data/catalog.json file.
                  Any existing catalog data will be replaced. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleImport} disabled={importing}>
                  {importing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            onClick={() => {
              fetchControls(currentPage, searchTerm, activeFamily);
              fetchStats();
            }}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Controls</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalControls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Control Correlation Identifiers</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCcis}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Control Relations</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRelations}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Control Family Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Control Families
          </CardTitle>
          <CardDescription>
            Browse controls by family or search across all controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search controls across all families..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Family Tabs */}
            <Tabs value={activeFamily} onValueChange={handleFamilyChange} className="w-full">
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-9 gap-1 h-auto p-1">
                {CONTROL_FAMILIES.map((family) => (
                  <TabsTrigger
                    key={family.id}
                    value={family.id}
                    className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {family.id === 'all' ? 'All' : family.id}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            {/* Active Family Info */}
            {activeFamily !== 'all' && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activeFamily}</Badge>
                  <span className="font-medium">
                    {CONTROL_FAMILIES.find(f => f.id === activeFamily)?.name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {CONTROL_FAMILIES.find(f => f.id === activeFamily)?.description}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {activeFamily === 'all' ? 'All Security Controls' : `${activeFamily} - ${CONTROL_FAMILIES.find(f => f.id === activeFamily)?.name}`}
          </CardTitle>
          <CardDescription>
            {pagination && `Showing ${controls.length} of ${pagination.total} controls`}
            {searchTerm && ` matching "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading controls...</p>
              </div>
            </div>
          ) : controls.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No controls found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || activeFamily !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Import the catalog to get started'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[120px] font-semibold">Control ID</TableHead>
                      <TableHead className="font-semibold">Control Name</TableHead>
                      <TableHead className="text-center font-semibold w-[80px]">CCIs</TableHead>
                      <TableHead className="text-center font-semibold w-[100px]">Related</TableHead>
                      <TableHead className="w-[100px] font-semibold">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {controls.map((control) => (
                      <ControlRow key={control.id} control={control} />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages} • {pagination.total} total controls
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
