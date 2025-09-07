// RMF Center CRUD Test Script
// Run with: node test-rmf-crud.js

const BASE_URL = 'http://localhost:3001';

// Test data
const testPackage = {
  name: `Test Package ${Date.now()}`,
  description: 'Automated test package for CRUD operations',
  systemType: 'MAJOR_APPLICATION',
  operationalStatus: 'DEVELOPMENT',
  impactLevel: 'MODERATE',
  dataClassification: 'CONFIDENTIAL',
  systemBoundary: 'Internal network only',
  interconnections: 'Connected to HR system',
  environmentType: 'Production',
  authorizedOfficialName: 'John Smith',
  authorizedOfficialEmail: 'john.smith@example.com',
  systemOwnerName: 'Jane Doe',
  systemOwnerEmail: 'jane.doe@example.com',
  isssoName: 'Bob Wilson',
  isssoEmail: 'bob.wilson@example.com',
  issmName: 'Alice Johnson',
  issmEmail: 'alice.johnson@example.com',
  confidentialityImpact: 'MODERATE',
  integrityImpact: 'HIGH',
  availabilityImpact: 'LOW',
  complianceFrameworks: ['NIST_800_53'],
  specialRequirements: 'PII handling required',
  rmfStep: 'CATEGORIZE'
};

const testSystem = {
  name: `Test System ${Date.now()}`,
  description: 'Test hardware system',
  hostname: 'test-server.local',
  operatingSystem: 'Ubuntu 22.04 LTS',
  osVersion: '22.04.3',
  ipAddress: '192.168.1.100',
  macAddress: '00:1B:44:11:3A:B7',
  physicalLocation: 'Data Center A, Rack 10',
  assetTag: `IT-${Date.now()}`,
  serialNumber: 'SN123456789',
  manufacturer: 'Dell',
  model: 'PowerEdge R740',
  cpuCores: 16,
  ramGB: 64,
  storageGB: 2000,
  lifecycleStatus: 'Active',
  criticality: 'High',
  environmentType: 'Production'
};

const testGroup = {
  name: `Test Group ${Date.now()}`,
  description: 'Test group for systems',
  type: 'Department'
};

// Helper function for API calls
async function apiCall(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
  }
  
  return data;
}

// Test functions
async function testPackageCRUD() {
  console.log('\n=== Testing Package CRUD ===\n');
  
  try {
    // CREATE
    console.log('1. Creating package...');
    const createdPackage = await apiCall('/api/packages', 'POST', testPackage);
    const packageId = createdPackage.id || createdPackage.item?.id;
    console.log(`✅ Package created with ID: ${packageId}`);
    
    // READ
    console.log('\n2. Reading package...');
    const readPackage = await apiCall(`/api/packages/${packageId}`);
    console.log(`✅ Package retrieved: ${readPackage.name || readPackage.item?.name}`);
    
    // UPDATE
    console.log('\n3. Updating package...');
    const updateData = {
      description: 'Updated description',
      rmfStep: 'SELECT'
    };
    const updatedPackage = await apiCall(`/api/packages/${packageId}`, 'PATCH', updateData);
    console.log(`✅ Package updated`);
    
    // DELETE
    console.log('\n4. Deleting package...');
    await apiCall(`/api/packages/${packageId}`, 'DELETE');
    console.log(`✅ Package deleted`);
    
    return true;
  } catch (error) {
    console.error(`❌ Package CRUD test failed: ${error.message}`);
    return false;
  }
}

async function testSystemCRUD() {
  console.log('\n=== Testing System CRUD ===\n');
  
  try {
    // First create a package to attach systems to
    console.log('Creating parent package...');
    const packageData = await apiCall('/api/packages', 'POST', testPackage);
    const packageId = packageData.id || packageData.item?.id;
    console.log(`✅ Parent package created with ID: ${packageId}`);
    
    // CREATE System
    console.log('\n1. Creating system...');
    const createdSystem = await apiCall(`/api/packages/${packageId}/systems`, 'POST', testSystem);
    const systemId = createdSystem.id || createdSystem.item?.id;
    console.log(`✅ System created with ID: ${systemId}`);
    
    // READ Systems
    console.log('\n2. Reading systems...');
    const systems = await apiCall(`/api/packages/${packageId}/systems`);
    console.log(`✅ Retrieved ${systems.length || systems.items?.length || 0} systems`);
    
    // UPDATE System
    console.log('\n3. Updating system...');
    const updateData = {
      description: 'Updated system description',
      lifecycleStatus: 'Maintenance'
    };
    await apiCall(`/api/packages/${packageId}/systems/${systemId}`, 'PATCH', updateData);
    console.log(`✅ System updated`);
    
    // DELETE System
    console.log('\n4. Deleting system...');
    await apiCall(`/api/packages/${packageId}/systems/${systemId}`, 'DELETE');
    console.log(`✅ System deleted`);
    
    // Clean up package
    await apiCall(`/api/packages/${packageId}`, 'DELETE');
    console.log(`✅ Cleaned up parent package`);
    
    return true;
  } catch (error) {
    console.error(`❌ System CRUD test failed: ${error.message}`);
    return false;
  }
}

async function testGroupCRUD() {
  console.log('\n=== Testing Group CRUD ===\n');
  
  try {
    // First create a package to attach groups to
    console.log('Creating parent package...');
    const packageData = await apiCall('/api/packages', 'POST', testPackage);
    const packageId = packageData.id || packageData.item?.id;
    console.log(`✅ Parent package created with ID: ${packageId}`);
    
    // CREATE Group
    console.log('\n1. Creating group...');
    const createdGroup = await apiCall(`/api/packages/${packageId}/groups`, 'POST', testGroup);
    const groupId = createdGroup.id || createdGroup.item?.id;
    console.log(`✅ Group created with ID: ${groupId}`);
    
    // READ Groups
    console.log('\n2. Reading groups...');
    const groups = await apiCall(`/api/packages/${packageId}/groups`);
    console.log(`✅ Retrieved ${groups.length || groups.items?.length || 0} groups`);
    
    // UPDATE Group
    console.log('\n3. Updating group...');
    const updateData = {
      description: 'Updated group description',
      type: 'Network Segment'
    };
    await apiCall(`/api/packages/${packageId}/groups/${groupId}`, 'PATCH', updateData);
    console.log(`✅ Group updated`);
    
    // DELETE Group
    console.log('\n4. Deleting group...');
    await apiCall(`/api/packages/${packageId}/groups/${groupId}`, 'DELETE');
    console.log(`✅ Group deleted`);
    
    // Clean up package
    await apiCall(`/api/packages/${packageId}`, 'DELETE');
    console.log(`✅ Cleaned up parent package`);
    
    return true;
  } catch (error) {
    console.error(`❌ Group CRUD test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('================================================');
  console.log('       RMF Center CRUD Operations Test');
  console.log('================================================');
  console.log(`\nTesting against: ${BASE_URL}`);
  console.log('Make sure the Next.js dev server is running!');
  
  const results = {
    package: false,
    system: false,
    group: false
  };
  
  // Run tests
  results.package = await testPackageCRUD();
  results.system = await testSystemCRUD();
  results.group = await testGroupCRUD();
  
  // Summary
  console.log('\n================================================');
  console.log('                TEST SUMMARY');
  console.log('================================================\n');
  console.log(`Package CRUD: ${results.package ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`System CRUD:  ${results.system ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Group CRUD:   ${results.group ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('================================================\n');
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});