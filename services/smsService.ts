// Mobiwave SMS Integration Service

// API Configuration from documentation
const API_TOKEN = '29|tV2YhbU49xBNHQPM4xldeJy0y4bi5Heyd8yyAmgw';
const BASE_URL = 'https://sms.mobiwave.co.ke/api/v3';
const DEFAULT_SENDER_ID = 'MOBIWAVE'; // Alphanumeric sender ID

export interface SmsResponse {
  status: 'success' | 'error';
  message?: string;
  data?: any;
}

/**
 * Sends an SMS using Mobiwave SMS API.
 * @param recipient Phone number (e.g. +254712345678)
 * @param message Text message content
 */
export const sendSms = async (recipient: string, message: string): Promise<SmsResponse> => {
  // 1. Format recipient: Mobiwave usually expects digits (e.g. 254712345678)
  // We strip non-digit characters.
  const cleanRecipient = recipient.replace(/[^0-9]/g, '');

  if (!cleanRecipient) {
    return { status: 'error', message: 'Invalid phone number format.' };
  }

  try {
    const response = await fetch(`${BASE_URL}/sms/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        recipient: cleanRecipient,
        sender_id: DEFAULT_SENDER_ID,
        type: 'plain',
        message: message,
      }),
    });

    const data = await response.json();
    
    // Check for API specific success indicators
    if (data.status === 'success' || response.ok) {
        return { status: 'success', data: data };
    } else {
        return { status: 'error', message: data.message || 'Failed to send SMS via provider.' };
    }

  } catch (error) {
    console.error("SMS Service Error:", error);
    return { status: 'error', message: 'Network error or SMS service unreachable.' };
  }
};