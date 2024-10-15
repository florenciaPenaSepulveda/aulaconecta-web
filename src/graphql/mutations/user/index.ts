import { gql } from "@apollo/client";

export const INICIO_SESION = gql`
    mutation InicioSesion($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
        }
    }
`;

export const FORGOT_PASS = gql`
    mutation ForgotPass($email: String!){
        forgotPass(email: $email){
            message
        }
    }
`;

export const REGISTER = gql`
    mutation Register($nombre: String!, $apellidos: String!, $email: String!, $pass: String!) {
        register(name: $nombre, apellidos: $apellidos, email: $email, password: $pass) {
            message
        }
    }
`;
