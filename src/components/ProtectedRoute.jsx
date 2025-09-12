// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // <-- confirm this path

export default function ProtectedRoute({ children }) {
  // If the provider isn't mounted (ctx === undefined), don't crash.
  const ctx = useContext(AuthContext);

  // No provider found: just render children (non-blocking)
  if (!ctx) return children;

  const { user, loading } = ctx;
  const location = useLocation();

  if (loading) return null; // or a spinner
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
