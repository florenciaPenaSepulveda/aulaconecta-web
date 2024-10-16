import { gql } from "@apollo/client";


export const INICIO_SESION = gql`
    query InicioSesion {
        veriUser {
            email
            pass
        }
    }
`;

export const Mensaje = gql`
    query InicioSesion {
        mensaje
    }
`;

//Get user como usuario de ejemplo
export const GET_USERS = gql`
    query GetUsers {
        user(email: "elias.manque.o@gmail.com"){
            name
            password
        }
}
`;

export const GET_USER_DATA = gql`
  query GetUserData {
    me {
      name
      email
    }
  }
`;