import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Subjects from "./Subjects";
import SubjectDetail from "./SubjectDetail";
import Grades from "./Grades";
import {
  CREATE_GRADE,
  CREATE_SUBJECT,
  CREATE_SUBJECT_ADMIN,
  DELETE_GRADE,
  DELETE_SUBJECT,
  ENROLL_STUDENT,
  GET_ALL_STUDENTS,
  GET_ALL_USERS,
  GRADES_BY_SUBJECT,
  LIST_COURSES,
  LIST_SUBJECTS,
  LIST_USERS_BY_SUBJECT,
  SUBJECTS_BY_TEACHER,
  SUBJECT_ATTENDANCE_CALENDAR,
  SUBJECT_ATTENDANCE_SUMMARY,
  SUBJECT_BY_ID,
  TAKE_ASIST,
  UNENROLL_STUDENT,
  UPDATE_GRADE,
} from "../../graphql/operations";
import * as alerts from "../../lib/alerts";
import { calendar, course, guardian, student, subject, subjectSummary, teacherUser } from "../../test/fixtures";
import { todayLocal } from "../../lib/format";
import { fail, makeSession, ok, renderPage } from "../../test/utils";

const coursesMock = ok(LIST_COURSES, undefined, { listCourses: [{ ...course, subjects: [] }] });
const teacherMocks = [ok(SUBJECTS_BY_TEACHER, { idTeacher: 1 }, { getAllSubjectByIdTeacher: [subject] }), coursesMock];

describe("Subjects (profesor)", () => {
  it("lista sus asignaturas con acceso a asistencia y notas", async () => {
    renderPage(<Subjects />, { session: makeSession("teacher"), mocks: teacherMocks });
    expect(await screen.findByText("Matemática")).toBeInTheDocument();
    expect(screen.getByText("40 clases")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Notas" })).toHaveAttribute("href", "/asignaturas/10/notas");
  });

  it("crea una asignatura", async () => {
    const user = userEvent.setup();
    renderPage(<Subjects />, {
      session: makeSession("teacher"),
      mocks: [
        ...teacherMocks,
        ok(CREATE_SUBJECT, { createSubjectInput: { name: "Física", numberOfClasses: 30, courseId: 1 } }, { createSubject: { isCreateSubject: true } }),
      ],
    });
    await screen.findByText("Matemática");
    await user.click(screen.getByRole("button", { name: "Nueva asignatura" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Nombre"), "Física");
    await user.selectOptions(within(dialog).getByLabelText("Curso"), "1");
    await user.type(within(dialog).getByLabelText("Cantidad de clases"), "30");
    await user.click(within(dialog).getByRole("button", { name: "Crear asignatura", hidden: true }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Asignatura creada"));
  });

  it("valida la cantidad de clases", async () => {
    const user = userEvent.setup();
    renderPage(<Subjects />, { session: makeSession("teacher"), mocks: teacherMocks });
    await screen.findByText("Matemática");
    await user.click(screen.getByRole("button", { name: "Nueva asignatura" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Nombre"), "Física");
    await user.selectOptions(within(dialog).getByLabelText("Curso"), "1");
    await user.type(within(dialog).getByLabelText("Cantidad de clases"), "0");
    fireEvent.submit(dialog.querySelector("form") as HTMLFormElement);
    expect(alerts.notifyWarning).toHaveBeenCalled();
  });

  it("informa cuando el servidor rechaza la creación", async () => {
    const user = userEvent.setup();
    renderPage(<Subjects />, {
      session: makeSession("teacher"),
      mocks: [
        ...teacherMocks,
        ok(CREATE_SUBJECT, { createSubjectInput: { name: "Física", numberOfClasses: 30, courseId: 1 } }, { createSubject: { isCreateSubject: false } }),
      ],
    });
    await screen.findByText("Matemática");
    await user.click(screen.getByRole("button", { name: "Nueva asignatura" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Nombre"), "Física");
    await user.selectOptions(within(dialog).getByLabelText("Curso"), "1");
    await user.type(within(dialog).getByLabelText("Cantidad de clases"), "30");
    await user.click(within(dialog).getByRole("button", { name: "Crear asignatura", hidden: true }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("elimina una asignatura tras confirmar", async () => {
    const user = userEvent.setup();
    renderPage(<Subjects />, {
      session: makeSession("teacher"),
      mocks: [...teacherMocks, ok(DELETE_SUBJECT, { id: 10 }, { deleteSubjectById: true })],
    });
    await screen.findByText("Matemática");
    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Asignatura eliminada"));
  });

  it("no elimina si el usuario cancela, y reporta errores", async () => {
    const user = userEvent.setup();
    vi.mocked(alerts.confirmAction).mockResolvedValueOnce(false);
    renderPage(<Subjects />, {
      session: makeSession("teacher"),
      mocks: [...teacherMocks, fail(DELETE_SUBJECT, { id: 10 })],
    });
    await screen.findByText("Matemática");
    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(alerts.notifySuccess).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("muestra estados vacío y de error", async () => {
    const { unmount } = renderPage(<Subjects />, {
      session: makeSession("teacher"),
      mocks: [ok(SUBJECTS_BY_TEACHER, { idTeacher: 1 }, { getAllSubjectByIdTeacher: [] }), coursesMock],
    });
    expect(await screen.findByText("No hay asignaturas registradas")).toBeInTheDocument();
    unmount();
    renderPage(<Subjects />, { session: makeSession("teacher"), mocks: [fail(SUBJECTS_BY_TEACHER, { idTeacher: 1 }), coursesMock] });
    expect(await screen.findByText("No se pudieron cargar las asignaturas.")).toBeInTheDocument();
  });
});

describe("Subjects (administrador)", () => {
  const adminMocks = [
    ok(LIST_SUBJECTS, undefined, { listSubject: [subject] }),
    ok(GET_ALL_USERS, undefined, { getAllUser: [teacherUser, student, guardian] }),
    coursesMock,
  ];

  it("muestra el profesor responsable y exige elegirlo", async () => {
    const user = userEvent.setup();
    renderPage(<Subjects />, { session: makeSession("admin"), mocks: adminMocks });
    expect(await screen.findByText("Profesor: Carlos Muñoz")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Nueva asignatura" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Nombre"), "Física");
    await user.selectOptions(within(dialog).getByLabelText("Curso"), "1");
    await user.type(within(dialog).getByLabelText("Cantidad de clases"), "30");
    fireEvent.submit(dialog.querySelector("form") as HTMLFormElement);
    expect(alerts.notifyWarning).toHaveBeenCalledWith("Selecciona el profesor responsable.");
  });

  it("crea una asignatura asignada a un profesor", async () => {
    const user = userEvent.setup();
    renderPage(<Subjects />, {
      session: makeSession("admin"),
      mocks: [
        ...adminMocks,
        ok(
          CREATE_SUBJECT_ADMIN,
          { createSubjectAdminInput: { name: "Física", numberOfClasses: 30, courseId: 1, idTeacher: 1 } },
          { addNewSubjectAdmin: { isCreateSubject: true } },
        ),
      ],
    });
    await screen.findByText("Profesor: Carlos Muñoz");
    await user.click(screen.getByRole("button", { name: "Nueva asignatura" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Nombre"), "Física");
    await user.selectOptions(within(dialog).getByLabelText("Curso"), "1");
    await user.selectOptions(within(dialog).getByLabelText("Profesor responsable"), "1");
    await user.type(within(dialog).getByLabelText("Cantidad de clases"), "30");
    await user.click(within(dialog).getByRole("button", { name: "Crear asignatura", hidden: true }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Asignatura creada"));
  });
});

describe("SubjectDetail", () => {
  const sofia = { ...student, id: "6", firstName: "Sofía", lastName: "Rojas", rut: "55.555.555-5", email: "s@test.cl" };
  const enrolled = {
    listUsersBySubject: [
      { user: { id: "5", firstName: "Juan", lastName: "Pérez", rut: "44.444.444-4", email: "j@test.cl" }, totalAsist: 18, totalAbsences: 2 },
    ],
  };
  const baseMocks = (numberOfClasses = 40) => [
    ok(SUBJECT_BY_ID, { id: 10 }, { subjectById: { ...subject, numberOfClasses } }),
    ok(LIST_USERS_BY_SUBJECT, { idSubject: 10 }, enrolled),
    ok(GET_ALL_STUDENTS, undefined, { getAllStudents: [student, sofia] }),
    ok(SUBJECT_ATTENDANCE_SUMMARY, { subjectId: 10 }, { subjectAttendanceSummary: subjectSummary }),
    ok(SUBJECT_ATTENDANCE_CALENDAR, { subjectId: 10 }, { subjectAttendanceCalendar: calendar }),
  ];
  const render = (mocks = baseMocks(), route = "/asignaturas/10") =>
    renderPage(<SubjectDetail />, { route, path: "/asignaturas/:id", session: makeSession("teacher"), mocks });

  it("muestra el resumen global y la asistencia de cada estudiante", async () => {
    render();
    expect(await screen.findByText("Asistencia global")).toBeInTheDocument();
    expect(await screen.findByText(/70%/)).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText(/90%/)).toBeInTheDocument();
    expect(screen.getByText(/20 de 40 clases registradas/)).toBeInTheDocument();
  });

  it("registra la asistencia del día", async () => {
    const user = userEvent.setup();
    render([
      ...baseMocks(),
      ok(TAKE_ASIST, { createAsistInput: { date: todayLocal(), asistencias: [{ idUser: 5, idSubject: 10, asist: 0, absences: 1 }] } }, { takeAsist: true }),
    ]);
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByLabelText("Presente: Juan Pérez"));
    expect(screen.getByText(/0 presentes · 1 ausentes/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /registrar asistencia/i }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Asistencia registrada"));
  });

  it("carga la asistencia ya registrada de otra fecha y permite corregirla", async () => {
    const user = userEvent.setup();
    render([
      ...baseMocks(),
      ok(TAKE_ASIST, { createAsistInput: { date: "2026-10-02", asistencias: [{ idUser: 5, idSubject: 10, asist: 1, absences: 0 }] } }, { takeAsist: true }),
    ]);
    await screen.findByText("Juan Pérez");
    expect(screen.queryByText(/Ya registrada/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Fecha de la clase"), { target: { value: "2026-10-02" } });
    expect(await screen.findByText(/Ya registrada: se actualizará/)).toBeInTheDocument();
    expect(screen.getByLabelText("Presente: Juan Pérez")).not.toBeChecked();
    await user.click(screen.getByLabelText("Presente: Juan Pérez"));
    await user.click(screen.getByRole("button", { name: /registrar asistencia/i }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Asistencia registrada"));
  });

  it("toma la fecha de la dirección y rechaza fechas vacías", async () => {
    const user = userEvent.setup();
    render(baseMocks(), "/asignaturas/10?fecha=2026-10-01");
    await screen.findByText("Juan Pérez");
    expect(screen.getByLabelText("Fecha de la clase")).toHaveValue("2026-10-01");
    fireEvent.change(screen.getByLabelText("Fecha de la clase"), { target: { value: "" } });
    await user.click(screen.getByRole("button", { name: /registrar asistencia/i }));
    expect(alerts.notifyWarning).toHaveBeenCalledWith("Elige una fecha válida que no sea futura.");
  });

  it("marca a todos presentes o ausentes", async () => {
    const user = userEvent.setup();
    render();
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("button", { name: "Todos ausentes" }));
    expect(screen.getByLabelText("Presente: Juan Pérez")).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "Todos presentes" }));
    expect(screen.getByLabelText("Presente: Juan Pérez")).toBeChecked();
  });

  it("pide confirmación cuando ya se registraron todas las clases", async () => {
    const user = userEvent.setup();
    vi.mocked(alerts.confirmAction).mockResolvedValueOnce(false);
    render(baseMocks(10));
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("button", { name: /registrar asistencia/i }));
    expect(alerts.confirmAction).toHaveBeenCalledWith("Clases completadas", expect.any(String), "Registrar");
    expect(alerts.notifySuccess).not.toHaveBeenCalled();
  });

  it("informa cuando falla el registro de asistencia", async () => {
    const user = userEvent.setup();
    render([
      ...baseMocks(),
      fail(TAKE_ASIST, { createAsistInput: { date: todayLocal(), asistencias: [{ idUser: 5, idSubject: 10, asist: 1, absences: 0 }] } }),
    ]);
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("button", { name: /registrar asistencia/i }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("inscribe a un estudiante disponible", async () => {
    const user = userEvent.setup();
    render([...baseMocks(), ok(ENROLL_STUDENT, { idUser: 6, idSubject: 10 }, { enrollStudent: true })]);
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("button", { name: "Inscribir" }));
    expect(alerts.notifyWarning).toHaveBeenCalledWith("Selecciona un estudiante para inscribir.");
    await user.selectOptions(screen.getByRole("combobox"), "6");
    await user.click(screen.getByRole("button", { name: "Inscribir" }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Estudiante inscrito"));
  });

  it("informa cuando falla la inscripción", async () => {
    const user = userEvent.setup();
    render([...baseMocks(), fail(ENROLL_STUDENT, { idUser: 6, idSubject: 10 })]);
    await screen.findByText("Juan Pérez");
    await user.selectOptions(screen.getByRole("combobox"), "6");
    await user.click(screen.getByRole("button", { name: "Inscribir" }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("retira a un estudiante tras confirmar", async () => {
    const user = userEvent.setup();
    render([...baseMocks(), ok(UNENROLL_STUDENT, { idUser: 5, idSubject: 10 }, { unenrollStudent: true })]);
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("button", { name: "Quitar" }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Estudiante retirado"));
  });

  it("no retira al estudiante si se cancela o falla", async () => {
    const user = userEvent.setup();
    vi.mocked(alerts.confirmAction).mockResolvedValueOnce(false);
    render([...baseMocks(), fail(UNENROLL_STUDENT, { idUser: 5, idSubject: 10 })]);
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("button", { name: "Quitar" }));
    expect(alerts.notifySuccess).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Quitar" }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("muestra estados vacíos y de error", async () => {
    const { unmount } = render([
      ok(SUBJECT_BY_ID, { id: 10 }, { subjectById: subject }),
      ok(LIST_USERS_BY_SUBJECT, { idSubject: 10 }, { listUsersBySubject: [] }),
      ok(GET_ALL_STUDENTS, undefined, { getAllStudents: [] }),
      ok(SUBJECT_ATTENDANCE_SUMMARY, { subjectId: 10 }, { subjectAttendanceSummary: { ...subjectSummary, totalAsist: 0, totalAbsences: 0, studentsSummary: [] } }),
    ]);
    expect(await screen.findByText("Sin estudiantes inscritos")).toBeInTheDocument();
    expect(screen.getByText("No hay más estudiantes disponibles para inscribir.")).toBeInTheDocument();
    unmount();
    render([ok(SUBJECT_BY_ID, { id: 10 }, { subjectById: null }), ok(LIST_USERS_BY_SUBJECT, { idSubject: 10 }, enrolled), ok(GET_ALL_STUDENTS, undefined, { getAllStudents: [] }), fail(SUBJECT_ATTENDANCE_SUMMARY, { subjectId: 10 })]);
    expect(await screen.findByText("La asignatura no existe o no está disponible.")).toBeInTheDocument();
  });

  it("informa cuando falla la lista de inscritos", async () => {
    render([
      ok(SUBJECT_BY_ID, { id: 10 }, { subjectById: subject }),
      fail(LIST_USERS_BY_SUBJECT, { idSubject: 10 }),
      ok(GET_ALL_STUDENTS, undefined, { getAllStudents: [] }),
      ok(SUBJECT_ATTENDANCE_SUMMARY, { subjectId: 10 }, { subjectAttendanceSummary: subjectSummary }),
    ]);
    expect(await screen.findByText("No se pudo cargar la lista de estudiantes.")).toBeInTheDocument();
  });
});

const emptyGradeInput = () =>
  screen.getAllByPlaceholderText<HTMLInputElement>("0,0").find((input) => input.value === "") as HTMLInputElement;

describe("Grades", () => {
  const sofia = { user: { id: "6", firstName: "Sofía", lastName: "Rojas", rut: "55.555.555-5" }, totalAsist: 10, totalAbsences: 0 };
  const juan = { user: { id: "5", firstName: "Juan", lastName: "Pérez", rut: "44.444.444-4" }, totalAsist: 18, totalAbsences: 2 };
  const baseMocks = [
    ok(SUBJECT_BY_ID, { id: 10 }, { subjectById: subject }),
    ok(LIST_USERS_BY_SUBJECT, { idSubject: 10 }, { listUsersBySubject: [juan, sofia] }),
    ok(GRADES_BY_SUBJECT, { subjectId: 10 }, { gradesBySubjectId: [{ id: "1", grade: 5.5, studentId: 5, subjectId: 10 }] }),
  ];
  const render = (mocks = baseMocks) =>
    renderPage(<Grades />, { route: "/asignaturas/10/notas", path: "/asignaturas/:id/notas", session: makeSession("teacher"), mocks });

  it("muestra las notas y el promedio de cada estudiante", async () => {
    render();
    expect(await screen.findByDisplayValue("5.5")).toBeInTheDocument();
    expect(screen.getAllByText("5.5").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /guardar cambios/i })).toBeDisabled();
  });

  it("actualiza una nota existente", async () => {
    const user = userEvent.setup();
    render([
      ...baseMocks,
      ok(UPDATE_GRADE, { id: 1, updateGradeDto: { grade: 6.5, studentId: 5, subjectId: 10 } }, { updateGrade: { id: "1" } }),
    ]);
    const input = await screen.findByDisplayValue("5.5");
    await user.clear(input);
    await user.type(input, "6,5");
    await user.click(screen.getByRole("button", { name: /guardar cambios \(1\)/i }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Notas guardadas"));
  });

  it("crea una nota nueva para un estudiante", async () => {
    const user = userEvent.setup();
    render([
      ...baseMocks,
      ok(CREATE_GRADE, { createGradeDto: { grade: 4.2, studentId: 6, subjectId: 10 } }, { createGrade: { id: "9" } }),
    ]);
    await screen.findByDisplayValue("5.5");
    const buttons = screen.getAllByRole("button", { name: "Agregar nota" });
    await user.click(buttons[1]);
    await user.type(emptyGradeInput(), "4.2");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Notas guardadas"));
  });

  it("rechaza notas fuera de la escala", async () => {
    const user = userEvent.setup();
    render();
    const input = await screen.findByDisplayValue("5.5");
    await user.clear(input);
    await user.type(input, "8");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));
    expect(alerts.notifyWarning).toHaveBeenCalledWith("Todas las notas deben estar entre 1,0 y 7,0.");
  });

  it("elimina notas guardadas y descarta las no guardadas", async () => {
    const user = userEvent.setup();
    render([...baseMocks, ok(DELETE_GRADE, { id: 1 }, { deleteGrade: true })]);
    await screen.findByDisplayValue("5.5");
    await user.click(screen.getAllByRole("button", { name: "Agregar nota" })[1]);
    expect(emptyGradeInput()).toBeInTheDocument();
    const removeButtons = screen.getAllByRole("button", { name: "Eliminar nota" });
    await user.click(removeButtons[1]);
    expect(screen.getAllByPlaceholderText("0,0")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Eliminar nota" }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Nota eliminada"));
    expect(screen.queryByDisplayValue("5.5")).not.toBeInTheDocument();
  });

  it("no elimina si se cancela o si el servidor falla", async () => {
    const user = userEvent.setup();
    vi.mocked(alerts.confirmAction).mockResolvedValueOnce(false);
    render([...baseMocks, fail(DELETE_GRADE, { id: 1 })]);
    await screen.findByDisplayValue("5.5");
    await user.click(screen.getByRole("button", { name: "Eliminar nota" }));
    expect(screen.getByDisplayValue("5.5")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Eliminar nota" }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
    expect(screen.getByDisplayValue("5.5")).toBeInTheDocument();
  });

  it("informa cuando falla el guardado", async () => {
    const user = userEvent.setup();
    render([...baseMocks, fail(UPDATE_GRADE, { id: 1, updateGradeDto: { grade: 6, studentId: 5, subjectId: 10 } })]);
    const input = await screen.findByDisplayValue("5.5");
    await user.clear(input);
    await user.type(input, "6");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("muestra estados vacíos y de error", async () => {
    const { unmount } = render([
      ok(SUBJECT_BY_ID, { id: 10 }, { subjectById: subject }),
      ok(LIST_USERS_BY_SUBJECT, { idSubject: 10 }, { listUsersBySubject: [] }),
      ok(GRADES_BY_SUBJECT, { subjectId: 10 }, { gradesBySubjectId: [] }),
    ]);
    expect(await screen.findByText("Sin estudiantes inscritos")).toBeInTheDocument();
    unmount();
    const second = render([
      ok(SUBJECT_BY_ID, { id: 10 }, { subjectById: subject }),
      fail(LIST_USERS_BY_SUBJECT, { idSubject: 10 }),
      ok(GRADES_BY_SUBJECT, { subjectId: 10 }, { gradesBySubjectId: [] }),
    ]);
    expect(await screen.findByText("No se pudo cargar la lista de estudiantes.")).toBeInTheDocument();
    second.unmount();
    render([ok(SUBJECT_BY_ID, { id: 10 }, { subjectById: null }), ok(LIST_USERS_BY_SUBJECT, { idSubject: 10 }, { listUsersBySubject: [] }), ok(GRADES_BY_SUBJECT, { subjectId: 10 }, { gradesBySubjectId: [] })]);
    expect(await screen.findByText("La asignatura no existe o no está disponible.")).toBeInTheDocument();
  });
});
