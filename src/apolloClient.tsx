import {
    ApolloClient,
    InMemoryCache,
    createHttpLink
  } from "@apollo/client";
  import { setContext } from "@apollo/client/link/context";
  
  // Enlace HTTP para las solicitudes GraphQL
  const httpLink = createHttpLink({
    uri: "https://auction-reported-incentive-mud.trycloudflare.com/graphql",  // Ajusta esto a tu URL del servidor GraphQL
  });
  
  // Middleware para agregar el token en las solicitudes
  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('authToken');  // Obtener el token de localStorage
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",  // Enviar el token si existe
      }
    };
  });
  
  // Configura Apollo Client con el enlace de autenticación
  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
  
  export default client;