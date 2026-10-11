import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCourse } from '../../hooks/useCourses.js';
import { createCourseSchema } from '../../schemas/courseSchemas.js';
import './CreateCourseScreen.css';

interface CreateCourseScreenProps {
  onBackToHome?: () => void;
  onBackToDashboard?: () => void;
  currentUser?: { username: string; role: string } | null;
  onNavigateToAuth?: (mode: 'login' | 'register') => void;
}

export function CreateCourseScreen({
  onBackToHome,
  onBackToDashboard,
  currentUser: _currentUser,
}: CreateCourseScreenProps = {}) {
  const navigate = useNavigate();
  const createCourseMutation = useCreateCourse();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleReturnToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else if (onBackToHome) {
      onBackToHome();
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handlePublish();
  };

  const handlePublish = () => {
    const parseResult = createCourseSchema.safeParse({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      content: content.trim(),
    });

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Please fill in all required fields';
      showToast(firstError);
      return;
    }

    createCourseMutation.mutate(
      parseResult.data,
      {
        onSuccess: () => {
          showToast('Course module published to curriculum!');
          setTimeout(() => {
            handleReturnToDashboard();
          }, 600);
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Failed to publish course');
        },
      }
    );
  };

  return (
    <div className="create-course-page">
      {/* Sub-Header Breadcrumb Bar */}
      <div className="course-studio-breadcrumb-bar">
        <div className="breadcrumb-bar-inner">
          <span
            className="breadcrumb-link"
            onClick={handleReturnToDashboard}
          >
            Courses
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">New Content</span>
        </div>
      </div>

      {/* Main Form Content */}
      <main className="course-studio-main">
        <div className="course-studio-container">
          {/* Header Row */}
          <div className="studio-title-row">
            <div className="studio-title-group">
              <h1>Create Course Content</h1>
            </div>
          </div>

          {/* Form Card */}
          <form className="course-studio-card" onSubmit={handleSubmit} noValidate>
            {/* Title Field */}
            <div className="form-field-group">
              <label htmlFor="lessonTitle" className="form-field-label">
                <span>Title</span>
                <span className="label-required-asterisk" title="Required">
                  *
                </span>
              </label>
              <input
                id="lessonTitle"
                name="lessonTitle"
                type="text"
                className="studio-input"
                placeholder="Enter lesson title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category Field */}
            <div className="form-field-group">
              <label htmlFor="courseCategory" className="form-field-label">
                <span>Category</span>
                <span className="label-required-asterisk" title="Required">
                  *
                </span>
              </label>
              <input
                id="courseCategory"
                name="courseCategory"
                type="text"
                className="studio-input"
                placeholder="Enter course category (e.g. Engineering, Design, Business)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            {/* Description Field */}
            <div className="form-field-group">
              <label htmlFor="lessonDesc" className="form-field-label">
                <span>Description</span>
                <span className="label-required-asterisk" title="Required">
                  *
                </span>
              </label>
              <textarea
                id="lessonDesc"
                name="lessonDesc"
                className="studio-textarea-desc"
                rows={3}
                placeholder="Provide a brief overview of this course..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Content Field */}
            <div className="form-field-group">
              <label htmlFor="lessonContentArea" className="form-field-label">
                <span>Content</span>
                <span className="label-required-asterisk" title="Required">
                  *
                </span>
              </label>
              <textarea
                id="lessonContentArea"
                name="lessonContentArea"
                className="studio-textarea-content"
                rows={10}
                placeholder="Enter course content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>


            {/* Footer Buttons */}
            <div className="form-card-footer">
              <button
                type="button"
                className="btn-form-cancel"
                onClick={onBackToDashboard || onBackToHome}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-form-submit"
                disabled={createCourseMutation.isPending}
              >
                {createCourseMutation.isPending ? 'Publishing...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="course-studio-footer">
        <div className="studio-footer-inner">
          <div className="footer-brand-box">
            <div className="footer-mini-logo">M</div>
            <span className="footer-copyright">
              © 2025 Mentora Content Management. All rights reserved.
            </span>
          </div>

          <div className="footer-links-group">
            <a
              href="#curriculum-guidelines"
              className="footer-nav-link"
              onClick={(e) => e.preventDefault()}
            >
              Curriculum Guidelines
            </a>
            <a
              href="#creator-support"
              className="footer-nav-link"
              onClick={(e) => e.preventDefault()}
            >
              Creator Support
            </a>
          </div>
        </div>
      </footer>

      {/* Interactive Feedback Toast */}
      {toastMessage && (
        <div className="studio-floating-toast" role="status">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', color: '#6bd8cb' }}
          >
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default CreateCourseScreen;
