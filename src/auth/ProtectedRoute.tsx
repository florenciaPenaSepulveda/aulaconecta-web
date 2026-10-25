import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Role } from "../lib/session";
import Layout from "../components/Layout";

interface Props {
  roles?: Role[];
}

const ProtectedRoute = ({ roles }: Props) => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/" replace />;
  }
  if (session.isChangePassword) {
    return <Navigate to="/cambiar-clave" replace />;
  }
  if (roles && !roles.includes(session.role)) {
    return <Navigate to="/inicio" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;
