import React from 'react';
import { NavLink } from 'react-router-dom';

// ✅ MAKE SURE this path matches your repo (usually exactly this)
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-left">
        {/* keep your original class names; only href -> to */}
        <NavLink to="/" className="nav-link">Create Campaign</NavLink>
        <NavLink to="/history" className="nav-link">History</NavLink>
      </div>

      <div className="nav-right">
        {/* keep logout as you had it (server route) */}
        <a href="/auth/logout" className="nav-link">Logout</a>
      </div>
    </header>
  );
}
