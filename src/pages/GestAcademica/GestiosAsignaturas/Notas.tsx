import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GRADES_BY_SUBJECT_ID, LIST_USERS_BY_SUBJECT } from "../../../graphql/queries/user";
import { CREATE_GRADE, UPDATE_GRADE, DELETE_GRADE } from "../../../graphql/mutations/user";
import NavBar from "../../../components/NavBar";
import Swal from "sweetalert2";

const Notas: React.FC = () => {
  const { idSubject } = useParams<{ idSubject: string }>();
  const subjectId = idSubject ? Number(idSubject) : 0;

  const { data: studentsData } = useQuery(LIST_USERS_BY_SUBJECT, {
    variables: { idSubject: subjectId },
  });

  const { data: gradesData, refetch: refetchGrades } = useQuery(GRADES_BY_SUBJECT_ID, {
    variables: { subjectId },
  });

  const [createGrade] = useMutation(CREATE_GRADE);
  const [updateGrade] = useMutation(UPDATE_GRADE);
  const [deleteGrade] = useMutation(DELETE_GRADE);

  const [grades, setGrades] = useState<{ [studentId: string]: { id: string; grade: number }[] }>({});
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

  useEffect(() => {
    if (gradesData) {
      const groupedGrades: { [studentId: string]: { id: string; grade: number }[] } = {};
      gradesData.gradesBySubjectId.forEach((grade: any) => {
        if (!groupedGrades[grade.studentId]) {
          groupedGrades[grade.studentId] = [];
        }
        groupedGrades[grade.studentId].push({ id: grade.id, grade: grade.grade });
      });
      setGrades(groupedGrades);
    }
  }, [gradesData]);

  const handleGradeChange = (studentId: string, gradeIndex: number, newGrade: number) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: prev[studentId].map((grade, index) =>
        index === gradeIndex ? { ...grade, grade: newGrade } : grade
      ),
    }));
  };

  const handleAddGrade = (studentId: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), { id: "", grade: 0 }],
    }));
  };

  const handleDeleteGrade = async () => {
    if (!selectedGradeId) {
      Swal.fire("Atención", "Por favor, selecciona una nota para eliminar.", "warning");
      return;
    }
  
    try {
      // Convertir el ID seleccionado a número
      const gradeId = parseFloat(selectedGradeId);
  
      // Validar que el ID es un número válido
      if (isNaN(gradeId)) {
        Swal.fire("Error", "El ID de la nota seleccionada no es válido.", "error");
        return;
      }
  
      await deleteGrade({ variables: { id: gradeId } });
  
      const updatedGrades = { ...grades };
  
      // Encuentra y elimina la nota seleccionada
      for (const studentId in updatedGrades) {
        updatedGrades[studentId] = updatedGrades[studentId].filter(
          (grade) => grade.id !== selectedGradeId
        );
      }
  
      setGrades(updatedGrades);
      setSelectedGradeId(null);
      Swal.fire("Éxito", "Nota eliminada correctamente.", "success");
      refetchGrades();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar la nota.", "error");
    }
  };
  

  const handleSelectGrade = (gradeId: string) => {
    setSelectedGradeId(gradeId);
  };

  const handleSaveGrades = async () => {
    const gradePromises: Promise<any>[] = [];
  
    Object.entries(grades).forEach(([studentId, studentGrades]) => {
      studentGrades.forEach((grade) => {
        if (grade.id) {
          // Si ya existe la nota, actualizar
          gradePromises.push(
            updateGrade({
              variables: {
                id: parseFloat(grade.id), // Convertir el ID a número flotante
                updateGradeDto: {
                  grade: grade.grade,
                  studentId: Number(studentId),
                  subjectId,
                },
              },
            })
          );
        } else {
          // Si no existe la nota, crear una nueva
          gradePromises.push(
            createGrade({
              variables: {
                createGradeDto: {
                  grade: grade.grade,
                  studentId: Number(studentId),
                  subjectId,
                },
              },
            })
          );
        }
      });
    });
  
    try {
      await Promise.all(gradePromises);
      Swal.fire("Éxito", "Notas guardadas correctamente.", "success");
  
      // Recargar la lista de notas después de guardar
      await refetchGrades();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron guardar las notas.", "error");
    }
  };
  

  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Notas de la Asignatura</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Lista de Estudiantes y Notas</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b px-4 py-2">Estudiante</th>
                <th className="border-b px-4 py-2">Notas</th>
                <th className="border-b px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {studentsData && studentsData.listUsersBySubject.length > 0 ? (
                studentsData.listUsersBySubject.map((student: any) => (
                  <tr key={student.user.id}>
                    <td className="border-b px-4 py-2">
                      {student.user.firstName} {student.user.lastName}
                    </td>
                    <td className="border-b px-4 py-2">
                        <div className="flex space-x-2">
                            {grades[student.user.id]?.map((grade, index) => (
                            <input
                                key={index}
                                type="number" // Permite introducir números
                                step="0.1" // Habilita decimales con dos posiciones
                                value={grade.grade}
                                onClick={() => handleSelectGrade(grade.id)}
                                onChange={(e) =>
                                handleGradeChange(student.user.id, index, parseFloat(e.target.value) || 0)
                                }
                                className={`border rounded-lg px-2 py-1 w-20 ${
                                selectedGradeId === grade.id ? "border-blue-500" : "border-gray-300"
                                }`}
                            />
                            ))}
                        </div>
                    </td>
                    <td className="border-b px-4 py-2">
                      <button
                        onClick={() => handleAddGrade(student.user.id)}
                        className="bg-[#ADC178] text-white py-1 px-4 rounded-lg hover:bg-[#DDE5B6]"
                      >
                        Añadir Nota
                      </button>
                      <button
                        onClick={handleDeleteGrade}
                        className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-700 mt-2"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4">
                    No hay estudiantes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            onClick={handleSaveGrades}
            className="bg-[#ADC178] text-white py-2 px-6 rounded-lg hover:bg-[#DDE5B6] mt-6"
          >
            Guardar Notas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notas;
