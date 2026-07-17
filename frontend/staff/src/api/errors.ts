import axios from 'axios';

interface ProblemDetails {
  title?: string;
  detail?: string;
}

/** Surfaces the backend's ProblemDetails message (403/validation/etc.) instead of a generic failure string. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ProblemDetails>(error)) {
    return error.response?.data?.detail ?? error.response?.data?.title ?? fallback;
  }
  return fallback;
}
