import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Optional for styling

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const navigate = useNavigate();

  const handleProceed = () => {
    setShowEmailInput(true);
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      // Log email to backend
      const response = await fetch('http://localhost:5000/log_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Email logged successfully.');
        navigate('/pdfchat');
      } else {
        throw new Error('Failed to log email.');
      }
    } catch (error) {
      console.error('Error logging email:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="landing-page">
      <h1>Welcome to Syllabus Chatbot</h1>
      <p>Please click on proceed to get help with your syllabus.</p>
      {!showEmailInput && (
        <button className="btn btn-primary" onClick={handleProceed}>
          Proceed
        </button>
      )}
      {showEmailInput && (
        <div className="email-input-container">
          <p>Enter your email to proceed:</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button className="btn btn-success" onClick={handleEmailSubmit}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
