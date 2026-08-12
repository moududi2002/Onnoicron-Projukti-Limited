import { toast } from 'react-hot-toast';

export function handleError(error: any, fallbackMessage = 'An error occurred'): string {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return fallbackMessage;
}

export function handleApiError(error: any, showToast = true): string {
  const message = handleError(error);
  if (showToast) toast.error(message);
  console.error('API Error:', error);
  return message;
}