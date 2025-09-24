import {
  PrismaClient,
  UserRole,
  SystemType,
  ImpactLevel,
  AuthorizationStatus,
  ResidualRiskLevel,
  MissionCriticality,
  DataClassification,
  SecurityControlBaseline,
  PoamStatus,
  ContinuousMonitoringStatus,
  RmfStep,
  SystemOperatingSystem,
  SystemArchitecture,
  EncryptionStatus,
  AntivirusStatus,
  LifecycleStatus,
  EnvironmentType,
  SystemCriticality
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log('🧹 Clearing existing test data...');
  await prisma.system.deleteMany();
  await prisma.group.deleteMany();
  await prisma.package.deleteMany();
  await prisma.teamMembership.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany({ where: { email: { not: 'admin@poamtracker.mil' } } });

  // Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'isso.smith@agency.gov',
        firstName: 'John',
        lastName: 'Smith',
        name: 'John Smith',
        role: UserRole.ISSO,
        password: hashedPassword,
        isActive: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'issm.johnson@agency.gov',
        firstName: 'Sarah',
        lastName: 'Johnson',
        name: 'Sarah Johnson',
        role: UserRole.ISSM,
        password: hashedPassword,
        isActive: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'sysadmin.williams@agency.gov',
        firstName: 'Mike',
        lastName: 'Williams',
        name: 'Mike Williams',
        role: UserRole.SysAdmin,
        password: hashedPassword,
        isActive: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'auditor.brown@agency.gov',
        firstName: 'Emily',
        lastName: 'Brown',
        name: 'Emily Brown',
        role: UserRole.Auditor,
        password: hashedPassword,
        isActive: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'isse.davis@agency.gov',
        firstName: 'Robert',
        lastName: 'Davis',
        name: 'Robert Davis',
        role: UserRole.ISSE,
        password: hashedPassword,
        isActive: true,
      }
    }),
  ]);

  const [isso, issm, sysadmin, auditor, isse] = users;

  // Create Teams
  console.log('👥 Creating teams...');
  const securityTeam = await prisma.team.create({
    data: {
      name: 'Security Operations Team',
      description: 'Responsible for security operations and compliance',
      leadUserId: issm.id,
      active: true,
    }
  });

  const infrastructureTeam = await prisma.team.create({
    data: {
      name: 'Infrastructure Team',
      description: 'Manages IT infrastructure and systems',
      leadUserId: sysadmin.id,
      active: true,
    }
  });

  // Add team memberships
  await Promise.all([
    prisma.teamMembership.create({
      data: {
        userId: isso.id,
        teamId: securityTeam.id,
      }
    }),
    prisma.teamMembership.create({
      data: {
        userId: auditor.id,
        teamId: securityTeam.id,
      }
    }),
    prisma.teamMembership.create({
      data: {
        userId: isse.id,
        teamId: infrastructureTeam.id,
      }
    }),
  ]);

  // Create comprehensive ATO Package
  console.log('📦 Creating ATO package...');
  const atoPackage = await prisma.package.create({
    data: {
      name: 'Enterprise Resource Management System',
      description: 'Comprehensive ERM system for agency-wide resource management and planning',

      // RMF Progress
      rmfStep: RmfStep.Assess,
      categorizeComplete: true,
      selectComplete: true,
      implementComplete: true,
      assessComplete: false,
      authorizeComplete: false,
      monitorComplete: false,

      // Team Assignments
      teamId: securityTeam.id,
      systemOwner: 'Director Jane Martinez',
      authorizingOfficial: 'CIO Thomas Anderson',
      issoName: isso.name,
      issmName: issm.name,
      systemAdministrator: sysadmin.name,
      networkAdministrator: 'Network Admin Team',
      databaseAdministrator: 'DBA Team',
      applicationAdministrator: 'App Admin Team',
      securityControlAssessor: auditor.name,

      // System Categorization
      systemType: SystemType.Major_Application,
      confidentialityImpact: ImpactLevel.Moderate,
      integrityImpact: ImpactLevel.High,
      availabilityImpact: ImpactLevel.Moderate,
      overallCategorization: ImpactLevel.High,
      missionCriticality: MissionCriticality.Mission_Essential,
      dataClassification: DataClassification.CUI,

      // Control Selection
      securityControlBaseline: SecurityControlBaseline.High,
      controlSelectionRationale: 'High baseline selected due to integrity impact and mission criticality',
      tailoringDecisions: 'Applied compensating controls for physical security requirements',

      // Authorization Information
      authorizationStatus: AuthorizationStatus.In_Progress,
      authorizationDate: '2023-06-01',
      authorizationExpiry: '2026-06-01',
      riskAssessmentDate: '2024-11-15',
      residualRiskLevel: ResidualRiskLevel.Moderate,

      // Monitoring and Maintenance
      poamStatus: PoamStatus.Open,
      continuousMonitoringStatus: ContinuousMonitoringStatus.Partially_Implemented,
      lastAssessmentDate: '2024-11-15',
      nextAssessmentDate: '2025-02-15',

      // Business Information
      businessOwner: 'Chief Operations Officer',
      businessPurpose: 'Centralized resource planning, financial management, and operational reporting',
      organizationalUnit: 'Information Technology Division',
      physicalLocation: 'Primary Data Center - Building A',

      onboardingComplete: false,
    }
  });

  // Create Groups
  console.log('🗂️ Creating groups...');
  const groups = await Promise.all([
    prisma.group.create({
      data: {
        packageId: atoPackage.id,
        name: 'Production Servers',
        description: 'Critical production servers for the ERM system',
      }
    }),
    prisma.group.create({
      data: {
        packageId: atoPackage.id,
        name: 'Development Environment',
        description: 'Development and testing servers for the ERM system',
      }
    }),
  ]);

  const [prodGroup, devGroup] = groups;

  // Create Systems for Production Group
  console.log('🖥️ Creating systems...');
  const prodSystems = await Promise.all([
    // Web Server
    prisma.system.create({
      data: {
        packageId: atoPackage.id,
        groupId: prodGroup.id,
        name: 'ERM-WEB-PROD-01',
        hostname: 'erm-web-prod-01.agency.gov',
        description: 'Primary web application server',
        ipAddress: '10.20.30.101',
        macAddress: '00:1B:44:11:3A:B7',
        subnetMask: '255.255.255.0',
        defaultGateway: '10.20.30.1',
        dnsServers: JSON.stringify(['10.20.1.10', '10.20.1.11']),
        operatingSystem: SystemOperatingSystem.RHEL_8,
        osVersion: '8.6',
        architecture: SystemArchitecture.x86_64,
        cpuCores: 16,
        ramGB: 32,
        storageGB: 500,
        classification: DataClassification.CUI,
        encryptionStatus: EncryptionStatus.Fully_Encrypted,
        patchLevel: 'Current - November 2024',
        antivirusStatus: AntivirusStatus.Installed_Current,
        assetTag: 'WEB-2023-0101',
        serialNumber: 'VMW-WEB-PROD-01',
        manufacturer: 'VMware',
        model: 'Virtual Machine',
        purchaseDate: '2023-01-15',
        warrantyExpiry: '2026-01-15',
        lifecycleStatus: LifecycleStatus.Active,
        primaryContact: sysadmin.name,
        backupContact: 'Infrastructure Team',
        vendor: 'VMware',
        supportContract: 'ENT-SUPPORT-2024',
        supportExpiry: '2025-12-31',
        physicalLocation: 'Data Center A - Rack 15',
        rackLocation: 'U20-24',
        datacenter: 'Primary DC',
        environmentType: EnvironmentType.Production,
        businessFunction: 'Web Application Hosting',
        criticality: SystemCriticality.Critical,
        backupSchedule: 'Daily at 2:00 AM',
        maintenanceWindow: 'Sunday 2:00-6:00 AM',
        lastInventoryDate: '2024-11-01',
        complianceNotes: 'STIG compliant, last scan 2024-11-10',
      }
    }),
    // Database Server
    prisma.system.create({
      data: {
        packageId: atoPackage.id,
        groupId: prodGroup.id,
        name: 'ERM-DB-PROD-01',
        hostname: 'erm-db-prod-01.agency.gov',
        description: 'Primary database server (PostgreSQL)',
        ipAddress: '10.20.30.201',
        macAddress: '00:1B:44:11:3A:B8',
        subnetMask: '255.255.255.0',
        defaultGateway: '10.20.30.1',
        dnsServers: JSON.stringify(['10.20.1.10', '10.20.1.11']),
        operatingSystem: SystemOperatingSystem.RHEL_8,
        osVersion: '8.6',
        architecture: SystemArchitecture.x86_64,
        cpuCores: 32,
        ramGB: 128,
        storageGB: 2000,
        classification: DataClassification.CUI,
        encryptionStatus: EncryptionStatus.Fully_Encrypted,
        patchLevel: 'Current - November 2024',
        antivirusStatus: AntivirusStatus.Not_Applicable,
        assetTag: 'DB-2023-0201',
        serialNumber: 'VMW-DB-PROD-01',
        manufacturer: 'VMware',
        model: 'Virtual Machine',
        purchaseDate: '2023-01-15',
        warrantyExpiry: '2026-01-15',
        lifecycleStatus: LifecycleStatus.Active,
        primaryContact: 'DBA Team',
        backupContact: sysadmin.name,
        vendor: 'VMware',
        supportContract: 'ENT-SUPPORT-2024',
        supportExpiry: '2025-12-31',
        physicalLocation: 'Data Center A - Rack 16',
        rackLocation: 'U10-18',
        datacenter: 'Primary DC',
        environmentType: EnvironmentType.Production,
        businessFunction: 'Database Services',
        criticality: SystemCriticality.Critical,
        backupSchedule: 'Continuous replication, Daily snapshots',
        maintenanceWindow: 'Sunday 2:00-6:00 AM',
        lastInventoryDate: '2024-11-01',
        complianceNotes: 'Database STIG applied, encrypted at rest and in transit',
      }
    }),
    // Application Server
    prisma.system.create({
      data: {
        packageId: atoPackage.id,
        groupId: prodGroup.id,
        name: 'ERM-APP-PROD-01',
        hostname: 'erm-app-prod-01.agency.gov',
        description: 'Application server - Business Logic Tier',
        ipAddress: '10.20.30.301',
        macAddress: '00:1B:44:11:3A:B9',
        subnetMask: '255.255.255.0',
        defaultGateway: '10.20.30.1',
        dnsServers: JSON.stringify(['10.20.1.10', '10.20.1.11']),
        operatingSystem: SystemOperatingSystem.Windows_Server_2019,
        osVersion: 'Standard',
        architecture: SystemArchitecture.x86_64,
        cpuCores: 24,
        ramGB: 64,
        storageGB: 750,
        classification: DataClassification.CUI,
        encryptionStatus: EncryptionStatus.Fully_Encrypted,
        patchLevel: 'Current - November 2024 Cumulative Update',
        antivirusStatus: AntivirusStatus.Installed_Current,
        assetTag: 'APP-2023-0301',
        serialNumber: 'VMW-APP-PROD-01',
        manufacturer: 'VMware',
        model: 'Virtual Machine',
        purchaseDate: '2023-01-15',
        warrantyExpiry: '2026-01-15',
        lifecycleStatus: LifecycleStatus.Active,
        primaryContact: 'App Admin Team',
        backupContact: sysadmin.name,
        vendor: 'Microsoft',
        supportContract: 'MS-EA-2024',
        supportExpiry: '2025-12-31',
        physicalLocation: 'Data Center A - Rack 15',
        rackLocation: 'U25-30',
        datacenter: 'Primary DC',
        environmentType: EnvironmentType.Production,
        businessFunction: 'Application Services',
        criticality: SystemCriticality.Critical,
        backupSchedule: 'Daily at 3:00 AM',
        maintenanceWindow: 'Sunday 2:00-6:00 AM',
        lastInventoryDate: '2024-11-01',
        complianceNotes: 'Windows Server 2019 STIG applied',
      }
    }),
  ]);

  // Create Systems for Development Group
  const devSystems = await Promise.all([
    // Dev Web Server
    prisma.system.create({
      data: {
        packageId: atoPackage.id,
        groupId: devGroup.id,
        name: 'ERM-WEB-DEV-01',
        hostname: 'erm-web-dev-01.agency.gov',
        description: 'Development web server',
        ipAddress: '10.20.40.101',
        macAddress: '00:1B:44:11:3A:C1',
        subnetMask: '255.255.255.0',
        defaultGateway: '10.20.40.1',
        dnsServers: JSON.stringify(['10.20.1.10', '10.20.1.11']),
        operatingSystem: SystemOperatingSystem.Ubuntu_22_04_LTS,
        osVersion: '22.04.3 LTS',
        architecture: SystemArchitecture.x86_64,
        cpuCores: 8,
        ramGB: 16,
        storageGB: 200,
        classification: DataClassification.Unclassified,
        encryptionStatus: EncryptionStatus.Partially_Encrypted,
        patchLevel: 'Current - November 2024',
        antivirusStatus: AntivirusStatus.Installed_Current,
        assetTag: 'DEV-2023-0101',
        serialNumber: 'VMW-WEB-DEV-01',
        manufacturer: 'VMware',
        model: 'Virtual Machine',
        purchaseDate: '2023-03-01',
        warrantyExpiry: '2026-03-01',
        lifecycleStatus: LifecycleStatus.Development,
        primaryContact: isse.name,
        backupContact: 'Development Team',
        vendor: 'Canonical',
        supportContract: 'Ubuntu Advantage',
        supportExpiry: '2025-12-31',
        physicalLocation: 'Data Center B - Rack 5',
        rackLocation: 'U15-18',
        datacenter: 'Secondary DC',
        environmentType: EnvironmentType.Development,
        businessFunction: 'Development and Testing',
        criticality: SystemCriticality.Low,
        backupSchedule: 'Weekly',
        maintenanceWindow: 'Any time with notice',
        lastInventoryDate: '2024-11-01',
        complianceNotes: 'Development environment - reduced controls',
      }
    }),
    // Dev Database Server
    prisma.system.create({
      data: {
        packageId: atoPackage.id,
        groupId: devGroup.id,
        name: 'ERM-DB-DEV-01',
        hostname: 'erm-db-dev-01.agency.gov',
        description: 'Development database server',
        ipAddress: '10.20.40.201',
        macAddress: '00:1B:44:11:3A:C2',
        subnetMask: '255.255.255.0',
        defaultGateway: '10.20.40.1',
        dnsServers: JSON.stringify(['10.20.1.10', '10.20.1.11']),
        operatingSystem: SystemOperatingSystem.CentOS_8,
        osVersion: '8.5',
        architecture: SystemArchitecture.x86_64,
        cpuCores: 16,
        ramGB: 32,
        storageGB: 500,
        classification: DataClassification.Unclassified,
        encryptionStatus: EncryptionStatus.Not_Encrypted,
        patchLevel: 'November 2024',
        antivirusStatus: AntivirusStatus.Not_Applicable,
        assetTag: 'DEV-2023-0201',
        serialNumber: 'VMW-DB-DEV-01',
        manufacturer: 'VMware',
        model: 'Virtual Machine',
        purchaseDate: '2023-03-01',
        warrantyExpiry: '2026-03-01',
        lifecycleStatus: LifecycleStatus.Development,
        primaryContact: 'Development DBA',
        backupContact: isse.name,
        vendor: 'Red Hat',
        supportContract: 'Developer Support',
        supportExpiry: '2025-12-31',
        physicalLocation: 'Data Center B - Rack 5',
        rackLocation: 'U19-22',
        datacenter: 'Secondary DC',
        environmentType: EnvironmentType.Development,
        businessFunction: 'Development Database',
        criticality: SystemCriticality.Low,
        backupSchedule: 'Daily snapshots',
        maintenanceWindow: 'Any time with notice',
        lastInventoryDate: '2024-11-01',
        complianceNotes: 'Development environment - test data only',
      }
    }),
    // Test Server
    prisma.system.create({
      data: {
        packageId: atoPackage.id,
        groupId: devGroup.id,
        name: 'ERM-TEST-01',
        hostname: 'erm-test-01.agency.gov',
        description: 'Integration testing server',
        ipAddress: '10.20.40.301',
        macAddress: '00:1B:44:11:3A:C3',
        subnetMask: '255.255.255.0',
        defaultGateway: '10.20.40.1',
        dnsServers: JSON.stringify(['10.20.1.10', '10.20.1.11']),
        operatingSystem: SystemOperatingSystem.Docker_Engine,
        osVersion: '24.0.7',
        architecture: SystemArchitecture.x86_64,
        cpuCores: 12,
        ramGB: 24,
        storageGB: 300,
        classification: DataClassification.Unclassified,
        encryptionStatus: EncryptionStatus.Partially_Encrypted,
        patchLevel: 'Current',
        antivirusStatus: AntivirusStatus.Installed_Current,
        assetTag: 'TEST-2023-0301',
        serialNumber: 'VMW-TEST-01',
        manufacturer: 'VMware',
        model: 'Virtual Machine',
        purchaseDate: '2023-03-01',
        warrantyExpiry: '2026-03-01',
        lifecycleStatus: LifecycleStatus.Testing,
        primaryContact: 'QA Team',
        backupContact: isse.name,
        vendor: 'Docker Inc',
        supportContract: 'Community Support',
        supportExpiry: 'N/A',
        physicalLocation: 'Data Center B - Rack 5',
        rackLocation: 'U23-26',
        datacenter: 'Secondary DC',
        environmentType: EnvironmentType.Testing,
        businessFunction: 'Automated Testing and CI/CD',
        criticality: SystemCriticality.Medium,
        backupSchedule: 'Weekly',
        maintenanceWindow: 'Any time with notice',
        lastInventoryDate: '2024-11-01',
        complianceNotes: 'Container-based testing environment',
      }
    }),
  ]);


  console.log('\n✅ Comprehensive seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Teams: 2`);
  console.log(`  - ATO Package: 1 (${atoPackage.name})`);
  console.log(`  - Groups: ${groups.length}`);
  console.log(`  - Systems: ${prodSystems.length + devSystems.length}`);
  console.log('\n🔑 Login Credentials:');
  console.log('  All users: password123');
  console.log('  - isso.smith@agency.gov (ISSO)');
  console.log('  - issm.johnson@agency.gov (ISSM)');
  console.log('  - sysadmin.williams@agency.gov (SysAdmin)');
  console.log('  - auditor.brown@agency.gov (Auditor)');
  console.log('  - isse.davis@agency.gov (ISSE)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });