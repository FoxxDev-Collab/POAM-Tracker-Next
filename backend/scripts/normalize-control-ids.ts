import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeControlId(controlId: string): string {
  return controlId.replace(/\s*\(\s*/g, '(').replace(/\s*\)\s*/g, ')');
}

async function normalizeControlIds() {
  try {
    console.log('Starting control ID normalization...');

    // Update STIG findings
    const stigFindings = await prisma.stigFinding.findMany({
      where: {
        controlId: { not: null },
      },
      select: {
        id: true,
        controlId: true,
      },
    });

    console.log(`Found ${stigFindings.length} STIG findings with control IDs`);

    let updated = 0;
    for (const finding of stigFindings) {
      if (finding.controlId) {
        const normalized = normalizeControlId(finding.controlId);
        if (normalized !== finding.controlId) {
          await prisma.stigFinding.update({
            where: { id: finding.id },
            data: { controlId: normalized },
          });
          console.log(`Updated finding ${finding.id}: "${finding.controlId}" -> "${normalized}"`);
          updated++;
        }
      }
    }

    console.log(`Updated ${updated} STIG findings`);

    // Update CCI control mappings
    const cciMappings = await prisma.cciControlMapping.findMany();
    console.log(`Found ${cciMappings.length} CCI mappings`);

    let updatedMappings = 0;
    for (const mapping of cciMappings) {
      const normalized = normalizeControlId(mapping.controlId);
      if (normalized !== mapping.controlId) {
        await prisma.cciControlMapping.update({
          where: { id: mapping.id },
          data: { controlId: normalized },
        });
        console.log(`Updated mapping ${mapping.id}: "${mapping.controlId}" -> "${normalized}"`);
        updatedMappings++;
      }
    }

    console.log(`Updated ${updatedMappings} CCI mappings`);

    // Test SC-18(1) after normalization
    const sc18_1_findings = await prisma.stigFinding.findMany({
      where: {
        controlId: 'SC-18(1)',
      },
    });

    console.log(`\\nSC-18(1) findings after normalization: ${sc18_1_findings.length}`);

  } catch (error) {
    console.error('Error normalizing control IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

normalizeControlIds();