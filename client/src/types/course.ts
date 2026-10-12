export interface Course {
  _id: string;
  title: string;
  description: string;
  content: string;
  category?: string;
  instructor: string | { _id: string; email?: string; username?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  content: string;
  category?: string;
}

export interface CourseQueryFilters {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}
