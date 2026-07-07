/**
 * Validation Service
 * 
 * Provides input validation for authentication requests and CRUD operations.
 * Uses RFC 5322 compliant email validation.
 */

// RFC 5322 compliant email regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// UUID v4 format regex
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ISO 8601 date format regex (supports YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss, YYYY-MM-DDTHH:mm:ss.sssZ)
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;

// Basic RRULE format check (starts with FREQ=)
const RRULE_REGEX = /^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/;

const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateEmail(email) {
  // Check type
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  // Trim whitespace
  const trimmedEmail = email.trim();

  // Check if empty
  if (!trimmedEmail) {
    return { valid: false, error: 'Email is required' };
  }

  // Check format
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate password requirements
 * 
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validatePassword(password) {
  // Check type
  if (typeof password !== 'string') {
    return { valid: false, error: 'Password must be a string' };
  }

  // Check if empty
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  // Check minimum length
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  return { valid: true };
}

/**
 * Validate name field
 * 
 * @param {string} name - Name to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateName(name) {
  // Check type
  if (typeof name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }

  // Trim whitespace
  const trimmedName = name.trim();

  // Check if empty after trim
  if (!trimmedName) {
    return { valid: false, error: 'Name is required' };
  }

  return { valid: true };
}

/**
 * Validate registration request data
 * 
 * @param {object} data - Registration data { name, email, password }
 * @returns {object} - { valid: boolean, error?: string, data?: object }
 */
function validateRegistration(data) {
  const { name, email, password } = data || {};

  // Validate name
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  // Return sanitized data
  return {
    valid: true,
    data: {
      name: name.trim(),
      email: email.trim(),
      password,
    },
  };
}

/**
 * Validate login request data
 * 
 * @param {object} data - Login data { email, password }
 * @returns {object} - { valid: boolean, error?: string, data?: object }
 */
function validateLogin(data) {
  const { email, password } = data || {};

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }

  // Return sanitized data
  return {
    valid: true,
    data: {
      email: email.trim(),
      password,
    },
  };
}

/**
 * Validate UUID v4 format
 * 
 * @param {string} id - UUID to validate
 * @returns {boolean} - true if valid UUID v4, false otherwise
 */
function validateUUID(id) {
  if (typeof id !== 'string') {
    return false;
  }
  return UUID_V4_REGEX.test(id);
}

/**
 * Validate ISO 8601 date string format
 * 
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - true if valid ISO 8601 format, false otherwise
 */
function validateDateISO8601(dateString) {
  if (typeof dateString !== 'string') {
    return false;
  }
  
  // Check format with regex
  if (!ISO_8601_REGEX.test(dateString)) {
    return false;
  }
  
  // Verify it's a valid date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Verify the date string converts back to the same value
  // This catches cases like '2024-02-30' which JS normalizes to '2024-03-01'
  const isoString = date.toISOString();
  const inputDate = dateString.includes('T') ? dateString : dateString + 'T00:00:00.000Z';
  
  // For simple date format (YYYY-MM-DD), check if the year, month, and day match
  if (!dateString.includes('T')) {
    const [year, month, day] = dateString.split('-').map(Number);
    return date.getUTCFullYear() === year && 
           date.getUTCMonth() + 1 === month && 
           date.getUTCDate() === day;
  }
  
  return true;
}

/**
 * Validate URL format
 * 
 * @param {string} urlString - URL to validate
 * @returns {boolean} - true if valid URL, false otherwise
 */
function validateURL(urlString) {
  if (typeof urlString !== 'string') {
    return false;
  }
  
  try {
    const url = new URL(urlString);
    // Ensure it has a valid protocol (http or https)
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Validate RRULE string format (basic check)
 * 
 * @param {string} rruleString - RRULE string to validate
 * @returns {boolean} - true if valid RRULE format, false otherwise
 */
function validateRRULE(rruleString) {
  if (typeof rruleString !== 'string') {
    return false;
  }
  
  // Basic check: must start with FREQ= followed by a valid frequency
  return RRULE_REGEX.test(rruleString);
}

/**
 * Trim whitespace from specified string fields in data object
 * 
 * @param {object} data - Data object to process
 * @param {string[]} fields - Array of field names to trim
 * @returns {object} - New object with trimmed fields
 */
function trimFields(data, fields) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const trimmed = { ...data };
  
  for (const field of fields) {
    if (typeof trimmed[field] === 'string') {
      trimmed[field] = trimmed[field].trim();
    }
  }
  
  return trimmed;
}

/**
 * Validate Subtask data structure
 * 
 * @param {object} subtask - Subtask object to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateSubtask(subtask) {
  if (!subtask || typeof subtask !== 'object') {
    return { valid: false, error: 'Subtask must be an object' };
  }

  const { id, title, done } = subtask;

  // Validate required field: id
  if (!validateUUID(id)) {
    return { valid: false, error: 'Subtask id must be a valid UUID' };
  }

  // Validate required field: title
  if (typeof title !== 'string') {
    return { valid: false, error: 'Subtask title must be a string' };
  }
  if (!title.trim()) {
    return { valid: false, error: 'Subtask title is required' };
  }

  // Validate required field: done
  if (typeof done !== 'boolean') {
    return { valid: false, error: 'Subtask done must be a boolean' };
  }

  return { valid: true };
}

/**
 * Validate Resource Link data structure
 * 
 * @param {object} link - Resource link object to validate
 * @returns {object} - { valid: boolean, error?: string }
 */
function validateResourceLink(link) {
  if (!link || typeof link !== 'object') {
    return { valid: false, error: 'Resource link must be an object' };
  }

  const { url, label } = link;

  // Validate required field: url
  if (typeof url !== 'string') {
    return { valid: false, error: 'Resource link url must be a string' };
  }
  if (!validateURL(url)) {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Validate required field: label
  if (typeof label !== 'string') {
    return { valid: false, error: 'Resource link label must be a string' };
  }
  if (!label.trim()) {
    return { valid: false, error: 'Resource link label is required' };
  }

  return { valid: true };
}

/**
 * Validate Task data
 * 
 * @param {object} data - Task data to validate
 * @returns {object} - { valid: boolean, error?: string, data?: object }
 */
function validateTask(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Task data must be an object' };
  }

  // Trim whitespace from string fields
  const trimmed = trimFields(data, ['title', 'notes']);
  const { title, priority, status, notes, dueDate, categoryId, recurrenceRule, subtasks, resourceLinks } = trimmed;

  // Validate required field: title
  if (typeof title !== 'string') {
    return { valid: false, error: 'Title must be a string' };
  }
  if (!title) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length < 1 || title.length > 200) {
    return { valid: false, error: 'Title must be between 1 and 200 characters' };
  }

  // Validate required field: priority
  if (typeof priority !== 'string') {
    return { valid: false, error: 'Priority must be a string' };
  }
  const validPriorities = ['high', 'medium', 'low'];
  if (!validPriorities.includes(priority)) {
    return { valid: false, error: 'Invalid priority value' };
  }

  // Validate required field: status
  if (typeof status !== 'string') {
    return { valid: false, error: 'Status must be a string' };
  }
  const validStatuses = ['pending', 'completed'];
  if (!validStatuses.includes(status)) {
    return { valid: false, error: 'Invalid status value' };
  }

  // Validate optional field: notes
  if (notes !== undefined && notes !== null) {
    if (typeof notes !== 'string') {
      return { valid: false, error: 'Notes must be a string' };
    }
    if (notes.length > 2000) {
      return { valid: false, error: 'Notes must not exceed 2000 characters' };
    }
  }

  // Validate optional field: dueDate
  if (dueDate !== undefined && dueDate !== null) {
    if (!validateDateISO8601(dueDate)) {
      return { valid: false, error: 'Invalid date format' };
    }
  }

  // Validate optional field: categoryId
  if (categoryId !== undefined && categoryId !== null) {
    if (!validateUUID(categoryId)) {
      return { valid: false, error: 'Invalid category ID format' };
    }
  }

  // Validate optional field: recurrenceRule
  if (recurrenceRule !== undefined && recurrenceRule !== null) {
    if (!validateRRULE(recurrenceRule)) {
      return { valid: false, error: 'Invalid recurrence rule format' };
    }
  }

  // Validate optional field: subtasks array
  if (subtasks !== undefined && subtasks !== null) {
    if (!Array.isArray(subtasks)) {
      return { valid: false, error: 'Subtasks must be an array' };
    }
    
    for (let i = 0; i < subtasks.length; i++) {
      const subtaskValidation = validateSubtask(subtasks[i]);
      if (!subtaskValidation.valid) {
        return { valid: false, error: `Subtask ${i}: ${subtaskValidation.error}` };
      }
    }
  }

  // Validate optional field: resourceLinks array
  if (resourceLinks !== undefined && resourceLinks !== null) {
    if (!Array.isArray(resourceLinks)) {
      return { valid: false, error: 'Resource links must be an array' };
    }
    
    for (let i = 0; i < resourceLinks.length; i++) {
      const linkValidation = validateResourceLink(resourceLinks[i]);
      if (!linkValidation.valid) {
        return { valid: false, error: `Resource link ${i}: ${linkValidation.error}` };
      }
    }
  }

  // Return validated and sanitized data
  return {
    valid: true,
    data: trimmed,
  };
}

/**
 * Validate Event data
 * 
 * @param {object} data - Event data to validate
 * @returns {object} - { valid: boolean, error?: string, data?: object }
 */
function validateEvent(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Event data must be an object' };
  }

  // Trim whitespace from string fields
  const trimmed = trimFields(data, ['title', 'category']);
  const { title, eventDate, alertDaysBefore, repeatsYearly, category } = trimmed;

  // Validate required field: title
  if (typeof title !== 'string') {
    return { valid: false, error: 'Title must be a string' };
  }
  if (!title) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length < 1 || title.length > 200) {
    return { valid: false, error: 'Title must be between 1 and 200 characters' };
  }

  // Validate required field: eventDate
  if (!validateDateISO8601(eventDate)) {
    return { valid: false, error: 'Invalid date format' };
  }

  // Validate required field: alertDaysBefore
  if (typeof alertDaysBefore !== 'number') {
    return { valid: false, error: 'Alert days before must be a number' };
  }
  if (alertDaysBefore < 0 || !Number.isInteger(alertDaysBefore)) {
    return { valid: false, error: 'Alert days before must be a non-negative integer' };
  }

  // Validate required field: repeatsYearly
  if (typeof repeatsYearly !== 'boolean') {
    return { valid: false, error: 'Repeats yearly must be a boolean' };
  }

  // Validate optional field: category
  if (category !== undefined && category !== null) {
    if (typeof category !== 'string') {
      return { valid: false, error: 'Category must be a string' };
    }
    if (category.length > 50) {
      return { valid: false, error: 'Category must not exceed 50 characters' };
    }
  }

  // Return validated and sanitized data
  return {
    valid: true,
    data: trimmed,
  };
}

/**
 * Validate Expense data
 * 
 * @param {object} data - Expense data to validate
 * @returns {object} - { valid: boolean, error?: string, data?: object }
 */
function validateExpense(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Expense data must be an object' };
  }

  // Trim whitespace from string fields
  const trimmed = trimFields(data, ['note']);
  const { amount, direction, categoryId, note, occurredAt, recurrenceRule } = trimmed;

  // Validate required field: amount
  if (typeof amount !== 'number') {
    return { valid: false, error: 'Amount must be a number' };
  }
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be a positive number' };
  }

  // Validate required field: direction
  if (typeof direction !== 'string') {
    return { valid: false, error: 'Direction must be a string' };
  }
  const validDirections = ['debit', 'credit'];
  if (!validDirections.includes(direction)) {
    return { valid: false, error: 'Invalid direction value' };
  }

  // Validate required field: occurredAt
  if (!validateDateISO8601(occurredAt)) {
    return { valid: false, error: 'Invalid date format' };
  }

  // Validate optional field: categoryId
  if (categoryId !== undefined && categoryId !== null) {
    if (!validateUUID(categoryId)) {
      return { valid: false, error: 'Invalid category ID format' };
    }
  }

  // Validate optional field: note
  if (note !== undefined && note !== null) {
    if (typeof note !== 'string') {
      return { valid: false, error: 'Note must be a string' };
    }
    if (note.length > 2000) {
      return { valid: false, error: 'Note must not exceed 2000 characters' };
    }
  }

  // Validate optional field: recurrenceRule
  if (recurrenceRule !== undefined && recurrenceRule !== null) {
    if (!validateRRULE(recurrenceRule)) {
      return { valid: false, error: 'Invalid recurrence rule format' };
    }
  }

  // Return validated and sanitized data
  return {
    valid: true,
    data: trimmed,
  };
}

/**
 * Validate Category data
 * 
 * @param {object} data - Category data to validate
 * @returns {object} - { valid: boolean, error?: string, data?: object }
 */
function validateCategory(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Category data must be an object' };
  }

  // Trim whitespace from string fields
  const trimmed = trimFields(data, ['name']);
  const { name, type, color } = trimmed;

  // Validate required field: name
  if (typeof name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.length < 1 || name.length > 50) {
    return { valid: false, error: 'Name must be between 1 and 50 characters' };
  }

  // Validate required field: type
  if (typeof type !== 'string') {
    return { valid: false, error: 'Type must be a string' };
  }
  const validTypes = ['task', 'expense'];
  if (!validTypes.includes(type)) {
    return { valid: false, error: 'Invalid type value' };
  }

  // Validate required field: color
  if (typeof color !== 'string') {
    return { valid: false, error: 'Color must be a string' };
  }
  // Hex color format: #RRGGBB
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexColorRegex.test(color)) {
    return { valid: false, error: 'Color must be in hex format (#RRGGBB)' };
  }

  // Return validated and sanitized data
  return {
    valid: true,
    data: trimmed,
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateRegistration,
  validateLogin,
  validateUUID,
  validateDateISO8601,
  validateURL,
  validateRRULE,
  trimFields,
  validateTask,
  validateSubtask,
  validateResourceLink,
  validateEvent,
  validateExpense,
  validateCategory,
};
