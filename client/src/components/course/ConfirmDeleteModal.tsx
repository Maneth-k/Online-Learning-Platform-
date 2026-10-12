import { useEffect } from 'react';
import './ConfirmDeleteModal.css';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  courseTitle: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  courseTitle,
  isDeleting = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="confirm-modal-card">
        <div className="confirm-modal-icon-badge">
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
            delete_forever
          </span>
        </div>

        <h3 id="confirm-delete-title" className="confirm-modal-title">
          Delete Course
        </h3>

        <p className="confirm-modal-desc">
          Are you sure you want to delete <strong className="confirm-modal-course-name">"{courseTitle}"</strong>?
          This action will permanently remove the course syllabus and its student enrollment records.
        </p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="btn-confirm-cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-confirm-delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="confirm-btn-spinner" aria-hidden="true" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  delete
                </span>
                <span>Delete Course</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
