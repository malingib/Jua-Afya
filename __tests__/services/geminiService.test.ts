import {
  analyzePatientNotes,
  draftAppointmentSms,
  draftCampaignMessage,
  generateDailyBriefing,
} from '../../services/geminiService';

// Mock the Gemini API
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: 'Mocked response from Gemini',
      }),
    },
    chats: {
      create: jest.fn(),
    },
  })),
}));

describe('geminiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_KEY = 'test-key';
  });

  describe('analyzePatientNotes', () => {
    it('should return error message when API key is missing', async () => {
      process.env.API_KEY = '';
      const result = await analyzePatientNotes('test notes');
      expect(result).toContain('API Key');
    });

    it('should analyze patient notes', async () => {
      const result = await analyzePatientNotes('Patient has headache and fever');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty notes', async () => {
      const result = await analyzePatientNotes('');
      expect(typeof result).toBe('string');
    });
  });

  describe('draftAppointmentSms', () => {
    it('should draft appointment SMS', async () => {
      const result = await draftAppointmentSms(
        'John Doe',
        '2024-01-15',
        'Regular checkup'
      );
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return error when API key is missing', async () => {
      process.env.API_KEY = '';
      const result = await draftAppointmentSms(
        'John Doe',
        '2024-01-15',
        'Regular checkup'
      );
      expect(result).toContain('API Key');
    });
  });

  describe('draftCampaignMessage', () => {
    it('should draft campaign message', async () => {
      const result = await draftCampaignMessage('Health screening', 'Friendly');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle different tones', async () => {
      const tones = ['Professional', 'Urgent', 'Friendly', 'Educational'];

      for (const tone of tones) {
        const result = await draftCampaignMessage('Test topic', tone);
        expect(typeof result).toBe('string');
      }
    });
  });

  describe('generateDailyBriefing', () => {
    it('should generate daily briefing', async () => {
      const result = await generateDailyBriefing(10, 5, 'KSh 15,000');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return default message when API key is missing', async () => {
      process.env.API_KEY = '';
      const result = await generateDailyBriefing(10, 5, 'KSh 15,000');
      expect(result).toContain('System');
    });
  });
});
