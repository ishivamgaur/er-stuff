export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiFailure = {
  success: false
  error: { code: string; message: string }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  UNAUTHORIZED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
} as const

export const apiSuccess = <T>(data: T, status: number = HTTP_STATUS.OK): Response =>
  Response.json({ success: true, data } satisfies ApiSuccess<T>, { status })

export const apiFailure = (
  code: string,
  message: string,
  status: number = HTTP_STATUS.BAD_REQUEST,
): Response =>
  Response.json({ success: false, error: { code, message } } satisfies ApiFailure, { status })

export const validationFailure = (message = "Invalid request"): Response =>
  apiFailure(API_ERROR_CODES.VALIDATION_ERROR, message, HTTP_STATUS.BAD_REQUEST)

export const notFound = (message = "Resource not found"): Response =>
  apiFailure(API_ERROR_CODES.NOT_FOUND, message, HTTP_STATUS.NOT_FOUND)

export const serverError = (): Response =>
  apiFailure(API_ERROR_CODES.SERVER_ERROR, "Something went wrong", HTTP_STATUS.SERVER_ERROR)
