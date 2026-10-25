import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "../../auth/AuthContext";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { CREATE_USER, DELETE_USER, GET_ALL_USERS, UPDATE_USER, UserDto } from "../../graphql/operations";
import { formatRut, isValidRut } from "../../lib/rut";
import { confirmAction, errorMessage, notifyError, notifySuccess, notifyWarning } from "../../lib/alerts";

type RoleKey = UserDto["role"];

const roleName: Record<RoleKey, string> = {
  Student: "Estudiante",
  Teacher: "Profesor",
  Parents: "Apoderado",
  Admin: "Administrador",
};

const adminTabs: { role: RoleKey; label: string }[] = [
  { role: "Student", label: "Estudiantes" },
  { role: "Parents", label: "Apoderados" },
  { role: "Teacher", label: "Profesores" },
  { role: "Admin", label: "Administradores" },
];

const emptyForm = {
  firstName: "",
  lastName: "",
  rut: "",
  email: "",
  role: "Student" as RoleKey,
  password: "",
  guardianRut: "",
};

const Users = () => {
  const { session } = useAuth();
  const isAdmin = session?.role === "admin";
  const [tab, setTab] = useState<RoleKey>("Student");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, loading, error } = useQuery<{ getAllUser: UserDto[] }>(GET_ALL_USERS);
  const refetchQueries = [GET_ALL_USERS];
  const [createUser, createState] = useMutation(CREATE_USER, { refetchQueries });
  const [updateUser, updateState] = useMutation(UPDATE_USER, { refetchQueries });
  const [deleteUser] = useMutation(DELETE_USER, { refetchQueries });

  const users = useMemo(() => data?.getAllUser ?? [], [data]);
  const parents = users.filter((u) => u.role === "Parents");
  const activeRole: RoleKey = isAdmin ? tab : "Student";

  const visible = users
    .filter((u) => u.role === activeRole)
    .filter((u) => {
      const term = search.trim().toLowerCase();
      return !term || `${u.firstName} ${u.lastName} ${u.rut} ${u.email}`.toLowerCase().includes(term);
    });

  const guardianOf = (user: UserDto) => {
    const guardian = parents.find((p) => Number(p.id) === user.guardianId);
    return guardian ? `${guardian.firstName} ${guardian.lastName}` : null;
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, role: activeRole });
    setOpen(true);
  };

  const openEdit = (user: UserDto) => {
    const guardian = parents.find((p) => Number(p.id) === user.guardianId);
    setEditing(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      rut: user.rut,
      email: user.email,
      role: user.role,
      password: "",
      guardianRut: guardian?.rut ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing && !isValidRut(form.rut)) {
      notifyWarning("El RUT ingresado no es válido.");
      return;
    }
    if (!editing && form.role !== "Student" && form.password.length < 8) {
      notifyWarning("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    try {
      if (editing) {
        await updateUser({
          variables: {
            rut: editing.rut,
            updateUserDto: {
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              email: form.email.trim(),
              ...(editing.role === "Student" ? { guardianRut: form.guardianRut } : {}),
            },
          },
        });
        notifySuccess("Datos actualizados");
      } else {
        await createUser({
          variables: {
            createUserDto: {
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              rut: form.rut,
              email: form.email.trim(),
              role: form.role,
              ...(form.role === "Student"
                ? { guardianRut: form.guardianRut || undefined }
                : { password: form.password }),
            },
          },
        });
        notifySuccess(`${roleName[form.role]} registrado`);
      }
      setOpen(false);
    } catch (err) {
      notifyError(errorMessage(err));
    }
  };

  const handleDelete = async (user: UserDto) => {
    const confirmed = await confirmAction(
      "Eliminar usuario",
      `Se eliminará a ${user.firstName} ${user.lastName} junto con su asistencia y notas.`,
      "Eliminar",
    );
    if (!confirmed) {
      return;
    }
    try {
      await deleteUser({ variables: { rut: user.rut } });
      notifySuccess("Usuario eliminado");
    } catch (err) {
      notifyError(errorMessage(err));
    }
  };

  const title = isAdmin ? "Usuarios" : "Estudiantes";

  return (
    <>
      <PageHeader
        title={title}
        subtitle={isAdmin ? "Administra estudiantes, apoderados, profesores y administradores" : "Registra y administra a los estudiantes del colegio"}
        actions={
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            {isAdmin ? "Nuevo usuario" : "Nuevo estudiante"}
          </button>
        }
      />

      <section className="surface">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {isAdmin ? (
            <div role="tablist" className="tabs tabs-boxed bg-base-200">
              {adminTabs.map((item) => (
                <button
                  key={item.role}
                  role="tab"
                  className={`tab ${tab === item.role ? "tab-active" : ""}`}
                  onClick={() => setTab(item.role)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          <input
            className="input input-bordered input-sm w-full max-w-xs"
            placeholder="Buscar por nombre, RUT o correo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error ? (
          <ErrorState message="No se pudo cargar la lista de usuarios." />
        ) : loading && users.length === 0 ? (
          <Spinner />
        ) : visible.length === 0 ? (
          <EmptyState title="Sin resultados" description="No hay usuarios que coincidan con el filtro actual." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/60">
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Correo</th>
                  {activeRole === "Student" && <th>Apoderado</th>}
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((user) => (
                  <tr key={user.id} className="hover">
                    <td className="font-medium text-neutral">
                      {user.firstName} {user.lastName}
                    </td>
                    <td>{user.rut}</td>
                    <td>{user.email}</td>
                    {activeRole === "Student" && (
                      <td>{guardianOf(user) ?? <span className="text-base-content/50">Sin asignar</span>}</td>
                    )}
                    <td className="whitespace-nowrap text-right">
                      <button className="btn btn-ghost btn-xs" onClick={() => openEdit(user)}>
                        Editar
                      </button>
                      <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(user)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={open} title={editing ? "Editar usuario" : isAdmin ? "Nuevo usuario" : "Nuevo estudiante"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="form-control">
              <span className="label py-1">
                <span className="field-label">Nombre</span>
              </span>
              <input
                className="input input-bordered w-full"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
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
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
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
              onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })}
              disabled={Boolean(editing)}
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
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          {isAdmin && !editing && (
            <label className="form-control">
              <span className="label py-1">
                <span className="field-label">Tipo de usuario</span>
              </span>
              <select
                className="select select-bordered w-full"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as RoleKey })}
              >
                {adminTabs.map((item) => (
                  <option key={item.role} value={item.role}>
                    {roleName[item.role]}
                  </option>
                ))}
              </select>
            </label>
          )}
          {form.role === "Student" ? (
            <label className="form-control">
              <span className="label py-1">
                <span className="field-label">Apoderado</span>
              </span>
              <select
                className="select select-bordered w-full"
                value={form.guardianRut}
                onChange={(e) => setForm({ ...form, guardianRut: e.target.value })}
              >
                <option value="">Sin apoderado</option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.rut}>
                    {parent.firstName} {parent.lastName} · {parent.rut}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            !editing && (
              <label className="form-control">
                <span className="label py-1">
                  <span className="field-label">Contraseña inicial</span>
                </span>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  required
                />
              </label>
            )
          )}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={createState.loading || updateState.loading}>
              {editing ? "Guardar cambios" : "Registrar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Users;
