import { useContext, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./authContext/authFile";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  if (auth.loading) {
    return <div>Loading...</div>;
  }

  if (!auth.loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
