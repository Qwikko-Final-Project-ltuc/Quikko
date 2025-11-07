import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found — redirecting to login");
    return <Navigate to="/customer/login" replace />;
  }

  return children;
}
