import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CourseCardMenu.css';

interface CourseCardMenuProps {
  courseId: string;
  courseTitle?: string;
  onViewStudents?: () => void;
  onEdit?: () => void;
  editUrl?: string;
  onDelete?: () => void;
  align?: 'right' | 'left';
}

export function CourseCardMenu({
  courseId: _courseId,
  courseTitle: _courseTitle,
  onViewStudents,
  onEdit,
  editUrl,
  onDelete,
  align = 'right',
}: CourseCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="course-card-menu-root" ref={menuRef}>
      <button
        type="button"
        className={`course-card-menu-trigger ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Course actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="More options"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          more_vert
        </span>
      </button>

      {isOpen && (
        <div
          className={`course-card-menu-dropdown align-${align}`}
          role="menu"
          onClick={(e) => e.stopPropagation()}
        >
          {onViewStudents && (
            <button
              type="button"
              className="course-card-menu-item"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
                onViewStudents();
              }}
            >
              <span className="material-symbols-outlined menu-item-icon">group</span>
              <span>Enrolled Students</span>
            </button>
          )}

          {editUrl ? (
            <Link
              to={editUrl}
              className="course-card-menu-item"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <span className="material-symbols-outlined menu-item-icon">edit</span>
              <span>Edit Course</span>
            </Link>
          ) : onEdit ? (
            <button
              type="button"
              className="course-card-menu-item"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
                onEdit();
              }}
            >
              <span className="material-symbols-outlined menu-item-icon">edit</span>
              <span>Edit Course</span>
            </button>
          ) : null}

          {(onViewStudents || editUrl || onEdit) && onDelete && (
            <div className="course-card-menu-divider" role="separator" />
          )}

          {onDelete && (
            <button
              type="button"
              className="course-card-menu-item menu-item-danger"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
                onDelete();
              }}
            >
              <span className="material-symbols-outlined menu-item-icon">delete</span>
              <span>Delete Course</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseCardMenu;
