import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCciMappings() {
  try {
    // Check if CCI mappings exist
    const cciCount = await prisma.cciControlMapping.count();
    console.log(`Total CCI mappings in database: ${cciCount}`);

    if (cciCount === 0) {
      console.log('No CCI mappings found. You need to import the CCI XML file.');
      return;
    }

    // Check for SC-18 related mappings
    const sc18Mappings = await prisma.cciControlMapping.findMany({
      where: {
        controlId: {
          startsWith: 'SC-18',
        },
      },
    });

    console.log(`\\nSC-18 related mappings: ${sc18Mappings.length}`);
    sc18Mappings.forEach(mapping => {
      console.log(`  ${mapping.cci} -> ${mapping.controlId}: ${mapping.definition?.substring(0, 100)}...`);
    });

    // Check STIG findings with controlId
    const stigFindings = await prisma.stigFinding.findMany({
      where: {
        controlId: {
          startsWith: 'SC-18',
        },
      },
      select: {
        id: true,
        controlId: true,
        status: true,
        severity: true,
        cci: true,
        systemId: true,
      },
    });

    console.log(`\\nSTIG findings mapped to SC-18 controls: ${stigFindings.length}`);
    stigFindings.forEach(finding => {
      console.log(`  Finding ${finding.id}: ${finding.controlId} - ${finding.status} (${finding.severity}) - CCI: ${finding.cci}`);
    });

    // Test specific control
    const sc18_1_findings = await prisma.stigFinding.findMany({
      where: {
        controlId: 'SC-18(1)',
      },
    });

    console.log(`\\nSC-18(1) specific findings: ${sc18_1_findings.length}`);
    sc18_1_findings.forEach(finding => {
      console.log(`  ${finding.ruleTitle || finding.ruleId} - ${finding.status} (${finding.severity})`);
    });

  } catch (error) {
    console.error('Error testing CCI mappings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCciMappings();