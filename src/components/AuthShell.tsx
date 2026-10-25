import { ReactNode } from "react";
import Brand from "./Brand";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const AuthShell = ({ title, subtitle, children, footer }: Props) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-content lg:flex">
      <Brand light size="lg" />
      <div>
        <h2 className="text-3xl font-semibold leading-snug">Comunicación y gestión académica en un solo lugar</h2>
        <p className="mt-4 max-w-md text-sm text-primary-content/80">
          Asistencia, calificaciones, anuncios y mensajería entre profesores y apoderados.
        </p>
      </div>
      <p className="text-xs text-primary-content/60">AulaConecta · Plataforma de gestión escolar</p>
    </aside>
    <section className="flex items-center justify-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 lg:hidden">
          <Brand size="lg" />
        </div>
        <div className="surface">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>
        {footer && <div className="mt-4 text-center text-sm text-base-content/70">{footer}</div>}
      </div>
    </section>
  </div>
);

export default AuthShell;
