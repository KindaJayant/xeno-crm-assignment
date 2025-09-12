// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./global.css";  

/// ❌ REMOVE or GUARD any global call like this:
// chat.init({...})  // <-- this throws

// ✅ Safe guard (or delete entirely)
if (typeof window !== "undefined" && window.chat?.init) {
  window.chat.init();
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ Router must wrap everything that uses NavLink/useLocation */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
