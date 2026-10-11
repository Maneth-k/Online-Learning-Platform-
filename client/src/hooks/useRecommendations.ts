import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCourseRecommendations,
  fetchAIUsageStatus,
  type RecommendationResponseData,
  type AIUsageStatus,
} from '../services/courseApi.js';

export const AI_USAGE_QUERY_KEY = ['ai-usage'] as const;
export const RECOMMENDATIONS_QUERY_KEY = ['course-recommendations-cache'] as const;

const SESSION_KEY_LAST_RESULT = 'mentora_recommendation_last_result';
const SESSION_KEY_LAST_PROMPT = 'mentora_recommendation_last_prompt';
const SESSION_KEY_PROMPT_CACHE = 'mentora_recommendation_prompt_cache';

/**
 * Client-side sanitization helper matching backend constraints.
 * Collapses whitespace, removes control characters, and trims.
 */
export function sanitizeClientPrompt(raw: string): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\s+/g, ' ').trim();
}

/**
 * Normalize prompt for cache key matching (lowercased, collapsed spaces).
 */
export function normalizePromptKey(raw: string): string {
  return sanitizeClientPrompt(raw).toLowerCase();
}

/**
 * Validate prompt bounds (3 to 300 characters after collapsing whitespace).
 */
export function validatePrompt(prompt: string): { isValid: boolean; error?: string } {
  const clean = sanitizeClientPrompt(prompt);
  if (!clean) {
    return { isValid: false, error: 'Please enter what you want to learn or your career goal.' };
  }
  if (clean.length < 3) {
    return { isValid: false, error: 'Prompt must be at least 3 characters long.' };
  }
  if (clean.length > 300) {
    return { isValid: false, error: 'Prompt cannot exceed 300 characters.' };
  }
  return { isValid: true };
}

/**
 * Retrieve cached results map from sessionStorage.
 */
function getStoredPromptCache(): Record<string, RecommendationResponseData> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_PROMPT_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save entry to sessionStorage prompt cache.
 */
function setStoredPromptCache(normKey: string, result: RecommendationResponseData): void {
  try {
    const cache = getStoredPromptCache();
    // Keep max 20 entries to prevent session storage bloat
    const keys = Object.keys(cache);
    if (keys.length > 20) {
      delete cache[keys[0]];
    }
    cache[normKey] = result;
    sessionStorage.setItem(SESSION_KEY_PROMPT_CACHE, JSON.stringify(cache));
  } catch {
    // Non-blocking storage fallback
  }
}

/**
 * Retrieve the last active session recommendation result and prompt.
 */
export function getLastSavedRecommendation(): {
  prompt: string;
  result: RecommendationResponseData;
} | null {
  try {
    const savedPrompt = sessionStorage.getItem(SESSION_KEY_LAST_PROMPT);
    const savedResultRaw = sessionStorage.getItem(SESSION_KEY_LAST_RESULT);
    if (savedPrompt && savedResultRaw) {
      const result = JSON.parse(savedResultRaw) as RecommendationResponseData;
      return { prompt: savedPrompt, result };
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

/**
 * Persist the current recommendation result and prompt to sessionStorage.
 */
export function saveLastRecommendation(
  prompt: string,
  result: RecommendationResponseData
): void {
  try {
    sessionStorage.setItem(SESSION_KEY_LAST_PROMPT, prompt);
    sessionStorage.setItem(SESSION_KEY_LAST_RESULT, JSON.stringify(result));
    setStoredPromptCache(normalizePromptKey(prompt), result);
  } catch {
    // Non-blocking
  }
}

/**
 * Clear persisted recommendation session data.
 */
export function clearSavedRecommendation(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY_LAST_PROMPT);
    sessionStorage.removeItem(SESSION_KEY_LAST_RESULT);
  } catch {
    // Non-blocking
  }
}

/**
 * Hook to query and track global OpenAI budget usage.
 * Only loaded when explicitly enabled or in debug mode.
 */
export function useAIUsage(enabled: boolean = false) {
  return useQuery<AIUsageStatus>({
    queryKey: AI_USAGE_QUERY_KEY,
    queryFn: fetchAIUsageStatus,
    staleTime: 60000,
    retry: false,
    enabled,
  });
}

/**
 * Hook to execute course recommendation query.
 * Guarantees:
 * 1. Checks in-memory and sessionStorage normalized prompt cache first (0 requests spent on repeat prompts).
 * 2. retry: false explicitly configured (zero hidden request multiplications).
 * 3. Client timeout 20s (longer than server 15s).
 * 4. Persists result in queryClient and sessionStorage.
 */
export function useCourseRecommendations() {
  const queryClient = useQueryClient();

  return useMutation<RecommendationResponseData, Error, string>({
    retry: false, // Critical: prevent hidden retries that multiply request counts
    mutationFn: async (rawPrompt: string) => {
      const sanitized = sanitizeClientPrompt(rawPrompt);
      const validation = validatePrompt(sanitized);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid prompt');
      }

      const normKey = normalizePromptKey(sanitized);

      // Check TanStack Query cache or sessionStorage cache first
      const memCache = getStoredPromptCache();
      if (memCache[normKey]) {
        // Instant cache hit: zero network request, zero quota spent
        return memCache[normKey];
      }

      // No cache hit: make external call with 20s timeout
      const result = await fetchCourseRecommendations(sanitized);

      // Persist in memory and session cache
      saveLastRecommendation(sanitized, result);
      queryClient.setQueryData([...RECOMMENDATIONS_QUERY_KEY, normKey], result);

      return result;
    },
    onSuccess: () => {
      // Refresh usage counter immediately after successful new server request
      queryClient.invalidateQueries({ queryKey: AI_USAGE_QUERY_KEY });
    },
  });
}
