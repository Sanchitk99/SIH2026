import axios from 'axios';

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return fallback;
  }
  if (error instanceof Error && error.message && !error.message.startsWith('Request failed')) return error.message;
  return fallback;
}
