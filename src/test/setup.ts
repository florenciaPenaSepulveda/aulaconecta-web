import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as alerts from "../lib/alerts";

vi.mock("sweetalert2", async () => {
  const { swalFire } = await import("./swal");
  return { default: { mixin: () => ({ fire: swalFire }) } };
});

vi.mock("../lib/alerts", async (importOriginal) => {
  const original = await importOriginal<typeof import("../lib/alerts")>();
  return {
    ...original,
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
    notifyWarning: vi.fn(),
    notifyInfo: vi.fn().mockResolvedValue(undefined),
    confirmAction: vi.fn(),
  };
});

beforeEach(() => {
  vi.mocked(alerts.notifyInfo).mockResolvedValue(undefined as never);
  vi.mocked(alerts.confirmAction).mockResolvedValue(true);
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  this.removeAttribute("open");
};
Element.prototype.scrollIntoView = vi.fn();
