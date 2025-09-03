import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@poamtracker.mil';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  
  // Check if admin user exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  let admin;
  if (existingAdmin) {
    // Update existing admin user
    admin = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: adminName,
        passwordHash: hashedPassword,
        active: true,
      },
    });
    console.log('Updated existing admin user');
  } else {
    // Create new admin user
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        role: 'Admin',
        passwordHash: hashedPassword,
        active: true,
      },
    });
    console.log('Created new admin user');
  }

  console.log('Seed data created:');
  console.log('- Admin user:', admin.email);
  console.log('  Password:', adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });