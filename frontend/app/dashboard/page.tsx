"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"

type DashboardStats = {
  catI: number;
  catII: number;
  resolvedToday: number;
  pendingReviews: number;
  totalSystems: number;
  totalPackages: number;
};

type RecentActivity = {
  rule_title: string | null;
  severity: string | null;
  status: string | null;
  last_seen: string;
  system_name: string;
  rule_id: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        if (data.stats) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">POAM Tracker Dashboard</h2>
          <p className="text-slate-600">
            Plan of Action and Milestones tracking for comprehensive vulnerability management
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                CAT I Vulnerabilities
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.catI || 0}</div>
              <p className="text-xs text-slate-500">CAT I severity findings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                CAT II Vulnerabilities
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.catII || 0}</div>
              <p className="text-xs text-slate-500">CAT II severity findings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Resolved Today
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.resolvedToday || 0}</div>
              <p className="text-xs text-slate-500">Findings resolved today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Pending Reviews
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.pendingReviews || 0}</div>
              <p className="text-xs text-slate-500">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>
              Latest vulnerability discoveries and remediation activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No recent activity found. Import STIG scan results to see vulnerability data.
                </p>
              ) : (
                recentActivity.map((activity, index) => {
                  const getSeverityColor = (severity: string | null) => {
                    const sev = severity?.toLowerCase() || '';
                    if (sev.includes('cat i')) return 'red';
                    if (sev.includes('cat ii')) return 'orange';  
                    if (sev.includes('cat iii')) return 'yellow';
                    return 'gray';
                  };
                  
                  const getStatusIcon = (status: string | null) => {
                    if (status === 'NotAFinding') return <CheckCircle className="h-5 w-5 text-green-500" />;
                    return <AlertTriangle className="h-5 w-5 text-red-500" />;
                  };
                  
                  const color = getSeverityColor(activity.severity);
                  
                  return (
                    <div key={index} className={`flex items-center space-x-4 p-4 bg-${color}-50 rounded-lg border border-${color}-200`}>
                      {getStatusIcon(activity.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.rule_title || `Rule ${activity.rule_id}`}
                        </p>
                        <p className="text-sm text-slate-500">
                          System: {activity.system_name} • Severity: {activity.severity || 'Unknown'}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(activity.last_seen).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and system operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                <Shield className="h-6 w-6" />
                <span>Run Security Scan</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <AlertTriangle className="h-6 w-6" />
                <span>View Alerts</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <CheckCircle className="h-6 w-6" />
                <span>Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
