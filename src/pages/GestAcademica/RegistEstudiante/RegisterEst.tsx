import React, { useState } from "react";
import { gql, useMutation, useQuery, Reference } from "@apollo/client";

import { CREATE_USER, UPDATE_USER, DELETE_USER } from "../../../graphql/mutations/user";
import { GET_ALL_STUDENTS } from "../../../graphql/queries/user";
import NavBar from "../../../components/NavBar";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rut: string;
  email: string;
  role: string;
}

const RegisterEst: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");
  const [editStudentRut, setEditStudentRut] = useState<string | null>(null);

  // Consulta para obtener todos los estudiantes
  const { loading, error, data } = useQuery(GET_ALL_STUDENTS);

  // Mutaciones
  const [createUser] = useMutation(CREATE_USER, {
    update(cache, { data: { createUser } }) {
      cache.modify({
        fields: {
          getAllStudents(existingStudents = []) {
            const newUserRef = cache.writeFragment({
              data: createUser,
              fragment: gql`
                fragment NewStudent on UserEntity {
                  id
                  firstName
                  lastName
                  rut
                  email
                  role
                }
              `
            });
            return [...existingStudents, newUserRef];
          }
        }
      });
    }
  });
  

  const [updateUser] = useMutation(UPDATE_USER, {
    update(cache, { data: { updateUser } }) {
      cache.modify({
        fields: {
          getAllStudents(existingStudents = []) {
            const updatedUserRef = cache.identify(updateUser);
  
            return existingStudents.map((studentRef: Reference) =>
              studentRef.__ref === updatedUserRef
                ? { ...studentRef, ...updateUser }
                : studentRef
            );
          }
        }
      });
    }
  });
  
  const [deleteUser] = useMutation(DELETE_USER, {
    update(cache, { data: { removeUser } }) {
      if (removeUser) {
        cache.modify({
          fields: {
            getAllStudents(existingStudents = []) {
              const userRefToRemove = `UserEntity:${rut}`;
              return existingStudents.filter(
                (studentRef: Reference) => studentRef.__ref !== userRefToRemove
              );
            }
          }
        });
      }
    }
  });
  


  const handleAddOrUpdateStudent = async () => {
    if (!firstName || !lastName || !rut || !email) {
      alert("Por favor, complete todos los campos.");
      return;
    }
  
    try {
      if (editStudentRut) {
        await updateUser({
          variables: {
            rut: editStudentRut,
            updateUserDto: {
              firstName,
              lastName,
              email,
            },
          },
        });
        setEditStudentRut(null);
      } else {
        await createUser({
          variables: {
            createUserDto: {
              firstName,
              lastName,
              rut,
              email,
              role,
              password: "defaultPassword",
            },
          },
        });
      }
  
      setFirstName("");
      setLastName("");
      setRut("");
      setEmail("");
    } catch (error) {
      console.error("Error al agregar/actualizar usuario:", error);
      alert("Ocurrió un error al procesar la solicitud.");
    }
  };
  
  

const handleDeleteStudent = async (rut: string) => {
  const confirmDelete = window.confirm("¿Está seguro de que desea eliminar este estudiante?");
  if (confirmDelete) {
    try {
      await deleteUser({
        variables: { rut },
        update(cache) {
          const userRefToRemove = `UserEntity:${rut}`; // Crea la referencia de usuario a eliminar
          
          cache.modify({
            fields: {
              getAllStudents(existingStudents = []) {
                return existingStudents.filter(
                  (studentRef: Reference) => studentRef.__ref !== userRefToRemove
                );
              }
            }
          });
        }
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Ocurrió un error al eliminar el usuario.");
    }
  }
};

  
  

  const handleEditStudent = (student: Student) => {
    setFirstName(student.firstName);
    setLastName(student.lastName);
    setRut(student.rut);
    setEmail(student.email);
    setRole(student.role);
    setEditStudentRut(student.rut);
  };
  

  if (loading) return <p>Cargando lista de estudiantes...</p>;
  if (error) return <p>Error al cargar estudiantes: {error.message}</p>;

  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Registro de Estudiantes</h1>
        <div className="text-left px-4 text-[#1B4332]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg h-[450px]"> 
              <h3 className="text-xl font-bold">{editStudentRut ? "Editar Estudiante" : "Agregar Estudiante"}</h3>
              <div className="mt-4">
                <label className="block text-sm font-semibold">Nombre</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  placeholder="Nombre del estudiante"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold">Apellido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  placeholder="Apellido del estudiante"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold">RUT</label>
                <input
                  type="text"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  placeholder="RUT del estudiante"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg"
                  placeholder="Email del estudiante"
                />
              </div>
              <button
                onClick={handleAddOrUpdateStudent}
                className="bg-[#ADC178] text-white py-2 px-4 rounded-lg hover:bg-[#DDE5B6] mt-4"
              >
                {editStudentRut ? "Actualizar Estudiante" : "Registrar"}
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg max-h-[600px] overflow-y-auto">
              <h3 className="text-xl font-bold">Lista de Estudiantes</h3>
              <div className="mt-4 space-y-4">
                {data.getAllStudents.length > 0 ? (
                  data.getAllStudents.map((student: Student) => (
                    <div key={student.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                      <p><strong>Nombre:</strong> {student.firstName} {student.lastName}</p>
                      <p><strong>RUT:</strong> {student.rut}</p>
                      <p><strong>Email:</strong> {student.email}</p>
                      <p><strong>Rol:</strong> {student.role}</p>
                      <div className="flex mt-2 space-x-2">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="bg-blue-500 text-white py-1 px-2 rounded-lg hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.rut)}
                          className="bg-red-500 text-white py-1 px-2 rounded-lg hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No hay estudiantes registrados.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterEst;
