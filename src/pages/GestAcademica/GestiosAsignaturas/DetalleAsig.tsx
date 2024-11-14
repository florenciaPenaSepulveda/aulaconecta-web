import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { LIST_USERS_BY_SUBJECT, LISTAR_CURSOS } from "../../../graphql/queries/user";
import { CREAR_ASIGNATURA, TAKE_ASIT } from "../../../graphql/mutations/user";
import NavBar from "../../../components/NavBar";
import Swal from "sweetalert2";

export interface Subject {
  id: string;
  name: string;
  numberOfClasses: number;
}

interface Student {
  id: string;
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Student" | "Teacher" | "Admin" | "Parents";
  isPresent: boolean;
}

interface ListUsersBySubjectData {
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

interface ListUsersBySubjectVars {
  idSubject: number;
}

const DetalleAsig: React.FC = () => {
  const navigate = useNavigate();
  const subjectId = 5; 

  const { loading, error, data } = useQuery<ListUsersBySubjectData, ListUsersBySubjectVars>(
    LIST_USERS_BY_SUBJECT,
    {
      variables: { idSubject: subjectId },
    }
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [createSubject] = useMutation(CREAR_ASIGNATURA);
  const [takeAsit] = useMutation(TAKE_ASIT);

  useEffect(() => {
    if (data && data.listUsersBySubject.length > 0) {
      setStudents(
        data.listUsersBySubject.map((userData) => ({
          id: userData.user.id,
          rut: userData.user.rut,
          firstName: userData.user.firstName,
          lastName: userData.user.lastName,
          email: userData.user.email,
          role: userData.user.role,
          isPresent: false,
        }))
      );
    } else if (data && data.listUsersBySubject.length === 0) {
      handleCreateSubject(); 
    }
  }, [data]);

  const handleCreateSubject = async () => {
    try {
      await createSubject({
        variables: {
          createSubjectInput: {
            name: "Nueva Asignatura",
            numberOfClasses: 20,     
          },
        },
        refetchQueries: [{ query: LISTAR_CURSOS }],
      });
      Swal.fire("Asignatura creada", "Se ha creado una nueva asignatura", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo crear la asignatura", "error");
    }
  };

  const handleAttendanceChange = (rut: string) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.rut === rut ? { ...student, isPresent: !student.isPresent } : student
      )
    );
  };

  const handleConfirmAttendance = async () => {
    const attendanceSummary = students.map((student) => ({
      idUser: Number(student.id),         // Convertir idUser a número
      idSubject: subjectId,               // Mantener el idSubject
      asist: student.isPresent ? 1 : 0,   // 1 si está presente, 0 si está ausente
    }));
  
    console.log("Resumen de Asistencia a Enviar:", { asistencias: attendanceSummary });
  
    try {
      await takeAsit({
        variables: {
          createAsistInput: {
            asistencias: attendanceSummary,
          },
        },
      });
  
      Swal.fire("Asistencia confirmada", "Resumen de asistencia registrado", "success");
      navigate("/CreateAsig");
    } catch (error) {
      console.error("Error al enviar la asistencia:", error);
      Swal.fire("Error", "No se pudo registrar la asistencia. Revisa la consola para más detalles.", "error");
    }
  };
  
  

  if (loading) return <p>Cargando lista de estudiantes...</p>;
  if (error) return <p>Error al cargar estudiantes: {error.message}</p>;

  if (students.length === 0) {
    return <p>No hay estudiantes registrados en esta asignatura.</p>;
  }

  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Detalle de la Asignatura</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-bold">Asignatura</h3>
          <p className="text-gray-500">Cantidad de clases: 20</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Lista de Asistencia</h3>
          <p className="text-gray-500 mb-6">Marque los estudiantes presentes</p>

          <div className="grid gap-4">
            {students.map((student) => (
              <div key={student.rut} className="flex items-center justify-between border-b pb-2">
                <p className="text-lg">
                  {student.firstName} {student.lastName}
                </p>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={student.isPresent}
                    onChange={() => handleAttendanceChange(student.rut)}
                    className="form-checkbox h-5 w-5 text-green-600"
                  />
                  <span className="text-gray-700">{student.isPresent ? "1" : "0"}</span>
                </label>
              </div>
            ))}
          </div>

          <button
            onClick={handleConfirmAttendance}
            className="bg-[#ADC178] text-white py-2 px-6 rounded-lg hover:bg-[#DDE5B6] mt-6"
          >
            Confirmar Asistencia
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleAsig;
