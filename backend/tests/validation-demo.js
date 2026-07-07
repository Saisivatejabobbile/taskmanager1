/**
 * Validation Service Demo
 * 
 * Simple demonstration of the common validators
 * Run with: node tests/validation-demo.js
 */

const {
  validateUUID,
  validateDateISO8601,
  validateURL,
  validateRRULE,
  trimFields,
} = require('../src/services/validation');

console.log('\n=== Validation Service Demo ===\n');

// UUID Validation
console.log('1. UUID Validation:');
console.log('  Valid UUID:', validateUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')); // true
console.log('  Invalid UUID:', validateUUID('not-a-uuid')); // false

// Date Validation
console.log('\n2. ISO 8601 Date Validation:');
console.log('  Valid date (YYYY-MM-DD):', validateDateISO8601('2024-01-15')); // true
console.log('  Valid date (full ISO):', validateDateISO8601('2024-01-15T10:30:00Z')); // true
console.log('  Invalid date:', validateDateISO8601('01/15/2024')); // false
console.log('  Invalid date (Feb 30):', validateDateISO8601('2024-02-30')); // false

// URL Validation
console.log('\n3. URL Validation:');
console.log('  Valid HTTPS URL:', validateURL('https://example.com/path')); // true
console.log('  Valid HTTP URL:', validateURL('http://example.com')); // true
console.log('  Invalid URL (no protocol):', validateURL('example.com')); // false
console.log('  Invalid URL (wrong protocol):', validateURL('ftp://example.com')); // false

// RRULE Validation
console.log('\n4. RRULE Validation:');
console.log('  Valid RRULE (DAILY):', validateRRULE('FREQ=DAILY')); // true
console.log('  Valid RRULE (WEEKLY):', validateRRULE('FREQ=WEEKLY;BYDAY=MO,WE,FR')); // true
console.log('  Invalid RRULE:', validateRRULE('DAILY')); // false

// Field Trimming
console.log('\n5. Field Trimming:');
const data = {
  name: '  John Doe  ',
  email: '  test@example.com  ',
  age: 30,
};
const trimmed = trimFields(data, ['name', 'email']);
console.log('  Original:', data);
console.log('  Trimmed:', trimmed);
console.log('  Original unchanged:', data.name === '  John Doe  ');

console.log('\n=== Demo Complete ===\n');
