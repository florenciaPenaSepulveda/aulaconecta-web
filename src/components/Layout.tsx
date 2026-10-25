import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Role, roleLabel } from "../lib/session";
import { initials } from "../lib/format";
import Brand from "./Brand";

interface NavItem {
  to: string;
  label: string;
}

const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { to: "/inicio", label: "Inicio" },
    { to: "/asignaturas", label: "Asignaturas" },
    { to: "/asistencia", label: "Asistencia" },
    { to: "/cursos", label: "Cursos" },
    { to: "/usuarios", label: "Usuarios" },
    { to: "/anuncios", label: "Anuncios" },
    { to: "/mensajes", label: "Mensajes" },
  ],
  teacher: [
    { to: "/inicio", label: "Inicio" },
    { to: "/asignaturas", label: "Asignaturas" },
    { to: "/asistencia", label: "Asistencia" },
    { to: "/usuarios", label: "Estudiantes" },
    { to: "/anuncios", label: "Anuncios" },
    { to: "/mensajes", label: "Mensajes" },
  ],
  parents: [
    { to: "/inicio", label: "Inicio" },
    { to: "/pupilos", label: "Mis pupilos" },
    { to: "/anuncios", label: "Anuncios" },
    { to: "/mensajes", label: "Mensajes" },
  ],
  student: [{ to: "/inicio", label: "Inicio" }],
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-btn px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary-content/15 text-primary-content"
      : "text-primary-content/80 hover:bg-primary-content/10 hover:text-primary-content"
  }`;

const Layout = ({ children }: { children: ReactNode }) => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    return null;
  }

  const items = navByRole[session.role];

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-content shadow">
        <div className="navbar mx-auto max-w-7xl px-4">
          <div className="navbar-start">
            <div className="dropdown lg:hidden">
              <button tabIndex={0} className="btn btn-ghost btn-sm" aria-label="Abrir menú">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-20 mt-3 w-52 rounded-box bg-base-100 p-2 text-base-content shadow"
              >
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to}>{item.label}</NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/inicio" className="ml-1">
              <Brand light />
            </Link>
          </div>
          <nav className="navbar-center hidden gap-1 lg:flex">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="navbar-end">
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-sm gap-2 normal-case text-primary-content">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-content">
                  {initials(session.firstName)}
                </span>
                <span className="hidden text-sm sm:inline">{session.firstName}</span>
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-20 mt-3 w-56 rounded-box bg-base-100 p-2 text-base-content shadow"
              >
                <li className="menu-title">{roleLabel[session.role]}</li>
                <li>
                  <Link to="/cambiar-clave">Cambiar contraseña</Link>
                </li>
                <li>
                  <button onClick={handleSignOut}>Cerrar sesión</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-base-300 bg-base-100 py-4 text-center text-xs text-base-content/60">
        AulaConecta · Plataforma de gestión escolar
      </footer>
    </div>
  );
};

export default Layout;
