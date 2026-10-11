export interface InstructorCourseSummary {
  _id: string;
  title: string;
  category: string;
  description: string;
}

export interface Instructor {
  _id: string;
  username: string;
  name: string;
  role: 'instructor';
  title: string;
  bio: string;
  avatar?: string;
  avatarInitials: string;
  rating: number;
  scholarsCount: string;
  coursesCount: number;
  categories: string[];
  courses: InstructorCourseSummary[];
  createdAt?: string;
}

export interface InstructorFilters {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface InstructorPagination {
  page: number;
  limit: number;
  totalInstructors: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
