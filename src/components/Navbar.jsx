// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? " active" : ""}`; // or whatever your CSS uses

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" end className={linkClass}>Create Campaign</NavLink>
        <NavLink to="/history" className={linkClass}>History</NavLink>
      </div>
      <div className="nav-right">
        <NavLink to="/login" className={linkClass}>Logout</NavLink>
      </div>
    </nav>
  );
}
