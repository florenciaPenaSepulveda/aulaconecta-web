import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { loadSession, saveSession } from "./lib/session";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || "http://localhost:3000/graphql",
});

const authLink = setContext((_, { headers }) => {
  const session = loadSession();
  return {
    headers: {
      ...headers,
      authorization: session ? `Bearer ${session.token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors }) => {
  const expired = graphQLErrors?.some(
    (error) => error.extensions?.code === "UNAUTHENTICATED" && /token/i.test(error.message),
  );
  if (expired) {
    saveSession(null);
    window.location.assign("/");
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});

export default client;
