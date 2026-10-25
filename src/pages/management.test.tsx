import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CourseAttendance from "./attendance/CourseAttendance";
import CourseDetail from "./attendance/CourseDetail";
import StudentAttendance from "./attendance/StudentAttendance";
import Courses from "./courses/Courses";
import Users from "./students/Users";
import Notices from "./notices/Notices";
import {
  ATTENDANCE_BY_STUDENT,
  COURSE_ATTENDANCE_SUMMARIES,
  CREATE_COURSE,
  CREATE_NOTICE,
  CREATE_USER,
  DELETE_COURSE,
  DELETE_NOTICE,
  DELETE_USER,
  GET_ALL_NOTICES,
  GET_ALL_STUDENTS,
  GET_ALL_USERS,
  LIST_COURSES,
  UPDATE_USER,
} from "../graphql/operations";
import * as alerts from "../lib/alerts";
import {
  course,
  courseSummary,
  emptyCourseSummary,
  guardian,
  notice,
  student,
  teacherUser,
} from "../test/fixtures";
import { fail, makeSession, ok, renderPage } from "../test/utils";

describe("CourseAttendance", () => {
  const mock = (courses: unknown[]) => [ok(COURSE_ATTENDANCE_SUMMARIES, undefined, { courseAttendanceSummaries: courses })];

  it("lista los cursos con su asistencia y enlaza al detalle", async () => {
    renderPage(<CourseAttendance />, { session: makeSession("teacher"), mocks: mock([courseSummary, emptyCourseSummary]) });
    expect(await screen.findByText("1° Básico A")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByText("Sin registros")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Ver detalle" })[0]).toHaveAttribute("href", "/asistencia/cursos/1");
  });

  it("muestra estados vacío y de error", async () => {
    const { unmount } = renderPage(<CourseAttendance />, { session: makeSession("teacher"), mocks: mock([]) });
    expect(await screen.findByText("No hay cursos registrados")).toBeInTheDocument();
    unmount();
    renderPage(<CourseAttendance />, { session: makeSession("teacher"), mocks: [fail(COURSE_ATTENDANCE_SUMMARIES, undefined)] });
    expect(await screen.findByText("No se pudo cargar el resumen de asistencia.")).toBeInTheDocument();
  });
});

describe("CourseDetail", () => {
  const render = (mocks: ReturnType<typeof ok>[], id = "1") =>
    renderPage(<CourseDetail />, {
      route: `/asistencia/cursos/${id}`,
      path: "/asistencia/cursos/:courseId",
      session: makeSession("teacher"),
      mocks,
    });
  const summaries = (courses: unknown[]) => [ok(COURSE_ATTENDANCE_SUMMARIES, undefined, { courseAttendanceSummaries: courses })];

  it("muestra el detalle por asignatura y por estudiante con enlaces", async () => {
    render(summaries([courseSummary, emptyCourseSummary]));
    expect(await screen.findByRole("heading", { name: "1° Básico A" })).toBeInTheDocument();
    expect(screen.getByText("Estudiantes bajo 75%").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("En riesgo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver asignatura" })).toHaveAttribute("href", "/asignaturas/10");
    const studentLinks = screen.getAllByRole("link", { name: "Ver estudiante" });
    expect(studentLinks[0]).toHaveAttribute("href", "/asistencia/estudiantes/6");
    expect(studentLinks).toHaveLength(2);
  });

  it("muestra un curso sin registros", async () => {
    render(summaries([courseSummary, emptyCourseSummary]), "2");
    expect(await screen.findByRole("heading", { name: "3° Básico B" })).toBeInTheDocument();
    expect(screen.getByText("Sin asignaturas")).toBeInTheDocument();
    expect(screen.getByText("Sin estudiantes")).toBeInTheDocument();
  });

  it("informa cuando el curso no existe o falla la carga", async () => {
    const { unmount } = render(summaries([courseSummary]), "99");
    expect(await screen.findByText("El curso no existe o no está disponible.")).toBeInTheDocument();
    unmount();
    render([fail(COURSE_ATTENDANCE_SUMMARIES, undefined)]);
    expect(await screen.findByText("No se pudo cargar el resumen de asistencia.")).toBeInTheDocument();
  });
});

describe("StudentAttendance", () => {
  const rows = {
    attendanceByStudent: [
      { totalAsist: 18, totalAbsences: 2, subject: { id: "10", name: "Matemática", numberOfClasses: 40, course: { nameCourse: "1° Básico A" } } },
      { totalAsist: 0, totalAbsences: 0, subject: { id: "11", name: "Inglés", numberOfClasses: 40, course: { nameCourse: "1° Básico A" } } },
    ],
  };
  const base = [ok(GET_ALL_STUDENTS, undefined, { getAllStudents: [student] }), ok(ATTENDANCE_BY_STUDENT, { studentId: 5 }, rows)];
  const render = (mocks = base, id = "5") =>
    renderPage(<StudentAttendance />, {
      route: `/asistencia/estudiantes/${id}`,
      path: "/asistencia/estudiantes/:studentId",
      session: makeSession("teacher"),
      mocks,
    });

  it("muestra la asistencia del estudiante en todas sus asignaturas", async () => {
    render();
    expect(await screen.findByRole("heading", { name: "Juan Pérez" })).toBeInTheDocument();
    expect(screen.getByText(/1° Básico A/)).toBeInTheDocument();
    expect(screen.getAllByText("90%").length).toBeGreaterThan(0);
    expect(screen.getByText("Sin registros")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Ver asignatura" })[0]).toHaveAttribute("href", "/asignaturas/10");
  });

  it("muestra el estado vacío sin asignaturas", async () => {
    render([ok(GET_ALL_STUDENTS, undefined, { getAllStudents: [student] }), ok(ATTENDANCE_BY_STUDENT, { studentId: 5 }, { attendanceByStudent: [] })]);
    expect(await screen.findByText("Sin asignaturas")).toBeInTheDocument();
  });

  it("informa cuando el estudiante no existe o falla la carga", async () => {
    const { unmount } = render([ok(GET_ALL_STUDENTS, undefined, { getAllStudents: [] }), ok(ATTENDANCE_BY_STUDENT, { studentId: 5 }, rows)]);
    expect(await screen.findByText("El estudiante no existe o no está disponible.")).toBeInTheDocument();
    unmount();
    render([ok(GET_ALL_STUDENTS, undefined, { getAllStudents: [student] }), fail(ATTENDANCE_BY_STUDENT, { studentId: 5 })]);
    expect(await screen.findByText("No se pudo cargar la asistencia del estudiante.")).toBeInTheDocument();
  });
});

describe("Courses", () => {
  const withSubjects = { ...course, subjects: [{ id: "10", name: "Matemática" }] };
  const empty = { id: "2", nameCourse: "3° Básico B", level: "Media", subjects: [] };
  const base = ok(LIST_COURSES, undefined, { listCourses: [withSubjects, empty] });

  it("lista los cursos con sus asignaturas", async () => {
    renderPage(<Courses />, { session: makeSession("admin"), mocks: [base] });
    expect(await screen.findByText("1° Básico A")).toBeInTheDocument();
    expect(screen.getByText("Matemática")).toBeInTheDocument();
    expect(screen.getByText("Sin asignaturas")).toBeInTheDocument();
    expect(screen.getAllByText("Media").length).toBeGreaterThan(0);
  });

  it("crea un curso", async () => {
    const user = userEvent.setup();
    renderPage(<Courses />, {
      session: makeSession("admin"),
      mocks: [base, ok(CREATE_COURSE, { createCourseDto: { nameCourse: "2° Medio A", level: "Media" } }, { createCourse: true })],
    });
    await screen.findByText("1° Básico A");
    await user.click(screen.getByRole("button", { name: "Nuevo curso" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Nombre del curso"), "2° Medio A");
    await user.selectOptions(within(dialog).getByLabelText("Nivel"), "Media");
    await user.click(within(dialog).getByRole("button", { name: "Crear curso", hidden: true }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Curso creado"));
  });

  it("informa cuando el curso ya existe", async () => {
    const user = userEvent.setup();
    renderPage(<Courses />, {
      session: makeSession("admin"),
      mocks: [base, fail(CREATE_COURSE, { createCourseDto: { nameCourse: "2° Medio A", level: "Basica" } }, "El curso ya esta creado!")],
    });
    await screen.findByText("1° Básico A");
    await user.click(screen.getByRole("button", { name: "Nuevo curso" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Nombre del curso"), "2° Medio A");
    await user.click(within(dialog).getByRole("button", { name: "Crear curso", hidden: true }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalledWith("El curso ya esta creado!"));
  });

  it("elimina un curso tras confirmar y reporta errores", async () => {
    const user = userEvent.setup();
    renderPage(<Courses />, {
      session: makeSession("admin"),
      mocks: [
        base,
        ok(DELETE_COURSE, { deleteCourseDto: { nameCourse: "3° Básico B", level: "Media" } }, { deleteCourseDto: true }),
        fail(DELETE_COURSE, { deleteCourseDto: { nameCourse: "1° Básico A", level: "Basica" } }),
      ],
    });
    await screen.findByText("1° Básico A");
    const buttons = screen.getAllByRole("button", { name: "Eliminar" });
    await user.click(buttons[1]);
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Curso eliminado"));
    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("no elimina si se cancela y muestra los estados vacío y de error", async () => {
    const user = userEvent.setup();
    vi.mocked(alerts.confirmAction).mockResolvedValueOnce(false);
    const { unmount } = renderPage(<Courses />, { session: makeSession("admin"), mocks: [base] });
    await screen.findByText("1° Básico A");
    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    expect(alerts.notifySuccess).not.toHaveBeenCalled();
    unmount();
    const second = renderPage(<Courses />, { session: makeSession("admin"), mocks: [ok(LIST_COURSES, undefined, { listCourses: [] })] });
    expect(await screen.findByText("No hay cursos registrados")).toBeInTheDocument();
    second.unmount();
    renderPage(<Courses />, { session: makeSession("admin"), mocks: [fail(LIST_COURSES, undefined)] });
    expect(await screen.findByText("No se pudieron cargar los cursos.")).toBeInTheDocument();
  });
});

describe("Users", () => {
  const sofia = { ...student, id: "6", firstName: "Sofía", lastName: "Rojas", rut: "55.555.555-5", email: "sofia@test.cl", guardianId: null };
  const usersMock = ok(GET_ALL_USERS, undefined, { getAllUser: [student, sofia, guardian, teacherUser] });

  it("el profesor ve solo estudiantes con su apoderado", async () => {
    renderPage(<Users />, { session: makeSession("teacher"), mocks: [usersMock] });
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Paula Apoderada")).toBeInTheDocument();
    expect(screen.getByText("Sin asignar")).toBeInTheDocument();
    expect(screen.queryByText("Carlos Muñoz")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("filtra por nombre, RUT o correo", async () => {
    const user = userEvent.setup();
    renderPage(<Users />, { session: makeSession("teacher"), mocks: [usersMock] });
    await screen.findByText("Juan Pérez");
    await user.type(screen.getByPlaceholderText(/buscar/i), "sofia");
    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
    expect(screen.getByText("Sofía Rojas")).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText(/buscar/i));
    await user.type(screen.getByPlaceholderText(/buscar/i), "zzz");
    expect(await screen.findByText("Sin resultados")).toBeInTheDocument();
  });

  it("registra un estudiante con su apoderado", async () => {
    const user = userEvent.setup();
    renderPage(<Users />, {
      session: makeSession("teacher"),
      mocks: [
        usersMock,
        ok(
          CREATE_USER,
          { createUserDto: { firstName: "Lucía", lastName: "Mora", rut: "12.345.678-5", email: "lucia@test.cl", role: "Student", guardianRut: "33.333.333-3" } },
          { createUser: { id: "9" } },
        ),
      ],
    });
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("button", { name: "Nuevo estudiante" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(within(dialog).getByRole("heading", { name: "Nuevo estudiante", hidden: true })).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText("Nombre"), "Lucía");
    await user.type(within(dialog).getByLabelText("Apellido"), "Mora");
    await user.type(within(dialog).getByLabelText("RUT"), "123456785");
    await user.type(within(dialog).getByLabelText("Correo electrónico"), "lucia@test.cl");
    await user.selectOptions(within(dialog).getByLabelText("Apoderado"), "33.333.333-3");
    await user.click(within(dialog).getByRole("button", { name: "Registrar", hidden: true }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Estudiante registrado"));
  });

  it("rechaza un RUT inválido y muestra errores del servidor", async () => {
    const user = userEvent.setup();
    renderPage(<Users />, {
      session: makeSession("teacher"),
      mocks: [
        usersMock,
        fail(
          CREATE_USER,
          { createUserDto: { firstName: "Lucía", lastName: "Mora", rut: "12.345.678-5", email: "lucia@test.cl", role: "Student" } },
          "El RUT ya está registrado",
        ),
      ],
    });
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("button", { name: "Nuevo estudiante" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Nombre"), "Lucía");
    await user.type(within(dialog).getByLabelText("Apellido"), "Mora");
    await user.type(within(dialog).getByLabelText("RUT"), "123456789");
    await user.type(within(dialog).getByLabelText("Correo electrónico"), "lucia@test.cl");
    await user.click(within(dialog).getByRole("button", { name: "Registrar", hidden: true }));
    expect(alerts.notifyWarning).toHaveBeenCalledWith("El RUT ingresado no es válido.");
    await user.clear(within(dialog).getByLabelText("RUT"));
    await user.type(within(dialog).getByLabelText("RUT"), "123456785");
    await user.click(within(dialog).getByRole("button", { name: "Registrar", hidden: true }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalledWith("El RUT ya está registrado"));
  });

  it("edita los datos y el apoderado de un estudiante", async () => {
    const user = userEvent.setup();
    renderPage(<Users />, {
      session: makeSession("teacher"),
      mocks: [
        usersMock,
        ok(
          UPDATE_USER,
          { rut: "44.444.444-4", updateUserDto: { firstName: "Juanito", lastName: "Pérez", email: "juan@test.cl", guardianRut: "33.333.333-3" } },
          { updateUser: { id: "5" } },
        ),
      ],
    });
    await screen.findByText("Juan Pérez");
    await user.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(within(dialog).getByLabelText("RUT")).toBeDisabled();
    const name = within(dialog).getByLabelText("Nombre");
    await user.clear(name);
    await user.type(name, "Juanito");
    await user.click(within(dialog).getByRole("button", { name: "Guardar cambios", hidden: true }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Datos actualizados"));
  });

  it("elimina un usuario tras confirmar y reporta cancelaciones y errores", async () => {
    const user = userEvent.setup();
    vi.mocked(alerts.confirmAction).mockResolvedValueOnce(false);
    renderPage(<Users />, {
      session: makeSession("teacher"),
      mocks: [usersMock, ok(DELETE_USER, { rut: "44.444.444-4" }, { removeUser: true }), fail(DELETE_USER, { rut: "55.555.555-5" })],
    });
    await screen.findByText("Juan Pérez");
    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    expect(alerts.notifySuccess).not.toHaveBeenCalled();
    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Usuario eliminado"));
    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[1]);
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("el administrador navega por roles y crea un profesor", async () => {
    const user = userEvent.setup();
    renderPage(<Users />, {
      session: makeSession("admin"),
      mocks: [
        usersMock,
        ok(
          CREATE_USER,
          { createUserDto: { firstName: "Marta", lastName: "Soto", rut: "12.345.678-5", email: "marta@test.cl", role: "Teacher", password: "Clave12345" } },
          { createUser: { id: "10" } },
        ),
      ],
    });
    await screen.findByText("Juan Pérez");
    await user.click(screen.getByRole("tab", { name: "Profesores" }));
    expect(screen.getByText("Carlos Muñoz")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Apoderados" }));
    expect(screen.getByText("Paula Apoderada")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Profesores" }));
    await user.click(screen.getByRole("button", { name: "Nuevo usuario" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Nombre"), "Marta");
    await user.type(within(dialog).getByLabelText("Apellido"), "Soto");
    await user.type(within(dialog).getByLabelText("RUT"), "123456785");
    await user.type(within(dialog).getByLabelText("Correo electrónico"), "marta@test.cl");
    expect(within(dialog).getByLabelText("Tipo de usuario")).toHaveValue("Teacher");
    await user.type(within(dialog).getByLabelText("Contraseña inicial"), "corta");
    fireEvent.submit(dialog.querySelector("form") as HTMLFormElement);
    expect(alerts.notifyWarning).toHaveBeenCalledWith("La contraseña debe tener al menos 8 caracteres.");
    await user.clear(within(dialog).getByLabelText("Contraseña inicial"));
    await user.type(within(dialog).getByLabelText("Contraseña inicial"), "Clave12345");
    await user.click(within(dialog).getByRole("button", { name: "Registrar", hidden: true }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Profesor registrado"));
  });

  it("muestra estados de error y vacío", async () => {
    const { unmount } = renderPage(<Users />, { session: makeSession("teacher"), mocks: [fail(GET_ALL_USERS, undefined)] });
    expect(await screen.findByText("No se pudo cargar la lista de usuarios.")).toBeInTheDocument();
    unmount();
    renderPage(<Users />, { session: makeSession("teacher"), mocks: [ok(GET_ALL_USERS, undefined, { getAllUser: [] })] });
    expect(await screen.findByText("Sin resultados")).toBeInTheDocument();
  });
});

describe("Notices", () => {
  const withImage = { ...notice, id: 2, title: "Con imagen", imageUrl: "https://example.com/a.png" };
  const list = ok(GET_ALL_NOTICES, undefined, { getAllNotices: [notice, withImage] });

  it("el apoderado solo lee los anuncios", async () => {
    renderPage(<Notices />, { session: makeSession("parents"), mocks: [list] });
    expect(await screen.findByText("Reunión de apoderados")).toBeInTheDocument();
    expect(screen.getByText("Con imagen")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Nuevo anuncio" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
  });

  it("el profesor publica un anuncio", async () => {
    const user = userEvent.setup();
    renderPage(<Notices />, {
      session: makeSession("teacher"),
      mocks: [list, ok(CREATE_NOTICE, { title: "Paseo", description: "Salida a terreno", imageUrl: "https://example.com/p.png" }, { createNotice: { isCreateNotice: true } })],
    });
    await screen.findByText("Reunión de apoderados");
    await user.click(screen.getByRole("button", { name: "Nuevo anuncio" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Título"), "Paseo");
    await user.type(within(dialog).getByLabelText("Mensaje"), "Salida a terreno");
    await user.type(within(dialog).getByLabelText(/url de imagen/i), "https://example.com/p.png");
    await user.click(within(dialog).getByRole("button", { name: "Publicar", hidden: true }));
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Anuncio publicado"));
  });

  it("informa cuando no se pudo publicar", async () => {
    const user = userEvent.setup();
    renderPage(<Notices />, {
      session: makeSession("admin"),
      mocks: [list, ok(CREATE_NOTICE, { title: "Paseo", description: "Salida", imageUrl: null }, { createNotice: { isCreateNotice: false } })],
    });
    await screen.findByText("Reunión de apoderados");
    await user.click(screen.getByRole("button", { name: "Nuevo anuncio" }));
    const dialog = screen.getByRole("dialog", { hidden: true });
    await user.type(within(dialog).getByLabelText("Título"), "Paseo");
    await user.type(within(dialog).getByLabelText("Mensaje"), "Salida");
    await user.click(within(dialog).getByRole("button", { name: "Publicar", hidden: true }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("elimina un anuncio tras confirmar y respeta la cancelación", async () => {
    const user = userEvent.setup();
    vi.mocked(alerts.confirmAction).mockResolvedValueOnce(false);
    renderPage(<Notices />, {
      session: makeSession("teacher"),
      mocks: [list, ok(DELETE_NOTICE, { id: 1 }, { deleteNotice: true }), fail(DELETE_NOTICE, { id: 2 })],
    });
    await screen.findByText("Reunión de apoderados");
    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    expect(alerts.notifySuccess).not.toHaveBeenCalled();
    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalledWith("Anuncio eliminado"));
    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[1]);
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("muestra estados vacío y de error", async () => {
    const { unmount } = renderPage(<Notices />, { session: makeSession("parents"), mocks: [ok(GET_ALL_NOTICES, undefined, { getAllNotices: [] })] });
    expect(await screen.findByText("No hay anuncios publicados")).toBeInTheDocument();
    unmount();
    renderPage(<Notices />, { session: makeSession("parents"), mocks: [fail(GET_ALL_NOTICES, undefined)] });
    expect(await screen.findByText("No se pudieron cargar los anuncios.")).toBeInTheDocument();
  });
});
