import React from 'react';

// Basic styles for the button
const buttonStyle = {
  display: 'inline-block',
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: '500',
  color: '#fff',
  backgroundColor: '#4285F4', // Google's brand color
  border: 'none',
  borderRadius: '6px',
  textDecoration: 'none',
  cursor: 'pointer',
  boxShadow: '0 2px 4px 0 rgba(0,0,0,0.25)'
};

const LoginPage = () => {
  const handleLogin = () => {
    // Redirect the user to the backend's Google auth route
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Login to Your Account</h1>
      <p>Please log in using your Google account to continue.</p>
      <button onClick={handleLogin} style={buttonStyle}>
        Login with Google
      </button>
    </div>
  );
};

export default LoginPage;