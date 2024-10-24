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
  mutation Register($firstName: String!, $lastName: String!, $rut: String!, $email: String!, $role: UserRoles!, $password: String!) {
    createUser(createUserDto: {
      firstName: $firstName,
      lastName: $lastName,
      rut: $rut,
      email: $email,
      role: $role,
      password: $password
    }) {
      id
      firstName
      lastName
      email
      role
    }
  }
`;
