import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserTie,
  FaCalendarCheck,
  FaBriefcase,
  FaMoneyBillWave,
  FaStar,
  FaTasks,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowRight,
  FaUsers , 
  FaCheckCircle 
} from 'react-icons/fa';
import './Home.scss';

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <FaUserTie />,
      title: 'Employee Management',
      description: 'Manage employee profiles, roles, departments, and all employee-related information in one place.'
    },
    {
      icon: <FaCalendarCheck />,
      title: 'Attendance Tracking',
      description: 'Track daily attendance, mark check-in/out, and monitor attendance patterns with ease.'
    },
    {
      icon: <FaBriefcase />,
      title: 'Leave Management',
      description: 'Apply for leaves, approve requests, and track leave balances for all employees.'
    },
    {
      icon: <FaMoneyBillWave />,
      title: 'Payroll Management',
      description: 'Calculate salaries, manage deductions, and generate payslips automatically.'
    },
    {
      icon: <FaStar />,
      title: 'Performance Reviews',
      description: 'Conduct performance evaluations, track ratings, and monitor employee growth.'
    },
    {
      icon: <FaTasks />,
      title: 'Task Management',
      description: 'Assign tasks to teams, track progress, and ensure timely completion of work.'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaUsers />
              <span>HRMS v2.0</span>
            </div>
            <h1 className="hero-title">
              HRMS
              <span className="hero-title-highlight"> Human Resource Management System</span>
            </h1>
            <p className="hero-description">
              Simplify your workforce management with our comprehensive HR solution.
              Manage employees, attendance, leaves, payroll, and performance all in one platform.
            </p>
            <div className="hero-buttons">
              <button className="hero-btn-primary" onClick={handleLoginClick}>
                <FaArrowRight /> Employee Login
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">100%</span>
                <span className="hero-stat-label">Digital HR</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">24/7</span>
                <span className="hero-stat-label">Access</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">Secure</span>
                <span className="hero-stat-label">Platform</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Everything You Need to Manage HR</h2>
            <p>Powerful features designed to streamline your HR operations</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <span className="section-badge">About HRMS</span>
              <h2>Streamline Your HR Operations</h2>
              <p>
                HRMS is a comprehensive human resource management system designed to 
                streamline employee management, attendance tracking, leave management, 
                payroll processing, and performance evaluation.
              </p>
              <p>
                Our mission is to simplify HR operations and help organizations manage 
                their workforce efficiently, saving time and reducing administrative overhead.
              </p>
              <div className="about-features">
                <div className="about-feature-item">
                  <FaCheckCircle />
                  <span>Complete HR Solution</span>
                </div>
                <div className="about-feature-item">
                  <FaCheckCircle />
                  <span>Secure & Reliable</span>
                </div>
                <div className="about-feature-item">
                  <FaCheckCircle />
                  <span>Easy to Use</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Contact</span>
            <h2>Get in Touch</h2>
            <p>Have questions? We're here to help</p>
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon"><FaEnvelope /></div>
              <h4>Email</h4>
              <p>hr@hrms.com</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon"><FaPhone /></div>
              <h4>Phone</h4>
              <p>+91 XXXXXXXXXX</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon"><FaMapMarkerAlt /></div>
              <h4>Address</h4>
              <p>Your Company Address, City - 400001</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Login to your account and start managing your workforce efficiently.</p>
            <button className="cta-btn" onClick={handleLoginClick}>
              <FaArrowRight /> Employee Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>HRMS</h3>
              <p>Human Resource Management System</p>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
              <button className="footer-login-btn" onClick={handleLoginClick}>Login</button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 HRMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;