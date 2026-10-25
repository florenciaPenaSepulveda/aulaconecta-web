import { screen } from "@testing-library/react";
import AttendanceCalendar from "./AttendanceCalendar";
import { SUBJECT_ATTENDANCE_CALENDAR } from "../../graphql/operations";
import { calendar } from "../../test/fixtures";
import { fail, makeSession, ok, renderPage } from "../../test/utils";

const render = (mocks: ReturnType<typeof ok>[]) =>
  renderPage(<AttendanceCalendar />, {
    route: "/asignaturas/10/calendario",
    path: "/asignaturas/:id/calendario",
    session: makeSession("teacher"),
    mocks,
  });

describe("AttendanceCalendar", () => {
  it("dibuja un cuadrado por estudiante y por día registrado", async () => {
    render([ok(SUBJECT_ATTENDANCE_CALENDAR, { subjectId: 10 }, { subjectAttendanceCalendar: calendar })]);
    expect(await screen.findByText("Calendario · Matemática")).toBeInTheDocument();
    expect(screen.getByText(/3 días con asistencia registrada/)).toBeInTheDocument();
    expect(screen.getByLabelText("Juan 2026-10-01: Presente")).toBeInTheDocument();
    expect(screen.getByLabelText("Juan 2026-10-02: Ausente")).toBeInTheDocument();
    expect(screen.getByLabelText("Sofía 2026-10-02: Sin registro")).toBeInTheDocument();
    expect(screen.getByLabelText("Diego 2026-11-03: Sin registro")).toBeInTheDocument();
  });

  it("agrupa por mes, muestra el porcentaje y enlaza a cada fecha y estudiante", async () => {
    render([ok(SUBJECT_ATTENDANCE_CALENDAR, { subjectId: 10 }, { subjectAttendanceCalendar: calendar })]);
    await screen.findByText("Calendario · Matemática");
    expect(screen.getByText(/^Octubre/)).toBeInTheDocument();
    expect(screen.getByText(/^Noviembre/)).toBeInTheDocument();
    expect(screen.getByText("66,7%")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    const dayLinks = screen.getAllByTitle(/Corregir asistencia/);
    expect(dayLinks[0]).toHaveAttribute("href", "/asignaturas/10?fecha=2026-10-01");
    expect(screen.getByRole("link", { name: "Juan Pérez" })).toHaveAttribute("href", "/asistencia/estudiantes/5");
  });

  it("explica que aún no hay días registrados", async () => {
    render([ok(SUBJECT_ATTENDANCE_CALENDAR, { subjectId: 10 }, { subjectAttendanceCalendar: { ...calendar, days: [], students: [] } })]);
    expect(await screen.findByText("Aún no hay días registrados")).toBeInTheDocument();
  });

  it("informa cuando falla la carga o la asignatura no existe", async () => {
    const { unmount } = render([fail(SUBJECT_ATTENDANCE_CALENDAR, { subjectId: 10 })]);
    expect(await screen.findByText("No se pudo cargar el calendario de asistencia.")).toBeInTheDocument();
    unmount();
    render([ok(SUBJECT_ATTENDANCE_CALENDAR, { subjectId: 10 }, { subjectAttendanceCalendar: null })]);
    expect(await screen.findByText("La asignatura no existe o no está disponible.")).toBeInTheDocument();
  });
});
