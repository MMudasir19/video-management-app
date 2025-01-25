import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Importing routing components
import Autoplay from "./components/Autoplay"; // Import Autoplay component (public route)
import VideosAdmin from "./components/VideosAdmin"; // Import VideosAdmin component (protected route)
import VideoStats from "./components/VideoStats"; // Import VideoStats component (protected route)
import { useAppSelector } from "./redux/config/configStore";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  // Use Redux state to check if user is authenticated
  const { user } = useAppSelector((state) => state.user);

  // If authenticated, render the children component; otherwise, redirect to home
  return user !== "" ? children : <Navigate to="/" replace />;
};


const App: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);
  return (
    <Router>
      <Routes>
        {/* Public Route: The home page component is accessible to all users */}
        <Route index path="/" element={user !== "" ? <Navigate to={"/admin"} /> : <Autoplay />} />

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
