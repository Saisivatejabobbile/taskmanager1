/**
 * Demo script to test validateTask function
 * Run with: node tests/validateTask-demo.js
 */

const { validateTask } = require('../src/services/validation');

console.log('===== Task Validation Demo =====\n');

// Test 1: Valid complete task
console.log('Test 1: Valid complete task');
const validTask = {
  title: 'Complete project proposal',
  priority: 'high',
  status: 'pending',
  notes: 'Need to include budget analysis',
  dueDate: '2024-12-31',
  categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  recurrenceRule: 'FREQ=WEEKLY',
};
console.log('Input:', JSON.stringify(validTask, null, 2));
console.log('Result:', JSON.stringify(validateTask(validTask), null, 2));
console.log('\n---\n');

// Test 2: Minimal valid task
console.log('Test 2: Minimal valid task (only required fields)');
const minimalTask = {
  title: 'Simple task',
  priority: 'medium',
  status: 'pending',
};
console.log('Input:', JSON.stringify(minimalTask, null, 2));
console.log('Result:', JSON.stringify(validateTask(minimalTask), null, 2));
console.log('\n---\n');

// Test 3: Task with whitespace trimming
console.log('Test 3: Task with whitespace (should be trimmed)');
const taskWithWhitespace = {
  title: '  Task with spaces  ',
  priority: 'low',
  status: 'pending',
  notes: '  Notes with spaces  ',
};
console.log('Input:', JSON.stringify(taskWithWhitespace, null, 2));
const result3 = validateTask(taskWithWhitespace);
console.log('Result:', JSON.stringify(result3, null, 2));
console.log('Title after trim:', result3.data.title);
console.log('Notes after trim:', result3.data.notes);
console.log('\n---\n');

// Test 4: Invalid task - missing title
console.log('Test 4: Invalid task (missing title)');
const invalidTask1 = {
  priority: 'high',
  status: 'pending',
};
console.log('Input:', JSON.stringify(invalidTask1, null, 2));
console.log('Result:', JSON.stringify(validateTask(invalidTask1), null, 2));
console.log('\n---\n');

// Test 5: Invalid task - invalid priority
console.log('Test 5: Invalid task (invalid priority)');
const invalidTask2 = {
  title: 'Test task',
  priority: 'urgent',
  status: 'pending',
};
console.log('Input:', JSON.stringify(invalidTask2, null, 2));
console.log('Result:', JSON.stringify(validateTask(invalidTask2), null, 2));
console.log('\n---\n');

// Test 6: Invalid task - title too long
console.log('Test 6: Invalid task (title exceeds 200 characters)');
const invalidTask3 = {
  title: 'a'.repeat(201),
  priority: 'high',
  status: 'pending',
};
console.log('Input: { title: "a" repeated 201 times, priority: "high", status: "pending" }');
console.log('Result:', JSON.stringify(validateTask(invalidTask3), null, 2));
console.log('\n---\n');

// Test 7: Invalid task - invalid date format
console.log('Test 7: Invalid task (invalid date format)');
const invalidTask4 = {
  title: 'Test task',
  priority: 'high',
  status: 'pending',
  dueDate: '12/31/2024',
};
console.log('Input:', JSON.stringify(invalidTask4, null, 2));
console.log('Result:', JSON.stringify(validateTask(invalidTask4), null, 2));
console.log('\n---\n');

// Test 8: Invalid task - invalid categoryId
console.log('Test 8: Invalid task (invalid categoryId format)');
const invalidTask5 = {
  title: 'Test task',
  priority: 'high',
  status: 'pending',
  categoryId: 'not-a-uuid',
};
console.log('Input:', JSON.stringify(invalidTask5, null, 2));
console.log('Result:', JSON.stringify(validateTask(invalidTask5), null, 2));

console.log('\n===== Demo Complete =====');
