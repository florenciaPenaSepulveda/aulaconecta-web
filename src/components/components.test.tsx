import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "../auth/ProtectedRoute";
import { useAuth } from "../auth/AuthContext";
import AttendanceMeter, { attendanceProgressClass, attendanceTone, formatPercentage } from "./AttendanceMeter";
import Brand from "./Brand";
import Modal from "./Modal";
import PageHeader from "./PageHeader";
import { EmptyState, ErrorState, Spinner } from "./States";
import { loadSession, Role } from "../lib/session";
import { makeSession, renderPage } from "../test/utils";

const Protected = ({ roles }: { roles?: Role[] }) => (
  <Routes>
    <Route element={<ProtectedRoute roles={roles} />}>
      <Route path="/inicio" element={<p>Contenido protegido</p>} />
    </Route>
    <Route path="/" element={<p>Pantalla de ingreso</p>} />
    <Route path="/cambiar-clave" element={<p>Cambio obligatorio</p>} />
  </Routes>
);

describe("ProtectedRoute", () => {
  it("redirige al ingreso sin sesión", () => {
    renderPage(<Protected />, { route: "/inicio" });
    expect(screen.getByText("Pantalla de ingreso")).toBeInTheDocument();
  });

  it("redirige al cambio de contraseña cuando es obligatorio", () => {
    renderPage(<Protected />, { route: "/inicio", session: makeSession("teacher", { isChangePassword: true }) });
    expect(screen.getByText("Cambio obligatorio")).toBeInTheDocument();
  });

  it("redirige al inicio si el rol no tiene acceso", () => {
    renderPage(
      <Routes>
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/cursos" element={<p>Solo admin</p>} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/inicio" element={<p>Inicio común</p>} />
        </Route>
      </Routes>,
      { route: "/cursos", session: makeSession("teacher") },
    );
    expect(screen.getByText("Inicio común")).toBeInTheDocument();
  });

  it("muestra el contenido dentro del diseño con el menú del rol", async () => {
    renderPage(<Protected />, { route: "/inicio", session: makeSession("teacher") });
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    expect(screen.getAllByText("Asistencia").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Estudiantes").length).toBeGreaterThan(0);
  });

  it("el menú de apoderado muestra sus secciones y permite cerrar sesión", async () => {
    renderPage(<Protected />, { route: "/inicio", session: makeSession("parents", { firstName: "Paula" }) });
    expect(screen.getAllByText("Mis pupilos").length).toBeGreaterThan(0);
    expect(screen.queryByText("Asignaturas")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    await waitFor(() => expect(loadSession()).toBeNull());
    expect(screen.getByText("Pantalla de ingreso")).toBeInTheDocument();
  });

  it("el menú de administrador incluye cursos y usuarios", () => {
    renderPage(<Protected />, { route: "/inicio", session: makeSession("admin") });
    expect(screen.getAllByText("Cursos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Usuarios").length).toBeGreaterThan(0);
  });
});

describe("AuthContext", () => {
  it("falla fuera del proveedor", () => {
    const Broken = () => {
      useAuth();
      return null;
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderBare(<Broken />)).toThrow(/AuthProvider/);
    spy.mockRestore();
  });
});

const renderBare = (ui: React.ReactElement) => render(ui);

describe("AttendanceMeter", () => {
  it("clasifica el porcentaje", () => {
    expect(attendanceTone(90)).toBe("success");
    expect(attendanceTone(80)).toBe("warning");
    expect(attendanceTone(60)).toBe("error");
    expect(attendanceProgressClass(90)).toBe("progress-success");
    expect(formatPercentage(93.7)).toMatch(/93[,.]7%/);
  });

  it("muestra la barra o el estado vacío", () => {
    const { rerender } = render(<AttendanceMeter percentage={88.5} />);
    expect(screen.getByText(/88[,.]5%/)).toBeInTheDocument();
    rerender(<AttendanceMeter percentage={0} empty />);
    expect(screen.getByText("Sin registros")).toBeInTheDocument();
  });
});

describe("componentes simples", () => {
  it("renderizan sus textos", () => {
    render(
      <>
        <Brand size="lg" />
        <PageHeader title="Título" subtitle="Subtítulo" actions={<button>Acción</button>} />
        <Spinner />
        <EmptyState title="Vacío" description="Sin datos" action={<button>Crear</button>} />
        <ErrorState message="Falló" />
      </>,
    );
    expect(screen.getByText("AulaConecta")).toBeInTheDocument();
    expect(screen.getByText("Subtítulo")).toBeInTheDocument();
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Falló");
  });
});

describe("Modal", () => {
  const Harness = () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Abrir</button>
        <button onClick={() => setOpen(false)}>Cerrar desde fuera</button>
        <Modal open={open} title="Ventana" onClose={() => setOpen(false)}>
          <p>Contenido</p>
        </Modal>
      </>
    );
  };

  it("abre y cierra el diálogo", async () => {
    const { container } = render(<Harness />);
    const dialog = container.querySelector("dialog") as HTMLDialogElement;
    expect(dialog).not.toHaveAttribute("open");
    await userEvent.click(screen.getByText("Abrir"));
    expect(dialog).toHaveAttribute("open");
    await userEvent.click(screen.getByText("Cerrar desde fuera"));
    expect(dialog).not.toHaveAttribute("open");
  });
});
