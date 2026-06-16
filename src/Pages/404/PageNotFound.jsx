import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaArrowLeft, 
  FaExclamationTriangle,
  FaSearch,
  FaQuestionCircle
} from 'react-icons/fa';
import './PageNotFound.scss';

const PageNotFound = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        {/* Animated Background Shapes */}
        <div className="not-found-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>

        <div className="not-found-content">
          {/* 404 Number with Animation */}
          <div className="not-found-number">
            <span className="digit digit-1">4</span>
            <span className="digit digit-2">
              <FaExclamationTriangle />
            </span>
            <span className="digit digit-3">4</span>
          </div>

          {/* Icon */}
          <div className="not-found-icon">
            <FaQuestionCircle />
          </div>

          {/* Message */}
          <h1 className="not-found-title">Page Not Found</h1>
          <p className="not-found-description">
            Oops! The page you're looking for doesn't exist or has been moved.
            <br />
            Let's get you back on track.
          </p>

          {/* Quick Links */}
          <div className="not-found-links">
            <button className="not-found-btn not-found-btn-primary" onClick={goHome}>
              <FaHome /> Go to Home
            </button>
            <button className="not-found-btn not-found-btn-secondary" onClick={goBack}>
              <FaArrowLeft /> Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="not-found-help">
            <p>You might want to try:</p>
            <div className="help-links">
              <span onClick={goHome}>🏠 Home</span>
              <span onClick={() => navigate('/login')}>🔐 Login</span>
            </div>
          </div>

          {/* Footer */}
          <div className="not-found-footer">
            <p>&copy; 2026 HRMS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;