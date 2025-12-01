import {
  validatePhoneNumber,
  validateEmail,
  validateTextField,
  validateSmsMessage,
  validateAge,
  validateDate,
  validateTime,
  sanitizeInput,
  formatPhoneToE164,
  validatePatientForm,
} from '../../utils/validators';

describe('validators', () => {
  describe('validatePhoneNumber', () => {
    it('should accept valid Kenyan phone numbers', () => {
      const result = validatePhoneNumber('+254712345678');
      expect(result.valid).toBe(true);
    });

    it('should accept phone numbers without + prefix', () => {
      const result = validatePhoneNumber('254712345678');
      expect(result.valid).toBe(true);
    });

    it('should accept phone numbers starting with 0', () => {
      const result = validatePhoneNumber('0712345678');
      expect(result.valid).toBe(true);
    });

    it('should reject empty phone numbers', () => {
      const result = validatePhoneNumber('');
      expect(result.valid).toBe(false);
    });

    it('should reject phone numbers that are too short', () => {
      const result = validatePhoneNumber('123');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid emails', () => {
      const result = validateEmail('invalid.email');
      expect(result.valid).toBe(false);
    });

    it('should reject empty emails', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateTextField', () => {
    it('should accept valid text', () => {
      const result = validateTextField('Hello World');
      expect(result.valid).toBe(true);
    });

    it('should reject text shorter than minLength', () => {
      const result = validateTextField('Hi', { minLength: 3 });
      expect(result.valid).toBe(false);
    });

    it('should reject text longer than maxLength', () => {
      const result = validateTextField('This is a very long text', { maxLength: 10 });
      expect(result.valid).toBe(false);
    });

    it('should allow empty text if allowEmpty is true', () => {
      const result = validateTextField('', { allowEmpty: true });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateSmsMessage', () => {
    it('should accept SMS messages under 160 characters', () => {
      const result = validateSmsMessage('Hello, this is a test SMS message');
      expect(result.valid).toBe(true);
    });

    it('should reject SMS messages over 160 characters', () => {
      const longMessage = 'a'.repeat(161);
      const result = validateSmsMessage(longMessage);
      expect(result.valid).toBe(false);
    });

    it('should reject empty messages', () => {
      const result = validateSmsMessage('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateAge', () => {
    it('should accept valid ages', () => {
      const result = validateAge(30);
      expect(result.valid).toBe(true);
    });

    it('should reject negative ages', () => {
      const result = validateAge(-5);
      expect(result.valid).toBe(false);
    });

    it('should reject ages over 150', () => {
      const result = validateAge(151);
      expect(result.valid).toBe(false);
    });

    it('should reject non-integer ages', () => {
      const result = validateAge(30.5);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should accept valid dates in YYYY-MM-DD format', () => {
      const result = validateDate('2024-01-15');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid date formats', () => {
      const result = validateDate('15/01/2024');
      expect(result.valid).toBe(false);
    });

    it('should reject invalid dates', () => {
      const result = validateDate('2024-02-30');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateTime', () => {
    it('should accept valid times in HH:MM format', () => {
      const result = validateTime('14:30');
      expect(result.valid).toBe(true);
    });

    it('should accept midnight', () => {
      const result = validateTime('00:00');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid time formats', () => {
      const result = validateTime('14:30:00');
      expect(result.valid).toBe(false);
    });

    it('should reject invalid hours', () => {
      const result = validateTime('25:00');
      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;');
    });

    it('should trim whitespace', () => {
      const input = '  hello  ';
      const result = sanitizeInput(input);
      expect(result).toBe('hello');
    });
  });

  describe('formatPhoneToE164', () => {
    it('should convert Kenyan format to E.164', () => {
      const result = formatPhoneToE164('0712345678');
      expect(result).toBe('+254712345678');
    });

    it('should handle 254 prefix', () => {
      const result = formatPhoneToE164('254712345678');
      expect(result).toBe('+254712345678');
    });

    it('should handle + prefix', () => {
      const result = formatPhoneToE164('+254712345678');
      expect(result).toBe('+254712345678');
    });
  });

  describe('validatePatientForm', () => {
    it('should validate complete patient form', () => {
      const form = {
        name: 'John Doe',
        phone: '+254712345678',
        age: 30,
        gender: 'Male',
      };
      const result = validatePatientForm(form);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should report errors for invalid data', () => {
      const form = {
        name: '',
        phone: 'invalid',
        age: 200,
        gender: 'Unknown',
      };
      const result = validatePatientForm(form);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });
});
