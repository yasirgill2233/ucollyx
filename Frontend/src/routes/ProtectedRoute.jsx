import { Navigate, Outlet, useLocation } from "react-router-dom";
import useLocalStorage from "../hooks/custom/useLocalStorage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [user] = useLocalStorage('user', null);

  console.log(location, allowedRoles)
  
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute