import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/auth";
import Homepage from "./pages/Homepage";
import AdminPage from "./pages/AdminPage";

const App = () => {
  // Check if user is logged in and their role
  const getUserRole = () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.role;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Protected routes */}
        <Route
          path="/homepage"
          element={
            isAuthenticated() && getUserRole() !== "admin" ?
              <Homepage /> :
              <Navigate to="/" />
          }
        />
        <Route
          path="/admin"
          element={
            isAuthenticated() && getUserRole() === "admin" ?
              <AdminPage /> :
              <Navigate to="/" />
          }
        />

        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;