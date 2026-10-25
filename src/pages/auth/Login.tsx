import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import AuthShell from "../../components/AuthShell";
import { useAuth } from "../../auth/AuthContext";
import { LOGIN } from "../../graphql/operations";
import { normalizeRole } from "../../lib/session";
import { notifyError } from "../../lib/alerts";

const Login = () => {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading }] = useMutation(LOGIN);

  if (session) {
    return <Navigate to={session.isChangePassword ? "/cambiar-clave" : "/inicio"} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await login({ variables: { email: email.trim(), password } });
      const result = data?.login;
      if (!result?.token) {
        throw new Error("Respuesta inválida");
      }
      signIn({
        token: result.token,
        id: Number(result.id),
        role: normalizeRole(result.role),
        firstName: result.firstName,
        isChangePassword: Boolean(result.isChangePassword),
      });
      navigate(result.isChangePassword ? "/cambiar-clave" : "/inicio");
    } catch {
      notifyError("El correo o la contraseña no son correctos.", "No se pudo iniciar sesión");
    }
  };

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Ingresa con tu cuenta institucional"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="link link-primary font-medium">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="form-control w-full">
          <span className="label py-1">
            <span className="field-label">Correo electrónico</span>
          </span>
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="nombre@colegio.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="form-control w-full">
          <span className="label py-1">
            <span className="field-label">Contraseña</span>
          </span>
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <span className="label py-1">
            <Link to="/recuperar" className="label-text-alt link link-primary">
              ¿Olvidaste tu contraseña?
            </Link>
          </span>
        </label>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-sm" />}
          Iniciar sesión
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
