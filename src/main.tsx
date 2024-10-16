import React from 'react';
import ReactDOM from 'react-dom/client';
//import { AuthProvider } from './auth/AuthContext';
import App from './App';
import './styles/index.css';

//<Route path="/" element={<Home />}/>
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from "@apollo/client";
import { setContext } from '@apollo/client/link/context';


const httpLink = createHttpLink({
  uri: "https://listings-illness-miller-advice.trycloudflare.com/graphql",
});


const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>
    <ApolloProvider client={client}>
          <App/>
    </ApolloProvider>
  </React.StrictMode>,
)