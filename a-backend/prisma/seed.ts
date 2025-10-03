import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create PMO 1: Cyber Operations
  console.log('Creating PMO 1: Cyber Operations...');
  const pmo1 = await prisma.pmo.upsert({
    where: { name: 'Cyber Operations' },
    update: {},
    create: {
      name: 'Cyber Operations',
      description: 'Cybersecurity and operations management',
      isActive: true,
    },
  });

  // Create PMO 2: Enterprise IT
  console.log('Creating PMO 2: Enterprise IT...');
  const pmo2 = await prisma.pmo.upsert({
    where: { name: 'Enterprise IT' },
    update: {},
    create: {
      name: 'Enterprise IT',
      description: 'Enterprise IT infrastructure and services',
      isActive: true,
    },
  });

  // Create users for PMO 1
  console.log('\nCreating users for Cyber Operations...');
  const alice = await prisma.user.upsert({
    where: { email: 'alice.admin@cyber.mil' },
    update: { pmoId: pmo1.id },
    create: {
      firstName: 'Alice',
      lastName: 'Anderson',
      name: 'Alice Anderson',
      email: 'alice.admin@cyber.mil',
      role: 'Admin',
      password: hashedPassword,
      pmoId: pmo1.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'bob.issm@cyber.mil' },
    update: { pmoId: pmo1.id },
    create: {
      firstName: 'Bob',
      lastName: 'Brown',
      name: 'Bob Brown',
      email: 'bob.issm@cyber.mil',
      role: 'ISSM',
      password: hashedPassword,
      pmoId: pmo1.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'carol.isso@cyber.mil' },
    update: { pmoId: pmo1.id },
    create: {
      firstName: 'Carol',
      lastName: 'Chen',
      name: 'Carol Chen',
      email: 'carol.isso@cyber.mil',
      role: 'ISSO',
      password: hashedPassword,
      pmoId: pmo1.id,
      isActive: true,
    },
  });

  // Create users for PMO 2
  console.log('Creating users for Enterprise IT...');
  const david = await prisma.user.upsert({
    where: { email: 'david.admin@enterprise.mil' },
    update: { pmoId: pmo2.id },
    create: {
      firstName: 'David',
      lastName: 'Davis',
      name: 'David Davis',
      email: 'david.admin@enterprise.mil',
      role: 'Admin',
      password: hashedPassword,
      pmoId: pmo2.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'emma.sysadmin@enterprise.mil' },
    update: { pmoId: pmo2.id },
    create: {
      firstName: 'Emma',
      lastName: 'Evans',
      name: 'Emma Evans',
      email: 'emma.sysadmin@enterprise.mil',
      role: 'SysAdmin',
      password: hashedPassword,
      pmoId: pmo2.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'frank.auditor@enterprise.mil' },
    update: { pmoId: pmo2.id },
    create: {
      firstName: 'Frank',
      lastName: 'Fischer',
      name: 'Frank Fischer',
      email: 'frank.auditor@enterprise.mil',
      role: 'Auditor',
      password: hashedPassword,
      pmoId: pmo2.id,
      isActive: true,
    },
  });

  // Create Teams for each PMO
  console.log('\nCreating teams...');
  const team1 = await prisma.team.create({
    data: {
      name: 'Cyber Operations Team',
      description: 'Security and operations team for Cyber Operations PMO',
      leadUserId: alice.id,
      active: true,
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'Enterprise IT Team',
      description: 'Infrastructure team for Enterprise IT PMO',
      leadUserId: david.id,
      active: true,
    },
  });

  // Create ATO Package for PMO 1
  console.log('\nCreating ATO Package for Cyber Operations...');
  await prisma.package.create({
    data: {
      name: 'Cyber Defense Platform',
      description: 'Enterprise cybersecurity defense and monitoring platform',
      teamId: team1.id,
      
      // RMF Progress - Beginning stages
      rmfStep: 'Categorize',
      categorizeComplete: true,
      selectComplete: false,
      implementComplete: false,
      assessComplete: false,
      authorizeComplete: false,
      monitorComplete: false,
      
      // System Categorization
      systemType: 'Major_Application',
      confidentialityImpact: 'Moderate',
      integrityImpact: 'High',
      availabilityImpact: 'Moderate',
      overallCategorization: 'High',
      
      onboardingComplete: false,
    },
  });

  // Create ATO Package for PMO 2
  console.log('Creating ATO Package for Enterprise IT...');
  await prisma.package.create({
    data: {
      name: 'Enterprise Resource Management System',
      description: 'Core ERP system for resource planning and management',
      teamId: team2.id,
      
      // RMF Progress - Beginning stages
      rmfStep: 'Select',
      categorizeComplete: true,
      selectComplete: false,
      implementComplete: false,
      assessComplete: false,
      authorizeComplete: false,
      monitorComplete: false,
      
      // System Categorization
      systemType: 'Major_Application',
      confidentialityImpact: 'Moderate',
      integrityImpact: 'Moderate',
      availabilityImpact: 'High',
      overallCategorization: 'Moderate',
      
      onboardingComplete: false,
    },
  });

  console.log('\n✅ Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('  - 2 PMOs created');
  console.log('  - 6 users created (3 per PMO)');
  console.log('  - 2 teams created (1 per PMO)');
  console.log('  - 2 ATO packages created (1 per PMO)');
  console.log('  - Default password: password123\n');
  console.log('🔑 Login credentials:');
  console.log('\nCyber Operations PMO:');
  console.log('  - alice.admin@cyber.mil (Admin, Team Lead)');
  console.log('  - bob.issm@cyber.mil (ISSM)');
  console.log('  - carol.isso@cyber.mil (ISSO)');
  console.log('  📦 Package: Cyber Defense Platform (Categorize step)');
  console.log('\nEnterprise IT PMO:');
  console.log('  - david.admin@enterprise.mil (Admin, Team Lead)');
  console.log('  - emma.sysadmin@enterprise.mil (SysAdmin)');
  console.log('  - frank.auditor@enterprise.mil (Auditor)');
  console.log('  📦 Package: Enterprise Resource Management System (Select step)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
