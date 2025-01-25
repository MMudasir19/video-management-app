import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Importing routing components
import Autoplay from "./components/Autoplay"; // Import Autoplay component (public route)
import VideosAdmin from "./components/VideosAdmin"; // Import VideosAdmin component (protected route)
import VideoStats from "./components/VideoStats"; // Import VideoStats component (protected route)

// Mock authentication state (Replace with your actual authentication logic)
const isAuthenticated = () => {
  // Check if 'auth' in localStorage is "true" (indicating the user is authenticated)
  return localStorage.getItem("auth") === "true";
};

// Protected Route Component
// This component wraps the protected routes and checks if the user is authenticated
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  // If authenticated, render the child component, otherwise redirect to home page
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route: The home page component is accessible to all users */}
        <Route index path="/" element={<Autoplay />} />

        {/* Protected Routes: Only accessible by authenticated users */}
        <Route
          path="/admin"
          element={
            // VideosAdmin route is wrapped with ProtectedRoute to ensure only authenticated users can access it
            <ProtectedRoute>
              <VideosAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats/:id"
          element={
            // VideoStats route is wrapped with ProtectedRoute to ensure only authenticated users can access it
            <ProtectedRoute>
              <VideoStats />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
