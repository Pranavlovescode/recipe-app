import React, { useState } from 'react';
import './LoginPage.css'; // Import the CSS file

const LoginPage = ({ handleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Retrieve user from localStorage
    const storedUser = localStorage.getItem(username);
    
    if (!storedUser) {
      alert('User does not exist. Please sign up first.');
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    // Validate the password
    if (parsedUser.password === password) {
      handleLogin();
      alert('Login successful!');
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
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
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
