import { gql } from "@apollo/client";

export const INICIO_SESION = gql`
    mutation InicioSesion($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            isChangePassword
            message
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

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($newPassword: String!) {
    changePassword(newPassword: $newPassword) {
      message
    }
  }
`;


export const CREAR_ASIGNATURA = gql`
  mutation CrearAsignatura($createSubjectInput: CreateSubjectDto!) {
    createSubject(createSubjectInput: $createSubjectInput) {
      isCreateSubject
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($createUserDto: CreateUserDto!) {
    createUser(createUserDto: $createUserDto) {
      id
      firstName
      lastName
      email
      rut
      role
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($rut: String!, $updateUserDto: UpdateUserDto!) {
    updateUser(rut: $rut, updateUserDto: $updateUserDto) {
      id
      firstName
      lastName
      email
    }
  }
`;

export const DELETE_USER = gql`
  mutation RemoveUser($rut: String!) {
    removeUser(rut: $rut)
  }
`;

export const TAKE_ASIT = gql`
  mutation Mutation($createAsistInput: CreateAsistDto!) {
    takeAsist(createAsistInput: $createAsistInput)
  }
`;
