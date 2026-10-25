import Swal, { SweetAlertOptions } from "sweetalert2";

const alertTarget = (): HTMLElement => document.querySelector<HTMLElement>("dialog[open]") ?? document.body;

const base = Swal.mixin({
  confirmButtonColor: "#1f3a5f",
  cancelButtonColor: "#6b7280",
  confirmButtonText: "Aceptar",
  cancelButtonText: "Cancelar",
  customClass: { popup: "text-sm", title: "text-lg" },
});

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

const show = (options: SweetAlertOptions) => base.fire({ ...options, target: alertTarget() });

export const notifySuccess = (title: string) => toast.fire({ icon: "success", title, target: alertTarget() });

export const notifyError = (text: string, title = "No se pudo completar la acción") =>
  show({ icon: "error", title, text });

export const notifyWarning = (text: string, title = "Revisa los datos") => show({ icon: "warning", title, text });

export const notifyInfo = (title: string, text: string) => show({ icon: "info", title, text });

export const confirmAction = async (title: string, text: string, confirmText = "Confirmar") => {
  const result = await show({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
  });
  return result.isConfirmed;
};

export const errorMessage = (error: unknown, fallback = "Ocurrió un error inesperado"): string => {
  const message =
    (error as { graphQLErrors?: { message: string }[] })?.graphQLErrors?.[0]?.message ??
    (error as { message?: string })?.message;
  if (!message || message === "Bad Request Exception") {
    return fallback;
  }
  return message;
};
