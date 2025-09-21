interface ErrorHandlerOptions {
  showToast?: boolean;
  toastMessage?: string;
}

interface ErrorInfo {
  message: string;
  code?: string;
}

export function handleError(error: unknown, options: ErrorHandlerOptions = {}): ErrorInfo {
  let message = "An unexpected error occurred";
  let code: string | undefined;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object" && error !== null) {
    // Handle API error responses
    const apiError = error as { message?: string; error?: string; code?: string };
    message = apiError.message || apiError.error || message;
    code = apiError.code;
  }

  // Return the error info
  return {
    message,
    code,
  };
}