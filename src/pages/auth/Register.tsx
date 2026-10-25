import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import AuthShell from "../../components/AuthShell";
import { REGISTER } from "../../graphql/operations";
import { formatRut, isValidRut } from "../../lib/rut";
import { errorMessage, notifyError, notifySuccess, notifyWarning } from "../../lib/alerts";
import { passwordError } from "../../lib/password";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    rut: "",
    email: "",
    role: "teacher",
    password: "",
    confirm: "",
  });
  const [register, { loading }] = useMutation(REGISTER);

  const update = (field: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValidRut(form.rut)) {
      notifyWarning("El RUT ingresado no es válido.");
      return;
    }
    const problema = passwordError(form.password);
    if (problema) {
      notifyWarning(problema);
      return;
    }
    if (form.password !== form.confirm) {
      notifyWarning("Las contraseñas no coinciden.");
      return;
    }
    try {
      await register({
        variables: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          rut: form.rut,
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        },
      });
      notifySuccess("Cuenta creada. Ya puedes iniciar sesión.");
      navigate("/");
    } catch (error) {
      notifyError(errorMessage(error), "No se pudo crear la cuenta");
    }
  };

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Registro para profesores y apoderados"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className="link link-primary font-medium">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Nombre</span>
            </span>
            <input
              className="input input-bordered w-full"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
          </label>
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Apellido</span>
            </span>
            <input
              className="input input-bordered w-full"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </label>
        </div>
        <label className="form-control">
          <span className="label py-1">
            <span className="field-label">RUT</span>
          </span>
          <input
            className="input input-bordered w-full"
            placeholder="12.345.678-5"
            value={form.rut}
            onChange={(e) => update("rut", formatRut(e.target.value))}
            required
          />
        </label>
        <label className="form-control">
          <span className="label py-1">
            <span className="field-label">Correo electrónico</span>
          </span>
          <input
            type="email"
            className="input input-bordered w-full"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </label>
        <label className="form-control">
          <span className="label py-1">
            <span className="field-label">Tipo de cuenta</span>
          </span>
          <select
            className="select select-bordered w-full"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
          >
            <option value="teacher">Profesor</option>
            <option value="parents">Apoderado</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Contraseña</span>
            </span>
            <input
              type="password"
              className="input input-bordered w-full"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Repetir contraseña</span>
            </span>
            <input
              type="password"
              className="input input-bordered w-full"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary mt-2 w-full" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-sm" />}
          Crear cuenta
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;
