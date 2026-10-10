export interface Course {
  _id: string;
  title: string;
  description: string;
  content: string;
  instructor: string | { _id: string; username: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  content: string;
}
