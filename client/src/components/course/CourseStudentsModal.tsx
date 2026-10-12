import { useEffect } from 'react';
import { CourseStudentsSection } from './CourseStudentsSection.js';
import type { Course } from '../../types/course.js';
import './CourseStudentsModal.css';

export interface CourseStudentsModalProps {
  course: Course;
  onClose: () => void;
}

export function CourseStudentsModal({ course, onClose }: CourseStudentsModalProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="students-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Enrolled students for ${course.title}`}
    >
      <div className="students-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="students-modal-top-bar">
          <div className="students-modal-course-badge">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              school
            </span>
            <span className="modal-course-title-text">{course.title}</span>
          </div>
          <button
            type="button"
            className="btn-close-students-modal"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              close
            </span>
          </button>
        </div>

        <CourseStudentsSection courseId={course._id} courseTitle={course.title} />
      </div>
    </div>
  );
}

export default CourseStudentsModal;
