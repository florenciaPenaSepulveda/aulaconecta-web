import { screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";
import {
  ATTENDANCE_BY_STUDENT,
  GET_ALL_NOTICES,
  GET_ALL_USERS,
  GRADES_BY_STUDENT,
  LIST_COURSES,
  LIST_SUBJECTS,
  MY_CHILDREN,
  SUBJECTS_BY_TEACHER,
} from "../graphql/operations";
import { course, guardian, notice, student, subject, teacherUser } from "../test/fixtures";
import { fail, makeSession, ok, renderPage } from "../test/utils";

const noticesMock = ok(GET_ALL_NOTICES, undefined, { getAllNotices: [notice] });

describe("Dashboard del profesor", () => {
  it("muestra sus asignaturas y los anuncios recientes", async () => {
    renderPage(<Dashboard />, {
      session: makeSession("teacher"),
      mocks: [ok(SUBJECTS_BY_TEACHER, { idTeacher: 1 }, { getAllSubjectByIdTeacher: [subject] }), noticesMock],
    });
    expect(screen.getByText("Hola, Carlos")).toBeInTheDocument();
    expect(await screen.findByText("Matemática")).toBeInTheDocument();
    expect(await screen.findByText("Reunión de apoderados")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Asistencia" })).toHaveAttribute("href", "/asignaturas/10");
    expect(screen.getByRole("link", { name: "Notas" })).toHaveAttribute("href", "/asignaturas/10/notas");
  });

  it("sugiere crear asignaturas cuando no tiene ninguna", async () => {
    renderPage(<Dashboard />, {
      session: makeSession("teacher"),
      mocks: [ok(SUBJECTS_BY_TEACHER, { idTeacher: 1 }, { getAllSubjectByIdTeacher: [] }), ok(GET_ALL_NOTICES, undefined, { getAllNotices: [] })],
    });
    expect(await screen.findByText("Aún no tienes asignaturas")).toBeInTheDocument();
    expect(await screen.findByText("No hay anuncios publicados.")).toBeInTheDocument();
  });

  it("informa cuando falla la carga", async () => {
    renderPage(<Dashboard />, {
      session: makeSession("teacher"),
      mocks: [fail(SUBJECTS_BY_TEACHER, { idTeacher: 1 }), noticesMock],
    });
    expect(await screen.findByText("No se pudieron cargar las asignaturas.")).toBeInTheDocument();
  });
});

describe("Dashboard del administrador", () => {
  it("muestra los totales del colegio", async () => {
    renderPage(<Dashboard />, {
      session: makeSession("admin", { firstName: "Ana" }),
      mocks: [
        ok(LIST_SUBJECTS, undefined, { listSubject: [subject] }),
        ok(GET_ALL_USERS, undefined, { getAllUser: [student, teacherUser, guardian] }),
        ok(LIST_COURSES, undefined, { listCourses: [{ ...course, subjects: [] }] }),
        noticesMock,
      ],
    });
    expect(screen.getByText("Resumen general del colegio")).toBeInTheDocument();
    expect(await screen.findByText("Asignaturas del colegio")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Estudiantes").nextSibling).toHaveTextContent("1"));
    expect(screen.getByText("Profesores").nextSibling).toHaveTextContent("1");
    expect(screen.getByText("Cursos").nextSibling).toHaveTextContent("1");
  });
});

describe("Dashboard del apoderado", () => {
  const childMocks = [
    ok(MY_CHILDREN, undefined, { myChildren: [student] }),
    ok(GRADES_BY_STUDENT, { studentId: 5 }, {
      gradesByStudentId: [
        { id: "1", grade: 6, studentId: 5, subjectId: 10 },
        { id: "2", grade: 5, studentId: 5, subjectId: 10 },
      ],
    }),
    ok(ATTENDANCE_BY_STUDENT, { studentId: 5 }, {
      attendanceByStudent: [{ totalAsist: 9, totalAbsences: 1, subject: { id: "10", name: "Matemática", numberOfClasses: 40, course: { nameCourse: "1° Básico A" } } }],
    }),
    noticesMock,
  ];

  it("resume el rendimiento de cada pupilo", async () => {
    renderPage(<Dashboard />, { session: makeSession("parents", { firstName: "Paula" }), mocks: childMocks });
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(await screen.findByText("5.5")).toBeInTheDocument();
    expect(await screen.findByText("90%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver detalle académico/i })).toHaveAttribute("href", "/pupilos/5");
  });

  it("explica qué hacer cuando no hay pupilos asociados", async () => {
    renderPage(<Dashboard />, {
      session: makeSession("parents"),
      mocks: [ok(MY_CHILDREN, undefined, { myChildren: [] }), noticesMock],
    });
    expect(await screen.findByText("No tienes pupilos asociados")).toBeInTheDocument();
  });

  it("informa cuando falla la carga", async () => {
    renderPage(<Dashboard />, { session: makeSession("parents"), mocks: [fail(MY_CHILDREN, undefined), noticesMock] });
    expect(await screen.findByText(/No se pudo cargar la información de tus pupilos/)).toBeInTheDocument();
  });

  it("muestra guiones cuando aún no hay notas ni asistencia", async () => {
    renderPage(<Dashboard />, {
      session: makeSession("parents"),
      mocks: [
        ok(MY_CHILDREN, undefined, { myChildren: [student] }),
        ok(GRADES_BY_STUDENT, { studentId: 5 }, { gradesByStudentId: [] }),
        ok(ATTENDANCE_BY_STUDENT, { studentId: 5 }, { attendanceByStudent: [] }),
        noticesMock,
      ],
    });
    await screen.findByText("Juan Pérez");
    await waitFor(() => expect(screen.getAllByText("-").length).toBe(2));
  });
});
