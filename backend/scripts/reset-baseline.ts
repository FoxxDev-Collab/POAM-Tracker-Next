import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetBaseline(packageId?: number) {
  try {
    if (packageId) {
      // Clear baseline for specific package
      const deleted = await prisma.packageControlBaseline.deleteMany({
        where: { packageId },
      });
      console.log(`Cleared ${deleted.count} baseline controls for package ${packageId}`);
    } else {
      // Clear all baselines
      const deleted = await prisma.packageControlBaseline.deleteMany({});
      console.log(`Cleared ${deleted.count} baseline controls from all packages`);
    }
  } catch (error) {
    console.error('Error clearing baseline:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run with package ID from command line argument
const packageId = process.argv[2] ? parseInt(process.argv[2]) : undefined;
resetBaseline(packageId);