// src/Context/PublicRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Authcontext";

const PublicRoute = ({ children, restrictToLoggedIn = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user && restrictToLoggedIn) {
    // If user is logged in, redirect based on role
    if (user.isAdmin) {
      return <Navigate to="/admin/gallery" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Not logged in → allow access to public page (like /login)
  return children;
};

export default PublicRoute;