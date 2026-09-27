/**
 * Server-side input validation and error helpers
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function successResponse(data: any, status: number = 200) {
  return {
    status,
    body: {
      success: true,
      data,
    },
  };
}

export function errorResponse(
  message: string,
  code: string = 'BAD_REQUEST',
  status: number = 400,
  details?: any
) {
  return {
    status,
    body: {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
  };
}

export function validateRequiredString(val: any, fieldName: string, minLength: number = 1): string {
  if (typeof val !== 'string' || val.trim().length < minLength) {
    throw new Error(`Field '${fieldName}' is required and must have at least ${minLength} character(s).`);
  }
  return val.trim();
}

export function validateEnum<T extends string>(val: any, fieldName: string, allowed: T[]): T {
  if (!allowed.includes(val)) {
    throw new Error(`Invalid '${fieldName}'. Allowed values: ${allowed.join(', ')}`);
  }
  return val;
}
