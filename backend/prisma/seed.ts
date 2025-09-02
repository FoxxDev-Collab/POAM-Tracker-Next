import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin user exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@poamtracker.mil' }
  });
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  let admin;
  if (existingAdmin) {
    // Update existing admin user
    admin = await prisma.user.update({
      where: { email: 'admin@poamtracker.mil' },
      data: {
        passwordHash: adminPassword,
        active: true,
      },
    });
    console.log('Updated existing admin user');
  } else {
    // Create new admin user
    admin = await prisma.user.create({
      data: {
        email: 'admin@poamtracker.mil',
        name: 'System Administrator',
        role: 'Admin',
        passwordHash: adminPassword,
        active: true,
      },
    });
    console.log('Created new admin user');
  }

  console.log('Seed data created:');
  console.log('- Admin user:', admin.email);
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });