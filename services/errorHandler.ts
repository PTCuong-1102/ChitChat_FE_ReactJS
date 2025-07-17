import { ApiError, NetworkError, ValidationError } from './apiService';

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
  validationErrors?: Record<string, string>;
  errorCode?: string;
  userMessage?: string;
}

export interface ErrorNotification {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorNotificationCallback: ((notification: ErrorNotification) => void) | null = null;
  private retryCallbacks: Map<string, () => Promise<void>> = new Map();

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  setErrorNotificationCallback(callback: (notification: ErrorNotification) => void) {
    this.errorNotificationCallback = callback;
  }

  private showNotification(notification: ErrorNotification) {
    if (this.errorNotificationCallback) {
      this.errorNotificationCallback(notification);
    } else {
      // Fallback to console and alert
      console.error('Error:', notification);
      alert(`${notification.title}: ${notification.message}`);
    }
  }

  handleError(error: unknown, context?: string): ErrorNotification {
    console.error('Error occurred:', error, 'Context:', context);
    
    let notification: ErrorNotification;

    if (error instanceof ApiError) {
      notification = this.handleApiError(error, context);
    } else if (error instanceof NetworkError) {
      notification = this.handleNetworkError(error, context);
    } else if (error instanceof ValidationError) {
      notification = this.handleValidationError(error, context);
    } else if (error instanceof Error) {
      notification = this.handleGenericError(error, context);
    } else {
      notification = this.handleUnknownError(error, context);
    }

    this.showNotification(notification);
    return notification;
  }

  private handleApiError(error: ApiError, context?: string): ErrorNotification {
    const errorData = error.errorData;
    
    // Handle specific error codes
    switch (error.status) {
      case 400:
        return this.handleBadRequestError(errorData, context);
      case 401:
        return this.handleUnauthorizedError(errorData, context);
      case 403:
        return this.handleForbiddenError(errorData, context);
      case 404:
        return this.handleNotFoundError(errorData, context);
      case 409:
        return this.handleConflictError(errorData, context);
      case 413:
        return this.handlePayloadTooLargeError(errorData, context);
      case 422:
        return this.handleValidationError(new ValidationError(errorData.validationErrors || {}), context);
      case 429:
        return this.handleRateLimitError(errorData, context);
      case 500:
        return this.handleInternalServerError(errorData, context);
      case 502:
      case 503:
      case 504:
        return this.handleServerUnavailableError(errorData, context);
      default:
        return this.handleGenericApiError(error, context);
    }
  }

  private handleBadRequestError(errorData: ErrorResponse, context?: string): ErrorNotification {
    const baseMessage = errorData.userMessage || errorData.message || 'Invalid request';
    
    if (errorData.validationErrors) {
      const validationMessages = Object.entries(errorData.validationErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');
      
      return {
        type: 'error',
        title: 'Validation Error',
        message: `${baseMessage}. ${validationMessages}`,
        duration: 8000
      };
    }
    
    return {
      type: 'error',
      title: 'Invalid Request',
      message: baseMessage,
      duration: 5000
    };
  }

  private handleUnauthorizedError(errorData: ErrorResponse, context?: string): ErrorNotification {
    const message = errorData.userMessage || 'You need to log in to access this resource';
    
    return {
      type: 'error',
      title: 'Authentication Required',
      message,
      duration: 5000,
      actions: [
        {
          label: 'Log In',
          action: () => {
            // Redirect to login page
            window.location.href = '/auth';
          }
        }
      ]
    };
  }

  private handleForbiddenError(errorData: ErrorResponse, context?: string): ErrorNotification {
    const message = errorData.userMessage || 'You don\'t have permission to access this resource';
    
    return {
      type: 'error',
      title: 'Access Denied',
      message,
      duration: 5000
    };
  }

  private handleNotFoundError(errorData: ErrorResponse, context?: string): ErrorNotification {
    const message = errorData.userMessage || 'The requested resource was not found';
    
    return {
      type: 'error',
      title: 'Not Found',
      message,
      duration: 5000
    };
  }

  private handleConflictError(errorData: ErrorResponse, context?: string): ErrorNotification {
    const message = errorData.userMessage || 'A conflict occurred with the current state of the resource';
    
    return {
      type: 'error',
      title: 'Conflict',
      message,
      duration: 5000,
      actions: [
        {
          label: 'Refresh',
          action: () => {
            window.location.reload();
          }
        }
      ]
    };
  }

  private handlePayloadTooLargeError(errorData: ErrorResponse, context?: string): ErrorNotification {
    const message = errorData.userMessage || 'The uploaded file is too large';
    
    return {
      type: 'error',
      title: 'File Too Large',
      message,
      duration: 5000
    };
  }

  private handleRateLimitError(errorData: ErrorResponse, context?: string): ErrorNotification {
    const message = errorData.userMessage || 'Too many requests. Please try again later';
    
    return {
      type: 'warning',
      title: 'Rate Limit Exceeded',
      message,
      duration: 5000
    };
  }

  private handleInternalServerError(errorData: ErrorResponse, context?: string): ErrorNotification {
    const message = errorData.userMessage || 'A server error occurred. Please try again later';
    
    return {
      type: 'error',
      title: 'Server Error',
      message,
      duration: 5000,
      actions: [
        {
          label: 'Retry',
          action: () => {
            const retryKey = context || 'default';
            const retryCallback = this.retryCallbacks.get(retryKey);
            if (retryCallback) {
              retryCallback();
            } else {
              window.location.reload();
            }
          }
        }
      ]
    };
  }

  private handleServerUnavailableError(errorData: ErrorResponse, context?: string): ErrorNotification {
    const message = errorData.userMessage || 'The server is temporarily unavailable. Please try again later';
    
    return {
      type: 'error',
      title: 'Server Unavailable',
      message,
      duration: 8000,
      actions: [
        {
          label: 'Retry',
          action: () => {
            const retryKey = context || 'default';
            const retryCallback = this.retryCallbacks.get(retryKey);
            if (retryCallback) {
              retryCallback();
            }
          }
        }
      ]
    };
  }

  private handleGenericApiError(error: ApiError, context?: string): ErrorNotification {
    const message = error.message || 'An unexpected error occurred';
    
    return {
      type: 'error',
      title: 'API Error',
      message,
      duration: 5000
    };
  }

  private handleNetworkError(error: NetworkError, context?: string): ErrorNotification {
    return {
      type: 'error',
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      duration: 8000,
      actions: [
        {
          label: 'Retry',
          action: () => {
            const retryKey = context || 'default';
            const retryCallback = this.retryCallbacks.get(retryKey);
            if (retryCallback) {
              retryCallback();
            }
          }
        }
      ]
    };
  }

  private handleValidationError(error: ValidationError, context?: string): ErrorNotification {
    const validationMessages = Object.entries(error.validationErrors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
    
    return {
      type: 'error',
      title: 'Validation Error',
      message: `Please fix the following errors: ${validationMessages}`,
      duration: 8000
    };
  }

  private handleGenericError(error: Error, context?: string): ErrorNotification {
    return {
      type: 'error',
      title: 'Error',
      message: error.message || 'An unexpected error occurred',
      duration: 5000
    };
  }

  private handleUnknownError(error: unknown, context?: string): ErrorNotification {
    return {
      type: 'error',
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
      duration: 5000
    };
  }

  // Register a retry callback for a specific context
  registerRetryCallback(context: string, callback: () => Promise<void>) {
    this.retryCallbacks.set(context, callback);
  }

  // Unregister a retry callback
  unregisterRetryCallback(context: string) {
    this.retryCallbacks.delete(context);
  }

  // Helper method to handle specific error scenarios
  handleAuthenticationError() {
    // Clear any stored authentication tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    window.location.href = '/auth';
  }

  handleNetworkTimeout() {
    this.showNotification({
      type: 'warning',
      title: 'Request Timeout',
      message: 'The request is taking longer than expected. Please wait or try again.',
      duration: 5000
    });
  }

  handleOfflineError() {
    this.showNotification({
      type: 'info',
      title: 'You\'re Offline',
      message: 'Some features may not be available while you\'re offline. Please check your internet connection.',
      duration: 0 // Don't auto-dismiss
    });
  }

  // Helper method to create custom error notifications
  createCustomNotification(
    type: 'error' | 'warning' | 'info',
    title: string,
    message: string,
    options?: {
      duration?: number;
      actions?: Array<{ label: string; action: () => void }>;
    }
  ): ErrorNotification {
    return {
      type,
      title,
      message,
      duration: options?.duration || 5000,
      actions: options?.actions
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export helper functions
export const handleError = (error: unknown, context?: string) => {
  return errorHandler.handleError(error, context);
};

export const showErrorNotification = (
  title: string,
  message: string,
  options?: {
    duration?: number;
    actions?: Array<{ label: string; action: () => void }>;
  }
) => {
  const notification = errorHandler.createCustomNotification('error', title, message, options);
  errorHandler['showNotification'](notification);
};

export const showSuccessNotification = (
  title: string,
  message: string,
  duration: number = 3000
) => {
  const notification = errorHandler.createCustomNotification('info', title, message, { duration });
  errorHandler['showNotification'](notification);
}; 