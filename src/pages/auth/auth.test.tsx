import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import Register from "./Register";
import ForgotPass from "./ForgotPass";
import ChangePassword from "./ChangePassword";
import { CHANGE_PASSWORD, FORGOT_PASS, LOGIN, REGISTER } from "../../graphql/operations";
import { loadSession } from "../../lib/session";
import * as alerts from "../../lib/alerts";
import { fail, makeSession, ok, renderPage } from "../../test/utils";

describe("Login", () => {
  const loginMock = (isChangePassword = false) =>
    ok(LOGIN, { email: "profe@test.cl", password: "Demo1234" }, {
      login: { token: "jwt", id: 7, role: "teacher", firstName: "Carlos", isChangePassword },
    });

  const submit = async () => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/correo electrónico/i), " profe@test.cl ");
    await user.type(screen.getByPlaceholderText("Tu contraseña"), "Demo1234");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
  };

  it("inicia sesión y guarda la sesión", async () => {
    renderPage(<Login />, { mocks: [loginMock()] });
    await submit();
    await waitFor(() => expect(loadSession()).toMatchObject({ token: "jwt", role: "teacher", id: 7 }));
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/inicio"));
  });

  it("redirige a cambiar la contraseña cuando es obligatorio", async () => {
    renderPage(<Login />, { mocks: [loginMock(true)] });
    await submit();
    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/cambiar-clave"));
  });

  it("informa cuando las credenciales son incorrectas", async () => {
    renderPage(<Login />, { mocks: [fail(LOGIN, { email: "profe@test.cl", password: "Demo1234" })] });
    await submit();
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
    expect(loadSession()).toBeNull();
  });

  it("informa cuando la respuesta no trae token", async () => {
    renderPage(<Login />, {
      mocks: [ok(LOGIN, { email: "profe@test.cl", password: "Demo1234" }, { login: { token: null } })],
    });
    await submit();
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });

  it("redirige si ya hay una sesión activa", () => {
    renderPage(<Login />, { session: makeSession("teacher") });
    expect(screen.getByTestId("location")).toHaveTextContent("/");
    expect(screen.queryByRole("button", { name: /iniciar sesión/i })).not.toBeInTheDocument();
  });

  it("redirige a cambiar contraseña si la sesión lo exige", () => {
    renderPage(<Login />, { session: makeSession("teacher", { isChangePassword: true }) });
    expect(screen.queryByRole("button", { name: /iniciar sesión/i })).not.toBeInTheDocument();
  });
});

describe("Register", () => {
  const fill = async (rut: string, password = "Clave12345", confirm = "Clave12345") => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Apellido"), "Pérez");
    await user.type(screen.getByLabelText("RUT"), rut);
    await user.type(screen.getByLabelText(/correo electrónico/i), "ana@test.cl");
    await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "parents");
    await user.type(screen.getByLabelText("Contraseña"), password);
    await user.type(screen.getByLabelText(/repetir contraseña/i), confirm);
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
  };

  const variables = {
    firstName: "Ana",
    lastName: "Pérez",
    rut: "12.345.678-5",
    email: "ana@test.cl",
    password: "Clave12345",
    role: "parents",
  };

  it("crea la cuenta y vuelve al inicio de sesión", async () => {
    renderPage(<Register />, { mocks: [ok(REGISTER, variables, { register: { message: "ok" } })] });
    await fill("123456785");
    await waitFor(() => expect(alerts.notifySuccess).toHaveBeenCalled());
    expect(screen.getByTestId("location")).toHaveTextContent("/");
  });

  it("valida el RUT, el largo y la coincidencia de contraseñas", async () => {
    renderPage(<Register />);
    await fill("123456789");
    expect(alerts.notifyWarning).toHaveBeenLastCalledWith("El RUT ingresado no es válido.");
  });

  it("rechaza contraseñas cortas", async () => {
    renderPage(<Register />);
    await fill("123456785", "corta", "corta");
    expect(alerts.notifyWarning).toHaveBeenLastCalledWith("La contraseña debe tener al menos 8 caracteres.");
  });

  it("rechaza contraseñas que no coinciden", async () => {
    renderPage(<Register />);
    await fill("123456785", "Clave12345", "Otra123456");
    expect(alerts.notifyWarning).toHaveBeenLastCalledWith("Las contraseñas no coinciden.");
  });

  it("muestra el error del servidor", async () => {
    renderPage(<Register />, { mocks: [fail(REGISTER, variables, "El email ya se encuentra registrado")] });
    await fill("123456785");
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
  });
});

describe("ForgotPass", () => {
  const submit = async () => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/correo electrónico/i), "ana@test.cl");
    await user.click(screen.getByRole("button", { name: /enviar contraseña temporal/i }));
  };

  it("solicita la contraseña temporal", async () => {
    renderPage(<ForgotPass />, { mocks: [ok(FORGOT_PASS, { email: "ana@test.cl" }, { forgotPass: { message: "ok" } })] });
    await submit();
    await waitFor(() => expect(alerts.notifyInfo).toHaveBeenCalled());
  });

  it("informa si no se pudo enviar", async () => {
    renderPage(<ForgotPass />, { mocks: [fail(FORGOT_PASS, { email: "ana@test.cl" }, "El envío no está configurado")] });
    await submit();
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalledWith("El envío no está configurado"));
  });
});

describe("ChangePassword", () => {
  const submit = async (password: string, confirm: string, current = "Demo1234") => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Contraseña (actual|temporal)/), current);
    await user.type(screen.getByLabelText("Nueva contraseña"), password);
    await user.type(screen.getByLabelText("Confirmar contraseña"), confirm);
    await user.click(screen.getByRole("button", { name: /guardar contraseña/i }));
  };

  it("redirige al inicio de sesión sin sesión", () => {
    renderPage(<ChangePassword />);
    expect(screen.queryByText("Cambiar contraseña")).not.toBeInTheDocument();
  });

  it("actualiza la contraseña y marca la sesión como actualizada", async () => {
    renderPage(<ChangePassword />, {
      session: makeSession("teacher", { isChangePassword: true }),
      mocks: [ok(CHANGE_PASSWORD, { currentPassword: "Demo1234", newPassword: "Clave12345" }, { changePassword: { message: "ok", token: "token-nuevo" } })],
    });
    expect(screen.getByText(/debes definir una nueva contraseña/i)).toBeInTheDocument();
    await submit("Clave12345", "Clave12345");
    await waitFor(() => expect(loadSession()?.isChangePassword).toBe(false));
    expect(loadSession()?.token).toBe("token-nuevo");
    expect(screen.getByTestId("location")).toHaveTextContent("/inicio");
  });

  it("valida el largo y la coincidencia", async () => {
    renderPage(<ChangePassword />, { session: makeSession("teacher") });
    await submit("corta", "corta");
    expect(alerts.notifyWarning).toHaveBeenLastCalledWith("La contraseña debe tener al menos 8 caracteres.");
    await userEvent.clear(screen.getByLabelText("Nueva contraseña"));
    await userEvent.clear(screen.getByLabelText("Confirmar contraseña"));
    await userEvent.clear(screen.getByLabelText(/Contraseña (actual|temporal)/));
    await submit("Clave12345", "Distinta123");
    expect(alerts.notifyWarning).toHaveBeenLastCalledWith("Las contraseñas no coinciden.");
  });

  it("exige la contraseña actual y que la nueva sea distinta", async () => {
    renderPage(<ChangePassword />, { session: makeSession("teacher") });
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Nueva contraseña"), "Clave12345");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "Clave12345");
    await user.click(screen.getByRole("button", { name: /guardar contraseña/i }));
    expect(alerts.notifyWarning).toHaveBeenLastCalledWith("Ingresa tu contraseña actual.");
    await user.type(screen.getByLabelText("Contraseña actual"), "Clave12345");
    await user.click(screen.getByRole("button", { name: /guardar contraseña/i }));
    expect(alerts.notifyWarning).toHaveBeenLastCalledWith("La nueva contraseña debe ser distinta de la actual.");
  });

  it("pide la contraseña temporal cuando el cambio es obligatorio", () => {
    renderPage(<ChangePassword />, { session: makeSession("teacher", { isChangePassword: true }) });
    expect(screen.getByLabelText("Contraseña temporal")).toBeInTheDocument();
  });

  it("muestra el error del servidor y permite cancelar", async () => {
    renderPage(<ChangePassword />, {
      session: makeSession("teacher"),
      mocks: [fail(CHANGE_PASSWORD, { currentPassword: "Demo1234", newPassword: "Clave12345" })],
    });
    await submit("Clave12345", "Clave12345");
    await waitFor(() => expect(alerts.notifyError).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });
});
