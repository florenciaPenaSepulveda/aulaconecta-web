export type Role = "admin" | "teacher" | "parents" | "student";

export interface Session {
  token: string;
  id: number;
  role: Role;
  firstName: string;
  isChangePassword: boolean;
}

const KEY = "aulaconecta.session";

export const normalizeRole = (role: string): Role => role.toLowerCase() as Role;

export const loadSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
};

export const saveSession = (session: Session | null): void => {
  try {
    if (session) {
      localStorage.setItem(KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    return;
  }
};

export const roleLabel: Record<Role, string> = {
  admin: "Administrador",
  teacher: "Profesor",
  parents: "Apoderado",
  student: "Estudiante",
};
