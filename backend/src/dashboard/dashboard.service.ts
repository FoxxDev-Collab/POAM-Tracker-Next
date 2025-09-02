import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Get CAT I and CAT II findings count
    const [catI, catII] = await Promise.all([
      this.prisma.stigFinding.count({
        where: { severity: 'high' }
      }),
      this.prisma.stigFinding.count({
        where: { severity: 'medium' }
      })
    ]);

    // Get resolved today (using current date)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const resolvedToday = await this.prisma.stigFinding.count({
      where: {
        status: 'NotAFinding',
        lastSeen: {
          gte: startOfDay
        }
      }
    });

    // Get pending reviews
    const pendingReviews = await this.prisma.stigFinding.count({
      where: { status: 'Open' }
    });

    // Get total systems and packages
    const [totalSystems, totalPackages] = await Promise.all([
      this.prisma.system.count(),
      this.prisma.package.count()
    ]);

    return {
      stats: {
        catI,
        catII,
        resolvedToday,
        pendingReviews,
        totalSystems,
        totalPackages
      },
      recentActivity: await this.getRecentActivity()
    };
  }

  private async getRecentActivity() {
    return this.prisma.stigFinding.findMany({
      take: 10,
      orderBy: { lastSeen: 'desc' },
      select: {
        ruleTitle: true,
        severity: true,
        status: true,
        lastSeen: true,
        ruleId: true,
        system: {
          select: {
            name: true
          }
        }
      }
    }).then(findings => 
      findings.map(finding => ({
        rule_title: finding.ruleTitle,
        severity: finding.severity,
        status: finding.status,
        last_seen: finding.lastSeen.toISOString(),
        system_name: finding.system.name,
        rule_id: finding.ruleId
      }))
    );
  }
}
