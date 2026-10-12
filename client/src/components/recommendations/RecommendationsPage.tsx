import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  useCourseRecommendations,
  useAIUsage,
  validatePrompt,
  sanitizeClientPrompt,
  getLastSavedRecommendation,
  saveLastRecommendation,
  clearSavedRecommendation,
} from '../../hooks/useRecommendations.js';
import { CourseCard } from '../course/CourseCard.js';
import { Footer } from '../landing/Footer.js';
import { RecommendationApiError, type RecommendationResponseData } from '../../services/courseApi.js';
import './RecommendationsPage.css';

interface QuickPrompt {
  label: string;
  prompt: string;
  icon: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: 'Full-Stack Developer',
    prompt: 'I want to become a full-stack web developer and build modern cloud applications.',
    icon: 'code',
  },
  {
    label: 'AI & Data Science',
    prompt: 'I want to master Python, artificial intelligence, and machine learning models.',
    icon: 'smart_toy',
  },
  {
    label: 'Cloud & DevOps',
    prompt: 'I want to learn cloud architecture, Docker containers, and CI/CD automation.',
    icon: 'cloud',
  },
  {
    label: 'UI/UX & Frontend',
    prompt: 'I want to master modern frontend engineering, responsive design, and user interfaces.',
    icon: 'palette',
  },
];

export function RecommendationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDebug = new URLSearchParams(location.search).get('debug') === '1';

  // Restore last session results if available (prevents re-submitting upon navigation Back)
  const initialSaved = getLastSavedRecommendation();
  const [prompt, setPrompt] = useState(
    () => new URLSearchParams(location.search).get('prompt') || initialSaved?.prompt || ''
  );
  const [activeResult, setActiveResult] = useState<RecommendationResponseData | null>(
    initialSaved?.result || null
  );
  const [activePromptLabel, setActivePromptLabel] = useState<string | null>(null);

  // Rate limiting countdown state for 429
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number>(0);

  // Inline toast state for enrollments
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Double-spend guard ref
  const isSubmittingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    mutate: executeRecommend,
    isPending,
    isError,
    error,
    reset,
  } = useCourseRecommendations();

  const { data: usage } = useAIUsage(isDebug);

  // Handle Rate-Limit (429) countdown timer
  useEffect(() => {
    if (rateLimitCooldown <= 0) return;
    const timer = setInterval(() => {
      setRateLimitCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitCooldown]);

  const validation = validatePrompt(prompt);
  const charCount = sanitizeClientPrompt(prompt).length;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Guard: Prevent double-spending or rapid-click racing
    if (isPending || isSubmittingRef.current || rateLimitCooldown > 0) {
      return;
    }

    const clean = sanitizeClientPrompt(prompt);
    const validCheck = validatePrompt(clean);
    if (!validCheck.isValid) return;

    isSubmittingRef.current = true;

    executeRecommend(clean, {
      onSuccess: (data) => {
        isSubmittingRef.current = false;
        setActiveResult(data);
        saveLastRecommendation(clean, data);
      },
      onError: (err) => {
        isSubmittingRef.current = false;
        if (err instanceof RecommendationApiError) {
          if (err.status === 401) {
            // Keep prompt and redirect to login
            sessionStorage.setItem('mentora_recommendation_last_prompt', clean);
            navigate('/login?returnUrl=/recommendations');
            return;
          }
          if (err.status === 429 && err.retryAfter) {
            setRateLimitCooldown(err.retryAfter);
          }
        }
      },
    });
  };

  // Safe chip handler: fills the input and sets focus, does NOT auto-submit
  const handleQuickPromptClick = (quick: QuickPrompt) => {
    setPrompt(quick.prompt);
    setActivePromptLabel(quick.label);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleClear = () => {
    setPrompt('');
    setActivePromptLabel(null);
    setActiveResult(null);
    clearSavedRecommendation();
    reset();
  };

  const handleEnrollSuccess = (courseTitle: string) => {
    setToastMessage(`Successfully enrolled in "${courseTitle}"!`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const isRateLimited = rateLimitCooldown > 0;

  // Determine error classification
  const apiError = error instanceof RecommendationApiError ? error : null;
  const is403Forbidden = apiError?.status === 403;
  const is400BadInput = apiError?.status === 400;
  const isNetworkOrTimeout = Boolean(apiError?.isNetworkError);

  return (
    <div className="recommendations-page-wrapper">
      {toastMessage && (
        <div className="advisor-toast" role="status" aria-live="polite">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="recommendations-page-main">
        <div className="recommendations-page-container">
          {/* Header & Meta */}
          <header className="advisor-header">
            <div className="advisor-header-content">
              <h1 className="advisor-title">AI Course Advisor</h1>
              <p className="advisor-subtitle">
                Describe your career aspirations or the skills you want to build. Our advisor analyzes
                your objectives to personalize your curriculum.
              </p>
            </div>

            {/* Debug budget tracking (shown only when ?debug=1 is appended) */}
            {isDebug && usage && (
              <div className="advisor-budget-card" title="OpenAI API budget tracking (?debug=1)">
                <div className="budget-card-header">
                  <span className="material-symbols-outlined budget-icon">bolt</span>
                  <span className="budget-title">Quota Monitor</span>
                </div>
                <div className="budget-stats">
                  <span className="budget-count">{usage.count}</span>
                  <span className="budget-limit">/ {usage.limit} calls</span>
                </div>
                <div className="budget-progress-track">
                  <div
                    className="budget-progress-bar"
                    style={{
                      width: `${Math.min(100, Math.max(5, (usage.count / usage.limit) * 100))}%`,
                    }}
                  />
                </div>
                <span className="budget-remaining-text">{usage.remaining} remaining</span>
              </div>
            )}
          </header>

          {/* Prompt Input Form */}
          <section className="advisor-input-section" aria-label="Course Preference Input">
            <form onSubmit={handleSubmit} className="advisor-form">
              <div className="advisor-textarea-wrap">
                <label htmlFor="course-advisor-prompt" className="advisor-input-label">
                  What skills or career goals are you pursuing?
                </label>
                <div className="advisor-input-box">
                  <textarea
                    id="course-advisor-prompt"
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (activePromptLabel) setActivePromptLabel(null);
                    }}
                    placeholder="e.g. I want to build robust backend APIs with TypeScript and deploy them into production, or I want to master neural networks..."
                    rows={3}
                    maxLength={300}
                    disabled={isPending || isRateLimited}
                    aria-describedby="advisor-input-counter"
                  />

                  {prompt && (
                    <button
                      type="button"
                      className="advisor-clear-btn"
                      onClick={handleClear}
                      aria-label="Clear prompt text"
                      title="Clear text"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  )}
                </div>

                <div className="advisor-input-footer">
                  <div className="advisor-validation-msg" id="advisor-input-validation">
                    {prompt.trim().length > 0 && !validation.isValid && (
                      <span className="validation-error">
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                          info
                        </span>
                        {validation.error}
                      </span>
                    )}
                    {is400BadInput && (
                      <span className="validation-error">
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                          warning
                        </span>
                        {apiError?.message}
                      </span>
                    )}
                  </div>
                  <div
                    id="advisor-input-counter"
                    className={`advisor-char-counter ${
                      charCount > 280 ? 'warn' : charCount >= 3 ? 'valid' : ''
                    }`}
                  >
                    {charCount}/300 characters
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="advisor-actions">
                <button
                  type="submit"
                  className="btn-advisor-submit"
                  disabled={!validation.isValid || isPending || isRateLimited}
                >
                  {isPending ? (
                    <>
                      <span className="advisor-spinner" aria-hidden="true" />
                      <span>Analyzing Curricula...</span>
                    </>
                  ) : isRateLimited ? (
                    <>
                      <span className="material-symbols-outlined">timer</span>
                      <span>Cooldown ({rateLimitCooldown}s)</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">auto_awesome</span>
                      <span>Get Recommendations</span>
                    </>
                  )}
                </button>

                <Link to="/courses" className="btn-advisor-browse">
                  Browse All Courses
                </Link>
              </div>
            </form>

            {/* Quick Prompts / Starter Chips (Safe: Populates input, does NOT auto-submit) */}
            <div className="quick-prompts-bar">
              <span className="quick-prompts-title">Inspirations (click to fill):</span>
              <div className="quick-prompts-list">
                {QUICK_PROMPTS.map((quick) => (
                  <button
                    key={quick.label}
                    type="button"
                    className={`quick-prompt-chip ${
                      activePromptLabel === quick.label ? 'active' : ''
                    }`}
                    onClick={() => handleQuickPromptClick(quick)}
                    disabled={isPending || isRateLimited}
                  >
                    <span className="material-symbols-outlined chip-icon">{quick.icon}</span>
                    <span>{quick.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Results / Status Section */}
          <section className="advisor-results-section" aria-live="polite">
            {/* Thinking / Loading State */}
            {isPending && (
              <div className="advisor-state-card thinking">
                <div className="thinking-pulse-ring" />
                <div className="thinking-content">
                  <h3>Consulting AI Course Advisor</h3>
                  <p>
                    Matching your objectives against active course syllabi, prerequisites, and learning
                    outcomes...
                  </p>
                </div>
                <div className="advisor-skeleton-grid">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="advisor-skeleton-card">
                      <div className="skeleton-bar title-bar" />
                      <div className="skeleton-bar text-bar" />
                      <div className="skeleton-bar reason-bar" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error States */}
            {isError && !isPending && (
              <div className="advisor-state-card error-card">
                <div className="error-icon-box">
                  <span className="material-symbols-outlined">error_outline</span>
                </div>
                <div className="error-text">
                  {is403Forbidden ? (
                    <>
                      <h3>AI advisor is for students</h3>
                      <p>
                        Instructor accounts manage and author courses. To receive student recommendations,
                        please sign in with a student profile.
                      </p>
                      <Link to="/dashboard" className="btn-retry">
                        Go to Instructor Dashboard
                      </Link>
                    </>
                  ) : isRateLimited ? (
                    <>
                      <h3>Rate Limit Active</h3>
                      <p>
                        Too many requests. Please wait {rateLimitCooldown} seconds before submitting
                        again.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3>Notice</h3>
                      <p>{apiError?.message || error?.message || 'Unable to retrieve course recommendations.'}</p>
                      {isNetworkOrTimeout && (
                        <p className="error-network-note">
                          Note: A network timeout occurred. This attempt may have contacted the server.
                        </p>
                      )}
                      <button
                        type="button"
                        className="btn-retry"
                        onClick={() => handleSubmit()}
                        disabled={!validation.isValid || isRateLimited}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          refresh
                        </span>
                        <span>Try Again</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations Output */}
            {activeResult && !isPending && (
              <div className="advisor-output-container">
                {/* 1. State: 200, ai, courses found */}
                {activeResult.source === 'ai' && activeResult.courses.length > 0 && (
                  <div className="recommendation-source-banner source-ai">
                    <div className="source-banner-left">
                      <span className="material-symbols-outlined banner-status-icon">
                        verified
                      </span>
                      <div>
                        <div className="source-banner-title">Personalized AI Suggestions</div>
                        <p className="source-banner-desc">{activeResult.summary}</p>
                      </div>
                    </div>
                    <span className="source-tag">AI Curated</span>
                  </div>
                )}

                {/* 2. State: 200, ai, empty list */}
                {activeResult.source === 'ai' && activeResult.courses.length === 0 && (
                  <div className="advisor-state-card empty-results">
                    <span className="material-symbols-outlined empty-icon">sentiment_dissatisfied</span>
                    <h3>Nothing in our catalog fits this goal</h3>
                    <p>{activeResult.summary || 'Try adjusting your prompt with broader technical keywords.'}</p>
                    <Link to="/courses" className="btn-browse-fallback">
                      Browse Full Course Directory
                    </Link>
                  </div>
                )}

                {/* 3. State: 200, fallback, budget_exhausted */}
                {activeResult.source === 'fallback' &&
                  (activeResult.fallbackReason === 'budget_exhausted' ||
                    activeResult.meta?.fallbackReason === 'budget_exhausted') &&
                  activeResult.courses.length > 0 && (
                    <div className="recommendation-source-banner source-fallback">
                      <div className="source-banner-left">
                        <span className="material-symbols-outlined banner-status-icon">
                          pause_circle
                        </span>
                        <div>
                          <div className="source-banner-title">
                            AI suggestions are paused, here are keyword matches
                          </div>
                          <p className="source-banner-desc">{activeResult.summary}</p>
                        </div>
                      </div>
                      <span className="source-tag">Keyword Match</span>
                    </div>
                  )}

                {/* 4. State: 200, fallback, other reason */}
                {activeResult.source === 'fallback' &&
                  activeResult.fallbackReason !== 'budget_exhausted' &&
                  activeResult.meta?.fallbackReason !== 'budget_exhausted' &&
                  activeResult.courses.length > 0 && (
                    <div className="recommendation-source-banner source-fallback">
                      <div className="source-banner-left">
                        <span className="material-symbols-outlined banner-status-icon">
                          info
                        </span>
                        <div>
                          <div className="source-banner-title">
                            AI is unavailable right now, here are keyword matches
                          </div>
                          <p className="source-banner-desc">{activeResult.summary}</p>
                        </div>
                      </div>
                      <span className="source-tag">Catalog Results</span>
                    </div>
                  )}

                {/* 5. State: 200, empty (or fallback with 0 courses) */}
                {(activeResult.source === 'empty' ||
                  (activeResult.source === 'fallback' && activeResult.courses.length === 0)) && (
                  <div className="advisor-state-card empty-results">
                    <span className="material-symbols-outlined empty-icon">school</span>
                    <h3>No courses to recommend</h3>
                    <p>
                      {activeResult.summary ||
                        'Our catalog currently has no matching courses, or you are already enrolled in all applicable courses.'}
                    </p>
                    <Link to="/courses" className="btn-browse-fallback">
                      Browse All Courses
                    </Link>
                  </div>
                )}

                {/* Course Grid rendering reusable CourseCard */}
                {activeResult.courses.length > 0 && (
                  <div className="recommended-courses-grid">
                    {activeResult.courses.map((course, idx) => (
                      <CourseCard
                        key={course._id || idx}
                        course={course}
                        rankBadge={`Suggestion #${idx + 1}`}
                        reasoningSlot={
                          /* Render reasoning slot ONLY when a valid non-empty reason string exists */
                          course.reason && course.reason.trim() ? (
                            <div className="advisor-reason-bubble">
                              <div className="reason-header">
                                <span className="material-symbols-outlined reason-icon">
                                  tips_and_updates
                                </span>
                                <span>Why this course:</span>
                              </div>
                              <p className="reason-content">{course.reason}</p>
                            </div>
                          ) : undefined
                        }
                        onEnrollSuccess={handleEnrollSuccess}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default RecommendationsPage;
