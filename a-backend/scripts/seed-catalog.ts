#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface CCI {
  cci: string;
  definition: string;
}

interface ControlData {
  name: string;
  controlText: string;
  discussion?: string;
  relatedControls?: string[];
  ccis?: CCI[];
}

interface CatalogData {
  [controlId: string]: ControlData;
}

const prisma = new PrismaClient();

async function clearExistingData() {
  console.log('🗑️  Clearing existing catalog data...');

  // Delete in order to respect foreign key constraints
  await prisma.nistControlCci.deleteMany();
  await prisma.nistControlRelation.deleteMany();
  await prisma.nistControl.deleteMany();

  console.log('✅ Existing data cleared');
}

async function seedCatalog() {
  console.log('🌱 Starting NIST catalog seeding...');

  const catalogPath = path.join(process.cwd(), '..', 'example-data', 'catalog.json');

  if (!fs.existsSync(catalogPath)) {
    console.error(`❌ Catalog file not found at: ${catalogPath}`);
    process.exit(1);
  }

  try {
    // Clear existing data
    await clearExistingData();

    // Read catalog data
    console.log('📖 Reading catalog data...');
    const catalogData: CatalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const controlIds = Object.keys(catalogData);
    console.log(`📊 Found ${controlIds.length} controls to import`);

    // Step 1: Import controls in batches
    console.log('🔄 Step 1: Importing controls...');
    const batchSize = 50;
    let imported = 0;

    for (let i = 0; i < controlIds.length; i += batchSize) {
      const batch = controlIds.slice(i, i + batchSize);
      console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(controlIds.length / batchSize)} (${batch.length} controls)`);

      await prisma.$transaction(
        async (tx) => {
          for (const controlId of batch) {
            const controlData = catalogData[controlId];
            await tx.nistControl.create({
              data: {
                controlId,
                name: controlData.name,
                controlText: controlData.controlText,
                discussion: controlData.discussion || null,
              },
            });
            imported++;
          }
        },
        {
          timeout: 30000, // 30 second timeout per batch
        }
      );
    }

    console.log(`✅ Step 1 complete: ${imported} controls imported`);

    // Step 2: Import CCIs in batches
    console.log('🔄 Step 2: Importing CCIs...');
    let cciCount = 0;

    for (let i = 0; i < controlIds.length; i += batchSize) {
      const batch = controlIds.slice(i, i + batchSize);
      console.log(`  Processing CCI batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(controlIds.length / batchSize)}`);

      await prisma.$transaction(
        async (tx) => {
          for (const controlId of batch) {
            const controlData = catalogData[controlId];

            if (controlData.ccis && controlData.ccis.length > 0) {
              const control = await tx.nistControl.findUnique({
                where: { controlId },
              });

              if (control) {
                for (const cci of controlData.ccis) {
                  await tx.nistControlCci.create({
                    data: {
                      controlId: control.id,
                      cci: cci.cci,
                      definition: cci.definition,
                    },
                  });
                  cciCount++;
                }
              }
            }
          }
        },
        {
          timeout: 30000,
        }
      );
    }

    console.log(`✅ Step 2 complete: ${cciCount} CCIs imported`);

    // Step 3: Import control relationships in batches
    console.log('🔄 Step 3: Importing control relationships...');
    let relationCount = 0;

    for (let i = 0; i < controlIds.length; i += batchSize) {
      const batch = controlIds.slice(i, i + batchSize);
      console.log(`  Processing relationship batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(controlIds.length / batchSize)}`);

      await prisma.$transaction(
        async (tx) => {
          for (const controlId of batch) {
            const controlData = catalogData[controlId];

            if (controlData.relatedControls && controlData.relatedControls.length > 0) {
              const control = await tx.nistControl.findUnique({
                where: { controlId },
              });

              if (control) {
                for (const relatedControlId of controlData.relatedControls) {
                  try {
                    await tx.nistControlRelation.create({
                      data: {
                        sourceControlId: control.id,
                        relatedControlId: relatedControlId.trim(),
                      },
                    });
                    relationCount++;
                  } catch (error) {
                    // Skip if relationship already exists or related control doesn't exist
                    console.warn(`    ⚠️  Skipped relationship ${controlId} -> ${relatedControlId}: ${error.message}`);
                  }
                }
              }
            }
          }
        },
        {
          timeout: 30000,
        }
      );
    }

    console.log(`✅ Step 3 complete: ${relationCount} relationships imported`);

    // Final stats
    const stats = await prisma.nistControl.count();
    const cciStats = await prisma.nistControlCci.count();
    const relationStats = await prisma.nistControlRelation.count();

    console.log('\n🎉 Catalog seeding completed successfully!');
    console.log(`📊 Final statistics:`);
    console.log(`   • Controls: ${stats}`);
    console.log(`   • CCIs: ${cciStats}`);
    console.log(`   • Relationships: ${relationStats}`);

  } catch (error) {
    console.error('❌ Error seeding catalog:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding script
if (require.main === module) {
  seedCatalog()
    .then(() => {
      console.log('✅ Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding script failed:', error);
      process.exit(1);
    });
}

export { seedCatalog };