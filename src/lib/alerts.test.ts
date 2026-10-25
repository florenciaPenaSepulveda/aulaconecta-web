import * as alerts from "./alerts";
import { swalFire as fire } from "../test/swal";

vi.unmock("./alerts");

describe("alerts", () => {
  beforeEach(() => {
    fire.mockReset();
    fire.mockResolvedValue({ isConfirmed: true });
  });

  it("muestra notificaciones de cada tipo", async () => {
    alerts.notifySuccess("Listo");
    alerts.notifyError("Falló");
    alerts.notifyWarning("Atención");
    await alerts.notifyInfo("Info", "Detalle");
    const icons = fire.mock.calls.map(([options]) => options.icon);
    expect(icons).toEqual(["success", "error", "warning", "info"]);
  });

  it("muestra la alerta dentro del diálogo abierto", async () => {
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");
    document.body.appendChild(dialog);
    alerts.notifyWarning("Dentro del modal");
    expect(fire.mock.calls[0][0].target).toBe(dialog);
    dialog.remove();
    alerts.notifyWarning("Fuera del modal");
    expect(fire.mock.calls[1][0].target).toBe(document.body);
  });

  it("devuelve la confirmación del usuario", async () => {
    await expect(alerts.confirmAction("Título", "Texto")).resolves.toBe(true);
    fire.mockResolvedValue({ isConfirmed: false });
    await expect(alerts.confirmAction("Título", "Texto", "Eliminar")).resolves.toBe(false);
  });

  it("extrae mensajes de error", async () => {
    expect(alerts.errorMessage({ graphQLErrors: [{ message: "Detalle" }] })).toBe("Detalle");
    expect(alerts.errorMessage(new Error("Directo"))).toBe("Directo");
    expect(alerts.errorMessage(new Error("Bad Request Exception"), "Genérico")).toBe("Genérico");
    expect(alerts.errorMessage(undefined)).toBe("Ocurrió un error inesperado");
  });
});
