/**
 * Validation Service Unit Tests
 * 
 * Tests common validators for UUIDs, dates, URLs, RRULEs, and field trimming
 */

const {
  validateUUID,
  validateDateISO8601,
  validateURL,
  validateRRULE,
  trimFields,
  validateTask,
  validateSubtask,
  validateResourceLink,
} = require('../../src/services/validation');

describe('Validation Service - Common Validators', () => {
  
  describe('validateUUID', () => {
    test('should return true for valid UUID v4', () => {
      const validUUIDs = [
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '123e4567-e89b-42d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ];

      validUUIDs.forEach(uuid => {
        expect(validateUUID(uuid)).toBe(true);
      });
    });

    test('should return true for valid UUID v4 with uppercase letters', () => {
      expect(validateUUID('A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11')).toBe(true);
    });

    test('should return false for invalid UUID format', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123-456-789',
        'a0eebc99-9c0b-3ef8-bb6d-6bb9bd380a11', // version 3, not 4
        'a0eebc99-9c0b-5ef8-bb6d-6bb9bd380a11', // version 5, not 4
        'a0eebc999c0b4ef8bb6d6bb9bd380a11', // missing dashes
        '',
      ];

      invalidUUIDs.forEach(uuid => {
        expect(validateUUID(uuid)).toBe(false);
      });
    });

    test('should return false for non-string input', () => {
      expect(validateUUID(123)).toBe(false);
      expect(validateUUID(null)).toBe(false);
      expect(validateUUID(undefined)).toBe(false);
      expect(validateUUID({})).toBe(false);
    });
  });

  describe('validateDateISO8601', () => {
    test('should return true for valid ISO 8601 date formats', () => {
      const validDates = [
        '2024-01-15',
        '2024-12-31',
        '2024-01-15T10:30:00',
        '2024-01-15T10:30:00Z',
        '2024-01-15T10:30:00.123Z',
      ];

      validDates.forEach(date => {
        expect(validateDateISO8601(date)).toBe(true);
      });
    });

    test('should return false for invalid date formats', () => {
      const invalidDates = [
        '01/15/2024', // MM/DD/YYYY format
        '15-01-2024', // DD-MM-YYYY format
        '2024/01/15', // with slashes
        '2024-1-5', // single digit month/day
        '2024-13-01', // invalid month
        '2024-01-32', // invalid day
        'not-a-date',
        '',
      ];

      invalidDates.forEach(date => {
        expect(validateDateISO8601(date)).toBe(false);
      });
    });

    test('should return false for non-string input', () => {
      expect(validateDateISO8601(123)).toBe(false);
      expect(validateDateISO8601(null)).toBe(false);
      expect(validateDateISO8601(undefined)).toBe(false);
      expect(validateDateISO8601(new Date())).toBe(false);
    });

    test('should return false for dates with invalid values', () => {
      // Dates that match the regex but are not valid actual dates
      expect(validateDateISO8601('2024-02-30')).toBe(false); // Feb 30 doesn't exist
    });
  });

  describe('validateURL', () => {
    test('should return true for valid HTTP URLs', () => {
      const validURLs = [
        'http://example.com',
        'https://example.com',
        'https://www.example.com',
        'https://example.com/path/to/resource',
        'https://example.com/path?query=value',
        'https://example.com:8080/path',
        'https://subdomain.example.com',
      ];

      validURLs.forEach(url => {
        expect(validateURL(url)).toBe(true);
      });
    });

    test('should return false for invalid URL formats', () => {
      const invalidURLs = [
        'not-a-url',
        'example.com', // missing protocol
        'www.example.com', // missing protocol
        '/path/to/resource', // relative path
        'ftp://example.com', // unsupported protocol
        'file:///path/to/file', // unsupported protocol
        '',
      ];

      invalidURLs.forEach(url => {
        expect(validateURL(url)).toBe(false);
      });
    });

    test('should return false for non-string input', () => {
      expect(validateURL(123)).toBe(false);
      expect(validateURL(null)).toBe(false);
      expect(validateURL(undefined)).toBe(false);
      expect(validateURL({})).toBe(false);
    });
  });

  describe('validateRRULE', () => {
    test('should return true for valid RRULE formats', () => {
      const validRRULEs = [
        'FREQ=DAILY',
        'FREQ=WEEKLY',
        'FREQ=MONTHLY',
        'FREQ=YEARLY',
        'FREQ=DAILY;INTERVAL=2',
        'FREQ=WEEKLY;BYDAY=MO,WE,FR',
        'FREQ=MONTHLY;BYMONTHDAY=15',
        'FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1',
      ];

      validRRULEs.forEach(rrule => {
        expect(validateRRULE(rrule)).toBe(true);
      });
    });

    test('should return false for invalid RRULE formats', () => {
      const invalidRRULEs = [
        'FREQ=INVALID',
        'DAILY', // missing FREQ=
        'freq=daily', // lowercase
        'INTERVAL=2', // missing FREQ
        'not-an-rrule',
        '',
      ];

      invalidRRULEs.forEach(rrule => {
        expect(validateRRULE(rrule)).toBe(false);
      });
    });

    test('should return false for non-string input', () => {
      expect(validateRRULE(123)).toBe(false);
      expect(validateRRULE(null)).toBe(false);
      expect(validateRRULE(undefined)).toBe(false);
      expect(validateRRULE({})).toBe(false);
    });
  });

  describe('trimFields', () => {
    test('should trim specified string fields', () => {
      const data = {
        name: '  John Doe  ',
        email: '  test@example.com  ',
        age: 30,
      };

      const result = trimFields(data, ['name', 'email']);

      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('test@example.com');
      expect(result.age).toBe(30);
    });

    test('should not modify non-string fields', () => {
      const data = {
        name: '  John Doe  ',
        age: 30,
        active: true,
        metadata: { key: 'value' },
      };

      const result = trimFields(data, ['name', 'age', 'active', 'metadata']);

      expect(result.name).toBe('John Doe');
      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
      expect(result.metadata).toEqual({ key: 'value' });
    });

    test('should handle fields that do not exist in data', () => {
      const data = {
        name: '  John Doe  ',
      };

      const result = trimFields(data, ['name', 'nonExistent']);

      expect(result.name).toBe('John Doe');
      expect(result.nonExistent).toBeUndefined();
    });

    test('should not modify original data object', () => {
      const data = {
        name: '  John Doe  ',
        email: '  test@example.com  ',
      };

      const result = trimFields(data, ['name', 'email']);

      expect(data.name).toBe('  John Doe  ');
      expect(data.email).toBe('  test@example.com  ');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('test@example.com');
    });

    test('should handle empty fields array', () => {
      const data = {
        name: '  John Doe  ',
        email: '  test@example.com  ',
      };

      const result = trimFields(data, []);

      expect(result.name).toBe('  John Doe  ');
      expect(result.email).toBe('  test@example.com  ');
    });

    test('should handle null or undefined data', () => {
      expect(trimFields(null, ['name'])).toBe(null);
      expect(trimFields(undefined, ['name'])).toBe(undefined);
    });

    test('should handle non-object data', () => {
      expect(trimFields('string', ['name'])).toBe('string');
      expect(trimFields(123, ['name'])).toBe(123);
    });
  });

  describe('validateTask', () => {
    test('should validate a complete valid task', () => {
      const validTask = {
        title: 'Complete project proposal',
        priority: 'high',
        status: 'pending',
        notes: 'Need to include budget analysis',
        dueDate: '2024-12-31',
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        recurrenceRule: 'FREQ=WEEKLY',
      };

      const result = validateTask(validTask);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should validate task with only required fields', () => {
      const minimalTask = {
        title: 'Simple task',
        priority: 'medium',
        status: 'pending',
      };

      const result = validateTask(minimalTask);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should trim whitespace from title and notes', () => {
      const taskWithWhitespace = {
        title: '  Task with spaces  ',
        priority: 'low',
        status: 'pending',
        notes: '  Notes with spaces  ',
      };

      const result = validateTask(taskWithWhitespace);

      expect(result.valid).toBe(true);
      expect(result.data.title).toBe('Task with spaces');
      expect(result.data.notes).toBe('Notes with spaces');
    });

    // Title validation tests
    test('should reject task without title', () => {
      const task = {
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title must be a string');
    });

    test('should reject task with empty title after trim', () => {
      const task = {
        title: '   ',
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    test('should reject task with title exceeding 200 characters', () => {
      const task = {
        title: 'a'.repeat(201),
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title must be between 1 and 200 characters');
    });

    test('should accept task with title of exactly 200 characters', () => {
      const task = {
        title: 'a'.repeat(200),
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should reject task with non-string title', () => {
      const task = {
        title: 123,
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title must be a string');
    });

    // Priority validation tests
    test('should reject task without priority', () => {
      const task = {
        title: 'Test task',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Priority must be a string');
    });

    test('should accept all valid priority values', () => {
      const priorities = ['high', 'medium', 'low'];

      priorities.forEach(priority => {
        const task = {
          title: 'Test task',
          priority,
          status: 'pending',
        };

        const result = validateTask(task);

        expect(result.valid).toBe(true);
      });
    });

    test('should reject task with invalid priority', () => {
      const task = {
        title: 'Test task',
        priority: 'urgent',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid priority value');
    });

    test('should reject task with non-string priority', () => {
      const task = {
        title: 'Test task',
        priority: 1,
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Priority must be a string');
    });

    // Status validation tests
    test('should reject task without status', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Status must be a string');
    });

    test('should accept all valid status values', () => {
      const statuses = ['pending', 'completed'];

      statuses.forEach(status => {
        const task = {
          title: 'Test task',
          priority: 'high',
          status,
        };

        const result = validateTask(task);

        expect(result.valid).toBe(true);
      });
    });

    test('should reject task with invalid status', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'in-progress',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid status value');
    });

    test('should reject task with non-string status', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: true,
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Status must be a string');
    });

    // Notes validation tests
    test('should accept task with valid notes', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        notes: 'This is a note',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task without notes (optional)', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task with null notes', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        notes: null,
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should reject task with notes exceeding 2000 characters', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        notes: 'a'.repeat(2001),
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Notes must not exceed 2000 characters');
    });

    test('should accept task with notes of exactly 2000 characters', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        notes: 'a'.repeat(2000),
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should reject task with non-string notes', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        notes: 123,
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Notes must be a string');
    });

    // DueDate validation tests
    test('should accept task with valid dueDate', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        dueDate: '2024-12-31',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task without dueDate (optional)', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task with null dueDate', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        dueDate: null,
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should reject task with invalid dueDate format', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        dueDate: '12/31/2024',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid date format');
    });

    // CategoryId validation tests
    test('should accept task with valid categoryId', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task without categoryId (optional)', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task with null categoryId', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        categoryId: null,
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should reject task with invalid categoryId format', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        categoryId: 'not-a-uuid',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid category ID format');
    });

    // RecurrenceRule validation tests
    test('should accept task with valid recurrenceRule', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        recurrenceRule: 'FREQ=DAILY',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task without recurrenceRule (optional)', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task with null recurrenceRule', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        recurrenceRule: null,
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should reject task with invalid recurrenceRule format', () => {
      const task = {
        title: 'Test task',
        priority: 'high',
        status: 'pending',
        recurrenceRule: 'INVALID',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid recurrence rule format');
    });

    // Edge cases
    test('should reject non-object input', () => {
      const result = validateTask('not an object');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Task data must be an object');
    });

    test('should reject null input', () => {
      const result = validateTask(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Task data must be an object');
    });

    test('should reject undefined input', () => {
      const result = validateTask(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Task data must be an object');
    });
  });
});

  describe('validateSubtask', () => {
    test('should validate a complete valid subtask', () => {
      const validSubtask = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Complete step 1',
        done: false,
      };

      const result = validateSubtask(validSubtask);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should validate subtask with done=true', () => {
      const validSubtask = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Complete step 1',
        done: true,
      };

      const result = validateSubtask(validSubtask);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject subtask without id', () => {
      const subtask = {
        title: 'Complete step 1',
        done: false,
      };

      const result = validateSubtask(subtask);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask id must be a valid UUID');
    });

    test('should reject subtask with invalid id format', () => {
      const subtask = {
        id: 'not-a-uuid',
        title: 'Complete step 1',
        done: false,
      };

      const result = validateSubtask(subtask);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask id must be a valid UUID');
    });

    test('should reject subtask without title', () => {
      const subtask = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        done: false,
      };

      const result = validateSubtask(subtask);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask title must be a string');
    });

    test('should reject subtask with empty title after trim', () => {
      const subtask = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: '   ',
        done: false,
      };

      const result = validateSubtask(subtask);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask title is required');
    });

    test('should reject subtask with non-string title', () => {
      const subtask = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 123,
        done: false,
      };

      const result = validateSubtask(subtask);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask title must be a string');
    });

    test('should reject subtask without done field', () => {
      const subtask = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Complete step 1',
      };

      const result = validateSubtask(subtask);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask done must be a boolean');
    });

    test('should reject subtask with non-boolean done', () => {
      const subtask = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Complete step 1',
        done: 'true',
      };

      const result = validateSubtask(subtask);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask done must be a boolean');
    });

    test('should reject non-object input', () => {
      const result = validateSubtask('not an object');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask must be an object');
    });

    test('should reject null input', () => {
      const result = validateSubtask(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask must be an object');
    });

    test('should reject undefined input', () => {
      const result = validateSubtask(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask must be an object');
    });
  });

  describe('validateResourceLink', () => {
    test('should validate a complete valid resource link', () => {
      const validLink = {
        url: 'https://example.com/resource',
        label: 'Example Resource',
      };

      const result = validateResourceLink(validLink);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should validate resource link with http URL', () => {
      const validLink = {
        url: 'http://example.com/resource',
        label: 'Example Resource',
      };

      const result = validateResourceLink(validLink);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject resource link without url', () => {
      const link = {
        label: 'Example Resource',
      };

      const result = validateResourceLink(link);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource link url must be a string');
    });

    test('should reject resource link with invalid URL format', () => {
      const link = {
        url: 'not-a-valid-url',
        label: 'Example Resource',
      };

      const result = validateResourceLink(link);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid URL format');
    });

    test('should reject resource link with URL missing protocol', () => {
      const link = {
        url: 'example.com/resource',
        label: 'Example Resource',
      };

      const result = validateResourceLink(link);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid URL format');
    });

    test('should reject resource link with non-string URL', () => {
      const link = {
        url: 123,
        label: 'Example Resource',
      };

      const result = validateResourceLink(link);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource link url must be a string');
    });

    test('should reject resource link without label', () => {
      const link = {
        url: 'https://example.com/resource',
      };

      const result = validateResourceLink(link);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource link label must be a string');
    });

    test('should reject resource link with empty label after trim', () => {
      const link = {
        url: 'https://example.com/resource',
        label: '   ',
      };

      const result = validateResourceLink(link);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource link label is required');
    });

    test('should reject resource link with non-string label', () => {
      const link = {
        url: 'https://example.com/resource',
        label: 123,
      };

      const result = validateResourceLink(link);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource link label must be a string');
    });

    test('should reject non-object input', () => {
      const result = validateResourceLink('not an object');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource link must be an object');
    });

    test('should reject null input', () => {
      const result = validateResourceLink(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource link must be an object');
    });

    test('should reject undefined input', () => {
      const result = validateResourceLink(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource link must be an object');
    });
  });

  describe('validateTask with nested structures', () => {
    test('should validate task with valid subtasks array', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        subtasks: [
          {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            title: 'Step 1',
            done: false,
          },
          {
            id: 'b1ffcd11-1d1c-5ef9-cc7e-7cc0ce491b22',
            title: 'Step 2',
            done: true,
          },
        ],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should validate task with empty subtasks array', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        subtasks: [],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should validate task with valid resourceLinks array', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        resourceLinks: [
          {
            url: 'https://example.com/doc1',
            label: 'Documentation',
          },
          {
            url: 'http://example.com/doc2',
            label: 'Reference',
          },
        ],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should validate task with empty resourceLinks array', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        resourceLinks: [],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should validate task with both subtasks and resourceLinks', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        subtasks: [
          {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            title: 'Step 1',
            done: false,
          },
        ],
        resourceLinks: [
          {
            url: 'https://example.com/doc',
            label: 'Documentation',
          },
        ],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should accept task without subtasks (optional)', () => {
      const task = {
        title: 'Simple task',
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task with null subtasks', () => {
      const task = {
        title: 'Simple task',
        priority: 'high',
        status: 'pending',
        subtasks: null,
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task without resourceLinks (optional)', () => {
      const task = {
        title: 'Simple task',
        priority: 'high',
        status: 'pending',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should accept task with null resourceLinks', () => {
      const task = {
        title: 'Simple task',
        priority: 'high',
        status: 'pending',
        resourceLinks: null,
      };

      const result = validateTask(task);

      expect(result.valid).toBe(true);
    });

    test('should reject task with non-array subtasks', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        subtasks: 'not an array',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtasks must be an array');
    });

    test('should reject task with non-array resourceLinks', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        resourceLinks: 'not an array',
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource links must be an array');
    });

    test('should reject task with invalid subtask in array', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        subtasks: [
          {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            title: 'Step 1',
            done: false,
          },
          {
            id: 'invalid-id',
            title: 'Step 2',
            done: true,
          },
        ],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Subtask 1');
      expect(result.error).toContain('id must be a valid UUID');
    });

    test('should reject task with subtask missing required field', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        subtasks: [
          {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            title: 'Step 1',
            // missing 'done' field
          },
        ],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Subtask 0');
      expect(result.error).toContain('done must be a boolean');
    });

    test('should reject task with invalid resourceLink in array', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        resourceLinks: [
          {
            url: 'https://example.com/doc1',
            label: 'Documentation',
          },
          {
            url: 'not-a-url',
            label: 'Reference',
          },
        ],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Resource link 1');
      expect(result.error).toContain('Invalid URL format');
    });

    test('should reject task with resourceLink missing required field', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        resourceLinks: [
          {
            url: 'https://example.com/doc',
            // missing 'label' field
          },
        ],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Resource link 0');
      expect(result.error).toContain('label must be a string');
    });

    test('should reject task when first subtask is invalid', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        subtasks: [
          {
            id: 'invalid-uuid',
            title: 'Step 1',
            done: false,
          },
        ],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Subtask 0: Subtask id must be a valid UUID');
    });

    test('should reject task when first resourceLink is invalid', () => {
      const task = {
        title: 'Project task',
        priority: 'high',
        status: 'pending',
        resourceLinks: [
          {
            url: 'invalid-url',
            label: 'Documentation',
          },
        ],
      };

      const result = validateTask(task);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Resource link 0: Invalid URL format');
    });
  });
});
