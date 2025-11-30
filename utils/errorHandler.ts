/**
 * Error Handling Service
 * Centralized error handling, logging, and user notifications
 */

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  API = 'API',
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  context?: Record<string, any>;
  timestamp: Date;
  userMessage?: string; // User-friendly message for UI
}

/**
 * Parse error from different sources
 */
export const parseError = (error: unknown): AppError => {
  const now = new Date();

  // If already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }

  // If it's a standard Error
  if (error instanceof Error) {
    // Check message for error type hints
    if (error.message.includes('validation')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        timestamp: now,
        userMessage: 'Please check your input and try again.',
      };
    }

    if (error.message.includes('unauthorized') || error.message.includes('token')) {
      return {
        type: ErrorType.AUTH,
        message: error.message,
        timestamp: now,
        userMessage: 'Please sign in again.',
      };
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: error.message,
        timestamp: now,
        userMessage: 'Network connection failed. Please check your internet and try again.',
      };
    }

    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      timestamp: now,
      userMessage: 'An unexpected error occurred. Please try again.',
    };
  }

  // If it's a string
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      timestamp: now,
      userMessage: error,
    };
  }

  // If it's an object (possibly from API)
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, any>;
    return {
      type: obj.type || ErrorType.UNKNOWN,
      message: obj.message || String(error),
      statusCode: obj.statusCode,
      context: obj.context,
      timestamp: now,
      userMessage: obj.userMessage || 'An unexpected error occurred.',
    };
  }

  // Fallback
  return {
    type: ErrorType.UNKNOWN,
    message: String(error),
    timestamp: now,
    userMessage: 'An unexpected error occurred.',
  };
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error: AppError): string => {
  const { type, message, statusCode, context, timestamp } = error;
  const contextStr = context ? JSON.stringify(context) : '';
  return `[${timestamp.toISOString()}] ${type}: ${message} (${statusCode || 'N/A'}) ${contextStr}`;
};

/**
 * Log error to console (development) or monitoring service (production)
 */
export const logError = (error: AppError, context?: string): void => {
  const formatted = formatErrorForLogging(error);
  
  console.error(`${context ? `[${context}] ` : ''}${formatted}`);

  // In production, send to error tracking service (e.g., Sentry)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // TODO: Integrate with Sentry or similar
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     type: error.type,
    //     message: error.message,
    //     context: error.context,
    //     url: window.location.href,
    //     userAgent: navigator.userAgent,
    //   }),
    // });
  }
};

/**
 * Handle API response errors
 */
export const handleApiError = (response: Response): AppError => {
  let type = ErrorType.SERVER;

  if (response.status === 400) type = ErrorType.VALIDATION;
  if (response.status === 401 || response.status === 403) type = ErrorType.AUTH;
  if (response.status === 404) type = ErrorType.NOT_FOUND;
  if (response.status === 409) type = ErrorType.CONFLICT;
  if (response.status >= 500) type = ErrorType.SERVER;

  return {
    type,
    message: `API Error: ${response.status} ${response.statusText}`,
    statusCode: response.status,
    timestamp: new Date(),
    userMessage: getDefaultUserMessage(type),
  };
};

/**
 * Get user-friendly error message based on error type
 */
export const getDefaultUserMessage = (type: ErrorType): string => {
  const messages: Record<ErrorType, string> = {
    [ErrorType.VALIDATION]: 'Please check your input and try again.',
    [ErrorType.API]: 'An error occurred while processing your request.',
    [ErrorType.NETWORK]: 'Network connection failed. Please check your internet.',
    [ErrorType.AUTH]: 'Your session has expired. Please sign in again.',
    [ErrorType.PERMISSION]: 'You do not have permission to perform this action.',
    [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorType.CONFLICT]: 'This action conflicts with existing data.',
    [ErrorType.SERVER]: 'A server error occurred. Please try again later.',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  };

  return messages[type];
};

/**
 * Retry logic for transient failures (network errors, timeouts, etc.)
 */
export const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry validation errors or auth errors
      if (
        error instanceof Error &&
        (error.message.includes('validation') || error.message.includes('unauthorized'))
      ) {
        throw error;
      }

      // If last attempt, throw error
      if (attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed');
};

/**
 * Validate API response has expected shape
 */
export const validateApiResponse = <T,>(
  data: unknown,
  schema: Record<string, string>
): T => {
  if (typeof data !== 'object' || data === null) {
    throw {
      type: ErrorType.VALIDATION,
      message: 'Invalid API response format',
      userMessage: 'Received invalid data from server.',
    };
  }

  const obj = data as Record<string, unknown>;
  
  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in obj)) {
      throw {
        type: ErrorType.VALIDATION,
        message: `Missing required field: ${key}`,
        userMessage: 'Received incomplete data from server.',
      };
    }

    if (typeof obj[key] !== expectedType) {
      throw {
        type: ErrorType.VALIDATION,
        message: `Invalid type for field ${key}: expected ${expectedType}, got ${typeof obj[key]}`,
        userMessage: 'Received invalid data from server.',
      };
    }
  }

  return data as T;
};

/**
 * Create a custom AppError
 */
export const createError = (
  type: ErrorType,
  message: string,
  statusCode?: number,
  context?: Record<string, any>
): AppError => {
  return {
    type,
    message,
    statusCode,
    context,
    timestamp: new Date(),
    userMessage: getDefaultUserMessage(type),
  };
};

export default {
  parseError,
  logError,
  handleApiError,
  getDefaultUserMessage,
  retryWithBackoff,
  validateApiResponse,
  createError,
  ErrorType,
};
