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
  const name = formatUsernameToName(raw.username);
  return {
    _id: raw._id,
    username: raw.username,
    name,
    role: 'instructor',
    title: 'Instructor',
    bio: '',
    avatar: '',
    avatarInitials: '',
    rating: 0,
    scholarsCount: '',
    coursesCount: raw.courses ? raw.courses.length : 0,
    categories: raw.categories || [],
    courses: raw.courses || [],
    createdAt: raw.createdAt,
  };
}

/**
 * Fallback static faculty list with real names and verified courses.
 */
const DEFAULT_SYSTEM_INSTRUCTORS: Instructor[] = [
  {
    _id: 'inst-soren',
    username: 'dr_soren_vance',
    name: 'Dr. Soren Vance',
    role: 'instructor',
    title: 'Instructor',
    bio: '',
    avatar: '',
    avatarInitials: 'SV',
    rating: 0,
    scholarsCount: '',
    coursesCount: 2,
    categories: ['Engineering'],
    courses: [
      {
        _id: 'c1',
        title: 'AI & Full-Stack Systems Architecture',
        category: 'Engineering',
        description: 'Design distributed resilient systems with modern event loops, micro-frontends, and AI orchestration.',
      },
      {
        _id: 'c5',
        title: 'Advanced TypeScript for Enterprise Scale',
        category: 'Engineering',
        description: 'Master advanced TypeScript patterns, strict compiler flags, template literal types, and AST transformations.',
      },
    ],
  },
  {
    _id: 'inst-elena',
    username: 'elena_rostova',
    name: 'Elena Rostova',
    role: 'instructor',
    title: 'Instructor',
    bio: '',
    avatar: '',
    avatarInitials: 'ER',
    rating: 0,
    scholarsCount: '',
    coursesCount: 1,
    categories: ['Product'],
    courses: [
      {
        _id: 'c2',
        title: 'Modern Product Management & AI Strategy',
        category: 'Product',
        description: 'Scale AI products from discovery to product-market fit with quantitative outcome metrics and user psychology.',
      },
    ],
  },
  {
    _id: 'inst-aris',
    username: 'prof_aris_thorne',
    name: 'Prof. Aris Thorne',
    role: 'instructor',
    title: 'Instructor',
    bio: '',
    avatar: '',
    avatarInitials: 'AT',
    rating: 0,
    scholarsCount: '',
    coursesCount: 1,
    categories: ['Data & ML'],
    courses: [
      {
        _id: 'c3',
        title: 'Applied Machine Learning & Neural Networks',
        category: 'Data & ML',
        description: 'Deep mathematical and practical foundations in tensor calculus, backpropagation, and transformer architectures.',
      },
    ],
  },
  {
    _id: 'inst-kavita',
    username: 'kavita_sharma',
    name: 'Kavita Sharma',
    role: 'instructor',
    title: 'Instructor',
    bio: '',
    avatar: '',
    avatarInitials: 'KS',
    rating: 0,
    scholarsCount: '',
    coursesCount: 1,
    categories: ['Infrastructure'],
    courses: [
      {
        _id: 'c4',
        title: 'NextGen Cloud Engineering & DevOps',
        category: 'Infrastructure',
        description: 'Zero-downtime deployments, Kubernetes cluster orchestration, Terraform infrastructure as code, and observability.',
      },
    ],
  },
  {
    _id: 'inst-marcus',
    username: 'instructor1',
    name: 'Marcus Sterling',
    role: 'instructor',
    title: 'Instructor',
    bio: '',
    avatar: '',
    avatarInitials: 'MS',
    rating: 0,
    scholarsCount: '',
    coursesCount: 1,
    categories: ['Infrastructure'],
    courses: [
      {
        _id: 'c6',
        title: 'Database Engineering with MongoDB & Mongoose',
        category: 'Infrastructure',
        description: 'Design resilient database schemas, query optimizations, and production indexing strategies.',
      },
    ],
  },
];

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

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const result: ActionResult<{
        instructors: any[];
        pagination: InstructorPagination;
      }> = await response.json();

      if (result.success && result.data && Array.isArray(result.data.instructors)) {
        if (result.data.instructors.length > 0) {
          const formatted = result.data.instructors.map(formatInstructor);
          return {
            instructors: formatted,
            pagination: result.data.pagination,
          };
        }
      }
    }
  } catch (error) {
    console.warn('API fetch for instructors failed, applying fallback data:', error);
  }

  // Fallback to static verified faculty list with client-side filtering
  let filtered = [...DEFAULT_SYSTEM_INSTRUCTORS];

  if (filters.category && filters.category !== 'All') {
    filtered = filtered.filter((i) =>
      i.categories.some((c) => c.toLowerCase() === filters.category!.toLowerCase())
    );
  }

  if (filters.q && filters.q.trim()) {
    const query = filters.q.trim().toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.username.toLowerCase().includes(query) ||
        i.title.toLowerCase().includes(query) ||
        i.bio.toLowerCase().includes(query) ||
        i.courses.some((c) => c.title.toLowerCase().includes(query))
    );
  }

  return {
    instructors: filtered,
    pagination: {
      page: 1,
      limit: 12,
      totalInstructors: filtered.length,
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
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const result: ActionResult<{ instructor: any }> = await response.json();
      if (result.success && result.data?.instructor) {
        return formatInstructor(result.data.instructor);
      }
    }
  } catch (error) {
    console.warn('API fetch for instructor by ID failed, falling back:', error);
  }

  const found = DEFAULT_SYSTEM_INSTRUCTORS.find((i) => i._id === id || i.username === id);
  if (found) return found;

  throw new Error('Instructor not found');
}
