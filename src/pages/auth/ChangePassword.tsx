import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import AuthShell from "../../components/AuthShell";
import { useAuth } from "../../auth/AuthContext";
import { CHANGE_PASSWORD } from "../../graphql/operations";
import { errorMessage, notifyError, notifySuccess, notifyWarning } from "../../lib/alerts";

const ChangePassword = () => {
  const { session, markPasswordChanged } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      notifyWarning("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      notifyWarning("Las contraseñas no coinciden.");
      return;
    }
    try {
      await changePassword({ variables: { newPassword: password } });
      markPasswordChanged();
      notifySuccess("Contraseña actualizada");
      navigate("/inicio");
    } catch (error) {
      notifyError(errorMessage(error));
    }
  };

  return (
    <AuthShell
      title="Cambiar contraseña"
      subtitle={
        session.isChangePassword
          ? "Por seguridad debes definir una nueva contraseña antes de continuar."
          : "Define una nueva contraseña para tu cuenta."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="form-control">
          <span className="label py-1">
            <span className="field-label">Nueva contraseña</span>
          </span>
          <input
            type="password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <label className="form-control">
          <span className="label py-1">
            <span className="field-label">Confirmar contraseña</span>
          </span>
          <input
            type="password"
            className="input input-bordered w-full"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <div className="flex gap-2">
          {!session.isChangePassword && (
            <button type="button" className="btn btn-ghost flex-1" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
            {loading && <span className="loading loading-spinner loading-sm" />}
            Guardar contraseña
          </button>
        </div>
      </form>
    </AuthShell>
  );
};

export default ChangePassword;
