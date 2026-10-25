import { ReactElement } from "react";
import { render } from "@testing-library/react";
import { DocumentNode } from "graphql";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import { Role, Session, saveSession } from "../lib/session";

export const makeSession = (role: Role, overrides: Partial<Session> = {}): Session => ({
  token: "token",
  id: 1,
  role,
  firstName: "Carlos",
  isChangePassword: false,
  ...overrides,
});

export const ok = (
  query: DocumentNode,
  variables: Record<string, unknown> | undefined,
  data: Record<string, unknown>,
): MockedResponse => ({
  request: { query, variables },
  result: { data },
  maxUsageCount: 20,
});

export const fail = (
  query: DocumentNode,
  variables: Record<string, unknown> | undefined,
  message = "Error de prueba",
): MockedResponse => ({
  request: { query, variables },
  error: new Error(message),
  maxUsageCount: 20,
});

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

interface Options {
  route?: string;
  path?: string;
  session?: Session | null;
  mocks?: MockedResponse[];
}

export const renderPage = (ui: ReactElement, { route = "/", path = "*", session = null, mocks = [] }: Options = {}) => {
  saveSession(session);
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <Routes>
            <Route path={path} element={ui} />
            <Route path="*" element={<div>Otra ruta</div>} />
          </Routes>
          <LocationProbe />
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>,
  );
};
