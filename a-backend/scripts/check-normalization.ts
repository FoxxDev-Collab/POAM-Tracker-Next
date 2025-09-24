import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNormalization() {
  try {
    // Check for STIG findings with spaces in control IDs
    const spacedFindings = await prisma.stigFinding.findMany({
      where: {
        controlId: {
          contains: ' (',
        },
      },
      select: {
        id: true,
        controlId: true,
      },
      take: 5,
    });

    // Check for CCI mappings with spaces
    const spacedMappings = await prisma.cciControlMapping.findMany({
      where: {
        controlId: {
          contains: ' (',
        },
      },
      select: {
        id: true,
        controlId: true,
      },
      take: 5,
    });

    console.log(`STIG findings with spaces: ${spacedFindings.length > 0 ? spacedFindings.length + ' found' : 'None found'}`);
    console.log(`CCI mappings with spaces: ${spacedMappings.length > 0 ? spacedMappings.length + ' found' : 'None found'}`);

    if (spacedFindings.length > 0 || spacedMappings.length > 0) {
      console.log('\n❌ Normalization needed! Run:');
      console.log('npx tsx scripts/normalize-control-ids.ts');

      if (spacedFindings.length > 0) {
        console.log('\nExample STIG findings:');
        spacedFindings.forEach(f => console.log(`  ${f.id}: "${f.controlId}"`));
      }

      if (spacedMappings.length > 0) {
        console.log('\nExample CCI mappings:');
        spacedMappings.forEach(m => console.log(`  ${m.id}: "${m.controlId}"`));
      }
    } else {
      console.log('\n✅ All control IDs are properly normalized!');
    }

  } catch (error) {
    console.error('Error checking normalization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNormalization();