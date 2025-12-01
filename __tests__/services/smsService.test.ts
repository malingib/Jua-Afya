import { sendSms, formatPhoneToE164 } from '../../services/smsService';

// Mock fetch
global.fetch = jest.fn();

describe('smsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMS_API_KEY = 'test-token';
  });

  describe('sendSms', () => {
    it('should return error when API key is missing', async () => {
      process.env.SMS_API_KEY = '';
      const result = await sendSms('+254712345678', 'Hello');
      expect(result.status).toBe('error');
      expect(result.message).toContain('configuration');
    });

    it('should reject invalid phone numbers', async () => {
      const result = await sendSms('', 'Hello');
      expect(result.status).toBe('error');
      expect(result.message).toContain('Invalid');
    });

    it('should format phone number correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'success' }),
      });

      await sendSms('0712345678', 'Test message');

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain('sms.mobiwave');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await sendSms('+254712345678', 'Hello');
      expect(result.status).toBe('error');
      expect(result.message).toContain('Network');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({ message: 'Invalid recipient', status: 'error' }),
      });

      const result = await sendSms('+254712345678', 'Hello');
      expect(result.status).toBe('error');
    });
  });

  describe('phone number formatting', () => {
    it('should format Kenyan phone numbers to international format', () => {
      const testCases = [
        ['0712345678', '254712345678'],
        ['+254712345678', '254712345678'],
        ['254712345678', '254712345678'],
      ];

      for (const [input, expected] of testCases) {
        const cleaned = input.replace(/[^0-9]/g, '');
        expect(cleaned).toBe(expected);
      }
    });
  });
});
