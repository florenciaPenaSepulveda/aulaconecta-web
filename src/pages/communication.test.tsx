import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import Chat from "./chat/Chat";
import Children from "./children/Children";
import ChildDetail from "./children/ChildDetail";
import App from "../App";
import client from "../apolloClient";
import {
  ATTENDANCE_BY_STUDENT,
  CHAT_CONTACTS,
  CONVERSATION,
  GET_ALL_NOTICES as GET_NOTICES,
  GRADES_BY_STUDENT,
  LOGIN,
  MY_CHILDREN,
  SEND_MESSAGE,
} from "../graphql/operations";
import * as alerts from "../lib/alerts";
import { loadSession, saveSession } from "../lib/session";
import { student } from "../test/fixtures";
import { fail, makeSession, ok, renderPage } from "../test/utils";

const contact = { id: "4", firstName: "Paula", lastName: "Apoderada", role: "Parents" };
const teacherContact = { id: "2", firstName: "Carlos", lastName: "Muñoz", role: "Teacher" };

const messages = [
  { id: "1", fromId: 1, toId: 4, content: "Buenos días", createdAt: "2026-10-20T12:00:00.000Z" },
  { id: "2", fromId: 4, toId: 1, content: "Muchas gracias", createdAt: "2026-10-21T12:00:00.000Z" },
];

describe("Chat", () => {
  it("lista los contactos y abre la conversación", async () => {
    const user = userEvent.setup();
    renderPage(<Chat />, {
      session: makeSession("teacher"),
      mocks: [ok(CHAT_CONTACTS, undefined, { chatContacts: [contact] }), ok(CONVERSATION, { withId: 4 }, { conversation: messages })],
    });
    expect(await screen.findByText("Paula Apoderada")).toBeInTheDocument();
    expect(screen.getByText("Selecciona un contacto para ver la conversación.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /paula apoderada/i }));
    expect(await screen.findByText("Buenos días")).toBeInTheDocument();
    expect(screen.getByText("Muchas gracias")).toBeInTheDocument();
  });

  it("envía un mensaje", async () => {
    const user = userEvent.setup();
    renderPage(<Chat />, {
      session: makeSession("teacher"),
      mocks: [
        ok(CHAT_CONTACTS, undefined, { chatContacts: [contact] }),
        ok(CONVERSATION, { withId: 4 }, { conversation: [] }),
        ok(SEND_MESSAGE, { toId: 4, content: "Hola" }, { sendMessage: { id: "3" } }),
      ],
    });
    await user.click(await screen.findByRole("button", { name: /paula apoderada/i }));
    expect(await screen.findByText(/Aún no hay mensajes/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
    await user.type(screen.getByPlaceholderText("Escribe un mensaje"), "Hola");
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(screen.getByPlaceholderText("Escribe un mensaje")).toHaveValue(""));
  });

  it("informa cuando falla el envío", async () => {
    const user = userEvent.setup();
    renderPage(<Chat />, {
      session: makeSession("parents", { id: 4 }),
      mocks: [
        ok(CHAT_CONTACTS, undefined, { chatContacts: [teacherContact] }),
        ok(CONVERSATION, { withId: 2 }, { conversation: [] }),
        fail(SEND_MESSAGE, { toId: 2, content: "Hola" }),
      ],
    });
    expect(await screen.findByText("Conversa con los profesores de tus pupilos")).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: /carlos muñoz/i }));
    await user.type(await screen.findByPlaceholderText("Escribe un mensaje"), "Hola");
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("explica cuándo no hay contactos según el rol", async () => {
    const { unmount } = renderPage(<Chat />, {
      session: makeSession("parents"),
      mocks: [ok(CHAT_CONTACTS, undefined, { chatContacts: [] })],
    });
    expect(await screen.findByText(/cuando tus pupilos estén inscritos/)).toBeInTheDocument();
    unmount();
    renderPage(<Chat />, { session: makeSession("teacher"), mocks: [ok(CHAT_CONTACTS, undefined, { chatContacts: [] })] });
    expect(await screen.findByText(/apoderados de los estudiantes inscritos/)).toBeInTheDocument();
  });

  it("informa cuando falla la carga de contactos", async () => {
    renderPage(<Chat />, { session: makeSession("teacher"), mocks: [fail(CHAT_CONTACTS, undefined)] });
    expect(await screen.findByText("No se pudieron cargar tus contactos.")).toBeInTheDocument();
  });

  it("no muestra nada sin sesión", () => {
    renderPage(<Chat />, { mocks: [ok(CHAT_CONTACTS, undefined, { chatContacts: [] })] });
    expect(screen.queryByText("Mensajes")).not.toBeInTheDocument();
  });
});

describe("Children", () => {
  it("lista los pupilos del apoderado", async () => {
    renderPage(<Children />, { session: makeSession("parents"), mocks: [ok(MY_CHILDREN, undefined, { myChildren: [student] })] });
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver detalle/i })).toHaveAttribute("href", "/pupilos/5");
  });

  it("explica cuando no hay pupilos o falla la carga", async () => {
    const { unmount } = renderPage(<Children />, { session: makeSession("parents"), mocks: [ok(MY_CHILDREN, undefined, { myChildren: [] })] });
    expect(await screen.findByText("No tienes pupilos asociados")).toBeInTheDocument();
    unmount();
    renderPage(<Children />, { session: makeSession("parents"), mocks: [fail(MY_CHILDREN, undefined)] });
    expect(await screen.findByText(/No se pudo cargar/)).toBeInTheDocument();
  });
});

describe("ChildDetail", () => {
  const attendance = {
    attendanceByStudent: [
      { totalAsist: 9, totalAbsences: 1, subject: { id: "10", name: "Matemática", numberOfClasses: 40, course: { nameCourse: "1° Básico A" } } },
      { totalAsist: 12, totalAbsences: 8, subject: { id: "11", name: "Inglés", numberOfClasses: 40, course: { nameCourse: "1° Básico A" } } },
      { totalAsist: 0, totalAbsences: 0, subject: { id: "12", name: "Música", numberOfClasses: 40, course: { nameCourse: "1° Básico A" } } },
    ],
  };
  const grades = {
    gradesByStudentId: [
      { id: "1", grade: 6.5, studentId: 5, subjectId: 10 },
      { id: "2", grade: 3.5, studentId: 5, subjectId: 11 },
    ],
  };
  const render = (mocks = [ok(MY_CHILDREN, undefined, { myChildren: [student] }), ok(GRADES_BY_STUDENT, { studentId: 5 }, grades), ok(ATTENDANCE_BY_STUDENT, { studentId: 5 }, attendance)]) =>
    renderPage(<ChildDetail />, { route: "/pupilos/5", path: "/pupilos/:id", session: makeSession("parents"), mocks });

  it("muestra promedio, asistencia y detalle por asignatura", async () => {
    render();
    expect(await screen.findByRole("heading", { name: "Juan Pérez" })).toBeInTheDocument();
    expect(screen.getAllByText("6.5").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3.5").length).toBeGreaterThan(0);
    expect(screen.getByText("Sin notas")).toBeInTheDocument();
    expect(screen.getByText("Sin registros")).toBeInTheDocument();
    expect(screen.getByText(/90% \(1 aus\.\)/)).toBeInTheDocument();
    expect(screen.getByText(/60% \(8 aus\.\)/)).toBeInTheDocument();
  });

  it("muestra el estado vacío sin asignaturas", async () => {
    render([
      ok(MY_CHILDREN, undefined, { myChildren: [student] }),
      ok(GRADES_BY_STUDENT, { studentId: 5 }, { gradesByStudentId: [] }),
      ok(ATTENDANCE_BY_STUDENT, { studentId: 5 }, { attendanceByStudent: [] }),
    ]);
    expect(await screen.findByText("Sin asignaturas")).toBeInTheDocument();
  });

  it("informa si el estudiante no está a cargo o falla la carga", async () => {
    const { unmount } = render([
      ok(MY_CHILDREN, undefined, { myChildren: [] }),
      ok(GRADES_BY_STUDENT, { studentId: 5 }, grades),
      ok(ATTENDANCE_BY_STUDENT, { studentId: 5 }, attendance),
    ]);
    expect(await screen.findByText("No se pudo cargar la información del estudiante.")).toBeInTheDocument();
    unmount();
    render([ok(MY_CHILDREN, undefined, { myChildren: [student] }), fail(GRADES_BY_STUDENT, { studentId: 5 }), ok(ATTENDANCE_BY_STUDENT, { studentId: 5 }, attendance)]);
    expect(await screen.findByText("No se pudo cargar la información del estudiante.")).toBeInTheDocument();
  });
});

describe("App", () => {
  it("muestra el ingreso en la raíz", () => {
    window.history.pushState({}, "", "/");
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <App />
      </MockedProvider>,
    );
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("redirige las rutas protegidas al ingreso sin sesión", () => {
    window.history.pushState({}, "", "/mensajes");
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <App />
      </MockedProvider>,
    );
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("muestra el inicio del profesor con sesión", async () => {
    saveSession(makeSession("teacher"));
    window.history.pushState({}, "", "/anuncios");
    render(
      <MockedProvider mocks={[ok(GET_NOTICES, undefined, { getAllNotices: [] })]} addTypename={false}>
        <App />
      </MockedProvider>,
    );
    expect(await screen.findByRole("heading", { name: "Anuncios" })).toBeInTheDocument();
  });
});


describe("cliente Apollo", () => {
  const respond = (body: unknown) =>
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } }),
    );

  afterEach(async () => {
    await client.clearStore();
  });

  it("envía el token de la sesión en la cabecera", async () => {
    saveSession(makeSession("teacher", { token: "mi-token" }));
    const fetchSpy = respond({ data: { login: { token: "x", id: 1, role: "teacher", firstName: "A", isChangePassword: false } } });
    await client.mutate({ mutation: LOGIN, variables: { email: "a@b.cl", password: "123456" } });
    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer mi-token");
  });

  it("no envía token sin sesión", async () => {
    const fetchSpy = respond({ data: { getAllNotices: [] } });
    await client.query({ query: GET_NOTICES, fetchPolicy: "network-only" });
    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.authorization).toBe("");
  });

  it("cierra la sesión cuando el token expira", async () => {
    saveSession(makeSession("teacher"));
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });
    respond({ errors: [{ message: "Token is invalid or expired", extensions: { code: "UNAUTHENTICATED" } }] });
    await expect(client.query({ query: GET_NOTICES, fetchPolicy: "network-only" })).rejects.toBeDefined();
    expect(loadSession()).toBeNull();
    expect(assign).toHaveBeenCalledWith("/");
    vi.unstubAllGlobals();
  });
});
