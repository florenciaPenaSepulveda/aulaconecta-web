import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import { LIST_USERS_BY_SUBJECT, FIND_BY_RUT } from "../../../graphql/queries/user";
import { TAKE_ASIT } from "../../../graphql/mutations/user";
import NavBar from "../../../components/NavBar";
import Swal from "sweetalert2";

interface Student {
  id: string;
  rut: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Student" | "Teacher" | "Admin" | "Parents";
  isPresent: boolean;
}

const DetalleAsig: React.FC = () => {
  const { idSubject } = useParams<{ idSubject: string }>();
  const subjectId = idSubject ? Number(idSubject) : 0;

  const navigate = useNavigate();

  const { data } = useQuery(LIST_USERS_BY_SUBJECT, {
    variables: { idSubject: subjectId },
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [searchRut, setSearchRut] = useState<string>(""); // El RUT que el usuario escribe
  const [suggestions, setSuggestions] = useState<Student[]>([]); // Lista de sugerencias

  const [findByRut, { data: findByRutData, loading: loadingFind }] = useLazyQuery(FIND_BY_RUT);

  const [takeAsit] = useMutation(TAKE_ASIT);

  useEffect(() => {
    if (data && data.listUsersBySubject.length > 0) {
      setStudents(
        data.listUsersBySubject
          .filter((userData: any) => userData.user.role === "Student") // Solo "Student"
          .map((userData: any) => ({
            id: userData.user.id,
            rut: userData.user.rut,
            firstName: userData.user.firstName,
            lastName: userData.user.lastName,
            email: userData.user.email,
            role: userData.user.role,
            isPresent: false,
          }))
      );
    }
  }, [data]);

  const formatRut = (rut: string) => {
    // Remover caracteres no válidos
    rut = rut.replace(/[^\dkK]/g, "");

    // Formatear el RUT si tiene una longitud válida
    if (rut.length > 1) {
      rut = rut
        .slice(0, -1)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + rut.slice(-1);
    }
    return rut;
  };

  const handleSearchRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedRut = formatRut(e.target.value); // Formatear el RUT correctamente
    setSearchRut(formattedRut);

    // Realiza la búsqueda solo si el RUT tiene suficiente longitud
    if (formattedRut.length >= 11) { // 11 incluye formato "XX.XXX.XXX-X"
        findByRut({ variables: { rut: formattedRut } });
    } else {
        setSuggestions([]);
    }
  };

  

  useEffect(() => {
    console.log("Datos retornados por findByRutData:", findByRutData);
    if (findByRutData?.findByRut) {
        const foundStudent = findByRutData.findByRut;

        // Solo muestra usuarios con rol "Student"
        if (foundStudent.role === "Student") {
            setSuggestions([foundStudent]);
        } else {
            setSuggestions([]);
        }
    } else {
        setSuggestions([]);
    }
  }, [findByRutData]);


  const handleAddStudent = (student: Student) => {
    const isAlreadyInList = students.some((s) => s.id === student.id);
    if (!isAlreadyInList) {
      setStudents((prev) => [...prev, { ...student, isPresent: false }]);
    }
    setSearchRut("");
    setSuggestions([]);
    Swal.fire("Éxito", "Estudiante agregado correctamente.", "success");
  };

  const handleConfirmAttendance = async () => {
    const attendanceSummary = students.map((student) => ({
      idUser: Number(student.id),
      idSubject: Number(subjectId),
      asist: student.isPresent ? 1 : 0,
      absences: student.isPresent ? 0 : 1,
    }));

    try {
      await takeAsit({
        variables: {
          createAsistInput: {
            asistencias: attendanceSummary,
          },
        },
      });

      Swal.fire("Éxito", "Asistencia confirmada.", "success");
      navigate("/CreateAsig");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo registrar la asistencia.", "error");
    }
  };

  const handleGoToNotes = () => {
    navigate(`/Notas/${subjectId}`);
  };

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
          <div className="flex flex-col mb-6">
            <input
              type="text"
              placeholder="Buscar por RUT"
              value={searchRut}
              onChange={handleSearchRutChange}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
            {loadingFind ? (
              <p className="text-gray-500 mt-2">Buscando...</p>
            ) : (
              suggestions.length > 0 ? (
                <ul className="border border-gray-300 rounded-lg mt-2 bg-white shadow-lg">
                  {suggestions.map((student) => (
                    <li
                      key={student.id}
                      onClick={() => handleAddStudent(student)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      {student.firstName} {student.lastName} - {student.rut}
                    </li>
                  ))}
                </ul>
              ) : (
                searchRut.length > 7 && <p className="text-gray-500 mt-2">No se encontró el estudiante.</p>
              )
            )}

          </div>
          <div className="grid gap-4">
            {students.length > 0 ? (
              students.map((student) => (
                <div key={student.rut} className="flex items-center justify-between border-b pb-2">
                  <p className="text-lg">
                    {student.firstName} {student.lastName}
                  </p>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={student.isPresent}
                      onChange={() =>
                        setStudents((prev) =>
                          prev.map((s) =>
                            s.rut === student.rut ? { ...s, isPresent: !s.isPresent } : s
                          )
                        )
                      }
                      className="form-checkbox h-5 w-5 text-green-600"
                    />
                  </label>
                </div>
              ))
            ) : (
              <p>No hay estudiantes registrados.</p>
            )}
          </div>
          <button
            onClick={handleConfirmAttendance}
            className="bg-[#ADC178] text-white py-2 px-6 rounded-lg hover:bg-[#DDE5B6] mt-6"
          >
            Confirmar Asistencia
          </button>
          <button
            onClick={handleGoToNotes}
            className="bg-[#6C757D] text-white py-2 px-6 rounded-lg hover:bg-[#5A6268] mt-6 ml-4"
          >
            Ir a Notas
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleAsig;
