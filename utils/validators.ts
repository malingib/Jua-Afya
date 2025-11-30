/**
 * Input Validation Utilities
 * Provides validation functions for common user inputs
 */

/**
 * Validates a phone number in E.164 format or Kenyan format
 * Accepts: +254712345678, 0712345678, 254712345678
 */
export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  const cleaned = phone.replace(/\D/g, '');
  
  // Must be between 9-15 digits
  if (cleaned.length < 9 || cleaned.length > 15) {
    return { valid: false, error: 'Phone number must be between 9 and 15 digits' };
  }

  // Kenyan numbers validation (start with 254 or 07 or 0020)
  const isKenyan = cleaned.endsWith(phone.slice(-9)) && 
    (cleaned.startsWith('254') || phone.startsWith('0') || phone.startsWith('+'));
  
  if (!isKenyan && !cleaned.match(/^[1-9]\d{8,14}$/)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true };
};

/**
 * Validates an email address
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  return { valid: true };
};

/**
 * Validates a text field (name, notes, etc.)
 */
export const validateTextField = (
  text: string,
  options: { minLength?: number; maxLength?: number; allowEmpty?: boolean } = {}
): { valid: boolean; error?: string } => {
  const { minLength = 1, maxLength = 500, allowEmpty = false } = options;

  if (!text && !allowEmpty) {
    return { valid: false, error: 'This field is required' };
  }

  if (text.length < minLength) {
    return { valid: false, error: `Minimum length is ${minLength} characters` };
  }

  if (text.length > maxLength) {
    return { valid: false, error: `Maximum length is ${maxLength} characters` };
  }

  // Check for SQL injection patterns
  if (/['";\\]/g.test(text) && text.length < 10) {
    return { valid: false, error: 'Contains invalid characters' };
  }

  return { valid: true };
};

/**
 * Validates SMS message content
 */
export const validateSmsMessage = (message: string): { valid: boolean; error?: string } => {
  if (!message) {
    return { valid: false, error: 'Message is required' };
  }

  if (message.length > 160) {
    return { valid: false, error: 'SMS message exceeds 160 characters' };
  }

  if (message.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  return { valid: true };
};

/**
 * Validates a patient age
 */
export const validateAge = (age: number): { valid: boolean; error?: string } => {
  if (age === null || age === undefined) {
    return { valid: false, error: 'Age is required' };
  }

  if (!Number.isInteger(age) || age < 0 || age > 150) {
    return { valid: false, error: 'Age must be a valid number between 0 and 150' };
  }

  return { valid: true };
};

/**
 * Validates a date string (YYYY-MM-DD format)
 */
export const validateDate = (dateStr: string): { valid: boolean; error?: string } => {
  if (!dateStr) {
    return { valid: false, error: 'Date is required' };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(dateStr)) {
    return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  return { valid: true };
};

/**
 * Validates a time string (HH:MM format)
 */
export const validateTime = (timeStr: string): { valid: boolean; error?: string } => {
  if (!timeStr) {
    return { valid: false, error: 'Time is required' };
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(timeStr)) {
    return { valid: false, error: 'Time must be in HH:MM format (24-hour)' };
  }

  return { valid: true };
};

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

/**
 * Formats phone number to E.164 standard
 */
export const formatPhoneToE164 = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0 (Kenya), replace with 254
  if (cleaned.startsWith('0')) {
    return '+' + '254' + cleaned.slice(1);
  }
  
  // If starts with 254 (Kenya), add +
  if (cleaned.startsWith('254')) {
    return '+' + cleaned;
  }
  
  // Otherwise, assume 254 prefix
  return '+254' + cleaned.slice(-9);
};

/**
 * Validates an entire patient form object
 */
export const validatePatientForm = (patient: {
  name: string;
  phone: string;
  age: number;
  gender: string;
  notes?: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate name
  const nameValidation = validateTextField(patient.name, { minLength: 2, maxLength: 100 });
  if (!nameValidation.valid) {
    errors.name = nameValidation.error || 'Invalid name';
  }

  // Validate phone
  const phoneValidation = validatePhoneNumber(patient.phone);
  if (!phoneValidation.valid) {
    errors.phone = phoneValidation.error || 'Invalid phone number';
  }

  // Validate age
  const ageValidation = validateAge(patient.age);
  if (!ageValidation.valid) {
    errors.age = ageValidation.error || 'Invalid age';
  }

  // Validate gender
  if (!['Male', 'Female', 'Other'].includes(patient.gender)) {
    errors.gender = 'Invalid gender selection';
  }

  // Validate notes (optional)
  if (patient.notes) {
    const notesValidation = validateTextField(patient.notes, { minLength: 0, maxLength: 1000, allowEmpty: true });
    if (!notesValidation.valid) {
      errors.notes = notesValidation.error || 'Invalid notes';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
