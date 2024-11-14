import { gql } from "@apollo/client";




export interface Student {
    id: string;
    rut: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "Student" | "Teacher" | "Admin" | "Parents";
    isPresent: boolean;
  }
  
  export interface ListUsersBySubjectData {
    listUsersBySubject: {
      user: {
        id: string;
        firstName: string;
        lastName: string;
        rut: string;
        email: string;
        role: "Student" | "Teacher" | "Admin" | "Parents";
      };
      totalAsist: number;
      totalAbsences: number;
    }[];
  }
  
  export interface ListUsersBySubjectVars {
    idSubject: number;
  }
  

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

export const GET_USERS = gql`
    query GetUsers {
        user(email: "elias.manque.o@gmail.com"){
            name
            password
        }
}
`;

export const OBTENER_INFO = gql`
    query{
        conseguirInformacionUsuario{
            nombre
            correo
        }
    }
`;


export const LISTAR_CURSOS = gql`
    query ListSubject {
        listSubject {
            name
            numberOfClasses
            id
        }
    }
`;

export const LIST_USERS_BY_SUBJECT = gql`
  query ListUsersBySubject($idSubject: Float!) {
    listUsersBySubject(idSubject: $idSubject) {
      user {
        id
        firstName
        lastName
        rut
        email
        role
      }
      totalAsist
      totalAbsences
    }
  }
`;

export const GET_ALL_STUDENTS = gql`
  query GetAllStudents {
    getAllStudents {
      id
      firstName
      lastName
      rut
      email
      role
    }
  }
`;
