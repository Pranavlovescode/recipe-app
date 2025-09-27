import React, { useState } from 'react';
import './SignUpPage.css'; // Import the CSS file

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if the user already exists in localStorage
    const existingUser = localStorage.getItem(username);
    if (existingUser) {
      alert('User already exists. Please log in.');
      return;
    }

    // Save the user to localStorage
    localStorage.setItem(username, JSON.stringify({ username, password }));
    alert('Signup successful! Please log in.');
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
