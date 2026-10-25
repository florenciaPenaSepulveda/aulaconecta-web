import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import AuthShell from "../../components/AuthShell";
import { FORGOT_PASS } from "../../graphql/operations";
import { errorMessage, notifyError, notifyInfo } from "../../lib/alerts";

const ForgotPass = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [forgotPass, { loading }] = useMutation(FORGOT_PASS);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await forgotPass({ variables: { email: email.trim() } });
      await notifyInfo("Revisa tu correo", "Si el correo está registrado, te enviamos una contraseña temporal para ingresar.");
      navigate("/");
    } catch (error) {
      notifyError(errorMessage(error, "No se pudo enviar el correo de recuperación."));
    }
  };

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos una contraseña temporal a tu correo"
      footer={
        <Link to="/" className="link link-primary font-medium">
          Volver a iniciar sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="form-control">
          <span className="label py-1">
            <span className="field-label">Correo electrónico</span>
          </span>
          <input
            type="email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-sm" />}
          Enviar contraseña temporal
        </button>
      </form>
    </AuthShell>
  );
};

export default ForgotPass;
