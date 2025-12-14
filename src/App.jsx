import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./components/auth";
import Homepage from "./pages/Homepage";
import AdminPage from "./pages/AdminPage";

const App = () => {
  const { isAuthenticated, userRole } = useAuth();

  // Custom component for the root route that handles redirects
  const RootRoute = () => {
    // If already authenticated, redirect based on role
    if (isAuthenticated && userRole) {
      if (userRole === "admin") {
        return <Navigate to="/admin" />;
      } else {
        return <Navigate to="/homepage" />;
      }
    }

    // Otherwise show the auth page
    return <AuthPage />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRoute />} />

        {/* Protected routes */}
        <Route
          path="/homepage"
          element={
            isAuthenticated && userRole && userRole !== "admin" ? <Homepage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/admin"
          element={
            isAuthenticated && userRole === "admin" ? <AdminPage /> : <Navigate to="/" />
          }
        />

        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;