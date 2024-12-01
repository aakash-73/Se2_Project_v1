import React, { useState } from 'react';
import axios from 'axios';

function Register({ toggleSignUp }) {
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    user_type: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const lengthRequirement = password.length >= 8;
    const uppercaseRequirement = /[A-Z]/.test(password);
    const specialCharRequirement = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!lengthRequirement) {
      return 'Password must be at least 8 characters long.';
    }
    if (!uppercaseRequirement) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!specialCharRequirement) {
      return 'Password must contain at least one special character.';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const passwordError = validatePassword(registerData.password);
    if (passwordError) {
      setErrorMessage(passwordError);
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirm_password) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    axios.post('http://localhost:5000/register', registerData)
      .then((response) => {
        alert(response.data.message);
        setLoading(false);

        // Automatically switch to login if not pending
        if (response.status !== 202) {
          toggleSignUp();
        }
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage(error.response?.data?.error || 'Failed to register');
      });
  };

  return (
    <div className="card p-4">
      <h2 className="text-center">Sign Up</h2>
      {errorMessage && (
        <div className="alert alert-danger text-center">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="first_name"
            className="form-control"
            placeholder="First Name"
            value={registerData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            name="last_name"
            className="form-control"
            placeholder="Last Name"
            value={registerData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={registerData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group position-relative">
          <input
            type={passwordVisible ? 'text' : 'password'}
            name="password"
            className="form-control"
            placeholder="Password"
            value={registerData.password}
            onChange={handleChange}
            required
          />
          <span
            className="eye-icon"
            onClick={() => setPasswordVisible(!passwordVisible)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: 'gray',
              fontSize: '1.2em',
            }}
          >
            {passwordVisible ? '👁' : '👁️‍🗨️'}
          </span>
        </div>
        <div className="form-group position-relative">
          <input
            type={confirmPasswordVisible ? 'text' : 'password'}
            name="confirm_password"
            className="form-control"
            placeholder="Confirm Password"
            value={registerData.confirm_password}
            onChange={handleChange}
            required
          />
          <span
            className="eye-icon"
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: 'gray',
              fontSize: '1.2em',
            }}
          >
            {confirmPasswordVisible ? '👁' : '👁️‍🗨️'}
          </span>
        </div>
        <div className="form-group">
          <select
            name="user_type"
            className="form-control"
            value={registerData.user_type}
            onChange={handleChange}
            required
          >
            <option value="">Select User Type</option>
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="mt-2 text-center">
          Already have an account?{' '}
          <span
            className="text-primary"
            style={{ cursor: 'pointer' }}
            onClick={toggleSignUp}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
