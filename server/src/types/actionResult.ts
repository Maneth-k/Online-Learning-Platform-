/**
 * Standardized API response structure used across all controllers and middleware.
 * Guarantees a consistent JSON response shape for frontend consumers and API clients.
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export default ActionResult;
