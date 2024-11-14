import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client"; // Importa el hook de Apollo
import { LISTAR_CURSOS } from "../../../graphql/queries/user";
import NavBar from "../../../components/NavBar";
import Swal from "sweetalert2";

interface Subject {
  id: string;
  name: string;
  numberOfClasses: number;
}

const CreateAsig: React.FC = () => {
  const [subjectName, setSubjectName] = useState("");
  const [numberOfClasses, setNumberOfClasses] = useState<number | "">("");
  const navigate = useNavigate();

  // Ejecuta la query para obtener la lista de cursos
  const { loading, error, data } = useQuery(LISTAR_CURSOS);

  const handleCreateSubject = () => {
    if (!subjectName.trim()) {
      Swal.fire("Error", "El nombre de la asignatura no puede estar vacío", "warning");
      return;
    }
    if (!numberOfClasses || numberOfClasses <= 0) {
      Swal.fire("Error", "La cantidad de clases debe ser un número mayor a 0", "warning");
      return;
    }

    // Aquí podrías añadir el código para crear la asignatura en el backend.
    Swal.fire("Asignatura creada", `Asignatura "${subjectName}" creada exitosamente`, "success");
    setSubjectName("");
    setNumberOfClasses("");
  };

  const handleViewSubject = (id: string) => {
    navigate(`/DetalleAsig/${id}`);
  };

  if (loading) return <p>Cargando cursos...</p>;
  if (error) return <p>Error al cargar cursos: {error.message}</p>;

  return (
    <div className="bg-[#DDE5B6] min-h-screen">
      <NavBar />
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-5xl font-bold text-[#1B4332] mb-8">Gestión de Asignaturas</h1>

        <div className="text-left px-4 text-[#1B4332] flex flex-col items-center">
          <div className="mb-8 w-full max-w-md">
            <input
              type="text"
              placeholder="Nombre de la asignatura"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="rounded-xl border w-full text-base px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-600 mb-4"
            />
            <input
              type="number"
              placeholder="Cantidad de clases"
              value={numberOfClasses}
              onChange={(e) => setNumberOfClasses(Number(e.target.value) || "")}
              className="rounded-xl border w-full text-base px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-600 mb-4"
            />
            <button
              onClick={handleCreateSubject}
              className="bg-[#ADC178] text-black py-2 px-4 rounded-lg hover:bg-[#DDE5B6] hover:border-2 hover:border-[#ADC178] w-full"
            >
              Crear Asignatura
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            {data.listSubject.map((subject: Subject) => (
              <div key={subject.id} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">{subject.name}</h3>
                <p className="text-gray-500">Cantidad de clases: {subject.numberOfClasses}</p>
                <div className="mt-4 flex space-x-4">
                  <button
                    className="bg-[#ADC178] text-gray-700 py-2 px-4 rounded-lg hover:bg-[#DDE5B6] hover:border-[#ADC178] hover:border-2"
                    onClick={() => handleViewSubject(subject.id)}
                  >
                    Ver Asignatura
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAsig;
