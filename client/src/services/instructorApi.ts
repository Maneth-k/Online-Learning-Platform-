import type { ActionResult } from '../types/auth.js';
import type { Instructor, InstructorFilters, InstructorPagination } from '../types/instructor.js';
import { API_ROOT } from './apiConfig.js';

const API_BASE = `${API_ROOT}/api/instructors`;

function formatUsernameToName(username: string): string {
  if (!username) return 'Instructor';
  return username
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format raw instructor doc from API into frontend Instructor model.
 */
function formatInstructor(raw: any): Instructor {
  const email = raw.email || '';
  const username = raw.username || email;
  let displayName = raw.name;
  if (!displayName) {
    if (email) {
      const emailPrefix = email.split('@')[0];
      displayName = formatUsernameToName(emailPrefix);
    } else if (username) {
      displayName = formatUsernameToName(username);
    } else {
      displayName = 'Instructor';
    }
  }

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((word: string) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return {
    _id: raw._id,
    email: raw.email,
    username,
    name: displayName,
    role: 'instructor',
    title: raw.title || 'Instructor',
    bio: raw.bio || '',
    avatar: raw.avatar || '',
    avatarInitials: initials || 'IN',
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    scholarsCount: raw.totalStudents ? `${raw.totalStudents}` : '',
    coursesCount: Array.isArray(raw.courses) ? raw.courses.length : (raw.coursesCount || 0),
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    courses: Array.isArray(raw.courses) ? raw.courses : [],
    createdAt: raw.createdAt,
  };
}

/**
 * Fetch all instructors with optional search and category filters.
 */
export async function fetchInstructors(
  filters: InstructorFilters = {}
): Promise<{ instructors: Instructor[]; pagination?: InstructorPagination }> {
  const params = new URLSearchParams();
  if (filters.q && filters.q.trim()) {
    params.set('q', filters.q.trim());
  }
  if (filters.category && filters.category !== 'All') {
    params.set('category', filters.category);
  }
  if (filters.page) {
    params.set('page', filters.page.toString());
  }
  if (filters.limit) {
    params.set('limit', filters.limit.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch instructors: HTTP ${response.status} ${errorText}`);
  }

  const result: ActionResult<{
    instructors: any[];
    pagination: InstructorPagination;
  }> = await response.json();

  if (result.success && result.data && Array.isArray(result.data.instructors)) {
    const formatted = result.data.instructors.map(formatInstructor);
    return {
      instructors: formatted,
      pagination: result.data.pagination,
    };
  }

  return {
    instructors: [],
    pagination: {
      page: 1,
      limit: filters.limit || 12,
      totalInstructors: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

/**
 * Fetch a single instructor by ID.
 */
export async function fetchInstructorById(id: string): Promise<Instructor> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch instructor: HTTP ${response.status}`);
  }

  const result: ActionResult<{ instructor: any }> = await response.json();
  if (result.success && result.data?.instructor) {
    return formatInstructor(result.data.instructor);
  }

  throw new Error(result.message || 'Instructor not found');
}

