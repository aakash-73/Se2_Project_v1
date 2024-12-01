import React, { useState } from 'react';
import axios from 'axios';

function Login({ toggleSignUp, setIsLoggedIn, setUserType, setUsername, setIsGuest }) {
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/login', loginData, { withCredentials: true })
      .then((response) => {
        alert(response.data.message);
        setIsLoggedIn(true);
        setUserType(response.data.user_type);
        setUsername(response.data.username);
        localStorage.setItem('user_type', response.data.user_type);
        localStorage.setItem('username', response.data.username);
      })
      .catch((error) => {
        console.error("Login failed:", error.response?.data?.error || 'Failed to login');
        alert(error.response?.data?.error || 'Failed to login');
      });
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setIsLoggedIn(true);
    setUserType('guest');
    setUsername('Guest');
    localStorage.setItem('user_type', 'guest');
    localStorage.setItem('username', 'Guest');
  };

  return (
    <div className="card p-4">
      <h1 className="text-center">Welcome to Syllabus ChatBot</h1>
      <h2 className="text-center">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            name="username" 
            className="form-control" 
            placeholder="Username or Email"
            value={loginData.username} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="form-group">
          <input 
            type="password" 
            name="password" 
            className="form-control" 
            placeholder="Password" 
            value={loginData.password} 
            onChange={handleChange} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Login</button>
        <p className="mt-2 text-center">
          New user? <span className="text-primary" style={{ cursor: 'pointer' }} onClick={toggleSignUp}>Sign Up</span>
        </p>
        <p className="mt-2 text-center">
          <span className="text-primary" style={{ cursor: 'pointer' }} onClick={handleGuestLogin}>Guest Login</span>
        </p>
      </form>
    </div>
  );
}

export default Login;
