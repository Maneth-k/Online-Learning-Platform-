import { useEffect } from 'react';
import './ConfirmUnenrollModal.css';

interface ConfirmUnenrollModalProps {
  isOpen: boolean;
  courseTitle: string;
  isUnenrolling?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmUnenrollModal({
  isOpen,
  courseTitle,
  isUnenrolling = false,
  onConfirm,
  onCancel,
}: ConfirmUnenrollModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isUnenrolling) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUnenrolling, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-unenroll-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUnenrolling) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-unenroll-title"
    >
      <div className="confirm-unenroll-card">
        <div className="confirm-unenroll-icon-badge">
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
            person_remove
          </span>
        </div>

        <h3 id="confirm-unenroll-title" className="confirm-unenroll-title">
          Unenroll from Course
        </h3>

        <p className="confirm-unenroll-desc">
          Are you sure you want to unenroll from{' '}
          <strong className="confirm-unenroll-course-name">"{courseTitle}"</strong>?
          You will be removed from the course roster and will need to re-enroll if you wish to rejoin.
        </p>

        <div className="confirm-unenroll-actions">
          <button
            type="button"
            className="btn-confirm-unenroll-cancel"
            onClick={onCancel}
            disabled={isUnenrolling}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-confirm-unenroll-submit"
            onClick={onConfirm}
            disabled={isUnenrolling}
          >
            {isUnenrolling ? (
              <>
                <span className="unenroll-spinner" />
                <span>Unenrolling...</span>
              </>
            ) : (
              <span>Yes, Unenroll</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmUnenrollModal;
